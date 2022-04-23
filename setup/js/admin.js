function adminLoad(passHash) {
    sessionStorage.setItem('rChampions-adminHash',passHash);
    //Chargement des éléments de la page Admin
    sendReq('{"admin":"getList","passHash":"' + sessionStorage.getItem('rChampions-adminHash') + '"}');
    
    document.getElementById('tiles').append(
        adminTile('adminMessages','ADMINTileMessagesTitle','<table><tr><td>' + lang.ADMINTileMessageCUsers + '</td><td><button class="total" title="' + lang.BUTTONAdminMessage + '" onclick = "adminMessagePopup (\'\', true )"></button></td></tr><tr><td>' + lang.ADMINTileMessageCAdmins + '</td><td><button class="admins" title="' + lang.BUTTONAdminMessage + '" onclick = "adminMessagePopup (\'\', false, true )"></button></td></tr></table>',lang.ADMINTileMessagesIntro,lang.ADMINTileMessageOutro),
        adminTile('gamesListTile','ADMINTILEgamesListTitle','',lang.ADMINTILEgamesListIntro)
        )
}

function adminTile(tileId,tileTitle,tileContent='',tileIntro='',tileOutro='') {
    let tile = addElement('div','adminTile',tileId);
    let background = addElement('div','background');
    tile.append(background);
    let tileTit = addElement('div','title');
    tileTit.textContent = lang[tileTitle];
    tileTit.onclick = function () {
        let tileCont =  document.getElementById(tileId).getElementsByClassName('inside')[0];
        tileCont.style.display = tileCont.style.display == 'none' ? 'block' : 'none'; }
    background.append(tileTit);
    let tileInside = addElement('div','inside');
    background.append(tileInside);
    intro = addElement('p','intro',tileId + '-intro');
    intro.textContent = tileIntro;
    tileInside.append(intro);
    content = addElement('div','content',tileId + '-content')
    content.innerHTML = tileContent;
    tileInside.append(content);
    if (tileOutro != '') {
        outro = addElement('p','outro',tileId + '-outro');
        outro.textContent = tileOutro;
        tileInside.append(outro);}
    return (tile);}

