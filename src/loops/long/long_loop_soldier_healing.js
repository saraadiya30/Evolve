// Penyembuhan prajurit terluka per detik. Dulu bagian dari longLoop_s1.
import { global, support_on, p_on } from '../../core/vars.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { govActive } from '../../governor/gov_active.js';
import { astroVal } from '../../functions/astrology.js';

export function longLoopSoldierHealing($ctx){
        // Soldier Healing
        if (global.civic.garrison.wounded > 0){
            let healed = global.race['regenerative'] ? traits.regenerative.vars()[0] : 1;

            let hc = global.city['hospital'] ? global.city.hospital.count : 0;
            if (global.race['orbit_decayed'] && global.race['truepath']){
                hc = Math.min(support_on['operating_base'],p_on['operating_base']);
            }
            else if (global.race['artifical'] && global.city['boot_camp']){
                hc = global.city.boot_camp.count;
            }
            if (global.race['rejuvenated'] && global.stats.achieve['lamentis']){
                let bonus = global.stats.achieve.lamentis.l;
                if (bonus > 5){ bonus = 5; }
                hc += bonus;
            }
            if ($ctx.astroSign === 'cancer'){
                hc += astroVal('cancer')[0];
                if (hc < 0){ hc = 0; }
            }
            if (global.tech['medic'] && global.tech['medic'] >= 2){
                hc *= global.tech['medic'];
            }
            if (global.race['fibroblast']){
                hc += traits.fibroblast.vars()[0] * global.race['fibroblast'];
            }
            if (global.race['cannibalize'] && global.city['s_alter'] && global.city.s_alter.regen > 0){
                hc >= 20 ? hc *= (1 + traits.cannibalize.vars()[0] / 100) : hc += Math.floor(traits.cannibalize.vars()[0] / 5);
            }
            let mantisFathom = fathomCheck('mantis');
            if (mantisFathom > 0){
                hc >= 20 ? hc *= (1 + traits.cannibalize.vars(1)[0] / 100 * mantisFathom) : hc += Math.floor(traits.cannibalize.vars(1)[0] / 5 * mantisFathom);
            }
            if (global.race['high_pop']){
                hc *= traits.high_pop.vars()[2]
            }
            let painVal = govActive('nopain',0);
            if (painVal){
                hc *= 1 + (painVal / 100);
            }
            if(global.city.banquet && global.city.banquet.on && global.city.banquet.level >= 2){
                hc *= 1 + (global.city.banquet.strength ** 0.65) / 100;
            }
            let fathom = fathomCheck('troll');
            if (fathom > 0){
                hc += Math.round(20 * traits.regenerative.vars(1)[0] * fathom);
            }
            let max_bound = 20;
            if (global.race['slow_regen']){
                max_bound *= 1 + (traits.slow_regen.vars()[0] / 100);
            }
            hc = Math.round(hc);
            if (hc > 0){
                while (hc >= max_bound){
                    healed++;
                    hc -= max_bound;
                }
                if (Math.rand(0,max_bound) < hc){
                    healed++;
                }
            }
            global.civic.garrison.wounded -= healed;
            if (global.civic.garrison.wounded < 0){
                global.civic.garrison.wounded = 0;
            }
        }
}
