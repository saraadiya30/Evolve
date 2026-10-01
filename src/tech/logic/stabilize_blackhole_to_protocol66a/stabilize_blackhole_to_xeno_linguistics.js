import { loc } from '../../../core/locale.js';
import { payCosts } from '../../../actions/core/action_costs.js';
import { initStruct } from '../../../actions/core/structure_ui.js';
import { actions } from '../../../core/registries.js';
import { global } from '../../../core/vars.js';
import { atomic_mass } from '../../../resources/resources.js';
import { unlockAchieve } from '../../../achievements/achievement_logic.js';
import { universeAffix } from '../../../functions/universe_utils.js';
import { arpa } from '../../../arpa/arpa_projects.js';
import { races } from '../../../core/registries.js';
import { drawHellObservations } from '../../../portal/mech/mech_analysis.js';

// Bagian dari techsPart6 (20 entri: stabilize_blackhole .. xeno_linguistics), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart6Part1 = {
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
};
