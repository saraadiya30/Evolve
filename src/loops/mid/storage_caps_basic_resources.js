import { global, breakdown, int_on, support_on, p_on, quantum_level } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { checkAffordable, templeCount } from '../../actions/core/action_costs.js';
import { structName, housingLabel } from '../../actions/core/structure_ui.js';
import { BHStorageMulti, storageMultipler } from '../../actions/challenge/challenge_rules.js';
import { bank_vault } from '../../actions/core/queue_callbacks.js';
import { checkAdept } from '../../achievements/achievement_logic.js';
import { loc } from '../../core/locale.js';
import { garrisonSize, weaponTechModifer } from '../../civics/military/army_rating.js';
import { govTitle } from '../../civics/military/government_definitions.js';
import { petMorale } from '../../systems/morale_core.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { workerScale } from '../../civics/jobs/job_definitions.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { racialTrait, servantTrait } from '../../races/trait_logic/racial_traits.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { spatialReasoning } from '../../resources/resources.js';
import { faithTempleCount } from '../../resources/aether_alchemy.js';
import { govActive } from '../../governor/governor.js';
import { messageQueue } from '../../functions/message_log.js';
import { shrineBonusActive, getShrineBonus } from '../../functions/run_stats_helpers.js';
import { hellSupression } from '../../portal/mech/hellguard.js';
import { planetName } from '../../space/planet_generation.js';
import { gatewayStorage, piracy } from '../../space/space_requirements.js';
import { tpStorageMultiplier } from '../../truepath/support.js';

// Bagian dari midLoop (main.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function midLoop_s1($ctx){
        let base = 100;
        if (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l > 1){
            base += 50 * (global.stats.achieve['mass_extinction'].l - 1);
        }
        $ctx.caps = {
            RNA: base,
            DNA: base
        };
        if (global.evolution['membrane']){
            let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
            $ctx.caps['RNA'] += global.evolution['membrane'].count * effect;
        }
        if (global.evolution['eukaryotic_cell']){
            let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
            $ctx.caps['DNA'] += global.evolution['eukaryotic_cell'].count * effect;
        }

        global.resource.RNA.max = $ctx.caps['RNA'];
        global.resource.DNA.max = $ctx.caps['DNA'];

        Object.keys(actions.evolution).forEach(function (action){
            if (actions.evolution[action] && actions.evolution[action].cost){
                let c_action = actions.evolution[action];
                let element = $('#'+c_action.id);
                if (element.length > 0){
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                        if (checkAffordable(c_action)){
                            if (element.hasClass('cna')){
                                element.removeClass('cna');
                            }
                        }
                        else if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                    else {
                        if (!element.hasClass('cnam')){
                            element.addClass('cnam');
                        }
                        if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                }
            }
        });
}

