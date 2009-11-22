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
	equals(typeof test._result, 'number', '_result set (' + test._result + ')');
	ok(test._result >= 0, '_result is a positive number (or 0)');
});