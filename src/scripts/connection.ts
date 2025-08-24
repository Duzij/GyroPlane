import * as THREE from "three";
import { TextSprite } from "@enable3d/three-graphics/jsm/flat";
import { textTexture } from "./textures";

enum SensorMessageType {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  SENSOR = "sensor",
  SET_DEFAULT_POSITION = "sensor_set_default_position",
}

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
        platform.matrix.makeRotationFromQuaternion(quaternion);
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
        break;

      default:
        break;
    }
  });
}
