import * as THREE from "three";
import { TextSprite } from "@enable3d/three-graphics/jsm/flat";
import { textTexture } from "./textures";

enum SensorMessageType {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  SENSOR = "sensor",
  SET_DEFAULT_POSITION = "sensor_set_default_position",
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

  // Get the stored offset quaternion
  const offsetQuaternion = sensorQuaternionOffsets.get(connectionId);
  console.log(offsetQuaternion ? "Using offset quaternion:" : "No offset quaternion found.");
  if (offsetQuaternion) {
    // Create inverse of the offset quaternion
    const inverseOffset = offsetQuaternion.clone().invert();
    
    // First apply the inverse offset to "cancel out" the initial orientation
    // Then multiply by the new quaternion to get the relative rotation
    quaternion.premultiply(inverseOffset);
  }
  return quaternion;
};

export function handleConnection(roomId: string, scene2d: THREE.Scene, platform: THREE.Mesh) {
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

        const updatedQuaternion = handleSensorData(json.id, quaternion);
        platform.quaternion.copy(updatedQuaternion);
        platform.matrix.makeRotationFromQuaternion(updatedQuaternion);
        platform.matrixAutoUpdate = false;
        break;

      case SensorMessageType.SET_DEFAULT_POSITION:
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
