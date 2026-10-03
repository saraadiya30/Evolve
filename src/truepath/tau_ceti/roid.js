import { global } from '../../core/vars.js';
import { messageQueue, spaceCostMultiplier } from '../../functions/functions.js';
import { production } from '../../resources/prod.js';
import { payCosts, powerOnNewStruct } from '../../actions/actions.js';
import { int_fuel_adjust, incrementStruct } from '../../space/space.js';
import { defineIndustry } from '../../industry/industry.js';
import { loc } from '../../core/locale.js';

// Region 'tau_roid' dari tauCetiModules (dipisah dari truepath.js). Isi/urutan entri sama persis; digabung via truepath_registry.js di truepath.js.
export const tauRoid = {
        info: {
            name(){
                return loc('tau_roid_title');
            },
            desc(){
                return loc('tau_roid_desc');
            },
            support: 'patrol_ship',
        },
        roid_mission: {
            id: 'tauceti-roid_mission',
            title(){
                return loc('space_mission_title',[loc('tau_roid_title')]);
            },
            desc(){
                return loc('space_mission_desc',[loc('tau_roid_title')]);
            },
            reqs: { tauceti: 5 },
            grant: ['tau_roid',1],
            path: ['truepath'],
            queue_complete(){ return global.tech.tau_roid >= 1 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +int_fuel_adjust(1250000,false,wiki).toFixed(0); },
            },
            effect(){
                return loc('tau_roid_mission_effect',[loc('tau_roid_title')]);
            },
            action(){
                if (payCosts($(this)[0])){
                    messageQueue(loc('tau_roid_mission_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        patrol_ship: {
            id: 'tauceti-patrol_ship',
            title: loc('tau_roid_patrol_ship'),
            desc(){ return `<div>${loc('tau_roid_patrol_ship')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Helium_3.name])}</div>`; },
            reqs: { tau_roid: 3 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('patrol_ship', offset, 45000000, 1.25, 'tauceti'); },
                Adamantite(offset){ return spaceCostMultiplier('patrol_ship', offset, 1800000, 1.25, 'tauceti'); },
                Elerium(offset){ return spaceCostMultiplier('patrol_ship', offset, 520, 1.25, 'tauceti'); },
                Stanene(offset){ return spaceCostMultiplier('patrol_ship', offset, 2675000, 1.25, 'tauceti'); },
                Bolognium(offset){ return spaceCostMultiplier('patrol_ship', offset, 1150000, 1.25, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust($(this)[0].support_fuel().a).toFixed(1);
                let desc = `<div>${loc('tau_roid_patrol_ship_security',[$(this)[0].support()])}</div>`;
                desc = desc + `<div>${loc('tau_roid_patrol_ship_effect')}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                return desc;
            },
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? 15 : 250 }; },
            support(){ return 1; },
            powered(){ return 0; },
            refresh: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('patrol_ship','tauceti');
                    global.tauceti.patrol_ship.on++;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, support: 0, s_max: 0 },
                    p: ['patrol_ship','tauceti']
                };
            }
        },
        mining_ship: {
            id: 'tauceti-mining_ship',
            title: loc('tau_roid_mining_ship'),
            desc(){ return `<div>${loc('tau_roid_mining_ship')}</div>`; },
            reqs: { tau_roid: 4 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('mining_ship', offset, 28000000, 1.28, 'tauceti'); },
                Uranium(offset){ return spaceCostMultiplier('mining_ship', offset, 12500, 1.28, 'tauceti'); },
                Titanium(offset){ return spaceCostMultiplier('mining_ship', offset, 2200000, 1.28, 'tauceti'); },
                Alloy(offset){ return spaceCostMultiplier('mining_ship', offset, 1750000, 1.28, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust($(this)[0].support_fuel().a).toFixed(1);
                let mine = +(production('mining_ship')).toFixed(2);
                let desc = `<div>${loc('tau_roid_mining_ship_effect',[mine])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                return desc;
            },
            s_type: 'tau_roid',
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? 12 : 75 }; },
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('mining_ship','tauceti');
                    powerOnNewStruct($(this)[0]);
                    if (global.tauceti.mining_ship.count === 1){
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0, common: 50, uncommon: 50, rare: 50 },
                    p: ['mining_ship','tauceti']
                };
            }
        },
        whaling_ship: {
            id: 'tauceti-whaling_ship',
            title: loc('tau_roid_whaling_ship'),
            desc(){ return `<div>${loc('tau_roid_whaling_ship')}</div>`; },
            reqs: { tau_whale: 2 },
            path: ['truepath'],
            cost: {
                Money(offset){ return spaceCostMultiplier('whaling_ship', offset, 35000000, 1.28, 'tauceti'); },
                Aluminium(offset){ return spaceCostMultiplier('whaling_ship', offset, 3400000, 1.28, 'tauceti'); },
                Neutronium(offset){ return spaceCostMultiplier('whaling_ship', offset, 168000, 1.28, 'tauceti'); },
                Nano_Tube(offset){ return spaceCostMultiplier('whaling_ship', offset, 800000, 1.28, 'tauceti'); },
            },
            effect(){
                let fuel = +int_fuel_adjust($(this)[0].support_fuel().a).toFixed(1);
                let mine = +(production('whaling_ship')).toFixed(2);
                let desc = `<div>${loc('tau_roid_whaling_ship_effect',[mine])}</div>`;
                desc = desc + `<div class="has-text-caution">${loc('spend',[fuel,global.resource[$(this)[0].support_fuel().r].name])}</div>`;
                return desc;
            },
            s_type: 'tau_roid',
            support_fuel(){ return { r: 'Helium_3', a: global.tech['isolation'] ? 14 : 90 }; },
            support(){ return -1; },
            powered(){ return 0; },
            action(){
                if (payCosts($(this)[0])){
                    incrementStruct('whaling_ship','tauceti');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count : 0, on: 0 },
                    p: ['whaling_ship','tauceti']
                };
            }
        },
    };
