let websocketString = (location.protocol == 'http:' ? 'ws' : 'wss') + '://' + location.host, websocket,websocketReconnect = true;
let inddexInterval = setInterval(function() {if (loaded.page == true){
    //Attente du chargement de la page avant de se connecter en webSocket
    clearInterval(inddexInterval);
    if (pageName == 'admin') openSocket('admin'); else if (pageName =='index') openSocket('index'); else openSocket();
}},100)

function openSocket(clientId=null) {
    let protocol = clientId == null ? 'open' : clientId == 'admin' ? 'admin' : 'ref' + clientId;
    websocket = new WebSocket(websocketString,protocol,{perMessageDeflate : false});

    websocket.onopen = function() {
        //Envoi de la clef de partie à l'ouverture de session webSocket.
        let openReq = '{';
        if (typeof gameKey != 'undefined' && gameKey !== '' && pageName != 'admin') openReq+='"gameKey":"'+ gameKey +'",';
        sendReq (openReq + '"pageName":"' + pageName + '"}');
        //masquer le message de connexion fermée sur récupération de la connexion.
        if (document.getElementById('webSocketLost')) document.getElementById('webSocketLost').remove();};
        document.getElementById('loading').style.display='none';
    
    websocket.onerror = function() {
        //erreur sur webSocket, si pendant essai d'ouverture, on arrete les frais...
        if (websocket.readyState == 3) websocketReconnect = false;}

    websocket.onclose = function (event) {
        //Détection de connexion perdue / reconnexion
        if (websocketReconnect) {
            let reconnectDiv = addElement('div','webSocketLost','webSocketLost');
            let reconnectDivText = addElement('p');
            reconnectDivText.textContent = lang['ws::connectionLost'];
            reconnectDiv.append(reconnectDivText);
            document.getElementsByTagName('body')[0].append(reconnectDiv);
            openSocket(webSocketId,(sessionStorage.getItem('rChampions-adminHash') !== null && pageName == 'admin'));}
        else if (document.getElementById('webSocketLost')) document.getElementById('webSocketLost').getElementsByTagName('p')[0].textContent = lang['ws::connectionClosed'];}

    websocket.onmessage = function(event) {
        message=JSON.parse(event.data);
        console.log(message);
        if (message.clientId !== undefined) {
            //Informations récupérées à l'ouverture de la websocket
            webSocketId=message.clientId;
            webSocketSalt=message.salt;
            //Vérification du dernier boot serveur savoir s'il faut poursuivre (ou si besoin refresh après reboot serveur).
            if (serverBoot === undefined) serverBoot = message.serverBoot;
            if (message.public != 'on' && pageName == 'index') {
                publicMode = false;
                if (!document.getElementById('newGameTable')) loadIndexNew(true);}
            else if (serverBoot != message.serverBoot) {
                websocketReconnect = false;
                sessionStorage.clear();
                if (document.getElementById('websocketError')) document.getElementById('websocketError').remove();
                let websocketError=addElement('div','websocketError','websocketError');
                websocketError.textContent=lang['ws::serverRebooted'];
                websocketError.onclick = function () {location.href = '/index.html';}
                websocketError.style.cursor = 'pointer';
                document.getElementsByTagName('body')[0].append(websocketError);
                throw new Error(lang['ws::serverRebooted']);
            }
            //Vérification du mot de passe sur (re)connexion
            if (pageName == 'admin' && sessionStorage.getItem('rChampions-adminHash')) {
                hash(webSocketSalt + sessionStorage.getItem('rChampions-adminHash')).then (function(hashedValue) {
                    adminHash = hashedValue;
                    sendReq('{"admin":"connect","passHash":"' + adminHash + '"}');})}
            if (pageName == 'index' && sessionStorage.getItem('rChampions-publicHash')) {
                hash(webSocketSalt + sessionStorage.getItem('rChampions-publicHash')).then (function(hashedValue) {
                    publicHash = hashedValue;})
            }
        }
        if (message.error !== undefined) webSockError(message.error,message.errId !== undefined ? message.errId : 0);
        else if (message.operation !== undefined) switch (message.operation) {
            //Réalisation d'une opération commandée par la serveur
            case 'villainLife':
                if (message.value < 10) message.value= '0' + message.value;
                isElem('villain' + message.id + '-life').textContent = message.value;
                game.villains[message.id].life=message.value;
                break;
     
            case 'villainStatus':
                isElem('villain' + message.id + '-' + message.status).className = message.value == '1' ? message.status : message.status + ' off';
                if (message.status == '0') delete game.villains[message.id][message.status]; else game.villains[message.id][message.status]='1';
                break;
       
            case 'playerStatus' :
                isElem('player' + message.id + '-' + message.status).className = message.value == '1' ? message.status : message.status + ' off';
                if (message.status == '0') delete game.players[message.id][message.status]; else game.players[message.id][message.status]='1';
                break;
      
            case 'playerAlterHero' :
                isElem('alterHero' + message.id ).textContent = message.alterHero == 'h' ? lang.PLhero : lang.PLalter;
                game.players[message.id].alterHero = message.alterHero;
                break;
        
            case 'changePhase':
                isElem('villain' + message.villain + '-phase').textContent = message.phase;
                game.villains[message.villain].phase=message.phase;
                break;
                
            case 'changeMain' :
                if (message.current < 10) message.current = '0' + message.current;
                if (message.max < 10) message.max = '0' + message.max;
                isElem('villain' + message.villain +'-mainName').textContent = mainSchemes[message.main].name;
                game.villains[message.villain].mainScheme.id = message.main;
                break;
        
            case 'changeVillain' :
                isElem('villain' + message.villain + '-pic').style.backgroundImage = "url('./images/villains/" + message.id + ".png')";
                isElem('villain' + message.villain + '-name').textContent = villains[message.id].name;
                game.villains[message.villain].id=message.id;
                game.villains[message.villain].sideSchemes=[];
                if (document.getElementById('villain' + message.villain)) Array.from(document.getElementById('villain' + message.villain).getElementsByClassName('sideScheme')).forEach(element => {element.remove();})
                break;
                
            case 'changeHero' :
                isElem('player' + message.id + '-pic').style.backgroundImage = "url('./images/heros/" + message.hero + ".png')";
                game.players[message.id].hero=message.hero;
                break;
      
            case 'mainThreat' :
                if (message.value < 10) message.value = '0' + message.value;
                isElem('villain' + message.id + '-mainValue').textContent = message.value;
                game.villains[message.id].mainScheme.current = message.value;
                isElem('villain' + message.id + '-mainScheme').className = game.villains[message.id].mainScheme.current >= game.villains[message.id].mainScheme.max ?   'mainSchemeLost' : 'mainScheme';
                break;
        
            case 'mainThreatAccel' :
                if (message.value < 10) message.value = '0' + message.value;
                isElem('villain' + message.id + '-mainAccelValue').textContent = message.value;
                game.villains[message.id].mainScheme.acceleration = message.value;
                break;
    
            case 'mainThreatMax' :
                if (message.value < 10) message.value = '0' + message.value;
                isElem('villain' + message.id + '-mainMaxValue').textContent = message.value;
                game.villains[message.id].mainScheme.max = message.value;
                isElem('villain' + message.id + '-mainScheme').className = game.villains[message.id].mainScheme.current >= game.villains[message.id].mainScheme.max ?   'mainSchemeLost' : 'mainScheme';
                break;
                        
            case 'sideScheme' :
                if (message.value < 10) message.value = '0' + message.value;
                isElem('villain' + message.villain + '-sideScheme' + message.id + '-value').textContent = message.value;
                game.villains[message.villain].sideSchemes[message.id].threat = message.value;
                break;
        
            case 'removeSideScheme' :
                if (document.getElementById('villain' + message.villain)) {
                    //Changer l'affichage du bouton de perte de vie du méchant si disparition d'une crise
                    if (sideSchemes[message.id].crisis !== undefined) isElem('villain' + message.villain + '-life-minus').className = 'minus';
                    if (document.getElementById('villain' + message.villain + '-sideScheme' + message.id) !== undefined) {
                        if (sideSchemes[message.id].defeat !== undefined) sideSchemePopup (message.villain,message.id,'defeat');
                        document.getElementById('villain' + message.villain + '-sideScheme' + message.id).remove();}}
                    delete game.villains[message.villain].sideSchemes[message.id];
                break;
        
            case 'newScheme' :
                game.villains[message.villain].sideSchemes[message.id]={"threat":message.threat};
                isElem('villain' + message.villain + '-sideSchemes').prepend(sideSchemeDisplay(message.villain,message.id));
                if (document.getElementById('villain' + message.villain + '-sideSchemes') && sideSchemes[message.id].reveal !== undefined) sideSchemePopup (message.villain,message.id,'reveal');
                if (sideSchemes[message.id].crisis !== undefined) isElem('villain' + message.villain + '-life-minus').className += ' minusCrisis';
                break;
                
            case 'newCounter' :
                if (message.villain !== undefined) {
                    if (game.villains[message.villain].counters === undefined) game.villains[message.villain].counters = [];
                    game.villains[message.villain].counters[message.id] = {"name":message.name,"value":message.value};
                    isElem('villain' + message.villain + '-counters').append(counterDisplay (message.villain,message.id));}
                else {
                    if (game.players[message.player].counters === undefined) game.players[message.player].counters = [];
                    game.players[message.player].counters[message.id] = {"name":message.name,"value":message.value};
                    isElem('player' + message.player + '-counters').append(PcounterDisplay (message.player,message.id));}
                break;
        
            case 'deleteCounter' :
                if (message.villain !== undefined) {
                    delete game.villains[message.villain].counters[message.id];
                    isElem('villain' + message.villain + '-counter' + message.id).remove();}
                else {
                    delete game.players[message.player].counters[message.id];
                    isElem('player' + message.player + '-counter' + message.id).remove();}
                break;
        
            case 'counter' :
                if (message.value < 10) message.value = '0' + message.value;
                if (message.villain != undefined) {
                    game.villains[message.villain].counters[message.id].value = message.value;
                    isElem('villain' + message.villain + '-count' + message.id).textContent = message.value;}
                else {
                    game.players[message.player].counters[message.id].value = message.value;
                    isElem('player' + message.player + '-count' + message.id).textContent = message.value;}
                break;
        
            case 'playerLife' :
                if (message.value < 10) message.value= '0' + message.value;
                isElem('player' + message.id + '-life').textContent = message.value;
                game.players[message.id].life=message.value;
                break;
        
            case 'playerName' :
                isElem('player' + message.player + '-name').textContent = message.newName;
                game.players[message.player].name = message.newName;
                break;
        
            case 'adminKO' :
                document.getElementById('popup').getElementsByClassName('outro')[0].innerHTML = lang.POPUPAdminBadPassword;
                document.getElementById('popup').getElementsByClassName('outro')[0] . className = ' outro errorText'
                break;
                
            case 'adminOK' :
                if (pageName == 'admin' && loaded.page) {
                    //peupler la page admin après connexion.
                    document.getElementById('adminNetCert').textContent = message.tlsCert;
                    document.getElementById('publicSlider').checked = message.publicMode == 'on';
                    document.getElementById('debugSlider').checked = message.debugMode == 'on';
                    document.getElementById('melodiceSlider').checked = message.melodice == 'on';
                    document.getElementById('melodiceList').value = message.meloList;
                    document.getElementById('tr1').getElementsByTagName('td')[1].style.backgroundColor = message.warningAdminPass == 'KO' ? 'crimson' : 'transparent';
                    document.getElementById('tr2').getElementsByTagName('td')[1].style.backgroundColor = message.warningAdminPass == 'KO' ? 'crimson' : 'transparent';
                    document.getElementById('tr3').getElementsByTagName('td')[1].style.backgroundColor = message.warningPublicPass == 'KO' ? 'crimson' : 'transparent';
                    document.getElementById('tr4').getElementsByTagName('td')[1].style.backgroundColor = message.warningPublicPass == 'KO' ? 'crimson' : 'transparent';
                    document.getElementById('adminPass1').value = document.getElementById('adminPass2').value = document.getElementById('publicPass1').value = document.getElementById('publicPass2').value = '';
                    sendReq('{"admin":"init","passHash":"' + adminHash + '"}');}
                else if (pageName != 'admin') window.location.href = "admin.html";
                break;
        
            case 'adminGamesList' :
                gamesListDiv = document.getElementById('gamesListTile-content');
                if (message.gamesList == {} || Object.keys(message.gamesList).length == 0) gamesListDiv.textContent = lang.ADMINTILEemptyList;
                else {
                    let gamesListTable = addElement('table');
                    gamesListTable.innerHTML = '<tr><th>' + lang.ADMINTILEgamesListTH1 + '</th><th>' + lang.ADMINTILEgamesListTH2 + '</th><th>' + lang.ADMINTILEgamesListTH3 + '</th><th>' + lang.ADMINTILEgamesListTH4 + '</th><th>' + lang.ADMINTILEgamesListTH5 + '</th><th>' + lang.ADMINTILEgamesListTH6 + '</th></tr>';
                    Object.keys(message.gamesList).forEach(key => {gamesListTable.append(adminGameDisplay(message.gamesList[key]));});
                    gamesListDiv.innerHTML='';
                    gamesListDiv.append(gamesListTable);
                }
                break;
        
            case 'adminGamesUpdate' :
                oldItem = document.getElementById('adminGame-' + message.game.key);
                oldItem.parentNode.replaceChild(adminGameDisplay(message.game),oldItem);
                break;
        
            case 'deleteGame' :
                document.getElementById('adminGame-' + message.id).remove();
                if (document.getElementById('gamesListTile-content').getElementsByTagName('tr').length == 1) document.getElementById('gamesListTile-content').textContent = lang.ADMINTILEemptyList;
                if (sessionStorage.getItem('rChampions-gameKey') && sessionStorage.getItem('rChampions-gameKey')==message.id) sessionStorage.clear('rChampions-gameKey');
                break;
                
            case 'changeFirst' :
                document.querySelectorAll('button.firstPlayer').forEach(element => {element.className = 'firstPlayer off'});
                document.getElementById('firstplayer' + message.first).className = 'firstPlayer';
                game.first = message.first;
                break;
        
            case 'adminMessage' :
                document.getElementById('adminMessagePopup').getElementsByClassName('inside')[0].textContent = message.message;
                if (message.game != undefined) document.getElementById('adminMessagePopup').getElementsByClassName('foot')[0].innerHTML = '(' + lang.POPUPAdminMessageFootGame + ')';
                else if (message.all != undefined) document.getElementById('adminMessagePopup').getElementsByClassName('foot')[0].innerHTML = '(' + lang.POPUPAdminMessageFootAll + ')';
                else if (message.admins != undefined) document.getElementById('adminMessagePopup').getElementsByClassName('foot')[0].innerHTML = '(' + lang.POPUPAdminMessageFootAdmins + ')';
                document.getElementById('adminMessagePopup').style.display = 'block';
                break;
        
            case 'adminConnected' :
                document.getElementById('adminMessages').getElementsByClassName('total')[0].textContent = message.total;
                document.getElementById('adminMessages').getElementsByClassName('admins')[0].textContent = message.admins;
                break;
                
            case 'langList' :
                if (Object.keys(message.langList).length == 1) {
                    //Une seule langue disponible sur le serveur
                    document.getElementById('languageSelection').textContent = lang.langOnlyOne0 + Object.values(message.langList)[0] + lang.langOnlyOne1;
                    document.getElementById('adminLangConfirm').style.display = 'none';}
                else Object.keys(message.langList).forEach(function(lId) { document.getElementById('languageSelection').innerHTML += '<div><input type="radio" name="languageSelect" value="' + lId + '"'+ (lId == rcConfig.lang ? ' checked' : '') + '>'+ message.langList[lId] + '</div>'; })
                break;
        
            case 'console' :
                let logFile = message.logFile !== undefined ? message.logFile : [{'date':message.date,'message':message.message,'color':message.color}];
                logFile.forEach(function(mess) {
                    document.getElementById('adminTILEserverConsole').innerHTML = '<div class="messWrap"><p><span class="date">' + (new Date(parseInt(mess.date))).toLocaleTimeString() + '</span><span class="content ' + mess.color + '">' + mess.message + '</span></p></div>' + document.getElementById('adminTILEserverConsole').innerHTML;
                })
                break;
            
            case 'adminLogDL':
                saveLink = document.createElement('a');
                saveLink.href = message.logName;
                saveLink.download = message.logName.replace(/^.*[\\\/]/, '');
                saveLink.click();
                saveLink.remove();
                break;
            
            case 'download' :
                download(message.fileName,message.data)
                break;

            case 'gameJoin' :
                if (message.key === undefined) document.getElementById('joinGame').getElementsByClassName('outro')[0].textContent = lang.indexJoinBadKey;
                else {
                    localStorage.setItem('rChampions-gameKey',message.key);
                    location.href = 'game.html';}
                break;

            case 'newKey' :
                if (message.key === undefined) document.getElementById('newGameTile').getElementsByClassName('outro')[0].textContent = lang.indexNewBadKey;
                else if (message.key == document.getElementById('newGameKey').value.toUpperCase()) loadIndexNew2();
                else if (document.getElementById('newGameKeySubmit') || document.getElementById('newGamePassSubmit')) document.getElementById('newGameKey').value = message.key;
                break;

            case 'newGamePassKO' :
                document.getElementById('newGameTile').getElementsByClassName('outro')[0].textContent = lang.indexNewGamePassBas;
                break;
            
            case 'newGamePassOK' :
                newGameKey = document.getElementById('newGameKey').value;
                loadIndexNew(true);
                document.getElementById('newGameKey').value = newGameKey;
            break;
            
            case 'restore' :
                if (message.result == 'ok') greenCheck('adminSave-greenCheck'); else document.getElementById('saveTile-content').getElementsByClassName('error').textContent = message.result;
            break;

            default:
        webSockError('ws::serverOperationNotFound ' + message.operation,'28');}}}

