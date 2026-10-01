// Fungsi registrasi data game (isi actions, techs, races, events, dst), dikumpulkan di satu modul.
// Dipanggil berurutan oleh core/register_all.js. Dipisah dari modul-modul induknya supaya induk tidak perlu meng-import
// anak-anaknya hanya untuk mendaftarkan (itu yang membuat circular import).
import { actions_cityPart4 } from '../actions/city/banquet_to_replicator.js';
import { actions_cityPart3 } from '../actions/city/cement_plant_to_meditation.js';
import { actions_cityPart2 } from '../actions/city/compost_to_rock_quarry.js';
import { actions_cityPart1 } from '../actions/city/gift_to_farm.js';
import { genePoolPart2 } from '../arpa/genes/architect_to_blood_sacrifice.js';
import { genePoolPart3 } from '../arpa/genes/essence_absorber.js';
import { genePoolPart1 } from '../arpa/genes/genetic_memory_to_geographer.js';
import { loc } from './locale.js';
import { edenAsphodel, edenElysium, edenicModules, genePool, outerTruth, tauCetiModules, fortressModules, monsters, spaceProjects, interstellarProjects, galaxyProjects, actions_city, techsPart1, techsPart2, techsPart3, techsPart4, techsPart5, techsPart6, techsPart7, techsPart8, gov_tasks, events, traits, races } from './registries.js';
import { edenAsphodelPart1 } from '../edenic/asphodel/info_to_research_station.js';
import { edenAsphodelPart3 } from '../edenic/asphodel/rectory_to_corruptor.js';
import { edenAsphodelPart2 } from '../edenic/asphodel/warehouse_to_bliss_den.js';
import { edenIsle } from '../edenic/edenic_isle.js';
import { edenPalace } from '../edenic/edenic_palace.js';
import { edenElysiumPart3 } from '../edenic/elysium/archive_to_eden_cement.js';
import { edenElysiumPart2 } from '../edenic/elysium/fire_support_base_to_eternal_bank.js';
import { edenElysiumPart1 } from '../edenic/elysium/info_to_scout_elysium.js';
import { eventsPart1 } from '../events/definitions/dna_replication_to_scandal.js';
import { eventsPart2 } from '../events/definitions/spy_to_rumor.js';
import { eventsPart3 } from '../events/event_pet.js';
import { gov_tasksPart2 } from '../governor/tasks/mech.js';
import { gov_tasksPart3 } from '../governor/tasks/replicate.js';
import { gov_tasksPart1 } from '../governor/tasks/tax_to_trash.js';
import { fortressModules_prtl_badlands } from '../portal/fortress/badlands.js';
import { fortressModules_prtl_fortress } from '../portal/fortress/fortress.js';
import { fortressModules_prtl_gate } from '../portal/fortress/gate.js';
import { fortressModules_prtl_lake } from '../portal/fortress/lake.js';
import { fortressModules_prtl_pit } from '../portal/fortress/pit.js';
import { fortressModules_prtl_ruins } from '../portal/fortress/ruins.js';
import { fortressModules_prtl_spire } from '../portal/fortress/spire.js';
import { fortressModules_prtl_wasteland } from '../portal/fortress/wasteland.js';
import { monstersPart2 } from '../portal/monsters/ape_to_skeleton_pack.js';
import { monstersPart1 } from '../portal/monsters/fire_elm_to_lich.js';
import { genusVars } from '../races/races.js';
import { racesPart2 } from '../races/species/entish_to_synth.js';
import { racesPart3 } from '../races/species/nano_to_ultra_sludge.js';
import { racesPart1 } from '../races/species/protoplasm_to_dracnid.js';
import { customRace } from '../races/trait_logic/racial_traits.js';
import { traitsPart1 } from '../races/traits/adaptable_to_low_light.js';
import { traitsPart6 } from '../races/traits/conniving_to_unstable.js';
import { traitsPart7 } from '../races/traits/elemental_to_mastery.js';
import { traitsPart2 } from '../races/traits/elusive_to_pack_mentality.js';
import { traitsPart4 } from '../races/traits/hard_of_hearing_to_atrophy.js';
import { traitsPart5 } from '../races/traits/hivemind_to_compact.js';
import { traitsPart3 } from '../races/traits/tracker_to_astrologer.js';
import { galaxyProjects_gxy_alien1 } from '../space/galaxy/alien1.js';
import { galaxyProjects_gxy_alien2 } from '../space/galaxy/alien2.js';
import { galaxyProjects_gxy_chthonian } from '../space/galaxy/chthonian.js';
import { galaxyProjects_gxy_gateway } from '../space/galaxy/gateway.js';
import { galaxyProjects_gxy_gorddon } from '../space/galaxy/gorddon.js';
import { galaxyProjects_gxy_stargate } from '../space/galaxy/stargate.js';
import { interstellarProjects_int_alpha } from '../space/interstellar/alpha.js';
import { interstellarProjects_int_blackhole } from '../space/interstellar/blackhole.js';
import { interstellarProjects_int_nebula } from '../space/interstellar/nebula.js';
import { interstellarProjects_int_neutron } from '../space/interstellar/neutron.js';
import { interstellarProjects_int_proxima } from '../space/interstellar/proxima.js';
import { interstellarProjects_int_sirius } from '../space/interstellar/sirius.js';
import { spaceProjects_spc_belt } from '../space/solar_system/belt.js';
import { spaceProjects_spc_dwarf } from '../space/solar_system/dwarf.js';
import { spaceProjects_spc_gas_moon } from '../space/solar_system/gas_moon.js';
import { spaceProjects_spc_gas } from '../space/solar_system/gas.js';
import { spaceProjects_spc_hell } from '../space/solar_system/hell.js';
import { spaceProjects_spc_home } from '../space/solar_system/home.js';
import { spaceProjects_spc_moon } from '../space/solar_system/moon.js';
import { spaceProjects_spc_titan, spaceProjects_spc_enceladus, spaceProjects_spc_triton, spaceProjects_spc_kuiper, spaceProjects_spc_eris } from '../space/solar_system/outer_planets.js';
import { spaceProjects_spc_red } from '../space/solar_system/red.js';
import { spaceProjects_spc_sun } from '../space/solar_system/sun.js';
import { techsPart8Part1 } from '../tech/logic/alien_research_to_ultimate_corruption/alien_research_to_outer_plane_study.js';
import { techsPart8Part2 } from '../tech/logic/alien_research_to_ultimate_corruption/camouflage_to_divine_infuser.js';
import { techsPart8Part3 } from '../tech/logic/alien_research_to_ultimate_corruption/might_to_ultimate_corruption.js';
import { techsPart1Part3 } from '../tech/logic/club_to_elysis_process/agriculture_to_theatre.js';
import { techsPart1Part1 } from '../tech/logic/club_to_elysis_process/club_to_torture.js';
import { techsPart1Part4 } from '../tech/logic/club_to_elysis_process/playwright_to_elysis_process.js';
import { techsPart1Part2 } from '../tech/logic/club_to_elysis_process/thrall_quarters_to_adv_mulching.js';
import { techsPart4Part4 } from '../tech/logic/mine_conveyor_to_cement/cyborg_soldiers_to_cement.js';
import { techsPart4Part1 } from '../tech/logic/mine_conveyor_to_cement/mine_conveyor_to_steel_shovel.js';
import { techsPart4Part3 } from '../tech/logic/mine_conveyor_to_cement/titanium_hoe_to_gauss_rifles.js';
import { techsPart4Part2 } from '../tech/logic/mine_conveyor_to_cement/titanium_shovel_to_steel_hoe.js';
import { techsPart5Part3 } from '../tech/logic/rebar_to_infusion_confirm/dyson_sphere2_to_interstellar.js';
import { techsPart5Part4 } from '../tech/logic/rebar_to_infusion_confirm/genesis_ship_to_infusion_confirm.js';
import { techsPart5Part2 } from '../tech/logic/rebar_to_infusion_confirm/missionary_to_dyson_net.js';
import { techsPart5Part1 } from '../tech/logic/rebar_to_infusion_confirm/rebar_to_indoctrination.js';
import { techsPart2Part1 } from '../tech/logic/smelting_to_tourism/smelting_to_cranes.js';
import { techsPart2Part3 } from '../tech/logic/smelting_to_tourism/socialist_to_bonds.js';
import { techsPart2Part4 } from '../tech/logic/smelting_to_tourism/steel_vault_to_tourism.js';
import { techsPart2Part2 } from '../tech/logic/smelting_to_tourism/titanium_crates_to_republic.js';
import { techsPart6Part3 } from '../tech/logic/stabilize_blackhole_to_protocol66a/dial_it_to_11_to_concealment.js';
import { techsPart6Part4 } from '../tech/logic/stabilize_blackhole_to_protocol66a/improved_concealment_to_protocol66a.js';
import { techsPart6Part1 } from '../tech/logic/stabilize_blackhole_to_protocol66a/stabilize_blackhole_to_xeno_linguistics.js';
import { techsPart6Part2 } from '../tech/logic/stabilize_blackhole_to_protocol66a/xeno_culture_to_advanced_emplacement.js';
import { techsPart7Part2 } from '../tech/logic/terraforming_tp_to_outer_tau_survey/bolognium_crates_tp_to_alien_outpost.js';
import { techsPart7Part3 } from '../tech/logic/terraforming_tp_to_outer_tau_survey/jumpgates_to_decode_virus.js';
import { techsPart7Part1 } from '../tech/logic/terraforming_tp_to_outer_tau_survey/terraforming_tp_to_adamantite_crates.js';
import { techsPart7Part4 } from '../tech/logic/terraforming_tp_to_outer_tau_survey/vaccine_campaign_to_outer_tau_survey.js';
import { techsPart3Part2 } from '../tech/logic/xeno_tourism_to_breeder_reactor/final_ingredient_to_quantum_computing.js';
import { techsPart3Part4 } from '../tech/logic/xeno_tourism_to_breeder_reactor/lake_threat_to_breeder_reactor.js';
import { techsPart3Part3 } from '../tech/logic/xeno_tourism_to_breeder_reactor/virtual_reality_to_lake_analysis.js';
import { techsPart3Part1 } from '../tech/logic/xeno_tourism_to_breeder_reactor/xeno_tourism_to_preparation_methods.js';
import { outerEnceladus } from '../truepath/outer_solar/enceladus.js';
import { outerEris } from '../truepath/outer_solar/eris.js';
import { outerKuiper } from '../truepath/outer_solar/kuiper.js';
import { outerTitan } from '../truepath/outer_solar/titan.js';
import { outerTriton } from '../truepath/outer_solar/triton.js';
import { tauGas } from '../truepath/tau_ceti/gas.js';
import { tauGas2 } from '../truepath/tau_ceti/gas2.js';
import { tauHome } from '../truepath/tau_ceti/home.js';
import { tauRed } from '../truepath/tau_ceti/red.js';
import { tauRoid } from '../truepath/tau_ceti/roid.js';
import { tauStar } from '../truepath/tau_ceti/star.js';

