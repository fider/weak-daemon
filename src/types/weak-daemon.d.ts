import {WeakDaemon} from '../index';


declare module 'weak-daemon' {

    export interface Task {
        (...args: any[]): any;
    }

    // declare class WeakDaemon {}
}