function sendReq(data={}) {
    //Attendre que la webScoket soit pleinement ouverte :
    let webSocketOpened = setInterval(function() {if (websocket.readyState === WebSocket.OPEN) {
        clearInterval(webSocketOpened);
        try {websocket.send (data);} catch(err) {console.log (err);}
    }},100);}

function webSockError(errorText,id=0) {
    //Affichage d'une erreur reçue du serveur
    if (document.getElementById('websocketError')) document.getElementById('websocketError').remove();
    let websocketError=document.createElement('div');
    websocketError.id='websocketError';
    let errorCode = (/(ws*::\w*)/).exec(errorText)[1];
    let errorDetail = (/\s(.*)/).exec(errorText);
    errorText = (lang[errorCode] != undefined ? lang[errorCode] : errorCode) + (errorDetail != null ? " '" + errorDetail[1] + "'" : '');
    if (lang[errorText] !== undefined) errorText = lang[errorText];
    if (id !== 0) errorText += ' (' + id + ')';
    websocketError.textContent=errorText;
    websocketErrorClose=addElement('button','close');
    websocketErrorClose.title=lang.BUTTONclose;
    websocketErrorClose.onclick=function () {document.getElementById('websocketError').remove();}
    websocketError.append(websocketErrorClose);
    document.getElementsByTagName('body')[0].append(websocketError);}

function download(filename,content) {
    //savedData = "data:application/octet-stream," + atob(message.data,);
    var a = document.createElement('a');
    var blob = new Blob([atob(content)], {'type':'application/octet-stream'});
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    a.remove();}