function adminGameDisplay(game) {
    let gameTr = addElement('tr','adminGameDisplay','adminGame-'+game.key);
    //Référence de la partie
    let gameKey = addElement('td','gameKey');
    let gameKeyButton = addElement('button','gameKey');
    gameKey.append(gameKeyButton);
    gameKeyButton.textContent = game.key;
    gameKeyButton.onclick = function () {
        localStorage.setItem('rChampions-gameKey',game.key);
        window.location.href = "game.html";}
    gameTr.append(gameKey);
    //Date de création de la partie
    let gameDate = addElement('td','date');
    gameDate.textContent = (new Date(parseInt(game.date))).toLocaleString();
    gameTr.append(gameDate);
    //Méchants de la partie
    let gameVillains = addElement('td','villains','villains-' + game.key);
    game.villains.forEach(element => {
        let villain = addElement('div','villain');
        villain.innerHTML = '<img src="./images/villains/' + element.id + '.png" alt = "' + villains[element.id].name + '">' + villains[element.id].name;
        gameVillains.append(villain);});
    if (game.villains.length == 0) gameVillains.textContent = lang.noItem;
    gameTr.append(gameVillains);
    //Joueurs de la partie
    let gamePlayers = addElement('td','players','players-' + game.key);
    game.players.forEach((element,index) => {
        let player = addElement('div','player');
        player.innerHTML = '<img src="./images/heros/' + element.hero + '.png" alt = "' + heros[element.hero].name + '">';
        let playerButton = addElement('button','playerName');
        playerButton.textContent = element.name;
        playerButton.title = lang.BUTTONplayerName;
        playerButton.onclick = function () {adminPlayerNamePopup(game.key,index,element.name);}
        player.append(playerButton);
        gamePlayers.append(player);});
    if (game.players.length == 0) gamePlayers.textContent = lang.noItem;
    gameTr.append(gamePlayers);
    //Joueurs connectés
    let connected = addElement('td','webSockets');
    let connectedButton = addElement('button','webSocketMessage')
    connected.append(connectedButton);
    connectedNumber = game.wsClients !== undefined ? Object.keys(game.wsClients).length : lang.noItem;
    connectedButton.textContent = connectedNumber == 0 ? lang.noItem : connectedNumber;
    connectedButton.onclick = connectedNumber == 0 || connectedNumber == lang.noItem ? undefined : function () {adminMessagePopup(game.key);}
    connectedButton.title = lang.BUTTONAdminMessage;
    gameTr.append(connected);
    //Actions sur la partie
    let gameActions = addElement('td','actions');
    let deleteButton = buttonDisplay('delete','',lang.BUTTONdelete);
    deleteButton.onclick = function () {
        //Fenêtre de confirmation de la suppression de la partie
        document.getElementById('adminGame-' + game.key).className +=' selected';
        let deleteConfirmButtons='<button title="' + lang.BUTTONconfirm + '" id ="deleteConfirm">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';document.getElementById(\'adminGame-' + game.key + '\').className =\'adminGameDisplay\';">' + lang.BUTTONcancel + '</button>';
        popupDisplay(lang.BUTTONdelete,'',lang.POPUPAdminConfirmDelete,deleteConfirmButtons,lang.POPUPAdminConfirmDeleteOutro,'20%');
        document.getElementById('deleteConfirm').onclick = function () {
            document.getElementById('popup').style.display='none';
            document.getElementById('adminGame-' + game.key).className ='adminGameDisplay';
            sendReq('{"admin":"deleteGame","id":"' + game.key + '","passHash":"' + sessionStorage.getItem('rChampions-adminHash') + '"}');}
        document.getElementById('popup').getElementsByClassName('close')[0].onclick = function() {
            document.getElementById('popup').style.display='none';
            document.getElementById('adminGame-' + game.key).className ='adminGameDisplay';
            document.getElementById('popup').getElementsByClassName('close')[0].onclick = function () {document.getElementById('popup').style.display='none';}}}
    gameActions.append(deleteButton);
    let saveButton = buttonDisplay('save','',lang.BUTTONsave);
    saveButton.onclick=function () {
        saveLink = document.createElement('a');
        saveLink.href = 'games/' + game.key + '.json';
        saveLink.download = game.key + '.json';
        saveLink.click();
        saveLink.remove();}
    gameActions.append(saveButton);
    gameTr.append(gameActions);
    return (gameTr);}

function adminMessagePopup (gameKey='', all=false, admins=false) {
    //Popup d'envoi d'un message aux joueurs connectés (sur la partie, au serveur ou en admin)
    let intro = lang.POPUPAdminMessageGameIntro;
    let adminMessageButtons='<button title="' + lang.BUTTONsendMessage + '" id ="adminMessageConfirm" style = "display:none;">' + lang.BUTTONsendMessage + '</button><button title="' + lang.BUTTONtest + '" id ="adminMessageTest">' + lang.BUTTONtest + '</button><button title="' + lang.BUTTONcancel + '" id ="adminMessageCancel">' + lang.BUTTONcancel + '</button>';
    let messageForm = '<textarea type="text" id="adminMessage"></textarea>';
    popupDisplay(lang.BUTTONAdminMessage,intro,messageForm,adminMessageButtons,lang.POPUPAdminMessageOutro,'14em');
    document.getElementById('adminMessageCancel').onclick = function() { document.getElementById('popup').style.display='none'; }
    if (gameKey != '') {
        //(Dé)sélection de la ligne de la partie concernée
        document.getElementById('adminGame-' + gameKey).className +=' selected';
        document.getElementById('popup').getElementsByClassName('close')[0].onclick = function() {
            document.getElementById('popup').style.display='none';
            document.getElementById('adminGame-' + gameKey).className ='adminGameDisplay';
            document.getElementById('popup').getElementsByClassName('close')[0].onclick = function () {document.getElementById('popup').style.display='none';}}
        document.getElementById('adminMessageCancel').onclick = function() {
            document.getElementById('popup').style.display='none';
            document.getElementById('adminGame-' + gameKey).className ='adminGameDisplay';}
        document.getElementById('adminMessageConfirm').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","game":gameKey,"message":document.getElementById('adminMessage').value,"passHash":sessionStorage.getItem('rChampions-adminHash')}));
            document.getElementById('popup').style.display='none';
            document.getElementById('adminGame-' + gameKey).className ='adminGameDisplay';}
        document.getElementById('adminMessageTest').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","test":1,"game":gameKey,"message":document.getElementById('adminMessage').value,"passHash":sessionStorage.getItem('rChampions-adminHash')}));
            document.getElementById('adminMessageConfirm').style.display = 'block';}}
    else if (all) {
        //envoi d'un message à tous les connectés
        document.getElementById('adminMessageConfirm').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","all":true,"message":document.getElementById('adminMessage').value,"passHash":sessionStorage.getItem('rChampions-adminHash')}));
            document.getElementById('popup').style.display='none';}
        document.getElementById('adminMessageTest').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","test":1,"all":true,"message":document.getElementById('adminMessage').value,"passHash":sessionStorage.getItem('rChampions-adminHash')}));
            document.getElementById('adminMessageConfirm').style.display = 'block';}}
    else if (admins) {
        //envoi d'un message aux administrateurs
        document.getElementById('adminMessageConfirm').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","admins":true,"message":document.getElementById('adminMessage').value,"passHash":sessionStorage.getItem('rChampions-adminHash')}));
            document.getElementById('popup').style.display='none';}
        document.getElementById('adminMessageTest').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","test":1,"admins":true,"message":document.getElementById('adminMessage').value,"passHash":sessionStorage.getItem('rChampions-adminHash')}));
            document.getElementById('adminMessageConfirm').style.display = 'block';}}        
    textFocus('adminMessage');}

function adminPlayerNamePopup(gameKey,player,oldName) {
    let PNbuttons='<button title="' + lang.BUTTONconfirm + '" onclick = "adminPlayerNameSend(\'' + gameKey + '\',\'' + player + '\');" id="adminPlayerNameSubmit">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let PNintro = lang.PLchangePlayerNameIntro1 + oldName + lang.PLchangePlayerNameIntro2
    let PNcontent = '<input type = "text" value = "' + oldName + '" id = "newPlayerName">';
    popupDisplay(lang.BUTTONplayerName,PNintro,PNcontent,PNbuttons,'');
    textFocus('newPlayerName','adminPlayerNameSubmit');}
function adminPlayerNameSend(gameKey,player) {
    sendReq('{"admin":"playerName","game":"' + gameKey + '","player":"' + player + '","newName":"' + document.getElementById('newPlayerName').value + '","passHash":"' + sessionStorage.getItem('rChampions-adminHash') + '"}');
    document.getElementById('popup').style.display='none';}