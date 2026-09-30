import { global } from './vars.js';
import { loc } from './locale.js';
import { vBind, messageQueue } from './functions.js';
import { unlockAchieve, alevel } from './achieve.js';
import { payCosts, updateQueueNames, actions, initStruct } from './actions.js';
import { races, renderPsychicPowers } from './races.js';
import { loadFoundry } from './jobs.js';
import { planetName } from './space.js';
import { defineIndustry } from './industry.js';
import { defineGovernor } from './governor.js';

// Bagian 4 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export const techsPart4 = {
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
    titanium_shovel: {
        title: loc('tech_titanium_shovel'),
        desc: loc('tech_titanium_shovel'),
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 38000; },
            Titanium(){ return 350; }
        },
        effect: loc('tech_titanium_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alloy_shovel: {
        title: loc('tech_alloy_shovel'),
        desc: loc('tech_alloy_shovel'),
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 67500; },
            Alloy(){ return 750; }
        },
        effect: loc('tech_alloy_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mythril_shovel: {
        title: loc('tech_mythril_shovel'),
        desc: loc('tech_mythril_shovel'),
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 160000; },
            Mythril(){ return 880; }
        },
        effect: loc('tech_mythril_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_shovel: {
        title: loc('tech_adamantite_shovel'),
        desc: loc('tech_adamantite_shovel'),
        condition(){
            return global.race['kindling_kindred'] || global.race['smoldering'] ? false : global.race.species === 'wendigo' ? true : global.race['soul_eater'] ? false : true;
        },
        cost: {
            Knowledge(){ return 525000; },
            Adamantite(){ return 10000; }
        },
        effect: loc('tech_adamantite_shovel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    stone_axe: {
        title(){ return loc('tech_stone_axe'); },
        desc(){ return loc('tech_stone_axe_desc'); },
        cost: {
            Knowledge(){ return 45; },
            Lumber(){ return 20; },
            Stone(){ return 20; }
        },
        effect(){
            if (global.race['living_tool']){ return loc(`tech_basic_livingtools`); }
            return global.race['sappy'] ? loc('tech_amber_axe_effect') : loc('tech_stone_axe_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                global.civic.lumberjack.display = true;
                initStruct(actions.city.lumber_yard);
                return true;
            }
            return false;
        }
    },
    copper_axes: {
        title: loc('tech_copper_axes'),
        desc: loc('tech_copper_axes_desc'),
        cost: {
            Knowledge(){ return 540; },
            Copper(){ return 25; }
        },
        effect: loc('tech_copper_axes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_saw: {
        title: loc('tech_iron_saw'),
        desc: loc('tech_iron_saw_desc'),
        cost: {
            Knowledge(){ return 3375; },
            Iron(){ return 400; }
        },
        effect: loc('tech_iron_saw_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.sawmill);
                return true;
            }
            return false;
        }
    },
    steel_saw: {
        title: loc('tech_steel_saw'),
        desc: loc('tech_steel_saw_desc'),
        cost: {
            Knowledge(){ return 10800; },
            Steel(){ return 400; }
        },
        effect: loc('tech_steel_saw_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_axes: {
        title: loc('tech_iron_axes'),
        desc: loc('tech_iron_axes_desc'),
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1350 : 2700; },
            Iron(){ return 250; }
        },
        effect: loc('tech_iron_axes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_axes: {
        title: loc('tech_steel_axes'),
        desc: loc('tech_steel_axes_desc'),
        cost: {
            Knowledge(){ return 9000; },
            Steel(){ return 250; }
        },
        effect: loc('tech_steel_axes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titanium_axes: {
        title: loc('tech_titanium_axes'),
        desc: loc('tech_titanium_axes_desc'),
        cost: {
            Knowledge(){ return 38000; },
            Titanium(){ return 350; }
        },
        effect: loc('tech_titanium_axes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    chainsaws: {
        title: loc('tech_chainsaws'),
        desc: loc('tech_chainsaws_desc'),
        cost: {
            Knowledge(){ return 560000; },
            Oil(){ return 10000; },
            Adamantite(){ return 2000; },
        },
        effect: loc('tech_chainsaws_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return `<div>${loc('tech_chainsaws_flair1')}</div><div>${loc('tech_chainsaws_flair2')}</div>`; }
    },
    copper_sledgehammer: {
        title: loc('tech_copper_sledgehammer'),
        desc: loc('tech_copper_sledgehammer_desc'),
        cost: {
            Knowledge(){ return 540; },
            Copper(){ return 25; }
        },
        effect: loc('tech_copper_sledgehammer_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_sledgehammer: {
        title: loc('tech_iron_sledgehammer'),
        desc: loc('tech_iron_sledgehammer_desc'),
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1350 : 2700; },
            Iron(){ return 250; }
        },
        effect: loc('tech_iron_sledgehammer_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_sledgehammer: {
        title: loc('tech_steel_sledgehammer'),
        desc: loc('tech_steel_sledgehammer_desc'),
        cost: {
            Knowledge(){ return 7200; },
            Steel(){ return 250; }
        },
        effect: loc('tech_steel_sledgehammer_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titanium_sledgehammer: {
        title: loc('tech_titanium_sledgehammer'),
        desc: loc('tech_titanium_sledgehammer_desc'),
        cost: {
            Knowledge(){ return 40000; },
            Titanium(){ return 400; }
        },
        effect: loc('tech_titanium_sledgehammer_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    copper_pickaxe: {
        title: loc('tech_copper_pickaxe'),
        desc: loc('tech_copper_pickaxe_desc'),
        cost: {
            Knowledge(){ return 675; },
            Copper(){ return 25; }
        },
        effect: loc('tech_copper_pickaxe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_pickaxe: {
        title: loc('tech_iron_pickaxe'),
        desc: loc('tech_iron_pickaxe_desc'),
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1600 : 3200; },
            Iron(){ return 250; }
        },
        effect: loc('tech_iron_pickaxe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_pickaxe: {
        title: loc('tech_steel_pickaxe'),
        desc: loc('tech_steel_pickaxe_desc'),
        cost: {
            Knowledge(){ return 9000; },
            Steel(){ return 250; }
        },
        effect: loc('tech_steel_pickaxe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    jackhammer: {
        title: loc('tech_jackhammer'),
        desc: loc('tech_jackhammer_desc'),
        cost: {
            Knowledge(){ return 22500; },
            Copper(){ return 5000; }
        },
        effect: loc('tech_jackhammer_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    jackhammer_mk2: {
        title: loc('tech_jackhammer_mk2'),
        desc: loc('tech_jackhammer_mk2'),
        cost: {
            Knowledge(){ return 67500; },
            Titanium(){ return 2000; },
            Alloy(){ return 500; }
        },
        effect: loc('tech_jackhammer_mk2_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_hammer: {
        title(){ return loc('tech_improved_jackhammer',[global.resource.Adamantite.name]); },
        desc(){ return loc('tech_improved_jackhammer',[global.resource.Adamantite.name]); },
        cost: {
            Knowledge(){ return 535000; },
            Adamantite(){ return 12500; }
        },
        effect(){ return loc('tech_improved_jackhammer_effect',[global.resource.Adamantite.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elysanite_hammer: {
        title(){ return loc('tech_improved_jackhammer',[global.resource.Elysanite.name]); },
        desc(){ return loc('tech_improved_jackhammer',[global.resource.Elysanite.name]); },
        cost: {
            Knowledge(){ return 97500000; },
            Omniscience(){ return 21500; },
            Elysanite(){ return 35000000; }
        },
        effect(){ return loc('tech_improved_jackhammer_effect',[global.resource.Elysanite.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    copper_hoe: {
        title: loc('tech_copper_hoe'),
        desc: loc('tech_copper_hoe_desc'),
        cost: {
            Knowledge(){ return 720; },
            Copper(){ return 50; }
        },
        effect: loc('tech_copper_hoe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_hoe: {
        title: loc('tech_iron_hoe'),
        desc: loc('tech_iron_hoe_desc'),
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1800 : 3600; },
            Iron(){ return 500; }
        },
        effect: loc('tech_iron_hoe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_hoe: {
        title: loc('tech_steel_hoe'),
        desc: loc('tech_steel_hoe_desc'),
        cost: {
            Knowledge(){ return 12600; },
            Steel(){ return 500; }
        },
        effect: loc('tech_steel_hoe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titanium_hoe: {
        title: loc('tech_titanium_hoe'),
        desc: loc('tech_titanium_hoe_desc'),
        cost: {
            Knowledge(){ return 44000; },
            Titanium(){ return 500; }
        },
        effect: loc('tech_titanium_hoe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_hoe: {
        title: loc('tech_adamantite_hoe'),
        desc: loc('tech_adamantite_hoe_desc'),
        cost: {
            Knowledge(){ return 530000; },
            Adamantite(){ return 1000; }
        },
        effect: loc('tech_adamantite_hoe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cyber_limbs: {
        title: loc('tech_cyber_limbs'),
        desc: loc('tech_cyber_limbs'),
        cost: {
            Knowledge(){ return 27000000; },
        },
        effect: loc('tech_cyber_limbs_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    slave_pens: {
        title(){ return loc('city_slave_housing',[global.resource.Slave.name]); },
        desc(){ return loc('city_slave_housing',[global.resource.Slave.name]); },
        cost: {
            Knowledge(){ return 150; }
        },
        effect(){
            return loc('tech_slave_pens_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.slave_pen);
                global.resource.Slave.amount = 0;
                return true;
            }
            return false;
        }
    },
    slave_market: {
        title(){ return loc('city_slaver_market',[global.resource.Slave.name]); },
        desc(){ return loc('city_slaver_market',[global.resource.Slave.name]); },
        cost: {
            Knowledge(){ return 8000; }
        },
        effect(){
            return loc('tech_slave_market_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    ceremonial_dagger: {
        title: loc('tech_ceremonial_dagger'),
        desc: loc('tech_ceremonial_dagger'),
        cost: {
            Knowledge(){ return 60; }
        },
        effect: loc('tech_ceremonial_dagger_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    last_rites: {
        title: loc('tech_last_rites'),
        desc: loc('tech_last_rites'),
        cost: {
            Knowledge(){ return 1000; }
        },
        effect: loc('tech_last_rites_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ancient_infusion: {
        title: loc('tech_ancient_infusion'),
        desc: loc('tech_ancient_infusion'),
        cost: {
            Knowledge(){ return 182000; }
        },
        effect: loc('tech_ancient_infusion_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    garrison: {
        title: loc('tech_garrison'),
        desc: loc('tech_garrison_desc'),
        cost: {
            Knowledge(){ return 70; }
        },
        effect: loc('tech_garrison_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.garrison);
                return true;
            }
            return false;
        }
    },
    mercs: {
        title: loc('tech_mercs'),
        desc: loc('tech_mercs_desc'),
        cost: {
            Money(){ return 10000 },
            Knowledge(){ return 4500; }
        },
        effect: loc('tech_mercs_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.garrison['mercs'] = true;
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    signing_bonus: {
        title: loc('tech_signing_bonus'),
        desc: loc('tech_signing_bonus_desc'),
        cost: {
            Money(){ return 50000 },
            Knowledge(){ return 32000; }
        },
        effect: loc('tech_signing_bonus_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    hospital: {
        title: loc('tech_hospital'),
        desc: loc('tech_hospital'),
        cost: {
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_hospital_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.hospital);
                return true;
            }
            return false;
        }
    },
    bac_tanks: {
        title(){ return global.race['artifical'] ? loc('tech_repair_subroutines') : loc('tech_bac_tanks'); },
        desc(){ return global.race['artifical'] ? loc('tech_repair_subroutines') : loc('tech_bac_tanks_desc'); },
        cost: {
            Knowledge(){ return 600000; },
            Infernite(){ return 250; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_repair_subroutines_effect') : loc('tech_bac_tanks_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    boot_camp: {
        title: loc('tech_boot_camp'),
        desc: loc('tech_boot_camp_desc'),
        cost: {
            Knowledge(){ return 8000; }
        },
        effect: loc('tech_boot_camp_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.boot_camp);
                return true;
            }
            return false;
        }
    },
    vr_training: {
        title: loc('tech_vr_training'),
        desc: loc('tech_vr_training'),
        cost: {
            Knowledge(){ return 625000; }
        },
        effect(){ return loc('tech_vr_training_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bows: {
        title(){ return global.race['blubber'] ? loc('tech_harpoon') : loc('tech_bows'); },
        desc: loc('tech_bows_desc'),
        cost: {
            Knowledge(){ return 225; },
            Lumber(){ return 250; }
        },
        effect(){ return global.race['blubber'] ? loc('tech_harpoon_effect') : loc('tech_bows_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    flintlock_rifle: {
        title(){ return global.race.universe === 'magic' ? loc('tech_magic_arrow') : loc('tech_flintlock_rifle'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magic_arrow') : loc('tech_flintlock_rifle'); },
        cost: {
            Knowledge(){ return 5400; },
            Coal(){ return global.race.universe === 'magic' ? 0 : 750; },
            Mana(){ return global.race.universe === 'magic' ? 100 : 0; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magic_arrow_effect') : loc('tech_flintlock_rifle_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    machine_gun: {
        title(){ return global.race.universe === 'magic' ? loc('tech_fire_mage') : loc('tech_machine_gun'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_fire_mage') : loc('tech_machine_gun'); },
        cost: {
            Mana(){ return global.race.universe === 'magic' ? 300 : 0; },
            Knowledge(){ return 33750; },
            Oil(){ return 1500; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_fire_mage_effect') : loc('tech_machine_gun_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    bunk_beds: {
        title: loc('tech_bunk_beds'),
        desc: loc('tech_bunk_beds'),
        cost: {
            Knowledge(){ return 76500; },
            Furs(){ return 25000; },
            Alloy(){ return 3000; }
        },
        effect: loc('tech_bunk_beds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    rail_guns: {
        title(){ return global.race.universe === 'magic' ? loc('tech_lightning_caster') : loc('tech_rail_guns'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_lightning_caster') : loc('tech_rail_guns'); },
        cost: {
            Mana(){ return global.race.universe === 'magic' ? 450 : 0; },
            Knowledge(){ return 200000; },
            Iridium(){ return 2500; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_lightning_caster_effect') : loc('tech_rail_guns_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    laser_rifles: {
        title(){ return global.race.universe === 'magic' ? loc('tech_mana_rifles') : loc('tech_laser_rifles'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_mana_rifles') : loc('tech_laser_rifles'); },
        cost: {
            Knowledge(){ return 325000; },
            Elerium(){ return 250; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_mana_rifles_effect') : loc('tech_laser_rifles_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.race.species === 'sharkin'){
                    unlockAchieve('laser_shark');
                }
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    plasma_rifles: {
        title(){ return global.race.universe === 'magic' ? loc('tech_focused_rifles') : loc('tech_plasma_rifles'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_focused_rifles') : loc('tech_plasma_rifles'); },
        cost: {
            Knowledge(){ return 780000; },
            Elerium(){ return global.race['truepath'] ? 1000 : 500; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_focused_rifles_effect') : loc('tech_plasma_rifles_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    disruptor_rifles: {
        title(){ return global.race.universe === 'magic' ? loc('tech_magic_missile') : loc('tech_disruptor_rifles'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magic_missile') : loc('tech_disruptor_rifles'); },
        cost: {
            Knowledge(){ return 1000000; },
            Infernite(){ return 1000; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magic_missile_effect') : loc('tech_disruptor_rifles_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    gauss_rifles: {
        title(){ return global.race.universe === 'magic' ? loc('tech_magicword_kill') : loc('tech_gauss_rifles'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magicword_kill') : loc('tech_gauss_rifles'); },
        cost: {
            Knowledge(){ return 9500000; },
            Bolognium(){ return 100000; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magicword_kill_effect') : loc('tech_gauss_rifles_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    cyborg_soldiers: {
        title: loc('tech_cyborg_soldiers'),
        desc: loc('tech_cyborg_soldiers'),
        cost: {
            Knowledge(){ return 26000000; },
            Adamantite(){ return 8000000; },
            Bolognium(){ return 4000000; },
            Orichalcum(){ return 6000000; }
        },
        effect: loc('tech_cyborg_soldiers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    ethereal_weapons: {
        title: loc('tech_ethereal_weapons'),
        desc: loc('tech_ethereal_weapons'),
        cost: {
            Knowledge(){ return 72500000; },
            Asphodel_Powder(){ return 7777; },
            Soul_Gem(){ return 100; },
        },
        effect: loc('tech_ethereal_weapons_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#garrison`},'update');
            vBind({el: `#c_garrison`},'update');
        }
    },
    space_marines: {
        title: loc('tech_space_marines'),
        desc: loc('tech_space_marines_desc'),
        cost: {
            Knowledge(){ return 210000; }
        },
        effect(){ return `<div>${loc('tech_space_marines_effect',[planetName().red])}</div>` },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.space_barracks);
                return true;
            }
            return false;
        },
        flair: loc('tech_space_marines_flair')
    },
    hammocks: {
        title: loc('tech_hammocks'),
        desc: loc('tech_hammocks'),
        cost: {
            Knowledge(){ return 8900000; },
            Nanoweave(){ return 30000; },
        },
        effect(){ return loc('tech_hammocks_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cruiser: {
        title: loc('tech_cruiser'),
        desc: loc('tech_cruiser'),
        cost: {
            Knowledge(){ return 860000; },
        },
        effect: loc('tech_cruiser_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.cruiser);
                return true;
            }
            return false;
        }
    },
    armor: {
        title: loc('tech_armor'),
        desc: loc('tech_armor_desc'),
        cost: {
            Money(){ return 250; },
            Knowledge(){ return 225; },
            Furs(){ return 250; }
        },
        effect: loc('tech_armor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    plate_armor: {
        title: loc('tech_plate_armor'),
        desc: loc('tech_plate_armor_desc'),
        cost: {
            Knowledge(){ return 3400; },
            Iron(){ return 600; },
        },
        effect: loc('tech_plate_armor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    kevlar: {
        title: loc('tech_kevlar'),
        desc: loc('tech_kevlar_desc'),
        cost: {
            Knowledge(){ return 86000; },
            Polymer(){ return 750; },
        },
        effect: loc('tech_kevlar_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    nanoweave_vest: {
        title: loc('tech_nanoweave_vest'),
        desc: loc('tech_nanoweave_vest'),
        cost: {
            Knowledge(){ return 9250000; },
            Nanoweave(){ return 75000; },
        },
        effect: loc('tech_nanoweave_vest_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    laser_turret: {
        title: loc('tech_laser_turret'),
        desc: loc('tech_laser_turret'),
        cost: {
            Knowledge(){ return 600000; },
            Elerium(){ return 100; }
        },
        effect(){ return `<div>${loc('tech_laser_turret_effect1')}</div><div class="has-text-special">${loc('tech_laser_turret_effect2')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#fort`},'update');
            updateQueueNames(false, ['portal-turret']);
        }
    },
    plasma_turret: {
        title: loc('tech_plasma_turret'),
        desc: loc('tech_plasma_turret'),
        cost: {
            Knowledge(){ return 760000; },
            Elerium(){ return 350; }
        },
        effect(){ return `<div>${loc('tech_plasma_turret_effect')}</div><div class="has-text-special">${loc('tech_laser_turret_effect2')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: `#fort`},'update');
            updateQueueNames(false, ['portal-turret']);
        }
    },
    black_powder: {
        title(){ return global.race.universe === 'magic' ? loc('tech_magic_powder') : loc('tech_black_powder'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magic_powder_desc') : loc('tech_black_powder_desc'); },
        cost: {
            Knowledge(){ return 4500; },
            Mana(){ return global.race.universe === 'magic' ? 100 : 0; },
            Crystal(){ return global.race.universe === 'magic' ? 250 : 0; },
            Coal(){ return global.race.universe === 'magic' ? 300 : 500; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magic_powder_effect') : loc('tech_black_powder_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dynamite: {
        title: loc('tech_dynamite'),
        desc: loc('tech_dynamite'),
        cost: {
            Knowledge(){ return 4800; },
            Coal(){ return 750; }
        },
        effect: loc('tech_dynamite_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    anfo: {
        title: loc('tech_anfo'),
        desc: loc('tech_anfo'),
        cost: {
            Knowledge(){ return 42000; },
            Oil(){ return 2500; }
        },
        effect: loc('tech_anfo_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    super_tnt: {
        title: loc('tech_super_tnt'),
        desc: loc('tech_super_tnt'),
        cost: {
            Knowledge(){ return 85000000; },
            Omniscience(){ return 14500; },
            Asphodel_Powder(){ return 66777; }
        },
        effect(){ return loc('tech_super_tnt_effect',[global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mad: {
        title: loc('tech_mad'),
        desc: loc('tech_mad_desc'),
        condition(){
            if (global.race['sludge'] || global.race['ultra_sludge']){ return false; }
            return global.race['truepath'] ? (global.tech['world_control'] ? true : false ) : true;
        },
        cost: {
            Knowledge(){ return 120000; },
            Oil(){ return global.city.ptrait.includes('dense') ? 10000 : 8500; },
            Uranium(){ return 1250; }
        },
        effect(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('tech_mad_effect_easter') : loc('tech_mad_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt'])){
                    messageQueue(loc('tech_mad_info_easter'),'info',false,['progress']);
                }
                else {
                    messageQueue(loc('tech_mad_info'),'info',false,['progress']);
                }
                global.civic.mad.display = true;
                return true;
            }
            return false;
        }
    },
    cement: {
        title: loc('tech_cement'),
        desc: loc('tech_cement_desc'),
        cost: {
            Knowledge(){ return 500; }
        },
        effect: loc('tech_cement_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.cement_plant);
                return true;
            }
            return false;
        }
    },
};
