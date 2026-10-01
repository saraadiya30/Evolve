// Kalender, bangunan kota, dan struktur luar angkasa (hingga swarm satellite) awal skenario Warlord.
import { global } from '../../core/vars.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { actions } from '../../core/registries.js';

export function warlordSetupCitySpace($ctx){
        global.city.calendar.day++;
        global.city.market.active = true;
        global.city['power'] = 0;
        global.city['powered'] = true;

        if (global.race['artifical']){
            global.city['transmitter'] = { count: 0, on: 0 };
        }

        initStruct(actions.city.factory);
        initStruct(actions.city.foundry);
        initStruct(actions.city.smelter);

        initStruct(actions.city.amphitheatre);
        initStruct(actions.city.apartment);
        initStruct(actions.city.bank);
        initStruct(actions.city.basic_housing);
        initStruct(actions.city.biolab);
        initStruct(actions.city.boot_camp);
        initStruct(actions.city.casino);
        initStruct(actions.city.cement_plant);
        initStruct(actions.city.coal_mine);
        initStruct(actions.city.coal_power);
        initStruct(actions.city.cottage);
        initStruct(actions.city.fission_power);
        initStruct(actions.city.garrison);
        initStruct(actions.city.hospital);
        initStruct(actions.city.library);
        initStruct(actions.city.lumber_yard);
        initStruct(actions.city.mass_driver);
        initStruct(actions.city.metal_refinery);
        initStruct(actions.city.mine);
        initStruct(actions.city.oil_depot);
        initStruct(actions.city.oil_power);
        initStruct(actions.city.oil_well);
        initStruct(actions.city.rock_quarry);
        initStruct(actions.city.sawmill);
        initStruct(actions.city.shed);
        initStruct(actions.city.storage_yard);
        initStruct(actions.city.temple);
        initStruct(actions.city.tourist_center);
        initStruct(actions.city.trade);
        initStruct(actions.city.university);
        initStruct(actions.city.wardenclyffe);
        initStruct(actions.city.warehouse);
        initStruct(actions.city.wharf);

        initStruct(actions.space.spc_belt.elerium_ship);
        initStruct(actions.space.spc_belt.iridium_ship);
        initStruct(actions.space.spc_belt.iron_ship);
        initStruct(actions.space.spc_belt.space_station);
        initStruct(actions.space.spc_dwarf.e_reactor);
        initStruct(actions.space.spc_dwarf.elerium_contain);
        initStruct(actions.space.spc_dwarf.shipyard);
        initStruct(actions.space.spc_gas.gas_mining);
        initStruct(actions.space.spc_gas.gas_storage);
        initStruct(actions.space.spc_gas_moon.drone);
        initStruct(actions.space.spc_gas_moon.oil_extractor);
        initStruct(actions.space.spc_gas_moon.outpost);
        initStruct(actions.space.spc_hell.geothermal);
        initStruct(actions.space.spc_hell.hell_smelter);
        initStruct(actions.space.spc_hell.spc_casino);
        initStruct(actions.space.spc_hell.swarm_plant);
        initStruct(actions.space.spc_home.gps);
        initStruct(actions.space.spc_home.nav_beacon);
        initStruct(actions.space.spc_home.propellant_depot);
        initStruct(actions.space.spc_home.satellite);
        initStruct(actions.space.spc_moon.helium_mine);
        initStruct(actions.space.spc_moon.iridium_mine);
        initStruct(actions.space.spc_moon.moon_base);
        initStruct(actions.space.spc_moon.observatory);
        initStruct(actions.space.spc_red.biodome);
        initStruct(actions.space.spc_red.exotic_lab);
        initStruct(actions.space.spc_red.fabrication);
        initStruct(actions.space.spc_red.garage);
        initStruct(actions.space.spc_red.living_quarters);
        initStruct(actions.space.spc_red.red_factory);
        initStruct(actions.space.spc_red.red_mine);
        initStruct(actions.space.spc_red.red_tower);
        initStruct(actions.space.spc_red.space_barracks);
        initStruct(actions.space.spc_red.spaceport);
        initStruct(actions.space.spc_red.vr_center);
        initStruct(actions.space.spc_red.ziggurat);
        initStruct(actions.space.spc_sun.swarm_control);
        initStruct(actions.space.spc_sun.swarm_satellite);
}
