/// <reference types="node" />
/**
 * Weak daemon is just object wrapper for setInterval.
 * It forces you to remember about binding context and do some other stuff to make your life easier.
 *
 * Interval is 'unref' by default so it will NOT prevent application to close if Node event loop is empty.
 * Want the same functionality without 'unref'? Use other daemon module from npm.
 *
 * @throws constructor throws if invalid parameters provided
 */
export declare class WeakDaemon {
    protected _interval_time: number;
    protected _task: (...args: any[]) => any;
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
    constructor(interval_time: number, caller: object | null, task: (...args: any[]) => any, task_arguments?: any[]);
    /**
     * Immediate call + setInterval
     */
    start(immediate_call?: boolean): void;
    stop(): void;
    isRunning(): boolean;
    readonly interval: number;
    readonly task: (...args: any[]) => any;
    readonly caller: object | null;
    readonly args: any[];
    /**
     * @private
     * @param {number}      interval_time               0 < Integer <= 0x7FFFFFFF (max setInterval delay)
     * @param {null|Object} caller             Object if param `task` uses `this` keyword ELSE set null
     * @param {function}    task                     function
     * @param {Array}       [task_arguments_array]   optional array of arguments that task function will use
     *
     * @throws {TypeError} If you do not like this just do not use this module
     */
    _validateArgs(interval_time: number, caller: object | null, task: (...args: any[]) => any, task_arguments_array: any[]): void;
}
