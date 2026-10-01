import { loc } from '../../../core/locale.js';
import { global } from '../../../core/vars.js';
import { payCosts } from '../../../actions/core/action_costs.js';
import { initStruct } from '../../../actions/core/structure_ui.js';
import { actions } from '../../../core/registries.js';

// Bagian dari techsPart4 (26 entri: titanium_shovel .. steel_hoe), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart4Part2 = {
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
};
