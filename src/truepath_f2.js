import { global, support_on, p_on } from './vars.js';
import { clearElement, vBind, deepClone, clearPopper, popover } from './functions.js';
import { spaceTech } from './space.js';
import { loc } from './locale.js';
import { orbitLength, traits } from './races.js';
import { actions, initStruct } from './actions.js';
import { jobScale, job_desc } from './jobs.js';
import { garrisonSize, armyRating, soldierDeath } from './civics.js';
import { removeTask, defineGovernor } from './governor.js';
import { nf_resources, cancelRituals } from './industry.js';
import { tauCetiModules } from './truepath_registry.js';
import { spacePlanetStats } from './truepath.js';
import { clearShipDrag, shipyardShipCompare, updateCosts, shipCrewSize, shipSpeed, shipAttackPower, shipFuelUse, dragShipList } from './truepath_f1.js';
import { xShift, xPosition } from './truepath_f3.js';

// Fungsi-fungsi dipindah dari truepath.js (urutan sumber dipertahankan). truepath.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function drawShips(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 5)){
        return;
    }
    clearShipDrag();
    clearElement($('#shipList'));

    if (global.tech['isolation']){
        return;
    }

    let list = $('#shipList');

    if (global.space.shipyard.sort){
        global.space.shipyard.ships = global.space.shipyard.ships.sort(shipyardShipCompare);
    }

    const spaceRegions = spaceTech();
    for (let i=0; i<global.space.shipyard.ships.length; i++){
        let ship = global.space.shipyard.ships[i];
        if (!ship['xy']){ ship['xy'] = genXYcoord(ship.location); }
        if (!ship.hasOwnProperty('dist')){ ship['dist'] = ship['transit']; }
        if (!ship.hasOwnProperty('origin')){ ship['origin'] = ship['xy']; }
        if (!ship.hasOwnProperty('destination')){ ship['destination'] = genXYcoord(ship.location); }

        let values = ``;
        if (ship.class === 'explorer'){
            if (ship.location !== 'tauceti'){
                let name = loc('tech_era_tauceti');
                values += `<b-dropdown-item aria-role="listitem" v-on:click="setLoc('tauceti',${i})" class="tauceti">${name}</b-dropdown-item>`;
            }
        }
        else {
            Object.keys(spaceRegions).forEach(function(region){
                if (ship.location !== region){
                    if (spaceRegions[region].info.syndicate() || region === 'spc_dwarf'){
                        if (!global.race['orbit_decayed'] || (global.race['orbit_decayed'] && region !== 'spc_moon')){
                            let name = typeof spaceRegions[region].info.name === 'string' ? spaceRegions[region].info.name : spaceRegions[region].info.name();
                            values += `<b-dropdown-item aria-role="listitem" v-on:click="setLoc('${region}',${i})" class="${region}">${name}</b-dropdown-item>`;
                        }
                    }
                }
            });
        }

        let location = ship.location === 'tauceti' ? loc('tech_era_tauceti') : typeof spaceRegions[ship.location].info.name === 'string' ? spaceRegions[ship.location].info.name : spaceRegions[ship.location].info.name();

        let dispatch = `<b-dropdown id="ship${i}loc" :triggers="['hover', 'click']" aria-role="list" scrollable position="is-bottom-left">
            <button class="button is-info" slot="trigger">
                <span>${location}</span>
            </button>${values}
        </b-dropdown>`;

        if (global.space.shipyard.expand){
            let ship_class = `${loc(`outer_shipyard_engine_${ship.engine}`)} ${loc(`outer_shipyard_class_${ship.class}`)}`;
            let desc = $(`<div id="shipReg${i}" class="shipRow ship${i}"></div>`);
            let row1 = $(`<div class="row1"><span class="name has-text-caution">${ship.name}</span> <span v-show="scrapAllowed(${i})">| </span><a class="scrap${i}" v-show="scrapAllowed(${i})" @click="scrap(${i})" role="button">${loc(`outer_shipyard_scrap`)}</a> | <span class="has-text-warning">${ship_class}</span> | <span class="has-text-danger">${loc(`outer_shipyard_weapon_${ship.weapon}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_power_${ship.power}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_armor_${ship.armor}`)}</span> | <span class="has-text-warning">${loc(`outer_shipyard_sensor_${ship.sensor}`)}</span></div>`);
            let row2 = $(`<div class="row2"></div>`);
            let row3 = $(`<div class="row3"></div>`);
            let row4 = $(`<div class="location">${dispatch}</div>`);

            row2.append(`<span class="has-text-warning">${loc(`crew`)}</span> <span class="pad" v-html="crewText(${i})"></span>`);
            row2.append(`<span class="has-text-warning">${loc(`firepower`)}</span> <span class="pad" v-html="fireText(${i})"></span>`);
            row2.append(`<span class="has-text-warning">${loc(`outer_shipyard_sensors`)}</span> <span class="pad" v-html="sensorText(${i})"></span>`);
            row2.append(`<span class="has-text-warning">${loc(`speed`)}</span> <span class="pad" v-html="speedText(${i})"></span>`);
            row2.append(`<span class="has-text-warning">${loc(`outer_shipyard_fuel`)}</span> <span class="pad" v-bind:class="{ 'has-text-danger': !fueled }" v-html="fuelText(${i})"></span>`);
            row2.append(`<span class="has-text-warning">${loc(`outer_shipyard_hull`)}</span> <span class="pad" v-bind:class="hullDamage(${i})" v-html="hullText(${i})"></span>`);

            row3.append(`<span v-show="show(${i})" class="has-text-caution" v-html="dest(${i})"></span>`);

            desc.append(row1);
            desc.append(row2);
            desc.append(row3);
            desc.append(row4);
            list.append(desc);
        }
        else {
            let desc = $(`<div id="shipReg${i}" class="shipRow ship${i} compact"></div>`);
            let row1 = $(`<div class="row1"></div>`);
            let row3 = $(`<div class="row3"></div>`);
            let row4 = $(`<div class="location">${dispatch}</div>`);

            row1.append(`<span class="name has-text-caution">${ship.name}</span> | `);
            row1.append(`<span class="has-text-warning">${loc(`firepower`)}</span> <span class="pad" v-html="fireText(${i})"></span>`);
            row1.append(`<span class="has-text-warning">${loc(`outer_shipyard_sensors`)}</span> <span class="pad" v-html="sensorText(${i})"></span>`);
            row1.append(`<span class="has-text-warning">${loc(`speed`)}</span> <span class="pad" v-html="speedText(${i})"></span>`);
            row1.append(`<span class="has-text-warning">${loc(`outer_shipyard_fuel`)}</span> <span class="pad" v-bind:class="{ 'has-text-danger': !fueled }" v-html="fuelText(${i})"></span>`);
            row1.append(`<span class="has-text-warning">${loc(`outer_shipyard_hull`)}</span> <span class="pad" v-bind:class="hullDamage(${i})" v-html="hullText(${i})"></span>`);

            row3.append(`<span v-show="show(${i})" class="has-text-caution" v-html="dest(${i})"></span>`);

            desc.append(row1);
            desc.append(row3);
            desc.append(row4);
            list.append(desc);
        }

        vBind({
            el: `#shipReg${i}`,
            data: global.space.shipyard.ships[i],
            methods: {
                scrap(id){
                    if (global.space.shipyard.ships[id] && global.space.shipyard.ships[id].location === 'spc_dwarf'){
                        global.space.shipyard.ships.splice(id,1);
                        drawShips();
                        updateCosts();
                    }
                },
                scrapAllowed(id){
                    if (global.space.shipyard.ships[id] && global.space.shipyard.ships[id].location === 'spc_dwarf'){
                        return true;
                    }
                    return false;
                },
                setLoc(l,id){
                    let ship = global.space.shipyard.ships[id];
                    if (l !== ship.location){
                        let crew = shipCrewSize(ship);
                        let manned = ship.transit > 0 || ship.location !== 'spc_dwarf';
                        if (manned || global.civic.garrison.workers - global.civic.garrison.crew >= crew){
                            let dest = calcLandingPoint(ship, l);
                            let distance = transferWindow(ship.xy,dest);
                            let speed = shipSpeed(ship);
                            ship.location = l;
                            ship.transit = Math.round(distance / speed);
                            ship.dist = Math.round(distance / speed);
                            ship.origin = deepClone(ship.xy);
                            ship.destination = {x: dest.x, y: dest.y};
                            if (!manned){
                                global.civic.garrison.crew += crew;
                            }
                            drawShips();
                            clearPopper(`ship${id}loc${l}`);
                        }
                    }
                },
                crewText(id){
                    return shipCrewSize(global.space.shipyard.ships[id]);
                },
                fireText(id){
                    return shipAttackPower(global.space.shipyard.ships[id]);
                },
                sensorText(id){
                    return sensorRange(global.space.shipyard.ships[id]) + 'km';
                },
                speedText(id){
                    let speed = (149597870.7/225/24/3600) * shipSpeed(global.space.shipyard.ships[id]);
                    return Math.round(speed) + 'km/s';
                },
                fuelText(id){
                    let fuel = shipFuelUse(global.space.shipyard.ships[id]);
                    if (fuel.res){
                        return `${fuel.burn} ${global.resource[fuel.res].name}/s`;
                    }
                    else {
                        return `N/A`;
                    }
                },
                hullText(id){
                    return `${100 - global.space.shipyard.ships[id].damage}%`;
                },
                hullDamage(id){
                    if (global.space.shipyard.ships[id].damage <= 10){
                        return `has-text-success`;
                    }
                    else if (global.space.shipyard.ships[id].damage >= 40 && global.space.shipyard.ships[id].damage < 65){
                        return `has-text-caution`;
                    }
                    else if (global.space.shipyard.ships[id].damage >= 65){
                        return `has-text-danger`;
                    }
                    return ``;
                },
                dest(id){
                    let name = ship.class === 'explorer' ? loc('tech_era_tauceti') : typeof spaceRegions[global.space.shipyard.ships[id].location].info.name === 'string' ? spaceRegions[global.space.shipyard.ships[id].location].info.name : spaceRegions[global.space.shipyard.ships[id].location].info.name();
                    return loc(`outer_shipyard_arrive`,[
                        name,
                        global.space.shipyard.ships[id].transit
                    ]);
                },
                show(id){
                    return global.space.shipyard.ships[id].transit > 0 ? true : false;
                }
            }
        });

        if (ship.class === 'explorer'){
            if (ship.location !== 'tauceti'){
                popover(`ship${i}loctauceti`, function(){
                    return loc(`transit_time`,[Math.round(transferWindow(ship.xy,calcLandingPoint(ship, 'tauceti')) / shipSpeed(ship))]);
                },
                {
                    elm: `#ship${i}loc .tauceti`,
                    placement: 'left'
                });
            }
        }
        else {
            Object.keys(spaceRegions).forEach(function(region){
                if (spaceRegions[region].info.syndicate() || region === 'spc_dwarf'){
                    if (ship.location !== region){
                        popover(`ship${i}loc${region}`, function(){
                            return loc(`transit_time`,[Math.round(transferWindow(ship.xy,calcLandingPoint(ship, region)) / shipSpeed(ship))]);
                        },
                        {
                            elm: `#ship${i}loc .${region}`,
                            placement: 'left'
                        });
                    }
                }
            });
        }
    }

    dragShipList();
}

