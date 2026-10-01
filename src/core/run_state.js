// State ringan yang dipakai lintas-modul oleh loop game. Dulu diekspor dari main.js, yang membuat main.js dan loop saling
// mengimpor (circular). Modul ini tidak meng-import apa pun, jadi aman dipakai dari mana saja.

// true sampai fast loop pertama selesai (diset false oleh fast_loop_core lewat set_firstRun)
export let firstRun = true;
export function set_firstRun(v){ return firstRun = v; }

export let sythMap = {
    1: 1.1,
    2: 1.25,
    3: 1.5,
};
