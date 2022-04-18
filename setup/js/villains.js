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
    vilFrame.append(valuePlusMinus('life',vil.life,vilId + '-life','"operation":"villainLifeMinus","id":"' + index + '"','"operation":"villainLifePlus","id":"' + index + '"'));
    //Ajout des états du méchant
    let vilDStat = addElement('div','status');
    vilFrame.append(vilDStat);
    ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {vilDStat.append(buttonDisplay(vil[statusName] === undefined || vil[statusName] === '0'?statusName + ' off':statusName,'{"operation":"villainStatus","status":"' + statusName + '","id":"' + index + '"}',lang['ST' + statusName],lang['ST' + statusName],vilId + '-' + statusName));});
    //Ajout du bouton mobile
    let vilDMob = addElement('button','mobile');
    vilDMob.title=lang.BUTTONmobile;
    vilFrame.append(vilDMob);
    //Ajout de la manigance principale
    vilDMain = addElement('div',game.villains[index].mainScheme.current >= game.villains[index].mainScheme.max ? 'mainSchemeLost' : 'mainScheme',vilId + '-mainScheme');
    vilD.append(vilDMain);
    let vilMainName = addElement('div','name',vilId + '-mainName');
    vilMainName.textContent=mainSchemes[vil.mainScheme.id].name;
    vilMainName.onclick=function () {changeVillainScheme(index)};
    vilDMain.append(vilMainName);
    vilDMain.append(valuePlusMinus('threat',vil.mainScheme.current,vilId + '-mainValue','"operation":"villainMainThreatMinus","id":"' + index + '"','"operation":"villainMainThreatPlus","id":"' + index + '"'));
    let vilAccel = valuePlusMinus('acceleration',vil.mainScheme.acceleration,vilId + '-mainAccelValue','"operation":"villainMainAccelerationMinus","id":"' + index + '"','"operation":"villainMainAccelerationPlus","id":"' + index + '"');
    let vilAccImg = addElement('img','acceleration-icon');
    vilAccImg.src = './images/threat+.png';
    vilAccImg.alt = 'accleration';
    vilAccel.prepend(vilAccImg);
    vilDMain.append(vilAccel);
    vilDMain.append(valuePlusMinus('max',vil.mainScheme.max,vilId + '-mainMaxValue','"operation":"villainMainMaxMinus","id":"' + index + '"','"operation":"villainMainMaxPlus","id":"' + index + '"'));
    //Affichage des compteurs multifonctions
    let vilDCounters = addElement('div','counters',vilId + '-counters');
    let vilDCountersTitle = addElement('div','title');
    vilDCountersTitle.textContent = lang.VILcounters;
    vilDCounters.append(vilDCountersTitle);
    let vilDCountersNew = addElement('button','new');
    vilDCountersNew.title = lang.BUTTONnewCounter;
    vilDCountersNew.onclick = function () { newCounter(index);}
    vilDCountersTitle.append(vilDCountersNew);
    if (vil.counters !== undefined) Object.keys(vil.counters).forEach(key => {
        vilDCounters.append(counterDisplay(index,key));
    })
    vilD.append(vilDCounters);
    //Affichage des manigances annexes du méchant.
    let sideDisp = addElement('div','sideSchemes',vilId + '-sideSchemes');
    let sideInfos = addElement('div','sideInfos',vilId + '-sideInfos');
    let sideInfosBack = addElement('div','background');
    sideInfos.append(sideInfosBack);
    let sideInfosTitle = addElement('div','title');
    let sideInfosTitleClose = addElement('button','close');
    sideInfosTitleClose.title=lang.BUTTONclose;
    sideInfosTitleClose.onclick = function () {document.getElementById(vilId + '-sideInfos').style.display = 'none';}
    sideInfosTitle.append(addElement('div','titleIn'));
    sideInfosTitle.append(sideInfosTitleClose);
    sideInfosBack.append(sideInfosTitle);
    sideInfosBack.append(addElement('div','inside'));
    sideDisp.append(sideInfos);
    Object.keys(vil.sideSchemes).forEach(key => {
        sideDisp.append(sideSchemeDisplay(index,key));
        if (sideSchemes[key].crisis !== undefined) vilFrame.getElementsByClassName('minus')[0].className += ' minusCrisis';})
    vilD.append(sideDisp);
    let sideDispNew = addElement('button','new');
    sideDispNew.title=lang.BUTTONaddScheme;
    sideDispNew.onclick = function () {newSideScheme(index)}
    sideDisp.append(sideDispNew);
    return vilD;}

