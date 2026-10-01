// Upeti dan bonus pemerintahan per tick: anthropology, overseer truepath, racketeer, dan pious.
import { global, breakdown, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { govActive } from '../../governor/gov_active.js';
import { loc } from '../../core/locale.js';
import { structName } from '../../actions/core/structure_ui.js';
import { templeCount } from '../../functions/temple_count.js';

export function fastLoopTribute($ctx){
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
}
