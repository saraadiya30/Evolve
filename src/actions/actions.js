import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { format_emblem, deepClone } from '../functions/functions.js';
import { challengeIcon } from '../achievements/achieve.js';
import { races } from '../races/races.js';
import { actions } from './core/registry.js';
import { actions_evolution } from './evolution/evolution_actions.js';
import { actions_city } from './city/city.js';
import { actions_tech } from './tech_tree.js';
import { actions_arpa } from './projects/physics_projects.js';
import { actions_genes } from './projects/gene_projects.js';
import { actions_blood } from './projects/blood_projects.js';
import { actions_space } from './locations/space.js';
import { actions_interstellar } from './locations/interstellar.js';
import { actions_galaxy } from './locations/galaxy.js';
import { actions_starDock } from './locations/star_dock.js';
import { actions_portal } from './locations/portal.js';
import { actions_tauceti } from './locations/tau_ceti.js';
import { actions_eden } from './locations/eden.js';
import { setChallengeScreen } from './challenge/challenge_screen.js';
export { setChallengeScreen } from './challenge/challenge_screen.js';
export { buildTemplate, genus_condition, drawEvolution } from './evolution/evolution_screen_and_template.js';
import { challengeEffect, setChallenge, setScenario } from './challenge/challenge_effects_and_tech_requirements.js';
export { templeEffect, casino_vault, casinoEarn, casinoEffect, evolveCosts, BHStorageMulti, storageMultipler, checkCityRequirements, skipRequirement, checkTechRequirements, checkTechQualifications, checkPowerRequirements, gainTech, drawCity } from './challenge/challenge_effects_and_tech_requirements.js';
export { drawTech, addAction, setAction, postBuild } from './core/action_setup_and_execution.js';
export { setPlanet, powerOnNewStruct, getStructNumActive, planetGeology } from './evolution/planet_setup_and_geology.js';
import { payCosts } from './core/action_costs_and_descriptions.js';
export { actionDesc, removeAction, updateDesc, payCosts, checkAffordable, templeCount, checkCosts, conceal_adjust, dirt_adjust } from './core/action_costs_and_descriptions.js';
import { evoExtraState } from './core/modals_labels_and_struct_init.js';
export { drawModal, orbitDecayed, evoProgress, wardenLabel, housingLabel, structName, updateQueueNames, initStruct } from './core/modals_labels_and_struct_init.js';
import { sentience } from './evolution/sentience_stage.js';
export { sentience } from './evolution/sentience_stage.js';
export { cataclysm, fanaticism, absorbRace, resQueue, clearResDrag } from './evolution/simulation_ai_and_fanaticism.js';
export { bananaPerk, bank_vault, start_cataclysm, doCallbacks } from './core/resource_queue_drag_and_callbacks.js';

