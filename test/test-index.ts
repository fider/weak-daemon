// '../../weak-daemon'  =>  leave it like this to test module interface
import {WeakDaemon, getInstance, getClass} from '../../weak-daemon';

/*+--------------------------------------------------------------------------+
  | ! Spy on WeakDaemon's task will not be good solution in this case        |
  |   because WeakDaemon may call task directly or bind it and then call,    |
  |   so stick to `monkey` iTask interface to preserve tests clear and easy  |
  +--------------------------------------------------------------------------+*/

describe('weak-daemon', function() {   


    it('Change in interface spotted - update package version.', function() {
        expect(typeof WeakDaemon).toBe('function');
        expect(typeof getInstance).toBe('function');
        expect(typeof getClass).toBe('function');

        expect(WeakDaemon).toBe(getClass());

        let weak_daemon = getInstance(1, {}, ()=>{});
        expect(weak_daemon instanceof WeakDaemon).toBe(true);
    });

    

    describe('Change in interface spotted - update package version.', function() {
        const EXPECTED_PROTO: any = [
            'constructor',
            'start',
            'stop',
            'isRunning',
            'interval',
            'task',
            'caller',
            'args',
            '_validateArgs'
        ];
        const ACTUAL_PROTO: any = <any>Object.getOwnPropertyNames( WeakDaemon.prototype );
        

        // Self-test for test code
        EXPECTED_PROTO.push('__missing');
        ACTUAL_PROTO.push('__unknown');



        it(`

            (!) For details check test code and compare ACTUAL_PROTO with EXPECTED_PROTO)

            `, function() {

            let weak_daemon: WeakDaemon = getInstance(1, {}, ()=>{});    
            const missing = EXPECTED_PROTO.filter( (property:string) => ( ! ACTUAL_PROTO.includes(property)) );

            expect(missing).toEqual(['__missing']);
        });



        it(`

            (!) For details check test code and compare ACTUAL_PROTO with EXPECTED_PROTO)

            `, function() {
            let weak_daemon: WeakDaemon = getInstance(1, {}, ()=>{});
            const unknown = ACTUAL_PROTO.filter( (property:string) => ( ! EXPECTED_PROTO.includes(property)) );

            expect(unknown).toEqual(['__unknown']);
        });
        
    });

});