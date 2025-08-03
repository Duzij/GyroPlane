import ejs from 'ejs'
import { WebSocketServer, WebSocket } from 'ws'
import { getUniqueID } from './utils.js';

/** @type {Set<WebSocket>} */
const connections = new Set()

const activeSessions = new Set();

export const createWebSocketServer = (server) => {

    const wss = new WebSocketServer({ server })

    wss.on('connection', function connection(ws, req) {
        ws.id = getUniqueID(Array.from(activeSessions).map(s => s.id));
        console.log('Opened connection: ', ws.id)
        connections.add(ws);

        sendConnectedId(ws);

        ws.on('close', () => {
            connections.delete(ws)
            console.log('Closed connection: ', ws.id)
        });

        ws.addEventListener('message', (message) => {
            const json = JSON.parse(message.data)


            if (json.type === "connected") {
                console.log('Received message: ', json)
                updateUserWithUsername(json, ws);
            }

            if (json.type === "platform_connected") {
                console.log('Received message: ', json)
                addToActiveSession(json.platformId, json.userId);
            }

            if (json.type === "sensor") {
                updateSpecificPlatformWithSensorData(json, ws);
            }
        })
    });

    function sendConnectedId(ws) {
        const message = {
            type: 'connected',
            id: ws.id,
        };
        const json = JSON.stringify(message);
        ws.send(json);
    }
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

const addToActiveSession = (platformId, userId) => {
    activeSessions.add({ platformId, userId });
    console.log(`Added to active session: platformId:${platformId}, userId:${userId}`);
}

const updateSpecificPlatformWithSensorData = (message, ws) => {

    for (let activeSession of activeSessions) {
        if (activeSession.userId === message.id) {
            const platformConnection = getConnectionByConnectionId(activeSession.platformId);
            if (platformConnection) {
                const sentMessage = {
                    type: 'sensor',
                    quaternion: message.quaternion,
                };
                platformConnection.send(JSON.stringify(sentMessage));
                break;
            } else {
                activeSessions.delete(activeSession);
                ws.send(JSON.stringify({
                    type: 'platform_disconnected'
                }));
                break;
            }
        }
    }
}


export const getAllActiveConnections = () => {
    return Array.from(connections).map(({ id, name }) => ({ id: id, name }));
}

export const getConnectionByConnectionId = (id) => {
    for (let item of connections) {
        if (item.id === id) {
            return item;
        }
    }
}

export const sendUsersToAllConnections = async() => {
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