let websocket = new WebSocket('ws://' + location.host);

websocket.onopen = function() {
    //Envoi de la clef de partie à l'ouverture de session webSocket.
    if (typeof gameKey != 'undefined' && gameKey !== '' && pageTitle != 'TITadmin') sendReq('{"gameKey":"'+ gameKey +'"}');
      };

websocket.onclose = function (event) {
    //Connexction perdue
    webSockError('ws::connextionLost ' + event.reason,'27');}

websocket.onmessage = function(event) {
    message=JSON.parse(event.data);
    console.log(message);
    if (message.clientId !== undefined) {
        //INformations récupérées à l'ouverture de la websocket
        webSocketId=message.clientId;
        webSocketSalt=message.salt;}
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
            //A retravialler après passage aux Id sur les DIVs en direct
            if (document.getElementById('villain' + message.villain)) Array.from(document.getElementById('villain' + message.villain).getElementsByClassName('sideScheme')).forEach(element => {element.remove();})
            break;
        
        case 'changeHero' :
            isElem('player' + message.id + '-pic').style.backgroundImage = "url('./images/heros/" + message.hero + ".png')";
            game.players[message.id].id=message.hero;
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
            window.location.href = "admin.html";
            break;

        case 'adminGamesList' :
            gamesListDiv = document.getElementById('gamesListTile-content');
            if (message.gamesList == {} || Object.keys(message.gamesList).length == 0) gamesListDiv.textContent = lang.ADMINTILEemptyList;
            else {
                let gamesListTable = addElement('table');
                gamesListTable.innerHTML = '<tr><th>' + lang.ADMINTILEgamesListTH1 + '</th><th>' + lang.ADMINTILEgamesListTH2 + '</th><th>' + lang.ADMINTILEgamesListTH3 + '</th><th>' + lang.ADMINTILEgamesListTH4 + '</th><th>' + lang.ADMINTILEgamesListTH5 + '</th><th>' + lang.ADMINTILEgamesListTH6 + '</th></tr>';
                gamesListDiv.append(gamesListTable);
                Object.keys(message.gamesList).forEach(key => {gamesListTable.append(adminGameDisplay(message.gamesList[key]));})}
            break;

        case 'adminGamesUpdate' :
            oldItem = document.getElementById('adminGame-' + message.game.key);
            oldItem.parentNode.replaceChild(adminGameDisplay(message.game),oldItem);
            break;

        case 'deleteGame' :
            document.getElementById('adminGame-' + message.id).remove();
            if (document.getElementById('gamesListTile-content').getElementsByTagName('tr').length == 1) document.getElementById('gamesListTile-content').textContent = lang.ADMINTILEemptyList;
            break;
        
        //Admin : envoyer des infos sur connexions/déconnexions sur les parties à la page d'admin
        default:
          webSockError('ws::serverOperationNotFound ' + message.operation,'28');}}


function sendReq(data={}) {
    try {
        websocket.send (data);}
    catch(err) {
          console.log (err);}
    }

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