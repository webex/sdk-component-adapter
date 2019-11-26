import {createServer} from 'http';

createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write('Hello World!');
  response.end();
}).listen(1234);
