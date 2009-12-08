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
		foo: ['bar', 'Bunz']
	}
	same(woosh._utils.urlDecode('hello=world&foo=bar&foo=Bunz'), obj, 'Basic decode');
	same(woosh._utils.urlDecode(''), {}, 'Empty string decode');
});

test("apply", 2, function() {
	equals(typeof woosh._utils.apply, 'function', "apply is function");
	same(woosh._utils.apply({foo: "hello", bar: "world"}, {bar: "everyone"}), {foo: "hello", bar: "everyone"}, "Properties copied");
});

test("extend", 12, function() {
 
	equals(typeof woosh._utils.extend, 'function', "extend is function");
 
	var BaseClass = function() {
		this.a = "From Base";
		this.b = "From Base";
	}
	BaseClass.prototype = {
		c: function() {
			return "From Base";
		},
		d: function() {
			return "From Base";
		}
	};
	var SubClass = function() {
		BaseClass.call(this);
		this.b = "From Sub";
		this.e = "From Sub";
	}
	woosh._utils.extend(SubClass, BaseClass, {
		d: function() {
			return "From Sub";
		},
		f: function() {
			return "From Sub";
		}
	});
 
	var myBase = new BaseClass();
	var mySub = new SubClass();
 
	equals(myBase.a, "From Base", "Base a prop");
	equals(myBase.b, "From Base", "Base b prop");
	equals(myBase.c(), "From Base", "Base c function");
	equals(myBase.d(), "From Base", "Base d function");
	equals(mySub.a, "From Base", "Sub a prop (inherited)");
	equals(mySub.b, "From Sub", "Sub b prop (overwritten)");
	equals(mySub.c(), "From Base", "Sub c function (inherited)");
	equals(mySub.d(), "From Sub", "Sub d function (overwritten)");
	equals(mySub.e, "From Sub", "Sub e prop (new)");
	equals(mySub.f(), "From Sub", "Sub f function (new)");
	equals(SubClass.base, BaseClass, "sub.base property set");
});

