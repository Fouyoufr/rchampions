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

function adminSecu() {
    //Options possible : 'off' (http uniquement),'test' (permet http + https), 'self' (autosigné), 'auto' (lestencrypt)
    adminSecuTile = '<div id="adminTILEserverSecu"><div>' + lang.ADMINSecuCert + ' : <button id="adminNetCert"></button></div>';
    adminSecuTile += '<table><tr id="tr1"><td>' + lang.ADMINSecuPass + '</td><td><input type="password" id="adminPass1"></input><p class="greenCheck" id="adminPassOK"></p></td></tr><tr id="tr2"><td></td><td><input type="password" id="adminPass2"></input><button title="' + lang.ADMINSecuPassBtnTitle + '" onclick="adminChangePass(\'adminPass\');">' + lang.ADMINSecuPassBtn + '</button></td></tr><tr class="spacer"><td></td><td></td></tr>';
    adminSecuTile += '<tr id="tr3"><td><input type="checkbox" id="publicSlider" class="slider" onclick="adminPublicSwitch(this.checked);">' + lang.ADMINSecuPubMode + '<p class="greenCheck" id="adminPublicOK"></p></td><td><input type="password" id="publicPass1"></input><p class="greenCheck" id="publicPassOK"></p></td></tr><tr id="tr4"><td></td><td><input type="password" id="publicPass2"></input><button title="' + lang.ADMINSecuPassBtnTitle + '" onclick="adminChangePass(\'publicPass\');">' + lang.ADMINSecuPassBtn + '</button></td></tr></table><div class="error"></div>';
    adminSecuTile += '<div><input type="checkbox" id="debugSlider" class="slider" onclick="adminDebugSwitch(this.checked);">' + lang.ADMINSecuDebug + '<p class="greenCheck" id="adminDebugOK"></p></div></div>';
    adminSecuTile += '<div id="adminTILEserverConsole"></div><button id="adminTILEconsoleDownload" onclick="sendReq(\'{&quot;admin&quot;:&quot;consoleSave&quot;,&quot;passHash&quot;:&quot;\' + adminHash + \'&quot;}\');" title="' + lang.ADMINTILEconsoleLoad + '"></button>';
    return adminSecuTile;}
function adminSave() {
    //Sauvegarde et restauration des parties et/ou de la configuration !
    adminSaveTile = '<p><button title="' + lang.ADMINTilesaveButton1Title + '" onclick="adminSaveAll();">' + lang.ADMINTilesaveButton1 + '</button></p>';
    adminSaveTile += '<p id="adminrestoreLine"></p>';
    return adminSaveTile;}
function adminSaveAll() {
    //Requète de sauvegarde complète du serveur
    sendReq('{"admin":"saveAll","passHash":"' + adminHash + '"}');}
function adminRestore() {
    let reader = new FileReader();
    reader.readAsText(document.getElementById('adminSave-btn').files[0]);
    reader.onload = function() {
        sendReq('{"admin":"restore","data":"' + btoa(reader.result) + '","passHash":"' + adminHash + '"}');
      };
}

function adminPublicSwitch(publicMode) {
    //Modification du mode public sur le serveur
    sendReq('{"admin":"publicMode","publicMode":"' + publicMode + '","passHash":"' + adminHash + '"}');
    greenCheck('adminPublicOK');}
function adminDebugSwitch(debugMode) {
    //Modification du mode verbeux de la console
    sendReq('{"admin":"debugMode","debugMode":"' + debugMode + '","passHash":"' + adminHash + '"}');
    greenCheck('adminDebugOK');}
function adminChangePass(wichPass) {
    //Changement de mot de passe
    error = '';
    if (document.getElementById(wichPass + '1').value != document.getElementById(wichPass + '2').value) error=lang.ADMINSecuDiffPass + '.';
    else if (document.getElementById(wichPass + '1').value.length < 8) error=lang.ADMINSecuPass8char + '.';
    if (error !== '') document.getElementById('adminTILEserverSecu').getElementsByClassName('error')[0].textContent = error;
    else {
        document.getElementById('adminTILEserverSecu').getElementsByClassName('error')[0].textContent = '';
        hash(document.getElementById(wichPass + '1').value).then (function(hashedValue) {
            sendReq('{"admin":"changePass","password":"' + wichPass + '","value":"' + hashedValue + '","passHash":"' + adminHash + '"}');});
        greenCheck(wichPass + 'OK');}}

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
    connectedNumber = game.wsClients !== undefined ? game.wsClients : lang.noItem;
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
            sendReq('{"admin":"deleteGame","id":"' + game.key + '","passHash":"' + adminHash + '"}');}
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
            sendReq(JSON.stringify({"admin":"sendMessage","game":gameKey,"message":document.getElementById('adminMessage').value,"passHash":adminHash}));
            document.getElementById('popup').style.display='none';
            document.getElementById('adminGame-' + gameKey).className ='adminGameDisplay';}
        document.getElementById('adminMessageTest').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","test":1,"game":gameKey,"message":document.getElementById('adminMessage').value,"passHash":adminHash}));
            document.getElementById('adminMessageConfirm').style.display = 'block';}}
    else if (all) {
        //envoi d'un message à tous les connectés
        document.getElementById('adminMessageConfirm').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","all":true,"message":document.getElementById('adminMessage').value,"passHash":adminHash}));
            document.getElementById('popup').style.display='none';}
        document.getElementById('adminMessageTest').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","test":1,"all":true,"message":document.getElementById('adminMessage').value,"passHash":adminHash}));
            document.getElementById('adminMessageConfirm').style.display = 'block';}}
    else if (admins) {
        //envoi d'un message aux administrateurs
        document.getElementById('adminMessageConfirm').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","admins":true,"message":document.getElementById('adminMessage').value,"passHash":adminHash}));
            document.getElementById('popup').style.display='none';}
        document.getElementById('adminMessageTest').onclick = function() {
            sendReq(JSON.stringify({"admin":"sendMessage","test":1,"admins":true,"message":document.getElementById('adminMessage').value,"passHash":adminHash}));
            document.getElementById('adminMessageConfirm').style.display = 'block';}}        
    textFocus('adminMessage');}

function adminPlayerNamePopup(gameKey,player,oldName) {
    let PNbuttons='<button title="' + lang.BUTTONconfirm + '" onclick = "adminPlayerNameSend(\'' + gameKey + '\',\'' + player + '\');" id="adminPlayerNameSubmit">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let PNintro = lang.PLchangePlayerNameIntro1 + oldName + lang.PLchangePlayerNameIntro2
    let PNcontent = '<input type = "text" value = "' + oldName + '" id = "newPlayerName">';
    popupDisplay(lang.BUTTONplayerName,PNintro,PNcontent,PNbuttons,'');
    textFocus('newPlayerName','adminPlayerNameSubmit');}
function adminPlayerNameSend(gameKey,player) {
    sendReq('{"admin":"playerName","game":"' + gameKey + '","player":"' + player + '","newName":"' + document.getElementById('newPlayerName').value + '","passHash":"' + adminHash + '"}');
    document.getElementById('popup').style.display='none';}
