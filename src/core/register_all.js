// Registrasi eksplisit semua data game (actions, techs, races, events, dst).
//
// Registry (core/registries.js dan sejenisnya) diisi lewat fungsi registerX() yang dipanggil berurutan di sini, bukan lewat
// efek samping saat modul dimuat. Urutan pemanggilan menentukan hasil registrasi, jadi jangan diubah tanpa menjalankan
// `npm test`.
//
// Dipanggil dari awal main.js dan wiki/wiki.js. Aman dipanggil berulang.
import { registerOuterPlanets } from '../space/solar_system/outer_planets.js';
import { registerRegionActions } from '../actions/region_actions.js';
import { buildTechs } from '../tech/tech.js';
import { registerActions } from '../actions/actions.js';
import { registerAchievements } from '../achievements/achieve.js';
import { registerAsphodel, registerElysium, registerEdenic, registerGenePool, registerTruepath, registerPortal, registerSpace, registerCityActions, registerTechParts, registerGovernor, registerEvents, registerRaces, registerHooks } from './registrations.js';

let done = false;

export function registerAll(){
    if (done){
        return;
    }
    done = true;
    // Hook dulu: hanya menyimpan referensi fungsi, tapi registrasi lain (mis. region actions) sudah memanggil hooks.*.
    registerHooks();
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
