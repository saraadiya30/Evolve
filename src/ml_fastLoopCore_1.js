import { global, breakdown, gal_on, power_generated, p_on, support_on, callback_queue } from './vars.js';
import { modRes, shrineBonusActive, getShrineBonus, calc_mastery, powerModifier } from './functions.js';
import { drawEvolution, actions, checkPowerRequirements, structName } from './actions.js';
import { zigguratBonus, piracy, convertSpaceSector, fuel_adjust, int_fuel_adjust } from './space.js';
import { SPRING_MORALE_BONUS, WINTER_MORALE_PENALTY, VAX_C_MORALE_PENALTY, VAX_F_MORALE_PENALTY, VAX_S_MORALE_BONUS, MORALE_BOOST_TECH_BONUS, THUNDERSTORM_MORALE_PENALTY, RAIN_MORALE_PENALTY, SUNNY_MORALE_BONUS } from './morale.config.js';
import { traits, planetTraits, fathomCheck } from './races.js';
import { govActive } from './governor.js';
import { govEffect, garrisonSize } from './civics.js';
import { petMorale } from './morale_core.js';
import { highPopAdjust, production } from './prod.js';
import { loc } from './locale.js';
import { tradeBuyPrice, tradeRatio, tradeSellPrice, galaxyOffers, atomic_mass } from './resources.js';
import { OCULAR_POWER_CHARM_BASE } from './ocular_power.config.js';
import { astroVal } from './seasons.js';
import { steelCheck } from './main.js';
import { unlockAchieve } from './achieve.js';
import { nf_resources } from './industry.js';
import { jobScale } from './jobs.js';

// Bagian dari fastLoopCore (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function fastLoopCore_s1($ctx){
        if (global.evolution['nucleus'] && global['resource']['DNA'].amount < global['resource']['DNA'].max){
            var increment = global.evolution['nucleus'].count;
            while (global['resource']['RNA'].amount < increment * 2){
                increment--;
                if (increment <= 0){ break; }
            }
            let rna = increment;
            if (global.tech['evo'] && global.tech.evo >= 5){
                increment *= 2;
            }
            modRes('DNA', increment * $ctx.global_multiplier * $ctx.time_multiplier);
            modRes('RNA', -(rna * 2 * $ctx.time_multiplier));
        }
        if (global.evolution['organelles']){
            let rna_multiplier = global.race['rapid_mutation'] ? 2 : 1;
            if (global.tech['evo'] && global.tech.evo >= 2){
                rna_multiplier++;
            }
            modRes('RNA',global.evolution['organelles'].count * rna_multiplier * $ctx.global_multiplier * $ctx.time_multiplier);
        }

        if (((global.stats.feat['novice'] && global.stats.achieve['apocalypse'] && global.stats.achieve.apocalypse.l > 0) || global['sim']) && global.race.universe !== 'bigbang' && (!global.race.seeded || (global.race.seeded && global.race['chose']))){
            let rank = global['sim'] ? 5 : Math.min(global.stats.achieve.apocalypse.l,global.stats.feat['novice']);
            modRes('RNA', (rank / 2) * $ctx.time_multiplier * $ctx.global_multiplier);
            if (global.resource.DNA.display){
                modRes('DNA', (rank / 4) * $ctx.time_multiplier * $ctx.global_multiplier);
            }
        }
        // Detect new unlocks
        if (global['resource']['RNA'].amount >= 2 && !global.evolution['dna']){
            global.evolution['dna'] = 1;
            global.resource.DNA.display = true;
            if (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l > 1){
                modRes('RNA', global.resource.RNA.max);
                modRes('DNA', global.resource.RNA.max);
            }
            drawEvolution();
        }
        else if (global['resource']['RNA'].amount >= 10 && !global.evolution['membrane']){
            global.evolution['membrane'] = { count: 0 };
            drawEvolution();
        }
        else if (global['resource']['DNA'].amount >= 4 && !global.evolution['organelles']){
            global.evolution['organelles'] = { count: 0 };
            drawEvolution();
        }
        else if (global.evolution['organelles'] && global.evolution.organelles.count >= 2 && !global.evolution['nucleus']){
            global.evolution['nucleus'] = { count: 0 };
            drawEvolution();
        }
        else if (global.evolution['nucleus'] && global.evolution.nucleus.count >= 1 && !global.evolution['eukaryotic_cell']){
            global.evolution['eukaryotic_cell'] = { count: 0 };
            drawEvolution();
        }
        else if (global.evolution['eukaryotic_cell'] && global.evolution.eukaryotic_cell.count >= 1 && !global.evolution['mitochondria']){
            global.evolution['mitochondria'] = { count: 0 };
            drawEvolution();
        }
        else if (global.evolution['mitochondria'] && !global.tech['evo']){
            global.tech['evo'] = 1;
            drawEvolution();
        }
}

