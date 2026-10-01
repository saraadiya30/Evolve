// Produksi Elysanite dan Asphodel Powder per tick (asphodel harvester, elysanite).
import { global, breakdown, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { racialTrait } from '../../races/trait_logic/racial_traits.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { asphodelResist } from '../../edenic/edenic.js';

export function fastLoopElysanite($ctx){
        if (global.eden['asphodel_harvester'] && support_on['asphodel_harvester']){
            let powder_base = support_on['asphodel_harvester'] * production('asphodel_harvester','powder');
            powder_base *= production('psychic_boost','Asphodel_Powder');
            let delta = powder_base * $ctx.hunger * $ctx.global_multiplier;
            
            breakdown.p['Asphodel_Powder'][loc('eden_asphodel_harvester_title')] = powder_base + 'v';

            if (global.tech.asphodel >= 5){
                let penalty = asphodelResist();
                delta *= penalty;
                if (penalty <= 1){
                    breakdown.p['Asphodel_Powder'][`ᄂ${loc('eden_asphodel_hostility')}+0`] = -((1 - penalty) * 100) + '%';
                }
                else {
                    breakdown.p['Asphodel_Powder'][`ᄂ${loc('eden_mech_station_overkill')}+0`] = ((penalty - 1) * 100) + '%';
                }
            }

            modRes('Asphodel_Powder', delta * $ctx.time_multiplier);
        }

        // Elysanite
        if (global.resource.Elysanite.display){
            if (global.civic.elysium_miner.display){
                let miner_base = workerScale(global.civic.elysium_miner.workers,'elysium_miner');
                miner_base *= racialTrait(miner_base,'miner') * 0.36;

                if (!global.race['living_tool'] && !global.race['tusk']){
                    miner_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.15 : 0) + 1;
                }
                if (global.tech['explosives'] && global.tech.explosives >= 2){
                    miner_base *= 0.95 + (global.tech.explosives * 0.15);
                }
                if (global.race['tough']){
                    miner_base *= 1 + (traits.tough.vars()[0] / 100);
                }
                let ogreFathom = fathomCheck('ogre');
                if (ogreFathom > 0){
                    miner_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
                }
                miner_base *= production('psychic_boost','Elysanite');

                breakdown.p['Elysanite'][jobName('elysium_miner')] = miner_base + 'v';

                let delta = miner_base;
                delta *= $ctx.hunger * $ctx.global_multiplier;

                modRes('Elysanite', delta * $ctx.time_multiplier);
            }
        }
}
