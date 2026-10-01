import { global } from '../../core/vars.js';
import { messageQueue } from '../../functions/message_log.js';
import { spaceCostMultiplier } from '../../functions/cost_multipliers.js';
import { powerCostMod } from '../../functions/power_modifiers.js';
import { production } from '../../resources/prod.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { powerOnNewStruct } from '../../actions/evolution/planet_setup.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { fuel_adjust } from '../../space/planet_generation.js';
import { incrementStruct } from '../../space/space_requirements.js';
import { loc } from '../../core/locale.js';
import { outerTruth } from '../../core/registries.js';

// Region 'spc_kuiper' dari outerTruth (dipisah dari truepath.js). Isi/urutan entri sama persis; digabung via core/registries.js di truepath.js.
export const outerKuiper = {
        info: {
            name(){
                return loc(`space_kuiper_title`);
            },
            desc(){
                return loc('space_kuiper_desc');
            },
            zone: 'outer',
            syndicate(){ return global.tech['kuiper'] ? true : false; },
            syndicate_cap(){ return 2500; },
        },
        kuiper_mission: {
            id: 'space-kuiper_mission',
            title(){
                return loc('space_mission_title',[loc(`space_kuiper_title`)]);
            },
            desc(){
                return loc('space_mission_desc',[loc(`space_kuiper_title`)]);
            },
            reqs: { outer: 7 },
            grant: ['kuiper',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.kuiper >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(1000000,false,wiki).toFixed(0); },
                Elerium(){ return 1000; }
            },
            effect(){
                return loc('space_kuiper_mission_effect');
            },
            action(){
                if (payCosts($(this)[0])){
                    initStruct(outerTruth.spc_kuiper.orichalcum_mine);
                    initStruct(outerTruth.spc_kuiper.uranium_mine);
                    initStruct(outerTruth.spc_kuiper.neutronium_mine);
                    global.space.syndicate['spc_kuiper'] = 500;
                    messageQueue(loc('space_kuiper_mission_action'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        orichalcum_mine: {
            id: 'space-orichalcum_mine',
            title(){ return loc('space_kuiper_mine',[global.resource.Orichalcum.name]); },
            desc(){
                return `<div>${loc('space_kuiper_mine',[global.resource.Orichalcum.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            reqs: { kuiper: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('orichalcum_mine', offset, 25000000, 1.25); },
                Graphene(offset){ return spaceCostMultiplier('orichalcum_mine', offset, 900000, 1.25); },
                Elerium(offset){ return spaceCostMultiplier('orichalcum_mine', offset, 200, 1.25); },
                Mythril(offset){ return spaceCostMultiplier('orichalcum_mine', offset, 450000, 1.25); },
                Quantium(offset){ return spaceCostMultiplier('orichalcum_mine', offset, 150000, 1.25); },
            },
            effect(wiki){
                let mineral = +(production('orichalcum_mine')).toFixed(3);
                let fuel = +fuel_adjust($(this)[0].p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Orichalcum.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(10); },
            p_fuel(){ return { r: 'Oil', a: 200 }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('orichalcum_mine');
                    global.resource.Orichalcum.display = true;
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['orichalcum_mine','space']
                };
            }
        },
        uranium_mine: {
            id: 'space-uranium_mine',
            title(){ return loc('space_kuiper_mine',[global.resource.Uranium.name]); },
            desc(){
                return `<div>${loc('space_kuiper_mine',[global.resource.Uranium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            reqs: { kuiper: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('uranium_mine', offset, 5000000, 1.25); },
                Iridium(offset){ return spaceCostMultiplier('uranium_mine', offset, 250000, 1.25); },
                Steel(offset){ return spaceCostMultiplier('uranium_mine', offset, 620000, 1.25); }
            },
            effect(wiki){
                let mineral = +(production('uranium_mine')).toFixed(3);
                let fuel = +fuel_adjust($(this)[0].p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Uranium.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(5); },
            p_fuel(){ return { r: 'Oil', a: 60 }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('uranium_mine');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['uranium_mine','space']
                };
            }
        },
        neutronium_mine: {
            id: 'space-neutronium_mine',
            title(){ return loc('space_kuiper_mine',[global.resource.Neutronium.name]); },
            desc(){
                return `<div>${loc('space_kuiper_mine',[global.resource.Neutronium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            reqs: { kuiper: 1 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('neutronium_mine', offset, 8000000, 1.25); },
                Adamantite(offset){ return spaceCostMultiplier('neutronium_mine', offset, 650000, 1.25); },
                Stanene(offset){ return spaceCostMultiplier('neutronium_mine', offset, 1250000, 1.25); },
            },
            effect(wiki){
                let mineral = +(production('neutronium_mine')).toFixed(3);
                let fuel = +fuel_adjust($(this)[0].p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Neutronium.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(8); },
            p_fuel(){ return { r: 'Oil', a: 60 }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('neutronium_mine');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['neutronium_mine','space']
                };
            }
        },
        elerium_mine: {
            id: 'space-elerium_mine',
            title(){ return loc('space_kuiper_mine',[global.resource.Elerium.name]); },
            desc(){
                return `<div>${loc('space_kuiper_mine',[global.resource.Elerium.name])}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`;
            },
            reqs: { kuiper: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('elerium_mine', offset, 20000000, 1.25); },
                Titanium(offset){ return spaceCostMultiplier('elerium_mine', offset, 250000, 1.25); },
                Neutronium(offset){ return spaceCostMultiplier('elerium_mine', offset, 120000, 1.25); },
                Orichalcum(offset){ return spaceCostMultiplier('elerium_mine', offset, 175000, 1.25); },
            },
            effect(wiki){
                let mineral = +(production('elerium_mine')).toFixed(3);
                let fuel = +fuel_adjust($(this)[0].p_fuel().a,true,wiki).toFixed(1);
                let desc = `<div>${loc('gain',[mineral,global.resource.Elerium.name])}</div>`;
                return desc + `<div class="has-text-caution">${loc('requires_power_combo_effect',[$(this)[0].powered(),fuel,global.resource[$(this)[0].p_fuel().r].name])}</div>`;
            },
            powered(){ return powerCostMod(12); },
            p_fuel(){ return { r: 'Oil', a: 125 }; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('elerium_mine');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['elerium_mine','space']
                };
            }
        },
    };
