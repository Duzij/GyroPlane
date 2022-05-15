import * as THREE from 'three'
import { TextSprite } from '@enable3d/three-graphics/jsm/flat'
import { textTexture } from './textures'

export function handleConnection(roomId: string, scene2d: THREE.Scene, box) {
  const debugTextSprite = new TextSprite(textTexture)
  const scale = 0.4
  debugTextSprite.setScale(scale)
  const connectedUserText = 'Room id ' + roomId + ' connected'
  debugTextSprite.setText(connectedUserText);
  debugTextSprite.setPosition(0 + (textTexture.width * scale) / 2 + 12, 50 - (textTexture.height * scale) / 2 - 48)
  scene2d.add(debugTextSprite);

  const socket = new WebSocket(location.origin.replace(/^http/, 'ws'))

  socket.addEventListener('message', (message) => {
    const json = JSON.parse(message.data)

    if (json.type === "connected") {
      socket.send(JSON.stringify({
        type: "platform_connected",
        platformId: json.id,
        userId: roomId
      }))

    }

    if (json.type === "sensor") {

      const quaternion = new THREE.Quaternion(
        json.quaternion[0],
        -json.quaternion[3],
        -json.quaternion[1],
        json.quaternion[2])

      box.quaternion.copy(quaternion)

    }
  })


}