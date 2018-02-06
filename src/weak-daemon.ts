/** Madness? No, just potential error detector */
const MAX_INTERVAL = 0x7FFFFFFF; // 2147483647





/**
 * Weak daemon is just object wrapper for setInterval.
 * It forces you to remember about binding context and do some other stuff to make your life easier.
 *
 * Interval is 'unref' by default so it will NOT prevent application to close if Node event loop is empty.
 * Want the same functionality without 'unref'? Use other daemon module from npm.
 *
 * @throws constructor throws if invalid parameters provided
 */
export class WeakDaemon {
    
    protected _interval_time: number;
    protected _task: (...args:any[])=>any;
    protected _args: any[];
    protected _caller: object | null;
    protected _interval_id: NodeJS.Timer | null;

    
    /**
     * @param {number}      interval_time
     * @param {null|Object} caller             Object if param `task` uses `this` keyword ELSE set null
     * @param {function}    task                     callback, task
     * @param {Array}       [task_arguments_array]
     *
     * @throws {TypeError} If you do not like this just do not use this module
     */
    constructor(
            interval_time: number,
            caller: object|null,
            task: (...args:any[])=>any,
            task_arguments: any[] = []) {
                
        this._validateArgs(interval_time, caller, task, task_arguments);
        
        this._interval_time = interval_time;
        this._caller = caller;
        this._args = task_arguments;
        this._task = task;
        this._interval_id = null;
    }


    
    /**
     * Immediate call + setInterval
     */
    start(immediate_call = false) : void {
        if( this._interval_id ) {
            throw new Error(`
                Potential error detected:
                Timestamp:${(new Date()).toUTCString()}
                WeakDaemon instance start() multiple call.

                *If you want to have multiple daemons running create more instances.
            `);
        }


        this._interval_id = <any>setInterval(
            this._task.bind(this._caller, ...this._args),
            this._interval_time);

        this._interval_id.unref();
        
        if( immediate_call === true ) {
            this._task.call(this._caller, ...this._args);
        }
    }


    
    stop() : void {
        clearInterval(this._interval_id);
        this._interval_id = null;
    }
    
    
    
    isRunning() : boolean {
        return (this._interval_id) ? true : false;
    }



    get interval() : number {
        return this._interval_time;
    }



    get task() : (...args:any[])=>any {
        return this._task;        
    }



    get caller() : object | null {
        return this._caller;
    }



    get args() : any[] {
        return this._args;
    }
    

    /**
     * @private
     * @param {number}      interval_time               0 < Integer <= 0x7FFFFFFF (max setInterval delay)
     * @param {null|Object} caller             Object if param `task` uses `this` keyword ELSE set null
     * @param {function}    task                     function
     * @param {Array}       [task_arguments_array]   optional array of arguments that task function will use
     *
     * @throws {TypeError} If you do not like this just do not use this module
     */
    _validateArgs(interval_time: number, caller: object|null, task: (...args:any[])=>any, task_arguments_array: any[]) : void {
        if( !(
            Number.isInteger(interval_time) && interval_time > 0 && interval_time <= MAX_INTERVAL  &&
            typeof(caller) === 'object' && /* Null is also Object */
            typeof(task) === 'function' &&
            Array.isArray(task_arguments_array)) ) {

            throw new TypeError(`Invalid arguments.
                Expected:
                    1st - integer x, where:  0 < x <= ${MAX_INTERVAL}
                    2rd - Object or null     (object in case if task uses 'this' keyword)
                    3nd - function
                    4th - Array or undefined (if no arguments then leave empty/undefined)
                Actual:
                    1st - ${interval_time}
                    2nd - ${caller}
                    3rd - ${task}
                    4th - ${task_arguments_array}`)
        }
    }
}