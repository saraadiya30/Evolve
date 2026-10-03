import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes, eventActive, vBind } from '../../functions/functions.js';
import { traits, fathomCheck } from '../../races/races.js';
import { govActive } from '../../governor/governor.js';
import { govEffect } from '../../civics/civics.js';
import { highPopAdjust, production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { craftCost, craftingRatio } from '../../resources/resources.js';
import { tradeRatio } from '../../config/trade.js';
import { astroVal } from '../../systems/seasons.js';
import { actions, structName, drawTech, casinoEarn, templeCount } from '../../actions/actions.js';
import { jobScale, workerScale, jobName } from '../../civics/jobs.js';
import { renderSpace } from '../../space/space.js';
import { POWER_BONUS_PER_LOT } from '../../stocks/stocks_core.js';
import { firstRun } from '../../main.js';

// Bagian dari fastLoopCore (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function fastLoopCore_s14($ctx){
        if (global.tech['gambling'] && (p_on['casino'] || p_on['spc_casino'] || p_on['tauceti_casino'] || p_on['hell_casino'])){
            let casinos = 0;
            if (p_on['casino']){ casinos += p_on['casino']; }
            if (p_on['spc_casino']){ casinos += p_on['spc_casino']; }
            if (p_on['tauceti_casino']){ casinos += p_on['tauceti_casino']; }
            if (p_on['hell_casino']){ casinos += p_on['hell_casino']; }

            let cash = casinos * casinoEarn();
            breakdown.p['Money'][structName('casino')] = cash + 'v';
            modRes('Money', +(cash * $ctx.time_multiplier * $ctx.global_multiplier * $ctx.hunger).toFixed(2));
            $ctx.rawCash += cash * $ctx.global_multiplier * $ctx.hunger;
        }

        if (global.city['tourist_center'] && global.city['tourist_center'].on && !global.race['fasting'] && !global.race['warlord']){
            let tourism = 0;
            let amp = global.tech['monument'] && global.tech.monument >= 3 && p_on['s_gate'] ? 3 : 1;
            if (global.city['amphitheatre']){
                tourism += global.city['tourist_center'].on * global.city.amphitheatre.count * amp;
            }
            if (global.city['casino']){
                tourism += global.city['tourist_center'].on * global.city.casino.count * 5 * amp;
            }
            if (global.space['spc_casino']){
                tourism += global.city['tourist_center'].on * global.space.spc_casino.count * 5 * amp;
            }
            if (global.tech['monuments']){
                let monuments = global.tech.monuments;
                if (global.race['wish'] && global.race['wishStats']){
                    if (global.city['wonder_lighthouse']){ monuments += 5; }
                    if (global.city['wonder_pyramid']){ monuments += 5; }
                    if (global.space['wonder_statue']){ monuments += 5; }
                    if (global.interstellar['wonder_gardens'] || global.space['wonder_gardens']){ monuments += 5; }
                }
                tourism += global.city['tourist_center'].on * monuments * 2 * amp;
            }
            if (global.city['trade'] && global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 4){
                tourism += global.city['tourist_center'].on * global.city.trade.count * 3 * amp;
            }
            let piousVal = govActive('pious',1);
            if (piousVal && global.city['temple']){
                tourism += global.city['tourist_center'].on * templeCount() * piousVal * amp;
            }
            if (global.civic.govern.type === 'corpocracy'){
                tourism *= 1 + (govEffect.corpocracy()[2] / 100);
            }
            if (global.civic.govern.type === 'socialist'){
                tourism *= 1 - (govEffect.socialist()[3] / 100);
            }
            if ($ctx.astroSign === 'aquarius'){
                tourism *= 1 + (astroVal('aquarius')[0] / 100);
            }
            tourism *= production('psychic_cash');
            breakdown.p['Money'][loc('tech_tourism')] = Math.round(tourism) + 'v';
            if ($ctx.astroSign === 'aquarius'){
                breakdown.p['Money'][`ᄂ${loc('sign_aquarius')}`] = astroVal('aquarius')[0] + '%';
            }
            modRes('Money', +(tourism * $ctx.time_multiplier * $ctx.global_multiplier * $ctx.hunger).toFixed(2));
            $ctx.rawCash += tourism * $ctx.global_multiplier * $ctx.hunger;
        }

        if (global.portal['bazaar'] && global.portal['spire'] && global.tech['monuments']){
            let monuments = global.tech.monuments;
            if (global.race['wish'] && global.race['wishStats'] && global.portal['wonder_gardens']){
                 monuments += 5;
            }
            let revenue = global.portal.bazaar.count * monuments * global.portal.spire.count;
            revenue *= production('psychic_cash');

            breakdown.p['Money'][loc('portal_bazaar_title')] = Math.round(revenue) + 'v';
            if ($ctx.astroSign === 'aquarius'){
                revenue *= 1 + (astroVal('aquarius')[0] / 100);
                breakdown.p['Money'][`ᄂ${loc('sign_aquarius')}`] = astroVal('aquarius')[0] + '%';
            }

            modRes('Money', +(revenue * $ctx.time_multiplier * $ctx.global_multiplier * $ctx.hunger).toFixed(2));
            $ctx.rawCash += revenue * $ctx.global_multiplier * $ctx.hunger;
        }

        if (global.tauceti['tau_cultural_center']){
            let revenue = 0;
            if (global.tauceti['tauceti_casino']){
                revenue += p_on['tau_cultural_center'] * p_on['tauceti_casino'] * 20;
            }
            if (global.tech['monuments']){
                let monuments = global.tech.monuments;
                if (global.race['wish'] && global.race['wishStats']){
                    if (global.city['wonder_lighthouse']){ monuments += 5; }
                    if (global.city['wonder_pyramid']){ monuments += 5; }
                    if (global.space['wonder_statue']){ monuments += 5; }
                    if (global.interstellar['wonder_gardens'] || global.space['wonder_gardens']){ monuments += 5; }
                }
                revenue += p_on['tau_cultural_center'] * monuments * 5;
            }
            if (global.tech['tau_culture'] && global.tech.tau_culture >= 2){
                revenue += p_on['tau_cultural_center'] * support_on['colony'] * 15;
            }
            if (global.civic.govern.type === 'corpocracy'){
                revenue *= 1 + (govEffect.corpocracy()[2] / 100);
            }
            else if (global.civic.govern.type === 'socialist'){
                revenue *= 1 - (govEffect.socialist()[3] / 100);
            }
            revenue *= production('psychic_cash');
            breakdown.p['Money'][loc('tech_cultural_center')] = Math.round(revenue) + 'v';
            if ($ctx.astroSign === 'aquarius'){
                revenue *= 1 + (astroVal('aquarius')[0] / 100);
                breakdown.p['Money'][`ᄂ${loc('sign_aquarius')}`] = astroVal('aquarius')[0] + '%';
            }
            modRes('Money', +(revenue * $ctx.time_multiplier * $ctx.global_multiplier * $ctx.hunger).toFixed(2));
            $ctx.rawCash += revenue * $ctx.global_multiplier * $ctx.hunger;
        }

        if (global.tech['tau_junksale']){
            let revenue = support_on['womling_village'] * 40;
            let culture = p_on['tau_cultural_center'] ? 1 + (p_on['tau_cultural_center'] * 0.08) : 1;
            breakdown.p['Money'][loc('tau_red_womling_village')] = Math.round(revenue) + 'v';
            breakdown.p['Money'][`ᄂ${loc('tech_cultural_center')}+1`] = ((culture - 1) * 100) + '%';
            modRes('Money', +(revenue * culture * $ctx.time_multiplier * $ctx.global_multiplier * $ctx.hunger).toFixed(2));
            $ctx.rawCash += revenue * culture * $ctx.global_multiplier * $ctx.hunger;
        }

        if (global.race['gravity_well'] && global.tech['teamster'] && global.tech.teamster >= 2){
            let teamsters = global.civic.teamster.workers;
            let revenue = teamsters * $ctx.rawCash * 0.01;
            breakdown.p['Money'][jobName('teamster')] = Math.round(revenue / $ctx.global_multiplier) + 'v';
            // Allow quadratic hunger penalty, but remove quadratic global production bonus
            modRes('Money', +(revenue * $ctx.time_multiplier * $ctx.hunger).toFixed(2));
            $ctx.rawCash += revenue * $ctx.hunger;
        }
        breakdown.p['Money'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';

        if (global.tech['anthropology'] && global.tech['anthropology'] >= 4 && global.race['truepath']){
            let merchsales = global.resource[global.race.species].amount * templeCount() * 0.08;
            breakdown.p['Money'][structName('temple')] = (merchsales) + 'v';
            modRes('Money', +(merchsales * $ctx.global_multiplier * $ctx.time_multiplier).toFixed(2));
            $ctx.rawCash += merchsales * $ctx.global_multiplier;
        }

        // Tribute
        if (global.race['truepath'] && global.tauceti['overseer']){
            let rate = (global.tauceti.overseer.loyal + global.tauceti.overseer.morale) / 200;
            let pop = global.tauceti.overseer.pop;
            if (p_on['womling_station']){
                pop += p_on['womling_station'] * 2;
            }
            let base = pop * rate * (global.tech['isolation'] ? 25 : 12);
            let culture = p_on['tau_cultural_center'] ? 1 + (p_on['tau_cultural_center'] * 0.08) : 1;
            let delta = base * $ctx.global_multiplier * culture;

            breakdown.p['Money'][loc('tau_red_womlings')] = base + 'v';
            breakdown.p['Money'][`ᄂ${loc('tech_cultural_center')}`] = ((culture - 1) * 100) + '%';
            modRes('Money', +(delta * $ctx.time_multiplier).toFixed(2));
            $ctx.rawCash += delta;
        }

        {
            let racVal = govActive('racketeer',0);
            if (racVal){
                let theft = -(Math.round($ctx.rawCash * (racVal / 100)));
                breakdown.p.consume.Money[loc('gov_trait_racketeer_bd')] = theft;
                modRes('Money', +(theft * $ctx.time_multiplier).toFixed(2));
            }
        }

        {
            let psVal = govActive('pious',0);
            if (psVal){
                let tithe = -(Math.round($ctx.rawCash * (psVal / 100)));
                breakdown.p.consume.Money[loc('gov_trait_pious_bd')] = tithe;
                modRes('Money', +(tithe * $ctx.time_multiplier).toFixed(2));
            }
        }

        // Crafting
        if (global.tech['foundry']){
            let craft_costs = global.race['resourceful'] ? (1 - traits.resourceful.vars()[0] / 100) : 1;
            let arraakFathom = fathomCheck('arraak');
            if (arraakFathom > 0){
                craft_costs -= traits.resourceful.vars(1)[0] / 100 * arraakFathom;
            }
            let crafting_costs = craftCost();
            let crafting_usage = {};

            craftingRatio('','',true); //Recalculation
            Object.keys(crafting_costs).forEach(function (craft){
                if (craft === 'Thermite' && !eventActive('summer')){
                    return;
                }
                breakdown.p[craft] = {};
                let num = workerScale(global.city.foundry[craft],'craftsman');
                if (global.race['servants'] && global.race.servants.hasOwnProperty('sjobs') && global.race.servants.sjobs.hasOwnProperty(craft)){
                    num += jobScale(global.race.servants.sjobs[craft]);
                }
                let craft_ratio = craftingRatio(craft,'auto').multiplier;

                let speed = global.genes['crafty'] ? 2 : 1;
                let volume = Math.floor(global.resource[crafting_costs[craft][0].r].amount / (crafting_costs[craft][0].a * speed * craft_costs / 140));
                for (let i=1; i<crafting_costs[craft].length; i++){
                    let temp = Math.floor(global.resource[crafting_costs[craft][i].r].amount / (crafting_costs[craft][i].a * speed * craft_costs / 140));
                    if (temp < volume){
                        volume = temp;
                    }
                }
                if (num < volume){
                    volume = num;
                }

                for (let i=0; i<crafting_costs[craft].length; i++){
                    let final = volume * crafting_costs[craft][i].a * craft_costs * speed * $ctx.time_multiplier / 140;
                    modRes(crafting_costs[craft][i].r, -(final));
                    if (typeof crafting_usage[crafting_costs[craft][i].r] === 'undefined'){
                        crafting_usage[crafting_costs[craft][i].r] = final / $ctx.time_multiplier;
                    }
                    else {
                        crafting_usage[crafting_costs[craft][i].r] += final / $ctx.time_multiplier;
                    }
                }

                if (global.race['high_pop']){
                    volume = highPopAdjust(volume);
                }

                breakdown.p[craft][jobName('craftsman')] = (volume * speed / 140) + 'v';

                modRes(craft, craft_ratio * volume * speed * $ctx.time_multiplier / 140 * production('psychic_boost',craft));
            });

            Object.keys(crafting_usage).forEach(function (used){
                if (crafting_usage[used] > 0){
                    breakdown.p.consume[used][jobName('craftsman')] = -(crafting_usage[used]);
                }
            });
        }

        // Detect new unlocks
        if (!global.settings.showResearch && (global.resource.Lumber.amount >= 5 || global.resource.Stone.amount >= 6)){
            global.settings.showResearch = true;
        }

        // Stock portfolio power bonus: a flat +1 Power (Watt) per lot held, added the same way as the morale
        // bonus above - recomputed every tick from current holdings, so selling lots takes the Power away again.
        if (global.stocks && global.stocks.market.Power && global.stocks.market.Power.lots > 0){
            $ctx.power_grid += global.stocks.market.Power.lots * POWER_BONUS_PER_LOT;
        }
        // Power grid state
        global.city.power_total = -$ctx.max_power;
        global.city.power = $ctx.power_grid;
        if (global.city.power < 0){
            $('#powerMeter').addClass('low');
            $('#powerMeter').removeClass('neutral');
            $('#powerMeter').removeClass('high');
        }
        else if (global.city.power > 0){
            $('#powerMeter').removeClass('low');
            $('#powerMeter').removeClass('neutral');
            $('#powerMeter').addClass('high');
        }
        else {
            $('#powerMeter').removeClass('low');
            $('#powerMeter').addClass('neutral');
            $('#powerMeter').removeClass('high');
        }

        if (p_on['world_controller'] && p_on['world_controller'] > 0){
            if (global.tech['wsc'] === 0){
                global.tech['wsc'] = 1;
                drawTech();
            }
        }
        else if (global.tech['wsc'] !== 0){
            global.tech['wsc'] = 0;
            drawTech();
        }

        if (global.tech['portal'] >= 2){
            if (global.portal.fortress.garrison > 0){
                global.tech['portal_guard'] = 1;
            }
            else {
                global.tech['portal_guard'] = 0;
            }
        }

        if (global.race['decay']){
            Object.keys(tradeRatio).forEach(function (res) {
                if (global.resource[res].amount > 50){
                    let decay = +((global.resource[res].amount - 50) * (0.001 * tradeRatio[res])).toFixed(3);
                    modRes(res, -(decay * $ctx.time_multiplier));
                    breakdown.p.consume[res][loc('evo_challenge_decay')] = -(decay);
                }
                else {
                    delete breakdown.p.consume[res][loc('evo_challenge_decay')];
                }
            });
        }

        if (global.resource.Asphodel_Powder.display){
            if (global.resource.Asphodel_Powder.amount > 0){
                let decay = +((global.resource.Asphodel_Powder.amount) * 0.0045).toFixed(3);

                let stabilize = 0.92;
                if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                    let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                    heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                    if (heatSink > 0){
                        let coefficent = 0.08 * (1 + (heatSink / 17500));
                        stabilize = 1 - coefficent;
                    }
                }
                if (global.race['warlord'] && global.eden['corruptor'] && p_on['corruptor']){
                    stabilize -= 0.004 * p_on['corruptor'];
                }
                if (stabilize < 0.01){ stabilize = 0.01; }

                if (global.eden['stabilizer']){
                    decay *= stabilize ** global.eden.stabilizer.count;
                }
                modRes('Asphodel_Powder', -(decay * $ctx.time_multiplier));
                breakdown.p.consume.Asphodel_Powder[loc('evo_challenge_decay')] = -(decay);
            }
            else {
                delete breakdown.p.consume.Asphodel_Powder[loc('evo_challenge_decay')];
            }
        }

        if (firstRun){
            if (global.tech['piracy']){
                renderSpace();
            }
            if (global.settings.portal.ruins){
                vBind({el: `#srprtl_ruins`},'update');
                vBind({el: `#foundry`},'update');
            }
            if (global.settings.portal.gate){
                vBind({el: `#srprtl_gate`},'update');
            }
        }
}
