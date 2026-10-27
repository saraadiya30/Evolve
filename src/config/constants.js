// Semua konstanta balance/tunable game, dikelompokkan per topik.
// ATURAN: file ini TIDAK boleh meng-import apa pun, supaya modul mana pun bisa memakainya tanpa circular import.

// ============================================================
// COST
// ============================================================
// Tunable constants for upgrade/build cost scaling ("creep"). Like the other config files,
// this file must NOT import anything, so any module can pull from it without circular imports.
//
// The creep gene (ARPA CRISPR perk) values are defined once here; the cost functions in civ_name.js
// (costMultiplier and spaceCostMultiplier) and the perk description in endless_hunger_to_blood.js all read them.

// Reduction of the cost multiplier per level of the creep gene.
export const CREEP_GENE_PER_LEVEL = 0.01;
// Same, for races with the no_crispr trait.
const CREEP_GENE_PER_LEVEL_NO_CRISPR = 0.002;

// Total multiplier reduction from the creep gene at the given level.
// Pure helper: returns 0 when the gene is missing/0.
export function creepGeneReduction(level, noCrispr){
    if (!level){
        return 0;
    }
    return level * (noCrispr ? CREEP_GENE_PER_LEVEL_NO_CRISPR : CREEP_GENE_PER_LEVEL);
}

// Spire (portal) cost creep -- NOT related to the creep gene above, despite the shared name.
// Each spire floor beyond the first lowers the multiplier by 1/SPIRE_CREEP_DIVISOR, never below the floor.
export const SPIRE_CREEP_DIVISOR = 2500;
export const SPIRE_CREEP_FLOOR = 1.01;

// ============================================================
// MORALE
// ============================================================
// Pure morale-related tunable constants. Like stocks_core.js, this file must NOT import
// anything, so any module can pull from it without creating circular imports.
//
// Only constants that are used in more than one place (the morale total, its breakdown, other calculations) live here,
// so those places cannot drift apart. Values used once, or wrapped in trait-specific vars() lookups, stay where they are.

// --- Season ---------------------------------------------------------------------------------
export const SPRING_MORALE_BONUS = 5;   // Spring, no chilled/smoldering trait
export const WINTER_MORALE_PENALTY = 5; // Winter, no chilled trait, no leathery trait
                                         // (used for both the morale total and global.city.morale.season)

// --- Weather ---------------------------------------------------------------------------------
export const THUNDERSTORM_MORALE_PENALTY = 5; // no skittish/leathery trait
export const RAIN_MORALE_PENALTY = 2;         // no leathery trait
export const SUNNY_MORALE_BONUS = 2;          // still+not-hot, or windy+hot

// --- Vaccine tech (vax_c/vax_f/vax_s) -----------------------------------------------------
export const VAX_C_MORALE_PENALTY = 10;
export const VAX_F_MORALE_PENALTY = 50;
export const VAX_S_MORALE_BONUS = 20;

// --- Morale-boost tech (m_boost) --------------------------------------------------------------
export const MORALE_BOOST_TECH_BONUS = 20; // used for both global.city.morale.leadership
                                            // and the morale total

// --- Pet bonus (shared by the morale calc and the Authority cap calc) -----------------------
export const PET_BASE_BONUS = 1;   // flat bonus just for having a pet
export const PET_EVENT_BONUS = 1;  // extra bonus while a pet event is active
export const PET_TYPE_BONUS = { cat: 2, other: 1 }; // bonus/penalty size depends on pet type

// ============================================================
// OCULAR POWER
// ============================================================
// Pure tunable constants for the "ocular_power" race trait's four abilities. The real effect calculation and the
// tooltip description popover both read these, so the two cannot drift apart.
export const OCULAR_POWER_DISINTEGRATION_BASE = 50; // army attack bonus base (civics.js, type 'attack')
export const OCULAR_POWER_WOUND_BASE = 60;          // hunting bonus base (civics.js, type 'hunting')
export const OCULAR_POWER_TELEKINESIS_BASE = 20;    // labor bonus base
export const OCULAR_POWER_CHARM_BASE = 70;          // trade rate bonus base (main.js)

// ============================================================
// SMELTER
// ============================================================
// Pure smelter-related tunable constants. Like config/constants.js, this file must NOT import
// anything, so any module can pull from it without creating circular imports.

