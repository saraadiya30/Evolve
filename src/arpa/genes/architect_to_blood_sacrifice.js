import { loc } from '../../core/locale.js';
import { calcQueueMax, calcRQueueMax, calc_mastery } from '../../functions/functions.js';
import { global } from '../../core/vars.js';
import { defineGovernor } from '../../governor/governor.js';
import { drawTech } from '../../actions/actions.js';
import { payCrispr, updateTrades } from '../arpa.js';

// Bagian dari genePool (26 entri: architect .. blood_sacrifice), dipisah dari arpa.js. Urutan entri sama persis.
export const genePoolPart2 = {
    architect: {
        id: 'genes-architect',
        title: loc('arpa_genepool_architect_title'),
        desc: loc('arpa_genepool_architect_desc'),
        reqs: { queue: 1 },
        grant: ['queue',2],
        cost: { Plasmid(){ return 160; } },
        action(){
            if (payCrispr('architect')){
                return true;
            }
            return false;
        },
        post(){
            calcQueueMax();
            calcRQueueMax();
        }
    },
    precognition: {
        id: 'genes-precognition',
        title: loc('arpa_genepool_precognition_title'),
        desc: loc('arpa_genepool_precognition_desc'),
        reqs: { queue: 2 },
        grant: ['queue',3],
        condition(){ return global.stats.aiappoc > 0 ? true : false; },
        cost: {
            Plasmid(){ return 3500; },
            Phage(){ return 100; },
            AICore(){ return 1; }
        },
        action(){
            if (payCrispr('precognition')){
                return true;
            }
            return false;
        }
    },
    governance: {
        id: 'genes-governance',
        title: loc('arpa_genepool_governance_title'),
        desc: loc('arpa_genepool_governance_desc'),
        reqs: { queue: 2 },
        grant: ['governor',1],
        cost: {
            Plasmid(){ return 300; },
            Phage(){ return 25; }
        },
        action(){
            if (payCrispr('governance')){
                return true;
            }
            return false;
        }
    },
    civil_service: {
        id: 'genes-civil_service',
        title: loc('arpa_genepool_civil_service_title'),
        desc: loc('arpa_genepool_civil_service_desc'),
        reqs: { governor: 1 },
        grant: ['governor',2],
        cost: {
            Plasmid(){ return 1000; },
            Harmony(){ return 1; }
        },
        action(){
            if (payCrispr('civil_service')){
                return true;
            }
            return false;
        },
        post(){
            if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('tasks')){
                for (let i=0; i<6; i++){
                    if (!global.race.governor.tasks.hasOwnProperty(`t${i}`)){
                        global.race.governor.tasks[`t${i}`] = 'none';
                    }
                }
            }
            defineGovernor();
        }
    },
    bureaucratic_efficiency: {
        id: 'genes-bureaucratic_efficiency',
        title: loc('arpa_genepool_bureaucratic_efficiency_title'),
        desc: loc('arpa_genepool_bureaucratic_efficiency_desc'),
        reqs: { governor: 2 },
        grant: ['governor',3],
        cost: {
            Plasmid(){ return 2500; },
            Artifact(){ return 1; }
        },
        action(){
            if (payCrispr('bureaucratic_efficiency')){
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        },
        flair(){
            return loc('arpa_genepool_bureaucratic_efficiency_flair');
        }
    },
    hardened_genes: {
        id: 'genes-hardened_genes',
        title: loc('arpa_genepool_hardened_genes_title'),
        desc: loc('arpa_genepool_hardened_genes_desc'),
        reqs: {},
        grant: ['challenge',1],
        cost: { Plasmid(){ return 5; } },
        action(){
            if (payCrispr('hardened_genes')){
                return true;
            }
            return false;
        }
    },
    unlocked: {
        id: 'genes-unlocked',
        title: loc('arpa_genepool_unlocked_title'),
        desc: loc('arpa_genepool_unlocked_desc'),
        reqs: {challenge:1},
        grant: ['challenge',2],
        cost: { Plasmid(){ return 50; } },
        action(){
            if (payCrispr('unlocked')){
                return true;
            }
            return false;
        },
        post(){
            calc_mastery(true);
        }
    },
    universal: {
        id: 'genes-universal',
        title: loc('arpa_genepool_universal_title'),
        desc: loc('arpa_genepool_universal_desc'),
        reqs: {challenge:2},
        grant: ['challenge',3],
        condition(){
            return global.race.universe !== 'standard' ? true : false;
        },
        cost: { Plasmid(){ return 400; } },
        action(){
            if (payCrispr('universal')){
                return true;
            }
            return false;
        },
        post(){
            calc_mastery(true);
        }
    },
    standard: {
        id: 'genes-standard',
        title: loc('arpa_genepool_standard_title'),
        desc: loc('arpa_genepool_standard_desc'),
        reqs: {challenge:3},
        grant: ['challenge',4],
        condition(){
            return global.race.universe !== 'standard' ? true : false;
        },
        cost: { Plasmid(){ return 2500; } },
        action(){
            if (payCrispr('standard')){
                return true;
            }
            return false;
        },
        post(){
            calc_mastery(true);
        }
    },
    mastered: {
        id: 'genes-mastered',
        title: loc('arpa_genepool_mastered_title'),
        desc: loc('arpa_genepool_mastered_desc'),
        reqs: {challenge:4},
        grant: ['challenge',5],
        cost: { Plasmid(){ return 4000; } },
        action(){
            if (payCrispr('mastered')){
                return true;
            }
            return false;
        }
    },
    negotiator: {
        id: 'genes-negotiator',
        title: loc('arpa_genepool_negotiator_title'),
        desc: loc('arpa_genepool_negotiator_desc'),
        reqs: {challenge:2},
        grant: ['trader',1],
        cost: { Plasmid(){ return 750; } },
        action(){
            if (payCrispr('negotiator')){
                global.genes['trader'] = 1;
                updateTrades();
                return true;
            }
            return false;
        }
    },
    haggler: {
        id: 'genes-haggler',
        title: loc('arpa_genepool_haggler_title'),
        desc: loc('arpa_genepool_haggler_desc'),
        reqs: {trader:1},
        condition(){
            return global.stats.achieve['godslayer'] ? true : false;
        },
        grant: ['trader',2],
        cost: { Supercoiled(){ return 10; } },
        action(){
            if (payCrispr('haggler')){
                global.genes['trader'] = 2;
                updateTrades();
                return true;
            }
            return false;
        }
    },
    ancients: {
        id: 'genes-ancients',
        title: loc('arpa_genepool_ancients_title'),
        desc: loc('arpa_genepool_ancients_desc'),
        reqs: { evolve: 2 },
        condition(){
            return global.genes['old_gods'] ? true : false;
        },
        grant: ['ancients',1],
        cost: { Plasmid(){ return 120; } },
        action(){
            if (payCrispr('ancients')){
                global.genes['ancients'] = 1;
                drawTech();
                return true;
            }
            return false;
        }
    },
    faith: {
        id: 'genes-faith',
        title: loc('arpa_genepool_faith_title'),
        desc: loc('arpa_genepool_faith_desc'),
        reqs: { ancients: 1 },
        grant: ['ancients',2],
        cost: { Plasmid(){ return 300; } },
        action(){
            if (payCrispr('faith')){
                global.civic.priest.display = true;
                return true;
            }
            return false;
        }
    },
    devotion: {
        id: 'genes-devotion',
        title: loc('arpa_genepool_devotion_title'),
        desc: loc('arpa_genepool_devotion_desc'),
        reqs: { ancients: 2 },
        grant: ['ancients',3],
        cost: { Plasmid(){ return 600; } },
        action(){
            if (payCrispr('devotion')){
                return true;
            }
            return false;
        }
    },
    acolyte: {
        id: 'genes-acolyte',
        title: loc('arpa_genepool_acolyte_title'),
        desc: loc('arpa_genepool_acolyte_desc'),
        reqs: { ancients: 3 },
        grant: ['ancients',4],
        cost: { Plasmid(){ return 1000; } },
        action(){
            if (payCrispr('acolyte')){
                return true;
            }
            return false;
        }
    },
    conviction: {
        id: 'genes-conviction',
        title: loc('arpa_genepool_conviction_title'),
        desc: loc('arpa_genepool_conviction_desc'),
        reqs: { ancients: 4 },
        grant: ['ancients',5],
        cost: { Plasmid(){ return 1500; } },
        action(){
            if (payCrispr('conviction')){
                return true;
            }
            return false;
        }
    },
    doctrine: {
        id: 'genes-doctrine',
        title: loc('arpa_genepool_doctrine_title'),
        desc: loc('arpa_genepool_doctrine_desc'),
        reqs: { ancients: 5 },
        condition(){
            return global.stats.achieve['godslayer'] ? true : false;
        },
        grant: ['ancients',6],
        cost: { Supercoiled(){ return 50; } },
        action(){
            if (payCrispr('doctrine')){
                return true;
            }
            return false;
        }
    },
    ideology: {
        id: 'genes-ideology',
        title: loc('arpa_genepool_ideology_title'),
        desc: loc('arpa_genepool_ideology_desc'),
        reqs: { ancients: 6 },
        grant: ['ancients',7],
        cost: { Supercoiled(){ return 75; } },
        action(){
            if (payCrispr('ideology')){
                return true;
            }
            return false;
        }
    },
    transcendence: {
        id: 'genes-transcendence',
        title: loc('arpa_genepool_transcendence_title'),
        desc: loc('arpa_genepool_transcendence_desc'),
        reqs: { ancients: 1, mutation: 3 },
        grant: ['transcendence',1],
        cost: { Plasmid(){ return 3000; } },
        action(){
            if (payCrispr('transcendence')){
                global.genes['transcendence'] = 1;
                drawTech();
                return true;
            }
            return false;
        }
    },
    preeminence: {
        id: 'genes-preeminence',
        title: loc('arpa_genepool_preeminence_title'),
        desc: loc('arpa_genepool_preeminence_desc'),
        reqs: { transcendence: 1, challenge:5, ancients: 7 },
        grant: ['transcendence',2],
        cost: { 
            Supercoiled(){ return 250; },
            Harmony(){ return 10; },
        },
        action(){
            if (payCrispr('preeminence')){
                return true;
            }
            return false;
        }
    },
    bleeding_effect: {
        id: 'genes-bleeding_effect',
        title: loc('arpa_genepool_bleeding_effect_title'),
        desc: loc('arpa_genepool_bleeding_effect_desc',[2.5]),
        reqs: { creep: 2 },
        grant: ['bleed',1],
        condition(){
            return global.race.universe === 'antimatter' ? true : false;
        },
        cost: { Plasmid(){ return 100; } },
        action(){
            if (payCrispr('bleeding_effect')){
                return true;
            }
            return false;
        }
    },
    synchronicity: {
        id: 'genes-synchronicity',
        title: loc('arpa_genepool_synchronicity_title'),
        desc: loc('arpa_genepool_synchronicity_desc',[25]),
        reqs: { bleed: 1 },
        grant: ['bleed',2],
        cost: { Plasmid(){ return 500; } },
        action(){
            if (payCrispr('synchronicity')){
                return true;
            }
            return false;
        }
    },
    astral_awareness: {
        id: 'genes-astral_awareness',
        title: loc('arpa_genepool_astral_awareness_title'),
        desc: loc('arpa_genepool_astral_awareness_desc'),
        reqs: { bleed: 2 },
        grant: ['bleed',3],
        cost: { Plasmid(){ return 1000; } },
        action(){
            if (payCrispr('astral_awareness')){
                return true;
            }
            return false;
        }
    },
    blood_remembrance: {
        id: 'genes-blood_remembrance',
        title: loc('arpa_genepool_blood_remembrance_title'),
        desc: loc('arpa_genepool_blood_remembrance_desc'),
        reqs: {},
        grant: ['blood',1],
        condition(){
            return global.prestige.Blood_Stone.count >= 1 ? true : false;
        },
        cost: {
            Plasmid(){ return 1000; },
            Phage(){ return 10; }
        },
        action(){
            if (payCrispr('blood_remembrance')){
                return true;
            }
            return false;
        }
    },
    blood_sacrifice: {
        id: 'genes-blood_sacrifice',
        title: loc('arpa_genepool_blood_sacrifice_title'),
        desc: loc('arpa_genepool_blood_sacrifice_desc'),
        reqs: { blood: 1 },
        grant: ['blood',2],
        cost: {
            Plasmid(){ return 3000; },
            Phage(){ return 100; },
            Artifact(){ return 1; }
        },
        action(){
            if (payCrispr('blood_sacrifice')){
                return true;
            }
            return false;
        }
    },
};
