
// import * as weak_daemon_module from "../../weak-daemon";

import {WeakDaemon} from '../dist/weak-daemon.js';

const {inspect: i} = require('util');

interface TestableWeakDaemon {
    /* Protected members */
    _interval_time: number;
    _task: (...args: any[])=>any;
    _caller: object | null;
    _args: any[] | undefined;
    _interval_id: any;

    /* All others */
    [index:string]:any
}




/*+=======================================================================+
  | ! Spy on WeakDaemon's task will not be good solution in this case     |
  |   because WeakDaemon may call task directly or bind it and then call, |
  |   so stick to this monkey-schema to preserve tests clear and easy     |
  +=======================================================================+*/
interface iTask {
    caller: object;
    interval_time: number;
    input_args: any[];

    call_count: number;
    recent_caller: null | object;
    recent_args: null | any[];
    task_owner: {
        taskForWeakDaemon: (...args:any[]) => any
    }
}



describe('Unit test weak-daemon:', function() {
    let weak_daemon: TestableWeakDaemon;


    const TASK: iTask = {
        caller: {},
        interval_time: 12345,
        input_args: ['a', 'B', 7],

        call_count: 0,
        recent_caller: null,
        recent_args: null,
        task_owner: {
            taskForWeakDaemon(...args:any[]): any {
                TASK.call_count++;
                TASK.recent_caller = this;
                TASK.recent_args = args;
            }
        }
    };




    beforeEach(function() {
        TASK.call_count = 0;
        TASK.recent_caller = null;
        TASK.recent_args = null;

        weak_daemon = <any>new WeakDaemon(TASK.interval_time, TASK.caller, TASK.task_owner.taskForWeakDaemon, TASK.input_args);
    });



    it('WeakDaemon.constructor() protected members initialization', function() {
        expect(weak_daemon._interval_time).toBe(TASK.interval_time);
        expect(weak_daemon._task).toBe(TASK.task_owner.taskForWeakDaemon);
        expect(weak_daemon._args).toBe(TASK.input_args);
        expect(weak_daemon._caller).toBe(TASK.caller);
        expect(weak_daemon._interval_id).toBe(null);
    });



    it('WeakDaemon.constructor() should not call task nor start timer', function() {
        TASK.call_count = 0;
        spyOn(global, 'setInterval');
        spyOn(global, 'setTimeout');
        const setInterval_spy = <jasmine.Spy> global.setInterval;
        const setTimeout_spy = <jasmine.Spy> global.setTimeout;

        weak_daemon = <any> new WeakDaemon(TASK.interval_time, TASK.caller, TASK.task_owner.taskForWeakDaemon, TASK.input_args);
        
        expect(TASK.call_count).toBe(0);
        expect(setInterval_spy).toHaveBeenCalledTimes(0);
        expect(setTimeout_spy).toHaveBeenCalledTimes(0);
    });



    it('WeakDaemon.start(undefined=false) check if setTimeout was called with provided task', function() {
        spyOn(global, 'setInterval').and.callThrough();
        const setInterval_spy = <jasmine.Spy>global.setInterval;

        weak_daemon.start();
        expect(setInterval_spy).toHaveBeenCalledTimes(1);
        expect(setInterval_spy.calls.mostRecent().args[1]).toBe( TASK.interval_time );
        expect(setInterval_spy.calls.mostRecent().args[0].name).toBe('bound taskForWeakDaemon');
    });

    it('WeakDaemon.start(false) check if setTimeout was called with provided task', function() {
        spyOn(global, 'setInterval').and.callThrough();
        const setInterval_spy = <jasmine.Spy>global.setInterval;

        weak_daemon.start(false);
        expect(setInterval_spy).toHaveBeenCalledTimes(1);
        expect(setInterval_spy.calls.mostRecent().args[1]).toBe( TASK.interval_time );
        expect(setInterval_spy.calls.mostRecent().args[0].name).toBe('bound taskForWeakDaemon');
    });

    it('WeakDaemon.start(true) check if setTimeout was called with provided task', function() {
        spyOn(global, 'setInterval').and.callThrough();
        const setInterval_spy = <jasmine.Spy>global.setInterval;

        weak_daemon.start(true);
        expect(setInterval_spy).toHaveBeenCalledTimes(1);
        expect(setInterval_spy.calls.mostRecent().args[1]).toBe( TASK.interval_time );
        expect(setInterval_spy.calls.mostRecent().args[0].name).toBe('bound taskForWeakDaemon');
    });



    it('WeakDaemon.start(false)', function() {
        weak_daemon.start(false);

        expect(TASK.call_count).toBe(0);
        expect(TASK.recent_caller).toBe(null);
        expect(TASK.recent_args).toBe(null);
    });
    
    it('WeakDaemon.start(undefined=false) check if default argument immediate_call==false', function() {
        weak_daemon.start(false);

        expect(TASK.call_count).toBe(0);
        expect(TASK.recent_caller).toBe(null);
        expect(TASK.recent_args).toBe(null);
    });

    it('WeakDaemon.start(true)', function() {
        expect(TASK.call_count).toBe(0);
        weak_daemon.start(true);

        expect(TASK.call_count).toBe(1);
        expect(TASK.recent_caller).toBe(TASK.caller);
        expect(TASK.recent_args[0]).toBe(TASK.input_args[0]);
        expect(TASK.recent_args[1]).toBe(TASK.input_args[1]);
        expect(TASK.recent_args[2]).toBe(TASK.input_args[2]);
    });

    // it('WeakDaemon.start( false )', function() {
    //     spyOn(global, 'setInterval').and.callThrough();
    //     spyOn(weak_daemon, '_task').and.callThrough();
        
    //     let setInterval_spy:any = <any>global.setInterval;
    //     let _task_spy = <jasmine.Spy>weak_daemon._task;

    //     weak_daemon.start(false);
    //     expect(global.setInterval).toHaveBeenCalledTimes(1);        
    //     expect(setInterval_spy.calls.mostRecent().args[0]).toBe( weak_daemon._task );
    //     expect(setInterval_spy.calls.mostRecent().args[1]).toBe( TASK.interval_time );
    //     expect(_task_spy).toHaveBeenCalledTimes(0);
    // });



    // it('WeakDaemon.start( true )', function() {
    //     spyOn(global, 'setInterval').and.callThrough();
    //     spyOn(weak_daemon, '_task').and.callThrough();

    //     let setInterval_spy = <jasmine.Spy>global.setInterval;
    //     let _task_spy = <jasmine.Spy>weak_daemon._task;


    //     weak_daemon.start(true);
        
    //     expect(setInterval_spy).toHaveBeenCalledTimes(1);
    //     expect(setInterval_spy.calls.mostRecent().args[0]).toBe( weak_daemon._task );
    //     expect(setInterval_spy.calls.mostRecent().args[1]).toBe( TASK.interval_time );

    //     expect(_task_spy).toHaveBeenCalledTimes(1);
    //     expect(TASK.recent_caller).toBe( TASK.caller );
    //     expect(TASK.recent_args[0]).toBe( 'a' );
    //     expect(TASK.recent_args[1]).toBe( 'B' );
    //     expect(TASK.recent_args[2]).toBe( 'c' );
    // });



    // it('WeakDaemon.stop() single and multiple', function() {
    //     spyOn(global, 'clearInterval').and.callThrough();
    //     let clearInterval_spy = <jasmine.Spy>global.clearInterval;

    //     weak_daemon.start();
    //     let id: number|NodeJS.Timer = weak_daemon._interval_id;
    //     expect(weak_daemon._interval_id).not.toBe(null);

    //     weak_daemon.stop();
    //     expect(weak_daemon._interval_id).toBe(null);
    //     expect(clearInterval_spy).toHaveBeenCalledTimes(1);
    //     expect(clearInterval_spy).toHaveBeenCalledWith(id);

    //     weak_daemon.stop();
    //     expect(weak_daemon._interval_id).toBe(null);
    //     expect(clearInterval_spy).toHaveBeenCalledTimes(2);
    //     expect(clearInterval_spy).toHaveBeenCalledWith(null);
    // });



    // it('WeakDaemon.isRunning()', function() {
    //     expect( weak_daemon.isRunning() ).toBe( false );
    //     weak_daemon.start();
    //     expect( weak_daemon.isRunning() ).toBe( true );
    //     weak_daemon.stop();
    //     expect( weak_daemon.isRunning() ).toBe( false );
    //     weak_daemon.start();
    //     expect( weak_daemon.isRunning() ).toBe( true );
    //     weak_daemon.stop();
    //     expect( weak_daemon.isRunning() ).toBe( false );
    // });



    // it('WeakDaemon.get interval()', function() {
    //     expect(weak_daemon.interval).toBe(TASK.interval_time);
    // });



    it('WeakDaemon.get task()', function() {
        expect(weak_daemon.task).toBe(TASK.task_owner.taskForWeakDaemon);
    });



    it('WeakDaemon.get args()', function() {
        expect(weak_daemon.args).toBe(TASK.input_args);
    });



    it('WeakDaemon.get caller()', function() {
        expect(weak_daemon.caller).toBe(TASK.caller);
    });
});


describe('weak-daemon.getInstance()', function() {

});



describe('weak-daemon.getClass()', function() {
    
});
