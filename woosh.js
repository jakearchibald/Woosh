// Ideas:
// Graphing with error margins
// Save previous result

(function(){
	/**
	@name woosh
	@namespace
	@description For creating speed tests
	*/
	var woosh = {};
	
	window.woosh = woosh;
})();

(function(){
	/**
	@name woosh.libs
	@type {Object}
	@description Libraries available to the system.
		Feel free to add additional libraries. Values are arrays of
		files that need to be included to use the library.
		
		Paths must be relative to whoosh.js.
	*/
	var libs = {
		'glow170': ['libs/glow170.js']
	}
	
	window.woosh.libs = libs;
})();

(function(){
	var utils = {
		addListener: function(item, name, callback) {
			if (item.addEventListener) {
				item.addEventListener(name, callback, false);
			} else if (item.attachEvent) {
				item.attachEvent('on' + name, callback);
			}
		},
		removeListener: function(item, name, callback) {
			if (item.removeEventListener) {
				item.removeEventListener(name, callback, false);
			} else if (item.detachEvent) {
				item.detachEvent('on' + name, callback);
			}
		}
	}
	
	window.woosh.utils = utils;
})();

(function(){
	function loadLibrary(libraryName) {
		// document write script element?
	}
	
	window.woosh._loadLibrary = loadLibrary;
})();

(function() {
	/**
	@name woosh.Test
	@constructor
	@description A test to be run
	
	@param {number} loopCount Number of times to run the test
		Tests that run longer have less margin for error.
	
	@param {Function} test The test to run
		
	@example
		woosh.Test(1000, function() {
			// do stuff
		});
	*/
	var Test = function(loopCount, testFunc) {
		if ( !(this instanceof Test) ) {
			return new Test(loopCount, testFunc);
		}
		
		this._loopCount = loopCount;
		this._testFunc  = testFunc;
	}
	
	var undefined;
	
	Test.prototype = {
		// what kind of unit should the results be measured in
		_units: 'ms',
		// what is the result?
		_result: undefined,
		// are high results good?
		_highestIsBest: false,
		// errors are held
		_error: null,
		
		// called when test is complete - is overridden by test runner
		_onComplete: function() {},
		// start the test running, _onComplete is fired when all itterations have ran
		_run: function() {
			try {
				var i = this._loopCount,
					returnVal,
					testFunc = this._testFunc,
					duration,
					start = new Date();
			
				while (i--) {
					returnVal = this._testFunc();
				}
				
				duration = new Date() - start;
				this._result = this._result || duration;
			} catch (e) {
				this._error = e;
			}
			this._returnVal = returnVal;
			this._onComplete();
		}
	};
	
	window.woosh.Test = Test;
})();

(function() {
	/**
	@name woosh.AsyncTest
	@constructor
	@extends woosh.Test
	@description Like {@link woosh.Test}, but allows async tests.
		This test waits for {@link woosh.AsyncTest#endTest} to be
		called before the test is complete.
	
	@param {number} loopCount Number of times to run the test
		Tests that run longer have less margin for error.
	
	@param {Function} test The test to run
		
	@example
		woosh.AsyncTest(1000, function() {
			// do stuff
			
			this.endTest(returnVal);
		});
	*/
	var AsyncTest = function(loopCount, testFunc) {
		if ( !(this instanceof AsyncTest) ) {
			return new AsyncTest(loopCount, testFunc);
		}
		
		woosh.Test.apply(this, arguments);
		this._super = woosh.Test.prototype;
	}
	
	var asyncTestProto = AsyncTest.prototype = new woosh.Test();
	
	/**
	@name woosh.AsyncTest#endTest
	@function
	@description Must be called within an async test to end the test
	
	@param {Object} returnVal The value to return.
		In sync tests you can simply return a value, but here you must provide
		the return value here.
	*/
	asyncTestProto.endTest = function(returnVal) {
		this._returnVal = returnVal;
		this._onEndTest();
	};
	
	(function(){
		var oldErrorListener, timeout;
		
		function complete(test) {
			window.onerror = test._oldErrorListener;
			test._onEndTest = function() {};
			test._onComplete();
		};
		
		// run the test in an async way. _onComplete is called when test is complete
		asyncTestProto._run = function() {
			try {
				var i = this._loopCount,
					testFunc = this._testFunc,
					test = this,
					start;
				
				this._oldErrorListener = window.onerror;
				
				// not using addEventListener / attachEvent, we get more information (msg) this way:
				window.onerror = function(msg) {
					if (test._oldErrorListener) {
						test._oldErrorListener.apply(this, arguments);
					}
					test._error = new Error(msg);
					complete(test);
				}
				
				this._onEndTest = function() {
					if (--i) {
						test._testFunc();
					} else {
						test._result = test._result || ( new Date() - start );
						complete(test);
					}
				}
				
				start = new Date();
				test._testFunc();
			} catch (e) {
				this._error = e;
				complete(test);
			}
		};
	})();
	
	// overidden by woosh.AsyncTest#_run
	asyncTestProto._onEndTest = function() {};
	
	// export
	window.woosh.AsyncTest = AsyncTest;
})();

(function() {
	var testSets = [];
	
	function TestSet(libraryName, tests) {
		this.libraryName = libraryName;
		this.tests = {};
		
		// populate this.tests, converting functions into woosh.Test instances
		for (var testName in tests) {
			if ( tests.hasOwnProperty(testName) && testName.charAt(0) != '$' ) {
				if (typeof tests[testName] == 'function') {
					this.tests[testName] = new Test(1, tests[testName]);
				} else if (tests[testName] instanceof woosh.Test) {
					this.tests[testName] = tests[testName];
				}
			}
		}
		
		testSets.push(this);
	}
	
	/**
	@name woosh.addTests
	@function
	@description Add a set of tests for a particular framework
	
	@param {string} libraryName Library to include for these tests.
		String must be a property name within {@link woosh.libs})
	
	@param {Object} Object of tests to add for this framework.
		Tests can either be functions, or instances of {@link woosh.Test} /
		{@link woosh.AsyncTest}
		
	@example
		woosh.addTests(woosh.libs.glowSrc, {
			'mySimpleTest': function() {
				// do some stuff
				return // a value (this will be checked against the results of other tests)
			},
			'myComplexTest': woosh.Test(loopCount, function() {				
				// set the result manually to a different set of units
				this.result(123, 'fps', true);
				
				return // a value (this will be checked against the results of other tests)
			}),
			'myAsyncTest': woosh.AsyncTest(loopCount, function() {				
				// do something async
				
				// return the result (this will be checked against the results of other tests)
				this.endTest(returnVal);
			}),
		});
	*/
	function addTests(libraryName, tests) {
		new TestSet(libraryName, tests);
		return woosh;
	}
	
	window.woosh.addTests  = addTests;
	window.woosh._testSets = testSets;
})();