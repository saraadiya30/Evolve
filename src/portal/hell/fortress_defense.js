// Isi: spireCreep(), towerPrice(), soulForgeSoldiers(), fortressTech(), renderFortress(), checkHellRequirements(), buildEnemyFortress(), buildFortress(), fortressDefenseRating(), casualties(), fortressData()
import { global, p_on, seededRandom, sizeApproximation } from '../../core/vars.js';
import { garrisonSize, soldierDeath } from '../../civics/military/garrison.js';
import { fortressModules, hooks } from '../../core/registries.js';
import { clearElement, vBind } from '../../functions/dom_helpers.js';
import { messageQueue } from '../../functions/message_log.js';
import { popover } from '../../functions/popover.js';
import { loc } from '../../core/locale.js';
import { checkRequirements } from '../../space/check_requirements.js';
import { traits, races } from '../../core/registries.js';
import { buildFortress_s1, buildFortress_s2, buildFortress_s3 } from '../../sections/portal/build_fortress_parts.js';
import { SPIRE_CREEP_DIVISOR, SPIRE_CREEP_FLOOR } from '../../config/constants.js';
import { soulForgeSoldiers } from './soul_forge.js';

// Fungsi-fungsi dipindah dari portal.js (urutan sumber dipertahankan). portal.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function spireCreep(base){
    let creep = global.portal.hasOwnProperty('spire') && global.blood['spire'] ? base - ((global.portal.spire.count - 1) / SPIRE_CREEP_DIVISOR) : base;
    return creep >= SPIRE_CREEP_FLOOR ? creep : SPIRE_CREEP_FLOOR;
}

export function towerPrice(cost, wiki){
    let sup = hooks.hellSupression('gate', 0, wiki);
    return Math.round(cost / (sup.supress > 0.01 ? sup.supress : 0.01));
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
                    hooks.setAction(c_action,'portal',tech);
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
                let rating = hooks.armyRating(scale,'hellArmy',0) / scale;
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

