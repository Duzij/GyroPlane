// three.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// physics
import { PhysicsLoader } from 'enable3d'
import { AmmoPhysics } from '@enable3d/ammo-physics'
import { handleConnection } from './connection'
import { showYouLoseText } from './gameEvents'
import { add2dLayer, addCamera, addLight, addPlatform, addRenderer, addSphere, addStatusText } from './assets'
// Flat

console.log('Three.js version r' + THREE.REVISION)

const MainScene = () => {
  // sizes
  const width = window.innerWidth
  const height = window.innerHeight

  // scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // camera
  const camera = addCamera(width, height)

  // 2d camera/2d scene
  const { scene2d, camera2d } = add2dLayer(width, height)

  // renderer
  const renderer = addRenderer()

  // orbit controls
  new OrbitControls(camera, renderer.domElement)

  // light
  addLight(scene);

  // physics
  const physics = new AmmoPhysics(scene as any)
  physics.debug?.enable()

  const { factory } = physics

  const youLostText = addStatusText(scene2d)
  const box = addPlatform(factory, physics)
  const sphere = addSphere(scene, physics)

  // clock
  const clock = new THREE.Clock()

  let params = (new URL(location.toString())).searchParams;
  let userId = params.get("userId");
  if (userId) {
    handleConnection(userId, scene2d, box)
  }

  // loop
  const animate = () => {
    box.body.needUpdate = true // this is how you update kinematic bodies
    physics.update(clock.getDelta() * 1000)
    physics.updateDebugger()

    // you have to clear and call render twice because there are 2 scenes
    // one 3d scene and one 2d scene
    renderer.clear()
    renderer.render(scene, camera)
    renderer.clearDepth()
    renderer.render(scene2d, camera2d)

    requestAnimationFrame(animate)

    if (sphere.position.y < -20) {
      showYouLoseText(scene2d)
    }

  }
  requestAnimationFrame(animate)

}

// '/ammo' is the folder where all ammo file are
PhysicsLoader('/ammo', () => MainScene())


