
export const genus_def = {
    humanoid: {
        traits: {
            adaptable: 1,
            wasteful: 1
        },
        oppose: ['fungi']
    },
    carnivore: {
        traits: {
            carnivore: 1,
            beast: 1,
            cautious: 1
        },
        oppose: ['herbivore']
    },
    herbivore: {
        traits: {
            herbivore: 1,
            instinct: 1
        },
        oppose: ['carnivore']
    },
    omnivore: {
        traits: {
            forager: 1,
            beast: 1,
            cautious: 1,
            instinct: 1
        }
    },
    small: {
        traits: {
            small: 1,
            weak: 1
        },
        oppose: ['giant']
    },
    giant: {
        traits: {
            large: 1,
            strong: 1
        },
        oppose: ['small']
    },
    reptilian: {
        traits: {
            cold_blooded: 1,
            scales: 1
        },
        oppose: ['avian']
    },
    avian: {
        traits: {
            flier: 1,
            hollow_bones: 1,
            sky_lover: 1
        },
        oppose: ['reptilian']
    },
    insectoid: {
        traits: {
            high_pop: 1,
            fast_growth: 1,
            high_metabolism: 1
        },
        oppose: ['plant']
    },
    plant: {
        traits: {
            sappy: 1,
            asymmetrical: 1
        },
        oppose: ['insectoid']
    },
    fungi: {
        traits: {
            detritivore: 1,
            spongy: 1
        },
        oppose: ['humanoid']
    },
    aquatic: {
        traits: {
            submerged: 1,
            low_light: 1
        },
        oppose: ['sand']
    },
    fey: {
        traits: {
            elusive: 1,
            iron_allergy: 1
        },
        oppose: ['eldritch','synthetic']
    },
    heat: {
        traits: {
            smoldering: 1,
            cold_intolerance: 1
        },
        oppose: ['polar']
    },
    polar: {
        traits: {
            chilled: 1,
            heat_intolerance: 1
        },
        oppose: ['heat']
    },
    sand: {
        traits: {
            scavenger: 1,
            nomadic: 1
        },
        oppose: ['aquatic']
    },
    demonic: {
        traits: {
            immoral: 1,
            evil: 1,
            soul_eater: 1
        },
        oppose: ['angelic']
    },
    angelic: {
        traits: {
            blissful: 1,
            pompous: 1,
            holy: 1
        },
        oppose: ['demonic']
    },
    synthetic: {
        traits: {
            artifical: 1,
            powered: 1
        },
        oppose: ['eldritch','fey']
    },
    eldritch: {
        traits: {
            psychic: 1,
            tormented: 1,
            darkness: 1,
            unfathomable: 1
        },
        oppose: ['synthetic','fey']
    },
    hybrid: {
        traits: {},
        oppose: []
    }
};
