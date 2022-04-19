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
    vilFrame.append(vilDPic);
    //Ajout du nom du méchant
    let vilDName = addElement('div','name',vilId + '-name');
    vilDName.textContent = villains[vil.id].name;
    vilFrame.append(vilDName);
    //Ajout de la phase de jeu du méchant
    let vilDPhase = addElement('button','phase',vilId + '-phase');
    vilDPhase.textContent=vil.phase;
    vilFrame.append(vilDPhase);
    //Ajout de la vie du méchant
    vilFrame.append(valuePlusMinus('life',vil.life,vilId + '-life','"operation":"villainLifeMinus","id":"' + index + '"','"operation":"villainLifePlus","id":"' + index + '"'));
    //Ajout des états du méchant
    let vilDStat = addElement('div','status');
    vilFrame.append(vilDStat);
    ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {vilDStat.append(buttonDisplay(vil[statusName] === undefined || vil[statusName] === '0'?statusName + ' off':statusName,'{"operation":"villainStatus","status":"' + statusName + '","id":"' + index + '"}',lang['ST' + statusName],lang['ST' + statusName],vilId + '-' + statusName));});
    //Ajout de la manigance principale
    vilDMain = addElement('div',game.villains[index].mainScheme.current >= game.villains[index].mainScheme.max ? 'mainSchemeLost' : 'mainScheme',vilId + '-mainScheme');
    vilD.append(vilDMain);
    let vilMainName = addElement('div','name',vilId + '-mainName');
    vilMainName.textContent=mainSchemes[vil.mainScheme.id].name;
    vilDMain.append(vilMainName);
    vilDMain.append(valuePlusMinus('threat',vil.mainScheme.current,vilId + '-mainValue','"operation":"villainMainThreatMinus","id":"' + index + '"','"operation":"villainMainThreatPlus","id":"' + index + '"'));
    let vilAccel = valuePlusMinus('acceleration',vil.mainScheme.acceleration,vilId + '-mainAccelValue','"operation":"villainMainAccelerationMinus","id":"' + index + '"','"operation":"villainMainAccelerationPlus","id":"' + index + '"');
    let vilAccImg = addElement('img','acceleration-icon');
    vilAccImg.src = './images/threat+.png';
    vilAccImg.alt = 'accleration';
    vilAccel.prepend(vilAccImg);
    vilDMain.append(vilAccel);
    vilDMain.append(valuePlusMinus('max',vil.mainScheme.max,vilId + '-mainMaxValue','"operation":"villainMainMaxMinus","id":"' + index + '"','"operation":"villainMainMaxPlus","id":"' + index + '"'));
    return vilD;}