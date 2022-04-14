let newHeros={},newDecks={};

function villainDisplay(index) {
    //Insertion du code HTML du méchant dans la page
    let vil = game.villains[index];
    let vilId = 'villain' + index;
    //Affichage de l'état actuel du méchant
    let vilD=addElement('div','villain',vilId);
    let vilFrame = addElement('div','villain-frame');
    vilD.append(vilFrame);
    //Ajout de l'image du méchant
    let vilDPic = addElement('button','picture',vilId + '-pic');
    vilDPic.style.backgroundImage = "url('./images/villains/" + vil.id + ".png')";
    vilDPic.title=lang.BUTTONvillain;
    vilDPic.onclick = function () {initChangeVillain(index)};
    vilFrame.append(vilDPic);
    //Ajout du nom du méchant
    let vilDName = addElement('div','name',vilId + '-name');
    vilDName.textContent = villains[vil.id].name;
    vilFrame.append(vilDName);
    //Ajout de la phase de jeu du méchant
    let vilDPhase = addElement('button','phase',vilId + '-phase');
    vilDPhase.textContent=vil.phase;
    if (villains[vil.id].life2 != undefined) {
        vilDPhase.title=lang.BUTTONphase;
        vilDPhase.onclick=function () {initChangePhase(index);}}
    else vilDPhase.style.cursor='default';
    vilFrame.append(vilDPhase);
    //Ajout de la vie du méchant
    let vilDLife = addElement('div','life');
    vilFrame.append(vilDLife);
    vilDLife.append(buttonDisplay('minus','{"operation":"villainLifeMinus","id":"' + index + '"}',lang.BUTTONminus,'',vilId + '-lifeMinus'));
    if (vil.life < 10) vil.life = '0' + vil.life;
    vilDLife.append(valueDisplay(vil.life,vilId + '-life'));
    vilDLife.append(buttonDisplay('plus','{"operation":"villainLifePlus","id":"' + index + '"}',lang.BUTTONplus));
    //Ajout des états du méchant
    let vilDStat = addElement('div','status');
    vilFrame.append(vilDStat);
    ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {vilDStat.append(buttonDisplay(vil[statusName] === undefined || vil[statusName] === '0'?statusName + ' off':statusName,'{"operation":"villainStatus","status":"' + statusName + '","id":"' + index + '"}',lang['ST' + statusName],lang['ST' + statusName],vilId + '-' + statusName));});
    //Ajout du bouton movile
    let vilDMob = addElement('button','mobile');
    vilDMob.title=lang.BUTTONmobile;
    vilFrame.append(vilDMob);
    //Ajout de la manigance principale
    vilDMain = addElement('div',game.villains[index].mainScheme.current >= game.villains[index].mainScheme.max ? 'mainSchemeLost' : 'mainScheme',vilId + '-mainScheme');
    //if (game.villains[index].mainScheme.current >= game.villains[index].mainScheme.max) vilDMain.style.backgroundColor =  'crimson';
    vilD.append(vilDMain);
    let vilMainName = addElement('div','name',vilId + '-mainName');
    vilMainName.textContent=mainSchemes[vil.mainScheme.id].name;
    vilMainName.onclick=function () {changeVillainScheme(index)};
    vilDMain.append(vilMainName);
    vilThreat = addElement('div','threat');
    vilDMain.append(vilThreat);
    if (vil.mainScheme.current < 10) vil.mainScheme.current = '0' + vil.mainScheme.current;
    vilThreat.append(buttonDisplay('minus','{"operation":"villainMainThreatMinus","id":"' + index + '"}',lang.BUTTONminus,'',vilId + '-mainMinus'));
    vilThreat.append(valueDisplay(vil.mainScheme.current,vilId + '-mainValue'));
    vilThreat.append(buttonDisplay('plus','{"operation":"villainMainThreatPlus","id":"' + index + '"}',lang.BUTTONplus));
    let vilAccel = addElement('div','acceleration');
    vilDMain.append(vilAccel);
    let vilAccImg = addElement('img','acceleration-icon');
    vilAccImg.src = './images/threat+.png';
     vilAccel.append(vilAccImg);
    vilAccel.append(buttonDisplay('minus','{"operation":"villainMainAccelerationMinus","id":"' + index + '"}',lang.BUTTONminus));
    vilAccel.append(valueDisplay(vil.mainScheme.acceleration,vilId + '-mainAccelValue'));
    vilAccel.append(buttonDisplay('plus','{"operation":"villainMainAccelerationPlus","id":"' + index + '"}',lang.BUTTONplus));
    let vilMax = addElement('div','max');
    vilDMain.append(vilMax);
    if (vil.mainScheme.max < 10) vil.mainScheme.max = '0' + vil.mainScheme.max;
    vilMax.append(buttonDisplay('minus','{"operation":"villainMainMaxMinus","id":"' + index + '"}',lang.BUTTONminus));
    vilMax.append(valueDisplay(vil.mainScheme.max,vilId + '-mainMaxValue'));
    vilMax.append(buttonDisplay('plus','{"operation":"villainMainMaxPlus","id":"' + index + '"}',lang.BUTTONplus));
    //Affichage des manigances annexes du méchant.
    let sideDisp = addElement('div','sideSchemes',vilId + '-sideSchemes');
    sideDisp.append(addElement('div','sideInfos',vilId + 'sideInfos'));
    Object.keys(vil.sideSchemes).forEach(key => {sideSchemeDisplay(sideDisp,index,key);})
    vilD.append(sideDisp);
    let sideDispNew = addElement('button','new');
    sideDispNew.title=lang.BUTTONaddScheme;
    sideDispNew.onclick = function () {newSideScheme(index)}
    sideDisp.append(sideDispNew);
    let vilDCounters = addElement('div','counters',vilId + '-counters');
    vilD.append(vilDCounters);
    return vilD;
}

