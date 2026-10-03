import { global } from '../core/vars.js';
import { setupRituals } from '../industry/industry.js';
import { initStruct, actions, drawTech } from '../actions/actions.js';
import { arpa } from '../arpa/arpa.js';
import { renderTauCeti } from '../truepath/truepath_f1.js';
import { loadFoundry } from '../civics/jobs.js';

// Bagian dari loneSurvivor (truepath_f3.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function loneSurvivor_s1($ctx){
        global.tech['alloy'] = 1;
        global.tech['alumina'] = 2;
        global.tech['asteroid'] = 7;
        global.tech['banking'] = 11;
        global.tech['biotech'] = 1;
        global.tech['boot_camp'] = 2;
        global.tech['container'] = 7;
        global.tech['copper'] = 1;
        global.tech['currency'] = 6;
        global.tech['disease'] = 2;
        global.tech['drone'] = 1;
        global.tech['elerium'] = 2;
        global.tech['explosives'] = 3;
        global.tech['factory'] = 3;
        global.tech['foundry'] = 8;
        global.tech['gambling'] = 4;
        global.tech['gas_giant'] = 1;
        global.tech['gas_moon'] = 2;
        global.tech['genesis'] = 2;
        global.tech['genetics'] = 2;
        global.tech['gov_corp'] = 1;
        global.tech['gov_fed'] = 1;
        global.tech['gov_soc'] = 1;
        global.tech['gov_theo'] = 1;
        global.tech['govern'] = 3;
        global.tech['graphene'] = 1;
        global.tech['helium'] = 1;
        global.tech['hell'] = 1;
        global.tech['high_tech'] = 13;
        global.tech['home_safe'] = 2;
        global.tech['housing'] = 3;
        global.tech['housing_reduction'] = 3;
        global.tech['kuiper'] = 2;
        global.tech['launch_facility'] = 1;
        global.tech['luna'] = 2;
        global.tech['m_smelting'] = 2;
        global.tech['marines'] = 2;
        global.tech['mars'] = 5;
        global.tech['mass'] = 1;
        global.tech['medic'] = 3;
        global.tech['military'] = 8;
        global.tech['mine_conveyor'] = 1;
        global.tech['mining'] = 4;
        global.tech['monument'] = 1;
        global.tech['nano'] = 1;
        global.tech['oil'] = 7;
        global.tech['outer'] = 8;
        global.tech['pickaxe'] = 5;
        global.tech['polymer'] = 2;
        global.tech['primitive'] = 3;
        global.tech['q_factory'] = 1;
        global.tech['quantium'] = 1;
        global.tech['queue'] = 3;
        global.tech['r_queue'] = 1;
        global.tech['reproduction'] = 1;
        global.tech['rival'] = 1;
        global.tech['satellite'] = 1;
        global.tech['science'] = 9;
        global.tech['shelving'] = 3;
        global.tech['shipyard'] = 1;
        global.tech['smelting'] = 6;
        global.tech['solar'] = 5;
        global.tech['space'] = 6;
        global.tech['space_explore'] = 4;
        global.tech['space_housing'] = 1;
        global.tech['spy'] = 5;
        global.tech['stanene'] = 1;
        global.tech['steel_container'] = 6;
        global.tech['storage'] = 5;
        global.tech['swarm'] = 6;
        global.tech['syard_armor'] = 3;
        global.tech['syard_class'] = 6;
        global.tech['syard_engine'] = 5;
        global.tech['syard_power'] = 5;
        global.tech['syard_sensor'] = 4;
        global.tech['syard_weapon'] = 6;
        global.tech['syndicate'] = 0;
        global.tech['synthetic_fur'] = 1;
        global.tech['tau_home'] = 6;
        global.tech['tauceti'] = 4;
        global.tech['theology'] = 2;
        global.tech['titan'] = 9;
        global.tech['titan_ai_core'] = 3;
        global.tech['titan_power'] = 1;
        global.tech['titanium'] = 3;
        global.tech['trade'] = 3;
        global.tech['unify'] = 2;
        global.tech['uranium'] = 4;
        global.tech['v_train'] = 1;
        global.tech['vault'] = 4;
        global.tech['wharf'] = 1;
        global.tech['world_control'] = 1;
        global.tech['wsc'] = 0;

        // Note: Joyless cannot be completed in Lone Survivor, and there is no reward for trying.
        if (!global.race['joyless']){
            global.tech['theatre'] = 3;
            global.tech['broadcast'] = 2;
        }

        if (!global.race['flier']){
            global.tech['cement'] = 5;
            global.resource.Cement.display = true;
        }

        if (global.race.universe === 'magic'){
            global.tech['gov_mage'] = 1;
            global.tech['magic'] = 4;
            global.tech['conjuring'] = 2;
            global.resource.Mana.display = true;
            global.resource.Crystal.display = true;
            global.civic.crystal_miner.display = true;
            global.tauceti['pylon'] = { count: 0 };
            setupRituals(true);
        }
        if(global.race.universe === 'evil'){
            global.tech['reclaimer'] = 1;
        }

        global.settings.showSpace = false;
        global.settings.showTau = true;
        global.settings.tau.home = true;

        global.settings.showCity = false;
        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;
        global.settings.civTabs = 1;
        global.settings.spaceTabs = 6;
        global.settings.showGenetics = true;
        global.settings.arpa.physics = true;
        global.settings.arpa.genetics = true

        global.resource[global.race.species].display = true;
        global.resource.Knowledge.display = true;
        global.resource.Money.display = true;
        global.resource.Crates.display = true;
        global.resource.Containers.display = true;

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

        global.resource.Water.display = true;
        global.resource.Neutronium.display = true;
        global.resource.Adamantite.display = true;
        global.resource.Elerium.display = true;
        global.resource.Nano_Tube.display = true;
        global.resource.Graphene.display = true;
        global.resource.Stanene.display = true;
        global.resource.Orichalcum.display = true;
        global.resource.Bolognium.display = true;
        global.resource.Unobtainium.display = true;

        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Mythril.display = true;
        global.resource.Quantium.display = true;
        global.resource.Cipher.display = true;

        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
            global.civic.lumberjack.display = true;
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.resource.Lumber.max = 10000000;
            global.resource.Lumber.amount = 10000000;
            global.resource.Plywood.amount = 2500000;
            global.resource.Lumber.crates = 25;
            global.resource.Lumber.containers = 25;
            global.tech['axe'] = 5;
        }
        if (global.race['smoldering']){
            global.resource.Chrysotile.display = true;
            global.resource.Chrysotile.max = 5000000;
            global.resource.Chrysotile.amount = 5000000;
        }
        if (!global.race['sappy']){
            global.tech['hammer'] = 4;
        }
        if (!global.race['apex_predator']){
            global.tech['armor'] = 3;
        }

        global.resource[global.race.species].max = 1;
        global.resource[global.race.species].amount = 1;
        global.resource.Crates.amount = 1000;
        global.resource.Containers.amount = 1000;
        global.resource.Money.max = 1000000000;
        global.resource.Money.amount = 1000000000;
        global.resource.Knowledge.max = 4321200;
        global.resource.Knowledge.amount = 4321200;
        global.resource.Food.max = 10000;
        global.resource.Food.amount = 10000;
        global.resource.Oil.max = 500000;
        global.resource.Oil.amount = 500000;
        global.resource.Helium_3.max = 500000;
        global.resource.Helium_3.amount = 500000;
        global.resource.Water.max = 25000;
        global.resource.Water.amount = 25000;
        global.resource.Uranium.max = 500000;
        global.resource.Uranium.amount = 500000;
        global.resource.Stone.max = 10000000;
        global.resource.Stone.amount = 10000000;
        global.resource.Furs.max = 5000000;
        global.resource.Furs.amount = 5000000;
        global.resource.Copper.max = 5000000;
        global.resource.Copper.amount = 5000000;
        global.resource.Iron.max = 5000000;
        global.resource.Iron.amount = 5000000;
        global.resource.Steel.max = 5000000;
        global.resource.Steel.amount = 5000000;
        global.resource.Aluminium.max = 5000000;
        global.resource.Aluminium.amount = 5000000;
        global.resource.Cement.max = 5000000;
        global.resource.Cement.amount = 5000000;
        global.resource.Titanium.max = 5000000;
        global.resource.Titanium.amount = 5000000;
        global.resource.Coal.max = 5000000;
        global.resource.Coal.amount = 5000000;
        global.resource.Alloy.max = 5000000;
        global.resource.Alloy.amount = 5000000;
        global.resource.Polymer.max = 5000000;
        global.resource.Polymer.amount = 5000000;
        global.resource.Iridium.max = 5000000;
        global.resource.Iridium.amount = 5000000;
        global.resource.Neutronium.max = 500000;
        global.resource.Neutronium.amount = 500000;
        global.resource.Adamantite.max = 5000000;
        global.resource.Adamantite.amount = 5000000;
        global.resource.Elerium.max = 1000;
        global.resource.Elerium.amount = 1000;
        global.resource.Nano_Tube.max = 5000000;
        global.resource.Nano_Tube.amount = 5000000;
        global.resource.Graphene.max = 5000000;
        global.resource.Graphene.amount = 5000000;
        global.resource.Stanene.max = 5000000;
        global.resource.Stanene.amount = 5000000;
        global.resource.Bolognium.max = 5000000;
        global.resource.Bolognium.amount = 5000000;
        global.resource.Orichalcum.max = 5000000;
        global.resource.Orichalcum.amount = 5000000;
        global.resource.Brick.amount = 2500000;
        global.resource.Wrought_Iron.amount = 2500000;
        global.resource.Sheet_Metal.amount = 2500000;
        global.resource.Mythril.amount = 2500000;
        global.resource.Quantium.amount = 2500000;

        if (!global.race['artifical']){
            global.resource.Food.crates = 10;
            global.resource.Food.containers = 10;
        }
        global.resource.Stone.crates = 25;
        global.resource.Stone.containers = 25;
        global.resource.Furs.crates = 25;
        global.resource.Furs.containers = 25;
        global.resource.Coal.crates = 10;
        global.resource.Coal.containers = 10;
        global.resource.Copper.crates = 25;
        global.resource.Copper.containers = 25;
        global.resource.Iron.crates = 25;
        global.resource.Iron.containers = 25;
        global.resource.Aluminium.crates = 25;
        global.resource.Aluminium.containers = 25;
        global.resource.Steel.crates = 25;
        global.resource.Steel.containers = 25;
        global.resource.Titanium.crates = 25;
        global.resource.Titanium.containers = 25;
        global.resource.Alloy.crates = 25;
        global.resource.Alloy.containers = 25;
        global.resource.Polymer.crates = 25;
        global.resource.Polymer.containers = 25;
        global.resource.Iridium.crates = 25;
        global.resource.Iridium.containers = 25;
        global.resource.Adamantite.crates = 25;
        global.resource.Adamantite.containers = 25;
        global.resource.Graphene.crates = 25;
        global.resource.Graphene.containers = 25;
        global.resource.Stanene.crates = 25;
        global.resource.Stanene.containers = 25;
        global.resource.Bolognium.crates = 25;
        global.resource.Bolognium.containers = 25;
        global.resource.Orichalcum.crates = 25;
        global.resource.Orichalcum.containers = 25;

        global.civic.taxes.display = true;

        if (!global.race['flier']){
            global.civic.cement_worker.display = true;
            global.resource.Cement.crates = 25;
            global.resource.Cement.containers = 25;
        }

        if (!global.race['sappy']){
            global.civic.quarry_worker.display = true
        }
        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.banker.display = true;
        global.civic.pit_miner.display = true;

        global.civic.professor.max = 1;
        global.civic.professor.workers = 1;

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
        initStruct(actions.space.spc_dwarf.mass_relay); global.space.mass_relay.count = 100;
        initStruct(actions.space.spc_dwarf.shipyard);
        initStruct(actions.space.spc_enceladus.munitions_depot);
        initStruct(actions.space.spc_enceladus.operating_base);
        initStruct(actions.space.spc_enceladus.water_freighter);
        initStruct(actions.space.spc_enceladus.zero_g_lab);
        initStruct(actions.space.spc_eris.digsite);
        initStruct(actions.space.spc_eris.drone_control);
        initStruct(actions.space.spc_eris.shock_trooper);
        initStruct(actions.space.spc_eris.tank);
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
        initStruct(actions.space.spc_kuiper.elerium_mine);
        initStruct(actions.space.spc_kuiper.neutronium_mine);
        initStruct(actions.space.spc_kuiper.orichalcum_mine);
        initStruct(actions.space.spc_kuiper.uranium_mine);
        initStruct(actions.space.spc_moon.helium_mine);
}

