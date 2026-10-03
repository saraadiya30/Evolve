import { alevel, checkBigAchievement, checkBigAchievementUniverse, unlockAchieve, unlockFeat, universeAffix, achievements } from '../achievements/achieve.js';
import { global } from '../core/vars.js';
import { piracy } from '../space/space.js';
import { eventActive, calcQueueMax, calcRQueueMax } from '../functions/functions.js';
import { races, genus_def } from '../races/races.js';
import { monsters } from '../portal/portal.js';

// Bagian dari checkAchievements (achieve.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function checkAchievements_s1($ctx){
        $ctx.a_level = alevel();

    for (let t_level=$ctx.a_level; t_level >= 0; t_level--){
        checkBigAchievement('extinct_', 'mass_extinction', 25, t_level);
        if (global.race.universe === 'evil') {
            checkBigAchievementUniverse('extinct_', 'vigilante', 12, t_level);
        }
        checkBigAchievement('genus_', 'creator', 9, t_level);
        checkBigAchievement('biome_', 'explorer', 6, t_level);
        if (global.race.universe === 'heavy') {
            checkBigAchievementUniverse('genus_', 'heavyweight', 8, t_level);
        }
    }

    if (global.tech['supercollider'] && global.tech['supercollider'] >= 99){
        unlockAchieve('blackhole');
    }
    if (global.stats.starved >= 100){
        unlockAchieve('mass_starvation');
    }
    if (Math.round(Math.log2(global.civic.garrison.protest + global.civic.garrison.fatigue)) >= 8){
        unlockAchieve('warmonger');
    }
    if (global.stats.died >= 250){
        unlockAchieve('red_tactics');
    }
    if (global.interstellar['stellar_engine'] && (global.interstellar['stellar_engine'].mass) >= 12){
        unlockAchieve('landfill');
    }
    if (global.interstellar['stellar_engine'] && (global.interstellar['stellar_engine'].mass) >= 100){
        unlockFeat('supermassive');
    }

    if (global.tech['piracy'] && global.tech['chthonian'] && global.tech['chthonian'] >= 2 && global.galaxy){
        let chthonian = piracy('gxy_chthonian');
        let stargate = piracy('gxy_stargate');
        if (stargate === 1 && piracy('gxy_gateway') === 1 && piracy('gxy_gorddon') === 1 && piracy('gxy_alien1') === 1 && piracy('gxy_alien2') === 1 && chthonian === 1){
            unlockAchieve('neutralized');
        }
        if(global.race['fasting'] && (chthonian - stargate) === 0){
            let affix = universeAffix();
            global.stats.endless_hunger.b2[affix] = true;
            if (affix !== 'm' && affix !== 'l'){
                global.stats.endless_hunger.b2.l = true;
            }
        }
    }

    if (eventActive('summer') && global.resource.hasOwnProperty('Thermite')){
        let thermite = 100000 + global.stats.reset * 9000;
        if (thermite > 1000000){ thermite = 1000000; }
        if (global.resource.Thermite.amount > thermite){
            unlockFeat('solstice',global.race.universe === 'micro' ? true : false);
        }
    }

    if (eventActive('firework') && global[global.race['cataclysm'] || global.race['orbit_decayed'] ? 'space' : 'city'].firework.on > 0){
        unlockFeat('firework',global.race.universe === 'micro' ? true : false);
    }

    if (global.city.morale.current >= 200){
        unlockAchieve('paradise');
        if (global.city.morale.current >= 500){
            unlockFeat('utopia');
        }
    }

    if (global.resource.hasOwnProperty('Money') && global.resource.Money.amount >= 1000000000){
        unlockAchieve('scrooge');
    }
    if (global.resource.hasOwnProperty('Money') && global.race['inflation'] && global.resource.Money.amount >= 250000000000){
        unlockAchieve('wheelbarrow');
    }

    if (global.civic.hasOwnProperty('govern') && global.galaxy.hasOwnProperty('trade') && global.city.hasOwnProperty('market') && global.galaxy.trade.cur >= 50 && global.city.market.trade >= 750 && global.civic.govern.type === 'federation'){
        unlockAchieve('trade');
    }

    if (global.tech['pillars']){
        let genus = {};
        let rCnt = 0;
        let equilProgress = Array(5+1).fill(0); // Add 1 extra element to fill the "rank 0" position
        Object.keys(global.pillars).forEach(function(race){                
            if (races[race]){
                const type = races[race].type;
                if (type !== 'hybrid' && (!genus[type] || global.pillars[race] > genus[type])){
                    genus[type] = global.pillars[race];
                }
                rCnt++;
                equilProgress[global.pillars[race]]++;
            }
        });
        if (Object.keys(genus).length >= Object.keys(genus_def).length - 2){
            let rank = 5;
            Object.keys(genus).forEach(function(g){
                if (genus[g] < rank && g !== 'hybrid'){
                    rank = genus[g];
                }
            });
            unlockAchieve('enlightenment',false,rank);
        }
        // All races must be pillared for this to apply. The -1 is to remove protoplasm.
        if (rCnt >= Object.keys(races).length - 1){
            unlockAchieve('resonance');
        }
        // Use the best 50 pillar ranks for equilibrium feat progress
        if (rCnt >= 50){
            let eligPillars = 0;
            for (let equilRank = 5; equilRank > 0; equilRank--) {
                eligPillars += equilProgress[equilRank];
                if (eligPillars >= 50) {
                    unlockFeat('equilibrium',false,equilRank);
                    break;
                }
            }
        }
    }

    if (global.stats['synth'] && Object.keys(global.stats.synth).length >= 32) {
        unlockFeat('planned_obsolescence',false,5);
    }

    if (global.portal.hasOwnProperty('mechbay') && global.tech.hasOwnProperty('hell_spire') && global.tech.hell_spire >= 9){
        let mobs = Object.keys(monsters).length;
        let highest = {};
        Object.keys(global.stats.spire).forEach(function(universe){
            let current = {};
            Object.keys(global.stats.spire[universe]).forEach(function(boss){
                if (monsters[boss]){
                    if (universe !== 'm' && (!highest.hasOwnProperty(boss) || highest[boss] < global.stats.spire[universe][boss])){
                        highest[boss] = global.stats.spire[universe][boss];
                    }
                    if (global.stats.spire[universe][boss] > 0){
                        current[boss] = global.stats.spire[universe][boss];
                    }
                }
            });
            if (Object.keys(current).length === mobs){
                unlockAchieve('gladiator',false,Math.min(...Object.values(current)),universe);
            }
        });
        if (Object.keys(highest).length === mobs){
            unlockAchieve('gladiator',false,Math.min(...Object.values(highest)),'l');
        }
    }

    if (global.race['banana']){
        let affix = universeAffix();
        if (global.tech.hasOwnProperty('monuments') && global.tech.monuments >= 50){
            global.stats.banana.b5[affix] = true;
            if (affix !== 'm' && affix !== 'l'){
                global.stats.banana.b5.l = true;
            }
        }

        let slist = 0;
        let ulist = 0;
        ['b1','b2','b3','b4','b5'].forEach(function(b){
            if (global.stats.banana[b].l){
                slist++;
            }
            if (affix !== 'l' && global.stats.banana[b][affix]){
                ulist++;
            }
        });
        if (slist > 0){
            unlockAchieve('banana',false,slist,'l');
        }
        if (ulist > 0 && affix !== 'l'){
            unlockAchieve('banana',false,ulist,affix);
        }

        if (global.interstellar.hasOwnProperty('stellar_engine') && global.interstellar.stellar_engine.mass >= 12 && global.interstellar.stellar_engine.exotic === 0){
            global.stats.banana.b3[affix] = true;
            if (affix !== 'm' && affix !== 'l'){
                global.stats.banana.b3.l = true;
            }
        }
    }

    // Path Finder
    {
        let uAffix = universeAffix();
        ['l',uAffix].forEach(function (affix){
            let rank = 0;
            ['ashanddust','exodus','obsolete','bluepill','retired'].forEach(function (achieve){
                if (global.stats.achieve[achieve] && global.stats.achieve[achieve][affix] && global.stats.achieve[achieve][affix] >= 5){
                    rank++;
                }
            });
            if (rank > 0){
                unlockAchieve('pathfinder',false,rank,affix);
            }
        });
    }
}