export function calcLandingPoint(ship, planet) {
    if (spacePlanetStats[planet].orbit === -2 ) { return genXYcoord(planet); }
    let ship_dist = Math.sqrt(((ship.xy.x - xShift(planet)) ** 2) + (ship.xy.y ** 2));
    let ship_speed = shipSpeed(ship) / 225;
    let width = xPosition(1, planet);
    let cross1_dist = Math.abs(ship_dist - spacePlanetStats[planet].dist);
    let cross2_dist = Math.abs(ship_dist + spacePlanetStats[planet].dist);
    let cross1w_dist = Math.abs(ship_dist - spacePlanetStats[planet].dist * width);
    let cross2w_dist = Math.abs(ship_dist + spacePlanetStats[planet].dist * width);
    let cross1_days = Math.floor(Math.min(cross1_dist, cross1w_dist, cross2_dist, cross2w_dist) / ship_speed);
    let cross2_days = Math.ceil(Math.max(cross1_dist, cross1w_dist, cross2_dist, cross2w_dist) / ship_speed);
    if (ship_dist >= spacePlanetStats[planet].dist && ship_dist <= spacePlanetStats[planet].dist * width) {
        cross1_days = 0;
    }
    let planet_orbit = spacePlanetStats[planet].orbit === -1
      ? orbitLength()
      : spacePlanetStats[planet].orbit;
    let planet_speed = 360 / planet_orbit;
    let planet_degree = (global.space.position[planet] + (cross1_days * planet_speed)) % 360;
    let rads = (Math.PI / 180);
    for (let i = cross1_days; i <= cross2_days; i++) {
        let planet_x = xPosition(Math.cos(planet_degree * rads) * spacePlanetStats[planet].dist, planet);
        planet_x += xShift(planet);
        let planet_y = Math.sin(planet_degree * rads) * spacePlanetStats[planet].dist;
        let time = Math.sqrt(((planet_x - ship.xy.x) ** 2) + ((planet_y - ship.xy.y) ** 2)) / ship_speed;
        if (time <= i) {
            return {x: planet_x, y: planet_y};
        }
        planet_degree = (planet_degree + planet_speed) % 360;
    }
    return genXYcoord(planet);
}

