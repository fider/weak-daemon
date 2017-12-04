/** Madness? No, just potential error detector */
const MAX_INTERVAL = 0x7FFFFFFF; // 2147483647



/**
 * Weak daemon is just object wrapper for setInterval.
 * It forces you to remember about binding context and do some other stuff to make your life easier.
 *
 * Interval is 'unref' by default so it will NOT prevent application to close if Node event loop is empty.
 * Want the same functionality without 'unref'? Use other daemon module from npm.
 *
 * Module throws AssertionError if invalid parameters provided
 */
class WeakDaemon {
    
    
    /**
     * @param {number}      interval_time
     * @param {function}    routine                     callback, task
     * @param {null|Object} routine_context             Object if param `routine` uses `this` keyword ELSE set null
     * @param {Array}       [routine_arguments_array]
     *
     * @throws {TypeError} If you do not like this just do not use this module
     */
    constructor(interval_time, routine, routine_context, routine_arguments_array = []) {
        this._validateArgs(...arguments);
        
        this._interval_time = interval_time;
        this._routine = routine.bind(routine_context, ...routine_arguments_array);
        this._interval_id = null;        
    }


    
    /**
     * Immediate call + setInterval
     */
    start(immediate_call = false) {
        if( this._interval_id ) {
            console.error(`Potential error detected:
                Timestamp:${(new Date()).toUTCString()}
                WeakDaemon instance start() multiple call - no action performed.
                To avoid message call stop() before next start().
                
                *If you want to have multiple deamons running create more instances.
                `);
            return;
        }

        this._interval_id = setInterval(
            this._routine,
            this._interval_time);

        this._interval_id.unref();
        
        if( immediate_call === true ) {
            this._routine();
        }
    }


    
    stop() {
        clearInterval(this._interval_id);
        this._interval_id = null;
    }
    
    
    
    isRunning() {
        return (this._interval_id) ? true : false;
    }


    
    /**
     * @private
     * @param {number}      interval_time               0 < Integer <= 0x7FFFFFFF (max setInterval delay)
     * @param {function}    routine                     function
     * @param {null|Object} routine_context             Object if param `routine` uses `this` keyword ELSE set null
     * @param {Array}       [routine_arguments_array]   optional array of arguments that routine function will use
     *
     * @throws {TypeError} If you do not like this just do not use this module
     */
    _validateArgs(interval_time, routine, routine_context, routine_arguments_array) {
        if( !(
            Number.isInteger(interval_time) && interval_time > 0 && interval_time <= MAX_INTERVAL  &&
            typeof(routine) === 'function' &&
            (typeof(routine_context) === 'object') && /* Null is also Object */
            (routine_arguments_array === undefined || Array.isArray(routine_arguments_array))) ) {

            throw new TypeError(`Invalid arguments.
                Expected:
                    1st - integer x, where:  0 < x <= ${MAX_INTERVAL}
                    2nd - function
                    3rd - Object or null     (object in case if routine uses 'this' keyword)
                    4th - Array or undefined (if no arguments then leave empty/undefined)
                Actual:
                    1st - ${interval_time}
                    2nd - ${routine}
                    3rd - ${routine_context}
                    4th - ${routine_arguments_array}`)
        }
    }
}



exports.WeakDaemon = WeakDaemon;