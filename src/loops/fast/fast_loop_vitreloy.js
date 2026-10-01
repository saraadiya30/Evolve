// Produksi Vitreloy per tick: vitreloy plant, shadow mine, dan raider gate.
import { global, breakdown, gal_on, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { piracy } from '../../space/space_requirements.js';

export function fastLoopVitreloy($ctx){
        // Vitreloy
        if (global.galaxy['vitreloy_plant'] && p_on['vitreloy_plant'] > 0){

            let consume_money = 50000;
            let consume_bolognium = 2.5;
            let consume_stanene = 100;
            let vitreloy_production = p_on['vitreloy_plant'];

            vitreloy_production = Math.min(vitreloy_production, Math.floor(global.resource.Money.amount / (consume_money * $ctx.time_multiplier)));
            vitreloy_production = Math.min(vitreloy_production, Math.floor(global.resource.Bolognium.amount / (consume_bolognium * $ctx.time_multiplier)));
            vitreloy_production = Math.min(vitreloy_production, Math.floor(global.resource.Stanene.amount / (consume_stanene * $ctx.time_multiplier)));
            vitreloy_production = Math.max(vitreloy_production, 0);

            if (vitreloy_production > 0){
                consume_money *= vitreloy_production;
                consume_bolognium *= vitreloy_production;
                consume_stanene *= vitreloy_production;
                vitreloy_production *= production('vitreloy_plant') * production('psychic_boost','Vitreloy');

                breakdown.p.consume.Money[loc('galaxy_vitreloy_plant_bd')] = -(consume_money);
                breakdown.p.consume.Bolognium[loc('galaxy_vitreloy_plant_bd')] = -(consume_bolognium);
                breakdown.p.consume.Stanene[loc('galaxy_vitreloy_plant_bd')] = -(consume_stanene);

                modRes('Money', -(consume_money * $ctx.time_multiplier));
                modRes('Bolognium', -(consume_bolognium * $ctx.time_multiplier));
                modRes('Stanene', -(consume_stanene * $ctx.time_multiplier));

                let pirate = piracy('gxy_alien1');

                breakdown.p['Vitreloy'][loc('galaxy_vitreloy_plant_bd')] = (vitreloy_production) + 'v';

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    vitreloy_production *= 0.5;
                    breakdown.p['Vitreloy'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (vitreloy_production > 0){
                    breakdown.p['Vitreloy'][`ᄂ${loc('galaxy_piracy')}+0`] = -((1 - pirate) * 100) + '%';
                    breakdown.p['Vitreloy'][`ᄂ${loc('space_red_ziggurat_title')}+0`] = (($ctx.zigVal - 1) * 100) + '%';
                }
                modRes('Vitreloy', vitreloy_production * $ctx.hunger * $ctx.global_multiplier * pirate * $ctx.time_multiplier * $ctx.zigVal);
            }
        }

        if (p_on['shadow_mine']){
            let attract = p_on['soul_attractor'] ? 1 + (p_on['soul_attractor'] * (global.tech.pitspawn >= 3 ? 0.2 : 0.1)) : 1;

            if (global.resource.Vitreloy.display){ // Vitreloy
                let rate = production('shadow_mine','vitreloy');
                let mine_base = p_on['shadow_mine'] * rate * production('psychic_boost','Vitreloy');
                let mine_delta = mine_base * attract * $ctx.global_multiplier;

                if (mine_base > 0){
                    breakdown.p['Vitreloy'][loc('portal_shadow_mine_title')] = mine_base + 'v';
                    breakdown.p['Vitreloy'][`ᄂ${loc('portal_soul_attractor_title')}+0`] = ((attract - 1) * 100) + '%';
                }
                modRes('Vitreloy', mine_delta * $ctx.time_multiplier);
            }
            
            if (global.resource.Elerium.display){ // Elerium
                let rate = production('shadow_mine','elerium');
                let mine_base = p_on['shadow_mine'] * rate * production('psychic_boost','Elerium');

                let mine_delta = mine_base * attract * $ctx.global_multiplier;

                if (mine_base > 0){
                    breakdown.p['Elerium'][loc('portal_shadow_mine_title')] = mine_base + 'v';
                    breakdown.p['Elerium'][`ᄂ${loc('portal_soul_attractor_title')}+0`] = ((attract - 1) * 100) + '%';
                }
                modRes('Elerium', mine_delta * $ctx.time_multiplier);
            }

            if (global.resource.Infernite.display){ // Infernite
                let rate = production('shadow_mine','infernite');
                let mine_base = p_on['shadow_mine'] * rate * production('psychic_boost','Infernite');

                let mine_delta = mine_base * attract * $ctx.global_multiplier;

                if (mine_base > 0){
                    breakdown.p['Infernite'][loc('portal_shadow_mine_title')] = mine_base + 'v';
                    breakdown.p['Infernite'][`ᄂ${loc('portal_soul_attractor_title')}+0`] = ((attract - 1) * 100) + '%';
                }
                modRes('Infernite', mine_delta * $ctx.time_multiplier);
            }
        }

        if (p_on['s_gate'] && global.galaxy['raider'] && gal_on['raider'] > 0){
            let base = gal_on['raider'] * 0.05 * production('psychic_boost','Vitreloy');
            let pirate = piracy('gxy_chthonian');
            let delta = base * $ctx.global_multiplier * pirate * $ctx.hunger * $ctx.zigVal;

            breakdown.p['Vitreloy'][loc('galaxy_raider')] = base + 'v';
            if (base > 0){
                breakdown.p['Vitreloy'][`ᄂ${loc('galaxy_piracy')}+1`] = -((1 - pirate) * 100) + '%';
                breakdown.p['Vitreloy'][`ᄂ${loc('space_red_ziggurat_title')}+1`] = (($ctx.zigVal - 1) * 100) + '%';
            }
            modRes('Vitreloy', delta * $ctx.time_multiplier);
        }
        breakdown.p['Vitreloy'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
}
