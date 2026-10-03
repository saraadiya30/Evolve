// Tunable constants for upgrade/build cost scaling ("creep"). Like the other config files,
// this file must NOT import anything, so any module can pull from it without circular imports.
//
// The creep gene (ARPA CRISPR perk) used to be hardcoded as 0.01 / 0.002 in TWO separate cost
// functions in functions_f2.js (costMultiplier and spaceCostMultiplier) and again in the perk
// description text in ach_perks_2.js. Changing the balance meant editing all of them by hand.

// Reduction of the cost multiplier per level of the creep gene.
export const CREEP_GENE_PER_LEVEL = 0.01;
// Same, for races with the no_crispr trait.
export const CREEP_GENE_PER_LEVEL_NO_CRISPR = 0.002;

// Total multiplier reduction from the creep gene at the given level.
// Pure helper: returns 0 when the gene is missing/0, same as the old if/else-if chains.
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
