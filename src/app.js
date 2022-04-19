import express from 'express';
import { getAllActiveConnections} from './websockets.js';
import path from 'path'
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  var users = getAllActiveConnections();
  res.render('index', {
    title: 'Users',
    users,
  });
});

app.get('/connect', async (req, res) => {
  res.render('connect', {
  });
});

app.get('/platform', async (req, res) => {
  res.render('platform', {
  });
});

app.use((req, res) => {
  console.log('404', req.method, req.url);
});

const port = 3000;

export const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});