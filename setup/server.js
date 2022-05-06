//npm install ws
//npm install selfsigned
//npm install greenlock
const consoleCyan = '\x1b[36m%s\x1b[0m', consoleRed = '\x1b[41m%s\x1b[0m',consoleGreen = '\x1b[32m%s\x1b[0m',
keyChars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ023456789',
http = require('http'), https = require('https'), fs = require('fs'), url = require ('url'), wsServer = require ('ws'), selfsigned = require('selfsigned'), greenlock = require ('greenlock'),
pkg = require('./package.json');
let clientIndex = 0, games = {}, hashes ={},
adminWS = {}, gamesPlayers = {}, logFile = '', serverBoot = Date.now(),
config = JSON.parse(fs.readFileSync(__dirname + '/serverConfig.json'));
//Mise en place du log existant en variable
let today = new Date(),
fileName = __dirname + '/logs/' +today.getFullYear() + today.getMonth() + today.getDate() + '.json';
if (fs.existsSync(fileName)) logFile = fs.readFileSync(fileName);

function serverLogFile (message) {
    //Journalisation sur le serveur
    let today = new Date();
    if (!fs.existsSync(__dirname + '/logs')) fs.mkdirSync(__dirname + '/logs');
    let fileName = __dirname + '/logs/' +today.getFullYear() + today.getMonth() + today.getDate() + '.json';
    if (!fs.existsSync(fileName)) {
        let logTitle= JSON.stringify({'date':Date.now(),'message':'NEW Dayly log','color':'white'});
        fs.appendFileSync(fileName,logTitle);
        logFile = logTitle;}
    fs.appendFileSync(fileName,',' + message);
    logFile += ',' + message;}
console.log = console.error = function (arg0,arg1='') {
    //Capture de la console Node.js
    let adminMessage = arg0.toString();
    let color = 'white';
    if (arg0 == consoleCyan || arg0 == consoleRed || arg0 == consoleGreen) {
        if (arg0.substring(2,4) == 36) color='cyan';
        if (arg0.substring(2,4) == 41) color='red';
        if (arg0.substring(2,4) == 32) color='green';
        arg0 = arg0.replace('%s',arg1);
        adminMessage = arg1;}
     process.stdout.write(arg0 + '\n');
     if (color != 'cyan' || config.debug !== undefined) serverLogFile(JSON.stringify({'date':Date.now(),'message':adminMessage,'color':color}));
     wsAdminSend(JSON.stringify({"operation":"console",'date':Date.now(),"message":adminMessage,"color":color}));};
process.on('uncaughtException', function(err) {
    //Capture des erreurs bloquantes
    process.stdout.write((err && err.stack) ? err.stack : err);
    serverLogFile(JSON.stringify({'date':Date.now(),'message':err.toString(),'color':'red'}));
    wsAdminSend(JSON.stringify({"operation":"console",'date':Date.now(),"message":err.toString(),"color":'red'}));});

//Génération du certifcat autosigné
let certAttr = [{ name: 'commonName', value: '127.0.0.1' }];
let selfCert = selfsigned.generate(certAttr, { days: 365 });
//Mise en place du bot LetsEncrypt (version greenlock)
gl = greenlock.create({ packageRoot: __dirname, configDir : './letsEncrypt/', packageAgent: pkg.name + '/' + pkg.version,
    //staging = test//
    staging : true, maintainerEmail : 'remote.champions@gmail.com', notify: function(event, details) {if ('error' === event) console.error(details);}});
//gl.manager
//    .defaults({agreeToTerms: true,subscriberEmail: 'renaud.wangler@gmail.com'});
//gl.add({ subject: 'rctest.fouy.net', altnames: ['rctest.fouy.net']});
//gl.get({servername:'rctest.fouy.net'});

if (config.tls == 'self' || config.tls == 'test') TLSoptions = { key: selfCert.private,cert:selfCert.cert};

//Premier lancement : mise en place du mot de passe administrateur
if (config.adminPassword === undefined) {
    config.adminPassword = config.defaultAdminPassword;
    fs.writeFileSync(__dirname + '/serverConfig.json',JSON.stringify(config));}
if (config.publicPassword === undefined) {
    config.publicPassword = config.defaultAdminPassword;
    fs.writeFileSync(__dirname + '/serverConfig.json',JSON.stringify(config));}
//import des données du jeu
let boxesFile=JSON.parse(fs.readFileSync(__dirname + '/lang/fr/boxes.json'));
let boxes=boxesFile.boxes;
let villains=boxesFile.villains;
let mainSchemes=boxesFile.mainSchemes;
let heros=boxesFile.heros;
let decks=boxesFile.decks;
let sideSchemes=boxesFile.sideSchemes;
//Construction de la liste des parties sur le serveur
fs.readdirSync(__dirname + '/games').forEach (function(gameFileName) {
    if (gameFileName != '.gitignore') {
        let gameContent = JSON.parse(fs.readFileSync(__dirname + '/games/' + gameFileName));
        if (gameContent.wsClients !== undefined) delete gameContent.wsClients;
        games[gameContent.key] = gameContent;}});
