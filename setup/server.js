//npm install ws
const http = require('http'),
fs = require('fs'),
url = require ('url');
wsServer = require ('ws');
let clientIndex = 0, games=[];

//import des données du jeu
let boxesFile=JSON.parse(fs.readFileSync(__dirname + '/lang/fr/boxes.json'));
let boxes=boxesFile.boxes;
let villains=boxesFile.villains;
let mainSchemes=boxesFile.mainSchemes;
let heros=boxesFile.heros;
let decks=boxesFile.decks;
let sideSchemes=boxesFile.sideSchemes;
    //let schemeTexts=boxesFile.schemeTexts;



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
        //Ajout de la clef de la partie si non présente
        if (message.gameKey !== undefined && webSocket.gameKey === undefined) webSocket.gameKey = message.gameKey;
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
          else wsclientSend(clientId,'{"error":"wss::gameKeyNotFound ' + gameKey + '"}');
        } catch(err) {
            wsclientSend(clientId,'{"error":"' + err + '"}');}}

    //Sélection de 'opération
    if (games[gameKey] !== undefined) switch (message.operation) {
        case 'villainLifePlus':
            //Augmentation de la vie du méchant
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                games[gameKey].villains[message.id].life++;
                wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].life + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }
            break;

        case 'villainLifeMinus':
            //Diminution de la vie du méchant
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                if (games[gameKey].villains[message.id].life < 1) wsclientSend(clientId,'{"error":"wss::villainLifeNegative  ' + gameKey + '/' + message.id + '"}');
                else {
                    games[gameKey].villains[message.id].life--;
                    wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].life + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}
            break;

        case 'villainStatus' :
            //Changement d'état du méchant
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                 if (games[gameKey].villains[message.id][message.status] === undefined) {
                    games[gameKey].villains[message.id][message.status] = "1";
                    wsGameSend(gameKey,'{"operation":"villainStatus","id":"' + message.id + '","status":"' + message.status + '","value":"1"}');}
                 else {
                    delete games[gameKey].villains[message.id][message.status];
                    wsGameSend(gameKey,'{"operation":"villainStatus","id":"' + message.id + '","status":"' + message.status + '","value":"0"}');}
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }
            break;

        case 'changePhase' :
            //Changement de phase du méchant
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '"}');
            else {
                let villain = villains[games[gameKey].villains[message.villain].id];
                let newPhase = games[gameKey].villains[message.villain].phase;
                newPhase++;
                if (villain['life' + newPhase] === undefined) newPhase = 1;
                if (newPhase == games[gameKey].villains[message.villain].phase) wsclientSend(clientId,'{"error":"wss::phaseNoChange ' + gameKey + '/' + message.villain + '"}');
                else {
                    games[gameKey].villains[message.villain].phase = newPhase;
                    let newLife = villain['life' + newPhase]*games[gameKey].players.length;
                    games[gameKey].villains[message.villain].life = newLife
                wsGameSend(gameKey,'{"operation":"changePhase","villain":"' + message.villain + '","phase":"' + newPhase + '"}');
                wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.villain + '","value":"' + newLife + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }}
            break;

        case 'changeMain' :
            //Changement de manigance principale
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '"}');
            else {
                if (mainSchemes[message.main] === undefined) wsclientSend(clientId,'{"error":"wss::mainNotFound ' + message.main + '"}');
                else {
                    currentThreat = mainSchemes[message.main].init;
                    if (mainSchemes[message.main].initX !== undefined) currentThreat = currentThreat * games[gameKey].players.length;
                    maxThreat = mainSchemes[message.main].max;
                    if (mainSchemes[message.main].maxX !== undefined) maxThreat = maxThreat * games[gameKey].players.length;
                    games[gameKey].villains[message.villain].mainScheme = {"id":message.main,"current":currentThreat,"max":maxThreat,"acceleration":"0"};
                    wsGameSend(gameKey,'{"operation":"changeMain","villain":"' + message.villain + '","main":"' + message.main + '","current":"' + currentThreat + '","max":"' + maxThreat + '","acceleration":"0"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}
            break;

        case 'changevillain' :
            //Changement de méchant
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '"}');
            else {
                if (mainSchemes[message.main] === undefined) wsclientSend(clientId,'{"error":"wss::mainNotFound ' + message.main + '"}');
                else {
                    if (mainSchemes[message.newVillain] === undefined) wsclientSend(clientId,'{"error":"wss::newVillainNotFound ' + message.newVillain + '"}');
                    else {
                        currentThreat = mainSchemes[message.main].init;
                        if (mainSchemes[message.main].initX !== undefined) currentThreat = currentThreat * games[gameKey].players.length;
                        maxThreat = mainSchemes[message.main].max;
                        if (mainSchemes[message.main].maxX !== undefined) maxThreat = maxThreat * games[gameKey].players.length;
                        games[gameKey].villains[message.villain].mainScheme = {"id":message.main,"current":currentThreat,"max":maxThreat,"acceleration":"0"};
                        games[gameKey].villains[message.villain].id = message.newVillain;
                        games[gameKey].villains[message.villain].phase=1;
                        games[gameKey].villains[message.villain].life = villains[message.villain].life1;
                        games[gameKey].villains[message.villain].sideSchemes=[];
                        ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {
                            delete games[gameKey].villains[message.villain][statusName];
                            wsGameSend(gameKey,'{"operation":"villainStatus","id":"' + message.villain + '","status":"' + statusName+ '","value":"0"}');});
                        wsGameSend(gameKey,'{"operation":"changeMain","villain":"' + message.villain + '","main":"' + message.main + '","current":"' + currentThreat + '","max":"' + maxThreat + '","acceleration":"0"}');
                        wsGameSend(gameKey,'{"operation":"changeVillain","villain":"' + message.villain + '","id":"' + message.newVillain + '"}');
                        wsGameSend(gameKey,'{"operation":"changePhase","villain":"' + message.villain + '","phase":"' + 1 + '"}');
                        wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.villain + '","value":"' + villains[message.villain].life1 + '"}');
                        fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                    }}}
            break;

        case 'villainMainThreatMinus' :
            //Diminution de la menace sur la manigance principale
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                if (games[gameKey].villains[message.id].mainScheme.current < 1) wsclientSend(clientId,'{"error":"wss::threatNegative ' + gameKey + '/' + message.id + '"}');
                else {
                    games[gameKey].villains[message.id].mainScheme.current--;
                    wsGameSend(gameKey,'{"operation":"mainThreat","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.current + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}
            break;

        case 'villainMainAccelerationMinus' :
            //Diminution de l'acceleration sur la manigance principale
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                if (games[gameKey].villains[message.id].mainScheme.acceleration < 1) wsclientSend(clientId,'{"error":"wss::threatNegative ' + gameKey + '/' + message.id + '"}');
                else {
                    games[gameKey].villains[message.id].mainScheme.acceleration--;
                    wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.acceleration + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}
            break;

        case 'villainMainMaxMinus' :
            //Diminution du maximum sur la manigance principale
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                if (games[gameKey].villains[message.id].mainScheme.max < 1) wsclientSend(clientId,'{"error":"wss::threatNegative ' + gameKey + '/' + message.id + '"}');
                else {
                    games[gameKey].villains[message.id].mainScheme.max--;
                    wsGameSend(gameKey,'{"operation":"mainThreatMax","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.max + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}
            break;

        case 'villainMainThreatPlus' :
            //Augmentation de la menace sur la manigance principale
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                games[gameKey].villains[message.id].mainScheme.current++;
                wsGameSend(gameKey,'{"operation":"mainThreat","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.current + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }
            break;

        case 'villainMainAccelerationPlus' :
            //Augmentation de l'acceleration sur la manigance principale
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                games[gameKey].villains[message.id].mainScheme.acceleration++;
                wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.acceleration + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }
            break;

        case 'villainMainMaxPlus' :
            //Augmentation du maximum sur la manigance principale
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                games[gameKey].villains[message.id].mainScheme.max++;
                wsGameSend(gameKey,'{"operation":"mainThreatMax","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.max + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }
            break;
       default:
          wsclientSend(clientId,'{"error":"wss::operationNotFound ' + message.operation + '"}');
      }
      
}