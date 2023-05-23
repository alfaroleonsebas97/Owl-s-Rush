import express from 'express'; // Framework para servidores de Node.js
import * as eta from 'eta'; // Plantillas
import ws from 'ws'; // WebSocket

import router from './routes/routes.js';
import messageController from './controllers/MessageController.js';

const app = express();
const port = 3000;

app.disable('x-powered-by');

app.engine('eta', eta.renderFile);
app.set('view engine', 'eta');

app.use(router);

const wsServer = new ws.Server({ noServer: true });
messageController.init(wsServer);

const webServer = app.listen(port); 

webServer.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit('connection', socket, request);
  });
});
console.log('Owl\'s Rush listening on 3000....');
