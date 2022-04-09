//Déclaration des variables globales
const refreshToday = Math.round((new Date()).getTime()/86400000);
let rcConfig={}, lang={}, game={},
boxes={}, villains={}, mainSchemes={}, heros={}, decks={}, sideSchemes={}, schemeTexts={},
loaded={"config":false,"lang":false,"boxes":false},
popupDiv=document.createElement('div');
//Mise en place du favicon et de l'écran de chargement
addHeadLink('icon','image/x-icon','favicon.ico');
if (document.getElementById('loading')) {
    document.getElementById('loading').innerHTML='<svg version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"/></path><path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite" /></path><path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5L82,35.7z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite" /></path></svg>';}

//Chargement des scripts externes
if (document.getElementById('villains')) loadScript('villains');
if (document.getElementById('players')) loadScript('players');
function loadScript(scriptName) {
    loaded[scriptName + 'Script'] = false;
    let script = document.createElement('script');
    script.onload =function () {loaded[scriptName + 'Script'] = true;};
    script.src = './js/' + scriptName + '.js';
    document.getElementsByTagName('head')[0].appendChild(script);
    //Attente que le script soit chargé...
    let intervalScript = setInterval(function() {if (loaded[scriptName + 'Script'] === true) {
        clearInterval(intervalScript);
        }},100);

}

//Chargement de la config, depuis site distant si config locale absente ou datant de plus d'un jour
if (localStorage.getItem('rChampionsConfig') === null) {
    console.log('config chargée à distance.');
    load('./config.json',configLoad);}
else {configLoad(localStorage.getItem('rChampionsConfig'));}

//Mise en place des chaines de caractères "lang" (si config chargée).
let intervalLang = setInterval(function() {if (loaded.config !== false) {
    clearInterval(intervalLang);
    if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) {
        console.log('langues chargées à distance.');
        load('./lang/' + rcConfig.lang + '/strings.json',langLoad);}
    else {langLoad(localStorage.getItem('rChampionsLangStrings'));}
    }},100);

//Récupération du contenu des boites (si langues chargées).
let intervalBox = setInterval(function() {if (loaded.lang !== false) {
    clearInterval(intervalBox);
    if (localStorage.getItem('rChampionsBoxes') === null || rcConfig.refreshDate !== refreshToday) {
        console.log('Contenu des boites récupéré à distance.');
        load('./lang/' + rcConfig.lang + '/boxes.json',boxesLoad);}
    else {boxesLoad(localStorage.getItem('rChampionsBoxes'));}
    }},100);

if (gameKey !== undefined) {
    //Récupération des informations de la partie en cours.
    load ('./games/' + gameKey + '.json',mainLoad);}


function configLoad(configJson) {
    //Gestion de la configration locale du site.
    rcConfig=JSON.parse(configJson);
    if (rcConfig.skin === undefined) {rcConfig.skin = rcConfig.defaultSkin;}
    if (rcConfig.lang === undefined) {rcConfig.lang = rcConfig.defaultLang;}
    loaded.config=true;
    //(re)stockage de la configuration en local.
    rcConfig.refreshDate=refreshToday;
    localStorage.setItem('rChampionsConfig',JSON.stringify(rcConfig));}

function langLoad(langJson) {
    //Mise en place des chaines de caractère de la langue sur la page.
    lang=JSON.parse(langJson);
    if (pageTitle!== null) document.title = lang[pageTitle];
    loaded.lang=true;
    if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) {localStorage.setItem('rChampionsLangStrings',JSON.stringify(lang));}}

