import { loc } from '../core/locale.js';
import { global, seededRandom } from '../core/vars.js';
import { modRes, format_emblem } from '../functions/functions.js';
import { genus_def, races } from '../races/races.js';
import { evolveCosts, payCosts, genus_condition, raceList, sentience } from './actions.js';

// Region 'evolution' dari actions (dipisah dari actions.js). Isi sama persis; digabung via actions_registry.js di actions.js.
export const actions_evolution = {
        rna: {
            id: 'evolution-rna',
            title: loc('resource_RNA_name'),
            desc(){
                let rna = global.race['rapid_mutation'] ? 2 : 1;
                return loc('evo_rna',[rna]);
            },
            condition(){ return global.resource.hasOwnProperty('RNA') && global.resource.RNA.display && !global.race['evoFinalMenu']; },
            action(args){
                if(global['resource']['RNA'].amount < global['resource']['RNA'].max){
                    modRes('RNA',global.race['rapid_mutation'] ? 2 : 1,true);
                }
                return false;
            },
            queue_complete(){ return 0; }
        },
        dna: {
            id: 'evolution-dna',
            title: loc('evo_dna_title'),
            desc: loc('evo_dna_desc'),
            condition(){ return global.resource.hasOwnProperty('DNA') && global.resource.DNA.display && global.resource.DNA.amount < global.resource.DNA.max && !global.race['evoFinalMenu']; },
            cost: { RNA(){ return 2; } },
            action(args){
                if (global['resource']['RNA'].amount >= 2 && global['resource']['DNA'].amount < global['resource']['DNA'].max){
                    modRes('RNA',-2,true);
                    modRes('DNA',1,true);
                }
                return false;
            },
            effect: loc('evo_dna_effect'),
            queue_complete(){ return 0; }
        },
        membrane: {
            id: 'evolution-membrane',
            title: loc('evo_membrane_title'),
            desc: loc('evo_membrane_desc'),
            condition(){ return global.evolution.hasOwnProperty('membrane') && !global.race['evoFinalMenu']; },
            cost: { RNA(offset){ return evolveCosts('membrane',2,2,offset); } },
            effect(){
                let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
                return loc('evo_membrane_effect',[effect]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    global['resource']['RNA'].max += global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
                    global.evolution.membrane.count++;
                    return true;
                }
                return false;
            }
        },
        organelles: {
            id: 'evolution-organelles',
            title: loc('evo_organelles_title'),
            desc: loc('evo_organelles_desc'),
            condition(){ return global.evolution.hasOwnProperty('organelles') && !global.race['evoFinalMenu']; },
            cost: {
                RNA(offset){ return evolveCosts('organelles',12,8,offset); },
                DNA(offset){ return evolveCosts('organelles',4,4,offset); }
            },
            effect(){
                let rna = global.race['rapid_mutation'] ? 2 : 1;
                if (global.tech['evo'] && global.tech.evo >= 2){
                    rna++;
                }
                return loc('evo_organelles_effect',[rna]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    global.evolution.organelles.count++;
                    return true;
                }
                return false;
            }
        },
        nucleus: {
            id: 'evolution-nucleus',
            title: loc('evo_nucleus_title'),
            desc: loc('evo_nucleus_desc'),
            condition(){ return global.evolution.hasOwnProperty('nucleus') && !global.race['evoFinalMenu']; },
            cost: {
                RNA(offset){ return evolveCosts('nucleus',38, global.tech['evo'] && global.tech.evo >= 4 ? 16 : 32, offset ); },
                DNA(offset){ return evolveCosts('nucleus',18, global.tech['evo'] && global.tech.evo >= 4 ? 12 : 16, offset ); }
            },
            effect(){
                let dna = (global.tech['evo'] && global.tech.evo >= 5) ? 2 : 1;
                return loc('evo_nucleus_effect',[dna]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    global.evolution.nucleus.count++;
                    return true;
                }
                return false;
            }
        },
        eukaryotic_cell: {
            id: 'evolution-eukaryotic_cell',
            title: loc('evo_eukaryotic_title'),
            desc: loc('evo_eukaryotic_desc'),
            condition(){ return global.evolution.hasOwnProperty('eukaryotic_cell') && !global.race['evoFinalMenu']; },
            cost: {
                RNA(offset){ return evolveCosts('eukaryotic_cell',20,20,offset); },
                DNA(offset){ return evolveCosts('eukaryotic_cell',40,12,offset); }
            },
            effect(){
                let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
                return loc('evo_eukaryotic_effect',[effect]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    global.evolution.eukaryotic_cell.count++;
                    global['resource']['DNA'].max += global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
                    return true;
                }
                return false;
            }
        },
        mitochondria: {
            id: 'evolution-mitochondria',
            title: loc('evo_mitochondria_title'),
            desc: loc('evo_mitochondria_desc'),
            condition(){ return global.evolution.hasOwnProperty('mitochondria') && !global.race['evoFinalMenu']; },
            cost: {
                RNA(offset){ return evolveCosts('mitochondria',75,50,offset); },
                DNA(offset){ return evolveCosts('mitochondria',65,35,offset); }
            },
            effect: loc('evo_mitochondria_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.evolution.mitochondria.count++;
                    return true;
                }
                return false;
            }
        },
        sexual_reproduction: {
            id: 'evolution-sexual_reproduction',
            title: loc('evo_sexual_reproduction_title'),
            desc: loc('evo_sexual_reproduction_desc'),
            reqs: { evo: 1 },
            grant: ['evo',2],
            condition(){ return global.tech['evo'] && global.tech.evo === 1; },
            cost: {
                DNA(){ return 150; }
            },
            effect: loc('evo_sexual_reproduction_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.evolution['final'] = 20;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 1 ? 1 : 0;}
        },
        phagocytosis: {
            id: 'evolution-phagocytosis',
            title: loc('evo_phagocytosis_title'),
            desc: loc('evo_phagocytosis_desc'),
            reqs: { evo: 2 },
            grant: ['evo',3],
            condition(){ return global.tech['evo'] && global.tech.evo === 2; },
            cost: {
                DNA(){ return 175; }
            },
            effect: loc('evo_phagocytosis_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.tech['evo_animal'] = 1;
                    global.evolution['final'] = 40;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 2 ? 1 : 0; }
        },
        chloroplasts: {
            id: 'evolution-chloroplasts',
            title(){ return global.evolution['gselect'] ? loc('genelab_genus_plant') : loc('evo_chloroplasts_title'); },
            desc: loc('evo_chloroplasts_desc'),
            reqs: { evo: 2 },
            grant: ['evo',3],
            condition(){ return genus_condition(2); },
            cost: {
                DNA(){ return 175; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_chloroplasts_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_chloroplasts_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.evolution['gselect']){
                        global.tech['evo'] = 7;
                        global.tech['evo_plant'] = 2;
                        global.evolution['final'] = 100;
                    }
                    else {
                        global.tech['evo_plant'] = 1;
                        global.evolution['final'] = 40;
                    }
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 2 ? 1 : 0; },
            emblem(){ return format_emblem('genus_plant'); }
        },
        chitin: {
            id: 'evolution-chitin',
            title(){ return global.evolution['gselect'] ? loc('genelab_genus_fungi') : loc('evo_chitin_title'); },
            desc: loc('evo_chitin_desc'),
            reqs: { evo: 2 },
            grant: ['evo',3],
            condition(){ return genus_condition(2); },
            cost: {
                DNA(){ return 175; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_chitin_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_chitin_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.evolution['gselect']){
                        global.tech['evo'] = 7;
                        global.tech['evo_fungi'] = 2;
                        global.evolution['final'] = 100;
                    }
                    else {
                        global.tech['evo_fungi'] = 1;
                        global.evolution['final'] = 40;
                    }
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 2 ? 1 : 0; },
            emblem(){ return format_emblem('genus_fungi'); }
        },
        exterminate: {
            id: 'evolution-exterminate',
            title(){ return global.evolution['gselect'] ? loc('genelab_genus_synthetic') : loc('evo_exterminate_title'); },
            desc: loc('evo_exterminate_desc'),
            reqs: { evo: 2 },
            grant: ['evo',7],
            condition(){
                return genus_condition(2) && global.stats.achieve['obsolete'] && global.stats.achieve.obsolete.l >= 5;
            },
            cost: {
                DNA(){ return 200; }
            },
            effect(){ return loc('evo_exterminate_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech['evo_synthetic'] = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 2 ? 1 : 0; },
            emblem(){ return format_emblem('genus_synthetic'); }
        },
        multicellular: {
            id: 'evolution-multicellular',
            title: loc('evo_multicellular_title'),
            desc: loc('evo_multicellular_desc'),
            reqs: { evo: 3 },
            grant: ['evo',4],
            condition(){ return global.tech['evo'] && global.tech.evo === 3; },
            cost: {
                DNA(){ return 200; }
            },
            effect: loc('evo_multicellular_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.evolution['final'] = 60;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 3 ? 1 : 0; }
        },
        spores: {
            id: 'evolution-spores',
            title: loc('evo_spores_title'),
            desc: loc('evo_spores_desc'),
            reqs: { evo: 4, evo_fungi: 1 },
            grant: ['evo',5],
            condition(){ return global.tech['evo'] && global.tech.evo === 4; },
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
            action(args){
                if (payCosts($(this)[0])){
                    global.evolution['final'] = 80;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 4 ? 1 : 0; }
        },
        poikilohydric: {
            id: 'evolution-poikilohydric',
            title: loc('evo_poikilohydric_title'),
            desc: loc('evo_poikilohydric_desc'),
            reqs: { evo: 4, evo_plant: 1 },
            grant: ['evo',5],
            condition(){ return global.tech['evo'] && global.tech.evo === 4; },
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
            action(args){
                if (payCosts($(this)[0])){
                    global.evolution['final'] = 80;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 4 ? 1 : 0; }
        },
        bilateral_symmetry: {
            id: 'evolution-bilateral_symmetry',
            title: loc('evo_bilateral_symmetry_title'),
            desc: loc('evo_bilateral_symmetry_desc'),
            reqs: { evo: 4, evo_animal: 1 },
            grant: ['evo',5],
            condition(){ return global.tech['evo'] && global.tech.evo === 4; },
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
            action(args){
                if (payCosts($(this)[0])){
                    global.evolution['final'] = 80;
                    global.tech['evo_insectoid'] = 1;
                    global.tech['evo_mammals'] = 1;
                    global.tech['evo_eggshell'] = 1;
                    global.tech['evo_eldritch'] = 1;
                    global.tech['evo_aquatic'] = 1;
                    global.tech['evo_fey'] = 1;
                    global.tech['evo_sand'] = 1;
                    global.tech['evo_heat'] = 1;
                    global.tech['evo_polar'] = 1;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 4 ? 1 : 0; }
        },
        bryophyte: {
            id: 'evolution-bryophyte',
            title: loc('evo_bryophyte_title'),
            desc: loc('evo_bryophyte_desc'),
            reqs: { evo: 5 },
            grant: ['evo',7],
            condition(){
                let allowed = global.tech['evo_plant'] || global.tech['evo_fungi'] ? true : false;
                return allowed && genus_condition(5);
            },
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_bryophyte_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.evolution['final'] = 100;
                    if (global.tech['evo_fungi']){
                        global.tech['evo_fungi'] = 2;
                    }
                    if (global.tech['evo_plant']){
                        global.tech['evo_plant'] = 2;
                    }
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 5 ? 1 : 0; }
        },
        athropods: {
            id: 'evolution-athropods',
            title: loc('evo_athropods_title'),
            desc: loc('evo_athropods_desc'),
            reqs: { evo: 5, evo_insectoid: 1 },
            grant: ['evo',7],
            condition(){ return genus_condition(5); },
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_athropods_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_athropods_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_insectoid = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 5 ? 1 : 0; },
            emblem(){ return format_emblem('genus_insectoid'); }
        },
        mammals: {
            id: 'evolution-mammals',
            title: loc('evo_mammals_title'),
            desc: loc('evo_mammals_desc'),
            reqs: { evo: 5, evo_mammals: 1 },
            grant: ['evo',6],
            condition(){ return global.tech['evo'] && global.tech.evo === 5; },
            cost: {
                DNA(){ return 245; }
            },
            effect: loc('evo_mammals_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.tech['evo_humanoid'] = 1;
                    global.tech['evo_giant'] = 1;
                    global.tech['evo_small'] = 1;
                    global.tech['evo_animalism'] = 1;
                    global.tech['evo_demonic'] = 1;
                    global.tech['evo_angelic'] = 1;
                    global.evolution['final'] = 90;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 5 ? 1 : 0; }
        },
        humanoid: {
            id: 'evolution-humanoid',
            title: loc('evo_humanoid_title'),
            desc: loc('evo_humanoid_desc'),
            reqs: { evo: 6, evo_humanoid: 1 },
            grant: ['evo',7],
            condition(){ return genus_condition(6); },
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_humanoid_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_humanoid_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_humanoid = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 6 ? 1 : 0; },
            emblem(){ return format_emblem('genus_humanoid'); }
        },
        gigantism: {
            id: 'evolution-gigantism',
            title: loc('evo_gigantism_title'),
            desc: loc('evo_gigantism_desc'),
            reqs: { evo: 6, evo_giant: 1 },
            grant: ['evo',7],
            condition(){ return genus_condition(6); },
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_gigantism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_gigantism_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_giant = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 6 ? 1 : 0; },
            emblem(){ return format_emblem('genus_giant'); }
        },
        dwarfism: {
            id: 'evolution-dwarfism',
            title: loc('evo_dwarfism_title'),
            desc: loc('evo_dwarfism_desc'),
            reqs: { evo: 6, evo_small: 1 },
            grant: ['evo',7],
            condition(){ return genus_condition(6); },
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_dwarfism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_dwarfism_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_small = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 6 ? 1 : 0; },
            emblem(){ return format_emblem('genus_small'); }
        },
        animalism: {
            id: 'evolution-animalism',
            title: loc('evo_animalism_title'),
            desc: loc('evo_animalism_desc'),
            reqs: { evo: 6, evo_animalism: 1 },
            grant: ['evo',7],
            condition(){ return genus_condition(6) && global.tech['evo_animalism'] && global.tech.evo_animalism === 1; },
            cost: {
                DNA(){ return 250; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_animalism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_animalism_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_animalism = 2;
                    global.evolution['final'] = 95;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 6 && global.tech.evo_animalism === 1 ? 1 : 0; }
        },
        carnivore: {
            id: 'evolution-carnivore',
            title: loc('evo_carnivore_title'),
            desc: loc('evo_carnivore_desc'),
            reqs: { evo_animalism: 2 },
            grant: ['evo_animalism',3],
            condition(){ return genus_condition(7) && global.tech['evo_animalism'] && global.tech.evo_animalism === 2; },
            cost: {
                DNA(){ return 255; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_carnivore_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_carnivore_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech['evo'] = 7;
                    global.tech['evo_carnivore'] = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 7 && global.tech.evo_animalism === 2 ? 1 : 0; },
            emblem(){ return format_emblem('genus_carnivore'); }
        },
        herbivore: {
            id: 'evolution-herbivore',
            title: loc('evo_herbivore_title'),
            desc: loc('evo_herbivore_desc'),
            reqs: { evo_animalism: 2 },
            grant: ['evo_animalism',3],
            condition(){ return genus_condition(7) && global.tech['evo_animalism'] && global.tech.evo_animalism === 2; },
            cost: {
                DNA(){ return 255; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_herbivore_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_herbivore_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech['evo'] = 7;
                    global.tech['evo_herbivore'] = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 7 && global.tech.evo_animalism === 2 ? 1 : 0; },
            emblem(){ return format_emblem('genus_herbivore'); }
        },
        omnivore: {
            id: 'evolution-omnivore',
            title: loc('evo_omnivore_title'),
            desc: loc('evo_omnivore_desc'),
            reqs: { evo_animalism: 2, locked: 1 },
            grant: ['evo_animalism',3],
            condition(){ return genus_condition(7) && global.tech['evo_animalism'] && global.tech.evo_animalism === 2; },
            cost: {
                DNA(){ return 255; }
            },
            wiki: false,
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_omnivore_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_omnivore_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech['evo_omnivore'] = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 7 && global.tech.evo_animalism === 2 ? 1 : 0; },
            emblem(){ return format_emblem('genus_omnivore'); }
        },
        celestial: {
            id: 'evolution-celestial',
            title: loc('evo_celestial_title'),
            desc: loc('evo_celestial_desc'),
            reqs: { evo: 6, evo_angelic: 1 },
            grant: ['evo',7],
            condition(){
                let allowed = global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3 ? true : false;
                return allowed && genus_condition(6);
            },
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return loc('evo_celestial_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_angelic = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 6 ? 1 : 0; },
            emblem(){ return format_emblem('genus_angelic'); }
        },
        demonic: {
            id: 'evolution-demonic',
            title: loc('evo_demonic_title'),
            desc: loc('evo_demonic_desc'),
            reqs: { evo: 6, evo_demonic: 1 },
            grant: ['evo',7],
            condition(){
                let allowed = global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3 ? true : false;
                return allowed && genus_condition(6);
            },
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe === 'evil' ? `<div>${loc('evo_demonic_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_demonic_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_demonic = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 6 ? 1 : 0; },
            emblem(){ return format_emblem('genus_demonic'); }
        },
        eldritch: {
            id: 'evolution-eldritch',
            title: loc('evo_eldritch_title'),
            desc: loc('evo_eldritch_desc'),
            reqs: { evo: 5, evo_eldritch: 1 },
            grant: ['evo',7],
            condition(){
                let allowed = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? true : false;
                return allowed && genus_condition(5);
            },
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_eldritch_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_eldritch = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 6 ? 1 : 0; },
            emblem(){ return format_emblem('genus_eldritch'); }
        },
        aquatic: {
            id: 'evolution-aquatic',
            title: loc('evo_aquatic_title'),
            desc: loc('evo_aquatic_desc'),
            reqs: { evo: 5, evo_aquatic: 1 },
            grant: ['evo',7],
            condition(){
                let allowed = ['oceanic','swamp'].includes(global.city.biome) || global.blood['unbound'] ? true : false;
                return allowed && genus_condition(5);
            },
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_aquatic_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_aquatic = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 5 ? 1 : 0; },
            emblem(){ return format_emblem('genus_aquatic'); }
        },
        fey: {
            id: 'evolution-fey',
            title: loc('evo_fey_title'),
            desc: loc('evo_fey_desc'),
            reqs: { evo: 5, evo_fey: 1 },
            grant: ['evo',7],
            condition(){
                let allowed = ['forest','swamp','taiga'].includes(global.city.biome) || global.blood['unbound'] ? true : false;
                return allowed && genus_condition(5);
            },
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_fey_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_fey = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 5 ? 1 : 0; },
            emblem(){ return format_emblem('genus_fey'); }
        },
        heat: {
            id: 'evolution-heat',
            title: loc('evo_heat_title'),
            desc: loc('evo_heat_desc'),
            reqs: { evo: 5, evo_heat: 1 },
            grant: ['evo',7],
            condition(){
                let allowed = ['volcanic','ashland'].includes(global.city.biome) || global.blood['unbound'] ? true : false;
                return allowed && genus_condition(5);
            },
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_heat_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_heat = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 5 ? 1 : 0; },
            emblem(){ return format_emblem('genus_heat'); }
        },
        polar: {
            id: 'evolution-polar',
            title: loc('evo_polar_title'),
            desc: loc('evo_polar_desc'),
            reqs: { evo: 5, evo_polar: 1 },
            grant: ['evo',7],
            condition(){
                let allowed = ['tundra','taiga'].includes(global.city.biome) || global.blood['unbound'] ? true : false;
                return allowed && genus_condition(5);
            },
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_polar_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_polar = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 5 ? 1 : 0; },
            emblem(){ return format_emblem('genus_polar'); }
        },
        sand: {
            id: 'evolution-sand',
            title: loc('evo_sand_title'),
            desc: loc('evo_sand_desc'),
            reqs: { evo: 5, evo_sand: 1 },
            grant: ['evo',7],
            condition(){
                let allowed = ['desert','ashland'].includes(global.city.biome) || global.blood['unbound'] ? true : false;
                return allowed && genus_condition(5);
            },
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_sand_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_sand = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 5 ? 1 : 0; },
            emblem(){ return format_emblem('genus_sand'); }
        },
        eggshell: {
            id: 'evolution-eggshell',
            title: loc('evo_eggshell_title'),
            desc: loc('evo_eggshell_desc'),
            reqs: { evo: 5, evo_eggshell: 1 },
            grant: ['evo',6],
            condition(){ return global.tech['evo'] && global.tech.evo === 5 && !global.evolution['gselect']; },
            cost: {
                DNA(){ return 245; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_eggshell_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_eggshell_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    global.tech.evo_eggshell = 2;
                    global.evolution['final'] = 90;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 5 ? 1 : 0; }
        },
        endothermic: {
            id: 'evolution-endothermic',
            title(){ return global.evolution['gselect'] ? loc('genelab_genus_avian') : loc('evo_endothermic_title'); },
            desc: loc('evo_endothermic_desc'),
            reqs: { evo: 6, evo_eggshell: 2 },
            grant: ['evo',7],
            condition(){ return genus_condition(6); },
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_endothermic_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.tech['evo_avian'] = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 6 ? 1 : 0; },
            emblem(){ return format_emblem('genus_avian'); }
        },
        ectothermic: {
            id: 'evolution-ectothermic',
            title(){ return global.evolution['gselect'] ? loc('genelab_genus_reptilian') : loc('evo_ectothermic_title'); },
            desc: loc('evo_ectothermic_desc'),
            reqs: { evo: 6, evo_eggshell: 2 },
            grant: ['evo',7],
            condition(){ return genus_condition(6); },
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_ectothermic_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    global.tech['evo_reptilian'] = 2;
                    global.evolution['final'] = 100;
                    return true;
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 6 ? 1 : 0; },
            emblem(){ return format_emblem('genus_reptilian'); }
        },
        sentience: {
            id: 'evolution-sentience',
            title: loc('evo_sentience_title'),
            desc: loc('evo_sentience_desc'),
            reqs: { evo: 7 },
            grant: ['evo',8],
            condition(){ return global.tech['evo'] && global.tech.evo === 7 && global.evolution['final'] === 100; },
            cost: {
                RNA(){ return 300; },
                DNA(){ return 300; }
            },
            effect(){ return global.evolution['exterminate'] ? loc('evo_sentience_ai_effect') : loc('evo_sentience_effect'); },
            action(args){
                if (payCosts($(this)[0])){
                    // Trigger Next Phase of game
                    let allowed = [];

                    let type = 'humanoid';
                    for (let genus in genus_def){
                        if (global.tech[`evo_${genus}`] && global.tech[`evo_${genus}`] >= 2){
                            type = genus;
                            break;
                        }
                    }

                    if (global.race['junker'] || global.race['sludge'] || global.race['ultra_sludge']){
                        let race = global.race['sludge'] ? 'sludge' : (global.race['ultra_sludge'] ? 'ultra_sludge' : 'junker');
                        global.race['jtype'] = type;
                        allowed.push(race);
                    }
                    else {
                        for (let idx in raceList){
                            let id = raceList[idx];
                            if (races[id].type === type){
                                allowed.push(id);
                            }
                        }
                    }

                    global.race.species = allowed[Math.floor(seededRandom(0,allowed.length))];
                    if (global.stats.achieve[`extinct_${global.race.species}`] && global.stats.achieve[`extinct_${global.race.species}`].l >= 1){
                        global.race.species = allowed[Math.floor(seededRandom(0,allowed.length))];
                    }

                    sentience();
                }
                return false;
            },
            emblem(){
                for (let idx in raceList){
                    let id = raceList[idx];
                    if (global.tech[`evo_${races[id].type}`] && global.tech[`evo_${races[id].type}`] >= 2){
                        return format_emblem(`genus_${races[id].type}`);
                    }
                }
                return '';
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 7 ? 1 : 0; },
        },
    };