export function syndicate(region,extra){
    if (!global.tech['isolation'] && global.tech['syndicate'] && global.race['truepath'] && global.space['syndicate'] && global.space.syndicate.hasOwnProperty(region)){
        let divisor = 1000;

        let rival = 0;
        if (global.civic.foreign.gov3.hstl < 10){
            rival = 250 - (25 * global.civic.foreign.gov3.hstl);
        }
        else if (global.civic.foreign.gov3.hstl > 60){
            rival = (-13 * (global.civic.foreign.gov3.hstl - 60));
        }

        switch (region){
            case 'spc_home':
            case 'spc_moon':
            case 'spc_red':
            case 'spc_hell':
                divisor = 1250 + rival;
                break;
            case 'spc_gas':
            case 'spc_gas_moon':
            case 'spc_belt':
                divisor = 1020 + rival;
                break;
            case 'spc_titan':
            case 'spc_enceladus':
                divisor = actions.space[region].info.syndicate_cap();
                break;
            case 'spc_triton':
            case 'spc_kuiper':
            case 'spc_eris':
                divisor = actions.space[region].info.syndicate_cap();
                break;
        }

        let piracy = global.space.syndicate[region];
        if (global.race['chicken']){
            piracy *= 1 + (traits.chicken.vars()[1] / 100);
            piracy = Math.round(piracy);
        }
        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
            piracy *= 1 - (traits.ocular_power.vars()[1] / 500);
            piracy = Math.round(piracy);
        }
        let patrol = 0;
        let sensor = 0;
        let overkill = 0;
        if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
            global.space.shipyard.ships.forEach(function(ship){
                if (ship.location === region && ship.transit === 0 && ship.fueled){
                    let rating = shipAttackPower(ship);
                    patrol += ship.damage > 0 ? Math.round(rating * (100 - ship.damage) / 100) : rating;
                    sensor += sensorRange(ship);
                }
            });

            if (region === 'spc_enceladus' && Math.min(support_on['operating_base'],p_on['operating_base']) > 0){
                let active = Math.min(support_on['operating_base'],p_on['operating_base']);
                patrol += active * 50;
            }
            else if (region === 'spc_titan' && p_on['sam'] > 0){
                patrol += p_on['sam'] * 25;
            }
            else if (region === 'spc_triton' && p_on['fob'] > 0){
                patrol += 500;
                sensor += 10;
            }

            if (sensor > 100){
                sensor = Math.round((sensor - 100) / ((sensor - 100) + 200) * 100) + 100;
            }

            patrol = Math.round(patrol * ((sensor + 25) / 125));
            if (patrol > piracy){
                overkill = patrol - piracy;
            }
            piracy = piracy - patrol > 0 ? piracy - patrol : 0;
        }

        if (extra){
            return {
                p: 1 - +(piracy / divisor).toFixed(4),
                r: piracy,
                s: sensor,
                o: overkill,
            };
        }
        return 1 - +(piracy / divisor).toFixed(4);
    }

    if (extra){
        return { p: 1, r: 0, s: 0, o: 0 };
    }
    return 1;
}

