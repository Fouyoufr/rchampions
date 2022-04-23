//Déclaration des variables globales
const refreshToday = Math.round((new Date()).getTime()/86400000);
const urlParams = new URLSearchParams(location.search)
if (urlParams.has('g')) {
    //Récupération et stockage en local de la clef de partie
    localStorage.setItem('rChampions-gameKey',urlParams.get('g'));}
let rcConfig={}, lang={}, game={},
boxes={}, villains={}, mainSchemes={}, heros={}, decks={}, sideSchemes={}, schemeTexts={},nullElement={},
loaded={"config":false,"lang":false,"boxes":false},
webSocketId='',webSocketSalt='';
popupDiv=addElement('div','','popup');
adminMessageDiv = addElement('div','','adminMessagePopup');
//Mise en place du favicon et de l'écran de chargement
addHeadLink('icon','image/x-icon','favicon.ico');
metaViewport = document.createElement('meta');
metaViewport.name = 'viewport';
metaViewport.content = 'width=device-width, initial-scale=1';
document.getElementsByTagName('head')[0].append(metaViewport);
if (document.getElementById('loading')) document.getElementById('loading').innerHTML='<svg version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"/></path><path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite" /></path><path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5L82,35.7z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite" /></path></svg>';

//Chargement des scripts externes
loadScript ('websockets');
if (document.getElementById('villains')) loadScript('villains');
if (document.getElementById('villain')) loadScript('villain');
if (document.getElementById('players')) loadScript('players');
if (pageTitle == 'TITadmin') loadScript('admin');
function loadScript(scriptName) {
    loaded[scriptName + 'Script'] = false;
    let script = document.createElement('script');
    script.onload =function () {loaded[scriptName + 'Script'] = true;};
    script.src = './js/' + scriptName + '.js';
    document.getElementsByTagName('head')[0].appendChild(script);
    //Attente que le script soit chargé...
    let intervalScript = setInterval(function() {if (loaded[scriptName + 'Script'] === true) {
        clearInterval(intervalScript);
        }},100);}

//Chargement de la config, depuis site distant si config locale absente ou datant de plus d'un jour
if (localStorage.getItem('rChampionsConfig') === null) {
    console.log('config : remote load.');
    load('./config.json',configLoad);}
else configLoad(localStorage.getItem('rChampionsConfig'));

//Mise en place des chaines de caractères "lang" (si config chargée).
let intervalLang = setInterval(function() {if (loaded.config != false) {
    clearInterval(intervalLang);
    if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) {
        console.log('language strings : remote load.');
        load('./lang/' + rcConfig.lang + '/strings.json',langLoad);}
    else langLoad(localStorage.getItem('rChampionsLangStrings'));
    }},100);

//Récupération du contenu des boites (si langues chargées).
let intervalBox = setInterval(function() {if (loaded.lang != false) {
    clearInterval(intervalBox);
    if (localStorage.getItem('rChampionsBoxes') === null || rcConfig.refreshDate !== refreshToday) {
        console.log('Game boxes : remote load.');
        load('./lang/' + rcConfig.lang + '/boxes.json',boxesLoad);}
    else boxesLoad(localStorage.getItem('rChampionsBoxes'));
    }},100);

if (localStorage.getItem('rChampions-gameKey')) {
    //Récupération des informations de la partie en cours.
    gameKey=localStorage.getItem('rChampions-gameKey');
    load ('./games/' + gameKey + '.json',mainLoad);}
else mainLoad();


function configLoad(configJson) {
    //Gestion de la configration locale du site.
    rcConfig=JSON.parse(configJson);
    if (localStorage.rChampionsConfig !== undefined) {
        let oldConfig = JSON.parse(localStorage.rChampionsConfig);
        rcConfig.skin = oldConfig.skin;
        rcConfig.lang = oldConfig.lang;
        rcConfig.adminPassword = oldConfig.adminPassword;}
    if (rcConfig.skin === undefined) rcConfig.skin = rcConfig.defaultSkin;
    if (rcConfig.lang === undefined) rcConfig.lang = rcConfig.defaultLang;
    document.getElementsByTagName('html')[0].lang = rcConfig.lang;
    loaded.config=true;
    //(re)stockage de la configuration en local.
    rcConfig.refreshDate=refreshToday;
    localStorage.setItem('rChampionsConfig',JSON.stringify(rcConfig));}

function langLoad(langJson) {
    //Mise en place des chaines de caractère de la langue sur la page.
    lang=JSON.parse(langJson);
    if (pageTitle!== null) document.title = lang[pageTitle];
    if (rcConfig.siteName !== undefined && rcConfig.siteName != '') document.title += ' - ' + rcConfig.siteName;
    loaded.lang=true;
    if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) localStorage.setItem('rChampionsLangStrings',JSON.stringify(lang));}

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
    if (localStorage.getItem('rChampionsBoxes') === null || rcConfig.refreshDate !== refreshToday) localStorage.setItem('rChampionsBoxes',saveBoxes);}

