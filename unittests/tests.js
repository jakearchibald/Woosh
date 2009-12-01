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
	ok(result instanceof woosh.TestResult, 'Result object provided');
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
	
	test._run(function(testResult) {
		onCompleteFiredCount++;
		result = testResult;
	});
	equals(testRunCount, 1, '_testFunc was called only once since it errored');
	equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
	equals(test._returnVal, undefined, '_returnVal is undefined');
	equals(test._result, undefined, '_result is undefined');
	ok(test._error instanceof Error, '_error is Error');
	ok(result instanceof woosh.TestResult, 'Result object provided');
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
	
	test1._run(function(testResult) {
		result1 = testResult;
	});
	test2._run(function(testResult) {
		result2 = testResult;
	});
	test3._run(function(testResult) {
		result3 = testResult;
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
	
	test._run(function(testResult) {
		onCompleteFiredCount++;
		
		equals(testRunCount, 10, '_testFunc was called correct number of times');
		equals(setTimeoutCallbackRunCount, 10, 'setTimeout callback was called the correct number of times');
		equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
		equals(testResult.returnVal, 'Hello', 'returnVal set via endTest');
		equals(typeof testResult.result, 'number', 'result is number (' + test._result + ')');
		ok(testResult.result >= 500, 'result indicates setTimeout callbacks have been waited for');
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
	
	test._run(function(testResult) {
		onCompleteFiredCount++;
		
		equals(testRunCount, 1, '_testFunc was called only once since it errored');
		equals(setTimeoutCallbackRunCount, 1, 'setTimeout callback was called only once since it errored');
		equals(onCompleteFiredCount, 1, '_onComplete was called correct number of times');
		equals(testResult.returnVal, undefined, '_returnVal is undefined');
		equals(testResult.result, undefined, '_result is undefined');
		ok(testResult.error instanceof Error, '_error is Error');
		start();
	});
});

module('woosh.TestResult & woosh.TestResultSet');

test('woosh.TestResult serializing & unserializing', 12, function() {
	var testResult = new woosh.TestResult();
	testResult.result = 123;
	testResult.unit   = 'fps';
	testResult.type   = 'Test';
	testResult.error  = new Error('All went wrong');
	testResult.loopCount = 100;
	testResult.returnVal = 60;
	testResult.highestIsBest = false;
	var serial = testResult.serialize();
	
	var anotherTestResult = new woosh.TestResult().unserialize(serial);
	
	equals(anotherTestResult.result, 123, 'result');
	equals(anotherTestResult.unit, 'fps', 'unit');
	equals(anotherTestResult.type, 'Test', 'type');
	equals(anotherTestResult.error.message, 'All went wrong', 'error.message');
	equals(anotherTestResult.loopCount, 100, 'loopCount');
	equals(typeof anotherTestResult.returnVal, 'number', 'returnVal type');
	equals(anotherTestResult.returnVal, 60, 'returnVal');
	equals(anotherTestResult.highestIsBest, false, 'highestIsBest');
	
	testResult = new woosh.TestResult();
	testResult.returnVal = 'Hello';
	serial = testResult.serialize();
	
	anotherTestResult = new woosh.TestResult().unserialize(serial);
	
	equals(typeof anotherTestResult.returnVal, 'string', 'returnVal type');
	equals(anotherTestResult.returnVal, 'Hello', 'returnVal');
	
	testResult = new woosh.TestResult();
	testResult.returnVal = undefined;
	serial = testResult.serialize();
	
	anotherTestResult = new woosh.TestResult().unserialize(serial);
	
	equals(typeof anotherTestResult.returnVal, 'undefined', 'returnVal type');
	equals(anotherTestResult.returnVal, undefined, 'returnVal');
});

test('woosh.TestResultSet serializing & unserializing', 3, function() {
	var testResult = new woosh.TestResult();
	testResult.result = 123;
	testResult.unit   = 'fps';
	testResult.type   = 'Test';
	testResult.loopCount = 100;
	testResult.returnVal = 60;
	testResult.highestIsBest = false;
	
	var testResult2 = new woosh.TestResult();
	testResult2.result = 456;
	testResult2.unit   = 'ms';
	testResult2.type   = 'AsyncTest';
	testResult2.loopCount = 100;
	testResult2.returnVal = 60;
	testResult2.highestIsBest = false;
	
	var testResultSet = new woosh.TestResultSet('My library');
	testResultSet.testResults = {
		'result1': testResult,
		'result2': testResult2
	};
	
	var serial = testResultSet.serialize();
	
	var anotherTestResultSet = new woosh.TestResultSet().unserialize(serial);
	
	same(testResultSet, anotherTestResultSet, 'Serialized & Unserialized');
	same(anotherTestResultSet.testResults.result1, testResultSet.testResults.result1, 'result1 Serialized & Unserialized');
	same(anotherTestResultSet.testResults.result2, testResultSet.testResults.result2, 'result2 Serialized & Unserialized');
});

module('woosh._LibraryTest');

test('woosh._LibraryTest', 6, function() {
	stop();
	
	equals(typeof woosh._LibraryTest, 'function', 'woosh._LibraryTest is function');
	
	var log = [];
	
	var libraryTest = new woosh._LibraryTest({
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
	
	libraryTest.run(libraryTest.testNames[i], function(testName, testResult) {
		i++;
		log.push('onTestComplete: ' + testName);
		equals(woosh._utils.constructorName(testResult), 'TestResult', 'testResult param is instanceof woosh.TestResult');
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

module('woosh._TestSet');

test('creating all equal woosh._TestSetRunner', 15, function() {
	stop(2000);
	
	equals(typeof woosh._TestSetRunner, 'function', 'woosh._TestSetRunner is function');
	
	var nullLib1TestRan = false,
		nullLib2TestRan = false;
	
	var nullLib1LibrarySet = new woosh._LibraryTest({
		'test1': new woosh.Test(1, function(test) {
			nullLib1TestRan = true;
			test.result(5, 'fps', true);
			return 50;
		})
	});
	
	var nullLib2LibrarySet = new woosh._LibraryTest({
		'test1': new woosh.Test(1, function(test) {
			nullLib2TestRan = true;
			test.result(1, 'fps', true);
			return 50;
		})
	});
	
	var myTestSet = new woosh._TestSetRunner({
		'nullLib1': nullLib1LibrarySet,
		'nullLib2': nullLib2LibrarySet
	});
	
	myTestSet.run('test1', function(libraryName, testResult) {
		equals(woosh._utils.constructorName(testResult), 'TestResult', 'testResult is a TestResult');
	}, function() {
		ok(nullLib2TestRan, 'nullLib1TestRan');
		ok(nullLib2TestRan, 'nullLib2TestRan');
		ok(true, 'onComplete callback fired');
		ok(myTestSet.loopsEqual, 'loopsEqual');
		ok(myTestSet.returnValsEqual, 'returnValsEqual');
		ok(myTestSet.unitsEqual, 'unitsEqual');
		ok(myTestSet.typesEqual, 'typesEqual');
		equals(myTestSet.maxResult, 5, 'maxResult');
		equals(myTestSet.minResult, 1, 'minResult');
		ok(myTestSet.highestIsBest, 'highestIsBest');
		ok(myTestSet.lastTestResults.nullLib1, 'lastTestsRan.nullLib1');
		ok(myTestSet.lastTestResults.nullLib2, 'lastTestsRan.nullLib2');
		start();
	});
});

module('woosh._Conductor');

test('creating a woosh._Conductor with 1 lib', 12, function() {
	stop(5000);
	
	equals(typeof woosh._Conductor, 'function', 'woosh._Conductor is function');
	var log = [];
	
	var conductor = new woosh._Conductor(['fakeLib1'], function() {
		ok(true, 'conductor onReady called');
		equals(typeof conductor._testFrames.fakeLib1.libraryTest, 'object', 'fakeLib1.libraryTest is function');
		conductor.addListener({
			start: function() {
				ok(true, 'conductor onStart called');
				log.push('onStart');
			},
			testComplete: function(libraryName, testName, testResult) {
				log.push('onTestComplete: ' + testName + ', ' + libraryName);
			},
			testSetComplete: function(testName, testSetRunner) {
				log.push('onTestSetComplete: ' + testName);
				switch (testName) {
					case 'blockingFunc':
						equals(testSetRunner.lastTestResults.fakeLib1.returnVal, 'fakeLib1.blockingFunc', 'Correct return val on fakeLib1.blockingFunc');
						break;
					case 'asyncFunc':
						equals(testSetRunner.lastTestResults.fakeLib1.returnVal, 'fakeLib1.asyncFunc', 'Correct return val on fakeLib1.asyncFunc');
						break;
					case 'customResultTest':
						equals(testSetRunner.lastTestResults.fakeLib1.returnVal, 'fakeLib1 customResultTest', 'Correct return val on fakeLib1 customResultTest');
						equals(testSetRunner.lastTestResults.fakeLib1.result, 123, 'Correct result on fakeLib1 customResultTest');
						equals(testSetRunner.lastTestResults.fakeLib1.unit, 'fps', 'Correct unit on fakeLib1 customResultTest');
						break;
					case 'onlyInFakeLib1':
						equals(testSetRunner.lastTestResults.fakeLib1.returnVal, 'fakeLib1 onlyInFakeLib1', 'Correct return val on fakeLib1 onlyInFakeLib1');
						break;
				}
			},
			allTestsComplete: function() {
				log.push('onAllTestsComplete');
				
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
	
	equals(typeof conductor.start, 'function', 'woosh._Conductor#start is function');
});

test('creating a woosh._Conductor with 2 libs', 19, function() {
	stop(10000);
	
	equals(typeof woosh._Conductor, 'function', 'woosh._Conductor is function');
	var log = [];
	
	var conductor = new woosh._Conductor(['fakeLib1', 'fakeLib2'], function() {
		ok(true, 'conductor onReady called');
		equals(typeof conductor._testFrames.fakeLib1.libraryTest, 'object', 'fakeLib1.libraryTest is function');
		equals(typeof conductor._testFrames.fakeLib2.libraryTest, 'object', 'fakeLib2.libraryTest is function');
		
		conductor.addListener({
			start: function() {
				ok(true, 'conductor onStart called');
				log.push('onStart');
			},
			testComplete: function(libraryName, testName, testResults) {
				log.push('onTestComplete: ' + testName + ', ' + libraryName);
			},
			testSetComplete: function(testName, testSetRunner) {
				log.push('onTestSetComplete: ' + testName);
				switch (testName) {
					case 'blockingFunc':
						equals(testSetRunner.lastTestResults.fakeLib1.returnVal, 'fakeLib1.blockingFunc', 'Correct return val on fakeLib1.blockingFunc');
						equals(testSetRunner.lastTestResults.fakeLib2.returnVal, 'fakeLib2.blockingFunc', 'Correct return val on fakeLib2.blockingFunc');
						break;
					case 'asyncFunc':
						equals(testSetRunner.lastTestResults.fakeLib1.returnVal, 'fakeLib1.asyncFunc', 'Correct return val on fakeLib1.asyncFunc');
						equals(testSetRunner.lastTestResults.fakeLib2.returnVal, 'fakeLib2.asyncFunc', 'Correct return val on fakeLib2.asyncFunc');
						break;
					case 'customResultTest':
						equals(testSetRunner.lastTestResults.fakeLib1.returnVal, 'fakeLib1 customResultTest', 'Correct return val on fakeLib1 customResultTest');
						equals(testSetRunner.lastTestResults.fakeLib2.returnVal, 'fakeLib2 customResultTest', 'Correct return val on fakeLib2 customResultTest');
						
						equals(testSetRunner.lastTestResults.fakeLib1.result, 123, 'Correct result on fakeLib1 customResultTest');
						equals(testSetRunner.lastTestResults.fakeLib2.result, 456, 'Correct result on fakeLib2 customResultTest');
						
						equals(testSetRunner.lastTestResults.fakeLib1.unit, 'fps', 'Correct unit on fakeLib1 customResultTest');
						equals(testSetRunner.lastTestResults.fakeLib2.unit, 'fps', 'Correct unit on fakeLib2 customResultTest');
						break;
					case 'onlyInFakeLib1':
						equals(testSetRunner.lastTestResults.fakeLib1.returnVal, 'fakeLib1 onlyInFakeLib1', 'Correct return val on fakeLib1 onlyInFakeLib1');
						equals(testSetRunner.lastTestResults.fakeLib2, undefined, 'Result for fakeLib2 undefined');
						break;
				}
			},
			allTestsComplete: function() {
				log.push('onAllTestsComplete');
				
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
	
	equals(typeof conductor.start, 'function', 'woosh._Conductor#start is function');
});

module('woosh._views');

test('woosh._views.Table output', 2, function() {
	stop(5000);

	equals(typeof woosh._views.Table, 'function', 'woosh._views.Table is function');
	
	var conductor = new woosh._Conductor(['fakeLib1', 'fakeLib2'], function() {
		var table = new woosh._views.Table(conductor);
		equals(table.element.nodeName, 'TABLE', 'woosh._views.Table#element is a table');
		document.getElementById('tableOutput').appendChild(table.element);
		conductor.start();
		start();
	});
})