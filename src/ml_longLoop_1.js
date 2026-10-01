import { global, webWorker, support_on, p_on, gal_on } from './vars.js';
import { gridDefs, gridEnabled, setPowerGrid, defineIndustry } from './industry.js';
import { convertSpaceSector, renderSpace, spaceTech, planetName, universe_affixes } from './space.js';
import { actions, drawTech, cLabels, drawCity, initStruct, checkTechRequirements, orbitDecayed } from './actions.js';
import { vacuumCollapse } from './resets.js';
import { bloodwar, hellguard, hellSupression, renderFortress } from './portal.js';
import { traits, blubberFill, fathomCheck, orbitLength, races } from './races.js';
import { govActive, removeTask, defineGovernor, govern } from './governor.js';
import { resource_values } from './resources.js';
import { astroVal, setWeather } from './seasons.js';
import { messageQueue, flib, deepClone, calcQueueMax, calcRQueueMax } from './functions.js';
import { loc } from './locale.js';
import { highPopAdjust } from './prod.js';
import { workerScale, loadFoundry } from './jobs.js';
import { genXYcoord, sensorRange, renderTauCeti, spacePlanetStats, drawMap, tritonWar, erisWar, calcAIDrift } from './truepath.js';
import { govTitle, govCivics } from './civics.js';
import { arpa } from './arpa.js';
import { buildGene } from './main.js';

