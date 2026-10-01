// Produksi Crystal per tick (crystal miner dan sumber lain).
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { racialTrait, servantTrait } from '../../races/trait_logic/racial_traits.js';
import { govEffect } from '../../civics/gov_effect.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';

export function fastLoopCrystal($ctx){
        // Crystal
        if (global.resource.Crystal.display){
            let crystal_base = workerScale(global.civic.crystal_miner.workers,'crystal_miner');
            crystal_base *= racialTrait(crystal_base,'miner');

            if (global.race['servants']){
                let serve = global.race.servants.jobs.crystal_miner;
                serve *= servantTrait(global.race.servants.jobs.crystal_miner,'miner');
                crystal_base += serve;
            }

            crystal_base *= global.civic.crystal_miner.impact * production('psychic_boost','Crystal');

            breakdown.p['Crystal'][jobName('crystal_miner')] = crystal_base + 'v';

            if (global.civic.govern.type === 'magocracy'){
                let bonus = govEffect.magocracy()[1];
                crystal_base *= 1 + (bonus / 100);
                breakdown.p['Crystal'][`ᄂ${loc('govern_magocracy')}`] = `${bonus}%`;
            }

            let delta = crystal_base * $ctx.hunger * $ctx.global_multiplier;

            breakdown.p['Crystal'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
            modRes('Crystal', delta * $ctx.time_multiplier);
        }
}
