import { global, p_on, support_on, seededRandom } from '../core/vars.js';
import { fortressModules, monsters } from './portal_registry.js';
import { traits, races, fathomCheck } from '../races/races.js';
import { garrisonSize, armyRating } from '../civics/civics.js';
import { asphodelResist } from '../edenic/edenic.js';
import { loc } from '../core/locale.js';
import { messageQueue } from '../functions/functions.js';
import { jobScale } from '../civics/jobs.js';
import { soulForgeSoldiers, renderFortress } from './portal_f1.js';
import { checkWarlordAchieve } from './portal_f7.js';

// Fungsi-fungsi dipindah dari portal.js (urutan sumber dipertahankan). portal.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function hellguard(){
    if (global.race['warlord'] && global.portal['minions'] && global.portal.minions.count > 0){
        if ((global.portal.throne.enemy.length === 0 || 
            (global.portal.throne.spawned.length >= 3 && global.portal.throne.enemy.length <= 1) ||
            (global.portal.throne.spawned.length >= 8 && global.portal.throne.enemy.length <= 2)
        ) && Math.rand(0,10) === 0 && global.portal.minions.spawns > 0){
            if (global.portal.throne.spawned.length === 0){
                addHellEnemy(['basic']);
            }
            else {
                if (global.portal.throne.spawned.length % 3 === 0 && global.portal.throne.spawned.length % 5 === 0){
                    addHellEnemy(['advanced','rare']);
                }
                else if (global.portal.throne.spawned.length % 3 === 0){
                    addHellEnemy(['advanced']);
                }
                else if (global.portal.throne.spawned.length % 5 === 0){
                    addHellEnemy(['rare']);
                }
                else {
                    addHellEnemy(['basic']);
                }
            }
        }

        if (global.portal.minions.on > 0){
            let spawn = fortressModules.prtl_badlands.minions.soldiers();
            let low_spawn = spawn - 10;
            if (global.race['infectious']){
                spawn += traits.infectious.vars()[1];
                low_spawn += traits.infectious.vars()[0];
            }
            global.portal.minions.spawns += Math.rand(global.portal.minions.on * low_spawn, global.portal.minions.on * spawn);
        }

        let forgeOperating = false;
        if (p_on['soul_forge']){
            let troops = garrisonSize(false,{no_forge: true});
            let forge = soulForgeSoldiers();
            if (forge <= troops){
                forgeOperating = true;
                $(`#portal-soul_forge .on`).removeClass('altwarn');
            }
            else {
                forgeOperating = false;
                $(`#portal-soul_forge .on`).addClass('altwarn');
            }
        }
        else {
            $(`#portal-soul_forge .on`).addClass('altwarn');
        }

        if (global.portal.throne.enemy.length > 0){
            let scale = global.race['hivemind'] ? traits.hivemind.vars()[0] : 1;
            let rating = armyRating(scale,'hellArmy',0) / scale;
            global.portal.throne.enemy.forEach(function(e){
                let eRating = e.s + (global.portal.minions.spawns / 9000) ** 8;
                let reapEffect = global.race['blurry'] ? 102 - traits.blurry.vars()[0] : 102;
                reapEffect -= (global.portal?.reaper?.rank || 1) * 2;
                if (reapEffect < 1){ reapEffect = 1; }
                let reaper = 0.25 + (eRating * 0.01) - ((global.portal?.reaper?.count || 0) ** (1 + ((global.portal?.reaper?.rank || 1) - 1) / 25) / reapEffect);
                if (reaper < 0.01){ reaper = 0.01; }
                let bound = Math.round(global.portal.minions.spawns * (0.5 * eRating) * (eRating ** reaper) / rating);
                let kills = Math.rand(e.s, bound);
                if (kills > global.portal.minions.spawns){ kills = global.portal.minions.spawns; }
                global.portal.minions.spawns -= kills;
                e.k += kills;
                if (forgeOperating){
                    global.portal.soul_forge.kills += kills;
                }

                if (e.f < 100 && Math.rand(0, 10) === 0){
                    e.f++;
                }

                if (global.race['revive']){
                    let revive = Math.round(Math.rand(0,(kills / (traits.revive.vars()[6] * 20))));
                    global.portal.minions.spawns += revive;
                }
            });
        }

        if (forgeOperating && global.tech.hell_pit >= 5 && p_on['soul_attractor']){
            let attract = global.blood['attract'] ? global.blood.attract * 5 : 0;
            if (global.tech['hell_pit'] && global.tech.hell_pit >= 8){ attract *= 2; }
            let souls = p_on['soul_attractor'] * Math.rand(40 + attract, 120 + attract);
            if (global.race['ghostly']){
                souls *= 1 + (traits.ghostly.vars()[0] / 100);
                souls = Math.round(souls);
            }
            global.portal.soul_forge.kills += souls;
        }

        if (forgeOperating && global.tech['asphodel'] && global.tech.asphodel >= 2 && support_on['ectoplasm_processor']){
            let attract = global.blood['attract'] ? global.blood.attract * 5 : 0;
            let souls = global.civic.ghost_trapper.workers * Math.rand(150 + attract, 250 + attract);
            if (global.portal['mortuary'] && global.portal['corpse_pile']){
                let corpse = (global.portal?.corpse_pile?.count || 0) * (p_on['mortuary'] || 0);
                if (corpse > 0){
                    souls *= 1 + corpse / 800;
                }
            }
            souls = Math.floor(souls * asphodelResist());
            global.portal.soul_forge.kills += souls;
        }

        let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
        if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
            cap *= (global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 3 ? 0.96 : 0.97) ** p_on['soul_attractor'];
        }
        if (global.race['ghostly']){
            cap *= 2 - traits.ghostly.vars()[1];
        }
        if (forgeOperating && global.portal.soul_forge.kills >= Math.round(cap)){
            let gems = Math.floor(global.portal.soul_forge.kills / Math.round(cap));
            global.portal.soul_forge.kills -= Math.round(cap) * gems;
            global.resource.Soul_Gem.amount += gems;
        }
    }

    if (global.race['warlord'] && global.resource.Authority.amount >= 250 && global.resource.Authority.max >= 250){
        global.stats.warlord.a = true;
        checkWarlordAchieve();
    }

    ['incinerator','warehouse','hovel','hell_casino','twisted_lab','demon_forge','hell_factory','pumpjack','dig_demon','tunneler','brute','minions','reaper','corpse_pile'].forEach(function(s){
        if (global.portal[s] && (!global.portal[s]['rank'] || global.portal[s].rank > 5)){
            global.portal[s]['rank'] = 1;
        }
    });
}

export function checkSkillPointAssignments(){
    let remaining = 0;
    ['incinerator','warehouse','hovel','hell_casino','twisted_lab','demon_forge','hell_factory','pumpjack','dig_demon','tunneler','brute','minions','reaper','corpse_pile'].forEach(function(s){
        if (global.portal[s]){
            remaining += 5 - global.portal[s].rank;
            if (global.portal[s].rank >= 5 || !global.portal.throne.skill || global.portal.throne.points <= 0){
                $(`#portal-${s} a.button`).removeClass('blue');
            }
            else if (global.portal[s].rank < 5 && global.portal.throne.skill && global.portal.throne.points > 0){
                $(`#portal-${s} a.button`).addClass('blue');
            }
        }
    });
    if (!global.portal.throne.skill || global.portal.throne.points <= 0 || remaining === 0){
        global.portal.throne.skill = false;
        $(`#portal-throne a.button`).removeClass('green');
    }
    else if (global.portal.throne.skill && global.portal.throne.points > 0){
        $(`#portal-throne a.button`).addClass('green');
    }
    return remaining;
}

export function rankDesc(label, struct){
    return (global.portal[struct]?.rank || 1) <= 1 ? label : `${label} (<span class="has-text-${global.portal[struct]?.rank === 5 ? 'caution' : 'info'}">${loc('wiki_trait_rank')} ${global.portal[struct]?.rank}</span>)`;
}

export function addHellEnemy(type = [], allowRecursion = true, allowRepeat = false){
    let invaders = [];
    let current = global.portal.throne.enemy.map(e => e.r);
    if (type.includes('basic')){
        [
            'human','elven','orc','cath','wolven','vulpine','centaur','rhinotaur','capybara','kobold','goblin',
            'gnome','ogre','cyclops','troll','tortoisan','gecko','slitheryn','arraak','pterodacti','dracnid',
            'entish','cacti','pinguicula','sporgar','shroomi','moldling','mantis','scorpid','antid'
        ].forEach(function(r){
            if (allowRepeat || (!global.portal.throne.spawned.includes(r) && ![global.race.gods,global.race.old_gods,global.race.origin].includes(r))){
                if (!current.includes(r)){ invaders.push(r); }
            }
        });
    }
    if (type.includes('advanced')){
        ['sharkin','octigoran','dryad','satyr','phoenix','salamander','yeti','wendigo','tuskin','kamel','balorg','imp','seraph','unicorn','synth'].forEach(function(r){
            if (allowRepeat || (!global.portal.throne.spawned.includes(r) && ![global.race.gods,global.race.old_gods,global.race.origin].includes(r))){
                if (!current.includes(r)){ invaders.push(r); }
            }
        });
    }
    if (type.includes('rare')){
        ['ghast','shoggoth','dwarf','raccoon','lichen','wyvern','beholder','djinn','narwhal','bombardier','nephilim'].forEach(function(r){
            if (allowRepeat || (!global.portal.throne.spawned.includes(r) && ![global.race.gods,global.race.old_gods,global.race.origin].includes(r))){
                if (!current.includes(r)){ invaders.push(r); }
            }
        });
    }
    if (invaders.length === 0 && allowRecursion){
        addHellEnemy(['basic','advanced','rare'],false);
    }
    else if (invaders.length === 0){
        addHellEnemy(['basic','advanced','rare'],false,true);
    }
    else {
        let race = invaders[Math.floor(seededRandom(0,invaders.length))];
        global.portal.throne.enemy.push({
            r: race,
            f: 100,
            s: global.portal.throne.spawned.length+1,
            k: 0
        });
        global.portal.throne.spawned.push(race);
        messageQueue(loc('portal_invasion_msg',[races[race].entity]),'info',false,['progress']);
        if (!global.settings.portal.fortress){
            global.settings.portal.fortress = true;
            renderFortress();
        }
    }
}

export function soulCapacitor(souls){
    if (global.race['witch_hunter'] && global.portal.hasOwnProperty('soul_capacitor')){
        global.portal.soul_capacitor.energy += souls;
        if (global.portal.soul_capacitor.energy > global.portal.soul_capacitor.ecap){
            global.portal.soul_capacitor.energy = global.portal.soul_capacitor.ecap;
        }
    }
}

export function hellSupression(area, val, wiki){
    // It might be nice to set suppression to 100% in the wiki before unlocking the ruins
    switch (area){
        case 'ruins':
            {
                let guard_posts_on = wiki ? (global.portal?.guard_post?.on ?? 0) : p_on['guard_post'];
                let army = val || jobScale(guard_posts_on);
                let arc = (wiki ? (global.portal?.arcology?.on ?? 0) : p_on['arcology']) * 75;
                let aRating = armyRating(army,'hellArmy',0);
                if (global.race['holy']){
                    aRating *= 1 + (traits.holy.vars()[1] / 100);
                }
                let unicornFathom = fathomCheck('unicorn');
                if (unicornFathom > 0){
                    aRating *= 1 + (traits.holy.vars(1)[1] / 100 * unicornFathom);
                }
                let supress = global.race['warlord'] ? 1 : (aRating + arc) / 5000;
                return {
                    supress: supress > 1 ? 1 : supress,
                    rating: aRating + arc
                };
            }
        case 'gate':
            {
                let gSup = hellSupression('ruins',val,wiki);
                let turret = (wiki ? (global.portal?.gate_turret?.on ?? 0) : p_on['gate_turret']) * 100;
                if (global.race['holy']){
                    turret *= 1 + (traits.holy.vars()[1] / 100);
                }
                let unicornFathom = fathomCheck('unicorn');
                if (unicornFathom > 0){
                    turret *= 1 + (traits.holy.vars(1)[1] / 100 * unicornFathom);
                }
                let supress = global.race['warlord'] ? 1 : (gSup.rating + turret) / 7500;
                return {
                    supress: supress > 1 ? 1 : supress,
                    rating: gSup.rating + turret
                };
            }
        default:
            return 0;
    }
}

