import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';

export function rName(r){
    let res = global.hasOwnProperty('resource') && global.resource.hasOwnProperty(r) ? global.resource[r].name : loc(`resource_${r}_name`);
    return `<span class="has-text-warning">${res}</span>`;
}
