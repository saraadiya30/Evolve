// Ketersediaan aksi: loop aksi kota, tech, dan seluruh lokasi luar angkasa (portal, tau ceti, galaksi, eden). Dulu bagian dari midLoop_s6.
import { elementById } from '../../functions/dom_helpers.js';
import { global } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { checkAffordable } from '../../actions/core/action_costs.js';
import { timeCheck, timeFormat } from '../../functions/time_format.js';

export function midLoopActionAvailability($ctx){
        let cityList = Object.keys(global.city);
        if (global.race['hooved']){
            cityList.push('horseshoe');
        }
        if (global.tech['slaves'] && global.tech['slaves'] >= 2){
            cityList.push('slave_market');
        }
        cityList.forEach(function (action){
            if (actions.city[action] && actions.city[action].cost){
                let c_action = actions.city[action];
                let element = elementById(c_action.id);
                if (element.length > 0){
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                        if (checkAffordable(c_action)){
                            if (element.hasClass('cna')){
                                element.removeClass('cna');
                            }
                        }
                        else if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                    else {
                        if (!element.hasClass('cnam')){
                            element.addClass('cnam');
                        }
                        if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                }
                if (global.city[action]){
                    let tc = timeCheck(c_action,false,true);
                    global.city[action]['time'] = timeFormat(tc.t);
                    global.city[action]['bn'] = tc.r;
                }
            }
        });

        Object.keys(actions.tech).forEach(function (action){
            if (actions.tech[action] && actions.tech[action].cost){
                let c_action = actions.tech[action];
                let element = elementById(c_action.id);
                if (element.length > 0){
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                        if (checkAffordable(c_action)){
                            if (element.hasClass('cna')){
                                element.removeClass('cna');
                            }
                        }
                        else if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                    else {
                        if (!element.hasClass('cnam')){
                            element.addClass('cnam');
                        }
                        if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                }
            }
        });

        let spc_locations = ['space','interstellar','galaxy','portal','tauceti','eden'];
        for (let i=0; i<spc_locations.length; i++){
            let location = spc_locations[i];
            Object.keys(actions[location]).forEach(function (region){
                Object.keys(actions[location][region]).forEach(function (action){
                    let s_region = actions[location][region][action] && actions[location][region][action].hasOwnProperty('region') ? actions[location][region][action].region : location;
                    if ((global[s_region][action] || actions[location][region][action].grant) && actions[location][region][action] && actions[location][region][action].cost){
                        let c_action = actions[location][region][action];
                        let element = elementById(c_action.id);
                        if (element.length > 0){
                            if (checkAffordable(c_action,true)){
                                if (element.hasClass('cnam')){
                                    element.removeClass('cnam');
                                }
                                if (checkAffordable(c_action)){
                                    if (element.hasClass('cna')){
                                        element.removeClass('cna');
                                    }
                                }
                                else if (!element.hasClass('cna')){
                                    element.addClass('cna');
                                }
                            }
                            else {
                                if (!element.hasClass('cnam')){
                                    element.addClass('cnam');
                                }
                                if (!element.hasClass('cna')){
                                    element.addClass('cna');
                                }
                            }
                        }
                        if (global[s_region][action]){
                            global[s_region][action]['time'] = timeFormat(timeCheck(c_action));
                        }
                    }
                });
            });
        }
}
