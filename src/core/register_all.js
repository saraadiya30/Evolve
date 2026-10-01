// Registrasi eksplisit semua data game (actions, techs, races, events, dst).
//
// Dulu isi registry (core/registries.js dan sejenisnya) diisi lewat efek samping saat modul DIMUAT
// (Object.assign di tingkat atas). Akibatnya hasilnya bergantung pada urutan evaluasi import, dan circular import tidak
// bisa dipecah tanpa merusak game. Sekarang tiap modul hanya mengekspor fungsi registerX(); urutan pemanggilan ditetapkan
// di sini, SAMA dengan urutan runtime sebelumnya (jangan diubah tanpa menjalankan `npm test`).
//
// Dipanggil dari awal main.js dan wiki/wiki.js. Aman dipanggil berulang.
import { registerOuterPlanets } from '../space/solar_system/outer_planets.js';
import { registerRegionActions } from '../actions/region_actions.js';
import { buildTechs } from '../tech/tech.js';
import { registerActions } from '../actions/actions.js';
import { registerAchievements } from '../achievements/achieve.js';
import { registerAsphodel, registerElysium, registerEdenic, registerGenePool, registerTruepath, registerPortal, registerSpace, registerCityActions, registerTechParts, registerGovernor, registerEvents, registerRaces } from './registrations.js';

let done = false;

export function registerAll(){
    if (done){
        return;
    }
    done = true;
    registerAsphodel();
    registerElysium();
    registerEdenic();
    registerGenePool();
    registerTruepath();
    registerPortal();
    registerOuterPlanets();
    registerSpace();
    registerCityActions();
    registerTechParts();
    buildTechs();
    registerRegionActions();
    registerActions();
    registerGovernor();
    registerEvents();
    registerRaces();
    registerAchievements();
}
