import express from 'express';
import { getAllActiveConnections} from './websockets.js';


export const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
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

app.use((req, res) => {
  console.log('404', req.method, req.url);

  res.render('404');
});

const port = 3000;

export const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});