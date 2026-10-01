import { global } from './vars.js';
import { messageQueue, calcPrestige } from './functions.js';
import { payCosts } from './actions.js';
import { incrementStruct, ascendLab } from './space.js';
import { checkWarlordAchieve } from './portal.js';
import { loc } from './locale.js';
import { renderEdenic } from './edenic_render.js';

// Region 'eden_palace' dari edenicModules (dipisah dari edenic.js). Urutan/isi entri sama persis; digabung di edenic.js.
export function apotheosisProjection(){
    let gains = calcPrestige('apotheosis');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_name') : loc('resource_Plasmid_name');
    let desc = `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div>`;
    desc += `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.supercoiled,loc('resource_Supercoiled_plural_name')])}</div>`;
    if (global.race['warlord']){
        desc += `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.artifact,loc('resource_Artifact_name')])}</div>`;
    }
    return desc;
}

export const edenPalace = {
        info: {
            name: loc('eden_palace_name'),
            desc(){ return loc('eden_palace_desc'); },
            prop(){
                return `<span class="pad"><span v-html="$options.filters.filter(energy,'energy')"></span></span>`;
            },
            bind(){
                return global.eden.palace;
            },
            filter(v,type){
                switch (type){
                    case 'energy':
                        return loc(`eden_palace_energy`,[v.toLocaleString()]);
                }
            }
        },
        scout_palace: {
            id: 'eden-scout_palace',
            title: loc('eden_scout_palace_title'),
            desc: loc('eden_scout_palace_title'),
            reqs: { palace: 1 },
            grant: ['palace',2],
            queue_complete(){ return global.tech.palace >= 2 ? 0 : 1; },
            cost: {
                Money(){ return 50000000000; },
                Helium_3(){ return global.race['warlord'] ? 5000000 : 0; },
                Deuterium(){ return global.race['warlord'] ? 0 : 5000000; }
            },
            effect: loc('eden_scout_palace_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('eden_scout_palace_result'),'info',false,['progress']);
                    return true;
                }
                return false;
            }
        },
        throne: {
            id: 'eden-throne',
            title(){ return loc('eden_abandoned_throne_title'); },
            desc(){ return loc('eden_abandoned_throne_title'); },
            reqs: { palace: 2 },
            condition(){ return global.tech.palace < 6 ? true : false; },
            queue_complete(){ return false },
            cost: {},
            effect: loc('eden_abandoned_throne_effect'),
            action(args){
                return false;
            }
        },
        infuser: {
            id: 'eden-infuser',
            title(){ return loc('eden_infuser_title'); },
            desc(wiki){
                if (!global.eden.hasOwnProperty('infuser') || global.eden.infuser.count < 25 || wiki){
                    return `<div>${loc('eden_infuser_title')}</div><div class="has-text-special">${loc('requires_segments',[25])}</div>`;
                }
                else {
                    return `<div>${loc('eden_infuser_title')}</div>`;
                }
            },
            reqs: { palace: 6 },
            queue_size: 5,
            queue_complete(){ return 25 - global.eden.infuser.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('infuser') ? global.eden.infuser.count : 0) < 25 ? 12000000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('infuser') || (global.eden.infuser.count < 25) ? 12000000000 : 0;
                },
                Copper(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('infuser') ? global.eden.infuser.count : 0) < 25 ? 10000000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('infuser') || (global.eden.infuser.count < 25) ? 10000000000 : 0;
                },
                Graphene(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('infuser') ? global.eden.infuser.count : 0) < 25 ? 1000000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('infuser') || (global.eden.infuser.count < 25) ? 1000000000 : 0;
                },
                Elysanite(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('infuser') ? global.eden.infuser.count : 0) < 25 ? 125000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('infuser') || (global.eden.infuser.count < 25) ? 125000000 : 0;
                },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.eden.hasOwnProperty('infuser') ? global.eden.infuser.count : 0);
                if (count >= 25){
                    let desc = `<div>${loc('eden_infuser_effect')}</div>`;
                    return desc;
                }
                else {
                    let size = 25;
                    let remain = size - count;
                    return `<div>${loc('eden_infuser_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(args){
                if (global.eden.infuser.count < 25 && payCosts($(this)[0])){
                    incrementStruct('infuser','eden');
                    if (global.eden?.conduit?.count === 25 && global.eden?.infuser?.count === 25){
                        global.tech.palace = 7;
                        global.eden['apotheosis'] = { count: 0 };
                        renderEdenic();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['infuser','eden']
                };
            },
        },
        apotheosis: {
            id: 'eden-apotheosis',
            title: loc('eden_apotheosis'),
            desc: loc('eden_apotheosis'),
            reqs: { palace: 7 },
            condition(){
                return global.eden.hasOwnProperty('apotheosis') && global.eden.apotheosis.count === 0;
            },
            queue_complete(){ return 0; },
            no_multi: true,
            cost: {},
            effect(){
                let reward = apotheosisProjection();
                return `<div>${loc('eden_apotheosis_effect')}</div>${reward}`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.race['warlord']){
                        global.stats.warlord.g = true;
                        checkWarlordAchieve();
                    }
                    ascendLab(true);
                    return true;
                }
                return false;
            }
        },
        conduit: {
            id: 'eden-conduit',
            title(){ return loc('eden_conduit_title'); },
            desc(wiki){
                if (!global.eden.hasOwnProperty('conduit') || global.eden.conduit.count < 25 || wiki){
                    return `<div>${loc('eden_conduit_title')}</div><div class="has-text-special">${loc('requires_segments',[25])}</div>`;
                }
                else {
                    return `<div>${loc('eden_conduit_title')}</div>`;
                }
            },
            reqs: { palace: 5 },
            queue_size: 5,
            queue_complete(){ return 25 - global.eden.conduit.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('conduit') ? global.eden.conduit.count : 0) < 25 ? 8000000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('conduit') || (global.eden.conduit.count < 25) ? 25000000000 : 0;
                },
                Stanene(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('conduit') ? global.eden.conduit.count : 0) < 25 ? 250000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('conduit') || (global.eden.conduit.count < 25) ? 250000000 : 0;
                },
                Orichalcum(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('conduit') ? global.eden.conduit.count : 0) < 25 ? 125000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('conduit') || (global.eden.conduit.count < 25) ? 125000000 : 0;
                },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.eden.hasOwnProperty('conduit') ? global.eden.conduit.count : 0);
                if (count >= 25){
                    let desc = `<div>${loc('eden_conduit_done')}</div>`;
                    return desc;
                }
                else {
                    let size = 25;
                    let remain = size - count;
                    return `<div>${loc('eden_conduit_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(args){
                if (global.eden.conduit.count < 25 && payCosts($(this)[0])){
                    incrementStruct('conduit','eden');
                    if (global.eden?.conduit?.count === 25 && global.eden?.infuser?.count === 25){
                        global.tech.palace = 7;
                        global.eden['apotheosis'] = { count: 0 };
                        renderEdenic();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['conduit','eden']
                };
            },
            flair(){ return loc(`eden_conduit_flair`); }
        },
        tomb: {
            id: 'eden-tomb',
            title(){ return global.eden?.tomb?.count === 10 ? loc('eden_tomb_sealed') : loc('eden_tomb_title'); },
            desc(wiki){
                if (!global.eden.hasOwnProperty('tomb') || global.eden.tomb.count < 10 || wiki){
                    return `<div>${loc('eden_tomb_title')}</div><div class="has-text-special">${loc('requires_segments',[10])}</div>`;
                }
                else {
                    return `<div>${loc('eden_tomb_title')}</div>`;
                }
            },
            reqs: { palace: 3 },
            queue_complete(){ return 10 - global.eden.tomb.count; },
            cost: {
                Money(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('tomb') ? global.eden.tomb.count : 0) < 10 ? 25000000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('tomb') || (global.eden.tomb.count < 10) ? 25000000000 : 0;
                },
                Cement(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('tomb') ? global.eden.tomb.count : 0) < 10 ? 10000000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('tomb') || (global.eden.tomb.count < 10) ? 10000000000 : 0;
                },
                Neutronium(offset){
                    if (offset){
                        return offset + (global.eden.hasOwnProperty('tomb') ? global.eden.tomb.count : 0) < 10 ? 100000000 : 0;
                    }
                    return !global.eden.hasOwnProperty('tomb') || (global.eden.tomb.count < 10) ? 100000000 : 0;
                },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.eden.hasOwnProperty('tomb') ? global.eden.tomb.count : 0);
                if (count >= 10){
                    let desc = `<div>${loc('eden_tomb_effect')}</div>`;
                    return desc;
                }
                else {
                    let size = 10;
                    let remain = size - count;
                    return `<div>${loc('eden_tomb_constuct')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
            },
            action(args){
                if (global.eden.tomb.count < 10 && payCosts($(this)[0])){
                    incrementStruct('tomb','eden');
                    if (global.eden.tomb.count === 10 && global.tech.palace === 3){
                        global.tech.palace = 4;
                        renderEdenic();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['tomb','eden']
                };
            },
            flair(){ return loc(`eden_tomb_flair`); }
        }
    };
