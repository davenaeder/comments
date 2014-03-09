var Util = {};

/**
 * Returns a random number between min and max
 */
Util.randomRange = function(min, max) {
    return Math.random() * (max - min) + min;
};

/**
 * Returns a random integer between min and max
 */
Util.randomRangeInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
