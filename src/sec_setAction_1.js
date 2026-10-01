import { checkTechQualifications, checkPowerRequirements } from './actions_f3.js';
import { global, srSpeak, keyMultiplier, callback_queue } from './vars.js';
import { removeAction, checkAffordable, templeCount, actionDesc } from './actions_f6.js';
import { adjustCosts, vBind, easterEgg, trickOrTreat, popover } from './functions.js';
import { loc } from './locale.js';
import { runAction } from './actions_f4.js';
import { srDesc } from './actions_f5.js';
import { drawModal } from './actions_f7.js';

// Bagian dari setAction (actions_f4.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function setAction_s1($ctx){
        if (checkTechQualifications($ctx.c_action,$ctx.type) === false) {
        return {$rv: 0};
    }
    let tab = $ctx.action;
    if ($ctx.action === 'outerSol'){
        $ctx.action = 'space';
    }
    if ($ctx.c_action['region']){
        $ctx.action = $ctx.c_action.region;
    }
    if ($ctx.c_action['powered'] && !global[$ctx.action][$ctx.type]['on']){
        global[$ctx.action][$ctx.type]['on'] = 0;
    }
    $ctx.id = $ctx.c_action.id;
    removeAction($ctx.id);

    let reqs = ``;
    if ($ctx.prediction && $ctx.c_action && $ctx.c_action.reqs){
        Object.keys($ctx.c_action.reqs).forEach(function(req){
            if ($ctx.prediction[req]){
                reqs += ` data-req-${req}="${$ctx.prediction[req].a}"`;
            }
        });
    }

    let parent = $ctx.c_action['highlight'] && $ctx.c_action.highlight() ? $(`<div id="${$ctx.id}" class="action hl"${reqs}></div>`) : $(`<div id="${$ctx.id}" class="action"${reqs}></div>`);
    if (!checkAffordable($ctx.c_action,false,(['genes','blood'].includes($ctx.action)))){
        parent.addClass('cna');
    }
    if (!checkAffordable($ctx.c_action,true,(['genes','blood'].includes($ctx.action)))){
        parent.addClass('cnam');
    }
    let element;
    if ($ctx.old){
        element = $('<span class="oldTech is-dark"><span class="aTitle">{{ title }}</span></span>');
    }
    else {
        let cst = '';
        let data = '';
        if ($ctx.c_action['cost']){
            let costs = $ctx.action !== 'genes' && $ctx.action !== 'blood' ? adjustCosts($ctx.c_action) : $ctx.c_action.cost;
            Object.keys(costs).forEach(function (res){
                let cost = costs[res]();
                if (cost > 0){
                    cst = cst + ` res-${res}`;
                    data = data + ` data-${res}="${cost}"`;
                }
            });
        }
        let clss = ``;
        if ($ctx.c_action['class']){
            clss = typeof $ctx.c_action['class'] === 'function' ? ` ${$ctx.c_action.class()}`: ` ${$ctx.c_action['class']}`;
        }
        if ($ctx.prediction){ clss = ' precog'; }
        else if ($ctx.c_action['aura'] && $ctx.c_action.aura()){ clss = ` ${$ctx.c_action.aura()}`; }
        let active = $ctx.c_action['highlight'] ? ($ctx.c_action.highlight() ? `<span class="is-sr-only">${loc('active')}</span>` : `<span class="is-sr-only">${loc('not_active')}</span>`) : '';
        element = $(`<a class="button is-dark${cst}${clss}"${data} v-on:click="action" role="link"><span class="aTitle" v-html="$options.filters.title(title)"></span>${active}</a><a role="button" v-on:click="describe" class="is-sr-only">{{ title }} description</a>`);
    }
    parent.append(element);

    if ($ctx.c_action.hasOwnProperty('special') && ((typeof $ctx.c_action['special'] === 'function' && $ctx.c_action.special()) || $ctx.c_action['special'] === true) ){
        let special = $(`<div class="special" role="button" v-bind:title="title | options" @click="trigModal"><svg version="1.1" x="0px" y="0px" width="12px" height="12px" viewBox="340 140 280 279.416" enable-background="new 340 140 280 279.416" xml:space="preserve">
            <path class="gear" d="M620,305.666v-51.333l-31.5-5.25c-2.333-8.75-5.833-16.917-9.917-23.917L597.25,199.5l-36.167-36.75l-26.25,18.083
                c-7.583-4.083-15.75-7.583-23.916-9.917L505.667,140h-51.334l-5.25,31.5c-8.75,2.333-16.333,5.833-23.916,9.916L399.5,163.333
                L362.75,199.5l18.667,25.666c-4.083,7.584-7.583,15.75-9.917,24.5l-31.5,4.667v51.333l31.5,5.25
                c2.333,8.75,5.833,16.334,9.917,23.917l-18.667,26.25l36.167,36.167l26.25-18.667c7.583,4.083,15.75,7.583,24.5,9.917l5.25,30.916
                h51.333l5.25-31.5c8.167-2.333,16.333-5.833,23.917-9.916l26.25,18.666l36.166-36.166l-18.666-26.25
                c4.083-7.584,7.583-15.167,9.916-23.917L620,305.666z M480,333.666c-29.75,0-53.667-23.916-53.667-53.666s24.5-53.667,53.667-53.667
                S533.667,250.25,533.667,280S509.75,333.666,480,333.666z"/>
            </svg></div>`);
        parent.append(special);
    }
    if ($ctx.c_action['on'] || $ctx.c_action['off']){
        if ($ctx.c_action['on']){
            let powerOn = $(`<span class="on" title="ON" v-html="$options.filters.val('on')"></span>`);
            parent.append(powerOn);
        }
        if ($ctx.c_action['off']){
            let powerOff = $(`<span class="off" title="OFF" v-html="$options.filters.val('off')"></span>`);
            parent.append(powerOff);
        }
    }
    else {
        let switchable = $ctx.c_action['switchable'] ? $ctx.c_action.switchable() : ($ctx.c_action['powered'] && global.tech['high_tech'] && global.tech['high_tech'] >= 2 && checkPowerRequirements($ctx.c_action));
        if (switchable){
            let powerOn = $(`<span role="button" :aria-label="on_label()" class="on" @click="power_on" title="ON" v-html="$options.filters.p_on(act.on,'${$ctx.c_action.id}')"></span>`);
            let powerOff = $(`<span role="button" :aria-label="off_label()" class="off" @click="power_off" title="OFF" v-html="$options.filters.p_off(act.on,'${$ctx.c_action.id}')"></span>`);
            parent.append(powerOn);
            parent.append(powerOff);
        }
    }
    if ($ctx.c_action['count']){
        let count = $ctx.c_action.count();
        if (count > 0 && ($ctx.id !== 'city-gift' || count > 1)){
            element.append($(`<span class="count">${count}</span>`));
        }
    }
    else if ($ctx.action !== 'tech' && global[$ctx.action] && global[$ctx.action][$ctx.type] && global[$ctx.action][$ctx.type].count >= 0){
        element.append($(`<span class="count" v-html="$options.filters.count(act.count,'${$ctx.type}')"></span>`));
    }
    else if ($ctx.action === 'blood' && global[$ctx.action] && global[$ctx.action][$ctx.c_action.grant[0]] && global[$ctx.action][$ctx.c_action.grant[0]] > 0 && $ctx.c_action.grant[1] === '*'){
        element.append($(`<span class="count"> ${global[$ctx.action][$ctx.c_action.grant[0]]} </span>`));
    }
    if ($ctx.action !== 'tech' && global[$ctx.action] && global[$ctx.action][$ctx.type] && typeof(global[$ctx.action][$ctx.type]['repair']) !== 'undefined'){
        element.append($(`<div class="repair"><progress class="progress" :value="repair()" :max="repairMax()"></progress></div>`));
    }
    if ($ctx.old){
        $('#oldTech').append(parent);
    }
    else {
        $('#'+tab).append(parent);
    }
    if ($ctx.action !== 'tech' && global[$ctx.action] && global[$ctx.action][$ctx.type] && global[$ctx.action][$ctx.type].count === 0){
        $(`#${$ctx.id} .count`).css('display','none');
        $(`#${$ctx.id} .special`).css('display','none');
        $(`#${$ctx.id} .on`).css('display','none');
        $(`#${$ctx.id} .off`).css('display','none');
    }

    if ($ctx.c_action['emblem']){
        let emblem = $ctx.c_action.emblem();
        parent.append($(emblem));
    }

    $ctx.modal = {
        template: '<div id="modalBox" class="modalBox"></div>'
    };
}

