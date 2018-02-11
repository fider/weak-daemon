import {WeakDaemon} from '../lib/weak-daemon';
const {inspect: i} = require('util');
import {createTask, iTask, NotTypedWeakDaemon, TestableWeakDaemon} from './helpers';





describe('Unit test weak-daemon:', function() {
    let weak_daemon: TestableWeakDaemon;
    let task: iTask;


    beforeEach(function() {
        task = createTask();
        weak_daemon = <any>new WeakDaemon(task.interval_time, task.caller, task.task_owner.taskForWeakDaemon, task.input_args);
    });

    afterEach(function() {
        weak_daemon.stop();
    })
    

    /* For those who not TypeScript-ing */
    it('WeakDaemon.constructor() invalid arguments', function() {
        const MAX_INT: number = Math.pow(2,31) - 1;

        expect(()=>{ new NotTypedWeakDaemon(1, {},   ()=>{}, []) }).not.toThrow();
        expect(()=>{ new NotTypedWeakDaemon(1, [],   ()=>{}, []) }).not.toThrow();
        expect(()=>{ new NotTypedWeakDaemon(1, {},   ()=>{}    ) }).not.toThrow();
        expect(()=>{ new NotTypedWeakDaemon(1, null, ()=>{}, []) }).not.toThrow();

        // Arg 0
        expect(()=>{ new NotTypedWeakDaemon(undefined, {}, ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(0,         {}, ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(-1,        {}, ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(MAX_INT+1, {}, ()=>{}, []) }).toThrowError(TypeError);

        // Arg 1
        expect(()=>{ new NotTypedWeakDaemon(1, undefined, ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, 1,         ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, '1',       ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, true,      ()=>{}, []) }).toThrowError(TypeError);

        // Arg 2
        expect(()=>{ new NotTypedWeakDaemon(1, {}, undefined, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, {}, null,      []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, {}, {},        []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, {}, 1,         []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, {}, '1',       []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, {}, true,      []) }).toThrowError(TypeError);

        // Arg 3
        expect(()=>{ new NotTypedWeakDaemon(1, {}, ()=>{}, null ) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, {}, ()=>{}, {}   ) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, {}, ()=>{}, 1    ) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, {}, ()=>{}, '1'  ) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedWeakDaemon(1, {}, ()=>{}, true ) }).toThrowError(TypeError);
    });



    /* Just to spot any changes */
    it('WeakDaemon.constructor() protected members initialization', function() {
        expect(weak_daemon._interval_time).toBe(task.interval_time);
        expect(weak_daemon._task).toBe(task.task_owner.taskForWeakDaemon);
        expect(weak_daemon._args).toBe(task.input_args);
        expect(weak_daemon._caller).toBe(task.caller);
        expect(weak_daemon._interval_id).toBe(null);
    });



    it('WeakDaemon.constructor() should not call task nor start timer', function() {
        task.call_count = 0;
        spyOn(global, 'setInterval');
        spyOn(global, 'setTimeout');
        const setInterval_spy = <jasmine.Spy> global.setInterval;
        const setTimeout_spy = <jasmine.Spy> global.setTimeout;

        weak_daemon = <any> new WeakDaemon(task.interval_time, task.caller, task.task_owner.taskForWeakDaemon, task.input_args);
        
        expect(task.call_count).toBe(0);
        expect(setInterval_spy).toHaveBeenCalledTimes(0);
        expect(setTimeout_spy).toHaveBeenCalledTimes(0);
    });



    describe('WeakDaemon.start  (is setInterval called with proper task)', function() {
        let setInterval_spy: jasmine.Spy;

        beforeEach(function() {
            spyOn(global, 'setInterval').and.callThrough();
            setInterval_spy = <jasmine.Spy>global.setInterval;
        });


        it('WeakDaemon.start(undefined=false)', function() {
            expect(setInterval_spy).toHaveBeenCalledTimes(0);
            weak_daemon.start();
            expect(setInterval_spy).toHaveBeenCalledTimes(1);
            expect(setInterval_spy.calls.mostRecent().args[1]).toBe( task.interval_time );
            // expect(setInterval_spy.calls.mostRecent().args[0].name).toBe('bound taskForWeakDaemon');
        });
    
        it('WeakDaemon.start(false)', function() {
            expect(setInterval_spy).toHaveBeenCalledTimes(0);
            weak_daemon.start(false);
            expect(setInterval_spy).toHaveBeenCalledTimes(1);
            expect(setInterval_spy.calls.mostRecent().args[1]).toBe( task.interval_time );
            // expect(setInterval_spy.calls.mostRecent().args[0].name).toBe('bound taskForWeakDaemon');
        });
    
        it('WeakDaemon.start(true)', function() {
            expect(setInterval_spy).toHaveBeenCalledTimes(0);
            weak_daemon.start(true);
            
            expect(setInterval_spy).toHaveBeenCalledTimes(1);
            expect(setInterval_spy.calls.mostRecent().args[1]).toBe( task.interval_time );
            // expect(setInterval_spy.calls.mostRecent().args[0].name).toBe('bound taskForWeakDaemon');
        });
    });



    describe('(!) TEST CASE MAY BE UNSTABLE AND DEPENDS ON NODE.JS VERSION (verifying private NodeJS.Timer members to check if timer is unref`ed ', function() {
        it('WeakDaemon.start(default=false)', function() {
            weak_daemon.start();
            expect(weak_daemon._interval_id._idlePrev).toBe(null);
            expect(weak_daemon._interval_id._idleNext).toBe(null);
        });

        it('WeakDaemon.start(false)', function() {
            weak_daemon.start(false);
            expect(weak_daemon._interval_id._idlePrev).toBe(null);
            expect(weak_daemon._interval_id._idleNext).toBe(null);
        });

        it('WeakDaemon.start(true)', function() {
            weak_daemon.start(true);
            expect(weak_daemon._interval_id._idlePrev).toBe(null);
            expect(weak_daemon._interval_id._idleNext).toBe(null);
        });
    });



    describe('WeakDaemon.start  (is task called immediately)', function() {
        it('WeakDaemon.start(false)', function() {
            weak_daemon.start(false);
    
            expect(task.call_count).toBe(0);
            expect(task.recent_caller).toBe(null);
            expect(task.recent_args).toBe(null);
        });
        
        it('WeakDaemon.start(undefined=false)', function() {
            weak_daemon.start(false);
    
            expect(task.call_count).toBe(0);
            expect(task.recent_caller).toBe(null);
            expect(task.recent_args).toBe(null);
        });
    
        it('WeakDaemon.start(true)', function() {
            expect(task.call_count).toBe(0);
            weak_daemon.start(true);
    
            expect(task.call_count).toBe(1);
            expect(task.recent_caller).toBe(task.caller);
            expect(task.recent_args).toEqual(task.input_args);
        });
    });
    


    it('multiple call WeakDaemon.start()', function() {
        weak_daemon.start();
        expect(()=>{ weak_daemon.start(); }).toThrowError(Error);
    });



    it('multiple call WeakDaemon.stop() not throws', function() {
        weak_daemon.start();
        expect(()=>{ weak_daemon.stop(); }).not.toThrow();
        
        weak_daemon.start();
        expect(()=>{ weak_daemon.stop(); }).not.toThrow();
        expect(()=>{ weak_daemon.stop(); }).not.toThrow();        
    });
    


    it('WeakDaemon.isRunning()', function() {
        expect(weak_daemon.isRunning()).toBe(false);

        weak_daemon.start();
        expect(weak_daemon.isRunning()).toBe(true);
        
        weak_daemon.stop();
        expect(weak_daemon.isRunning()).toBe(false);        
        
        weak_daemon.start();
        expect(weak_daemon.isRunning()).toBe(true);        
        
        weak_daemon.stop();
        expect(weak_daemon.isRunning()).toBe(false);
        
        weak_daemon.start();
        expect(weak_daemon.isRunning()).toBe(true);

        weak_daemon.stop();
        weak_daemon.stop();
        expect(weak_daemon.isRunning()).toBe(false);        
    });



    it('WeakDaemon.get interval()', function() {
        expect(weak_daemon.interval).toBe(task.interval_time);
    });

    it('WeakDaemon.get task()', function() {
        expect(weak_daemon.task).toBe(task.task_owner.taskForWeakDaemon);
    });

    it('WeakDaemon.get args()', function() {
        expect(weak_daemon.args).toBe(task.input_args);
    });

    it('WeakDaemon.get caller()', function() {
        expect(weak_daemon.caller).toBe(task.caller);
    });
});



