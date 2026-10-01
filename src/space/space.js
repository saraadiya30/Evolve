import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { galaxyProjects } from '../core/registries.js';
export { astrialProjection, terraformProjection, convertSpaceSector, piracy, xeno_race, gatewayStorage, incrementStruct, spaceTech, interstellarTech, galaxyTech, checkSpaceRequirements, checkRequirements, renderSpace, deepSpace, galaxySpace } from './space_requirements.js';
export { house_adjust, iron_adjust, swarm_adjust, fuel_adjust, int_fuel_adjust, zigguratBonus, planetName, genPlanets, setUniverse } from './planet_generation.js';
export { ascendLab } from './ascend_lab.js';
export { terraformLab, isStargateOn } from './terraform_lab.js';




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
