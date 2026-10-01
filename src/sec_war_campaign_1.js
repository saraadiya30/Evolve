import { global, seededRandom } from './vars.js';
import { jobScale } from './jobs.js';
import { garrisonSize, armyRating, soldierDeath, lootModify } from './civics_f4.js';
import { messageQueue, modRes } from './functions.js';
import { loc } from './locale.js';
import { biomes, traits, planetTraits } from './races.js';
import { looters, armorCalc } from './civics_f3.js';
import { checkControlling } from './civics_f1.js';
import { drawTech } from './actions.js';
import { universeAffix } from './achieve.js';

// Bagian dari war_campaign (civics_f3.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function war_campaign_s1($ctx){
        if (global.civic.foreign[`gov${$ctx.gov}`].occ){
        global.civic.foreign[`gov${$ctx.gov}`].occ = false;
        global.civic.garrison.max += jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
        global.civic.garrison.workers += jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
        return {$rv: 0};
    }
    if (global.civic.foreign[`gov${$ctx.gov}`].buy || global.civic.foreign[`gov${$ctx.gov}`].anx){
        global.civic.foreign[`gov${$ctx.gov}`].buy = false;
        global.civic.foreign[`gov${$ctx.gov}`].anx = false;
        return {$rv: 0};
    }

    if (global.civic.garrison.raid > garrisonSize()){
        global.civic.garrison.raid = garrisonSize();
    }
    else if (global.civic.garrison.raid < 0){
        global.civic.garrison.raid = 0;
    }
    
    if (global.civic.garrison.raid === 0){
        messageQueue(loc('civics_garrison_campaign_no_soldier'),'warning',false,['combat']);
        return {$rv: 0};
    }
    global.stats.attacks++;

    let highLuck = global.race['claws'] ? 20 : 16;
    let lowLuck = global.race['puny'] ? 3 : 5;

    let luck = Math.floor(seededRandom(lowLuck,highLuck,true)) / 10;
    $ctx.army = armyRating(global.civic.garrison.raid,'army') * luck;
    $ctx.enemy = 0;

    switch(global.civic.garrison.tactic){
        case 0:
            $ctx.enemy = seededRandom(0,10,true);
            global.civic.foreign[`gov${$ctx.gov}`].hstl += Math.floor(seededRandom(0,2,true));
            break;
        case 1:
            $ctx.enemy = seededRandom(5,50,true);
            global.civic.foreign[`gov${$ctx.gov}`].hstl += Math.floor(seededRandom(0,3,true));
            break;
        case 2:
            $ctx.enemy = seededRandom(25,100,true);
            global.civic.foreign[`gov${$ctx.gov}`].hstl += Math.floor(seededRandom(1,5,true));
            break;
        case 3:
            $ctx.enemy = seededRandom(50,200,true);
            global.civic.foreign[`gov${$ctx.gov}`].hstl += Math.floor(seededRandom(4,12,true));
            break;
        case 4:
            $ctx.enemy = seededRandom(100,500,true);
            global.civic.foreign[`gov${$ctx.gov}`].hstl += Math.floor(seededRandom(10,25,true));
            break;
    }
    $ctx.enemy = Math.floor($ctx.enemy * global.civic.foreign[`gov${$ctx.gov}`].mil / 100);
    if (global.race['banana']){
        $ctx.enemy *= 2;
    }
    if (global.city.biome === 'swamp'){
        $ctx.enemy *= biomes.swamp.vars()[0];
    }
    if (global.race['mistrustful']){
        global.civic.foreign[`gov${$ctx.gov}`].hstl += traits.mistrustful.vars()[0];
    }
    if (global.civic.foreign[`gov${$ctx.gov}`].hstl > 100){
        global.civic.foreign[`gov${$ctx.gov}`].hstl = 100;
    }

    if (global.race['blood_thirst']){
        global.race['blood_thirst_count'] += Math.ceil($ctx.enemy / 5);
        if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
            global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
        }
    }

    $ctx.wounded = 0;
    if (global.civic.garrison.raid > global.civic.garrison.workers - global.civic.garrison.crew - global.civic.garrison.wounded){
        $ctx.wounded = global.civic.garrison.raid - (global.civic.garrison.workers - global.civic.garrison.crew - global.civic.garrison.wounded);
    }

    global.civic.garrison.fatigue++;
}

