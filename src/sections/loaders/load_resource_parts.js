import { global, sizeApproximation, keyMultiplier, tmp_vars } from '../../core/vars.js';
import { setResourceName } from '../../resources/special_resources_market_item_and_galaxy_trade.js';
import { craftingRatio } from '../../resources/resources.js';
import { resource_values } from '../../config/trade.js';
import { vBind, eventActive, popover } from '../../functions/functions.js';
import { drawModal } from '../../resources/market_storage_crates_and_containers.js';
import { craftCost } from '../../resources/resource_tabs_and_definitions.js';
import { breakdownPopover, craftingPopover } from '../../resources/crate_container_assignment_and_trade_prices.js';
import { loc } from '../../core/locale.js';

// Bagian dari loadResource (resource_tabs_and_definitions.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function loadResource_s1($ctx){
        $ctx.color = $ctx.color || 'info';
    if (!global.resource[$ctx.name]){
        global.resource[$ctx.name] = {};
    }

    setResourceName($ctx.name);

    if (global.race['artifical']){
        if ($ctx.name === 'Food'){
            $ctx.stackable = false;
        }
    }

    if ($ctx.wiki){ return {$rv: 0}; }

    if (!global.resource[$ctx.name].hasOwnProperty('display')){
        global.resource[$ctx.name]['display'] = false;
    }
    if (!global.resource[$ctx.name].hasOwnProperty('value')){
        global.resource[$ctx.name]['value'] = global.race['truepath'] ? resource_values[$ctx.name] * 2 : resource_values[$ctx.name];
    }
    if (!global.resource[$ctx.name].hasOwnProperty('amount')){
        global.resource[$ctx.name]['amount'] = 0;
    }
    if (!global.resource[$ctx.name].hasOwnProperty('max')){
        global.resource[$ctx.name]['max'] = $ctx.max;
    }
    if (!global.resource[$ctx.name].hasOwnProperty('diff')){
        global.resource[$ctx.name]['diff'] = 0;
    }
    if (!global.resource[$ctx.name].hasOwnProperty('delta')){
        global.resource[$ctx.name]['delta'] = 0;
    }
    if (!global.resource[$ctx.name].hasOwnProperty('rate')){
        global.resource[$ctx.name]['rate'] = $ctx.rate;
    }
    if (!global.settings.resBar.hasOwnProperty($ctx.name)){
        global.settings.resBar[$ctx.name] = true;
    }
    if (!global.resource[$ctx.name].hasOwnProperty('bar')){
        global.resource[$ctx.name]['bar'] = global.settings.resBar[$ctx.name];
    }

    if ($ctx.name === 'Mana'){
        global['resource'][$ctx.name]['gen'] = 0;
        global['resource'][$ctx.name]['gen_d'] = 0;
    }  

    global['resource'][$ctx.name]['stackable'] = $ctx.stackable;
    if (!global['resource'][$ctx.name]['crates']){
        global['resource'][$ctx.name]['crates'] = 0;
    }
    if (!global['resource'][$ctx.name]['containers']){
        global['resource'][$ctx.name]['containers'] = 0;
    }
    if (!global['resource'][$ctx.name]['trade'] && $ctx.tradable){
        global['resource'][$ctx.name]['trade'] = 0;
    }

    var res_container;
    if (global.resource[$ctx.name].max === -1 || global.resource[$ctx.name].max === -2){
        res_container = $(`<div id="res${$ctx.name}" class="resource crafted" v-show="display"><div><h3 class="res has-text-${$ctx.color}">{{ name | namespace }}</h3><span id="cnt${$ctx.name}" class="count">{{ amount | diffSize }}</span></div></div>`);
    }
    else {
        res_container = $(`<div id="res${$ctx.name}" class="resource${global.settings.resBar[$ctx.name] ? ` showBar` : ``}" v-show="display" :style="{ '--percent-full': (bar && max > 0 ? (amount/max)*100 : 0) + '%' }"><div><h3 class="res has-text-${$ctx.color} bar" @click="toggle('${$ctx.name}')">{{ name | namespace }}</h3><span id="cnt${$ctx.name}" class="count">{{ amount | size }} / {{ max | size }}</span></div></div>`);
    }

    if ($ctx.stackable){
        res_container.append($(`<span><span id="con${$ctx.name}" v-if="showTrigger()" class="interact has-text-success" @click="trigModal" role="button" aria-label="Open crate management for ${global.resource[$ctx.name].name}">+</span></span>`));
    }
    else if ($ctx.max !== -1 || ($ctx.max === -1 && $ctx.rate === 0 && global.race['no_craft']) || $ctx.name === 'Scarletite' || $ctx.name === 'Quantium'){
        res_container.append($('<span></span>'));
    }
    
    $ctx.infopops = false;
    if ($ctx.rate !== 0 || ($ctx.max === -1 && $ctx.rate === 0 && global.race['no_craft']) || $ctx.name === 'Scarletite' || $ctx.name === 'Quantium'){
        res_container.append($(`<span id="inc${$ctx.name}" class="diff" :aria-label="resRate('${$ctx.name}')">{{ diff | diffSize }} /s</span>`));
    }
    else if ($ctx.max === -1 && !global.race['no_craft'] && $ctx.name !== 'Scarletite' && $ctx.name !== 'Quantium'){
        let craft = $('<span class="craftable"></span>');
        res_container.append(craft);

        let inc = [1,5];
        for (let i=0; i<inc.length; i++){
            craft.append($(`<span id="inc${$ctx.name}${inc[i]}"><a @click="craft('${$ctx.name}',${inc[i]})" aria-label="craft ${inc[i]} ${global.resource[$ctx.name].name}" role="button">+<span class="craft" data-val="${inc[i]}">${inc[i]}</span></a></span>`));
        }
        craft.append($(`<span id="inc${$ctx.name}A"><a @click="craft('${$ctx.name}','A')" aria-label="craft max ${global.resource[$ctx.name].name}" role="button">+<span class="craft" data-val="${'A'}">A</span></a></span>`));
        $ctx.infopops = true;
    }
    else if(global.race['fasting'] && $ctx.name === global.race.species){
        res_container.append($(`<span id="inc${$ctx.name}" class="diff" :aria-label="resRate('${$ctx.name}')">{{ diff | diffSize }}</span>`));
    }
    else {
        res_container.append($(`<span></span>`));
    }
    
    $('#resources').append(res_container);

    var modal = {
            template: '<div id="modalBox" class="modalBox"></div>'
        };
    
    vBind({
        el: `#res${$ctx.name}`,
        data: global['resource'][$ctx.name], 
        filters: {
            size: function (value){
                return value ? sizeApproximation(value,0) : value;
            },
            diffSize: function (value){
                if ($ctx.name === 'Horseshoe' && !global.race['hooved'] && eventActive('fool',2023)){
                    value = 5;
                }
                return sizeApproximation(value,2);
            },
            namespace(val){
                return val.replace("_", " ");
            }
        },
        methods: {
            resRate(n){
                let diff = sizeApproximation(global.resource[n].diff,2);
                return `${global.resource[$ctx.name].name} ${diff} per second`;
            },
            trigModal(){
                this.$buefy.modal.open({
                    parent: this,
                    component: modal
                });
                
                var checkExist = setInterval(function(){
                   if ($('#modalBox').length > 0) {
                      clearInterval(checkExist);
                      drawModal($ctx.name,$ctx.color);
                   }
                }, 50);
            },
            showTrigger(){
                return global.resource.Crates.display;
            },
            craft(res,vol){
                if (!global.race['no_craft']){
                    let craft_bonus = craftingRatio(res,'manual').multiplier;
                    let craft_costs = craftCost(true);
                    let volume = Math.floor(global.resource[craft_costs[res][0].r].amount / craft_costs[res][0].a);
                    for (let i=1; i<craft_costs[res].length; i++){
                        let temp = Math.floor(global.resource[craft_costs[res][i].r].amount / craft_costs[res][i].a);
                        if (temp < volume){
                            volume = temp;
                        }
                    }
                    if (vol !== 'A'){
                        let total = vol * keyMultiplier();
                        if (total < volume){
                            volume = total;
                        }
                    }
                    for (let i=0; i<craft_costs[res].length; i++){
                        let num = volume * craft_costs[res][i].a;
                        global.resource[craft_costs[res][i].r].amount -= num;
                    }
                    global.resource[res].amount += volume * craft_bonus;
                }
            },
            craftCost(res,vol){
                let costs = '';
                let craft_costs = craftCost(true);
                for (let i=0; i<craft_costs[res].length; i++){
                    let num = vol * craft_costs[res][i].a * keyMultiplier();
                    costs = costs + `<div>${global.resource[craft_costs[res][i].r].name} ${num}</div>`;
                }
                return costs;
            },
            toggle(res){
                if (global.settings.resBar[res]){
                    global.settings.resBar[res] = false;
                    $(`#res${$ctx.name}`).removeClass('showBar');
                }
                else {
                    global.settings.resBar[res] = true;
                    $(`#res${$ctx.name}`).addClass('showBar');
                }
                global.resource[$ctx.name]['bar'] = global.settings.resBar[$ctx.name];
            }
        }
    });

    breakdownPopover(`cnt${$ctx.name}`,$ctx.name,'c');
}

