import { global, seededRandom } from '../core/vars.js';
import { vBind, popover, tagEvent, calcQueueMax, calcRQueueMax, clearElement } from '../functions/functions.js';
import { races } from '../races/races.js';
import { housingLabel, wardenLabel, updateQueueNames, drawTech, drawCity } from '../actions/actions.js';
import { loc } from '../core/locale.js';
import { jobScale } from '../civics/jobs.js';
import { isStargateOn } from '../space/space.js';
import { gov_tasks } from './gov_registry.js';
import { gov_tasksPart1 } from './gov_tasks_1.js';
import { gov_tasksPart2 } from './gov_tasks_2.js';
import { gov_tasksPart3 } from './gov_tasks_3.js';
import { drawnGovernOffice_s1, drawnGovernOffice_s2 } from '../sections/sec_drawnGovernOffice_1.js';

export const gmen = {
    soldier: {
        name: loc('governor_soldier'),
        desc: loc('governor_soldier_desc'),
        title: [loc('governor_soldier_t1'),loc('governor_soldier_t2'),loc('governor_soldier_t3')],
        traits: {
            tactician: 1,
            militant: 1,
            nopain: 1
        }
    },
    criminal: {
        name: loc('governor_criminal'),
        desc: loc('governor_criminal_desc'),
        title: [loc('governor_criminal_t1'),loc('governor_criminal_t2'),{ m: loc('governor_criminal_t3m'), f: loc('governor_criminal_t3f') }],
        traits: {
            noquestions: 1,
            racketeer: 1
        }
    },
    entrepreneur: {
        name: loc('governor_entrepreneur'),
        desc: loc('governor_entrepreneur_desc'),
        title: [loc('governor_entrepreneur_t1'),loc('governor_entrepreneur_t2'),{ m: loc('governor_entrepreneur_t3m'), f: loc('governor_entrepreneur_t3f') }],
        traits: {
            dealmaker: 1,
            risktaker: 1
        }
    },
    educator: {
        name: loc('governor_educator'),
        desc: loc('governor_educator_desc'),
        title: [loc('governor_educator_t1'),loc('governor_educator_t2'),loc('governor_educator_t3')],
        traits: {
            teacher: 1,
            theorist: 1
        }
    },
    spiritual: {
        name: loc('governor_spiritual'),
        desc: loc('governor_spiritual_desc'),
        title: [loc('governor_spiritual_t1'),loc('governor_spiritual_t2'),loc('governor_spiritual_t3')],
        traits: {
            inspirational: 1,
            pious: 1
        }
    },
    bluecollar: {
        name: loc('governor_bluecollar'),
        desc: loc('governor_bluecollar_desc'),
        title: [{ m: loc('governor_bluecollar_t1m'), f: loc('governor_bluecollar_t1f') },loc('governor_bluecollar_t2'),{ m: loc('governor_bluecollar_t3m'), f: loc('governor_bluecollar_t3f') }],
        traits: {
            pragmatist: 1,
            dirty_jobs: 1
        }
    },
    noble: {
        name: loc('governor_noble'),
        desc: loc('governor_noble_desc'),
        title: [{ m: loc('governor_noble_t1m'), f: loc('governor_noble_t1f') },{ m: loc('governor_noble_t2m'), f: loc('governor_noble_t2f') },{ m: loc('governor_noble_t3m'), f: loc('governor_noble_t3f') },{ m: loc('governor_noble_t4m'), f: loc('governor_noble_t4f') }],
        traits: {
            extravagant: 1,
            aristocrat: 1
        }
    },
    media: {
        name: loc('governor_media'),
        desc: loc('governor_media_desc'),
        title: [loc('governor_media_t1'),{ m: loc('governor_media_t2m'), f: loc('governor_media_t2f') },loc('governor_media_t3')],
        traits: {
            gaslighter: 1,
            muckraker: 1
        }
    },
    sports: {
        name: loc('governor_sports'),
        desc: loc('governor_sports_desc'),
        title: [loc('governor_sports_t1'),loc('governor_sports_t2'),loc('governor_sports_t3')],
        traits: {
            athleticism: 1,
            runner: 1
        }
    },
    bureaucrat: {
        name: loc('governor_bureaucrat'),
        desc: loc('governor_bureaucrat_desc'),
        title: [loc('governor_bureaucrat_t1'),{ m: loc('governor_bureaucrat_t2m'), f: loc('governor_bureaucrat_t2f') },loc('governor_bureaucrat_t3')],
        traits: {
            organizer: 1
        }
    }
};

