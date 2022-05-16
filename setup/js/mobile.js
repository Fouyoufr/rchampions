let loaded={"config":false,"lang":false,"boxes":false,"page":false}, rcConfig={}, lang={}, game={}, boxes={}, villains={}, mainSchemes={}, heros={}, decks={}, sideSchemes={}, schemeTexts={}, webSocketId='', serverBoot;
let touchstartX = 0, touchstartY = touchendX = touchendY = 0;
const refreshToday = Math.round((new Date()).getTime()/86400000),
urlParams = new URLSearchParams(location.search);
document.getElementById('loading').innerHTML='<svg version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"/></path><path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite" /></path><path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5L82,35.7z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite" /></path></svg>';
function load(fileLoad,functionLoad) {
    // Chargement de fichier distant (AJAX)
  let request = new XMLHttpRequest();
  request.open('GET', fileLoad);
  request.onreadystatechange = function() {
      if (request.readyState ===4) functionLoad(request.responseText)}
  request.send();}
//Chargement de la config, depuis site distant si config locale absente ou datant de plus d'un jour
if (localStorage.getItem('rChampionsConfig') === null) load('./config.json',configLoad); else configLoad(localStorage.getItem('rChampionsConfig'));
//Gestion de la configration locale du site.
function configLoad(configJson) {
    rcConfig=JSON.parse(configJson);
    if (localStorage.rChampionsConfig !== undefined) {
        let oldConfig = JSON.parse(localStorage.rChampionsConfig);
        rcConfig.skin = oldConfig.skin;
        rcConfig.lang = oldConfig.lang;
        rcConfig.adminPassword = oldConfig.adminPassword;}
    if (rcConfig.skin === undefined) rcConfig.skin = rcConfig.defaultSkin;
    if (rcConfig.lang === undefined) rcConfig.lang = rcConfig.defaultLang;
    document.getElementsByTagName('html')[0].lang = rcConfig.lang;
    //(re)stockage de la configuration en local.
    rcConfig.refreshDate=refreshToday;
    localStorage.setItem('rChampionsConfig',JSON.stringify(rcConfig));
    //Mise en place des chaines de caractères "lang".
    if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) load('./lang/' + rcConfig.lang + '/strings.json',langLoad); else langLoad(localStorage.getItem('rChampionsLangStrings'));}

function langLoad(langJson) {
    //Mise en place des chaines de caractère de la langue sur la page.
    lang=JSON.parse(langJson);
    document.title = lang.TITgame;
    if (rcConfig.siteName !== undefined && rcConfig.siteName != '') document.title += ' - ' + rcConfig.siteName;
    if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) localStorage.setItem('rChampionsLangStrings',JSON.stringify(lang));
    //Récupération du contenu des boites
    if (localStorage.getItem('rChampionsBoxes') === null || rcConfig.refreshDate !== refreshToday) load('./lang/' + rcConfig.lang + '/boxes.json',boxesLoad); else boxesLoad(localStorage.getItem('rChampionsBoxes'));}