function sideSchemeDisplay (sideDisp,villainIndex,villainSC) {
    //(le passage du div "sideSchemes -sideDisp- en paramètre est important pour faire fonctionner la fonction pendant la création")
    let sideScheme = addElement('div','sideScheme');
    sideScheme.id = 'villain' + villainIndex + '-sideScheme' + villainSC;
    //Affichages du compteur de menace de la manigance annexe
    let sideSchemeThreat = addElement('div','threat');
    sideSchemeThreat.append(buttonDisplay ('minus','{"operation":"sideSchemeMinus","villain":"'+ villainIndex + '","sideScheme":"' + villainSC + '"}',lang.BUTTONminus));
    if (game.villains[villainIndex].sideSchemes[villainSC].threat < 10) game.villains[villainIndex].sideSchemes[villainSC].threat = '0' + game.villains[villainIndex].sideSchemes[villainSC].threat;
    sideSchemeThreat.append(valueDisplay(game.villains[villainIndex].sideSchemes[villainSC].threat ,sideScheme.id + '-value'));
    sideSchemeThreat.append(buttonDisplay ('plus','{"operation":"sideSchemePlus","villain":"'+ villainIndex + '","sideScheme":"' + villainSC + '"}',lang.BUTTONplus));
    sideScheme.append(sideSchemeThreat);
    //Affichage du nom de la manigance annexe
    let sideSchemeName = addElement('div','name');
    sideSchemeName.textContent=sideSchemes[villainSC].name
    sideScheme.append(sideSchemeName);
    //Affichages des informations (crisis,encounter,acceleration,amplification) sur la manigance annexe
    ['crisis','encounter','acceleration','amplification'].forEach((sideSchemeIconId) => {
        if (sideSchemes[villainSC][sideSchemeIconId] !== undefined) {
            let sideSchemeIcon = addElement('img','icon');
            sideSchemeIcon.alt=sideSchemeIconId;
            sideSchemeIcon.src='./images/'+sideSchemeIconId+'.png';
            sideScheme.append(sideSchemeIcon);}})
    //Affichage des informations complémentaires sur la manigance annexe.
    let sideSchemeInfo='';
    if (sideSchemes[villainSC].info !== undefined) {sideSchemeInfo+='info: '+schemeTexts[sideSchemes[villainSC].info];}
    if (sideSchemes[villainSC].reveal !== undefined) {sideSchemeInfo+='reveal: '+schemeTexts[sideSchemes[villainSC].reveal];}
    if (sideSchemes[villainSC].defeat !== undefined) {sideSchemeInfo+='defeat: '+schemeTexts[sideSchemes[villainSC].defeat];}
    console.log(sideSchemeInfo);




    sideDisp.append(sideScheme);

}

