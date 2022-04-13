let websocket = new WebSocket('ws://' + location.host);

websocket.onopen = function() {
    //Envoi de la clef de partie à l'ouverture de session webSocket.
    if (gameKey !== undefined && gameKey !== '') sendReq('{"gameKey":"'+ gameKey +'"}');
      };

websocket.onclose = function (event) {
    //Connexction perdue
    webSockError('ws::connextionLost ' + event.reason);}

websocket.onmessage = function(event) {
    message=JSON.parse(event.data);
    console.log(message);
    if (message.clientId !== undefined) webSocketId=message.clientId;
    if (message.error !== undefined) webSockError(message.error);
    else if (message.operation !== undefined) switch (message.operation) {
        //Réalisation d'une opération commandée par la serveur
        case 'villainLife':
            if (message.value < 10) message.value= '0' + message.value;
            document.getElementById('villain' + message.id).getElementsByClassName('life')[0].getElementsByClassName('value')[0].textContent = message.value;
            game.villains[message.id].life=message.value;
            break;

        case 'villainStatus':
            statusButton=document.getElementById('villain' + message.id).getElementsByClassName(message.status)[0];
            statusButton.className = message.value == '1' ? message.status : message.status + ' off';
            if (message.status == '0') delete game.villains[message.id][message.status]; else game.villains[message.id][message.status]='1';
            break;

        case 'changePhase':
            document.getElementById('villain' + message.villain).getElementsByClassName('phase')[0].textContent = message.phase;
            game.villains[message.villain].phase=message.phase;
            break;
        
        case 'changeMain' :
            if (message.current < 10) message.current = '0' + message.current;
            if (message.max < 10) message.max = '0' + message.max;
            let willainMain = document.getElementById('villain' + message.villain).getElementsByClassName('mainScheme')[0];
            willainMain.getElementsByClassName('name')[0].textContent = mainSchemes[message.main].name;
            willainMain.getElementsByClassName('threat')[0].getElementsByClassName('value')[0].textContent = message.current;
            willainMain.getElementsByClassName('acceleration')[0].getElementsByClassName('value')[0].textContent = message.acceleration;
            willainMain.getElementsByClassName('max')[0].getElementsByClassName('value')[0].textContent = message.max;
            game.villains[message.villain].mainScheme={"id":message.main,"current":message.current,"max":message.max,"acceleration":message.acceleration};
            break;

        case 'changeVillain' :
            document.getElementById('villain' + message.villain).getElementsByClassName('picture')[0].style.backgroundImage = "url('./images/villains/" + message.id + ".png')";
            document.getElementById('villain' + message.villain).getElementsByClassName('name')[0].textContent = villains[message.id].name;
            game.villains[message.villain].id=message.id;
            game.villains[message.villain].sideSchemes=[];
            Array.from(document.getElementById('villain' + message.villain).getElementsByClassName('sideScheme')).forEach(element => {element.remove();})
            break;

        case 'mainThreat' :
            if (message.value < 10) message.value = '0' + message.value;
            document.getElementById('villain' + message.id).getElementsByClassName('mainScheme')[0].getElementsByClassName('threat')[0].getElementsByClassName('value')[0].textContent = message.value;
            game.villains[message.id].mainScheme.current = message.value;
            if (game.villains[message.id].mainScheme.current >= game.villains[message.id].mainScheme.max) document.getElementById('villain' + message.id).getElementsByClassName('mainScheme')[0].style.backgroundColor =  'crimson';
            break;

        case 'mainThreatAccel' :
            if (message.value < 10) message.value = '0' + message.value;
            document.getElementById('villain' + message.id).getElementsByClassName('mainScheme')[0].getElementsByClassName('acceleration')[0].getElementsByClassName('value')[0].textContent = message.value;
            game.villains[message.id].mainScheme.acceleration = message.value;
            break;

        case 'mainThreatMax' :
            if (message.value < 10) message.value = '0' + message.value;
            document.getElementById('villain' + message.id).getElementsByClassName('mainScheme')[0].getElementsByClassName('max')[0].getElementsByClassName('value')[0].textContent = message.value;
            game.villains[message.id].mainScheme.max = message.value;
            if (game.villains[message.id].mainScheme.current >= game.villains[message.id].mainScheme.max) document.getElementById('villain' + message.id).getElementsByClassName('mainScheme')[0].style.backgroundColor =  'crimson';
            break;                
        
        default:
          webSockError('ws::serverOperationNotFound ' + message.operation);}}


function sendReq(data={}) {
    try {
        websocket.send (data);}
    catch(err) {
          console.log (err);}
    }

function webSockError(errorText) {
    //Affichage d'une erreur reçue du serveur
    if (document.getElementById('websocketError')) document.getElementById('websocketError').remove();
    let websocketError=document.createElement('div');
    websocketError.id='websocketError';
    let errorCode = (/(ws*::\w*)/).exec(errorText)[1];
    let errorDetail = (/\s(.*)/).exec(errorText)[1]
    errorText = (lang[errorCode] != undefined ? lang[errorCode] : errorCode) + (errorDetail != '' ? " '" + errorDetail + "'" : '');
    if (lang[errorText] !== undefined) errorText = lang[errorText];
    websocketError.textContent=errorText;
    websocketErrorClose=addElement('button','close');
    websocketErrorClose.title=lang.BUTTONclose;
    websocketErrorClose.onclick=function () {document.getElementById('websocketError').remove();}
    websocketError.append(websocketErrorClose);
    document.getElementsByTagName('body')[0].append(websocketError);}