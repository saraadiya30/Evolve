// Daftar dan state ringan milik sistem aksi: raceList, challengeList, cLabels (+ set_cLabels), callback_repeat. Modul daun (hanya core/vars), dipisah dari actions.js supaya challenge_rules, queue_callbacks, dan evolution_actions tidak meng-import seluruh registrasi aksi.
import { global } from '../core/vars.js';

export const raceList = [
    'human','orc','elven',
    'troll','ogre','cyclops',
    'kobold','goblin','gnome',
    'cath','wolven','vulpine',
    'centaur','rhinotaur','capybara',
    //'bearkin','porkenari','hedgeoken',
    'tortoisan','gecko','slitheryn',
    'arraak','pterodacti','dracnid',
    'sporgar','shroomi','moldling',
    'mantis','scorpid','antid',
    'entish','cacti','pinguicula',
    'sharkin','octigoran',
    'dryad','satyr',
    'phoenix','salamander',
    'yeti','wendigo',
    'tuskin','kamel',
    'imp','balorg',
    'seraph','unicorn',
    'synth','nano',
    'ghast','shoggoth',
    'dwarf','raccoon','lichen','wyvern','beholder','djinn','narwhal','bombardier','nephilim',
    'custom','hybrid'
];

export const challengeList = {
    'plasmid': 'no_plasmid',
    'mastery': 'weak_mastery',
    'trade': 'no_trade',
    'craft': 'no_craft',
    'crispr': 'no_crispr',
    'nerfed': 'nerfed',
    'badgenes': 'badgenes',
};

export let cLabels = global.settings['cLabels'];

export function set_cLabels(v){ return cLabels = v; }

export let callback_repeat = new Map();
