// three.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// physics
import { AmmoPhysics, ExtendedMesh } from "@enable3d/ammo-physics";
import { handleConnection } from "./connection";
import { showYouLoseText } from "./gameEvents";
import {
  add2dLayer,
  addAxisHelper,
  addCamera,
  addLight,
  addPlatform,
  addRenderer,
  addRoomCube,
  addSphere,
  addStatusText,
} from "./assets";
import { resizeRendererToDisplaySize } from "./utils";
// Flat

console.log("Three.js version r" + THREE.REVISION);

export const MainScene = (canvas: HTMLCanvasElement) => {
  // sizes
  const width = window.innerWidth;
  const height = window.innerHeight;

  // scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // camera
  const camera = addCamera(width, height);

  // 2d camera/2d scene
  const { scene2d, camera2d } = add2dLayer(width, height);

  // renderer
  const renderer = addRenderer(canvas);

  // orbit controls
  new OrbitControls(camera, renderer.domElement);

  // light
  addLight(scene);

  // physics
  const physics = new AmmoPhysics(scene as any);
  physics.debug?.enable();

  const { factory } = physics;

  const youLostText = addStatusText(scene2d);
  const platform = addPlatform(factory, physics);
  const sphere = addSphere(scene, physics);
  const roomCube = addRoomCube(scene);
  // const arrowHelper = addAxisHelper(scene);

  // clock
  const clock = new THREE.Clock();

  let params = (new URL(location.toString())).searchParams;
  let roomId = params.get("roomId");
  if (roomId) {
    handleConnection(roomId, scene2d, platform);
  }

  document.getElementById("restart")?.addEventListener("click", () => {
    const sphere = scene.getObjectByName("sphere") as ExtendedMesh;
    if (sphere) {
      physics.destroy(sphere);
      scene.remove(sphere);
      addSphere(scene, physics);
    }
  });

  const animate = () => {
    platform.body.needUpdate = true; // this is how you update kinematic bodies
    const timeInMillisecondsSinceLastFrame = clock.getDelta() * 1000;
    physics.update(timeInMillisecondsSinceLastFrame);
    physics.updateDebugger();

    // you have to clear and call render twice because there are 2 scenes
    // one 3d scene and one 2d scene
    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(scene2d, camera2d);

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    requestAnimationFrame(animate);
    // updatePlatformData(platform.quaternion);

    if (sphere.position.y < -20) {
      showYouLoseText(scene2d);
    }
  };
  requestAnimationFrame(animate);
};
