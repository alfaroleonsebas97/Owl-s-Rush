class ErrorController {
  getNotFound(req, res) {
    res.status(404).send('<h1>404 Not found</h1>\n<p><a href="/">Home</a></p>');
  }
}

// Singleton
const error = new ErrorController();
export default error;
