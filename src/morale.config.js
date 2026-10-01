// Pure morale-related tunable constants. Like stocks_core.js, this file must NOT import
// anything, so any module can pull from it without creating circular imports.
//
// Scope of this first pass (Fase 2): only constants that were previously hardcoded in TWO
// OR MORE places in main.js (same value, same meaning, computed independently) -- exactly the
// "calc vs breakdown/other calc drift" pattern that caused the morale/storage bugs. Values that
// only appear once, or that are already wrapped in trait-specific vars() lookups (e.g. leathery,
// skittish, smoldering, chilled), are left as-is for a later pass to avoid touching logic that
// isn't at risk of silently drifting.

// --- Season ---------------------------------------------------------------------------------
export const SPRING_MORALE_BONUS = 5;   // Spring, no chilled/smoldering trait (main.js ~line 1409)
export const WINTER_MORALE_PENALTY = 5; // Winter, no chilled trait, no leathery trait (was duplicated:
                                         // once for the morale total, once for global.city.morale.season)

// --- Weather ---------------------------------------------------------------------------------
export const THUNDERSTORM_MORALE_PENALTY = 5; // no skittish/leathery trait
export const RAIN_MORALE_PENALTY = 2;         // no leathery trait
export const SUNNY_MORALE_BONUS = 2;          // still+not-hot, or windy+hot

// --- Vaccine tech (vax_c/vax_f/vax_s) -----------------------------------------------------
export const VAX_C_MORALE_PENALTY = 10;
export const VAX_F_MORALE_PENALTY = 50;
export const VAX_S_MORALE_BONUS = 20;

// --- Morale-boost tech (m_boost) --------------------------------------------------------------
export const MORALE_BOOST_TECH_BONUS = 20; // was duplicated: once for global.city.morale.leadership,
                                            // once added straight into morale

// --- Pet bonus (was independently duplicated in the morale calc AND the Authority cap calc) --
export const PET_BASE_BONUS = 1;   // flat bonus just for having a pet
export const PET_EVENT_BONUS = 1;  // extra bonus while a pet event is active
export const PET_TYPE_BONUS = { cat: 2, other: 1 }; // bonus/penalty size depends on pet type
