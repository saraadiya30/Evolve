import { loc } from './locale.js';
import { payCosts, initStruct, actions } from './actions.js';
import { global } from './vars.js';
import { messageQueue } from './functions.js';
import { defineIndustry } from './industry.js';
import { renderPsychicPowers, races } from './races.js';
import { loadFoundry } from './jobs.js';
import { alevel } from './achieve.js';

// Bagian dari techsPart4 (22 entri: mine_conveyor .. steel_shovel), dipisah dari techs_part4.js. Urutan entri sama persis.
export const techsPart4Part1 = {
    mine_conveyor: {
        title: loc('tech_mine_conveyor'),
        desc: loc('tech_mine_conveyor'),
        cost: {
            Knowledge(){ return 16200; },
            Copper(){ return 2250; },
            Steel(){ return 1750; }
        },
        effect: loc('tech_mine_conveyor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    oil_well: {
        title(){ return global.race['blubber'] ? loc('tech_oil_refinery') : loc('tech_oil_well'); },
        desc(){ return global.race['blubber'] ? loc('tech_oil_refinery') : loc('tech_oil_well'); },
        cost: {
            Knowledge(){ return 27000; }
        },
        effect(){ return global.race['blubber'] ? loc('tech_oil_refinery_effect') : loc('tech_oil_well_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.oil_well);
                return true;
            }
            return false;
        }
    },
    oil_depot: {
        title: loc('tech_oil_depot'),
        desc: loc('tech_oil_depot'),
        cost: {
            Knowledge(){ return 32000; }
        },
        effect: loc('tech_oil_depot_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.oil_depot);
                return true;
            }
            return false;
        }
    },
    oil_power: {
        title(){
            return global.race['environmentalist'] ? loc('city_wind_power') : loc('tech_oil_power');
        },
        desc(){
            return global.race['environmentalist'] ? loc('city_wind_power') : loc('tech_oil_power');
        },
        cost: {
            Knowledge(){ return 44000; }
        },
        effect(){
            return global.race['environmentalist'] ? loc('tech_wind_power_effect') : loc('tech_oil_power_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.oil_power);
                return true;
            }
            return false;
        }
    },
    titanium_drills: {
        title: loc('tech_titanium_drills'),
        desc: loc('tech_titanium_drills'),
        cost: {
            Knowledge(){ return 54000; },
            Titanium(){ return 3500; }
        },
        effect: loc('tech_titanium_drills_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alloy_drills: {
        title: loc('tech_alloy_drills'),
        desc: loc('tech_alloy_drills'),
        cost: {
            Knowledge(){ return 77000; },
            Alloy(){ return 1000; }
        },
        effect: loc('tech_alloy_drills_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fracking: {
        title: loc('tech_fracking'),
        desc: loc('tech_fracking'),
        cost: {
            Knowledge(){ return 132000; }
        },
        effect: loc('tech_fracking_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mythril_drills: {
        title: loc('tech_mythril_drills'),
        desc: loc('tech_mythril_drills'),
        cost: {
            Knowledge(){ return 165000; },
            Mythril(){ return 100; }
        },
        effect: loc('tech_mythril_drills_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mass_driver: {
        title: loc('tech_mass_driver'),
        desc: loc('tech_mass_driver'),
        cost: {
            Knowledge(){ return 160000; }
        },
        effect: loc('tech_mass_driver_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.mass_driver);
                return true;
            }
            return false;
        }
    },
    orichalcum_driver: {
        title: loc('tech_orichalcum_driver'),
        desc: loc('tech_orichalcum_driver'),
        cost: {
            Knowledge(){ return 14000000; },
            Orichalcum(){ return 400000; }
        },
        effect(){ return loc('tech_orichalcum_driver_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.terraformer);
                return true;
            }
            return false;
        }
    },
    polymer: {
        title: loc('tech_polymer'),
        desc: loc('tech_polymer'),
        cost: {
            Knowledge(){ return 80000; },
            Oil(){ return 5000; },
            Alloy(){ return 450; }
        },
        effect: loc('tech_polymer_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Polymer.display = true;
                messageQueue(loc('tech_polymer_avail'),'info',false,['progress']);
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            renderPsychicPowers();
        }
    },
    fluidized_bed_reactor: {
        title: loc('tech_fluidized_bed_reactor'),
        desc: loc('tech_fluidized_bed_reactor'),
        cost: {
            Knowledge(){ return 99000; }
        },
        effect: loc('tech_fluidized_bed_reactor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    synthetic_fur: {
        title(){ return global.race['evil'] ? loc('tech_faux_leather') : loc('tech_synthetic_fur'); },
        desc(){ return global.race['evil'] ? loc('tech_faux_leather') : loc('tech_synthetic_fur'); },
        condition(){ return global.resource.Furs.display; },
        cost: {
            Knowledge(){ return 100000; },
            Polymer(){ return 2500; }
        },
        effect(){ return global.race['evil'] ? loc('tech_faux_leather_effect') : loc('tech_synthetic_fur_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    nanoweave: {
        title: loc('tech_nanoweave'),
        desc: loc('tech_nanoweave'),
        cost: {
            Knowledge(){ return 8500000; },
            Nano_Tube(){ return 5000000; },
            Vitreloy(){ return 250000; },
        },
        effect: loc('tech_nanoweave_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Nanoweave.display = true;
                messageQueue(loc('tech_nanoweave_avail'),'info',false,['progress']);
                loadFoundry();
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    stanene: {
        title: loc('tech_stanene'),
        desc: loc('tech_stanene'),
        cost: {
            Knowledge(){ return 590000; },
            Aluminium(){ return 500000; },
            Infernite(){ return 1000; }
        },
        effect: loc('tech_stanene_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Stanene.display = true;
                messageQueue(loc('tech_stanene_avail'),'info',false,['progress']);
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            renderPsychicPowers();
        }
    },
    nano_tubes: {
        title: loc('tech_nano_tubes'),
        desc: loc('tech_nano_tubes'),
        cost: {
            Knowledge(){ return 375000; },
            Coal(){ return 100000; },
            Neutronium(){ return 1000; }
        },
        effect: loc('tech_nano_tubes_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Nano_Tube.display = true;
                messageQueue(loc('tech_nano_tubes_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            renderPsychicPowers();
        }
    },
    scarletite: {
        title: loc('tech_scarletite'),
        desc: loc('tech_scarletite'),
        cost: {
            Knowledge(){ return 26750000; },
            Iron(){ return 100000000; },
            Adamantite(){ return 15000000; },
            Orichalcum(){ return 8000000; }
        },
        effect: loc('tech_scarletite_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Scarletite.display = true;
                initStruct(actions.portal.prtl_ruins.hell_forge);
                messageQueue(loc('tech_scarletite_avail'),'info',false,['progress']);
                loadFoundry();
                if (global.race.universe !== 'micro' && !global.pillars[global.race.species]){
                    global.tech['fusable'] = 1;
                }
                else {
                    if (global.race.universe !== 'micro'){
                        let rank = alevel();
                        if (rank > global.pillars[global.race.species]){
                            global.pillars[global.race.species] = rank;
                        }
                    }
                    global.tech['pillars'] = 2;
                }
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    pillars: {
        title: loc('tech_pillars'),
        desc: loc('tech_pillars'),
        cost: {
            Knowledge(){ return 30000000; }
        },
        effect: loc('tech_pillars_effect'),
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_pillars_msg',[races[global.race.species].entity]),'info',false,['progress','hell']);
                return true;
            }
            return false;
        }
    },
    reclaimer: {
        title: loc('tech_reclaimer'),
        desc: loc('tech_reclaimer_desc'),
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 45; },
            Lumber(){ return 20; },
            Stone(){ return 20; }
        },
        effect: loc('tech_reclaimer_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.lumberjack.name = loc('job_reclaimer');
                global.civic.lumberjack.display = true;
                initStruct(actions.city.graveyard);
                return true;
            }
            return false;
        }
    },
    shovel: {
        title: loc('tech_shovel'),
        desc: loc('tech_shovel'),
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 540; },
            Copper(){ return 25; }
        },
        effect: loc('tech_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_shovel: {
        title: loc('tech_iron_shovel'),
        desc: loc('tech_iron_shovel'),
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 2700; },
            Iron(){ return 250; }
        },
        effect: loc('tech_iron_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_shovel: {
        title: loc('tech_steel_shovel'),
        desc: loc('tech_steel_shovel'),
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 9000; },
            Steel(){ return 250; }
        },
        effect: loc('tech_steel_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
};
