//npm install ws
const http = require('http'),
fs = require('fs'),
url = require ('url');
wsServer = require ('ws');
let clientIndex = 0, games=[];

const server = http.createServer(function (req, res) {

    //url.pars(req.url).query contiendra la requète envoyée par le client.

        if (url.parse(req.url).pathname === '/') req.url = '/index.html';
    let contentType = 'text/html';
    if (url.parse(req.url).pathname.endsWith('.json')) contentType = 'application/json';
    else if (url.parse(req.url).pathname.endsWith('.js')) contentType = 'text/javascript';
    else if (url.parse(req.url).pathname.endsWith('.png')) contentType = 'image/png';
    else if (url.parse(req.url).pathname.endsWith('.css')) contentType = 'text/css';
    else if (url.parse(req.url).pathname.endsWith('.pdf')) contentType = 'application/pdf';
    else if (url.parse(req.url).pathname.endsWith('.xml')) contentType = 'application/xml';
    else if (url.parse(req.url).pathname.endsWith('.ico')) contentType = 'image/x-icon';

    if (contentType === 'text/html' || contentType === 'application/json') console.log('Requète reçue -> ' + req.url);

    fs.readFile(__dirname + url.parse(req.url).pathname,function (err, data) {
        if (err) {
            res.writeHead(500);
            res.end();
        }
        else {
            //Set response header
            res.writeHead(200, {'Content-Type':contentType});
            //Set response content
            res.write(data);
            res.end();
        }
    })

});

const wss = new wsServer.WebSocketServer({ server });

wss.on('connection', function (webSocket) {
    webSocket.clientId = clientIndex;
    wsclientSend(clientIndex,'{"clientId":"' + webSocket.clientId + '"}');
    clientIndex ++;
    webSocket.on('message',function (data) {
        console.log('Data received from client ' + webSocket.clientId + ' : \'' + data + '\'');
        message=JSON.parse(data);
        if (message.gameKey !== undefined) {
            console.log ('gameKey found in message Data');
            //Ajout de la clef de partie à la socket pour pouvoir communiquer les changements.
            if (webSocket.gameKey === undefined) webSocket.gameKey = message.gameKey;}
        if (message.operation !== undefined) operation(message,webSocket.gameKey,webSocket.clientId);
    });
    webSocket.on('close',function () {
        //détection de la perte de connexion d'un client
        console.log('disconnected');});
  });

function wsclientSend(clientId,data) {
    //envoi d'informations à un client spécifique
    wss.clients.forEach(element => {
        if (element.clientId == clientId) element.send(data);});}

function wsGameSend(gameKey,data) {
    //envoi d'informations aux clients d'une partie spécifique
    wss.clients.forEach(element => {
        if (element.gameKey == gameKey) element.send(data);});}

server.listen(80);
console.log('Node.js web server at port 80 is running..')

function operation(message,gameKey,clientId) {
    //Gestion des modifications apportées par les clients.

    //Chargement en mémoire de la partie si elle n'y était pas...
    if (games[gameKey] === undefined) {
        // Chargement de la partie sollicitée
        try {
          if (fs.existsSync(__dirname + '/games/' + gameKey + '.json')) games[gameKey]=JSON.parse(fs.readFileSync(__dirname + '/games/' + gameKey + '.json'));
          else wsclientSend(clientId,'{"error":"ws::gameKeyNotFound ' + gameKey + '"}');
        } catch(err) {
            wsclientSend(clientId,'{"error":"' + err + '"}');}}

    //Sélection de 'opération
    if (games[gameKey] !== undefined) switch (message.operation) {
        case 'villainLifePlus':
            //Augmentation de la vie du méchant
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"ws::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                games[gameKey].villains[message.id].life++;
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].life + '"}');}
            break;
        case 'villainLifeMinus':
            //Diminution de la vie du méchant
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"ws::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                if (games[gameKey].villains[message.id].life < 1) wsclientSend(clientId,'{"error":"ws::villainLifeNegative  ' + gameKey + '/' + message.id + '"}');
                else {
                    games[gameKey].villains[message.id].life--;
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                    wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].life + '"}');}}
            break; 
        case 'villainStatus' :
            //Changement d'état du méchant
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"ws::villainNotFound ' + gameKey + '/' + message.id + '"}');
            if (games[gameKey].villains[message.id][message.status] === undefined) {
                 games[gameKey].villains[message.id][message.status] = "1";
                 wsGameSend(gameKey,'{"operation":"villainStatus","id":"' + message.id + '","status":"' + message.status + '","value":"1"}');}
             else {
                 delete games[gameKey].villains[message.id][message.status];
                 wsGameSend(gameKey,'{"operation":"villainStatus","id":"' + message.id + '","status":"' + message.status + '","value":"0"}');}
            fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            break;
        case 'changePhase' :
            //Changement de phase du méchant
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"ws::villainNotFound ' + gameKey + '/' + message.villain + '"}');
            games[gameKey].villains[message.villain].phase = message.newPhase;
            games[gameKey].villains[message.villain].life = message.newLife;
            wsGameSend(gameKey,'{"operation":"changePhase","villain":"' + message.villain + '","phase":"' + message.newPhase + '","life":"' + message.newLife + '"}');
            fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            break;
       default:
          wsclientSend(clientId,'{"error":"ws::operationNotFound ' + message.operation + '"}');
      }
      
}