function initChangeVillain(villainId) {
    //Popup de confirmation de changement du méchant de la partie en cours (villainID = quel méchant 1 à 4)
    let outro = (game.villains[villainId].phase != '1') ? lang.POPUPvillainOutro : '';
    let intro = lang.POPUPvillainIntro1 + villains[game.villains[villainId].id].name + '\'.<br/>' + lang.POPUPvillainIntro2;
    intro += (game.villains[villainId].sideSchemes.length > 0) ? lang.POPUPvillaintIntro3 : '.';
    if (game.villains[villainId].id == 0) intro = lang.POPUPvillainIntro2b;
    let changeVillainButtons='<button title="' + lang.BUTTONconfirm + '" id="initChangeVillainConfirm" style="display:none;" onclick="changeVillainScheme(\'' + villainId + '\',document.querySelector(\'input[type=radio]:checked\').value);">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
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

function changeVillainScheme (villainId,newVillainId=0) {
    let intro='';
    if (newVillainId == 0)  intro = game.villains[villainId].mainScheme === undefined || game.villains[villainId].mainScheme.id == 0 ? lang.POPUPmainIntroC:lang.POPUPmainIntroA1 + mainSchemes[game.villains[villainId].mainScheme.id].name + lang.POPUPmainIntroA2;
    else intro = lang.POPUPmainIntroB1 + villains[newVillainId].name + lang.POPUPmainIntroB2;
    let buttons='<button title="' + lang.BUTTONconfirm + '" id="changeMain" style="display:none;">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let orderMains=Object.entries(mainSchemes).sort((a,b) => a[1].name > b[1].name?1:-1);
    let content=lang.POPUPmainContent + '<select name="mainScheme" id="mainSchemeChange" onchange="document.getElementById(\'changeMain\').style.display=this.value == ';
    content += newVillainId !== 0 ? '0' : game.villains[villainId].mainScheme.id;
    content += ' || this.value == 0?\'none\':\'block\';"><option';
    if (newVillainId === 0 || game.villains[villainId].mainScheme === undefined || game.villains[villainId].mainScheme.id == 0) content += ' selected';
    content +=' value="0">' + mainSchemes[0].name + '</option>';
    for (let i in orderMains) if (orderMains[i][0] != 0) {
        //Affichage du menu de selection des Manigances principales :
        content += '<option value="' + orderMains[i][0] + '"';
        if (game.villains[villainId].mainScheme.id == orderMains[i][0] && newVillainId === 0) content += ' selected';
        content += '>' + orderMains[i][1].name + '</option>'}
    content += '</select>';
    popupDisplay(lang.BUTTONmain,intro,content,buttons);
    document.getElementById('changeMain').onclick = newVillainId ===0 ? function () {sendReq('{"operation":"changeMain","villain":"' + villainId + '","main":"' + document.getElementById('mainSchemeChange').value + '"}');document.getElementById('popup').style.display='none';} : function () {sendReq('{"operation":"changevillain","villain":"' + villainId + '","newVillain":"' + newVillainId + '","main":"' + document.getElementById('mainSchemeChange').value + '"}');document.getElementById('popup').style.display='none';}
}

function initChangePhase(villainId) {
    let villain=villains[game.villains[villainId].id];
    let newPhase=game.villains[villainId].phase;
    newPhase++;
    if (villain['life' + newPhase] === undefined) newPhase = 1;
    newLife=villain['life' + newPhase]*game.players.length;
    intro = lang.POPUPphaseIntro1 + newPhase + lang.POPUPphaseIntro2;
    content = lang.POPUPphaseContent1 + villain.name + lang.POPUPphaseContent2 + newLife + lang.POPUPphaseContent3;
    let buttons='<button title="' + lang.BUTTONconfirm + '" id ="changeSchemeConfirm">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    popupDisplay(lang.BUTTONphase,intro,content,buttons);
    document.getElementById('changeSchemeConfirm').onclick=function () {sendReq('{"operation":"changePhase","villain":"'+ villainId + '"}');document.getElementById('popup').style.display='none';}
}

function newSideScheme(villainId) {
    //Ajout d'une nouvelle manigance annexe
    let intro = 'Mise en jeu d\'une nouvelle manigance annexe pour le méchant \'' + villains[game.villains[villainId].id].name + '\'.<br/>Sélectionnez ci-dessous le deck auquel appartient la manigance puis la manigance elle-même.';
    let buttons='<button title="' + lang.BUTTONconfirm + '" id="newSideSchemeOK" style="display:none;" onclick="newSchemeSend(' + villainId + ');">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';

    


    let content='Deck : <select name="deck" id="deck" onchange="newSideChemeMenu(this.value);"><option selected value="0">' + decks[0].name + '</option>';
    //Sélectionner les manigances à présenter : celles des héros en jeu et celles non déjà en jeu
    newHeros={};
    newDecks={};
    for (let i in sideSchemes) if (i != 0) {
        if (game.villains[villainId].sideSchemes[i] === undefined) {
            if (sideSchemes[i].hero === undefined) newDecks[sideSchemes[i].deck] = decks[sideSchemes[i].deck];
             else {
                for (j in game.players) if (game.players[j].hero == sideSchemes[i].hero) {
                    newHeros[sideSchemes[i].hero]=heros[[sideSchemes[i].hero]];
                    newHeros[sideSchemes[i].hero].schemeName = sideSchemes[i].name;
                    newHeros[sideSchemes[i].hero].schemeId = i;}}}}
    //Affichage du menu de selection des Decks triés
    let orderDecks=Object.entries(newDecks).sort((a,b) => a[1].name > b[1].name?1:-1);
    for (let i in orderDecks) if (orderDecks[i][0] != 0) content += '<option value="d' + orderDecks[i][0] + '">' + orderDecks[i][1].name + '</option>';
    content += '<option disabled>──────────</option>';
    let orderHeros=Object.entries(newHeros).sort((a,b) => a[1].name > b[1].name?1:-1);
    for (let i in orderHeros) if (orderHeros[i][0] != 0) content += '<option value="h' + orderHeros[i][0] + '">' + orderHeros[i][1].name + '</option>';
    content += '</select><p id="newSchemeString"></span>';
    popupDisplay(lang.BUTTONaddScheme,intro,content,buttons);}

function newSideChemeMenu(deckId) {
    if (deckId == 0) {
        document.getElementById('newSideSchemeOK').style.display = 'none';
        document.getElementById('newSchemeString').textContent = '';}
    else {
        document.getElementById('newSideSchemeOK').style.display = 'block';
        if (deckId[0] == 'h') document.getElementById('newSchemeString').innerHTML = ' , manigance : <input type="text" value="' + newHeros[deckId.substring(1)].schemeName + '" disabled><input type="hidden" value="' + newHeros[deckId.substring(1)].schemeId + '" id="newSchemeId">.';
        else {
            let newSchemes = {}
            for (let i in sideSchemes) if (i != 0) if (sideSchemes[i].deck == deckId.substring(1)) newSchemes[i]={"id":i,"name":sideSchemes[i].name}
            if (Object.keys(newSchemes).length == 1) document.getElementById('newSchemeString').innerHTML = ' , manigance : <input type="text" value="' + Object.values(newSchemes)[0].name + '" disabled><input type="hidden" value="' + Object.values(newSchemes)[0].id + '" id="newSchemeId">.';
            else {
                newschemeHTML = '<select id="newSchemeId">';
                let orderSchemes=Object.entries(newSchemes).sort((a,b) => a[1].name > b[1].name?1:-1);
                for (let i in orderSchemes) if (orderSchemes[i][0] != 0) newschemeHTML += '<option value="' + orderSchemes[i][1].id + '">' + orderSchemes[i][1].name + '</option>';
                newschemeHTML += '</select>';
                document.getElementById('newSchemeString').innerHTML = newschemeHTML;}}}}

function newSchemeSend(villainId) {
    sendReq('{"operation":"newScheme","villain":"' + villainId + '","id":"' + document.getElementById('newSchemeId').value + '"}');
    document.getElementById('popup').style.display = 'none';}