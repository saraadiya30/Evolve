// Hiburan, stress, dan pajak untuk morale per tick (theatre, broadcast, zoo, tavern, pemerintahan, tax rate). Melanjutkan fastLoopMorale. Dulu ujung fastLoopCore_s4 dan awal fastLoopCore_s5.
import { global, p_on, support_on, int_on } from '../../core/vars.js';
import { eventActive } from '../../functions/event_dates.js';
import { traits } from '../../core/registries.js';
import { govActive } from '../../governor/gov_active.js';
import { govEffect } from '../../civics/gov_effect.js';
import { astroVal } from '../../functions/astrology.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';

export function fastLoopMoraleEntertainment($ctx){
        $ctx.entertainment = 0;

        if (global.tech['theatre'] && !global.race['joyless']){
            $ctx.entertainment += workerScale(global.civic.entertainer.workers,'entertainer') * global.tech.theatre;
            if (global.race['musical']){
                $ctx.entertainment += workerScale(global.civic.entertainer.workers,'entertainer') * traits.musical.vars()[0];
            }
            if ($ctx.astroSign === 'sagittarius'){
                $ctx.entertainment *= 1 + (astroVal('sagittarius')[0] / 100);
            }
            if (global.race['emotionless']){
                $ctx.entertainment *= 1 - (traits.emotionless.vars()[0] / 100);
            }
            if (global.race['high_pop']){
                $ctx.entertainment *= traits.high_pop.vars()[1] / 100;
            }
        }
        if (global.civic.govern.type === 'democracy'){
            let democracy = 1 + (govEffect.democracy()[0] / 100);
            $ctx.entertainment *= democracy;
        }
        global.city.morale.entertain = $ctx.entertainment;
        $ctx.morale += $ctx.entertainment;

        if (global.tech['broadcast'] && !global.race['joyless']){
            let gasVal = govActive('gaslighter',0) || 0;
            let signalVal;
            let mVal = gasVal + global.tech.broadcast;
            if (global.race['orbit_decayed']) {
                signalVal = p_on['nav_beacon'] || 0;
                mVal /= 2; // 50% effectiveness also applies to Media governor
            }
            else if (global.tech['isolation'] && global.race['truepath']){
                signalVal = support_on['colony'];
                mVal *= 2;
            }
            else {
                signalVal = p_on['wardenclyffe'];
            }
            global.city.morale.broadcast = signalVal * mVal;
            $ctx.morale += signalVal * mVal;
        }
        else {
            global.city.morale.broadcast = 0;
        }
        if (support_on['vr_center'] && !global.race['joyless']){
            let gasVal = govActive('gaslighter',1) || 0;
            let vr_morale = gasVal + 1;
            if (global.race['orbit_decayed']){
                vr_morale += 2;
            }
            global.city.morale.vr = support_on['vr_center'] * vr_morale;
            $ctx.morale += support_on['vr_center'] * vr_morale;
        }
        else {
            global.city.morale.vr = 0;
        }
        if (int_on['zoo'] && !global.race['fasting']){
            global.city.morale.zoo = int_on['zoo'] * 5;
            $ctx.morale += int_on['zoo'] * 5;
        }
        else {
            global.city.morale.zoo = 0;
        }
        if (p_on['tavern'] && !global.race['joyless']){
            global.city.morale.tavern = p_on['tavern'] * p_on['shadow_mine'] * 0.35;
            $ctx.morale += p_on['tavern'] * p_on['shadow_mine'] * 0.35;
        }
        else {
            global.city.morale.tavern = 0;
        }
        if (support_on['bliss_den'] && !global.race['joyless']){
            global.city.morale.bliss_den = support_on['bliss_den'] * 8;
            $ctx.morale += support_on['bliss_den'] * 8;
        }
        else {
            global.city.morale.bliss_den = 0;
        }
        if (p_on['restaurant'] && !global.race['fasting'] && !global.race['joyless']){
            let val = 0;
            val += global.eden.hasOwnProperty('pillbox') && p_on['pillbox'] ? 0.35 * p_on['pillbox'] : 0;
            val += global.civic.elysium_miner.workers * 0.15;
            val += global.eden.hasOwnProperty('archive') && p_on['archive'] ? 0.4 * p_on['archive'] : 0;
            global.city.morale.restaurant = p_on['restaurant'] * val;
            $ctx.morale += p_on['restaurant'] * val;
        }
        else {
            global.city.morale.restaurant = 0;
        }
        if (eventActive('summer')){
            let boost = (global.resource.Thermite.diff * 2.5) / (global.resource.Thermite.diff * 2.5 + 500) * 500;
            global.city.morale['bonfire'] = boost;
            $ctx.morale += boost;
        }
        else {
            delete global.city.morale['bonfire'];
        }

        if (global.civic.govern.type === 'anarchy'){
            $ctx.stress /= 2;
        }
        if (global.civic.govern.type === 'autocracy'){
            $ctx.stress *= 1 + (govEffect.autocracy()[0] / 100);
        }
        if (global.civic.govern.type === 'socialist'){
            $ctx.stress *= 1 + (govEffect.socialist()[2] / 100);
        }
        if (global.race['emotionless']){
            $ctx.stress *= 1 - (traits.emotionless.vars()[1] / 100);
        }
        for (let i=0; i<3; i++){
            if (global.civic.govern.type !== 'federation' && global.civic.foreign[`gov${i}`].anx){
                $ctx.stress *= 1.1;
            }
        }

        if (global.civic.govern.type === 'dictator'){
            $ctx.stress *= 1 + (govEffect.dictator()[0] / 100);
        }

        $ctx.stress = +($ctx.stress).toFixed(1);
        global.city.morale.stress = $ctx.stress;
        $ctx.morale += $ctx.stress;

        global.city.morale.tax = 20 - global.civic.taxes.tax_rate;
        $ctx.morale -= global.civic.taxes.tax_rate - 20;
        if (global.civic.taxes.tax_rate > 40){
            let high_tax = global.civic.taxes.tax_rate - 40;
            global.city.morale.tax -= high_tax * 0.5;
            $ctx.morale -= high_tax * 0.5;
        }
        if (global.civic.govern.type === 'oligarchy' && global.civic.taxes.tax_rate > 20){
            let high_tax = global.civic.taxes.tax_rate - 20;
            global.city.morale.tax += high_tax * 0.5;
            $ctx.morale += high_tax * 0.5;
        }

        if (((global.civic.govern.type !== 'autocracy' && !global.race['blood_thirst']) || global.race['immoral']) && global.civic.garrison.protest + global.civic.garrison.fatigue > 2){
            let immoral = global.race['immoral'] ? 1 + (traits.immoral.vars()[0] / 100) : 1;
            let warmonger = Math.round(Math.log2(global.civic.garrison.protest + global.civic.garrison.fatigue) * immoral);
            global.city.morale.warmonger = global.race['immoral'] ? warmonger : -(warmonger);
            $ctx.morale += global.city.morale.warmonger;
        }
        else {
            global.city.morale.warmonger = 0;
        }
}