export function checkAchievements_s2($ctx){
        if (global.race['fasting']){
        let affix = universeAffix();
        if (global.tech.hasOwnProperty('stock_exchange') && global.tech.stock_exchange >= 80){
            global.stats.endless_hunger.b3[affix] = true;
            if (affix !== 'm' && affix !== 'l'){
                global.stats.endless_hunger.b3.l = true;
            }
        }
        if (global.resource[global.race.species].amount >= 1200){
            global.stats.endless_hunger.b4[affix] = true;
            if (affix !== 'm' && affix !== 'l'){
                global.stats.endless_hunger.b4.l = true;
            }
        }

        let slist = 0;
        let ulist = 0;
        ['b1','b2','b3','b4','b5'].forEach(function(b){
            if (global.stats.endless_hunger[b].l){
                slist++;
            }
            if (affix !== 'l' && global.stats.endless_hunger[b][affix]){
                ulist++;
            }
        });
        if (slist > 0){
            unlockAchieve('endless_hunger',false,slist,'l');
        }
        if (ulist > 0 && affix !== 'l'){
            unlockAchieve('endless_hunger',false,ulist,affix);
        }
    }

    const date = new Date();
    let easter = eventActive('easter');
    let halloween = eventActive('halloween');
    let year = date.getFullYear();
    if (!global.settings.boring && date.getDate() === 13 && date.getDay() === 5 && global.resource[global.race.species].amount >= 1){
        let murder = false;
        murder = unlockFeat('friday',global.race.universe === 'micro' ? true : false);
        if (murder){
            global.resource[global.race.species].amount--;
        }
    }
    else if (!global.settings.boring && date.getMonth() === 1 && date.getDate() === 14){
        unlockFeat('valentine',global.race.universe === 'micro' ? true : false);
    }
    else if (!global.settings.boring && date.getMonth() === 2 && date.getDate() === 17){
        unlockFeat('leprechaun',global.race.universe === 'micro' ? true : false);
    }
    else if (easter.active){
        unlockFeat('easter',global.race.universe === 'micro' ? true : false);

        let eggs = 0;
        for (let i=1; i<=18; i++){
            if (global.special.egg[year][`egg${i}`]){
                eggs++;
            }
        }

        if (eggs >= 12){
            unlockFeat('egghunt',global.race.universe === 'micro' ? true : false);
        }
    }
    else if (eventActive('launch_day')){
        unlockFeat('launch_day',global.race.universe === 'micro' ? true : false);
    }
    else if (halloween.active){
        let total = 0;
        for (let i=1; i<=7; i++){
            if (global.special.trick[year][`trick${i}`]){
                total++;
            }
        }
        for (let i=1; i<=7; i++){
            if (global.special.trick[year][`treat${i}`]){
                total++;
            }
        }

        if (total >= 12){
            unlockFeat('trickortreat',global.race.universe === 'micro' ? true : false);
        }

        if (date.getMonth() === 9 && date.getDate() === 31){
            unlockFeat('halloween',global.race.universe === 'micro' ? true : false);
        }
    }
    else if (!global.settings.boring && date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28){
        unlockFeat('thanksgiving',global.race.universe === 'micro' ? true : false);
    }
    else if (!global.settings.boring && date.getMonth() === 11 && date.getDate() == 25){
        unlockFeat('xmas',global.race.universe === 'micro' ? true : false);
    }
    
    if (!global.settings.boring && date.getMonth() === 3 && date.getDate() >= 1 && date.getDate() <= 3 && global.stats.feat.hasOwnProperty('fool') && global.stats.feat.fool > 0){
        unlockFeat('fool',global.race.universe === 'micro' ? true : false);
    }

    if (global.stats.dkills >= 666000000){
        unlockFeat('demon_slayer');
    }

    // total achievements feat
    {
        for (let t_level=$ctx.a_level; t_level >= 1; t_level--){

            let total = 0;
            const keys = Object.keys(achievements)
            for (const key of keys) {
                if (global.stats.achieve[key] && global.stats.achieve[key].l >= t_level){
                    total++;
                }
            }
            let progress = [
                {c: 10, f: 'novice'},
                {c: 25, f: 'journeyman'},
                {c: 50, f: 'adept'},
                {c: 75, f: 'master'},
                {c: 100, f: 'grandmaster'},
                {c: 150, f: 'god'},
            ];
            for (let i=0; i<6; i++){
                if (total >= progress[i].c && (!global.stats.feat[progress[i].f] || global.stats.feat[progress[i].f] < t_level)){
                    if (global.race.universe === 'micro'){
                        unlockFeat(progress[i].f,true,t_level);
                    }
                    else {
                        unlockFeat(progress[i].f,false,t_level);
                    }
                    calcQueueMax();
                    calcRQueueMax();
                }
            }
        }
    }
}
