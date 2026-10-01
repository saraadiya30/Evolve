// shipCosts / TPShipDesc: biaya dan deskripsi desain kapal.
import { global, sizeApproximation } from '../core/vars.js';
import { shipCostsCalc } from '../systems/ship_core.js';
import { loc } from '../core/locale.js';
import { timeCheck, timeFormat } from '../functions/time_format.js';
import { vBind } from '../functions/dom_helpers.js';

export function shipCosts(bp){
    let typeCount = 0;
    global.space.shipyard.ships.forEach(function(ship){
        if (ship.class === bp.class){
            typeCount++;
        }
    });
    return shipCostsCalc(bp, typeCount);
}

export function TPShipDesc(parent,obj){
    let ship = obj.type;
    let raw = shipCosts(ship);
    let costs = {};
    Object.keys(raw).forEach(function(res){
        costs[res] = function(){ return raw[res]; }
    });

    let desc = $(`<div class="shipPopper"></div>`);
    let shipPattern = $(`<div class="divider">${loc(`outer_shipyard_class_${ship.class}`)} | ${loc(`outer_shipyard_engine_${ship.engine}`)} | ${loc(`outer_shipyard_weapon_${ship.weapon}`)} | ${loc(`outer_shipyard_power_${ship.power}`)} | ${loc(`outer_shipyard_sensor_${ship.sensor}`)}</div>`);
    parent.append(desc);

    desc.append(shipPattern);

    let cost = $('<div class="costList"></div>');
    desc.append(cost);

    let tc = timeCheck({ id: ship.name , cost: costs, doNotAdjustCost: true }, false, true);
    Object.keys(costs).forEach(function (res){
        if (costs[res]() > 0){
            let label = res === 'Money' ? '$' : global.resource[res].name + ': ';
            let color = global.resource[res].amount >= costs[res]() ? 'has-text-dark' : ( res === tc.r ? 'has-text-danger' : 'has-text-alert');
            cost.append($(`<div class="${color}" data-${res}="${costs[res]()}">${label}${sizeApproximation(costs[res](),2)}</div>`));
        }
    });

    if (tc && tc['t']){
        desc.append($(`<div class="divider"></div><div id="popTimer" class="flair has-text-advanced">{{ t | timer }}</div>`));
        vBind({
            el: '#popTimer',
            data: tc,
            filters: {
                timer(t){
                    return loc('action_ready',[timeFormat(t)]);
                }
            }
        });
    }
    
    return desc;
}
