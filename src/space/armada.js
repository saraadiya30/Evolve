// armada: panel armada gateway. Dipisah dari planet_generation.js supaya space_requirements tidak menyeretnya.
import { global, keyMultiplier } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { vBind } from '../functions/dom_helpers.js';
import { garrisonSize } from '../civics/military/garrison.js';
import { popover } from '../functions/popover.js';
import { hooks, galaxyProjects } from '../core/registries.js';
import { gatewayArmada } from './space.js';

export function armada(parent,id){
    if (global.tech['piracy'] && !global.race['truepath']){

        let header = $(`<div id="h${id}" class="armHead"><h3 class="has-text-warning">${loc('galaxy_armada')}</h3></div>`);
        parent.append(header);

        let soldier_title = global.tech['world_control'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-caution"><span class="soldier">${soldier_title}</span> <span>{{ g.workers | stationed }} / {{ g.max | s_max }}</span></span>`));
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-caution"><span class="crew1">${loc('job_crew_mil')}</span> <span>{{ g.crew }}</span></span>`));
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-success"><span class="crew2">${loc('job_crew_civ')}</span> <span>{{ c.workers }} / {{ c.max }}</span></span>`));

        vBind({
            el: `#h${id}`,
            data: {
                g: global.civic.garrison,
                c: global.civic.crew,
            },
            filters: {
                stationed(v){
                    return garrisonSize();
                },
                s_max(v){
                    return garrisonSize(true);
                }
            }
        });

        ['soldier','crew1','crew2'].forEach(function(k){
            popover(`h${id}${k}`, function(){
                    switch(k){
                        case 'soldier':
                            return hooks.describeSoldier();
                        case 'crew1':
                            return loc('civics_garrison_crew_desc');
                        case 'crew2':
                            return loc('job_crew_desc');
                    }
                },
                {
                    elm: `#h${id} span.${k}`
                }
            );
        });

        let fleet = $(`<div id="${id}" class="fleet"></div>`);
        parent.append(fleet);

        let cols = [];
        // One column per ship type plus an extra column for labels
        for (let i = 0; i < gatewayArmada.length + 1; i++){
            let col = $(`<div class="area"></div>`);
            cols.push(col);
            fleet.append(col);
        }

        cols[0].append($(`<span></span>`));
        cols[0].append($(`<span id="armadagateway" class="has-text-danger">${galaxyProjects.gxy_gateway.info.name}</span>`));

        for (let i = 0; i < gatewayArmada.length; i++){
            const ship = gatewayArmada[i];
            if (global.galaxy.hasOwnProperty(ship)){
                cols[i+1].append($(`<span id="armada${ship}" class="ship has-text-advanced">${galaxyProjects.gxy_gateway[ship].title}</span>`));
                cols[i+1].append($(`<span class="ship">{{ gateway.${ship} }}</span>`));
            }
        }

        Object.keys(global.galaxy.defense).forEach(function (area){
            let r = area.substring(4);
            if (global.settings.space[r] && r !== 'gateway'){

                let region = $(`<span id="armada${r}" class="has-text-caution">${typeof galaxyProjects[area].info.name === 'string' ? galaxyProjects[area].info.name : galaxyProjects[area].info.name()}</span>`);
                cols[0].append(region);

                for (let i = 0; i < gatewayArmada.length; i++){
                    const ship = gatewayArmada[i];
                    if (global.galaxy.hasOwnProperty(ship)){
                        let shipSpan = $(`<span class="ship"></span>`);
                        let sub = $(`<span role="button" aria-label="remove ${ship}" class="sub has-text-danger" @click="sub('${area}','${ship}')"><span>&laquo;</span></span>`);
                        let count = $(`<span class="current">{{ ${r}.${ship} }}</span>`);
                        let add = $(`<span role="button" aria-label="add ${ship}" class="add has-text-success" @click="add('${area}','${ship}')"><span>&raquo;</span></span>`);
                        cols[i+1].append(shipSpan);
                        shipSpan.append(sub);
                        shipSpan.append(count);
                        shipSpan.append(add);
                    }
                }

            }
        });

        vBind({
            el: `#${id}`,
            data: {
                stargate: global.galaxy.defense.gxy_stargate,
                gateway: global.galaxy.defense.gxy_gateway,
                gorddon: global.galaxy.defense.gxy_gorddon,
                alien1: global.galaxy.defense.gxy_alien1,
                alien2: global.galaxy.defense.gxy_alien2,
                chthonian: global.galaxy.defense.gxy_chthonian,
                t: global.tech
            },
            methods: {
                sub(area,ship){
                    if (global.galaxy.defense[area][ship] > 0){
                        let ship_change = keyMultiplier();
                        if (ship_change > global.galaxy.defense[area][ship]) {
                            ship_change = global.galaxy.defense[area][ship];
                        }
                        global.galaxy.defense.gxy_gateway[ship] += ship_change;
                        global.galaxy.defense[area][ship] -= ship_change;
                    }
                },
                add(area,ship){
                    if (global.galaxy.defense.gxy_gateway[ship] > 0){
                        let ship_change = keyMultiplier();
                        if (ship_change > global.galaxy.defense.gxy_gateway[ship]) {
                            ship_change = global.galaxy.defense.gxy_gateway[ship];
                        }
                        global.galaxy.defense.gxy_gateway[ship] -= ship_change;
                        global.galaxy.defense[area][ship] += ship_change;
                    }
                }
            }
        });

        Object.keys(global.galaxy.defense).forEach(function (area){
            let r = area.substring(4);
            if (global.settings.space[r]){
                popover(`armada${r}`,function(){
                    return `<div>${typeof galaxyProjects[area].info.desc === 'string' ? galaxyProjects[area].info.desc : galaxyProjects[area].info.desc()}</div>`;
                });
            }
        });

        for (let i = 0; i < gatewayArmada.length; i++){
            const ship = gatewayArmada[i];
            if (global.galaxy.hasOwnProperty(ship)){
                popover(`armada${ship}`,function(obj){
                    hooks.actionDesc(obj.popper, galaxyProjects.gxy_gateway[ship], global.galaxy[ship]);
                    return undefined;
                });
            }
        }
    }
}
