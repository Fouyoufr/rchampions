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
    let playerName = addElement('div','name',playId + '-name');
    playerName.textContent = play.name;
    playerFrame.append(playerName);
    //Ajout de la vie du joueur
    playerFrame.append(valuePlusMinus('life',play.life,playId + '-life','"operation":"playerLifeMinus","id":"' + index + '"','"operation":"playerLifePlus","id":"' + index + '"'));
    //Ajout des états du joueur
    let playerStat = addElement('div','status');
    playerFrame.append(playerStat);
    ['confused','stunned','tough'].forEach((statusName) => {playerStat.append(buttonDisplay(play[statusName] === undefined || play[statusName] === '0'?statusName + ' off':statusName,'{"operation":"playerStatus","status":"' + statusName + '","id":"' + index + '"}',lang['ST' + statusName],lang['ST' + statusName],playId + '-' + statusName));});
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
    let counter = game.villains[villainId].counters[counterId];
    let counterDiv = addElement('div','counter','villain' + villainId + '-counter' + counterId);
    //Ajouter ligne suivante les opérations pour augmenter/diminuer le conteur !!!!
    let counterDivVal = valuePlusMinus('counterValue',counter.value,'villain' + villainId + '-count' + counterId,'"operation":"counterMinus","villain":"' + villainId + '","id":"' + counterId + '"','"operation":"counterPlus","villain":"' + villainId + '","id":"' + counterId + '"');
    let counterName = addElement('p','name');
    counterName.textContent = counter.name;
    counterDivVal.append(counterName);
    counterDiv.append(counterDivVal);
    let counterRemoveButton = addElement('button','remove');
    counterRemoveButton.title = lang.BUTTONremoveCounter;
    counterRemoveButton.onclick = function () {sendReq('{"operation":"deleteCounter","villain":"' + villainId + '","counter":"' + counterId + '"}');}
    counterDiv.append(counterRemoveButton);
    return counterDiv;}

function PnewCounter(playerId) {
    //Ajout d'un nouveau compteur générique
    let intro='Ajouter un compteur générique vous permettra de suivre toute valeur chiffrée que vous avez besoin/envie de suivre pendant votre partie concenrnant le méchant \'' + villains[game.villains[villainId].id].name + '\'.<br/> Si vous indiquez un nom pour votre compteur, il sera affichée dans la liste des compteurs sur l\'écran de jeu.';
    let buttons='<button title="' + lang.BUTTONconfirm + '" id ="newCounterConfirm">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let content = '<p>Nom du nouveau compteur <input type="text" id="newCounterName"></p><p>Valeur initiale du compteur <input type="number" min="0" max="1000" id="newCounterValue" value="0"></p>';
    popupDisplay(lang.BUTTONnewCounter,intro,content,buttons,'','200px');
    document.getElementById('newCounterConfirm').onclick = function () {sendReq('{"operation":"newCounter","villain":"' + villainId + '","counterName":"' + document.getElementById('newCounterName').value + '","value":"'+ document.getElementById('newCounterValue').value + '"}');document.getElementById('popup').style.display='none';}}

function initChangePlayer(villainDiv) {
    //Popup de confirmation de changement du méchant de la partie en cours (villainID = quel méchant 1 à 4)
    let villainId=villainDiv.charAt(villainDiv.length - 1)-1;
    let outro = (game.villains[villainId].phase != '1') ? lang.POPUPvillainOutro : '';
    let intro = lang.POPUPvillainIntro1 + villains[game.villains[villainId].id].name + '\'.<br/>' + lang.POPUPvillainIntro2;
    intro += (game.villains[villainId].sideSchemes.length > 0) ? lang.POPUPvillaintIntro3 : '.';
    if (game.villains[villainId].id == 0) intro = lang.POPUPvillainIntro2b;
    let changeVillainButtons='<button title="' + lang.BUTTONconfirm + '" id="initChangeVillainConfirm" style="display:none;" onclick="changeVillainScheme(\'' + villainDiv + '\',document.querySelector(\'input[type=radio]:checked\').value);">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let orderVillains=Object.entries(villains).sort((a,b) => a[1].name > b[1].name?1:-1);
    //création d'un "dummy méchant" pour le cas de "Choisir le méchant"
    let villainSelect=game.villains[villainId].id == 0 ? '<div style="display:none"><label class="on"></label></div>': '';
    for (let i in orderVillains) if (orderVillains[i][0] != 0) {
        //Affichage du formulaire de sélection des méchants :
        vilIndex=orderVillains[i][0];
        villainSelect +='<div><label';
        if (vilIndex == game.villains[villainId].id) villainSelect += ' class="on"';
        villainSelect += '><input type="radio" id="villainselect_' + vilIndex + '" name="villainSelect" value="' + vilIndex +'"';
        if (vilIndex == game.villains[villainId].id) villainSelect += ' checked';
        villainSelect +='><img alt="' + orderVillains[i][1].name + '" src="./images/villains/' + vilIndex + '.png">' + orderVillains[i][1].name + '</label></div>';}
    popupDisplay(lang.BUTTONvillain,intro,villainSelect,changeVillainButtons,outro,'70%');
    var radios = document.querySelectorAll('input[type=radio][name="villainSelect"]');
    //Gestion de l'affichage du méchant sélectionné.
    radios.forEach(radio => radio.addEventListener('change', () => {
        document.querySelector('label.on').classList.remove('on');
        radio.parentElement.className='on';
        document.getElementById('initChangeVillainConfirm').style.display=radio.value == game.villains[villainId].id?'none':'block';}));}
