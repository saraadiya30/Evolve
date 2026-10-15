// Morale dan stress per tick: musim, cuaca, pemerintahan, trait, pet, garnisun. Mengisi $ctx.morale, $ctx.stress, dan pengali quarantine.
import { global } from '../../core/vars.js';
import { shrineBonusActive, getShrineBonus } from '../../functions/run_stats_helpers.js';
import { zigguratBonus } from '../../space/planet_generation.js';
import { SPRING_MORALE_BONUS, WINTER_MORALE_PENALTY, VAX_C_MORALE_PENALTY, VAX_F_MORALE_PENALTY, VAX_S_MORALE_BONUS, MORALE_BOOST_TECH_BONUS, THUNDERSTORM_MORALE_PENALTY, RAIN_MORALE_PENALTY, SUNNY_MORALE_BONUS } from '../../config/constants.js';
import { traits } from '../../core/registries.js';
import { planetTraits } from '../../races/planet_data.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { govActive } from '../../governor/gov_active.js';
import { govEffect } from '../../civics/gov_effect.js';
import { petMorale, moraleBegin, moraleAdd, MORALE_LABEL_CHEESE } from '../../systems/morale_core.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';

export function fastLoopMorale($ctx){
        $ctx.zigVal = zigguratBonus();
        moraleBegin($ctx);
        $ctx.q_multiplier = 1;
        $ctx.qs_multiplier = 1;
        if (global.race['quarantine'] && global.race['qDays']){
            let qDays = 1 - ((global.race.qDays <= 1000 ? global.race.qDays : 1000) / 1000);
            switch (global.race.quarantine){
                case 1:
                    $ctx.q_multiplier = 0.5 + (0.5 * qDays);
                    break;
                case 2:
                    $ctx.q_multiplier = 0.25 + (0.25 * qDays);
                    $ctx.qs_multiplier = 0.5 + (0.5 * qDays);
                    break;
                case 3:
                    $ctx.q_multiplier = 0.1 + (0.15 * qDays);
                    $ctx.qs_multiplier = 0.25 + (0.25 * qDays);
                    break;
                case 4:
                    $ctx.q_multiplier = 0.08 + (0.02 * qDays);;
                    $ctx.qs_multiplier = 0.12 + (0.13 * qDays);;
                    break;
            }

            if (global.race['vax'] && global.tech['focus_cure'] && global.tech.focus_cure >= 4){
                let vax = +global.race.vax.toFixed(2) / 100;
                if (vax > 1){ vax = 1; }
                $ctx.q_multiplier = $ctx.q_multiplier + ((1 - $ctx.q_multiplier) * vax);
                $ctx.qs_multiplier = $ctx.qs_multiplier + ((1 - $ctx.qs_multiplier) * vax);
            }
        }

        if (global.city.calendar.season === 0 && global.city.calendar.year > 0){ // Spring
            let spring = global.race['chilled'] || global.race['smoldering'] ? 0 : SPRING_MORALE_BONUS;
            moraleAdd($ctx, 'morale_spring', spring);
            global.city.morale.season = spring;
        }
        else if (global.city.calendar.season === 1 && global.race['smoldering']){ // Summer
            moraleAdd($ctx, 'morale_summer', traits.smoldering.vars()[0]);
            global.city.morale.season = traits.smoldering.vars()[0];
        }
        else if (global.city.calendar.season === 3){ // Winter
            if (global.race['chilled']){
                moraleAdd($ctx, 'morale_winter', traits.chilled.vars()[0]);
                global.city.morale.season = traits.chilled.vars()[0];
            }
            else {
                moraleAdd($ctx, 'morale_winter', global.race['leathery'] ? -(traits.leathery.vars()[0]) : -WINTER_MORALE_PENALTY);
                global.city.morale.season = global.race['leathery'] ? -(traits.leathery.vars()[0]) : -WINTER_MORALE_PENALTY;
            }
        }
        else {
            global.city.morale.season = 0;
        }

        if (global.race['cheese']){
            let raw_cheese = global.stats.hasOwnProperty('reset') ? global.stats.reset + 1 : 1;
            let cheese = +(raw_cheese / (raw_cheese + 10) * 11).toFixed(2);
            moraleAdd($ctx, MORALE_LABEL_CHEESE, cheese, { prec: 2 });
        }

        if (global.civic['homeless']){
            moraleAdd($ctx, 'homeless', -(global.civic.homeless / 2));
        }

        if (global.tech['vax_c'] || global.tech['vax_f']){
            moraleAdd($ctx, global.tech['vax_c'] ? 'tech_vax_strat4_bd' : 'tech_vax_strat2_bd', -(global.tech['vax_c'] ? VAX_C_MORALE_PENALTY : VAX_F_MORALE_PENALTY));
        }
        else if (global.tech['vax_s']){
            moraleAdd($ctx, 'tech_vax_strat3_bd', VAX_S_MORALE_BONUS);
        }

        if (global.tech['m_boost']){
            global.city.morale.leadership = MORALE_BOOST_TECH_BONUS;
            moraleAdd($ctx, 'morale_leadership', MORALE_BOOST_TECH_BONUS);
        }
        else {
            global.city.morale.leadership = 0;
        }

        if (shrineBonusActive()){
            let shrineMorale = getShrineBonus('morale');
            global.city.morale.shrine = shrineMorale.add;
            moraleAdd($ctx, 'morale_shrine', shrineMorale.add);
        }
        else {
            global.city.morale.shrine = 0;
        }

        let milVal = govActive('militant',1);
        if (milVal){
            moraleAdd($ctx, 'gov_trait_militant', -milVal);
        }
        if (global.civic.govern.type === 'corpocracy'){
            moraleAdd($ctx, 'govern_corpocracy', -govEffect.corpocracy()[3]);
        }
        if (global.civic.govern.type === 'republic'){
            moraleAdd($ctx, 'govern_republic', govEffect.republic()[1]);
        }
        if (global.civic.govern.type === 'federation'){
            moraleAdd($ctx, 'govern_federation', govEffect.federation()[1]);
        }

        if (global.race['blood_thirst'] && global.race.blood_thirst_count >= 1){
            let blood_thirst = Math.ceil(Math.log2(global.race.blood_thirst_count));
            global.city.morale.blood_thirst = blood_thirst;
            moraleAdd($ctx, 'morale_blood_thirst', blood_thirst);
        }
        else {
            global.city.morale.blood_thirst = 0;
        }

        let weather_morale = 0;
        if (global.city.calendar.weather === 0){
            if (global.city.calendar.temp > 0){
                if (global.city.calendar.wind === 1){
                    // Thunderstorm
                    if (global.race['skittish']){
                        weather_morale = -(traits.skittish.vars()[0]);
                    }
                    else {
                        weather_morale = global.race['leathery'] ? -(traits.leathery.vars()[0]) : -THUNDERSTORM_MORALE_PENALTY;
                    }
                }
                else {
                    // Rain
                    weather_morale = global.race['leathery'] ? 0 : -RAIN_MORALE_PENALTY;
                }
            }
        }
        else if (global.city.calendar.weather === 2){
            // Sunny
            if (global.race['nyctophilia']){
                weather_morale = -(traits.nyctophilia.vars()[0]);
            }
            else if ((global.city.calendar.wind === 0 && global.city.calendar.temp < 2) || (global.city.calendar.wind === 1 && global.city.calendar.temp === 2)){
                //Still and Not Hot
                // -or-
                //Windy and Hot
                weather_morale = SUNNY_MORALE_BONUS;
            }
        }
        else {
            //Cloudy
            if (global.race['nyctophilia']){
                weather_morale = traits.nyctophilia.vars()[1];
            }
        }
        if (global.race['snowy'] && (global.city.calendar.temp !== 0 || global.city.calendar.weather !== 0)){
            weather_morale -= global.city.calendar.temp >= 2 ? traits.snowy.vars()[1] : traits.snowy.vars()[0];
        }

        global.city.morale.weather = global.race['submerged'] ? 0 : weather_morale;
        moraleAdd($ctx, 'morale_weather', global.race['submerged'] ? 0 : weather_morale);

        if (global.race['motivated']){
            let boost = Math.ceil(global.race['motivated'] ** 0.4);
            moraleAdd($ctx, 'event_motivation_bd', boost);
        }

        if (global.race['pet']){
            let petBonus = petMorale(global.race.pet);
            global.city.morale.pet = petBonus;
            moraleAdd($ctx, `event_pet_${global.race.pet.type}_owner`, petBonus);
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.fame !== 0){
            moraleAdd($ctx, global.race.wishStats.fame > 0 ? 'wish_reputable' : 'wish_notorious', global.race.wishStats.fame);
        }

        if (global.race['artisan'] && !global.race['joyless']){
            moraleAdd($ctx, 'trait_artisan_name', traits.artisan.vars()[2] * global.civic.craftsman.workers, { prec: 2 });
        }

        $ctx.stress = 0;

        let divisor = 5;
        global.city.morale.unemployed = 0;
        if (!global.city.ptrait.includes('mellow')){
            let unemployed = global.civic.unemployed.workers / (global.race['high_pop'] ? traits.high_pop.vars()[0] : 1);
            moraleAdd($ctx, 'morale_unemployed', -unemployed);
            global.city.morale.unemployed = -(unemployed);
        }
        else {
            divisor *= planetTraits.mellow.vars()[0];
        }

        let vulFathom = fathomCheck('vulpine');
        if (global.civic.hunter.display && (global.race['playful'] || vulFathom > 0)){
            let val = 0;
            if (vulFathom > 0){
                val += traits.playful.vars(1)[0] * vulFathom;
            }
            if (global.race['playful']){
                val += traits.playful.vars()[0];
            }
            moraleAdd($ctx, 'morale_hunter', global.civic.hunter.workers * val);
            global.city.morale.unemployed = global.civic.hunter.workers * val;
        }
        else {
            $ctx.stress -= highPopAdjust(global.civic.hunter.workers) / divisor;
        }

        if (global.race['optimistic']){
            $ctx.stress += traits.optimistic.vars()[0];
        }
        $ctx.geckoFathom = fathomCheck('gecko');
        if ($ctx.geckoFathom > 0){
            $ctx.stress += traits.optimistic.vars(1)[0] * $ctx.geckoFathom;
        }

        if (global.race['pessimistic']){
            $ctx.stress -= traits.pessimistic.vars()[0];
        }

        if (global.civic['garrison']){
            let divisor = 2;
            if (global.city.ptrait.includes('mellow')){
                divisor *= planetTraits.mellow.vars()[0];
            }
            let army_stress = global.civic.garrison.max / divisor;
            if (global.race['high_pop']){
                army_stress /= traits.high_pop.vars()[0]
            }

            $ctx.stress -= army_stress;
        }
}
