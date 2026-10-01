// Batas storage dan pekerja dari rock quarry, lumber yard, sawmill, mine, dig demon, coal mine, dan bank.
import { global, breakdown } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { BHStorageMulti } from '../../actions/challenge/challenge_rules.js';
import { loc } from '../../core/locale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { spatialReasoning } from '../../resources/resources.js';

export function midLoopExtractionCaps($ctx){
        if (global.city['rock_quarry']){
            let gain = BHStorageMulti(global.city.rock_quarry.count * spatialReasoning(100));
            $ctx.caps['Stone'] += gain;
            breakdown.c.Stone[loc('city_rock_quarry')] = gain+'v';

            $ctx.caps['Chrysotile'] += gain;
            breakdown.c.Chrysotile[loc('city_rock_quarry')] = gain+'v';
        }
        if (global.city['lumber_yard']){
            let gain = BHStorageMulti(global.city.lumber_yard.count * spatialReasoning(100));
            $ctx.caps['Lumber'] += gain;
            breakdown.c.Lumber[loc('city_lumber_yard')] = gain+'v';
        }
        else if (global.city['graveyard']){
            let gain = BHStorageMulti(global.city.graveyard.count * spatialReasoning(100));
            $ctx.caps['Lumber'] += gain;
            breakdown.c.Lumber[loc('city_graveyard')] = gain+'v';
        }
        if (global.city['sawmill']){
            let gain = BHStorageMulti(global.city.sawmill.count * spatialReasoning(200));
            $ctx.caps['Lumber'] += gain;
            breakdown.c.Lumber[loc('city_sawmill')] = gain+'v';
        }
        if (global.city['mine']){
            $ctx.lCaps['miner'] += jobScale(global.city.mine.count);
        }
        if (global.portal['dig_demon'] && global.race['warlord']){
            let demons = global.portal.dig_demon.on * actions.portal.prtl_wasteland.dig_demon.citizens();
            $ctx.caps[global.race.species] += demons;
            breakdown.c[global.race.species][loc('portal_dig_demon_title')] = demons + 'v';
            $ctx.lCaps['miner'] += demons;
            global.civic.miner.max = demons;
            global.civic.miner.workers = demons;
            global.civic.miner.assigned = demons;
        }
        if (global.city['coal_mine']){
            $ctx.lCaps['coal_miner'] += jobScale(global.city.coal_mine.count);
        }
        if (global.city['bank']){
            $ctx.lCaps['banker'] += jobScale(global.city.bank.count);
        }
}
