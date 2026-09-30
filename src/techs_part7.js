import { global, save } from './vars.js';
import { loc } from './locale.js';
import { vBind, messageQueue } from './functions.js';
import { payCosts, actions, initStruct } from './actions.js';
import { races, renderPsychicPowers } from './races.js';
import { limitCraftsmen } from './jobs.js';
import { planetName, int_fuel_adjust } from './space.js';
import { setOrbits, drawShipYard, jumpGateShutdown } from './truepath.js';
import { defineIndustry } from './industry.js';
import { defineGovernor } from './governor.js';

// Bagian 7 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export const techsPart7 = {
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
    bolognium_crates_tp: {
        title(){ return loc('tech_crates',[global.resource.Bolognium.name]); },
        desc(){ return loc('tech_crates',[global.resource.Bolognium.name]); },
        cost: {
            Knowledge(){ return 6160000; },
            Bolognium(){ return 750000; }
        },
        effect(){ return loc('tech_bolognium_crates_effect',[global.resource.Bolognium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_containers_tp: {
        title(){ return loc('tech_containers',[global.resource.Adamantite.name]); },
        desc(){ return loc('tech_adamantite_containers_desc',[global.resource.Adamantite.name]); },
        cost: {
            Knowledge(){ return 575000; },
            Adamantite(){ return 17500; }
        },
        effect(){ return loc('tech_adamantite_containers_effect',[global.resource.Adamantite.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    quantium_containers: {
        title(){ return loc('tech_containers',[global.resource.Quantium.name]); },
        desc(){ return loc('tech_containers',[global.resource.Quantium.name]); },
        cost: {
            Knowledge(){ return 1150000; },
            Quantium(){ return 100000; }
        },
        effect(){ return loc('tech_quantium_containers_effect',[global.resource.Quantium.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    unobtainium_containers: {
        title(){ return loc('tech_containers',[global.resource.Unobtainium.name]); },
        desc(){ return loc('tech_containers',[global.resource.Unobtainium.name]); },
        cost: {
            Knowledge(){ return 7250000; },
            Unobtainium(){ return 7500; }
        },
        effect(){ return loc('tech_bolognium_containers_effect',[global.resource.Unobtainium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    reinforced_shelving: {
        title: loc('tech_reinforced_shelving'),
        desc: loc('tech_reinforced_shelving'),
        cost: {
            Knowledge(){ return 850000; },
            Adamantite(){ return 350000; },
            Graphene(){ return 250000; }
        },
        effect: loc('tech_reinforced_shelving_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    garage_shelving: {
        title: loc('tech_garage_shelving'),
        desc: loc('tech_garage_shelving'),
        cost: {
            Knowledge(){ return 1250000; },
            Quantium(){ return 75000; }
        },
        effect: loc('tech_garage_shelving_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    warehouse_shelving: {
        title: loc('tech_warehouse_shelving'),
        desc: loc('tech_warehouse_shelving'),
        cost: {
            Knowledge(){ return 2250000; },
            Quantium(){ return 1000000; },
            Cipher(){ return 25000; }
        },
        effect: loc('tech_warehouse_shelving_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_extraction: {
        title: loc('tech_elerium_extraction'),
        desc: loc('tech_elerium_extraction'),
        cost: {
            Knowledge(){ return 2500000; },
            Orichalcum(){ return 100000; },
            Cipher(){ return 12000; }
        },
        effect(){ return loc('tech_elerium_extraction_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_kuiper.elerium_mine);
                return true;
            }
            return false;
        }
    },
    orichalcum_panels_tp: {
        title: loc('tech_orichalcum_panels'),
        desc: loc('tech_orichalcum_panels'),
        cost: {
            Knowledge(){ return 2400000; },
            Orichalcum(){ return 125000; }
        },
        effect(){ return loc('tech_orichalcum_panels_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    shipyard: {
        title(){ return loc('tech_shipyard',[planetName().dwarf]); },
        desc(){ return loc('tech_shipyard',[planetName().dwarf]); },
        cost: {
            Knowledge(){ return 420000; }
        },
        effect(){ return loc('tech_shipyard_effect',[planetName().dwarf]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.shipyard);
                setOrbits();
                return true;
            }
            return false;
        },
    },
    ship_lasers: {
        title: loc('tech_ship_lasers'),
        desc: loc('tech_ship_lasers'),
        cost: {
            Knowledge(){ return 425000; },
            Elerium(){ return 500; }
        },
        effect: loc('tech_ship_lasers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pulse_lasers: {
        title: loc('tech_pulse_lasers'),
        desc: loc('tech_pulse_lasers'),
        cost: {
            Knowledge(){ return 500000; },
            Elerium(){ return 750; }
        },
        effect: loc('tech_pulse_lasers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_plasma: {
        title: loc('tech_ship_plasma'),
        desc: loc('tech_ship_plasma'),
        cost: {
            Knowledge(){ return 880000; },
            Elerium(){ return 2500; }
        },
        effect: loc('tech_ship_plasma_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_phaser: {
        title: loc('tech_ship_phaser'),
        desc: loc('tech_ship_phaser'),
        cost: {
            Knowledge(){ return 1225000; },
            Quantium(){ return 75000; }
        },
        effect: loc('tech_ship_phaser_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_disruptor: {
        title: loc('tech_ship_disruptor'),
        desc: loc('tech_ship_disruptor'),
        cost: {
            Knowledge(){ return 2000000; },
            Cipher(){ return 25000; }
        },
        effect: loc('tech_ship_disruptor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    destroyer_ship: {
        title: loc('tech_destroyer_ship'),
        desc: loc('tech_destroyer_ship'),
        cost: {
            Knowledge(){ return 465000; }
        },
        effect: loc('tech_destroyer_ship_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cruiser_ship_tp: {
        title: loc('tech_cruiser_ship'),
        desc: loc('tech_cruiser_ship'),
        cost: {
            Knowledge(){ return 750000; },
            Adamantite(){ return 50000; }
        },
        effect: loc('tech_cruiser_ship_tp'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    h_cruiser_ship: {
        title: loc('tech_h_cruiser_ship'),
        desc: loc('tech_h_cruiser_ship'),
        cost: {
            Knowledge(){ return 1500000; }
        },
        effect: loc('tech_h_cruiser_ship_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dreadnought_ship: {
        title: loc('tech_dreadnought_ship'),
        desc: loc('tech_dreadnought_ship'),
        cost: {
            Knowledge(){ return 2500000; },
            Cipher(){ return 10000; }
        },
        effect: loc('tech_dreadnought_ship_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pulse_engine: {
        title: loc('outer_shipyard_engine_pulse'),
        desc: loc('outer_shipyard_engine_pulse'),
        cost: {
            Knowledge(){ return 555000; },
            Stanene(){ return 250000; }
        },
        effect: loc('tech_pulse_engine_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    photon_engine: {
        title: loc('outer_shipyard_engine_photon'),
        desc: loc('outer_shipyard_engine_photon'),
        cost: {
            Knowledge(){ return 1150000; },
            Quantium(){ return 50000; }
        },
        effect: loc('tech_photon_engine_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    vacuum_drive: {
        title: loc('outer_shipyard_engine_vacuum'),
        desc: loc('outer_shipyard_engine_vacuum'),
        cost: {
            Knowledge(){ return 1850000; },
            Cipher(){ return 10000; }
        },
        effect: loc('outer_shipyard_engine_vacuum_desc'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_fusion: {
        title: loc('tech_fusion_generator'),
        desc: loc('tech_fusion_generator'),
        cost: {
            Knowledge(){ return 1100000; },
            Quantium(){ return 65000; }
        },
        effect: loc('tech_fusion_generator_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_elerium: {
        title: loc('tech_elerium_generator'),
        desc: loc('tech_elerium_generator'),
        cost: {
            Knowledge(){ return 1900000; },
            Cipher(){ return 18000; }
        },
        effect: loc('tech_elerium_generator_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_signatures: {
        title: loc('tech_quantum_signatures'),
        desc: loc('tech_quantum_signatures'),
        cost: {
            Knowledge(){ return 1050000; },
            Quantium(){ return 10000; }
        },
        effect: loc('tech_quantum_signatures_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    interstellar_drive: {
        title: loc('tech_interstellar_drive'),
        desc: loc('tech_interstellar_drive'),
        cost: {
            Knowledge(){ return 4500000; },
            Quantium(){ return 250000; },
            Cipher(){ return 75000; }
        },
        effect: loc('tech_interstellar_drive_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            drawShipYard();
        }
    },
    alien_outpost: {
        title: loc('tech_alien_outpost'),
        desc: loc('tech_alien_outpost'),
        cost: {
            Knowledge(){ return 5000000; },
            Cipher(){ return 100000; }
        },
        effect: loc('tech_alien_outpost_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.alien_outpost);
                initStruct(actions.tauceti.tau_home.jump_gate);
                initStruct(actions.space.spc_sun.jump_gate);
                messageQueue(loc('tech_alien_outpost_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
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
    vaccine_campaign: {
        title: loc('tech_vaccine_campaign'),
        desc: loc('tech_vaccine_campaign'),
        cost: {
            Knowledge(){ return 9250000; }
        },
        effect(){
            let struct = global.race['artifical'] ? actions.city.boot_camp.title() : actions.city.hospital.title;
            return `<div>${loc('tech_vaccine_campaign_effect',[struct])}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.race['vax'] = 0;
                return true;
            }
            return false;
        }
    },
    vax_strat1: {
        title: loc('tech_vax_strat1'),
        desc: loc('tech_vax_strat1'),
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat1_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_p'] = 1;
                messageQueue(loc('tech_vax_strat1_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    vax_strat2: {
        title: loc('tech_vax_strat2'),
        desc: loc('tech_vax_strat2'),
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat2_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_f'] = 1;
                messageQueue(loc('tech_vax_strat2_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    vax_strat3: {
        title: loc('tech_vax_strat3'),
        desc: loc('tech_vax_strat3'),
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat3_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_s'] = 1;
                messageQueue(loc('tech_vax_strat3_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    vax_strat4: {
        title: loc('tech_vax_strat4'),
        desc: loc('tech_vax_strat4'),
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat4_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_c'] = 1;
                messageQueue(loc('tech_vax_strat4_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    cloning: {
        title: loc('tech_cloning'),
        desc: loc('tech_cloning'),
        cost: {
            Knowledge(){ return 9750000; }
        },
        effect(){
            return `<div>${loc(global.race['artifical'] ? 'tech_cloning_effect_s' : 'tech_cloning_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.cloning_facility);
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    clone_degradation: {
        title: loc('tech_clone_degradation'),
        desc: loc('tech_clone_degradation'),
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){
            return `<div>${loc('tech_clone_degradation_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_clone_degradation_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    digital_paradise: {
        title: loc('tech_digital_paradise'),
        desc: loc('tech_digital_paradise'),
        cost: {
            Knowledge(){ return 10500000; },
            Cipher(){ return 200000; }
        },
        effect(){
            return `<div>${loc('tech_digital_paradise_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ringworld: {
        title: loc('tech_ringworld'),
        desc: loc('tech_ringworld'),
        cost: {
            Money(){ return 3000000000; },
            Knowledge(){ return 11000000; }
        },
        effect(){
            return `<div>${loc('tech_ringworld_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.settings.tau.star = true;
                initStruct(actions.tauceti.tau_star.ringworld);
                return true;
            }
            return false;
        }
    },
    iso_gambling: {
        title: loc('tech_iso_gambling'),
        desc: loc('tech_iso_gambling'),
        cost: {
            Knowledge(){ return 8650000; }
        },
        effect: loc('tech_iso_gambling_effect',[5]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    outpost_boost: {
        title(){ return loc('tech_outpost_boost'); },
        desc(){ return loc('tech_outpost_boost'); },
        cost: {
            Knowledge(){ return 8900000; },
        },
        effect(){ return loc('tech_outpost_boost_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_outpost_boost_flair'); }
    },
    cultural_center: {
        title: loc('tech_cultural_center'),
        desc: loc('tech_cultural_center'),
        cost: {
            Knowledge(){ return 8850000; }
        },
        effect: loc('tech_cultural_center_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.tau_cultural_center);
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_cultural_center_flair'); }
    },
    outer_tau_survey: {
        title: loc('tech_outer_tau_survey'),
        desc: loc('tech_outer_tau_survey'),
        cost: {
            Knowledge(){ return 9100000; },
            Helium_3(){ return +int_fuel_adjust(5000000).toFixed(0); },
        },
        effect: loc('tech_outer_tau_survey_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.tau.gas2 = true;
                return true;
            }
            return false;
        }
    },
};
