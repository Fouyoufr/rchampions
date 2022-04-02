// Insertion du tableau des langues
let xhr = new XMLHttpRequest();
xhr.open('GET', localStorage.getItem('rcLang') !== null ?'./lang/'+localStorage.getItem('rcLang')+'.json' : './lang/fr.json',false);
xhr.onreadystatechange = function() {
    if (xhr.readyState ===4) {
        lang = JSON.parse(xhr.responseText);}}
xhr.send();


// Variables globales
let theme = localStorage.getItem('rcTheme') !== null ? localStorage.getItem('rcTheme') : 'default';
    //Ajout des styles et du favicon en-tête de fichier.
    function addHeadLink(rel,type,href) {
        let headLink = document.createElement('link');
        headLink.rel = rel;
        headLink.type = type;
        headLink.href = href;
        document.head.appendChild(headLink);}
    addHeadLink('stylesheet','text/css; charset=utf-8','./themes/' + theme + '/main.css');
    addHeadLink('stylesheet','text/css; charset=utf-8','./themes/' + theme + '/playerDisplay.css');
    addHeadLink('stylesheet','text/css; charset=utf-8','./themes/' + theme + '/villainDisplay.css');
    addHeadLink('stylesheet','text/css; charset=utf-8','./themes/' + theme + '/game.css');
    addHeadLink('stylesheet','text/css; charset=utf-8','./themes/' + theme + '/main.css');
    addHeadLink('icon','image/x-icon','./favicon.ico');

// Construction générqiue de la page
if (pageTitle!== null) document.title = lang[pageTitle];
document.documentElement.setAttribute('lang',localStorage.getItem('rcLang') !== null ? localStorage.getItem('rcLang') : 'fr');