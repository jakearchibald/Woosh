// Ideas:
// Restricting tests to certain libraries / tests
// Graphing with error margins
// Save previous result

// Namespace
(function(){
	/**
	@name woosh
	@namespace
	@description For creating speed tests
	*/
	var woosh = {};
	
	window.woosh = woosh;
})();

// woosh.libs
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
		'dojo-132': ['libs/dojo-132.js'],
		'jq-132': ['libs/jq-132.js'],
		'moo-122': ['libs/moo-122.js'],
		'proto-1603': ['libs/proto-1603.js'],
		'yui-270': ['libs/yui-270.js'],
		'yui-300': ['libs/yui-300.js'],
		'puredom': ['libs/puredom.js'],
		'glow-170': ['libs/glow-170/core/core.debug.js', 'libs/glow-170/widgets/widgets.debug.js', 'libs/glow-170/widgets/widgets.debug.css']
	}
	
	window.woosh.libs = libs;
})();

// woosh._root
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

// woosh._utils
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
		loadAssets: function(/* files */) {
			var files = arguments;
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
		},
		/**
		@name woosh._utils.constructorName
		@description Gets the constructor name for a function
		
		@param {Object} obj Object to get the constructor name for
		
		@returns {string} Constructor name
		*/
		constructorName: function(obj) {
			return obj.constructor.name ||
				(obj.constructor.toString().search(/^function ([^(]+)/) || [,''])[1];
		}
	}
	
	window.woosh._utils = utils;
})();

