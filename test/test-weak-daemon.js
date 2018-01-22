const assert = require('assert')
const {getClass, getInstance} = require('../index');

const WeakDaemon = getClass();
const weak_daemon = getInstance(1, ()=>{}, null);

assert(weak_daemon instanceof WeakDaemon, `weak_daemon should be instaceof WeakDaemon`)


const MAX_INTERVAL = 0x7FFFFFFF;
function func() {};



var d = null;



// ------------------------------------------------------------------
// [TC] Is `new` used
assert.throws(()=>{WeakDaemon()}, TypeError);



// ------------------------------------------------------------------
/* [TC] Expected arguments
 *  0: Integer x, where:  "0 < x <= 0x7FFFFFFF"
 *  1: function
 *  2: null or Object
 *  3: [array] (optional)
 */

// Invalid arg 0    Expecting "0 < Integer <= 0x7FFFFFFF"
assert.throws(()=>{ new WeakDaemon(-1             , func, null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0              , func, null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(1.5            , func, null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(MAX_INTERVAL+1 , func, null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(true           , func, null) }, TypeError);
assert.throws(()=>{ new WeakDaemon('x'            , func, null) }, TypeError);
assert.throws(()=>{ new WeakDaemon({}             , func, null) }, TypeError);
assert.throws(()=>{ new WeakDaemon([]             , func, null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(func           , func, null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(undefined      , func, null) }, TypeError);

// Invalid arg 1    Expecting function
assert.throws(()=>{ new WeakDaemon(0, null     , null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0, {}       , null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0, []       , null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0, 1        , null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0, 'x'      , null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0, true     , null) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0, undefined, null) }, TypeError);

// Invalid arg 2    Expecting null or Object
assert.throws(()=>{ new WeakDaemon(0, func  /*undef*/ ) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0, func, func      ) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0, func, 1         ) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0, func, 'x'       ) }, TypeError);
assert.throws(()=>{ new WeakDaemon(0, func, false     ) }, TypeError);

// Invalid arg 3    Expecting optional [Array]
assert.throws(()=>{ new WeakDaemon(1, func, null, 1      ) }, TypeError);
assert.throws(()=>{ new WeakDaemon(1, func, null, {a:1}  ) }, TypeError);
assert.throws(()=>{ new WeakDaemon(1, func, null, func   ) }, TypeError);
assert.throws(()=>{ new WeakDaemon(1, func, null, 'x'    ) }, TypeError);
assert.throws(()=>{ new WeakDaemon(1, func, null, false  ) }, TypeError);



// ------------------------------------------------------------------
// [TC] Multiple start() call without previous stop - expect error log message
d = new WeakDaemon(1, func, null);
d.start();

// Temporary redicrect console.error output to error_message variable
var original_stderr = process.stderr.write;
var error_message = null;
process.stderr.write = (message) => {
    error_message = message;
    return true;
};

d.start();
const ERR_MSG = "Potential error detected:";
assert(ERR_MSG == error_message.substring(0, ERR_MSG.length), `Expected warning in stderr (console.error)`);

// Restore original console.error output target
process.stderr.write = original_stderr;

d.stop();


// ------------------------------------------------------------------
// [TC] isRunning
d = new WeakDaemon(1, func, null);
assert( ! d.isRunning(), `Should not run`);

d.start();
assert( d.isRunning(), `Should run`);

d.stop();
assert( ! d.isRunning(), `Should not run`);

d.start();
assert( d.isRunning(), `Should run`);

d.stop();
assert( ! d.isRunning(), `Should not run`);




// ------------------------------------------------------------------
// [TC] Double stop without error
d = new WeakDaemon(1, func, null);
d.start();
d.stop();
assert.doesNotThrow( ()=>{d.stop()}, `Double stop should not throw` );



// #================================================================#
// #            Async part of test starts here                      #
// #================================================================#


// ------------------------------------------------------------------
// [TC] Daemon should increase global_counter (almost) every 1ms

var global_counter = 0;
var prev_value = global_counter;
var check_counter = 0;

function incrementGlobalCounter() {
    global_counter++;
}


TC1__step_1();


// Check if daemon increaing counter
function TC1__step_1() {        
    d = new WeakDaemon(1, incrementGlobalCounter, null);
    d.start();
    
    check_counter = 0; 
    
    var interval_id = setInterval( ()=>{
        assert(prev_value < global_counter, `global_counter not increasing`);
        prev_value = global_counter;
        check_counter++;
        
        if(check_counter > 10) {
            clearInterval(interval_id);
            TC1__step_2();
        }
    }, 10 );
}


// Check if daemon stopped increaing counter
function TC1__step_2() {
    d.stop();
    prev_value = global_counter;
    
    check_counter = 0;    
    var interval_id = setInterval( ()=>{
        assert(prev_value == global_counter, `global_counter should not be changed in this phase`);
        prev_value = global_counter;
        check_counter++;
        
        if(check_counter > 10) {
            clearInterval(interval_id);
            TC1__step_3();
        }
    }, 10 );
}


// Check if daemon resume increaing counter
function TC1__step_3() {
    d.start();
    
    check_counter = 0; 
    var interval_id = setInterval( ()=>{
        assert(prev_value < global_counter, `global_counter not increasing`);
        prev_value = global_counter;
        check_counter++;
        
        if(check_counter > 10) {
            clearInterval(interval_id);
            TC1__success();
        }
    }, 10 );
}


function TC1__success() {
    d = null;
    
    // Next async TC
    TC2__step_1();
}



// ------------------------------------------------------------------
// [TC] Check if arguments handled properly

// Helpers
class Storage {
    constructor() {
        this.value_1 = 1;
        this.value_2 = 1;
    }
    
    update(data_1, data_2) {
        this.value_1 = data_1.value;
        this.value_2 = data_2.value;
    }
}

const data_1 = {value: 'A:0'};
const data_2 = {value: 'B:0'};
const storage = new Storage();


// Check if start() call handled correctly
function TC2__step_1() {
    
    d = new WeakDaemon(1, storage.update, storage, [data_1, data_2]);
    d.start();
    
    check_counter = 0;
    
    var interval_id = setInterval( ()=>{        
        assert(
            storage.value_1 === data_1.value &&
            storage.value_2 === data_2.value
            , `Value not updated as expected`);
            
            
        data_1.value = `A:${check_counter}`; 
        data_2.value = `B:${check_counter}`;        
        
        check_counter++;        
        if(check_counter > 10) {
            clearInterval(interval_id);
            TC2__step_2();
        }
    }, 10 );
}


// Check if stop() call handled correctly
function TC2__step_2() {    
    
    d.stop();
    var value_1 = storage.value_1;
    var value_2 = storage.value_2;
    
    check_counter = 0;
    var interval_id = setInterval( ()=>{        
    
        // Compare storage with initial values taken after stop() call
        assert(
            storage.value_1 === value_1 &&
            storage.value_2 === value_2
            , `Value not updated as expected`);
            
        
        // Data that daemon uses to feed storage is updating,
        // but storage values should not change, because
        // daemon is stopped
        data_1.value = `A:${check_counter}`; 
        data_2.value = `B:${check_counter}`;        
        
        check_counter++;        
        if(check_counter > 10) {
            clearInterval(interval_id);
            TC2__step_3();
        }
    }, 10 );
}

function TC2__step_3() {
    d.start();
    
    check_counter = 0; 
    
    var interval_id = setInterval( ()=>{        
        assert(
            storage.value_1 === data_1.value &&
            storage.value_2 === data_2.value
            , `Value not updated as expected`);
            
            
        data_1.value = `A:${check_counter}`; 
        data_2.value = `B:${check_counter}`;        
        
        check_counter++;        
        if(check_counter > 10) {
            clearInterval(interval_id);
            TC2__success();
        }
    }, 10 );
}


function TC2__success() {
    console.log(`[weak-daemon] Tested OK`);
}

