// Pure smelter-related tunable constants. Like storage.config.js, this file must NOT import
// anything, so any module can pull from it without creating circular imports.

// Inferno fuel: per-smelter consumption rate. It was hardcoded twice -- as `inferno_rate` in
// main.js (the real consumption) and as three loose literals in industry.js's tooltip() (the
// text shown to the player). Now both read from here.
export const INFERNO_SMELTER_RATE = Object.freeze({
    Oil: 35,
    Coal: 50,
    Infernite: 0.5
});
