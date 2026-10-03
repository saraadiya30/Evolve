import { loc } from '../core/locale.js';
import { payCosts, initStruct, actions } from '../actions/actions.js';
import { global } from '../core/vars.js';
import { defineGovernor } from '../governor/governor.js';
import { vBind } from '../functions/functions.js';
import { unlockAchieve } from '../achievements/achieve.js';

// Bagian dari techsPart4 (24 entri: titanium_hoe .. gauss_rifles), dipisah dari techs_part4.js. Urutan entri sama persis.
export const techsPart4Part3 = {
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
};
