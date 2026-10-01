import { global } from '../core/vars.js';
import { monsters } from '../core/registries.js';
export { spireCreep, towerPrice, soulForgeSoldiers, fortressTech, renderFortress, checkHellRequirements, buildFortress } from './hell/fortress_defense.js';
export { bloodwar, warlordSetup } from './hell/warlord_setup.js';
export { hellguard, checkSkillPointAssignments, rankDesc, hellSupression, bossResists } from './mech/hellguard.js';
export { mechCost } from './mech/mech_cost.js';
export { drawMechLab, buildMechQueue, mechDesc, validWeapons, validEquipment } from './mech/mech_lab.js';
export { mechSize, clearMechDrag, updateMechbay, genSpireFloor, terrainEffect, mechCollect } from './mech/mechbay.js';
export { mechWeaponPower, mechRating, drawHellObservations } from './mech/mech_analysis.js';
export { checkWarlordAchieve } from './hell/hell_reports.js';


export const towerSize = (function(){
    let size;
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

export { monsters };
