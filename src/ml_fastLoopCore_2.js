import { global, breakdown, gal_on, p_on, support_on, int_on, spire_on } from './vars.js';
import { modRes, eventActive } from './functions.js';
import { traits, planetTraits } from './races.js';
import { govActive } from './governor.js';
import { govEffect, garrisonSize } from './civics.js';
import { highPopAdjust } from './prod.js';
import { loc } from './locale.js';
import { astroVal } from './seasons.js';
import { atomic_mass, supplyValue } from './resources.js';
import { actions } from './actions.js';
import { fuel_adjust, int_fuel_adjust, renderSpace, galaxy_ship_types } from './space.js';
import { jobScale, job_desc, workerScale } from './jobs.js';
import { soulForgeSoldiers, mechCollect } from './portal.js';
import { replicator } from './industry.js';
import { shipCrewSize } from './truepath.js';
import { S } from './main_state.js';
import { MORALE_BONUS_PER_LOT } from './stocks_core.js';

// Bagian dari fastLoopCore (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function fastLoopCore_s4($ctx){
        if (global.interstellar['starport'] && global.interstellar['starport'].count > 0){
            let fuel_cost = +int_fuel_adjust(5);
            let mb_consume = p_on['starport'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('interstellar_alpha_starport_title')] = -(mb_consume);
            for (let i=0; i<p_on['starport']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    mb_consume -= (p_on['starport'] * fuel_cost) - (i * fuel_cost);
                    p_on['starport'] -= i;
                    break;
                }
            }
            global.interstellar.starport.s_max = p_on['starport'] * actions.interstellar.int_alpha.starport.support();
            global.interstellar.starport.s_max += p_on['habitat'] * actions.interstellar.int_alpha.habitat.support();
            global.interstellar.starport.s_max += p_on['xfer_station'] * actions.interstellar.int_proxima.xfer_station.support();
        }

        // Droids
        $ctx.miner_droids = {
            adam: 0,
            uran: 0,
            coal: 0,
            alum: 0,
        };

        if (global.interstellar['starport']){
            let used_support = 0;
            let structs = global.support.alpha.map(x => x.split(':')[1]);
            for ($ctx.i = 0; $ctx.i < structs.length; $ctx.i++){
                if (global.interstellar[structs[$ctx.i]]){
                    let operating = global.interstellar[structs[$ctx.i]].on;
                    let id = actions.interstellar.int_alpha[structs[$ctx.i]].id;
                    if (used_support + operating > global.interstellar.starport.s_max){
                        operating -=  (used_support + operating) - global.interstellar.starport.s_max;
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.interstellar[structs[$ctx.i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
                    }
                    used_support += operating;
                    int_on[structs[$ctx.i]] = operating;
                }
                else {
                    int_on[structs[$ctx.i]] = 0;
                }
            }
            global.interstellar.starport.support = used_support;

            if (global.interstellar.hasOwnProperty('mining_droid') && global.interstellar.mining_droid.count > 0){
                let on_droid = int_on['mining_droid'];
                let max_droid = global.interstellar.mining_droid.on;
                let eff = max_droid > 0 ? on_droid / max_droid : 0;
                let remaining = max_droid;

                ['adam','uran','coal','alum'].forEach(function(res){
                    remaining -= global.interstellar.mining_droid[res];
                    if (remaining < 0) {
                        global.interstellar.mining_droid[res] += remaining;
                        remaining = 0;
                    }
                    $ctx.miner_droids[res] = global.interstellar.mining_droid[res] * eff;
                });
            }
        }

        // Starbase
        if (global.galaxy['starbase'] && global.galaxy['starbase'].count > 0){
            let fuel_cost = +int_fuel_adjust(25);
            let mb_consume = p_on['starbase'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('galaxy_starbase')] = -(mb_consume);
            for (let i=0; i<p_on['starbase']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    mb_consume -= (p_on['starbase'] * fuel_cost) - (i * fuel_cost);
                    p_on['starbase'] -= i;
                    break;
                }
            }
            if (p_on['s_gate']){
                global.galaxy.starbase.s_max = p_on['starbase'] * actions.galaxy.gxy_gateway.starbase.support();
                if (p_on['gateway_station']){
                    global.galaxy.starbase.s_max += p_on['gateway_station'] * actions.galaxy.gxy_stargate.gateway_station.support();
                }
                if (p_on['telemetry_beacon']){
                    global.galaxy.starbase.s_max += p_on['telemetry_beacon'] * actions.galaxy.gxy_stargate.telemetry_beacon.support();
                }
                if (p_on['ship_dock']){
                    global.galaxy.starbase.s_max += p_on['ship_dock'] * actions.galaxy.gxy_gateway.ship_dock.support();
                }
            }
            else {
                global.galaxy.starbase.s_max = 0;
            }
        }

        if (global.galaxy['starbase']){
            let used_support = 0;
            let gateway_structs = global.support.gateway.map(x => x.split(':')[1]);
            for ($ctx.i = 0; $ctx.i < gateway_structs.length; $ctx.i++){
                if (global.galaxy[gateway_structs[$ctx.i]]){
                    let operating = global.galaxy[gateway_structs[$ctx.i]].on;
                    let id = actions.galaxy.gxy_gateway[gateway_structs[$ctx.i]].id;
                    let operating_cost = -(actions.galaxy.gxy_gateway[gateway_structs[$ctx.i]].support());
                    let max_operating = Math.floor((global.galaxy.starbase.s_max - used_support) / operating_cost);
                    if (operating > max_operating){
                        operating = max_operating;
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.galaxy[gateway_structs[$ctx.i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
                    }
                    used_support += operating * operating_cost;
                    gal_on[gateway_structs[$ctx.i]] = operating;
                }
                else {
                    gal_on[gateway_structs[$ctx.i]] = 0;
                }
            }
            global.galaxy.starbase.support = used_support;
        }

        // Foothold
        if (global.galaxy['foothold'] && global.galaxy.foothold.count > 0){
            global.galaxy.foothold.s_max = p_on['s_gate'] * p_on['foothold'] * actions.galaxy.gxy_alien2.foothold.support();
        }

        // Guard Post
        if (global.portal['guard_post']){
            global.portal.guard_post.s_max = global.portal.guard_post.count * actions.portal.prtl_ruins.guard_post.support();

            if (global.portal.guard_post.on > 0){
                let army = global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
                if (p_on['soul_forge']){
                    let forge = soulForgeSoldiers();
                    if (forge <= army){
                        army -= forge;
                    }
                }
                if (army < jobScale(global.portal.guard_post.on)){
                    global.portal.guard_post.on = Math.floor(army / jobScale(1));
                    p_on['guard_post'] = Math.min(global.portal.guard_post.on, p_on['guard_post']);
                }
            }

            global.portal.guard_post.support = global.portal.guard_post.on;
        }

        // harbor
        if (global.portal['harbor']){
            global.portal.harbor.s_max = p_on['harbor'] * actions.portal.prtl_lake.harbor.support();
        }

        // Purifier
        if (global.portal['purifier']){
            global.portal.purifier.s_max = +(p_on['purifier'] * actions.portal.prtl_spire.purifier.support()).toFixed(2);

            let used_support = 0;
            let purifier_structs = global.support.spire.map(x => x.split(':')[1]);
            for ($ctx.i = 0; $ctx.i < purifier_structs.length; $ctx.i++){
                if (global.portal[purifier_structs[$ctx.i]]){
                    let operating = global.portal[purifier_structs[$ctx.i]].on;
                    let id = actions.portal.prtl_spire[purifier_structs[$ctx.i]].id;
                    if (used_support + operating > global.portal.purifier.s_max){
                        operating -= (used_support + operating) - global.portal.purifier.s_max;
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.portal[purifier_structs[$ctx.i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
                    }
                    used_support += operating * -(actions.portal.prtl_spire[purifier_structs[$ctx.i]].support());
                    spire_on[purifier_structs[$ctx.i]] = operating;
                }
                else {
                    spire_on[purifier_structs[$ctx.i]] = 0;
                }
            }
            global.portal.purifier.support = used_support;
        }

        // Space Station
        if (global.space['space_station'] && global.space['space_station'].count > 0){
            let fuel_cost = +fuel_adjust(2.5,true);
            let ss_consume = p_on['space_station'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('space_belt_station_title')] = -(ss_consume);
            for (let i=0; i<p_on['space_station']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    ss_consume -= (p_on['space_station'] * fuel_cost) - (i * fuel_cost);
                    p_on['space_station'] -= i;
                    break;
                }
            }
        }

        if (global.space['space_station']){
            let used_support = 0;
            let belt_structs = global.support.belt.map(x => x.split(':')[1]);
            for ($ctx.i = 0; $ctx.i < belt_structs.length; $ctx.i++){
                if (global.space[belt_structs[$ctx.i]]){
                    let operating = global.space[belt_structs[$ctx.i]].on;
                    let id = actions.space.spc_belt[belt_structs[$ctx.i]].id;
                    if (used_support + (operating * -(actions.space.spc_belt[belt_structs[$ctx.i]].support())) > global.space.space_station.s_max){
                        let excess = used_support + (operating * -(actions.space.spc_belt[belt_structs[$ctx.i]].support())) - global.space.space_station.s_max;
                        operating -= Math.ceil(excess / -(actions.space.spc_belt[belt_structs[$ctx.i]].support()));
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.space[belt_structs[$ctx.i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
                    }
                    used_support += (operating * -(actions.space.spc_belt[belt_structs[$ctx.i]].support()));
                    support_on[belt_structs[$ctx.i]] = operating;
                }
                else {
                    support_on[belt_structs[$ctx.i]] = 0;
                }
            }
            global.space.space_station.support = used_support;
        }

        if (global.interstellar['nexus'] && global.interstellar['nexus'].count > 0){
            let cash_cost = 350;
            let mb_consume = p_on['nexus'] * cash_cost;
            breakdown.p.consume.Money[loc('interstellar_nexus_bd')] = -(mb_consume);
            for (let i=0; i<p_on['nexus']; i++){
                if (!modRes('Money', -($ctx.time_multiplier * cash_cost))){
                    mb_consume -= (p_on['nexus'] * cash_cost) - (i * cash_cost);
                    p_on['nexus'] -= i;
                    break;
                }
            }
            global.interstellar.nexus.s_max = p_on['nexus'] * actions.interstellar.int_nebula.nexus.support();
        }

        if (global.interstellar['nexus']){
            let used_support = 0;
            let structs = global.support.nebula.map(x => x.split(':')[1]);
            for ($ctx.i = 0; $ctx.i < structs.length; $ctx.i++){
                if (global.interstellar[structs[$ctx.i]]){
                    let operating = global.interstellar[structs[$ctx.i]].on;
                    let id = actions.interstellar.int_nebula[structs[$ctx.i]].id;
                    if (used_support + operating > global.interstellar.nexus.s_max){
                        operating -=  (used_support + operating) - global.interstellar.nexus.s_max;
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.interstellar[structs[$ctx.i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
                    }
                    used_support += operating;
                    int_on[structs[$ctx.i]] = operating;
                }
                else {
                    int_on[structs[$ctx.i]] = 0;
                }
            }
            global.interstellar.nexus.support = used_support;
        }

        // Transfer Station
        if (global.interstellar['xfer_station'] && p_on['xfer_station']){
            let fuel_cost = 0.28;
            let xfer_consume = p_on['xfer_station'] * fuel_cost;
            breakdown.p.consume.Uranium[loc('interstellar_xfer_station_title')] = -(xfer_consume);
            for (let i=0; i<p_on['xfer_station']; i++){
                if (!modRes('Uranium', -($ctx.time_multiplier * fuel_cost))){
                    xfer_consume -= (p_on['xfer_station'] * fuel_cost) - (i * fuel_cost);
                    p_on['xfer_station'] -= i;
                    break;
                }
            }
        }

        // Foward Operating Base
        if (global.space['fob'] && p_on['fob']){
            let fuel_cost = +fuel_adjust(125,true);
            let xfer_consume = p_on['fob'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('tech_fob')] = -(xfer_consume);
            for (let i=0; i<p_on['fob']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    xfer_consume -= (p_on['fob'] * fuel_cost) - (i * fuel_cost);
                    p_on['fob'] -= i;
                    break;
                }
            }
        }

        // Outpost
        if (p_on['outpost'] && p_on['outpost'] > 0){
            let fuel_cost = +fuel_adjust(2,true);
            let out_consume = p_on['outpost'] * fuel_cost;
            breakdown.p.consume.Oil[loc('space_gas_moon_outpost_bd')] = -(out_consume);
            for (let i=0; i<p_on['outpost']; i++){
                if (!modRes('Oil', -($ctx.time_multiplier * fuel_cost))){
                    out_consume -= (p_on['outpost'] * fuel_cost) - (i * fuel_cost);
                    p_on['outpost'] -= i;
                    break;
                }
            }
        }

        // Neutron Miner
        if (p_on['neutron_miner'] && p_on['neutron_miner'] > 0){
            let fuel_cost = +int_fuel_adjust(3);
            let out_consume = p_on['neutron_miner'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('interstellar_neutron_miner_title')] = -(out_consume);
            for (let i=0; i<p_on['neutron_miner']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    out_consume -= (p_on['neutron_miner'] * fuel_cost) - (i * fuel_cost);
                    p_on['neutron_miner'] -= i;
                    break;
                }
            }
        }

        // Patrol Cruiser
        if (global.interstellar['cruiser']){
            let fuel_cost = +int_fuel_adjust(6);
            let active = global.interstellar['cruiser'].on;
            let out_consume = active * fuel_cost;
            breakdown.p.consume.Helium_3[loc('interstellar_cruiser_title')] = -(out_consume);
            for (let i=0; i<global.interstellar['cruiser'].on; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    out_consume -= (global.interstellar['cruiser'].on * fuel_cost) - (i * fuel_cost);
                    active -= i;
                    break;
                }
            }
            int_on['cruiser'] = active;
        }

        // Pillbox
        if (global.eden['pillbox']){
            let pillsize = jobScale(10);
            if (p_on['pillbox']){
                var staff = p_on['pillbox'] * pillsize;
                let soldiers = garrisonSize(false,{nopill: true});
                if (soldiers < staff){
                    staff = Math.floor(soldiers / pillsize) * pillsize;
                }
                global.eden.pillbox.staffed = staff;
            }
            else {
                global.eden.pillbox.staffed = 0;
            }

            if (global.eden.pillbox.staffed < p_on['pillbox'] * pillsize){
                $(`#eden-pillbox .on`).addClass('warn');
            }
            else {
                $(`#eden-pillbox .on`).removeClass('warn')
            }
        }

        // Graphene Hack
        if (global.tech['isolation'] && global.race['truepath']){
            support_on['g_factory'] = p_on['refueling_station'];
            global.space.g_factory.count = global.tauceti.refueling_station.count;
            global.space.g_factory.on = global.tauceti.refueling_station.on;
        }

        if (global.race['replicator'] && p_on['replicator']){
            let res = global.race.replicator.res;
            if (!['Asphodel_Powder','Elysanite'].includes(res)){
                let vol = replicator(res,p_on['replicator']);
                breakdown.p.consume[res][loc('tau_replicator_db')] = vol;
                modRes(res, $ctx.time_multiplier * vol);
            }
        }

        // Stargate
        if (p_on['s_gate']){
            if (!global.settings.showGalactic){
                global.settings.showGalactic = true;
                global.settings.space.stargate = true;
                renderSpace();
            }
        }
        else {
            global.settings.showGalactic = false;
            global.settings.space.stargate = false;
        }

        // Ship Yard
        if (p_on['shipyard']){
            global.settings.showShipYard = true;
        }
        else {
            global.settings.showShipYard = false;
            if (global.settings.govTabs === 5){
                global.settings.govTabs = 0;
            }
        }

        let crew_civ = 0;
        let crew_mil = 0;
        let total = 0;
        let andromeda_helium = 0;
        let andromeda_deuterium = 0;

        for (let j=0; j<galaxy_ship_types.length; j++){
            const area = galaxy_ship_types[j].area;
            const region = galaxy_ship_types[j].region;
            const req = galaxy_ship_types[j].hasOwnProperty('req') ? p_on[galaxy_ship_types[j].req] > 0 : true;
            const support_home = actions[area][region].info?.support;
            let used_support = 0;
            for (let i=0; i<galaxy_ship_types[j].ships.length; i++){
                const ship = galaxy_ship_types[j].ships[i];
                if (global[area][ship]){
                    let operating = 0;
                    if (global[area][ship].hasOwnProperty('on') && req && (p_on['s_gate'] || area !== 'galaxy')){
                        const id = actions[area][region][ship].id;
                        const num_on = global[area][ship].on;
                        operating = num_on;

                        // Support cost
                        const operating_cost = actions[area][region][ship].hasOwnProperty('support') ? -(actions[area][region][ship].support()) : 0;
                        if (operating_cost > 0){
                            const max_operating = Math.floor((global[area][support_home].s_max - used_support) / operating_cost);
                            operating = Math.min(operating, max_operating);
                        }

                        if (actions[area][region][ship].hasOwnProperty('ship')){
                            if (actions[area][region][ship].ship.civ && global[area][ship].hasOwnProperty('crew')){
                                // Civilian ships can only be crewed at a rate of 1 ship (per type) per fast tick
                                let civPerShip = actions[area][region][ship].ship.civ();
                                if (civPerShip > 0){
                                    if (global[area][ship].crew < 0){
                                        global[area][ship].crew = 0;
                                    }
                                    if (global[area][ship].crew < operating * civPerShip){
                                        if (total < global.resource[global.race.species].amount){
                                            if (global.civic[global.civic.d_job].workers >= civPerShip){
                                                global.civic[global.civic.d_job].workers -= civPerShip;
                                                global.civic.crew.workers += civPerShip;
                                                global[area][ship].crew += civPerShip;
                                            }
                                        }
                                    }
                                    else if (global[area][ship].crew > operating * civPerShip){
                                        global.civic[global.civic.d_job].workers += civPerShip;
                                        global.civic.crew.workers -= civPerShip;
                                        global[area][ship].crew -= civPerShip;
                                    }
                                    global.civic.crew.assigned = global.civic.crew.workers;
                                    crew_civ += global[area][ship].crew;
                                    total += global[area][ship].crew;
                                    operating = Math.min(operating, Math.floor(global[area][ship].crew / civPerShip));
                                }
                            }

                            if (actions[area][region][ship].ship.mil && global[area][ship].hasOwnProperty('mil')){
                                // All military ships can be crewed instantly
                                let milPerShip = actions[area][region][ship].ship.mil();
                                if (milPerShip > 0){
                                    if (global[area][ship].mil !== operating * milPerShip){
                                        global[area][ship].mil = operating * milPerShip;
                                    }
                                    if (global.civic.garrison.workers - global.portal.fortress.garrison < 0){
                                        let underflow = global.civic.garrison.workers - global.portal.fortress.garrison;
                                        global[area][ship].mil -= underflow;
                                    }
                                    if (crew_mil + global[area][ship].mil > global.civic.garrison.workers - global.portal.fortress.garrison){
                                        global[area][ship].mil = global.civic.garrison.workers - global.portal.fortress.garrison - crew_mil;
                                    }
                                    if (global[area][ship].mil < 0){
                                        global[area][ship].mil = 0;
                                    }
                                    crew_mil += global[area][ship].mil;
                                    operating = Math.min(operating, Math.floor(global[area][ship].mil / milPerShip));
                                }
                            }

                            if (actions[area][region][ship].ship.hasOwnProperty('helium')){
                                let increment = +int_fuel_adjust(actions[area][region][ship].ship.helium).toFixed(2);
                                let consume = operating * increment;
                                while (consume * $ctx.time_multiplier > global.resource.Helium_3.amount + (global.resource.Helium_3.diff > 0 ? global.resource.Helium_3.diff * $ctx.time_multiplier : 0) && operating > 0){
                                    consume -= increment;
                                    operating--;
                                }
                                modRes('Helium_3', -(consume * $ctx.time_multiplier));
                                andromeda_helium += consume;
                            }

                            if (actions[area][region][ship].ship.hasOwnProperty('deuterium')){
                                let increment = +int_fuel_adjust(actions[area][region][ship].ship.deuterium).toFixed(2);
                                let consume = operating * increment;
                                while (consume * $ctx.time_multiplier > global.resource.Deuterium.amount + (global.resource.Deuterium.diff > 0 ? global.resource.Deuterium.diff * $ctx.time_multiplier : 0) && operating > 0){
                                    consume -= increment;
                                    operating--;
                                }
                                modRes('Deuterium', -(consume * $ctx.time_multiplier));
                                andromeda_deuterium += consume;
                            }
                        }

                        if (operating < num_on){
                            $(`#${id} .on`).addClass('warn');
                            $(`#${id} .on`).prop('title',`ON ${operating}/${num_on}`);
                        }
                        else {
                            $(`#${id} .on`).removeClass('warn');
                            $(`#${id} .on`).prop('title',`ON`);
                        }

                        used_support += operating * operating_cost;
                    }
                    gal_on[ship] = operating;
                }
            }
            if (support_home && global?.[area]?.[support_home]?.hasOwnProperty('support')){
                global[area][support_home].support = used_support;
            }
        }

        breakdown.p.consume.Helium_3[loc('galaxy_fuel_consume')] = -(andromeda_helium);
        breakdown.p.consume.Deuterium[loc('galaxy_fuel_consume')] = -(andromeda_deuterium);

        global.civic.crew.workers = crew_civ;
        if (global.civic.garrison.hasOwnProperty('crew')){
            if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                global.space.shipyard.ships.forEach(function(ship){
                    if (ship.location !== 'spc_dwarf' || (ship.location === 'spc_dwarf' && ship.transit > 0)){
                        crew_mil += shipCrewSize(ship);
                    }
                });
            }
            global.civic.garrison.crew = crew_mil;
        }

        // Detect labor anomalies
        Object.keys(job_desc).forEach(function (job) {
            if (global.civic[job]){
                if (job !== 'crew'){
                    total += global.civic[job].workers;
                    if (total > global.resource[global.race.species].amount){
                        global.civic[job].workers -= total - global.resource[global.race.species].amount;
                    }
                    if (!global.civic[job].display || global.civic[job].workers < 0){
                        global.civic[job].workers = 0;
                    }
                }
                if (job !== 'unemployed' && job !== 'hunter' && job !== 'forager'){
                    let stress_level = global.civic[job].stress;
                    if (global.city.ptrait.includes('mellow')){
                        stress_level += planetTraits.mellow.vars()[1];
                    }
                    if (global.race['content']){
                        let effectiveness = job === 'hell_surveyor' ? 0.2 : 0.4;
                        stress_level += global.race['content'] * effectiveness;
                    }
                    if (global.city.ptrait.includes('dense') && job === 'miner'){
                        stress_level -= planetTraits.dense.vars()[1];
                    }
                    if (global.race['freespirit'] && job !== 'farmer' && job !== 'lumberjack' && job !== 'quarry_worker' && job !== 'crystal_miner' && job !== 'scavenger'){
                        stress_level /= 1 + (traits.freespirit.vars()[0] / 100);
                    }

                    let workers = global.civic[job].workers;
                    if (global.race['high_pop']){
                        workers /= traits.high_pop.vars()[0];
                    }

                    if (global.race['sky_lover'] && ['miner','coal_miner','crystal_miner','pit_miner'].includes(job)){
                        workers *= 1 + (traits.sky_lover.vars()[0] / 100);
                    }

                    $ctx.stress -= workers / stress_level;
                }
            }
        });
        global.civic[global.civic.d_job].workers += global.resource[global.race.species].amount - total;
        if (global.civic[global.civic.d_job].workers < 0){
            global.civic[global.civic.d_job].workers = 0;
        }

        Object.keys(job_desc).forEach(function (job){
            if (job !== 'craftsman' && global.civic[job] && global.civic[job].display && global.civic[job].workers < global.civic[job].assigned && global.civic[global.civic.d_job].workers > 0 && global.civic[job].workers < global.civic[job].max){
                global.civic[job].workers++;
                global.civic[global.civic.d_job].workers--;
            }
        });

        $ctx.entertainment = 0;
}

export function fastLoopCore_s5($ctx){
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
        if (global.stocks && global.stocks.market.Morale && global.stocks.market.Morale.lots > 0){
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

        $ctx.aetherProdMult = 1;
        if (global.prestige.hasOwnProperty('Aether') && global.settings.aetherProd > 0){
            let draw = Math.min(global.settings.aetherProd, global.prestige.Aether.count);
            if (draw > 0){
                global.prestige.Aether.count -= draw;
                $ctx.aetherProdMult = 1 + (draw / 0.000000001);
                breakdown.p['Global'][loc('aether_prod_label')] = (($ctx.aetherProdMult - 1) * 100) + '%';
            }
        }
        $ctx.global_multiplier *= $ctx.aetherProdMult;

        if (global.interstellar['mass_ejector']){
            let total = 0;
            let mass = 0;
            let exotic = 0;
            Object.keys(global.interstellar.mass_ejector).forEach(function (res){
                if (atomic_mass[res]){
                    let ejected = global.interstellar.mass_ejector[res];
                    if (total + ejected > p_on['mass_ejector'] * 1000){
                        ejected = p_on['mass_ejector'] * 1000 - total;
                    }
                    total += ejected;

                    if (ejected > 0){
                        breakdown.p.consume[res][loc('interstellar_blackhole_name')] = -(ejected);
                    }

                    if (ejected * $ctx.time_multiplier > global.resource[res].amount){
                        ejected = global.resource[res].amount / $ctx.time_multiplier;
                    }
                    if (ejected < 0){
                        ejected = 0;
                    }

                    modRes(res, -($ctx.time_multiplier * ejected));
                    mass += ejected * atomic_mass[res];
                    if (global.race.universe !== 'magic' && (res === 'Elerium' || res === 'Infernite')){
                        exotic += ejected * atomic_mass[res];
                    }
                }
            });
            global.interstellar.mass_ejector.mass = mass;
            global.interstellar.mass_ejector.total = total;

            global.interstellar.stellar_engine.mass += mass / 10000000000 * $ctx.time_multiplier;
            global.interstellar.stellar_engine.exotic += exotic / 10000000000 * $ctx.time_multiplier;
        }

        if (global.portal['transport'] && global.portal['purifier']){
            let total = 0;
            let supply = 0;
            let bireme_rating = global.blood['spire'] && global.blood.spire >= 2 ? 0.8 : 0.85;
            let cargoSize = global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 4 ? 8 : 5;
            Object.keys(global.portal.transport.cargo).forEach(function (res){
                if (supplyValue[res]){
                    let shipped = global.portal.transport.cargo[res];
                    if (total + shipped > gal_on['transport'] * cargoSize){
                        shipped = gal_on['transport'] * cargoSize - total;
                    }
                    total += shipped;

                    let volume = shipped * supplyValue[res].out;
                    while (volume * $ctx.time_multiplier > global.resource[res].amount && volume > 0){
                        volume -= supplyValue[res].out;
                        shipped--;
                    }
                    if (volume > 0){
                        breakdown.p.consume[res][loc('portal_transport_title')] = -(volume);
                    }

                    let bireme = 1 - (bireme_rating ** (gal_on['bireme'] || 0));

                    modRes(res, -($ctx.time_multiplier * volume));
                    supply += Number(shipped * supplyValue[res].in * $ctx.time_multiplier * bireme);
                }
            });
            if (global.tech['hell_lake'] && global.tech.hell_lake >= 7 && global.tech['railway']){
                supply *= 1 + (global.tech.railway / 100);
            }
            if (global.portal['mechbay']){
                for (let i = 0; i < global.portal.mechbay.active; i++) {
                    let mech = global.portal.mechbay.mechs[i];
                    if (mech.size === 'collector') {
                        supply += mechCollect(mech) * $ctx.time_multiplier;
                    }
                    else if (mech.size === 'minion' && mech.equip.includes('scavenger')){
                        supply += mechCollect(mech) * $ctx.time_multiplier;
                    }
                }
            }
            global.portal.purifier.supply += supply;
            global.portal.purifier.diff = supply / $ctx.time_multiplier;
            if (global.portal.purifier.supply > global.portal.purifier.sup_max){
                global.portal.purifier.supply = global.portal.purifier.sup_max;
            }
        }

        if (global.race['carnivore'] && !global.race['herbivore'] && !global.race['soul_eater'] && !global.race['artifical']){
            if (global.resource['Food'].amount > 10){
                let rotPercent = traits.carnivore.vars()[0] / 100;
                let rot = +((global.resource['Food'].amount - 10) * (rotPercent)).toFixed(3);
                if (global.city['smokehouse']){
                    rot *= 0.9 ** global.city.smokehouse.count;
                }
                modRes('Food', -(rot * $ctx.time_multiplier));
                breakdown.p.consume['Food'][loc('spoilage')] = -(rot);
            }
        }

        if (global.race['gnawer']){
            let res = global.race['kindling_kindred'] || global.race['smoldering'] ? 'Stone' : 'Lumber';
            if (global.resource[res].display){
                let pop = global.resource[global.race.species].amount + global.civic.garrison.workers;
                if(global.race['high_pop']){
                    pop /= traits.high_pop.vars()[0];
                }
                let res_cost = pop * traits.gnawer.vars()[0];
                breakdown.p.consume[res][loc('trait_gnawer_bd')] = -(res_cost);
                modRes(res, -(res_cost * $ctx.time_multiplier));
            }
        }

        // Consumption
        $ctx.fed = true;
}
