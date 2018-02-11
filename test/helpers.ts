import {WeakDaemon} from '../lib/index'


export interface iTask {
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


export interface TestableWeakDaemon {
    /* Expose protected members */
    _interval_time: number;
    _task: (...args: any[])=>any;
    _caller: object | null;
    _args: any[] | undefined;
    _interval_id: any;

    /* All others */
    [index:string]:any
}


/* Test for those who not TypeScript-ing */
export class NotTypedWeakDaemon extends WeakDaemon {
    constructor(...args: any[]) {
        super(args[0], args[1], args[2], args[3]);
    }
}


export function createTask(): iTask {
    const task: any = {
        caller: {},
        interval_time: 12345,
        input_args: ['a', 'B', 7],
    
        call_count: 0,
        recent_caller: null,
        recent_args: null,
        task_owner: {}
    };
    task.task_owner.taskForWeakDaemon = function taskForWeakDaemon(...args:any[]): any{
        task.call_count++;
        task.recent_caller = this;
        task.recent_args = args;
    };
    
    return task;
}