export function registerAsphodel(){
    Object.assign(edenAsphodel,
        edenAsphodelPart1,
        edenAsphodelPart2,
        edenAsphodelPart3
    );
}

export function registerElysium(){
    Object.assign(edenElysium,
        edenElysiumPart1,
        edenElysiumPart2,
        edenElysiumPart3
    );
}

export function registerEdenic(){
    Object.assign(edenicModules, {
        eden_asphodel: edenAsphodel,
        eden_elysium: edenElysium,
        eden_isle: edenIsle,
        eden_palace: edenPalace
    });
}

export function registerGenePool(){
    Object.assign(genePool,
        genePoolPart1,
        genePoolPart2,
        genePoolPart3
    );
}

export function registerTruepath(){
    Object.assign(outerTruth, {
        spc_titan: outerTitan,
        spc_enceladus: outerEnceladus,
        spc_triton: outerTriton,
        spc_kuiper: outerKuiper,
        spc_eris: outerEris
    });
    Object.assign(tauCetiModules, {
        tau_star: tauStar,
        tau_home: tauHome,
        tau_red: tauRed,
        tau_gas: tauGas,
        tau_roid: tauRoid,
        tau_gas2: tauGas2
    });
}

export function registerPortal(){
    Object.assign(fortressModules, {
        "prtl_fortress": fortressModules_prtl_fortress,
        "prtl_badlands": fortressModules_prtl_badlands,
        "prtl_wasteland": fortressModules_prtl_wasteland,
        "prtl_pit": fortressModules_prtl_pit,
        "prtl_ruins": fortressModules_prtl_ruins,
        "prtl_gate": fortressModules_prtl_gate,
        "prtl_lake": fortressModules_prtl_lake,
        "prtl_spire": fortressModules_prtl_spire
    });
    Object.assign(monsters,
        monstersPart1,
        monstersPart2
    );
}