Object.assign(actions, {
    "evolution": actions_evolution,
    "city": actions_city,
    "tech": actions_tech,
    "arpa": actions_arpa,
    "genes": actions_genes,
    "blood": actions_blood,
    "space": actions_space,
    "interstellar": actions_interstellar,
    "galaxy": actions_galaxy,
    "starDock": actions_starDock,
    "portal": actions_portal,
    "tauceti": actions_tauceti,
    "eden": actions_eden
});
export { actions };

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
raceList.forEach(function(race){
    if (!['custom','hybrid'].includes(race) || (race === 'custom' && global.custom.hasOwnProperty('race0')) || (race === 'hybrid' && global.custom.hasOwnProperty('race1')) ){
        if (race === 'hybrid' && global.custom.race1.genus !== 'hybrid'){
            global.custom.race1.hybrid = [global.custom.race1.genus, global.custom.race1.genus === 'humanoid' ? 'small' : 'humanoid'];
            global.custom.race1.genus = 'hybrid';
        }
        else if (race === 'custom' && global.custom.race0.genus === 'hybrid'){ global.custom.race0.genus = 'humanoid'; }
        actions.evolution[race] = {
            id: `evolution-${race}`,
            title(){ return races[race].name; },
            desc(){ return `${loc("evo_evolve")} ${races[race].name}`; },
            reqs: { evo: 7 },
            grant: ['evo',8],
            condition(){
                let typeList = global.stats.achieve['godslayer'] && races[race].type === 'hybrid' ? races[race].hybrid : [races[race].type];
                let typeCheck = false;
                typeList.forEach(function(t){
                    if (global.tech[`evo_${t}`] >= 2){ typeCheck = true; }
                });
                 
                return (global.race.seeded 
                    || (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l >= 1) 
                    || (global.stats.achieve[`extinct_${race}`] && global.stats.achieve[`extinct_${race}`].l >= 1))
                    && typeCheck 
                    && global.evolution.final === 100 && !global.race['evoFinalMenu']; 
            },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            race: true,
            effect(){
                let raceDesc = typeof races[race].desc === 'string' ? races[race].desc : races[race].desc();
                return `${raceDesc} ${loc(`evo_complete`)}`;
            },
            action(args){
                if (global.race['warlord'] && ['custom','hybrid','nano'].includes(race)){ return false; }
                if (payCosts($(this)[0])){
                    if (['synth','custom'].includes(race)){
                        return evoExtraState(race);
                    }
                    else {
                        global.race.species = race;
                        sentience();
                    };
                }
                return false;
            },
            queue_complete(){ return global.tech['evo'] && global.tech.evo === 7 ? 1 : 0; },
            emblem(){ return format_emblem(`extinct_${race}`); }
        }
    }
});

if (Object.keys(global.stats.synth).length > 1){
    let synthList = deepClone(raceList.filter(r => !['nano','synth'].includes(r)));
    synthList.forEach(race => actions.evolution[`s-${race}`] = {
        id: `evolution-s-${race}`,
        title(){ return races[race].name; },
        desc(){ return `${loc("evo_imitate")} ${races[race].name}`; },
        reqs: { evo: 8 },
        grant: ['evo',9],
        condition(){
            if ((race === 'custom' && !global.custom.hasOwnProperty('race0')) || (race === 'hybrid' && !global.custom.hasOwnProperty('race1'))){
                return false;
            }
            return (global.stats.synth[race] || global['beta']) && global.race['evoFinalMenu'];
        },
        cost: {},
        wiki: false,
        race: true,
        effect(){ return loc(`evo_imitate_race`,[races[race].name]); },
        action(args){
            if (global.stats.synth[race] || global['beta']){
                global.race.species = global.race['evoFinalMenu'];
                global.race['srace'] = race;
                sentience();
            }
            return false;
        },
        queue_complete(){ return global.tech['evo'] && global.tech.evo === 8 ? 1 : 0; }
    });
}
            
export const challengeList = {
    'plasmid': 'no_plasmid',
    'mastery': 'weak_mastery',
    'trade': 'no_trade',
    'craft': 'no_craft',
    'crispr': 'no_crispr',
    'nerfed': 'nerfed',
    'badgenes': 'badgenes',
};
Object.keys(challengeList).forEach(challenge => actions.evolution[challenge] = {
    id: `evolution-${challenge}`,
    title: loc(`evo_challenge_${challenge}`),
    desc: loc(`evo_challenge_${challenge}`),
    condition(){ return global.evolution.hasOwnProperty(challenge); },
    cost: {
        DNA(){ return 10; }
    },
    challenge: true,
    effect(){ return challengeEffect(challenge); },
    action(args){
        if (payCosts($(this)[0])){
            if (global.race[challengeList[challenge]]){
                delete global.race[challengeList[challenge]];
                $(`#${$(this)[0].id}`).removeClass('hl');
                if (global.race['truepath'] || global.race['lone_survivor']){
                    delete global.race['nerfed'];
                    delete global.race['badgenes'];
                }
                ['junker','cataclysm','banana','truepath','lone_survivor','fasting','warlord'].forEach(function(s){
                    delete global.race[s];
                    $(`#evolution-${s}`).removeClass('hl');
                });
            }
            else {
                global.race[challengeList[challenge]] = 1;
                $(`#${$(this)[0].id}`).addClass('hl');
            }
            setChallengeScreen();
            challengeIcon();
        }
        return false;
    },
    highlight(){ return global.race[challengeList[challenge]] ? true : false; },
    queue_complete(){ return 0; }
});

