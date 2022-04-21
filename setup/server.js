//npm install ws
const http = require('http'),
https = require('https'),
fs = require('fs'),
url = require ('url'),
wsServer = require ('ws');
let clientIndex = 0, games = [], adminSockets = [];

//import des données du jeu
let config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
let boxesFile=JSON.parse(fs.readFileSync(__dirname + '/lang/fr/boxes.json'));
let boxes=boxesFile.boxes;
let villains=boxesFile.villains;
let mainSchemes=boxesFile.mainSchemes;
let heros=boxesFile.heros;
let decks=boxesFile.decks;
let sideSchemes=boxesFile.sideSchemes;
    //let schemeTexts=boxesFile.schemeTexts;

const server = http.createServer(webRequest),
TLSserver = http.createServer(webRequest);

function webRequest (req, res) {
    if (url.parse(req.url).pathname === '/') req.url = '/index.html';
    let contentType = 'text/html; charset=utf-8';
    if (url.parse(req.url).pathname.endsWith('.json')) contentType = 'application/json; charset=utf-8';
    else if (url.parse(req.url).pathname.endsWith('.js')) contentType = 'text/javascript; charset=utf-8';
    else if (url.parse(req.url).pathname.endsWith('.png')) contentType = 'image/png';
    else if (url.parse(req.url).pathname.endsWith('.css')) contentType = 'text/css; charset=utf-8';
    else if (url.parse(req.url).pathname.endsWith('.pdf')) contentType = 'application/pdf';
    else if (url.parse(req.url).pathname.endsWith('.xml')) contentType = 'application/xml; charset=utf-8';
    else if (url.parse(req.url).pathname.endsWith('.ico')) contentType = 'image/x-icon';
    if (contentType === 'text/html' || contentType === 'application/json') console.log('HTTP GET Request -> ' + req.url);
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
            res.end();}})};

const wss = new wsServer.WebSocketServer({ server });

wss.on('connection', function (webSocket) {
    webSocket.clientId = clientIndex;
    //Création d'une chaine aléatoire pour vérification des mots de passe
    webSocket.salt = hash(Math.random().toString());
    wsclientSend(clientIndex,'{"clientId":"' + webSocket.clientId + '","salt":"' + webSocket.salt + '"}');
    clientIndex ++;
    webSocket.on('message',function (data) {
        console.log('Data received from client ' + webSocket.clientId + ' : \'' + data + '\'');
        message=JSON.parse(data);
        //Ajout de la clef de la partie si non présente et chargement de la partie si nécessaire
        if (message.gameKey !== undefined) {
            webSocket.gameKey = message.gameKey;
            //Chargement en mémoire de la partie si elle n'y était pas...
            if (games[message.gameKey] === undefined) {
                try {
                    if (fs.existsSync(__dirname + '/games/' + message.gameKey + '.json')) games[message.gameKey]=JSON.parse(fs.readFileSync(__dirname + '/games/' + message.gameKey + '.json')); else wsclientSend(webSocket.clientId,'{"error":"wss::gameKeyNotFound ' + message.gameKey + '","errId":"1"}');} 
                catch(err) {
                    wsclientSend(message.clientId,'{"error":"wssError : ' + err + '"}');}}
            if (games[message.gameKey].wsClients === undefined) games[message.gameKey].wsClients = {};
            if (games[message.gameKey] !== undefined) {
                if (games[message.gameKey].wsClients[webSocket.clientId] === undefined) wsAdminSend('{"operation":"adminPlayerConnected","gameKey":"' + webSocket.gameKey + '","socketId":"' + webSocket.clientId + '"}');
                games[message.gameKey].wsClients[webSocket.clientId]=Date.now();}}
        if (message.operation !== undefined) operation(message,webSocket.gameKey,webSocket.clientId);
        if (message.admin !== undefined) adminOP(message,webSocket);
    });
    webSocket.on('close',function () {
        //détection de la perte de connexion/déconnexion d'un client
        if (webSocket.gameKey !== undefined) {
            delete games[webSocket.gameKey].wsClients[webSocket.clientId];
            wsAdminSend('{"operation":"adminPlayerDisconnected","gameKey":"' + webSocket.gameKey + '","socketId":"' + webSocket.clientId + '"}');}
        //Nettoyage de la connexion avec la page Admin
        if (adminSockets[webSocket.clientId] !== undefined) delete adminSockets[webSocket.clientId];
    });
  });

function wsclientSend(clientId,data) {
    //envoi d'informations à un client spécifique
    wss.clients.forEach(element => {
        if (element.clientId == clientId) element.send(data);});}

function wsGameSend(gameKey,data) {
    //envoi d'informations aux clients d'une partie spécifique
    wss.clients.forEach(element => {
        if (element.gameKey == gameKey) element.send(data);});}

