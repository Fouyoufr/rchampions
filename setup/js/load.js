//Déclaration des variables globales
const refreshToday = Math.round((new Date()).getTime()/86400000);
let rcConfig={};
let lang={};
let boxes={};
let game={};

//Construction fixe des éléments de la page
let minusButtons=document.getElementsByClassName('minus');
for(let i = 0; i < minusButtons.length; i++) {minusButtons[i].onclick=function () {minusButton(this.parentNode);};}
let plusButtons=document.getElementsByClassName('plus');
for(let i = 0; i < plusButtons.length; i++) {plusButtons[i].onclick=function () {plusButton(this.parentNode);};}

//Chargement de la config, depuis site distant si config locale absente ou datant de plus d'un jour

if (localStorage.getItem('rChampionsConfig') === null) {
    console.log('config chargée à distance.');
    load('./config.json',configLoad);}
else {configLoad(localStorage.getItem('rChampionsConfig'));}
function configLoad(configJson) {
    rcConfig=JSON.parse(configJson);
    //Insertion des skins dans l'en-tête
    if (rcConfig.skin === undefined) {rcConfig.skin = rcConfig.defaultSkin;}
    ['main','playerDisplay','villainDisplay','game',].forEach((cssName) => addHeadLink('stylesheet','text/css; charset=utf-8','./skins/' + rcConfig.skin+ '/' + cssName + '.css'));
    addHeadLink('icon','image/x-icon','./favicon.ico');

    //Mise en place des chaines de caractères "lang"
    if (rcConfig.lang === undefined) {rcConfig.lang = rcConfig.defaultLang;}
    if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) {
        console.log('langues chargées à distance.');
        load('./lang/' + rcConfig.lang + '/strings.json',langLoad);}
    else {langLoad(localStorage.getItem('rChampionsLangStrings'));}

    //Récupération du contenu des boites.
    if (localStorage.getItem('rChampionsBoxes') === null || rcConfig.refreshDate !== refreshToday) {
        console.log('Contenu des boites récupéré à distance.');
        load('./lang/' + rcConfig.lang + '/boxes.json',boxesLoad);}
    else {boxesLoad(localStorage.getItem('rChampionsBoxes'));}

    if (gameKey !== undefined) {
        //Récupération des informations de la partie en cours.
        load ('./games/' + gameKey + '.json',gameLoad);}

    console.log(rcConfig);

    

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
        if (request.readyState ===4) {functionLoad(request.responseText)}
    }
    request.send();}

  function langLoad(langJson) {
      //Mise en place des chaines de caractère de la langue sur la page.
      lang=JSON.parse(langJson);
      if (pageTitle!== null) document.title = lang[pageTitle];
      document.documentElement.setAttribute('lang',rcConfig.lang);
      ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {
        let statusButtons=document.getElementsByClassName(statusName);
        for(let i=0; i < statusButtons.length; i++) {statusButtons[i].textContent=lang['st-' + statusName]}});

    

      if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) {localStorage.setItem('rChampionsLangStrings',JSON.stringify(lang));}}

  function boxesLoad(boxesJson) {
      boxes=JSON.parse(boxesJson);

      if (localStorage.getItem('rChampionsBoxes') === null || rcConfig.refreshDate !== refreshToday) {localStorage.setItem('rChampionsBoxes',JSON.stringify(boxes));}}

  function gameLoad(gameJson) {
      game=JSON.parse(gameJson);
      //masquer les méchants non utilisés dans la partie et afficher le(s) autre(s)
      for (let i=game.villains.length; i < 4; i++) {document.getElementById('villain' + (i+1)).style.display='none';};
      for (let i=0; i < game.villains.length; i++) {villainDisplay(document.getElementById('villain' + (i+1)),game.villains[i]);};


  }

  function addHeadLink(rel,type,href) {
    //Ajout des liens en tête de document (styles et favicon).
        let headLink = document.createElement('link');
        headLink.rel = rel;
        headLink.type = type;
        headLink.href = href;
        document.head.appendChild(headLink);}

function villainDisplay(villainDisp,villain) {
    //Chercher le villain et la maingance principale dans les boites
    for (i1=0;i1 < boxes.length;i1++) {
        if (boxes[i1].villains !== undefined) {for (i2=0;i2 < boxes[i1].villains.length;i2++) {if (boxes[i1].villains[i2].id === villain.id) {foundVillain=boxes[i1].villains[i2];}}}
        if (boxes[i1].main !== undefined) {for (i2=0;i2 < boxes[i1].main.length;i2++) {if (boxes[i1].main[i2].id === villain.main.id) {foundMain=boxes[i1].main[i2];}}}}
    if (foundVillain !== undefined) {
        villainDisp.getElementsByTagName('img')[0].src='./images/villains/' + foundVillain.id + '.png';
        villainDisp.getElementsByTagName('img')[0].alt=foundVillain.name;
        villainDisp.getElementsByClassName('name')[0].textContent=foundVillain.name;
        villainDisp.getElementsByClassName('phase')[0].textContent=villain.phase;
        villainDisp.getElementsByClassName('life')[0].getElementsByClassName('value')[0].textContent=villain.life;
        ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {
            if (villain[statusName] !== undefined && villain[statusName] !== '0') {villainDisp.getElementsByClassName(statusName)[0].style.opacity='1';}
            else {villainDisp.getElementsByClassName(statusName)[0].style.opacity='0.5';}})
       if (foundMain !== undefined) {
            mainDisp=villainDisp.getElementsByClassName('mainScheme')[0];
            mainDisp.getElementsByClassName('name')[0].textContent=foundMain.name;
            mainDisp.getElementsByClassName('threat')[0].getElementsByClassName('value')[0].textContent=villain.main.current;
            mainDisp.getElementsByClassName('acceleration')[0].getElementsByClassName('value')[0].textContent=villain.main.acceleration;
            mainDisp.getElementsByClassName('max')[0].getElementsByClassName('value')[0].textContent=villain.main.max;}
    }
    else {
        //Recharger la page si villain non trouvé (premier chargement des boites en local)
        location.reload();}}