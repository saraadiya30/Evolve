// Batas morale (casino, amphitheatre, monuments), morale minimum, efek Aether/stocks, dan finalisasi morale per tick.
import { global, breakdown, p_on, support_on, int_on } from '../../core/vars.js';
import { traits, S_loops as S } from '../../core/registries.js';
import { govActive } from '../../governor/gov_active.js';
import { govEffect } from '../../civics/gov_effect.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { MORALE_BONUS_PER_LOT } from '../../stocks/stocks_core.js';

export function fastLoopMoraleCap($ctx){
        let mBaseCap = 100;
        mBaseCap += global.city['casino'] ? p_on['casino'] : 0;
        mBaseCap += global.space['spc_casino'] ? p_on['spc_casino'] : 0;
        mBaseCap += global.tauceti['tauceti_casino'] ? p_on['tauceti_casino'] : 0;
        mBaseCap += global.portal['hell_casino'] ? p_on['hell_casino'] : 0;

        if (global.city['amphitheatre']){
            let athVal = govActive('athleticism',0);
            mBaseCap += athVal ? (global.city.amphitheatre.count * athVal) : global.city.amphitheatre.count;
        }
        if (support_on['vr_center']){
            mBaseCap += support_on['vr_center'] * 2;
        }
        if (int_on['zoo'] && !global.race['fasting']){
            mBaseCap += int_on['zoo'] * 2;
        }
        if (support_on['bliss_den']){
            mBaseCap += support_on['bliss_den'] * 2;
        }
        if (p_on['resort']){
            mBaseCap += p_on['resort'] * 2;
        }
        if (global.eden['rushmore'] && global.eden.rushmore.count === 1){
            mBaseCap += 10;
        }
        if (global.tech['superstar']){
            let mcapval = global.race['high_pop'] ? highPopAdjust(1) : 1;
            mBaseCap += workerScale(global.civic.entertainer.workers,'entertainer') * mcapval;
        }
        S.moraleCap = mBaseCap;

        if (global.tech['monuments']){
            let gasVal = govActive('gaslighter',2);
            let mcap = gasVal ? (2 - gasVal) : 2;
            let monuments = global.tech.monuments;
            if (global.race['wish'] && global.race['wishStats']){
                if (global.city['wonder_lighthouse']){ monuments += 5; }
                if (global.city['wonder_pyramid']){ monuments += 5; }
                if (global.space['wonder_statue']){ monuments += 5; }
                if (global.interstellar['wonder_gardens'] || global.space['wonder_gardens'] || global.portal['wonder_gardens']){ monuments += 5; }
            }
            S.moraleCap += monuments * mcap;
        }

        if (global.civic.taxes.tax_rate < 20 && !global.race['banana']){
            S.moraleCap += 10 - Math.floor(global.civic.taxes.tax_rate / 2);
        }

        if (global.stats.achieve['joyless']){
            S.moraleCap += global.stats.achieve['joyless'].l * 2;
        }

        if (global.race['motivated']){
            let boost = Math.ceil(global.race['motivated'] ** 0.4);
            S.moraleCap += Math.round(boost / 2);
        }

        let m_min = 50;
        if (global.race['optimistic']){
            m_min += traits.optimistic.vars()[1];
        }
        if ($ctx.geckoFathom > 0){
            m_min += Math.round(traits.optimistic.vars(1)[1] * $ctx.geckoFathom);
        }
        if (global.race['truepath']){
            m_min -= 25;
        }
        if (global.civic.govern.fr > 0){
            let rev = $ctx.morale / 2;
            global.city.morale.rev = rev;
            $ctx.morale -= rev;
            m_min -= 10;
        }
        else {
            global.city.morale.rev = 0;
        }

        if (global.race['tormented']){
            if ($ctx.morale > 100){
                let excess = $ctx.morale - 100;
                excess = Math.ceil(excess * traits.tormented.vars()[0] / 100);
                $ctx.morale -= excess;
                global.city['tormented'] = excess;
            }
            else {
                global.city['tormented'] = 0;
            }
        }
        else {
            delete global.city['tormented'];
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.bad > 0){
            let badPress = Math.floor(global.race.wishStats.bad / 75) + 1;
            $ctx.morale -= badPress * 5;
        }

        global.city.morale.potential = +($ctx.morale).toFixed(1);

        let aetherMoraleMult = 1;
        if (global.prestige.hasOwnProperty('Aether') && global.settings.aetherMorale > 0){
            let draw = Math.min(global.settings.aetherMorale, global.prestige.Aether.count);
            if (draw > 0){
                global.prestige.Aether.count -= draw;
                aetherMoraleMult = 1 + (draw / 0.00000000001);
            }
        }
        S.moraleCap *= aetherMoraleMult;

        if ($ctx.morale < m_min){
            $ctx.morale = m_min;
        }
        else if ($ctx.morale > S.moraleCap){
            let gasVal = govActive('gaslighter',3) || 0;
            $ctx.morale = S.moraleCap + ($ctx.morale - S.moraleCap) * gasVal / 100;
        }
        $ctx.morale *= aetherMoraleMult;
        // Stock portfolio morale bonus: a flat +0.1 Morale per lot held, added to the current value (not the cap),
        // recomputed fresh every time morale is computed - so selling lots removes the bonus on the very next
        // calculation, the same way the production and storage bonuses above track your current holdings rather
        // than a one-off transaction.
        if (global.stocks && global.stocks.market && global.stocks.market.Morale && global.stocks.market.Morale.lots > 0){
            $ctx.morale += global.stocks.market.Morale.lots * MORALE_BONUS_PER_LOT;
            // The bonus is added after the cap clamp above, so it can push morale past moraleCap on its own -
            // clamp again here so current never actually exceeds the cap it's displayed next to.
            $ctx.morale = Math.min($ctx.morale, S.moraleCap);
        }
        global.city.morale.cap = S.moraleCap;
        global.city.morale.current = $ctx.morale;

        if (global.city.morale.current < 100){
            if (global.race['blissful']){
                let mVal = global.city.morale.current - 100;
                let bliss = traits.blissful.vars()[0] / 100;
                $ctx.global_multiplier *= 1 + (mVal * bliss / 100);
                breakdown.p['Global'][loc('morale')] = (mVal * bliss) + '%';
            }
            else {
                $ctx.global_multiplier *= global.city.morale.current / 100;
                breakdown.p['Global'][loc('morale')] = +(global.city.morale.current - 100).toFixed(2) + '%';
            }
        }
        else {
            $ctx.global_multiplier *= 1 + ((global.city.morale.current - 100) / 200);
            breakdown.p['Global'][loc('morale')] = +((global.city.morale.current - 100) / 2).toFixed(2) + '%';
        }

        if (global.race['lazy'] && global.city.calendar.temp === 2){
            breakdown.p['Global'][loc('trait_lazy_bd')] = '-' + traits.lazy.vars()[0] + '%';
            $ctx.global_multiplier *= 1 - (traits.lazy.vars()[0] / 100);
        }
        if (global.race['distracted']){
            breakdown.p['Global'][loc('event_m_curious3_bd')] = '-5%';
            $ctx.global_multiplier *= 0.95;
        }
        if (global.race['stimulated']){
            breakdown.p['Global'][loc('event_m_curious4_bd')] = '+10%';
            $ctx.global_multiplier *= 1.1;
        }

        if (global.civic.govern.type === 'dictator'){
            breakdown.p['Global'][loc('wish_dictator')] = `+${govEffect.dictator()[1]}%`;
            $ctx.global_multiplier *= 1 + (govEffect.dictator()[1] / 100);
        }

        if (global.race['selenophobia']){
            let moon = global.city.calendar.moon > 14 ? 28 - global.city.calendar.moon : global.city.calendar.moon;
            breakdown.p['Global'][loc('moon_phase')] = (-(moon) + traits.selenophobia.vars()[0]) + '%';
            moon = 1 + (traits.selenophobia.vars()[0] / 100) - (moon / 100);
            $ctx.global_multiplier *= moon;
        }
}
