// three.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// physics
import { ExtendedMesh, PhysicsLoader } from 'enable3d'
import { AmmoPhysics } from '@enable3d/ammo-physics'
// Flat
import { TextTexture, TextSprite } from '@enable3d/three-graphics/jsm/flat'

console.log('Three.js version r' + THREE.REVISION)

const MainScene = () => {
  // sizes
  const width = window.innerWidth
  const height = window.innerHeight

  // scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // camera
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.2, 100)
  camera.position.set(10, 6, -25)
  camera.lookAt(0, 0, 0)

  // you can access Ammo directly if you want
  // new Ammo.btVector3(1, 2, 3).y()

  // 2d camera/2d scene
  const scene2d = new THREE.Scene()
  const camera2d = new THREE.OrthographicCamera(0, width, height, 0, 1, 10000)
  camera2d.position.setZ(100)

  // renderer
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  renderer.autoClear = false
  document.body.appendChild(renderer.domElement)

  // dpr
  const DPR = window.devicePixelRatio
  renderer.setPixelRatio(Math.min(2, DPR))

  // orbit controls
  new OrbitControls(camera, renderer.domElement)

  // light
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1))
  scene.add(new THREE.AmbientLight(0x666666))
  const light = new THREE.DirectionalLight(0xdfebff, 1)
  light.position.set(50, 200, 100)
  light.position.multiplyScalar(1.3)

  // physics
  const physics = new AmmoPhysics(scene as any)
  //physics.debug?.enable()
  physics.config..gravity.y = -15;

  const { factory } = physics

  const box = factory.add.box({ x: 0, y: 0, z: 0, width: 20, height: 1, depth: 20 }, { lambert: { color: 'red', transparent: true, opacity: 0.5 } })
  physics.add.existing(box, { mass: 0, collisionFlags: 2 })

  const material = new THREE.MeshLambertMaterial({ color: 0xffff00 })
  const sphere = new ExtendedMesh(new THREE.SphereBufferGeometry(1), material)
  scene.add(sphere)
  sphere.position.set(0, 8, 0)
  physics.add.existing(sphere as any)

  // clock
  const clock = new THREE.Clock()

  let params = (new URL(location.toString())).searchParams;
  let userId = params.get("userId");
  if (userId) {
    const connectedUserText = 'User ' + userId + ' connected';
    const text = new TextTexture(connectedUserText, { fontWeight: 'bold', fontSize: 35 });
    const sprite = new TextSprite(text);
    const scale = 0.5;
    sprite.setScale(scale);
    sprite.setPosition(0 + (text.width * scale) / 2 + 12, height - (text.height * scale) / 2 - 48);
    scene2d.add(sprite);

    const socket = new WebSocket(location.origin.replace(/^http/, 'ws'));

    socket.addEventListener('message', (message) => {
      const json = JSON.parse(message.data)

      if (json.type === "connected") {
        socket.send(JSON.stringify({
          type: "platform_connected",
          platformId: json.id,
          userId: userId
        }));

      }

      if (json.type === "sensor") {

        const quaternion = new THREE.Quaternion(
          json.quaternion[0],
          -json.quaternion[3],
          -json.quaternion[1],
          json.quaternion[2]);

        box.quaternion.copy(quaternion);

        sprite.setText(
          `quaternion.x:${box.quaternion.x}\n` +
          `quaternion.y:${box.quaternion.y}\n` +
          `quaternion.z:${box.quaternion.z}\n` +
          `quaternion.w:${box.quaternion.w}\n` +

          `rotation.x:${box.rotation.x}\n` +
          `rotation.y:${box.rotation.y}\n` +
          `rotation.z:${box.rotation.z}\n`
        ); // WRITE TEXT
      }
    });


  }




  // loop
  const animate = () => {

    box.body.needUpdate = true // this is how you update kinematic bodies

    console.log(camera.position);

    physics.update(clock.getDelta() * 1000)
    //physics.updateDebugger()

    // you have to clear and call render twice because there are 2 scenes
    // one 3d scene and one 2d scene
    renderer.clear()
    renderer.render(scene, camera)
    renderer.clearDepth()
    renderer.render(scene2d, camera2d)

    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

// '/ammo' is the folder where all ammo file are
PhysicsLoader('/ammo', () => MainScene())
