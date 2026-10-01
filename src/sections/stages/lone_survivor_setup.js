// Urutan lengkap setup awal skenario Lone Survivor; didaftarkan sebagai hooks.loneSurvivorSetup.
import { loneSurvivorTech } from './lone_survivor_tech.js';
import { loneSurvivorSettings } from './lone_survivor_settings.js';
import { loneSurvivorResources } from './lone_survivor_resources.js';
import { loneSurvivorCivic } from './lone_survivor_civic.js';
import { loneSurvivorCity } from './lone_survivor_city.js';
import { loneSurvivorSpace } from './lone_survivor_space.js';
import { loneSurvivorTauCeti } from './lone_survivor_tauceti.js';
import { loneSurvivorFinish } from './lone_survivor_finish.js';

export function loneSurvivorSetup($ctx){
    loneSurvivorTech($ctx);
    loneSurvivorSettings($ctx);
    loneSurvivorResources($ctx);
    loneSurvivorCivic($ctx);
    loneSurvivorCity($ctx);
    loneSurvivorSpace($ctx);
    loneSurvivorTauCeti($ctx);
    loneSurvivorFinish($ctx);
}
