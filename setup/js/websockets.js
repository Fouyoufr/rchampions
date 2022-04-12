let websocket = new WebSocket('ws://' + location.host);

websocket.onopen = function() {
    //Envoi de la clef de partie à l'ouverture de session webSocket.
    if (gameKey !== undefined && gameKey !== '') sendReq('{"gameKey":"'+ gameKey +'"}');
      };

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
            if(message.life < 10) message.life = '0' + message.life;
            game.villains[message.villain].life=message.life;
            document.getElementById('villain' + message.villain).getElementsByClassName('life')[0].getElementsByClassName('value')[0].textContent = message.life;
            break;
        default:
          webSockError('ws::operationNotFound ' + message.operation);}}


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
    websocketError.textContent=errorText;
    websocketErrorClose=addElement('button','close');
    websocketErrorClose.title=lang.BUTTONclose;
    websocketErrorClose.onclick=function () {document.getElementById('websocketError').remove();}
    websocketError.append(websocketErrorClose);
    document.getElementsByTagName('body')[0].append(websocketError);}