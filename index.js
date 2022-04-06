import {createWebSocketServer} from './src/websockets.js';
import {app, server} from './src/app.js';

createWebSocketServer(server);
