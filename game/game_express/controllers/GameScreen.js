class GameController {
  postGameBoard(req, res) {
    res.render('GameScreen', {
      stylesheets: ['/css/GameScreen.css'],
      scripts: ['/js/GameScreen.js', '/js/HelpModal.js'],
    });
  }
}

// Singleton
const gameScreen = new GameController();
export default gameScreen;
