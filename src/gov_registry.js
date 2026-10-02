// Registry objek besar (diisi oleh governor.js). Dipisah supaya file bagian (part/region) bisa merujuk objek ini
// (mis. gov_tasks.xxx dari bagian lain) tanpa circular import ke governor.js.
export const gov_tasks = {};
