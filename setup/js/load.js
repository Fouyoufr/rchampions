//Déclaration des variables globales
const refreshToday = Math.round((new Date()).getTime()/86400000);
let rcConfig={}, lang={}, game={},
boxes={}, villains={}, mainSchemes={}, heros={}, decks={}, sideSchemes={}, schemeTexts={},
loaded={"config":false,"lang":false,"boxes":false};
//Mise en place du favicon et de l'écran de chargement
addHeadLink('icon','image/x-icon','favicon.ico');
if (document.getElementById('loading')) {
    document.getElementById('loading').innerHTML='<svg version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"/></path><path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite" /></path><path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5L82,35.7z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite" /></path></svg>'
}


//Chargement de la config, depuis site distant si config locale absente ou datant de plus d'un jour
if (localStorage.getItem('rChampionsConfig') === null) {
    console.log('config chargée à distance.');
    load('./config.json',configLoad);}
else {configLoad(localStorage.getItem('rChampionsConfig'));}

//Mise en place des chaines de caractères "lang"
let intervalLang = setInterval(function() {
    if (loaded.config !== false) {
        clearInterval(intervalLang);
        if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) {
            console.log('langues chargées à distance.');
            load('./lang/' + rcConfig.lang + '/strings.json',langLoad);}
        else {langLoad(localStorage.getItem('rChampionsLangStrings'));}
    }},100);

//Récupération du contenu des boites.
let intervalBox = setInterval(function() {
    if (loaded.config !== false) {
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
    rcConfig=JSON.parse(configJson);
    if (rcConfig.skin === undefined) {rcConfig.skin = rcConfig.defaultSkin;}
    if (rcConfig.lang === undefined) {rcConfig.lang = rcConfig.defaultLang;}
    loaded.config=true;
    //stockage de la configuration en local.
    rcConfig.refreshDate=refreshToday;
    localStorage.setItem('rChampionsConfig',JSON.stringify(rcConfig));}

function minusButton (mbValue) {
    if (mbValue.getElementsByClassName('value')[0].textContent > 0) {
        mbValue.getElementsByClassName('value')[0].textContent--;
        sendValue(mbValue);}}

function plusButton (pbValue) {
    pbValue.getElementsByClassName('value')[0].textContent++;
    sendValue(pbValue);}

function sendValue(svDiv) {
    let stringToSend='';
    let valueToSend = svDiv.getElementsByClassName('value')[0].textContent;
    while (svDiv.id === '' || svDiv.id === null) {
        stringToSend = svDiv.className + ',' + stringToSend;
        svDiv=svDiv.parentNode;}
    stringToSend='valueToChange=' + svDiv.id + ',' + stringToSend.slice(0,-1) + '&value=' + valueToSend;}

  function load(fileLoad,functionLoad) {
      // Chargement de fichier distant (AJAX)
    let request = new XMLHttpRequest();
    request.open('GET', fileLoad);
    request.onreadystatechange = function() {
        if (request.readyState ===4) {functionLoad(request.responseText)}}
    request.send();}

  function langLoad(langJson) {
      //Mise en place des chaines de caractère de la langue sur la page.
      lang=JSON.parse(langJson);
      if (pageTitle!== null) document.title = lang[pageTitle];
      document.documentElement.setAttribute('lang',rcConfig.lang);
      ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {
        let statusButtons=document.getElementsByClassName(statusName);
        for(let i=0; i < statusButtons.length; i++) {statusButtons[i].textContent=lang['st-' + statusName]}});

      loaded.lang=true;
      if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) {localStorage.setItem('rChampionsLangStrings',JSON.stringify(lang));}}

  function boxesLoad(boxesJson) {
      boxesFile=JSON.parse(boxesJson);
      boxes=boxesFile.boxes;
      villains=boxesFile.villains;
      mainSchemes=boxesFile.mainSchemes;
      heros=boxesFile.heros;
      decks=boxesFile.decks;
      sideSchemes=boxesFile.sideSchemes;
      schemeTexts=boxesFile.schemeTexts;
      loaded.boxes=true;

      saveBoxFile();}

  function mainLoad(gameJson) {
      game=JSON.parse(gameJson);
      //Attente d'avoir récupéré les éléments nécessaires avant de construire la page.
      var interval = setInterval(function() {
          if (loaded.config === false || loaded.lang === false || loaded.boxes === false){
          //Do Something While Waiting / Spinner Gif etc.
          }else{
              clearInterval(interval);}
              //Insertion des skins dans l'en-tête
              ['main','playerDisplay','villainDisplay','game',].forEach((cssName) => addHeadLink('stylesheet','text/css; charset=utf-8','./skins/' + rcConfig.skin+ '/' + cssName + '.css'));
              //Construction fixe des éléments de la page
              let minusButtons=document.getElementsByClassName('minus');
              for(let i = 0; i < minusButtons.length; i++) {minusButtons[i].onclick=function () {minusButton(this.parentNode);};}
              let plusButtons=document.getElementsByClassName('plus');
              for(let i = 0; i < plusButtons.length; i++) {plusButtons[i].onclick=function () {plusButton(this.parentNode);};}
              //masquer les méchants non utilisés dans la partie et afficher le(s) autre(s)
              for (let i=game.villains.length; i < 4; i++) {document.getElementById('villain' + (i+1)).style.display='none';};
              for (let i=0; i < game.villains.length; i++) {villainDisplay(document.getElementById('villain' + (i+1)),game.villains[i]);};
              document.getElementById('loading').style.display='none';

      },100);
  }

  function addHeadLink(rel,type,href) {
    //Ajout des liens en tête de document (styles et favicon).
        let headLink = document.createElement('link');
        headLink.rel = rel;
        headLink.type = type;
        headLink.href = href;
        document.head.appendChild(headLink);}

