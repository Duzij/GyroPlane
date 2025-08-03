import express from 'express';
import { getAllActiveConnections } from './websockets.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();


app.set('view engine', 'ejs');
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));

app.get('/', async(req, res) => {
    var users = getAllActiveConnections();
    res.render('index', {
        title: 'Users',
        users,
    });
});

app.get('/connect', async(req, res) => {
    res.render('connect', {});
});

app.get('/platform', async(req, res) => {
    res.render('platform', {});
});

app.use((req, res) => {
    console.log('404', req.method, req.url);
});

const port = 5001;


const options = {
  key: fs.readFileSync(path.join(__dirname, 'localhost+2-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost+2.pem'))
};
export const server = https.createServer(options, app);

server.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`);
});

export default app;