function mainLoad(gameJson='') {
    //Chargement principal de la page
    if (gameJson !='') game=JSON.parse(gameJson);
    //Attente d'avoir récupéré les éléments nécessaires avant de construire la page...
      var interval = setInterval(function() {if (loaded.lang == true && loaded.boxes == true){
        clearInterval(interval);
        //Insertion des skins dans l'en-tête
        ['main','playerDisplay','villainDisplay','admin','index'].forEach((cssName) => addHeadLink('stylesheet','text/css; charset=utf-8','./skins/' + rcConfig.skin+ '/' + cssName + '.css'));
        if (document.getElementById('villains')) for (let i=0; i < game.villains.length; i++) document.getElementById('villains').append(villainDisplay(i));
        if (document.getElementById('villain') && localStorage.getItem('rChampions-villain')) document.getElementById('villain').append(villainDisplay(localStorage.getItem('rChampions-villain')));
        if (document.getElementById('players')) for (let i=0; i < game.players.length; i++) document.getElementById('players').append(playerDisplay(i));
        if (pageTitle == 'TITadmin') {
            var adminInterval = setInterval(function() {if (loaded.adminScript == true){
                clearInterval(adminInterval);
                hash(webSocketSalt + sessionStorage.getItem('rChampions-adminPass')).then ((hashedValue) => adminLoad(hashedValue));}
            },100);}
        //Chargement des menus pleine page
        addMenu();
        addPopup();
        document.getElementById('loading').style.display='none';}
          },100);}
    

  function load(fileLoad,functionLoad) {
      // Chargement de fichier distant (AJAX à refaire en webSocket !)
    let request = new XMLHttpRequest();
    request.open('GET', fileLoad);
    request.onreadystatechange = function() {
        if (request.readyState ===4) functionLoad(request.responseText)}
    request.send();}

function addHeadLink(rel,type,href) {
    //Ajout des liens en tête de document (styles et favicon).
    let headLink = addElement('link');
    headLink.rel = rel;
    headLink.type = type;
    headLink.href = href;
    document.head.appendChild(headLink);}

function addMenu() {
    //Affichage de la clef de la partie
    if (pageTitle == 'TITgame') {
        gamekey = addElement('button','','gameKey');
        gamekey.innerHTML=gameKey;
        gamekey.title = lang.BUTTONCopy
        gamekey.onclick = function () {navigator.clipboard.writeText(location.protocol + '//' + location.host + location.pathname + '?g=' + gameKey);}
        document.getElementsByTagName('body')[0].append(gamekey);}
    //Icone de la musique en jeu (MeloDice) et des parmètres
    let melodiceMenu = addElement('button','melodiceMenu');
    melodiceMenu.title=lang.MENUmelodice;
    let settingsMenu = addElement('div','','settings');
    //Ajouter ici : aide(s), Chwazy, bug report, doc, box/decks de la partie
    let settingsButton = addElement('button','open');
    settingsButton.title=lang.MENUsettings;
    settingsButton.onclick = function () { document.getElementById('settingsMenu').style.display = document.getElementById('settingsMenu').style.display == 'flex' ? 'none' : 'flex'; }
    settingsMenu.append(settingsButton);
    //Ajout des actions disponibles dans le menu des paramètres
    let settingsInside = addElement('div','inside','settingsMenu');
    if (pageTitle !== 'TITindex') settingsInside.append(setMenu('home',function () {location.href = "/";}));
    settingsInside.append(setMenu('lang',selecLang));
    let refreshMenu = setMenu('refresh',function () {localStorage.clear();location.href = "/";})
    refreshMenu.style.marginTop = '4px';
    settingsInside.append(refreshMenu);
    //Menu Administration
    if (pageTitle != 'TITadmin') settingsInside.append(setMenu('admin',adminPopup,'adminMenu'));



    settingsMenu.append(settingsInside);
    document.getElementsByTagName('body')[0].append(melodiceMenu,settingsMenu);}
function setMenu (lib, onclick, menuClass='setting') {
    title = lang['MENU' + lib + '_'] !== undefined ? lang['MENU' + lib + '_'] : lang['MENU' + lib];
    let settingsEntry = addElement('button',menuClass);
    settingsEntry.title = title;
    settingsEntry.textContent = lang['MENU' + lib];
    settingsEntry.onclick = onclick;
    return(settingsEntry);}

function addPopup() {
    //Ajout du div pour les popup (masque les intéractions à l'écran et présente une fenêtre générique)
    let popupBack = addElement('div','background');
    let popupTitle = addElement('div','title');
    popupTitle.append(addElement('div','titleIn'));
    let popupClose = addElement('button','close');
    popupClose.title=lang.BUTTONclose;
    popupClose.onclick=function () {document.getElementById('popup').style.display='none';}
    popupTitle.append(popupClose);
    popupBack.append(popupTitle);
    let popupIn = addElement('div','inside');
    popupIn.append(addElement('p','intro'));
    popupIn.append(addElement('div','content'));
    popupIn.append(addElement('div','buttons'));
    popupIn.append(addElement('p','outro'));
    popupBack.append(popupIn);
    popupDiv.append(popupBack);
    //Ajout du div pour les messages administratifs adminMessageDiv
    let adminMessageBack = addElement('div','background');
    let adminMessageTitle = addElement('div','title');
    let adminMessageTitleIn = addElement('div','titleIn');
    adminMessageTitleIn.textContent = lang.POPUPAdminMessageTitle;
    adminMessageTitle.append(adminMessageTitleIn);
    let adminMessageClose = addElement('button','close');
    adminMessageClose.title=lang.BUTTONclose;
    adminMessageClose.onclick=function () {document.getElementById('adminMessagePopup').style.display='none';}
    adminMessageTitle.append(adminMessageClose);
    adminMessageBack.append(adminMessageTitle);
    adminMessageBack.append(addElement('div','inside'));
    adminMessageBack.append(addElement('div','foot'));
    adminMessageDiv.append(adminMessageBack);
    document.getElementsByTagName('body')[0].append(popupDiv,adminMessageDiv);}

