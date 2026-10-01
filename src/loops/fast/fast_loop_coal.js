// Produksi Coal per tick.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { racialTrait } from '../../races/trait_logic/racial_traits.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';

export function fastLoopCoal($ctx){
        if (global.resource.Coal.display){
            let coal_base = workerScale(global.race['warlord'] ? global.civic.miner.workers : global.civic.coal_miner.workers,'coal_miner');
            coal_base *= racialTrait(coal_base,'miner');
            if (global.race['tough']){
                coal_base *= 1 + (traits.tough.vars()[0] / 100);
            }
            let ogreFathom = fathomCheck('ogre');
            if (ogreFathom > 0){
                coal_base *= 1 + (traits.tough.vars(1)[0] / 100 * ogreFathom);
            }
            if (global.race['resilient']){
                let bonus = 1 + (traits.resilient.vars()[0] * global.race['resilient'] / 100);
                coal_base *= bonus;
            }
            if (!global.race['living_tool'] && !global.race['tusk']){
                coal_base *= (global.tech['pickaxe'] && global.tech.pickaxe > 0 ? global.tech.pickaxe * 0.12 : 0) + 1;
            }
            if (global.tech['explosives'] && global.tech.explosives >= 2){
                coal_base *= 0.95 + (global.tech.explosives * 0.15);
            }
            if (global.city.geology['Coal']){
                coal_base *= global.city.geology['Coal'] + 1;
            }

            let power_mult = 1;
            let coal_single = 1;
            if (global.city['coal_mine']['on']){
                power_mult += (p_on['coal_mine'] * 0.05);
                coal_single += 0.05;
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            coal_base *= global.civic.coal_miner.impact * production('psychic_boost','Coal');
            breakdown.p['Coal'][global.race['warlord'] ? jobName('miner') : jobName('coal_miner')] = coal_base + 'v';
            if (coal_base > 0){
                breakdown.p['Coal'][`ᄂ${loc('power')}`] = ((power_mult - 1) * 100) + '%';
                breakdown.p['Coal'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                breakdown.p['Coal'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
            }

            if (global.race['discharge'] && global.race['discharge'] > 0 && p_on['coal_mine'] > 0){
                power_mult = (power_mult - 1) * 0.5 + 1;
                coal_single = (coal_single - 1) * 0.5 + 1;
                breakdown.p['Coal'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }

            if (global.race['cataclysm'] && support_on['iridium_mine']){
                coal_base = support_on['iridium_mine'] * production('iridium_mine','coal');
                coal_base *= production('psychic_boost','Coal');
                breakdown.p['Coal'][loc('space_moon_iridium_mine_title')] = coal_base + 'v';
                if (coal_base > 0){
                    breakdown.p['Coal'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                    breakdown.p['Coal'][`ᄂ${loc('quarantine')}+0`] = (($ctx.q_multiplier - 1) * 100) + '%';
                }
                power_mult = 1 * $ctx.zigVal;
            }

            let delta = coal_base * tunneler * $ctx.hunger * $ctx.q_multiplier * $ctx.global_multiplier;
            global.city.coal_mine['cpow'] = +(delta * (coal_single - 1)).toFixed(5);
            delta *= power_mult;

            breakdown.p['Coal'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

            if (global.interstellar['mining_droid'] && $ctx.miner_droids['coal'] > 0){
                let driod_base = $ctx.miner_droids['coal'] * 3.75 * production('psychic_boost','Coal');
                let driod_delta = driod_base * $ctx.global_multiplier * $ctx.zigVal;
                breakdown.p['Coal'][loc('interstellar_mining_droid_title')] = driod_base + 'v';
                if (driod_base > 0){
                    breakdown.p['Coal'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                }
                modRes('Coal', driod_delta * $ctx.time_multiplier);
            }

            modRes('Coal', delta * $ctx.time_multiplier);

            // Uranium (from coal miners)
            if (global.resource.Uranium.display){
                let uranium = delta / (global.race['cataclysm'] ? 48 : 115) * production('psychic_boost','Uranium');
                global.city.coal_mine['upow'] = +(global.city.coal_mine['cpow'] / (global.race['cataclysm'] ? 48 : 115)).toFixed(5);
                if (global.city.geology['Uranium']){
                    uranium *= global.city.geology['Uranium'] + 1;
                }
                // Exclude global multiplier to get the base value for display purpose
                breakdown.p['Uranium'][global.race['cataclysm'] ? loc('space_moon_iridium_mine_title') : (global.race['warlord'] ? jobName('miner') : jobName('coal_miner'))] = uranium / $ctx.global_multiplier + 'v';

                let u_delta = uranium * tunneler;
                if (u_delta > 0){
                    breakdown.p['Uranium'][`ᄂ${loc('portal_tunneler_bd')}`] = ((tunneler - 1) * 100) + '%';
                }

                modRes('Uranium', u_delta * $ctx.time_multiplier);
            }
        }
}
