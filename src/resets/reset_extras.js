// Isi: trackWomling(), grandDeathTour()
import { unlockAchieve, unlockFeat } from '../achievements/achievement_logic.js';
import { alevel } from '../achievements/achievement_helpers.js';
import { universeAffix } from '../functions/universe_utils.js';
import { global } from '../core/vars.js';

// Fungsi-fungsi dipindah dari resets.js (urutan sumber dipertahankan). resets.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function trackWomling(){
    let uni = universeAffix();
    if (global.race['womling_friend']){
        if (uni !== 'm'){
            global.stats.womling.friend.l++;
        }
        if (uni !== 'l'){
            if (!global.stats.womling.friend.hasOwnProperty(uni)){
                global.stats.womling.friend[uni] = 0;
            }
            global.stats.womling.friend[uni]++;
        }
    }
    else if (global.race['womling_lord']){
        if (uni !== 'm'){
            global.stats.womling.lord.l++;
        }
        if (uni !== 'l'){
            if (!global.stats.womling.lord.hasOwnProperty(uni)){
                global.stats.womling.lord[uni] = 0;
            }
            global.stats.womling.lord[uni]++;
        }
    }
    else if (global.race['womling_god']){
        if (uni !== 'm'){
            global.stats.womling.god.l++;
        }
        if (uni !== 'l'){
            if (!global.stats.womling.god.hasOwnProperty(uni)){
                global.stats.womling.god[uni] = 0;
            }
            global.stats.womling.god[uni]++;
        }
    }

    if (global.stats.womling.friend.l > 0 && global.stats.womling.lord.l > 0 && global.stats.womling.god.l > 0){
        unlockAchieve('overlord',uni === 'm' ? true : false,alevel(),'l');
    }
    if (global.stats.womling.friend[uni] > 0 && global.stats.womling.lord[uni] > 0 && global.stats.womling.god[uni] > 0){
        unlockAchieve('overlord',uni === 'm' ? true : false,alevel(),uni);
    }
}

export function grandDeathTour(type){
    if (global.race.species === 'ultra_sludge'){
        let rank = alevel();
        let uni = universeAffix();

        if (global.stats.death_tour[type][uni] < rank){
            global.stats.death_tour[type][uni] = rank;
        }

        let gdt_rank = 5;
        Object.keys(global.stats.death_tour).forEach(function(k){
            let universe = 0;
            Object.keys(global.stats.death_tour[k]).forEach(function(u){
                if (u !== 'm' && global.stats.death_tour[k][u] > universe){
                    universe = global.stats.death_tour[k][u];
                }
            });
            if (gdt_rank > universe){
                gdt_rank = universe;
            }
        });

        if (gdt_rank > 0){
            unlockFeat('grand_death_tour',false,gdt_rank);
        }
    }
}
