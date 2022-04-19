module.exports = {

    villainLife : function (gameKey,message) {
        //Diminution /augmentation de la vie du méchant
        if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '","errId":"3"}');
        else {
            if (message.operation == 'villainLifeMinus') {
                if (games[gameKey].villains[message.id].life < 1) wsclientSend(clientId,'{"error":"wss::villainLifeNegative  ' + gameKey + '/' + message.id + '","errId":"4"}'); else games[gameKey].villains[message.id].life--;}
                else games[gameKey].villains[message.id].life++;
                wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].life + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
    }},

    villainStatus : function (gameKey,message) {
        //Changement d'état du méchant
        if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '","errId":"5"}');
        else {
             if (games[gameKey].villains[message.id][message.status] === undefined) {
                games[gameKey].villains[message.id][message.status] = "1";
                wsGameSend(gameKey,'{"operation":"villainStatus","id":"' + message.id + '","status":"' + message.status + '","value":"1"}');}
             else {
                delete games[gameKey].villains[message.id][message.status];
                wsGameSend(gameKey,'{"operation":"villainStatus","id":"' + message.id + '","status":"' + message.status + '","value":"0"}');}
            fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
        }},
    
    changePhase : function (gameKey,message) {
        //Changement de phase du méchant
        if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"6"}');
        else {
            let villain = villains[games[gameKey].villains[message.villain].id];
            let newPhase = games[gameKey].villains[message.villain].phase;
            newPhase++;
            if (villain['life' + newPhase] === undefined) newPhase = 1;
            if (newPhase == games[gameKey].villains[message.villain].phase) wsclientSend(clientId,'{"error":"wss::phaseNoChange ' + gameKey + '/' + message.villain + '","errId":"7"}');
            else {
                games[gameKey].villains[message.villain].phase = newPhase;
                let newLife = villain['life' + newPhase]*games[gameKey].players.length;
                games[gameKey].villains[message.villain].life = newLife
            wsGameSend(gameKey,'{"operation":"changePhase","villain":"' + message.villain + '","phase":"' + newPhase + '"}');
            wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.villain + '","value":"' + newLife + '"}');
            fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
        }}},

    changeMain : function (gameKey,message) {
        //Changement de manigance principale
        if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"8"}');
        else {
            if (mainSchemes[message.main] === undefined) wsclientSend(clientId,'{"error":"wss::mainNotFound ' + message.main + '","errId":"9"}');
            else {
                currentThreat = mainSchemes[message.main].init;
                if (mainSchemes[message.main].initX !== undefined) currentThreat = currentThreat * games[gameKey].players.length;
                maxThreat = mainSchemes[message.main].max;
                if (mainSchemes[message.main].maxX !== undefined) maxThreat = maxThreat * games[gameKey].players.length;
                games[gameKey].villains[message.villain].mainScheme = {"id":message.main,"current":currentThreat,"max":maxThreat,"acceleration":"0"};
                wsGameSend(gameKey,'{"operation":"changeMain","villain":"' + message.villain + '","main":"' + message.main + '"}');
                wsGameSend(gameKey,'{"operation":"mainThreat","id":"' + message.villain + '","value":"' + currentThreat + '"}');
                wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.villain + '","value":"0"}');
                wsGameSend(gameKey,'{"operation":"mainThreatMax","id":"' + message.villain + '","value":"' + maxThreat + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }}},

    changeVillain : function (gameKey,message) {
        //Changement de méchant
        if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"10"}');
        else {
            if (mainSchemes[message.main] === undefined) wsclientSend(clientId,'{"error":"wss::mainNotFound ' + message.main + '","errId":"11"}');
            else {
                if (mainSchemes[message.newVillain] === undefined) wsclientSend(clientId,'{"error":"wss::newVillainNotFound ' + message.newVillain + '","errId":"12"}');
                else {
                    currentThreat = mainSchemes[message.main].init;
                    if (mainSchemes[message.main].initX !== undefined) currentThreat = currentThreat * games[gameKey].players.length;
                    maxThreat = mainSchemes[message.main].max;
                    if (mainSchemes[message.main].maxX !== undefined) maxThreat = maxThreat * games[gameKey].players.length;
                    games[gameKey].villains[message.villain].mainScheme = {"id":message.main,"current":currentThreat,"max":maxThreat,"acceleration":"0"};
                    games[gameKey].villains[message.villain].id = message.newVillain;
                    games[gameKey].villains[message.villain].phase=1;
                    games[gameKey].villains[message.villain].life = villains[message.villain].life1;
                    games[gameKey].villains[message.villain].sideSchemes={};
                    ['confused','stunned','tough','retaliate','piercing','ranged'].forEach((statusName) => {
                        delete games[gameKey].villains[message.villain][statusName];
                        wsGameSend(gameKey,'{"operation":"villainStatus","id":"' + message.villain + '","status":"' + statusName+ '","value":"0"}');});
                    wsGameSend(gameKey,'{"operation":"changeMain","villain":"' + message.villain + '","main":"' + message.main + '","current":"' + currentThreat + '"}');
                    wsGameSend(gameKey,'{"operation":"mainThreatMax","id":"' + message.villain + '","value":"' + maxThreat + '"}');
                    wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.villain + '","value":"0"}');
                    wsGameSend(gameKey,'{"operation":"changeVillain","villain":"' + message.villain + '","id":"' + message.newVillain + '"}');
                    wsGameSend(gameKey,'{"operation":"changePhase","villain":"' + message.villain + '","phase":"' + 1 + '"}');
                    wsGameSend(gameKey,'{"operation":"villainLife","id":"' + message.villain + '","value":"' + villains[message.villain].life1 + '"}');
                    fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}}},
    villainMainThreat : function (gameKey,message) {
        //Diminution/augmentation de la menace sur la manigance principale
        if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '","errId":"13"}');
        else {
            if (message.operation == 'villainMainThreatMinus') {
                if (games[gameKey].villains[message.id].mainScheme.current < 1) wsclientSend(clientId,'{"error":"wss::threatNegative ' + gameKey + '/' + message.id + '","errId":"14"}'); else games[gameKey].villains[message.id].mainScheme.current--; }    
            else  games[gameKey].villains[message.id].mainScheme.current++;
                wsGameSend(gameKey,'{"operation":"mainThreat","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.current + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }},
    villainMainAcceleration : function (gameKey,message) {
        //Diminution/augmentation de l'acceleration sur la manigance principale
        if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '","errId":"15"}');
        else {
            if (message.operation == 'villainMainAccelerationMinus') {
              if (games[gameKey].villains[message.id].mainScheme.acceleration < 1) wsclientSend(clientId,'{"error":"wss::threatNegative ' + gameKey + '/' + message.id + '","errId":"16"}'); else games[gameKey].villains[message.id].mainScheme.acceleration--;}
            else games[gameKey].villains[message.id].mainScheme.acceleration++;
                wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.acceleration + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }},

    villainMainMax : function (gameKey,message) {
        //Diminution/augmentation du maximum sur la manigance principale
        if(games[gameKey].villains[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.id + '"}');
        else {
            if (message.operation == 'villainMainMaxMinus') {
                if (games[gameKey].villains[message.id].mainScheme.max < 1) wsclientSend(clientId,'{"error":"wss::threatNegative ' + gameKey + '/' + message.id + '","errId":"19"}'); else games[gameKey].villains[message.id].mainScheme.max--; }
            else games[gameKey].villains[message.id].mainScheme.max--;
                wsGameSend(gameKey,'{"operation":"mainThreatMax","id":"' + message.id + '","value":"' + games[gameKey].villains[message.id].mainScheme.max + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }},
    
    sideScheme : function (gameKey,message) {
        //Diminution de la menace d'une manigance secondaire
        if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"23"}');
        else {
            if (games[gameKey].villains[message.villain].sideSchemes[message.sideScheme] === undefined) wsclientSend(clientId,'{"error":"wss::sideSchemeNotFound ' + message.sideScheme + '","errId":"24"}');
            else {
                if (message.operation == 'sideSchemeMinus') {
                    if (games[gameKey].villains[message.villain].sideSchemes[message.sideScheme].threat == 1) {
                        if (sideSchemes[message.sideScheme].acceleration !== undefined) {
                            //suppression de l'accélération ajoutée par la manigance
                            games[gameKey].villains[message.villain].mainScheme.acceleration--;
                            wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.villain + '","value":"' + games[gameKey].villains[message.villain].mainScheme.acceleration + '"}');}
                        delete games[gameKey].villains[message.villain].sideSchemes[message.sideScheme];
                        wsGameSend(gameKey,'{"operation":"removeSideScheme","villain":"' + message.villain + '","id":"' + message.sideScheme + '"}');}
                    else {                    
                        games[gameKey].villains[message.villain].sideSchemes[message.sideScheme].threat--;
                        wsGameSend(gameKey,'{"operation":"sideScheme","id":"' + message.sideScheme + '","value":"' + games[gameKey].villains[message.villain].sideSchemes[message.sideScheme].threat + '","villain":"' + message.villain + '"}');}}
                else {
                    games[gameKey].villains[message.villain].sideSchemes[message.sideScheme].threat++;
                    wsGameSend(gameKey,'{"operation":"sideScheme","id":"' + message.sideScheme + '","value":"' + games[gameKey].villains[message.villain].sideSchemes[message.sideScheme].threat + '","villain":"' + message.villain + '"}');}
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }}},

    newScheme : function (gameKey,message) {
        //Ajout d'une nouvelle manigance annexe
        if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"29"}');
        else {
            if (sideSchemes[message.id] === undefined) wsclientSend(clientId,'{"error":"wss::sideSchemeNotFound ' + gameKey + '/' + message.villain + '","errId":"30"}');
            else {
                newScheme=sideSchemes[message.id];
                newSchemeThreat = newScheme.init;
                if (newScheme.initX !== undefined) newSchemeThreat = Number(newSchemeThreat) * games[gameKey].players.length;
                if (newScheme.acceleration !== undefined) {
                    games[gameKey].villains[message.villain].mainScheme.acceleration++;
                    wsGameSend(gameKey,'{"operation":"mainThreatAccel","id":"' + message.villain + '","value":"' + games[gameKey].villains[message.villain].mainScheme.acceleration + '"}');}
                if (newScheme.hinder !== undefined) newSchemeThreat = Number(newSchemeThreat) + Number(games[gameKey].players.length);
                wsGameSend(gameKey,'{"operation":"newScheme","villain":"' + message.villain + '","id":"' + message.id + '","threat":"' + newSchemeThreat + '"}');
                games[gameKey].villains[message.villain].sideSchemes[message.id]={"threat":newSchemeThreat};
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }}},

    newCounter : function (gameKey,message) {
        //Ajout d'un nouveu compteur à un méchant
        let newCounter = {"name":message.counterName,"value":message.value};
        if (games[gameKey].villains[message.villain].counters === undefined) {
            //premier compteur du méchant
            games[gameKey].villains[message.villain].counters = {"0":newCounter};
            wsGameSend(gameKey,'{"operation":"newCounter","villain":"' + message.villain + '","id":"0","name":"' + message.counterName + '","value":"' + message.value + '"}');}
        else {
            //Compteur(s) suivant(s) : incrémenter le dernier Id présent
            let gameCounters = games[gameKey].villains[message.villain].counters;
            newCounterId = Number(Object.keys(gameCounters)[Object.keys(gameCounters).length-1]) + 1;
            gameCounters[newCounterId] = newCounter;
            wsGameSend(gameKey,'{"operation":"newCounter","villain":"' + message.villain + '","id":"' + newCounterId + '","name":"' + message.counterName + '","value":"' + message.value + '"}');}
            fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));},

    deleteCounter : function (gameKey,message) {
        //Suppression d'un compteur
        if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"31"}');
        else {
            if (games[gameKey].villains[message.villain].counters[message.counter] === undefined ) wsclientSend(clientId,'{"error":"wss::counterNotFound ' + gameKey + '/' + message.villain + '/' + message.counter + '","errId":"32"}');
            else {
                delete (games[gameKey].villains[message.villain].counters[message.counter]);
                wsGameSend(gameKey,'{"operation":"deleteCounter","villain":"' + message.villain + '","id":"' + message.counter + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
            }}},
        
    counter : function (gameKey,message) {
        //Incrémenter/Décrémenter un compteur
        if(games[gameKey].villains[message.villain] === undefined) wsclientSend(clientId,'{"error":"wss::villainNotFound ' + gameKey + '/' + message.villain + '","errId":"33"}');
        else {
            if (games[gameKey].villains[message.villain].counters[message.id] === undefined ) wsclientSend(clientId,'{"error":"wss::counterNotFound ' + gameKey + '/' + message.villain + '/' + message.id + '","errId":"34"}');
            else {
                if (message.operation == 'counterPlus') games[gameKey].villains[message.villain].counters[message.id].value++; else if (games[gameKey].villains[message.villain].counters[message.id].value > 0)  games[gameKey].villains[message.villain].counters[message.id].value--;
                wsGameSend(gameKey,'{"operation":"counter","villain":"' + message.villain + '","id":"' + message.id + '","value":"' + games[gameKey].villains[message.villain].counters[message.id].value + '"}');
                fs.writeFileSync(__dirname + '/games/' + gameKey + '.json',JSON.stringify(games[gameKey]));
                }}}

}