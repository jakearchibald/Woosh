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
		
		// called when test is complete - is overridden by test runner
		_onComplete: function() {},
		_run: function() {
			var i = this._loopCount,
				returnVal,
				testFunc = this._testFunc,
				start = new Date();
		
			while (i--) {
				returnVal = this._testFunc();
			}
			
			this._result = this._result || ( new Date() - start );
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
	}
	
	asyncTestProto._run = function() {
		var i = this._loopCount,
			testFunc = this._testFunc,
			test = this,
			start = new Date();
		
		this._onEndTest = function() {
			if (--i) {
				test._testFunc();
			} else {
				test._result = test._result || ( new Date() - start );
				test._onComplete();
			}
		}
		test._testFunc();
	}
	
	asyncTestProto._onEndTest = function() {}
	
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