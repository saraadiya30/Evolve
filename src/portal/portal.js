import { global } from '../core/vars.js';
import { fortressModules } from './portal_registry.js';
import { fortressModules_prtl_fortress } from './prt_fortress_prtl_fortress.js';
import { fortressModules_prtl_badlands } from './prt_fortress_prtl_badlands.js';
import { fortressModules_prtl_wasteland } from './prt_fortress_prtl_wasteland.js';
import { fortressModules_prtl_pit } from './prt_fortress_prtl_pit.js';
import { fortressModules_prtl_ruins } from './prt_fortress_prtl_ruins.js';
import { fortressModules_prtl_gate } from './prt_fortress_prtl_gate.js';
import { fortressModules_prtl_lake } from './prt_fortress_prtl_lake.js';
import { fortressModules_prtl_spire } from './prt_fortress_prtl_spire.js';
import { monsters } from './portal_registry.js';
import { monstersPart1 } from './prt_monsters_1.js';
import { monstersPart2 } from './prt_monsters_2.js';
export { spireCreep, towerPrice, soulForgeSoldiers, fortressTech, renderFortress, checkHellRequirements, buildFortress } from './portal_f1.js';
export { bloodwar } from './portal_f2.js';
export { hellguard, checkSkillPointAssignments, rankDesc, hellSupression, mechCost, bossResists } from './portal_f3.js';
export { drawMechLab, buildMechQueue, mechDesc, validWeapons, validEquipment } from './portal_f4.js';
export { mechSize, clearMechDrag, updateMechbay, genSpireFloor, terrainEffect, mechCollect } from './portal_f5.js';
export { mechWeaponPower, mechRating, drawHellObservations } from './portal_f6.js';
export { checkWarlordAchieve } from './portal_f7.js';
export { warlordSetup } from './portal_f8.js';

Object.assign(fortressModules, {
    "prtl_fortress": fortressModules_prtl_fortress,
    "prtl_badlands": fortressModules_prtl_badlands,
    "prtl_wasteland": fortressModules_prtl_wasteland,
    "prtl_pit": fortressModules_prtl_pit,
    "prtl_ruins": fortressModules_prtl_ruins,
    "prtl_gate": fortressModules_prtl_gate,
    "prtl_lake": fortressModules_prtl_lake,
    "prtl_spire": fortressModules_prtl_spire
});

export const towerSize = (function(){
    var size;
    return function(recalc){
        if (size && !recalc){
            return size;
        }
        size = 1000;
        if (global.hasOwnProperty('pillars')){
            Object.keys(global.pillars).forEach(function(pillar){
                if (global.pillars[pillar]){
                    size -= global.pillars[pillar] * 2 + 2;
                }
            });            
        }
        if (size < 250){ size = 250; }
        return size;
    }
})();

Object.assign(monsters,
    monstersPart1,
    monstersPart2
);
export { monsters };
