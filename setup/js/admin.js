function adminLoad(passHash) {
    //Chargement des éléments de la page Admin
    sendReq('{"admin":"getList","passHash":"' + passHash + '"}');
    document.getElementById('tiles').append(adminTile('gamesListTile','ADMINTILEgamesListTitle','',lang.ADMINTILEgamesListIntro))
}

function adminTile(tileId,tileTitle,tileContent='',tileIntro='',tileOutro='') {
    let tile = addElement('div','adminTile',tileId);
    let background = addElement('div','background');
    tile.append(background);
    let tileTit = addElement('div','title');
    tileTit.textContent = lang[tileTitle];
    background.append(tileTit);
    let tileInside = addElement('div','inside');
    background.append(tileInside);
    intro = addElement('p','intro',tileId + '-intro');
    intro.textContent = tileIntro;
    tileInside.append(intro);
    content = addElement('div','content',tileId + '-content')
    content.textContent = tileContent;
    tileInside.append(content);
    outro = addElement('p','outro',tileId + '-outro');
    outro.textContent = tileOutro;
    tileInside.append(outro);
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
        gameVillains.append(villain);
    });
    if (game.villains.length == 0) gameVillains.textContent = lang.noItem;
    gameTr.append(gameVillains);
    //Joueurs de la partie
    let gamePlayers = addElement('td','villains','players-' + game.key);
    game.players.forEach(element => {
        let player = addElement('div','player');
        player.innerHTML = '<img src="./images/heros/' + element.hero + '.png" alt = "' + heros[element.hero].name + '">' + element.name;
        gamePlayers.append(player);
    });
    if (game.players.length == 0) gamePlayers.textContent = lang.noItem;
    gameTr.append(gamePlayers);
    //Joueurs connectés
    let connected = addElement('td','webSockets');
    let connectedButton = addElement('button','webSocketMessage')
    connected.append(connectedButton);
    connectedNumber = game.wsClients !== undefined ? Object.keys(game.wsClients).length : lang.noItem;
    connectedButton.textContent = connectedNumber == 0 ? lang.noItem : connectedNumber;
    connectedButton.onclick = connectedNumber == 0 ? undefined : function () {adminMessage(game.key);}
    connectedButton.title = lang.BUTTONAdminMessage;
    gameTr.append(connected);
    //Actions sur la partie (suppressiuon sauvegarde message)
    let gameActions = addElement('td','actions');
    gameActions.append(buttonDisplay('delete','{"admin":"deleteGame","id":"' + game.key + '"}',lang.BUTTONdelete));
    gameActions.append(buttonDisplay('save','{"admin":"saveGame","id":"' + game.key + '"}',lang.BUTTONsave));
    gameTr.append(gameActions);




    return (gameTr);



}

function adminMessage (gameKey) {
    //Popup d'envoi d'un message aux joueurs connectés sur la partie
    let intro = lang.POPUPadminMessageIntro;
    let adminMessageButtons='<button title="' + lang.BUTTONconfirm + '">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let messageForm = '';

    popupDisplay(lang.BUTTONAdminMessage,intro,messageForm,adminMessageButtons,'','50%');

}