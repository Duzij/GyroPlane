import * as THREE from "three";
import { ExtendedMesh } from "@enable3d/ammo-physics";

enum SensorMessageType {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  SENSOR = "sensor",
  SENSOR_ACCELEROMETER = "sensor_accelerometer",
}

export function handleConnection(
  roomId: string,
  scene2d: THREE.Scene,
  platform: ExtendedMesh,
) {
  const socket = new WebSocket(location.origin.replace(/^http/, "ws"));

  console.log(platform.hasBody);
  console.log(platform.body);

  socket.addEventListener("message", (message) => {
    const json = JSON.parse(message.data);
    platform.matrixAutoUpdate = false;
    switch (json.type) {
      case SensorMessageType.CONNECTED:
        socket.send(JSON.stringify({
          type: "platform_connected",
          platformId: json.id,
          userId: roomId,
        }));
        break;

      case SensorMessageType.DISCONNECTED:
        // Handle disconnected
        break;

      case SensorMessageType.SENSOR:
        const quaternion = new THREE.Quaternion(
          json.quaternion[0],
          json.quaternion[2],
          -json.quaternion[1],
          json.quaternion[3],
        );
        platform.quaternion.copy(quaternion);
        break;

      case SensorMessageType.SENSOR_ACCELEROMETER:
        const acceleration = new THREE.Vector3(
          json.acceleration.x,
          json.acceleration.y,
          json.acceleration.z,
        );
        
        // Apply a threshold to prevent drift from small movements
        const threshold = 0.1;
        if (Math.abs(acceleration.y) > threshold) {
          platform.position.setY(platform.position.y + acceleration.y * 0.1); // Scale factor to control movement sensitivity
        }
        
        // Update the matrix with both position and rotation
        platform.updateMatrix();
        break;

      default:
        break;
    }
  });
}
