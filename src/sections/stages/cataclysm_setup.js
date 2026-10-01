// Urutan lengkap setup awal skenario Cataclysm; dipanggil oleh cataclysm() di simulation_ai.js.
import { cataclysmTech } from './cataclysm_tech.js';
import { cataclysmSettings } from './cataclysm_settings.js';
import { cataclysmResources } from './cataclysm_resources.js';
import { cataclysmCivic } from './cataclysm_civic.js';
import { cataclysmCity } from './cataclysm_city.js';
import { cataclysmSpace } from './cataclysm_space.js';
import { cataclysmFinish } from './cataclysm_finish.js';

export function cataclysmSetup($ctx){
    cataclysmTech($ctx);
    cataclysmSettings($ctx);
    cataclysmResources($ctx);
    cataclysmCivic($ctx);
    cataclysmCity($ctx);
    cataclysmSpace($ctx);
    cataclysmFinish($ctx);
}
