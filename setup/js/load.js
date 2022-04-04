//Déclaration des variables globales
const refreshToday = Math.round((new Date()).getTime()/86400000);
let rcConfig={}, lang={}, game={},
boxes={}, villains={}, mainSchemes={}, heros={}, decks={}, sideSchemes={}, schemeTexts={},
loaded={"config":false,"lang":false,"boxes":false};
addHeadLink('icon','image/x-icon','favicon.ico');

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