function counterDisplay (villainId,counterId) {
    let counter = game.villains[villainId].counters[counterId];
    let counterDiv = addElement('div','counter','villain' + villainId + '-counter' + counterId);
    //Ajouter ligne suivante les opérations pour augmenter/diminuer le conteur !!!!
    let counterDivVal = valuePlusMinus('counterValue',counter.value,'vilain' + villainId + '-count' + counterId,'','');
    let counterName = addElement('p','name');
    counterName.textContent = counter.name;
    counterDivVal.append(counterName);
    counterDiv.append(counterDivVal);
    //Ajouter ici le bouton de suppression de ce compteur !!!!

    return counterDiv;}

function sideSchemeDisplay (villainIndex,villainSC) {
    let sideScheme = addElement('div','sideScheme','villain' + villainIndex + '-sideScheme' + villainSC);
    //Affichages du compteur de menace de la manigance annexe
    //valuePlusMinus(vpmClass,vpmValue,vpmId,vpmOperationMinus,vpmOperationPlus) 
    sideScheme.append(valuePlusMinus('threat',game.villains[villainIndex].sideSchemes[villainSC].threat,sideScheme.id + '-value','"operation":"sideSchemeMinus","villain":"'+ villainIndex + '","sideScheme":"' + villainSC + '"','"operation":"sideSchemePlus","villain":"'+ villainIndex + '","sideScheme":"' + villainSC + '"'));
    //Affichage du nom de la manigance annexe
    let sideSchemeName = addElement('button','name');
    sideSchemeName.textContent = sideSchemes[villainSC].name;
    sideSchemeName.title = (sideSchemes[villainSC].hero === undefined ? (lang.POPUPschemeHeadDeck + ' : ' + decks[sideSchemes[villainSC].deck].name) : (lang.POPUPschemeHeadHero + ' : ' + heros[sideSchemes[villainSC].hero].name)) + (sideSchemes[villainSC].card !== undefined ? '  (' + sideSchemes[villainSC].card + ')' : '');
    sideScheme.append(sideSchemeName);
    //Affichages des informations (crisis,encounter,acceleration,amplification) sur la manigance annexe
    ['crisis','encounter','acceleration','amplification'].forEach((sideSchemeIconId) => {
        if (sideSchemes[villainSC][sideSchemeIconId] !== undefined) {
            let sideSchemeIcon = addElement('img','icon');
            sideSchemeIcon.alt = sideSchemeIconId;
            sideSchemeIcon.title = sideSchemeIconId;
            sideSchemeIcon.src = './images/'+sideSchemeIconId+'.png';
            sideScheme.append(sideSchemeIcon);}})
    //Affichage de l'image 'informations complémentaires' sur la manigance annexe.
    if (sideSchemes[villainSC].info !== undefined || sideSchemes[villainSC].reveal !== undefined || sideSchemes[villainSC].defeat !== undefined) {
        let sideSchemeInfosImg = addElement('img','sideSchemeInfos');
        sideSchemeName.onclick = function () {sideSchemePopup(villainIndex,villainSC)};
        sideSchemeInfosImg.alt = lang.BUTTONsideSchemeInfos;
        sideSchemeInfosImg.title = lang.BUTTONsideSchemeInfos;
        sideSchemeInfosImg.src = './images/help.png';
        sideScheme.append(sideSchemeInfosImg);}
    return(sideScheme);}

