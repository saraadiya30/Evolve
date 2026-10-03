// Registry objek besar (diisi oleh portal.js). Dipisah supaya file bagian (part/region) bisa merujuk objek ini
// (mis. fortressModules.xxx dari bagian lain) tanpa circular import ke portal.js.
export const fortressModules = {};
export const monsters = {};
