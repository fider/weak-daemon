
import {WeakDaemon, getInstance, getClass} from '../dist/index';


describe('weak-daemon', function() {   

    it('changes in interface should cause next major release version', function() {
        expect(typeof WeakDaemon).toBe('function');
        expect(typeof getInstance).toBe('function');
        expect(typeof getClass).toBe('function');
    });

});