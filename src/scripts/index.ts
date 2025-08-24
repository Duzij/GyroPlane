import { PhysicsLoader } from "enable3d";
import { MainScene } from "./scene";

const canvas = document.getElementById("platform_canvas") as HTMLCanvasElement;
if (!canvas) {
    throw new Error("Canvas element not found");
}

PhysicsLoader("/ammo", () => MainScene(canvas));
