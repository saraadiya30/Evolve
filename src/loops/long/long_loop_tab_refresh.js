// Refresh grid power di tab saat tab civic/government dibuka.
import { global } from '../../core/vars.js';
import { gridDefs } from '../../industry/grid_defs.js';
import { gridEnabled } from '../../industry/industry_panels.js';
import { convertSpaceSector } from '../../space/space_requirements.js';
import { actions, hooks } from '../../core/registries.js';

export function longLoopTabRefresh($ctx){
        if (global.settings.tabLoad || (global.settings.civTabs === 2 && global.settings.govTabs === 2)){
            let grids = gridDefs();
            let updatePowerGrid = false;
            Object.keys(grids).forEach(function(grid){
                grids[grid].l.forEach(function(struct){
                    let parts = struct.split(":");
                    let space = convertSpaceSector(parts[0]);
                    let region = parts[0] === 'city' ? parts[0] : space;
                    let c_action = parts[0] === 'city' ? actions.city[parts[1]] : actions[space][parts[0]][parts[1]];
                    let breaker = $(`#pg${c_action.id}${grid}`);

                    if (grids[grid].s && (breaker.length === 0 || (gridEnabled(c_action,region,parts[0],parts[1]) && breaker.hasClass('inactive')))){
                        updatePowerGrid = true;
                    }
                });
            });
            if (updatePowerGrid){
                hooks.setPowerGrid();
            }
        }
}
