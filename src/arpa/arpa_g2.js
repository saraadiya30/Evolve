import { global, keyMultiplier, srSpeak, sizeApproximation } from '../core/vars.js';
import { clearElement, vBind, buildQueue, popover, clearPopper, removeFromQueue, messageQueue, arpaTimeCheck } from '../functions/functions.js';
import { loc } from '../core/locale.js';
import { updateQueueNames, drawTech } from '../actions/actions.js';
import { renderSpace } from '../space/space.js';
import { arpaProjects } from './arpa.js';
import { drawGenes, drawBlood, checkRequirements, arpaAdjustCosts, payArpaCosts, pick_monument, physics } from './arpa_g1.js';

// Fungsi-fungsi dipindah dari arpa.js (urutan sumber dipertahankan). arpa.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function crispr(){
    if ((global.tech['genetics'] && global.tech['genetics'] > 3) || global['sim']){
        clearElement($('#arpaCrispr'));
        $('#arpaCrispr').append(`<div class="has-text-warning">${loc('arpa_crispr_desc')}</div>`);
        $('#arpaCrispr').append('<div id="genes"></div>');
        drawGenes();
    }
}

export function blood(){
    if (global.tech['b_stone'] && global.tech['b_stone'] >= 2){
        clearElement($('#arpaBlood'));
        $('#arpaBlood').append(`<div class="has-text-warning">${loc('arpa_blood_desc')}</div>`);
        $('#arpaBlood').append('<div id="blood"></div>');
        drawBlood();
    }
}

export function addProject(parent,project){
    if (checkRequirements(project)){
        if (!global.arpa[project]){
            global.arpa[project] = {
                complete: 0,
                rank: 0
            };
        }
        if (arpaProjects[project]['rank'] && global.arpa[project].rank >= arpaProjects[project].rank){
            return;
        }
        let current = $(`<div id="arpa${project}" class="arpaProject"></div>`);
        parent.append(current);

        let title = typeof arpaProjects[project].title === 'string' ? arpaProjects[project].title : arpaProjects[project].title();
        let head = $(`<div class="head"><span class="desc has-text-warning" role="heading" aria-level="3">${title}</span><a v-on:click="srDescAndEffect" class="is-sr-only" role="button">{{ projectName() }} description</a><span aria-hidden="true" v-show="rank" class="rank">{{ rank | level }}</span><span class="is-sr-only">{{ rank | level }}</span></div>`);
        current.append(head);

        let progress = $(`<div class="pbar"><progress class="progress" :value="complete" max="100"></progress><span class="progress-value has-text-danger">{{ complete }}%</span></div>`);
        head.append(progress);

        let buy = $('<div class="buy"></div>');
        current.append(buy);

        buy.append($(`<button :aria-label="loc('queue') + ' ' + projectName()" class="button" @click="queue('${project}')">${loc('queue')}</button>`));
        buy.append($(`<button :aria-label="arpaProjectSRCosts('1','${project}')" class="button x1" @click="build('${project}',1)">1%</button>`));
        buy.append($(`<button :aria-label="arpaProjectSRCosts('10','${project}')" class="button x10" @click="build('${project}',10)">10%</button>`));
        buy.append($(`<button :aria-label="arpaProjectSRCosts('25','${project}')" class="button x25" @click="build('${project}',25)">25%</button>`));
        buy.append($(`<button :aria-label="arpaProjectSRCosts('100','${project}')" class="button x100" @click="build('${project}',100)">{{ complete | remain }}%</button>`));

        vBind({
            el: `#arpa${project}`,
            data: global.arpa[project],
            methods: {
                loc: loc,
                queue(pro){
                    if (global.tech['queue']){
                        let keyMult = keyMultiplier();
                        for (let i=0; i<keyMult; i++){
                            let arpaId = `arpa${pro}`;
                            let used = 0;
                            let buid_max = arpaProjects[pro]['queue_complete'] ? arpaProjects[pro].queue_complete() : Number.MAX_SAFE_INTEGER;
                            for (var j=0; j<global.queue.queue.length; j++){
                                used += Math.ceil(global.queue.queue[j].q / global.queue.queue[j].qs);
                                if (global.queue.queue[j].id === arpaId) {
                                    buid_max -= global.queue.queue[j].q;
                                }
                            }
                            if (used < global.queue.max && buid_max > 0){
                                if (global.settings.q_merge !== 'merge_never' && global.queue.queue.length > 0 && global.queue.queue[global.queue.queue.length-1].id === arpaId){
                                    global.queue.queue[global.queue.queue.length-1].q++;
                                }
                                else {
                                    let title = typeof arpaProjects[pro].title === 'string' ? arpaProjects[pro].title : arpaProjects[pro].title();
                                    global.queue.queue.push({ id: arpaId, action: 'arpa', type: pro, label: title, cna: false, time: 0, q: 1, qs: 1, t_max: 0 });
                                }
                                buildQueue();
                            }
                            else {
                                break;
                            }
                        }
                    }
                },
                build(pro,num){
                    buildArpa(pro,num,true);
                },
                srDescAndEffect(){
                    let desc = typeof arpaProjects[project].desc === 'string' ? arpaProjects[project].desc : arpaProjects[project].desc();
                    let effect = arpaProjects[project].effect();
                    return srSpeak(`${desc}\n${effect}`);
                },
                projectName() {
                    return typeof arpaProjects[project].title === 'string' ? arpaProjects[project].title : arpaProjects[project].title();
                },
                arpaProjectSRCosts(id,project){
                    let inc = id === '100' ? 100 - global.arpa[project].complete : id;
                    var cost = `Construct ${inc}%. Costs:`;
                    var costs = arpaAdjustCosts(arpaProjects[project].cost);
                    Object.keys(costs).forEach(function (res){
                        var res_cost = +(costs[res]() * (inc / 100)).toFixed(0);
                        if (res_cost > 0){
                            var label = res === 'Money' ? '$' : global.resource[res].name + ': ';
                            var afford = global.resource[res].amount >= res_cost ? '' : ` ${loc('insufficient')} ${global.resource[res].name}.`;
                            cost = cost + ` ${label} ${sizeApproximation(res_cost,2)}.${afford}`;
                        }
                    });
                    return cost;
                }
            },
            filters: {
                remain(val){
                    return 100 - val;
                },
                level(num){
                    return loc('arpa_level',[num]);
                }
            }
        });

        popover(`popArpa${project}`, function(){
                return arpaProjects[project].desc;
            },
            {
                elm: `#arpa${project} .head .desc`,
                classes: `has-background-light has-text-dark`
            }
        );

        popover(`popArpa${project}`, function(){
                return arpaProjects[project].effect();
            },
            {
                elm: `#arpa${project} .head .rank`,
                classes: `has-background-light has-text-dark`
            }
        );

        let classes = [1,10,25,100];
        for (let i=0; i<classes.length; i++){
            let id = classes[i];
            popover(`popArpa${project}${id}`, function(){
                    return arpaProjectCosts(id,project);
                },
                {
                    elm: `#arpa${project} .buy .x${id}`,
                    classes: `has-background-light has-text-dark`
                }
            );
        }
    }
}

