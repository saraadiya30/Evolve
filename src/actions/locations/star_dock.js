import { loc } from '../../core/locale.js';
import { costMultiplier, clearPopper, clearElement, calcPrestige } from '../../functions/functions.js';
import { global } from '../../core/vars.js';
import { incrementStruct, fuel_adjust } from '../../space/space.js';
import { bioseed } from '../../resets/resets.js';
import { actions } from '../core/registry.js';
import { payCosts, drawModal } from '../actions.js';

// Region 'starDock' dari actions (dipisah dari actions.js). Isi sama persis; digabung via registry.js di actions.js.
export const actions_starDock = {
        probes: {
            id: 'starDock-probes',
            title: loc('star_dock_probe'),
            desc(){
                return `<div>${loc('star_dock_probe_desc')}</div>`;
            },
            reqs: { genesis: 4 },
            cost: {
                Money(offset){ return costMultiplier('probes', offset, 350000, global.race['truepath'] ? 1.125 : 1.25,'starDock'); },
                Alloy(offset){ return costMultiplier('probes', offset, 75000, global.race['truepath'] ? 1.125 : 1.25,'starDock'); },
                Polymer(offset){ return costMultiplier('probes', offset, 85000, global.race['truepath'] ? 1.125 : 1.25,'starDock'); },
                Iridium(offset){ return costMultiplier('probes', offset, 12000, global.race['truepath'] ? 1.125 : 1.25,'starDock'); },
                Mythril(offset){ return costMultiplier('probes', offset, 3500, global.race['truepath'] ? 1.125 : 1.25,'starDock'); },
            },
            effect(){
                return `<div>${loc('star_dock_probe_effect')}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('probes','starDock');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['probes','starDock']
                };
            }
        },
        geck: {
            id: 'starDock-geck',
            title: loc('tech_geck'),
            desc(){
                return `<div>${loc('tech_geck_desc')}</div>`;
            },
            reqs: { geck: 1 },
            condition(){
                return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 5 ? true : false;
            },
            queue_complete(){ return 0; },
            no_multi: true,
            cost: {
                Money(offset){ return costMultiplier('geck', offset, 1000000, 1.25,'starDock'); },
                Elerium(offset){ return costMultiplier('geck', offset, 1000, 1.25,'starDock'); },
                Plasmid(offset){ return costMultiplier('geck', offset, 25, 1.4,'starDock'); },
            },
            effect(){
                return `<div>${loc('star_dock_geck_effect')}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('geck','starDock');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['geck','starDock']
                };
            }
        },
        seeder: {
            id: 'starDock-seeder',
            title(){ return global.race['cataclysm'] ? loc('star_dock_exodus') : loc('star_dock_seeder'); },
            desc(){
                let label = global.race['cataclysm'] ? loc('star_dock_exodus') : loc('star_dock_seeder');
                if (global.starDock['seeder'] && global.starDock.seeder.count >= 100){
                    return `<div>${label}</div><div class="has-text-special">${loc('star_dock_seeder_desc2')}</div>`;
                }
                else {
                    return `<div>${label}</div><div class="has-text-special">${loc('star_dock_seeder_desc1')}</div>`;
                }
            },
            reqs: { genesis: 5 },
            queue_size: 10,
            queue_complete(){ return 100 - global.starDock.seeder.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.starDock.hasOwnProperty('seeder') ? global.starDock.seeder.count : 0)) < 100 ? 100000 : 0; },
                Steel(offset){ return ((offset || 0) + (global.starDock.hasOwnProperty('seeder') ? global.starDock.seeder.count : 0)) < 100 ? 25000 : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.starDock.hasOwnProperty('seeder') ? global.starDock.seeder.count : 0)) < 100 ? 240 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.starDock.hasOwnProperty('seeder') ? global.starDock.seeder.count : 0)) < 100 ? 10 : 0; },
                Nano_Tube(offset){ return ((offset || 0) + (global.starDock.hasOwnProperty('seeder') ? global.starDock.seeder.count : 0)) < 100 ? 12000 : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.starDock['seeder'] ? global.starDock.seeder.count : 0);
                let remain = count < 100 ? loc('star_dock_seeder_status1',[100 - count]) : loc('star_dock_seeder_status2');
                return `<div>${global.race['cataclysm'] ? loc('star_dock_exodus_effect') : loc('star_dock_seeder_effect')}</div><div class="has-text-special">${remain}</div>`;
            },
            action(args){
                if (global.starDock.seeder.count < 100 && payCosts($(this)[0])){
                    incrementStruct('seeder','starDock');
                    if (global.starDock.seeder.count >= 100){
                        global.tech.genesis = 6;
                        clearPopper(`starDock-seeder`);
                        clearElement($('#modalBox'));
                        let c_action = actions.space.spc_gas.star_dock;
                        drawModal(c_action,'star_dock');
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['seeder','starDock']
                };
            }
        },
        prep_ship: {
            id: 'starDock-prep_ship',
            title: loc('star_dock_prep'),
            desc(){
                let label = global.race['cataclysm'] ? loc('star_dock_prep_cata_desc') : loc('star_dock_prep_desc');
                return `<div>${label}</div><div class="has-text-danger">${loc('star_dock_genesis_desc2')}</div>`;
            },
            reqs: { genesis: 6 },
            queue_complete(){ return 0; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(global.race['gravity_well'] ? 150000 : 75000,false,wiki).toFixed(0); }
            },
            effect(){
                let gains = calcPrestige('bioseed');
                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                let label = global.race['cataclysm'] ? loc('star_dock_prep_cata_effect') : loc('star_dock_prep_effect');
                return `<div>${label}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[gains.phage])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])) {
                    global.tech['genesis'] = 7;
                    clearPopper(`starDock-prep_ship`);
                    clearElement($('#modalBox'));
                    let c_action = actions.space.spc_gas.star_dock;
                    drawModal(c_action,'star_dock');
                    return true;
                }
                return false;
            },
        },
        launch_ship: {
            id: 'starDock-launch_ship',
            title: loc('star_dock_genesis'),
            desc(){
                let label = global.race['cataclysm'] ? loc('star_dock_prep_cata_effect') : loc('star_dock_genesis_desc1');
                return `<div>${label}</div><div class="has-text-danger">${loc('star_dock_genesis_desc2')}</div>`;
            },
            reqs: { genesis: 7 },
            queue_complete(){ return 0; },
            cost: {},
            effect(){
                let gains = calcPrestige('bioseed');
                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                let label = global.race['cataclysm'] ? loc('star_dock_genesis_cata_effect1') : loc('star_dock_genesis_effect1');
                return `<div>${label}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[gains.phage])}</div>`;
            },
            action(args){
                bioseed();
                return false;
            },
        },
    };