export function registerSpace(){
    Object.assign(spaceProjects, {
        "spc_home": spaceProjects_spc_home,
        "spc_moon": spaceProjects_spc_moon,
        "spc_red": spaceProjects_spc_red,
        "spc_hell": spaceProjects_spc_hell,
        "spc_sun": spaceProjects_spc_sun,
        "spc_gas": spaceProjects_spc_gas,
        "spc_gas_moon": spaceProjects_spc_gas_moon,
        "spc_belt": spaceProjects_spc_belt,
        "spc_dwarf": spaceProjects_spc_dwarf,
        "spc_titan": spaceProjects_spc_titan,
        "spc_enceladus": spaceProjects_spc_enceladus,
        "spc_triton": spaceProjects_spc_triton,
        "spc_kuiper": spaceProjects_spc_kuiper,
        "spc_eris": spaceProjects_spc_eris
    });
    Object.assign(interstellarProjects, {
        "int_alpha": interstellarProjects_int_alpha,
        "int_proxima": interstellarProjects_int_proxima,
        "int_nebula": interstellarProjects_int_nebula,
        "int_neutron": interstellarProjects_int_neutron,
        "int_blackhole": interstellarProjects_int_blackhole,
        "int_sirius": interstellarProjects_int_sirius
    });
    Object.assign(galaxyProjects, {
        "gxy_gateway": galaxyProjects_gxy_gateway,
        "gxy_stargate": galaxyProjects_gxy_stargate,
        "gxy_gorddon": galaxyProjects_gxy_gorddon,
        "gxy_alien1": galaxyProjects_gxy_alien1,
        "gxy_alien2": galaxyProjects_gxy_alien2,
        "gxy_chthonian": galaxyProjects_gxy_chthonian
    });
}

