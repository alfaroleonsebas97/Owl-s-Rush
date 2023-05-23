class HomeScreenController {
  getHomeScreen(req, res) {
    res.render('HomeScreen', {
      stylesheets: ['/css/HomeScreen.css'],
      scripts: ['/js/HomeScreen.js', '/js/HelpModal.js'],
    });
  }
}

// Singleton
const homeScreen = new HomeScreenController();
export default homeScreen;