export function midLoop_s2($ctx){
        $ctx.caps = {
            Money: 1000,
            Slave: 0,
            Authority: global.race['cataclysm'] || global.race['orbit_decayed'] ? 90 : (global.race['lone_survivor'] ? 100 : 80),
            Mana: 0,
            Energy: 100,
            Sus: 100,
            Knowledge: global.stats.achieve['extinct_junker'] && global.stats.achieve['extinct_junker'].l >= 1 ? 1000 : 100,
            Omniscience: 0,
            Zen: 0,
            Food: 1000,
            Crates: 0,
            Containers: 0,
            Lumber: 200,
            Stone: 200,
            Chrysotile: 200,
            Crystal: 10,
            Furs: 100,
            Copper: 100,
            Iron: 100,
            Cement: 100,
            Coal: 50,
            Oil: 0,
            Uranium: 10,
            Aluminium: 50,
            Steel: 50,
            Titanium: 50,
            Alloy: 50,
            Polymer: 50,
            Iridium: 0,
            Helium_3: 0,
            Water: 0,
            Deuterium: 0,
            Neutronium: 0,
            Adamantite: 0,
            Infernite: 0,
            Elerium: 1,
            Nano_Tube: 0,
            Graphene: 0,
            Stanene: 0,
            Bolognium: 0,
            Vitreloy: 0,
            Orichalcum: 0,
            Asphodel_Powder: 0,
            Elysanite: 0,
            Unobtainium: 0,
            Cipher: 0,
            Nanite: 0,
            Materials: 0,
        };
        // labor caps
        $ctx.lCaps = {
            unemployed: -1,
            hunter: -1,
            forager: -1,
            farmer: -1,
            lumberjack: -1,
            quarry_worker: -1,
            crystal_miner: -1,
            scavenger: -1,
            teamster: -1,
            meditator: -1,
            torturer: 0,
            miner: 0,
            coal_miner: 0,
            craftsman: 0,
            cement_worker: 0,
            banker: 0,
            entertainer: 0,
            priest: 0,
            professor: 0,
            scientist: 0,
            garrison: 0,
            colonist: 0,
            titan_colonist: 0,
            space_miner: 0,
            hell_surveyor: 0,
            archaeologist: 0,
            ghost_trapper: 0,
            elysium_miner: 0,
            pit_miner: 0,
            crew: 0
        };

        if (global.race['cataclysm']){
            $ctx.caps['Money'] += 250000;
            $ctx.caps['Knowledge'] += 100000;
            $ctx.caps['Lumber'] += 100000;
            $ctx.caps['Stone'] += 100000;
            $ctx.caps['Chrysotile'] += 100000;
            $ctx.caps['Furs'] += 100000;
            $ctx.caps['Aluminium'] += 100000;
            $ctx.caps['Steel'] += 100000;
            $ctx.caps['Copper'] += 100000;
            $ctx.caps['Iron'] += 100000;
            $ctx.caps['Coal'] += 100000;
            $ctx.caps['Cement'] += 100000;
            $ctx.caps['Titanium'] += 75000;
            $ctx.caps['Alloy'] += 20000;
            $ctx.caps['Polymer'] += 20000;
            $ctx.caps['Uranium'] += 1000;
        }
        else if (global.race['lone_survivor']){
            $ctx.caps['Money'] += 1000000000;
            $ctx.caps['Knowledge'] += 100000;
            $ctx.caps['Food'] += 9000;
            $ctx.caps['Water'] += 10000;
            $ctx.caps['Elerium'] += 999;
        }

        if (global.stats.feat['adept']){
            let rank = checkAdept();
            if (global.race['smoldering']){
                $ctx.caps['Chrysotile'] += rank * 60;
            }
            else {
                $ctx.caps['Lumber'] += rank * 60;
            }
            $ctx.caps['Stone'] += rank * 60;
        }

        if (global.race.hasOwnProperty('psychicPowers') && global.race.psychicPowers.hasOwnProperty('channel')){
            $ctx.caps['Energy'] -= global.race.psychicPowers.channel.boost;
            $ctx.caps['Energy'] -= global.race.psychicPowers.channel.assault;
            $ctx.caps['Energy'] -= global.race.psychicPowers.channel.cash;
            if ($ctx.caps['Energy'] < 0){
                $ctx.caps['Energy'] = 100;
                global.race.psychicPowers.channel.boost = 0;
                global.race.psychicPowers.channel.assault = 0;
                global.race.psychicPowers.channel.cash = 0;
            }
        }

        $ctx.caps[global.race.species] = 0;

        breakdown.c = {};
        Object.keys($ctx.caps).forEach(function(res){
            breakdown.c[res] = { [loc('base')]: $ctx.caps[res]+'v' };
        });

        if (global.race.universe === 'evil' && global.tech['primitive'] && global.tech.primitive >= 3){
            global.resource.Authority.display = true;
            let garrison = garrisonSize() || 0;

            if (global.civic.govern.type === 'autocracy'){
                let gain = 10;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('govern_autocracy')] = gain+'v';
            }
            else if (global.civic.govern.type === 'oligarchy'){
                let gain = 20;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('govern_oligarchy')] = gain+'v';
            }
            if (global.city['garrison']){
                let gain = global.city.garrison.on * 0.5;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[actions.city.garrison.title()] = gain+'v';
            }
            if (global.city['temple'] && !global.race['warlord']){
                let gain = templeCount() * 0.5;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[structName('temple')] = gain+'v';
            }
            if (global.space['space_barracks']){
                let gain = global.space.space_barracks.on * (global.race['cataclysm'] ? 2 : 1);
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('space_red_space_barracks_title')] = gain+'v';
            }
            if (global.interstellar['cruiser'] && int_on['cruiser']){
                let gain = int_on['cruiser'];
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('interstellar_cruiser_title')] = gain+'v';
            }
            if (global.race['warlord']){
                let gain = global.race?.absorbed?.length || 1;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('portal_throne_of_evil_title')] = gain+'v';
            }
            if (global.portal['brute']){
                let gain = global.portal.brute.on;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('portal_brute_bd')] = gain+'v';
            }
            if (global.portal['minions']){
                let gain = global.portal.minions.on;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('portal_minions_bd')] = gain+'v';
            }
            if (global.race['warlord'] && global.eden['bunker'] && support_on['bunker']){
                let gain = support_on['bunker'];
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('eden_bunker_title')] = gain+'v';
            }
            if (global.race['lone_survivor'] || global.tech['isolation']){
                let gain = p_on['orbital_station'];
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('tau_home_orbital_station')] = gain+'v';
            }

            let pet = 0;
            if (global.race['pet']){
                pet = petMorale(global.race.pet);
                $ctx.caps.Authority += pet;
                breakdown.c.Authority[loc(`event_pet_${global.race.pet.type}_owner`)] = pet+'v';
            }

            global.resource.Authority.amount = global.race['cataclysm'] || global.race['orbit_decayed'] ? 90 : (global.race['lone_survivor'] ? 100 : 80);
            if (global.city.morale.current > 100){
                let excess = global.city.morale.current - 100;
                if (global.civic.govern.type === 'democracy'){
                    excess *= 0.9;
                }
                global.resource.Authority.amount -= excess;
            }

            if (global.civic['garrison']){
                let adjust = 0.7;
                if (global.tech['evil']){
                    adjust += 0.1 * global.tech.evil;
                }
                if (global.portal['fortress']){
                    garrison += global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
                }
                let gain = highPopAdjust(garrison) * adjust;
                if (global.race['grenadier']){ gain *= 1.75; }
                if (global.civic.govern.type === 'autocracy'){
                    gain *= 1.08;
                }
                else if (global.civic.govern.type === 'dictator'){
                    gain *= 1.12;
                }
                global.resource.Authority.amount += gain;
            }

            if (pet !== 0){
                global.resource.Authority.amount += pet;
            }

            if ((global.race['lone_survivor'] || global.tech['isolation']) && global.tauceti['colony'] && support_on['colony']){
                global.resource.Authority.amount += support_on['colony'] * 5;
            }

            global.resource.Authority.amount = Math.floor(global.resource.Authority.amount);
            if (global.resource.Authority.amount < 0){ global.resource.Authority.amount = 0; }
        }
        else {
            global.resource.Authority.display = false;
        }

        if (global.race['unfathomable'] && global.city['captive_housing']){
            let strength = weaponTechModifer();
            let hunt = workerScale(global.civic.hunter.workers,'hunter')
            hunt *= racialTrait(hunt,'hunting') * strength;
            if (global.race['swift']){
                hunt *= 1 + (traits.swift.vars()[1] / 100);
            }

            if (global.race['servants']){
                let serve = global.race.servants.jobs.hunter * strength;
                serve *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                hunt += serve;
            }

            let usedCap = 0;
            let thralls = 0;
            let imprisoned = [];
            if (global.city.hasOwnProperty('surfaceDwellers')){
                for (let i = 0; i < global.city.surfaceDwellers.length; i++){
                    let mindbreak = global.city.captive_housing[`race${i}`];
                    let jailed = global.city.captive_housing[`jailrace${i}`];
                    usedCap += mindbreak + jailed;
                    thralls += mindbreak;
                    if (jailed > 0){
                        imprisoned.push(i);
                    }
                }
            }

            let catchVar = Math.round(40 / traits.unfathomable.vars()[1]);
            if (usedCap < global.city.captive_housing.raceCap && Math.rand(0,(catchVar * usedCap) - hunt) <= 0){
                let k = Math.rand(0,global.city.surfaceDwellers.length);
                global.city.captive_housing[`jailrace${k}`]++;
            }

            if (global.tech['unfathomable'] && global.tech.unfathomable >= 2 && global.civic.torturer.workers > 0 && imprisoned.length > 0){
                if (Math.rand(0,Math.ceil((thralls+1) ** 1.45)) < (global.civic.torturer.workers / 2) * (1 + traits.psychic.vars()[0])){
                    let k = imprisoned[Math.rand(0,imprisoned.length)];
                    global.city.captive_housing[`jailrace${k}`]--;
                    global.city.captive_housing[`race${k}`]++;
                }
            }
        }

        if (global.race['psychic']){
            if (global.race['psychicPowers'] && global.race.psychicPowers.boostTime > 0){
                global.race.psychicPowers.boostTime--;
                if (global.race.psychicPowers.boostTime < 0 || global.race.psychicPowers.boostTime > 360){
                    global.race.psychicPowers.boostTime = 0;
                }
            }
            if (global.race['psychicPowers'] && global.race.psychicPowers['assaultTime'] && global.race.psychicPowers.assaultTime > 0){
                global.race.psychicPowers.assaultTime--;
                if (global.race.psychicPowers.assaultTime < 0 || global.race.psychicPowers.assaultTime > 360){
                    global.race.psychicPowers.assaultTime = 0;
                }
            }
            if (global.race['psychicPowers'] && global.race.psychicPowers['cash'] && global.race.psychicPowers.cash > 0){
                global.race.psychicPowers.cash--;
                if (global.race.psychicPowers.cash < 0 || global.race.psychicPowers.cash > 360){
                    global.race.psychicPowers.cash = 0;
                }
            }
        }

        if (global.city['nanite_factory']){
            let gain = global.city.nanite_factory.count * spatialReasoning(2500);
            $ctx.caps['Nanite'] += gain;
            breakdown.c.Nanite[loc('city_nanite_factory')] = gain+'v';
        }
        if (p_on['transmitter'] && global.race['artifical']){
            let gain = p_on['transmitter'] * spatialReasoning(100);
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('city_transmitter')] = gain+'v';
        }
        if (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon']){
            let gain = 0;
            let name = 'city_pylon';
            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.space['pylon']){
                gain = spatialReasoning(2) * global.space.pylon.count;
                name = 'space_red_pylon';
            }
            else if (global.tech['isolation'] && global.tauceti['pylon']){
                gain = spatialReasoning(2) * global.tauceti.pylon.count;;
                name = 'tau_home_pylon';
            }
            else if (global.city['pylon']){
                gain = spatialReasoning(5) * global.city.pylon.count;;
            }

            $ctx.caps['Mana'] += gain;
            breakdown.c.Mana[loc(name)] = gain+'v';
        }
        if (global.city['captive_housing']){
            let houses = global.city.captive_housing.count;
            global.city.captive_housing.raceCap = houses * (global.tech['unfathomable'] && global.tech.unfathomable >= 3 ? 3 : 2);
            global.city.captive_housing.cattleCap = houses * 5;
        }
        if (global.city['farm']){
            if (global.tech['farm']){
                let pop = global.city.farm.count * actions.city.farm.citizens();
                $ctx.caps[global.race.species] += pop;
                breakdown.c[global.race.species][loc('city_farm')] = pop + 'v';
            }
        }
        if (global.city['wharf']){
            let vol = global.tech['world_control'] ? 15 : 10;
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                vol *= 2;
            }
            $ctx.caps['Crates'] += (global.city.wharf.count * vol);
            breakdown.c.Crates[loc('city_wharf')] = (global.city.wharf.count * vol) + 'v';
            $ctx.caps['Containers'] += (global.city.wharf.count * vol);
            breakdown.c.Containers[loc('city_wharf')] = (global.city.wharf.count * vol) + 'v';
        }
        if (global.space['munitions_depot']){
            let vol = 25;
            $ctx.caps['Crates'] += (global.space.munitions_depot.count * vol);
            breakdown.c.Crates[loc('tech_munitions_depot')] = (global.space.munitions_depot.count * vol) + 'v';
            $ctx.caps['Containers'] += (global.space.munitions_depot.count * vol);
            breakdown.c.Containers[loc('tech_munitions_depot')] = (global.space.munitions_depot.count * vol) + 'v';
        }
        if (global.interstellar['cargo_yard']){
            $ctx.caps['Crates'] += (global.interstellar.cargo_yard.count * 50);
            breakdown.c.Crates[loc('interstellar_cargo_yard_title')] = (global.interstellar.cargo_yard.count * 50) + 'v';
            $ctx.caps['Containers'] += (global.interstellar.cargo_yard.count * 50);
            breakdown.c.Containers[loc('interstellar_cargo_yard_title')] = (global.interstellar.cargo_yard.count * 50) + 'v';

            let gain = (global.interstellar.cargo_yard.count * spatialReasoning(200));
            $ctx.caps['Neutronium'] += gain;
            breakdown.c.Neutronium[loc('interstellar_cargo_yard_title')] = gain+'v';

            gain = (global.interstellar.cargo_yard.count * spatialReasoning(150));
            $ctx.caps['Infernite'] += gain;
            breakdown.c.Infernite[loc('interstellar_cargo_yard_title')] = gain+'v';
        }
        if (global.interstellar['neutron_miner'] && p_on['neutron_miner']){
            let gain = (p_on['neutron_miner'] * spatialReasoning(500));
            $ctx.caps['Neutronium'] += gain;
            breakdown.c.Neutronium[loc('interstellar_neutron_miner_title')] = gain+'v';
        }
        if (global.city['storage_yard']){
            let size = global.tech.container >= 3 ? 20 : 10;
            if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1){
                size += 10;
            }
            if (global.tech['world_control']){
                size += 10;
            }
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                size *= 2;
            }
            $ctx.caps['Crates'] += (global.city['storage_yard'].count * size);
            breakdown.c.Crates[loc('city_storage_yard')] = (global.city['storage_yard'].count * size) + 'v';
        }
        if (global.space['garage']){
            let g_vol = global.tech['particles'] >= 4 ? 20 + global.tech['supercollider'] : 20;
            if (global.tech['world_control'] || global.race['cataclysm']){
                g_vol += 10;
            }
            $ctx.caps['Containers'] += (global.space.garage.count * g_vol);
            breakdown.c.Containers[loc('space_red_garage_title')] = (global.space.garage.count * g_vol) + 'v';
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                $ctx.caps['Crates'] += (global.space.garage.count * g_vol);
                breakdown.c.Crates[loc('space_red_garage_title')] = (global.space.garage.count * g_vol) + 'v';
            }
        }
        if (global.tech['tp_depot']){
            $ctx.caps['Containers'] += (global.tech.tp_depot * 50);
            breakdown.c.Containers[loc('galaxy_gateway_depot')] = (global.tech.tp_depot * 50) + 'v';
            $ctx.caps['Crates'] += (global.tech.tp_depot * 50);
            breakdown.c.Crates[loc('galaxy_gateway_depot')] = (global.tech.tp_depot * 50) + 'v';
        }
        if (global.city['warehouse']){
            let volume = global.tech['steel_container'] >= 2 ? 20 : 10;
            if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 2){
                volume += 10;
            }
            if (global.tech['world_control']){
                volume += 10;
            }
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                volume *= 2;
            }
            $ctx.caps['Containers'] += (global.city['warehouse'].count * volume);
            breakdown.c.Containers[loc('city_warehouse')] = (global.city['warehouse'].count * volume) + 'v';
        }
        if (global.city['rock_quarry']){
            let gain = BHStorageMulti(global.city.rock_quarry.count * spatialReasoning(100));
            $ctx.caps['Stone'] += gain;
            breakdown.c.Stone[loc('city_rock_quarry')] = gain+'v';

            $ctx.caps['Chrysotile'] += gain;
            breakdown.c.Chrysotile[loc('city_rock_quarry')] = gain+'v';
        }
        if (global.city['lumber_yard']){
            let gain = BHStorageMulti(global.city.lumber_yard.count * spatialReasoning(100));
            $ctx.caps['Lumber'] += gain;
            breakdown.c.Lumber[loc('city_lumber_yard')] = gain+'v';
        }
        else if (global.city['graveyard']){
            let gain = BHStorageMulti(global.city.graveyard.count * spatialReasoning(100));
            $ctx.caps['Lumber'] += gain;
            breakdown.c.Lumber[loc('city_graveyard')] = gain+'v';
        }
        if (global.city['sawmill']){
            let gain = BHStorageMulti(global.city.sawmill.count * spatialReasoning(200));
            $ctx.caps['Lumber'] += gain;
            breakdown.c.Lumber[loc('city_sawmill')] = gain+'v';
        }
        if (global.city['mine']){
            $ctx.lCaps['miner'] += jobScale(global.city.mine.count);
        }
        if (global.portal['dig_demon'] && global.race['warlord']){
            let demons = global.portal.dig_demon.on * actions.portal.prtl_wasteland.dig_demon.citizens();
            $ctx.caps[global.race.species] += demons;
            breakdown.c[global.race.species][loc('portal_dig_demon_title')] = demons + 'v';
            $ctx.lCaps['miner'] += demons;
            global.civic.miner.max = demons;
            global.civic.miner.workers = demons;
            global.civic.miner.assigned = demons;
        }
        if (global.city['coal_mine']){
            $ctx.lCaps['coal_miner'] += jobScale(global.city.coal_mine.count);
        }
        if (global.city['bank']){
            $ctx.lCaps['banker'] += jobScale(global.city.bank.count);
        }
        if (global.city['amphitheatre']){
            let athVal = govActive('athleticism',1);
            $ctx.lCaps['entertainer'] += jobScale(athVal ? (global.city.amphitheatre.count * athVal) : global.city.amphitheatre.count);
        }
        if (global.city['casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                $ctx.lCaps['entertainer'] += jobScale(global.city.casino.count);
            }
        }
        if (global.space['spc_casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                $ctx.lCaps['entertainer'] += jobScale(global.space.spc_casino.count);
            }
            if (global.race['orbit_decayed']){
                $ctx.lCaps['banker'] += jobScale(global.space.spc_casino.count);
            }
        }
        if (global.portal['hell_casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                $ctx.lCaps['entertainer'] += jobScale(global.portal.hell_casino.count * 3);
            }
            $ctx.lCaps['banker'] += jobScale(global.portal.hell_casino.count);
        }
        if (global.tauceti['tauceti_casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                $ctx.lCaps['entertainer'] += jobScale(global.tauceti.tauceti_casino.count);
            }
            if (global.tech['isolation']){
                $ctx.lCaps['banker'] += jobScale(global.tauceti.tauceti_casino.count);

                let pop = p_on['tauceti_casino'] * actions.tauceti.tau_home.tauceti_casino.citizens();
                $ctx.caps[global.race.species] += pop;
                breakdown.c[global.race.species][structName('casino')] = pop + 'v';
            }
        }
        if (global.galaxy['resort']){
            if (global.tech['theatre'] && !global.race['joyless']){
                $ctx.lCaps['entertainer'] += jobScale(p_on['resort'] * 2);
            }
        }
        if (global.city['cement_plant']){
            $ctx.lCaps['cement_worker'] += jobScale(global.city.cement_plant.count * 2);
        }
        if (global.eden['eden_cement']){
            let ec = p_on['eden_cement'] || 0;
            $ctx.lCaps['cement_worker'] += jobScale(ec * 5);
        }
        if (global.race['orbit_decayed'] && p_on['red_factory']){
            $ctx.lCaps['cement_worker'] += jobScale(p_on['red_factory']);
        }
        if (global.race['parasite'] && !global.tech['isolation']){
            $ctx.lCaps['garrison'] += jobScale(traits.parasite.vars()[0]);
        }
        if (global.city['garrison']){
            $ctx.lCaps['garrison'] += global.city.garrison.on * actions.city.garrison.soldiers();
        }
        if (global.space['space_barracks'] && !global.race['fasting']){
            let soldiers = actions.space.spc_red.space_barracks.soldiers();
            $ctx.lCaps['garrison'] += Math.round(global.space.space_barracks.on * soldiers);
        }
        if (global.interstellar['cruiser']){
            let soldiers = actions.interstellar.int_proxima.cruiser.soldiers();
            $ctx.lCaps['garrison'] += int_on['cruiser'] * soldiers;
        }
        if (global.portal['brute']){
            let soldiers = actions.portal.prtl_wasteland.brute.soldiers();
            $ctx.lCaps['garrison'] += global.portal.brute.on * soldiers;
        }
        if (global.race['wish'] && global.race['wishStats']){
            $ctx.lCaps['garrison'] += jobScale(global.race.wishStats.troop);
        }
        if (p_on['s_gate'] && global.galaxy['starbase']){
            let soldiers = actions.galaxy.gxy_gateway.starbase.soldiers();
            $ctx.lCaps['garrison'] += p_on['starbase'] * soldiers;
        }
        if (global.eden['bunker']){
            let soldiers = actions.eden.eden_asphodel.bunker.soldiers();
            $ctx.lCaps['garrison'] += support_on['bunker'] * soldiers;
        }
        if (global.eden['fire_support_base'] && global.eden.fire_support_base.count === 100){
            $ctx.lCaps['garrison'] += actions.eden.eden_elysium.fire_support_base.soldiers();
        }
}

