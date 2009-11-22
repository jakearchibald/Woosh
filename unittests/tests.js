module('woosh');

test('Exists', 1, function() {
	equals(typeof woosh, 'object', 'woosh exists');
});

module('woosh.Test');

test('Creating instances', 5, function() {
	var func = function() {};
	
	equals(typeof woosh.Test, 'function', 'woosh.Test exists');
	
	var test = new woosh.Test(1, func);
	ok(test instanceof woosh.Test, '(new) is instance of woosh.Test');
	
	var test2 = woosh.Test(10, func);
	ok(test2 instanceof woosh.Test, '(no new) is instance of woosh.Test');
	equals(test2._loopCount, 10, '_loopCount set');
	equals(test2._testFunc, func, '_testFunc set');
});

test('Running a sync test', 6, function() {
	var testRunCount = 0,
		onCompleteFiredCount = 0;
	
	var test = new woosh.Test(1000000, function() {
		testRunCount++;
		return 'Hello';
	});
	
	test._onComplete = function() {
		onCompleteFiredCount++
	}
	
	equals(typeof test._run, 'function', 'woosh.Test#_run exists');
	
	test._run();
	equals(testRunCount, 1000000, '_testFunc was called correct number of times');
	equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
	equals(test._returnVal, 'Hello', '_returnVal set');
	equals(typeof test._result, 'number', '_result is number (' + test._result + ')');
	ok(test._result >= 0, '_result is a positive number (or 0)');
});

test('Handling errors in a sync test', 6, function() {
	var undefined,
		onCompleteFiredCount = 0,
		testRunCount = 0;
	
	var test = new woosh.Test(1000000, function() {
		testRunCount++
		return undefined();
	});
	
	test._onComplete = function() {
		onCompleteFiredCount++;
	}
	
	test._run();
	equals(testRunCount, 1, '_testFunc was called only once since it errored');
	equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
	equals(test._returnVal, undefined, '_returnVal is undefined');
	equals(test._result, null, '_result is null');
	ok(test._result >= 0, '_result is a positive number (or 0)');
	ok(test._error instanceof Error, '_error is Error');
});

module('woosh.AsyncTest');

test('Creating instances', 6, function() {
	var func = function() {};
	
	equals(typeof woosh.AsyncTest, 'function', 'woosh.AsyncTest exists');
	
	var test = new woosh.AsyncTest(1, func);
	ok(test instanceof woosh.AsyncTest, '(new) is instance of woosh.AsyncTest');
	ok(test instanceof woosh.Test, 'woosh.AsyncTest inherits from whoosh.Test');
	
	var test2 = woosh.AsyncTest(10, func);
	ok(test2 instanceof woosh.AsyncTest, '(no new) is instance of woosh.AsyncTest');
	equals(test2._loopCount, 10, '_loopCount set');
	equals(test2._testFunc, func, '_testFunc set');
});

test('Running an async test', 8, function() {
	stop();
	
	var testRunCount = 0,
		setTimeoutCallbackRunCount = 0,
		onCompleteFiredCount = 0;
	
	var test = new woosh.AsyncTest(10, function() {
		testRunCount++;
		setTimeout(function() {
			setTimeoutCallbackRunCount++;
			test.endTest('Hello');
		}, 60);
	});
	
	test._onComplete = function() {
		onCompleteFiredCount++;
		
		equals(testRunCount, 10, '_testFunc was called correct number of times');
		equals(setTimeoutCallbackRunCount, 10, 'setTimeout callback was called the correct number of times');
		equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
		equals(test._returnVal, 'Hello', '_returnVal set via endTest');
		equals(typeof test._result, 'number', '_result is number (' + test._result + ')');
		// Firefox seem to run setTimeouts too fast, which is why I'm using 500 rather than 600 here
		ok(test._result >= 500, '_result indicates setTimeout callbacks have been waited for');
		start();
	}
	
	equals(typeof test._run, 'function', 'woosh.AsyncTest#_run exists');
	equals(typeof test.endTest, 'function', 'woosh.AsyncTest#endTest exists');
	
	test._run();
});

test('Handling errors in an async test', 6, function() {
	stop();
	
	var undefined,
		testRunCount = 0,
		setTimeoutCallbackRunCount = 0,
		onCompleteFiredCount = 0;
	
	var test = new woosh.AsyncTest(10, function() {
		testRunCount++;
		setTimeout(function() {
			setTimeoutCallbackRunCount++;
			undefined();
			test.endTest('Hello');
		}, 60);
	});
	
	test._onComplete = function() {
		onCompleteFiredCount++;
		
		equals(testRunCount, 1, '_testFunc was called only once since it errored');
		equals(setTimeoutCallbackRunCount, 1, 'setTimeout callback was called only once since it errored');
		equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
		equals(test._returnVal, undefined, '_returnVal is undefined');
		equals(test._result, null, '_result is null');
		ok(test._error instanceof Error, '_error is Error');
		start();
	}
	
	test._run();
});

/*module('woosh.addTests');

test('woosh.addTests initial call', 8, function() {
	woosh.libs.fakeLib = ['unittests/assets/fakelib.js'];
	
	woosh.addTests('glow', {
		test1: function() {
			document.getElements
		}
	});
});*/