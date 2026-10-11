// Penutup skenario Cataclysm: garnisun awal lalu gambar ulang kota, tech, ruang angkasa, ARPA, dan foundry. Dulu bagian dari cataclysm_s1/_s2 (pecahan mekanis).
import { global } from '../../core/vars.js';
import { loadFoundry } from '../../civics/jobs/foundry_panel.js';
import { hooks } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { renderSpace } from '../../space/space_requirements.js';

export function cataclysmFinish($ctx){
        global.civic['garrison'] = {
            display: true,
            disabled: false,
            progress: 0,
            tactic: 0,
            workers: 2,
            wounded: 0,
            raid: 0,
            max: 2
        };

        hooks.drawCity();
        drawTech();
        renderSpace();
        hooks.arpa('Physics');
        loadFoundry();
}