export function sensorRange(s){
    let hf = 1;
    switch (s.class){
        case 'corvette':
        case 'frigate':
            hf = 2;
            break;
        case 'destroyer':
        case 'cruiser':
            hf = 1.5;
            break;
        case 'explorer':
            hf = 5;
            break;
        default:
            hf = 1;
            break;
    }
    switch (s.sensor){
        case 'visual':
            return 1;
        case 'radar':
            return 10 * hf;
        case 'lidar':
            return 18 * hf;
        case 'quantum':
            return 32 * hf;
    }
}

export function tritonWar(){
    if (global.space['fob']){
        if (global.space.fob.enemy <= 1000){
            let upper = global.tech['outer'] && global.tech.outer >= 4 ? 125 : 100;
            global.space.fob.enemy += Math.rand(25,upper);
        }

        let wound_cap = Math.ceil(jobScale(global.space.fob.enemy) / 5);

        let wounded = global.civic.garrison.wounded - garrisonSize();
        if (wounded < 0){ wounded = 0; }
        let defense = armyRating(global.space.fob.troops,'army',wounded);

        let died = Math.rand(0,wounded + 1);
        soldierDeath(died);
        global.civic.garrison.wounded -= died;

        let kills = Math.min(Math.rand(0,defense),global.space.fob.enemy);
        global.space.fob.enemy -= kills;
        if (global.space.fob.enemy < 0){
            global.space.fob.enemy = 0; 
        }

        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
            global.race.ocularPowerConfig.ds += Math.round(kills * traits.ocular_power.vars()[1]);
        }

        let hurt = Math.rand(0,global.space.fob.troops + 1);
        if (hurt > wound_cap){ hurt = wound_cap; }
        if (global.race['armored']){ hurt -= jobScale(1); }
        if (global.race['scales']){ hurt -= jobScale(1); }
        if (global.tech['armor']){ hurt -= jobScale(global.tech['armor']); }
        if (hurt < 0){ hurt = 0; }

        if (global.race['revive'] && died > 0){
            let revive = Math.round(Math.rand(0,died + 1));
            global.civic.garrison.workers += revive;
        }

        global.civic.garrison.wounded += hurt;
        if (global.civic.garrison.wounded > garrisonSize(false,{nofob: true})){
            global.civic.garrison.wounded = garrisonSize(false,{nofob: true});
        }

        {
            let wounded = global.civic.garrison.wounded - garrisonSize();
            if (wounded < 0){ wounded = 0; }
            let danger = global.space.fob.enemy - armyRating(global.space.fob.troops,'army',wounded);
            if (danger <= 0 && global.space.crashed_ship.count < 100){
                global.space.crashed_ship.count++;
            }
            else if (danger > 0 && global.space.crashed_ship.count > 0){
                global.space.crashed_ship.count--;
            }
            if (global.space.crashed_ship.count === 100){
                global.resource.Cipher.display = true;
            }
        }
    }
}

