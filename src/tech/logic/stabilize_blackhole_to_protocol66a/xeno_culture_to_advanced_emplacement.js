import { loc } from '../../../core/locale.js';
import { races, renderPsychicPowers } from '../../../races/races.js';
import { global } from '../../../core/vars.js';
import { payCosts, initStruct, actions } from '../../../actions/actions.js';
import { messageQueue } from '../../../functions/functions.js';
import { renderSpace } from '../../../space/space.js';

// Bagian dari techsPart6 (26 entri: xeno_culture .. advanced_emplacement), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart6Part2 = {
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
};