test('constructorName', 5, function() {
	equals(typeof woosh._utils.constructorName, 'function', 'constructorName exists');

	function TestClass(){};
	function TestSubclass(){};
	woosh._utils.extend(TestSubclass, TestClass);
	
	var myTestClass = new TestClass;
	var myTestSubclass = new TestSubclass;
	
	equals(woosh._utils.constructorName(myTestClass), 'TestClass', 'Detect TestClass');
	equals(woosh._utils.constructorName(myTestSubclass), 'TestSubclass', 'Detect TestSubclass');
	
	var myTest = woosh.Test(1, function() {});
	var myAsyncTest = woosh.AsyncTest(1, function() {});
	
	equals(woosh._utils.constructorName(myTest), 'Test', 'Detect Test');
	equals(woosh._utils.constructorName(myAsyncTest), 'AsyncTest', 'Detect AsyncTest');
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

test('Running a sync test', 12, function() {
	var testRunCount = 0,
		onCompleteFiredCount = 0,
		result;
	
	var test = new woosh.Test(1000000, function(testParam) {
		if (!testRunCount) {
			equals(testParam, test, 'Test is passed in as parameter');
		}
		testRunCount++;
		return 'Hello';
	});
	
	equals(typeof test._run, 'function', 'woosh.Test#_run exists');
	
	test._run(function(r) {
		result = r;
		onCompleteFiredCount++;
	});
	
	equals(testRunCount, 1000000, '_testFunc was called correct number of times');
	equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
	equals(test._returnVal, 'Hello', '_returnVal set');
	equals(typeof test._result, 'number', '_result is number (' + test._result + ')');
	ok(result instanceof woosh.Result, 'Result object provided');
	equals(result.result, test._result, 'Result object has result');
	equals(result.returnVal, test._returnVal, 'Result object has returnVal');
	equals(result.loopCount, 1000000, 'Result object has loopCount');
	equals(result.type, 'Test', 'Result object has test');
	ok(result.result >= 0, 'result is a positive number (or 0)');
});

test('Handling errors in a sync test', 11, function() {
	var undefined,
		onCompleteFiredCount = 0,
		testRunCount = 0,
		result;
	
	var test = new woosh.Test(1000000, function() {
		testRunCount++
		return undefined();
	});
	
	test._run(function(r) {
		onCompleteFiredCount++;
		result = r;
	});
	equals(testRunCount, 1, '_testFunc was called only once since it errored');
	equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
	equals(test._returnVal, undefined, '_returnVal is undefined');
	equals(test._result, undefined, '_result is undefined');
	ok(test._error instanceof Error, '_error is Error');
	ok(result instanceof woosh.Result, 'Result object provided');
	equals(result.result, test._result, 'Result object has result');
	equals(result.returnVal, test._returnVal, 'Result object has returnVal');
	equals(result.loopCount, 1000000, 'Result object has loopCount');
	equals(result.type, 'Test', 'Result object has test');
	equals(result.error, test._error, 'Result object has error');
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
	
	var result1, result2, result3;
	
	test1._run(function(result) {
		result1 = result;
	});
	test2._run(function(result) {
		result2 = result;
	});
	test3._run(function(result) {
		result3 = result;
	});
	
	equals(result1.result, 123, 'result1.result');
	equals(result1.unit, 'ms', 'result1.unit');
	equals(result1.highestIsBest, false, 'result1.highestIsBest');
	
	equals(result2.result, 456, 'result2.result');
	equals(result2.unit, 'cm', 'result2.unit');
	equals(result2.highestIsBest, false, 'result2.highestIsBest');
	
	equals(result3.result, 789, 'result3.result');
	equals(result3.unit, 'fps', 'result3.unit');
	equals(result3.highestIsBest, true, 'result3.highestIsBest');
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
	
	equals(typeof test._run, 'function', 'woosh.AsyncTest#_run exists');
	equals(typeof test.endTest, 'function', 'woosh.AsyncTest#endTest exists');
	
	test._run(function(result) {
		onCompleteFiredCount++;
		
		equals(testRunCount, 10, '_testFunc was called correct number of times');
		equals(setTimeoutCallbackRunCount, 10, 'setTimeout callback was called the correct number of times');
		equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
		equals(result.returnVal, 'Hello', 'returnVal set via endTest');
		equals(typeof result.result, 'number', 'result is number (' + test._result + ')');
		ok(result.result >= 500, 'result indicates setTimeout callbacks have been waited for');
		start();
	});
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
	
	test._run(function(result) {
		onCompleteFiredCount++;
		
		equals(testRunCount, 1, '_testFunc was called only once since it errored');
		equals(setTimeoutCallbackRunCount, 1, 'setTimeout callback was called only once since it errored');
		equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
		equals(result.returnVal, undefined, '_returnVal is undefined');
		equals(result.result, undefined, '_result is undefined');
		ok(result.error instanceof Error, '_error is Error');
		start();
	});
});

module('woosh.Result & woosh.LibraryResult');

test('woosh.Result serializing & unserializing', 12, function() {
	var result = new woosh.Result();
	result.result = 123;
	result.unit   = 'fps';
	result.type   = 'Test';
	result.error  = new Error('All went wrong');
	result.loopCount = 100;
	result.returnVal = 60;
	result.highestIsBest = false;
	var serial = result.serialize();
	
	var anotherResult = new woosh.Result().unserialize(serial);
	
	equals(anotherResult.result, 123, 'result');
	equals(anotherResult.unit, 'fps', 'unit');
	equals(anotherResult.type, 'Test', 'type');
	equals(anotherResult.error.message, 'All went wrong', 'error.message');
	equals(anotherResult.loopCount, 100, 'loopCount');
	equals(typeof anotherResult.returnVal, 'number', 'returnVal type');
	equals(anotherResult.returnVal, 60, 'returnVal');
	equals(anotherResult.highestIsBest, false, 'highestIsBest');
	
	result = new woosh.Result();
	result.returnVal = 'Hello';
	serial = result.serialize();
	
	anotherResult = new woosh.Result().unserialize(serial);
	
	equals(typeof anotherResult.returnVal, 'string', 'returnVal type');
	equals(anotherResult.returnVal, 'Hello', 'returnVal');
	
	result = new woosh.Result();
	result.returnVal = undefined;
	serial = result.serialize();
	
	anotherResult = new woosh.Result().unserialize(serial);
	
	equals(typeof anotherResult.returnVal, 'undefined', 'returnVal type');
	equals(anotherResult.returnVal, undefined, 'returnVal');
});

test('woosh.LibraryResult serializing & unserializing', 3, function() {
	var result = new woosh.Result();
	result.result = 123;
	result.unit   = 'fps';
	result.type   = 'Test';
	result.loopCount = 100;
	result.returnVal = 60;
	result.highestIsBest = false;
	
	var result2 = new woosh.Result();
	result2.result = 456;
	result2.unit   = 'ms';
	result2.type   = 'AsyncTest';
	result2.loopCount = 100;
	result2.returnVal = 60;
	result2.highestIsBest = false;
	
	var libraryResult = new woosh.LibraryResult('My library');
	libraryResult.results = {
		'result1': result,
		'result2': result2
	};
	
	var serial = libraryResult.serialize();
	
	var anotherLibraryResult = new woosh.LibraryResult().unserialize(serial);
	
	same(libraryResult, anotherLibraryResult, 'Serialized & Unserialized');
	same(anotherLibraryResult.results.result1, libraryResult.results.result1, 'result1 Serialized & Unserialized');
	same(anotherLibraryResult.results.result2, libraryResult.results.result2, 'result2 Serialized & Unserialized');
});

module('woosh._LibraryTest');

test('woosh._LibraryTest', 6, function() {
	stop();
	
	equals(typeof woosh._LibraryTest, 'function', 'woosh._LibraryTest is function');
	
	var log = [];
	
	var libraryTest = new woosh._LibraryTest('Library', {
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
	
	same(libraryTest.testNames, ['functionTest', 'TestTest', 'AsyncTestTest'], 'woosh._LibraryTest#testNames set');
	
	libraryTest.run(libraryTest.testNames[i], function(testName, result) {
		i++;
		log.push('onTestComplete: ' + testName);
		equals(woosh._utils.constructorName(result), 'Result', 'result param is instanceof woosh.Result');
		if (i == libraryTest.testNames.length) {
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
			libraryTest.run( libraryTest.testNames[i], arguments.callee );
		}		
	});
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
		equals(typeof testFrame1.libraryTest, 'object', 'testFrame1.libraryTest defined');
		
		equals(typeof testFrame2.window, 'object', 'testFrame2 has window');
		equals(typeof testFrame2.window.fakeLib2, 'object', 'fakeLib2 created in testFrame2');
		equals(typeof testFrame2.window.fakeLib1, 'undefined', 'fakeLib1 not created in testFrame2');
		ok(testFrame2.window.fakeLib2.file2Loaded, 'fakeLib2 file2Loaded in testFrame2');
		equals(testFrame2.window.document.getElementById('fakeLib2Elm').offsetWidth, 300, 'fakeLib2 CSS loaded in testFrame2');
		equals(typeof testFrame2.libraryTest, 'object', 'testFrame2.libraryTest defined');
		
		start();
	}
	
	var testFrame1 = new woosh._TestFrame('fakeLib1', testFrameReady);
	var testFrame2 = new woosh._TestFrame('fakeLib2', testFrameReady);
});

module('woosh._TestRunner');

test('creating all equal woosh._TestRunner', 16, function() {
	stop(2000);
	
	equals(typeof woosh._TestRunner, 'function', 'woosh._TestRunner is function');
	
	var nullLib1TestRan = false,
		nullLib2TestRan = false;
	
	var nullLib1LibrarySet = new woosh._LibraryTest('nullLib1', {
		'test1': new woosh.Test(1, function(test) {
			nullLib1TestRan = true;
			test.result(5, 'fps', true);
			return 50;
		})
	});
	
	var nullLib2LibrarySet = new woosh._LibraryTest('nullLib2', {
		'test1': new woosh.Test(1, function(test) {
			nullLib2TestRan = true;
			test.result(1, 'fps', true);
			return 50;
		})
	});
	
	var myTestSet = new woosh._TestRunner({
		'nullLib1': nullLib1LibrarySet,
		'nullLib2': nullLib2LibrarySet
	});
	
	myTestSet.run('test1', function(libraryName, result) {
		equals(woosh._utils.constructorName(result), 'Result', 'result is a Result');
	}, function(resultComparison) {
		ok(nullLib2TestRan, 'nullLib1TestRan');
		ok(nullLib2TestRan, 'nullLib2TestRan');
		ok(true, 'onComplete callback fired');
		equals(woosh._utils.constructorName(resultComparison), 'ResultComparison', 'resultComparison is a ResultComparison');
		ok(resultComparison.loopsEqual, 'loopsEqual');
		ok(resultComparison.returnValsEqual, 'returnValsEqual');
		ok(resultComparison.unitsEqual, 'unitsEqual');
		ok(resultComparison.typesEqual, 'typesEqual');
		equals(resultComparison.maxResult, 5, 'maxResult');
		equals(resultComparison.minResult, 1, 'minResult');
		ok(resultComparison.highestIsBest, 'highestIsBest');
		ok(resultComparison.results.nullLib1, 'lastTestsRan.nullLib1');
		ok(resultComparison.results.nullLib2, 'lastTestsRan.nullLib2');
		start();
	});
});

module('woosh.Conductor');

test('creating a woosh.Conductor with 1 lib', 14, function() {
	stop(5000);
	
	equals(typeof woosh.Conductor, 'function', 'woosh.Conductor is function');
	var log = [];
	
	var conductor = new woosh.Conductor(['fakeLib1'], function() {
		ok(true, 'conductor onReady called');
		equals(typeof conductor._testFrames.fakeLib1.libraryTest, 'object', 'fakeLib1.libraryTest is function');
		conductor.addListener({
			start: function() {
				ok(true, 'conductor onStart called');
				log.push('onStart');
			},
			testComplete: function(libraryName, testName, result) {
				log.push('onTestComplete: ' + testName + ', ' + libraryName);
			},
			testSetComplete: function(testName, resultComparison) {
				log.push('onTestSetComplete: ' + testName);
				switch (testName) {
					case 'blockingFunc':
						equals(resultComparison.results.fakeLib1.returnVal, 'fakeLib1.blockingFunc', 'Correct return val on fakeLib1.blockingFunc');
						break;
					case 'asyncFunc':
						equals(resultComparison.results.fakeLib1.returnVal, 'fakeLib1.asyncFunc', 'Correct return val on fakeLib1.asyncFunc');
						break;
					case 'customResultTest':
						equals(resultComparison.results.fakeLib1.returnVal, 'fakeLib1 customResultTest', 'Correct return val on fakeLib1 customResultTest');
						equals(resultComparison.results.fakeLib1.result, 123, 'Correct result on fakeLib1 customResultTest');
						equals(resultComparison.results.fakeLib1.unit, 'fps', 'Correct unit on fakeLib1 customResultTest');
						break;
					case 'onlyInFakeLib1':
						equals(resultComparison.results.fakeLib1.returnVal, 'fakeLib1 onlyInFakeLib1', 'Correct return val on fakeLib1 onlyInFakeLib1');
						break;
				}
			},
			allTestsComplete: function(libraryResults, resultComparisons) {
				log.push('onAllTestsComplete');
				
				equals(woosh._utils.constructorName(libraryResults.fakeLib1), 'LibraryResult', 'libraryResults provided');
				equals(woosh._utils.constructorName(resultComparisons.blockingFunc), 'ResultComparison', 'resultComparisons provided');
				
				same(log, [
					'onStart',
					'onTestComplete: blockingFunc, fakeLib1',
					'onTestSetComplete: blockingFunc',
					'onTestComplete: asyncFunc, fakeLib1',
					'onTestSetComplete: asyncFunc',
					'onTestComplete: customResultTest, fakeLib1',
					'onTestSetComplete: customResultTest',
					'onTestComplete: onlyInFakeLib1, fakeLib1',
					'onTestSetComplete: onlyInFakeLib1',
					'onAllTestsComplete'
				], 'Events happened in correct order')
				
				start();
			}
		});
		
		conductor.start();
	});
	
	equals(typeof conductor.start, 'function', 'woosh.Conductor#start is function');
});

test('woosh.Conductor running only particular tests', 1, function() {
	stop(5000);

	var log = [];
	
	var conductor = new woosh.Conductor(['fakeLib1'], function() {
		conductor.testsToRun = ['customResultTest', 'onlyInFakeLib1'];
		
		conductor.addListener({
			start: function() {
				log.push('onStart');
			},
			testComplete: function(libraryName, testName, result) {
				log.push('onTestComplete: ' + testName + ', ' + libraryName);
			},
			testSetComplete: function(testName, resultComparison) {
				log.push('onTestSetComplete: ' + testName);
			},
			allTestsComplete: function(libraryResults, resultComparisons) {
				log.push('onAllTestsComplete');
				
				deepEqual(log, [
					'onStart',
					'onTestComplete: customResultTest, fakeLib1',
					'onTestSetComplete: customResultTest',
					'onTestComplete: onlyInFakeLib1, fakeLib1',
					'onTestSetComplete: onlyInFakeLib1',
					'onAllTestsComplete'
				], 'Events happened in correct order')
				
				start();
			}
		});
		
		conductor.start();
	});
});

test('creating a woosh.Conductor with 2 libs', 21, function() {
	stop(10000);
	
	equals(typeof woosh.Conductor, 'function', 'woosh.Conductor is function');
	var log = [];
	
	var conductor = new woosh.Conductor(['fakeLib1', 'fakeLib2'], function() {
		ok(true, 'conductor onReady called');
		equals(typeof conductor._testFrames.fakeLib1.libraryTest, 'object', 'fakeLib1.libraryTest is function');
		equals(typeof conductor._testFrames.fakeLib2.libraryTest, 'object', 'fakeLib2.libraryTest is function');
		
		conductor.addListener({
			start: function() {
				ok(true, 'conductor onStart called');
				log.push('onStart');
			},
			testComplete: function(libraryName, testName, results) {
				log.push('onTestComplete: ' + testName + ', ' + libraryName);
			},
			testSetComplete: function(testName, resultComparison) {
				log.push('onTestSetComplete: ' + testName);
				switch (testName) {
					case 'blockingFunc':
						equals(resultComparison.results.fakeLib1.returnVal, 'fakeLib1.blockingFunc', 'Correct return val on fakeLib1.blockingFunc');
						equals(resultComparison.results.fakeLib2.returnVal, 'fakeLib2.blockingFunc', 'Correct return val on fakeLib2.blockingFunc');
						break;
					case 'asyncFunc':
						equals(resultComparison.results.fakeLib1.returnVal, 'fakeLib1.asyncFunc', 'Correct return val on fakeLib1.asyncFunc');
						equals(resultComparison.results.fakeLib2.returnVal, 'fakeLib2.asyncFunc', 'Correct return val on fakeLib2.asyncFunc');
						break;
					case 'customResultTest':
						equals(resultComparison.results.fakeLib1.returnVal, 'fakeLib1 customResultTest', 'Correct return val on fakeLib1 customResultTest');
						equals(resultComparison.results.fakeLib2.returnVal, 'fakeLib2 customResultTest', 'Correct return val on fakeLib2 customResultTest');
						
						equals(resultComparison.results.fakeLib1.result, 123, 'Correct result on fakeLib1 customResultTest');
						equals(resultComparison.results.fakeLib2.result, 456, 'Correct result on fakeLib2 customResultTest');
						
						equals(resultComparison.results.fakeLib1.unit, 'fps', 'Correct unit on fakeLib1 customResultTest');
						equals(resultComparison.results.fakeLib2.unit, 'fps', 'Correct unit on fakeLib2 customResultTest');
						break;
					case 'onlyInFakeLib1':
						equals(resultComparison.results.fakeLib1.returnVal, 'fakeLib1 onlyInFakeLib1', 'Correct return val on fakeLib1 onlyInFakeLib1');
						equals(resultComparison.results.fakeLib2, undefined, 'Result for fakeLib2 undefined');
						break;
				}
			},
			allTestsComplete: function(libraryResults) {
				log.push('onAllTestsComplete');
				
				equals(woosh._utils.constructorName(libraryResults.fakeLib1), 'LibraryResult', 'Result sets provided');
				equals(woosh._utils.constructorName(libraryResults.fakeLib2), 'LibraryResult', 'Result sets provided');
				
				same(log, [
					'onStart',
					'onTestComplete: blockingFunc, fakeLib1',
					'onTestComplete: blockingFunc, fakeLib2',
					'onTestSetComplete: blockingFunc',
					'onTestComplete: asyncFunc, fakeLib1',
					'onTestComplete: asyncFunc, fakeLib2',
					'onTestSetComplete: asyncFunc',
					'onTestComplete: customResultTest, fakeLib1',
					'onTestComplete: customResultTest, fakeLib2',
					'onTestSetComplete: customResultTest',
					'onTestComplete: onlyInFakeLib1, fakeLib1',
					'onTestComplete: onlyInFakeLib1, fakeLib2',
					'onTestSetComplete: onlyInFakeLib1',
					'onAllTestsComplete'
				], 'Events happened in correct order')
				
				start();
			}
		});

		conductor.start();
	});
	
	equals(typeof conductor.start, 'function', 'woosh.Conductor#start is function');
});

module('woosh.views');

test('woosh.views.Table output', 2, function() {
	stop(5000);

	equals(typeof woosh.views.Table, 'function', 'woosh.views.Table is function');
	
	var conductor = new woosh.Conductor(['fakeLib1', 'fakeLib2'], function() {
		var table = new woosh.views.Table( conductor, document.getElementById('tableOutput') );
		equals(table._element.nodeName, 'TABLE', 'woosh.views.Table#_element is a table');
		conductor.start();
		start();
	});
})