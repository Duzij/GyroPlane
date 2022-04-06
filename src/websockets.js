import ejs from 'ejs'
import { WebSocketServer, WebSocket } from 'ws'

/** @type {Set<WebSocket>} */
const connections = new Set()

export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on('connection', function connection(ws, req) {
    ws.id = wss.getUniqueID();
    console.log('Opened connection: ', ws.id)
    connections.add(ws);

    const message = {
      type: 'connected',
      id: ws.id,
    }
    const json = JSON.stringify(message)
    ws.send(json)

    ws.on('close', () => {
      connections.delete(ws)
      console.log('Closed connection: ', ws.id)
    });

    ws.addEventListener('message', (message) => {
      const json = JSON.parse(message.data)
      if (json.type === "connected") {
        updateUserWithUsername(json, ws);
      }
    })
  });

  wss.getUniqueID = function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
  };
}

const updateUserWithUsername = (message, ws) => {

  for (let item of connections) {
    if (item === ws) {
      item.id = message.id;
      item.name = message.name;
      sendUsersToAllConnections();
      break;
    }
  }

}

export const getAllActiveConnections = () => {
  return  Array.from(connections).map(({ id, name}) => ({ id: id, name }));
}

export const sendUsersToAllConnections = async () => {
  const users = getAllActiveConnections();

  const html = await ejs.renderFile('views/_users.ejs', {
    users,
  });

  for (const connection of connections) {
    const message = {
      type: 'users',
      html,
    }

    const json = JSON.stringify(message)

    connection.send(json)
  }
}
