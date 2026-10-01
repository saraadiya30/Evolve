// jobName: nama tampil sebuah job.
import { global } from '../../core/vars.js';
import { loc } from '../../core/locale.js';

export function jobName(job){
    let name = global.civic[job]?.name || loc(`job_${job}`);
    return name;
}
