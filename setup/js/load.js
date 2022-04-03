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

// Construction générique de la page
if (pageTitle!== null) document.title = lang[pageTitle];
document.documentElement.setAttribute('lang',localStorage.getItem('rcLang') !== null ? localStorage.getItem('rcLang') : 'fr');
let minusButtons=document.getElementsByClassName('minus');
for(let i = 0; i < minusButtons.length; i++) {
    minusButtons[i].textContent='<';
    minusButtons[i].onclick=function () {minusButton(this.parentNode);};
}
let plusButtons=document.getElementsByClassName('plus');
for(let i = 0; i < plusButtons.length; i++) {
    plusButtons[i].textContent='>';
    plusButtons[i].onclick=function () {plusButton(this.parentNode);};
}

function minusButton (mbValue) {
    if (mbValue.getElementsByClassName('value')[0].textContent > 0) {
        mbValue.getElementsByClassName('value')[0].textContent--;
        sendValue(mbValue);
    }
}

function plusButton (pbValue) {
    pbValue.getElementsByClassName('value')[0].textContent++;
    sendValue(pbValue);
}

function sendValue(svDiv) {
    let stringToSend='';
    let valueToSend = svDiv.getElementsByClassName('value')[0].textContent;
    while (svDiv.id === '' || svDiv.id === null) {
        stringToSend = svDiv.className + ',' + stringToSend;
        svDiv=svDiv.parentNode;}
    stringToSend='valueToChange=' + svDiv.id + ',' + stringToSend.slice(0,-1) + '&value=' + valueToSend;
}

['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {
    let statusButtons=document.getElementsByClassName(statusName);
    for(let i=0; i < statusButtons.length; i++) {
        statusButtons[i].textContent=lang['st-' + statusName]
}
  })



//stunned
//tough
//retaliate
//piercing
//ranged