function boxesLoad(boxesJson) {
    //Mise en place des tableaux de contenu.
    boxesFile=JSON.parse(boxesJson);
    villains=boxesFile.villains;
    heros=boxesFile.heros;
    //Sauvegarde du contenu en local
    saveBoxes='{"boxes":' + JSON.stringify(boxesFile.boxes) +',"villains":' + JSON.stringify(villains) + ', "mainSchemes":' + JSON.stringify(boxesFile.mainSchemes) + ', "heros":' + JSON.stringify(heros) + ', "decks":' + JSON.stringify(boxesFile.decks) + ', "sideSchemes":' + JSON.stringify(boxesFile.sideSchemes) + ', "schemeTexts":' + JSON.stringify(boxesFile.schemeTexts) + '}';
    if (localStorage.getItem('rChampionsBoxes') === null || rcConfig.refreshDate !== refreshToday) localStorage.setItem('rChampionsBoxes',saveBoxes);

    //Début de construction de la page sur périphérique mobile
    pageName = 'mobile';
    document.addEventListener('fullscreenchange',fullScreenDiv,false);
    window.addEventListener("orientationchange", landScapeDiv, false);
    fullScreenDiv();
    landScapeDiv();

    let line1 = document.getElementById('line1'),
    line2 = document.getElementById('line2'),
    line3 = document.getElementById('line3'),
    line4 = document.getElementById('line4');
    if (sessionStorage.getItem('rChampions-gameKey')) selectScreen();
    else {
        //La clef de partie n'a pas été saisie
        line2.innerHTML = lang.MOBjoinIntro0;
        let input = line1.getElementsByTagName('input')[0];
        line1.onclick = function () {
            line1.onclick = undefined;
            input = line1.getElementsByTagName('input')[0];
            input.disabled = false;
            line2.innerHTML = lang.MOBjoinIntro1;
            let goButton = document.createElement('button');
            goButton.textContent = lang.MOBjoinIntroButton;
            goButton.title = lang.MOBjoinIntroButton;
            goButton.onclick = function () {
                //Vérification (locale puis distante) de la clef saisie
                line3.className = '';
                line3.innerHTML = '';
                newKey = input.value.toUpperCase();
                input.value = newKey;
                if (newKey.length != 8) {
                    line3.innerHTML = lang.indexNewKeyLength;
                    line3.className = 'error';}
                else sendReq('{"operation":"join","key":"' + newKey + '"}');}
            line1.append(goButton);
            input.focus();}}

    
    
    
    //Gestion du tactile
    document.body.addEventListener('touchstart', function(event) { touchstartX = event.changedTouches[0].screenX; touchstartY = event.changedTouches[0].screenY;}, false);
    document.body.addEventListener('touchend', function(event) {touchendX = event.changedTouches[0].screenX; touchendY = event.changedTouches[0].screenY; handleGesture();}, false); 
    loaded.page = true;}

function selectScreen() {
    //La clef a été saisie et vérifiée, choisir quoi afficher de la partie
    let gameKey = sessionStorage.getItem('rChampions-gameKey');
    let input = line1.getElementsByTagName('input')[0];
    input.value = gameKey;

}

function fullScreen() {
    document.documentElement.requestFullscreen();
    if ('wakeLock' in navigator) {
        //Verouiller l'écran pour éviter la veille
        navigator.wakeLock.request('screen')
            .then((wakeLock) => {
              wakeLockObj=wakeLock;
              wakeLockObj.addEventListener('relase',()=>{
                //Quitter le pein écran si écran actif perdu
                fullScreenDiv;
                wakeLockObj=null;})})}
            }
function fullScreenDiv() {
    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement && !document.fullscreenElement) {
    fsDiv = document.createElement('div');
    fsDiv.onclick = function () {fullScreen();this.remove();}
    fsDiv.innerHTML = '<p>' + lang.MOBfullScreen + '</p>';
    fsDiv.id = 'fullScreen';
    document.body.appendChild(fsDiv);}}
function landScapeDiv() {
    if (window.orientation == 0) {
        lsDiv = document.createElement('div');
        lsDiv.onclick = function () {fullScreen();this.remove();}
        lsDiv.innerHTML = '<p>' + lang.MOBlandscape + '</p>';
        lsDiv.id = 'landScape';
        document.body.appendChild(lsDiv);}
    else if (document.getElementById('landScape')) document.getElementById('landScape').remove();
    }

function handleGesture() {
    //Gestion des mouvements tactiles
    let swiped = 'witness, touchstartX = ' + touchstartX + ', touchstartY = ' + touchstartY + ', touchendX = ' + touchendX + ', touchendY = ' + touchendY + '; event : ';
    return;
    if (touchendX < touchstartX) {
        console.log(swiped + 'left! ');
    }
    if (touchendX > touchstartX) {
        console.log(swiped + 'right!');
    }
    if (touchendY < touchstartY) {
        console.log(swiped + 'down!');
    }
    if (touchendY > touchstartY) {
        console.log(swiped + 'left!');
    }
    if (touchendY == touchstartY) {
        console.log(swiped + 'tap!');
    }
}