export function setAction_s2($ctx){
        vBind({
        el: '#'+$ctx.id,
        data: {
            title: typeof $ctx.c_action.title === 'string' ? $ctx.c_action.title : $ctx.c_action.title(),
            act: global[$ctx.action][$ctx.type]
        },
        methods: {
            action(args){
                if ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/ && global.settings.touch) ? true : false){
                    return;
                }
                else {
                    runAction($ctx.c_action,$ctx.action,$ctx.type);
                }
            },
            describe(){
                srSpeak(srDesc($ctx.c_action,$ctx.old));
            },
            trigModal(){
                if ($ctx.c_action['sAction'] && typeof $ctx.c_action['sAction'] === 'function'){
                    $ctx.c_action.sAction()
                }
                else {
                    this.$buefy.modal.open({
                        parent: this,
                        component: $ctx.modal
                    });

                    let checkExist = setInterval(function(){
                        if ($('#modalBox').length > 0) {
                            clearInterval(checkExist);
                            drawModal($ctx.c_action,$ctx.type);
                        }
                    }, 50);
                }
            },
            on_label(){
                return `on: ${global[$ctx.action][$ctx.type].on}`;
            },
            off_label(){
                return `off: ${global[$ctx.action][$ctx.type].count - global[$ctx.action][$ctx.type].on}`;
            },
            power_on(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[$ctx.action][$ctx.type].on < global[$ctx.action][$ctx.type].count){
                        global[$ctx.action][$ctx.type].on++;
                    }
                    else {
                        break;
                    }
                }
                if ($ctx.c_action['postPower']){
                    callback_queue.set([$ctx.c_action, 'postPower'], [true]);
                }
            },
            power_off(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[$ctx.action][$ctx.type].on > 0){
                        global[$ctx.action][$ctx.type].on--;
                    }
                    else {
                        break;
                    }
                }
                if ($ctx.c_action['postPower']){
                    callback_queue.set([$ctx.c_action, 'postPower'], [false]);
                }
            },
            repair(){
                return global[$ctx.action][$ctx.type].repair;
            },
            repairMax(){
                return $ctx.c_action.repair();
            }
        },
        filters: {
            val(v){
                switch(v){
                    case 'on':
                        return $ctx.c_action.on();
                    case 'off':
                        return $ctx.c_action.off();
                }
            },
            p_off(p,id){
                let value = global[$ctx.action][$ctx.type].count - p;
                if (
                    (id === 'city-casino' && !global.race['cataclysm'] && !global.race['orbit_decayed']) || 
                    (id === 'space-spc_casino' && (global.race['cataclysm'] || global.race['orbit_decayed'])) || 
                    (id === 'tauceti-tauceti_casino' && global.tech['isolation']) ||
                    (id === 'portal-hell_casino' && global.race['warlord'])
                ){
                    let egg = easterEgg(5,12);
                    if (value === 0 && egg.length > 0){
                        return egg;
                    }
                }
                return value;
            },
            p_on(p,id){
                if (
                    (id === 'city-biolab' && !global.race['cataclysm'] && !global.race['orbit_decayed']) || 
                    ((global.race['cataclysm'] || global.race['orbit_decayed']) && id === 'space-exotic_lab') ||
                    (global.tech['isolation'] && id === 'tauceti-infectious_disease_lab') ||
                    (global.race['warlord'] && id === 'portal-twisted_lab')
                ){
                    let egg = easterEgg(12,12);
                    if (p === 0 && egg.length > 0){
                        return egg;
                    }
                }
                else if (id === 'city-garrison' || id === 'space-space_barracks' || id === 'portal-brute'){
                    let trick = trickOrTreat(1,14,true);
                    let num = id === 'city-garrison' || id === 'portal-brute' ? 13 : 0;
                    if (p === num && trick.length > 0){
                        return trick;
                    }
                }
                return p;
            },
            title(t){
                return t;
            },
            options(t){
                return loc(`action_options`,[t]);
            },
            count(v,t){
                if (['temple','ziggurat'].includes(t)){
                    return templeCount(t === 'temple' ? false : true);
                }
                return v;
            }
        }
    });

    popover($ctx.id,function(){ return undefined; },{
        in: function(obj){
            actionDesc(obj.popper,$ctx.c_action,global[$ctx.action][$ctx.type],$ctx.old,$ctx.action,$ctx.type);
        },
        out: function(){
            vBind({el: `#popTimer`},'destroy');
        },
        attach: $ctx.action === 'starDock' ? 'body .modal' : '#main',
        wide: $ctx.c_action['wide'],
        classes: $ctx.c_action.hasOwnProperty('class') ? $ctx.c_action.class : false,
    });
}
