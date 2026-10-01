import { loc } from '../../core/locale.js';
import { global } from '../../core/vars.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { powerOnNewStruct } from '../../actions/evolution/planet_setup.js';
import { messageQueue } from '../../functions/message_log.js';
import { spaceCostMultiplier } from '../../functions/cost_multipliers.js';
import { powerCostMod } from '../../functions/power_modifiers.js';
import { vBind } from '../../functions/dom_helpers.js';
import { incrementStruct } from '../../space/space_requirements.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { production } from '../../resources/prod.js';
import { fortressModules } from '../../core/registries.js';
import { hellSupression } from '../mech/hellguard.js';
import { towerSize } from '../portal.js';
import { towerPrice, renderFortress } from '../hell/fortress_defense.js';

// Region 'prtl_gate' dari fortressModules (dipisah dari portal.js). Isi sama persis; digabung via core/registries.js di portal.js.
export const fortressModules_prtl_gate = {
        info: {
            name: loc('portal_gate_name'),
            desc(){
                return `${loc('portal_gate_desc')} ${loc(global.tech['wtower'] && global.tech['etower'] ? 'portal_gate_open' : 'portal_gate_closed')}`;
            },
            support: 'guard_post',
            hide_support: true,
            prop(){
                let desc = ` - <span class="has-text-advanced">${loc('portal_ruins_security')}:</span> <span class="has-text-caution">{{ on | filter('army') }}</span>`;
                desc = desc + ` - <span class="has-text-advanced">${loc('portal_ruins_supressed')}:</span> <span class="has-text-caution">{{ on | filter('sup') }}</span>`;
                return desc;
            },
            filter(v,type){
                let sup = hellSupression('gate');
                switch (type){
                    case 'army':
                        return Math.round(sup.rating);
                    case 'sup':
                        let supress = +(sup.supress * 100).toFixed(2);
                        return `${supress}%`;
                }
            }
        },
        gate_mission: {
            id: 'portal-gate_mission',
            title: loc('portal_gate_mission_title'),
            desc: loc('portal_gate_mission_title'),
            reqs: { high_tech: 18 },
            grant: ['hell_gate',1],
            queue_complete(){ return global.tech.hell_gate >= 1 ? 0 : 1; },
            cost: {
                Money(){ return 250000000; },
                Knowledge(){ return 27500000; }
            },
            effect: loc('portal_gate_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('portal_gate_mission_result'),'info',false,['progress','hell']);
                    return true;
                }
                return false;
            }
        },
        west_tower: {
            id: 'portal-west_tower',
            title: loc('portal_west_tower'),
            desc(wiki){
                let size = towerSize();
                if (!global.portal.hasOwnProperty('west_tower') || global.portal.west_tower.count < size || wiki){
                    return `<div>${loc('portal_west_tower')}</div><div class="has-text-special">${loc('requires_segments',[size])}</div>`;
                }
                else {
                    return `<div>${loc('portal_west_tower')}</div>`;
                }
            },
            reqs: { hell_gate: 2 },
            queue_size: 25,
            queue_complete(){ return towerSize() - global.portal.west_tower.count; },
            cost: {
                Money(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(10000000,wiki) : 0; },
                Stone(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(100000,wiki) : 0; },
                Uranium(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(1000,wiki) : 0; },
                Adamantite(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(18000,wiki) : 0; },
                Vitreloy(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(25000,wiki) : 0; },
                Soul_Gem(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? 1 : 0; },
                Scarletite(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0)) < towerSize() ? towerPrice(5000,wiki) : 0; },
            },
            effect(wiki){
                let size = towerSize();
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('west_tower') ? global.portal.west_tower.count : 0);
                if (count < size){
                    let remain = size - count;
                    return `<div>${loc('portal_tower_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_tower_effect2')}</div>`;
                }
                else {
                    return loc('portal_tower_effect');
                }
            },
            action(args){
                if (global.portal.west_tower.count < towerSize() && payCosts($(this)[0])){
                    incrementStruct('west_tower','portal');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['west_tower','portal']
                };
            },
            post(){
                if (global.portal.west_tower.count >= towerSize()){
                    global.tech['wtower'] = 1;
                    if (global.tech['wtower'] && global.tech['etower'] && !global.tech['hell_lake']){
                        global.tech['hell_lake'] = 1;
                        global.settings.portal.lake = true;
                        initStruct(fortressModules.prtl_lake.harbor);
                        messageQueue(loc('portal_gate_open'),'info',false,['progress','hell']);
                        renderFortress();
                    }
                }
            }
        },
        east_tower: {
            id: 'portal-east_tower',
            title: loc('portal_east_tower'),
            desc(wiki){
                let size = towerSize();
                if (!global.portal.hasOwnProperty('east_tower') || global.portal.east_tower.count < size || wiki){
                    return `<div>${loc('portal_east_tower')}</div><div class="has-text-special">${loc('requires_segments',[size])}</div>`;
                }
                else {
                    return `<div>${loc('portal_east_tower')}</div>`;
                }
            },
            reqs: { hell_gate: 2 },
            queue_size: 25,
            queue_complete(){ return towerSize() - global.portal.east_tower.count; },
            cost: {
                Money(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(10000000,wiki) : 0; },
                Stone(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(100000,wiki) : 0; },
                Uranium(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(1000,wiki) : 0; },
                Adamantite(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(18000,wiki) : 0; },
                Vitreloy(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(25000,wiki) : 0; },
                Soul_Gem(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? 1 : 0; },
                Scarletite(offset,wiki){ return ((offset || 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0)) < towerSize() ? towerPrice(5000,wiki) : 0; },
            },
            effect(wiki){
                let size = towerSize();
                let count = (wiki?.count ?? 0) + (global.portal.hasOwnProperty('east_tower') ? global.portal.east_tower.count : 0);
                if (count < size){
                    let remain = size - count;
                    return `<div>${loc('portal_tower_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div><div class="has-text-caution">${loc('portal_tower_effect2')}</div>`;
                }
                else {
                    return loc('portal_tower_effect');
                }
            },
            action(args){
                if (global.portal.east_tower.count < towerSize() && payCosts($(this)[0])){
                    incrementStruct('east_tower','portal');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['east_tower','portal']
                };
            },
            post(){
                if (global.portal.east_tower.count >= towerSize()){
                    global.tech['etower'] = 1;
                    if (global.tech['wtower'] && global.tech['etower'] && !global.tech['hell_lake']){
                        global.tech['hell_lake'] = 1;
                        global.settings.portal.lake = true;
                        global.portal['harbor'] = { count: 0, on: 0, support: 0, s_max: 0 };
                        messageQueue(loc('portal_gate_open'),'info',false,['progress','hell']);
                        renderFortress();
                    }
                }
            }
        },
        gate_turret: {
            id: 'portal-gate_turret',
            title: loc('portal_gate_turret_title'),
            desc(){
                return `<div>${loc('portal_gate_turret_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_gate: 3 },
            powered(){ return powerCostMod(6); },
            cost: {
                Money(offset){ return spaceCostMultiplier('gate_turret', offset, 3750000, 1.22, 'portal'); },
                Iron(offset){ return spaceCostMultiplier('gate_turret', offset, 4250000, 1.22, 'portal'); },
                Elerium(offset){ return spaceCostMultiplier('gate_turret', offset, 275, 1.22, 'portal'); },
                Stanene(offset){ return spaceCostMultiplier('gate_turret', offset, 850000, 1.22, 'portal'); },
            },
            effect(){
                let security = 100;
                if (global.race['holy']){
                    security *= 1 + (traits.holy.vars()[1] / 100);
                }
                let unicornFathom = fathomCheck('unicorn');
                if (unicornFathom > 0){
                    security *= 1 + (traits.holy.vars(1)[1] / 100 * unicornFathom);
                }
                let min = global.tech.hell_gun >= 2 ? 65 : 40;
                let max = global.tech.hell_gun >= 2 ? 100 : 60;
                return `<div>${loc('portal_gate_turret_effect',[Math.round(security)])}</div><div>${loc('portal_gate_turret_effect2',[min,max])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gate_turret','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['gate_turret','portal']
                };
            },
            postPower(){
                vBind({el: `#srprtl_gate`},'update');
            }
        },
        infernite_mine: {
            id: 'portal-infernite_mine',
            title: loc('portal_infernite_mine_title'),
            desc(){
                return `<div>${loc('portal_infernite_mine_title')}</div><div class="has-text-special">${loc('requires_security')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { hell_gate: 4 },
            powered(){ return powerCostMod(5); },
            powerBalancer(){
                return [{ r: 'Infernite', k: 'lpmod' }];
            },
            cost: {
                Money(offset){ return spaceCostMultiplier('infernite_mine', offset, 75000000, 1.26, 'portal'); },
                Alloy(offset){ return spaceCostMultiplier('infernite_mine', offset, 2450000, 1.26, 'portal'); },
                Orichalcum(offset){ return spaceCostMultiplier('infernite_mine', offset, 1650000, 1.26, 'portal'); },
                Wrought_Iron(offset){ return spaceCostMultiplier('infernite_mine', offset, 680000, 1.26, 'portal'); },
            },
            effect(wiki){
                let mining = production('infernite_mine', '', wiki);
                return `<div>${loc('portal_infernite_mine_effect',[+(mining).toFixed(3)])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('infernite_mine','portal');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['infernite_mine','portal']
                };
            },
        },
    };
