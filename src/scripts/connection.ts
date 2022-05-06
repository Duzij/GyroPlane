import * as THREE from 'three'
import { TextSprite } from '@enable3d/three-graphics/jsm/flat'
import { textTexture } from './textures'

export function handleConnection(userId: string, scene2d: THREE.Scene, box) {
    const debugTextSprite = new TextSprite(textTexture)
    const scale = 0.4
    debugTextSprite.setScale(scale)
    const connectedUserText = 'User ' + userId + ' connected'
    debugTextSprite.setText(connectedUserText);
    debugTextSprite.setPosition(0 + (textTexture.width * scale) / 2 + 12, 50 - (textTexture.height * scale) / 2 - 48)
    scene2d.add(debugTextSprite);

    const youLoseSprite = new TextSprite(textTexture);
    youLoseSprite.setScale(scale)
    youLoseSprite.setText("You lost!");
    youLoseSprite.setPosition(window.innerWidth / 2 - textTexture.width/2, 50 - (textTexture.height * scale) / 2 - 48)
    scene2d.add(youLoseSprite);

    const socket = new WebSocket(location.origin.replace(/^http/, 'ws'))
  
    socket.addEventListener('message', (message) => {
      const json = JSON.parse(message.data)
  
      if (json.type === "connected") {
        socket.send(JSON.stringify({
          type: "platform_connected",
          platformId: json.id,
          userId: userId
        }))
  
      }
  
      if (json.type === "sensor") {
  
        const quaternion = new THREE.Quaternion(
          json.quaternion[0],
          -json.quaternion[3],
          -json.quaternion[1],
          json.quaternion[2])
  
        box.quaternion.copy(quaternion)
  
        debugTextSprite.setText(
          `quaternion.x:${box.quaternion.x}\n` +
          `quaternion.y:${box.quaternion.y}\n` +
          `quaternion.z:${box.quaternion.z}\n` +
          `quaternion.w:${box.quaternion.w}\n` +
  
          `rotation.x:${box.rotation.x}\n` +
          `rotation.y:${box.rotation.y}\n` +
          `rotation.z:${box.rotation.z}\n`
        );


      }
    })
  
  
  }