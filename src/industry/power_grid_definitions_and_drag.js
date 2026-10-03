import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { planetName } from '../space/space.js';
import { races } from '../races/races.js';
import { setPowerGrid } from './rituals_mining_and_replicator_panels.js';

// Fungsi-fungsi dipindah dari industry.js (urutan sumber dipertahankan). industry.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function gridDefs(){
    return {
        power: { l: global.power, n: loc(`power`), s: true, r: false, rs: false },
        moon: { l: global.support.moon, n: loc(`space_moon_info_name`), s: global.settings.space.moon, r: 'space', rs: 'moon_base' },
        red: { l: global.support.red, n: planetName().red, s: global.settings.space.red, r: 'space', rs: 'spaceport'  },
        belt: { l: global.support.belt, n: loc(`space_belt_info_name`), s: global.settings.space.belt, r: 'space', rs: 'space_station'  },
        alpha: { l: global.support.alpha, n: loc(`interstellar_alpha_name`), s: global.settings.space.alpha, r: 'interstellar', rs: 'starport'  },
        nebula: { l: global.support.nebula, n: loc(`interstellar_nebula_name`), s: global.settings.space.nebula, r: 'interstellar', rs: 'nexus'  },
        gateway: { l: global.support.gateway, n: loc(`galaxy_gateway`), s: global.settings.space.gateway, r: 'galaxy', rs: 'starbase'  },
        alien2: { l: global.support.alien2, n: loc('galaxy_alien',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]), s: global.settings.space.alien2, r: 'galaxy', rs: 'foothold'  },
        lake: { l: global.support.lake, n: loc(`portal_lake_name`), s: global.settings.portal.lake, r: 'portal', rs: 'harbor'  },
        spire: { l: global.support.spire, n: loc(`portal_spire_name`), s: global.settings.portal.spire, r: 'portal', rs: 'purifier'  },
        titan: { l: global.support.titan, n: planetName().titan, s: global.settings.space.titan, r: 'space', rs: 'electrolysis'  },
        enceladus: { l: global.support.enceladus, n: planetName().enceladus, s: global.settings.space.enceladus, r: 'space', rs: 'titan_spaceport'  },
        eris: { l: global.support.eris, n: planetName().eris, s: global.settings.space.eris, r: 'space', rs: 'drone_control'  },
        tau_home: { l: global.support.tau_home, n: loc(`tau_planet`,[races[global.race.species].home]), s: global.settings.tau.home, r: 'tauceti', rs: 'orbital_station'  },
        tau_red: { l: global.support.tau_red, n: loc(`tau_planet`,[planetName().red]), s: global.settings.tau.red, r: 'tauceti', rs: 'orbital_platform'  },
        tau_roid: { l: global.support.tau_roid, n: loc(`tau_roid_title`), s: global.settings.tau.roid, r: 'tauceti', rs: 'patrol_ship'  },
        asphodel: { l: global.support.asphodel, n: loc(`eden_asphodel_name`), s: global.settings.eden.asphodel, r: 'eden', rs: 'encampment' },
    };
}

export function clearGrids(grids){
    grids = grids || gridDefs();
    Object.keys(grids).forEach(function(grid_type){
        let el = $(`#grid${grid_type}`)[0];
        if (el){
            let sort = Sortable.get(el);
            if (sort){
                sort.destroy();
            }
        }
    });
}

export function dragPowerGrid(grid_type){
    let el = $(`#grid${grid_type}`)[0];
    let grids = gridDefs();
    Sortable.create(el,{
        onEnd(e){
            let order = grids[grid_type].l;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            grids[grid_type].l = order;
            setPowerGrid();
        }
    });
}
