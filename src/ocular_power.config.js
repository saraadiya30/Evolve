// Pure tunable constants for the "ocular_power" race trait's four abilities. Each of these was
// independently hardcoded in TWO places: once in the real effect calculation (civics.js for
// disintegration/wound, main.js for charm, races.js itself for telekinesis) and once again in
// the tooltip description popover (races.js, the `ocular${power}` popover block) -- the same
// "calc vs display drift" risk as the morale pet bonus.
export const OCULAR_POWER_DISINTEGRATION_BASE = 50; // army attack bonus base (civics.js, type 'attack')
export const OCULAR_POWER_WOUND_BASE = 60;          // hunting bonus base (civics.js, type 'hunting')
export const OCULAR_POWER_TELEKINESIS_BASE = 20;    // labor bonus base (races.js)
export const OCULAR_POWER_CHARM_BASE = 70;          // trade rate bonus base (main.js)
