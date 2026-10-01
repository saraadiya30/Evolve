import { global, keyMultiplier, p_on } from './vars.js';
import { clearElement, vBind, timeFormat, popover } from './functions.js';
import { loc } from './locale.js';
import { fortressData, soulForgeSoldiers, fortressDefenseRating } from './portal_f1.js';
import { jobScale } from './jobs.js';
import { mercCost, garrisonSize } from './civics.js';
import { drawHellObservations } from './portal_f6.js';

// Bagian dari buildFortress (portal_f1.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function buildFortress_s1($ctx){
        if (!global.settings.tabLoad){
        switch (global.settings.civTabs){
            case 1:
                if (global.settings.spaceTabs !== 4){
                    return {$rv: 0};
                }
                break;
            case 2:
                if (global.settings.govTabs !== 3){
                    return {$rv: 0};
                }
                break;
            default:
                return {$rv: 0};
        }
    }
    if (!global.tech['portal'] || global.tech['portal'] < 2){
        return {$rv: 0};
    }
    $ctx.id = $ctx.full ? 'fort' : 'gFort';
    let fort = $ctx.full ? $(`<div id="${$ctx.id}" class="fort"></div>`) : $('#gFort');
    if ($ctx.full){
        $ctx.parent.append(fort);
    }
    else {
        if (fort.length > 0){
            clearElement(fort);
        }
        else {
            fort = $(`<div id="${$ctx.id}" class="fort gFort"></div>`);
            $ctx.parent.append(fort);
        }
        fort.append(`<div><h3 class="has-text-warning">${loc('portal_fortress_name')}</h3><button class="button observe right" @click="observation">${loc('hell_observation_button')}</button></div>`);
    }
    

    let status = $('<div></div>');
    fort.append(status);

    let defense = $(`<span class="defense has-text-success" :aria-label="defense()">${loc('fortress_defense')} {{ f.garrison | defensive }}</span>`);
    status.append(defense);
    let activity = $(`<span class="has-text-danger pad hostiles" :aria-label="hostiles()">${loc('fortress_spotted')} {{ f.threat }}</span>`);
    status.append(activity);
    let threatLevel = $(`<span class="pad threatLevel" :class="threaten()" :aria-label="threatLevel()">{{ f.threat | threat }}</span>`);
    status.append(threatLevel);

    let wallStatus = $('<div></div>');
    fort.append(wallStatus);

    wallStatus.append($(`<span class="has-text-warning" :aria-label="defense()">${loc('fortress_wall')} <span :class="wall()">{{ f.walls }}%</span></span>`));

    let station = $(`<div></div>`);
    fort.append(station);
    
    station.append($(`<span>${loc('fortress_army')}</span>`));
    station.append($('<span role="button" aria-label="remove soldiers from the fortress" class="sub has-text-danger" @click="aLast"><span>&laquo;</span></span>'));
    station.append($('<span class="current armyLabel">{{ f.garrison | patrolling }}</span>'));
    station.append($('<span role="button" aria-label="add soldiers to the fortress" class="add has-text-success" @click="aNext"><span>&raquo;</span></span>'));
    
    station.append($(`<span>${loc('fortress_patrol')}</span>`));
    station.append($('<span role="button" aria-label="reduce number of patrols" class="sub has-text-danger" @click="patDec"><span>&laquo;</span></span>'));
    station.append($('<span class="current patLabel">{{ f.patrols }}</span>'));
    station.append($('<span role="button" aria-label="increase number of patrols" class="add has-text-success" @click="patInc"><span>&raquo;</span></span>'));

    station.append($(`<span>${loc('fortress_patrol_size')}</span>`));
    station.append($('<span role="button" aria-label="reduce size of each patrol" class="sub has-text-danger" @click="patSizeDec"><span>&laquo;</span></span>'));
    station.append($('<span class="current patSizeLabel">{{ f.patrol_size }}</span>'));
    station.append($('<span role="button" aria-label="increase size of each patrol" class="add has-text-success" @click="patSizeInc"><span>&raquo;</span></span>'));

    station.append($(`<span class="hireLabel"><button v-show="g.mercs" class="button merc" @click="hire" :aria-label="hireLabel()">${loc('civics_garrison_hire_mercenary')}</button></span>`));

    var bunks = $('<div class="bunks"></div>');
    station.append(bunks);
    bunks.append($(`<span class="has-text-warning">${loc('civics_garrison')}: </span>`));
    let soldier_title = global.tech['world_control'] && !global.race['truepath'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
    bunks.append($(`<span><span class="soldier">${soldier_title}</span> <span v-html="$options.filters.stationed(g.workers)"></span> / <span>{{ g.max | s_max }} | <span></span>`));
    bunks.append($(`<span v-show="g.crew > 0"><span class="crew">${loc('civics_garrison_crew')}</span> <span>{{ g.crew }} | </span></span>`));
    bunks.append($(`<span><span class="wounded">${loc('civics_garrison_wounded')}</span> <span>{{ g.wounded }}</span></span>`));

    let color = global.settings.theme === 'light' ? ` type="is-light"` : ` type="is-dark"`;
    let reports = $(`<div></div>`);
    station.append(reports);
    reports.append($(`<b-checkbox class="patrol" v-model="f.notify" true-value="Yes" false-value="No"${color}>${loc('fortress_patrol_reports')}</b-checkbox>`));
    reports.append($(`<b-checkbox class="patrol" v-model="f.s_ntfy" true-value="Yes" false-value="No"${color}>${loc('fortress_surv_reports')}</b-checkbox>`));
    reports.append($(`<b-checkbox class="patrol" v-model="f.nocrew"${color} v-show="s.showGalactic">${loc('fortress_nocrew')}</b-checkbox>`));

    if ($ctx.full){
        fort.append($(`<div class="training"><span>${loc('civics_garrison_training')} - ${loc('arpa_to_complete')} {{ g.rate, g.progress | trainTime }}</span><button class="button observe right" @click="observation">${loc('hell_observation_button')}</button> <progress class="progress" :value="g.progress" max="100">{{ g.progress }}%</progress></div>`));
    }
}