function boxesLoad(boxesJson) {
    //Mise en place des tableaux de contenu.
    boxesFile=JSON.parse(boxesJson);
    boxes=boxesFile.boxes;
    villains=boxesFile.villains;
    mainSchemes=boxesFile.mainSchemes;
    heros=boxesFile.heros;
    decks=boxesFile.decks;
    sideSchemes=boxesFile.sideSchemes;
    schemeTexts=boxesFile.schemeTexts;
    loaded.boxes=true;
    //Sauvegarde du contenu en local
    saveBoxes='{"boxes":' + JSON.stringify(boxes) +',"villains":' + JSON.stringify(villains) + ', "mainSchemes":' + JSON.stringify(mainSchemes) + ', "heros":' + JSON.stringify(heros) + ', "decks":' + JSON.stringify(decks) + ', "sideSchemes":' + JSON.stringify(sideSchemes) + ', "schemeTexts":' + JSON.stringify(schemeTexts) + '}';
    if (localStorage.getItem('rChampionsBoxes') === null || rcConfig.refreshDate !== refreshToday) {localStorage.setItem('rChampionsBoxes',saveBoxes);}}

function mainLoad(gameJson) {
    //Chargement principal de la page de jeu
    game=JSON.parse(gameJson);
    //Attente d'avoir récupéré les éléments nécessaires avant de construire la page...
      var interval = setInterval(function() {if (loaded.lang === true && loaded.boxes === true){
        clearInterval(interval);}
        //Insertion des skins dans l'en-tête
        ['main','playerDisplay','villainDisplay','game',].forEach((cssName) => addHeadLink('stylesheet','text/css; charset=utf-8','./skins/' + rcConfig.skin+ '/' + cssName + '.css'));
        if (document.getElementById('villains')) {
            //Affichage des méchants
            villainsDiv=document.getElementById('villains');
            for (let i=0; i < game.villains.length; i++) {villainsDiv.append(villainDisplay(i));};}

        if (document.getElementById('players')) {
            //masquer les joueurs non utilisés dans la partie et afficher le(s) autre(s)
            for (let i=game.players.length; i < 4; i++) {document.getElementById('player' + (i+1)).style.display='none';};
            for (let i=0; i < game.players.length; i++) {playerDisplay(document.getElementById('player' + (i+1)),game.players[i]);};}

        //Construction des boutons de changement de valeur
        //let minusButtons=document.getElementsByClassName('minus');
        //for(let i = 0; i < minusButtons.length; i++) {
        //    minusButtons[i].title=lang.BUTTONminus;
        //    minusButtons[i].onclick=function () {minusButton(this.parentNode);};}
        //let plusButtons=document.getElementsByClassName('plus');
        //for(let i = 0; i < plusButtons.length; i++) {
        //    plusButtons[i].title=lang.BUTTONplus;
        //    plusButtons[i].onclick=function () {plusButton(this.parentNode);};}
        addMenu();
        addPopup();

        document.getElementById('loading').style.display='none';
  
        },100);
    }
    
//Gestion des modifications des valeurs chiffrées/compteurs.
//function minusButton (mbValue) {
//    if (mbValue.getElementsByClassName('value')[0].textContent > 0) {
//        mbValue.getElementsByClassName('value')[0].textContent--;
//        sendValue(mbValue);}}
//function plusButton (pbValue) {
//    pbValue.getElementsByClassName('value')[0].textContent++;
//    sendValue(pbValue);}
//function sendValue(svDiv) {
//    let stringToSend='';
//    let valueToSend = svDiv.getElementsByClassName('value')[0].textContent;
//    while (svDiv.id === '' || svDiv.id === null) {
//        stringToSend = svDiv.className + ',' + stringToSend;
//        svDiv=svDiv.parentNode;}
//    stringToSend='valueToChange=' + svDiv.id + ',' + stringToSend.slice(0,-1) + '&value=' + valueToSend;}

  function load(fileLoad,functionLoad) {
      // Chargement de fichier distant (AJAX)
    let request = new XMLHttpRequest();
    request.open('GET', fileLoad);
    request.onreadystatechange = function() {
        if (request.readyState ===4) {functionLoad(request.responseText)}}
    request.send();}

function addHeadLink(rel,type,href) {
    //Ajout des liens en tête de document (styles et favicon).
    let headLink = document.createElement('link');
    headLink.rel = rel;
    headLink.type = type;
    headLink.href = href;
    document.head.appendChild(headLink);}

