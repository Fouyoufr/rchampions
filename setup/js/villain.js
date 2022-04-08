function villainDisplay(villainDisp,villain) {
    if (villains[villain.id] !== undefined) {
        //Affichage de l'état actuel du méchant
        villainDisp.getElementsByClassName('picture')[0].style.backgroundImage="url('./images/villains/" + villain.id + ".png')";
        villainDisp.getElementsByClassName('picture')[0].title=lang.BUTTONvillain;
        villainDisp.getElementsByClassName('picture')[0].onclick=function () {initChangeVillain(villainDisp.id)};
        villainDisp.getElementsByClassName('name')[0].textContent=villains[villain.id].name;
        villainDisp.getElementsByClassName('phase')[0].textContent=villain.phase;
        if (villains[villain.id].life2 != undefined) {
            villainDisp.getElementsByClassName('phase')[0].title=lang.BUTTONphase;
            villainDisp.getElementsByClassName('phase')[0].onclick=function () {initChangePhase(villainDisp.id)}}
        else villainDisp.getElementsByClassName('phase')[0].style.cursor='default';

        villainDisp.getElementsByClassName('life')[0].getElementsByClassName('value')[0].textContent=villain.life;
        ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {
            if (villain[statusName] === undefined || villain[statusName] === '0') villainDisp.getElementsByClassName(statusName)[0].classList.add('off'); else villainDisp.getElementsByClassName(statusName)[0].classList.remove('off');})
        if (mainSchemes[villain.mainScheme.id] !== undefined) {
            //Affichage de la manigance principale du méchant
            mainDisp=villainDisp.getElementsByClassName('mainScheme')[0];
            mainDisp.getElementsByClassName('name')[0].textContent=mainSchemes[villain.mainScheme.id].name;
            mainDisp.getElementsByClassName('name')[0].onclick=function () {changeVillainScheme(villainDisp.id)};
            mainDisp.getElementsByClassName('threat')[0].getElementsByClassName('value')[0].textContent=villain.mainScheme.current;
            mainDisp.getElementsByClassName('acceleration')[0].getElementsByClassName('value')[0].textContent=villain.mainScheme.acceleration;
            mainDisp.getElementsByClassName('max')[0].getElementsByClassName('value')[0].textContent=villain.mainScheme.max;}
        //Affichage des manigances annexes du méchant
        sideDisp=villainDisp.getElementsByClassName('sideSchemes')[0];
        for (i = villain.sideSchemes.length;i > 0;i--) {sideSchemeDisplay(villain.sideSchemes[i-1]);}
        //Gestion du bouton d'ajout de nouvelle phase
        sideDisp.getElementsByClassName('new')[0].title=lang.BUTTONaddScheme

    }
}

function sideSchemeDisplay (villainSC) {
    let sideScheme = document.createElement('div');
    sideScheme.id='sideScheme' + villainSC.id;
    sideScheme.className='sideScheme';
    //Affichages du compteur de menace de la manigance annexe
    let sideSchemeThreat = document.createElement('div');
    sideSchemeThreat.className='threat';
    let sideSchemeMinus = document.createElement('button');
    sideSchemeMinus.className='minus';
    sideSchemeThreat.append(sideSchemeMinus);
    let sideSchemeValue = document.createElement('div');
    sideSchemeValue.className='value';
    sideSchemeValue.textContent=villainSC.threat;
    sideSchemeThreat.append(sideSchemeValue);
    let sideSchemePlus = document.createElement('button');
    sideSchemePlus.className='plus';
    sideSchemeThreat.append(sideSchemePlus);
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
    if (sideSchemes[villainSC.id].reveal !== undefined) {sideSchemeInfo+='reveal: '+schemeTexts[sideSchemes[villainSC.id].revel];}
    if (sideSchemes[villainSC.id].defeat !== undefined) {sideSchemeInfo+='defeat: '+schemeTexts[sideSchemes[villainSC.id].defeat];}




    sideDisp.prepend(sideScheme);

}

function initChangeVillain(villainDiv) {
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

function changeVillainScheme (villainDiv,newVillainId=0) {
    let villainId=villainDiv.charAt(villainDiv.length - 1)-1;
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

function initChangePhase(villainDiv) {
    let villainId=villainDiv.charAt(villainDiv.length - 1)-1;
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