export function loadResource_s2($ctx){
        if ($ctx.infopops){
        let inc = [1,5,'A'];
        for (let i=0; i<inc.length; i++){
            let extra = function(){
                let popper = $(`<div></div>`);
                let res = $ctx.name;
                let vol = inc[i];
                let bonus = +(craftingRatio(res,'manual').multiplier * 100).toFixed(0);
                popper.append($(`<div class="has-text-info">${loc('manual_crafting_hover_bonus',[bonus.toLocaleString(),global.resource[res].name])}</div>`));
                
                let craft_costs = craftCost(true);
                let crafts = $(`<div><span class="has-text-success">${loc('manual_crafting_hover_craft')} </span></div>`);
                let num_crafted = 0;
                if (typeof vol !== 'number'){
                    num_crafted = global.resource[craft_costs[res][0].r].amount / craft_costs[res][0].a;
                    if (craft_costs[res].length > 1){
                        for (let i=1; i<craft_costs[res].length; i++){
                            let curr_max = global.resource[craft_costs[res][i].r].amount / craft_costs[res][i].a;
                            if (curr_max < num_crafted){
                                num_crafted = curr_max;
                            }
                        }
                    }
                    crafts.append($(`<span class="has-text-advanced">${sizeApproximation((bonus / 100) * num_crafted,1)} ${global.resource[res].name}</span>`));
                }
                else {
                    num_crafted = keyMultiplier() * vol;
                    let total_crafted = sizeApproximation((bonus / 100) * num_crafted,1);
                    crafts.append($(`<span class="has-text-advanced"><span class="craft" data-val="${(sizeApproximation((bonus / 100) * vol))}">${total_crafted}</span> ${global.resource[res].name}</span>`));
                }
                let costs = $(`<div><span class="has-text-danger">${loc('manual_crafting_hover_use')} </span></div>`);
                for (let i=0; i<craft_costs[res].length; i++){
                    costs.append($(`<span class="craft-elm has-text-caution">${sizeApproximation(num_crafted * craft_costs[res][i].a,1)} ${global.resource[craft_costs[res][i].r].name}</span>`));
                    if (i + 1 < craft_costs[res].length){
                        costs.append($(`<span>, </span>`));
                    }
                }
                popper.append(crafts);
                popper.append(costs);
                
                return popper;
            }
            
            craftingPopover(`inc${$ctx.name}${inc[i]}`,$ctx.name,'manual',extra);
        }
    }

    if ($ctx.stackable){
        popover(`con${$ctx.name}`,function(){
            var popper = $(`<div>${loc('resource_Crates_plural')} ${global.resource[$ctx.name].crates}</div>`);
            if (global.tech['steel_container']){
                popper.append($(`<div>${loc('resource_Containers_plural')} ${global.resource[$ctx.name].containers}</div>`));
            }
            return popper;
        });
    }

    if (($ctx.name !== global.race.species || global.race['fasting']) && $ctx.name !== 'Crates' && $ctx.name !== 'Containers' && $ctx.max !== -1){
        breakdownPopover(`inc${$ctx.name}`,$ctx.name,'p');
    }
    else if ($ctx.max === -1){
        craftingPopover(`inc${$ctx.name}`,$ctx.name,'auto');
    }

    $(`#res${$ctx.name}`).on('mouseover',function(){
        $(`.res-${$ctx.name}`).each(function(){
            if (global.resource[$ctx.name].amount >= $(this).attr(`data-${$ctx.name}`)){
                $(this).addClass('hl-ca');
            }
            else {
                $(this).addClass('hl-cna');
            }
        });
    });
    $(`#res${$ctx.name}`).on('mouseout',function(){
        $(`.res-${$ctx.name}`).each(function(){
            $(this).removeClass('hl-ca');
            $(this).removeClass('hl-cna');
        });
    });

    if (typeof tmp_vars['resource'] === 'undefined'){
        tmp_vars['resource'] = {};
    }

    tmp_vars.resource[$ctx.name] = {
        color: $ctx.color,
        tradable: $ctx.tradable,
        stackable: $ctx.stackable,
        temp_max: 0
    };
}
