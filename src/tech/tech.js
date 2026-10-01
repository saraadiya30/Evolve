import { global } from '../core/vars.js';
import { drawTech } from '../actions/core/action_runner.js';
import { techsPart1, techsPart2, techsPart3, techsPart4, techsPart5, techsPart6, techsPart7, techsPart8 } from './logic/group_loaders.js';
import { techData } from './techs_data.js';
import { techs } from './tech_list.js';



export { swissKnife } from '../core/swiss_knife.js';



export function stabilize_blackhole(){
    if (global.interstellar['stellar_engine'] && global.interstellar.stellar_engine.exotic >= 0.025 && global.tech['whitehole']){
        if (techs.stabilize_blackhole.action()){
            global.tech['stablized'] = 1;
            drawTech();
        }
    }
}

// Registrasi eksplisit: dipanggil dari core/register_all.js (bukan lagi efek samping saat modul dimuat).
export function buildTechs(){
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
}
