function playerDisplay(index) {
    //Insertion du code HTML du joueur dans la page
    let play = game.players[index];
    let playId = 'player' + index;
    //Affichage de l'état actuel du méchant
    let playerD = addElement('div','player',playId);
    let playerFrame = addElement('div','player-frame');
    playerD.append(playerFrame);
    //Ajout de l'image du héros
    let heroPic = addElement('button','picture',playId + '-pic');
    heroPic.style.backgroundImage = "url('./images/heros/" + play.hero + ".png')";
    heroPic.title=lang.BUTTONhero;
    heroPic.onclick = function () {initChangeHero(index)};
    playerFrame.append(heroPic);
    //Ajout du nom du joueur
    let playerName = addElement('button','name',playId + '-name');
    playerName.textContent = play.name;
    playerName.title = lang.BUTTONplayerName;
    playerName.onclick = function () {playerNamePopup(index);}
    playerFrame.append(playerName);
    //Ajout de la vie du joueur
    playerFrame.append(valuePlusMinus('life',play.life,playId + '-life','"operation":"playerLifeMinus","id":"' + index + '"','"operation":"playerLifePlus","id":"' + index + '"'));
    //Ajout des états du joueur
    let playerStat = addElement('div','status');
    playerFrame.append(playerStat);
    ['confused','stunned','tough'].forEach((statusName) => {playerStat.append(buttonDisplay(play[statusName] === undefined || play[statusName] === '0'?statusName + ' off':statusName,'{"operation":"playerStatus","status":"' + statusName + '","id":"' + index + '"}',lang['ST' + statusName],lang['ST' + statusName],playId + '-' + statusName));});
    //Ajout de l'alter-ego/héros alterHero
    playerFrame.append(buttonDisplay('alterHero','{"operation":"alterHero","player":"' + index + '"}',play.alterHero == 'h' ? 'Passer en Alter-Ego':'Passer en Superhéros',play.alterHero == 'h' ? lang.PLhero : lang.PLalter,'alterHero' + index));
    //Ajout du bouton mobile
    let playerMob = addElement('button','mobile');
    playerMob.title = lang.BUTTONmobile;
    playerMob.onclick = function () {localStorage.setItem('rChampions-player',index);window.location.href = "player.html";}
    playerFrame.append(playerMob);
    //Affichage des compteurs multifonctions
    let playerCounters = addElement('div','counters',playId + '-counters');
    let playerCountersTitle = addElement('div','title');
    playerCountersTitle.textContent = lang.VILcounters;
    playerCounters.append(playerCountersTitle);
    let playerCountersNew = addElement('button','new');
    playerCountersNew.title = lang.BUTTONnewCounter;
    playerCountersNew.onclick = function () { PnewCounter(index);}
    playerCounters.append(playerCountersNew);
    if (play.counters !== undefined) Object.keys(play.counters).forEach(key => {
        playerCounters.append(PcounterDisplay(index,key));
    })
    playerD.append(playerCounters);
    return playerD;}

function PcounterDisplay (playerId,counterId) {
    let counter = game.players[playerId].counters[counterId];
    let counterDiv = addElement('div','counter','player' + playerId + '-counter' + counterId);
    let counterDivVal = valuePlusMinus('counterValue',counter.value,'player' + playerId + '-count' + counterId,'"operation":"counterMinus","player":"' + playerId + '","id":"' + counterId + '"','"operation":"counterPlus","player":"' + playerId + '","id":"' + counterId + '"');
    let counterName = addElement('p','name');
    counterName.textContent = counter.name;
    counterDivVal.append(counterName);
    counterDiv.append(counterDivVal);
    let counterRemoveButton = addElement('button','remove');
    counterRemoveButton.title = lang.BUTTONremoveCounter;
    counterRemoveButton.onclick = function () {sendReq('{"operation":"deleteCounter","player":"' + playerId + '","counter":"' + counterId + '"}');}
    counterDiv.append(counterRemoveButton);
    return counterDiv;}