export function buildArpa(pro,num,update,queue){
    let completed = false;
    if (num === 100){
        num = 100 - global.arpa[pro].complete;
    }
    for (let i=0; i<num; i++){
        if (payArpaCosts(arpaProjects[pro].cost)){
            global.arpa[pro].complete++;
            if (global.arpa[pro].complete >= 100){
                global.arpa[pro].rank++;
                global.arpa[pro].complete = 0;
                global.tech[arpaProjects[pro].grant] = global.arpa[pro].rank;
                completed = true;
                if (pro === 'monument'){
                    global.arpa['m_type'] = pick_monument();
                    $(`#arpa${pro} .head .desc`).html(arpaProjects[pro].title());
                    updateQueueNames(false, ['arpamonument']);
                }
                if (pro === 'roid_eject'){
                    $(`#arpa${pro} .head .desc`).html(arpaProjects[pro].title());
                    updateQueueNames(false, ['arparoid_eject']);
                }
                if (pro === 'launch_facility'){
                    global.settings.showSpace = true;
                    global.tech['space'] = 1;
                    clearPopper('popArpalaunch_facility');
                    [1,10,25,100].forEach(function(amount){
                        clearPopper(`popArpalaunch_facility${amount}`);
                    });
                    if (!queue){
                        removeFromQueue(['arpalaunch_facility']);
                    }
                    physics();
                    renderSpace();
                    messageQueue(loc('arpa_projects_launch_facility_msg'),'info',false,['progress']);
                }
                if (global.race['inflation']){
                    global.race.inflation += 10;
                }
                drawTech();
            }
        }
    }
    if (update){
        let amounts = [1,10,25,100];
        let popper = $('#popper');
        let pid = popper.data('id');
        for (let i=0; i<amounts.length; i++){
            if (pid === `popArpa${pro}${amounts[i]}`){
                clearElement(popper);
                popper.append(arpaProjectCosts(amounts[i],pro));
                break;
            }
        }
    }
    return completed;
}

export function arpaProjectCosts(id,project){
    let inc = id === 100 ? 100 - global.arpa[project].complete : id;
    var cost = $('<div></div>');
    var costs = arpaAdjustCosts(arpaProjects[project].cost);
    let tc = arpaTimeCheck(arpaProjects[project], inc / 100, false, true);

    Object.keys(costs).forEach(function (res){
        var res_cost = +(costs[res]() * (inc / 100)).toFixed(0);
        if (res_cost > 0){
            var label = res === 'Money' ? '$' : global.resource[res].name + ': ';
            var color = global.resource[res].amount >= res_cost ? 'has-text-dark' : ( res === tc.r ? 'has-text-danger' : 'has-text-alert');
            cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${sizeApproximation(res_cost,2)}</div>`));
        }
    });
    return cost;
}

export function updateTrades() {
    Object.keys(global.resource).forEach(function (res){
        vBind({el: `#market-${res}`},'update');
    });
    vBind({el: `#galaxyTrade`},'update');
}
