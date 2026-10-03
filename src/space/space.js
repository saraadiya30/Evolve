import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { spaceProjects } from './space_registry.js';
import { spaceProjects_spc_home } from './solar_system/home.js';
import { spaceProjects_spc_moon } from './solar_system/moon.js';
import { spaceProjects_spc_red } from './solar_system/red.js';
import { spaceProjects_spc_hell } from './solar_system/hell.js';
import { spaceProjects_spc_sun } from './solar_system/sun.js';
import { spaceProjects_spc_gas } from './solar_system/gas.js';
import { spaceProjects_spc_gas_moon } from './solar_system/gas_moon.js';
import { spaceProjects_spc_belt } from './solar_system/belt.js';
import { spaceProjects_spc_dwarf } from './solar_system/dwarf.js';
import { spaceProjects_spc_titan, spaceProjects_spc_enceladus, spaceProjects_spc_triton, spaceProjects_spc_kuiper, spaceProjects_spc_eris } from './solar_system/outer_planets.js';
import { interstellarProjects } from './space_registry.js';
import { interstellarProjects_int_alpha } from './interstellar/alpha.js';
import { interstellarProjects_int_proxima } from './interstellar/proxima.js';
import { interstellarProjects_int_nebula } from './interstellar/nebula.js';
import { interstellarProjects_int_neutron } from './interstellar/neutron.js';
import { interstellarProjects_int_blackhole } from './interstellar/blackhole.js';
import { interstellarProjects_int_sirius } from './interstellar/sirius.js';
import { galaxyProjects } from './space_registry.js';
import { galaxyProjects_gxy_gateway } from './galaxy/gateway.js';
import { galaxyProjects_gxy_stargate } from './galaxy/stargate.js';
import { galaxyProjects_gxy_gorddon } from './galaxy/gorddon.js';
import { galaxyProjects_gxy_alien1 } from './galaxy/alien1.js';
import { galaxyProjects_gxy_alien2 } from './galaxy/alien2.js';
import { galaxyProjects_gxy_chthonian } from './galaxy/chthonian.js';
export { astrialProjection, terraformProjection, convertSpaceSector, piracy, xeno_race, gatewayStorage, incrementStruct, spaceTech, interstellarTech, galaxyTech, checkSpaceRequirements, checkRequirements, renderSpace, deepSpace, galaxySpace } from './space_tech_requirements_and_rendering.js';
export { house_adjust, iron_adjust, swarm_adjust, fuel_adjust, int_fuel_adjust, zigguratBonus, planetName, genPlanets, setUniverse } from './armada_adjusters_and_planet_generation.js';
export { ascendLab } from './ascend_lab.js';
export { terraformLab, isStargateOn } from './gene_cost_and_terraform_lab.js';

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
export { galaxyProjects };


export const galaxyRegions = ['gxy_gateway', 'gxy_stargate', 'gxy_gorddon', 'gxy_alien1', 'gxy_alien2', 'gxy_chthonian'];
export const gatewayArmada = ['scout_ship', 'corvette_ship', 'frigate_ship', 'cruiser_ship', 'dreadnought'];

export const galaxy_ship_types = [
    {
        area: 'galaxy',
        region: 'gxy_gateway',
        ships: global.support.gateway.map(x => x.split(':')[1])
    },
    {
        area: 'galaxy',
        region: 'gxy_gorddon',
        ships: ['freighter'],
        req: 'embassy'
    },
    {
        area: 'galaxy',
        region: 'gxy_alien1',
        ships: ['super_freighter'],
        req: 'embassy'
    },
    {
        area: 'galaxy',
        region: 'gxy_alien2',
        ships: global.support.alien2.map(x => x.split(':')[1]),
        req: 'foothold'
    },
    {
        area: 'galaxy',
        region: 'gxy_chthonian',
        ships: ['minelayer','raider'],
        req: 'starbase'
    },
    {
        area: 'portal',
        region: 'prtl_lake',
        ships: global.support.lake.map(x => x.split(':')[1]),
        req: 'harbor'
    }
];

