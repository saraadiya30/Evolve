import { loc } from '../../../core/locale.js';
import { payCosts, initStruct, actions } from '../../../actions/actions.js';
import { global, save } from '../../../core/vars.js';
import { races } from '../../../races/races.js';
import { planetName } from '../../../space/space.js';
import { messageQueue } from '../../../functions/functions.js';
import { defineIndustry } from '../../../industry/industry.js';
import { jumpGateShutdown } from '../../../truepath/truepath.js';

// Bagian dari techsPart7 (27 entri: jumpgates .. decode_virus), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart7Part3 = {
    jumpgates: {
        title: loc('tech_jumpgates'),
        desc: loc('tech_jumpgates'),
        cost: {
            Knowledge(){ return 6000000; }
        },
        effect: loc('tech_jumpgates_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    system_survey: {
        title: loc('tech_system_survey'),
        desc: loc('tech_system_survey'),
        cost: {
            Knowledge(){ return 7000000; }
        },
        effect: loc('tech_system_survey_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.tau.roid = true;
                global.settings.tau.gas = true;
                initStruct(actions.tauceti.tau_roid.patrol_ship);
                return true;
            }
            return false;
        }
    },
    repository: {
        title: loc('tech_repository'),
        desc: loc('tech_repository'),
        cost: {
            Knowledge(){ return 6500000; }
        },
        effect: loc('tech_repository_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.repository);
                return true;
            }
            return false;
        }
    },
    fusion_generator: {
        title: loc('tech_fusion_power'),
        desc: loc('tech_fusion_power'),
        cost: {
            Knowledge(){ return 6750000; }
        },
        effect: loc('tech_tau_fusion_power_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.fusion_generator);
                return true;
            }
            return false;
        }
    },
    tau_cultivation: {
        title: loc('tech_tau_cultivation'),
        desc: loc('tech_tau_cultivation'),
        cost: {
            Knowledge(){ return 6900000; }
        },
        effect(){ return loc('tech_tau_cultivation_effect',[races[global.race.species].home]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.tau_farm);
                return true;
            }
            return false;
        }
    },
    tau_manufacturing: {
        title: loc('tech_tau_manufacturing'),
        desc: loc('tech_tau_manufacturing'),
        cost: {
            Knowledge(){ return 7250000; }
        },
        effect(){ return loc('tech_tau_manufacturing_effect',[races[global.race.species].home]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.tau_factory);
                return true;
            }
            return false;
        }
    },
    weasels: {
        title: loc('tech_weasels'),
        desc: loc('tech_weasels'),
        cost: {
            Knowledge(){ return 6250000; }
        },
        effect(){ return loc('tech_weasels_effect',[loc('tau_planet',[planetName().red])]); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_weasels_msg',[loc('tau_planet',[planetName().red])]),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    jeff: {
        title: loc('tech_jeff'),
        desc: loc('tech_jeff'),
        cost: {
            Knowledge(){ return 6380000; }
        },
        effect(){ return loc('tech_jeff_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_jeff_effect_msg',[]),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    womling_fun: {
        title: loc('tech_womling_fun'),
        desc: loc('tech_womling_fun'),
        cost: {
            Knowledge(){ return 6650000; }
        },
        effect(){ return loc('tech_womling_fun_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_lab: {
        title: loc('tech_womling_lab'),
        desc: loc('tech_womling_lab'),
        cost: {
            Knowledge(){ return 6900000; }
        },
        effect(){ return loc('tech_womling_lab_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_red.womling_lab);
                global.tech['womling_tech'] = 0;
                return true;
            }
            return false;
        }
    },
    womling_mining: {
        title: loc('tech_womling_mining'),
        desc: loc('tech_womling_mining'),
        cost: {
            Knowledge(){ return 7100000; }
        },
        effect(){ return loc('tech_womling_mining_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_firstaid: {
        title: loc('tech_womling_firstaid'),
        desc: loc('tech_womling_firstaid'),
        cost: {
            Knowledge(){ return 7350000; }
        },
        effect(){ return loc('tech_womling_firstaid_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_logistics: {
        title: loc('tech_womling_logistics'),
        desc: loc('tech_womling_logistics'),
        cost: {
            Knowledge(){ return 7650000; }
        },
        effect(){ return loc('tech_womling_logistics_effect',[loc('tau_red_orbital_platform')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_repulser: {
        title: loc('tech_womling_repulser'),
        desc: loc('tech_womling_repulser'),
        cost: {
            Knowledge(){ return 7900000; }
        },
        effect(){ return loc('tech_womling_repulser_effect',[global.resource.Oil.name,loc('tau_red_orbital_platform')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_farming: {
        title: loc('tech_womling_farming'),
        desc: loc('tech_womling_farming'),
        cost: {
            Knowledge(){ return 8200000; }
        },
        effect(){ return loc('tech_womling_farming_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_housing: {
        title: loc('tech_womling_housing'),
        desc: loc('tech_womling_housing'),
        cost: {
            Knowledge(){ return 8500000; }
        },
        effect(){ return loc('tech_womling_housing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    womling_support: {
        title: loc('tech_womling_support'),
        desc: loc('tech_womling_support'),
        cost: {
            Knowledge(){ return 8850000; }
        },
        effect(){ return `<div>${loc('tech_womling_support_effect')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_gas.womling_station);
                return true;
            }
            return false;
        }
    },
    womling_recycling: {
        title: loc('tech_womling_recycling'),
        desc: loc('tech_womling_recycling'),
        cost: {
            Knowledge(){ return 9550000; }
        },
        effect(){ return `<div>${loc('tech_womling_recycling_effect')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    asteroid_analysis: {
        title: loc('tech_asteroid_analysis'),
        desc: loc('tech_asteroid_analysis'),
        cost: {
            Knowledge(){ return 7350000; }
        },
        effect(){ return loc('tech_asteroid_analysis_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_asteroid_analysis_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    shark_repellent: {
        title: loc('tech_shark_repellent'),
        desc: loc('tech_shark_repellent'),
        cost: {
            Knowledge(){ return 7400000; }
        },
        effect(){ return loc('tech_shark_repellent_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_shark_repellent_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    belt_mining: {
        title: loc('tech_belt_mining'),
        desc: loc('tech_belt_mining'),
        cost: {
            Knowledge(){ return 7650000; }
        },
        effect(){ return loc('tech_belt_mining_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_gas.ore_refinery);
                initStruct(actions.tauceti.tau_roid.mining_ship);
                return true;
            }
            return false;
        }
    },
    adv_belt_mining: {
        title: loc('tech_adv_belt_mining'),
        desc: loc('tech_adv_belt_mining'),
        cost: {
            Knowledge(){ return 7900000; }
        },
        effect(){ return loc('tech_adv_belt_mining_effect'); },
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
    space_whaling: {
        title: loc('tech_space_whaling'),
        desc: loc('tech_space_whaling'),
        cost: {
            Knowledge(){ return 7500000; }
        },
        effect(){ return loc('tech_space_whaling_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_gas.whaling_station);
                initStruct(actions.tauceti.tau_roid.whaling_ship);
                return true;
            }
            return false;
        }
    },
    infectious_disease_lab: {
        title(){ return loc(global.race['artifical'] ? 'tech_infectious_disease_lab_s' : 'tech_infectious_disease_lab'); },
        desc(){ return loc(global.race['artifical'] ? 'tech_infectious_disease_lab_s' : 'tech_infectious_disease_lab'); },
        cost: {
            Knowledge(){ return 8250000; }
        },
        effect(){ return loc(global.race['artifical'] ? 'tech_infectious_disease_lab_effect_s' : 'tech_infectious_disease_lab_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.infectious_disease_lab);
                return true;
            }
            return false;
        }
    },
    isolation_protocol: {
        title: loc('tech_isolation_protocol'),
        desc: loc('tech_isolation_protocol'),
        cost: {
            Knowledge(){ return 8500000; }
        },
        effect(){ return `<div>${loc('tech_isolation_protocol_effect',[loc('tab_tauceti')])}</div><div class="has-text-special">${loc('tech_isolation_protocol_warning')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                if (!global['sim']){
                    save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
                }
                global.tech['isolation'] = 1;
                jumpGateShutdown();
                return true;
            }
            return false;
        }
    },
    focus_cure: {
        title: loc('tech_focus_cure'),
        desc: loc('tech_focus_cure'),
        cost: {
            Knowledge(){ return 8500000; }
        },
        effect(){ return `<div>${loc('tech_focus_cure_effect',[loc('tab_tauceti')])}</div><div class="has-text-special">${loc('tech_focus_cure_warning')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                global.tech['focus_cure'] = 1;
                return true;
            }
            return false;
        }
    },
    decode_virus: {
        title: loc('tech_decode_virus'),
        desc: loc('tech_decode_virus'),
        cost: {
            Knowledge(){ return 9000000; }
        },
        effect(){ return `<div>${loc(global.race['artifical'] ? 'tech_decode_virus_effect_s' : 'tech_decode_virus_effect')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['artifical']){
                    messageQueue(loc('tech_decode_virus_msg1s',[actions.tauceti.tau_home.infectious_disease_lab.title()]),'info',false,['progress']);
                }
                else {
                    messageQueue(loc('tech_decode_virus_msg1',[actions.tauceti.tau_home.infectious_disease_lab.title()]),'info',false,['progress']);
                }
                return true;
            }
            return false;
        }
    },
};