export function loneSurvivor_s2($ctx){
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
        initStruct(actions.space.spc_titan.ai_colonist);
        initStruct(actions.space.spc_titan.decoder);
        initStruct(actions.space.spc_titan.electrolysis);
        initStruct(actions.space.spc_titan.g_factory);
        initStruct(actions.space.spc_titan.hydrogen_plant);
        initStruct(actions.space.spc_titan.storehouse);
        initStruct(actions.space.spc_titan.titan_bank);
        initStruct(actions.space.spc_titan.titan_mine);
        initStruct(actions.space.spc_titan.titan_quarters);
        initStruct(actions.space.spc_titan.titan_spaceport);
        initStruct(actions.space.spc_triton.crashed_ship); global.space.crashed_ship.count = 100;
        initStruct(actions.space.spc_triton.fob);
        initStruct(actions.space.spc_triton.lander);

        initStruct(actions.tauceti.tau_gas.refueling_station);
        initStruct(actions.tauceti.tau_home.alien_outpost); global.tauceti.alien_outpost.count = 1; global.tauceti.alien_outpost.on = 1;
        initStruct(actions.tauceti.tau_home.colony); global.tauceti.colony.count = 1; global.tauceti.colony.on = 1;
        initStruct(actions.tauceti.tau_home.fusion_generator); global.tauceti.fusion_generator.count = 1; global.tauceti.fusion_generator.on = 1;
        initStruct(actions.tauceti.tau_home.infectious_disease_lab);
        initStruct(actions.tauceti.tau_home.mining_pit); global.tauceti.mining_pit.count = 1; global.tauceti.mining_pit.on = 1;
        initStruct(actions.tauceti.tau_home.orbital_station); global.tauceti.orbital_station.count = 1; global.tauceti.orbital_station.on = 1;
        initStruct(actions.tauceti.tau_home.repository); global.tauceti.repository.count = 2;
        initStruct(actions.tauceti.tau_home.tauceti_casino);
        initStruct(actions.tauceti.tau_red.orbital_platform);

        global.space['ai_core'] = { count: 100 };
        global.space['ai_core2'] = { count: 0, on: 0 };
        global.space['m_relay'] = { count: 0, on: 0 };

        global.arpa['sequence'] = {
            max: 50000,
            progress: 0,
            time: 50000,
            on: true,
            boost: false,
            auto: false,
            labs: 0,
        };

        global.tech['stock_exchange'] = 0;
        global.tech['monuments'] = 0;
        global.tech['supercollider'] = 0;
        global.tech['tp_depot'] = 0;
        global.tech['railway'] = 0;
        global.tech['isolation'] = 1;
        global.race['truepath'] = 1;
        global.arpa['m_type'] = arpa('Monument');

        drawTech();
        renderTauCeti();
        arpa('Physics');
        loadFoundry();
}
