import * as THREE from "three";
import { TextSprite } from "@enable3d/three-graphics/jsm/flat";
import { textTexture } from "./textures";

enum SensorMessageType {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  SENSOR = "sensor",
  SET_ORIENTATION = "set_orientation",
}

const sensorQuaternionOffsets = new Map<string, THREE.Quaternion>();

// In your handleConnection function or where you receive sensor data
const handleSensorData = (connectionId: string, data: THREE.Quaternion) => {
  // Create a Three.js quaternion from received data
  const quaternion = new THREE.Quaternion(
    data.x,
    data.y,
    data.z,
    data.w,
  );

  // Apply initial offset to handle default phone orientation
  const offsetQuaternion = new THREE.Quaternion();
  sensorQuaternionOffsets.set(connectionId, offsetQuaternion);
  offsetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);

  // Combine the offset with the sensor quaternion
  quaternion.multiply(offsetQuaternion);

  // Apply to platform
  return quaternion;
};

export function handleConnection(roomId: string, scene2d: THREE.Scene, box) {
  const debugTextSprite = new TextSprite(textTexture);
  const scale = 0.4;
  debugTextSprite.setScale(scale);
  const connectedUserText = "Room id " + roomId + " connected";
  debugTextSprite.setText(connectedUserText);
  debugTextSprite.setPosition(
    0 + (textTexture.width * scale) / 2 + 12,
    50 - (textTexture.height * scale) / 2 - 48,
  );
  scene2d.add(debugTextSprite);

  const socket = new WebSocket(location.origin.replace(/^http/, "ws"));

  socket.addEventListener("message", (message) => {
    const json = JSON.parse(message.data);
    console.log("Received message:", json);

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
          -json.quaternion[3],
          -json.quaternion[1],
          json.quaternion[2],
        );

        // const updatedQuaternion = handleSensorData(json.id, quaternion);
        box.quaternion.copy(quaternion);
        break;

      case SensorMessageType.SET_ORIENTATION:
        const connectionId = json.id;
        const orientation = new THREE.Quaternion(
          json.orientation[0],
          json.orientation[1],
          json.orientation[2],
          json.orientation[3],
        );
        sensorQuaternionOffsets.set(connectionId, orientation);
        break;

      default:
        break;
    }
  });
}
