// Bangunan kota awal skenario Cataclysm (initStruct kota, smelter). Dulu bagian dari cataclysm_s1/_s2 (pecahan mekanis).
import { global } from '../../core/vars.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { actions } from '../../core/registries.js';
import { addSmelter } from '../../industry/industry_smelter.js';

export function cataclysmCity($ctx){
        global.city.calendar.day++;
        global.city.market.active = true;
        global.city['power'] = 0;
        global.city['powered'] = true;

        if (global.race['artifical']){
            initStruct(actions.city.transmitter);
        }
        initStruct(actions.city.factory);
        initStruct(actions.city.foundry);
        initStruct(actions.city.smelter); addSmelter(1, 'Iron'); addSmelter(1, 'Steel');
        initStruct(actions.city.fission_power);
        initStruct(actions.city.oil_power);
        initStruct(actions.city.coal_power);
        initStruct(actions.city.mass_driver);
        initStruct(actions.city.mine);
        initStruct(actions.city.coal_mine);
        initStruct(actions.city.oil_well);
        initStruct(actions.city.oil_depot);
        initStruct(actions.city.garrison);
        initStruct(actions.city.basic_housing);
        initStruct(actions.city.cottage);
        initStruct(actions.city.apartment);
        initStruct(actions.city.amphitheatre);

        initStruct(actions.city.casino);
        initStruct(actions.city.rock_quarry);
        initStruct(actions.city.metal_refinery);
        initStruct(actions.city.storage_yard);
        initStruct(actions.city.warehouse);
        initStruct(actions.city.trade);
        initStruct(actions.city.wharf);
        initStruct(actions.city.bank);
        initStruct(actions.city.tourist_center);
        initStruct(actions.city.university);
        initStruct(actions.city.library);
        initStruct(actions.city.wardenclyffe);
        initStruct(actions.city.biolab);
        initStruct(actions.city.lumber_yard);
        initStruct(actions.city.sawmill);
        initStruct(actions.city.temple);

        initStruct(actions.space.spc_home.satellite);
}
