import * as THREE from 'three'

import { TextSprite } from "@enable3d/three-graphics/jsm/flat"
import { textTexture as purpleTextTexture } from "./textures"
import { ExtendedMesh } from '@enable3d/ammo-physics/dist/physics';

const width = window.innerWidth;
const height = window.innerHeight;

export function addStatusText(scene2d: THREE.Scene) {
  const youLostSprite = new TextSprite(purpleTextTexture)
  const connectedUserText = 'You lost!'
  youLostSprite.name = 'youLostSprite'
  youLostSprite.visible = false
  youLostSprite.setText(connectedUserText)
  //render on top of everything
  youLostSprite.setPosition(width / 2, height - (purpleTextTexture.height) / 2 - 48)
  scene2d.add(youLostSprite)
  return youLostSprite;
}



export function add2dLayer(width: number, height: number) {
  const scene2d = new THREE.Scene()
  const camera2d = new THREE.OrthographicCamera(0, width, height, 0, 1, 10000)
  camera2d.position.setZ(100)
  return { scene2d, camera2d }
}

export function addCamera(width: number, height: number) {
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.2, 100)
  camera.position.set(10, 6, -25)
  camera.lookAt(0, 0, 0)
  return camera
}

export function addRenderer() {
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  renderer.autoClear = false
  document.body.appendChild(renderer.domElement)

  // dpr
  const DPR = window.devicePixelRatio
  renderer.setPixelRatio(Math.min(2, DPR))
  return renderer
}

export function addLight(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1))
  scene.add(new THREE.AmbientLight(0x666666))
  const light = new THREE.DirectionalLight(0xdfebff, 1)
  light.position.set(50, 200, 100)
  light.position.multiplyScalar(1.3)
}

export function addPlatform(factory: any, physics: any) {
  const box = factory.add.box({ x: 0, y: 0, z: 0, width: 20, height: 1, depth: 20 }, { lambert: { color: 'red', transparent: true, opacity: 0.5 } })
  physics.add.existing(box, { mass: 0, collisionFlags: 2 })
  return box
}

export function addSphere(scene: THREE.Scene, physics: any) {
  const material = new THREE.MeshLambertMaterial({ color: 0xffff00 })
  const sphere = new ExtendedMesh(new THREE.SphereBufferGeometry(1), material)
  scene.add(sphere)
  sphere.position.set(0, 8, 0)
  physics.add.existing(sphere as any)
  return sphere
}