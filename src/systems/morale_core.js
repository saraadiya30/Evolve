// Pure morale calculation functions. Like stocks_core.js, these functions contain no DOM/jQuery
// access -- they take explicit inputs and return a number, so they can be unit-tested outside
// the browser and called from both the real calc path and any tooltip/breakdown
// that needs the same number.
import { PET_BASE_BONUS, PET_EVENT_BONUS, PET_TYPE_BONUS } from '../config/constants.js';

// Morale bonus/penalty from owning a pet. `pet` is global.race.pet (or a falsy value if the
// player has no pet). This is the SINGLE authoritative formula: the morale calculation and the morale tooltip
// both call it, so they always show the same number.
export function petMorale(pet){
    if (!pet){
        return 0;
    }
    let bonus = PET_BASE_BONUS;
    if (pet.event > 0){
        bonus += PET_EVENT_BONUS;
    }
    if (pet.pet > 0){
        bonus += pet.type === 'cat' ? PET_TYPE_BONUS.cat : PET_TYPE_BONUS.other;
    }
    else if (pet.pet < 0){
        bonus -= pet.type === 'cat' ? PET_TYPE_BONUS.cat : PET_TYPE_BONUS.other;
    }
    return bonus;
}
