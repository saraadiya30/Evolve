// Registry objek besar untuk modul Edenic (menggabungkan eden_regions_registry.js dan edenic_modules_registry.js).
// Dipisah dari file pengisinya supaya file bagian (part/region) bisa merujuk objek ini tanpa circular import.
// edenElysium / edenAsphodel diisi oleh elysium.js / asphodel.js; edenicModules diisi oleh edenic.js.
export const edenElysium = {};
export const edenAsphodel = {};
export const edenicModules = {};
