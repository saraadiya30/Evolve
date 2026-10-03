// Pure TP (true path) ship calculations. Like morale_core.js / edenic_core.js, this file imports nothing and reads no
// global/DOM state: everything the formulas need is an explicit argument. truepath.js keeps thin wrappers
// (same exported names as before) that read `global` and pass the values in.

export function shipCrewCalc(shipClass, grenadier, scale){
    switch (shipClass){
        case 'corvette':
            return grenadier ? scale(1) : scale(2);
        case 'frigate':
            return grenadier ? scale(2) : scale(3);
        case 'destroyer':
            return grenadier ? scale(3) : scale(4);
        case 'cruiser':
            return grenadier ? scale(4) : scale(6);
        case 'battlecruiser':
            return grenadier ? scale(5) : scale(8);
        case 'dreadnought':
            return grenadier ? scale(6) : scale(10);
        case 'explorer':
            return grenadier ? scale(6) : scale(10);
    }
}

export function shipPowerCalc(ship, wiki, powerMod){
    let watts = 0;

    let out_inflate = 1;
    let use_inflate = 1;
    switch (ship.class){
        case 'frigate':
            out_inflate = 1.1;
            use_inflate = 1.2;
            break;
        case 'destroyer':
            out_inflate = 1.5;
            use_inflate = 1.65;
            break;
        case 'cruiser':
            out_inflate = 2;
            use_inflate = 2.5;
            break;
        case 'battlecruiser':
            out_inflate = 2.5;
            use_inflate = 3.5;
            break;
        case 'dreadnought':
            out_inflate = 5;
            use_inflate = 6.5;
            break;
        case 'explorer':
            out_inflate = 6;
            use_inflate = 2;
            break;
    }

    switch (ship.power){
        case 'solar':
            watts = Math.round(50 * out_inflate);
            break;
        case 'diesel':
            watts = Math.round(100 * out_inflate);
            break;
        case 'fission':
            watts = Math.round(150 * out_inflate);
            break;
        case 'fusion':
            watts = Math.round((ship.class === 'explorer' || wiki ? 174 : 175) * out_inflate);
            break;
        case 'elerium':
            watts = Math.round(200 * out_inflate);
            break;
    }

    watts = Math.round(Math.max(watts, powerMod(watts)));

    switch (ship.weapon){
        case 'railgun':
            watts -= Math.round(10 * use_inflate);
            break;
        case 'laser':
            watts -= Math.round(30 * use_inflate);
            break;
        case 'p_laser':
            watts -= Math.round(18 * use_inflate);
            break;
        case 'plasma':
            watts -= Math.round(50 * use_inflate);
            break;
        case 'phaser':
            watts -= Math.round(65 * use_inflate);
            break;
        case 'disruptor':
            watts -= Math.round(100 * use_inflate);
            break;
    }

    switch (ship.engine){
        case 'ion':
            watts -= Math.round(25 * use_inflate);
            break;
        case 'tie':
            watts -= Math.round(50 * use_inflate);
            break;
        case 'pulse':
            watts -= Math.round(40 * use_inflate);
            break;
        case 'photon':
            watts -= Math.round(75 * use_inflate);
            break;
        case 'vacuum':
            watts -= Math.round(120 * use_inflate);
            break;
        case 'emdrive':
            watts -= Math.round((ship.class !== 'explorer' && !wiki ? 1024 : 515) * use_inflate);
            break;
    }

    switch (ship.sensor){
        case 'radar':
            watts -= Math.round(10 * use_inflate);
            break;
        case 'lidar':
            watts -= Math.round(25 * use_inflate);
            break;
        case 'quantum':
            watts -= Math.round(75 * use_inflate);
            break;
    }

    return watts;
}

