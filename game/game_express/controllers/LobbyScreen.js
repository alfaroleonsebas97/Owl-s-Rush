// import Player from "../models/Player.js";

class LobbyScreenController {
  postLobbyScreen(req, res) {
    // const sessionCode = req.params.sessionCode ?? -1;

    res.render('LobbyScreen', {
      stylesheets: ['/css/LobbyScreen.css'],
      scripts: ['/js/LobbyScreen.js', '/js/HelpModal.js'],
      code: req.body.code,
      nickname1: req.body.nickname1,
      nickname2: req.body.nickname2,
      nickname3: req.body.nickname3,
      nickname4: req.body.nickname4,
    });
  }

  getLobbyScreen(req, res) {
    // const sessionCode = req.params.sessionCode ?? -1;

    res.render('LobbyScreen', {
      stylesheets: ['/css/LobbyScreen.css'],
      scripts: ['/js/LobbyScreen.js', '/js/HelpModal.js'],
      code: '',
      nickname1: '',
      nickname2: '',
      nickname3: '',
      nickname4: '',
    });
  }
}

// Singleton
const lobbyScreen = new LobbyScreenController();
export default lobbyScreen;