export function erisWar(){
    if (global.space['digsite']){
        if (global.space.digsite.enemy <= 10000){
            let upper = 250;
            global.space.digsite.enemy += Math.rand(25,upper);
        }

        let offense = armyRating(support_on['shock_trooper'],'army',0);
        if (support_on['tank']){
            offense += support_on['tank'] * 100;
        }
        offense *= syndicate('spc_eris');

        global.space.digsite.enemy -= Math.rand(0,offense);
        if (global.space.digsite.enemy < 0){ global.space.digsite.enemy = 0; }
        else if (global.space.digsite.enemy > 10000){ global.space.digsite.enemy = 10000; }

        global.space.digsite.count = Math.floor(100 - global.space.digsite.enemy / 100);
    }
}

export function setOrbits(){
    if (!global.space['position']){
        global.space['position'] = {};
    }
    Object.keys(spacePlanetStats).forEach(function(o){
        if (!global.space.position.hasOwnProperty(o)){
            global.space.position[o] = Math.rand(0,360);
        }
    });
    global.space.position.spc_home = global.space.position.spc_moon;
    global.space.position.spc_gas_moon = global.space.position.spc_gas;
    global.space.position.spc_titan = global.space.position.spc_enceladus;
    global.space.position.spc_saturn = global.space.position.spc_titan;
    global.space.position.spc_neptune = global.space.position.spc_triton;
}

export function genXYcoord(planet){
    let cx = xPosition(+(Math.cos(global.space.position[planet] * (Math.PI / 180))).toFixed(5) * spacePlanetStats[planet].dist, planet);
    let cy = +(Math.sin(global.space.position[planet] * (Math.PI / 180))).toFixed(5) * spacePlanetStats[planet].dist;
    cx += xShift(planet);
    return {x: cx, y: cy};
}

export function transferWindow(p1,p2){
    return Math.ceil(Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2)) * 225);
}