export function shipAttackCalc(ship, wishShip){
    let rating = 0;
    switch (ship.weapon){
        case 'railgun':
            rating = 36;
            break;
        case 'laser':
            rating = 64;
            break;
        case 'p_laser':
            rating = 54;
            break;
        case 'plasma':
            rating = 90;
            break;
        case 'phaser':
            rating = 114;
            break;
        case 'disruptor':
            rating = 156;
            break;
    }

    if (wishShip){
        rating = Math.round(rating * 1.25);
    }

    switch (ship.class){
        case 'corvette':
            return rating;
        case 'frigate':
            return Math.round(rating * 1.5);
        case 'destroyer':
            return Math.round(rating * 2.75);
        case 'cruiser':
            return Math.round(rating * 5.5);
        case 'battlecruiser':
            return Math.round(rating * 10);
        case 'dreadnought':
            return Math.round(rating * 22);
        case 'explorer':
            return Math.round(rating * 1.2);
    }
}

export function shipSpeedCalc(ship, boost){
    let mass = 1;
    switch (ship.class){
        case 'corvette':
            mass = ship.armor === 'neutronium' ? 1.1 : 1;
            break;
        case 'frigate':
            mass = ship.armor === 'neutronium' ? 1.35 : 1.25;
            break;
        case 'destroyer':
            mass = ship.armor === 'neutronium' ? 1.95 : 1.8;
            break;
        case 'cruiser':
            mass = ship.armor === 'neutronium' ? 3.5 : 3;
            break;
        case 'battlecruiser':
            mass = ship.armor === 'neutronium' ? 4.8 : 4;
            break;
        case 'dreadnought':
            mass = ship.armor === 'neutronium' ? 7.5 : 6;
            break;
        case 'explorer':
            mass = 1;
            break;
    }

    switch (ship.engine){
        case 'ion':
            return 12 / mass * boost;
        case 'tie':
            return 22 / mass * boost;
        case 'pulse':
            return 18 / mass * boost;
        case 'photon':
            return 30 / mass * boost;
        case 'vacuum':
            return 42 / mass * boost;
        case 'emdrive':
            return 37500 / mass * boost;
    }
}

export function shipFuelUseCalc(ship){
    let res = false;
    let burn = 0;

    switch (ship.power){
        case 'diesel':
            res = 'Oil';
            burn = 8;
            break;
        case 'fission':
            res = 'Uranium';
            burn = 0.5;
            break;
        case 'fusion':
            res = 'Helium_3';
            burn = 12;
            break;
        case 'elerium':
            res = 'Elerium';
            burn = 1;
            break;
    }

    switch (ship.class){
        case 'frigate':
            burn *= 1.25;
            break;
        case 'destroyer':
            burn *= 1.5;
            break;
        case 'cruiser':
            burn *= 2;
            break;
        case 'battlecruiser':
            burn *= 3;
            break;
        case 'dreadnought':
            burn *= 5;
            break;
        case 'explorer':
            burn *= 25;
            break;
    }

    return {
        res: res,
        burn: +(burn).toFixed(2)
    };
}

