// traitSkin / hoovedReskin: nama dan deskripsi trait yang bisa berganti kulit (reskin). Modul daun: hanya bergantung pada core dan genus_def, supaya functions/ bisa memakainya tanpa menyeret trait_ranks.js.
import { genus_def } from '../genus_def.js';
import { races, traits } from '../../core/registries.js';
import { global } from '../../core/vars.js';
import { loc } from '../../core/locale.js';

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
