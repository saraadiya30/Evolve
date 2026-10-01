// Isi: gridDefs(), clearGrids(), dragPowerGrid()
import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { planetName } from '../space/planet_generation.js';
import { races } from '../core/registries.js';
import { setPowerGrid } from './industry_panels.js';

// Fungsi-fungsi dipindah dari industry.js (urutan sumber dipertahankan). industry.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function gridDefs(){
    return {
        power: { l: global.power, n: loc(`power`), s: true, r: false, rs: false },
        moon: { l: global.support.moon, n: loc(`space_moon_info_name`), s: global.settings.space.moon, r: 'space', rs: 'moon_base' },
        red: { l: global.support.red, n: planetName().red, s: global.settings.space.red, r: 'space', rs: 'spaceport'  },
        belt: { l: global.support.belt, n: loc(`space_belt_info_name`), s: global.settings.space.belt, r: 'space', rs: 'space_station'  },
        alpha: { l: global.support.alpha, n: loc(`interstellar_alpha_name`), s: global.settings.space.alpha, r: 'interstellar', rs: 'starport'  },
        nebula: { l: global.support.nebula, n: loc(`interstellar_nebula_name`), s: global.settings.space.nebula, r: 'interstellar', rs: 'nexus'  },
        gateway: { l: global.support.gateway, n: loc(`galaxy_gateway`), s: global.settings.space.gateway, r: 'galaxy', rs: 'starbase'  },
        alien2: { l: global.support.alien2, n: loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]), s: global.settings.space.alien2, r: 'galaxy', rs: 'foothold'  },
        lake: { l: global.support.lake, n: loc(`portal_lake_name`), s: global.settings.portal.lake, r: 'portal', rs: 'harbor'  },
        spire: { l: global.support.spire, n: loc(`portal_spire_name`), s: global.settings.portal.spire, r: 'portal', rs: 'purifier'  },
        titan: { l: global.support.titan, n: planetName().titan, s: global.settings.space.titan, r: 'space', rs: 'electrolysis'  },
        enceladus: { l: global.support.enceladus, n: planetName().enceladus, s: global.settings.space.enceladus, r: 'space', rs: 'titan_spaceport'  },
        eris: { l: global.support.eris, n: planetName().eris, s: global.settings.space.eris, r: 'space', rs: 'drone_control'  },
        tau_home: { l: global.support.tau_home, n: loc(`tau_planet`,[races[global.race.species].home]), s: global.settings.tau.home, r: 'tauceti', rs: 'orbital_station'  },
        tau_red: { l: global.support.tau_red, n: loc(`tau_planet`,[planetName().red]), s: global.settings.tau.red, r: 'tauceti', rs: 'orbital_platform'  },
        tau_roid: { l: global.support.tau_roid, n: loc(`tau_roid_title`), s: global.settings.tau.roid, r: 'tauceti', rs: 'patrol_ship'  },
        asphodel: { l: global.support.asphodel, n: loc(`eden_asphodel_name`), s: global.settings.eden.asphodel, r: 'eden', rs: 'encampment' },
    };
}

export function clearGrids(grids){
    grids = grids || gridDefs();
    Object.keys(grids).forEach(function(grid_type){
        let el = $(`#grid${grid_type}`)[0];
        if (el){
            let sort = Sortable.get(el);
            if (sort){
                sort.destroy();
            }
        }
    });
}

export function dragPowerGrid(grid_type){
    let el = $(`#grid${grid_type}`)[0];
    let grids = gridDefs();
    Sortable.create(el,{
        onEnd(e){
            let order = grids[grid_type].l;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            grids[grid_type].l = order;
            setPowerGrid();
        }
    });
}

