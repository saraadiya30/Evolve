import { global } from '../core/vars.js';
import { fortressModules } from './portal_registry.js';
import { fortressModules_prtl_fortress } from './fortress/fortress.js';
import { fortressModules_prtl_badlands } from './fortress/badlands.js';
import { fortressModules_prtl_wasteland } from './fortress/wasteland.js';
import { fortressModules_prtl_pit } from './fortress/pit.js';
import { fortressModules_prtl_ruins } from './fortress/ruins.js';
import { fortressModules_prtl_gate } from './fortress/gate.js';
import { fortressModules_prtl_lake } from './fortress/lake.js';
import { fortressModules_prtl_spire } from './fortress/spire.js';
import { monsters } from './portal_registry.js';
import { monstersPart1 } from './monsters/fire_elm_to_lich.js';
import { monstersPart2 } from './monsters/ape_to_skeleton_pack.js';
export { spireCreep, towerPrice, soulForgeSoldiers, fortressTech, renderFortress, checkHellRequirements, buildFortress } from './hell/fortress_and_spire_defense.js';
export { bloodwar, warlordSetup } from './hell/bloodwar_and_warlord_setup.js';
export { hellguard, checkSkillPointAssignments, rankDesc, hellSupression, mechCost, bossResists } from './mech/hellguard_and_mech_costs.js';
export { drawMechLab, buildMechQueue, mechDesc, validWeapons, validEquipment } from './mech/mech_lab.js';
export { mechSize, clearMechDrag, updateMechbay, genSpireFloor, terrainEffect, mechCollect } from './mech/mechbay_and_spire_floor.js';
export { mechWeaponPower, mechRating, drawHellObservations } from './mech/mech_rating_and_hell_analysis_charts.js';
export { checkWarlordAchieve } from './hell/hell_reports_and_warlord_achievement.js';

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
