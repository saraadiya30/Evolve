// Produksi Graphene per tick (plant graphene dari pohon/bahan bakar).
import { global, breakdown, p_on, support_on, int_on, quantum_level } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { govEffect } from '../../civics/gov_effect.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { syndicate } from '../../truepath/orbit_math.js';

export function fastLoopGraphene($ctx){
        // Graphene
        let graph_source = global.race['truepath'] ? 'space' : 'interstellar';
        let graph_struct = 'g_factory';
        if (global.race['warlord']){
            graph_source = 'portal'; graph_struct = 'twisted_lab';
        }
        if (global[graph_source][graph_struct] && global[graph_source][graph_struct].count > 0){
            let on_graph = global.race['truepath'] ? support_on['g_factory'] : (global.race['warlord'] ? p_on['twisted_lab'] : int_on['g_factory']);
            let max_graph = global[graph_source][graph_struct].on;
            let eff = max_graph > 0 ? on_graph / max_graph : 0;
            let remaining = max_graph;

            if (global.race['kindling_kindred'] || global.race['smoldering']){
                global[graph_source][graph_struct].Lumber = 0;
            }

            ['Oil','Coal','Lumber'].forEach(function(res){
                remaining -= global[graph_source][graph_struct][res];
                if (remaining < 0) {
                    global[graph_source][graph_struct][res] += remaining;
                    remaining = 0;
                }
            });

            let graphene_production = global[graph_source][graph_struct].Lumber + global[graph_source][graph_struct].Coal + global[graph_source][graph_struct].Oil;
            if (graphene_production > 0){
                let consume_wood = global[graph_source][graph_struct].Lumber * 350 * eff;
                let consume_coal = global[graph_source][graph_struct].Coal * 25 * eff;
                let consume_oil = global[graph_source][graph_struct].Oil * 15 * eff;

                while (consume_wood * $ctx.time_multiplier > global.resource.Lumber.amount && consume_wood > 0){
                    consume_wood -= 350 * eff;
                    graphene_production--;
                }
                while (consume_coal * $ctx.time_multiplier > global.resource.Coal.amount && consume_coal > 0){
                    consume_coal -= 25 * eff;
                    graphene_production--;
                }
                while (consume_oil * $ctx.time_multiplier > global.resource.Oil.amount && consume_oil > 0){
                    consume_oil -= 15 * eff;
                    graphene_production--;
                }

                graphene_production *= production('g_factory') * production('psychic_boost','Graphene');

                breakdown.p.consume.Lumber[global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = -(consume_wood);
                breakdown.p.consume.Coal[global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = -(consume_coal);
                breakdown.p.consume.Oil[global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = -(consume_oil);

                modRes('Lumber', -(consume_wood * $ctx.time_multiplier));
                modRes('Coal', -(consume_coal * $ctx.time_multiplier));
                modRes('Oil', -(consume_oil * $ctx.time_multiplier));

                if (global.civic.govern.type === 'corpocracy'){
                    graphene_production *= 1 + (govEffect.corpocracy()[4] / 100);
                }
                if (global.civic.govern.type === 'socialist'){
                    graphene_production *= 1 + (govEffect.socialist()[1] / 100);
                }

                let ai = 1;
                if (global.tech['ai_core'] >= 3){
                    let graph = +(quantum_level / 5).toFixed(1) / 100;
                    ai += graph * p_on['citadel'];
                }

                let incinerator = 1;
                if (global.race['warlord'] && global.portal.hasOwnProperty('incinerator') && global.portal.incinerator.rank > 1){
                    let rank = global.portal.incinerator.rank - 1;
                    incinerator += rank * 15 * global.portal.incinerator.on / 100;
                }

                let synd = global.race['truepath'] ? syndicate('spc_titan') : 1;
                let delta = graphene_production * ai * $ctx.zigVal * $ctx.hunger * $ctx.global_multiplier * synd * eff * incinerator;
                breakdown.p['Graphene'][global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_bd')] = (graphene_production) + 'v';
                if (global.tech['isolation'] && graphene_production > 0){
                    delta *= $ctx.womling_technician;
                    if ($ctx.womling_technician > 1){
                        breakdown.p['Graphene'][`ᄂ${loc('tau_red_womlings')}+0`] = (($ctx.womling_technician - 1) * 100) + '%';
                    }
                }

                if (incinerator > 1){
                    breakdown.p['Graphene'][`ᄂ${loc('portal_incinerator_title')}`] = ((incinerator - 1) * 100) + '%';
                }

                if (graphene_production > 0){
                    breakdown.p['Graphene'][`ᄂ${loc('space_syndicate')}`] = -((1 - synd) * 100) + '%';
                    breakdown.p['Graphene'][`ᄂ${loc('space_red_ziggurat_title')}`] = (($ctx.zigVal - 1) * 100) + '%';
                }

                if (global.race['discharge'] && global.race['discharge'] > 0){
                    delta *= 0.5;
                    breakdown.p['Graphene'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
                }

                if (p_on['citadel'] > 0){
                    breakdown.p['Graphene'][loc('interstellar_citadel_effect_bd')] = ((ai - 1) * 100) + '%';
                }
                breakdown.p['Graphene'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
                modRes('Graphene', delta * $ctx.time_multiplier);
            }
            else {
                breakdown.p['Graphene'] = 0;
            }
        }
}