export function buildFortress_s2($ctx){
        vBind({
        el: `#${$ctx.id}`,
        data: {
            f: global.portal.fortress,
            g: global.civic.garrison,
            s: global.settings
        },
        methods: {
            defense(){
                return loc('fortress_defense');
            },
            hostiles(){
                return fortressData('hostiles');
            },
            threatLevel(){
                return fortressData('threatLevel');
            },
            aNext(){
                let inc = keyMultiplier();
                if (global.portal.fortress.garrison < global.civic.garrison.workers){
                    global.portal.fortress.garrison += inc;
                    if (global.portal.fortress.garrison > global.civic.garrison.workers){
                        global.portal.fortress.garrison = global.civic.garrison.workers;
                    }
                    global.portal.fortress['assigned'] = global.portal.fortress.garrison;
                    vBind({el: `#garrison`},'update');
                }
            },
            aLast(){
                let dec = keyMultiplier();
                let min = global.portal.fortress.patrols * global.portal.fortress.patrol_size;
                if (p_on['soul_forge'] && !global.race['warlord']){
                    min += soulForgeSoldiers();
                }
                if (global.portal.hasOwnProperty('guard_post')){
                    min += jobScale(global.portal.guard_post.on);
                }
                if (global.portal.fortress.garrison > min){
                    global.portal.fortress.garrison -= dec;
                    if (global.portal.fortress.garrison < min){
                        global.portal.fortress.garrison = min;
                    }
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                    global.portal.fortress['assigned'] = global.portal.fortress.garrison;
                    vBind({el: `#garrison`},'update');
                }
            },
            patInc(){
                let inc = keyMultiplier();
                if (global.portal.fortress.patrols * global.portal.fortress.patrol_size < global.portal.fortress.garrison){
                    global.portal.fortress.patrols += inc;
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                }
            },
            patDec(){
                let dec = keyMultiplier();
                if (global.portal.fortress.patrols > 0){
                    global.portal.fortress.patrols -= dec;
                    if (global.portal.fortress.patrols < 0){
                        global.portal.fortress.patrols = 0;
                    }
                }
            },
            patSizeInc(){
                let inc = keyMultiplier();
                if (global.portal.fortress.patrol_size < global.portal.fortress.garrison){
                    global.portal.fortress.patrol_size += inc;
                    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
                        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
                    }
                }
            },
            patSizeDec(){
                let dec = keyMultiplier();
                if (global.portal.fortress.patrol_size > 1){
                    global.portal.fortress.patrol_size -= dec;
                    if (global.portal.fortress.patrol_size < 1){
                        global.portal.fortress.patrol_size = 1;
                    }
                }
            },
            wall(){
                let val = global.portal.fortress.walls;
                if (val >= 75){
                    return "has-text-success";
                }
                else if (val <= 25){
                    return "has-text-danger";
                }
                else {
                    return "has-text-warning";
                }
            },
            threaten(){
                let val = global.portal.fortress.threat;
                if (val < 1000){
                    return "has-text-success";
                }
                else if (val >= 2000){
                    return "has-text-danger";
                }
                else {
                    return "has-text-warning";
                }
            },
            hire(){
                let repeats = keyMultiplier();
                let canBuy = true;
                while (canBuy && repeats > 0){
                    let cost = mercCost();
                    if (global.civic['garrison'].workers < global.civic['garrison'].max && global.resource.Money.amount >= cost){
                        global.resource.Money.amount -= cost;
                        global.civic['garrison'].workers++;
                        global.civic.garrison.m_use++;
                        global.portal.fortress.garrison++;
                        global.portal.fortress['assigned'] = global.portal.fortress.garrison;
                        vBind({el: `#garrison`},'update');
                    }
                    else {
                        canBuy = false;
                    }
                    repeats--;
                }
            },
            hireLabel(){
                return fortressData('hireLabel');
            },
            observation(){
                global.settings.civTabs = $(`#mainTabs > nav ul li`).length - 1;
                if (!global.settings.tabLoad){
                    drawHellObservations();
                }
            }
        },
        filters: {
            defensive(v){
                return fortressDefenseRating(v);
            },
            patrolling(v){
                let stationed =  v - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
                if (p_on['soul_forge']){
                    let forge = soulForgeSoldiers();
                    if (forge <= stationed){
                        stationed -= forge;
                    }
                }
                if (global.portal.hasOwnProperty('guard_post')){
                    stationed -= jobScale(global.portal.guard_post.on);
                }
                return stationed;
            },
            threat(t){
                if (t < 1000){
                    return loc('fortress_threat_level1');
                }
                else if (t < 1500){
                    return loc('fortress_threat_level2');
                }
                else if (t >= 5000){
                    return loc('fortress_threat_level6');
                }
                else if (t >= 3000){
                    return loc('fortress_threat_level5');
                }
                else if (t >= 2000){
                    return loc('fortress_threat_level4');
                }
                else {
                    return loc('fortress_threat_level3');
                }
            },
            trainTime(r,p){
                return r === 0 ? timeFormat(-1) : timeFormat((100 - p) / (r * 4));
            },
            stationed(){
                return garrisonSize();
            },
            s_max(v){
                return garrisonSize(true);
            }
        }
    });
}

export function buildFortress_s3($ctx){
        ['hostiles','threatLevel','armyLabel','patLabel','patSizeLabel','hireLabel'].forEach(function(k){
        popover(`hf${$ctx.id}${k}`, function(){
                switch(k){
                    case 'hostiles':
                        return fortressData('hostiles');
                    case 'threatLevel':
                        return fortressData('hostiles');
                    case 'armyLabel':
                        return loc('fortress_stationed');
                    case 'patLabel':
                        return loc('fortress_patrol_desc',[global.portal.fortress.patrols]);
                    case 'patSizeLabel':
                        return loc('fortress_patrol_size_desc',[global.portal.fortress.patrol_size]);
                    case 'hireLabel':
                        return fortressData('hireLabel');
                }
            },
            {
                elm: `#${$ctx.id} span.${k}`
            }
        );
    });
    popover(`hf${$ctx.id}observe`, function(){
            return loc('hell_observation_tooltip');
        },
        {
            elm: `#${$ctx.id} button.observe`
        }
    );
}
