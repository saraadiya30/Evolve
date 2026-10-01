import { global } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { spaceCostMultiplier } from '../../functions/cost_multipliers.js';
import { powerCostMod } from '../../functions/power_modifiers.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { powerOnNewStruct } from '../../actions/evolution/planet_setup.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { incrementStruct } from '../../space/space_requirements.js';
import { races } from '../../core/registries.js';
import { checkWarlordAchieve } from '../../portal/hell/hell_reports.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

// Bagian dari edenElysium (5 entri: archive .. eden_cement), dipisah dari elysium.js. Urutan entri sama persis.
export const edenElysiumPart3 = {
        archive: {
            id: 'eden-archive',
            title(){ return global.eden['archive'] && global.eden.archive.count >= 10 ? loc('eden_archive_bd') : loc('eden_archive_title'); },
            desc(){
                return `<div>${loc('eden_archive_title')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { elysium: 14 },
            cost: {
                Money(offset){ return spaceCostMultiplier('archive', offset, 3750000000, 1.26, 'eden'); },
                Nano_Tube(offset){ return spaceCostMultiplier('archive', offset, 90000000, 1.26, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('archive', offset, 50000, 1.26, 'eden'); },
                Elysanite(offset){ return spaceCostMultiplier('archive', offset, 35000000, 1.26, 'eden'); },
                Soul_Gem(offset){ return spaceCostMultiplier('archive', offset, 99, 1.26, 'eden'); },
            },
            effect(){
                let desc = `<div>${loc('plus_max_resource',[1013,global.resource.Omniscience.name])}</div>`;
                if (global.tech['elysium'] && global.tech.elysium >= 12){
                    desc += `<div>${loc('eden_restaurant_effect',[0.4,loc(`eden_restaurant_bd`)])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(75); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('archive','eden');
                    powerOnNewStruct($(this)[0]);
                    if (global.tech.elysium === 14){
                        global.tech.elysium = 15;
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['archive','eden']
                };
            }
        },
        north_pier: {
            id: 'eden-north_pier',
            title(){ return loc('eden_pier',[loc('north')]); },
            desc(wiki){
                if (wiki || !global.eden.hasOwnProperty('rune_gate') || global.eden.north_pier.count < 10){
                    return `<div>${loc('eden_pier',[loc('north')])}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('eden_pier',[loc('north')])}</div>`;
                }
            },
            reqs: { isle: 2 },
            queue_complete(){ return 10 - global.eden.north_pier.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('north_pier') ? global.eden.north_pier.count : 0) < 10 ? 7500000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('north_pier') || (global.eden.north_pier.count < 10) ? 7500000000 : 0;
                },
                Iron(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('north_pier') ? global.eden.north_pier.count : 0) < 10 ? 500000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('north_pier') || (global.eden.north_pier.count < 10) ? 500000000 : 0;
                },
                Plywood(offset){
                    if (global.race['kindling_kindred'] || global.race['smoldering']){ return 0; }
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('north_pier') ? global.eden.north_pier.count : 0) < 10 ? 250000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('north_pier') || (global.eden.north_pier.count < 10) ? 250000000 : 0;
                },
                Sheet_Metal(offset){
                    if (!global.race['kindling_kindred'] && !global.race['smoldering']){ return 0; }
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('north_pier') ? global.eden.north_pier.count : 0) < 10 ? 62500000 : 0;
                    }
                    return !global.eden.hasOwnProperty('north_pier') || (global.eden.north_pier.count < 10) ? 62500000 : 0;
                },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.eden.hasOwnProperty('north_pier') ? global.eden.north_pier.count : 0);
                if (count >= 10){
                    let desc = `<div>${loc('eden_pier_effect',[loc('eden_pier',[loc('south')]),loc('eden_isle_name')])}</div>`;
                    return desc;
                }
                else {
                    let size = 10;
                    let remain = size - count;
                    return `<div>${loc('eden_pier_effect',[loc('eden_pier',[loc('south')]),loc('eden_isle_name')])}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(args){
                if (global.eden.north_pier.count < 10 && payCosts($(this)[0])){
                    incrementStruct('north_pier','eden');
                    if (global.eden.south_pier.count === 10 && global.eden.north_pier.count === 10 && global.tech.isle === 2){
                        global.tech.isle = 3;
                        drawTech();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['north_pier','eden']
                };
            }
        },
        rushmore: {
            id: 'eden-rushmore',
            title(){ return loc('eden_rushmore',[races[global.race.species].name]); },
            desc(){ return `<div>${loc('eden_rushmore',[races[global.race.species].name])}</div>`; },
            reqs: { elysium: 16 },
            cost: {
                Money(o,wiki){ return global.eden?.rushmore?.count === 0 || wiki ? 55000000000 : 0; },
                Stone(o,wiki){ return global.eden?.rushmore?.count === 0 || wiki ? 10000000000 : 0; },
            },
            queue_complete(){ return 1 - (global.eden?.rushmore?.count || 0); },
            effect(){
                return `<div>${loc('space_red_vr_center_effect2',[10])}</div>`;
            },
            action(args){
                if (global.eden.rushmore.count === 0 && payCosts($(this)[0])){
                    incrementStruct('rushmore','eden');
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['rushmore','eden']
                };
            },
            flair(){
                return loc('eden_rushmore_flair');
            }
        },
        reincarnation: {
            id: 'eden-reincarnation',
            title(){ return loc('eden_reincarnation_title'); },
            desc(){ return `<div>${loc('eden_reincarnation_title')}</div>`; },
            reqs: { elysium: 17 },
            cost: {
                Money(o){
                    return global.eden?.reincarnation?.count === 0 ? 35000000000
                        : (global.eden?.reincarnation?.count === 1 ? 5000000000 : 0);
                },
                Aluminium(o){ return global.eden?.reincarnation?.count === 0 ? 10000000000 : 0; },
                Nano_Tube(o){ return global.eden?.reincarnation?.count === 0 ? 2000000000 : 0; },
                Asphodel_Powder(o){ return global.eden?.reincarnation?.count === 0 ? 750000 : 0; },
            },
            queue_complete(){ return 1 - (global.eden?.reincarnation?.count || 0); },
            effect(){
                return `<div>${loc('eden_reincarnation_effect',[races[global.race.species].name])}</div>`;
            },
            action(args){
                if (global.eden.reincarnation.count === 0 && payCosts($(this)[0])){
                    incrementStruct('reincarnation','eden');
                    return true;
                }
                else if (global.eden.reincarnation.count === 1 && global['resource'][global.race.species].max > global['resource'][global.race.species].amount && payCosts($(this)[0])){
                    global['resource'][global.race.species].amount++;
                    global.civic[global.civic.d_job].workers++;
                    if (global.race['warlord']){
                        global.stats.warlord.r = true;
                        checkWarlordAchieve();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['reincarnation','eden']
                };
            },
            flair(){
                return loc('eden_reincarnation_flair');
            }
        },
        eden_cement: {
            id: 'eden-eden_cement',
            title(){ return loc('city_cement_plant'); },
            desc(){
                return `<div>${loc('city_cement_plant_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { cement:8 },
            cost: {
                Money(offset){ return spaceCostMultiplier('eden_cement', offset, 5000000000, 1.24, 'eden'); },
                Stone(offset){ return spaceCostMultiplier('eden_cement', offset, 1000000000, 1.24, 'eden'); },
                Iron(offset){ return spaceCostMultiplier('eden_cement', offset, 6800000000, 1.24, 'eden'); },
                Asphodel_Powder(offset){ return spaceCostMultiplier('eden_cement', offset, 65000, 1.24, 'eden'); },
            },
            effect(){
                let desc = loc('plus_max_resource',[jobScale(5),loc(`job_cement_worker`)]);
                desc += `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(10); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('eden_cement','eden');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['eden_cement','eden']
                };
            }
        },
};
