// Batas dari stasiun dan lab luar angkasa: moon base, space station, exotic lab, research station, decoder, serta elerium/shadow mine/corruptor. Dulu bagian dari midLoop_s4.
import { global, breakdown, int_on, support_on, p_on } from '../../core/vars.js';
import { templeCount } from '../../functions/temple_count.js';
import { loc } from '../../core/locale.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { spatialReasoning } from '../../resources/resources.js';
import { piracy } from '../../space/space_requirements.js';

export function midLoopStationCaps($ctx){
        if (p_on['moon_base']){
            let gain = p_on['moon_base'] * spatialReasoning(500);
            $ctx.caps['Iridium'] += gain;
            breakdown.c.Iridium[loc('space_moon_base_title')] = gain+'v';
        }
        if (p_on['space_station']){
            $ctx.lCaps['space_miner'] += jobScale(p_on['space_station'] * 3);
            if (global.tech['asteroid'] >= 5){
                let gain = p_on['space_station'] * spatialReasoning(5);
                $ctx.caps['Elerium'] += gain;
                breakdown.c.Elerium[loc('space_belt_station_title')] = gain+'v';
            }
        }
        if (support_on['exotic_lab']){
            let el_gain = support_on['exotic_lab'] * spatialReasoning(10);
            $ctx.caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('space_red_exotic_lab_bd')] = el_gain+'v';
            let sci = 500;
            if (global.tech['science'] >= 13 && global.interstellar['laboratory']){
                sci += int_on['laboratory'] * 25;
            }
            if (global.tech['ancient_study'] && global.tech['ancient_study'] >= 2){
                sci += templeCount(true) * 15;
            }
            if (global.tech.mass >= 2){
                let brain = workerScale(global.civic.scientist.workers,'scientist');
                if (global.race['high_pop']){
                    brain = highPopAdjust(brain);
                }
                sci += p_on['mass_driver'] * brain;
            }
            if (global.race['cataclysm'] && support_on['observatory']){
                sci *= 1 + (support_on['observatory'] * 0.25);
            }
            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.portal['sensor_drone'] && global.tech['science'] >= 14){
                sci *= 1 + (p_on['sensor_drone'] * 0.02);
            }
            if (global.tech['science'] >= 21){
                sci *= 1.45;
            }
            if (global.race['high_pop']){
                sci = highPopAdjust(sci);
            }
            let gain = support_on['exotic_lab'] * workerScale(global.civic.colonist.workers,'colonist') * sci;
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('tech_exotic_bd')] = gain+'v';

            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                $ctx.lCaps['scientist'] += jobScale(support_on['exotic_lab']);
            }
        }

        if (support_on['research_station']){
            let attact = global.blood['attract'] ? global.blood.attract * 5 : 0;
            let sci = 200 + attact;
            if (global.tech['science'] && global.tech.science >= 22 && p_on['embassy'] && p_on['symposium']){
                sci *= 1 + (p_on['symposium'] * piracy('gxy_gorddon'));
            }
            let gain = support_on['research_station'] * highPopAdjust(global.civic.ghost_trapper.workers) * sci;
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('eden_research_station_title')] = gain+'v';
        }

        if (global.tech['isolation'] && support_on['infectious_disease_lab']){
            $ctx.lCaps['professor'] += jobScale(support_on['infectious_disease_lab'] * 2);
            $ctx.lCaps['scientist'] += jobScale(support_on['infectious_disease_lab']);
        }

        if (global.race['warlord'] && p_on['twisted_lab']){
            $ctx.lCaps['professor'] += jobScale(p_on['twisted_lab'] * 3);
            $ctx.lCaps['scientist'] += jobScale(p_on['twisted_lab'] * 2);
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.prof){
            $ctx.lCaps['scientist'] += jobScale(global.race.wishStats.prof);
        }

        if (support_on['decoder']){
            let titan_colonists = p_on['ai_colonist'] ? workerScale(global.civic.titan_colonist.workers,'titan_colonist') + jobScale(p_on['ai_colonist']) : workerScale(global.civic.titan_colonist.workers,'titan_colonist');
            let gain = support_on['decoder'] * titan_colonists * 2500;
            if (global.race['high_pop']){
                gain = highPopAdjust(gain);
            }
            if (p_on['ai_core2']){
                gain *= 1.25;
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_decoder_title')] = gain+'v';
        }
        if (p_on['elerium_contain']){
            let el_gain = p_on['elerium_contain'] * spatialReasoning(100);
            $ctx.caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('space_dwarf_elerium_contain_title')] = el_gain+'v';
        }
        if (p_on['elerium_containment']){
            let el_gain = p_on['elerium_containment'] * spatialReasoning(1000);
            $ctx.caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('eden_elerium_containment',[global.resource.Elerium.name])] = el_gain+'v';
        }
        if (p_on['shadow_mine']){
            let el_gain = p_on['shadow_mine'] * spatialReasoning(200);
            $ctx.caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('portal_shadow_mine_title')] = el_gain+'v';
        }
        if (p_on['corruptor']){
            let el_gain = p_on['corruptor'] * spatialReasoning(200);
            $ctx.caps['Elerium'] += el_gain;
            breakdown.c.Elerium[loc('eden_corruptor_title')] = el_gain+'v';
        }
}
