// Riset syndicate, matrix, dan focus cure per detik. Dulu awal longLoop_s2.
import { global, support_on, p_on } from '../../core/vars.js';
import { renderSpace, spaceTech } from '../../space/space_requirements.js';
import { planetName } from '../../space/planet_name.js';
import { universe_affixes } from '../../functions/universe_utils.js';
import { actions, hooks, races } from '../../core/registries.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { orbitLength } from '../../races/trait_logic/trait_ranks.js';
import { removeTask } from '../../governor/gov_utils.js';
import { messageQueue } from '../../functions/message_log.js';
import { flib } from '../../functions/run_stats_helpers.js';
import { deepClone } from '../../core/object_utils.js';
import { loc } from '../../core/locale.js';
import { tritonWar, erisWar } from '../../truepath/ship_orbits.js';
import { genXYcoord, sensorRange } from '../../truepath/orbit_math.js';
import { drawMap } from '../../truepath/solar_map.js';
import { spacePlanetStats } from '../../truepath/truepath_data.js';

export function longLoopSyndicateResearch($ctx){
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
                        hooks.renderTauCeti();
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
                    hooks.defineGovernor();
                }
            }
        }
}
