// Ideas:
// Graphing with error margins
// Save previous result

(function(){
	var woosh = {};
	
	window.woosh = woosh;
})();

(function(){
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
	var Test = function(loopCount, testFunc) {
		if ( !(this instanceof Test) ) {
			return new Test(loopCount, testFunc);
		}
		
		this._loopCount = loopCount;
		this._testFunc  = testFunc;
	}
	Test.prototype = {
		_units: 'ms',
		_lowestIsBest: true,
		_error: null,
		_result: null,
		
		// called when test is complete - is overridden by test runner
		_onComplete: function() {},
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
	var AsyncTest = function(loopCount, testFunc) {
		if ( !(this instanceof AsyncTest) ) {
			return new AsyncTest(loopCount, testFunc);
		}
		
		woosh.Test.apply(this, arguments);
		this._super = woosh.Test.prototype;
	}
	
	var asyncTestProto = AsyncTest.prototype = new woosh.Test();
	asyncTestProto._isWaiting = true;
	
	asyncTestProto.endTest = function(returnVal) {
		this._isWaiting = false;
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
	
	function addTests(libraryName, tests) {
		new TestSet(libraryName, tests);
		return woosh;
	}
	
	window.woosh.addTests  = addTests;
	window.woosh._testSets = testSets;
})();