function sideSchemePopup (villain,id,action='build') {
    popupDiv=document.getElementById('villain' + villain + '-sideInfos');
    popupDiv.getElementsByClassName('titleIn')[0].textContent = sideSchemes[id].name;
    //A ajouter : remplacement dans les chaines (**bold** **italic** **Majuscules** etc...)
    content = '<div class="head"><p class="deck">' + (sideSchemes[id].hero === undefined ? (lang.POPUPschemeHeadDeck + ' \'' + decks[sideSchemes[id].deck].name) : (lang.POPUPschemeHeadHero + ' \'' + heros[sideSchemes[id].hero].name)) + '\'</p>' + (sideSchemes[id].card !== undefined ? '<p class="card">' + sideSchemes[id].card + '</p>' : '') + '</div>';
    content += sideSchemes[id].info !== undefined && action == 'build' ? '<p><h1>' + lang.POPUPschemeInfos + ' :</h1> ' + schemeTexts[sideSchemes[id].info] + '</p>' : '';
    content += sideSchemes[id].reveal !== undefined && (action == 'build' || action == 'reveal') ? '<p><h1>' + lang.POPUPschemeReveal + ' :</h1> ' + schemeTexts[sideSchemes[id].reveal] + '</p>' : '';
    content += sideSchemes[id].defeat !== undefined && (action == 'build' || action == 'defeat') ? '<p><h1>' + lang.POPUPschemeDefeat + ' :</h1> ' + schemeTexts[sideSchemes[id].defeat] + '</p>' : '';
    content = content.replace(/\[pp]/g,'<img src="images/pp.png" alt="per player" style="height: 1em;width: auto;">');
    popupDiv.getElementsByClassName('inside')[0].innerHTML = content;
    popupDiv.style.display='block';}

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
    let intro = lang.NSSIntro0 + villains[game.villains[villainId].id].name + lang.NSSIntro1;
    let buttons='<button title="' + lang.BUTTONconfirm + '" id="newSideSchemeOK" style="display:none;" onclick="newSchemeSend(' + villainId + ');">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let content=lang.NSSDeck + '<select name="deck" id="deck" onchange="newSideChemeMenu(this.value);"><option selected value="0">' + decks[0].name + '</option>';
    //Sélectionner les manigances à présenter : celles des héros en jeu et celles non déjà en jeu
    newHeros={};
    newDecks={};
    newSideSchemes={};
    for (let i in sideSchemes) if (i != 0) {
        if (game.villains[villainId].sideSchemes[i] === undefined) {
            newSideSchemes[i] = sideSchemes[i];
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
        if (deckId[0] == 'h') document.getElementById('newSchemeString').innerHTML = lang.NSSScheme + '<input type="text" value="' + newHeros[deckId.substring(1)].schemeName + '" disabled><input type="hidden" value="' + newHeros[deckId.substring(1)].schemeId + '" id="newSchemeId">.';
        else {
            let newSchemes = {}
            for (let i in newSideSchemes) if (i != 0) if (sideSchemes[i].deck == deckId.substring(1)) newSchemes[i]={"id":i,"name":sideSchemes[i].name}
            if (Object.keys(newSchemes).length == 1) document.getElementById('newSchemeString').innerHTML = lang.NSSScheme + '<input type="text" value="' + Object.values(newSchemes)[0].name + '" disabled><input type="hidden" value="' + Object.values(newSchemes)[0].id + '" id="newSchemeId">.';
            else {
                newschemeHTML = '<select id="newSchemeId">';
                let orderSchemes=Object.entries(newSchemes).sort((a,b) => a[1].name > b[1].name?1:-1);
                for (let i in orderSchemes) if (orderSchemes[i][0] != 0) newschemeHTML += '<option value="' + orderSchemes[i][1].id + '">' + orderSchemes[i][1].name + '</option>';
                newschemeHTML += '</select>';
                document.getElementById('newSchemeString').innerHTML = lang.NSSScheme + newschemeHTML;}}}}

function newSchemeSend(villainId) {
    sendReq('{"operation":"newScheme","villain":"' + villainId + '","id":"' + document.getElementById('newSchemeId').value + '"}');
    document.getElementById('popup').style.display = 'none';}

function newCounter(villainId) {
    //Ajout d'un nouveau compteur générique
     let intro='Ajouter un compteur générique vous permettra de suivre toute valeur chiffrée que vous avez besoin/envie de suivre pendant votre partie concenrnant le méchant \'' + villains[game.villains[villainId].id].name + '\'.<br/> Si vous indiquez un nom pour votre compteur, il sera affichée dans la liste des compteurs sur l\'écran de jeu.';
    let buttons='<button title="' + lang.BUTTONconfirm + '" id ="newCounterConfirm">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let content = '<p>Nom du nouveau compteur <input type="text" id="newCounterName"></p><p>Valeur initiale du compteur <input type="number" min="0" max="1000" id="newCounterValue" value="0"></p>';
    popupDisplay(lang.BUTTONnewCounter,intro,content,buttons,'','200px');
    document.getElementById('newCounterConfirm').onclick = function () {sendReq('{"operation":"newCounter","villain":"' + villainId + '","counterName":"' + document.getElementById('newCounterName').value + '","value":"'+ document.getElementById('newCounterValue').value + '"}');document.getElementById('popup').style.display='none';}
}