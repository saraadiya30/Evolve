// Struktur luar angkasa awal skenario Cataclysm (satellite, depot, gps, nav beacon, dan seterusnya). Dulu bagian dari cataclysm_s1/_s2 (pecahan mekanis).
import { global } from '../../core/vars.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { actions } from '../../core/registries.js';

export function cataclysmSpace($ctx){
        global.space.satellite.count = 1;
        initStruct(actions.space.spc_home.propellant_depot); global.space.propellant_depot.count = 1;
        initStruct(actions.space.spc_home.gps); global.space.gps.count = 4;
        initStruct(actions.space.spc_home.nav_beacon); global.space.nav_beacon.count = 1; global.space.nav_beacon.on = 1;
        initStruct(actions.space.spc_moon.moon_base); global.space.moon_base.count = 1; global.space.moon_base.on = 1; global.space.moon_base.support = 3; global.space.moon_base.s_max = 3;
        initStruct(actions.space.spc_moon.iridium_mine); global.space.iridium_mine.count = 1; global.space.iridium_mine.on = 1;
        initStruct(actions.space.spc_moon.helium_mine); global.space.helium_mine.count = 1; global.space.helium_mine.on = 1;
        initStruct(actions.space.spc_moon.observatory); global.space.observatory.count = 1; global.space.observatory.on = 1;
        initStruct(actions.space.spc_red.spaceport); global.space.spaceport.count = 2; global.space.spaceport.on = 2; global.space.spaceport.support = 8; global.space.spaceport.s_max = 10;
        initStruct(actions.space.spc_red.red_tower); global.space.red_tower.count = 1; global.space.red_tower.on = 1;
        initStruct(actions.space.spc_red.living_quarters); global.space.living_quarters.count = 4; global.space.living_quarters.on = 4;
        initStruct(actions.space.spc_red.vr_center);
        initStruct(actions.space.spc_red.garage); global.space.garage.count = 1;
        initStruct(actions.space.spc_red.red_mine); global.space.red_mine.count = 1; global.space.red_mine.on = 1;
        initStruct(actions.space.spc_red.fabrication); global.space.fabrication.count = 1; global.space.fabrication.on = 1;
        initStruct(actions.space.spc_red.red_factory); global.space.red_factory.count = 1; global.space.red_factory.on = 1;
        initStruct(actions.space.spc_red.exotic_lab); global.space.exotic_lab.count = 1; global.space.exotic_lab.on = 1;
        initStruct(actions.space.spc_red.ziggurat);
        initStruct(actions.space.spc_red.space_barracks); global.space.space_barracks.count = 1; global.space.space_barracks.on = 1;
        initStruct(actions.space.spc_red.biodome); global.space.biodome.count = 2; global.space.biodome.on = 2;
        initStruct(actions.space.spc_hell.geothermal); global.space.geothermal.count = 2; global.space.geothermal.on = 2;
        initStruct(actions.space.spc_hell.spc_casino);
        initStruct(actions.space.spc_hell.swarm_plant);
        initStruct(actions.space.spc_sun.swarm_control); global.space.swarm_control.count = 5; global.space.swarm_control.support = 40; global.space.swarm_control.s_max = 50;
        initStruct(actions.space.spc_sun.swarm_satellite); global.space.swarm_satellite.count = 40;
        initStruct(actions.space.spc_gas.gas_mining); global.space.gas_mining.count = 2; global.space.gas_mining.on = 2;
        initStruct(actions.space.spc_gas.gas_storage); global.space.gas_storage.count = 1;
        initStruct(actions.space.spc_gas_moon.outpost);
        initStruct(actions.space.spc_gas_moon.drone);
        initStruct(actions.space.spc_gas_moon.oil_extractor); global.space.oil_extractor.count = 2; global.space.oil_extractor.on = 2;
        initStruct(actions.space.spc_belt.space_station); global.space.space_station.count = 1; global.space.space_station.on = 1; global.space.space_station.s_max = 3;
        initStruct(actions.space.spc_belt.iridium_ship); global.space.iridium_ship.count = 1; global.space.iridium_ship.on = 1;
        initStruct(actions.space.spc_belt.elerium_ship);
        initStruct(actions.space.spc_belt.iron_ship); global.space.iron_ship.count = 1; global.space.iron_ship.on = 1;
        initStruct(actions.space.spc_dwarf.elerium_contain);
}
