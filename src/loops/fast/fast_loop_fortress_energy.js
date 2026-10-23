// Perbaikan tembok fortress dan recharge Energy psychic per tick.
import { global, breakdown } from '../../core/vars.js';
import { modRes, timeScale } from '../../functions/resource_mod.js';
import { traits, actions } from '../../core/registries.js';
import { loc } from '../../core/locale.js';

export function fastLoopFortressEnergy($ctx){
        // Fortress Repair
        if (global.portal['fortress'] && global.portal.fortress.walls < 100){
            if (modRes('Stone', -(200 * $ctx.time_multiplier))){
                // modRes already took timeScale() ticks' worth of Stone, so the repair advances by as many ticks
                global.portal.fortress.repair += timeScale();
                breakdown.p.consume.Stone[loc('portal_fortress_name')] = -200;
            }
            let wallRepair = actions.portal.prtl_fortress.info.repair();
            while (global.portal.fortress.walls < 100 && global.portal.fortress.repair >= wallRepair){
                global.portal.fortress.repair -= wallRepair;
                global.portal.fortress.walls++;
            }
            if (global.portal.fortress.walls >= 100){
                global.portal.fortress.repair = 0;
            }
        }

        // Energy Recharge
        if (global.race['psychic'] && global.resource.Energy.display){
            let energy_bd = {};
            let charge = traits.psychic.vars()[2];
            energy_bd[loc('trait_psychic_name')] = charge + 'v';
            modRes(`Energy`, (charge * $ctx.time_multiplier));
            breakdown.p['Energy'] = energy_bd;
        }
}
