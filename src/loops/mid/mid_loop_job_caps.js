// Batas pekerja dari red mining, world control, slaver, dan calm. Dulu awal midLoop_s3.
import { global, breakdown, support_on } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { govTitle } from '../../civics/military/gov_calc.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { traits } from '../../core/registries.js';
import { messageQueue } from '../../functions/message_log.js';

export function midLoopJobCaps($ctx){
        if (global.race['orbit_decayed'] && global.space.hasOwnProperty('red_mine')){
            $ctx.lCaps['miner'] += jobScale(support_on['red_mine']);
            $ctx.lCaps['coal_miner'] += jobScale(support_on['red_mine']);
        }
        if (!global.tech['world_control']){
            let occ_amount = jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
            for (let i=2; i>=0; i--){
                if (global.civic.foreign[`gov${i}`].occ){
                    $ctx.lCaps['garrison'] -= occ_amount;
                    if ($ctx.lCaps['garrison'] < 0){
                        global.civic.foreign[`gov${i}`].occ = false;
                        $ctx.lCaps['garrison'] += occ_amount;
                        global.civic.garrison.workers += occ_amount;
                        messageQueue(loc('civics_garrison_autodeoccupy_desc',[govTitle(i)]),'danger',false,['spy']);
                    }
                }
            }
        }
        if (global.race['slaver'] && global.tech['slaves'] && global.city['slave_pen']) {
            $ctx.caps['Slave'] = global.city.slave_pen.count * 4;
            breakdown.c.Slave[loc('city_slave_housing',[global.resource.Slave.name])] = global.city.slave_pen.count * 4 + 'v';

            if ($ctx.caps['Slave'] < global.resource.Slave.amount){
                global.resource.Slave.amount = $ctx.caps['Slave'];
            }
        }
        if (global.race['calm'] && global.city['meditation']) {
            $ctx.caps['Zen'] = global.city.meditation.count * traits.calm.vars()[0];
            breakdown.c.Zen[loc('city_meditation')] = global.city.meditation.count * traits.calm.vars()[0] + 'v';
            global.resource.Zen.amount = (global.resource[global.race.species].amount * 2) + global.civic.garrison.workers;
            if (global.resource.Zen.amount > global.resource.Zen.max){
                global.resource.Zen.amount = global.resource.Zen.max;
            }
            let zen = global.resource.Zen.amount / (global.resource.Zen.amount + 5000);
            breakdown.c.Zen[loc('trait_calm_desc')] = `+${(zen * 100).toFixed(2)}%`;
        }
}