function popupDisplay(title,intro,content,buttons,outro='',height='17%') {
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
    document.getElementById('settingsMenu').style.display = 'none';
    let intro=lang.POPUPAdminIntro, content = lang.popupAdminContent + '<br/><input type="password" id = "adminPassword">';
    let buttons='<button title="' + lang.BUTTONconfirm + '" id="adminPopupConfirm">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    popupDisplay(lang.MENUadmin,intro,content,buttons);
    let confirmButton = document.getElementById('adminPopupConfirm');
    confirmButton.onclick = function () {
        hash(document.getElementById('adminPassword').value).then(function(hashedPass) {
            sessionStorage.setItem('rChampions-adminPass',hashedPass);
            hash(webSocketSalt + hashedPass).then ((hashedValue) => sendReq('{"admin":"checkPass","passHash":"' + hashedValue + '"}'))});}
    textFocus('adminPassword','adminPopupConfirm');}

function addElement(aeType,aeClass='',aeId='') {
    //Ajout d'un élément dans le document
    let ae = document.createElement(aeType);
    if (aeClass != '') ae.className = aeClass;
    if (aeId != '') ae.id=aeId;
    return ae;}

function buttonDisplay (bdClass,bdReq,bdTitle,bdText='',bdId=''){
    //Affichage des boutons qui envoient des requètes au serveur
    let bd = addElement('button',bdClass);
    bd.onclick=function () {sendReq(bdReq);}
    bd.title=bdTitle;
    if (bdText !='') bd.textContent = bdText;
    if (bdId != '') bd.id = bdId;
    return bd;}

function valueDisplay (vdVal,id='') {
    let vd = addElement('div','value',id);
    vd.textContent=vdVal;
    return vd;}

function isElem (element) {
    let targetElem=document.getElementById(element);
        if (typeof(targetElem) != 'undefined' && targetElem != null) return targetElem; else return targetElem;}

function valuePlusMinus(vpmClass,vpmValue,vpmId,vpmOperationMinus,vpmOperationPlus) {
    //Construction d'un div avec compteur (vie etc et bouton minus et plus)
    let vpm = addElement('div',vpmClass);
    vpm.append(buttonDisplay('minus','{' + vpmOperationMinus + '}',lang.BUTTONminus,'',vpmId + '-minus'));
    if (vpmValue < 10) vpmValue = '0' + vpmValue;
    vpm.append(valueDisplay(vpmValue,vpmId));
    vpm.append(buttonDisplay('plus','{' + vpmOperationPlus + '}',lang.BUTTONplus,'',vpmId + '-plus'));
    return vpm;}

function hash(string) {
    const utf8 = new TextEncoder().encode(string);
    return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
          return hashHex;});}

function textFocus(elementId,buttonId='') {
    //Placer le focus sur le champ texte et le curseur à la fin
    textInput=document.getElementById(elementId);
    textInput.focus();
    textInput.setSelectionRange(textInput.value.length,textInput.value.length);
    if (buttonId != '') {
        //Déclencher l'appui d'un bouton sur [Entrée]
        textInput.addEventListener('keyup',function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById(buttonId).click();}
        })}}

function selecLang() {
    //Changement de la langue d'affichage
    document.getElementById('settingsMenu').style.display = 'none';
    let content = '<div id="languageSelection"></div>';
    let buttons='<button title="' + lang.BUTTONconfirm + '" id="adminLangConfirm" onclick="selecLangValid(document.getElementById(\'languageSelection\').querySelector(\'input[type=radio]:checked\').value);">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    popupDisplay(lang.MENUlang_,lang.langSelectIntro,content,buttons,lang.langSelectOutro);
    sendReq('{"operation":"langList"}');}
function selecLangValid(lId) {
    document.getElementById('popup').style.display = 'none';
    if (lId != rcConfig.lang) {
        //Changement de la langue d'affichage
        localStorage.removeItem('rChampionsLangStrings');
        localStorage.removeItem('rChampionsBoxes');
        rcConfig.lang = lId;
        //restockage de la configuration en local.
        rcConfig.refreshDate=refreshToday;
        localStorage.setItem('rChampionsConfig',JSON.stringify(rcConfig));
        location.reload();}}

    // Pour travailler sur l'import des anciennes sauvegardes :
    // https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications