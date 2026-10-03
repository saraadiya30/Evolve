import { global, p_on, seededRandom, sizeApproximation } from '../../core/vars.js';
import { jobScale } from '../../civics/jobs.js';
import { armyRating, garrisonSize, soldierDeath, govCivics } from '../../civics/civics.js';
import { highPopAdjust } from '../../resources/prod.js';
import { fortressModules } from '../portal_registry.js';
import { clearElement, vBind, popover, messageQueue } from '../../functions/functions.js';
import { loc } from '../../core/locale.js';
import { checkRequirements } from '../../space/space.js';
import { setAction } from '../../actions/actions.js';
import { traits, races } from '../../races/races.js';
import { hellSupression } from '../mech/hellguard_and_mech_costs.js';
import { buildFortress_s1, buildFortress_s2, buildFortress_s3 } from '../../sections/portal/build_fortress_parts.js';
import { SPIRE_CREEP_DIVISOR, SPIRE_CREEP_FLOOR } from '../../config/cost.js';

// Fungsi-fungsi dipindah dari portal.js (urutan sumber dipertahankan). portal.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function spireCreep(base){
    let creep = global.portal.hasOwnProperty('spire') && global.blood['spire'] ? base - ((global.portal.spire.count - 1) / SPIRE_CREEP_DIVISOR) : base;
    return creep >= SPIRE_CREEP_FLOOR ? creep : SPIRE_CREEP_FLOOR;
}

export function towerPrice(cost, wiki){
    let sup = hellSupression('gate', 0, wiki);
    return Math.round(cost / (sup.supress > 0.01 ? sup.supress : 0.01));
}

export function soulForgeSoldiers(wiki){
    let base = global.race['warlord'] ? 400 : 650;
    let num_gun_emplacement = wiki ? (global.portal?.gun_emplacement?.on ?? 0) : p_on['gun_emplacement'];
    let num_soldiers_saved = num_gun_emplacement * (global.tech.hell_gun >= 2 ? jobScale(2) : jobScale(1));

    // To avoid divide-by-0 type issues, force the average soldier combat rating to be at least 1
    let avg_rating = Math.max(armyRating(1, 'hellArmy'), highPopAdjust(1));
    let soldiers = Math.ceil(base / avg_rating);
    soldiers = Math.max(0, soldiers - num_soldiers_saved);

    if (global.race['hivemind']){
        // Permit actual soldiers to count as a group for combat rating adjustment
        // Gun emplacements use the combat rating of the remaining soldiers
        // Both soldiers=0 and soldiers=1 cases use the combat rating of 1 soldier alone
        soldiers = 0;
        while ((soldiers + num_soldiers_saved) * avg_rating < base){
            soldiers++;
            avg_rating = armyRating(soldiers, 'hellArmy') / soldiers;
            avg_rating = Math.max(avg_rating, highPopAdjust(1));
        }
    }

    return soldiers;
}

export function fortressTech(){
    return fortressModules;
}

export function renderFortress(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 4)){
        return;
    }
    let parent = $('#portal');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_portal')}</h2>`));
    if (!global.tech['portal'] || global.tech['portal'] < 2){
        return;
    }

    Object.keys(fortressModules).forEach(function (region){
        let show = region.replace("prtl_","");
        if (global.settings.portal[`${show}`]){
            let name = typeof fortressModules[region].info.name === 'string' ? fortressModules[region].info.name : fortressModules[region].info.name();
            
            let property = ``;
            if (fortressModules[region].info.hasOwnProperty('prop')){
                property = fortressModules[region].info.prop();
            }

            if (typeof fortressModules[region].info['support'] && global.portal[fortressModules[region].info['support']]){
                let support = fortressModules[region].info['support'];
                if (fortressModules[region].info['hide_support']){
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
                }
                else {
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span>${property}</div></div>`);
                }
                vBind({
                    el: `#sr${region}`,
                    data: global.portal[support],
                    filters: {
                        filter(){
                            return fortressModules[region].info.filter(...arguments);
                        }
                    }
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3>${property}</div></div>`);
            }

            popover(region, function(){
                    return typeof fortressModules[region].info.desc === 'string' ? fortressModules[region].info.desc : fortressModules[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

            if (region === 'prtl_fortress'){
                if (global.race['warlord']){
                    buildEnemyFortress(parent);
                }
                else {
                    buildFortress(parent,true);
                }
            } 

            Object.keys(fortressModules[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(fortressModules,region,tech)){
                    let c_action = fortressModules[region][tech];
                    setAction(c_action,'portal',tech);
                }
            });
        }
    });
}

export function checkHellRequirements(region,tech){
    return checkRequirements(fortressModules,region,tech);
}

function buildEnemyFortress(parent){
    if (!global.race['warlord']){
        return;
    }
    if (!global.settings.tabLoad){
        switch (global.settings.civTabs){
            case 1:
                if (global.settings.spaceTabs !== 4){
                    return;
                }
                break;
            case 2:
                if (global.settings.govTabs !== 3){
                    return;
                }
                break;
            default:
                return;
        }
    }

    let id = 'fort';
    let fort = $(`<div id="${id}" class="fort"></div>`);
    parent.append(fort);

    let enemy = $(`<div v-for="(e, index) of enemy" :key="index" class="enemyFortress">
        <div class="fortRow"><span class="has-text-success">{{ e.r | species }}</span><span class="has-text-warning">${loc(`fortress_wall`)} {{ e.f }}%</span></div>
        <div class="fortRow second"><span class="has-text-caution">${loc(`fortress_demon_kills`)} {{ e.k | kills }}</span><a class="button" v-on:click="attack(index)" role="button">${loc(`civics_garrison_attack`)}</a></div>
    </div>`);
    fort.append(enemy);

    vBind({
        el: `#${id}`,
        data: global.portal.throne,
        methods: {
            attack(idx){
                let horde = Math.floor(global.portal.minions.spawns * seededRandom(6, 10, true) / 10);
                let scale = global.race['hivemind'] ? traits.hivemind.vars()[0] : 1;
                let rating = armyRating(scale,'hellArmy',0) / scale;
                let died = seededRandom((250 + global.portal.throne.enemy[idx].s * 250) / rating, (500 + global.portal.throne.enemy[idx].s * 1250) / rating, true);
                if (global.race['armored']){
                    died *= 1 - (traits.armored.vars()[0] / 100);
                    died = Math.round(died);
                }
                let range = global.portal.throne.enemy[idx].f;
                for (let i=0; i<range; i++){
                    died += seededRandom(global.portal.throne.enemy[idx].s * 250 / rating, global.portal.throne.enemy[idx].s * 1250 / rating, true);
                    if (horde > died){
                        global.portal.throne.enemy[idx].f--;
                    }
                    else {
                        break;
                    }
                }
                died = Math.round(died);
                if (global.portal.minions.spawns < died){ died = global.portal.minions.spawns; }
                global.portal.minions.spawns -= died;
                global.portal.throne.enemy[idx].k += died;
                   
                if (p_on['soul_forge']){
                    let troops = garrisonSize(false,{no_forge: true});
                    let forge = soulForgeSoldiers();
                    if (forge <= troops){
                        global.portal.soul_forge.kills += died;
                    }
                }

                if (global.portal.throne.enemy[idx].f <= 0){
                    messageQueue(loc('fortress_enemy_defeat',[races[global.portal.throne.enemy[idx].r].name]),'info',false,['progress']);
                    global.portal.throne.hearts.push(global.portal.throne.enemy[idx].r);
                    global.portal.throne.enemy.splice(idx,1);
                    renderFortress();
                }
            }
        },
        filters: {
            species(v){
                return races[v].name;
            },
            kills(v){
                return sizeApproximation(v);
            }
        }
    });
}

export function buildFortress(parent,full){
    const $ctx = {};
    $ctx.parent = parent;
    $ctx.full = full;
    { const $r = buildFortress_s1($ctx); if ($r) return $r.$r; }

    buildFortress_s2($ctx);

    buildFortress_s3($ctx);
}

export function fortressDefenseRating(v){
    let army = v - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
    if (p_on['soul_forge']){
        let forge = soulForgeSoldiers();
        if (forge <= army){
            army -= forge;
        }
    }
    if (global.portal.hasOwnProperty('guard_post')){
        army -= jobScale(global.portal.guard_post.on);
    }
    let wounded = 0;
    if (global.civic.garrison.wounded > global.civic.garrison.workers - global.portal.fortress.garrison){
        wounded = global.civic.garrison.wounded - (global.civic.garrison.workers - global.portal.fortress.garrison);
        if (wounded > army){
            wounded = army;
        }
    }
    if (p_on['war_droid']){
        let droids = p_on['war_droid'] - global.portal.fortress.patrols > 0 ? p_on['war_droid'] - global.portal.fortress.patrols : 0;
        army += global.tech['hdroid'] ? jobScale(droids * 2) : jobScale(droids);
    }
    let turret = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 70 : 50) : 35;
    return Math.round(armyRating(army,'hellArmy',wounded)) + (p_on['turret'] ? p_on['turret'] * turret : 0);
}

export function casualties(demons,pat_armor,ambush,report){
    let casualties = Math.round(Math.log2((demons / global.portal.fortress.patrol_size) / (pat_armor || 1))) - Math.rand(0,pat_armor);
    let dead = 0;
    if (casualties > 0){
        if (casualties > global.portal.fortress.patrol_size){
            casualties = global.portal.fortress.patrol_size;
        }
        casualties = Math.rand(ambush ? 1 : 0,casualties + 1);
        dead = Math.rand(0,casualties + 1);
        let wounded = casualties - dead;
        if (global.race['instinct']){
            let reduction = Math.floor(dead * (traits.instinct.vars()[1] / 100));
            dead -= reduction;
            wounded += reduction;
        }
        report.wounded = wounded;
        report.died = dead;
        global.civic.garrison.wounded += wounded;
        soldierDeath(dead);
    }
    return dead;
}

export function fortressData(dt){
    switch (dt){
        case 'hostiles':
            {
                if (global.portal.fortress.threat >= 2000){
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_high')}`;
                }
                else if (global.portal.fortress.threat < 1000){
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_low')}`;
                }
                else {
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_medium')}`;
                }
            }
        case 'threatLevel':
            {
                let t = global.portal.fortress.threat;
                if (t < 1000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level1')}`;
                }
                else if (t < 1500){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level2')}`;
                }
                else if (t >= 5000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level6')}`;
                }
                else if (t >= 3000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level5')}`;
                }
                else if (t >= 2000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level4')}`;
                }
                else {
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level3')}`;
                }
            }
        case 'hireLabel':
            {
                let cost = Math.round(govCivics('m_cost')).toLocaleString();
                return loc('civics_garrison_hire_mercenary_cost',[cost]);
            }
    }
}
