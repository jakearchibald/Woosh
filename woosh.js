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
				start = new Date();
		
			while (i--) {
				this._returnVal = this._testFunc();
			}
			
			this._result = this._result || ( new Date() - start );
			this._onComplete();
		}
	};
	
	window.woosh.Test = Test;
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