// Bagian dari longLoop (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function longLoop_s1($ctx){
        if (global.settings.tabLoad || (global.settings.civTabs === 2 && global.settings.govTabs === 2)){
            let grids = gridDefs();
            let updatePowerGrid = false;
            Object.keys(grids).forEach(function(grid){
                grids[grid].l.forEach(function(struct){
                    let parts = struct.split(":");
                    let space = convertSpaceSector(parts[0]);
                    let region = parts[0] === 'city' ? parts[0] : space;
                    let c_action = parts[0] === 'city' ? actions.city[parts[1]] : actions[space][parts[0]][parts[1]];
                    let breaker = $(`#pg${c_action.id}${grid}`);

                    if (grids[grid].s && (breaker.length === 0 || (gridEnabled(c_action,region,parts[0],parts[1]) && breaker.hasClass('inactive')))){
                        updatePowerGrid = true;
                    }
                });
            });
            if (updatePowerGrid){
                setPowerGrid();
            }
        }

        if (global.tech['syphon'] && global.tech.syphon >= 80){
            if (webWorker.w){
                webWorker.w.terminate();
            }
            let bang = $('<div class="bigbang"></div>');
            $('body').append(bang);
            setTimeout(function(){
                bang.addClass('burn');
            }, 125);
            setTimeout(function(){
                bang.addClass('b');
            }, 150);
            setTimeout(function(){
                bang.addClass('c');
            }, 2000);
            setTimeout(function(){
                vacuumCollapse();
            }, 4000);
        }

        if (global.portal['fortress'] && !global.race['warlord']){
            bloodwar();
        }
        else if (global.race['warlord'] && global.portal['minions'] && global.portal.minions.count > 0){
            hellguard();
        }

        if (global.civic.govern.rev > 0){
            global.civic.govern.rev--;
        }
        if (global.civic.govern.fr > 0){
            global.civic.govern.fr--;
        }
        if (global.civic.govern.rev < 0){
            global.civic.govern.rev = 0;
        }

        if (global.city.ptrait.includes('trashed') || global.race['scavenger']){
            global.civic.scavenger.display = true;
        }
        else {
            global.civic.scavenger.display = false;
            global.civic.scavenger.workers = 0;
        }

        // Homeless
        if (global.civic.homeless > 0){
            let railway = global.arpa['railway'] ? global.arpa.railway.rank : 0;
            let abandon_odds = Math.floor(railway / (railway + 25) * 10);
            if (Math.rand(0,10) <= abandon_odds){
                global.civic.homeless--;
            }
        }

        if (global.race['unstable']){
            if (global.resource[global.race.species].amount > 0 && Math.rand(0,100) < traits.unstable.vars()[0]){
                let bound = Math.ceil((global.resource[global.race.species].amount ** 0.9) * traits.unstable.vars()[1] / 100);
                let died = Math.rand(0,bound);
                global.resource[global.race.species].amount -= died;
                if (global.resource[global.race.species].amount < 0){ global.resource[global.race.species].amount = 0; }
                global.stats.uDead += died;
            }
        }

        if (global.race['blubber'] && global.resource[global.race.species].amount >= 50){
            let oldAge = Math.rand(0,1 + Math.floor(global.resource[global.race.species].amount / 50));
            blubberFill(oldAge);
        }

        // Market price fluctuation
        if (global.tech['currency'] && global.tech['currency'] >= 2){
            let fluxVal = govActive('risktaker',0) ? 2 : 4;
            Object.keys(resource_values).forEach(function (res) {
                let r_val = global.race['truepath'] ? resource_values[res] * 2 : resource_values[res];
                if (res === 'Copper' && global.tech['high_tech'] && global.tech['high_tech'] >= 2){
                    r_val *= 2;
                }
                if (res === 'Titanium'){
                    if (global.tech['titanium'] && global.tech['titanium'] > 0){
                        r_val *= global.resource.Alloy.display ? 1 : 2.5;
                    }
                    else {
                        r_val *= 5;
                    }
                }
                if (global.resource[res].display && Math.rand(0,fluxVal) === 0){
                    let max = r_val * 3;
                    let min = r_val / 2;
                    let variance = (Math.rand(0,200) - 100) / 100;
                    let new_value = global.resource[res].value + variance;
                    if (new_value < min){
                        new_value = r_val;
                    }
                    else if (new_value > max){
                        new_value = max - r_val;
                    }
                    global.resource[res].value = new_value;
                }
            });
        }

        if (global.race['blood_thirst']){
            if (!global.race.hasOwnProperty('blood_thirst_count')){
                global.race['blood_thirst_count'] = 1;
            }
            if (global.race.blood_thirst_count > 1){
                global.race.blood_thirst_count--;
            }
        }

        if (global.race['truepath'] && global.civic.foreign.gov3.mil < 500){
            if (Math.rand(0, 50) === 0){
                global.civic.foreign.gov3.mil++;
            }
        }

        if (global.race['pet']){
            if (global.race.pet.event > 0){
                global.race.pet.event--;
            }
            if (global.race.pet.pet > 0){
                global.race.pet.pet--;
            }
            else if (global.race.pet.pet < 0){
                global.race.pet.pet++;
            }
        }

        // Soldier Healing
        if (global.civic.garrison.wounded > 0){
            let healed = global.race['regenerative'] ? traits.regenerative.vars()[0] : 1;

            let hc = global.city['hospital'] ? global.city.hospital.count : 0;
            if (global.race['orbit_decayed'] && global.race['truepath']){
                hc = Math.min(support_on['operating_base'],p_on['operating_base']);
            }
            else if (global.race['artifical'] && global.city['boot_camp']){
                hc = global.city.boot_camp.count;
            }
            if (global.race['rejuvenated'] && global.stats.achieve['lamentis']){
                let bonus = global.stats.achieve.lamentis.l;
                if (bonus > 5){ bonus = 5; }
                hc += bonus;
            }
            if ($ctx.astroSign === 'cancer'){
                hc += astroVal('cancer')[0];
                if (hc < 0){ hc = 0; }
            }
            if (global.tech['medic'] && global.tech['medic'] >= 2){
                hc *= global.tech['medic'];
            }
            if (global.race['fibroblast']){
                hc += traits.fibroblast.vars()[0] * global.race['fibroblast'];
            }
            if (global.race['cannibalize'] && global.city['s_alter'] && global.city.s_alter.regen > 0){
                hc >= 20 ? hc *= (1 + traits.cannibalize.vars()[0] / 100) : hc += Math.floor(traits.cannibalize.vars()[0] / 5);
            }
            let mantisFathom = fathomCheck('mantis');
            if (mantisFathom > 0){
                hc >= 20 ? hc *= (1 + traits.cannibalize.vars(1)[0] / 100 * mantisFathom) : hc += Math.floor(traits.cannibalize.vars(1)[0] / 5 * mantisFathom);
            }
            if (global.race['high_pop']){
                hc *= traits.high_pop.vars()[2]
            }
            let painVal = govActive('nopain',0);
            if (painVal){
                hc *= 1 + (painVal / 100);
            }
            if(global.city.banquet && global.city.banquet.on && global.city.banquet.level >= 2){
                hc *= 1 + (global.city.banquet.strength ** 0.65) / 100;
            }
            let fathom = fathomCheck('troll');
            if (fathom > 0){
                hc += Math.round(20 * traits.regenerative.vars(1)[0] * fathom);
            }
            let max_bound = 20;
            if (global.race['slow_regen']){
                max_bound *= 1 + (traits.slow_regen.vars()[0] / 100);
            }
            hc = Math.round(hc);
            if (hc > 0){
                while (hc >= max_bound){
                    healed++;
                    hc -= max_bound;
                }
                if (Math.rand(0,max_bound) < hc){
                    healed++;
                }
            }
            global.civic.garrison.wounded -= healed;
            if (global.civic.garrison.wounded < 0){
                global.civic.garrison.wounded = 0;
            }
        }

        if (global.civic.garrison['fatigue'] && global.civic.garrison.fatigue > 0){
            global.civic.garrison.fatigue--;
        }

        if (global.civic.garrison['protest'] && global.civic.garrison.protest > 0){
            global.civic.garrison.protest--;
        }

        if (global.civic.garrison['m_use'] && global.civic.garrison.m_use > 0){
            let merc_bound = global.tech['mercs'] && global.tech['mercs'] >= 2 ? 3 : 4;
            let max_merc_roll = global.race['high_pop'] ? traits.high_pop.vars()[0] : 1;
            let num_restore = 0;
            for (let roll_num = 0; roll_num < max_merc_roll; roll_num++){
                if (Math.rand(0, merc_bound) === 0){
                    num_restore++;
                }
            }
            global.civic.garrison.m_use = Math.max(0, global.civic.garrison.m_use - num_restore);
        }

        if (global.race['rainbow_active'] && global.race['rainbow_active'] > 1){
            global.race['rainbow_active']--;
        }

        if (global.city.calendar.day > 0){
            // Time
            global.city.calendar.day++;
            global.stats.days++;
            if (global.city.calendar.day > orbitLength()){
                global.city.calendar.day = 1;
                global.city.calendar.year++;
            }

            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                global.city.calendar.season = -1;
            }
            else {
                let s_segments = global.city.ptrait.includes('elliptical') ? 6 : 4;
                let season_length = Math.round(orbitLength() / s_segments);
                let days = global.city.calendar.day;
                let season = 0;
                while (days > season_length){
                    days -= season_length;
                    season++;
                }
                if (global.city.ptrait.includes('elliptical')){
                    switch (season){
                        case 0:
                            global.city.calendar.season = 0;
                            break;
                        case 1:
                        case 2:
                            global.city.calendar.season = 1;
                            break;
                        case 3:
                            global.city.calendar.season = 2;
                            break;
                        default:
                            global.city.calendar.season = 3;
                            break;
                    }
                }
                else {
                    global.city.calendar.season = season;
                }
            }

            // Weather
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                global.city.calendar.wind = 0;
                global.city.calendar.temp = 1;
                global.city.calendar.weather = -1;
            }
            else if (Math.rand(0,5) === 0){
                let temp = Math.rand(0,3);
                let sky = Math.rand(0,5);
                let wind = Math.rand(0,3);
                switch(global.city.biome){
                    case 'oceanic':
                    case 'swamp':
                        if (Math.rand(0,2) === 0 && sky > 0){
                            sky--;
                        }
                        break;
                    case 'tundra':
                    case 'taiga':
                        if (global.city.calendar.season === 3){
                            temp = 0;
                        }
                        else if (Math.rand(0,2) === 0 && temp > 0){
                            temp--;
                        }
                        break;
                    case 'desert':
                        if (Math.rand(0,2) === 0 && sky < 4){
                            sky++;
                        }
                        break;
                    case 'ashland':
                        if (Math.rand(0,2) === 0){
                            if (sky < 1){
                                sky++;
                            }
                            else if (sky > 2){
                                sky--;
                            }
                        }
                    case 'volcanic':
                        if (global.city.calendar.season === 1){
                            temp = 2;
                        }
                        else if (Math.rand(0,2) === 0 && temp < 2 && !global.city.ptrait.includes('permafrost')){
                            temp++;
                        }
                        break;
                    default:
                        break;
                }

                switch(global.city.calendar.season){
                    case 0: // Spring
                        if (Math.rand(0,3) === 0 && sky > 0){
                            sky--;
                        }
                        break;
                    case 1: // Summer
                        if (Math.rand(0,3) === 0 && temp < 2){
                            temp++;
                        }
                        break;
                    case 2: // Fall
                        if (Math.rand(0,3) === 0 && wind > 0){
                            wind--;
                        }
                        break;
                    case 3: // Winter
                        if (Math.rand(0,3) === 0 && temp > 0){
                            temp--;
                        }
                        break;
                    default:
                        break;
                }

                if (global.city.ptrait.includes('stormy') && wind > 0){
                    if (global.race['rejuvenated'] || Math.rand(0,2) === 0){
                        wind--;
                    }
                }

                if (sky === 0){
                    if (global.race['rainbow']){
                        global.race['rainbow_active'] = 1;
                    }
                    global.city.calendar.weather = 0;
                }
                else if (sky >= 1 && sky <= 2){
                    if (global.race['rainbow']){
                        global.race['rainbow_active'] = 1;
                    }
                    global.city.calendar.weather = 1;
                }
                else {
                    if (global.race['rainbow'] && global.city.calendar.weather === 0){
                        global.race['rainbow_active'] = Math.rand(10,20);
                    }
                    global.city.calendar.weather = 2;
                    if (global.race['darkness']){
                        if (Math.rand(0, 7 - traits.darkness.vars()[0]) === 0){
                            global.city.calendar.weather = 1;
                        }
                    }
                }
                if (temp === 0){ // Get colder
                    let new_temp = global.city.calendar.temp - 1;
                    if (new_temp < 0){
                        new_temp = 0;
                    }
                    if (global.city.calendar.season === 1 && new_temp === 0){
                        new_temp = 1;
                    }
                    if (new_temp === 0 && global.city.biome === 'hellscape' && !global.city.ptrait.includes('permafrost')){
                        new_temp = 1;
                    }
                    if (new_temp === 0 && global.city.biome === 'eden' && global.city.calendar.season !== 3){
                        new_temp = 1;
                    }
                    global.city.calendar.temp = new_temp;
                }
                else if (temp === 2){ // Get hotter
                    let new_temp = global.city.calendar.temp + 1;
                    if (new_temp > 2){
                        new_temp = 2;
                    }
                    if (global.city.calendar.season === 3 && new_temp === 2){
                        new_temp = 1;
                    }
                    if (new_temp === 2 && global.city.biome === 'eden' && global.city.calendar.season !== 1){
                        new_temp = 1;
                    }
                    global.city.calendar.temp = new_temp;
                }

                global.city.calendar.wind = wind === 0 ? 1 : 0;
            }

            if (global.city.calendar.weather === 2){
                global.city.sun++;
            }
            else {
                global.city.sun = 0;
            }
            if (global.city.calendar.temp === 0){
                global.city.cold++;
            }
            else {
                global.city.cold = 0;
            }
            if (global.city.calendar.temp === 2){
                global.city.hot++;
            }
            else {
                global.city.hot = 0;
            }

            // Moon Phase
            if (!global.race['orbit_decayed']){
                if (global.city.ptrait.includes('retrograde')){
                    global.city.calendar.moon--;
                    if (global.city.calendar.moon < 0){
                        global.city.calendar.moon = 27;
                    }
                }
                else {
                    global.city.calendar.moon++;
                    if (global.city.calendar.moon > 27){
                        global.city.calendar.moon = 0;
                    }
                }
            }

            setWeather();
        }

        if (!global.race['cataclysm'] && !global.race['orbit_decayed'] && !global.race['lone_survivor'] && !global.race['vax']){
            let deterioration = Math.floor(50000000 / (1 + global.race.mutation)) - global.stats.days;
            if (global.race.deterioration === 0 && deterioration < 40000000){
                global.race.deterioration = 1;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration1',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 1 && deterioration < 20000000){
                global.race.deterioration = 2;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration2',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 2 && deterioration < 5000000){
                global.race.deterioration = 3;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration3',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 3 && deterioration < 1000000){
                global.race.deterioration = 4;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration4',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 4 && deterioration <= 0){
                global.race.deterioration = 5;
                global.race['decayed'] = global.stats.days;
                global.tech['decay'] = 1;
                messageQueue(loc('deterioration5',[flib('name')]),'danger',false,['progress']);
                drawTech();
            }
        }

        if (global.tech['decay'] && global.tech['decay'] >= 2){
            let fortify = 0;
            if (global.genes.minor['fortify']){
                fortify += global.genes.minor['fortify'];
            }
            if (global.race.minor['fortify']){
                fortify += global.race.minor['fortify'];
            }
            if (global.tech['decay'] >= 3){
                fortify *= 100;
            }
            global.race.gene_fortify = fortify;
        }
        else {
            global.race.gene_fortify = 0;
        }

        if (!global.tech['genesis'] && global.race.deterioration >= 1 && global.tech['high_tech'] && global.tech['high_tech'] >= 10){
            global.tech['genesis'] = 1;
            messageQueue(loc('genesis'),'special',false,['progress']);
            drawTech();
        }

        if (global.settings['cLabels'] !== cLabels){
            drawCity();
        }

        if (global.tech['xeno'] && global.tech['xeno'] >= 5 && !global.tech['piracy']){
            if (Math.rand(0,5) === 0){
                global.tech['piracy'] = 1;
                messageQueue(loc('galaxy_piracy_msg',[races[global.galaxy.alien2.id].name]),'info',false,['progress']);
                renderSpace();
            }
        }

        if (global.race['cheese']){
            global.race.cheese--;
            if (global.race.cheese <= 0){
                delete global.race.cheese;
            }
        }

        if (global.tech['piracy']){
            if (global.tech.piracy < 1000){
                global.tech.piracy++;
            }
            else if (global.tech.xeno >= 8 && global.tech.piracy < 2500){
                global.tech.piracy++;
            }
            else if (global.tech['conflict'] && global.tech.piracy < 5000){
                global.tech.piracy++;
            }
        }

        if (global.race['wish'] && global.race['wishStats']){
            if (global.race.wishStats.minor > 0){
                global.race.wishStats.minor--;
            }
            if (global.race.wishStats.major > 0){
                global.race.wishStats.major--;
            }
            if (global.race.wishStats.bad > 0){
                global.race.wishStats.bad--;
            }
        }

        if (global.portal['archaeology'] && global.tech.hasOwnProperty('hell_ruins') && global.tech.hell_ruins >= 2 && !global.tech['hell_vault']){
            let sup = hellSupression('ruins');
            let value = 250000;
            if (global.race['high_pop']){
                value = highPopAdjust(value);
            }
            value = Math.round(value * sup.supress) * workerScale(global.civic.archaeologist.workers,'archaeologist') / 1000;

            if (Math.rand(0,10000) + 1 <= value){
                global.tech['hell_vault'] = 1;
                messageQueue(loc('portal_ruins_vault'),'info',false,['progress']);
                renderFortress();
            }
        }
}

