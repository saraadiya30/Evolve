// Encapsulation layer for global state - reduces direct access to the massive mutable singleton
import { global as rawGlobal } from './vars.js';

/**
 * Safe getter for nested properties with null-safe traversal
 * @param {string} path - dot-separated path (e.g., 'resource.Food.amount')
 * @param {*} defaultValue - fallback value if path doesn't exist
 */
export function get(path, defaultValue = undefined) {
    const keys = path.split('.');
    let current = rawGlobal;
    
    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current === undefined ? defaultValue : current;
}

/**
 * Safe setter for nested properties with auto-creation of intermediate objects
 * @param {string} path - dot-separated path (e.g., 'resource.Food.amount')
 * @param {*} value - value to set
 */
export function set(path, value) {
    const keys = path.split('.');
    let current = rawGlobal;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {};
        }
        current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
}

/**
 * Checks if a nested property exists
 * @param {string} path - dot-separated path
 */
export function has(path) {
    const keys = path.split('.');
    let current = rawGlobal;
    
    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object' || !(key in current)) {
            return false;
        }
        current = current[key];
    }
    
    return true;
}

/**
 * Returns a direct reference to a nested object (for backward compatibility when mutation is needed)
 * Use with caution - bypasses encapsulation!
 * @param {string} path - dot-separated path
 */
export function ref(path) {
    const keys = path.split('.');
    let current = rawGlobal;
    
    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return undefined;
        }
        current = current[key];
    }
    
    return current;
}

// Shortcut functions untuk common access patterns
// Convenience shortcuts for frequently-accessed paths
export const settings = {
    get: (key) => get(`settings.${key}`),
    set: (key, value) => set(`settings.${key}`, value),
    has: (key) => has(`settings.${key}`),
};

export const resource = {
    get: (name, prop = 'amount') => get(`resource.${name}.${prop}`),
    set: (name, prop, value) => set(`resource.${name}.${prop}`, value),
    has: (name) => has(`resource.${name}`),
};

export const tech = {
    get: (name) => get(`tech.${name}`),
    set: (name, value) => set(`tech.${name}`, value),
    has: (name) => has(`tech.${name}`),
};

export const race = {
    get: (trait) => get(`race.${trait}`),
    set: (trait, value) => set(`race.${trait}`, value),
    has: (trait) => has(`race.${trait}`),
};

export const stats = {
    get: (key) => get(`stats.${key}`),
    set: (key, value) => set(`stats.${key}`, value),
    has: (key) => has(`stats.${key}`),
};

export const city = {
    get: (key) => get(`city.${key}`),
    set: (key, value) => set(`city.${key}`, value),
    has: (key) => has(`city.${key}`),
};

export const space = {
    get: (key) => get(`space.${key}`),
    set: (key, value) => set(`space.${key}`, value),
    has: (key) => has(`space.${key}`),
};

export const civic = {
    get: (key) => get(`civic.${key}`),
    set: (key, value) => set(`civic.${key}`, value),
    has: (key) => has(`civic.${key}`),
};

// Export raw global for backward compatibility (will be gradually deprecated)
export { rawGlobal as global };