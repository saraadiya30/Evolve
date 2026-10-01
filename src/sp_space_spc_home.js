import { races } from './races.js';
import { global, seededRandom } from './vars.js';
import { loc } from './locale.js';
import { payCosts, initStruct, wardenLabel, powerOnNewStruct } from './actions.js';
import { checkControlling } from './civics.js';
import { messageQueue, spaceCostMultiplier, powerCostMod } from './functions.js';
import { spatialReasoning } from './resources.js';
import { spaceProjects } from './space_registry.js';
import { fuel_adjust, incrementStruct, planetName } from './space.js';

// Region 'spc_home' dari spaceProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const spaceProjects_spc_home = {
        info: {
            name(){
                return races[global.race.species].home;
            },
            desc: loc('space_home_info_desc'),
            zone: 'inner',
            syndicate(){ return false; }
        },
        test_launch: {
            id: 'space-test_launch',
            title: loc('space_home_test_launch_title'),
            desc: loc('space_home_test_launch_desc'),
            reqs: { space: 1 },
            grant: ['space',2],
            queue_complete(){ return global.tech.space >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 100000; },
                Oil(offset,wiki){ return fuel_adjust(7500,false,wiki); }
            },
            effect: loc('space_home_test_launch_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    if (global.race['truepath']){
                        let sabotage = 1;
                        if (!checkControlling('gov0')){ sabotage++; }
                        if (!checkControlling('gov1')){ sabotage++; }
                        if (!checkControlling('gov2')){ sabotage++; }
                        if (Math.floor(seededRandom(0,sabotage)) !== 0){
                            messageQueue(loc('space_home_test_launch_action_fail'),'danger',false,['progress']);
                            return 0;
                        }
                    }
                    initStruct(spaceProjects.spc_home.satellite);
                    messageQueue(loc('space_home_test_launch_action'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        satellite: {
            id: 'space-satellite',
            title: loc('space_home_satellite_title'),
            desc: loc('space_home_satellite_desc'),
            reqs: { space: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('satellite', offset, 72000, 1.22); },
                Knowledge(offset){ return spaceCostMultiplier('satellite', offset, 28000, 1.22); },
                Oil(offset,wiki){ return spaceCostMultiplier('satellite', offset, fuel_adjust(3200,false,wiki), 1.22); },
                Alloy(offset){ return spaceCostMultiplier('satellite', offset, 8000, 1.22); }
            },
            effect(){
                let knowledge = global.race['cataclysm'] || global.race['orbit_decayed'] ? 2000 : 750;
                if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 5 : 10;
                    knowledge *= (global.tech['supercollider'] / ratio) + 1;
                }
                let label = global.race['cataclysm'] ? loc('space_moon_observatory_title') : (global.race['orbit_decayed'] ? loc('city_university') : wardenLabel());
                let amount = global.race['cataclysm'] ? 25 : (global.race['orbit_decayed'] ? 12 : 4);
                let synergy = `<div>${loc('space_home_satellite_effect2',[label, amount])}</div>`;
                return `<div>${loc('plus_max_resource',[knowledge,global.resource.Knowledge.name])}</div>${synergy}<div>${loc('space_home_satellite_effect3',[global.civic.scientist ? global.civic.scientist.name : loc('job_scientist')])}</div>`
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('satellite');
                    global['resource']['Knowledge'].max += 750;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['satellite','space']
                };
            }
        },
        gps: {
            id: 'space-gps',
            title: loc('space_home_gps_title'),
            desc(){
                if (global.space.hasOwnProperty('gps') && global.space['gps'].count < 4){
                    return `<div>${loc('space_home_gps_desc')}</div><div class="has-text-special">${loc('space_home_gps_desc_req')}</div>`;
                }
                else {
                    return `<div>${loc('space_home_gps_desc')}</div>`;
                }
            },
            reqs: { satellite: 1 },
            not_trait: ['terrifying'],
            cost: {
                Money(offset){ return spaceCostMultiplier('gps', offset, 75000, 1.18); },
                Knowledge(offset){ return spaceCostMultiplier('gps', offset, 50000, 1.18); },
                Copper(offset){ return spaceCostMultiplier('gps', offset, 6500, 1.18); },
                Oil(offset,wiki){ return spaceCostMultiplier('gps', offset, fuel_adjust(3500,false,wiki), 1.18); },
                Titanium(offset){ return spaceCostMultiplier('gps', offset, 8000, 1.18); }
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.space.hasOwnProperty('gps') ? global.space['gps'].count : 0);
                if (count < 4){
                    return loc('space_home_gps_effect_req');
                }
                else {
                    return `<div>${loc('space_home_gps_effect')}</div><div>${loc('space_home_gps_effect2',[200])}</div>`;
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('gps');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['gps','space']
                };
            }
        },
        propellant_depot: {
            id: 'space-propellant_depot',
            title: loc('space_home_propellant_depot_title'),
            desc: loc('space_home_propellant_depot_desc'),
            reqs: { space_explore: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('propellant_depot', offset, 55000, 1.35); },
                Aluminium(offset){ return spaceCostMultiplier('propellant_depot', offset, 22000, 1.35); },
                Oil(offset,wiki){ return spaceCostMultiplier('propellant_depot', offset, fuel_adjust(5500,false,wiki), 1.35); },
            },
            effect(){
                let oil = spatialReasoning(1250) * (global.tech['world_control'] ? 1.5 : 1);
                if (global.resource['Helium_3'].display){
                    let helium = spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                    return `<div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}</div><div>${loc('plus_max_resource',[helium,global.resource.Helium_3.name])}</div>`;
                }
                return `<div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('propellant_depot');
                    global['resource']['Oil'].max += spatialReasoning(1250) * (global.tech['world_control'] ? 1.5 : 1);
                    if (global.resource['Helium_3'].display){
                        global['resource']['Helium_3'].max += spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['propellant_depot','space']
                };
            }
        },
        nav_beacon: {
            id: 'space-nav_beacon',
            title(){ return global.race['orbit_decayed'] ? loc('space_home_broadcast_beacon_title') : loc('space_home_nav_beacon_title'); },
            desc: `<div>${loc('space_home_nav_beacon_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { luna: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('nav_beacon', offset, 75000, 1.32); },
                Copper(offset){ return spaceCostMultiplier('nav_beacon', offset, 38000, 1.32); },
                Aluminium(offset){ return spaceCostMultiplier('nav_beacon', offset, 44000, 1.32); },
                Oil(offset,wiki){ return spaceCostMultiplier('nav_beacon', offset, fuel_adjust(12500,false,wiki), 1.32); },
                Iridium(offset){ return spaceCostMultiplier('nav_beacon', offset, 1200, 1.32); }
            },
            powered(){ return powerCostMod(2); },
            powerBalancer(){
                return global.tech['luna'] && global.tech['luna'] >= 3
                    ? [{ s: global.space.moon_base.s_max - global.space.moon_base.support },{ s: global.space.spaceport.s_max - global.space.spaceport.support }]
                    : [{ s: global.space.moon_base.s_max - global.space.moon_base.support }];
            },
            support(){ return 1; },
            effect(){
                let orbitEffect = '';
                if (global.race['orbit_decayed'] && global.tech['broadcast'] && !global.race['joyless']){
                    orbitEffect = `<div class="has-text-caution">${loc('space_red_vr_center_effect1',[global.tech['broadcast'] / 2])}</div>`;
                }
                let effect1 = global.race['orbit_decayed'] ? '' : `<div>${loc('space_home_nav_beacon_effect1')}</div>`;
                let effect3 = global.tech['luna'] >=3 ? `<div>${loc('space_red_spaceport_effect1',[planetName().red,1])}</div>` : '';
                return `${effect1}${effect3}${orbitEffect}<div class="has-text-caution">${loc('space_home_nav_beacon_effect2',[$(this)[0].powered()])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('nav_beacon');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['nav_beacon','space']
                };
            }
        },
    };