export const gov_traits = {
    tactician: {
        name: loc(`gov_trait_tactician`),
        effect(b){ return loc(`gov_trait_tactician_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [30] : [25]; 
        },
    },
    militant: {
        name: loc(`gov_trait_militant`),
        effect(b){ return loc(`gov_trait_militant_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [30,10] : [25,10]; 
        },
    },
    noquestions: {
        name: loc(`gov_trait_noquestions`),
        effect(b){ return loc(`gov_trait_noquestions_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ return [0.005]; },
    },
    racketeer: {
        name: loc(`gov_trait_racketeer`),
        effect(b){ return loc(`gov_trait_racketeer_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1]]); },
        vars(b){
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            } 
            return b ? [18,45] : [20,35]; 
        },
    },
    dealmaker: {
        name: loc(`gov_trait_dealmaker`),
        effect(b){ return loc(`gov_trait_dealmaker_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [150] : [125]; 
        },
    },
    risktaker: {
        name: loc(`gov_trait_risktaker`),
        effect(b){ return loc(`gov_trait_risktaker_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [14] : [12]; 
        },
    },
    teacher: {
        name: loc(`gov_trait_teacher`),
        effect(b){ return loc(`gov_trait_teacher_effect`,[$(this)[0].vars(b)[0], $(this)[0].vars(b)[1]]); },
        vars(b){ return [6,30]; },
    },
    theorist: {
        name: loc(`gov_trait_theorist`),
        effect(b){ return loc(`gov_trait_theorist_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1]]); },
        vars(b){
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            } 
            return b ? [100,2] : [50,4]; 
        },
    },
    inspirational: {
        name: loc(`gov_trait_inspirational`),
        effect(b){ return loc(`gov_trait_inspirational_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [30] : [20]; 
        },
    },
    pious: {
        name: loc(`gov_trait_pious`),
        effect(b,wiki){
            let val = $(this)[0].vars(b)[1];
            let xeno = global.tech['monument'] && global.tech.monument >= 3 && isStargateOn(wiki) ? 3 : 1;
            val = (global.civic.govern.type === 'corpocracy' ? (val * 2) : val) * xeno;
            return loc(`gov_trait_pious_effect`,[$(this)[0].vars(b)[0],val]);
        },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [8,8] : [10,5]; 
        },
    },
    pragmatist: {
        name: loc(`gov_trait_pragmatist`),
        effect(b){ return loc(`gov_trait_pragmatist_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [100,2] : [50,2]; 
        },
    },
    dirty_jobs: {
        name: loc(`gov_trait_dirty_jobs`),
        effect(b){ return loc(`gov_trait_dirty_jobs_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1],$(this)[0].vars(b)[2]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [0.015,2,18] : [0.015,1,14]; 
        },
    },
    extravagant: {
        name: loc(`gov_trait_extravagant`),
        effect(b){ return loc(`gov_trait_extravagant_effect`,[$(this)[0].vars(b)[0],housingLabel('large',true),$(this)[0].vars(b)[1],jobScale($(this)[0].vars(b)[2]+5)]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [8,1,2] : [10,1.25,1]; 
        },
    },
    aristocrat: {
        name: loc(`gov_trait_aristocrat`),
        effect(b){ return loc(`gov_trait_aristocrat_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1],$(this)[0].vars(b)[2]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [60,20,5] : [50,20,10]; 
        },
    },
    gaslighter: {
        name: loc(`gov_trait_gaslighter`),
        effect(b){
            return loc(`gov_trait_gaslighter_effect`,[$(this)[0].vars(b)[0],wardenLabel(),$(this)[0].vars(b)[1],$(this)[0].vars(b)[2],$(this)[0].vars(b)[3]]);
        },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [2,2,0.5,35] : [1,1,0.5,30]; 
        },
    },
    muckraker: {
        name: loc(`gov_trait_muckraker`),
        effect(b){
            return loc(`gov_trait_muckraker_effect`,[$(this)[0].vars(b)[1],$(this)[0].vars(b)[2]]);
        },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [6,12,2] : [8,12,3]; 
        },
    },
    athleticism: {
        name: loc(`gov_trait_athleticism`),
        effect(b){ return loc(`gov_trait_athleticism_effect`,[$(this)[0].vars(b)[0],jobScale($(this)[0].vars(b)[1]),$(this)[0].vars(b)[2],wardenLabel()]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [1.5,2,3] : [1.5,2,4]; 
        },
    },
    nopain: {
        name: loc(`gov_trait_nopain`),
        effect(b){ return loc(`gov_trait_nopain_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [50] : [40]; 
        },
    },
    runner: {
        name: loc(`gov_trait_runner`),
        effect(b){ return loc(`gov_trait_runner_effect`,[$(this)[0].vars(b)[0],$(this)[0].vars(b)[1]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? true : false;
            }
            return b ? [20,12] : [10,8]; 
        },
    },
    organizer: {
        name: loc(`gov_trait_organizer`),
        effect(b){ return loc(`gov_trait_organizer_effect`,[$(this)[0].vars(b)[0]]); },
        vars(b){ 
            if (typeof(b) === 'undefined'){
                b = global.genes.hasOwnProperty('governor') && global.genes.governor >= 2 ? true : false;
            }
            return [b ? 2 : 1]; 
        },
    }
};

const names = {
    humanoid: ['Sanders','Smith','Geddon','Burgundy','Cristo','Crunch','Berg','Morros','Bower','Maximus'],
    carnivore: ['Instinct','Prowl','Paws','Fluffy','Snarl','Claws','Fang','Stalker','Pounce','Sniff'],
    herbivore: ['Sense','Grazer','Paws','Fluffy','Fern','Claws','Fang','Grass','Stampy','Sniff'],
    omnivore: ['Pelt','Munchy','Paws','Fluffy','Snarl','Claws','Fang','Skavers','Pounce','Sniff'],
    small: ['Bahgins','Banks','Shorty','Parte','Underfoot','Shrimp','Finkle','Littlefoot','Cub','Runt'],
    giant: ['Slender','Titan','Colossus','Bean','Tower','Cloud','Bigfoot','Mountain','Crusher','Megaton'],
    reptilian: ['Scale','Chimera','Ecto','Bask','Forks','Croc','Slither','Sunny','Coldfoot','Webtoe'],
    avian: ['Sparrow','Soar','Shiney','Raven','Squaks','Eddy','Breeze','Flap','Kettle','Flock'],
    insectoid: ['Compound','Centi','Hiver','Buzz','Carpace','Swarm','Devour','Carpi','Chitter','Burrow'],
    plant: ['Grover','Blossom','Leaf','Sapper','Stem','Seed','Sprout','Greensly','Root','Fruit'],
    fungi: ['Detritus','Psychedelic','Cap','Rotface','Patch','Spore','Infecto','Filament','Symbiote','Shade'],
    aquatic: ['Seawolf','Finsley','Inko','Sucker','McBoatFace','Wave','Riptide','Shell','Coral','Pearl'],
    fey: ['Whisper','Prank','Mischief','Flutter','Nature','Dirt','Story','Booker','Tales','Spirit'],
    heat: ['Ash','Magnus','Pumice','Vulcano','Sweat','Flame','Lava','Ember','Smoke','Tinder','Spark'],
    polar: ['Frosty','Snowball','Flake','Chiller','Frost','Cooler','Icecube','Arctic','Tundra','Avalanche'],
    sand: ['Dune','Oasis','Sarlac','Spice','Quick','Grain','Spike','Storm','Glass','Castle'],
    demonic: ['Yekun','Kesabel','Gadreel','Penemue','Abaddon','Azazyel','Leviathan','Samyaza','Kasyade','Typhon'],
    angelic: ['Lightbringer','Illuminous','Sparks','Chrub','Halo','Star','Pompous','Radiant','Fluffy','Fabio'],
    synthetic: ['HK47','D2R2','Bishop','Wally','Number5','Sunny','Data','Beta','Dot','Motoko'],
    eldritch: ['Tentacle','Faceless','Horror','Darkness','Void','Dreamer','Mindflayer','Whisper','Paranoia','Empty'],
};

export function genGovernor(setSize){
    let governors = [];
    let genus = global.race.maintype || races[global.race.species].type;
    let backgrounds = Object.keys(gmen);
    let nameList = JSON.parse(JSON.stringify(names[genus]));

    setSize = setSize || backgrounds.length;
    for (let i=0; i<setSize; i++){
        if (nameList.length === 0){
            nameList = JSON.parse(JSON.stringify(names[genus]));
        }
        if (backgrounds.length === 0){
            backgrounds = Object.keys(gmen);
        }

        let bgIdx = Math.floor(seededRandom(0,backgrounds.length));
        let nameIdx = Math.floor(seededRandom(0,nameList.length));

        let bg = backgrounds.splice(bgIdx,1)[0];
        let name = loc("gov_name_" + nameList.splice(nameIdx,1)[0]);

        let title = gmen[bg].title[Math.floor(seededRandom(0,gmen[bg].title.length))];
        if (typeof title === 'object'){
            title = Math.floor(seededRandom(0,2)) === 0 ? title.m : title.f;
        }
        governors.push({ bg: bg, t: title, n: name });
    }
    
    return governors;
}

export function govern(){
    if (global.genes['governor'] && global.tech['governor'] && global.race['governor'] && global.race.governor['g'] && global.race.governor['tasks']){
        let cnt = [0,1,2];
        if (global.genes.governor >= 2){
            cnt.push(cnt.length);
            if (govActive('organizer',0)){ cnt.push(cnt.length); }
        }
        if (govActive('organizer',0)){ cnt.push(cnt.length); }
        cnt.forEach(function(n){
            if (gov_tasks[global.race.governor.tasks[`t${n}`]] && gov_tasks[global.race.governor.tasks[`t${n}`]].req()){
                gov_tasks[global.race.governor.tasks[`t${n}`]].task();
            }
        });
    }
}

export function defineGovernor(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 0)){
        return;
    }
    if (global.genes['governor'] && global.tech['governor']){
        clearElement($('#r_govern1'));
        if (global.race.hasOwnProperty('governor') && !global.race.governor.hasOwnProperty('candidates')){
            drawnGovernOffice();
        }
        else {
            appointGovernor();
        }
    }
}

export function clearSpyopDrag(){
    Object.keys(global.civic.foreign).forEach(function (gov){
        let el = $(`#spyopConfig${gov}`)[0];
        if (el){
            let sort = Sortable.get(el);
            if (sort){
                sort.destroy();
            }
        }
    });
}

export function dragSpyopList(gov){
    let el = $(`#spyopConfig${gov}`)[0];
    if (el){
        Sortable.create(el,{
            onEnd(e){
                let order = global.race.governor.config.spyop[gov];
                order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
                global.race.governor.config.spyop[gov] = order;
                defineGovernor();
            }
        });
    }
}

export function drawnGovernOffice(){
    const $ctx = {};
    drawnGovernOffice_s1($ctx);

    drawnGovernOffice_s2($ctx);
}

function appointGovernor(){
    let govern = $(`<div id="candidates" class="governor candidates"></div>`);
    $('#r_govern1').append(govern);

    if (!global.race.hasOwnProperty('governor') || !global.race.governor.hasOwnProperty('candidates')){
        global.race['governor'] = {
            candidates: genGovernor(10)
        };
    }

    govern.append($(`<div class="appoint header"><span class="has-text-caution">${loc(`governor_candidate`)}</span><span class="has-text-caution">${loc(`governor_background`)}</span><span></span><div>`));
    for (let i=0; i<global.race.governor.candidates.length; i++){
        let gov = global.race.governor.candidates[i];
        if ((global.race['warlord'] && gov.bg === 'soldier') || !global.race['warlord']){
            govern.append($(`<div class="appoint ${gov.bg}"><span class="has-text-warning" role="heading" aria-level="3">${gov.t} ${gov.n}</span><span class="bg">${gmen[gov.bg].name}</span><span><button class="button" v-on:click="appoint(${i})">${loc(`governor_appoint`)}</button></span><div>`));
        }
    }

    vBind({
        el: '#candidates',
        data: global.race.governor,
        methods: {
            appoint(gi){
                if (global.genes['governor'] && global.tech['governor']){
                    let gov = global.race.governor.candidates[gi];
                    global.race.governor['g'] = gov;
                    delete global.race.governor.candidates;
                    global.race.governor['tasks'] = {
                        t0: 'none', t1: 'none', t2: 'none', t3: 'none', t4: 'none', t5: 'none'
                    };
                    updateQueueNames(true, ['city-amphitheatre', 'city-apartment']);
                    drawCity();
                    drawTech();
                    calcQueueMax();
                    calcRQueueMax();
                    defineGovernor();
                    tagEvent('governor',{
                        'appoint': global.race.governor.g.bg
                    });
                }
            }
        }
    });

    global.race.governor.candidates.forEach(function(gov){
        popover(`candidates-${gov.bg}`, function(){
            let desc = '';
            Object.keys(gmen[gov.bg].traits).forEach(function (t){
                desc += (gov_traits[t].hasOwnProperty('effect') ? gov_traits[t].effect() : '') + ' ';
            });
            return desc;
        },
        {
            elm: `#candidates .${gov.bg} .bg`,
        });
    });
}

export function govActive(trait,val){
    if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('g')){
        return gmen[global.race.governor.g.bg].traits[trait] ? gov_traits[trait].vars()[val] : false;
    }
    return false;
}

export function removeTask(task){
    if (global.genes['governor'] && global.tech['governor'] && global.race['governor'] && global.race.governor['g'] && global.race.governor['tasks']){
        for (let i=0; i<Object.keys(global.race.governor.tasks).length; i++){
            if (global.race.governor.tasks[`t${i}`] === task){
                global.race.governor.tasks[`t${i}`] = 'none';
            }
        }
    }
}

Object.assign(gov_tasks,
    gov_tasksPart1,
    gov_tasksPart2,
    gov_tasksPart3
);
export { gov_tasks };

