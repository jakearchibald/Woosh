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
	/**
	@name woosh._root
	@type {String}
	@private
	@description Path to woosh repo root
	*/
	var scripts = document.getElementsByTagName('script'),
		lastScript = scripts[scripts.length - 1];
		
	// eval any contents of the script
	try {
		eval(lastScript.innerHTML);
	} catch(e) {}
	
	window.woosh._root = lastScript.src.replace('woosh.js', '');
})();

(function(){
	/**
	@name woosh._utils
	@namespace
	@private
	@description Some basic util functions
	*/
	var utils = {
		/**
		@name woosh._utils.urlEncode
		@function
		@description Converts an object into a query string
		
		@returns {Object}
		
		@example
			woosh._utils.urlEncode({
				hello: 'world',
				foo: ['bar', 'bunz']
			});
			
			// returns 'hello=world&foo=bar&foo=bunz'
		*/
		urlEncode: function (obj) {
			var parts = [],
				partsLen = 0,
				val, i, len;
		
			for (var key in obj) {
				val = obj[key];
				
				if (typeof val == 'string') {
					val = [val];
				}
				for(i = 0, len = val.length; i < len; i++) {
					parts[partsLen++] = key + '=' + encodeURIComponent( val[i] );
				}
			}
			
			return parts.join('&');
		},
		/**
		@name woosh._utils.urlDecode
		@function
		@description Converts a urlencoded string into an object of arrays
		
		@returns {Object}
		
		@example
			woosh._utils.urlDecode('hello=world&foo=bar&foo=bunz');
			
			// returns:
			// {
			//    hello: ['world'],
			//    foo: ['bar', 'bunz']
			// }
		*/
		urlDecode: function (text) {
			var result = {},
				keyValues = text.split(/[&;]/);
		
			var thisPair, key, value;
		
			for(var i = 0, len = keyValues.length; i < len; i++) {
				thisPair = keyValues[i].split('=');
				key   = decodeURIComponent( thisPair[0] );
				value = decodeURIComponent( thisPair[1] );
				
				if (!key) {
					continue;
				}
				else if ( result[key] ) {
					result[key].push(value);
				}
				else {
					result[key] = [value];
				}
			}
			return result;
		},
		loadLibrary: function(libraryName) {
			var files = woosh.libs[libraryName];
			if (files) {
				for (var i = 0, len = files.length; i < len; i++) {
					if (files[i].slice(-3) == '.js') {
						document.write('<script type="text/javascript" src="' + woosh._root + files[i] + '"></scr' + 'ipt>');
					}
					else if (files[i].slice(-4) == '.css') {
						//document.write('<link rel="stylesheet" type="text/css" src="' + woosh._root + files[i] + '">');
						document.write('<style type="text/css">@import "' + woosh._root + files[i] + '";</style>')
					}
				}
			}
		}
	}
	
	window.woosh._utils = utils;
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
		_unit: 'ms',
		// what is the result?
		_result: undefined,
		// are high results good?
		_highestIsBest: false,
		// errors are held
		_error: null,
		
		// called when test is complete
		_onComplete: function() {},
		// start the test running, _onComplete is fired when all itterations have ran
		_run: function() {
			try {
				var i = this._loopCount,
					returnVal,
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
		},
		/**
		@name woosh.Test#result
		@function
		@description Change the result of the test.
			By default, the result is the time the test took to run in milliseconds,
			however, you may want your test to measure something else like
			frames-per-second. You can achieve that using this method.
		
		@param {Number} result The result value as a number
		@param {String} [unit='ms'] The unit for the result
		@param {Boolean} [highestIsBest=false] Treat high numbers as better than low numbers?

		@returns {woosh.Test}
		
		@example
			woosh.Test(loopCount, function() {				
				// set the result manually to a different set of units
				this.result(123, 'fps', true);
				
				return // a value (this will be checked against the results of other tests)
			})
		*/
		result: function(result, unit, highestIsBest) {
			this._result = result - 0;
			this._unit = unit || this._unit;
			this._highestIsBest = !!highestIsBest;
			return this;
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
	/**
	@name woosh._testSet
	@type {woosh._TestSet}
	@description The testSet for this frame to test
	*/

	/**
	@name woosh._TestSet
	@constructor
	@private
	@description A set of tests to run
	
	@param {Object} tests Obj of functions / woosh.Test instances
		Keys beginning $ have special meaning.
		
	*/
	
	function TestSet(tests) {
		/**
		@name woosh._TestSet#tests
		@type {Object}
		@description Tests keyed by name
		*/
		this.tests = {};
		/**
		@name woosh._TestSet#testNames
		@type {String[]}
		@description Array of test names
		*/
		this.testNames = [];
		/**
		@name woosh._TestSet#_prevTestName
		@private
		@type {String}
		@description Name of the previously run test
		*/
		this._prevTestName = undefined;
		
		// populate this.tests, converting functions into woosh.Test instances
		for (var testName in tests) {
			if ( tests.hasOwnProperty(testName) ) {
				if (testName.charAt(0) == '$') {
					switch ( testName.slice(1) ) {
						case 'preTest':
							this.preTest = tests[testName];
							break;
					}
				}
				else {
					this.tests[testName] = (typeof tests[testName] == 'function') ?
						new woosh.Test(1, tests[testName]) :
						tests[testName];
						
					this.testNames.push(testName);
				}
			}
		}
	}
	
	TestSet.prototype = {
		/**
		@name woosh._TestSet#preTest
		@function
		@description Called before each test.
			Overridden by constructor 'tests' param, used to
			teardown / prepare of next test.
			
		@param {String} lastTestName Name of last test.
			Will be undefined for first test.
			
		@param {String} nextTestName Name of next test.
		*/
		preTest: function(lastTestName, nextTestName) {},
		/**
		@name woosh._TestSet#onTestComplete
		@function
		@description Called when a test completes.
			Test name is passed as the 1st param.
			Test is passed in as the 2nd param.
		*/
		onTestComplete: function(testName, test) {},
		/**
		@name woosh._TestSet#run
		@function
		@description Run a particular test.
			{@link woosh._TestSet#preTest} will be called before the test.
			
		@param {String} testName Name of test to run.
			
		*/
		run: function(testName) {
			var test = this.tests[testName],
				testSet = this;

			test._onComplete = function() {
				testSet._prevTestName = testName;
				// signal the test is complete
				testSet.onTestComplete(testName, test);
				// remove callback
				test._onComplete = function() {};
			}
			
			this.preTest(this._prevTestName, testName);
			test._run();
		}
	};
	
	/**
	@name woosh.addTests
	@function
	@description Add a set of tests for a particular framework
	
	@param {string} libraryName Library to include for these tests.
		String must be a property name within {@link woosh.libs})
	
	@param {Object} Object of tests to add for this framework.
		Tests can either be functions, or instances of {@link woosh.Test} /
		{@link woosh.AsyncTest}.
		
		Keys beginning "$" are considered special:
		
		'$preTest': This will be called before each test,
					2 params will be passed in, the name of
					the previous test and the name of the next.
		
	@example
		woosh.addTests(woosh.libs.glowSrc, {
			'$preTest': function(prevTest, nextTest) {
				resetTestHtml();
			},
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
			})
		});
	*/
	function addTests(libraryName, tests) {
		// only create the test set if we're testing this library in this frame
		if (libraryName == woosh._libraryToTest) {
			if (woosh._testSet) {
				throw new Error('A testSet has already been defined for this page');
			}
			woosh._testSet = new TestSet(tests);
		}
		return woosh;
	}
	
	window.woosh.addTests = addTests;
	window.woosh._TestSet = TestSet;
})();

(function() {	
	/**
	@name woosh._TestFrame
	@constructor
	@private
	@description An iframe for testing a particular library
	
	@param {String} libraryName Library to include for these tests.
		String must be a property name within {@link woosh.libs}
		
	@param {Function} onReady A function to call when the TestFrame is ready to use
		'this' in onReady will be the TestFrame
		
	*/
	
	
	function TestFrame(libraryName, onReady) {
		var iframe = document.createElement('iframe'),
			testFrame = this,
			queryString = woosh._utils.urlEncode({
				lib: libraryName
			});
			
		iframe.className = 'wooshCreated';
		
		iframe.onload = function() {
			/**
			@name woosh._TestFrame#window
			@type {Window}
			@description The window object of the frame
			*/
			testFrame.window = iframe.contentWindow;
			/**
			@name woosh._TestFrame#testSet
			@type {woosh._TestSet}
			@description The testSet created in this frame
			*/
			testFrame.testSet = testFrame.window.woosh._testSet;
			onReady.call(testFrame);
		}
		
		iframe.src = window.location.href.replace(window.location.search, '') + '?notest&' + queryString;
		document.body.appendChild(iframe);
	}
	
	window.woosh._TestFrame = TestFrame;
})();

(function() {
	/**
	@name woosh._Conductor
	@constructor
	@private
	@description A set of tests to run
	
	@param {Object} tests Obj of functions / woosh.Test instances
		Keys beginning $ have special meaning.
		
	*/
	function Conductor() {
		
	}
})();

(function() {
	// set this frame / window up
	var query = woosh._utils.urlDecode( window.location.search.slice(1) );
	// we need to load a particular library
	if ( query.lib ) {
		woosh._utils.loadLibrary( query.lib[0] );
		/**
		@name woosh._libraryToTest
		@private
		@type {String}
		@description Name of the library being tested in this frame
		*/
		woosh._libraryToTest = query.lib[0];
	}
})();