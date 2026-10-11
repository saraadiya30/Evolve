// jobName: nama tampil sebuah job. Modul daun (core/vars + locale), dipisah dari job_definitions.js.
import { global } from '../../core/vars.js';
import { loc } from '../../core/locale.js';

export function jobName(job){
    let name = global.civic[job]?.name || loc(`job_${job}`);
    return name;
}
