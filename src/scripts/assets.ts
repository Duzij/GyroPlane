import * as THREE from "three";

import { TextSprite } from "@enable3d/three-graphics/jsm/flat";
import { textTexture as purpleTextTexture } from "./textures";
import { ExtendedMesh } from "@enable3d/ammo-physics/dist/physics";

const width = window.innerWidth;
const height = window.innerHeight;

export function addStatusText(scene2d: THREE.Scene) {
  const youLostSprite = new TextSprite(purpleTextTexture);
  const connectedUserText = "You lost!";
  youLostSprite.name = "statusText";
  youLostSprite.visible = false;
  youLostSprite.setText(connectedUserText);
  //render on top of everything
  youLostSprite.setPosition(
    width / 2,
    height - (purpleTextTexture.height) / 2 - 48,
  );
  scene2d.add(youLostSprite);
  return youLostSprite;
}

export function addRoomCube(scene: THREE.Scene) {
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0xdddddd,
    side: THREE.DoubleSide,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -3;
  scene.add(ground);
}

export function add2dLayer(width: number, height: number) {
  const scene2d = new THREE.Scene();
  const camera2d = new THREE.OrthographicCamera(0, width, height, 0, 1, 10000);
  camera2d.position.setZ(100);
  return { scene2d, camera2d };
}

export function addCamera(width: number, height: number) {
  const camera = new THREE.PerspectiveCamera(50, width / height);
  camera.position.set(0, 1, 5);
  camera.lookAt(0, 0, 0);
  return camera;
}

export function addAxisHelper(scene: THREE.Scene) {
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}

export function addRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.autoClear = false;
  document.body.appendChild(renderer.domElement);

  // dpr
  const DPR = window.devicePixelRatio;
  renderer.setPixelRatio(Math.min(2, DPR));
  return renderer;
}

export function addLight(scene: THREE.Scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 10, 5);
  scene.add(dirLight);
}

export function addPlatform(factory: any, physics: any): ExtendedMesh {
  const box = factory.add.box({
    x: 0,
    y: 0,
    z: 0,
    width: 2.5,
    height: 0.1,
    depth: 5,
  }, { lambert: { color: "red", transparent: true, opacity: 0.5 } });
  physics.add.existing(box, { mass: 0, collisionFlags: 2 });
  return box;
}

export function addSphere(scene: THREE.Scene, physics: any) {
  const material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
  const sphere = new ExtendedMesh(
    new THREE.SphereBufferGeometry(0.1),
    material,
  );
  sphere.name = "sphere";
  scene.add(sphere);
  sphere.position.set(0, 1, 0);
  physics.add.existing(sphere as any);
  return sphere;
}
