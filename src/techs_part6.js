import { global, webWorker } from './vars.js';
import { loc } from './locale.js';
import { calcPrestige, messageQueue, clearPopper } from './functions.js';
import { unlockAchieve, universeAffix } from './achieve.js';
import { payCosts, checkAffordable, actions, initStruct } from './actions.js';
import { races, renderPsychicPowers } from './races.js';
import { drawResourceTab, atomic_mass } from './resources.js';
import { renderSpace, planetName } from './space.js';
import { drawHellObservations } from './portal.js';
import { arpa } from './arpa.js';
import { defineIndustry, setupRituals } from './industry.js';
import { cataclysm_end, aiApocalypse } from './resets.js';

// Bagian 6 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export const techsPart6 = {
    stabilize_blackhole: {
        title: loc('tech_stabilize_blackhole'),
        desc(){ return `<div>${loc('tech_stabilize_blackhole')}</div><div class="has-text-danger">${loc('tech_stabilize_blackhole2')}</div>`; },
        cost: {
            Knowledge(){ return 1500000; },
            Neutronium(){ return 20000; }
        },
        effect: loc('tech_stabilize_blackhole_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.interstellar.stellar_engine.mass += (atomic_mass.Neutronium * 20000 / 10000000000);
                global.interstellar.stellar_engine.mass += global.interstellar.stellar_engine.exotic * 40;
                global.interstellar.stellar_engine.exotic = 0;
                delete global.tech['whitehole'];
                if (global.race['banana'] && global.interstellar.stellar_engine.mass >= 12){
                    let affix = universeAffix();
                    global.stats.banana.b3[affix] = true;
                    if (affix !== 'm' && affix !== 'l'){
                        global.stats.banana.b3.l = true;
                    }
                }
                return true;
            }
            return false;
        }
    },
    veil: {
        title: loc('tech_veil'),
        desc: loc('tech_veil'),
        condition(){
            return global.race.universe === 'magic' ? true : false;
        },
        cost: {
            Knowledge(){ return 1250000; }
        },
        effect: loc('tech_veil_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mana_syphon: {
        title: loc('tech_mana_syphon'),
        desc: loc('tech_mana_syphon'),
        condition(){
            return global.race.universe === 'magic' ? true : false;
        },
        cost: {
            Knowledge(){ return 1500000; }
        },
        effect: loc('tech_mana_syphon_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    gravitational_waves: {
        title: loc('tech_gravitational_waves'),
        desc: loc('tech_gravitational_waves'),
        cost: {
            Knowledge(){ return 1250000; }
        },
        effect: loc('tech_gravitational_waves_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    gravity_convection: {
        title: loc('tech_gravity_convection'),
        desc: loc('tech_gravity_convection'),
        cost: {
            Knowledge(){ return 1350000; }
        },
        effect: loc('tech_gravity_convection_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    wormholes: {
        title: loc('tech_wormholes'),
        desc: loc('tech_wormholes'),
        cost: {
            Knowledge(){ return 2250000; }
        },
        effect: loc('tech_wormholes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    portal: {
        title: loc('tech_portal'),
        desc: loc('tech_portal_desc'),
        cost: {
            Knowledge(){ return 500000; }
        },
        effect: loc('tech_portal_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fortifications: {
        title: loc('tech_fort'),
        desc: loc('tech_fort_desc'),
        cost: {
            Knowledge(){ return 550000; },
            Stone(){ return 1000000; }
        },
        effect: loc('tech_fort_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showPortal = true;
                global.settings.portal.fortress = true;
                if (!global.settings.msgFilters.hell.unlocked){
                    global.settings.msgFilters.hell.unlocked = true;
                    global.settings.msgFilters.hell.vis = true;
                }
                global.portal['fortress'] = {
                    threat: 10000,
                    garrison: 0,
                    walls: 100,
                    repair: 0,
                    patrols: 0,
                    patrol_size: 10,
                    siege: 999,
                    notify: 'Yes',
                    s_ntfy: 'Yes',
                    nocrew: false,
                };
                initStruct(actions.portal.prtl_fortress.turret);
                initStruct(actions.portal.prtl_fortress.carport);
                if (races[global.race.species].type === 'demonic'){
                    unlockAchieve('blood_war');
                }
                else {
                    unlockAchieve('pandemonium');
                }
                global.portal.observe = {
                    settings: {
                        expanded: false,
                        average: false,
                        hyperSlow: false,
                        display: 'game_days',
                        dropKills: true,
                        dropGems: true
                    },
                    stats: {
                        total: {
                            start: { year: global.city.calendar.year, day: global.city.calendar.day },
                            days: 0,
                            wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                            kills: {
                                drones: 0,
                                patrols: 0,
                                sieges: 0,
                                guns: 0,
                                soul_forge: 0,
                                turrets: 0
                            },
                            gems: {
                                patrols: 0,
                                guns: 0,
                                soul_forge: 0,
                                crafted: 0,
                                turrets: 0,
                                surveyors: 0,
                                compactor: 0
                            },
                        },
                        period: {
                            start: { year: global.city.calendar.year, day: global.city.calendar.day },
                            days: 0,
                            wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                            kills: {
                                drones: 0,
                                patrols: 0,
                                sieges: 0,
                                guns: 0,
                                soul_forge: 0,
                                turrets: 0
                            },
                            gems: {
                                patrols: 0,
                                guns: 0,
                                soul_forge: 0,
                                crafted: 0,
                                turrets: 0,
                                surveyors: 0,
                                compactor: 0
                            },
                        }
                    },
                    graphID: 0,
                    graphs: {}
                };
                return true;
            }
            return false;
        },
        post(){
            drawHellObservations();
        }
    },
    war_drones: {
        title: loc('tech_war_drones'),
        desc: loc('tech_war_drones'),
        cost: {
            Knowledge(){ return 700000; },
        },
        effect: loc('tech_war_drones_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.portal.badlands = true;
                initStruct(actions.portal.prtl_badlands.war_drone);
                return true;
            }
            return false;
        }
    },
    demon_attractor: {
        title: loc('tech_demon_attractor'),
        desc: loc('tech_demon_attractor'),
        cost: {
            Knowledge(){ return 745000; },
        },
        effect: loc('tech_demon_attractor_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_badlands.attractor);
                return true;
            }
            return false;
        }
    },
    combat_droids: {
        title: loc('tech_combat_droids'),
        desc: loc('tech_combat_droids'),
        cost: {
            Knowledge(){ return 762000; },
            Soul_Gem(){ return 1; }
        },
        effect: loc('tech_combat_droids_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_fortress.war_droid);
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_combat_droids_flair');
        }
    },
    repair_droids: {
        title: loc('tech_repair_droids'),
        desc: loc('tech_repair_droids'),
        cost: {
            Knowledge(){ return 794000; },
            Soul_Gem(){ return 1; }
        },
        effect: loc('tech_repair_droids_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_fortress.repair_droid);
                return true;
            }
            return false;
        }
    },
    advanced_predators: {
        title: loc('tech_advanced_predators'),
        desc: loc('tech_advanced_predators'),
        cost: {
            Knowledge(){ return 5000000; },
            Bolognium(){ return 500000; },
            Vitreloy(){ return 250000; }
        },
        effect: loc('tech_advanced_predators_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    enhanced_droids: {
        title: loc('tech_enhanced_droids'),
        desc: loc('tech_enhanced_droids'),
        cost: {
            Knowledge(){ return 1050000; },
        },
        effect: loc('tech_enhanced_droids_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    sensor_drone: {
        title: loc('tech_sensor_drone'),
        desc: loc('tech_sensor_drone'),
        cost: {
            Knowledge(){ return 725000; },
        },
        effect: loc('tech_sensor_drone_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_badlands.sensor_drone);
                return true;
            }
            return false;
        }
    },
    map_terrain: {
        title: loc('tech_map_terrain'),
        desc: loc('tech_map_terrain'),
        cost: {
            Knowledge(){ return 948000; },
        },
        effect(){ return loc('tech_map_terrain_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    calibrated_sensors: {
        title: loc('tech_calibrated_sensors'),
        desc: loc('tech_calibrated_sensors'),
        cost: {
            Knowledge(){ return 1125000; },
            Infernite(){ return 3500; }
        },
        effect(){ return loc('tech_calibrated_sensors_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    shield_generator: {
        title: loc('tech_shield_generator'),
        desc: loc('tech_shield_generator'),
        cost: {
            Knowledge(){ return 2680000; },
            Bolognium(){ return 75000; }
        },
        effect(){ return loc('tech_shield_generator_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    enhanced_sensors: {
        title: loc('tech_enhanced_sensors'),
        desc: loc('tech_enhanced_sensors'),
        cost: {
            Knowledge(){ return 4750000; },
            Vitreloy(){ return 25000; }
        },
        effect(){ return loc('tech_enhanced_sensors_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    xeno_linguistics: {
        title: loc('tech_xeno_linguistics'),
        desc: loc('tech_xeno_linguistics'),
        cost: {
            Knowledge(){ return 3000000; }
        },
        effect(){ return loc('tech_xeno_linguistics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.space['gorddon'] = true;
                return true;
            }
            return false;
        }
    },
    xeno_culture: {
        title: loc('tech_xeno_culture'),
        desc: loc('tech_xeno_culture'),
        cost: {
            Knowledge(){ return 3400000; }
        },
        effect(){
            let s1name = races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name;
            let s1desc = races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].entity;
            return loc('tech_xeno_culture_effect',[s1name,s1desc]);
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gorddon.embassy);
                return true;
            }
            return false;
        }
    },
    cultural_exchange: {
        title: loc('tech_cultural_exchange'),
        desc: loc('tech_cultural_exchange'),
        cost: {
            Knowledge(){ return 3550000; }
        },
        effect(){
            let s1name = races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name;
            return loc('tech_cultural_exchange_effect',[s1name]);
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gorddon.dormitory);
                initStruct(actions.galaxy.gxy_gorddon.symposium);
                return true;
            }
            return false;
        }
    },
    shore_leave: {
        title: loc('tech_shore_leave'),
        desc: loc('tech_shore_leave'),
        cost: {
            Knowledge(){ return 4600000; }
        },
        effect(){ return loc('tech_shore_leave_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    xeno_gift: {
        title: loc('tech_xeno_gift'),
        desc: loc('tech_xeno_gift'),
        cost: {
            Knowledge(){ return 6500000; },
            Infernite(){ return 125000; }
        },
        effect(){ return loc('tech_xeno_gift_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_alien1.consulate);
                global.settings.space.alien1 = true;
                messageQueue(loc('tech_xeno_gift_msg',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    industrial_partnership: {
        title: loc('tech_industrial_partnership'),
        desc(){ return loc('tech_industrial_partnership'); },
        cost: {
            Knowledge(){ return 7250000; }
        },
        effect(){ return loc('tech_industrial_partnership_effect',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_alien1.vitreloy_plant);
                return true;
            }
            return false;
        }
    },
    embassy_housing: {
        title: loc('tech_embassy_housing'),
        desc(){ return loc('tech_embassy_housing'); },
        cost: {
            Knowledge(){ return 10750000; }
        },
        effect(){ return loc('tech_embassy_housing_effect',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_telemetry: {
        title: loc('tech_advanced_telemetry'),
        desc: loc('tech_advanced_telemetry'),
        cost: {
            Knowledge(){ return 4200000; },
            Vitreloy(){ return 10000; }
        },
        effect(){
            return loc('tech_advanced_telemetry_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    defense_platform: {
        title: loc('galaxy_defense_platform'),
        desc: loc('galaxy_defense_platform'),
        cost: {
            Knowledge(){ return 4850000; }
        },
        effect: loc('tech_defense_platform_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_stargate.defense_platform);
                return true;
            }
            return false;
        }
    },
    scout_ship: {
        title: loc('galaxy_scout_ship'),
        desc: loc('galaxy_scout_ship'),
        cost: {
            Knowledge(){ return 2600000; }
        },
        effect(){ return loc('tech_scout_ship_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.scout_ship);
                return true;
            }
            return false;
        }
    },
    corvette_ship: {
        title: loc('galaxy_corvette_ship'),
        desc: loc('galaxy_corvette_ship'),
        cost: {
            Knowledge(){ return 3200000; }
        },
        effect(){ return loc('tech_corvette_ship_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.corvette_ship);
                return true;
            }
            return false;
        }
    },
    frigate_ship: {
        title: loc('galaxy_frigate_ship'),
        desc: loc('galaxy_frigate_ship'),
        cost: {
            Knowledge(){ return 4000000; }
        },
        effect(){ return loc('tech_frigate_ship_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.frigate_ship);
                renderSpace();
                return true;
            }
            return false;
        }
    },
    cruiser_ship: {
        title: loc('galaxy_cruiser_ship'),
        desc: loc('galaxy_cruiser_ship'),
        cost: {
            Knowledge(){ return 7500000; }
        },
        effect(){ return loc('tech_cruiser_ship_effect',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.cruiser_ship);
                initStruct(actions.galaxy.gxy_alien2.foothold);
                global.settings.space.alien2 = true;
                renderSpace();
                return true;
            }
            return false;
        }
    },
    dreadnought: {
        title: loc('galaxy_dreadnought'),
        desc: loc('galaxy_dreadnought'),
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){ return loc('tech_dreadnought_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.dreadnought);
                renderSpace();
                return true;
            }
            return false;
        }
    },
    ship_dock: {
        title: loc('galaxy_ship_dock'),
        desc: loc('galaxy_ship_dock'),
        cost: {
            Knowledge(){ return 3900000; }
        },
        effect(){ return loc('tech_ship_dock_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_gateway.ship_dock);
                return true;
            }
            return false;
        }
    },
    ore_processor: {
        title: loc('galaxy_ore_processor'),
        desc: loc('galaxy_ore_processor'),
        cost: {
            Knowledge(){ return 7500000; }
        },
        effect(){ return loc('tech_ore_processor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_alien2.ore_processor);
                return true;
            }
            return false;
        }
    },
    scavenger: {
        title: loc('galaxy_scavenger'),
        desc: loc('galaxy_scavenger'),
        cost: {
            Knowledge(){ return 8000000; }
        },
        effect(){ return loc('tech_scavenger_effect',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_alien2.scavenger);
                return true;
            }
            return false;
        }
    },
    coordinates: {
        title: loc('tech_coordinates'),
        desc: loc('tech_coordinates'),
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){ return loc('tech_coordinates_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_chthonian.minelayer);
                global.settings.space.chthonian = true;
                return true;
            }
            return false;
        }
    },
    chthonian_survey : {
        title: loc('tech_chthonian_survey'),
        desc: loc('tech_chthonian_survey'),
        cost: {
            Knowledge(){ return 11800000; }
        },
        effect(){ return loc('tech_chthonian_survey_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Orichalcum.display = true;
                initStruct(actions.galaxy.gxy_chthonian.excavator);
                initStruct(actions.galaxy.gxy_chthonian.raider);
                messageQueue(loc('tech_chthonian_survey_result'),'info',false,['progress']);
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    gateway_depot: {
        title: loc('galaxy_gateway_depot'),
        desc: loc('galaxy_gateway_depot'),
        cost: {
            Knowledge(){ return 4350000; }
        },
        effect(){ return loc('tech_gateway_depot_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.galaxy.gxy_stargate.gateway_depot);
                return true;
            }
            return false;
        }
    },
    soul_forge: {
        title: loc('portal_soul_forge_title'),
        desc: loc('portal_soul_forge_title'),
        cost: {
            Knowledge(){ return 2750000; }
        },
        effect(){ return loc('tech_soul_forge_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.soul_forge);
                return true;
            }
            return false;
        }
    },
    soul_attractor: {
        title: loc('portal_soul_attractor_title'),
        desc: loc('portal_soul_attractor_title'),
        cost: {
            Knowledge(){ return 5500000; }
        },
        effect(){ return loc('tech_soul_attractor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.soul_attractor);
                return true;
            }
            return false;
        }
    },
    soul_absorption: {
        title: loc('tech_soul_absorption'),
        desc: loc('tech_soul_absorption'),
        cost: {
            Knowledge(){ return 6000000; },
            Infernite(){ return 250000; }
        },
        effect(){ return loc('tech_soul_absorption_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    soul_link: {
        title: loc('tech_soul_link'),
        desc: loc('tech_soul_link'),
        cost: {
            Knowledge(){ return 7500000; },
            Vitreloy(){ return 250000; }
        },
        effect(){ return loc('tech_soul_link_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    soul_bait: {
        title: loc('tech_soul_bait'),
        desc: loc('tech_soul_bait'),
        cost: {
            Knowledge(){ return 65000000; },
            Asphodel_Powder(){ return 10000; }
        },
        effect(){ return loc('tech_soul_bait_effect',[global.resource.Asphodel_Powder.name, loc('arpa_blood_attract_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    gun_emplacement: {
        title: loc('portal_gun_emplacement_title'),
        desc: loc('portal_gun_emplacement_title'),
        cost: {
            Knowledge(){ return 3000000; }
        },
        effect(){ return loc('tech_gun_emplacement_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.gun_emplacement);
                return true;
            }
            return false;
        }
    },
    advanced_emplacement: {
        title: loc('tech_advanced_emplacement'),
        desc: loc('tech_advanced_emplacement'),
        cost: {
            Knowledge(){ return 12500000; },
            Orichalcum(){ return 180000; }
        },
        effect(){ return loc('tech_advanced_emplacement_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dial_it_to_11: {
        title: loc('tech_dial_it_to_11'),
        desc: loc('tech_dial_it_to_11'),
        wiki: false,
        cost: {
            Knowledge(){ return 500000; }
        },
        condition(){
            return (global.race['sludge'] || global.race['ultra_sludge']) && !global.race['cataclysm'] ? false : true;
        },
        effect(){
            let gains = calcPrestige('cataclysm');
            let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
            return `<div>${loc('tech_dial_it_to_11_effect',[planetName().dwarf,global.race['cataclysm'] ? planetName().red : races[global.race.species].home])}</div><div class="has-text-danger">${loc('tech_dial_it_to_11_effect2')}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[gains.phage])}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                $('#main').addClass('earthquake');
                setTimeout(function(){
                    $('#main').removeClass('earthquake');
                    cataclysm_end();
                }, 4000);
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_dial_it_to_11_flair'); }
    },
    limit_collider: {
        title: loc('tech_limit_collider'),
        desc: loc('tech_limit_collider'),
        wiki: false,
        cost: {
            Knowledge(){ return 500000; }
        },
        effect(){ return loc('tech_limit_collider_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mana: {
        title: loc('tech_mana'),
        desc: loc('tech_mana'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Knowledge(){ return 25; }
        },
        effect(){ return loc('tech_mana_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Mana.display = true;
                global.resource.Crystal.display = true;
                global.civic.crystal_miner.display = true;
                if (global.race['witch_hunter']){
                    global.resource.Sus.display = true;
                }
                return true;
            }
            return false;
        },
        flair: loc('tech_mana_flair'),
        post(){
            renderPsychicPowers();
        }
    },
    ley_lines: {
        title: loc('tech_ley_lines'),
        desc: loc('tech_ley_lines'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Knowledge(){ return 40; }
        },
        effect(){ return loc('tech_ley_lines_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.tech['isolation']){
                    initStruct(actions.tauceti.tau_home.pylon);
                }
                else if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    initStruct(actions.space.spc_red.pylon);
                }
                else {
                    initStruct(actions.city.pylon);
                }
                return true;
            }
            return false;
        }
    },
    rituals: {
        title: loc('tech_rituals'),
        desc: loc('tech_rituals'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 25; },
            Knowledge(){ return 750; },
            Crystal(){ return 50; }
        },
        effect(){ return loc('tech_rituals_effect'); },
        action(){
            if (payCosts($(this)[0])){
                setupRituals(true);
                global.settings.showIndustry = true;
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    crafting_ritual: {
        title: loc('tech_crafting_ritual'),
        desc: loc('tech_crafting_ritual'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 15000; },
            Crystal(){ return 2500; }
        },
        effect(){ return loc('tech_crafting_ritual_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.race.casting['crafting'] = 0;
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    mana_nexus: {
        title: loc('tech_mana_nexus'),
        desc: loc('tech_mana_nexus'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 500; },
            Knowledge(){ return 160000; },
            Crystal(){ return 2500; }
        },
        effect(){ return loc('tech_mana_nexus_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    clerics: {
        title: loc('tech_clerics'),
        desc: loc('tech_clerics'),
        condition(){
            return global.race['universe'] === 'magic' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 2000; },
            Crystal(){ return 100; }
        },
        effect(){ return loc('tech_clerics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    conjuring: {
        title: loc('tech_conjuring'),
        desc: loc('tech_conjuring_desc'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 2; },
            Crystal(){ return 5; }
        },
        effect(){ return loc('tech_conjuring_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    res_conjuring: {
        title: loc('tech_res_conjuring'),
        desc: loc('tech_res_conjuring'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 5; },
            Crystal(){ return 10; }
        },
        effect(){ return loc('tech_res_conjuring_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alchemy: {
        title: loc('tech_alchemy'),
        desc: loc('tech_alchemy'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 10000; },
            Crystal(){ return 250; }
        },
        effect(){ return loc('tech_alchemy_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.race['alchemy'] = {
                    Food: 0, Lumber: 0,
                    Stone: 0, Furs: 0,
                    Copper: 0, Iron: 0,
                    Aluminium: 0, Cement: 0,
                    Coal: 0, Oil: 0,
                    Uranium: 0, Steel: 0,
                    Titanium: 0, Alloy: 0,
                    Polymer: 0, Iridium: 0,
                    Helium_3: 0, Deuterium: 0,
                    Neutronium: 0, Adamantite: 0,
                    Infernite: 0, Elerium: 0,
                    Nano_Tube: 0, Graphene: 0,
                    Stanene: 0, Bolognium: 0,
                    Vitreloy: 0, Orichalcum: 0
                };
                global.settings.showAlchemy = true;
                return true;
            }
            return false;
        },
        post(){
            drawResourceTab('alchemy');
        }
    },
    transmutation: {
        title: loc('tech_transmutation'),
        desc: loc('tech_transmutation'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 1250; },
            Knowledge(){ return 5500000; },
            Crystal(){ return 1000000; }
        },
        effect(){ return loc('tech_transmutation_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            drawResourceTab('alchemy');
        }
    },
    secret_society: {
        title: loc('tech_secret_society'),
        desc: loc('tech_secret_society'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 10; },
            Knowledge(){ return 45; },
        },
        effect(){ return loc('tech_secret_society_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cultists: {
        title: loc('tech_cultists'),
        desc: loc('tech_cultists'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 250; },
            Knowledge(){ return 2125; }
        },
        effect(){ return loc('tech_cultists_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    conceal_ward: {
        title: loc('tech_conceal_ward'),
        desc: loc('tech_conceal_ward'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 500; },
            Knowledge(){ return 8200; },
            Crystal(){ return 1000; }
        },
        effect(){ return loc('tech_conceal_ward_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.conceal_ward);
                global.space['conceal_ward'] = { count: 0 }; // ???
                return true;
            }
            return false;
        }
    },
    subtle_rituals: {
        title: loc('tech_subtle_rituals'),
        desc: loc('tech_subtle_rituals'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 15000; },
            Crystal(){ return 2500; }
        },
        effect(){ return loc('tech_subtle_rituals_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pylon_camouflage: {
        title: loc('tech_pylon_camouflage'),
        desc: loc('tech_pylon_camouflage'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 1000; },
            Knowledge(){ return 30000; },
            Crystal(){ return 3750; }
        },
        effect(){ return loc('tech_pylon_camouflage_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fake_tech: {
        title: loc('tech_fake_tech'),
        desc: loc('tech_fake_tech'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 2250; },
            Knowledge(){ return 60000; }
        },
        effect(){ return loc('tech_fake_tech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    concealment: {
        title: loc('tech_concealment'),
        desc: loc('tech_concealment'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 3000; },
            Knowledge(){ return 185000; }
        },
        effect(){ return loc('tech_concealment_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    improved_concealment: {
        title: loc('tech_improved_concealment'),
        desc: loc('tech_improved_concealment'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return global.race['no_plasmid'] ? 6000 : 15000; },
            Knowledge(){ return 20000000; }
        },
        effect(){ return loc('tech_improved_concealment_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    outerplane_summon: {
        title: loc('tech_outerplane_summon'),
        desc: loc('tech_outerplane_summon'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return global.race['no_plasmid'] ? 12000 : 40000; },
            Knowledge(){ return 60000000; },
            Demonic_Essence(){ return 1; }
        },
        effect(){ return loc('tech_outerplane_summon_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dark_bomb: {
        title: loc('tech_dark_bomb'),
        desc: loc('tech_dark_bomb'),
        condition(){
            let affix = universeAffix();
            if (global.portal.hasOwnProperty('waygate') && global.portal.waygate.progress < 100 && global.stats.spire.hasOwnProperty(affix) && global.stats.spire[affix].hasOwnProperty('dlstr') && global.stats.spire[affix].dlstr > 0){
                return true;
            }
            return false;
        },
        cost: {
            Knowledge(){ return 65000000; },
            Soul_Gem(){ return 5000; },
            Blood_Stone(){ return 25; },
            Dark(){ return 1; },
            Supply(){ return 1000000; }
        },
        effect(){
            return loc('tech_dark_bomb_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                global.portal.waygate.progress = 100;
                global.portal.waygate.on = 0;
                global.tech['waygate'] = 3;
                global.resource.Demonic_Essence.display = true;
                global.resource.Demonic_Essence.amount = 1;
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_dark_bomb_flair'); }
    },
    bribe_sphinx: {
        title: loc('portal_sphinx_bribe'),
        desc: loc('portal_sphinx_bribe'),
        cost: {
            Soul_Gem(){ return 250; },
            Supply(){ return 500000; }
        },
        effect(){
            return loc('tech_bribe_sphinx_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Codex.display = true;
                global.resource.Codex.amount = 1;
                messageQueue(loc('tech_bribe_sphinx_msg'),'info',false,['progress','hell']);
                return true;
            }
            return false;
        }
    },
    alien_biotech: {
        title: loc('tech_alien_biotech'),
        desc: loc('tech_alien_biotech'),
        cost: {
            Knowledge(){ return 2400000; },
            Orichalcum(){ return 125000; },
            Cipher(){ return 15000; }
        },
        effect(){ return loc(global.race['orbit_decayed'] ? 'tech_alien_biotech_effect_alt' : 'tech_alien_biotech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    zero_g_lab: {
        title: loc('tech_zero_g_lab'),
        desc: loc('tech_zero_g_lab'),
        cost: {
            Knowledge(){ return 900000; }
        },
        effect: loc('tech_zero_g_lab_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.zero_g_lab);
                return true;
            }
            return false;
        }
    },
    operating_base: {
        title: loc('tech_operating_base'),
        desc: loc('tech_operating_base'),
        cost: {
            Knowledge(){ return 1400000; }
        },
        effect(){ return loc('tech_operating_base_effect',[planetName().enceladus]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.operating_base);
                return true;
            }
            return false;
        }
    },
    munitions_depot: {
        title: loc('tech_munitions_depot'),
        desc: loc('tech_munitions_depot'),
        cost: {
            Knowledge(){ return 1500000; }
        },
        effect(){ return loc('tech_munitions_depot_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.munitions_depot);
                return true;
            }
            return false;
        }
    },
    fob: {
        title: loc('tech_fob'),
        desc: loc('tech_fob'),
        cost: {
            Knowledge(){ return 1450000; }
        },
        effect(){ return loc('tech_fob_effect',[planetName().triton]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_triton.fob);
                initStruct(actions.space.spc_triton.lander);
                initStruct(actions.space.spc_triton.crashed_ship);
                return true;
            }
            return false;
        }
    },
    bac_tanks_tp: {
        title: loc('tech_bac_tanks'),
        desc: loc('tech_bac_tanks_desc'),
        cost: {
            Knowledge(){ return 1750000; }
        },
        effect: loc('tech_bac_tanks_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    medkit: {
        title: loc('tech_medkit'),
        desc: loc('tech_medkit'),
        cost: {
            Knowledge(){ return 2250000; },
            Quantium(){ return 250000; },
            Cipher(){ return 8000; }
        },
        effect: loc('tech_medkit_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    sam_site: {
        title: loc('tech_sam_site'),
        desc: loc('tech_sam_site'),
        cost: {
            Knowledge(){ return 1475000; }
        },
        effect(){ return loc('tech_sam_site_effect',[planetName().titan]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.sam);
                return true;
            }
            return false;
        }
    },
    data_cracker: {
        title: loc('tech_data_cracker'),
        desc: loc('tech_data_cracker'),
        cost: {
            Knowledge(){ return 2750000; },
            Cipher(){ return 25000; }
        },
        effect(){ return loc('tech_data_cracker_effect',[global.resource.Cipher.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.decoder);
                return true;
            }
            return false;
        }
    },
    ai_core_tp: {
        title: loc('tech_ai_core'),
        desc: loc('tech_ai_core'),
        cost: {
            Knowledge(){ return 3000000; },
            Cipher(){ return 100000; },
        },
        effect: loc('tech_ai_core_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.ai_core);
                return true;
            }
            return false;
        }
    },
    ai_optimizations: {
        title: loc('tech_ai_optimizations'),
        desc: loc('tech_ai_optimizations'),
        cost: {
            Knowledge(){ return 3750000; },
            Cipher(){ return 75000; }
        },
        effect: loc('tech_ai_optimizations_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
    },
    synthetic_life: {
        title: loc('tech_synthetic_life'),
        desc: loc('tech_synthetic_life'),
        cost: {
            Knowledge(){ return 4000000; },
            Cipher(){ return 75000; }
        },
        effect: loc('tech_synthetic_life_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.ai_colonist);
                return true;
            }
            return false;
        },
    },
    protocol66: {
        title: loc('tech_protocol66'),
        desc: loc('tech_protocol66'),
        cost: {
            Knowledge(){ return 5000000; }
        },
        effect: loc('tech_protocol66_effect'),
        action(){
            if (checkAffordable($(this)[0])){
                return true;
            }
            return false;
        },
        flair: loc('tech_protocol66_flair'),
    },
    protocol66a: {
        title: loc('tech_protocol66'),
        desc: loc('tech_protocol66'),
        wiki: false,
        cost: {
            Knowledge(){ return 5000000; }
        },
        effect(){
            let gains = calcPrestige('ai');
            let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
            let prestige = `<div class="has-text-caution">${loc('tech_protocol66a_effect_gains',[gains.plasmid, plasmidType, gains.phage, gains.cores])}</div>`;
            return `<div>${loc('tech_protocol66a_effect')}</div>${prestige}`;
        },
        action(){
            if (payCosts($(this)[0])){
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                clearPopper();
                $(`body`).append(`<div id="aiAppoc"><div></div></div>`);
                $(`#aiAppoc`).addClass('noise-wrapper');
                $(`#aiAppoc > div`).addClass('noise');

                setTimeout(function(){
                    $(`body`).append(`<div id="deadAirTop" class="signal-lost-top"></div>`);
                    $(`body`).append(`<div id="deadAirBottom" class="signal-lost-bottom"></div>`);

                    $('#deadAirTop').animate({
                        height: "50%",
                        opacity: 1
                    }, 400);

                    $('#deadAirBottom').animate({
                        height: "50%",
                        opacity: 1
                    }, 400);
                }, 3000);
                setTimeout(function(){
                    aiApocalypse();
                }, 4000);
                return true;
            }
            return false;
        },
        flair: loc('tech_protocol66a_flair'),
    },
};
