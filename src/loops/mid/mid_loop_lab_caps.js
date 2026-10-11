// Batas Knowledge dan pekerja dari laboratorium dan observatorium: wardenclyffe, sensor drone, satellite, observatory, laboratory, biolab, zero-g lab, dan twisted lab. Dulu awal midLoop_s4.
import { global, breakdown, int_on, support_on, p_on, gal_on } from '../../core/vars.js';
import { wardenLabel } from '../../actions/core/structure_ui.js';
import { loc } from '../../core/locale.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { traits, races } from '../../core/registries.js';
import { planetTraits } from '../../races/planet_data.js';
import { spatialReasoning } from '../../resources/resources.js';
import { govActive } from '../../governor/gov_active.js';
import { shrineBonusActive, getShrineBonus } from '../../functions/run_stats_helpers.js';
import { piracy } from '../../space/space_requirements.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function midLoopLabCaps($ctx){
        if (global.city['wardenclyffe']){
            let gain_base = 1000;
            if (global.city.ptrait.includes('magnetic')){
                gain_base += planetTraits.magnetic.vars()[1];
            }
            let gain = global.city['wardenclyffe'].count * gain_base;
            $ctx.lCaps['scientist'] += jobScale(global.city['wardenclyffe'].count);
            let powered_gain = global.tech['science'] >= 7 ? 1500 : 1000;
            gain += (p_on['wardenclyffe'] * powered_gain);
            if (global.tech['supercollider']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            if (global.space['satellite']){
                gain *= 1 + (global.space.satellite.count * 0.04);
            }
            let athVal = govActive('athleticism',2);
            if (athVal){
                gain *= 1 - (athVal / 100);
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[wardenLabel()] = gain+'v';

            if (global.race.universe === 'magic'){
                let mana = global.city.wardenclyffe.count * spatialReasoning(8);
                $ctx.caps['Mana'] += mana;
                breakdown.c.Mana[wardenLabel()] = mana+'v';
            }

            if (global.race['artifical']){
                let gain = p_on['wardenclyffe'] * spatialReasoning(250);
                $ctx.caps['Food'] += gain;
                breakdown.c.Food[wardenLabel()] = gain+'v';
            }
        }
        if (global.race['logical']){
            let factor = global.tech.hasOwnProperty('high_tech') ? global.tech.high_tech : 0;
            factor += global.tech.hasOwnProperty('science') ? global.tech.science : 0;
            let gain = global.resource[global.race.species].amount * traits.logical.vars()[1] * factor;
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[races[global.race.species].name] = gain+'v';
        }
        if (global.portal['sensor_drone']){
            let gain = p_on['sensor_drone'] * (global.tech.infernite >= 6 ? 2500 : 1000);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('portal_sensor_drone_title')] = gain+'v';
        }
        if (global.space['satellite']){
            let gain = (global.space.satellite.count * (global.race['cataclysm'] || global.race['orbit_decayed'] ? 2000 : 750));
            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.tech['supercollider']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 5: 10;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_home_satellite_title')] = gain+'v';
        }
        if (global.space['observatory'] && global.space.observatory.count > 0){
            let gain = (support_on['observatory'] * 5000);
            if (global.race['cataclysm'] && global.space['satellite'] && global.space.satellite.count > 0){
                gain *= 1 + (global.space.satellite.count * 0.25);
            }

            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_moon_observatory_title')] = gain+'v';

            if (global.race['cataclysm']){
                $ctx.lCaps['professor'] += jobScale(support_on['observatory']);
            }
        }
        if (global.interstellar['laboratory'] && int_on['laboratory'] > 0){
            if (global.tech.science >= 16){
                $ctx.lCaps['scientist'] += jobScale(int_on['laboratory']);
            }
            let gain = (int_on['laboratory'] * 10000);
            if (global.tech.science >= 15){
                gain *= 1 + ((global.race['cataclysm'] ? support_on['exotic_lab'] : global.city.wardenclyffe.count) * 0.02);
            }
            if (global.race['cataclysm'] && p_on['s_gate'] && gal_on['scavenger']){
                gain *= 1 + (gal_on['scavenger'] * piracy('gxy_alien2') * 0.75);
            }
            if (global.tech['science'] >= 21){
                gain *= 1.45;
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc(global.race.universe === 'magic' ? 'tech_sanctum' : 'interstellar_laboratory_title')] = gain+'v';

            if (global.race.universe === 'magic'){
                let mana = int_on['laboratory'] * spatialReasoning(12);
                $ctx.caps['Mana'] += mana;
                breakdown.c.Mana[loc(global.race.universe === 'magic' ? 'tech_sanctum' : 'interstellar_laboratory_title')] = mana+'v';
            }
        }
        if (global.city['biolab']){
            let gain = 3000;
            if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                gain *= 1 + (p_on['sensor_drone'] * 0.02);
            }
            if (global.tech['science'] >= 20){
                gain *= 3;
            }
            if (global.tech['science'] >= 21){
                gain *= 1.45;
            }
            if (global.tech['biotech'] >= 1){
                gain *= 2.5;
            }
            if (global.race['elemental'] && traits.elemental.vars()[0] === 'frost'){
                gain *= 1 + highPopAdjust(traits.elemental.vars()[4] * global.resource[global.race.species].amount / 100);
            }

            $ctx.caps['Knowledge'] += (p_on['biolab'] * gain);
            breakdown.c.Knowledge[loc('city_biolab')] = (p_on['biolab'] * gain)+'v';
        }
        if (global.space['zero_g_lab'] && Math.min(support_on['zero_g_lab'],p_on['zero_g_lab']) > 0){
            let using = Math.min(support_on['zero_g_lab'],p_on['zero_g_lab']);
            let synd = syndicate('spc_enceladus');
            let gain = Math.round(using * 10000 * synd);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('tech_zero_g_lab')] = gain+'v';

            if (global.resource.Cipher.display){
                let cipher = 10000 * using;
                $ctx.caps['Cipher'] += cipher;
                breakdown.c.Cipher[loc('tech_zero_g_lab')] = cipher+'v';
            }
        }
        if (global.race['warlord']){
            let gain = (global.race?.absorbed?.length || 1) * 500000;
            if (shrineBonusActive()){
                let shrineBonus = getShrineBonus('know');
                gain *= shrineBonus.mult;
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('portal_throne_of_evil_title')] = gain+'v';

            $ctx.caps['Crates'] += 500;
            breakdown.c.Crates[loc('portal_throne_of_evil_title')] = 500 + 'v';
            $ctx.caps['Containers'] += 500;
            breakdown.c.Containers[loc('portal_throne_of_evil_title')] = 500 + 'v';
        }
        if (global.portal['twisted_lab'] && global.portal.twisted_lab.count > 0 && global.race['absorbed']){
            let baseVal = 6000 + global.portal.twisted_lab.rank * 2000;
            let gain = (p_on['twisted_lab'] * baseVal * global.race.absorbed.length);
            if (global.tech['supercollider'] && global.race['warlord']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('portal_twisted_lab_title')] = gain+'v';
        }
}