export function war_campaign_s2($ctx){
        if ($ctx.army > $ctx.enemy){
        let deathCap = Math.floor(global.civic.garrison.raid / (5 - global.civic.garrison.tactic));
        deathCap += $ctx.wounded;
        if (global.city.ptrait.includes('rage')){
            deathCap += planetTraits.rage.vars()[2];
        }
        if (deathCap < 1){
            deathCap = 1;
        }
        if (deathCap > looters()){
            deathCap = looters();
        }
        let death = Math.floor(seededRandom(0,deathCap,true));
        if (global.race['frail']){
            death += traits.frail.vars()[0];
        }
        let armor = armorCalc(death);
        if (global.civic.garrison.raid > $ctx.wounded){
            death -= armor;
        }

        if (death < 0){
            death = 0;
        }
        if (death > global.civic.garrison.raid){
            death = global.civic.garrison.raid;
        }
        if (global.race['instinct']){
            let reduction = Math.floor(death * (traits.instinct.vars()[1] / 100));
            death -= reduction;
            $ctx.wounded += reduction;
        }
        soldierDeath(death);
        global.civic.garrison.protest += death;
        if (death > $ctx.wounded){
            global.civic.garrison.wounded -= $ctx.wounded;
            $ctx.wounded = 0;
        }
        else {
            global.civic.garrison.wounded -= death;
            $ctx.wounded -= death;
        }

        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
            global.race.ocularPowerConfig.ds += Math.round($ctx.enemy * traits.ocular_power.vars()[1]);
        }

        global.civic.garrison.wounded += Math.floor(seededRandom($ctx.wounded,global.civic.garrison.raid - death,true));

        let gains = {
            Money: 0,
            Food: 0,
            Lumber: 0,
            Stone: 0,
            Copper: 0,
            Iron: 0,
            Aluminium: 0,
            Coal: 0,
            Cement: 0,
            Steel: 0,
            Titanium: 0,
            Crystal: 0,
            Chrysotile: 0,
            Furs: 0,
            Iridium: 0,
            Alloy: 0,
            Polymer: 0,
            Oil: 0,
        };

        let basic = $ctx.gov === 3 && global.race['truepath'] ? ['Food','Lumber','Stone','Copper','Iron'] : ['Food','Lumber','Stone'];
        let common = $ctx.gov === 3 && global.race['truepath'] ? ['Aluminium','Coal','Cement','Steel','Furs'] : ['Copper','Iron','Aluminium','Coal'];
        let rare = $ctx.gov === 3 && global.race['truepath'] ? ['Titanium','Oil','Iridium','Alloy','Polymer'] : ['Cement','Steel'];
        if (global.race['artifical'] || global.race['fasting']){
            basic.shift();
        }
        if (global.race['smoldering']){
            basic.push('Chrysotile');
        }
        if (global.race['terrifying'] && $ctx.gov !== 3){
            rare.push('Titanium');
        }
        if (global.tech['magic']){
            rare.push('Crystal');
        }

        let looted = ['Money'];
        switch(global.civic.garrison.tactic){
            case 0:
                {
                    let extra = ['Money'].concat(basic,common);
                    looted.push(basic[Math.floor(seededRandom(0,basic.length,true))]);
                    looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    if (global.race['beast_of_burden']){
                        looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    }
                    if (global.resource.Steel.amount < 25 && global.tech['smelting'] && global.tech.smelting === 1 && Math.floor(seededRandom(0,20,true)) === 0){
                        looted.push('Steel');
                    }
                }
                break;
            case 1:
                {
                    let extra = ['Money'].concat(basic,common,rare);
                    looted.push(basic[Math.floor(seededRandom(0,basic.length,true))]);
                    looted.push(common[Math.floor(seededRandom(0,common.length,true))]);
                    looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    if (global.race['beast_of_burden']){
                        looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    }
                }
                break;
            case 2:
                {
                    let extra = ['Money'].concat(basic,common,rare);
                    let extraB = common.concat(rare);
                    looted.push(basic[Math.floor(seededRandom(0,basic.length,true))]);
                    looted.push(common[Math.floor(seededRandom(0,common.length,true))]);
                    looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    looted.push(extraB[Math.floor(seededRandom(0,extraB.length,true))]);
                    if (global.race['beast_of_burden']){
                        looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    }
                }
                break;
            case 3:
                {
                    let extra = ['Money'].concat(basic,common,rare);
                    looted.push(basic[Math.floor(seededRandom(0,basic.length,true))]);
                    looted.push(common[Math.floor(seededRandom(0,common.length,true))]);
                    looted.push(rare[Math.floor(seededRandom(0,rare.length,true))]);
                    looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    if (global.race['beast_of_burden']){
                        looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    }
                }
                break;
            case 4:
                {
                    let extra = ['Money'].concat(basic,common,rare);
                    looted.push(basic[Math.floor(seededRandom(0,basic.length,true))]);
                    looted.push(common[Math.floor(seededRandom(0,common.length,true))]);
                    looted.push(rare[Math.floor(seededRandom(0,rare.length,true))]);
                    looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    if (global.race['beast_of_burden']){
                        looted.push(extra[Math.floor(seededRandom(0,extra.length,true))]);
                    }
                }
                break;
        }

        let titanium_low = global.race['terrifying'] && $ctx.gov !== 3 ? traits.terrifying.vars()[0] : 12;
        let titanium_high = global.race['terrifying'] && $ctx.gov !== 3 ? traits.terrifying.vars()[1] : 32;

        looted.forEach(function(goods){
            switch (goods){
                case 'Money':
                    gains[goods] += Math.floor(seededRandom(100,375,true));
                    break;
                case 'Food':
                    gains[goods] += Math.floor(seededRandom(40,175,true));
                    break;
                case 'Lumber':
                case 'Stone':
                    gains[goods] += Math.floor(seededRandom(50,250,true));
                    break;
                case 'Copper':
                case 'Iron':
                case 'Aluminium':
                    gains[goods] += Math.floor(seededRandom(35,125,true));
                    break;
                case 'Coal':
                case 'Cement':
                    gains[goods] += Math.floor(seededRandom(25,100,true));
                    break;
                case 'Steel':
                case 'Chrysotile':
                    gains[goods] += Math.floor(seededRandom(20,65,true));
                    break;
                case 'Titanium':
                    gains[goods] += Math.floor(seededRandom(titanium_low,titanium_high,true));
                    break;
                case 'Crystal':
                    gains[goods] += Math.floor(seededRandom(1,5,true));
                    break;
                case 'Oil':
                    gains[goods] += Math.floor(seededRandom(20,50,true));
                    break;
                case 'Iridium':
                    gains[goods] += Math.floor(seededRandom(2,30,true));
                    break;
                case 'Alloy':
                case 'Polymer':
                    gains[goods] += Math.floor(seededRandom(5,38,true));
                    break;
            }
        });

        let loot = loc('civics_garrison_gained');
        if (global.resource.Money.display && gains.Money > 0){
            gains.Money = lootModify(gains.Money,$ctx.gov);
            loot = loot + loc('civics_garrison_quant_money',[gains.Money]);
            modRes('Money',gains.Money,true);
        }

        let payout = basic.concat(common,rare);
        payout.forEach(function(res){
            if (gains[res] > 0 && (global.resource[res].display || res === 'Steel' || res === 'Titanium')){
                gains[res] = lootModify(gains[res],$ctx.gov);
                loot = loot + loc('civics_garrison_quant_res',[gains[res],global.resource[res].name]);
                modRes(res,gains[res],true);
                if (res === 'Steel' || res === 'Titanium'){
                    global.resource[res].display = true;
                }
            }
        });

        loot = loot.slice(0,-2);
        loot = loot + '.';
        messageQueue(loot,'warning',false,['combat']);
        
        let revive = 0;
        if (global.race['revive']){
            switch (global.city.calendar.temp){
                case 0:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[0]),true));
                    break;
                case 1:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[1]),true));
                    break;
                case 2:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[2]),true));
                    break;
            }
            global.civic.garrison.workers += revive;
        }
        if (revive > 0){
            messageQueue(loc('civics_garrison_victorious_revive',[death,revive]),'success',false,['combat']);
        }
        else {
            messageQueue(loc('civics_garrison_victorious',[death]),'success',false,['combat']);
        }

        if (global.race['slaver'] && global.city['slave_pen']){
            let max = global.city.slave_pen.count * 4;
            if (max > global.resource.Slave.amount){
                let slaves = Math.floor(seededRandom(0,global.civic.garrison.tactic + 2,true));
                if (slaves + global.resource.Slave.amount > max){
                    slaves = max - global.resource.Slave.amount;
                }
                if (slaves > 0){
                    global.resource.Slave.amount += slaves;
                    messageQueue(loc('civics_garrison_capture',[slaves]),'success',false,['combat']);
                }
            }
        }
        if (global.race['infectious']){
            let infected = 0;
            switch(global.civic.garrison.tactic){
                case 0:
                    infected = Math.floor(seededRandom(0,traits.infectious.vars()[0],true));
                    break;
                case 1:
                    infected = Math.floor(seededRandom(0,traits.infectious.vars()[1],true));
                    break;
                case 2:
                    infected = Math.floor(seededRandom(0,traits.infectious.vars()[2],true));
                    break;
                case 3:
                    infected = Math.floor(seededRandom(0,traits.infectious.vars()[3],true));
                    break;
                case 4:
                    infected = Math.floor(seededRandom(0,traits.infectious.vars()[4],true));
                    break;
            }
            let zombies = global.resource[global.race.species].amount + infected;
            if (zombies > global.resource[global.race.species].max){
                infected = global.resource[global.race.species].max - global.resource[global.race.species].amount;
            }
            if (infected > 0){
                global.resource[global.race.species].amount += infected;
                global.civic[global.civic.d_job].workers += infected;
                if (infected === 1){
                    messageQueue(loc('civics_garrison_soldier_infected'),'special',false,['combat']);
                }
                else {
                    messageQueue(loc('civics_garrison_soldiers_infected',[infected]),'special',false,['combat']);
                }
            }
        }

        let occCost = jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
        if ($ctx.gov <= 2 && global.civic.garrison.tactic === 4 && global.civic.garrison.workers >= occCost){
            let drawTechs = !global.tech['gov_fed'] && !checkControlling();
            global.civic.garrison.max -= occCost;
            global.civic.garrison.workers -= occCost;
            global.civic.foreign[`gov${$ctx.gov}`].occ = true;
            global.civic.foreign[`gov${$ctx.gov}`].sab = 0;
            global.civic.foreign[`gov${$ctx.gov}`].act = 'none';
            if (drawTechs){
                drawTech();
            }
            if (global.race['banana']){
                let affix = universeAffix();
                global.stats.banana.b1[affix] = true;
                if (affix !== 'm' && affix !== 'l'){
                    global.stats.banana.b1.l = true;
                }
            }
        }
    }
    else {
        let deathCap = global.civic.garrison.raid;
        deathCap += $ctx.wounded;
        if (global.civic.garrison.tactic === 0){
            deathCap = Math.floor(deathCap / 2);
        }
        if (global.city.ptrait.includes('rage')){
            deathCap += planetTraits.rage.vars()[2];
        }
        if (deathCap < 1){
            deathCap = 1;
        }
        if (deathCap > looters()){
            deathCap = looters();
        }
        let death = Math.floor(seededRandom(1,deathCap,true));
        if (global.race['frail']){
            death += global.civic.garrison.tactic + traits.frail.vars()[1];;
        }
        let armor = armorCalc(death);
        if (global.civic.garrison.raid > $ctx.wounded){
            death -= armor;
        }
        if (global.race['instinct']){
            let reduction = Math.floor(death * (traits.instinct.vars()[1] / 100));
            death -= reduction;
            $ctx.wounded += reduction;
        }
        if (death < 1){
            death = 1;
        }
        if (death > global.civic.garrison.raid){
            death = global.civic.garrison.raid;
        }
        soldierDeath(death);
        global.civic.garrison.protest += death;
        if (death > $ctx.wounded){
            global.civic.garrison.wounded -= $ctx.wounded;
            $ctx.wounded = 0;
        }
        else {
            global.civic.garrison.wounded -= death;
            $ctx.wounded -= death;
        }
        global.civic.garrison.wounded += 1 + Math.floor(seededRandom($ctx.wounded,global.civic.garrison.raid - death,true));

        let revive = 0;
        if (global.race['revive']){
            switch (global.city.calendar.temp){
                case 0:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[3]),true));
                    break;
                case 1:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[4]),true));
                    break;
                case 2:
                    revive = Math.floor(seededRandom(0,Math.floor(death / traits.revive.vars()[5]),true));
                    break;
            }
            global.civic.garrison.workers += revive;
        }
        if (revive > 0){
            messageQueue(loc('civics_garrison_defeat_revive',[death,revive]),'danger',false,['combat']);
        }
        else {
            messageQueue(loc('civics_garrison_defeat',[death]),'danger',false,['combat']);
        }
    }
}

export function war_campaign_s3($ctx){
        if (global.civic.garrison.wounded > global.civic.garrison.workers - global.civic.garrison.crew){
        global.civic.garrison.wounded = global.civic.garrison.workers - global.civic.garrison.crew;
    }
    else if (global.civic.garrison.wounded < 0){
        global.civic.garrison.wounded = 0;
    }
}
