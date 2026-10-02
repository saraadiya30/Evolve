// Registry objek besar (diisi oleh space.js). Dipisah supaya file bagian (part/region) bisa merujuk objek ini
// (mis. spaceProjects.xxx dari bagian lain) tanpa circular import ke space.js.
export const spaceProjects = {};
export const interstellarProjects = {};
export const galaxyProjects = {};
