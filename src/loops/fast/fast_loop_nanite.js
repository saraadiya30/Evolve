// Nanite factory untuk race deconstructor: konversi resource per tick.
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits } from '../../core/registries.js';
import { loc } from '../../core/locale.js';
import { atomic_mass } from '../../resources/atomic_mass.js';
import { nf_resources } from '../../industry/industry.js';

export function fastLoopNaniteDeconstructor($ctx){
        if (global.race['deconstructor'] && global.city['nanite_factory']){
            nf_resources.forEach(function(r){
                if (global.resource[r].display){
                    let vol = global.city.nanite_factory[r] * $ctx.time_multiplier;
                    if (vol > 0){
                        if (global.resource[r].amount < vol){
                            vol = global.resource[r].amount;
                        }
                        if (modRes(r,-(vol))){
                            breakdown.p.consume[r][loc('city_nanite_factory')] = -(vol / $ctx.time_multiplier);
                            let trait = traits.deconstructor.vars()[0] / 100;
                            let nanite_vol = vol * atomic_mass[r] / 100 * trait;
                            breakdown.p.consume['Nanite'][global.resource[r].name] = nanite_vol / $ctx.time_multiplier;
                            modRes('Nanite',nanite_vol);
                        }
                    }
                }
            });
        }
}
