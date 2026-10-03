import { loc } from '../core/locale.js';
import { payCosts, initStruct, actions, updateQueueNames } from '../actions/actions.js';
import { vBind, messageQueue } from '../functions/functions.js';
import { planetName } from '../space/space.js';
import { global } from '../core/vars.js';

// Bagian dari techsPart4 (17 entri: cyborg_soldiers .. cement), dipisah dari techs_part4.js. Urutan entri sama persis.
export const techsPart4Part4 = {
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
