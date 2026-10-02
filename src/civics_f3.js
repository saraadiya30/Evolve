import { global, seededRandom } from './vars.js';
import { traits, biomes, fathomCheck } from './races.js';
import { loc } from './locale.js';
import { eventActive } from './functions.js';
import { jobScale } from './jobs.js';
import { armyRating, garrisonSize } from './civics_f4.js';
import { war_campaign_s1, war_campaign_s2, war_campaign_s3 } from './sec_war_campaign_1.js';

// Fungsi-fungsi dipindah dari civics.js (urutan sumber dipertahankan). civics.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function soldierBreakdown(type){
    let scale = global.race['hivemind'] ? traits.hivemind.vars()[0] : 1;
    let data = armyRating(scale,type,0,true);

    let desc = `<div class="soldierEvaluation"><div class="head">${loc(`civics_garrison_soldier_rating`)}</div>`;
    data.forEach(function(d){
        if (d.v > 0 || d.v < 0){
            if (d.k === 'base'){
                desc += `<div><span>${loc(d.k)}</span> <span class="has-text-success">${d.v}</span></div>`;
            }
            else {
                let val = typeof d.v === 'string' ? parseInt(d.v) : +(d.v * 100).toFixed(1);
                desc += `<div><span>${loc(d.k)}</span> <span class="has-text-${d.v >= 0 ? 'success' : 'danger'}">${d.v < 0 ? '' : '+'}${val}${typeof d.v === 'string' ? '' : '%'}</span></div>`;
            }
        }
    });
    desc += `</div>`;
    return desc;
}

export function describeSoldier(){
    let rating = armyRating(garrisonSize(),'hunting');

    let loot_args = [];
    if ((!global.race['herbivore'] || global.race['carnivore']) && !global.race['artifical']) {
        let food = +(rating / 3).toFixed(2);
        loot_args.push(food, global.resource.Food.name);
    }
    let fur = +(rating / 10).toFixed(2);
    loot_args.push(fur, global.resource.Furs.name);
    if (global.race['evil'] && !global.race['kindling_kindred'] && !global.race['smoldering']) {
        let bones = +(rating / (global.race['soul_eater'] ? 3 : 5)).toFixed(2);
        loot_args.push(bones, global.resource.Lumber.name);
    }
    let loot_string = 'civics_garrison_soldier_loot' + (loot_args.length / 2);

    let soldiers_desc = global.race['evil'] && global.race['soul_eater']
      ? 'civics_garrison_soldier_evil_desc'
      : 'civics_garrison_soldier_desc';

    return `${loc(soldiers_desc)} ${loc(loot_string, loot_args)}`;
}

export function battleAssessment(gov){
    if (global.civic.foreign[`gov${gov}`].occ){
        return loc('civics_garrison_deoccupy_desc');
    }
    else if (global.civic.foreign[`gov${gov}`].buy || global.civic.foreign[`gov${gov}`].anx){
        return loc('civics_garrison_secede_desc');
    }
    else if (
        (global.civic.garrison.tactic <= 1 && global.civic.foreign[`gov${gov}`].spy < 1) || 
        (global.civic.garrison.tactic >= 2 && global.civic.garrison.tactic <= 3 && global.civic.foreign[`gov${gov}`].spy < 2) || 
        (global.civic.garrison.tactic === 4 && global.civic.foreign[`gov${gov}`].spy < 3)
        ){
        return loc('civics_garrison_no_spy');
    }
    let army = armyRating(global.civic.garrison.raid,'army');
    let enemy = 0;
    switch(global.civic.garrison.tactic){
        case 0:
            enemy = 5;
            break;
        case 1:
            enemy = 27.5;
            break;
        case 2:
            enemy = 62.5;
            break;
        case 3:
            enemy = 125;
            break;
        case 4:
            enemy = 300;
            break;
    }
    enemy *= global.civic.foreign[`gov${gov}`].mil / 100;
    if (global.race['banana']){
        enemy *= 2;
    }
    if (global.city.biome === 'swamp'){
        enemy *= biomes.swamp.vars()[0];
    }

    if (eventActive('fool',2021)){
        enemy /= 1.25;
    }

    if (army < enemy){
        return loc('civics_garrison_disadvantage',[+((1 - (army / enemy)) * 100).toFixed(1)]);
    }
    else {
        return loc('civics_garrison_advantage',[+((1 - (enemy / army)) * 100).toFixed(1)]);
    }
}

export function war_campaign(gov){
    const $ctx = {};
    $ctx.gov = gov;
    { const $r = war_campaign_s1($ctx); if ($r) return $r.$r; }
        war_campaign_s2($ctx);
        war_campaign_s3($ctx);
}

export function armorCalc(dead){
    let armor = 0;
    if (global.race['scales']){
        armor += traits.scales.vars()[0];
    }
    if (global.tech['armor']){
        armor += global.tech['armor'];
    }
    if (global.race['high_pop']){
        armor += Math.floor(seededRandom(0, armor * traits.high_pop.vars()[0],true));
    }
    if (global.race['armored']){
        let armored = traits.armored.vars()[0] / 100;
        armor += Math.floor(dead * armored);
    }
    let fathom = fathomCheck('tortoisan');
    if (fathom > 0){
        let armored = traits.armored.vars(1)[0] / 100 * fathom;
        armor += Math.floor(dead * armored);
    }
    return armor;
}

export function looters(){
    let cap = 0;
    let looting = global.civic.garrison.raid;
    switch(global.civic.garrison.tactic){
        case 0:
            cap = 5;
            break;
        case 1:
            cap = 10;
            break;
        case 2:
            cap = 25;
            break;
        case 3:
            cap = 50;
            break;
        case 4:
            cap = 999;
            break;
    }
    if (global.race['high_pop']){
        cap = jobScale(cap);
    }
    if (looting > cap){
        looting = cap;
    }
    return looting;
}
