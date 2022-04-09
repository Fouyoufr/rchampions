function villainDisplay(index) {
    //Insertion du code HTML du méchant dans la page
    let vil=game.villains[index];
    //Affichage de l'état actuel du méchant
    let vilD=addElement('div','villain');
    vilD.id =  'villain' + index;
    let vilFrame = addElement('div','villain-frame');
    vilD.append(vilFrame);
    let vilDPic = addElement('button','picture');
    vilDPic.style.backgroundImage = "url('./images/villains/" + vil.id + ".png')";
    vilDPic.title=lang.BUTTONvillain;
    vilDPic.onclick = function () {initChangeVillain(index)};
    vilFrame.append(vilDPic);
    let vilDName = addElement('div','name');
    vilDName.textContent = villains[vil.id].name;
    vilFrame.append(vilDName);
    let vilDPhase = addElement('button','phase');
    vilDPhase.textContent=vil.phase;
    if (villains[vil.id].life2 != undefined) {
        vilDPhase.title=lang.BUTTONphase;
        vilDPhase.onclick=function () {initChangePhase(index);}}
    else vilDPhase.style.cursor='default';
    vilFrame.append(vilDPhase);
    let vilDLife = addElement('div','life');
    vilFrame.append(vilDLife);
    vilDLife.append(buttonDisplay('minus','{"operation":"villainLifeMinus","id":"' + index + '"}',lang.BUTTONminus));
    vilDLife.append(valueDisplay(vil.life));
    vilDLife.append(buttonDisplay('plus','{"operation":"villainLifePlus","id":"' + index + '"}',lang.BUTTONplus));
    let vilDStat = addElement('div','status');
    vilFrame.append(vilDStat);
    ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {vilDStat.append(buttonDisplay(vil[statusName] === undefined || vil[statusName] === '0'?statusName + ' off':statusName,'{"operation":"villainStatus","status":"' + statusName + '"}',lang['ST' + statusName],lang['ST' + statusName]));});
    let vilDMob = addElement('button','mobile');
    vilDMob.title=lang.BUTTONmobile;
    vilFrame.append(vilDMob);
    vilDMain = addElement('div','mainScheme');
    vilD.append(vilDMain);
    let vilMainName = addElement('div','name');
    vilMainName.textContent=mainSchemes[vil.mainScheme.id].name;
    vilMainName.onclick=function () {changeVillainScheme(index)};
    vilDMain.append(vilMainName);
    vilThreat = addElement('div','threat');
    vilDMain.append(vilThreat);
    vilThreat.append(buttonDisplay('minus','{"operation":"villainMainThreatMinus","id":"' + index + '"}',lang.BUTTONminus));
    vilThreat.append(valueDisplay(vil.mainScheme.current));
    vilThreat.append(buttonDisplay('plus','{"operation":"villainMainThreatPlus","id":"' + index + '"}',lang.BUTTONplus));
    let vilAccel = addElement('div','acceleration');
    vilDMain.append(vilAccel);
    let vilAccImg = addElement('img','acceleration-icon');
    vilAccImg.src = './images/threat+.png';
     vilAccel.append(vilAccImg);
    vilAccel.append(buttonDisplay('minus','{"operation":"villainMainAccelerationMinus","id":"' + index + '"}',lang.BUTTONminus));
    vilAccel.append(valueDisplay(vil.mainScheme.acceleration));
    vilAccel.append(buttonDisplay('plus','{"operation":"villainMainAccelerationPlus","id":"' + index + '"}',lang.BUTTONplus));
    let vilMax = addElement('div','max');
    vilDMain.append(vilMax);
    vilMax.append(buttonDisplay('minus','{"operation":"villainMainMaxMinus","id":"' + index + '"}',lang.BUTTONminus));
    vilMax.append(valueDisplay(vil.mainScheme.max));
    vilMax.append(buttonDisplay('plus','{"operation":"villainMainMaxPlus","id":"' + index + '"}',lang.BUTTONplus));
    //Affichage des manigances annexes du méchant.
    let sideDisp = addElement('div','sideSchemes');
    vilD.append(sideDisp);
    let sideDispNew = addElement('button','new');
    sideDispNew.title=lang.BUTTONaddScheme;
    sideDisp.append(sideDispNew);
    for (i=vil.sideSchemes.length;i > 0;i--) sideSchemeDisplay(sideDisp,index,vil.sideSchemes[i-1]);
    let vilDCounters = addElement('div','counters');
    vilD.append(vilDCounters);
    return vilD;
}

