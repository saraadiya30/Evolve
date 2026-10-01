// Ekstraksi di Tau Ceti per tick: alien outpost, extractor ship, dan ore refinery.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';

export function fastLoopTauCetiExtraction($ctx){
        if (global.tech['isolation'] && global.tauceti['alien_outpost'] && p_on['alien_outpost']){
            let base = production('alien_outpost');
            let colony_val = 1 + ((support_on['colony'] || 0) * 0.5);

            breakdown.p['Cipher'][loc('tech_alien_outpost')] = base + 'v';
            if (base > 0){
                breakdown.p['Cipher'][`ᄂ${loc('tau_home_colony')}`] = ((colony_val - 1) * 100) + '%';
            }

            let delta = base * $ctx.global_multiplier * colony_val;
            modRes('Cipher', delta * $ctx.time_multiplier);
        }

        // Extractor Ship & Ore Refinery
        $ctx.e_ship = {};
        if (global.tauceti['ore_refinery'] && global.tauceti['mining_ship'] && global.tech['tau_roid'] && global.tech.tau_roid >= 4){
            global.tauceti.ore_refinery.max = global.tauceti.ore_refinery.count * 1000;

            // Refine Ore
            if (global.tauceti.ore_refinery.fill > 0){
                let raw = p_on['ore_refinery'] * production('ore_refinery');
                if (raw > global.tauceti.ore_refinery.fill){
                    raw = global.tauceti.ore_refinery.fill;
                }
                global.tauceti.ore_refinery.fill -= raw * $ctx.time_multiplier;

                let c_ratio = global.tech.tau_roid >= 5 ? 0.6 : 0.64;
                let u_ratio = global.tech.tau_roid >= 5 ? 0.35 : 0.36;

                $ctx.e_ship['iron'] = raw * c_ratio * (100 - global.tauceti.mining_ship.common) / 100 * production('mining_ship_ore','iron') * production('psychic_boost','Iron');
                $ctx.e_ship['aluminium'] = raw * c_ratio * global.tauceti.mining_ship.common / 100 * production('mining_ship_ore','aluminium') * production('psychic_boost','Aluminium');
                $ctx.e_ship['iridium'] = raw * u_ratio * (100 - global.tauceti.mining_ship.uncommon) / 100 * production('mining_ship_ore','iridium') * production('psychic_boost','Iridium');
                $ctx.e_ship['neutronium'] = raw * u_ratio * global.tauceti.mining_ship.uncommon / 100 * production('mining_ship_ore','neutronium') * production('psychic_boost','Neutronium');

                if (global.tech.tau_roid >= 5){
                    $ctx.e_ship['orichalcum'] = raw * 0.05 * (100 - global.tauceti.mining_ship.rare) / 10 * production('mining_ship_ore','orichalcum') * production('psychic_boost','Orichalcum');
                    $ctx.e_ship['elerium'] = raw * 0.05 * global.tauceti.mining_ship.rare / 10 * production('mining_ship_ore','elerium') * production('psychic_boost','Elerium');
                }
            }

            // Get new Ore
            let ore = support_on['mining_ship'] * production('mining_ship');
            global.tauceti.ore_refinery.fill += ore * $ctx.time_multiplier;
            if (global.tauceti.ore_refinery.fill > global.tauceti.ore_refinery.max){
                global.tauceti.ore_refinery.fill = global.tauceti.ore_refinery.max;
            }
        }
}