// Inferno fuel: per-smelter consumption rate, read by both the real consumption and the tooltip shown to the player.
export const INFERNO_SMELTER_RATE = Object.freeze({
    Oil: 35,
    Coal: 50,
    Infernite: 0.5
});

// ============================================================
// STORAGE
// ============================================================
// Pure storage/capacity-related tunable constants. Like stocks_core.js and config/constants.js,
// this file must NOT import anything, so any module can pull from it without creating circular
// imports.

// The "blackhole" achievement's storage bonus (+5% per achievement level). Every storage calculation reads this one constant.
export const BLACKHOLE_STORAGE_BONUS_PER_LEVEL = 0.05;

// ============================================================
// TRADE
// ============================================================
// Pure data tables for resource pricing and trading. Like the other config files, this file must
// NOT import anything, so any module can pull from it without circular imports.

// Base market value per resource (used for trade/market pricing and stock values).
export const resource_values = {
    Food: 5,
    Lumber: 5,
    Chrysotile: 5,
    Stone: 5,
    Crystal: 6,
    Furs: 8,
    Copper: 25,
    Iron: 40,
    Aluminium: 50,
    Cement: 15,
    Coal: 20,
    Oil: 75,
    Uranium: 550,
    Steel: 100,
    Titanium: 150,
    Alloy: 350,
    Polymer: 250,
    Iridium: 420,
    Helium_3: 620,
    Deuterium: 950,
    Elerium: 2000,
    Water: 2,
    Neutronium: 1500,
    Adamantite: 2250,
    Infernite: 2750,
    Nano_Tube: 750,
    Graphene: 3000,
    Stanene: 3600,
    Bolognium: 9000,
    Vitreloy: 10200,
    Orichalcum: 99000,
    Asphodel_Powder: 249000,
    Horseshoe: 0,
    Nanite: 0,
    Genes: 0,
    Soul_Gem: 0,
    Corrupt_Gem: 0,
    Codex: 0,
    Cipher: 0,
    Demonic_Essence: 0,
    Blessed_Essence: 0
};

// Every trade route source (trade post, wharf, temple, bazaar, freighters, ...) gives this many times its original number of routes.
// Trade post, wharf, GPS, storage yard and railway already carry their own literal multiplier in mid_loop_trade_routes.js.
export const TRADE_ROUTE_MULT = 100;

// Trade route ratio per resource (units moved per trade route).
export const tradeRatio = {
    Food: 20,
    Lumber: 20,
    Chrysotile: 10,
    Stone: 20,
    Crystal: 4,
    Furs: 10,
    Copper: 10,
    Iron: 10,
    Aluminium: 10,
    Cement: 10,
    Coal: 10,
    Oil: 5,
    Uranium: 1.2,
    Steel: 5,
    Titanium: 2.5,
    Alloy: 2,
    Polymer: 2,
    Iridium: 1,
    Helium_3: 1,
    Deuterium: 1,
    Elerium: 0.2,
    Water: 20,
    Neutronium: 0.5,
    Adamantite: 0.5,
    Infernite: 0.1,
    Nano_Tube: 1,
    Graphene: 1,
    Stanene: 1,
    Bolognium: 1.2,
    Vitreloy: 1.2,
    Orichalcum: 0.5
};

// ============================================================
// AUTOSAVE
// ============================================================
// Jarak minimum (ms waktu nyata) antar autosave di longLoop. Sama dengan lama satu hari game di speed 1x (5000 ms),
// di speed tinggi save tidak terjadi tiap hari game.
export const AUTOSAVE_MIN_INTERVAL_MS = 5000;

export const tagDebug = false;

// Maximum stored accelerated (2x) time, in game days. The original game caps it at 11520 (8*60*60/2.5 game days = 8 hours
// of accelerated play, reached after 12 hours away). It is removed in this mod. Set a number here to bring a cap back.
// NOTE: the original game wipes a stored value that is above its cap, so saves with a lot of accelerated time should not
// be loaded in the unmodified game.
export const ATIME_CAP = Infinity;

// Gene Lab (desain race custom saat Ascension): 1 Aether dapat ditukar jadi sekian genes tambahan
export const AETHER_GENES_RATE = 10;
