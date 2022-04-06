let  http = require("http");
let url = require("url");
function start() {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        console.log("Requête reçue pour le chemin " + pathname + ".");
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("Hello World");
        response.end();
    }
 http.createServer(onRequest).listen(8888);
 console.log("Démarrage du serveur.");
}
exports.start = start