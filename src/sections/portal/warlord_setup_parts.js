import { global } from '../../core/vars.js';
import { initStruct, actions, drawTech } from '../../actions/actions.js';
import { arpa } from '../../arpa/arpa.js';
import { fortressModules } from '../../portal/portal_registry.js';
import { addSmelter } from '../../industry/industry.js';
import { loadFoundry } from '../../civics/jobs.js';
import { renderFortress } from '../../portal/hell/fortress_and_spire_defense.js';

// Bagian dari warlordSetup (warlord_setup.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function warlordSetup_s1($ctx){
        global.tech['aerogel'] = 1;
        global.tech['agriculture'] = 7;
        global.tech['alloy'] = 1;
        global.tech['alumina'] = 2;
        global.tech['asteroid'] = 7;
        global.tech['banking'] = 11;
        global.tech['biotech'] = 1;
        global.tech['boot_camp'] = 2;
        global.tech['container'] = 8;
        global.tech['copper'] = 1;
        global.tech['currency'] = 6;
        global.tech['drone'] = 1;
        global.tech['elerium'] = 2;
        global.tech['explosives'] = 3;
        global.tech['factory'] = 3;
        global.tech['farm'] = 1;
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
        global.tech['high_tech'] = 17;
        global.tech['hoe'] = 5;
        global.tech['home_safe'] = 2;
        global.tech['housing'] = 3;
        global.tech['housing_reduction'] = 3;
        global.tech['infernite'] = 6;
        global.tech['kuiper'] = 2;
        global.tech['launch_facility'] = 1;
        global.tech['luna'] = 2;
        global.tech['marines'] = 2;
        global.tech['mars'] = 5;
        global.tech['mass'] = 1;
        global.tech['medic'] = 3;
        global.tech['military'] = 10;
        global.tech['mine_conveyor'] = 1;
        global.tech['mining'] = 4;
        global.tech['monument'] = 1;
        global.tech['nano'] = 1;
        global.tech['oil'] = 7;
        global.tech['pickaxe'] = 5;
        global.tech['polymer'] = 2;
        global.tech['primitive'] = 3;
        global.tech['q_factory'] = 1;
        global.tech['quantium'] = 1;
        global.tech['queue'] = 3;
        global.tech['reclaimer'] = 8;
        global.tech['r_queue'] = 1;
        global.tech['reproduction'] = 1;
        global.tech['rival'] = 1;
        global.tech['satellite'] = 1;
        global.tech['science'] = 21;
        global.tech['shelving'] = 3;
        global.tech['shipyard'] = 1;
        global.tech['smelting'] = 6;
        global.tech['solar'] = 5;
        global.tech['space'] = 6;
        global.tech['space_explore'] = 4;
        global.tech['space_housing'] = 1;
        global.tech['spy'] = 5;
        global.tech['stanene'] = 1;
        global.tech['steel_container'] = 7;
        global.tech['storage'] = 5;
        global.tech['swarm'] = 6;
        global.tech['syndicate'] = 0;
        global.tech['synthetic_fur'] = 1;
        global.tech['theology'] = 2;
        global.tech['titanium'] = 3;
        global.tech['trade'] = 3;
        global.tech['unify'] = 2;
        global.tech['uranium'] = 4;
        global.tech['v_train'] = 1;
        global.tech['vault'] = 4;
        global.tech['wharf'] = 1;
        global.tech['world_control'] = 1;
        global.tech['wsc'] = 0;
        global.tech['portal'] = 3;
        global.tech['hell_pit'] = 1;
        global.tech['hellspawn'] = 1;

        if (!global.race['joyless']){
            global.tech['theatre'] = 3;
            global.tech['broadcast'] = 2;
        }

        if (!global.race['flier']){
            global.tech['cement'] = 6;
            global.resource.Cement.display = true;
        }

        global.settings.showSpace = false;
        global.settings.showPortal = true;

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
        global.settings.spaceTabs = 6;
        global.settings.showGenetics = true;
        global.settings.arpa.physics = true;
        global.settings.arpa.genetics = true

        //global.civic.garrison.display = true;
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

        global.resource.Neutronium.display = true;
        global.resource.Adamantite.display = true;
        global.resource.Elerium.display = true;
        global.resource.Nano_Tube.display = true;
        global.resource.Graphene.display = true;
        global.resource.Stanene.display = true;
        global.resource.Orichalcum.display = true;
        global.resource.Bolognium.display = true;
        global.resource.Infernite.display = true;

        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Mythril.display = true;
        global.resource.Aerogel.display = true;

        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
            global.civic.lumberjack.display = true;
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.resource.Lumber.max = 10000000;
            global.resource.Lumber.amount = 10000000;
            global.resource.Plywood.amount = 2500000;
            global.resource.Lumber.crates = 30;
            global.resource.Lumber.containers = 30;
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
        global.resource.Aerogel.amount = 2500000;
        global.resource.Authority.amount = 80;

        if (!global.race['artifical']){
            global.resource.Food.crates = 10;
            global.resource.Food.containers = 10;
        }

        global.resource.Stone.crates = 30;
        global.resource.Stone.containers = 30;
        global.resource.Furs.crates = 30;
        global.resource.Furs.containers = 30;
        global.resource.Coal.crates = 10;
        global.resource.Coal.containers = 10;
        global.resource.Copper.crates = 30;
        global.resource.Copper.containers = 30;
        global.resource.Iron.crates = 30;
        global.resource.Iron.containers = 30;
        global.resource.Aluminium.crates = 30;
        global.resource.Aluminium.containers = 30;
        global.resource.Steel.crates = 30;
        global.resource.Steel.containers = 30;
        global.resource.Titanium.crates = 30;
        global.resource.Titanium.containers = 30;
        global.resource.Alloy.crates = 30;
        global.resource.Alloy.containers = 30;
        global.resource.Polymer.crates = 30;
        global.resource.Polymer.containers = 30;
        global.resource.Iridium.crates = 30;
        global.resource.Iridium.containers = 30;
        global.resource.Adamantite.crates = 30;
        global.resource.Adamantite.containers = 30;
        global.resource.Graphene.crates = 30;
        global.resource.Graphene.containers = 30;
        global.resource.Stanene.crates = 30;
        global.resource.Stanene.containers = 30;
        global.resource.Bolognium.crates = 30;
        global.resource.Bolognium.containers = 30;
        global.resource.Orichalcum.crates = 30;
        global.resource.Orichalcum.containers = 30;

        global.civic.taxes.display = true;

        if (!global.race['flier']){
            global.civic.cement_worker.display = true;
            global.resource.Cement.crates = 30;
            global.resource.Cement.containers = 30;
        }

        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.banker.display = true;

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
        global.tech['railway'] = 0;
        global.arpa['m_type'] = arpa('Monument');
}

