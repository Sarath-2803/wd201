const http = require('http');
const fs = require('fs');

const args = process.argv;
const portArg =args.find(arg => arg.startsWith('--port='));
const port = parseInt(portArg.split('=')[1]);

http.createServer((request, response) => {
    if (request.url === '/' || request.url === '/home') {
        // Serve home.html
        fs.readFile('home.html', (err, home) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Error loading home.html');
                return;
            }
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(home);
        });
    } else if (request.url === '/registration') {
        // Serve registration.html
        fs.readFile('registration.html', (err, registration) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Error loading registration.html');
                return;
            }
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(registration);
        });
    } else if (request.url === '/project') {
        // Serve project.html
        fs.readFile('project.html', (err, project) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Error loading project.html');
                return;
            }
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(project);
        });
    } else {
        // Handle 404 - Not Found
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('404 Not Found');
    }
}).listen(port);