function wsAdminSend(data) {
    //envoi d'informations aux clients connectés sur la page d'administration
    adminSockets.forEach(function(key) {wsclientSend(key,data);});}

server.listen(80);
TLSserver.listen(443);
console.log('Node.js web server at port 80 is running..');

function adminOP(message,webSocket) {
    //Gestion des fonctionnalités administratives
    if (message.admin == 'checkPass') {
        //Vérification de la saisie du mot de passe admin
        if (hash(webSocket.salt + config.adminPassword) == message.passHash) {
            websocket.admin = true;
            wsclientSend(webSocket.clientId,'{"operation":"adminOK"}');}
        else wsclientSend(webSocket.clientId,'{"operation":"adminKO"}');}
    else {
        //Vérification que le mot de passe admin utilisé est/reste correct
        if (hash(webSocket.salt + config.adminPassword) != message.passHash) {
            wsclientSend(webSocket.clientId,'{"error":"wss::adminBadPass","errId":"40"}');}
        else {
            //Mot de passe admin correct : actions administratives (ajout de la socket aux admins à prévenir sur connexion/déconnexions par exemple)
            adminSockets.push(webSocket.clientId);
            switch(message.admin) {
                case 'getList' :
                    //Récupération de la liste des parties en cours sur le serveur
                    let gamesList = {};
                    fs.readdirSync(__dirname + '/games').forEach (function(fileName) {
                        let gameContent = JSON.parse(fs.readFileSync(__dirname + '/games/' + fileName));
                        gamesList[gameContent.key] = games[gameContent.key] === undefined ? gameContent : games[gameContent.key];});
                    wsclientSend(webSocket.clientId,'{"operation":"adminGamesList","gamesList":' + JSON.stringify(gamesList) + '}');
                    break;
            }}}}