function villainDisplay(villainDisp,villain) {
    if (villains[villain.id] !== undefined) {
        //Affichage de l'état actuel du méchant
        villainDisp.getElementsByTagName('img')[0].src='./images/villains/' + villain.id + '.png';
        villainDisp.getElementsByTagName('img')[0].alt=villains[villain.id].name;
        villainDisp.getElementsByClassName('name')[0].textContent=villains[villain.id].name;
        villainDisp.getElementsByClassName('phase')[0].textContent=villain.phase;
        villainDisp.getElementsByClassName('life')[0].getElementsByClassName('value')[0].textContent=villain.life;
        ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {
            if (villain[statusName] !== undefined && villain[statusName] !== '0') {villainDisp.getElementsByClassName(statusName)[0].style.opacity='1';}
            else {villainDisp.getElementsByClassName(statusName)[0].style.opacity='0.5';}})
        if (mainSchemes[villain.mainScheme.id] !== undefined) {
            //Affichage de la manigance principale du méchant
            mainDisp=villainDisp.getElementsByClassName('mainScheme')[0];
            mainDisp.getElementsByClassName('name')[0].textContent=mainSchemes[villain.mainScheme.id].name;
            mainDisp.getElementsByClassName('threat')[0].getElementsByClassName('value')[0].textContent=villain.mainScheme.current;
            mainDisp.getElementsByClassName('acceleration')[0].getElementsByClassName('value')[0].textContent=villain.mainScheme.acceleration;
            mainDisp.getElementsByClassName('max')[0].getElementsByClassName('value')[0].textContent=villain.mainScheme.max;}
            sideDisp=villainDisp.getElementsByClassName('sideSchemes')[0];
        for (i = villain.sideSchemes.length;i > 0;i--) {
            //Affichage des manigances annexes du méchant
            let sideScheme = document.createElement('div');
            sideScheme.textContent=sideSchemes[i].name;
            sideDisp.prepend(sideScheme);

        }
    }
}

function playerDisplay() {

}

function saveBoxFile() {
    saveBoxes='{"boxes":' + JSON.stringify(boxes) +',"villains":' + JSON.stringify(villains) + ', "mainSchemes":' + JSON.stringify(mainSchemes) + ', "heros":' + JSON.stringify(heros) + ', "decks":' + JSON.stringify(decks) + ', "sideSchemes":' + JSON.stringify(sideSchemes) + ', "schemeTexts":' + JSON.stringify(schemeTexts) + '}';
    if (localStorage.getItem('rChampionsBoxes') === null || rcConfig.refreshDate !== refreshToday) {localStorage.setItem('rChampionsBoxes',saveBoxes);}
}