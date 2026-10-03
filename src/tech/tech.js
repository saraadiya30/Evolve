import { global } from '../core/vars.js';
import { drawTech } from '../actions/actions.js';
import { techsPart1 } from './logic/club_to_elysis_process/group_loader.js';
import { techsPart2 } from './logic/smelting_to_tourism/group_loader.js';
import { techsPart3 } from './logic/xeno_tourism_to_breeder_reactor/group_loader.js';
import { techsPart4 } from './logic/mine_conveyor_to_cement/group_loader.js';
import { techsPart5 } from './logic/rebar_to_infusion_confirm/group_loader.js';
import { techsPart6 } from './logic/stabilize_blackhole_to_protocol66a/group_loader.js';
import { techsPart7 } from './logic/terraforming_tp_to_outer_tau_survey/group_loader.js';
import { techsPart8 } from './logic/alien_research_to_ultimate_corruption/group_loader.js';
import { techData } from './techs_data.js';

// Logika/teks dinamis dari semua bagian, urutan entri dipertahankan.
const techLogic = Object.assign({},
    techsPart1,
    techsPart2,
    techsPart3,
    techsPart4,
    techsPart5,
    techsPart6,
    techsPart7,
    techsPart8
);

// Gabungkan data statis (techs_data.js) dengan logika per entri. Key harus persis sama di kedua sisi.
const techs = {};
Object.keys(techLogic).forEach(function(key){
    if (!techData.hasOwnProperty(key)){
        throw new Error(`techs_data.js tidak punya entri untuk tech '${key}'`);
    }
    techs[key] = Object.assign({}, techData[key], techLogic[key]);
});
Object.keys(techData).forEach(function(key){
    if (!techLogic.hasOwnProperty(key)){
        throw new Error(`techs_data.js punya entri '${key}' yang tidak ada logikanya`);
    }
});


export { swissKnife } from '../core/swiss_knife.js';

export const techPath = {
    standard: ['primitive', 'discovery', 'civilized', 'industrialized', 'globalized', 'early_space', 'deep_space', 'interstellar', 'intergalactic', 'dimensional','existential'],
    truepath: ['primitive', 'discovery', 'civilized', 'industrialized', 'globalized', 'early_space', 'deep_space', 'solar', 'tauceti'],
};

export function techList(path){
    if (path){
        let techList = {};
        Object.keys(techs).forEach(function(t){
            if (techPath[path].includes(techs[t].era) || techs[t].hasOwnProperty('path')){
                if (!techs[t].hasOwnProperty('path') || (techs[t].hasOwnProperty('path') && techs[t].path.includes(path))){
                    techList[t] = techs[t];
                }
            }
        });
        return techList;
    }
    return techs;
}

export function stabilize_blackhole(){
    if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025 && global.tech['whitehole']){
        if (techs.stabilize_blackhole.action()){
            global.tech['stablized'] = 1;
            drawTech();
        }
    }
}
