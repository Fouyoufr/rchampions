const http = require('http'),
fs = require('fs'),
url = require ('url');

var server = http.createServer(function (req, res) {

    //url.pars(req.url).query contiendra la requète envoyée par le client.

    console.log('Requète reçue : ' + req.url);
    if (url.parse(req.url).pathname === '/') req.url = '/index.html';
    let contentType = 'text/html';
    if (url.parse(req.url).pathname.endsWith('.json')) contentType = 'application/json';
    else if (url.parse(req.url).pathname.endsWith('.js')) contentType = 'text/javascript';
    else if (url.parse(req.url).pathname.endsWith('.peng')) contentType = 'image/png';
    else if (url.parse(req.url).pathname.endsWith('.css')) contentType = 'text/css';
    else if (url.parse(req.url).pathname.endsWith('.pdf')) contentType = 'application/pdf';
    else if (url.parse(req.url).pathname.endsWith('.xml')) contentType = 'application/xml';

    fs.readFile(__dirname + url.parse(req.url).pathname,function (err, data) {
        if (err) throw err;
        else {
            //Set response header
            res.writeHead(200, {'Content-Type':contentType});
            //Set response content
            res.write(data);
            res.end();
        }
    })

});

server.listen(80);

console.log('Node.js web server at port 80 is running..')