export function fastLoopCore_s2($ctx){
        $ctx.zigVal = zigguratBonus();
        $ctx.morale = 100;
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
            $ctx.morale += spring;
            global.city.morale.season = spring;
        }
        else if (global.city.calendar.season === 1 && global.race['smoldering']){ // Summer
            $ctx.morale += traits.smoldering.vars()[0];
            global.city.morale.season = traits.smoldering.vars()[0];
        }
        else if (global.city.calendar.season === 3){ // Winter
            if (global.race['chilled']){
                $ctx.morale += traits.chilled.vars()[0];
                global.city.morale.season = traits.chilled.vars()[0];
            }
            else {
                $ctx.morale -= global.race['leathery'] ? traits.leathery.vars()[0] : WINTER_MORALE_PENALTY;
                global.city.morale.season = global.race['leathery'] ? -(traits.leathery.vars()[0]) : -WINTER_MORALE_PENALTY;
            }
        }
        else {
            global.city.morale.season = 0;
        }

        if (global.race['cheese']){
            let raw_cheese = global.stats.hasOwnProperty('reset') ? global.stats.reset + 1 : 1;
            let cheese = +(raw_cheese / (raw_cheese + 10) * 11).toFixed(2);
            $ctx.morale += cheese;
        }

        if (global.civic['homeless']){
            $ctx.morale -= global.civic.homeless / 2;
        }

        if (global.tech['vax_c'] || global.tech['vax_f']){
            $ctx.morale -= global.tech['vax_c'] ? VAX_C_MORALE_PENALTY : VAX_F_MORALE_PENALTY;
        }
        else if (global.tech['vax_s']){
            $ctx.morale += VAX_S_MORALE_BONUS;
        }

        if (global.tech['m_boost']){
            global.city.morale.leadership = MORALE_BOOST_TECH_BONUS;
            $ctx.morale += MORALE_BOOST_TECH_BONUS;
        }
        else {
            global.city.morale.leadership = 0;
        }

        if (shrineBonusActive()){
            let shrineMorale = getShrineBonus('morale');
            global.city.morale.shrine = shrineMorale.add;
            $ctx.morale += shrineMorale.add;
        }
        else {
            global.city.morale.shrine = 0;
        }

        let milVal = govActive('militant',1);
        if (milVal){
            $ctx.morale -= milVal;
        }
        if (global.civic.govern.type === 'corpocracy'){
            $ctx.morale -= govEffect.corpocracy()[3];
        }
        if (global.civic.govern.type === 'republic'){
            $ctx.morale += govEffect.republic()[1];
        }
        if (global.civic.govern.type === 'federation'){
            $ctx.morale += govEffect.federation()[1];
        }

        if (global.race['blood_thirst'] && global.race.blood_thirst_count >= 1){
            let blood_thirst = Math.ceil(Math.log2(global.race.blood_thirst_count));
            global.city.morale.blood_thirst = blood_thirst;
            $ctx.morale += blood_thirst;
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
        $ctx.morale += global.race['submerged'] ? 0 : weather_morale;

        if (global.race['motivated']){
            let boost = Math.ceil(global.race['motivated'] ** 0.4);
            $ctx.morale += boost;
        }

        if (global.race['pet']){
            let petBonus = petMorale(global.race.pet);
            global.city.morale.pet = petBonus;
            $ctx.morale += petBonus;
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.fame !== 0){
            $ctx.morale += global.race.wishStats.fame;
        }

        if (global.race['artisan'] && !global.race['joyless']){
            $ctx.morale += traits.artisan.vars()[2] * global.civic.craftsman.workers;
        }

        $ctx.stress = 0;

        let divisor = 5;
        global.city.morale.unemployed = 0;
        if (!global.city.ptrait.includes('mellow')){
            let unemployed = global.civic.unemployed.workers / (global.race['high_pop'] ? traits.high_pop.vars()[0] : 1);
            $ctx.morale -= unemployed;
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
            $ctx.morale += global.civic.hunter.workers * val;
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

        breakdown.p.consume.Money[loc('trade')] = 0;

        // trade routes
        if (global.tech['trade'] || (global.race['banana'] && global.tech['primitive'] && global.tech.primitive >= 3)){
            let used_trade = 0;
            let dealVal = govActive('dealmaker',0);
            if (dealVal){
                let exporting = 0;
                let importing = 0;
                Object.keys(global.resource).forEach(function(res){
                    if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade < 0){
                        exporting -= global.resource[res].trade;
                    }
                    if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade > 0){
                        importing += global.resource[res].trade;
                    }
                });
                if (exporting < importing){
                    Object.keys(global.resource).forEach(function(res){
                        global.resource[res].trade = 0;
                    });
                }
            }
            Object.keys(global.resource).forEach(function (res){
                let routes = global.resource[res].trade;
                if (routes > 0){
                    used_trade += routes;
                    let price = tradeBuyPrice(res);
                    const affordable_routes = Math.floor(global.resource.Money.amount / (price * $ctx.time_multiplier));
                    routes = Math.min(routes, affordable_routes);

                    if (routes > 0){
                        price *= routes;
                        let rate = tradeRatio[res];
                        if (dealVal){
                            rate *= 1 + (dealVal / 100);
                        }
                        if (global.race['persuasive']){
                            rate *= 1 + (traits.persuasive.vars()[0] * global.race['persuasive'] / 100);
                        }
                        if (global.race['merchant']){
                            rate *= 1 + (traits.merchant.vars()[1] / 100);
                        }
                        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.c){
                            let trade = OCULAR_POWER_CHARM_BASE * (traits.ocular_power.vars()[1] / 100);
                            rate *= 1 + (trade / 100);
                        }
                        let fathom = fathomCheck('goblin');
                        if (fathom > 0){
                            rate *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
                        }
                        if ($ctx.astroSign === 'capricorn'){
                            rate *= 1 + (astroVal('capricorn')[0] / 100);
                        }
                        if (global.race['devious']){
                            rate *= 1 - (traits.devious.vars()[0] / 100);
                        }
                        if (global.genes['trader']){
                            let mastery = calc_mastery();
                            rate *= 1 + (mastery / 100);
                            if (global.genes.trader >= 2){
                                let coiled = global.prestige.Supercoiled.count;
                                rate *= 1 + (coiled / (coiled + 500));
                            }
                        }
                        if (global.stats.achieve.hasOwnProperty('trade')){
                            let rank = global.stats.achieve.trade.l * 2;
                            if (rank > 10){ rank = 10; }
                            rate *= 1 + (rank / 100);
                        }
                        if (global.race['truepath']){
                            rate *= 1 - (global.civic.foreign.gov3.hstl / 101);
                        }
                        modRes(res,routes * $ctx.time_multiplier * rate);
                        modRes('Money', -(price * $ctx.time_multiplier));
                        breakdown.p.consume.Money[loc('trade')] -= price;
                        breakdown.p.consume[res][loc('trade')] = routes * rate;
                    }
                    steelCheck();
                }
                else if (routes < 0){
                    used_trade -= routes;

                    let rate = tradeRatio[res];
                    if (global.stats.achieve.hasOwnProperty('trade')){
                        let rank = global.stats.achieve.trade.l;
                        if (rank > 5){ rank = 5; }
                        rate *= 1 - (rank / 100);
                    }

                    const affordable_routes = Math.floor(global.resource[res].amount / (rate * $ctx.time_multiplier));
                    routes = Math.max(routes, -affordable_routes);
                    if (routes < 0){
                        let price = tradeSellPrice(res) * routes;
                        modRes(res,routes * $ctx.time_multiplier * rate);
                        modRes('Money', -(price * $ctx.time_multiplier));
                        breakdown.p.consume.Money[loc('trade')] -= price;
                        breakdown.p.consume[res][loc('trade')] = routes * rate;
                    }
                    steelCheck();
                }
            });
            global.city.market.trade = used_trade;
        }
        if (breakdown.p.consume.Money[loc('trade')] === 0){
            delete breakdown.p.consume.Money[loc('trade')];
        }

        // alchemy
        if (global.tech['alchemy']){
            let totMana = 0;
            let totCrystal = 0;
            let totTransmute = 0;
            Object.keys(global.race.alchemy).forEach(function (res){
                if (global.race.alchemy[res] > 0){
                    let trasmute = Number(global.race.alchemy[res]);
                    if (global.resource.Mana.amount < trasmute){
                        trasmute = global.resource.Mana.amount;
                    }
                    if (global.resource.Crystal.amount < trasmute * 0.15){
                        trasmute = Math.floor(global.resource.Crystal.amount * (1/0.15));
                    }
                    totTransmute += trasmute;

                    if (trasmute >= $ctx.time_multiplier){
                        let rate = global.resource[res].basic && global.tech.alchemy >= 2 ? tradeRatio[res] * 8 : tradeRatio[res] * 2;
                        if (global.race['witch_hunter']){ rate *= 3; }
                        if (global.stats.achieve['soul_sponge'] && global.stats.achieve.soul_sponge['mg']){
                            rate *= global.stats.achieve.soul_sponge.mg + 1;
                        }
                        modRes(res,trasmute * $ctx.time_multiplier * rate);
                        modRes('Mana', -(trasmute * $ctx.time_multiplier));
                        modRes('Crystal', -(trasmute * 0.15 * $ctx.time_multiplier));
                        totMana -= trasmute;
                        totCrystal -= trasmute * 0.15;
                        breakdown.p.consume[res][loc('tab_alchemy')] = trasmute * rate;
                        if (global.race.universe === 'magic' && !global.resource[res].basic && global.tech.alchemy >= 2){
                            unlockAchieve('fullmetal');
                        }
                    }
                }
            });
            global.race['totTransmute'] = totTransmute;
            breakdown.p.consume.Mana[loc('tab_alchemy')] = totMana;
            breakdown.p.consume.Crystal[loc('tab_alchemy')] = totCrystal;
        }

        if (global.galaxy['trade'] && (gal_on.hasOwnProperty('freighter') || gal_on.hasOwnProperty('super_freighter'))){
            let cap = 0;
            if (global.galaxy['freighter']){
                cap += gal_on['freighter'] * 2;
            }
            if (global.galaxy['super_freighter']){
                cap += gal_on['super_freighter'] * 5;
            }
            global.galaxy.trade.max = cap;

            let used = 0;
            let offers = galaxyOffers();
            for (let i=0; i<offers.length; i++){
                let exprt_res = offers[i].sell.res;
                let exprt_vol = offers[i].sell.vol;
                let imprt_res = offers[i].buy.res;
                let imprt_vol = offers[i].buy.vol;
                let exp_total = 0;
                let imp_total = 0;

                if (global.race['persuasive']){
                    imprt_vol *= 1 + (global.race['persuasive'] / 100);
                }
                if (global.race['merchant']){
                    imprt_vol *= 1 + (traits.merchant.vars()[1] / 100);
                }
                let fathom = fathomCheck('goblin');
                if (fathom > 0){
                    imprt_vol *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
                }
                if ($ctx.astroSign === 'capricorn'){
                    imprt_vol *= 1 + (astroVal('capricorn')[0] / 100);
                }
                if (global.race['devious']){
                    imprt_vol *= 1 - (traits.devious.vars()[0] / 100);
                }
                if (global.genes['trader']){
                    let mastery = calc_mastery();
                    imprt_vol *= 1 + (mastery / 100);
                }
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    imprt_vol *= 1 + (rank / 50);
                    exprt_vol *= 1 - (rank / 100);
                }

                used += global.galaxy.trade[`f${i}`];
                if (used > cap){
                    global.galaxy.trade[`f${i}`] -= used - cap;
                    if (global.galaxy.trade[`f${i}`] < 0){
                        global.galaxy.trade[`f${i}`] = 0;
                    }
                }

                let pirate = piracy('gxy_gorddon');
                for (let j=0; j<global.galaxy.trade[`f${i}`]; j++){
                    exp_total += exprt_vol;
                    if (modRes(exprt_res,-(exprt_vol * $ctx.time_multiplier))){
                        modRes(imprt_res,imprt_vol * $ctx.time_multiplier * pirate);
                        imp_total += imprt_vol;
                    }
                }

                if (exp_total > 0){
                    if (breakdown.p.consume[exprt_res][loc('trade')]){
                        breakdown.p.consume[exprt_res][loc('trade')] -= exp_total;
                    }
                    else {
                        breakdown.p.consume[exprt_res][loc('trade')] = -(exp_total);
                    }
                }

                if (imp_total > 0){
                    if (breakdown.p.consume[imprt_res][loc('trade')]){
                        breakdown.p.consume[imprt_res][loc('trade')] += imp_total;
                    }
                    else {
                        breakdown.p.consume[imprt_res][loc('trade')] = imp_total;
                    }
                }

                if (pirate < 1){
                    if (breakdown.p.consume[imprt_res][loc('galaxy_piracy')]){
                        breakdown.p.consume[imprt_res][loc('galaxy_piracy')] += -((1 - pirate) * imp_total);
                    }
                    else {
                        breakdown.p.consume[imprt_res][loc('galaxy_piracy')] = -((1 - pirate) * imp_total);
                    }
                }

                if (breakdown.p.consume[exprt_res][loc('trade')] === 0){
                    delete breakdown.p.consume[exprt_res][loc('trade')]
                }
                if (breakdown.p.consume[imprt_res][loc('trade')] === 0){
                    delete breakdown.p.consume[imprt_res][loc('trade')]
                }
            }
            global.galaxy.trade.cur = used;
        }

        if (global.race['deconstructor'] && global.city['nanite_factory']){
            nf_resources.forEach(function(r){
                if (global.resource[r].display){
                    let vol = global.city.nanite_factory[r] * $ctx.time_multiplier;
                    if (vol > 0){
                        if (global.resource[r].amount < vol){
                            vol = global.resource[r].amount;
                        }
                        if (modRes(r,-(vol))){
                            breakdown.p.consume[r][loc('city_nanite_factory')] = -(vol / $ctx.time_multiplier);
                            let trait = traits.deconstructor.vars()[0] / 100;
                            let nanite_vol = vol * atomic_mass[r] / 100 * trait;
                            breakdown.p.consume['Nanite'][global.resource[r].name] = nanite_vol / $ctx.time_multiplier;
                            modRes('Nanite',nanite_vol);
                        }
                    }
                }
            });
        }

        $ctx.power_grid = 0;
        $ctx.max_power = 0;

        if (global.tauceti['ringworld'] && global.tauceti.ringworld.count >= 1000){
            let output = global.race['lone_survivor'] ? 100 : 10000;
            $ctx.max_power -= output;
            $ctx.power_grid += output;
            power_generated[loc('tau_star_ringworld')] = output;
        }

        if (global.interstellar['elysanite_sphere'] && global.interstellar.elysanite_sphere.count > 0){
            let output = 0;
            if (global.interstellar.elysanite_sphere.count >= 1000){
                output = powerModifier(22500);
            }
            else {
                output = powerModifier(1750 + (global.interstellar.elysanite_sphere.count * 18));
            }
            $ctx.max_power -= output;
            $ctx.power_grid += output;
            power_generated[loc('interstellar_dyson_sphere_title')] = output;
            delete power_generated[loc('tech_dyson_net')];
        }
        else if (global.interstellar['orichalcum_sphere'] && global.interstellar.orichalcum_sphere.count > 0){
            let output = 0;
            if (global.interstellar.orichalcum_sphere.count >= 100){
                output = powerModifier(1750);
            }
            else {
                output = powerModifier(750 + (global.interstellar.orichalcum_sphere.count * 8));
            }
            $ctx.max_power -= output;
            $ctx.power_grid += output;
            power_generated[loc('interstellar_dyson_sphere_title')] = output;
            delete power_generated[loc('tech_dyson_net')];
        }
        else if (global.interstellar['dyson_sphere'] && global.interstellar.dyson_sphere.count > 0){
            let output = 0;
            if (global.interstellar.dyson_sphere.count >= 100){
                output = powerModifier(750);
            }
            else {
                output = powerModifier(175 + (global.interstellar.dyson_sphere.count * 5));
            }
            $ctx.max_power -= output;
            $ctx.power_grid += output;
            power_generated[loc('interstellar_dyson_sphere_title')] = output;
            delete power_generated[loc('tech_dyson_net')];
        }
        else if (global.interstellar['dyson'] && global.interstellar.dyson.count >= 1){
            let output = 0;
            if (global.interstellar.dyson.count >= 100){
                output = powerModifier(175);
            }
            else {
                output = powerModifier(global.interstellar.dyson.count * 1.25);
            }
            $ctx.max_power -= output;
            $ctx.power_grid += output;
            power_generated[loc('tech_dyson_net')] = output;
        }

        if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.count >= 100){
            let output = actions.interstellar.int_blackhole.stellar_engine.powered();
            $ctx.max_power += output;
            $ctx.power_grid -= output;
            power_generated[loc('tech_stellar_engine')] = -output;
        }
}

