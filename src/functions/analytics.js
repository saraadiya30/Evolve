import { tagDebug } from '../config/constants.js';

export function tagEvent(event, data){
    try {
        data['debug_mode'] = tagDebug;
        gtag('event', event, data);
    } catch (err){}
}