export function jumpGateShutdown(){
    let inactive = { city: {}, space: {}, ships: []};
    inactive.ships = [...global.space.shipyard.ships];
    global.space.shipyard.ships = [];

    global.settings.spaceTabs = 6;
    global.settings.showSpace = false;
    global.settings.showOuter = false
    global.settings.showCity = false;
    global.settings.showShipYard = false;
    if (global.settings.govTabs === 5){
        global.settings.govTabs = 0;
    }

    clearShipDrag();
    clearElement($('#shipList'));
    
    Object.keys(actions.city).forEach(function (k){
        if (global.city.hasOwnProperty(k) && global.city[k].hasOwnProperty('count')){
            if (global.race['hooved']){
                if (actions.city[k].cost?.hasOwnProperty('Horseshoe')){
                    global.race['shoecnt'] -= actions.city[k].cost.Horseshoe() * global.city[k].count;
                }
            }
            inactive.city[k] = {c: global.city[k].count};
            global.city[k].count = 0;
            if (global.city[k].hasOwnProperty('on')){
                inactive.city[k]['o'] = global.city[k].on;
                global.city[k].on = 0;
            }
        }
    });

    [
        'spc_home','spc_moon','spc_red','spc_hell','spc_sun','spc_gas','spc_gas_moon','spc_belt',
        'spc_dwarf','spc_titan','spc_enceladus','spc_triton','spc_kuiper','spc_eris'
    ].forEach(function(sector){
        Object.keys(actions.space[sector]).forEach(function (k){
            if (global.space.hasOwnProperty(k) && global.space[k].hasOwnProperty('count')){
                if (global.race['hooved']){
                    if (actions.space[sector][k].cost?.hasOwnProperty('Horseshoe')){
                        global.race['shoecnt'] -= actions.space[sector][k].cost.Horseshoe() * global.space[k].count;
                    }
                }
                inactive.space[k] = {c: global.space[k].count};
                global.space[k].count = 0;
                if (global.space[k].hasOwnProperty('on')){
                    inactive.space[k]['o'] = global.space[k].on;
                    global.space[k].on = 0;
                }
            }
        });
    });

    if (global.race['hooved'] && global.race['shoecnt'] < 5){
        global.race.shoecnt = 5;
    }
    if (global.resource.Zen.display){
        global.resource.Zen.display = false;
    }
    if (global.resource.Slave.display){
        global.resource.Slave.display = false;
        global.resource.Slave.amount = 0;
        removeTask('slave');
    }
    if (global.race['deconstructor']){
        nf_resources.forEach(function (res){
            global.city.nanite_factory[res] = 0;
        });
    }
    Object.keys(global.resource).forEach(function (res){
        if (global.resource[res].hasOwnProperty('trade')){
            global.resource[res].trade = 0;
        }
    });

    Object.keys(job_desc).forEach(function (job){
        if (!['professor','scientist','pit_miner','cement_worker','craftsman'].includes(job)){
            global.civic[job].workers = 0;
            global.civic[job].assigned = 0;
        }
    });

    ['forager','farmer','lumberjack','quarry_worker','miner','coal_miner','priest','colonist','titan_colonist','space_miner'].forEach(function (job){
        global.civic[job].display = false;
    });

    if (global.civic.hunter.display){
        global.civic.d_job = 'hunter';
    }
    else {
        global.civic.d_job = 'unemployed';
    }

    if (global.arpa['sequence']){
        global.arpa.sequence.on = false;
        global.arpa.sequence.boost = false;
    }

    for (let building of Object.values(global.race.purgatory.city)){
        if (building.hasOwnProperty('count')){
            building.count = 0;
        }
        if (building.hasOwnProperty('on')){
            building.on = 0;
        }
    }
    for (let building of Object.values(global.race.purgatory.space)){
        if (building.hasOwnProperty('count')){
            building.count = 0;
        }
        if (building.hasOwnProperty('on')){
            building.on = 0;
        }
    }
    if (global.queue.hasOwnProperty('queue')){
        for (let i = global.queue.queue.length-1; i >= 0; i--){
            let item = global.queue.queue[i];
            if (item.action === 'city' || item.action === 'space' || item.action === 'starDock'){
                global.queue.queue.splice(i,1);
            }
        }
    }

    if (global.tech['magic'] && global.tech.magic >= 2){
        global.tauceti['pylon'] = { count: 0 };
        cancelRituals();
    }

    initStruct(tauCetiModules.tau_home.tauceti_casino);
    initStruct(tauCetiModules.tau_home.tau_housing);
    
    let pop = support_on['colony'] * tauCetiModules.tau_home.colony.citizens();
    if (global.resource[global.race.species].amount > pop){ global.resource[global.race.species].amount = pop; }

    removeTask('spy');
    removeTask('spyop');
    removeTask('combo_spy');
    defineGovernor();

    clearElement($(`#infoTimer`));
    global.race['inactive'] = inactive;
}