export function registerCityActions(){
    Object.assign(actions_city,
        actions_cityPart1,
        actions_cityPart2,
        actions_cityPart3,
        actions_cityPart4
    );
}

export function registerTechParts(){
    Object.assign(techsPart1,
        techsPart1Part1,
        techsPart1Part2,
        techsPart1Part3,
        techsPart1Part4
    );
    Object.assign(techsPart2,
        techsPart2Part1,
        techsPart2Part2,
        techsPart2Part3,
        techsPart2Part4
    );
    Object.assign(techsPart3,
        techsPart3Part1,
        techsPart3Part2,
        techsPart3Part3,
        techsPart3Part4
    );
    Object.assign(techsPart4,
        techsPart4Part1,
        techsPart4Part2,
        techsPart4Part3,
        techsPart4Part4
    );
    Object.assign(techsPart5,
        techsPart5Part1,
        techsPart5Part2,
        techsPart5Part3,
        techsPart5Part4
    );
    Object.assign(techsPart6,
        techsPart6Part1,
        techsPart6Part2,
        techsPart6Part3,
        techsPart6Part4
    );
    Object.assign(techsPart7,
        techsPart7Part1,
        techsPart7Part2,
        techsPart7Part3,
        techsPart7Part4
    );
    Object.assign(techsPart8,
        techsPart8Part1,
        techsPart8Part2,
        techsPart8Part3
    );
}

export function registerGovernor(){
    Object.assign(gov_tasks,
        gov_tasksPart1,
        gov_tasksPart2,
        gov_tasksPart3
    );
}

export function registerEvents(){
    Object.assign(events,
        eventsPart1,
        eventsPart2,
        eventsPart3
    );
}

export function registerRaces(){
    Object.assign(traits,
        traitsPart1,
        traitsPart2,
        traitsPart3,
        traitsPart4,
        traitsPart5,
        traitsPart6,
        traitsPart7
    );
    Object.assign(races,
        racesPart1,
        racesPart2,
        racesPart3
    );
    races["custom"] = customRace();
    races["hybrid"] = customRace(true);
    Object.keys(genusVars).forEach(function(k){
        let g = k === 'organism' ? 'humanoid' : k;
        genusVars[k]['solar'] = {
            titan: loc(`genus_${g}_solar_titan`),
            enceladus: loc(`genus_${g}_solar_enceladus`),
            triton: loc(`genus_${g}_solar_triton`),
            eris: loc(`genus_${g}_solar_eris`),
        }
    });
}