export function fastLoopCore_s3($ctx){
        [
            {r:'city',s:'coal_power'},{r:'city',s:'oil_power'},{r:'city',s:'fission_power'},{r:'spc_hell',s:'geothermal'},{r:'spc_dwarf',s:'e_reactor'},
            {r:'int_alpha',s:'fusion'},{r:'tau_home',s:'fusion_generator'},{r:'tau_gas2',s:'alien_space_station'}
        ].forEach(function(generator){
            let space = convertSpaceSector(generator.r);
            let region = generator.r === 'city' ? generator.r : space;
            let c_action = generator.r === 'city' ? actions.city : actions[space][generator.r];
            let title = typeof c_action[generator.s].title === 'string' ? c_action[generator.s].title : c_action[generator.s].title();

            if (global[region][generator.s] && global[region][generator.s]['on']){
                let watts = c_action[generator.s].powered();
                p_on[generator.s] = global[region][generator.s].on;

                if (c_action[generator.s].hasOwnProperty('p_fuel')){
                    let s_fuels = c_action[generator.s].p_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        let fuel = s_fuels[j];
                        let fuel_cost = fuel.a;
                        if (['Oil','Helium_3'].includes(fuel.r) && region !== 'city'){
                            fuel_cost = region === 'space' ? +fuel_adjust(fuel_cost,true) : +int_fuel_adjust(fuel_cost);
                        }

                        let mb_consume = p_on[generator.s] * fuel_cost;
                        breakdown.p.consume[fuel.r][title] = -(mb_consume);
                        for (let k=0; k<p_on[generator.s]; k++){
                            if (!modRes(fuel.r, -($ctx.time_multiplier * fuel_cost))){
                                mb_consume -= (p_on[generator.s] * fuel_cost) - (k * fuel_cost);
                                p_on[generator.s] = k;
                                break;
                            }
                        }
                    }
                }

                let power = p_on[generator.s] * watts;
                $ctx.max_power += power;
                $ctx.power_grid -= power;
                power_generated[title] = -(power);

                if (p_on[generator.s] !== global[region][generator.s].on){
                    $(`#${region}-${generator.s} .on`).addClass('warn');
                    $(`#${region}-${generator.s} .on`).prop('title',`ON ${p_on[generator.s]}/${global[region][generator.s].on}`);
                }
                else {
                    $(`#${region}-${generator.s} .on`).removeClass('warn');
                    $(`#${region}-${generator.s} .on`).prop('title',`ON`);
                }
            }
            else {
                power_generated[title] = 0;
                p_on[generator.s] = 0;
                $(`#${region}-${generator.s} .on`).removeClass('warn');
                $(`#${region}-${generator.s} .on`).prop('title',`ON`);
            }
        });

        // Uranium Ash (from coal powerplants)
        if (global.tech['uranium'] && global.tech['uranium'] >= 3 && p_on['coal_power']){
            const fuel = actions.city.coal_power.p_fuel();
            if (fuel.r === 'Coal' && fuel.a > 0){
                let coal = p_on['coal_power'] * fuel.a;
                let ash = coal / 65;
                if (global.city.geology['Uranium']){
                    ash *= global.city.geology['Uranium'] + 1;
                }
                ash *= production('psychic_boost','Uranium');
                modRes('Uranium', ash * $ctx.time_multiplier);
                // Display on the right side of the breakdown to demonstrate that there is no global production scaling
                breakdown.p.consume['Uranium'][loc('city_coal_ash')] = ash;
            }
        }

        if (global.space['hydrogen_plant']){
            let output = actions.space.spc_titan.hydrogen_plant.powered();
            if (global.space.hydrogen_plant.on > global.space.electrolysis.on){
                global.space.hydrogen_plant.on = global.space.electrolysis.on;
            }
            let power = global.space.hydrogen_plant.on * output;
            $ctx.max_power += power;
            $ctx.power_grid -= power;
            power_generated[loc('space_hydrogen_plant_title')] = -(power);
        }

        if (global.portal['incinerator']){
            let output = actions.portal.prtl_wasteland.incinerator.powered();
            let power = global.portal.incinerator.on * output;
            $ctx.max_power += power;
            $ctx.power_grid -= power;
            power_generated[loc('portal_incinerator_title')] = -(power);
        }

        if (global.portal['inferno_power']){
            let fuels = actions.portal.prtl_ruins.inferno_power.fuel;
            let operating = global.portal.inferno_power.on;

            Object.keys(fuels).forEach(function(fuel){
                let consume = operating * fuels[fuel];
                while (consume * $ctx.time_multiplier > global.resource[fuel].amount + (global.resource[fuel].diff > 0 ? global.resource[fuel].diff * $ctx.time_multiplier : 0) && consume > 0){
                    operating--;
                    consume -= fuels[fuel];
                }
                breakdown.p.consume[fuel][loc('portal_inferno_power_title')] = -(consume);
                modRes(fuel, -(consume * $ctx.time_multiplier));
            });
            let power = operating * actions.portal.prtl_ruins.inferno_power.powered();

            $ctx.max_power += power;
            $ctx.power_grid -= power;
            power_generated[loc('portal_inferno_power_title')] = -(power);
        }

        if (global.eden['soul_engine'] && global.tech['asphodel'] && global.tech.asphodel >= 4){
            let power = (support_on['soul_engine'] || 0) * actions.eden.eden_asphodel.soul_engine.powered();
            $ctx.max_power += power;
            $ctx.power_grid -= power;
            power_generated[loc('eden_soul_engine_title')] = -(power);
        }

        if (global.space['swarm_satellite'] && global.space['swarm_control']){
            let active = global.space.swarm_satellite.count;
            if (active > global.space.swarm_control.s_max){
                active = global.space.swarm_control.s_max;
            }
            global.space.swarm_control.support = active;
            let solar = 0.35;
            if (global.tech.swarm >= 4){
                solar += 0.15 * (global.tech.swarm - 3);
            }
            if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 1){ solar += 0.15; }
            if (global.blood['illuminate']){
                solar += 0.01 * global.blood.illuminate;
            }
            solar = +(solar).toFixed(2);
            let output = powerModifier(active * solar);
            $ctx.max_power -= output;
            $ctx.power_grid += output;
            power_generated[loc('space_sun_swarm_satellite_title')] = output;
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.potato){
            let power = powerModifier(global.race.wishStats.potato);
            $ctx.max_power -= power;
            $ctx.power_grid += power;
            power_generated[loc('wish_potato')] = power;
        }

        if (global.city['mill'] && global.tech['agriculture'] && global.tech['agriculture'] >= 6){
            let power = powerModifier(global.city.mill.on * actions.city.mill.powered());
            $ctx.max_power += power;
            $ctx.power_grid -= power;
            power_generated[loc('city_mill_title2')] = -(power);
        }

        if (global.city['windmill'] && global.tech['wind_plant']){
            let power = powerModifier(global.city.windmill.count * actions.city.windmill.powered());
            $ctx.max_power += power;
            $ctx.power_grid -= power;
            power_generated[loc('city_mill_title2')] = -(power);
        }

        if (global.race['elemental'] && traits.elemental.vars()[0] === 'electric'){
            let power = powerModifier(highPopAdjust((global.resource[global.race.species].amount * traits.elemental.vars()[1]) ** 1.28));
            $ctx.max_power -= power;
            $ctx.power_grid += power;
            power_generated[loc('trait_elemental_name')] = power;
        }

        if (global.prestige.hasOwnProperty('Aether') && global.settings.aetherPower > 0){
            let draw = Math.min(global.settings.aetherPower, global.prestige.Aether.count);
            if (draw > 0){
                global.prestige.Aether.count -= draw;
                let power = draw * 100000000; // 0.00001 Aether = 1000 watts
                $ctx.max_power -= power;
                $ctx.power_grid += power;
                power_generated[loc('resource_Aether_name')] = power;
            }
        }

        if (global.race['powered']){
            let citizens = traits.powered.vars()[0] * global.resource[global.race.species].amount;
            if (global.race['discharge'] && global.race['discharge'] > 0){
                citizens = +(citizens * 1.25).toFixed(3);
            }
            $ctx.power_grid -= citizens;
        }

        if (global.race['replicator']){
            global.city['replicator'] = { count: global.race.replicator.pow, on: global.race.replicator.pow };
        }

        // Power usage
        let p_structs = global.power;

        // Determine total power demand across all structs and get a list of powered structs that support load balancing
        let totalPowerDemand = 0;
        let pb_list = [];
        for (let i=0; i<p_structs.length; i++){
            const parts = p_structs[i].split(":");
            const struct = parts[1];
            const region = parts[0] === 'city' ? parts[0] : convertSpaceSector(parts[0]);
            const c_action = parts[0] === 'city' ? actions.city[struct] : actions[region][parts[0]][struct];
            if (global[region][struct]?.on){
                if (checkPowerRequirements(c_action) && (region !== 'galaxy' || p_on['s_gate'])){
                    totalPowerDemand += global[region][struct].on * c_action.powered();
                    p_on[struct] = global[region][struct].on;
                } else {
                    p_on[struct] = 0;
                }
            }
            if (global.settings.lowPowerBalance && c_action.hasOwnProperty('powerBalancer')){
                pb_list.push(p_structs[i]);
            }
        }

        // When short of power, proportionally reduce power demanded by supported structures (starting from lowest priority)
        if (global.settings.lowPowerBalance && totalPowerDemand > $ctx.power_grid){
            let totalPowerUsage = totalPowerDemand;
            for (let i=pb_list.length-1; i >= 0; i--){
                const parts = pb_list[i].split(":");
                const struct = parts[1];
                let on = p_on[struct];

                if (totalPowerUsage > $ctx.power_grid && on > 0){
                    const region = parts[0] === 'city' ? parts[0] : convertSpaceSector(parts[0]);
                    const c_action = parts[0] === 'city' ? actions.city[struct] : actions[region][parts[0]][struct];

                    let balValues = c_action.powerBalancer();
                    if (balValues){
                        balValues.forEach(function(v){
                            let off = 0;
                            if (v.hasOwnProperty('r') && v.hasOwnProperty('k')){
                                let val = global[region][struct][v.k] ?? 0;
                                if (global.resource[v.r]['odif'] && global.resource[v.r]['odif'] < 0) { global.resource[v.r]['odif'] = 0; }
                                let diff = global.resource[v.r].diff + (global.resource[v.r]['odif'] ? global.resource[v.r]['odif'] : 0);
                                while (diff - (off * val) > val && on > 0 && totalPowerUsage > $ctx.power_grid){
                                    on--;
                                    off++;
                                    totalPowerUsage -= c_action.powered();
                                }
                                global.resource[v.r]['odif'] = val * off;
                            }
                            else if (v.hasOwnProperty('s')){
                                let sup = c_action.support();
                                if (global[region][struct]['soff'] && global[region][struct]['soff'] < 0) { global[region][struct]['soff'] = 0; }
                                let support = v.s + (global[region][struct]['soff'] ? global[region][struct]['soff'] : 0);
                                while (support - (sup * off) >= sup && on > 0 && totalPowerUsage > $ctx.power_grid){
                                    on--;
                                    off++;
                                    totalPowerUsage -= c_action.powered();
                                }
                                global[region][struct]['soff'] = sup * off;
                            }
                        });
                        p_on[struct] = on;
                    }
                }
            }
        }

        // Power structures in priority order
        let power_grid_temp = $ctx.power_grid;
        for (let i=0; i<p_structs.length; i++){
            const parts = p_structs[i].split(":");
            const struct = parts[1];
            const region = parts[0] === 'city' ? parts[0] : convertSpaceSector(parts[0]);
            const c_action = parts[0] === 'city' ? actions.city[struct] : actions[region][parts[0]][struct];
            if (global[region][struct]?.on){
                let power = p_on[struct] * c_action.powered();
                // Use a loop specifically because of citadel stations, which have variable power cost. Other buildings would accept a closed form.
                while (power > power_grid_temp && power > 0){
                    p_on[struct]--;
                    power = p_on[struct] * c_action.powered();
                }

                if (c_action.hasOwnProperty('p_fuel')){
                    let s_fuels = c_action.p_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        const title = typeof c_action.title === 'string' ? c_action.title : c_action.title();
                        const fuel = s_fuels[j];
                        const fuel_cost = ['Oil','Helium_3'].includes(fuel.r) && region === 'space' ? fuel_adjust(fuel.a,true) : fuel.a;
                        let mb_consume = p_on[struct] * fuel_cost;
                        for (let k=0; k<p_on[struct]; k++){
                            if (!modRes(fuel.r, -($ctx.time_multiplier * fuel_cost))){
                                mb_consume = k * fuel_cost;
                                p_on[struct] = k;
                                power = p_on[struct] * c_action.powered();
                                break;
                            }
                        }
                        breakdown.p.consume[fuel.r][title] = -(mb_consume);
                    }
                }
                power_grid_temp -= power;

                if (p_on[struct] !== global[region][struct].on){
                    $(`#${region}-${struct} .on`).addClass('warn');
                    $(`#${region}-${struct} .on`).prop('title',`ON ${p_on[struct]}/${global[region][struct].on}`);
                    // Remove the reset actions for reset structures that lose power
                    if (['matrix', 'atmo_terraformer', 'ascension_trigger'].includes(struct)){
                        callback_queue.set([c_action, 'postPower'], [true]);
                    }
                }
                else {
                    $(`#${region}-${struct} .on`).removeClass('warn');
                    $(`#${region}-${struct} .on`).prop('title',`ON`);
                }
            }
            else {
                p_on[struct] = 0;
                $(`#${region}-${struct} .on`).removeClass('warn');
                $(`#${region}-${struct} .on`).prop('title',`ON`);
            }
        }
        $ctx.power_grid -= totalPowerDemand;

        // Mass Relay charging
        if (global.space['m_relay']){
            if (p_on['m_relay']){
                if (global.space.m_relay.charged < 10000){
                    global.space.m_relay.charged++;
                }
            }
            else {
                global.space.m_relay.charged = 0;
            }
        }

        // Troop Lander
        if (global.space['fob'] && global.space['lander']){
            if (p_on['fob']){
                let fuel = fuel_adjust(50,true);
                support_on['lander'] = global.space.lander.on;

                let total = garrisonSize(false,{nofob: true});
                let troopReq = jobScale(3);
                let deployed = support_on['lander'] * troopReq;
                if (deployed <= total){
                    global.space.fob.troops = deployed;
                }
                else {
                    support_on['lander'] -= Math.ceil((deployed - total) / troopReq);
                    global.space.fob.troops = support_on['lander'] * troopReq;
                }

                let mb_consume = support_on['lander'] * fuel;
                breakdown.p.consume.Oil[loc('space_lander_title')] = -(mb_consume);
                for (let i=0; i<support_on['lander']; i++){
                    if (!modRes('Oil', -($ctx.time_multiplier * fuel))){
                        mb_consume -= (support_on['lander'] * fuel) - (i * fuel);
                        support_on['lander'] -= i;
                        break;
                    }
                }

                if (support_on['lander'] !== global.space.lander.on){
                    $(`#space-lander .on`).addClass('warn');
                    $(`#space-lander .on`).prop('title',`ON ${support_on['lander']}/${global.space.lander.on}`);
                }
                else {
                    $(`#space-lander .on`).removeClass('warn');
                    $(`#space-lander .on`).prop('title',`ON`);
                }
            }
            else {
                global.space.fob.troops = 0;
                $(`#space-lander .on`).addClass('warn');
                $(`#space-lander .on`).prop('title',`ON 0/${global.space.lander.on}`);
            }
        }

        if (p_on['s_gate'] && p_on['foothold']){
            let increment = 2.5;
            let consume = (p_on['foothold'] * increment);
            while (consume * $ctx.time_multiplier > global.resource['Elerium'].amount && consume > 0){
                consume -= increment;
                p_on['foothold']--;
            }
            breakdown.p.consume.Elerium[loc('galaxy_foothold')] = -(consume);
            let number = consume * $ctx.time_multiplier;
            modRes('Elerium', -(number));
        }

        if(global.race['fasting']){
            const foodBuildings = ["city:tourist_center", "space:spaceport", "int_:starport", "gxy_:starbase"/*, "space:space_station", "space:embassy"*/, "space:space_barracks", "int_:zoo", "eden_:restaurant"];
            //titan quarters is excluded but not necessary because the scenario is incompatible with true path.
            //some buildings are excluded to make progression not impossible.
            for(let i=0;i<foodBuildings.length;i++){
                let parts = foodBuildings[i].split(":");
                let space = convertSpaceSector(parts[0]);
                let region = parts[0] === 'city' ? parts[0] : space;
                if (global[region][parts[1]] && global[region][parts[1]]['on']){
                    if(p_on[parts[1]]){
                        p_on[parts[1]] = 0;
                    }
                    $(`#${region}-${parts[1]} .on`).addClass('warn');
                    $(`#${region}-${parts[1]} .on`).prop('title',`ON 0`);
                }else {
                    $(`#${region}-${parts[1]} .on`).removeClass('warn');
                    $(`#${region}-${parts[1]} .on`).prop('title',`ON`);
                }
            }
            global.civic.meditator.display = true;
        }

        // Moon Bases, Spaceports, Etc
        [
            { a: 'space', r: 'spc_moon', s: 'moon_base', g: 'moon' },
            { a: 'space', r: 'spc_red', s: 'spaceport', g: 'red' },
            { a: 'space', r: 'spc_titan', s: 'electrolysis', g: 'titan' },
            { a: 'space', r: 'spc_titan', r2: 'spc_enceladus', s: 'titan_spaceport', g: 'enceladus' },
            { a: 'space', r: 'spc_eris', s: 'drone_control', g: 'eris' },
            { a: 'tauceti', r: 'tau_home', s: 'orbital_station', g: 'tau_home' },
            { a: 'tauceti', r: 'tau_red', s: 'orbital_platform', g: 'tau_red' },
            { a: 'tauceti', r: 'tau_roid', s: 'patrol_ship', g: 'tau_roid', oc: true },
            { a: 'eden', r: 'eden_asphodel', s: 'encampment', g: 'asphodel' },
        ].forEach(function(sup){
            sup['r2'] = sup['r2'] || sup.r;
            if (global[sup.a][sup.s] && global[sup.a][sup.s].count > 0){
                if (!p_structs.includes(`${sup.r}:${sup.s}`)){
                    p_on[sup.s] = global[sup.a][sup.s].on;
                }

                if (actions[sup.a][sup.r][sup.s].hasOwnProperty('support_fuel')){
                    let s_fuels = actions[sup.a][sup.r][sup.s].support_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        let fuel = s_fuels[j];
                        let fuel_cost = ['Oil','Helium_3'].includes(fuel.r) ? (sup.a === 'space' ? +fuel_adjust(fuel.a,true) : +int_fuel_adjust(fuel.a)) : fuel.a;
                        let mb_consume = p_on[sup.s] * fuel_cost;
                        breakdown.p.consume[fuel.r][actions[sup.a][sup.r][sup.s].title] = -(mb_consume);
                        for (let i=0; i<p_on[sup.s]; i++){
                            if (!modRes(fuel.r, -($ctx.time_multiplier * fuel_cost))){
                                mb_consume -= (p_on[sup.s] * fuel_cost) - (i * fuel_cost);
                                p_on[sup.s] = i;
                                break;
                            }
                        }
                        if (p_on[sup.s] < global[sup.a][sup.s].on){
                            $(`#space-${sup.s} .on`).addClass('warn');
                            $(`#space-${sup.s} .on`).prop('title',`ON ${p_on[sup.s]}/${global[sup.a][sup.s].on}`);
                        }
                        else {
                            $(`#space-${sup.s} .on`).removeClass('warn');
                            $(`#space-${sup.s} .on`).prop('title',`ON`);
                        }
                    }
                }

                global[sup.a][sup.s].s_max = p_on[sup.s] * actions[sup.a][sup.r][sup.s].support();
                switch (sup.g){
                    case 'moon':
                        {
                            global[sup.a][sup.s].s_max += global.tech['luna'] && global.tech['luna'] >= 2 ? p_on['nav_beacon'] * actions.space.spc_home.nav_beacon.support() : 0;
                        }
                        break;
                    case 'red':
                        {
                            global[sup.a][sup.s].s_max += global.tech['mars'] && global.tech['mars'] >= 3 ? p_on['red_tower'] * actions.space.spc_red.red_tower.support() : 0;
                            global[sup.a][sup.s].s_max += global.tech['luna'] && global.tech['luna'] >= 3 ? p_on['nav_beacon'] * actions.space.spc_home.nav_beacon.support() : 0;
                        }
                        break;
                    case 'tau_home':
                        {
                            global[sup.a][sup.s].s_max += p_on['tau_farm'] ? p_on['tau_farm'] : 0;
                        }
                        break;
                    case 'asphodel':
                        {
                            global[sup.a][sup.s].s_max += (p_on['rectory'] ? p_on['rectory'] : 0) * actions.eden.eden_asphodel.rectory.support();
                            global[sup.a][sup.s].s_max += (p_on['corruptor'] ? p_on['corruptor'] : 0) * actions.eden.eden_asphodel.corruptor.support();
                        }
                        break;
                }
            }

            if (global[sup.a][sup.s] && sup.r === 'spc_eris' && !p_on['ai_core2']){
                global[sup.a][sup.s].s_max = 0;
            }

            if (global[sup.a][sup.s]){
                let used_support = 0;
                let area_structs = global.support[sup.g].map(x => x.split(':')[1]);
                for (var i = 0; i < area_structs.length; i++){
                    if (global[sup.a][area_structs[i]]){
                        let id = actions[sup.a][sup.r2][area_structs[i]].id;
                        let supportSize = actions[sup.a][sup.r2][area_structs[i]].hasOwnProperty('support') ? actions[sup.a][sup.r2][area_structs[i]].support() * -1 : 1;
                        let operating = global[sup.a][area_structs[i]].on;
                        let remaining_support = global[sup.a][sup.s].s_max - used_support;

                        if ((operating * supportSize > remaining_support) && !sup.oc){
                            operating = Math.floor(remaining_support / supportSize);
                            $(`#${id} .on`).addClass('warn');
                            $(`#${id} .on`).prop('title',`ON ${operating}/${global[sup.a][area_structs[i]].on}`);
                        }
                        else {
                            $(`#${id} .on`).removeClass('warn');
                            $(`#${id} .on`).prop('title',`ON`);
                        }

                        if (actions[sup.a][sup.r2][area_structs[i]].hasOwnProperty('support_fuel')){
                            let s_fuels = actions[sup.a][sup.r2][area_structs[i]].support_fuel();
                            if (!Array.isArray(s_fuels)){
                                s_fuels = [s_fuels];
                            }
                            for (let j=0; j<s_fuels.length; j++){
                                let fuel = s_fuels[j];
                                let fuel_cost = ['Oil','Helium_3'].includes(fuel.r) ? (sup.a === 'space' ? +fuel_adjust(fuel.a,true) : +int_fuel_adjust(fuel.a)) : fuel.a;
                                let mb_consume = operating * fuel_cost;
                                breakdown.p.consume[fuel.r][actions[sup.a][sup.r2][area_structs[i]].title] = -(mb_consume);
                                for (let i=0; i<operating; i++){
                                    if (!modRes(fuel.r, -($ctx.time_multiplier * fuel_cost))){
                                        mb_consume -= (operating * fuel_cost) - (i * fuel_cost);
                                        operating -= i;
                                        break;
                                    }
                                }
                            }
                        }

                        used_support += operating * supportSize;
                        support_on[area_structs[i]] = operating;
                    }
                    else {
                        support_on[area_structs[i]] = 0;
                    }
                }
                global[sup.a][sup.s].support = used_support;
            }
        });

        $ctx.womling_technician = 1;
        if (global.tech['womling_technicians']){
            $ctx.womling_technician = 1 + (p_on['womling_station'] * (global.tech['isolation'] ? 0.30 : 0.08));
            if (global.tech['womling_gene']){
                $ctx.womling_technician *= 1.25;
            }
        }

        // Space Marines
        if (global.space['space_barracks'] && !global.race['fasting']){
            let oil_cost = +fuel_adjust(2,true);
            let sm_consume = global.space.space_barracks.on * oil_cost;
            breakdown.p.consume.Oil[loc('tech_space_marines_bd')] = -(sm_consume);
            for (let i=0; i<global.space.space_barracks.on; i++){
                if (!modRes('Oil', -($ctx.time_multiplier * oil_cost))){
                    sm_consume -= (global.space.space_barracks.on * oil_cost) - (i * oil_cost);
                    global.space.space_barracks.on -= i;
                    break;
                }
            }
        }

        if (p_on['red_factory'] && p_on['red_factory'] > 0){
            let h_consume = p_on['red_factory'] * fuel_adjust(1,true);
            modRes('Helium_3',-(h_consume * $ctx.time_multiplier));
            breakdown.p.consume.Helium_3[structName('factory')] = -(h_consume);
        }

        if (p_on['int_factory'] && p_on['int_factory'] > 0){
            let d_consume = p_on['int_factory'] * int_fuel_adjust(5);
            modRes('Deuterium',-(d_consume * $ctx.time_multiplier));
            breakdown.p.consume.Deuterium[loc('interstellar_int_factory_title')] = -(d_consume);
        }

        if (support_on['water_freighter'] && support_on['water_freighter'] > 0){
            let h_cost = fuel_adjust(5,true);
            let h_consume = support_on['water_freighter'] * h_cost;
            for (let i=0; i<support_on['water_freighter']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * h_cost))){
                    h_consume -= (support_on['water_freighter'] * h_cost) - (i * h_cost);
                    support_on['water_freighter'] -= i;
                    break;
                }
            }
            breakdown.p.consume.Helium_3[loc('space_water_freighter_title')] = -(h_consume);
        }
}
