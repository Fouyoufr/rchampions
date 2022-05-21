let loaded={"config":false,"lang":false,"help":false,"page":false}, rcConfig={}, lang={}, keywords=[];
const refreshToday = Math.round((new Date()).getTime()/86400000),
pageName = 'help';
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
        rcConfig.lang = oldConfig.lang;}
    if (rcConfig.skin === undefined) rcConfig.skin = rcConfig.defaultSkin;
    if (rcConfig.lang === undefined) rcConfig.lang = rcConfig.defaultLang;
    document.getElementsByTagName('html')[0].lang = rcConfig.lang;
    //Mise en place des chaines de caractères "lang".
    if (localStorage.getItem('rChampionsLangStrings') === null || rcConfig.refreshDate !== refreshToday) load('./lang/' + rcConfig.lang + '/strings.json',langLoad); else langLoad(localStorage.getItem('rChampionsLangStrings'));}

function langLoad(langJson) {
    //Mise en place des chaines de caractère de la langue sur la page.
    lang=JSON.parse(langJson);
    document.title = lang.TIThelp;
    if (rcConfig.siteName !== undefined && rcConfig.siteName != '') document.title += ' - ' + rcConfig.siteName;
    //Récupération du contenu des boites
    load('./lang/' + rcConfig.lang + '/help.json',helpLoad);}

function helpLoad(helpJsonFile) {
    //Mise en place des tableaux de contenu.
    helpJson=JSON.parse(helpJsonFile);
    loaded.help=true;
    //Début de construction de la page d'aide
    let helpdDiv = document.getElementById('helpContent');
    let id=0;
     //Insertion du skin dans l'en-tête
    let skinLink = document.createElement('link');
    skinLink.rel = 'stylesheet'
    skinLink.type = 'text/css; charset=utf-8';
    skinLink.href = './skins/' + rcConfig.skin+ '/help.css';
    document.head.appendChild(skinLink);
    //Construction du contenu de la page d'aide
    helpJson.forEach(elem => {
        let helpTopic = document.createElement('div');
        helpTopic.id = 'topic' + id;
        helpTopic.className = 'aideChapter';
        helpdDiv.append(helpTopic);
        let helpTitle = document.createElement('div');
        helpTitle.className = 'title';
        helpTitle.onclick = function() {
            let contentStyle = document.getElementById(this.parentElement.getElementsByClassName('content')[0].id).style;
            if (contentStyle.display == 'block') contentStyle.display = 'none'; else contentStyle.display = 'block';}
        helpTitle.textContent = elem.name;
        helpTopic.append(helpTitle);
        let helpContent = document.createElement('div');
        helpContent.className = 'content';
        helpContent.id = 'content' + id;
        helpContent.innerHTML = elem.text;
        helpTopic.append(helpContent);
        id++;

        
    });


    loaded.page = true;}

//<div id='TDMUp'></div>
//<div id='aide1' class='aideChapter'>
//    <div class='title' onclick='contentStyle=document.getElementById(this.parentElement.getElementsByClassName("content")[0].id).style;if (contentStyle.display=="block") contentStyle.display="none"; else contentStyle.display="block";'>A distance</div>
//    <div id='content1' class='content'>
//        Ignorer le mot-clef riposte.
//    </div>
//</div>