import { loc } from './locale.js';
import { global } from './vars.js';
import { payCosts, initStruct, actions, housingLabel } from './actions.js';
import { messageQueue } from './functions.js';
import { drawResourceTab } from './resources.js';

// Bagian dari techsPart1 (24 entri: club .. torture), dipisah dari techs_part1.js. Urutan entri sama persis.
export const techsPart1Part1 = {
    club: {
        title: loc('tech_club'),
        desc: loc('tech_club_desc'),
        cost: {
            Lumber(){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : 5; },
            Stone(){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 5 : 0; }
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Food.display = true;
                return true;
            }
            return false;
        }
    },
    bone_tools: {
        title: loc('tech_bone_tools'),
        desc: loc('tech_bone_tools_desc'),
        condition(){
            return global.race['soul_eater'] && !global.race['evil'] ? false : true;
        },
        cost: {
            Food(){ return global.race['evil'] && !global.race['smoldering'] || global.race['fasting'] ? 0 : 10; },
            Lumber(){ return global.race['evil'] && !global.race['smoldering'] || global.race['fasting'] ? 10 : 0; }
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Stone.display = true;
                if (global.race['smoldering']){
                    global.resource.Chrysotile.display = true;
                }
                return true;
            }
            return false;
        }
    },
    wooden_tools: {
        title() {
            return global.race['kindling_kindred'] ? loc('tech_bone_tools') : loc('tech_wooden_tools');
        },
        desc() {
            return global.race['kindling_kindred'] ? loc('tech_bone_tools_desc') : loc('tech_wooden_tools_desc');
        },
        condition(){
            return global.race['soul_eater'] && !global.race['evil'] ? true : false;
        },
        cost: {
            Lumber(){ return 10; }
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Stone.display = true;
                if (global.race['smoldering']){
                    global.resource.Chrysotile.display = true;
                }
                return true;
            }
            return false;
        }
    },
    sundial: {
        title(){ return global.race['unfathomable'] ? loc('tech_moondial') : loc('tech_sundial'); },
        desc(){ return global.race['unfathomable'] ? loc('tech_moondial_desc') : loc('tech_sundial_desc'); },
        condition(){ return !global.race['gravity_well'] || (global.race['gravity_well'] && global.tech['transport']) ? true : false; },
        cost: {
            Lumber(){ return 8; },
            Stone(){ return 10; }
        },
        effect(){ return global.race['unfathomable'] ? loc('tech_moondial_effect') : loc('tech_sundial_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_sundial_msg'),'info',false,['progress']);
                global.resource.Knowledge.display = true;
                global.city.calendar.day++;
                if (global.race['infectious']){
                    global.civic.garrison.display = true;
                    global.settings.showCivic = true;
                    initStruct(actions.city.garrison);
                }
                if (global.race['banana'] && !global.race['terrifying']){
                    global.settings.showResources = true;
                    global.settings.showMarket = true;
                    global.resource.Money.display = true;
                    global.city.market.active = true;
                    global.tech['currency'] = 2;
                }
                if (global.race['calm']){
                    global.resource.Zen.display = true;
                    initStruct(actions.city.meditation);
                }
                return true;
            }
            return false;
        },
        post(){
            if (global.race['banana'] && !global.race['terrifying']){
                drawResourceTab('market');
            }
        }
    },
    wheel: {
        title(){ return loc('tech_wheel'); },
        desc(){ return loc('tech_wheel_desc'); },
        cost: {
            Lumber(){ return 50; },
            Stone(){ return 25; }
        },
        effect(){ return loc('tech_wheel_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.civic.teamster.display = true;
                return true;
            }
            return false;
        }
    },
    wagon: {
        title(){ return loc('tech_wagon'); },
        desc(){ return loc('tech_wagon'); },
        condition(){
            return global.tech['farm'] || global.tech['s_lodge'] || (global.tech['hunting'] && global.tech.hunting >= 2) || (global.race['soul_eater'] && global.race.species !== 'wendigo' && global.tech.housing >= 1 && global.tech.currency >= 1) ? true : false;
        },
        cost: {
            Knowledge(){ return 195; }
        },
        effect(){ return loc('tech_wagon_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steam_engine: {
        title(){ return loc('tech_steam_engine'); },
        desc(){ return loc('tech_steam_engine'); },
        cost: {
            Knowledge(){ return 14345; }
        },
        effect(){ return loc('tech_steam_engine_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    combustion_engine: {
        title(){ return loc('tech_combustion_engine'); },
        desc(){ return loc('tech_combustion_engine'); },
        cost: {
            Knowledge(){ return 46777; }
        },
        effect(){ return loc('tech_combustion_engine_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    hover_cart: {
        title(){ return loc('tech_hover_cart'); },
        desc(){ return loc('tech_hover_cart'); },
        cost: {
            Knowledge(){ return 284000; }
        },
        effect(){ return loc('tech_hover_cart_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    osha: {
        title(){ return loc('tech_osha'); },
        desc(){ return loc('tech_osha'); },
        cost: {
            Knowledge(){ return 28262; }
        },
        effect(){ return loc('tech_osha_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.civic.teamster.stress = 6;
                return true;
            }
            return false;
        }
    },
    blackmarket: {
        title(){ return loc('tech_blackmarket'); },
        desc(){ return loc('tech_blackmarket'); },
        cost: {
            Knowledge(){ return 40666; }
        },
        effect(){ return loc('tech_blackmarket_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pipelines: {
        title(){ return loc('tech_pipelines'); },
        desc(){ return loc('tech_pipelines'); },
        cost: {
            Knowledge(){ return 95000; }
        },
        effect(){ return loc('tech_pipelines_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    housing: {
        title: loc('tech_housing'),
        desc: loc('tech_housing_desc'),
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_housing_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.basic_housing);
                return true;
            }
            return false;
        }
    },
    cottage: {
        title(){
            return housingLabel('medium');
        },
        desc: loc('tech_cottage_desc'),
        cost: {
            Knowledge(){ return 3600; }
        },
        effect: loc('tech_cottage_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.cottage);
                return true;
            }
            return false;
        }
    },
    apartment: {
        title(){
            return housingLabel('large');
        },
        desc(){
            return housingLabel('large');
        },
        cost: {
            Knowledge(){ return 15750; }
        },
        effect: loc('tech_apartment_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.apartment);
                return true;
            }
            return false;
        }
    },
    arcology: {
        title: loc('tech_arcology'),
        desc: loc('tech_arcology'),
        cost: {
            Knowledge(){ return 25000000; }
        },
        effect(){ return loc('tech_arcology_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_ruins.arcology);
                return true;
            }
            return false;
        }
    },
    steel_beams: {
        title: loc('tech_steel_beams'),
        desc: loc('tech_housing_cost'),
        cost: {
            Knowledge(){ return 11250; },
            Steel(){ return 2500; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_steel_beams_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mythril_beams: {
        title: loc('tech_mythril_beams'),
        desc: loc('tech_housing_cost'),
        cost: {
            Knowledge(){ return 175000; },
            Mythril(){ return 1000; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_mythril_beams_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    neutronium_walls: {
        title: loc('tech_neutronium_walls'),
        desc: loc('tech_housing_cost'),
        cost: {
            Knowledge(){ return 300000; },
            Neutronium(){ return 850; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_neutronium_walls_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bolognium_alloy_beams: {
        title: loc('tech_bolognium_alloy_beams'),
        desc: loc('tech_housing_cost'),
        cost: {
            Knowledge(){ return 3750000; },
            Adamantite(){ return 2500000; },
            Bolognium(){ return 100000; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_bolognium_alloy_beams_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    aphrodisiac: {
        title: loc('tech_aphrodisiac'),
        desc: loc('tech_aphrodisiac_desc'),
        cost: {
            Knowledge(){ return 4500; }
        },
        effect: loc('tech_aphrodisiac_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fertility_clinic: {
        title: loc('tech_fertility_clinic'),
        desc: loc('tech_fertility_clinic'),
        cost: {
            Knowledge(){ return 4500000; }
        },
        effect: loc('tech_fertility_clinic_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    captive_housing: {
        title: loc('tech_captive_housing'),
        desc: loc('tech_captive_housing'),
        cost: {
            Knowledge(){ return 12; }
        },
        effect: loc('tech_captive_housing_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.captive_housing);
                return true;
            }
            return false;
        }
    },
    torture: {
        title: loc('tech_torture'),
        desc: loc('tech_torture'),
        cost: {
            Knowledge(){ return 25; }
        },
        effect: loc('tech_torture_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.torturer.display = true;
                return true;
            }
            return false;
        }
    },
};
