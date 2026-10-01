// Perbaikan tembok fortress dan recharge Energy psychic per tick.
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits, actions } from '../../core/registries.js';
import { loc } from '../../core/locale.js';

export function fastLoopFortressEnergy($ctx){
        // Fortress Repair
        if (global.portal['fortress'] && global.portal.fortress.walls < 100){
            if (modRes('Stone', -(200 * $ctx.time_multiplier))){
                global.portal.fortress.repair++;
                breakdown.p.consume.Stone[loc('portal_fortress_name')] = -200;
            }
            if (global.portal.fortress.repair >= actions.portal.prtl_fortress.info.repair()){
                global.portal.fortress.repair = 0;
                global.portal.fortress.walls++;
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
