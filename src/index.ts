import {WeakDaemon} from './weak-daemon';


/* Mock it for testing purposes */
function getInstance(interval_time: number, caller: object|null, task: (...args:any[])=>any, task_arguments?: any[]): WeakDaemon {
    return new WeakDaemon(interval_time, caller, task, task_arguments);
}

/* Mock it for testing purposes */
function getClass(): typeof WeakDaemon {
    return WeakDaemon;
};


export {getInstance};
export {getClass};
export {WeakDaemon};
