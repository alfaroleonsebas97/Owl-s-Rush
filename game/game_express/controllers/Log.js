import fs from 'fs';
import path from 'path';

class LogController {
  constructor(filename = 'log.tsv') {
    this.filename = path.join(process.cwd(), filename);
  }

  append(message, type = 'i', category = '') {
    fs.appendFile(this.filename, `${type}\t${category}\t${message}\n`, (error) => {
      if (error) {
        console.error(error.toString());
      }
    });
  }

  logHttpRequest(req, resp, next) {
    const message = `${req.method} ${req.url}`;
    console.log(message);
    this.append(message, 'i', 'http');
    next();
  }
}

// Singleton
const log = new LogController();
export default log;
