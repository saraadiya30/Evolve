// Contains: combineTraits(), traitRank(), setTraitRank(), fathomCheck(), traitSkin(), hoovedReskin(), orbitLength(), shellColor(), foxColor(), basicRace(), renderSupernatural()
import { global } from '../../core/vars.js';
import { traits, races } from '../../core/registries.js';
import { loc } from '../../core/locale.js';
import { randomKey } from '../../functions/icons_easter_eggs.js';
import { clearElement } from '../../functions/dom_helpers.js';
import { genus_def } from '../genus_def.js';
import { cleanRemoveTrait, cleanAddTrait } from './trait_changes.js';
import { minorWish } from '../powers/minor_wish.js';
import { majorWish, ocularPower } from '../powers/power_panels.js';

// Functions extracted from races.js (source order preserved). races.js still re-exports the previously exported names.


export function combineTraits(){

    Object.keys(global.race.inactiveTraits).forEach(function (trait){
        global.race[trait] = global.race.inactiveTraits[trait];
    })
    global.race.inactiveTraits = {};

    if(global.race['herbivore'] && global.race['carnivore']){ //herbivore and carnivore found. Add forager
        let rank = 1

        global.race.inactiveTraits['herbivore'] = global.race['herbivore'];
        global.race.inactiveTraits['carnivore'] = global.race['carnivore'];
        delete global.race['herbivore'];
        delete global.race['carnivore'];
        if(global.race['forager'] !== rank){
            setTraitRank('forager',{ set: rank, force:true});
            cleanRemoveTrait('carnivore');
            cleanRemoveTrait('herbivore');
            cleanAddTrait('forager');
        }
    }
    else if(global.race['forager']){
        delete global.race['forager'];
        cleanRemoveTrait('forager');
    }
}

export function traitRank(trait){
    if (global.race['empowered'] && !['empowered','catnip','anise'].includes(trait)){
        let val = traits[trait].val;
        if (val >= traits.empowered.vars()[0] && val <= traits.empowered.vars()[1]){
            switch (global.race[trait]){
                case 0.1:
                    return 0.25;
                case 0.25:
                    return 0.5;
                case 0.5:
                    return 1;
                case 1:
                    return 2;
                case 2:
                    return 3;
                case 3:
                    return 4;
                case 4:
                    return 4;
            }
        }
    }
    return global.race[trait];
}

export function setTraitRank(trait,opts){
    opts = opts || {};
    if (global.race[trait] && !opts['force']){
        switch (global.race[trait]){
            case 0.1:
                global.race[trait] = opts['down'] ? 0.1 : 0.25;
                return opts['down'] ? false : true;
            case 0.25:
                global.race[trait] = opts['down'] ? 0.1 : 0.5;
                return true;
            case 0.5:
                global.race[trait] = opts['down'] ? 0.25 : 1;
                return true;
            case 1:
                global.race[trait] = opts['down'] ? 0.5 : 2;
                return true;
            case 2:
                global.race[trait] = opts['down'] ? 1 : 3;
                return true;
            case 3:
                global.race[trait] = opts['down'] ? 2 : 4;
                return true;
            case 4:
                global.race[trait] = opts['down'] ? 3 : 4;
                return opts['down'] ? true : false;
        }
    }
    else if (opts['set']){
        global.race[trait] = opts['set'];
        return true;
    }
    return false;
}


export function traitSkin(type, trait, species){
    let artificial = species ? genus_def[races[species].type].traits.artifical : global.race['artifical'];
    switch (type){
        case 'name':
        {
            let name = {
                hooved: hoovedReskin(false, species),
                promiscuous: artificial ? loc('trait_promiscuous_synth_name') : traits.promiscuous.name,
                weak: species === 'dwarf' ? loc('trait_drunk_name') : traits.weak.name,
                spiritual: global.race.universe === 'evil' && global.civic.govern.type !== 'theocracy' ? loc('trait_manipulator_name') : traits.spiritual.name,
            };
            return trait ? (name[trait] ? name[trait] : traits[trait].name) : name;
        } 
        case 'desc':
        {
            let desc = {
                hooved: hoovedReskin(true, species),
                promiscuous: artificial ? loc('trait_promiscuous_synth') : traits['promiscuous'].desc,
                weak: species === 'dwarf' ? loc('trait_drunk') : traits.weak.desc,
                spiritual: global.race.universe === 'evil' && global.civic.govern.type !== 'theocracy' ? loc('trait_manipulator') : traits.spiritual.desc,
                blurry: global.race['warlord'] ? loc('trait_blurry_warlord') : traits.blurry.desc,
                playful: global.race['warlord'] ? loc('trait_playful_warlord') : traits.playful.desc,
                befuddle: global.race['warlord'] ? loc('trait_befuddle_warlord') : traits.befuddle.desc,
            };
            return trait ? (desc[trait] ? desc[trait] : traits[trait].desc) : desc;
        }
    }
}

export function hoovedReskin(desc, species=global.race.species){
    let type = species === global.race.species ? global.race.maintype || races[species].type : races[species].type;
    if (species === 'sludge' || species === 'ultra_sludge'){
        return desc ? loc('trait_hooved_slime') : loc('trait_hooved_slime_name');
    }
    else if ([
        'cath','wolven','dracnid','seraph','cyclops','kobold','tuskin','sharkin','beholder','djinn'
        ].includes(species)){
        return desc ? loc(`trait_hooved_${species}`) : loc(`trait_hooved_${species}_name`);
    }
    else if ([
        'humanoid','avian','plant','fungi','reptilian','fey','synthetic'
        ].includes(type)){
        return desc ? loc(`trait_hooved_${type}`) : loc(`trait_hooved_${type}_name`);
    }
    else {
        return desc ? traits['hooved'].desc : traits['hooved'].name;
    }
}

export function orbitLength(){
    let orbit = global.city.calendar.orbit;
    if (global.city.ptrait.includes('kamikaze')){
        orbit -= global.city.calendar.year;
        if ((!global.race['truepath'] || global.race['lone_survivor'] || global.tech['titan_ai_core'] || global.race['tidal_decay']) && orbit < 100){
            orbit = 100;
        }
    }
    return orbit;
}

export function shellColor(){
    if (global.race.hasOwnProperty('shell_color')){
        return loc(`color_${global.race.shell_color}`);
    }
    return loc(`color_green`);
}

export function foxColor(){
    if (global.race.hasOwnProperty('fox_color')){
        return loc(`color_${global.race.fox_color}`);
    }
    return loc(`color_red`);
}

export function basicRace(skip){
    skip = skip || [];
    let basicList = Object.keys(races).filter(function(r){ return !['custom','hybrid'].includes(r) && !skip.includes(r) && races[r].basic(); });
    let key = randomKey(basicList);
    return basicList[key];
}

export function renderSupernatural(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 7)){
        return;
    }
    let parent = $(`#supernatural`);
    clearElement(parent);

    if (global.race['wish'] && global.tech['wish'] && global.race['wishStats']){
        minorWish(parent);
        if (global.tech.wish >= 2){
            majorWish(parent);
        }
    }

    if (global.race['ocular_power']){
        ocularPower(parent);
    }
}

