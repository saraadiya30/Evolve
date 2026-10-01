// Pertumbuhan warga per tick: homeless, kelahiran, dan penempatan pekerja.
import { global } from '../../core/vars.js';
import { timeScale } from '../../functions/resource_mod.js';
import { traits } from '../../core/registries.js';
import { planetTraits, biomes } from '../../races/planet_data.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { astroVal } from '../../functions/astrology.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { BIRTH_BONUS_PER_LOT } from '../../stocks/stocks_core.js';

export function fastLoopCitizenGrowth($ctx){
        // Citizen Growth
        if (global.civic.homeless > 0){
            let missing = Math.min(global.civic.homeless, global.resource[global.race.species].max - global.resource[global.race.species].amount);
            global.civic.homeless -= missing;
            global.resource[global.race.species].amount += missing;
            global.civic[global.civic.d_job].workers += missing;
        }
        else if ((($ctx.fed && global['resource']['Food'].amount > 0) || global.race['fasting']) && global['resource'][global.race.species].max > global['resource'][global.race.species].amount){
            if (global.race['artifical'] || (global.race['spongy'] && global.city.calendar.weather === 0)){
                // Do Nothing
            }
            else if (global.race['parasite'] && global.city.calendar.wind === 0 && !global.race['cataclysm'] && !global.race['orbit_decayed']){
                // Do Nothing
            }
            else if (global.race['vax'] && global.race.vax >= 100){
                // Do Nothing
            }
            else {
                let lowerBound = global.tech['reproduction'] ? global.tech['reproduction'] : 0;
                let upperBound = global['resource'][global.race.species].amount;

                if (global.tech['reproduction'] && $ctx.date.getMonth() === 1 && $ctx.date.getDate() === 14){
                    lowerBound += 5;
                }
                if (global.race['fast_growth']){
                    lowerBound *= traits.fast_growth.vars()[0];
                    lowerBound += traits.fast_growth.vars()[1];
                }
                if (global.race['spores'] && global.city.calendar.wind === 1){
                    if (global.race['parasite']){
                        lowerBound += traits.spores.vars()[2];
                    }
                    else {
                        lowerBound += traits.spores.vars()[0];
                        lowerBound *= traits.spores.vars()[1];
                    }
                }
                if (global.tech['reproduction'] && global.tech.reproduction >= 2 && global.city['hospital']){
                    lowerBound += global.city.hospital.count;
                }
                if (global.genes['birth']){
                    lowerBound += global.genes['birth'];
                }
                // Stock portfolio birth rate bonus: same flat/reversible pattern as the Morale and Power stock
                // bonuses above - recomputed every roll from current holdings, so selling lots removes it again.
                if (global.stocks && global.stocks.market &&  global.stocks.market.Birthrate && global.stocks.market.Birthrate.lots > 0){
                    lowerBound += global.stocks.market.Birthrate.lots * BIRTH_BONUS_PER_LOT;
                }
                if (global.race['promiscuous']){
                    lowerBound += traits.promiscuous.vars()[0] * global.race['promiscuous'];
                }
                if(global.race['fasting']){
                    lowerBound += highPopAdjust(global.civic.meditator.workers) * 0.15;
                }
                if(global.city.banquet && global.city.banquet.on && global.city.banquet.level >= 1){
                    lowerBound *= 1 + (global.city.banquet.strength ** 0.75) / 100;
                }
                if ($ctx.astroSign === 'libra'){
                    lowerBound *= 1 + (astroVal('libra')[0] / 100);
                }
                if (global.race['high_pop']){
                    lowerBound *= traits.high_pop.vars()[2];
                    upperBound /= jobScale(1);
                }
                if (global.city.biome === 'taiga'){
                    lowerBound *= biomes.taiga.vars()[1];
                }
                if (global.city.ptrait.includes('toxic')){
                    upperBound *= planetTraits.toxic.vars()[1];
                }
                if (global.race['parasite'] && (global.race['cataclysm'] || global.race['orbit_decayed'])){
                    lowerBound = Math.round(lowerBound / 5);
                    upperBound *= 3;
                }

                upperBound *= (3 - (2 ** $ctx.time_multiplier));
                // Accelerated time: one real tick is worth several ticks, so the birth roll is made once per tick of game time
                for (let roll = timeScale(); roll > 0; roll--){
                    if (global['resource'][global.race.species].amount >= global['resource'][global.race.species].max){
                        break;
                    }
                    if(Math.rand(0, upperBound) <= lowerBound){
                        global['resource'][global.race.species].amount++;
                        global.civic[global.civic.d_job].workers++;
                    }
                }
            }
        }
}
