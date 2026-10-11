// Resource tambahan untuk ras warlord (tunneler dan sumber portal) per tick. Dulu bagian dari fastLoopCore_s12.
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { racialTrait } from '../../races/trait_logic/racial_traits.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';

export function fastLoopWarlordResources($ctx){
        // Warlord Supplimental Resources
        if (global.race['warlord'] && global.portal['tunneler'] && global.portal.tunneler.count > 0){
            let res_base = workerScale(global.civic.miner.workers,'miner');
            res_base *= racialTrait(res_base,'miner');
            if (global.race['tough']){
                res_base *= 1 + (traits.tough.vars()[0] / 100);
            }
            let ogreFathom = fathomCheck('ogre');
            if (ogreFathom > 0){
                res_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
            }
            if (global.race['resilient']){
                let bonus = 1 + (traits.resilient.vars()[0] * global.race['resilient'] / 100);
                res_base *= bonus;
            }
            if (!global.race['living_tool'] && !global.race['tusk']){
                res_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.12 : 0) + 1;
            }
            if (global.tech['explosives'] && global.tech.explosives >= 2){
                res_base *= 0.95 + (global.tech.explosives * 0.15);
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            ['Neutronium','Adamantite','Bolognium','Orichalcum'].forEach(function(res){
                let cur_base = res_base;
                cur_base *= production('psychic_boost',res);
                switch (res){
                    case 'Neutronium':
                        cur_base /= 10;
                        break;
                    case 'Adamantite':
                        cur_base /= 5;
                        break;
                    case 'Bolognium':
                        cur_base /= 8;
                        break;
                    case 'Orichalcum':
                        cur_base /= 6;
                        break;
                }

                breakdown.p[res][jobName('miner')] = cur_base + 'v';
                if (cur_base > 0){
                    breakdown.p[res][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                    breakdown.p[res][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                }

                let delta = cur_base * tunneler;
                delta *= $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier;

                modRes(res, delta * $ctx.time_multiplier);
            });
        }
}
