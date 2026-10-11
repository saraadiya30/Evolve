// Produksi Infernite per tick. Dulu bagian dari fastLoopCore_s13.
import { global, breakdown, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { govActive } from '../../governor/gov_active.js';
import { production } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';

export function fastLoopInfernite($ctx){
        // Infernite
        if (global.resource.Infernite.display){

            let workers = global.race['warlord'] ? (global.tech?.hellspawn >= 2 && global.portal?.tunneler?.count >= 1 ? global.civic.miner.workers : 0) : global.civic.hell_surveyor.workers;
            if (workers > 0){
                let rate = global.tech.infernite >= 3 ? 0.015 : 0.01;
                if (global.race['warlord']){ rate = 0.0075; }
                let surveyor_base = workerScale(highPopAdjust(workers),'hell_surveyor') * rate * production('psychic_boost','Infernite');

                let sensors = 1;
                if (global.tech['infernite'] >= 2 && p_on['sensor_drone']){
                    let drone_rate = global.tech.infernite >= 4 ? (global.tech.infernite >= 6 ? 0.5 : 0.2) : 0.1;
                    sensors = 1 + (p_on['sensor_drone'] * drone_rate);
                }

                let runner = govActive('runner',1);
                let runBonus = 1;
                if(runner){
                    runBonus = 1 + (runner / 100);
                }

                let tunneler = 1;
                if (global.race['warlord'] && global.portal['tunneler']){
                    tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
                }

                let surveyor_delta = surveyor_base * tunneler * sensors * runBonus * $ctx.global_multiplier;

                breakdown.p['Infernite'][global.race['warlord'] ? jobName('miner') : jobName('hell_surveyor')] = surveyor_base + 'v';
                breakdown.p['Infernite'][`ᄂ${loc('portal_sensor_drone_title')}`] = ((sensors - 1) * 100) + '%';
                breakdown.p['Infernite'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                modRes('Infernite', surveyor_delta * $ctx.time_multiplier);
            }

            if (p_on['infernite_mine']){
                let rate = production('infernite_mine');
                let mine_base = p_on['infernite_mine'] * rate * production('psychic_boost','Infernite');

                let mine_delta = mine_base * $ctx.global_multiplier;
                global.portal.infernite_mine['lpmod'] = rate * $ctx.global_multiplier;

                breakdown.p['Infernite'][loc('city_mine')] = mine_base + 'v';
                modRes('Infernite', mine_delta * $ctx.time_multiplier);
            }
        }
}