// woosh.Test
(function() {
	/**
	@name woosh.Test
	@constructor
	@description A test to be run
	
	@param {number} loopCount Number of times to run the test
		Tests that run longer have less margin for error.
	
	@param {Function} test The test to run.
		The instance of {@link woosh.Test} will be the first param
		
	@example
		woosh.Test(1000, function() {
			// do stuff
		});
	*/
	function Test(loopCount, testFunc) {
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
		// the function containing the test actions
		_testFunc: null,
		// times to loop testFunc
		_loopCount: null,
		
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
					returnVal = this._testFunc(this);
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

// woosh.AsyncTest
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
	
	@param {Function} test The test to run.
		The instance of {@link woosh.AsyncTest} will be the first param
		
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
						test._testFunc(test);
					} else {
						test._result = test._result || ( new Date() - start );
						complete(test);
					}
				}
				
				start = new Date();
				test._testFunc(test);
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

// woosh._LibraryTests & woosh.addTests
(function() {
	/**
	@name woosh._LibraryTests
	@constructor
	@private
	@description A set of tests to run against a library
	
	@param {Object} tests Obj of functions / woosh.Test instances
		Keys beginning $ have special meaning.
		
	*/
	
	function LibraryTests(tests) {
		/**
		@name woosh._LibraryTests#tests
		@type {Object}
		@description Tests keyed by name
		*/
		this.tests = {};
		/**
		@name woosh._LibraryTests#testNames
		@type {String[]}
		@description Array of test names
		*/
		this.testNames = [];
		/**
		@name woosh._LibraryTests#_prevTestName
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
	
	LibraryTests.prototype = {
		/**
		@name woosh._LibraryTests#preTest
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
		@name woosh._LibraryTests#onTestComplete
		@function
		@description Called when a test completes.
			Test name is passed as the 1st param.
			Test is passed in as the 2nd param.
		*/
		onTestComplete: function(testName, test) {},
		/**
		@name woosh._LibraryTests#run
		@function
		@description Run a particular test.
			{@link woosh._LibraryTests#preTest} will be called before the test.
			
		@param {String} testName Name of test to run.
			
		*/
		run: function(testName) {
			var test = this.tests[testName],
				libraryTests = this;

			test._onComplete = function() {
				libraryTests._prevTestName = testName;
				// signal the test is complete
				libraryTests.onTestComplete(testName, test);
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
		{@link woosh.AsyncTest}. The instance of the test will be passed
		in as the first param of the function.
		
		Keys beginning "$" are considered special:
		
		'$preTest': This will be called before each test,
					2 params will be passed in, the name of
					the previous test and the name of the next. If your test
					is looping, $preTest will still only run once.
		
	@example
		woosh.addTests("glow-170", {
			'$preTest': function(prevTest, nextTest) {
				resetTestHtml();
			},
			'mySimpleTest': function() {
				// do some stuff
				return // a value (this will be checked against the results of other tests)
			},
			'myComplexTest': woosh.Test(loopCount, function(test) {				
				// set the result manually to a different set of units
				test.result(123, 'fps', true);
				
				return // a value (this will be checked against the results of other tests)
			}),
			'myAsyncTest': woosh.AsyncTest(loopCount, function(test) {				
				// do something async
				
				// return the result (this will be checked against the results of other tests)
				test.endTest(returnVal);
			})
		});
	*/
	
	function addTests(libraryName, tests) {
		if (woosh._pageMode == 'conducting') {
			if (libsAdded[libraryName]) {
				throw new Error('A test for "' + libraryName + '" has already been added.');
			}
			libsToConduct.push(libraryName);
			libsAdded[libraryName] = true;
		}
		else if (woosh._pageMode == 'testing') {
			// only create the test set if we're testing this library in this frame
			if (libraryName == woosh._libraryToTest) {
				if (woosh._libraryTests) {
					throw new Error('Library tests already been defined for this page');
				}
				/**
				@name woosh._libraryTests
				@type {woosh._LibraryTests}
				@description The library tests for this frame to test
				*/
				woosh._libraryTests = new LibraryTests(tests);
			}
		}
		return woosh;
	}
	/**
	@name woosh._libsToConduct
	@type {String[]}
	@description Library names that should be conducted when
		{@link woosh._pageMode} is 'conducting'
	*/
	var libsToConduct = [],
		libsAdded = {};
	
	
	window.woosh.addTests = addTests;
	window.woosh._LibraryTests = LibraryTests;
	window.woosh._libsToConduct = libsToConduct;
})();

// woosh._TestFrame
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
		
		function iframeonload() {
			/**
			@name woosh._TestFrame#window
			@type {Window}
			@description The window object of the frame
			*/
			testFrame.window = iframe.contentWindow;
			/**
			@name woosh._TestFrame#libraryTests
			@type {woosh._LibraryTests}
			@description The library tests created in this frame
			*/
			testFrame.libraryTests = testFrame.window.woosh._libraryTests;
			onReady.call(testFrame);
		}
		
		if (iframe.attachEvent) {
			iframe.attachEvent('onload', iframeonload);
		} else {
			iframe.onload = iframeonload;
		}
		
		
		iframe.src = window.location.href.replace(window.location.search, '').replace(/#.*$/, '') + '?notest&' + queryString;
		document.getElementById('wooshOutput').appendChild(iframe);
	}
	
	window.woosh._TestFrame = TestFrame;
})();

// woosh._Conductor
(function() {
	/**
	@name woosh._Conductor
	@constructor
	@private
	@description Runs {@link woosh._LibraryTests} in a series of {@link woosh._TestFrame}s.
	
	@param {String[]} libraryNames Names of libraries to be tested.
	
	@param {Function} onReady A function to call when the Conductor is ready to use.
	*/
	function Conductor(libraryNames, onReady) {
		var numOfFramesWaiting = libraryNames.length,
			conductor = this;
			
		/**
		@name woosh._Conductor#libraryNames
		@type {String[]}
		@description Library names being tested
		*/
		this.libraryNames = libraryNames;
		
		/**
		@name woosh._Conductor#_currentTestIndex
		@private
		@type {Number}
		@description Index number for the current test.
			Is -1 before tests have started.
		*/
		this._currentTestIndex = -1;
		
		/**
		@name woosh._Conductor#_testFrames
		@private
		@type {Object}
		@description Object of {@link woosh._TestFrame}s
			The key is the name of the library being tested in the frame.
		*/
		this._testFrames = {};
		
		// call onReady when all frames have loaded
		function testFrameReady() {
			if ( !--numOfFramesWaiting ) {
				/**
				@name woosh._Conductor#testNames
				@type {String[]}
				@description Names of tests to run
				*/
				// get test names from first library's tests
				conductor.testNames = conductor._testFrames[ libraryNames[0] ].libraryTests.testNames;
				onReady.call(conductor);
			}
		}
		
		for (var i = 0, len = libraryNames.length; i < len; i++) {
			this._testFrames[ libraryNames[i] ] = new woosh._TestFrame(libraryNames[i], testFrameReady);
		}
	}
	
	Conductor.prototype = {
		/**
		@name woosh._Conductor#start
		@function
		@description Start running tests
		*/
		start: function() {
			this.onStart();
			
			var testIndex = -1,
				currentTestName,
				conductor = this;
			
			// called when all tests of a given name are complete
			function testPerFrameComplete(results) {
				conductor.onTestComplete(currentTestName, results);
				runNextTestPerFrame();
			}
			
			// called when a test completes (once per library)
			function testComplete(libraryName, test) {
				conductor.onTestResult(libraryName, currentTestName, test);
			}
			
			function runNextTestPerFrame() {
				currentTestName = conductor.testNames[ ++testIndex ];	
				
				if (currentTestName) {
					conductor._runTestPerFrame(currentTestName, testComplete, testPerFrameComplete);
				} else {
					// we're done!
					conductor.onAllTestsComplete.call(conductor);
				}
			}
			
			runNextTestPerFrame();
		},
		/**
		@name woosh._Conductor#_runTestPerFrame
		@function
		@private
		@description Run a test of a given name in each {@link woosh._TestFrame}
		
		@param {String} testName Name of the test
		
		@param {Function} onTestComplete Callback when a test completes
			Library name as first param, complete Test object as 2nd param.
		
		@param {Function} onDone Callback when complete
			Object of complete Test objects as first param, keyed by test name
		*/
		_runTestPerFrame: function(testName, onTestComplete, onDone) {
			var libIndex = -1,
				currentLibName,
				currentFrame,
				test,
				conductor = this,
				results = {};
			
			function testComplete() {
				// add to results
				results[currentLibName] = test;
				
				if (test) {
					// remove listener
					test._onComplete = function() {};
				}
				onTestComplete.call(conductor, currentLibName, test);
				setTimeout(function() {
					runNextTest();
				}, 300);
			}
			
			function runNextTest() {
				// get the frame for the next library
				currentLibName = conductor.libraryNames[ ++libIndex ];
				currentFrame = conductor._testFrames[currentLibName];
				
				// if there's none, then we're done!
				if (currentFrame) {
					// else let's get the test
					test = currentFrame.libraryTests.tests[testName];
					
					if (test) {
						currentFrame.libraryTests.onTestComplete = testComplete;
						currentFrame.libraryTests.run(testName);
					} else {
						// maybe this test is missing for this library? Move on
						testComplete();
					}
				} else {
					onDone.call(conductor, results);
				}
			}
			
			runNextTest();
		},
		/**
		@name woosh._Conductor#onStart
		@function
		@description Called when testing start
		*/
		onStart: function() {},
		/**
		@name woosh._Conductor#onTestComplete
		@function
		@description Called when the same test name is completed in each {@link woosh._TestFrame}
		
		@param {String} testName The name of the test completed
		
		@param {Object} tests Object of completed tests with name testName
			The key is the name of the library the test ran against, the value
			is a completed {@link woosh.Test}, or undefined if the test didn't exist
			for a particular library
		*/
		onTestComplete: function(testName, tests) {},
		/**
		@name woosh._Conductor#onTestResult
		@function
		@description Called when a test completes for a particular library
		
		@param {String} libraryName The name of the library the test was completed for
		
		@param {String} testName The name of the test completed
		
		@param {woosh.Test} test Completed test
			Will be udefined if the test was missing
		*/
		onTestResult: function(libraryName, testName, test) {},
		/**
		@name woosh._Conductor#onAllTestsComplete
		@function
		@description Called when all queued tests have completed
		*/
		onAllTestsComplete: function() {}
	};
	
	window.woosh._Conductor = Conductor;
})();

// woosh._views
(function() {
	/**
	@name woosh._views
	@namespace
	@private
	@description Constructors for visual output of test results
	*/
	woosh._views = {};
})();

// woosh._views.Table
(function() {
	var tableHeading = '<th></th>',
		tableCell = '<td></td>',
		ratingColours = [
			[255, 0, 0],
			[255, 255, 0],
			[0, 255, 0]
		],
		warningColour = [255, 255, 0];
	
	// builds the skeleton of a results table
	function createResultsTable(libsLen, testsLen) {
		var tmpDiv = document.createElement('div'),
			tableStr = '<table class="wooshTable"><thead>',
			resultRowStr;
		
		// add headers for library names to go in	
		tableStr += '<tr><th>Tests</th>' + ( new Array(libsLen+1).join(tableHeading) ) + '</tr>';
		tableStr += '</thead><tbody>';
		// add result rows
		resultRowStr = '<tr>' + tableHeading + new Array(libsLen+1).join(tableCell) + '</tr>';
		tableStr += new Array(testsLen+1).join(resultRowStr);
		tableStr += '</tbody></table>';
		
		tmpDiv.innerHTML = tableStr;
		
		return tmpDiv.firstChild;
	}
	
	/**
	@name woosh._views.Table
	@constructor
	@private
	@description Create a dynamically updating table to display results
	
	@param {woosh._Conductor} conductor Test conductor to get results from
	*/
	function Table(conductor) {
		/**
		@name woosh._views.Table#conductor
		@type {woosh._Conductor}
		@description The instance conducting the test
		*/
		this.conductor = conductor;
		
		/**
		@name woosh._views.Table#element
		@type {HTMLElement}
		@description Table element that can be appended to the document
		*/
		this.element = createResultsTable(conductor.libraryNames.length, conductor.testNames.length);
		
		/**
		@name woosh._views.Table#_testRows
		@type {Object}
		@description Object of table rows keyed on test name
		*/
		this._testRows = {};
		
		/**
		@name woosh._views.Table#_libColIndex
		@type {Object}
		@description Column index for a library, keyed on library name
		*/
		this._libColIndex = {};
		
		/**
		@name woosh._views.Table#_nextResultCell
		@type {HTMLElement}
		@description The next cell to write to
		*/
		this._nextResultCell = undefined;
		
		this._initAndIndex();
		this._attachListeners();
	}
	
	Table.prototype = {
		/**
		@name woosh._views.Table#initAndIndex
		@function
		@private
		@description Populate the headings and index row element on {@link woosh._views.Table#_testRows}
		*/
		_initAndIndex: function() {
			var libRowCells = this.element.firstChild.firstChild.childNodes,
				testRows = this.element.childNodes[1].childNodes,
				testNames = this.conductor.testNames,
				libraryNames = this.conductor.libraryNames;
			
			// headings
			for (var i = 0, len = libraryNames.length; i < len; i++) {
				this._libColIndex[ libraryNames[i] ] = i+1;
				libRowCells[i+1].appendChild( document.createTextNode( libraryNames[i] ) );
			}
			// rows
			for (var i = 0, len = testNames.length; i < len; i++) {
				this._testRows[ testNames[i] ] = testRows[i];
				testRows[i].firstChild.appendChild( document.createTextNode( testNames[i] ) );
				// TODO: delegate this event
				// Click the table heading to make the info toggle
				testRows[i].firstChild.onclick = function() {
					var tableRow = this.parentNode;
					if (tableRow.className == 'fullInfo') {
						tableRow.className = '';
					}
					else {
						tableRow.className = 'fullInfo';
					}
				}
			}
			// get first cell to write to
			this._nextResultCell = testRows[0].childNodes[1];
		},
		/**
		@name woosh._views.Table#_attachListeners
		@function
		@private
		@description Hook up with the conductor
		*/
		_attachListeners: function() {
			// TODO: replace this with a better event listening system
			var oldOnTestResult = this.conductor.onTestResult,
				_addResults,
				table = this;
				
			this.conductor.onTestResult = function(libraryName, testName, test) {
				oldOnTestResult.apply(this, arguments);
				table._addResult(libraryName, testName, test);
			}
			
			this.conductor.onTestComplete = function(testName, tests) {
				table._checkResults(testName, tests);
			}
		},
		/**
		@name woosh._views.Table#_addResult
		@function
		@private
		@description Add a result to the table in the position of the cursor
		
		@param {string} libraryName 
		@param {string} testName 
		@param {woosh.Test} test 
		*/
		_addResult: function(libraryName, testName, test) {
			var resultText,
				infoNode,
				infoDefs = {},
				dt, dd,
				resultRow = this._testRows[testName],
				resultCell = resultRow.childNodes[ this._libColIndex[libraryName] ];
			
			if (test && test._error) {
				resultText = 'Error';
				resultCell.className += ' error';
				infoNode = document.createElement('div');
				infoNode.appendChild( document.createTextNode(test._error.message) )
			}
			else if (test) {
				resultText = test._result + test._unit;
				infoDefs = {
					'Loop Count': test._loopCount,
					'Return Value': test._returnVal
				};
				infoNode = document.createElement('dl');
				for (var key in infoDefs) {
					dt = document.createElement('dt');
					dd = document.createElement('dd');
					dt.appendChild( document.createTextNode(key) );
					dd.appendChild( document.createTextNode( infoDefs[key] ) );
					infoNode.appendChild(dt);
					infoNode.appendChild(dd);
				}
			}
			else {
				resultCell.className += ' noTest';
				resultText = 'No test found';
			}
			
			resultCell.appendChild( document.createTextNode(resultText) );
			
			if (infoNode) {
				infoNode.className = 'info';
				resultCell.appendChild(infoNode);
			}
		},
		/**
		@name woosh._views.Table#_checkResults
		@function
		@private
		@description Checks a set of results for a particular test, updates the table with warnings etc
		 
		@param {string} testName 
		@param {Object} tests Object of tests where the key is the library name 
		*/
		_checkResults: function(testName, tests) {
			// TODO: refactor this lot and make the test conductor produce it
			var firstItteration = true,
				firstLoopCount, loopsEqual = true,
				firstReturnVal, returnValsEqual = true,
				firstUnit, unitsEqual = true,
				results = [],
				resultsLen = 0,
				maxResult,
				minResult,
				midResult,
				highIsBest,
				test,
				cellColours = ratingColours,
				resultRow = this._testRows[testName],
				testNameCell = resultRow.firstChild,
				infoNode,
				warningMsg = '';
			
			for (var libraryName in tests) {
				test = tests[libraryName];
				if (!test) {
					continue;
				}
				
				if (firstItteration) {
					highestIsBest = test._highestIsBest;
					firstLoopCount = test._loopCount;
					firstReturnVal = test._returnVal;
					firstUnit = test._unit;
					firstItteration = false;
				}
				if (test._result && !test._error) {
					// remember the result
					results[resultsLen++] = test._result;
					// check the values are the same as first
					if (!firstItteration) {
						loopsEqual = loopsEqual && (firstLoopCount == test._loopCount);
						returnValsEqual = returnValsEqual && (firstReturnVal == test._returnVal);
						unitsEqual = unitsEqual && (firstUnit == test._unit);
					}
				}
			}
			
			maxResult = Math.max.apply(Math, results);
			minResult = Math.min.apply(Math, results);
			
			// TODO: reverse rating colours if the highest should be best
			
			if (loopsEqual && returnValsEqual && unitsEqual) {
				for (var libraryName in tests) {
					// apply colourings
				}
			}
			else {
				!loopsEqual && 		(warningMsg += ' Tests have differing loop counts.');
				!returnValsEqual && (warningMsg += ' Tests have differing return values.');
				!unitsEqual && 		(warningMsg += ' Test results are of different units.');
				infoNode = document.createElement('div');
				infoNode.className = 'info';
				infoNode.appendChild( document.createTextNode(warningMsg) );
				testNameCell.appendChild(infoNode);
			}
		}
	}
	
	woosh._views.Table = Table;
})();

// woosh._buildOutputInterface
(function() {
	/**
	@name woosh._buildOutputInterface
	@function
	@private
	@description Builds the output interface to display to the user
	*/
	var wooshOutput;
	
	function buildOutputInterface() {
		wooshOutput = document.getElementById('wooshOutput');
		
		if (!wooshOutput) {
			return;
		}
		wooshOutput.innerHTML = '<div id="wooshBanner"><h1>' + document.title + '</h1></div><div id="wooshCommands"></div><div id="wooshViewOutput"><div>';
		
		var a = document.createElement('a');
		a.href = '#';
		a.id = 'startLink';
		a.className = 'wooshButton';
		a.innerHTML = 'Start';
		a.onclick = function() {
			woosh._conductor.start();
			this.style.visibility = 'hidden';
			return false;
		}
		
		document.getElementById('wooshCommands').appendChild(a);
	}
	
	woosh._buildOutputInterface = buildOutputInterface;
})();

// page setup
(function() {
	/**
	@name woosh._pageMode
	@type {String}
	@private
	@description The mode the page is running in.
		'conducting':  Will create frames for libraries to be tested
		   'testing':  Will load a library onto the page and create a LibraryTests object
	*/
	woosh._pageMode = 'conducting';

	// set this frame / window up
	var query = woosh._utils.urlDecode( window.location.search.slice(1) );
	
	if ( query.lib ) {
		// Ok, we're running tests against a library
		// we need to load a particular library
		woosh._pageMode = 'testing';
		woosh._utils.loadAssets.apply( this, woosh.libs[ query.lib[0] ] );
		/**
		@name woosh._libraryToTest
		@private
		@type {String}
		@description Name of the library being tested in this frame
		*/
		woosh._libraryToTest = query.lib[0];
	}
	else if (window.QUnit) {
		// we're in a unit test, don't do anything until we're asked
		return;
	}
	else {
		// We're running tests in iframes and displaying the results
		// load our CSS
		woosh._utils.loadAssets('assets/style.css');
		var oldOnload = window.onload || function() {};
		
		window.onload = function() {
			oldOnload.call(this, arguments);
			
			// build the interface
			woosh._buildOutputInterface();
			
			/**
			@name woosh._conductor
			@type {woosh._Conductor}
			@private
			@description The conductor for this page
			*/
			// create our tests
			woosh._conductor = new woosh._Conductor(woosh._libsToConduct, function() {
				var table = new woosh._views.Table(woosh._conductor);
				document.getElementById('wooshViewOutput').appendChild(table.element);
			});
		};
	}
})();