export function shipCostsCalc(bp, typeCount){
    let costs = {};

    let h_inflate = 1;
    let p_inflate = 1;
    let creep_factor = 1;
    switch (bp.class){
        case 'corvette':
            costs['Money'] = 2500000;
            costs['Aluminium'] = 500000;
            h_inflate = 1;
            p_inflate = 1;
            creep_factor = 2;
            break;
        case 'frigate':
            costs['Money'] = 5000000;
            costs['Aluminium'] = 1250000;
            h_inflate = 1.1;
            p_inflate = 1.09;
            creep_factor = 1.5;
            break;
        case 'destroyer':
            costs['Money'] = 15000000;
            costs['Aluminium'] = 3500000;
            h_inflate = 1.2;
            p_inflate = 1.18;
            creep_factor = 1.2;
            break;
        case 'cruiser':
            costs['Money'] = 50000000;
            costs['Adamantite'] = 1000000;
            h_inflate = 1.3;
            p_inflate = 1.25;
            break;
        case 'battlecruiser':
            costs['Money'] = 125000000;
            costs['Adamantite'] = 2600000;
            h_inflate = 1.35;
            p_inflate = 1.3;
            creep_factor = 0.8;
            break;
        case 'dreadnought':
            costs['Money'] = 500000000;
            costs['Adamantite'] = 8000000;
            h_inflate = 1.4;
            p_inflate = 1.35;
            creep_factor = 0.5;
            break;
        case 'explorer':
            costs['Money'] = 800000000;
            costs['Adamantite'] = 9500000;
            h_inflate = 1.45;
            p_inflate = 1;
            break;
    }

    switch (bp.armor){
        case 'steel':
            costs['Steel'] = Math.round(350000 ** h_inflate);
            break;
        case 'alloy':
            costs['Alloy'] = Math.round(250000 ** h_inflate);
            break;
        case 'neutronium':
            costs['Neutronium'] = Math.round(10000 ** h_inflate);
            break;
    }

    switch (bp.engine){
        case 'ion':
            costs['Titanium'] = Math.round(75000 ** p_inflate);
            break;
        case 'tie':
            costs['Titanium'] = Math.round(150000 ** p_inflate);
            break;
        case 'pulse':
            costs['Titanium'] = Math.round(125000 ** p_inflate);
            break;
        case 'photon':
            costs['Titanium'] = Math.round(210000 ** p_inflate);
            break;
        case 'vacuum':
            costs['Titanium'] = Math.round(300000 ** p_inflate);
            break;
        case 'emdrive':
            costs['Titanium'] = Math.round(1250000 ** p_inflate);
            break;
    }

    let alt_mat = ['dreadnought','explorer'].includes(bp.class) ? true : false;
    switch (bp.power){
        case 'solar':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(40000 ** h_inflate);
            costs['Iridium'] = Math.round(15000 ** p_inflate);
            break;
        case 'diesel':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(40000 ** h_inflate);
            costs['Iridium'] = Math.round(15000 ** p_inflate);
            break;
        case 'fission':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(50000 ** h_inflate);
            costs['Iridium'] = Math.round(30000 ** p_inflate);
            break;
        case 'fusion':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(50000 ** h_inflate);
            costs['Iridium'] = Math.round(40000 ** p_inflate);
            break;
        case 'elerium':
            costs[alt_mat ? 'Orichalcum' : 'Copper'] = Math.round(60000 ** h_inflate);
            costs['Iridium'] = Math.round(55000 ** p_inflate);
            break;
    }

    if (bp.class !== 'explorer'){
        switch (bp.sensor){
            case 'radar':
                costs['Money'] = Math.round(costs['Money'] ** 1.04);
                break;
            case 'lidar':
                costs['Money'] = Math.round(costs['Money'] ** 1.08);
                break;
            case 'quantum':
                costs['Money'] = Math.round(costs['Money'] ** 1.12);
                break;
        }
    }

    switch (bp.weapon){
        case 'railgun':
            costs['Iron'] = Math.round(25000 ** h_inflate);
            break;
        case 'laser':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.05);
            costs['Nano_Tube'] = Math.round(12000 ** h_inflate);
            break;
        case 'p_laser':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.035);
            costs['Nano_Tube'] = Math.round(12000 ** h_inflate);
            break;
        case 'plasma':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.1);
            costs['Nano_Tube'] = Math.round(20000 ** h_inflate);
            break;
        case 'phaser':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.15);
            costs['Quantium'] = Math.round(18000 ** h_inflate);
            break;
        case 'disruptor':
            costs['Iridium'] = Math.round(costs['Iridium'] ** 1.2);
            costs['Quantium'] = Math.round(35000 ** h_inflate);
            break;
    }

    if (bp.class === 'explorer'){
        costs['Iron'] *= 10;
        costs['Titanium'] *= 5;
        costs['Iridium'] *= 50;
    }

    let creep = 1 + (typeCount - 2) / 25 * creep_factor;
    Object.keys(costs).forEach(function(res){
        if (bp.class === 'explorer'){
            costs[res] = Math.ceil(costs[res] * ((typeCount + 1) * 3));
        }
        else {
            if (typeCount < 2){
                costs[res] = Math.ceil(costs[res] * (typeCount === 0 ? 0.75 : 0.9));
            }
            else if (typeCount > 2){
                costs[res] = Math.ceil(costs[res] * creep);
            }
        }
    });

    return costs;
}
