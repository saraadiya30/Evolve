// govEffect: efek tiap bentuk pemerintahan. Hanya boleh bergantung pada core/vars dan governor/gov_active, supaya lapisan bawah (functions, resources) bisa memakainya tanpa menyeret civics.js.
import { global } from '../core/vars.js';
import { govActive } from '../governor/gov_active.js';

export const govEffect = {
    autocracy(){
        let stress = global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? ( global.tech['high_tech'] >= 12 ? 10 : 18 ) : 25;
        let attack = govActive('organizer',0) ? 40 : 35;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){ attack += govActive('organizer',0) ? 10 : 5; }
        return [stress, attack];
    },
    democracy(){
        let entertainer = global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? ( global.tech['high_tech'] >= 12 ? 30 : 25 ) : 20;
        let work_malus = govActive('organizer',0) ? 1 : 5;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){ entertainer += govActive('organizer',0) ? 10 : 5; }
        return [entertainer, work_malus];
    },
    oligarchy(){
        let tax_penalty = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? 0 : ( global.tech['high_tech'] && global.tech['high_tech'] >= 2 ? 2 : 5 );
        let tax_cap = govActive('organizer',0) ? 25 : 20;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){ tax_cap += govActive('organizer',0) ? 10 : 5; }
        return [tax_penalty, tax_cap];
    },
    theocracy(){
        let temple = 12;
        let prof_malus = govActive('organizer',0) ? 10 : 25;
        let sci_malus = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 25 : 40 ) : 50;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){ temple += govActive('organizer',0) ? 2 : 1; }
        return [temple, prof_malus, sci_malus];
    },
    republic(){
        let bankers = govActive('organizer',0) ? 30 : 25;
        let morale = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 40 : 30 ) : 20;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){
            morale += govActive('organizer',0) ? 10 : 5;
            bankers += govActive('organizer',0) ? 10 : 5;
        }
        return [bankers, morale];
    },
    socialist(){
        let crafting = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 50 : 42 ) : 35;
        let manufacture = govActive('organizer',0) ? 12 : 10;
        let stress = 10;
        let money_malus = govActive('organizer',0) ? 10 : 20;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){
            money_malus -= 5;
            crafting += govActive('organizer',0) ? 10 : 5;
            manufacture += govActive('organizer',0) ? 3 : 2;
        }
        return [crafting, manufacture, stress, money_malus];
    },
    corpocracy(){
        let casino = govActive('organizer',0) ? 220 : 200;
        let lux = govActive('organizer',0) ? 175 : 150;
        let tourism = govActive('organizer',0) ? 110 : 100;
        let morale = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? 5 : 10;
        let factory = global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 40 : 30;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){
            casino += govActive('organizer',0) ? 30 : 20;
            lux += govActive('organizer',0) ? 15 : 10;
            tourism += govActive('organizer',0) ? 15 : 10;
            factory += govActive('organizer',0) ? 10 : 5;
        }
        return [casino, lux, tourism, morale, factory];
    },
    technocracy(){
        let knowCost = 8;
        let mat = global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 0 : ( global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? 1 : 2 );
        let knowGen = govActive('organizer',0) ? 18 : 10;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){ knowGen += govActive('organizer',0) ? 7 : 5; }
        return [knowCost, mat, knowGen];
    },
    federation(){
        let city = 3;
        let morale = govActive('organizer',0) ? 12 : 10;
        let unified = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 40 : 36 ) : 32;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){
            morale += govActive('organizer',0) ? 6 : 2;
            unified += govActive('organizer',0) ? 4 : 2;
        }
        return [city,morale,unified];
    },
    magocracy(){
        let wiz = govActive('organizer',0) ? 30 : 25;
        let crystal = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 50 : 40 ) : 25;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){
            wiz += govActive('organizer',0) ? 10 : 5;
            crystal += govActive('organizer',0) ? 10 : 5;
        }
        return [wiz, crystal];
    },
    dictator(){
        let stress = govActive('organizer',0) ? 25 : 30;
        let production = global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? 12 : 10;
        let materials = global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? 6 : 4;
        if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){
            stress -= govActive('organizer',0) ? 10 : 5;
            production += govActive('organizer',0) ? 3 : 2;
            materials += govActive('organizer',0) ? 4 : 2;
        }
        return [stress, production, materials];
    }
}