function PnewCounter(playerId) {
    //Ajout d'un nouveau compteur générique
    let intro = lang.POPUPPlayCounterIntro1 + game.players[playerId].name + lang.POPIPCounterIntro2;
    let buttons = '<button title="' + lang.BUTTONconfirm + '" id ="newCounterConfirm">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let content = '<p>' + lang.POPUPCounterName + ' <input type="text" id="newCounterName"></p><p>' + lang.POPUPCounterInitialValue + ' <input type="number" min="0" max="1000" id="newCounterValue" value="0"></p>';
    popupDisplay(lang.BUTTONnewCounter,intro,content,buttons,'','200px');
    document.getElementById('newCounterConfirm').onclick = function () {sendReq('{"operation":"newCounter","player":"' + playerId + '","counterName":"' + document.getElementById('newCounterName').value + '","value":"'+ document.getElementById('newCounterValue').value + '"}');document.getElementById('popup').style.display='none';}
    textFocus('newCounterName','newCounterConfirm');}

function initChangeHero(player) {
    //Popup de confirmation de changement du héros
    let outro = lang.POPUPheroOutro;
    let intro = lang.POPUPheroIntro1 + game.players[player].name + lang.POPUPheroIntro2;
    let changeHeroButtons='<button title="' + lang.BUTTONconfirm + '" id="initChangeHeroConfirm" style="display:none;" onclick="">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let orderHeros=Object.entries(heros).sort((a,b) => a[1].name > b[1].name?1:-1);
    //création d'un "dummy héros" pour le cas de "Choisir le méchant"
    let heroSelect=game.players[player].hero == 0 ? '<div style="display:none"><label class="on"></label></div>': '';
    for (let i in orderHeros) if (orderHeros[i][0] != 0) {
        //Affichage du formulaire de sélection des héros :
        HIndex=orderHeros[i][0];
        heroSelect +='<div><label';
        if (HIndex == game.players[player].hero) heroSelect += ' class="on"';
        heroSelect += '><input type="radio" id="heroselect_' + HIndex + '" name="heroSelect" value="' + HIndex +'"';
        if (HIndex == game.players[player].hero) heroSelect += ' checked';
        heroSelect +='><img alt="' + orderHeros[i][1].name + '" src="./images/heros/' + HIndex + '.png">' + orderHeros[i][1].name + '</label></div>';}
    popupDisplay(lang.BUTTONhero,intro,heroSelect,changeHeroButtons,outro,'70%');
    var radios = document.querySelectorAll('input[type=radio][name="heroSelect"]');
    //Gestion de l'affichage du héros sélectionné.
    radios.forEach(radio => radio.addEventListener('change', () => {
        document.querySelector('label.on').classList.remove('on');
        radio.parentElement.className='on';
        document.getElementById('initChangeHeroConfirm').style.display=radio.value == game.players[player].hero ? 'none' : 'block';}));
        document.getElementById('initChangeHeroConfirm').onclick = function () {sendReq('{"operation":"changeHero","player":"' + player + '","newHero":"' + document.querySelector('input[type=radio]:checked').value + '"}');
        document.getElementById('popup').style.display='none';}}

function playerNamePopup(player) {
    let PNbuttons='<button title="' + lang.BUTTONconfirm + '" onclick = "playerNameSend(' + player + ');" id="newPlayerNameConfirm">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let PNintro = lang.PLchangePlayerNameIntro1 + game.players[player].name + lang.PLchangePlayerNameIntro2
    let PNcontent = '<input type = "text" value = "' + game.players[player].name + '" id = "newPlayerName">';
    popupDisplay(lang.BUTTONplayerName,PNintro,PNcontent,PNbuttons,'');
    textFocus('newPlayerName','newPlayerNameConfirm');}
function playerNameSend(player) {
    sendReq('{"operation":"playerName","player":"' + player + '","newName":"' + document.getElementById('newPlayerName').value + '"}');
    document.getElementById('popup').style.display='none';}