const WeakDaemon = require('./lib/weak-daemon').WeakDaemon


module.exports.getInstance = function mockMeA() {
    return new WeakDaemon(...arguments);
};


module.exports.getClass = function mockMeB() {
    return WeakDaemon;
};