describe('weak-daemon runtime test:', function() {
    let task: iTask;
    let weak_daemon: WeakDaemon;


    beforeEach(function() {
        jasmine.clock().install();

        task = createTask();
        weak_daemon = new WeakDaemon(task.interval_time, task.caller, task.task_owner.taskForWeakDaemon, task.input_args);
    });


    afterEach(function() {
        weak_daemon.stop();
        jasmine.clock().uninstall();
    });


    it('WeakDaemon.start() => stop => start', function() {
        expect(task.call_count).toBe(0);

        weak_daemon.start();
        expect(task.call_count).toBe(0);

        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(0);

        // before first timeout

        jasmine.clock().tick(1);
        expect(task.call_count).toBe(1);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);
        
        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(1);

        // before second timeout

        jasmine.clock().tick(1);
        expect(task.call_count).toBe(2);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);

        
        weak_daemon.stop();

        jasmine.clock().tick(task.interval_time);
        expect(task.call_count).toBe(2);

        jasmine.clock().tick(task.interval_time);
        expect(task.call_count).toBe(2);


        weak_daemon.start();
        expect(task.call_count).toBe(2);

        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(2);
        
        jasmine.clock().tick(1);
        expect(task.call_count).toBe(3);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);
    });


    it('WeakDaemon.start(true) => stop => start ', function() {
        expect(task.call_count).toBe(0);

        weak_daemon.start(true);
        expect(task.call_count).toBe(1);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);

        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(1);

        // before first timeout

        jasmine.clock().tick(1);
        expect(task.call_count).toBe(2);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);
        
        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(2);

        // before second timeout

        jasmine.clock().tick(1);
        expect(task.call_count).toBe(3);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);

        
        weak_daemon.stop();

        jasmine.clock().tick(2 * task.interval_time);
        expect(task.call_count).toBe(3);

        jasmine.clock().tick(task.interval_time);
        expect(task.call_count).toBe(3);


        weak_daemon.start();
        expect(task.call_count).toBe(3);

        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(3);
        
        jasmine.clock().tick(1);
        expect(task.call_count).toBe(4);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);
    });
});





