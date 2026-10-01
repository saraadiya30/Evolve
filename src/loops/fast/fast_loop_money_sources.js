// Sumber uang per tick: casino, tourist center, bazaar/spire, tau cultural center, junk sale, gravity well teamster, plus label hunger.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { govActive } from '../../governor/gov_active.js';
import { govEffect } from '../../civics/gov_effect.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';
import { astroVal } from '../../functions/astrology.js';
import { structName } from '../../actions/core/structure_ui.js';
import { casinoEarn } from '../../actions/challenge/challenge_rules.js';
import { templeCount } from '../../functions/temple_count.js';
import { jobName } from '../../civics/jobs/job_name.js';

export function fastLoopMoneySources($ctx){
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
}
