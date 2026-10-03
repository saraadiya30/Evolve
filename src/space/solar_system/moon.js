import { loc } from '../../core/locale.js';
import { races } from '../../races/races.js';
import { global } from '../../core/vars.js';
import { payCosts, initStruct, powerOnNewStruct } from '../../actions/actions.js';
import { messageQueue, spaceCostMultiplier, powerCostMod } from '../../functions/functions.js';
import { spatialReasoning } from '../../resources/resources.js';
import { govTitle } from '../../civics/civics.js';
import { production } from '../../resources/prod.js';
import { loadFoundry, jobScale } from '../../civics/jobs.js';
import { spaceProjects } from '../space_registry.js';
import { fuel_adjust, incrementStruct } from '../space.js';

// Region 'spc_moon' dari spaceProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const spaceProjects_spc_moon = {
        info: {
            name: loc('space_moon_info_name'),
            desc(){
                let home = races[global.race.species].home;
                return loc('space_moon_info_desc',[home]);
            },
            support: 'moon_base',
            zone: 'inner',
            syndicate(){ return true; }
        },
        moon_mission: {
            id: 'space-moon_mission',
            title: loc('space_moon_mission_title'),
            desc: loc('space_moon_mission_desc'),
            reqs: { space: 2, space_explore: 2 },
            grant: ['space',3],
            queue_complete(){ return global.tech.space >= 3 ? 0 : 1; },
            cost: {
                Oil(offset,wiki){ return +fuel_adjust(12000,false,wiki).toFixed(0); }
            },
            effect: loc('space_moon_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_moon_mission_action'),'info',false,['progress']);
                    initStruct(spaceProjects.spc_moon.iridium_mine);
                    initStruct(spaceProjects.spc_moon.helium_mine);
                    return true;
                }
                return false;
            }
        },
        moon_base: {
            id: 'space-moon_base',
            title: loc('space_moon_base_title'),
            desc(){ return `<div>${loc('space_moon_base_desc')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Oil.name])}</div>`; },
            reqs: { space: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('moon_base', offset, 22000, 1.32); },
                Cement(offset){ return spaceCostMultiplier('moon_base', offset, 18000, 1.32); },
                Alloy(offset){ return spaceCostMultiplier('moon_base', offset, 7800, 1.32); },
                Polymer(offset){ return spaceCostMultiplier('moon_base', offset, 12500, 1.32); }
            },
            effect(wiki){
                let iridium = spatialReasoning(500);
                let oil = +(fuel_adjust($(this)[0].support_fuel().a,true,wiki)).toFixed(2);
                return `<div>${loc('space_moon_base_effect1')}</div><div>${loc('plus_max_resource',[iridium,global.resource.Iridium.name])}</div><div class="has-text-caution">${loc('space_moon_base_effect3',[oil,$(this)[0].powered()])}</div>`;
            },
            support(){ return 2; },
            support_fuel(){ return { r: 'Oil', a: 2 }; },
            powered(){ return powerCostMod(4); },
            powerBalancer(){
                return [{ s: global.space.moon_base.s_max - global.space.moon_base.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('moon_base');
                    powerOnNewStruct($(this)[0]);
                    if (global.space['moon_base'].count === 1){
                        global.tech['moon'] = 1;
                    }
                    if (!global.tech['luna']){
                        global.tech['luna'] = 1;
                        if (global.race['truepath']){
                            let msg = loc('space_moon_base_msg',[govTitle(3)]);
                            if (global.civic.foreign.gov3.hstl < 10){
                                msg = `${msg} ${loc('space_moon_base_msg_ally')}`;
                            }
                            else if (global.civic.foreign.gov3.hstl > 60){
                                msg = `${msg} ${loc('space_moon_base_msg_hstl')}`;
                            }
                            messageQueue(msg,'info',false,['progress']);
                        }
                    }
                    if (global.race['orbit_decay'] && global.race.orbit_decay > global.stats.days + 2500){
                        global.race.orbit_decay = global.stats.days + 2500;
                        messageQueue(loc('evo_challenge_orbit_decayed_accelerated',[global.race.orbit_decay - global.stats.days]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        on: 0,
                        support: 0,
                        s_max: 0
                    },
                    p: ['moon_base','space']
                };
            },
        },
        iridium_mine: {
            id: 'space-iridium_mine',
            title: loc('space_moon_iridium_mine_title'),
            desc: `<div>${loc('space_moon_iridium_mine_desc')}</div><div class="has-text-special">${loc('space_support',[loc('space_moon_info_name')])}</div>`,
            reqs: { space: 3, luna: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('iridium_mine', offset, 42000, 1.35); },
                Lumber(offset){ return spaceCostMultiplier('iridium_mine', offset, 9000, 1.35); },
                Titanium(offset){ return spaceCostMultiplier('iridium_mine', offset, 17500, 1.35); }
            },
            effect(){
                let values = production('iridium_mine','iridium');
                let iridium = +(values.b).toFixed(3);
                let rival = ``;
                if (global.race['truepath']){
                    if (global.civic.foreign.gov3.hstl < 10){
                        rival = `<div class="has-text-success">${loc('space_rival_ally',[+(values.g * 100).toFixed(1)])}</div>`;
                    }
                    else if (global.civic.foreign.gov3.hstl > 60){
                        rival = `<div class="has-text-danger">${loc('space_rival_war',[+(values.g * 100).toFixed(1)])}</div>`;
                    }
                }
                let cat_coal = global.race['cataclysm'] ? `<div>${loc('produce',[+(production('iridium_mine','coal')).toFixed(2),global.resource.Coal.name])}</div>` : ``;
                let cat_uran = global.race['cataclysm'] ? `<div>${loc('produce',[+(production('iridium_mine','coal') / 48).toFixed(3),global.resource.Uranium.name])}</div>` : ``;
                return `<div class="has-text-caution">${loc('space_used_support',[loc('space_moon_info_name')])}</div><div>${loc('space_moon_iridium_mine_effect',[iridium])}</div>${rival}${cat_coal}${cat_uran}`;
            },
            s_type: 'moon',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    global.resource.Iridium.display = true;
                    incrementStruct('iridium_mine');
                    if (!global.resource['Mythril'].display){
                        global.resource['Mythril'].display = true;
                        loadFoundry();
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['iridium_mine','space']
                };
            },
        },
        helium_mine: {
            id: 'space-helium_mine',
            title: loc('space_moon_helium_mine_title'),
            desc: `<div>${loc('space_moon_helium_mine_desc')}</div><div class="has-text-special">${loc('space_support',[loc('space_moon_info_name')])}</div>`,
            reqs: { space: 3, luna: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('helium_mine', offset, 38000, 1.35); },
                Aluminium(offset){ return spaceCostMultiplier('helium_mine', offset, 9000, 1.35); },
                Steel(offset){ return spaceCostMultiplier('helium_mine', offset, 17500, 1.35); }
            },
            effect(){
                let storage = spatialReasoning(100);
                let values = production('helium_mine');
                let helium = +(values.b).toFixed(3);
                let rival = ``;
                if (global.race['truepath']){
                    if (global.civic.foreign.gov3.hstl < 10){
                        rival = `<div class="has-text-success">${loc('space_rival_ally',[+(values.g * 100).toFixed(1)])}</div>`;
                    }
                    else if (global.civic.foreign.gov3.hstl > 60){
                        rival = `<div class="has-text-danger">${loc('space_rival_war',[+(values.g * 100).toFixed(1)])}</div>`;
                    }
                }
                return `<div class="has-text-caution">${loc('space_used_support',[loc('space_moon_info_name')])}</div><div>${loc('space_moon_helium_mine_effect',[helium])}</div>${rival}<div>${loc('plus_max_resource',[storage,global.resource.Helium_3.name])}</div>`;
            },
            s_type: 'moon',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    global.resource['Helium_3'].display = true;
                    incrementStruct('helium_mine');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['helium_mine','space']
                };
            },
        },
        observatory: {
            id: 'space-observatory',
            title: loc('space_moon_observatory_title'),
            desc: `<div>${loc('space_moon_observatory_desc')}</div><div class="has-text-special">${loc('space_support',[loc('space_moon_info_name')])}</div>`,
            reqs: { science: 9, luna: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('observatory', offset, 200000, 1.28); },
                Knowledge(offset){ return spaceCostMultiplier('observatory', offset, 69000, 1.28); },
                Stone(offset){ return spaceCostMultiplier('observatory', offset, 125000, 1.28); },
                Iron(offset){ return spaceCostMultiplier('observatory', offset, 65000, 1.28); },
                Iridium(offset){ return spaceCostMultiplier('observatory', offset, 1250, 1.28); }
            },
            effect(){
                let prof = '';
                if (global.race['cataclysm']){
                    prof = `<div>${loc('city_university_effect',[jobScale(1)])}</div>`;
                }
                let gain = 5000;
                if (global.race['cataclysm'] && global.space['satellite'] && global.space.satellite.count > 0){
                    gain *= 1 + (global.space.satellite.count * 0.25);
                }
                let synergy = global.race['cataclysm'] ? `<div>${loc('space_moon_observatory_cata_effect',[25])}</div>` : `<div>${loc('space_moon_observatory_effect',[5])}</div>`;
                return `<div class="has-text-caution">${loc('space_used_support',[loc('space_moon_info_name')])}</div>${prof}<div>${loc('plus_max_resource',[gain,global.resource.Knowledge.name])}</div>${synergy}`;
            },
            s_type: 'moon',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('observatory');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['observatory','space']
                };
            }
        },
    };
