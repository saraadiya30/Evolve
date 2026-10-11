// Struktur fortress/wasteland, smelter, dan alloy factory awal skenario Warlord. Dulu bagian dari warlordSetup_s1/_s2 (pecahan mekanis).
import { global } from '../../core/vars.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { fortressModules } from '../../core/registries.js';
import { addSmelter } from '../../industry/industry_smelter.js';

export function warlordSetupFortress($ctx){
        initStruct(fortressModules.prtl_fortress.turret);
        initStruct(fortressModules.prtl_fortress.carport);
        initStruct(fortressModules.prtl_badlands.war_drone);
        initStruct(fortressModules.prtl_pit.soul_forge);
        initStruct(fortressModules.prtl_pit.soul_attractor);
        initStruct(fortressModules.prtl_ruins.guard_post);
        initStruct(fortressModules.prtl_lake.harbor);
        initStruct(fortressModules.prtl_spire.purifier);
        initStruct(fortressModules.prtl_spire.port);

        initStruct(fortressModules.prtl_wasteland.throne);
        initStruct(fortressModules.prtl_wasteland.incinerator); global.portal.incinerator.count = 1; global.portal.incinerator.on = 1;
        initStruct(fortressModules.prtl_wasteland.warehouse); global.portal.warehouse.count = 1;
        initStruct(fortressModules.prtl_wasteland.hovel); global.portal.hovel.count = 1;
        initStruct(fortressModules.prtl_wasteland.dig_demon); global.portal.dig_demon.count = 1; global.portal.dig_demon.on = 1;
        initStruct(fortressModules.prtl_wasteland.hell_casino); global.portal.hell_casino.count = 1; global.portal.hell_casino.on = 1;
        initStruct(fortressModules.prtl_wasteland.demon_forge); global.portal.demon_forge.count = 1; global.portal.demon_forge.on = 1;
        initStruct(fortressModules.prtl_wasteland.hell_factory); global.portal.hell_factory.count = 1; global.portal.hell_factory.on = 1;
        initStruct(fortressModules.prtl_wasteland.twisted_lab); global.portal.twisted_lab.count = 1; global.portal.twisted_lab.on = 1; global.portal.twisted_lab.Coal = 1;
        initStruct(fortressModules.prtl_wasteland.pumpjack); global.portal.pumpjack.count = 1;
        initStruct(fortressModules.prtl_wasteland.brute); global.portal.brute.count = 1; global.portal.brute.on = 1;

        addSmelter(10, 'Iron', 'Coal'); addSmelter(10, 'Steel', 'Coal');
        global.city.factory.Alloy = 2;
        global.city.factory.Polymer = 2;
        global.city.factory.Nano_Tube = 1;
        global.city.factory.Stanene = 1;
}
