function loadIndexIntro() {
    websiteName = rcConfig.siteName !== undefined && rcConfig.siteName != '' ? rcConfig.siteName : 'rChampions';
    let websiteIntro = addElement('div','websiteIntro','websiteIntro');
    websiteIntro.innerHTML='<h1>'+ lang.TITindex + '</h1>' + lang.rChampionsIntro0 + websiteName + lang.rChampionsIntro1 + websiteName + lang.rChampionsIntro2 + websiteName + lang.rChampionsIntro3;
    document.getElementsByTagName('body')[0].append(websiteIntro)}

function loadIndexJoin() {
    //Tuile de jonction à une partie existante
    indexTile('joinGame',lang.indexJoinGameTitle,lang.indexJoinGameIntro,lang.indexJoinKey + ' :');
    keyInput = addElement('input','keyInput','joinGameKey');
    keyInput.setAttribute('maxlength','8');
    keyInput.setAttribute('size','8');
    keyButton = addElement('button','keySubmit','joinGameKeySubmit');
    keyButton.textContent = keyButton.title = lang.indexJoinButton;
    document.getElementById('joinGame').getElementsByClassName('content')[0].append(keyInput,keyButton);
    document.getElementById('joinGameKeySubmit').onclick = function() {sendReq('{"operation":"keyJoin","key":"' + document.getElementById('joinGameKey').value + '"}');}
    textFocus('joinGameKey','joinGameKeySubmit');
    if (urlParams.has('g')) {
        document.getElementById('joinGameKey').value = urlParams.get('g').toUpperCase();
        document.getElementById('joinGameKeySubmit').click();}}

function loadIndexNew(change = false) {
    //Tuile de création d'une partie
    indexTile('newGameTile',lang.indexNewGameTitle,lang.indexNewGameIntro,'<div id="newGame"><div id="newGameKeyDiv">' + lang.indexNewKey + ' :</div></div>',change);
    newGameTile=document.getElementById('newGameKeyDiv');
    keyInput = addElement('input','keyInput','newGameKey');
    keyInput.setAttribute('maxlength','8');
    keyInput.setAttribute('size','8');
    keyButton = addElement('button','keySubmit','newGameKeySubmit');
    keyButton.textContent = keyButton.title = lang.indexNewKeyButton;
    newGameTile.append(keyInput,keyButton);
    document.getElementById('newGameKeySubmit').onclick = function() {
        if (document.getElementById('newGameKey').value.length != 8) document.getElementById('newGameTile').getElementsByClassName('outro')[0].textContent = lang.indexNewKeyLength;
        else {
            document.getElementById('newGameTile').getElementsByClassName('outro')[0].textContent = '';
            sendReq('{"operation":"newKey","key":"' + document.getElementById('newGameKey').value + '","passHash":"' + publicHash + '"}');}}}

function loadIndexNewPublic() {
    //tuile de saisie de mot de passe en mode public
    indexTile('newGameTile',lang.indexNewGameTitle,lang.indexNewGamePassIntro,'<div id="newGamePass"><div id="newGamePassDiv"><input type="hidden" id= "newGameKey">' + lang.indexNewGamePass + ' :</div></div>');
    newGamePassTile=document.getElementById('newGamePassDiv');
    passInput = addElement('input','passInput','newGamePassword');
    passInput.type = 'password';
    passButton = addElement('button','gamePassSubmit','newGamePassSubmit');
    passButton.textContent = passButton.title = lang.BUTTONconfirm;
    newGamePassTile.append(passInput,passButton);
    document.getElementById('newGamePassSubmit').onclick = function() {
        document.getElementById('newGameTile').getElementsByClassName('outro')[0].textContent = '';
        hash(document.getElementById('newGamePassword').value).then(function(hashedPass) {
            sessionStorage.setItem('rChampions-publicHash',hashedPass);
            hash(webSocketSalt + hashedPass).then (function(hashedValue) {
                publicHash = hashedValue;
                sendReq('{"operation":"checkPass","passHash":"' + hashedValue + '"}');})})}}


function loadIndexNew2() {
    //poursuite de la saisie de la nouvelle partie (nombre de méchants)
    document.getElementById('newGameTile').getElementsByClassName('outro')[0].textContent = '';
    document.getElementById('newGameKey').disabled = true;
    document.getElementById('newGameKeySubmit').remove();
    let ngDiv = document.getElementById('newGame');
    let ngTabOut = addElement('div','','newGameTable');
    ngDiv.append(ngTabOut);
    let ngTab = '<p class="ngNB">' + lang.indexNewVillains + '</p>';
    for (let i = 0; i <= 4; i++) {
        ngTab+= '<input type="radio" id="ngVillNB' + i + '" name="ngVillNB" class="ngNB" value ="' + i + '"';
        if (i ==0) ngTab += ' disabled';
        else {
          if (i ==1) ngTab += ' checked';
          ngTab += ' onclick="if (!document.getElementById(\'ngPlayNB1\')) {loadIndexNew3();}"';
        }
        ngTab+= '><label for="ngVillNB' + i + '" class="ngNB">' + i + '</label>';}
    ngTabOut.innerHTML = ngTab;
}