export function midLoop_s3($ctx){
        if (global.race['orbit_decayed'] && global.space.hasOwnProperty('red_mine')){
            $ctx.lCaps['miner'] += jobScale(support_on['red_mine']);
            $ctx.lCaps['coal_miner'] += jobScale(support_on['red_mine']);
        }
        if (!global.tech['world_control']){
            let occ_amount = jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
            for (let i=2; i>=0; i--){
                if (global.civic.foreign[`gov${i}`].occ){
                    $ctx.lCaps['garrison'] -= occ_amount;
                    if ($ctx.lCaps['garrison'] < 0){
                        global.civic.foreign[`gov${i}`].occ = false;
                        $ctx.lCaps['garrison'] += occ_amount;
                        global.civic.garrison.workers += occ_amount;
                        messageQueue(loc('civics_garrison_autodeoccupy_desc',[govTitle(i)]),'danger',false,['spy']);
                    }
                }
            }
        }
        if (global.race['slaver'] && global.tech['slaves'] && global.city['slave_pen']) {
            $ctx.caps['Slave'] = global.city.slave_pen.count * 4;
            breakdown.c.Slave[loc('city_slave_housing',[global.resource.Slave.name])] = global.city.slave_pen.count * 4 + 'v';

            if ($ctx.caps['Slave'] < global.resource.Slave.amount){
                global.resource.Slave.amount = $ctx.caps['Slave'];
            }
        }
        if (global.race['calm'] && global.city['meditation']) {
            $ctx.caps['Zen'] = global.city.meditation.count * traits.calm.vars()[0];
            breakdown.c.Zen[loc('city_meditation')] = global.city.meditation.count * traits.calm.vars()[0] + 'v';
            global.resource.Zen.amount = (global.resource[global.race.species].amount * 2) + global.civic.garrison.workers;
            if (global.resource.Zen.amount > global.resource.Zen.max){
                global.resource.Zen.amount = global.resource.Zen.max;
            }
            let zen = global.resource.Zen.amount / (global.resource.Zen.amount + 5000);
            breakdown.c.Zen[loc('trait_calm_desc')] = `+${(zen * 100).toFixed(2)}%`;
        }
        if (global.city['basic_housing']){
            let pop = global.city.basic_housing.count * actions.city.basic_housing.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('small')] = pop + 'v';
        }
        if (global.tauceti['tau_housing'] && global.tech['isolation']){
            let pop = global.tauceti.tau_housing.count * actions.tauceti.tau_home.tau_housing.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('small')] = pop + 'v';
        }
        if (global.city['cottage']){
            let pop = global.city.cottage.count * actions.city.cottage.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('medium')] = pop + 'v';
            if (global.tech['home_safe']){
                let gain = (global.city['cottage'].count * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 5000 : 2000) : 1000));
                $ctx.caps['Money'] += gain;
                breakdown.c.Money[housingLabel('medium')] = gain+'v';
            }
        }
        if (global.city['apartment']){
            let pop = p_on['apartment'] * actions.city.apartment.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('large')] = pop + 'v';
            if (global.tech['home_safe']){
                let gain = (p_on['apartment']  * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 10000 : 5000) : 2000));
                $ctx.caps['Money'] += gain;
                breakdown.c.Money[housingLabel('large')] = gain+'v';
            }
        }
        if (global.eden['rectory']){
            let pop = p_on['rectory'] * actions.eden.eden_asphodel.rectory.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc(`eden_rectory_title`)] = pop + 'v';
        }
        if (p_on['s_gate'] && global.galaxy['consulate'] && global.galaxy.consulate.count >= 1){
            let pop = actions.galaxy.gxy_alien1.consulate.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('galaxy_consulate')] = pop + 'v';
        }
        if (p_on['s_gate'] && p_on['embassy'] && global.tech.xeno >= 11){
            let pop = actions.galaxy.gxy_gorddon.embassy.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('galaxy_embassy')] = pop + 'v';
        }
        if (p_on['s_gate'] && p_on['embassy'] && global.galaxy['dormitory']){
            let pop = p_on['dormitory'] * actions.galaxy.gxy_gorddon.dormitory.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('galaxy_dormitory')] = pop + 'v';
        }
        if (p_on['arcology']){
            let pop = p_on['arcology'] * actions.portal.prtl_ruins.arcology.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('portal_arcology_title')] = pop + 'v';
            $ctx.lCaps['garrison'] += p_on['arcology'] * actions.portal.prtl_ruins.arcology.soldiers();

            $ctx.caps['Containers'] += (p_on['arcology'] * Math.round(quantum_level) * 10);
            breakdown.c.Containers[loc('portal_arcology_title')] = (p_on['arcology'] * Math.round(quantum_level) * 10) + 'v';
            $ctx.caps['Crates'] += (p_on['arcology'] * Math.round(quantum_level) * 10);
            breakdown.c.Crates[loc('portal_arcology_title')] = (p_on['arcology'] * Math.round(quantum_level) * 10) + 'v';

            let sup = hellSupression('ruins');
            let money = (p_on['arcology'] * spatialReasoning(bank_vault() * 8 * sup.supress));
            $ctx.caps['Money'] += money;
            breakdown.c.Money[loc('portal_arcology_title')] = money+'v';
        }

        if (global.portal['bazaar'] && global.portal['spire']){
            let containers = (global.portal.bazaar.count * global.portal.spire.count * 8);
            $ctx.caps['Containers'] += containers;
            breakdown.c.Containers[loc('portal_bazaar_title')] = containers + 'v';
            $ctx.caps['Crates'] += containers;
            breakdown.c.Crates[loc('portal_bazaar_title')] = containers + 'v';

            let money = spatialReasoning(bank_vault() * global.portal.spire.count * global.portal.bazaar.count / 3);
            $ctx.caps['Money'] += money;
            breakdown.c.Money[loc('portal_bazaar_title')] = money+'v';
        }

        if (support_on['colony']){
            let containers = global.tech['isolation'] ? 900 : 250;
            $ctx.caps['Containers'] += (support_on['colony'] * containers);
            breakdown.c.Containers[loc('tau_home_colony')] = (support_on['colony'] * containers) + 'v';
            $ctx.caps['Crates'] += (support_on['colony'] * containers);
            breakdown.c.Crates[loc('tau_home_colony')] = (support_on['colony'] * containers) + 'v';

            let pop = support_on['colony'] * actions.tauceti.tau_home.colony.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('tau_home_colony')] = pop + 'v';
        }
        if (p_on['operating_base']){
            $ctx.lCaps['garrison'] += Math.min(support_on['operating_base'],p_on['operating_base']) * actions.space.spc_enceladus.operating_base.soldiers();
        }
        if (p_on['fob']){
            $ctx.lCaps['garrison'] += actions.space.spc_triton.fob.soldiers();
        }
        if (global.space['living_quarters']){
            let gain = Math.round(support_on['living_quarters'] * actions.space.spc_red.living_quarters.citizens());
            $ctx.caps[global.race.species] += gain;
            $ctx.lCaps['colonist'] += jobScale(support_on['living_quarters']);
            breakdown.c[global.race.species][`${planetName().red}`] = gain + 'v';

            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.tech['home_safe']){
                let gain = (support_on['living_quarters'] * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 100000 : 50000) : 25000));
                $ctx.caps['Money'] += gain;
                breakdown.c.Money[loc('space_red_living_quarters_title')] = gain+'v';
            }
        }
        if (support_on['biodome'] && (global.race['artifical'] || global.race['orbit_decayed'])){
            let gain = support_on['biodome'] * spatialReasoning(global.race['artifical'] ? 500 : 100);
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('space_red_signal_tower_title')] = gain+'v';
        }
        if (global.space['titan_quarters']){
            let gain = Math.round(support_on['titan_quarters'] * actions.space.spc_titan.titan_quarters.citizens());
            $ctx.caps[global.race.species] += gain;
            $ctx.lCaps['titan_colonist'] += jobScale(support_on['titan_quarters']);
            breakdown.c[global.race.species][`${planetName().titan}`] = gain + 'v';
        }

        if (global.interstellar['habitat'] && p_on['habitat']){
            let pop = p_on['habitat'] * actions.interstellar.int_alpha.habitat.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('interstellar_habitat_title')] = pop + 'v';
        }
        if (global.interstellar['luxury_condo'] && p_on['luxury_condo']){
            let cit = p_on['luxury_condo'] * actions.interstellar.int_alpha.luxury_condo.citizens();
            $ctx.caps[global.race.species] += cit;
            breakdown.c[global.race.species][loc('tech_luxury_condo')] = cit + 'v';
            let gain = (p_on['luxury_condo']  * spatialReasoning(750000));
            $ctx.caps['Money'] += gain;
            breakdown.c.Money[loc('tech_luxury_condo')] = gain+'v';
        }
        if (global.city['lodge']){
            let cit = global.city.lodge.count * actions.city.lodge.citizens();
            $ctx.caps[global.race.species] += cit;
            breakdown.c[global.race.species][loc('city_lodge')] = cit + 'v';
        }
        if (global.portal['hovel']){
            let cit = global.portal.hovel.count * actions.portal.prtl_wasteland.hovel.citizens();
            $ctx.caps[global.race.species] += cit;
            breakdown.c[global.race.species][loc('portal_hovel_title')] = cit + 'v';
        }
        if (global.space['outpost']){
            let gain = global.space['outpost'].count * spatialReasoning(500);
            $ctx.caps['Neutronium'] += gain;
            breakdown.c.Neutronium[loc('space_gas_moon_outpost_title')] = gain+'v';
        }
        if (global.city['shed']){
            let multiplier = storageMultipler();
            let label = global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            for (const res of actions.city.shed.res()){
                if (global.resource[res].display){
                    let gain = global.city.shed.count * spatialReasoning(actions.city.shed.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.race['lone_survivor']){
            breakdown.c[global.race.species][loc('base')] = '1v';
            $ctx.caps[global.race.species] = 1;
        }

        if (global.interstellar['warehouse']){
            let multiplier = storageMultipler();
            let label = loc('interstellar_alpha_name');
            for (const res of actions.interstellar.int_alpha.warehouse.res()){
                if (global.resource[res].display){
                    let gain = global.interstellar.warehouse.count * spatialReasoning(actions.interstellar.int_alpha.warehouse.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.eden['warehouse']){
            let multiplier = storageMultipler(global.race['warlord'] ? 1 : 0.2);
            if (global.race['warlord'] && global.eden['corruptor']){
                multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 12 ? (global.tech.asphodel >= 13 ? 0.16 : 0.12) : 0.08);
            }
            let label = loc('eden_asphodel_name');
            for (const res of actions.eden.eden_asphodel.warehouse.res()){
                if (global.resource[res].display){
                    let gain = global.eden.warehouse.count * spatialReasoning(actions.eden.eden_asphodel.warehouse.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.portal['warehouse']){
            let multiplier = storageMultipler();
            if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 13 ? 0.16 : 0.12);
            }
            let label = global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            for (const res of actions.portal.prtl_wasteland.warehouse.res()){
                if (global.resource[res].display){
                    let gain = global.portal.warehouse.count * spatialReasoning(actions.portal.prtl_wasteland.warehouse.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
            let cc_gain = global.portal.warehouse.count * (65 + global.portal.warehouse.rank * 35);
            $ctx.caps['Crates'] += cc_gain;
            breakdown.c['Crates'][label] = cc_gain+'v';
            $ctx.caps['Containers'] += cc_gain;
            breakdown.c['Containers'][label] = cc_gain+'v';
        }

        if (global.space['storehouse']){
            let multiplier = tpStorageMultiplier('storehouse',false);
            let h_multiplier = tpStorageMultiplier('storehouse',true);
            let label = loc('space_storehouse_title');
            for (const res of actions.space.spc_titan.storehouse.res()){
                if (global.resource[res].display){
                    let heavy = actions.space.spc_titan.storehouse.heavy(res);
                    let gain = global.space.storehouse.count * spatialReasoning(actions.space.spc_titan.storehouse.val(res) * (heavy ? h_multiplier : multiplier));
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.tauceti['repository']){
            let multiplier = tpStorageMultiplier('repository');
            let label = loc('tech_repository');
            for (const res of actions.tauceti.tau_home.repository.res()){
                if (global.resource[res].display){
                    let gain = global.tauceti.repository.count * spatialReasoning(actions.tauceti.tau_home.repository.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
            if (global.tech['isolation']){
                let containers = 250;
                $ctx.caps['Containers'] += (global.tauceti.repository.count * containers);
                breakdown.c.Containers[loc('tech_repository')] = (global.tauceti.repository.count * containers) + 'v';
                $ctx.caps['Crates'] += (global.tauceti.repository.count * containers);
                breakdown.c.Crates[loc('tech_repository')] = (global.tauceti.repository.count * containers) + 'v';
            }
        }

        if (global.tech['isolation'] && p_on['tau_farm'] && global.race['artifical']){
            let gain = p_on['tau_farm'] * spatialReasoning(350);
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('tau_home_tau_farm')] = gain+'v';
        }

        if (global.galaxy['gateway_depot']){
            let containers = global.tech['world_control'] ? 150 : 100;
            $ctx.caps['Crates'] += (global.galaxy.gateway_depot.count * containers);
            breakdown.c.Crates[loc('galaxy_gateway_depot')] = (global.galaxy.gateway_depot.count * containers) + 'v';
            $ctx.caps['Containers'] += (global.galaxy.gateway_depot.count * containers);
            breakdown.c.Containers[loc('galaxy_gateway_depot')] = (global.galaxy.gateway_depot.count * containers) + 'v';

            let label = loc('galaxy_gateway_depot');
            let multiplier = gatewayStorage();

            if (global.resource.Uranium.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(3000 * multiplier)));
                $ctx.caps['Uranium'] += gain;
                breakdown.c.Uranium[label] = gain+'v';
            }

            if (global.resource.Nano_Tube.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(250000 * multiplier)));
                $ctx.caps['Nano_Tube'] += gain;
                breakdown.c.Nano_Tube[label] = gain+'v';
            }

            if (global.resource.Neutronium.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(9001 * multiplier)));
                $ctx.caps['Neutronium'] += gain;
                breakdown.c.Neutronium[label] = gain+'v';
            }

            if (global.resource.Infernite.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(6660 * multiplier)));
                $ctx.caps['Infernite'] += gain;
                breakdown.c.Infernite[label] = gain+'v';
            }

            if (global.resource.Elerium.display && p_on['gateway_depot'] && p_on['s_gate']){
                let gain = (p_on['gateway_depot'] * (spatialReasoning(200)));
                $ctx.caps['Elerium'] += gain;
                breakdown.c.Elerium[label] = gain+'v';
            }
        }

        if (global.resource.Infernite.display && global.portal['fortress'] && !global.race['warlord']){
            let gain = spatialReasoning(1000);
            $ctx.caps['Infernite'] += gain;
            breakdown.c.Infernite[loc('portal_fortress_name')] = gain+'v';
        }

        if (global.space['garage']){
            let multiplier = actions.space.spc_red.garage.multiplier(false);
            let h_multiplier = actions.space.spc_red.garage.multiplier(true);
            let label = loc('space_red_garage_title');
            for (const res of actions.space.spc_red.garage.res()){
                if (global.resource[res].display){
                    let heavy = actions.space.spc_red.garage.heavy(res);
                    let gain = global.space.garage.count * spatialReasoning(actions.space.spc_red.garage.val(res) * (heavy ? h_multiplier : multiplier));
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.portal['harbor'] && p_on['harbor']){
            let multiplier = 1;
            if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 12){
                multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 13 ? 0.12 : 0.1);
            }
            let label = loc('portal_harbor_title');
            for (const res of actions.portal.prtl_lake.harbor.res()){
                if (global.resource[res].display){
                    let gain = p_on['harbor'] * spatialReasoning(actions.portal.prtl_lake.harbor.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.city['silo']){
            let gain = BHStorageMulti(global.city['silo'].count * spatialReasoning(500));
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('city_silo')] = gain+'v';
        }
        if (global.city['compost']){
            let gain = BHStorageMulti(global.city['compost'].count * spatialReasoning(200));
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('city_compost_heap')] = gain+'v';
        }
        if (global.city['soul_well']){
            let gain = BHStorageMulti(global.city['soul_well'].count * spatialReasoning(500));
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('city_soul_well')] = gain+'v';
        }
        if (global.city['smokehouse']){
            let gain = BHStorageMulti(global.city['smokehouse'].count * spatialReasoning(100));
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('city_smokehouse')] = gain+'v';
        }
        if (global.city['oil_well']){
            let gain = (global.city['oil_well'].count * spatialReasoning(500));
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('city_oil_well')] = gain+'v';
        }
        if (global.city['oil_depot']){
            let gain = (global.city['oil_depot'].count * spatialReasoning(1000));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('city_oil_depot')] = gain+'v';
            if (global.tech['uranium'] >= 2){
                gain = (global.city['oil_depot'].count * spatialReasoning(250));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                $ctx.caps['Uranium'] += gain;
                breakdown.c.Uranium[loc('city_oil_depot')] = gain+'v';
            }
            if (global.resource['Helium_3'].display){
                gain = (global.city['oil_depot'].count * spatialReasoning(400));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                $ctx.caps['Helium_3'] += gain;
                breakdown.c.Helium_3[loc('city_oil_depot')] = gain+'v';
            }
        }
        if (global.space['propellant_depot']){
            let gain = (global.space['propellant_depot'].count * spatialReasoning(1250));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('space_home_propellant_depot_title')] = gain+'v';
            if (global.resource['Helium_3'].display){
                gain = (global.space['propellant_depot'].count * spatialReasoning(1000));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                $ctx.caps['Helium_3'] += gain;
                breakdown.c.Helium_3[loc('space_home_propellant_depot_title')] = gain+'v';
            }
        }
        if (p_on['orbital_station']){
            let gain = (p_on['orbital_station'] * spatialReasoning(15000));
            $ctx.caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('tau_home_orbital_station')] = gain+'v';
        }
        if (p_on['refueling_station']){
            let h_gain = (p_on['refueling_station'] * spatialReasoning(10000));
            $ctx.caps['Helium_3'] += h_gain;
            breakdown.c.Helium_3[loc('tau_gas_refueling_station_title')] = h_gain+'v';

            if (global.tech['tau_whale'] >= 2){
                let o_gain = (p_on['refueling_station'] * spatialReasoning(6500));
                $ctx.caps['Oil'] += o_gain;
                breakdown.c.Oil[loc('tau_gas_refueling_station_title')] = o_gain+'v';
            }
        }
        if (p_on['orbital_platform']){
            let gain = (p_on['orbital_platform'] * spatialReasoning(17500));
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('tau_red_orbital_platform')] = gain+'v';
        }
        if (global.space['gas_storage']){
            let gain = (global.space['gas_storage'].count * spatialReasoning(3500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[`${planetName().gas} ${loc('depot')}`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(2500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            $ctx.caps['Helium_3'] += gain;
            breakdown.c.Helium_3[`${planetName().gas} ${loc('depot')}`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(1000));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            $ctx.caps['Uranium'] += gain;
            breakdown.c.Uranium[`${planetName().gas} ${loc('depot')}`] = gain+'v';
        }
        if (p_on['xfer_station']){
            let gain = (p_on['xfer_station'] * spatialReasoning(5000));
            $ctx.caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('interstellar_xfer_station_title')] = gain+'v';

            gain = (p_on['xfer_station'] * spatialReasoning(4000));
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('interstellar_xfer_station_title')] = gain+'v';

            gain = (p_on['xfer_station'] * spatialReasoning(2500));
            $ctx.caps['Uranium'] += gain;
            breakdown.c.Uranium[loc('interstellar_xfer_station_title')] = gain+'v';

            if (global.resource.Deuterium.display){
                let deuterium_gain = p_on['xfer_station'] * spatialReasoning(2000);
                $ctx.caps['Deuterium'] += deuterium_gain;
                breakdown.c.Deuterium[loc('interstellar_xfer_station_title')] = deuterium_gain+'v';
            }
        }
        if (global.space['helium_mine']){
            let gain = (global.space['helium_mine'].count * spatialReasoning(100));
            $ctx.caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('space_moon_helium_mine_title')] = gain+'v';
        }
        if (global.portal['pumpjack']){
            let gain = (global.portal.pumpjack.count * spatialReasoning(500));
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('portal_pumpjack_title')] = gain+'v';
        }
        if (global.portal['pumpjack']){
            let gain = (global.portal.pumpjack.count * spatialReasoning(250));
            $ctx.caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('portal_pumpjack_title')] = gain+'v';
        }
        if (shrineBonusActive()){
            let getShrineResult = getShrineBonus('know');
            $ctx.caps['Knowledge'] += getShrineResult.add;
            breakdown.c.Knowledge[loc('city_shrine')] = getShrineResult.add+'v';
        }
        if (global.city['temple'] && global.genes['ancients'] && global.genes['ancients'] >= 2){
            $ctx.lCaps['priest'] += jobScale(templeCount());
        }
        if (global.space['ziggurat'] && global.genes['ancients'] && global.genes['ancients'] >= 4){
            $ctx.lCaps['priest'] += jobScale(templeCount(true));
        }
        if (global.eden['rectory'] && global.genes['ancients'] && global.genes['ancients'] >= 2 && p_on['rectory']){
            $ctx.lCaps['priest'] += jobScale(p_on['rectory']);
        }
        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.priest){
            $ctx.lCaps['priest'] += jobScale(global.race.wishStats.priest);
        }
        $ctx.pirate_alien2 = piracy('gxy_alien2');
        if (global.city['university']){
            let gain = actions.city.university.knowVal() * global.city.university.count;
            $ctx.lCaps['professor'] += jobScale(global.city.university.count);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('city_university')] = gain+'v';
        }
        if (global.race['lone_survivor'] && global.tauceti['alien_outpost']){
            $ctx.lCaps['professor'] += jobScale(global.tauceti.alien_outpost.count);
        }
        if (global.city['library']){
            let shelving = 125;
            if (global.race['nearsighted']){
                shelving *= 1 - (traits.nearsighted.vars()[0] / 100);
            }
            if (global.race['studious']){
                shelving *= 1 + (traits.studious.vars()[1] / 100);
            }
            let fathom = fathomCheck('elven');
            if (fathom > 0){
                shelving *= 1 + (traits.studious.vars(1)[1] / 100 * fathom);
            }
            if (global.tech['science'] && global.tech['science'] >= 8){
                shelving *= 1.4;
            }
            if (global.tech['science'] && global.tech['science'] >= 5){
                let sci_val = workerScale(global.civic.scientist.workers,'scientist');
                if (global.race['high_pop']){
                    sci_val = highPopAdjust(sci_val);
                }
                shelving *= 1 + (sci_val * 0.12);
            }
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 2){
                shelving *= 1 + faithTempleCount() * 0.05;
            }
            let teachVal = govActive('teacher',0);
            if (teachVal){
                shelving *= 1 + (teachVal / 100);
            }
            let athVal = govActive('athleticism',2);
            if (athVal){
                shelving *= 1 - (athVal / 100);
            }
            let muckVal = govActive('muckraker',1);
            if (muckVal){
                shelving *= 1 + (muckVal / 100);
            }
            let gain = Math.round(global.city.library.count * shelving);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('city_library')] = gain+'v';
            if (global.tech['science'] && global.tech['science'] >= 3){
                global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
            }
        }
}
