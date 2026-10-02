// Registry objek besar (diisi oleh events.js). Dipisah supaya file bagian (part/region) bisa merujuk objek ini
// (mis. events.xxx dari bagian lain) tanpa circular import ke events.js.
export const events = {};
