module('woosh');

test('Exists', 1, function() {
	equals(typeof woosh, 'object', 'woosh exists');
});

module('woosh._utils');

test('urlEncode', 3, function() {
	equals(typeof woosh._utils.urlEncode, 'function', 'woosh._utils.urlEncode is function');
	
	var obj = {
		hello: 'world',
		foo: ['bar', 'bunz']
	}
	equals(woosh._utils.urlEncode(obj), 'hello=world&foo=bar&foo=bunz', 'Basic encode');
	equals(woosh._utils.urlEncode({}), '', 'Empty object encode');
});

test('urlDecode', 3, function() {
	equals(typeof woosh._utils.urlDecode, 'function', 'woosh._utils.urlDecode is function');
	
	var obj = {
		hello: ['world'],
		foo: ['bar', 'bunz']
	}
	same(woosh._utils.urlDecode('hello=world&foo=bar&foo=bunz'), obj, 'Basic decode');
	same(woosh._utils.urlDecode(''), {}, 'Empty string decode');
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

test('Running a sync test', 7, function() {
	var testRunCount = 0,
		onCompleteFiredCount = 0;
	
	var test = new woosh.Test(1000000, function(testParam) {
		if (!testRunCount) {
			equals(testParam, test, 'Test is passed in as parameter');
		}
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

test('Handling errors in a sync test', 5, function() {
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
	equals(test._result, undefined, '_result is undefined');
	ok(test._error instanceof Error, '_error is Error');
});

test('Overriding results and units', 10, function() {

	var test1 = new woosh.Test(1, function() {
		equals(typeof this.result, 'function', 'woosh.Test#result is function');
		this.result(123);
		return 'Hello';
	});
	
	var test2 = new woosh.Test(1, function() {
		this.result(456, 'cm');
		return 'Hello';
	});
	
	var test3 = new woosh.Test(1, function() {
		this.result(789, 'fps', true);
		return 'Hello';
	});
	
	test1._run();
	test2._run();
	test3._run();
	
	equals(test1._result, 123, 'test1._result');
	equals(test1._unit, 'ms', 'test1._unit');
	equals(test1._highestIsBest, false, 'test1._highestIsBest');
	
	equals(test2._result, 456, 'test2._result');
	equals(test2._unit, 'cm', 'test2._unit');
	equals(test2._highestIsBest, false, 'test2._highestIsBest');
	
	equals(test3._result, 789, 'test3._result');
	equals(test3._unit, 'fps', 'test3._unit');
	equals(test3._highestIsBest, true, 'test3._highestIsBest');
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

test('Running an async test', 9, function() {
	stop();
	
	var testRunCount = 0,
		setTimeoutCallbackRunCount = 0,
		onCompleteFiredCount = 0;
	
	var test = new woosh.AsyncTest(10, function(testParam) {
		if (!testRunCount) {
			equals(testParam, test, 'Test is passed in as parameter');
		}
		testRunCount++;
		setTimeout(function() {
			setTimeoutCallbackRunCount++;
			test.endTest('Hello');
		}, 50);
	});
	
	test._onComplete = function() {
		onCompleteFiredCount++;
		
		equals(testRunCount, 10, '_testFunc was called correct number of times');
		equals(setTimeoutCallbackRunCount, 10, 'setTimeout callback was called the correct number of times');
		equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
		equals(test._returnVal, 'Hello', '_returnVal set via endTest');
		equals(typeof test._result, 'number', '_result is number (' + test._result + ')');
		ok(test._result >= 500, '_result indicates setTimeout callbacks have been waited for');
		start();
	}
	
	equals(typeof test._run, 'function', 'woosh.AsyncTest#_run exists');
	equals(typeof test.endTest, 'function', 'woosh.AsyncTest#endTest exists');
	
	test._run();
});

test('Handling errors in an async test', 6, function() {
	stop(2000);
	
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
		equals(test._result, undefined, '_result is undefined');
		ok(test._error instanceof Error, '_error is Error');
		start();
	}
	
	test._run();
});

module('woosh._TestSet');

test('woosh._TestSet', 6, function() {
	stop();
	
	equals(typeof woosh._TestSet, 'function', 'woosh._TestSet is function');
	
	var log = [];
	
	var testSet = new woosh._TestSet({
		'$preTest': function(prevTest, nextTest) {
			log.push('$preTest prev: ' + prevTest);
			log.push('$preTest next: ' + nextTest);
		},
		'functionTest': function() {
			log.push('functionTest');
			return 'hello';
		},
		'TestTest': woosh.Test(4, function() {
			log.push('TestTest');
			return 'world';
		}),
		'AsyncTestTest': woosh.AsyncTest(3, function() {
			var test = this;
			setTimeout(function() {
				log.push('AsyncTestTest');
				test.endTest('fooBar');
			}, 50);
		})
	});
	
	var i = 0;
	
	testSet.onTestComplete = function(testName, test) {
		i++;
		log.push('onTestComplete: ' + testName);
		ok(test instanceof woosh.Test, 'test param is instanceof woosh.Test');
		
		if (i == testSet.testNames.length) {
			same(log, [
				'$preTest prev: undefined',
				'$preTest next: functionTest',
				'functionTest',
				'onTestComplete: functionTest',
				'$preTest prev: functionTest',
				'$preTest next: TestTest',
				'TestTest','TestTest','TestTest','TestTest',
				'onTestComplete: TestTest',
				'$preTest prev: TestTest',
				'$preTest next: AsyncTestTest',
				'AsyncTestTest', 'AsyncTestTest', 'AsyncTestTest',
				'onTestComplete: AsyncTestTest'
			], 'Functions all called in correct order');
			start();
		} else {
			testSet.run( testSet.testNames[i] );
		}		
	};
	
	same(testSet.testNames, ['functionTest', 'TestTest', 'AsyncTestTest'], 'woosh._TestSet#testNames set');
	
	testSet.run( testSet.testNames[i] );
});

module('woosh._TestFrame');

test('creating woosh._TestFrames', 15, function() {
	stop(2000);
	
	equals(typeof woosh._TestFrame, 'function', 'woosh._TestFrame is function');
	
	var framesReady = 0;
	function testFrameReady() {
		ok(true, 'Frame Ready');
		framesReady++;
		if (framesReady == 2) {
			allFramesReady();
		}
	}
	
	function allFramesReady() {
		equals(typeof testFrame1.window, 'object', 'testFrame1 has window');
		equals(typeof testFrame1.window.fakeLib1, 'object', 'fakeLib1 created in testFrame1');
		equals(typeof testFrame1.window.fakeLib2, 'undefined', 'fakeLib2 not created in testFrame1');
		ok(testFrame1.window.fakeLib1.file2Loaded, 'fakeLib1 file2Loaded in testFrame1');
		equals(testFrame1.window.document.getElementById('fakeLib1Elm').offsetWidth, 300, 'fakeLib1 CSS loaded in testFrame1');
		equals(typeof testFrame1.testSet, 'object', 'testFrame1.testSet defined');
		
		equals(typeof testFrame2.window, 'object', 'testFrame2 has window');
		equals(typeof testFrame2.window.fakeLib2, 'object', 'fakeLib2 created in testFrame2');
		equals(typeof testFrame2.window.fakeLib1, 'undefined', 'fakeLib1 not created in testFrame2');
		ok(testFrame2.window.fakeLib2.file2Loaded, 'fakeLib2 file2Loaded in testFrame2');
		equals(testFrame2.window.document.getElementById('fakeLib2Elm').offsetWidth, 300, 'fakeLib2 CSS loaded in testFrame2');
		equals(typeof testFrame2.testSet, 'object', 'testFrame2.testSet defined');
		
		start();
	}
	
	var testFrame1 = new woosh._TestFrame('fakeLib1', testFrameReady);
	var testFrame2 = new woosh._TestFrame('fakeLib2', testFrameReady);
});

/*module('woosh._Conductor');

test('creating a woosh._Conductor', 0, function() {
	stop(2000);
	
	equals(typeof woosh._Conductor, 'function', 'woosh._Conductor is function');
	var log = [];
	
	var conductor = new woosh._Conductor(['fakeLib1', 'fakeLib2'], function() {
		conductor.onStart = function() {
			log.push('onStart');
		}
		conductor.onTestResult = function(testName, tests) {
			log.push('onTestResult: ' + testName);
		}
		conductor.onComplete = function() {
			log.push('onComplete');
			start();
		}
		
		conductor.start();
	});
	
	equals(typeof conductor.start, 'function', 'woosh._Conductor#start is function');
})*/