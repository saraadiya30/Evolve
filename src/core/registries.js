// Semua objek registry besar game, dikumpulkan di satu tempat.
// Dipisah dari file logikanya supaya file bagian bisa saling merujuk objek ini tanpa circular import.
// ATURAN: file ini TIDAK boleh meng-import apa pun.

export const perkList = {};

export const actions = {};
export const actions_city = {};

export const genePool = {};

export const events = {};

export const gov_tasks = {};

export const edenElysium = {};
export const edenAsphodel = {};
export const edenicModules = {};

export const fortressModules = {};
export const monsters = {};

export const traits = {};
export const races = {};

export const spaceProjects = {};
export const interstellarProjects = {};
export const galaxyProjects = {};

export const outerTruth = {};
export const tauCetiModules = {};

export const techsPart1 = {};
export const techsPart2 = {};
export const techsPart3 = {};
export const techsPart4 = {};
export const techsPart5 = {};
export const techsPart6 = {};
export const techsPart7 = {};
export const techsPart8 = {};

// State lintas-modul yang dulu satu file kecil per area (tiap area punya objek terpisah).
export const S_functions = {};
export const S_loops = {};
export const S_truepath = {};