//Construction de la liste des langues prises en charge
let langList = {};
fs.readdirSync(__dirname + '/lang', {withFileTypes: true}).filter(element => element.isDirectory()).forEach (function(dirName) {
    langList[dirName.name]=JSON.parse(fs.readFileSync(__dirname + '/lang/'+dirName.name+'/strings.json')).langName;});

const server = http.createServer(webRequest);
const TLSserver = https.createServer(TLSoptions,webRequest);

function webRequest (req, res) {
    //Redirection vers ssl/tls si actif
    if (config.tls != 'off' && config.tls != 'test' && req.connection.encrypted === undefined) {
        if (config.tlsPort === undefined) config.tlsPort = '443';
        res.writeHead(302,{'location':'https://' + req.headers.host + ':' + config.tlsPort + req.url});
        res.end();}
    if (url.parse(req.url).pathname === '/') req.url = '/index.html';
    let contentType = 'text/html; charset=utf-8';
    if (url.parse(req.url).pathname.endsWith('.json')) contentType = 'application/json; charset=utf-8';
    else if (url.parse(req.url).pathname.endsWith('.js')) contentType = 'application/javascript; charset=utf-8';
    else if (url.parse(req.url).pathname.endsWith('.png')) contentType = 'image/png';
    else if (url.parse(req.url).pathname.endsWith('.css')) contentType = 'text/css; charset=utf-8';
    else if (url.parse(req.url).pathname.endsWith('.pdf')) contentType = 'application/pdf';
    else if (url.parse(req.url).pathname.endsWith('.xml')) contentType = 'application/xml; charset=utf-8';
    else if (url.parse(req.url).pathname.endsWith('.ico')) contentType = 'image/x-icon';
    else if (url.parse(req.url).pathname.endsWith('.log')) contentType = 'text/plain; charset=utf-8';
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

const ws = new wsServer.WebSocketServer({server:server});
ws.on('connection',webSocketConnect);

const wss = new wsServer.WebSocketServer({server: TLSserver });
wss.on('connection',webSocketConnect);

function webSocketConnect(webSocket) {
    //Fonction de gestion des webSockets
    if (webSocket._protocol.substring(0,3) == 'ref') {
        // Un client revient
        webSocket.clientId = webSocket._protocol.substring(3);
        console.log(consoleGreen,'client ' + webSocket.clientId + ' , Refreshed');
        //récupération/génération du hash pour mots de passe
        webSocket.salt = hashes[webSocket.clientId] !== undefined ? hashes[webSocket.clientId] : hash(Math.random().toString());}
    else {
        //Nouveau client (ou nouvelle page , pas un refresh)
        webSocket.clientId = clientIndex;
        clientIndex ++;
        console.log(consoleGreen,'client ' + webSocket.clientId + ' , Opened');
        //Création d'une chaine aléatoire pour vérification des mots de passe
        webSocket.salt = hash(Math.random().toString());
        if (webSocket._protocol == 'admin' || webSocket._protocol == 'index') hashes[webSocket.clientId] = webSocket.salt;}
    //Envoi des informations lors de la connexion d'un nouvel utilisateur
    webSocket.send('{"clientId":"' + webSocket.clientId + '","salt":"' + webSocket.salt + '","serverBoot":"' + serverBoot + '","public":"' + (config.public === undefined ? 'off' : 'on') + '"}');
    wsAdminSend('{"operation":"adminConnected","total":"' + (wss.clients.size + ws.clients.size) + '","admins":"' + Object.keys(adminWS).length + '"}');

    webSocket.on('message',function (data) {
        console.log(consoleCyan,'client ' + webSocket.clientId + ' , received : \'' + data + '\'');
        message=JSON.parse(data);
        //Traitement de la clef de la partie reçu
        if (message.pageName !== undefined && message.pageName == 'index') {
            //Envoi d'une nouvelle clef de partie pour création en page d'accueil.
            let newKey;
            do {
                newKey = '';
                for ( let i = 0; i < 8; i++ ) { newKey += keyChars.charAt(Math.floor(Math.random() * keyChars.length));}}
            while (games[newKey] !== undefined);
            webSocket.send('{"operation":"newKey","key":"' + newKey + '"}');}
        if (message.gameKey !== undefined) {
            message.gameKey= message.gameKey.toUpperCase();
            if (games[message.gameKey] === undefined) webSocket.send('{"error":"wss::gameNotFound","errId":"55"}');
            else {                
                webSocket.gameKey = message.gameKey;
                //Ajout de la webSocket au tableau pour envoi des messages
                if (gamesPlayers[message.gameKey] === undefined) gamesPlayers[message.gameKey] = {};
                if (gamesPlayers[message.gameKey][webSocket.clientId] === undefined) {
                    //Nouveau joueur dans la partie
                    games[message.gameKey].wsClients = games[message.gameKey].wsClients === undefined ? 1 : Number(games[message.gameKey].wsClients) + 1;
                    wsAdminSend('{"operation":"adminGamesUpdate","game":' + JSON.stringify(games[message.gameKey]) + '}');
                    gamesPlayers[message.gameKey][webSocket.clientId]=webSocket;}}}

        if (message.operation !== undefined) operation(message,webSocket.gameKey,webSocket.clientId,webSocket);
        if (message.admin !== undefined) adminOP(message,webSocket);});

    webSocket.on('close',function (event) {
        //détection de la perte de connexion/déconnexion d'un client
        console.log(consoleRed,'client ' + webSocket.clientId + ' , closed : \'' + event + '\'');
        if (webSocket.gameKey !== undefined) {
            //enlever le client de la partie
            delete gamesPlayers[webSocket.gameKey][webSocket.clientId];
            games[webSocket.gameKey].wsClients = Number(games[webSocket.gameKey].wsClients) - 1
            wsAdminSend('{"operation":"adminGamesUpdate","game":' + JSON.stringify(games[webSocket.gameKey]) + '}');
            delete webSocket.gameKey;}
        //Nettoyage de la connexion avec la page Admin
        if (adminWS[webSocket.clientId] !== undefined) {
            delete adminWS[webSocket.clientId];
            //Envoi de la liste des connectés sur la page d'admin
            wsAdminSend('{"operation":"adminConnected","total":"' + (wss.clients.size + ws.clients.size) + '","admins":"' + Object.keys(adminWS).length + '"}');}});}

function wsclientSend(clientId,data) {
    //envoi d'informations à un client spécifique
    ws.clients.forEach(element => {if (element.clientId == clientId) element.send(data);});
    wss.clients.forEach(element => {if (element.clientId == clientId) element.send(data);});}

function wsGameSend(gameKey,data) {
    //envoi d'informations aux clients d'une partie spécifique
    if (gamesPlayers[gameKey] != undefined) Object.keys(gamesPlayers[gameKey]).forEach(function(key) {gamesPlayers[gameKey][key].send(data);})}

function wsAdminSend(data) {
    //envoi d'informations aux clients connectés sur la page d'administration
    Object.keys(adminWS).forEach(function(key) {adminWS[key].send(data);})}

server.listen(80);
TLSserver.listen(443);

function adminOP(message,webSocket) {
    //Gestion des fonctionnalités administratives
    if (message.admin == 'checkPass') {
        //Vérification de la saisie du mot de passe admin
        if (hash(webSocket.salt + config.adminPassword) == message.passHash) {
            webSocket.send('{"operation":"adminOK"}');}
        else webSocket.send('{"operation":"adminKO"}');}
    else {
        //Vérification que le mot de passe admin utilisé est/reste correct
        if (hash(webSocket.salt + config.adminPassword) != message.passHash) {
            webSocket.send('{"error":"wss::adminBadPass","errId":"40"}');}
        else {
            //Mot de passe admin correct : actions administratives (ajout de la socket aux admins à prévenir sur connexion/déconnexions par exemple)
             if (adminWS[webSocket.clientId] === undefined) {
                adminWS[webSocket.clientId] = webSocket;
                wsAdminSend('{"operation":"adminConnected","total":"' + wss.clients.size + '","admins":"' + Object.keys(adminWS).length + '"}');}
            switch(message.admin) {
                case 'connect' : 
                webSocket.send('{"operation":"adminOK","debugMode":"' + (config.debug === undefined ? 'off' : 'on') + '","publicMode":"' + (config.public === undefined ? 'off' : 'on') + '","warningAdminPass":"' + (config.adminPassword == config.defaultAdminPassword ? 'KO':'ok') + '","warningPublicPass":"' + (config.publicPassword == config.defaultAdminPassword ? 'KO':'ok') + '","tlsCert":"' + config.tls + (config.tls != 'off' ? ' (port ' + config.tlsPort + ')':'') + '"}');
                break;

                case 'init' :
                    //Envoi de la liste des parties en cours sur le serveur
                    webSocket.send('{"operation":"adminGamesList","gamesList":' + JSON.stringify(games) + '}');
                    //Envoi de la liste des connectés sur la page d'admin
                    webSocket.send('{"operation":"adminConnected","total":"' + wss.clients.size + '","admins":"' + Object.keys(adminWS).length + '"}');
                    //Envoi de l'historique de la console sur la page d'admin
                    webSocket.send(JSON.stringify({'operation':'console','logFile':JSON.parse('[' + logFile + ']')}));
                    break;

                case 'playerName' :
                    //Changement du nom affiché d'un joueur
                    if(games[message.game].players[message.player] === undefined) webSocket.send('{"error":"wss::playerNotFound ' + message.game + '/' + message.player + '","errId":"51"}');
                    else {
                        games[message.game].players[message.player].name = message.newName;
                        wsGameSend(message.game,'{"operation":"playerName","player":"' + message.player + '","newName":"' + message.newName + '"}');
                        wsAdminSend('{"operation":"adminGamesUpdate","game":' + JSON.stringify(games[message.game]) + '}');
                        fs.writeFileSync(__dirname + '/games/' + message.game + '.json',JSON.stringify(games[message.game]));
                    }
                    break;

                case 'deleteGame' :
                    //Suppression administrative d'une partie
                    if(games[message.id] === undefined) wsclientSend(webSocket.clientId,'{"error":"wss::gameNotFound ' + message.id + '","errId":"52"}');
                    else {
                        delete games[message.id];
                        wsAdminSend('{"operation":"deleteGame","id":"' + message.id + '"}');
                        fs.unlinkSync(__dirname + '/games/' + message.id + '.json');}
                    break;

                case 'sendMessage' :
                    //Envoi d'un message administratif
                    if (message.game !== undefined) {
                        let textMessage = JSON.stringify({"operation":"adminMessage","message":message.message,"game":message.game});
                        if (message.test !== undefined) wsclientSend(webSocket.clientId,textMessage); else wsGameSend(message.game,textMessage);}
                    else if (message.all !== undefined) {
                        let textMessage = JSON.stringify({"operation":"adminMessage","message":message.message,"all":message.all});
                        if (message.test !== undefined) wsclientSend(webSocket.clientId,textMessage); else wss.clients.forEach(element => { element.send(textMessage); });}
                    else if (message.admins !== undefined) {
                        let textMessage = JSON.stringify({"operation":"adminMessage","message":message.message,"admins":message.admins});
                        if (message.test !== undefined) wsclientSend(webSocket.clientId,textMessage); else wsAdminSend(textMessage);}
                    break;

                case 'consoleSave' :
                    let logJson = JSON.parse('[' + logFile + ']');
                    let logDown = '';
                    logJson.forEach(function(mess) {
                    logDown += '[' + (new Date(parseInt(mess.date))).toLocaleTimeString() + ']' + mess.message + '\n';
                });
                let saveFileName = (config.siteName !== undefined && config.siteName != '' ? config.siteName : '');
                saveFileName += '-log'+ today.getFullYear() + today.getMonth() + today.getDate() + '.log';
                saveFileName.replace(/\s/g, '');
                webSocket.send('{"operation":"download","fileName":"' + saveFileName +  '","data":"' + b64enCode(logDown) + '"}');
                break;

                case 'publicMode':
                    if (message.publicMode != 'false') config.public = 'on'; else delete (config.public);
                    fs.writeFileSync(__dirname + '/serverConfig.json',JSON.stringify(config));
                    wsAdminSend('{"operation":"adminOK","publicMode":"' + (config.public === undefined ? 'off' : 'on') + '","debugMode":"' + (config.debug === undefined ? 'off' : 'on') + '","warningAdminPass":"' + (config.adminPassword == config.defaultAdminPassword ? 'KO':'ok') + '","warningPublicPass":"' + (config.publicPassword == config.defaultAdminPassword ? 'KO':'ok') + '","tlsCert":"' + config.tls + (config.tls != 'off' ? ' (port ' + config.tlsPort + ')':'') + '"}');
                    break;

                case 'debugMode' :
                    if (message.debugMode != 'false') config.debug = 'on'; else delete (config.debug);
                    fs.writeFileSync(__dirname + '/serverConfig.json',JSON.stringify(config));
                    wsAdminSend('{"operation":"adminOK","publicMode":"' + (config.public === undefined ? 'off' : 'on') + '","debugMode":"' + (config.debug === undefined ? 'off' : 'on') + '","warningAdminPass":"' + (config.adminPassword == config.defaultAdminPassword ? 'KO':'ok') + '","warningPublicPass":"' + (config.publicPassword == config.defaultAdminPassword ? 'KO':'ok') + '","tlsCert":"' + config.tls + (config.tls != 'off' ? ' (port ' + config.tlsPort + ')':'') + '"}');
                    break;

                case 'changePass':
                    let wichPass = 'adminPassword';
                    if (message.password == 'publicPass') wichPass = 'publicPassword';
                    config[wichPass] = message.value;
                    fs.writeFileSync(__dirname + '/serverConfig.json',JSON.stringify(config));
                    wsAdminSend('{"operation":"adminOK","publicMode":"' + (config.public === undefined ? 'off' : 'on') + '","debugMode":"' + (config.debug === undefined ? 'off' : 'on') + '","warningAdminPass":"' + (config.adminPassword == config.defaultAdminPassword ? 'KO':'ok') + '","warningPublicPass":"' + (config.publicPassword == config.defaultAdminPassword ? 'KO':'ok') + '","tlsCert":"' + config.tls + (config.tls != 'off' ? ' (port ' + config.tlsPort + ')':'') + '"}');
                    break;

                case 'saveAll' :
                    saveData={'games':[],'serverConfig':config,'clientConfig':JSON.parse(fs.readFileSync(__dirname + '/config.json'))};
                    Object.keys(games).forEach(function(key){
                        saveData.games.push(games[key]);
                    });
                    let saveAllName = (config.siteName !== undefined && config.siteName != '' ? config.siteName : '');
                    saveAllName += '-log'+ today.getFullYear() + today.getMonth() + today.getDate() + '.bak';
                    saveAllName.replace(/\s/g, '');
                    webSocket.send('{"operation":"download","fileName":"' + saveAllName +  '","data":"' + b64enCode(JSON.stringify(saveData)) + '"}');
                    break;

                case 'restore' :
                    let buffer = Buffer.from(message.data,'base64');  
                    let text = buffer.toString('utf-8');
                    let jsonRestore
                    let restoreError = 'ok';             
                    try {jsonRestore = JSON.parse(text);
                        if (jsonRestore.key !== undefined) restoreGame(jsonRestore);
                        else {
                            //Restaurer les parties fournies dans le fichier
                            if (jsonRestore.games != undefined) {
                                jsonRestore.games.forEach(function(game2restore) {restoreGame(game2restore)});
                                wsAdminSend();
                            }
                            //restaurer la configuration serveur
                            if (jsonRestore.serverConfig !== undefined) {
                                fs.writeFileSync(__dirname + '/serverConfig.json',JSON.stringify(jsonRestore.serverConfig));
                                config = jsonRestore.serverConfig;
                                wsAdminSend('{"operation":"adminOK","publicMode":"' + (config.public === undefined ? 'off' : 'on') + '","debugMode":"' + (config.debug === undefined ? 'off' : 'on') + '","warningAdminPass":"' + (config.adminPassword == config.defaultAdminPassword ? 'KO':'ok') + '","warningPublicPass":"' + (config.publicPassword == config.defaultAdminPassword ? 'KO':'ok') + '","tlsCert":"' + config.tls + (config.tls != 'off' ? ' (port ' + config.tlsPort + ')':'') + '"}');
                            }
                            //restaurer la configuration des clients
                            if (jsonRestore.clientConfig !== undefined) {
                                fs.writeFileSync(__dirname + '/config.json',JSON.stringify(jsonRestore.clientConfig));
                            }
                    }}
                    catch (err) {restoreError=err;}
                        webSocket.send('{"operation":"restore","result":"' + restoreError + '"}');
                    break;

                default:
                    webSocket.send('{"error":"wss::operationNotFound ' + message.admin + '","errId":"53"}');
            }}}}
function restoreGame(gameData) {
    //restaurer une partie depuis le JSON d'un fichier
    delete gameData.wsClients;
    let restoreAdd = games[gameData.key] === undefined;
    if (games[gameData.key] === undefined) restoreAdd = true;
    games[gameData.key]=gameData;
    fs.writeFileSync(__dirname + '/games/' + gameData.key + '.json',JSON.stringify(gameData));
    if (restoreAdd) wsAdminSend('{"operation":"adminGamesList","gamesList":' + JSON.stringify(games) + '}'); else wsAdminSend('{"operation":"adminGamesUpdate","game":' + JSON.stringify(gameData) + '}');
    
                    
}

function operation(message,gameKey,clientId,webSocket) {
    //Gestion des modifications apportées par les clients.

    //Sélection de 'opération
    switch (message.operation) {

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

        case 'playerLifeMinus' :
        case 'playerLifePlus'  :
            //Diminution /augmentation de la vie du joueur
            if(games[gameKey].players[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::playerNotFound ' + gameKey + '/' + message.id + '","errId":"41"}');
            else {
                if (message.operation == 'playerLifeMinus') {
                    if (games[gameKey].players[message.id].life < 1) wsclientSend(clientId,'{"error":"wss::playerLifeNegative ' + gameKey + '/' + message.id + '","errId":"42"}'); else games[gameKey].players[message.id].life--;}
                else games[gameKey].players[message.id].life++;
                wsGameSend(gameKey,'{"operation":"playerLife","id":"' + message.id + '","value":"' + games[gameKey].players[message.id].life + '"}');
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

        case 'playerStatus' :
            //Changement d'état du joueur
            if(games[gameKey].players[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::playerNotFound ' + gameKey + '/' + message.id + '","errId":"43"}');
            else {
                 if (games[gameKey].players[message.id][message.status] === undefined) {
                    games[gameKey].players[message.id][message.status] = "1";
                    wsGameSend(gameKey,'{"operation":"playerStatus","id":"' + message.id + '","status":"' + message.status + '","value":"1"}');}
                 else {
                    delete games[gameKey].players[message.id][message.status];
                    wsGameSend(gameKey,'{"operation":"playerStatus","id":"' + message.id + '","status":"' + message.status + '","value":"0"}');}
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }
            break;

        case 'alterHero' :
            //Passage de l'Alter-Ego au Super-héros
            if(games[gameKey].players[message.player] === undefined) wsclientSend(clientId,'{"error":"wss::playerNotFound ' + gameKey + '/' + message.player + '","errId":"44"}');
            else {
                games[gameKey].players[message.player].alterHero = games[gameKey].players[message.player].alterHero == 'h' ? 'a' : 'h'; 
                wsGameSend(gameKey,'{"operation":"playerAlterHero","id":"' + message.player + '","alterHero":"' + games[gameKey].players[message.player].alterHero + '"}');
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

        case 'changeHero' :
            //changement de héros
            if(games[gameKey].players[message.player] === undefined) wsclientSend(clientId,'{"error":"wss::playerNotFound ' + gameKey + '/' + message.player + '","errId":"44"}');
            else {
                if (heros[message.newHero] === undefined) wsclientSend(clientId,'{"error":"wss::newHeroNotFound ' + message.newHero + '","errId":"45"}');
                else {
                    games[gameKey].players[message.player].hero = message.newHero;
                    games[gameKey].players[message.player].life = heros[message.newHero].life;
                    games[gameKey].players[message.player].alterHero = 'a';
                    ['confused','stunned','tough'].forEach((statusName) => {
                        delete games[gameKey].players[message.player][statusName];
                        wsGameSend(gameKey,'{"operation":"playerStatus","id":"' + message.player + '","status":"' + statusName+ '","value":"0"}');});
                    wsGameSend(gameKey,'{"operation":"changeHero","hero":"' + message.newHero + '","id":"' + message.player + '"}');
                    wsGameSend(gameKey,'{"operation":"playerAlterHero","id":"' + message.player + '","alterHero":"a"}');
                    wsGameSend(gameKey,'{"operation":"playerLife","id":"' + message.player + '","value":"' + games[gameKey].players[message.player].life + '"}');
                    wsAdminSend('{"operation":"adminGamesUpdate","game":' + JSON.stringify(games[gameKey]) + '}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                    }}
            break;

        case 'playerName' :
            //Changement du nom affiché d'un joueur
            if(games[gameKey].players[message.player] === undefined) wsclientSend(clientId,'{"error":"wss::playerNotFound ' + gameKey + '/' + message.player + '","errId":"50"}');
            else {
                games[gameKey].players[message.player].name = message.newName;
                wsGameSend(gameKey,'{"operation":"playerName","player":"' + message.player + '","newName":"' + message.newName + '"}');
                wsAdminSend('{"operation":"adminGamesUpdate","game":' + JSON.stringify(games[gameKey]) + '}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }
            break;

        case 'changeFirst' :
            //Changement de premier joueur : valeur attendue pour first : numéro du nouveau, next, random ou current
            let newFirst = message.first;
            if (message.first == 'next') {
                newFirst = Number(games[gameKey].first) + 1;
                if (newFirst > (games[gameKey].players.length -1)) newFirst = 0;}
            if (message.first == 'random') newFirst = Math.random() * (games[gameKey].players.length -1);
            games[gameKey].first = newFirst;
            wsGameSend(gameKey,'{"operation":"changeFirst","first":"' +newFirst + '"}');
            fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));

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
                        games[gameKey].villains[message.villain].life = villains[games[gameKey].villains[message.villain].id].life1;
                        games[gameKey].villains[message.villain].sideSchemes={};
                        ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {
                            delete games[gameKey].villains[message.villain][statusName];
                            wsGameSend(gameKey,'{"operation":"villainStatus","id":"' + message.villain + '","status":"' + statusName+ '","value":"0"}');});
                        wsGameSend(gameKey,'{"operation":"changeMain","villain":"' + message.villain + '","main":"' + message.main + '","current":"' + currentThreat + '"}');
                        wsGameSend(gameKey,'{"operation":"mainThreatMax","id":"' + message.villain + '","value":"' + maxThreat + '"}');
                        wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.villain + '","value":"0"}');
                        wsGameSend(gameKey,'{"operation":"changeVillain","villain":"' + message.villain + '","id":"' + message.newVillain + '"}');
                        wsGameSend(gameKey,'{"operation":"changePhase","villain":"' + message.villain + '","phase":"' + 1 + '"}');
                        wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.villain + '","value":"' + games[gameKey].villains[message.villain].life + '"}');
                        wsAdminSend('{"operation":"adminGamesUpdate","game":' + JSON.stringify(games[gameKey]) + '}');
                        //Désignation du premier joueur (si plusieurs joueurs présents et un seul méchant)
                        if (games[gameKey].players.length > 1 && games[gameKey].villains.length == 1) {
                            games[gameKey].first =  Math.floor(Math.random() * (games[gameKey].players.length -1));
                            wsGameSend(gameKey,'{"operation":"changeFirst","first":"' + games[gameKey].first + '"}');}
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
                else games[gameKey].villains[message.id].mainScheme.max++;
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
            if (message.villain !== undefined) {
                //Compteur de méchant
                if (games[gameKey].villains[message.villain].counters === undefined || Object.keys(games[gameKey].villains[message.villain].counters).length == 0) {
                    //premier compteur du méchant
                    games[gameKey].villains[message.villain].counters = {"0":newCounter};
                    wsGameSend(gameKey,'{"operation":"newCounter","villain":"' + message.villain + '","id":"0","name":"' + message.counterName + '","value":"' + message.value + '"}');}
                else {
                    //Compteur(s) suivant(s) : incrémenter le dernier Id présent
                    let gameCounters = games[gameKey].villains[message.villain].counters;
                    newCounterId = Number(Object.keys(gameCounters)[Object.keys(gameCounters).length-1]) + 1;
                    gameCounters[newCounterId] = newCounter;
                    wsGameSend(gameKey,'{"operation":"newCounter","villain":"' + message.villain + '","id":"' + newCounterId + '","name":"' + message.counterName + '","value":"' + message.value + '"}');}}
            else {
                //compteur de joueur
                if (games[gameKey].players[message.player].counters === undefined || Object.keys(games[gameKey].players[message.player].counters).length == 0) {
                    //premier compteur du joueur
                    games[gameKey].players[message.player].counters = {"0":newCounter};
                    wsGameSend(gameKey,'{"operation":"newCounter","player":"' + message.player + '","id":"0","name":"' + message.counterName + '","value":"' + message.value + '"}');}
                else {
                    //Compteur(s) suivant(s) : incrémenter le dernier Id présent
                    let gameCounters = games[gameKey].players[message.player].counters;
                    newCounterId = Number(Object.keys(gameCounters)[Object.keys(gameCounters).length-1]) + 1;
                    gameCounters[newCounterId] = newCounter;
                    wsGameSend(gameKey,'{"operation":"newCounter","player":"' + message.player + '","id":"' + newCounterId + '","name":"' + message.counterName + '","value":"' + message.value + '"}');}}
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
           break;

        case 'deleteCounter' :
            //Suppression d'un compteur
            if (message.villain !== undefined) {
                //Suppresion d'un compteur de méchant
                if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"31"}');
                else {
                    if (games[gameKey].villains[message.villain].counters[message.counter] === undefined ) wsclientSend(clientId,'{"error":"wss::counterNotFound ' + gameKey + '/' + message.villain + '/' + message.counter + '","errId":"32"}');
                    else {
                        delete (games[gameKey].villains[message.villain].counters[message.counter]);
                        wsGameSend(gameKey,'{"operation":"deleteCounter","villain":"' + message.villain + '","id":"' + message.counter + '"}');
                        fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                    }}
            }
            else {
                //Suppression d'un compteur de joueur
                if(games[gameKey].players[message.player] === undefined) wsclientSend(clientId,'{"error":"wss::playerNotFound ' + gameKey + '/' + message.villain + '","errId":"46"}');
                else {
                    if (games[gameKey].players[message.player].counters[message.counter] === undefined ) wsclientSend(clientId,'{"error":"wss::counterNotFound ' + gameKey + '/' + message.player + '/' + message.counter + '","errId":"47"}');
                    else {
                        delete (games[gameKey].players[message.player].counters[message.counter]);
                        wsGameSend(gameKey,'{"operation":"deleteCounter","player":"' + message.player + '","id":"' + message.counter + '"}');
                        fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                    }}}
            break;
        
        case 'counterPlus' :
        case 'counterMinus' :
            if (message.villain != undefined) {
                //Incrémenter/Décrémenter un compteur de méchant
                if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"33"}');
            else {
                if (games[gameKey].villains[message.villain].counters[message.id] === undefined ) wsclientSend(clientId,'{"error":"wss::counterNotFound ' + gameKey + '/' + message.villain + '/' + message.id + '","errId":"34"}');
                else {
                    if (message.operation == 'counterPlus') games[gameKey].villains[message.villain].counters[message.id].value++; else if (games[gameKey].villains[message.villain].counters[message.id].value > 0)  games[gameKey].villains[message.villain].counters[message.id].value--;
                    wsGameSend(gameKey,'{"operation":"counter","villain":"' + message.villain + '","id":"' + message.id + '","value":"' + games[gameKey].villains[message.villain].counters[message.id].value + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                    }}
            }
            else {
                //Incrémenter/Décrémenter un compteur de joueur
                if(games[gameKey].players[message.player] === undefined) wsclientSend(clientId,'{"error":"wss::playerNotFound ' + gameKey + '/' + message.player + '","errId":"48"}');
            else {
                if (games[gameKey].players[message.player].counters[message.id] === undefined ) wsclientSend(clientId,'{"error":"wss::counterNotFound ' + gameKey + '/' + message.player + '/' + message.id + '","errId":"49"}');
                else {
                    if (message.operation == 'counterPlus') games[gameKey].players[message.player].counters[message.id].value++; else if (games[gameKey].players[message.player].counters[message.id].value > 0)  games[gameKey].players[message.player].counters[message.id].value--;
                    wsGameSend(gameKey,'{"operation":"counter","player":"' + message.player + '","id":"' + message.id + '","value":"' + games[gameKey].players[message.player].counters[message.id].value + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                    }}}
            break;
        
        case 'langList' :
            //Construction de la liste des langues disponibles sur le serveur
            wsclientSend(clientId,JSON.stringify({"operation":"langList","langList":langList}));
            break;

        case 'keyJoin' :
            //Rejoindre une partie sur le serveur
            message.key = message.key.toUpperCase();
            if(games[message.key] === undefined) wsclientSend(clientId,'{"operation":"gameJoin"}'); else wsclientSend(clientId,'{"operation":"gameJoin","key":"' + message.key + '"}');
            break;

        case 'newKey' :
            //validation de la clef d'une nouvelle partie
            message.key = message.key.toUpperCase();
            if (config.public) {
                //Validation en mode public
                if (hash(webSocket.salt + config.publicPassword) == message.passHash) {
                    if (games[message.key] !== undefined) wsclientSend(clientId,'{"operation":"newKey"}'); else wsclientSend(clientId,'{"operation":"newKey","key":"' + message.key +'"}');}
                else wsclientSend(clientId,'{"error":"wss::badPublicPass","errId":"58"}');}
            else if (games[message.key] !== undefined) wsclientSend(clientId,'{"operation":"newKey"}'); else wsclientSend(clientId,'{"operation":"newKey","key":"' + message.key +'"}');
            break;

        case 'newGame' :
            //Création de la partie
            message.key = message.key.toUpperCase();
            if (config.public) {
                //Validation en mode public
                if (hash(webSocket.salt + config.publicPassword) == message.passHash) {
                    if (games[message.key] !== undefined) wsclientSend(clientId,'{"error":"wss::keyAllreadyUsed","errId":"60"}');
                    else  createGame(message.key,message.villains,message.players,message.decks,message.playersName,webSocket);}
                else wsclientSend(clientId,'{"error":"wss::badPublicPass","errId":"59"}');}
            else createGame(message.key,message.villains,message.players,message.decks,message.playersName,webSocket);
            break;

        case 'checkPass' :
            //Vérification de la saisie du mot de passe publique
            if (hash(webSocket.salt + config.publicPassword) == message.passHash) webSocket.send('{"operation":"newGamePassOK"}'); else webSocket.send('{"operation":"newGamePassKO"}');
            break;

        default:
          wsclientSend(clientId,'{"error":"wss::operationNotFound ' + message.operation + '","errId":"18"}');
      }}

const { createHash } = require('crypto');
//Hash pour mots de passe
function hash(string) {
  return createHash('sha256').update(string).digest('hex');}
function createGame(key,nbVillains,nbPlayers,decks,playersName,webSocket) {
    let gameCreate = {"key":key,"date":Date.now(),"villains":[],"players":[],"decks":decks};
    for (i=0;i<nbVillains;i++) gameCreate.villains.push({"id":"0","life":"0","phase":"0","mainScheme":{"id":"0","current":"0","max":"0","acceleration":"0"},"sideSchemes":{}});
    for (i=1;i<=nbPlayers;i++) gameCreate.players.push({"name":playersName + " " + i,"life":"0","alterHero":"a","hero":"0"});
    if (nbPlayers>1) gameCreate.first = Math.floor(Math.random() * Number(nbPlayers-1));
    games[key]=gameCreate;
    fs.appendFile(__dirname + '/games/' + key + '.json',JSON.stringify(gameCreate),function() {webSocket.send('{"operation":"gameJoin","key":"'+ key + '"}');})
    wsAdminSend('{"operation":"adminGamesList","gamesList":' + JSON.stringify(games) + '}');}

function b64enCode(data) {
    //Encodage en base 64 de la donnée fournie.
    let buff = Buffer.from(data, 'utf-8');
    return buff.toString('base64');}