import { loc } from '../../../core/locale.js';
import { planetName } from '../../../space/planet_generation.js';
import { payCosts } from '../../../actions/core/action_costs.js';
import { initStruct } from '../../../actions/core/structure_ui.js';
import { actions } from '../../../core/registries.js';
import { global } from '../../../core/vars.js';
import { limitCraftsmen } from '../../../civics/jobs/job_definitions.js';
import { renderPsychicPowers } from '../../../races/powers/power_panels.js';
import { races } from '../../../core/registries.js';
import { messageQueue } from '../../../functions/message_log.js';
import { vBind } from '../../../functions/dom_helpers.js';
import { defineIndustry } from '../../../industry/industry_smelter.js';

// Bagian dari techsPart7 (24 entri: terraforming_tp .. adamantite_crates), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart7Part1 = {
    terraforming_tp: {
        title: loc('tech_terraforming'),
        desc: loc('tech_terraforming'),
        cost: {
            Knowledge(){ return 5000000; },
        },
        effect(){ return loc('tech_terraforming_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.terraformer);
                return true;
            }
            return false;
        }
    },
    quantium: {
        title: loc('tech_quantium'),
        desc: loc('tech_quantium'),
        cost: {
            Knowledge(){ return 1000000; },
            Elerium(){ return 1000; },
            Nano_Tube(){ return 1000000; },
            Graphene(){ return 1000000; }
        },
        effect: loc('tech_quantium_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Quantium.display = true;
                limitCraftsmen('Quantium');
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    anitgrav_bunk: {
        title: loc('tech_anitgrav_bunk'),
        desc: loc('tech_anitgrav_bunk'),
        cost: {
            Knowledge(){ return 1250000; },
            Quantium(){ return 500000; },
        },
        effect(){ return loc('tech_anitgrav_bunk_effect',[loc('space_red_space_barracks_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    higgs_boson_tp: {
        title: loc('tech_higgs_boson'),
        desc: loc('tech_higgs_boson'),
        cost: {
            Knowledge(){ return 125000; }
        },
        effect: loc('tech_higgs_boson_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    long_range_probes: {
        title: loc('tech_long_range_probes'),
        desc: loc('tech_long_range_probes'),
        cost: {
            Knowledge(){ return 400000; },
            Uranium(){ return 20000; },
            Iridium(){ return 250000; },
            Neutronium(){ return 3000; },
            Elerium(){ return 350; }
        },
        effect: loc('tech_long_range_probes_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.titan = true;
                global.settings.space.enceladus = true;
                initStruct(actions.space.spc_titan.titan_spaceport);
                initStruct(actions.space.spc_titan.electrolysis);
                return true;
            }
            return false;
        },
    },
    strange_signal: {
        title: loc('tech_strange_signal'),
        desc: loc('tech_strange_signal'),
        cost: {
            Knowledge(){ return 1350000; }
        },
        effect: loc('tech_strange_signal_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.triton = true;
                return true;
            }
            return false;
        },
    },
    data_analysis: {
        title: loc('tech_data_analysis'),
        desc: loc('tech_data_analysis'),
        cost: {
            Knowledge(){ return 1800000; },
            Cipher(){ return 12500; }
        },
        effect: loc('tech_data_analysis_effect'),
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_data_analysis_result'),'info',false,['progress']);
                global.space.syndicate['spc_titan'] += 500;
                global.space.syndicate['spc_enceladus'] += 250;
                global.space.syndicate['spc_triton'] += 1000;
                return true;
            }
            return false;
        },
    },
    mass_relay: {
        title: loc('tech_mass_relay'),
        desc: loc('tech_mass_relay'),
        cost: {
            Knowledge(){ return 2200000; },
            Cipher(){ return 40000; }
        },
        effect: loc('tech_mass_relay_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.mass_relay);
                return true;
            }
            return false;
        },
    },
    nav_data: {
        title: loc('tech_nav_data'),
        desc: loc('tech_nav_data'),
        cost: {
            Knowledge(){ return 2250000; },
            Cipher(){ return 60000; }
        },
        effect: loc('tech_nav_data_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.eris = true;
                global.settings.space.kuiper = true;
                global.tech['eris_scan'] = 0;
                initStruct(actions.space.spc_eris.drone_control);
                messageQueue(loc('tech_nav_data_result',[planetName().eris]),'info',false,['progress']);
                return true;
            }
            return false;
        },
    },
    sensor_logs: {
        title: loc('tech_sensor_logs'),
        desc: loc('tech_sensor_logs'),
        cost: {
            Knowledge(){ return 3500000; },
            Cipher(){ return 65000; }
        },
        effect: loc('tech_sensor_logs_effect'),
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_sensor_logs_result'),'info',false,['progress']);
                return true;
            }
            return false;
        },
    },
    dronewar: {
        title: loc('tech_dronewar'),
        desc: loc('tech_dronewar'),
        cost: {
            Knowledge(){ return 3200000; },
            Cipher(){ return 25000; }
        },
        effect(){ return loc('tech_dronewar_effect',[planetName().eris]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_eris.shock_trooper);
                initStruct(actions.space.spc_eris.digsite);
                return true;
            }
            return false;
        },
    },
    drone_tank: {
        title: loc('tech_drone_tank'),
        desc: loc('tech_drone_tank'),
        cost: {
            Knowledge(){ return 3400000; },
            Cipher(){ return 50000; }
        },
        effect: loc('tech_drone_tank_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_eris.tank);
                return true;
            }
            return false;
        },
    },
    stanene_tp: {
        title: loc('tech_stanene'),
        desc: loc('tech_stanene'),
        cost: {
            Knowledge(){ return 525000; },
            Aluminium(){ return 500000; },
            Nano_Tube(){ return 100000; }
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
    graphene_tp: {
        title: loc('tech_graphene'),
        desc: loc('tech_graphene'),
        cost: {
            Knowledge(){ return 640000; },
            Adamantite(){ return 25000; }
        },
        effect: loc('tech_graphene_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.g_factory);
                return true;
            }
            return false;
        }
    },
    virtual_reality_tp: {
        title: loc('tech_virtual_reality'),
        desc: loc('tech_virtual_reality'),
        cost: {
            Knowledge(){ return 616000; },
            Nano_Tube(){ return 1000000; },
            Stanene(){ return 125000 }
        },
        effect: loc('tech_virtual_reality_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_virtual_reality_flair');
        }
    },
    electrolysis: {
        title: loc('tech_electrolysis'),
        desc: loc('tech_electrolysis'),
        cost: {
            Knowledge(){ return 465000; },
        },
        effect(){ return loc('tech_electrolysis_effect',[planetName().titan, global.resource.Water.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.titan_quarters);
                initStruct(actions.space.spc_titan.titan_mine);
                return true;
            }
            return false;
        },
    },
    storehouse: {
        title(){ return loc('tech_storehouse',[planetName().titan]); },
        desc(){ return loc('tech_storehouse',[planetName().titan]); },
        cost: {
            Knowledge(){ return 500000; },
        },
        effect(){ return loc('tech_storehouse_effect',[planetName().titan]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.storehouse);
                return true;
            }
            return false;
        },
    },
    adamantite_vault_tp: {
        title: loc('tech_adamantite_vault'),
        desc: loc('tech_adamantite_vault'),
        cost: {
            Money(){ return 2000000; },
            Knowledge(){ return 560000; },
            Adamantite(){ return 20000; }
        },
        effect: loc('tech_adamantite_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titan_bank: {
        title(){ return loc('tech_titan_bank',[planetName().titan]); },
        desc(){ return loc('tech_titan_bank',[planetName().titan]); },
        cost: {
            Knowledge(){ return 600000; },
        },
        effect(){ return loc('tech_titan_bank_effect',[planetName().titan]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.titan_bank);
                return true;
            }
            return false;
        },
    },
    hydrogen_plant: {
        title: loc('tech_hydrogen_plant'),
        desc: loc('tech_hydrogen_plant'),
        cost: {
            Knowledge(){ return 550000; },
        },
        effect(){ return loc('tech_hydrogen_plant_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.hydrogen_plant);
                return true;
            }
            return false;
        },
    },
    water_mining: {
        title: loc('tech_water_mining'),
        desc: loc('tech_water_mining'),
        cost: {
            Knowledge(){ return 450000; },
        },
        effect(){ return loc('tech_water_mining_effect',[
            planetName().enceladus, 
            races[global.race.species].home,
            global.resource.Water.name
        ]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.water_freighter);
                return true;
            }
            return false;
        },
    },
    mercury_smelting: {
        title: loc('tech_mercury_smelting'),
        desc: loc('tech_mercury_smelting'),
        cost: {
            Knowledge(){ return 625000; },
            Adamantite(){ return 50000; }
        },
        effect(){ return loc('tech_mercury_smelting_effect',[planetName().hell]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_hell.hell_smelter);
                return true;
            }
            return false;
        }
    },
    iridium_smelting: {
        title: loc('tech_iridium_smelting'),
        desc: loc('tech_iridium_smelting'),
        cost: {
            Knowledge(){ return 825000; },
            Graphene(){ return 125000; }
        },
        effect: loc('tech_iridium_smelting_effect'),
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
    adamantite_crates: {
        title: loc('tech_adamantite_crates'),
        desc: loc('tech_adamantite_crates_desc'),
        cost: {
            Knowledge(){ return 525000; },
            Adamantite(){ return 12500; }
        },
        effect: loc('tech_adamantite_crates_effect'),
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
};
