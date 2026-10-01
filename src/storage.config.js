// Pure storage/capacity-related tunable constants. Like stocks_core.js and morale.config.js,
// this file must NOT import anything, so any module can pull from it without creating circular
// imports.

// The "blackhole" achievement's storage bonus (+5% per achievement level) was independently
// hardcoded as the literal 0.05 in SEVEN separate places across FOUR files:
//   actions.js:  BHStorageMulti(), storageMultipler()
//   resources.js: crateValue(), containerValue()
//   space.js:    a storage multiplier inline, gatewayStorage()
//   truepath.js: tpStorageMultiplier()
// Every one of those had to be updated by hand, in sync, if this balance value ever changed --
// exactly the drift risk this refactor plan exists to remove.
export const BLACKHOLE_STORAGE_BONUS_PER_LEVEL = 0.05;