export function mechCost(size,infernal,standardize){
    let soul = 9999;
    let cost = 10000000;
    switch (size){
        case 'small':
            {
                let baseCost = global.blood['prepared'] && global.blood.prepared >= 2 ? 50000 : 75000;
                cost = infernal ? baseCost * 2.5 : baseCost;
                soul = infernal ? 20 : 1;
            }
            break;
        case 'medium':
            {
                cost = infernal ? 450000 : 180000;
                soul = infernal ? 100 : 4;
            }
            break;
        case 'large':
            {
                cost = infernal ? 925000 : 375000;
                soul = infernal ? 500 : 20;
            }
            break;
        case 'titan':
            {
                cost = infernal ? 1500000 : 750000;
                soul = infernal ? 1500 : 75;
            }
            break;
        case 'collector':
            {
                let baseCost = global.blood['prepared'] && global.blood.prepared >= 2 ? 8000 : 10000;
                cost = infernal ? baseCost * 2.5 : baseCost;
                soul = 1;
            }
            break;
        case 'minion':
            {
                let baseCost = global.blood['prepared'] && global.blood.prepared >= 2 ? 30000 : 50000;
                cost = infernal ? baseCost * 2.5 : baseCost;
                soul = infernal ? 10 : 1;
            }
            break;
        case 'fiend':
            {
                cost = infernal ? 300000 : 125000;
                soul = infernal ? 40 : 4;
            }
            break;
        case 'cyberdemon':
            {
                cost = infernal ? 625000 : 250000;
                soul = infernal ? 120 : 12;
            }
            break;
        case 'archfiend':
            {
                cost = infernal ? 1200000 : 600000;
                soul = infernal ? 250 : 25;
            }
            break;
    }
    if (standardize){
        return {
            Soul_Gem(){ return soul; },
            Supply(){ return cost; }
        };
    }
    return { s: soul, c: cost };
}

export function bossResists(boss){
    let weak = `laser`;
    let resist = `laser`;
    
    let standardList = ['laser','flame','plasma','kinetic','missile','sonic','shotgun','tesla'];
    Object.keys(monsters[boss].weapon).forEach(function(weapon){
        if (global.race['warlord'] || standardList.includes(weapon)){
            if (checkBossResist(boss,weapon) > checkBossResist(boss,weak)){
                weak = weapon;
            }
            if (checkBossResist(boss,weapon) < checkBossResist(boss,resist)){
                resist = weapon;
            }
        }
    });
    if (weak === resist){
        weak = 'none';
        resist = 'none';
    }
    return { w: weak, r: resist };
}

export function checkBossResist(boss,weapon){
    let effectiveness = monsters[boss].weapon[weapon];
    
    let seed = global.stats.reset + (global.portal?.spire?.count || 1);
    let seed_r1 = Math.floor(seededRandom(0,25000,false,seed + (global.portal?.spire?.count || 1) * 2));
    let seed_w1 = Math.floor(seededRandom(0,25000,false,seed + global.stats.reset * 2));
    
    let weaponList = global.race['warlord'] 
        ? ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla','claws','venom','cold','shock','fire','acid','stone','iron','flesh','ice','magma','axe','hammer']
        : ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla'];

    let resist = weaponList[Math.floor(seededRandom(0,weaponList.length,false,seed_r1))];
    let weak = weaponList[Math.floor(seededRandom(0,weaponList.length,false,seed_w1))];

    if (weapon === resist){
        let seed_r2 = Math.floor(seededRandom(0,25000,false,seed_r1 + (global.portal?.spire?.count || 1) * 3));
        effectiveness -= Math.floor(seededRandom(0,26,false,seed_r2)) / 100;
        if (effectiveness < 0){ effectiveness = 0; }
    }
    else if (weapon === weak){
        let seed_w2 = Math.floor(seededRandom(0,25000,false,seed_w1 + global.stats.reset * 3));
        effectiveness += Math.floor(seededRandom(0,26,false,seed_w2)) / 100;
    }
    return effectiveness;
}
