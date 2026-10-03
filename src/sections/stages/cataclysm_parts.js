import { global } from '../../core/vars.js';
import { jobScale, loadFoundry } from '../../civics/jobs.js';
import { initStruct } from '../../actions/core/modals_labels_and_struct_init.js';
import { actions } from '../../actions/core/registry.js';
import { addSmelter } from '../../industry/industry.js';
import { drawCity } from '../../actions/challenge/challenge_effects_and_tech_requirements.js';
import { drawTech } from '../../actions/core/action_setup_and_execution.js';
import { renderSpace } from '../../space/space.js';
import { arpa } from '../../arpa/arpa.js';

// Bagian dari cataclysm (simulation_ai_and_fanaticism.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function cataclysm_s1($ctx){
        global.tech['unify'] = 2;
        global.tech['spy'] = 5;
        global.tech['primitive'] = 3;
        global.tech['currency'] = 6;
        global.tech['govern'] = 3;
        global.tech['boot_camp'] = 1;
        global.tech['medic'] = 1;
        global.tech['military'] = 5;
        global.tech['marines'] = 1;
        global.tech['explosives'] = 3;
        global.tech['trade'] = 3;
        global.tech['wharf'] = 1;
        global.tech['banking'] = 6;
        global.tech['gambling'] = 1;
        global.tech['home_safe'] = 1;
        global.tech['housing'] = 3;
        global.tech['smelting'] = 3;
        global.tech['copper'] = 1;
        global.tech['storage'] = 5;
        global.tech['container'] = 4;
        global.tech['steel_container'] = 3;
        global.tech['mining'] = 4;
        global.tech['oil'] = 7;
        global.tech['mass'] = 1;
        global.tech['alumina'] = 1;
        global.tech['titanium'] = 2;
        global.tech['polymer'] = 2;
        global.tech['uranium'] = 4;
        global.tech['foundry'] = 7;
        global.tech['factory'] = 1;
        global.tech['theatre'] = 3;
        global.tech['broadcast'] = 2;
        global.tech['mine_conveyor'] = 1;
        global.tech['science'] = 9;
        global.tech['high_tech'] = 7;
        global.tech['genetics'] = 1;
        global.tech['theology'] = 2;
        global.tech['space'] = 6;
        global.tech['solar'] = 3;
        global.tech['luna'] = 2;
        global.tech['hell'] = 1;
        global.tech['mars'] = 5;
        global.tech['gas_giant'] = 1;
        global.tech['gas_moon'] = 2;
        global.tech['asteroid'] = 3;
        global.tech['satellite'] = 1;
        global.tech['space_explore'] = 4;
        global.tech['genesis'] = 2;

        // Begin with a biodome: joyless is incompatible with Cataclysm
        if (global.race['joyless']) {
            delete global.race['joyless'];
        }

        global.settings.showSpace = true;
        global.settings.space.home = true;
        global.settings.space.moon = true;
        global.settings.space.red = true;
        global.settings.space.hell = true;
        global.settings.space.sun = true;
        global.settings.space.gas = true;
        global.settings.space.gas_moon = true;
        global.settings.space.belt = true;
        global.settings.space.dwarf = true;

        global.settings.showCity = false;
        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showMil = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;
        global.settings.civTabs = 1;
        global.settings.spaceTabs = 1;
        global.settings.showGenetics = true;
        global.settings.arpa.physics = true;

        global.resource[global.race.species].display = true;
        global.resource.Knowledge.display = true;
        global.resource.Money.display = true;
        global.resource.Food.display = true;

        global.resource.Stone.display = true;
        global.resource.Furs.display = true;
        global.resource.Copper.display = true;
        global.resource.Iron.display = true;
        global.resource.Aluminium.display = true;
        global.resource.Coal.display = true;
        global.resource.Oil.display = true;
        global.resource.Uranium.display = true;
        global.resource.Steel.display = true;
        global.resource.Titanium.display = true;
        global.resource.Alloy.display = true;
        global.resource.Polymer.display = true;
        global.resource.Iridium.display = true;
        global.resource.Helium_3.display = true;
        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Mythril.display = true;
        global.resource.Crates.display = true;
        global.resource.Containers.display = true;

        if (!global.race['flier']){
            global.resource.Cement.display = true;
            global.resource.Cement.max = 75000;
            global.resource.Cement.amount = 75000;
        }
        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.resource.Lumber.max = 90000;
            global.resource.Lumber.amount = 90000;
            global.resource.Plywood.amount = 50000;
        }
        if (global.race['smoldering']){
            global.resource.Chrysotile.display = true;
            global.resource.Chrysotile.max = 90000;
            global.resource.Chrysotile.amount = 90000;
        }

        global.resource[global.race.species].max = 8;
        global.resource[global.race.species].amount = 8;
        global.resource.Crates.amount = 20;
        global.resource.Containers.amount = 20;
        global.resource.Money.max = 225000;
        global.resource.Money.amount = 225000;
        global.resource.Food.max = 1000;
        global.resource.Food.amount = 1000;
        global.resource.Oil.max = 1000;
        global.resource.Oil.amount = 1000;
        global.resource.Helium_3.max = 1000;
        global.resource.Helium_3.amount = 1000;
        global.resource.Uranium.max = 1000;
        global.resource.Uranium.amount = 1000;
        global.resource.Stone.max = 90000;
        global.resource.Stone.amount = 90000;
        global.resource.Furs.max = 40000;
        global.resource.Furs.amount = 40000;
        global.resource.Copper.max = 75000;
        global.resource.Copper.amount = 75000;
        global.resource.Iron.max = 75000;
        global.resource.Iron.amount = 75000;
        global.resource.Steel.max = 75000;
        global.resource.Steel.amount = 75000;
        global.resource.Aluminium.max = 75000;
        global.resource.Aluminium.amount = 75000;
        global.resource.Titanium.max = 75000;
        global.resource.Titanium.amount = 75000;
        global.resource.Coal.max = 10000;
        global.resource.Coal.amount = 10000;
        global.resource.Alloy.max = 20000;
        global.resource.Alloy.amount = 20000;
        global.resource.Polymer.max = 20000;
        global.resource.Polymer.amount = 20000;
        global.resource.Iridium.max = 1000;
        global.resource.Iridium.amount = 1000;
        global.resource.Brick.amount = 50000;
        global.resource.Wrought_Iron.amount = 50000;
        global.resource.Sheet_Metal.amount = 50000;
        global.resource.Mythril.amount = 8000;

        global.resource.Iridium.crates = 5;
        global.resource.Iridium.containers = 5;

        global.civic.taxes.display = true;

        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.colonist.display = true;
        global.civic.space_miner.display = true;
        global.civic.craftsman.display = true;

        if (!global.race['flier']){
            global.tech['cement'] = 5;
            global.civic.cement_worker.display = true;
            global.civic.cement_worker.max = jobScale(1);
            global.civic.cement_worker.workers = jobScale(1);
        }

        global.civic.colonist.max = jobScale(4);
        global.civic.colonist.workers = jobScale(4);
        global.civic.space_miner.max = jobScale(3);
        global.civic.space_miner.workers = jobScale(2);
        global.civic.professor.max = jobScale(1);
        global.civic.professor.workers = jobScale(1);

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
}

export function cataclysm_s2($ctx){
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

        initStruct(actions.space.spc_home.satellite); global.space.satellite.count = 1;
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

        global.civic['garrison'] = {
            display: true,
            disabled: false,
            progress: 0,
            tactic: 0,
            workers: 2,
            wounded: 0,
            raid: 0,
            max: 2
        };

        drawCity();
        drawTech();
        renderSpace();
        arpa('Physics');
        loadFoundry();
}