export const structDefinitions = {
    satellite: { count: 0 },
    propellant_depot: { count: 0 },
    gps: { count: 0 },
    nav_beacon: { count: 0, on: 0 },
    moon_base: { count: 0, on: 0, support: 0, s_max: 0 },
    iridium_mine: { count: 0, on: 0 },
    helium_mine: { count: 0, on: 0 },
    observatory: { count: 0, on: 0 },
    spaceport: { count: 0, on: 0, support: 0, s_max: 0 },
    red_tower: { count: 0, on: 0 },
    living_quarters: { count: 0, on: 0 },
    vr_center: { count: 0, on: 0 },
    garage: { count: 0 },
    red_mine: { count: 0, on: 0 },
    fabrication: { count: 0, on: 0 },
    red_factory: { count: 0, on: 0 },
    exotic_lab: { count: 0, on: 0 },
    ziggurat: { count: 0 },
    space_barracks: { count: 0, on: 0 },
    biodome: { count: 0, on: 0 },
    laboratory: { count: 0, on: 0 },
    geothermal: { count: 0, on: 0 },
    swarm_plant: { count: 0 },
    swarm_control: { count: 0, support: 0, s_max: 0 },
    swarm_satellite: { count: 0 },
    gas_mining: { count: 0, on: 0 },
    gas_storage: { count: 0 },
    star_dock: { count: 0, ship: 0, probe: 0, template: 'human' },
    outpost: { count: 0, on: 0 },
    drone: { count: 0 },
    oil_extractor: { count: 0, on: 0 },
    space_station: { count: 0, on: 0, support: 0, s_max: 0 },
    iridium_ship: { count: 0, on: 0 },
    elerium_ship: { count: 0, on: 0 },
    elerium_prospector: { count: 0, on: 0 },
    iron_ship: { count: 0, on: 0 },
    elerium_contain: { count: 0, on: 0 },
    e_reactor: { count: 0, on: 0 },
    world_collider: { count: 0 },
    world_controller: { count: 0, on: 0 },
    starport: { count: 0, on: 0, support: 0, s_max: 0 },
    mining_droid: { count: 0, on: 0, adam: 0, uran: 0, coal: 0, alum: 0 },
    processing: { count: 0, on: 0 },
    habitat: { count: 0, on: 0 },
    fusion: { count: 0, on: 0 },
    exchange: { count: 0, on: 0 },
    warehouse: { count: 0 },
    xfer_station: { count: 0, on: 0 },
    cargo_yard: { count: 0 },
    cruiser: { count: 0, on: 0 },
    dyson: { count: 0 },
    nexus: { count: 0, on: 0, support: 0, s_max: 0 },
    harvester: { count: 0, on: 0 },
    far_reach: { count: 0, on: 0 },
    stellar_engine: { count: 0, mass: 8, exotic: 0 },
    mass_ejector:{
        count: 0, on: 0, total: 0, mass: 0,
        Food: 0, Lumber: 0,
        Chrysotile: 0, Stone: 0,
        Crystal: 0, Furs: 0,
        Copper: 0, Iron: 0,
        Aluminium: 0, Cement: 0,
        Coal: 0, Oil: 0,
        Uranium: 0, Steel: 0,
        Titanium: 0, Alloy: 0,
        Polymer: 0, Iridium: 0,
        Helium_3: 0, Deuterium: 0,
        Neutronium: 0, Adamantite: 0,
        Infernite: 0, Elerium: 0,
        Nano_Tube: 0, Graphene: 0,
        Stanene: 0, Bolognium: 0,
        Vitreloy: 0, Orichalcum: 0,
        Plywood: 0, Brick: 0,
        Wrought_Iron: 0, Sheet_Metal: 0,
        Mythril: 0, Aerogel: 0,
        Nanoweave: 0, Scarletite: 0
    },
    stargate: { count: 0 },
    gateway_station: { count: 0, on: 0 },
    s_gate: { count: 0, on: 0 },
    starbase: { count: 0, on: 0, support: 0, s_max: 0 },
    bolognium_ship: { count: 0, on: 0, crew: 0 },
    scout_ship: { count: 0, on: 0, crew: 0, mil: 0 },
    corvette_ship: { count: 0, on: 0, crew: 0, mil: 0 },
    frigate_ship: { count: 0, on: 0, crew: 0, mil: 0 },
    cruiser_ship: { count: 0, on: 0, crew: 0, mil: 0 },
    dreadnought: { count: 0, on: 0, crew: 0, mil: 0 },
    foothold: { count: 0, on: 0, support: 0, s_max: 0 },
    turret: { count: 0, on: 0 },
    carport: { count: 0, damaged: 0, repair: 0 },
    war_droid: { count: 0, on: 0 },
    repair_droid: { count: 0, on: 0 },
    war_drones: { count: 0, on: 0 },
    sensor_drone: { count: 0, on: 0 },
    attractor: { count: 0, on: 0 },
};

export const universe_affixes = ['l', 'h', 'a', 'e', 'm', 'mg'];

export const universe_types = {
    standard: {
        name: loc('universe_standard'),
        desc: loc('universe_standard_desc'),
        effect: loc('universe_standard_effect')
    },
    heavy: {
        name: loc('universe_heavy'),
        desc: loc('universe_heavy_desc'),
        effect: loc('universe_heavy_effect',[5])
    },
    antimatter: {
        name: loc('universe_antimatter'),
        desc: loc('universe_antimatter_desc'),
        effect: loc('universe_antimatter_effect')
    },
    evil: {
        name: loc('universe_evil'),
        desc: loc('universe_evil_desc'),
        effect: loc('universe_evil_effect')
    },
    micro: {
        name: loc('universe_micro'),
        desc: loc('universe_micro_desc'),
        effect: loc('universe_micro_effect',[75])
    },
    magic: {
        name: loc('universe_magic'),
        desc: loc('universe_magic_desc'),
        effect: loc('universe_magic_effect')
    }
};