export function longLoop_s2($ctx){
        if (global.tech['syndicate'] && global.race['truepath']){
            let regions = spaceTech();
            Object.keys(regions).forEach(function(region){
                if (regions[region].info.hasOwnProperty('syndicate') && regions[region].info.syndicate()){
                    let cap = regions[region].info.hasOwnProperty('syndicate_cap') ? regions[region].info.syndicate_cap() : 500;
                    if (!global.space.syndicate.hasOwnProperty(region)){
                        global.space.syndicate[region] = 0;
                    }
                    let reinforce = region === 'spc_triton' ? 5 : 10;
                    if (global.space.syndicate[region] < (cap) && Math.rand(0, reinforce) === 0){
                        global.space.syndicate[region]++;
                    }
                    if (global.space.syndicate[region] > cap){
                        global.space.syndicate[region] = cap;
                    }
                }
            });

            if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                let eScan = 0;
                let tScan = 0;
                let tShip = false;
                global.space.shipyard.ships.forEach(function(ship){
                    if (ship.transit > 0 && ship.fueled){
                        ship.transit--;
                        let trip = 1 - (ship.transit / ship.dist);
                        let mx = Math.abs(ship.origin.x - ship.destination.x) * trip;
                        let my = Math.abs(ship.origin.y - ship.destination.y) * trip;
                        if (ship.origin.x <= ship.destination.x){ ship.xy.x = ship.origin.x + mx; } else { ship.xy.x = ship.origin.x - mx; }
                        if (ship.origin.y <= ship.destination.y){ ship.xy.y = ship.origin.y + my; } else { ship.xy.y = ship.origin.y - my; }
                    }
                    if (ship.transit === 0){
                        ship.xy = genXYcoord(ship.location);
                        ship.origin = deepClone(ship.xy);
                        ship.dist = 0;
                    }
                    if (ship.damage > 0 && p_on['shipyard']){
                        ship.damage--;
                    }
                    if (ship.location !== 'spc_dwarf' && Math.rand(0, 10) === 0){
                        let dm = ship.location === 'spc_triton' ? 2 : 1;
                        switch (ship.armor){
                            case 'steel':
                                ship.damage += Math.rand(1, 8 * dm);
                                break;
                            case 'alloy':
                                ship.damage += Math.rand(1, 6 * dm);
                                break;
                            case 'neutronium':
                                ship.damage += Math.rand(1, 4 * dm);
                                break;
                        }
                        if (ship.damage > 90){ ship.damage = 90; }
                    }
                    if (global.tech.hasOwnProperty('eris_scan') && ship.location === 'spc_eris' && ship.transit === 0){
                        eScan += sensorRange(ship);
                    }
                    if (global.tech.hasOwnProperty('tauceti') && ship.location === 'tauceti' && ship.transit === 0){
                        tScan += sensorRange(ship);
                        tShip = ship.name;
                    }
                });
                if (global.tech.hasOwnProperty('eris_scan') && global.tech.hasOwnProperty('eris') && global.tech.eris === 1 && eScan > 50){
                    global.tech.eris_scan += eScan - 50;
                    if (global.tech.eris_scan >= 100){
                        global.tech.eris_scan = 100;
                        global.tech.eris = 2;
                        messageQueue(loc('space_eris_scan',[planetName().eris]),'info',false,['progress']);
                        renderSpace();
                    }
                }
                if (global.tech.hasOwnProperty('tauceti') && global.tech.tauceti >= 1 && tScan >= 1){
                    if (global.tech.tauceti === 1){
                        initStruct(actions.tauceti.tau_home.orbital_station);
                        initStruct(actions.tauceti.tau_red.orbital_platform);
                        global.tech.tauceti = 2;
                        global.settings.showTau = true;
                        global.settings.tau.home = true;
                        global.settings.tau.red = true;
                        global.settings.tau.gas = false;
                        global.settings.tau.roid = false;
                        messageQueue(loc('tau_scan',[tShip]),'info',false,['progress']);
                        renderTauCeti();
                    }
                }
                if (global.space.hasOwnProperty('position')){
                    Object.keys(spacePlanetStats).forEach(function(planet){
                        if (global.space.position.hasOwnProperty(planet)){
                            let orbit = spacePlanetStats[planet].orbit === -1 ? orbitLength() : spacePlanetStats[planet].orbit;
                            if (orbit === -2){
                                return;
                            }
                            else if (orbit === 0){
                                global.space.position[planet] = 0;
                            }
                            else {
                                global.space.position[planet] += +(360 / orbit).toFixed(4);
                                if (global.space.position[planet] >= 360){
                                    global.space.position[planet] -= 360;
                                }
                            }
                        }
                    });
                }

                if ($('#mapCanvas').length > 0) {
                    drawMap();
                }
            }

            if (global.tech['triton'] && global.tech.triton >= 3){
                tritonWar();
            }
            if (global.tech['eris'] && global.tech.eris >= 3){
                erisWar();
            }
        }

        if (!global.race['warlord'] && (global.stats.matrix > 0 || global.stats.retire > 0) && !global.race['servants'] && Math.rand(0,25) === 0){
            let womlings = Math.min(global.stats.matrix,100) + Math.min(global.stats.retire,100) + Math.min(global.stats.eden,100);
            let skilled = Math.min(Math.min(global.stats.matrix, global.stats.retire),100);
            skilled += global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 5 ? 2 : 0;
            if (global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5){
                universe_affixes.forEach(function(uni){
                    if (global.stats.achieve.overlord[uni] >= 5){
                        skilled++;
                        womlings += 2;
                    }
                });
            }
            global.race['servants'] = {
                max: womlings,
                used: 0,
                smax: skilled,
                sused: 0,
                jobs: {},
                sjobs: {},
                force_scavenger: false
            };
            messageQueue((womlings + skilled) === 1 ? loc('civics_servants_msg1') : loc('civics_servants_msg2',[womlings + skilled]),'caution',false,['events','major_events']);
        }

        if (global.race['truepath'] && global.tech['focus_cure'] && global.tech.focus_cure >= 2 && global.tauceti['infectious_disease_lab']){
            if (global.tauceti.infectious_disease_lab.cure < 100){
                let labs = (support_on['infectious_disease_lab'] || 0) / 100;
                if (labs > 1){ labs = 1; }
                let gain = +flib('curve',labs).toFixed(5) / 5;
                global.tauceti.infectious_disease_lab.cure += gain;
                if (global.tauceti.infectious_disease_lab.cure > 100){ global.tauceti.infectious_disease_lab.cure = 100; }
            }
            else if (global.tauceti.infectious_disease_lab.cure >= 100 && global.tech.focus_cure === 2){
                global.tech.focus_cure = 3;
                if (races[global.race.species].type === 'synthetic'){
                    messageQueue(loc('tech_decode_virus_msg2s'),'info',false,['progress']);
                }
                else {
                    messageQueue(loc('tech_decode_virus_msg2'),'info',false,['progress']);
                }
            }
            else if (global.tech.focus_cure >= 4 && global.race.hasOwnProperty('vax')){
                let med = global.race['artifical'] ? global.city.boot_camp.count : global.city.hospital.count;
                if (global.race['orbit_decayed']){
                    med = Math.min(support_on['operating_base'],p_on['operating_base']);
                }

                if (global.tech.focus_cure === 4 && global.race.vax < 25){
                    global.race.vax += Math.rand(0, med * 2) / 150;
                }
                else if (global.tech.focus_cure === 4 && global.race.vax >= 25){
                    global.tech.focus_cure = 5;
                    messageQueue(loc('tech_vaccine_campaign_msg1'),'info',false,['progress']);
                }
                else if (global.tech.focus_cure === 5 && global.race.vax < 50){
                    global.race.vax += Math.rand(0, med * 2) / 450;
                }
                else if (global.tech.focus_cure === 5 && global.race.vax < 75){
                    global.race.vax += Math.rand(0, med * 2) / 1200;
                }
                else if (global.tech.focus_cure === 6 && global.race.vax < 100){
                    let div = 1000;
                    if (global.tech['vax_p']){ div = 250; }
                    else if (global.tech['vax_s']){ div = 390; }
                    else if (global.tech['vax_f']){ div = 25; }
                    else if (global.tech['vax_c']){ div = 125; }
                    global.race.vax += Math.rand(0, med * 2) / div;
                }
                else if (global.race.vax >= 100 && global.tech.focus_cure <= 6){
                    global.race.vax = 100;
                    global.tech.focus_cure = 7;
                    messageQueue(loc('tech_vaccine_campaign_msg2'),'info',false,['progress']);
                    removeTask('assemble');
                    defineGovernor();
                }
            }
        }

        if (global.race['infiltrator']){
            let tech_source = global.tech['world_control'] ? `trait_infiltrator_steal_alt` : `trait_infiltrator_steal`;
            let know_adjust = traits.infiltrator.vars()[0] / 100;
            if (global.resource.Knowledge.max >= (actions.tech.steel.cost.Knowledge() * know_adjust) && !global.race['steelen'] && global.tech['smelting'] && global.tech.smelting === 1){
                messageQueue(loc(tech_source,[loc('tech_steel')]),'info',false,['progress']);
                global.resource.Steel.display = true;
                global.tech.smelting = 2;
                defineIndustry();
                drawTech();
            }
            if (global.resource.Knowledge.max >= (actions.tech.electricity.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 1){
                messageQueue(loc(tech_source,[loc('tech_electricity')]),'info',false,['progress']);
                global.tech.high_tech = 2;
                global.city['power'] = 0;
                global.city['powered'] = true;
                initStruct(actions.city.coal_power);
                global.settings.showPowerGrid = true;
                setPowerGrid();
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.electronics.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 3 && global.tech['titanium']){
                messageQueue(loc(tech_source,[loc('tech_electronics')]),'info',false,['progress']);
                global.tech.high_tech = 4;
                if (global.race['terrifying']){
                    global.tech['gambling'] = 1;
                    initStruct(actions.city.casino);
                    initStruct(actions.space.spc_hell.spc_casino);
                }
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.fission.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 4 && global.tech['uranium']){
                messageQueue(loc(tech_source,[loc('tech_fission')]),'info',false,['progress']);
                global.tech.high_tech = 5;
                initStruct(actions.city.fission_power);
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.rocketry.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 6){
                messageQueue(loc(tech_source,[loc('tech_rocketry')]),'info',false,['progress']);
                global.tech.high_tech = 7;
                if (global.race['truepath'] && !global.tech['rival']){
                    global.tech['rival'] = 1;
                    messageQueue(loc(`civics_rival_unlocked`,[govTitle(3)]),'info',false,['progress','combat']);
                }
                arpa('Physics');
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.artifical_intelligence.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 9){
                messageQueue(loc(tech_source,[loc('tech_artificial_intelligence')]),'info',false,['progress']);
                global.tech.high_tech = 10;
                drawTech();
                drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.quantum_computing.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 10 && global.tech['nano']){
                messageQueue(loc(tech_source,[loc('tech_quantum_computing')]),'info',false,['progress']);
                global.tech.high_tech = 11;
                drawTech();
                drawCity();
            }
            if (
                global.resource.Knowledge.max >= (actions.tech[global.race['truepath'] ? 'virtual_reality_tp' : 'virtual_reality'].cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 11 && global.tech['stanene']
                    && ((global.tech['infernite'] && global.tech['alpha'] && global.tech['alpha'] >= 2) || (global.race['truepath']))
                ){
                messageQueue(loc(tech_source,[loc('tech_virtual_reality')]),'info',false,['progress']);
                global.tech.high_tech = 12;
                drawTech();
                drawCity();
            }
            if (global.race['truepath']){
                if (global.resource.Knowledge.max >= (actions.tech.quantium.cost.Knowledge() * know_adjust) && global.tech['supercollider'] && global.tech.supercollider >= 10 && global.tech['enceladus'] && global.tech.enceladus >= 3 && !global.tech['quantium']){
                    messageQueue(loc(tech_source,[loc('tech_quantium')]),'info',false,['progress']);
                    global.tech['quantium'] = 1;
                    global.resource.Quantium.display = true;
                    drawTech();
                    loadFoundry();
                }
                if (global.resource.Knowledge.max >= (actions.tech.alien_biotech.cost.Knowledge() * know_adjust) && global.tech['genetics'] && global.tech.genetics >= 8 && global.tech['kuiper'] && !global.tech['biotech']){
                    messageQueue(loc(tech_source,[loc('tech_alien_biotech')]),'info',false,['progress']);
                    global.tech['biotech'] = 1;
                    drawTech();
                }
            }
            else {
                if (global.resource.Knowledge.max >= (actions.tech.shields.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 13){
                    messageQueue(loc(tech_source,[loc('tech_shields')]),'info',false,['progress']);
                    global.tech.high_tech = 14;
                    global.settings.space.neutron = true;
                    global.settings.space.blackhole = true;
                    drawTech();
                    drawCity();
                }
                if (global.resource.Knowledge.max >= (actions.tech.ai_core.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 14 && global.tech['blackhole'] && global.tech['blackhole'] >= 3){
                    messageQueue(loc(tech_source,[loc('tech_ai_core')]),'info',false,['progress']);
                    global.tech.high_tech = 15;
                    initStruct(actions.interstellar.int_neutron.citadel);
                    drawTech();
                    drawCity();
                }
                if (global.resource.Knowledge.max >= (actions.tech.graphene_processing.cost.Knowledge() * know_adjust) && global.tech['ai_core'] && global.tech.ai_core === 2){
                    messageQueue(loc(tech_source,[loc('tech_graphene_processing')]),'info',false,['progress']);
                    global.tech.ai_core = 3;
                    drawTech();
                }
                if (global.resource.Knowledge.max >= (actions.tech.nanoweave.cost.Knowledge() * know_adjust) && global.tech['science'] && global.tech.science >= 18 && !global.tech['nanoweave']){
                    messageQueue(loc(tech_source,[loc('tech_nanoweave')]),'info',false,['progress']);
                    global.tech['nanoweave'] = 1;
                    global.resource.Nanoweave.display = true;
                    drawTech();
                    loadFoundry();
                }
                if (global.resource.Knowledge.max >= (actions.tech.orichalcum_analysis.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 16 && global.tech['chthonian'] && global.tech['chthonian'] >= 3){
                    messageQueue(loc(tech_source,[loc('tech_orichalcum_analysis')]),'info',false,['progress']);
                    messageQueue(loc('tech_orichalcum_analysis_result'),'info',false,['progress']);
                    global.tech.high_tech = 17;
                    drawTech();
                    drawCity();
                }
                if (global.resource.Knowledge.max >= (actions.tech.infernium_fuel.cost.Knowledge() * know_adjust) && global.tech['smelting'] && global.tech.smelting === 7 && global.tech['hell_ruins'] && global.tech['hell_ruins'] >= 4){
                    messageQueue(loc(tech_source,[loc('tech_infernium_fuel')]),'info',false,['progress']);
                    global.tech.smelting = 8;
                    defineIndustry();
                    drawTech();
                }
            }
        }

        let moldFathom = fathomCheck('moldling');
        if (moldFathom > 0){
            let tech_source = `trait_infiltrator_thrall`;
            let know_adjust = 1 - (100 - traits.infiltrator.vars(1)[0]) * moldFathom / 100;
            if (moldFathom >= 0.02 && global.resource.Knowledge.max >= (actions.tech.smelting.cost.Knowledge() * know_adjust) && checkTechRequirements('smelting',false) && !global.tech['smelting']){
                messageQueue(loc(tech_source,[loc('tech_smelting')]),'info',false,['progress']);
                global.tech['smelting'] = 1;
                initStruct(actions.city.smelter);
                if (global.race['steelen']){
                    global.tech['smelting'] = 2;
                }
                drawTech();
                drawCity();
            }
            if (moldFathom >= 0.04 && global.resource.Knowledge.max >= (actions.tech.dynamite.cost.Knowledge() * know_adjust) && checkTechRequirements('dynamite',false) && global.tech['explosives'] && global.tech.explosives === 1){
                messageQueue(loc(tech_source,[loc('tech_dynamite')]),'info',false,['progress']);
                global.tech.explosives = 2;
                drawTech();
            }
            if (moldFathom >= 0.08 && global.resource.Knowledge.max >= (actions.tech.portland_cement.cost.Knowledge() * know_adjust) && checkTechRequirements('portland_cement',false) && global.tech['cement'] && global.tech.cement === 3){
                messageQueue(loc(tech_source,[loc('tech_portland_cement')]),'info',false,['progress']);
                global.tech.cement = 4;
                drawTech();
            }
            if (moldFathom >= 0.12 && global.resource.Knowledge.max >= (actions.tech.oxygen_converter.cost.Knowledge() * know_adjust) && checkTechRequirements('oxygen_converter',false) && global.tech['smelting'] && global.tech.smelting === 4){
                messageQueue(loc(tech_source,[loc('tech_oxygen_converter')]),'info',false,['progress']);
                global.tech.smelting = 5;
                drawTech();
            }
            if (moldFathom >= 0.15 && global.resource.Knowledge.max >= (actions.tech.machinery.cost.Knowledge() * know_adjust) && checkTechRequirements('machinery',false) && global.tech['foundry'] && global.tech.foundry === 6){
                messageQueue(loc(tech_source,[loc('tech_machinery')]),'info',false,['progress']);
                global.tech.foundry = 7;
                drawTech();
            }
            if (moldFathom >= 0.20 && global.resource.Knowledge.max >= (actions.tech.uranium_storage.cost.Knowledge() * know_adjust) && checkTechRequirements('uranium_storage',false) && global.tech['uranium'] && global.tech.uranium === 1){
                messageQueue(loc(tech_source,[loc('tech_uranium_storage')]),'info',false,['progress']);
                global.tech.uranium = 1;
                drawTech();
            }
            if (moldFathom >= 0.25 && global.resource.Knowledge.max >= (actions.tech.synthetic_fur.cost.Knowledge() * know_adjust) && checkTechRequirements('synthetic_fur',false) && !global.tech['synthetic_fur']){
                messageQueue(loc(tech_source,[actions.tech.synthetic_fur.title()]),'info',false,['progress']);
                global.tech['synthetic_fur'] = 1;
                drawTech();
            }
            if (moldFathom >= 0.35 && global.resource.Knowledge.max >= (actions.tech.rover.cost.Knowledge() * know_adjust) && checkTechRequirements('rover',false) && global.tech['space_explore'] && global.tech.space_explore === 1){
                messageQueue(loc(tech_source,[loc('tech_rover')]),'info',false,['progress']);
                global.tech.space_explore = 2;
                global.settings.space.moon = true;
                global.space['moon_base'] = {
                    count: 0,
                    on: 0,
                    support: 0,
                    s_max: 0
                };
                drawTech();
            }
            let late_tech_source = `trait_infiltrator_thrall_alt`;
            if (moldFathom >= 0.4 && global.resource.Knowledge.max >= (actions.tech.starcharts.cost.Knowledge() * know_adjust) && checkTechRequirements('starcharts',false) && global.tech['space_explore'] && global.tech.space_explore === 3){
                messageQueue(loc(late_tech_source,[loc('tech_starcharts')]),'info',false,['progress']);
                global.tech.space_explore = 4;
                drawTech();
            }
            if (moldFathom >= 0.5 && global.resource.Knowledge.max >= (actions.tech.nano_tubes.cost.Knowledge() * know_adjust) && checkTechRequirements('nano_tubes',false) && !global.tech['nano']){
                messageQueue(loc(late_tech_source,[loc('tech_nano_tubes')]),'info',false,['progress']);
                global.tech['nano'] = 1;
                global.resource.Nano_Tube.display = true;
                drawTech();
            }
            if (global.race['truepath']){
                if (moldFathom >= 0.65 && global.resource.Knowledge.max >= (actions.tech.stanene_tp.cost.Knowledge() * know_adjust) && checkTechRequirements('stanene_tp',false) && !global.tech['stanene']){
                    messageQueue(loc(late_tech_source,[loc('tech_stanene')]),'info',false,['progress']);
                    global.tech['stanene'] = 1;
                    global.resource.Stanene.display = true;
                    drawTech();
                }
                if (moldFathom >= 0.8 && global.resource.Knowledge.max >= (actions.tech.anitgrav_bunk.cost.Knowledge() * know_adjust) && checkTechRequirements('anitgrav_bunk',false) && global.tech['marines'] && global.tech.marines === 1){
                    messageQueue(loc(late_tech_source,[loc('tech_anitgrav_bunk')]),'info',false,['progress']);
                    global.tech.marines = 2;
                    drawTech();
                }
            }
            else {
                if (moldFathom >= 0.65 && global.resource.Knowledge.max >= (actions.tech.stanene.cost.Knowledge() * know_adjust) && checkTechRequirements('stanene',false) && !global.tech['stanene']){
                    messageQueue(loc(late_tech_source,[loc('tech_stanene')]),'info',false,['progress']);
                    global.tech['stanene'] = 1;
                    global.resource.Stanene.display = true;
                    drawTech();
                }
                if (moldFathom >= 0.78 && global.resource.Knowledge.max >= (actions.tech.hydroponics.cost.Knowledge() * know_adjust) && checkTechRequirements('hydroponics',false) && global.tech['mars'] && global.tech.mars === 5){
                    messageQueue(loc(late_tech_source,[loc('tech_hydroponics')]),'info',false,['progress']);
                    global.tech.mars = 6;
                    drawTech();
                }
                if (moldFathom >= 0.92 && global.resource.Knowledge.max >= (actions.tech.orichalcum_panels.cost.Knowledge() * know_adjust) && checkTechRequirements('orichalcum_panels',false) && global.tech['swarm'] && global.tech.swarm === 5){
                    messageQueue(loc(late_tech_source,[loc('tech_orichalcum_panels')]),'info',false,['progress']);
                    global.tech.swarm = 6;
                    drawTech();
                }
                if (moldFathom >= 1 && global.resource.Knowledge.max >= (actions.tech.cybernetics.cost.Knowledge() * know_adjust) && checkTechRequirements('cybernetics',false) && global.tech['high_tech'] && global.tech.high_tech === 17){
                    messageQueue(loc(late_tech_source,[loc('tech_cybernetics')]),'info',false,['progress']);
                    global.tech.high_tech = 18;
                    drawTech();
                }
            }
        }

        if (global.race['truepath'] && global.tech['tauceti'] && global.tech.tauceti === 3 && global.space.hasOwnProperty('jump_gate') && global.tauceti.hasOwnProperty('jump_gate') && global.space.jump_gate.count >= 100 && global.tauceti.jump_gate.count >= 100){
            global.tech.tauceti = 4;
            global.resource.Materials.display = false;
            global.resource.Bolognium.display = true;
            renderSpace();
            renderTauCeti();
            drawTech();
        }

        if (global.race['truepath'] && global.tech['tauceti'] && !global.race['lone_survivor']){
            if (global.tech.tauceti === 5 && !global.tech['plague'] && Math.rand(0,50) === 0){
                global.tech['plague'] = 1;
                messageQueue(loc('tau_plague',[govTitle(3)]),'info',false,['progress']);
            }
            else if (global.tech['plague'] && global.tech['tau_roid'] && global.tech['tau_whale']){
                if (global.tech.plague === 1 && (global.tech.tau_roid >= 4 || global.tech.tau_whale >= 2) && Math.rand(0,50) === 0){
                    global.tech.plague = 2;
                    global.race['quarantine'] = 1;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague2',[govTitle(3)]),'info',false,['progress']);
                }
                else if (global.tech.plague === 2 && global.tech.tau_roid >= 5 && global.tech.tau_whale >= 2 && Math.rand(0,50) === 0){
                    global.tech.plague = 3;
                    global.race['quarantine'] = 2;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague3',[govTitle(3),races[global.race.species].home]),'info',false,['progress']);
                }
                else if (global.tech['isolation']){
                    if (global.tech.plague < 5 && Math.rand(0,50) === 0){
                        global.tech.plague = 5;
                        delete global.race['quarantine'];
                        delete global.race['qDays'];
                        messageQueue(loc('tau_plague5b',[races[global.race.species].home]),'info',false,['progress']);
                        drawTech();
                    }
                }
                else if (global.tech.plague === 3 && global.tech['disease'] && global.tech.disease >= 2 && Math.rand(0,50) === 0){
                    global.tech.plague = 4;
                    global.race['quarantine'] = 3;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague5a',[races[global.race.species].home]),'info',false,['progress']);
                }
                else if (global.tech.plague === 4 && global.tech['disease'] && global.tech.disease >= 3 && Math.rand(0,50) === 0){
                    global.tech.plague = 5;
                    global.race['quarantine'] = 4;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague5a',[races[global.race.species].home]),'info',false,['progress']);
                }

                if (global.race['quarantine']){
                    if (!global.race.hasOwnProperty('qDays')){
                        global.race['qDays'] = 0;
                    }
                    global.race.qDays++;
                }
            }
        }
        else if (global.tech['tau_gas'] && global.tech.tau_gas >= 4 && !global.tech['plague'] && global.race['lone_survivor']){
            global.tech['plague'] = 5;
        }

        if (global.civic.govern['protest'] && global.civic.govern.protest > 0){
            global.civic.govern.protest--;
        }
        if (global.civic.govern['scandal'] && global.civic.govern.scandal > 0){
            global.civic.govern.scandal--;
        }

        {
            let tax_cap = govCivics('tax_cap');
            let tax_min = govCivics('tax_cap',true);
            if (global.civic.taxes.tax_rate > tax_cap){
                global.civic.taxes.tax_rate = tax_cap;
            }
            else if (global.civic.taxes.tax_rate < tax_min){
                global.civic.taxes.tax_rate = tax_min;
            }
        }

        if (global.queue.display){
            calcQueueMax();
        }
        if (global.r_queue.display){
            calcRQueueMax();
        }

        if (global.race.mutation > 0){
            let total = 0;
            for (let i=0; i<global.race.mutation; i++){
                let mut_level = i + 1;
                let plasma = global.genes['plasma'] ? mut_level : 1;
                if (global.genes['plasma'] && plasma > 3){
                    if (global.genes['plasma'] >= 2){
                        plasma = plasma > 5 ? 5 : plasma;
                    }
                    else {
                        plasma = 3;
                    }
                }
                total += plasma;
            }
            global.race['p_mutation'] = total;
        }

        if (!global.tech['whitehole'] && global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025){
            global.tech['whitehole'] = 1;
            if (global.tech['stablized']){
                delete global.tech['stablized'];
            }
            if (!global.race.governor.config.hasOwnProperty('trash') || (global.race.governor.config.hasOwnProperty('trash') && !global.race.governor.config.trash['stab'])){
                messageQueue(loc('interstellar_blackhole_unstable'),'danger',false,['progress']);
            }
            drawTech();
        }
        else if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025){
            if (global.tech['whitehole'] && global.tech['stablized']){
                delete global.tech['stablized'];
                drawTech();
            }
        }
}

export function longLoop_s3($ctx){
        if (!global.tech['xeno'] && global.galaxy['scout_ship'] && gal_on['scout_ship'] > 0 && Math.rand(0, 10) === 0){
            global.tech['xeno'] = 1;
            global.galaxy.scout_ship.count--;
            global.galaxy.scout_ship.on--;
            let civPerShip = actions.galaxy.gxy_gateway.scout_ship.ship.civ();
            let milPerShip = actions.galaxy.gxy_gateway.scout_ship.ship.mil();
            global.galaxy.scout_ship.crew -= civPerShip;
            global.galaxy.scout_ship.mil -= milPerShip;
            global.resource[global.race.species].amount -= civPerShip;
            global.civic.garrison.workers -= milPerShip;
            global.civic.garrison.crew -= milPerShip;
            messageQueue(loc('galaxy_encounter'),'info',false,['progress']);
            drawTech();
        }

        if (global.galaxy['scavenger'] && global.tech['conflict'] && global.tech['conflict'] === 4 && gal_on['scavenger'] > 0 && Math.rand(0, 50) <= gal_on['scavenger']){
            global.tech['conflict'] = 5;
            messageQueue(loc('galaxy_scavenger_find'),'info',false,['progress']);
            drawTech();
        }

        if (!global.tech['syndicate'] && !global.race['lone_survivor'] && global.tech['outer'] && Math.rand(0, 20) === 0){
            messageQueue(loc('outer_syndicate',[govTitle(4)]),'info',false,['progress']);
            global.tech['syndicate'] = 1;
            global.space['syndicate'] = {};
        }

        if (!global.tech['corrupted_ai'] && p_on['ai_core2'] && calcAIDrift() === 100){
            global.tech['corrupted_ai'] = 1;
            drawTech();
        }

        if (global.arpa.sequence && global.arpa.sequence['auto'] && global.tech['genetics'] && global.tech['genetics'] === 7){
            buildGene();
        }

        if (global.race['orbit_decay']){
            if (!global.race['orbit_decayed']){
                $(`#infoTimer`).html(`T-${global.race['orbit_decay'] - global.stats.days}`);
            }
            orbitDecayed();
        }
        if (global.race['truepath'] && global.city.ptrait.includes('kamikaze') && orbitLength() <= 10){
            global.race['orbit_decay'] = 1;
            global.race['tidal_decay'] = 1;
            orbitDecayed();
        }

        if (global.race['living_materials']){
            ['city','space','interstellar','galaxy','portal','eden','tauceti'].forEach(function(sector){
                Object.keys(global[sector]).forEach(function(struct){
                    if (global[sector][struct].hasOwnProperty('l_m')){
                        global[sector][struct].l_m++;
                    }
                });
            });
        }

        govern();
}