export function powerGrid(type,reset){
    let grids = gridDefs();

    let power_structs = [];
    switch (type){
        case 'power':
            power_structs = [
                'city:transmitter','prtl_ruins:arcology','city:apartment','eden_asphodel:rectory','eden_asphodel:corruptor','int_alpha:habitat','int_alpha:luxury_condo','spc_red:spaceport','spc_titan:titan_spaceport','spc_titan:electrolysis',
                'int_alpha:starport','eden_asphodel:encampment','spc_dwarf:shipyard','spc_titan:ai_core2','spc_eris:drone_control','spc_titan:ai_colonist','int_blackhole:s_gate','gxy_gateway:starbase','spc_triton:fob',
                'prtl_wasteland:demon_forge','prtl_wasteland:twisted_lab','spc_enceladus:operating_base','spc_enceladus:zero_g_lab','spc_titan:sam','gxy_gateway:ship_dock','prtl_ruins:hell_forge','int_neutron:stellar_forge','int_neutron:citadel',
                'prtl_badlands:mortuary','tau_home:orbital_station','tau_red:orbital_platform','tau_gas:refueling_station','tau_home:tau_farm','tau_gas:ore_refinery','tau_gas:whaling_station',
                'city:coal_mine','spc_moon:moon_base','spc_red:red_tower','spc_home:nav_beacon','int_proxima:xfer_station','gxy_stargate:telemetry_beacon','int_nebula:nexus','gxy_stargate:gateway_depot',
                'spc_dwarf:elerium_contain','spc_gas:gas_mining','spc_belt:space_station','spc_gas_moon:outpost','gxy_gorddon:embassy','gxy_gorddon:dormitory','gxy_alien1:resort','spc_gas_moon:oil_extractor',
                'prtl_wasteland:hell_factory','int_alpha:int_factory','city:factory','spc_red:red_factory','spc_dwarf:world_controller','prtl_fortress:turret','prtl_badlands:war_drone','city:wardenclyffe','city:biolab','city:mine',
                'city:rock_quarry','city:cement_plant','city:sawmill','city:mass_driver','int_neutron:neutron_miner','prtl_fortress:war_droid','prtl_pit:soul_forge','gxy_chthonian:excavator','prtl_pit:shadow_mine','prtl_pit:tavern',
                'int_blackhole:far_reach','prtl_badlands:sensor_drone','prtl_badlands:attractor','city:metal_refinery','gxy_stargate:gateway_station','gxy_alien1:vitreloy_plant','gxy_alien2:foothold',
                'gxy_gorddon:symposium','int_blackhole:mass_ejector','city:casino','spc_hell:spc_casino','tau_home:tauceti_casino','prtl_wasteland:hell_casino','prtl_fortress:repair_droid','gxy_stargate:defense_platform','prtl_ruins:guard_post',
                'prtl_lake:cooling_tower','prtl_lake:harbor','prtl_spire:purifier','prtl_ruins:archaeology','prtl_pit:gun_emplacement','prtl_gate:gate_turret','prtl_pit:soul_attractor',
                'prtl_gate:infernite_mine','int_sirius:ascension_trigger','spc_kuiper:orichalcum_mine','spc_kuiper:elerium_mine','spc_kuiper:uranium_mine','spc_kuiper:neutronium_mine','spc_dwarf:m_relay',
                'tau_home:tau_factory','tau_home:infectious_disease_lab','tau_home:alien_outpost','tau_gas:womling_station','spc_red:atmo_terraformer','tau_star:matrix','tau_home:tau_cultural_center',
                'eden_elysium:sacred_smelter','prtl_pit:soul_capacitor','prtl_lake:oven_complete','eden_elysium:elysanite_mine','eden_elysium:elerium_containment','eden_elysium:pillbox','eden_elysium:archive',
                'eden_elysium:restaurant','eden_elysium:eden_cement','eden_isle:spirit_battery','eden_isle:spirit_vacuum','city:replicator'
            ];
            break;
        case 'moon':
            power_structs = ['spc_moon:helium_mine','spc_moon:iridium_mine','spc_moon:observatory'];
            break;
        case 'red':
            power_structs = ['spc_red:living_quarters','spc_red:exotic_lab','spc_red:red_mine','spc_red:fabrication','spc_red:biodome','spc_red:vr_center'];
            break;
        case 'belt':
            power_structs = ['spc_belt:elerium_ship','spc_belt:iridium_ship','spc_belt:iron_ship'];
            break;
        case 'alpha':
            power_structs = ['int_alpha:fusion','int_alpha:mining_droid','int_alpha:processing','int_alpha:laboratory','int_alpha:g_factory','int_alpha:exchange','int_alpha:zoo'];
            break;
        case 'nebula':
            power_structs = ['int_nebula:harvester','int_nebula:elerium_prospector'];
            break;
        case 'gateway':
            power_structs = ['gxy_gateway:bolognium_ship','gxy_gateway:dreadnought','gxy_gateway:cruiser_ship','gxy_gateway:frigate_ship','gxy_gateway:corvette_ship','gxy_gateway:scout_ship'];
            break;
        case 'alien2':
            power_structs = ['gxy_alien2:armed_miner','gxy_alien2:ore_processor','gxy_alien2:scavenger'];
            break;
        case 'lake':
            power_structs = ['prtl_lake:bireme','prtl_lake:transport'];
            break;
        case 'spire':
            power_structs = ['prtl_spire:port','prtl_spire:base_camp','prtl_spire:mechbay'];
            break;
        case 'titan':
            power_structs = ['spc_titan:titan_quarters','spc_titan:titan_mine','spc_titan:g_factory','spc_titan:decoder'];
            break;
        case 'enceladus':
            power_structs = ['spc_enceladus:water_freighter','spc_enceladus:operating_base','spc_enceladus:zero_g_lab'];
            break;
        case 'eris':
            power_structs = ['spc_eris:shock_trooper','spc_eris:tank'];
            break;
        case 'tau_home':
            power_structs = ['tau_home:colony','tau_home:tau_factory','tau_home:mining_pit','tau_home:infectious_disease_lab'];
            break;
        case 'tau_red':
            power_structs = ['tau_red:womling_village','tau_red:womling_farm','tau_red:overseer','tau_red:womling_mine','tau_red:womling_fun','tau_red:womling_lab'];
            break;
        case 'tau_roid':
            power_structs = ['tau_roid:mining_ship','tau_roid:whaling_ship'];
            break;
        case 'asphodel':
            power_structs = ['eden_asphodel:soul_engine','eden_asphodel:bunker','eden_asphodel:asphodel_harvester','eden_asphodel:ectoplasm_processor','eden_asphodel:research_station','eden_asphodel:bliss_den'];
            break;
    }

    if (reset){
        grids[type].l.length = 0;
    }

    power_structs.forEach(function(struct){
        if (!grids[type].l.includes(struct)){
            grids[type].l.push(struct);
        }
    });

    if (grids[type].l.length > power_structs.length){
        grids[type].l.forEach(function(struct){
            if (!power_structs.includes(struct)){
                grids[type].l.splice(grids[type].l.indexOf(struct),1);
            }
        });
    }
}
