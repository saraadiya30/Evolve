import { global, support_on, p_on, gal_on, spire_on, seededRandom, set_qlevel } from './vars.js';
import { actions, checkAffordable, drawTech, initStruct, updateDesc, checkTechRequirements, gainTech, resQueue, skipRequirement } from './actions.js';
import { loc } from './locale.js';
import { workerScale } from './jobs.js';
import { traits, fathomCheck, randomMinorTrait } from './races.js';
import { messageQueue, timeCheck, timeFormat, flib, eventActive, calcQuantumLevel, modRes, clearPopper, vBind } from './functions.js';
import { govTitle, checkControlling } from './civics.js';
import { planetName, gatewayArmada, galaxyRegions, renderSpace } from './space.js';
import { spyCaught, buildGene } from './main.js';
import { astroVal } from './seasons.js';
import { universeAffix, unlockFeat, unlockAchieve, alevel, checkAchievements } from './achieve.js';
import { S } from './main_state.js';
import { sequenceLabs, arpa } from './arpa.js';
import { craftCost } from './resources.js';
import { genSpireFloor, updateMechbay, mechRating, renderFortress } from './portal.js';
import { ritual_types } from './industry.js';

// Bagian dari midLoop (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function midLoop_s6($ctx){
        if (global.race['servants'] && global.race.servants.hasOwnProperty('smax') && global.race.servants.smax > 0){
            let used = 0;
            Object.keys(global.race.servants.sjobs).forEach(function(res){
                if (!global.resource[res].display){
                    global.race.servants.sjobs[res] = 0;
                }
                used += global.race.servants.sjobs[res];
                if (used > global.race.servants.smax){
                    global.race.servants.sjobs[res] -= used - global.race.servants.smax;
                }
                if (global.race.servants.sjobs[res] < 0){
                    global.race.servants.sjobs[res] = 0;
                }
            });
            global.race.servants.sused = used;
        }

        if (global.race['gravity_well']){
            let teamster = 0;

            [
                'hunter',
                'forager',
                'farmer',
                'lumberjack',
                'quarry_worker',
                'crystal_miner',
                'scavenger',
                'miner',
                'coal_miner',
                'craftsman',
                'cement_worker',
                'space_miner',
                'hell_surveyor',
                'pit_miner',
            ].forEach(function (job){
                teamster += global.civic[job].workers;
                if (global.race['servants'] && global.race.servants.jobs[job]){
                    teamster += global.race.servants.jobs[job];
                }
            });

            if (global.city['oil_well']){
                teamster += global.city.oil_well.count * (global.tech['teamster'] && global.tech.teamster >= 3 ? 0 : 2);
            }

            if (global.city['factory'] && p_on['factory']){
                teamster += p_on['factory'] * 2;
            }

            if (global.space['red_factory'] && p_on['red_factory']){
                teamster += p_on['red_factory'] * 2;
            }

            if (global.space['moon_base'] && support_on['iridium_mine']){
                teamster += support_on['iridium_mine'] * 2;
            }

            if (global.space['moon_base'] && support_on['helium_mine']){
                teamster += support_on['helium_mine'];
            }

            if (global.tech['mars'] && support_on['red_mine']){
                teamster += support_on['red_mine'] * 3;
            }

            if (p_on['outpost']){
                teamster += p_on['outpost'] * 3;
            }

            if (global.race['servants'] && global.race.servants.hasOwnProperty('smax') && global.race.servants.smax > 0){
                teamster += global.race.servants.sused;
            }

            global.race['teamster'] = teamster;
        }

        if (global.civic.space_miner.display && global.space['space_station']){
            global.space.space_station.s_max = workerScale(global.civic.space_miner.workers,'space_miner');
        }

        if (global.portal.hasOwnProperty('transport')){
            let max = 0;
            if (gal_on['transport']){
                max = gal_on['transport'] * (global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 4 ? 8 : 5);
            }
            global.portal.transport.cargo.max = max;
        }

        if (global.portal.hasOwnProperty('purifier')){
            let max = 100;
            let port_value = 10000;
            if (spire_on['base_camp']){
                port_value *= 1 + (spire_on['base_camp'] * 0.4);
            }
            if (spire_on['port']){
                max += spire_on['port'] * port_value;
            }
            global.portal.purifier.sup_max = Math.round(max);
        }

        let espEnd = global.race['truepath'] ? 5 : 3;
        let spyCatchMod = global.race['blurry'] ? 2 : 0;
        let yetiFathom = fathomCheck('yeti');
        if (yetiFathom >= 0.25){
            spyCatchMod += yetiFathom >= 0.5 ? 2 : 1;
        }
        for (let i=0; i<espEnd; i++){
            if (global.civic.foreign[`gov${i}`].trn > 0){
                global.civic.foreign[`gov${i}`].trn--;
                if (global.civic.foreign[`gov${i}`].trn === 0){
                    global.civic.foreign[`gov${i}`].spy++;
                }
            }
            if (global.civic.foreign[`gov${i}`].sab > 0){
                global.civic.foreign[`gov${i}`].sab--;
                if (global.civic.foreign[`gov${i}`].sab === 0){
                    switch (global.civic.foreign[`gov${i}`].act){
                        case 'influence':
                            if (Math.floor(seededRandom(0,4 + spyCatchMod)) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                if ($ctx.astroSign === 'scorpio'){
                                    covert += astroVal('scorpio')[1];
                                }
                                global.civic.foreign[`gov${i}`].hstl -= covert;
                                if (global.civic.foreign[`gov${i}`].hstl < 0){
                                    global.civic.foreign[`gov${i}`].hstl = 0;
                                }
                                messageQueue(loc('civics_spy_influence_success',[govTitle(i),covert]),'success',false,['spy']);
                            }
                            break;
                        case 'sabotage':
                            if (Math.floor(seededRandom(0,3 + spyCatchMod)) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                if ($ctx.astroSign === 'scorpio'){
                                    covert += astroVal('scorpio')[1];
                                }
                                global.civic.foreign[`gov${i}`].mil -= covert;
                                if (global.civic.foreign[`gov${i}`].mil < 50){
                                    global.civic.foreign[`gov${i}`].mil = 50;
                                }
                                messageQueue(loc('civics_spy_sabotage_success',[govTitle(i),covert]),'success',false,['spy']);
                            }
                            break;
                        case 'incite':
                            if (Math.floor(seededRandom(0,2 + Math.floor(spyCatchMod / 2))) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                if ($ctx.astroSign === 'scorpio'){
                                    covert += astroVal('scorpio')[1];
                                }
                                global.civic.foreign[`gov${i}`].unrest += covert;
                                if (global.civic.foreign[`gov${i}`].unrest > 100){
                                    global.civic.foreign[`gov${i}`].unrest = 100;
                                }
                                messageQueue(loc('civics_spy_incite_success',[govTitle(i),covert]),'success',false,['spy']);
                            }
                            break;
                        case 'annex':
                            if (i >= 3){ break; }
                            let drawTechs = !global.tech['gov_fed'] && !checkControlling();
                            global.civic.foreign[`gov${i}`].anx = true;
                            messageQueue(loc('civics_spy_annex_success',[govTitle(i)]),'success',false,['spy']);
                            if (drawTechs){
                                drawTech();
                            }
                            break;
                        case 'purchase':
                            if (i >= 3){ break; }
                            let drawTechsAlt = !global.tech['gov_fed'] && !checkControlling();
                            global.civic.foreign[`gov${i}`].buy = true;
                            messageQueue(loc('civics_spy_purchase_success',[govTitle(i)]),'success',false,['spy']);
                            if (drawTechsAlt){
                                drawTech();
                            }
                            break;
                    }
                }
            }
        }

        if (global.race['banana']){
            let exporting = false;
            let importing = 0;
            Object.keys(global.resource).forEach(function(res){
                if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade < 0){
                    if (exporting){
                        global.resource[res].trade = 0;
                    }
                    else {
                        exporting = res;
                    }
                }
                if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade > 0){
                    importing += global.resource[res].trade;
                }
            });
            if (global.resource[exporting] && global.resource[exporting].trade <= -500){
                let affix = universeAffix();
                global.stats.banana.b4[affix] = true;
                if (affix !== 'm' && affix !== 'l'){
                    global.stats.banana.b4.l = true;
                }
                if (importing >= 500){
                    unlockFeat('banana');
                }
            }
        }

        if (global.galaxy['defense']){
            // Check both ships and regions in reverse order to prioritize bigger ships and later systems above smaller ships and earlier systems
            for (let i = gatewayArmada.length - 1; i >= 0; i--){
                let ship = gatewayArmada[i];
                let count = 0;
                for (let j = galaxyRegions.length - 1; j >= 0; j--){
                    let region = galaxyRegions[j];
                    if (global.galaxy.defense.hasOwnProperty(region)){
                        count += global.galaxy.defense[region][ship];
                        if (isNaN(global.galaxy.defense[region][ship])){
                            global.galaxy.defense[region][ship] = 0;
                        }
                        if (count > gal_on[ship]){
                            let overflow = count - gal_on[ship];
                            global.galaxy.defense[region][ship] -= overflow;
                        }
                        if (global.galaxy.defense[region][ship] < 0){
                            global.galaxy.defense[region][ship] = 0;
                        }
                    }
                }
                if (count < gal_on[ship]){
                    let underflow = gal_on[ship] - count;
                    global.galaxy.defense.gxy_gateway[ship] += underflow;
                }
            }
        }

        let cityList = Object.keys(global.city);
        if (global.race['hooved']){
            cityList.push('horseshoe');
        }
        if (global.tech['slaves'] && global.tech['slaves'] >= 2){
            cityList.push('slave_market');
        }
        cityList.forEach(function (action){
            if (actions.city[action] && actions.city[action].cost){
                let c_action = actions.city[action];
                let element = $('#'+c_action.id);
                if (element.length > 0){
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                        if (checkAffordable(c_action)){
                            if (element.hasClass('cna')){
                                element.removeClass('cna');
                            }
                        }
                        else if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                    else {
                        if (!element.hasClass('cnam')){
                            element.addClass('cnam');
                        }
                        if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                }
                if (global.city[action]){
                    let tc = timeCheck(c_action,false,true);
                    global.city[action]['time'] = timeFormat(tc.t);
                    global.city[action]['bn'] = tc.r;
                }
            }
        });

        Object.keys(actions.tech).forEach(function (action){
            if (actions.tech[action] && actions.tech[action].cost){
                let c_action = actions.tech[action];
                let element = $('#'+c_action.id);
                if (element.length > 0){
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                        if (checkAffordable(c_action)){
                            if (element.hasClass('cna')){
                                element.removeClass('cna');
                            }
                        }
                        else if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                    else {
                        if (!element.hasClass('cnam')){
                            element.addClass('cnam');
                        }
                        if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                }
            }
        });

        let spc_locations = ['space','interstellar','galaxy','portal','tauceti','eden'];
        for (let i=0; i<spc_locations.length; i++){
            let location = spc_locations[i];
            Object.keys(actions[location]).forEach(function (region){
                Object.keys(actions[location][region]).forEach(function (action){
                    let s_region = actions[location][region][action] && actions[location][region][action].hasOwnProperty('region') ? actions[location][region][action].region : location;
                    if ((global[s_region][action] || actions[location][region][action].grant) && actions[location][region][action] && actions[location][region][action].cost){
                        let c_action = actions[location][region][action];
                        let element = $('#'+c_action.id);
                        if (element.length > 0){
                            if (checkAffordable(c_action,true)){
                                if (element.hasClass('cnam')){
                                    element.removeClass('cnam');
                                }
                                if (checkAffordable(c_action)){
                                    if (element.hasClass('cna')){
                                        element.removeClass('cna');
                                    }
                                }
                                else if (!element.hasClass('cna')){
                                    element.addClass('cna');
                                }
                            }
                            else {
                                if (!element.hasClass('cnam')){
                                    element.addClass('cnam');
                                }
                                if (!element.hasClass('cna')){
                                    element.addClass('cna');
                                }
                            }
                        }
                        if (global[s_region][action]){
                            global[s_region][action]['time'] = timeFormat(timeCheck(c_action));
                        }
                    }
                });
            });
        }

        if (global.space['swarm_control']){
            global.space.swarm_control.s_max = global.space.swarm_control.count * actions.space.spc_sun.swarm_control.support();
        }

        if (global.arpa['sequence'] && global.arpa.sequence.on && S.gene_sequence){
            let labs = sequenceLabs();
            global.arpa.sequence.labs = labs;
            global.arpa.sequence.time -= global.arpa.sequence.boost ? labs * 2 : labs;
            global.arpa.sequence.progress = global.arpa.sequence.max - global.arpa.sequence.time;
            if (global.arpa.sequence.time <= 0){
                global.arpa.sequence.max = 50000 * (1 + (global.race.mutation ** 2));
                if (global.race['adaptable']){
                    let adapt = 1 - (traits.adaptable.vars()[0] / 100);
                    global.arpa.sequence.max = Math.floor(global.arpa.sequence.max * adapt);
                }
                global.arpa.sequence.progress = 0;
                global.arpa.sequence.time = global.arpa.sequence.max;
                if (global.tech['genetics'] === 2){
                    messageQueue(loc('genome',[flib('name')]),'success',false,['progress']);
                    global.tech['genetics'] = 3;
                }
                else {
                    global.race.mutation++;
                    let trait = randomMinorTrait(1);
                    let gene_multi = 1 + (global.genes['synthesis'] ? global.genes['synthesis'] : 0);
                    let gene = (2 ** (global.race.mutation - 1)) * gene_multi;
                    if (global.stats.achieve['creator']){
                        gene = Math.round(gene * (1 + (global.stats.achieve['creator'].l * 0.5)));
                    }
                    global.resource.Genes.amount += gene;
                    global.resource.Genes.display = true;
                    let plasma = global.genes['plasma'] ? global.race.mutation : 1;
                    if (global.genes['plasma'] && plasma > 3){
                        if (global.genes['plasma'] >= 2){
                            plasma = plasma > 5 ? 5 : plasma;
                        }
                        else {
                            plasma = 3;
                        }
                    }
                    let plasmid_type = plasma > 1 ? '_plural' : '';
                    if (global.race['universe'] === 'antimatter'){
                        plasmid_type = loc('resource_AntiPlasmid' + plasmid_type + '_name');
                        global.stats.antiplasmid += plasma;
                        global.prestige.AntiPlasmid.count += plasma;
                        unlockAchieve('cross');
                    }
                    else {
                        plasmid_type = loc('resource_Plasmid' + plasmid_type + '_name');
                        global.stats.plasmid += plasma;
                        global.prestige.Plasmid.count += plasma;
                    }
                    arpa('Crispr');
                    messageQueue(loc('gene_therapy',[loc('trait_' + trait + '_name'),gene,plasma,plasmid_type]),'success',false,['progress']);
                }
                arpa('Genetics');
                drawTech();
            }
        }

        if (global.city['foundry']){
            let fworkers = global.civic.craftsman.workers;
            if ((global.race['kindling_kindred'] || global.race['smoldering']) && global.city.foundry['Plywood'] > 0){
                global.civic.craftsman.workers -= global.city.foundry['Plywood'];
                global.city.foundry.crafting -= global.city.foundry['Plywood'];
                global.city.foundry['Plywood'] = 0;
            }
            let craft_costs = craftCost();
            Object.keys(craft_costs).forEach(function (craft){
                while (global.city.foundry[craft] > fworkers && global.city.foundry[craft] > 0){
                    global.city.foundry[craft]--;
                    global.city.foundry.crafting--;
                }
                fworkers -= global.city.foundry[craft];
            });
        }

        if (global.tech['foundry'] === 3 && (global.race['kindling_kindred'] || global.race['smoldering'])){
            global.tech['foundry'] = 4;
            drawTech();
        }

        if (global.race['kindling_kindred'] || global.race['smoldering']){
            global.civic.lumberjack.workers = 0;
            global.civic.lumberjack.assigned = 0;
            global.resource.Lumber.crates = 0;
            global.resource.Lumber.containers = 0;
            global.resource.Lumber.trade = 0;
        }
        if ((global.race['kindling_kindred'] || global.race['smoldering']) && global.city['foundry'] && global.city.foundry['Plywood']){
            global.city.foundry['Plywood'] = 0;
        }

        if (eventActive('fool',2023) && !global.race['hooved']){
            global.resource.Horseshoe.display = true;
        }
        else if (!global.race['hooved']){
            global.resource.Horseshoe.display = false;
        }

        set_qlevel(calcQuantumLevel(false));

        let belt_mining = support_on['iron_ship'] + support_on['iridium_ship'];
        if (belt_mining > 0 && global.tech['asteroid'] && global.tech['asteroid'] === 3){
            if (Math.rand(0,250) <= belt_mining){
                global.tech['asteroid'] = 4;
                global.resource.Elerium.display = true;
                modRes('Elerium',1,true);
                drawTech();
                messageQueue(loc('discover_elerium'),'info',false,['progress']);
            }
        }

        if (global.tech['asteroid'] && global.tech.asteroid === 4 && global.resource.Elerium.amount === 0){
            modRes('Elerium',1,true);
        }

        if (p_on['outpost'] > 0 && global.tech['gas_moon'] && global.tech['gas_moon'] === 1){
            if (Math.rand(0,100) <= p_on['outpost']){
                initStruct(actions.space.spc_gas_moon.oil_extractor);
                global.tech['gas_moon'] = 2;
                messageQueue(loc('discover_oil',[planetName().gas_moon]),'info',false,['progress']);
                renderSpace();
            }
        }
}

export function midLoop_s7($ctx){
        if (global.portal.hasOwnProperty('mechbay') && global.tech['hell_spire'] && global.tech.hell_spire >= 9){
            if (!global.portal.spire['boss']){
                genSpireFloor();
            }
            updateMechbay();

            if (global.portal.hasOwnProperty('spire') && global.portal.spire.count >= 50 && !global.tech['edenic'] && Object.keys(global.pillars).length >= 10){
                messageQueue(loc('eden_purify_well_msg',[50]),'info',false,['progress']);
                global.tech['edenic'] = 1;
                drawTech();
            }

            let progress = 0;
            let mechSkips = global.eden['mech_station'] ? global.eden.mech_station.mechs : 0;
            for (let i = 0; i < global.portal.mechbay.active; i++) {
                let mech = global.portal.mechbay.mechs[i];
                if (mechSkips > 0 && mech.size !== 'collector'){
                    mechSkips--;
                }
                else {
                    if (global.portal.hasOwnProperty('waygate') && global.tech.hasOwnProperty('waygate') && global.portal.waygate.on === 1 && global.tech.waygate >= 2 && global.portal.waygate.progress < 100){
                        progress += mechRating(mech,true);
                    }
                    else {
                        progress += mechRating(mech,false);
                    }
                }
            }

            if (global.portal.hasOwnProperty('waygate') && global.tech.hasOwnProperty('waygate') && global.portal.waygate.on === 1 && global.tech.waygate >= 2 && global.portal.waygate.progress < 100){
                global.portal.waygate.progress += progress;
                global.portal.waygate.time = progress === 0 ? timeFormat(-1) : timeFormat((100 - global.portal.waygate.progress) / progress);
                global.portal.spire.time = timeFormat(-1);
            }
            else {
                global.portal.spire.progress += progress;
                global.portal.spire.time = progress === 0 ? timeFormat(-1) : timeFormat((100 - global.portal.spire.progress) / progress);
                if (global.tech['waygate'] && global.tech.waygate >= 2){
                    global.portal.waygate.time = timeFormat(-1);
                }
            }
            if (global.portal.hasOwnProperty('waygate') && global.portal.waygate.on === 1 && global.portal.waygate.progress >= 100){
                global.portal.waygate.progress = 100;
                global.portal.waygate.on = 0;
                global.tech.waygate = 3;
                global.resource.Demonic_Essence.display = true;
                global.resource.Demonic_Essence.amount = 1;
                drawTech();
            }
            if (global.portal.spire.progress >= 100){
                global.portal.spire.progress = 0;
                let rank = Number(alevel());
                let stones = rank;
                if (global.genes['blood'] && global.genes['blood'] >= 2){
                    stones *= 2;
                }
                global.prestige.Blood_Stone.count += stones;
                global.stats.blood += stones;
                arpa('Blood');
                if (!global.tech.hasOwnProperty('b_stone')){
                    global.tech['b_stone'] = 1;
                    drawTech();
                }

                messageQueue(
                    `${loc('portal_spire_conquest',[loc(`portal_mech_boss_${global.portal.spire.boss}`),global.portal.spire.count])} ${loc(stones === 1 ? 'portal_spire_conquest_stone' : 'portal_spire_conquest_stones',[stones])}`
                ,'info',false,['progress','hell']);

                global.portal.spire.count++;
                if (global.portal.spire.count > 10 && global.tech['hell_spire'] && global.tech.hell_spire < 10){
                    global.tech['hell_spire'] = 10;
                    drawTech();
                }

                let affix = universeAffix();
                if (!global.stats.spire.hasOwnProperty(affix)){
                    global.stats.spire[affix] = { s0: 0, s1: 0, s2: 0, s3: 0, s4: 0 };
                }
                if (global.portal.spire.count > global.stats.spire[affix][`s${rank-1}`]){
                    global.stats.spire[affix][`s${rank-1}`] = global.portal.spire.count;
                }
                if (!global.stats.spire[affix].hasOwnProperty(global.portal.spire.boss) || rank > global.stats.spire[affix][global.portal.spire.boss]){
                    global.stats.spire[affix][global.portal.spire.boss] = rank;
                }

                if ((global.portal.spire.boss === 'djinni' && global.race.species === 'djinn') || global.portal.spire.boss === global.race.species){
                    unlockAchieve('doppelganger');
                }

                genSpireFloor();
                renderFortress();
            }
        }
        
        if(global.race['fasting'] && global.portal['oven_complete']){
            let progress = 0;
            if(p_on['oven_complete']){
                progress = 0.00025;
                if(global.portal['dish_life_infuser'] && global.portal['dish_life_infuser'].on){
                    progress *= 1 + (0.15 * global.portal['dish_life_infuser'].on);
                }
                if(global.portal['dish_soul_steeper'] && global.portal['dish_soul_steeper'].on && global.portal['spire']){
                    let hunger = 0.5;
                    if (global.race['angry']){
                        hunger -= traits.angry.vars()[0] / 100;
                    }
                    if (global.race['malnutrition']){
                        hunger += traits.malnutrition.vars()[0] / 100;
                    }
                    let mult = (0.03 + (global.race['malnutrition'] ? 0.01 : 0) + (global.race['angry'] ? -0.01 : 0));
                    let working = Math.min(global.portal['dish_soul_steeper'].on, Math.floor(hunger / mult));
                    progress *= 1 + (0.05 * (global.portal['spire'].count-1) * working);
                }
                global.portal['devilish_dish'].done += progress;
                global.portal['devilish_dish'].done = Math.min(global.portal['devilish_dish'].done, 100);
                global.portal['devilish_dish'].count = Math.floor(global.portal['devilish_dish'].done);
                if(global.portal['devilish_dish'].done >= 0.05 && global.tech['dish'] === 3){
                    messageQueue(loc('dish_progress'),'info',false,['progress']);
                    global.tech['dish'] = 4;
                    drawTech();
                }
            }
            global.portal['devilish_dish'].time = progress === 0 ? timeFormat(-1) : timeFormat((100 - global.portal['devilish_dish'].done) / progress);
        }

        if (global.tech['asphodel'] && global.tech.asphodel === 4 && Math.rand(0,25) === 0){
            global.tech['asphodel'] = 5;
            drawTech();
            messageQueue(loc('eden_asphodel_hostile'),'info',false,['progress']);
        }

        if (global.race['cannibalize'] && global.city['s_alter']){
            if (global.city.s_alter.rage > 0){
                global.city.s_alter.rage--;
            }
            if (global.city.s_alter.regen > 0){
                global.city.s_alter.regen--;
            }
            if (global.city.s_alter.mind > 0){
                global.city.s_alter.mind--;
            }
            if (global.city.s_alter.mine > 0){
                global.city.s_alter.mine--;
            }
            if (global.city.s_alter.harvest > 0){
                global.city.s_alter.harvest--;
            }

            if ($(`#popper[data-id="city-s_alter"]`).length > 0){
                updateDesc(actions.city.s_alter,'city','s_alter');
            }
        }

        if (global.race['casting']){
            let total = 0;
            ritual_types.forEach(function (spell){
                if (global.race.casting[spell]){
                    total += global.race.casting[spell];
                }
            });
            global.race.casting.total = total;
        }

        let blockGeneBuffer = false;
        if (global.tech['r_queue'] && global.r_queue.display){
            let idx = -1;
            let c_action = false;
            let stop = false;
            let time = 0; let untime = 0;
            let spent = { t: {t:0,rt:0}, r: {}, rr: {}, id: {}};
            for (let i=0; i<global.r_queue.queue.length; i++){
                let struct = global.r_queue.queue[i];
                let t_action = actions[struct.action][struct.type];
                time = global.settings.qAny_res ? 0 : time;
                untime = global.settings.qAny_res ? 0 : untime;

                if (t_action['grant'] && global.tech[t_action.grant[0]] && global.tech[t_action.grant[0]] >= t_action.grant[1]){
                    global.r_queue.queue.splice(i,1);
                    clearPopper(`rq${c_action.id}`);
                    break;
                }
                else {
                    if (checkAffordable(t_action,true)){
                        global.r_queue.queue[i].cna = false;
                        let reqMet = checkTechRequirements(struct.type,false);
                        let t_time = global.settings.qAny_res ? timeCheck(t_action) : timeCheck(t_action, spent, false, reqMet);
                        if (t_time >= 0){
                            if (!stop && checkAffordable(t_action) && reqMet){
                                c_action = t_action;
                                idx = i;
                                if (global.settings.qAny_res){
                                    stop = true;
                                }
                            }
                            else {
                                if (reqMet){
                                    if (!stop && t_time <= 1){
                                        blockGeneBuffer = true;
                                    }
                                    time += t_time;
                                }
                                untime += t_time;
                            }
                            if (!global.settings.qAny_res && reqMet){
                                stop = true;
                            }
                            global.r_queue.queue[i]['time'] = reqMet ? time : untime;
                        }
                        else {
                            global.r_queue.queue[i]['time'] = t_time;
                        }
                        global.r_queue.queue[i]['req'] = reqMet ? true : false;
                    }
                    else {
                        global.r_queue.queue[i].cna = true;
                        global.r_queue.queue[i]['time'] = -1;
                    }
                }
                global.r_queue.queue[i].qa = global.settings.qAny_res ? true : false;
            }
            if (idx >= 0 && c_action && !global.r_queue.pause){
                if (c_action.action({isQueue: true})){
                    messageQueue(loc('research_success',[global.r_queue.queue[idx].label]),'success',false,['queue','research_queue']);
                    gainTech(global.r_queue.queue[idx].type);
                    if (c_action['post']) {
                        c_action.post();
                    }
                    global.r_queue.queue.splice(idx,1);
                    clearPopper(`rq${c_action.id}`);
                    resQueue();
                }
            }
            if (global.r_queue.queue.length > global.r_queue.max){
                global.r_queue.queue.splice(global.r_queue.max);
            }

            let q_techs = {}; let remove = [];
            checkTechRequirements('club',q_techs);
            for (let i=0; i<global.r_queue.queue.length; i++){
                Object.keys(actions.tech[global.r_queue.queue[i].type].reqs).forEach(function(req){
                    if (skipRequirement(req, global.tech[req] || 0)){ return; }
                    if (
                        (!global.tech[req] || global.tech[req] < actions.tech[global.r_queue.queue[i].type].reqs[req])
                        &&
                        (!q_techs[req] || (q_techs[req] && q_techs[req].v < actions.tech[global.r_queue.queue[i].type].reqs[req]))
                        ){
                        remove.push(i);
                    }
                });
            }
            if (remove.length > 0){
                for (let i=remove.length - 1; i>=0; i--){
                    global.r_queue.queue.splice(remove[i],1);
                }
            }
        }

        if (global.arpa.sequence && global.arpa.sequence['auto'] && global.tech['genetics'] && global.tech['genetics'] >= 8){
            buildGene(blockGeneBuffer);
        }

        if (p_on['soul_forge']){
            vBind({el: `#fort`},'update');
        }

        checkAchievements();
}
