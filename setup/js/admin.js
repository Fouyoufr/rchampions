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
    let gameKey = addElement('td','gameKey');
    gameKey.textContent = game.key;
    gameTr.append(gameKey);
    let gameDate = addElement('td','date');
    date = new Date(game.date);
    console.log(date);
    gameDate.textContent = date.toDateString;
    gameTr.append(gameDate);




    return (gameTr);



}