function addMenu() {
    settingsMenu=document.createElement('button');
    settingsMenu.className='settingsMenu';
    settingsMenu.title=lang.MENUsettings;
    document.getElementsByTagName('body')[0].append(settingsMenu);

    melodiceMenu=document.createElement('button');
    melodiceMenu.className='melodiceMenu';
    melodiceMenu.title=lang.MENUmelodice;
    document.getElementsByTagName('body')[0].append(melodiceMenu);

    adminMenu=document.createElement('button');
    adminMenu.className='adminMenu';
    adminMenu.title=lang.MENUadmin;
    adminMenu.onclick=adminPopup;
    document.getElementsByTagName('body')[0].append(adminMenu);

    gamekey=document.createElement('div');
    gamekey.id='gameKey';
    gamekey.innerHTML=gameKey;
    document.getElementsByTagName('body')[0].append(gamekey);
}

function addPopup() {
    //Ajout du div pour les popup (masque les intéractions à l'écran et présente une fenêtre générique)
    popupDiv.id='popup';
    popupBack=document.createElement('div');
    popupBack.className='background';
    popupTitle=document.createElement('div');
    popupTitle.className='title';
    popupTitleIn=document.createElement('div');
    popupTitleIn.className='titleIn';
    popupTitle.append(popupTitleIn);
    popupClose=document.createElement('button');
    popupClose.className='close';
    popupClose.title=lang.BUTTONclose;
    popupClose.onclick=function () {document.getElementById('popup').style.display='none';}
    popupTitle.append(popupClose);
    popupBack.append(popupTitle);
    popupIn=document.createElement('div');
    popupIn.className='inside';
    popupIntro=document.createElement('p');
    popupIntro.className='intro';
    popupIn.append(popupIntro);
    popupContent=document.createElement('div');
    popupContent.className='content';
    popupIn.append(popupContent);
    popupButtons=document.createElement('div');
    popupButtons.className='buttons';
    popupIn.append(popupButtons);
    popupOutro=document.createElement('p');
    popupOutro.className='outro';
    popupIn.append(popupOutro);
    popupBack.append(popupIn);
    popupDiv.append(popupBack);
    document.getElementsByTagName('body')[0].append(popupDiv);}

function popupDisplay(title,intro,content,buttons,outro='',height='15%') {
    //Affichage d'une popup
    popup=document.getElementById('popup');
    popup.style.display='block';
    popup.getElementsByClassName('titleIn')[0].textContent=title;
    popup.getElementsByClassName('intro')[0].innerHTML=intro;
    popup.getElementsByClassName('content')[0].innerHTML=content;
    popup.getElementsByClassName('buttons')[0].innerHTML='';
    popup.getElementsByClassName('buttons')[0].innerHTML=buttons;
    popup.getElementsByClassName('outro')[0].innerHTML=outro;
    popup.getElementsByClassName('background')[0].style.height=height;}

function adminPopup() {
    //Popup de saisie du mot de passe pour accès administratif
    let intro=lang.POPUPAdminIntro, content= lang.popupAdminContent;
    let buttons='<button title="' + lang.BUTTONconfirm + '">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    popupDisplay(lang.MENUadmin,intro,content,buttons);
    let refreshButton=document.createElement('button');
    refreshButton.className='adminRefresh';
    refreshButton.onclick=function () {localStorage.clear();location.reload();}
    refreshButton.title=lang.BUTTONadminRefresh;
    refreshButton.innerHTML='&nbsp;';
    document.getElementById('popup').getElementsByClassName('title')[0].append(refreshButton);
}

function sendReq(strReq) {
    console.log ('Appel modif avec valeur : ' + strReq);
}

function addElement(aeType,aeClass='') {
    //Ajout d'un élément dans le document
    let ae = document.createElement(aeType);
    if (aeClass != '') ae.className = aeClass;
    return ae;
}

function buttonDisplay (bdClass,bdReq,bdTitle,bdText=''){
    //Affichage des boutons Moins et Plus du méchant.
    let bd = addElement('button',bdClass);
    bd.onclick=function () {sendReq(bdReq);}
    bd.title=bdTitle;
    if (bdText !='') bd.textContent = bdText;
    return bd;}

function valueDisplay (vdVal) {
    let vd = addElement('div','value');
    vd.textContent=vdVal;
    return vd;}