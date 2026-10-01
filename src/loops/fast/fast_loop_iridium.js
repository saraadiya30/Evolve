// Produksi Iridium per tick: smelter, tambang, kapal ekstraktor, dan Adamantite dari s_gate.
import { global, breakdown, gal_on, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { racialTrait } from '../../races/trait_logic/racial_traits.js';
import { production, teamster } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { piracy } from '../../space/space_requirements.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopIridium($ctx){
        // Iridium
        let iridium_smelter_mult = 1 + $ctx.iridium_smelter;
        if (support_on['iridium_mine'] || global.race['warlord']){
            let iridium_base = 0;

            if (global.race['warlord']){
                iridium_base = workerScale(global.civic.miner.workers,'miner');
                iridium_base *= racialTrait(iridium_base,'miner');
                iridium_base *= 0.45;
            }
            else {
                iridium_base = support_on['iridium_mine'] * production('iridium_mine','iridium').f;
            }

            let tunneler = 1;
            if (global.race['warlord'] && global.portal['tunneler']){
                tunneler = 1 + (global.portal.tunneler.rank + 3) / 100 * global.portal.tunneler.count;
            }

            iridium_base *= production('psychic_boost','Iridium');
            let synd = syndicate('spc_moon');
            let delta = iridium_base * tunneler * $ctx.hunger * $ctx.shrineMetal.mult * $ctx.global_multiplier * synd * $ctx.qs_multiplier * iridium_smelter_mult * $ctx.zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Iridium'][global.race['warlord'] ? jobName('miner') : loc('space_moon_iridium_mine_title')] = iridium_base + 'v';
            if (iridium_base > 0){
                breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+0`] = ($ctx.iridium_smelter * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('portal_tunneler_bd')}+0`] = ((tunneler - 1) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_syndicate')}+0`] = -((1 - synd) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('quarantine')}+0`] = (($ctx.qs_multiplier - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+0`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Iridium', delta * $ctx.time_multiplier);
        }

        if (support_on['iridium_ship']){
            let iridium_base = support_on['iridium_ship'] * production('iridium_ship');
            iridium_base *= production('psychic_boost','Iridium');
            let synd = syndicate('spc_belt');
            let delta = iridium_base * $ctx.hunger * $ctx.shrineMetal.mult * $ctx.global_multiplier * synd * $ctx.qs_multiplier * iridium_smelter_mult * $ctx.zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Iridium'][jobName('space_miner')] = iridium_base + 'v';
            if (iridium_base > 0){
                breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+1`] = ($ctx.iridium_smelter * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_syndicate')}+1`] = -((1 - synd) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('quarantine')}+1`] = (($ctx.qs_multiplier - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+1`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Iridium', delta * $ctx.time_multiplier);
        }

        if (p_on['s_gate'] && global.resource.Adamantite.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.65 * production('psychic_boost','Iridium');
            let foothold = 1 + ((gal_on['ore_processor'] ?? 0) * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * $ctx.global_multiplier * pirate * foothold * $ctx.hunger * $ctx.shrineMetal.mult * iridium_smelter_mult * $ctx.zigVal;
            if (global.race['gravity_well']){ delta = teamster(delta); }

            breakdown.p['Iridium'][loc('galaxy_armed_miner_bd')] = base + 'v';
            if (base > 0){
                breakdown.p['Iridium'][`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+2`] = ($ctx.iridium_smelter * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Iridium'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = (($ctx.zigVal - 1) * 100) + '%';
                if (global.race['gravity_well']){
                    breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+2`] = -((1 - teamster(1)) * 100) + '%';
                }
            }
            modRes('Iridium', delta * $ctx.time_multiplier);
        }

        // Iridium Extractor Ship
        if (global.resource.Iridium.display && $ctx.e_ship['iridium'] && $ctx.e_ship.iridium > 0){
            let iridium_delta = $ctx.e_ship.iridium * $ctx.shrineMetal.mult * $ctx.global_multiplier * iridium_smelter_mult * $ctx.hunger * $ctx.womling_technician;
            if (global.race['gravity_well']){
                iridium_delta = teamster(iridium_delta);
            }
            breakdown.p['Iridium'][loc('tau_roid_mining_ship')] = $ctx.e_ship.iridium + 'v';
            breakdown.p['Iridium'][`ᄂ${loc('city_smelter')}+3`] = ($ctx.iridium_smelter * 100) + '%';
            if ($ctx.womling_technician > 1){
                breakdown.p['Iridium'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
            }
            if (global.race['gravity_well']){
                breakdown.p['Iridium'][`ᄂ${loc('evo_challenge_gravity_well')}+3`] = -((1 - teamster(1)) * 100) + '%';
            }
            modRes('Iridium', iridium_delta * $ctx.time_multiplier);
        }
}
