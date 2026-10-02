import { clearSpyopDrag, gmen, govActive, genGovernor, defineGovernor, gov_traits, dragSpyopList } from './governor.js';
import { loc } from './locale.js';
import { global } from './vars.js';
import { gov_tasks } from './gov_registry.js';
import { govTitle } from './civics.js';
import { vBind, tagEvent, calcQueueMax, calcRQueueMax, popover } from './functions.js';
import { updateQueueNames, drawCity, drawTech } from './actions.js';

// Bagian dari drawnGovernOffice (governor.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function drawnGovernOffice_s1($ctx){
        clearSpyopDrag();
    let govern = $(`<div id="govOffice" class="govOffice"></div>`);
    $('#r_govern1').append(govern);

    let govHeader = $(`<div class="head"></div>`);
    govern.append(govHeader);

    let governorTitle = $(`<div></div>`);
    governorTitle.append($(`<div class="has-text-caution" role="heading" aria-level="2">${loc(`governor_office`,[global.race.governor.g.n])}</div>`));
    governorTitle.append($(`<div><span class="has-text-warning">${loc(`governor_background`)}:</span> <span class="bg">${gmen[global.race.governor.g.bg].name}</span></div>`));

    govHeader.append(governorTitle);
    govHeader.append($(`<div class="fire"><b-button v-on:click="fire" v-html="fireText()">${loc(`governor_fire`)}</b-button></div>`));

    let cnt = [0,1,2];
    if (global.genes['governor'] && global.genes.governor >= 2){
        cnt.push(cnt.length);
        if (govActive('organizer',0)){ cnt.push(cnt.length); }
    }
    if (govActive('organizer',0)){ cnt.push(cnt.length); }
    cnt.forEach(function(num){
        let options = `<b-dropdown-item v-on:click="setTask('none',${num})">{{ 'none' | label }}</b-dropdown-item>`;
        Object.keys(gov_tasks).forEach(function(task){
            if (gov_tasks[task].req()){
                options += `<b-dropdown-item v-show="activeTask('${task}')" v-on:click="setTask('${task}',${num})">{{ '${task}' | label }}</b-dropdown-item>`;
            }
        });

        govern.append(`<div class="govTask"><span>${loc(`gov_task`,[num+1])}</span><b-dropdown hoverable>
            <button class="button is-primary" slot="trigger">
                <span>{{ t.t${num} | label }}</span>
                <i class="fas fa-sort-down"></i>
            </button>
            ${options}
        </b-dropdown></div>`);
    });

    if (!global.race.governor.hasOwnProperty('config')){
        global.race.governor['config'] = {};
    }

    $ctx.options = $(`<div class="options"><div>`);
    govern.append($ctx.options);

    //Configs
    { // Crate/Container Construction
        if (!global.race.governor.config.hasOwnProperty('storage')){
            global.race.governor.config['storage'] = {
                crt: 1000,
                cnt: 1000
            };
        }

        let storeContain = $(`<div class="tConfig" v-show="showTask('storage')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_storage`)}</div></div>`);
        $ctx.options.append(storeContain);
        let storage = $(`<div class="storage"></div>`);
        storeContain.append(storage);

        let crt_mat = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Plywood';
        let cnt_mat = 'Steel';

        storage.append($(`<b-field>${loc(`gov_task_storage_reserve`,[global.resource[crt_mat].name])}<b-numberinput min="0" :max="Number.MAX_SAFE_INTEGER" v-model="c.storage.crt" :controls="false"></b-numberinput></b-field>`));
        storage.append($(`<b-field>${loc(`gov_task_storage_reserve`,[global.resource[cnt_mat].name])}<b-numberinput min="0" :max="Number.MAX_SAFE_INTEGER" v-model="c.storage.cnt" :controls="false"></b-numberinput></b-field>`));
    }

    { // Crate/Container Management
        if (!global.race.governor.config.hasOwnProperty('bal_storage')){
            global.race.governor.config['bal_storage'] = {};
        }
        if (!global.race.governor.config.bal_storage.hasOwnProperty('adv')){
            global.race.governor.config.bal_storage['adv'] = false;
        }

        let storeContain = $(`<div class="tConfig" v-show="showTask('bal_storage')"><div class="hRow"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_bal_storage`)}</div><div class="chk"><b-checkbox v-model="c.bal_storage.adv">${loc(`advanced`)}</b-checkbox></div></div></div>`);
        $ctx.options.append(storeContain);
        let storage = $(`<div class="bal_storage"></div>`);
        storeContain.append(storage);

        Object.keys(global.resource).forEach(function(res){
            if (global.resource[res].stackable){
                if (!global.race.governor.config.bal_storage.hasOwnProperty(res)){
                    global.race.governor.config.bal_storage[res] = "2";
                }

                storage.append($(`<div class="ccmOption" :class="bStrEx()" v-show="showStrRes('${res}')"><span role="heading" aria-level="4">${global.resource[res].name}</span>
                <b-field>
                    <b-radio-button class="b1" v-show="c.bal_storage.adv" v-model="c.bal_storage.${res}" native-value="0" type="is-danger is-light">0x</b-radio-button>
                    <b-radio-button class="b2" v-show="c.bal_storage.adv" v-model="c.bal_storage.${res}" native-value="1" type="is-danger is-light">1/2</b-radio-button>
                    <b-radio-button class="b3" v-model="c.bal_storage.${res}" native-value="2" type="is-danger is-light">1x</b-radio-button>
                    <b-radio-button class="b4" v-model="c.bal_storage.${res}" native-value="4" type="is-danger is-light">2x</b-radio-button>
                    <b-radio-button class="b5" v-model="c.bal_storage.${res}" native-value="6" type="is-danger is-light">3x</b-radio-button>
                    <b-radio-button class="b6" v-show="c.bal_storage.adv" v-model="c.bal_storage.${res}" native-value="8" type="is-danger is-light">4x</b-radio-button>
                </b-field>
                </div>`));
            }
            else if (global.race.governor.config.bal_storage.hasOwnProperty(res)){
                delete global.race.governor.config.bal_storage[res];
            }
        });
    }

    { // Mercenary Recruitment
        if (!global.race.governor.config.hasOwnProperty('merc')){
            global.race.governor.config['merc'] = {
                buffer: 1,
                reserve: 100
            };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('merc')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_merc`)}</div></div>`);
        $ctx.options.append(contain);
        let merc = $(`<div class="storage"></div>`);
        contain.append(merc);

        merc.append($(`<b-field>${loc(`gov_task_merc_buffer`)}<b-numberinput min="0" :max="Number.MAX_SAFE_INTEGER" v-model="c.merc.buffer" :controls="false"></b-numberinput></b-field>`));
        merc.append($(`<b-field>${loc(`gov_task_merc_reserve`)}<b-numberinput min="0" :max="100" v-model="c.merc.reserve" :controls="false"></b-numberinput></b-field>`));
    }

    { // Spy Recruitment
        if (!global.race.governor.config.hasOwnProperty('spy')){
            global.race.governor.config['spy'] = {
                reserve: 100
            };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('spy')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_spy`)}</div></div>`);
        $ctx.options.append(contain);
        let spy = $(`<div class="storage"></div>`);
        contain.append(spy);

        spy.append($(`<b-field>${loc(`gov_task_merc_reserve`)}<b-numberinput min="0" :max="100" v-model="c.spy.reserve" :controls="false"></b-numberinput></b-field>`));
    }

    { // Spy Operator
        if (!global.race.governor.config.hasOwnProperty('spyop')){
            global.race.governor.config['spyop'] = {};
            Object.keys(global.civic.foreign).forEach(function (gov){
                global.race.governor.config.spyop[gov] = gov === 'gov3' ? ['influence','sabotage'] : ['sabotage','incite','influence'];
            });
        }
        
        let contain = $(`<div class="tConfig" v-show="showTask('spyop')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_spyop`)}</div></div>`);
        $ctx.options.append(contain);
        Object.keys(global.civic.foreign).forEach(function (gov){
            if ((gov.substr(3,1) < 3 && !global.tech['world_control']) || (gov === 'gov3' && global.tech['rival'])){
                let spyop = $(`<div></div>`);
                contain.append(spyop);
                spyop.append(`
                    <h2 class="has-text-caution" aria-level="4">${loc('gov_task_spyop_priority',[govTitle(gov.substring(3))])}</h2>
                    <ul id="spyopConfig${gov}" class="spyopConfig"></ul>
                `);
                let missions = $(`#spyopConfig${gov}`);
                global.race.governor.config.spyop[gov].forEach(function (mission){
                    missions.append(`
                        <li>${loc('civics_spy_' + mission)}</li>
                    `);
                });
            }
        });
    }

    { // Tax-Morale Balance
        if (!global.race.governor.config.hasOwnProperty('tax')){
            global.race.governor.config['tax'] = {
                min: 20
            };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('tax')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_tax`)}</div></div>`);
        $ctx.options.append(contain);
        let tax = $(`<div class="storage"></div>`);
        contain.append(tax);

        tax.append($(`<b-field>${loc(`gov_task_tax_min`)}<b-numberinput min="0" :max="20" v-model="c.tax.min" :controls="false"></b-numberinput></b-field>`));
    }

    { // Slave Replenishment
        if (!global.race.governor.config.hasOwnProperty('slave')){
            global.race.governor.config['slave'] = {
                reserve: 100
            };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('slave')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_slave`,[global.resource.Slave.name])}</div></div>`);
        $ctx.options.append(contain);
        let slave = $(`<div class="storage"></div>`);
        contain.append(slave);

        slave.append($(`<b-field>${loc(`gov_task_merc_reserve`)}<b-numberinput min="0" :max="100" v-model="c.slave.reserve" :controls="false"></b-numberinput></b-field>`));
    }

    { // Mass Ejector Optimizer
        if (!global.race.governor.config.hasOwnProperty('trash')){
            global.race.governor.config['trash'] = {};
        }
        ['Infernite','Elerium','Copper','Iron'].forEach(function(res){
            if (!global.race.governor.config.trash.hasOwnProperty(res) || typeof global.race.governor.config.trash[res] !== 'object' || global.race.governor.config.trash[res] === null){
                global.race.governor.config.trash[res] = { v: 0, s: true };
            }
        });
        if (!global.race.governor.config.trash.hasOwnProperty('stab')){
            global.race.governor.config.trash['stab'] = false;
        }

        let advanced = global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 ? `<div class="chk"><b-checkbox v-model="c.trash.stab">${loc(`gov_task_auto_stabilize`)}</b-checkbox></div>` : ``;

        let contain = $(`<div class="tConfig" v-show="showTask('trash')"><div class="hRow"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_trash`)}</div>${advanced}</div></div>`);
        $ctx.options.append(contain);
        let trash = $(`<div class="storage"></div>`);
        contain.append(trash);

        ['Infernite','Elerium','Copper','Iron'].forEach(function(res){
            trash.append($(`<b-field class="trash"><div class="trashButton" role="button" @click="trashStrat('${res}')" v-html="$options.methods.trashLabel('${res}')"></div><b-numberinput min="0" :max="1000000" v-model="c.trash.${res}.v" :controls="false"></b-numberinput></b-field>`));
        });
    }
}

export function drawnGovernOffice_s2($ctx){
        { // Replicator
        if (!global.race.governor.config.hasOwnProperty('replicate')){
            global.race.governor.config['replicate'] = {};
        }
        if (!global.race.governor.config.replicate.hasOwnProperty('pow')){
            global.race.governor.config.replicate['pow'] = { on: false, cap: 10000, buffer: 0 };
        }
        if (!global.race.governor.config.replicate.hasOwnProperty('res')){
            global.race.governor.config.replicate['res'] = { que: true, neg: true, cap: true };
        }

        let contain = $(`<div class="tConfig" v-show="showTask('replicate')"><div class="has-text-warning" role="heading" aria-level="3">${loc(`gov_task_replicate`)}</div></div>`);
        $ctx.options.append(contain);
        let replicate = $(`<div class="storage"></div>`);
        contain.append(replicate);

        replicate.append($(`<div class="chk"><b-checkbox v-model="c.replicate.pow.on">${loc(`gov_task_replicate_auto`)}</b-checkbox></div>`));
        replicate.append($(`<b-field>${loc(`gov_task_replicate_pmax`)}<b-numberinput min="0" v-model="c.replicate.pow.cap" :controls="false"></b-numberinput></b-field>`));
        replicate.append($(`<b-field>${loc(`gov_task_replicate_buff`)}<b-numberinput min="0" v-model="c.replicate.pow.buffer" :controls="false"></b-numberinput></b-field>`));

        let res_bal = $(`<div class="storage"></div>`);
        contain.append(res_bal);

        res_bal.append($(`<div class="chk"><b-checkbox v-model="c.replicate.res.que">${loc(`gov_task_replicate_que`)}</b-checkbox></div>`));
        res_bal.append($(`<div class="chk"><b-checkbox v-model="c.replicate.res.neg">${loc(`gov_task_replicate_neg`)}</b-checkbox></div>`));
        res_bal.append($(`<div class="chk"><b-checkbox v-model="c.replicate.res.cap">${loc(`gov_task_replicate_cap`)}</b-checkbox></div>`));
    }

    vBind({
        el: '#govOffice',
        data: { 
            t: global.race.governor.tasks,
            c: global.race.governor.config,
            r: global.resource
        },
        methods: {
            setTask(t,n){
                global.race.governor.tasks[`t${n}`] = t;
                if (t === 'combo_storage'){
                    Object.keys(global.race.governor.tasks).forEach(function(ts){
                        if (global.race.governor.tasks[ts] === 'storage' || global.race.governor.tasks[ts] === 'bal_storage'){
                            global.race.governor.tasks[ts] = 'none';
                        }
                    });
                }
                else if (t === 'storage' || t === 'bal_storage'){
                    Object.keys(global.race.governor.tasks).forEach(function(ts){
                        if (global.race.governor.tasks[ts] === 'combo_storage'){
                            global.race.governor.tasks[ts] = 'none';
                        }
                    });
                }
                if (t === 'combo_spy'){
                    Object.keys(global.race.governor.tasks).forEach(function(ts){
                        if (global.race.governor.tasks[ts] === 'spy' || global.race.governor.tasks[ts] === 'spyop'){
                            global.race.governor.tasks[ts] = 'none';
                        }
                    });
                }
                else if (t === 'spy' || t === 'spyop'){
                    Object.keys(global.race.governor.tasks).forEach(function(ts){
                        if (global.race.governor.tasks[ts] === 'combo_spy'){
                            global.race.governor.tasks[ts] = 'none';
                        }
                    });
                }
                tagEvent('govtask',{
                    'task': t
                });
                vBind({el: `#race`},'update');
            },
            showTask(t){
                return Object.values(global.race.governor.tasks).includes(t) 
                || (Object.values(global.race.governor.tasks).includes('combo_storage') && ['storage','bal_storage'].includes(t))
                || (Object.values(global.race.governor.tasks).includes('combo_spy') && ['spy','spyop'].includes(t));
            },
            activeTask(t){
                let activeTasks = [];
                if (global.race.hasOwnProperty('governor')){
                    Object.keys(global.race.governor.tasks).forEach(function(ts){
                        if (global.race.governor.tasks[ts] !== 'none'){
                            activeTasks.push(global.race.governor.tasks[ts]);
                        }
                    });
                }
                return !activeTasks.includes(t);
            },
            showStrRes(r){
                return global.resource[r].display;
            },
            bStrEx(){
                return global.race.governor.config.bal_storage.adv ? 'm' : '';
            },
            fire(){
                let inc = global.race.governor.hasOwnProperty('f') ? global.race.governor.f : 0;
                let cost = ((10 + inc) ** 2) - 50;
                let res = global.race.universe === 'antimatter' ? 'AntiPlasmid' : 'Plasmid';
                if (global.prestige[res].count >= cost){
                    global.prestige[res].count -= cost;
                    global.race.governor['candidates'] = genGovernor(10);
                    if (global.race.governor.hasOwnProperty('f')){
                        global.race.governor.f++;
                    }
                    else {
                        global.race.governor['f'] = 1;
                    }
                    delete global.race.governor.g;
                    delete global.race.governor.tasks;
                    updateQueueNames(true, ['city-amphitheatre', 'city-apartment']);
                    drawCity();
                    drawTech();
                    calcQueueMax();
                    calcRQueueMax();
                    defineGovernor();
                }
            },
            fireText(){
                let inc = global.race.governor.hasOwnProperty('f') ? global.race.governor.f : 0;
                let cost = ((10 + inc) ** 2) - 50;
                return `<div>${loc(`governor_fire`)}</div><div>${cost} ${loc(global.race.universe === 'antimatter' ? `resource_AntiPlasmid_plural_name` : `resource_Plasmid_plural_name`)}</div>`
            },
            trashStrat(r){
                global.race.governor.config.trash[r].s = global.race.governor.config.trash[r].s ? false : true;
            },
            trashLabel(r){
                return loc(global.race.governor.config.trash[r].s ? `gov_task_trash_max` : `gov_task_trash_min`,[global.resource[r].name]);
            }
        },
        filters: {
            label(t){
                return gov_tasks[t] ? (typeof gov_tasks[t].name === 'string' ? gov_tasks[t].name : gov_tasks[t].name()) : loc(`gov_task_${t}`);
            }
        }
    });

    popover(`govOffice`, function(){
        let desc = '';
        Object.keys(gmen[global.race.governor.g.bg].traits).forEach(function (t){
            desc += (gov_traits[t].hasOwnProperty('effect') ? gov_traits[t].effect() : '') + ' ';
        });
        return desc;
    },
    {
        elm: `#govOffice .bg`,
    });
    
    Object.keys(global.civic.foreign).forEach(function (gov){
        dragSpyopList(gov);
    });
}
