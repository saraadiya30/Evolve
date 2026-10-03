// Registry objek besar (diisi oleh arpa.js). Dipisah supaya file bagian (part/region) bisa merujuk objek ini
// (mis. genePool.xxx dari bagian lain) tanpa circular import ke arpa.js.
export const genePool = {};