const advancedChallengeList = {
    'joyless': {t: 'c', e: 'joyless' },
    'steelen': {t: 'c', e: 'steelen' },
    'decay': {t: 'c', e: 'dissipated' },
    'emfield': {t: 'c', e: 'technophobe' },
    'inflation': {t: 'c', e: 'wheelbarrow' },
    'sludge': {t: 'c', e: 'extinct_sludge' },
    'ultra_sludge': {t: 'c', e: 'extinct_ultra_sludge' },
    'orbit_decay': {t: 'c', e: 'lamentis' },
    //'nonstandard': {t: 'c', e: 'anathema' },
    'gravity_well': {t: 'c', e: 'escape_velocity' },
    'witch_hunter': {t: 'c', e: 'soul_sponge' },
    //'storage_wars': {t: 'c', e: '???' },
    'simulation': {t: 'c', e: 'thereisnospoon' },
    'junker': {t: 's', e: 'extinct_junker' },
    'cataclysm': {t: 's', e: 'iron_will' },
    'banana': {t: 's', e: 'banana' },
    'truepath': {t: 's', e: 'pathfinder' },
    'lone_survivor': {t: 's', e: 'adam_eve' },
    'fasting': {t: 's', e: 'endless_hunger' },
    'warlord': {t: 's', e: 'what_is_best' },
};
Object.keys(advancedChallengeList).forEach(challenge => actions.evolution[challenge] = {
    id: `evolution-${challenge}`,
    title: loc(`evo_challenge_${challenge}`),
    desc(){
        let desc = '';
        if (global.race.universe === 'micro'){
            desc = desc + `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div>`;
        }
        desc = desc + `<div>${loc(`evo_challenge_${challenge}_desc`)}</div>`;
        if (['sludge','junker','ultra_sludge'].includes(challenge)){
            desc = desc + `<div class="has-text-danger">${loc('evo_start')}</div>`;
        }
        return desc;
    },
    condition(){ return global.evolution.hasOwnProperty(challenge); },
    cost: {
        DNA(){ return advancedChallengeList[challenge].t === 'c' ? 25 : 50; }
    },
    challenge: true,
    effect(){ return challengeEffect(challenge); },
    action(args){
        if (payCosts($(this)[0])){
            if (advancedChallengeList[challenge].t === 'c'){
                setChallenge(challenge);
            }
            else {
                setScenario(challenge);
            }
        }
        return false;
    },
    emblem(){ return format_emblem(advancedChallengeList[challenge].e); },
    highlight(){ return global.race[challenge] ? true : false; },
    queue_complete(){ return 0; }
});

actions.evolution['bunker'] = {
    id: 'evolution-bunker',
    title: loc('evo_bunker'),
    desc(){ return `<div>${loc('evo_bunker')}</div><div class="has-text-special">${loc('evo_challenge')}</div>`; },
    reqs: { evo: 6 },
    grant: ['evo_challenge',1],
    condition(){ return global.genes['challenge'] && global.evolution['final'] === 100 && !global.race['evoFinalMenu']; },
    cost: {
        DNA(){ return 10; }
    },
    effect: loc('evo_bunker_effect'),
    action(args){
        if (payCosts($(this)[0])){
            return true;
        }
        return false;
    },
    queue_complete(){ return global.tech['evo_challenge'] ? 0 : 1; },
    flair: loc('evo_bunker_flair')
};

export var cLabels = global.settings['cLabels'];

export var callback_repeat = new Map();

export function set_cLabels(v){ return cLabels = v; }
