describe('Without predefined events', function () {

    var test;

    function Test () {}

    Test.prototype = Object.create(EventTargetExtendable.prototype, {
        constructor: {
            value: Test
        }
    });

    beforeEach(function () {
        test = new Test();
    });

    afterEach(function () {
        test.removeAllListeners();
    });

    it('Instance should extends EventTargetExtendable', function () {
        expect(test instanceof EventTargetExtendable).toBe(true);
    });

    it('Listener should be added', function () {
        var added = test.addEventListener('test', function () {});
        expect(added).toBe(true);
    });

    it('Listener should be added and fired', function () {
        var fired = false,
            added = test.addEventListener('test', function () {
                fired = true;
            });
        test.dispatchEvent('test');
        expect(added).toBe(true);
        expect(fired).toBe(true);
    });

    it('Event argument should be passed', function () {
        var arg = null,
            data = 'test String';
        test.addEventListener('test', function (data) {
            arg = data;
        });
        test.dispatchEvent('test', data);
        expect(arg).toBe(data);
    });

    it('Few arguments should be passed', function () {
        var argsCount = 0;
        test.addEventListener('test', function (data) {
            argsCount = arguments.length;
        });
        test.dispatchEvent('test', 1, 2, 3);
        expect(argsCount).toBe(3);
    });

    it('Should not be able to add the same listener twice', function () {
        var listener = function () {},
            added1 = test.addEventListener('test', listener),
            added2 = test.addEventListener('test', listener);
        expect(added1).toBe(true);
        expect(added2).toBe(false);
    });

    it('Should execute more than 1 listener', function () {
        var res1, res2,
            listener1 = function () {res1 = true},
            listener2 = function () {res2 = true},
            added1 = test.addEventListener('test', listener1),
            added2 = test.addEventListener('test', listener2);
        test.dispatchEvent('test');
        expect(added1).toBe(true);
        expect(added2).toBe(true);
        expect(res1).toBe(true);
        expect(res2).toBe(true);
    });

    it('Should remove listener', function () {
        var res1 = 0,
            listener1 = function () {res1++};
        test.addEventListener('test', listener1);
        test.dispatchEvent('test');
        expect(res1).toBe(1);
        test.removeEventListener('test', listener1);
        test.dispatchEvent('test');
        expect(res1).toBe(1);
    });

    it('Should remove all listeners for specified type', function () {
        var results = [];
        test.addEventListener('test1', function () {
            results.push(1);
        });
        test.addEventListener('test1', function () {
            results.push(1);
        });
        test.addEventListener('test2', function () {
            results.push(1);
        });
        test.addEventListener('test2', function () {
            results.push(1);
        });
        test.dispatchEvent('test1');
        expect(results.length).toBe(2);
        test.dispatchEvent('test2');
        expect(results.length).toBe(4);
        test.removeAllListeners('test2');
        test.dispatchEvent('test1');
        expect(results.length).toBe(6);
        test.dispatchEvent('test2');
        expect(results.length).toBe(6);
    });

    it('Should remove all listeners', function () {
        var results = [];
        test.addEventListener('test1', function () {
            results.push(1);
        });
        test.addEventListener('test1', function () {
            results.push(1);
        });
        test.addEventListener('test2', function () {
            results.push(1);
        });
        test.addEventListener('test2', function () {
            results.push(1);
        });
        test.dispatchEvent('test1');
        expect(results.length).toBe(2);
        test.dispatchEvent('test2');
        expect(results.length).toBe(4);
        test.removeAllListeners();
        test.dispatchEvent('test1');
        expect(results.length).toBe(4);
        test.dispatchEvent('test2');
        expect(results.length).toBe(4);
    });

});