function operation(message,gameKey,clientId) {
    //Gestion des modifications apportées par les clients.
    games[gameKey].wsClients[clientId]=Date.now();

    //Sélection de 'opération
    if (games[gameKey] !== undefined) switch (message.operation) {

        case 'villainLifeMinus':
        case 'villainLifePlus' :
            //Diminution /augmentation de la vie du méchant
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '","errId":"3"}');
            else {
                if (message.operation == 'villainLifeMinus') {
                    if (games[gameKey].villains[message.id].life < 1) wsclientSend(clientId,'{"error":"wss::villainLifeNegative  ' + gameKey + '/' + message.id + '","errId":"4"}'); else games[gameKey].villains[message.id].life--;}
                else games[gameKey].villains[message.id].life++;
                wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].life + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }
            break;

        case 'villainStatus' :
            //Changement d'état du méchant
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '","errId":"5"}');
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
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"6"}');
            else {
                let villain = villains[games[gameKey].villains[message.villain].id];
                let newPhase = games[gameKey].villains[message.villain].phase;
                newPhase++;
                if (villain['life' + newPhase] === undefined) newPhase = 1;
                if (newPhase == games[gameKey].villains[message.villain].phase) wsclientSend(clientId,'{"error":"wss::phaseNoChange ' + gameKey + '/' + message.villain + '","errId":"7"}');
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
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"8"}');
            else {
                if (mainSchemes[message.main] === undefined) wsclientSend(clientId,'{"error":"wss::mainNotFound ' + message.main + '","errId":"9"}');
                else {
                    currentThreat = mainSchemes[message.main].init;
                    if (mainSchemes[message.main].initX !== undefined) currentThreat = currentThreat * games[gameKey].players.length;
                    maxThreat = mainSchemes[message.main].max;
                    if (mainSchemes[message.main].maxX !== undefined) maxThreat = maxThreat * games[gameKey].players.length;
                    games[gameKey].villains[message.villain].mainScheme = {"id":message.main,"current":currentThreat,"max":maxThreat,"acceleration":"0"};
                    wsGameSend(gameKey,'{"operation":"changeMain","villain":"' + message.villain + '","main":"' + message.main + '"}');
                    wsGameSend(gameKey,'{"operation":"mainThreat","id":"' + message.villain + '","value":"' + currentThreat + '"}');
                    wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.villain + '","value":"0"}');
                    wsGameSend(gameKey,'{"operation":"mainThreatMax","id":"' + message.villain + '","value":"' + maxThreat + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}
            break;

        case 'changevillain' :
            //Changement de méchant
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"10"}');
            else {
                if (mainSchemes[message.main] === undefined) wsclientSend(clientId,'{"error":"wss::mainNotFound ' + message.main + '","errId":"11"}');
                else {
                    if (mainSchemes[message.newVillain] === undefined) wsclientSend(clientId,'{"error":"wss::newVillainNotFound ' + message.newVillain + '","errId":"12"}');
                    else {
                        currentThreat = mainSchemes[message.main].init;
                        if (mainSchemes[message.main].initX !== undefined) currentThreat = currentThreat * games[gameKey].players.length;
                        maxThreat = mainSchemes[message.main].max;
                        if (mainSchemes[message.main].maxX !== undefined) maxThreat = maxThreat * games[gameKey].players.length;
                        games[gameKey].villains[message.villain].mainScheme = {"id":message.main,"current":currentThreat,"max":maxThreat,"acceleration":"0"};
                        games[gameKey].villains[message.villain].id = message.newVillain;
                        games[gameKey].villains[message.villain].phase=1;
                        games[gameKey].villains[message.villain].life = villains[message.villain].life1;
                        games[gameKey].villains[message.villain].sideSchemes={};
                        ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {
                            delete games[gameKey].villains[message.villain][statusName];
                            wsGameSend(gameKey,'{"operation":"villainStatus","id":"' + message.villain + '","status":"' + statusName+ '","value":"0"}');});
                        wsGameSend(gameKey,'{"operation":"changeMain","villain":"' + message.villain + '","main":"' + message.main + '","current":"' + currentThreat + '"}');
                        wsGameSend(gameKey,'{"operation":"mainThreatMax","id":"' + message.villain + '","value":"' + maxThreat + '"}');
                        wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.villain + '","value":"0"}');
                        wsGameSend(gameKey,'{"operation":"changeVillain","villain":"' + message.villain + '","id":"' + message.newVillain + '"}');
                        wsGameSend(gameKey,'{"operation":"changePhase","villain":"' + message.villain + '","phase":"' + 1 + '"}');
                        wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.villain + '","value":"' + villains[message.villain].life1 + '"}');
                        //Ajouter la désignation du premier joueur (si plusieurs joueurs présents)
                        if (games[gameKey].players.length > 1) {

                        }
                        fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                    }}}
            break;

        case 'villainMainThreatMinus' :
        case 'villainMainThreatPlus' :
            //Diminution/augmentation de la menace sur la manigance principale
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '","errId":"13"}');
            else {
                if (message.operation == 'villainMainThreatMinus') {
                    if (games[gameKey].villains[message.id].mainScheme.current < 1) wsclientSend(clientId,'{"error":"wss::threatNegative ' + gameKey + '/' + message.id + '","errId":"14"}'); else games[gameKey].villains[message.id].mainScheme.current--; }    
                else  games[gameKey].villains[message.id].mainScheme.current++;
                    wsGameSend(gameKey,'{"operation":"mainThreat","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.current + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }
            break;

        case 'villainMainAccelerationMinus' :
        case 'villainMainAccelerationPlus' :
            //Diminution/augmentation de l'acceleration sur la manigance principale
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '","errId":"15"}');
            else {
                if (message.operation == 'villainMainAccelerationMinus') {
                  if (games[gameKey].villains[message.id].mainScheme.acceleration < 1) wsclientSend(clientId,'{"error":"wss::threatNegative ' + gameKey + '/' + message.id + '","errId":"16"}'); else games[gameKey].villains[message.id].mainScheme.acceleration--;}
                else games[gameKey].villains[message.id].mainScheme.acceleration++;
                    wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.acceleration + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }
            break;

        case 'villainMainMaxMinus' :
        case 'villainMainMaxPlus' :
            //Diminution/augmentation du maximum sur la manigance principale
            if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
            else {
                if (message.operation == 'villainMainMaxMinus') {
                    if (games[gameKey].villains[message.id].mainScheme.max < 1) wsclientSend(clientId,'{"error":"wss::threatNegative ' + gameKey + '/' + message.id + '","errId":"19"}'); else games[gameKey].villains[message.id].mainScheme.max--; }
                else games[gameKey].villains[message.id].mainScheme.max--;
                    wsGameSend(gameKey,'{"operation":"mainThreatMax","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.max + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }
            break;

        case 'sideSchemeMinus' :
        case 'sideSchemePlus' :
            //Diminution de la menace d'une manigance secondaire
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"23"}');
            else {
                if (games[gameKey].villains[message.villain].sideSchemes[message.sideScheme] === undefined) wsclientSend(clientId,'{"error":"wss::sideSchemeNotFound ' + message.sideScheme + '","errId":"24"}');
                else {
                    if (message.operation == 'sideSchemeMinus') {
                        if (games[gameKey].villains[message.villain].sideSchemes[message.sideScheme].threat == 1) {
                            if (sideSchemes[message.sideScheme].acceleration !== undefined) {
                                //suppression de l'accélération ajoutée par la manigance
                                games[gameKey].villains[message.villain].mainScheme.acceleration--;
                                wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.villain + '","value":"' + games[gameKey].villains[message.villain].mainScheme.acceleration + '"}');}
                            delete games[gameKey].villains[message.villain].sideSchemes[message.sideScheme];
                            wsGameSend(gameKey,'{"operation":"removeSideScheme","villain":"' + message.villain + '","id":"' + message.sideScheme + '"}');}
                        else {                    
                            games[gameKey].villains[message.villain].sideSchemes[message.sideScheme].threat--;
                            wsGameSend(gameKey,'{"operation":"sideScheme","id":"' + message.sideScheme + '","value":"' + games[gameKey].villains[message.villain].sideSchemes[message.sideScheme].threat + '","villain":"' + message.villain + '"}');}}
                    else {
                        games[gameKey].villains[message.villain].sideSchemes[message.sideScheme].threat++;
                        wsGameSend(gameKey,'{"operation":"sideScheme","id":"' + message.sideScheme + '","value":"' + games[gameKey].villains[message.villain].sideSchemes[message.sideScheme].threat + '","villain":"' + message.villain + '"}');}
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}   
            break;

        case 'newScheme' :
            //Ajout d'une nouvelle manigance annexe
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"29"}');
            else {
                if (sideSchemes[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::sideSchemeNotFound ' + gameKey + '/' + message.villain + '","errId":"30"}');
                else {
                    newScheme=sideSchemes[message.id];
                    newSchemeThreat = newScheme.init;
                    if (newScheme.initX !== undefined) newSchemeThreat = Number(newSchemeThreat) * games[gameKey].players.length;
                    if (newScheme.acceleration !== undefined) {
                        games[gameKey].villains[message.villain].mainScheme.acceleration++;
                        wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.villain + '","value":"' + games[gameKey].villains[message.villain].mainScheme.acceleration + '"}');}
                    if (newScheme.hinder !== undefined) newSchemeThreat = Number(newSchemeThreat) + Number(games[gameKey].players.length);
                    wsGameSend(gameKey,'{"operation":"newScheme","villain":"' + message.villain + '","id":"' + message.id + '","threat":"' + newSchemeThreat + '"}');
                    games[gameKey].villains[message.villain].sideSchemes[message.id]={"threat":newSchemeThreat};
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}
            break;

        case 'newCounter' :
            //Ajout d'un nouveu compteur à un méchant
            let newCounter = {"name":message.counterName,"value":message.value};
            if (games[gameKey].villains[message.villain].counters === undefined) {
                //premier compteur du méchant
                games[gameKey].villains[message.villain].counters = {"0":newCounter};
                wsGameSend(gameKey,'{"operation":"newCounter","villain":"' + message.villain + '","id":"0","name":"' + message.counterName + '","value":"' + message.value + '"}');}
            else {
                //Compteur(s) suivant(s) : incrémenter le dernier Id présent
                let gameCounters = games[gameKey].villains[message.villain].counters;
                newCounterId = Number(Object.keys(gameCounters)[Object.keys(gameCounters).length-1]) + 1;
                gameCounters[newCounterId] = newCounter;
                wsGameSend(gameKey,'{"operation":"newCounter","villain":"' + message.villain + '","id":"' + newCounterId + '","name":"' + message.counterName + '","value":"' + message.value + '"}');}
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
           break;

        case 'deleteCounter' :
            //Suppression d'un compteur
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"31"}');
            else {
                if (games[gameKey].villains[message.villain].counters[message.counter] === undefined ) wsclientSend(clientId,'{"error":"wss::counterNotFound ' + gameKey + '/' + message.villain + '/' + message.counter + '","errId":"32"}');
                else {
                    delete (games[gameKey].villains[message.villain].counters[message.counter]);
                    wsGameSend(gameKey,'{"operation":"deleteCounter","villain":"' + message.villain + '","id":"' + message.counter + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}
            break;
        
        case 'counterPlus' :
        case 'counterMinus' :
            //Incrémenter/Décrémenter un compteur de méchant
            if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"33"}');
            else {
                if (games[gameKey].villains[message.villain].counters[message.id] === undefined ) wsclientSend(clientId,'{"error":"wss::counterNotFound ' + gameKey + '/' + message.villain + '/' + message.id + '","errId":"34"}');
                else {
                    if (message.operation == 'counterPlus') games[gameKey].villains[message.villain].counters[message.id].value++; else if (games[gameKey].villains[message.villain].counters[message.id].value > 0)  games[gameKey].villains[message.villain].counters[message.id].value--;
                    wsGameSend(gameKey,'{"operation":"counter","villain":"' + message.villain + '","id":"' + message.id + '","value":"' + games[gameKey].villains[message.villain].counters[message.id].value + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                    }}
            break;
        
        default:
          wsclientSend(clientId,'{"error":"wss::operationNotFound ' + message.operation + '","errId":"18"}');
      }}

const { createHash } = require('crypto');
//Hash pour mots de passe
function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}
