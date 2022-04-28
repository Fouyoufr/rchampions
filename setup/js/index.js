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

function loadIndexNew() {
    //Tuile de création d'une partie
    indexTile('newGameTile',lang.indexNewGameTitle,lang.indexNewGameIntro,'<div id="newGame"><div id="newGameKeyDiv"></div></div>');
    newGameTile=document.getElementById('newGameKeyDiv');
    newGameTile.textContent = lang.indexNewKey + ' :';
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
            sendReq('{"operation":"newKey","key":"' + document.getElementById('newGameKey').value + '"}');}}}

function indexTile (id,title,intro,content) {
    //construction des tuiles de l'index
    let newTile = addElement('div','indexTile',id);
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
