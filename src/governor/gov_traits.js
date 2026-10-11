// Definisi trait governor. Diisi ke registry gov_traits lewat registerGovernor() (core/registrations.js), bukan saat modul dimuat.
import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { housingLabel, wardenLabel } from '../actions/core/structure_ui.js';
import { jobScale } from '../civics/jobs/job_scale.js';
import { isStargateOn } from '../space/terraform_lab.js';

export const gov_traitsPart1 = {
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
