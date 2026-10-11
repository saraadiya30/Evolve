// Produksi Adamantite per tick (mining droid, s_gate, titan mine). Dulu bagian dari fastLoopCore_s13.
import { global, breakdown, gal_on, p_on, support_on, int_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { piracy } from '../../space/space_requirements.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopAdamantite($ctx){
        // Adamantite
        if (global.resource.Adamantite.display && global.interstellar['mining_droid'] && $ctx.miner_droids['adam'] > 0){
            let driod_base = $ctx.miner_droids['adam'] * 0.075 * production('psychic_boost','Adamantite');
            let driod_delta = driod_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * $ctx.zigVal;
            breakdown.p['Adamantite'][loc('interstellar_mining_droid_title')] = driod_base + 'v';
            if (driod_base > 0){
                if (global.interstellar['processing'] && int_on['processing']){
                    let rate = 0.12;
                    if (global.tech['ai_core'] && global.tech['ai_core'] >= 2 && p_on['citadel'] > 0){
                        rate += (p_on['citadel'] * 0.02);
                    }
                    let bonus = int_on['processing'] * rate;
                    breakdown.p['Adamantite'][`ᄂ${loc('interstellar_processing_title')}`] = (bonus * 100) + '%';

                    if (global.race['discharge'] && global.race['discharge'] > 0){
                        bonus *= 0.5;
                        breakdown.p['Adamantite'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                    }
                    driod_delta *= 1 + bonus;
                }
                breakdown.p['Adamantite'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
            }
            modRes('Adamantite', driod_delta * $ctx.time_multiplier);
        }

        if (p_on['s_gate'] && global.resource.Adamantite.display && global.galaxy['armed_miner'] && gal_on['armed_miner'] > 0){
            let base = gal_on['armed_miner'] * 0.23 * production('psychic_boost','Adamantite');
            let foothold = 1 + ((gal_on['ore_processor'] ?? 0) * 0.1);
            let pirate = piracy('gxy_alien2');
            let delta = base * $ctx.global_multiplier * pirate * foothold * $ctx.shrineMetal.mult * $ctx.zigVal;

            breakdown.p['Adamantite'][loc('galaxy_armed_miner_bd')] = base + 'v';
            if (base > 0){
                breakdown.p['Adamantite'][`ᄂ${loc('galaxy_ore_processor')}`] = -((1 - foothold) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('galaxy_piracy')}`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
            }
            modRes('Adamantite', delta * $ctx.time_multiplier);
        }

        if (global.resource.Adamantite.display && global.space['titan_mine']){
            let synd = syndicate('spc_titan');
            let titan_colonists = p_on['ai_colonist'] ? workerScale(global.civic.titan_colonist.workers,'titan_colonist') + jobScale(p_on['ai_colonist']) : workerScale(global.civic.titan_colonist.workers,'titan_colonist');
            let adam_base = production('titan_mine','adamantite') * support_on['titan_mine'] * titan_colonists * production('psychic_boost','Adamantite');
            let adam_delta = adam_base * $ctx.shrineMetal.mult * $ctx.global_multiplier * $ctx.qs_multiplier * synd * $ctx.zigVal;
            breakdown.p['Adamantite'][loc('city_mine')] = adam_base + 'v';
            if (adam_base > 0){
                breakdown.p['Adamantite'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('space_red_ziggurat_title')}+2`] = (($ctx.zigVal - 1) * 100) + '%';
                breakdown.p['Adamantite'][`ᄂ${loc('quarantine')}+0`] = (($ctx.qs_multiplier - 1) * 100) + '%';
            }
            modRes('Adamantite', adam_delta * $ctx.time_multiplier);
        }
}
