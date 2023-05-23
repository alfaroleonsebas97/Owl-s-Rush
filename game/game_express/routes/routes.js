import express from 'express';
import path from 'path';

// import error from '../controllers/Error.js';
import gameScreenController from '../controllers/GameScreen.js';
import homescreenController from '../controllers/HomeScreen.js';
import lobbyScreenController from '../controllers/LobbyScreen.js';
import log from '../controllers/Log.js';

const router = express.Router();
const publicMiddleware = express.static(path.join(process.cwd(), 'public'));

// app.use('/', log);
router.use((req, res, next) => { log.logHttpRequest(req, res, next); });
router.use(express.urlencoded({ extended: false }));

// HomeScreen
router.get('/', (req, res) => {
  homescreenController.getHomeScreen(req, res);
});

router.get('/LobbyScreen', (req, res) => {
  lobbyScreenController.getLobbyScreen(req, res);
});

router.post('/LobbyScreen', (req, res, next) => {
  lobbyScreenController.postLobbyScreen(req, res, next);
});

router.post('/GameScreen', (req, res, next) => {
  gameScreenController.postGameBoard(req, res, next);
});

router.use(publicMiddleware);
/* router.use((req, res) => { error.getNotFound(req, res); }); */

export default router;