function loadIndexNew3() {
    //poursuite de la saisie de la nouvelle partie (nombre de joueurs)
    let ngTab = document.getElementById('newGameTable');
    let ngTr='<p class="ngNB">' + lang.indexNewPlayers + '</p>'
    for (let i = 0; i <= 4; i++) {
        ngTr += '<input type="radio" id="ngPlayNB' + i + '" name="ngPlayNB" class="ngNB" value ="' + i + '"';
        if (i ==1) ngTr += ' checked';
        ngTr += ' onclick="loadIndexNew4()"><label for="ngPlayNB' + i + '" class="ngNB">' + i + '</label>';}
    ngTab.insertAdjacentHTML('beforeend',ngTr);
    document.getElementById('ngPlayNB1').focus();}

function loadIndexNew4() {
    //Fin de la saisie de le nouvelle partie (decks et boxes)
    let ngTab = document.getElementById('newGameTable');
    let ngNxt = '<p>' + lang.indexNewCreteExpl +'<div id="newGameNoDeck"></div><br/><button id="createGame" onclick ="indexCreateGame();" title="' + lang.indexNewCreateButton + '">' + lang.indexNewCreateButton + '</button></p>'
    ngNxt += '<button id="selectAllDecks" onclick="selectAllDecks();" title="' + lang.indexNewDecksAll + '">' + lang.indexNewDecksAll + ' (' + lang.indexNewSelectAll + ')</button><div id="allDecks"></div>';
    //Création du tableau des boxes/deks pour sélection
    let gameBoxes = [];
    Object.keys(decks).forEach(function(deckId) {
        if (deckId != 0) {
            if (gameBoxes[decks[deckId].box] === undefined) {
                //Ajout de la boite contenant les decks
                gameBoxes[decks[deckId].box] = addElement('div','newGameBox','newGameBox' + decks[deckId].box);
                let newBoxPic = addElement('input');
                newBoxPic.type = 'image';
                newBoxPic.title = boxes[decks[deckId].box];
                newBoxPic.src = 'images/boxes/' + decks[deckId].box + '.png';
                newBoxPic.onclick = function () {boxSelectDecks(this);}
                gameBoxes[decks[deckId].box].append(newBoxPic);
                gameBoxes[decks[deckId].box].append(addElement('div'));}
            let deck = '<input type="checkbox" class= "newGameDeck" id="newGameDeck' + deckId + '" name="newGameDeck' + deckId +'"><label class="newGameDeck" for="newGameDeck' + deckId + '">' + decks[deckId].name + '</label>';
            gameBoxes[decks[deckId].box].getElementsByTagName('div')[0].insertAdjacentHTML('beforeend',deck);}})
    ngTab.insertAdjacentHTML('beforeend',ngNxt);
    Object.keys(gameBoxes).forEach(function(boxKey){document.getElementById('allDecks').append(gameBoxes[boxKey]);})
    document.getElementById('newGameDeck1').onchange = function () {
        selectAllDecksTitle();
    }
    document.getElementById('createGame').focus();}
function boxSelectDecks(boxId) {
    Checked = !boxId.parentNode.querySelector('.newGameDeck').checked;
    toCheck = boxId.parentNode.querySelectorAll('.newGameDeck');
    for(let i=0; i<toCheck.length; i++) { toCheck[i].checked = Checked;} 
    if (boxId.parentNode.id == 'newGameBox1') selectAllDecksTitle();}
function selectAllDecks() {
    Checked = !document.querySelector('.newGameDeck').checked;
    toCheck = document.getElementById('allDecks').querySelectorAll('.newGameDeck');
    for(let i=0; i<toCheck.length; i++) { toCheck[i].checked = Checked; }
    selectAllDecksTitle();}
function selectAllDecksTitle() {
    document.getElementById('selectAllDecks').textContent = lang.indexNewDecksAll + ' (' + (document.getElementById('newGameDeck1').checked ? lang.indexNewUnselectAll : lang.indexNewSelectAll ) + ')';}

function indexCreateGame() {
    //Construction de la liste des decks
    deckList='';
    toCheck = document.getElementById('allDecks').querySelectorAll('input[type=\'checkbox\']');
    for(let i=0; i<toCheck.length; i++) { if (toCheck[i].checked) deckList += ',' + toCheck[i].id.substring(11);}
    if (deckList == '') document.getElementById('newGameNoDeck').textContent = lang.indexNewNoDeck;
    else sendReq('{"operation":"newGame","key":"' + document.getElementById('newGameKey').value + '","villains":"' + document.querySelector('input[name="ngVillNB"]:checked').value + '","players":"' + document.querySelector('input[name="ngPlayNB"]:checked').value + '","decks":[' + deckList.substring(1) + '],"playersName":"' + lang.indexNewPlayer + '","passHash":"' + publicHash + '"}');}

function indexTile (id,title,intro,content,change=false) {
    //construction des tuiles de l'index
    let newTile;
    if (change) {
        newTile = document.getElementById(id);
        newTile.innerHTML = '';}
    else newTile = addElement('div','indexTile',id);
    let newTileTitle = addElement('div','title');
    newTile.append(newTileTitle);
    newTileTitle.innerHTML = title;
    let newTileIntro = addElement('div','intro');
    newTile.append(newTileIntro);
    newTileIntro.innerHTML = intro;
    let newTileContent = addElement('div','content');
    newTile.append(newTileContent);
    newTileContent.innerHTML = content;
    let newTileOutro = addElement('div','outro');
    newTile.append(newTileOutro);
    document.getElementsByTagName('body')[0].append(newTile);}