export function warlordSetup_s2($ctx){
        if (!global.settings.msgFilters.hell.unlocked){
            global.settings.msgFilters.hell.unlocked = true;
            global.settings.msgFilters.hell.vis = true;
        }

        global.settings.showPortal = true;
        global.settings.portal.fortress = false;
        global.settings.portal.badlands = true;
        global.settings.portal.pit = false;
        global.settings.portal.wasteland = true;
        global.settings.portal.ruins = false;
        global.settings.portal.gate = false;
        global.settings.portal.lake = false;
        global.settings.portal.spire = false;
        global.settings.showCargo = false;
        global.settings.spaceTabs = 4;

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

        global.civic.d_job = 'lumberjack';
        global.civic.miner.display = true;
        if (!global.race['joyless']){
            global.civic.entertainer.display = true;
        }
        global.civic.craftsman.display = true;

        let citizens = actions.portal.prtl_wasteland.dig_demon.citizens() + actions.portal.prtl_wasteland.hovel.citizens();

        global.resource[global.race.species].max = citizens;
        global.resource[global.race.species].amount = citizens;

        global.civic.miner.max = actions.portal.prtl_wasteland.dig_demon.citizens();
        global.civic.miner.workers = actions.portal.prtl_wasteland.dig_demon.citizens();
        global.civic.miner.assigned = actions.portal.prtl_wasteland.dig_demon.citizens();

        global.civic.cement_worker.max = 5;
        global.civic.cement_worker.workers = 5;
        global.civic.cement_worker.assigned = 5;

        if (!global.race['joyless']){
            global.civic.entertainer.max = 3;
            global.civic.entertainer.workers = 3;
            global.civic.entertainer.assigned = 3;
        }

        global.civic.banker.max = 1;
        global.civic.banker.workers = 1;
        global.civic.banker.assigned = 1;

        global.civic.professor.max = 3;
        global.civic.professor.workers = 3;
        global.civic.professor.assigned = 3;

        global.civic.scientist.max = 2;
        global.civic.scientist.workers = 2;
        global.civic.scientist.assigned = 2;

        global.civic.govern.type = 'autocracy';

        if (global.race['calm']){
            global.resource.Zen.display = true;
            initStruct(actions.city.meditation);
        }
        if (global.race['cannibalize']){
            initStruct(actions.city.s_alter);
        }
        if (global.race['magnificent']){
            initStruct(actions.city.shrine);
        }

        global.portal['fortress'] = {
            threat: 10000,
            garrison: 0,
            walls: 100,
            repair: 0,
            patrols: 0,
            patrol_size: 10,
            siege: 999,
            notify: 'Yes',
            s_ntfy: 'Yes',
            nocrew: false,
        };
        global.portal.observe = {
            settings: {
                expanded: false,
                average: false,
                hyperSlow: false,
                display: 'game_days',
                dropKills: true,
                dropGems: true
            },
            stats: {
                total: {
                    start: { year: global.city.calendar.year, day: global.city.calendar.day },
                    days: 0,
                    wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                    kills: {
                        drones: 0,
                        patrols: 0,
                        sieges: 0,
                        guns: 0,
                        soul_forge: 0,
                        turrets: 0
                    },
                    gems: {
                        patrols: 0,
                        guns: 0,
                        soul_forge: 0,
                        crafted: 0,
                        turrets: 0,
                        surveyors: 0
                    },
                },
                period: {
                    start: { year: global.city.calendar.year, day: global.city.calendar.day },
                    days: 0,
                    wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                    kills: {
                        drones: 0,
                        patrols: 0,
                        sieges: 0,
                        guns: 0,
                        soul_forge: 0,
                        turrets: 0
                    },
                    gems: {
                        patrols: 0,
                        guns: 0,
                        soul_forge: 0,
                        crafted: 0,
                        turrets: 0,
                        surveyors: 0
                    },
                }
            },
            graphID: 0,
            graphs: {}
        };

        drawTech();
        arpa('Physics');
        loadFoundry();
        renderFortress();
}