function sideSchemeDisplay (sideDisp,villainIndex,villainSC) {
    //(le passage du div "sideSchemes -sideDisp- en paramètre est important pour faire fonctionner la fonction pendant la création")
    let sideScheme = document.createElement('div');
    sideScheme.id='sideScheme' + villainSC.id;
    sideScheme.className='sideScheme';
    //Affichages du compteur de menace de la manigance annexe
    let sideSchemeThreat = document.createElement('div');
    sideSchemeThreat.className='threat';
    sideSchemeThreat.append(buttonDisplay ('minus','{"operation":"sideSchemeMinus","villain":"'+ villainIndex + '",sideScheme":"' + villainSC.id + '"}',lang.BUTTONminus));
    sideSchemeThreat.append(valueDisplay(villainSC.threat));
    sideSchemeThreat.append(buttonDisplay ('plus','{"operation":"sideSchemePlus","villain":"'+ villainIndex + '",sideScheme":"' + villainSC.id + '"}',lang.BUTTONplus));
    sideScheme.append(sideSchemeThreat);
    //Affichage du nom de la manigance annexe
    let sideSchemeName = document.createElement('div');
    sideSchemeName.className='name';
    sideSchemeName.textContent=sideSchemes[villainSC.id].name
    sideScheme.append(sideSchemeName);
    //Affichages des informations (crisis,encounter,acceleration,amplification) sur la manigance annexe
    ['crisis','encounter','acceleration','amplification'].forEach((sideSchemeIconId) => {
        if (sideSchemes[villainSC.id][sideSchemeIconId] !== undefined) {
            let sideSchemeIcon = document.createElement('img');
            sideSchemeIcon.alt=sideSchemeIconId;
            sideSchemeIcon.src='./images/'+sideSchemeIconId+'.png';
            sideSchemeIcon.className='icon';
            sideScheme.append(sideSchemeIcon);}})
    //Affichage des informations complémentaires sur la manigance annexe.
    let sideSchemeInfo='';
    if (sideSchemes[villainSC.id].info !== undefined) {sideSchemeInfo+='info: '+schemeTexts[sideSchemes[villainSC.id].info];}
    if (sideSchemes[villainSC.id].reveal !== undefined) {sideSchemeInfo+='reveal: '+schemeTexts[sideSchemes[villainSC.id].reveal];}
    if (sideSchemes[villainSC.id].defeat !== undefined) {sideSchemeInfo+='defeat: '+schemeTexts[sideSchemes[villainSC.id].defeat];}
    console.log(sideSchemeInfo);




    sideDisp.prepend(sideScheme);

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
    if (newVillainId === 0)  intro = game.villains[villainId].mainScheme === undefined || game.villains[villainId].mainScheme.id == 0 ? lang.POPUPmainIntroC:lang.POPUPmainIntroA1 + mainSchemes[game.villains[villainId].mainScheme.id].name + lang.POPUPmainIntroA2;
    else intro = lang.POPUPmainIntroB1 + villains[newVillainId].name + lang.POPUPmainIntroB2;
    let buttons='<button title="' + lang.BUTTONconfirm + '" id="changeMain" style="display:none;">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    let orderMains=Object.entries(mainSchemes).sort((a,b) => a[1].name > b[1].name?1:-1);
    let content=lang.POPUPmainContent + '<select name="mainScheme" id="mainSchemeChange" onchange="document.getElementById(\'changeMain\').style.display=this.value ==  ' + game.villains[villainId].mainScheme.id + ' || this.value == 0?\'none\':\'block\';"><option';
    if (newVillainId == 0 || game.villains[villainId].mainScheme === undefined || game.villains[villainId].mainScheme.id == 0) content += ' selected';
    content +=' value="0">' + mainSchemes[0].name + '</option>';
    for (let i in orderMains) if (orderMains[i][0] != 0) {
        //Affichage du menu de selection des Manigances principales :
        content += '<option value="' + orderMains[i][0] + '"';
        if (game.villains[villainId].mainScheme.id == orderMains[i][0]) content += ' selected';
        content += '>' + orderMains[i][1].name + '</option>'
    }
    content += '</select>';
    popupDisplay(lang.BUTTONmain,intro,content,buttons);}

function initChangePhase(villainId) {
    let villain=villains[game.villains[villainId].id];
    let newPhase=game.villains[villainId].phase;
    newPhase++;
    if (villain['life' + newPhase] === undefined) newPhase = 1;
    newLife=villain['life' + newPhase]*game.players.length;
    intro = lang.POPUPphaseIntro1 + newPhase + lang.POPUPphaseIntro2;
    content = lang.POPUPphaseContent1 + villain.name + lang.POPUPphaseContent2 + newLife + lang.POPUPphaseContent3;
    let buttons='<button title="' + lang.BUTTONconfirm + '">' + lang.BUTTONconfirm + '</button><button title="' + lang.BUTTONcancel + '" onclick="document.getElementById(\'popup\').style.display=\'none\';">' + lang.BUTTONcancel + '</button>';
    popupDisplay(lang.BUTTONphase,intro,content,buttons);
}