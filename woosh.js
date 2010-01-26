// woosh
(function(){
	/**
	@name woosh
	@namespace
	@writingTests
	@description For creating speed tests
	*/
	var woosh = {};
	
	window.woosh = woosh;
})();
// woosh.libs
(function(){
	/**
	@name woosh.libs
	@type Object
	@writingTests
	@description Libraries available to the system.
		Libraries available by default:
		
		<dl>
			<dt>dojo-140</dt>
			<dd>Dojo 1.4.0</dd>
			<dt>jq-132</dt>
			<dd>jQuery 1.3.2</dd>
			<dt>moo-122</dt>
			<dd>MooTools 1.2.2</dd>
			<dt>proto-1603</dt>
			<dd>PrototypeJs 1.6.0.3</dd>
			<dt>yui-270</dt>
			<dd>YUI 2.7.0</dd>
			<dt>yui-300</dt>
			<dd>YUI 3.0.0</dd>
			<dt>glow-170</dt>
			<dd>Glow 1.7.0</dd>
		</dl>
		
	@example
		<!-- adding your own libraries for a test -->
		<script src="path/to/woosh.js" type="text/javascript">
			// Library paths are relative to woosh.js, all files in the array will be loaded in order
			woosh.libs['myLibrary'] = ['../myLibrary/1.js', '../myLibrary/1.js'];
		</script>
	*/
	var libs = {
		'dojo-140': ['libs/dojo-140.js'],
		'jq-132': ['libs/jq-132.js'],
		'jq-140': ['libs/jq-140.js'],
		'moo-122': ['libs/moo-122.js'],
		'proto-1603': ['libs/proto-1603.js'],
		'yui-270': ['libs/yui-270.js'],
		'yui-300': ['libs/yui-300.js'],
		'puredom': ['libs/puredom.js'],
		'glow-170': ['libs/glow-170/core/core.debug.js']
	}
	
	window.woosh.libs = libs;
})();
// woosh._root
(function(){
	/**
	@name woosh._root
	@type string
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
				
				if (!val || val.constructor != Array) {
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
						document.write('<style type="text/css">@import "' + woosh._root + files[i] + '";</style>')
					}
				}
			}
		},
		/**
		@name woosh._utils.constructorName
		@description Gets the constructor name for a function
		@function
		
		@param {Object} obj Object to get the constructor name for
		
		@returns {string} Constructor name
		*/
		constructorName: function(obj) {
			if (!obj) {
				return '';
			}
			if (obj.constructor.name) {
				return obj.constructor.name;
			}
			else {
				var constructorStr = obj.constructor.toString();
				return constructorStr.slice( constructorStr.indexOf('function ') + 9, constructorStr.indexOf('(') );
			}
		},
		/**
		@name woosh._utils.extend
		@function
		@description Copies the prototype of one object to another.
			The 'subclass' can also access the 'base class' via subclass.base
			
		@param {Function} sub Class which inherits properties.
		@param {Function} base Class to inherit from.
		@param {Object} additionalProperties An object of properties and methods to add to the subclass.
		*/
		extend: function(sub, base, additionalProperties) {
			var f = function () {}, p;
			f.prototype = base.prototype;
			p = new f();
			sub.prototype = p;
			p.constructor = sub;
			sub.base = base;
			if (additionalProperties) {
				woosh._utils.apply(sub.prototype, additionalProperties);
			}
		},
		/**
		@name woosh._utils.apply
		@function
		@description Copies properties from one object to another

		@param {Object} destination Destination object
		@param {Object} source Properties of this object will be copied onto the destination

		@returns {Object}
		*/
		apply: function(destination, source) {
			for (var i in source) {
				if ( source.hasOwnProperty(i) ) {
					destination[i] = source[i];
				}
			}
			return destination;
		}
	}
	
	window.woosh._utils = utils;
})();
// woosh.Test
(function() {
	/**
	@name woosh.Test
	@constructor
	@writingTests
	@description A test to be run
		Test instances are created within a call to {@link woosh.addTests}.
	
	@param {number} loopCount Number of times to run the test.
		Tests that run longer have less margin of error.
	
	@param {Function} test The test to run.
		The following params will be passed into the test function:
		
		<dl>
			<dt>test</dt>
			<dd>
				The instance of {@link woosh.Test}, provided so you can easily
				call instance methods on it.
			</dd>
		</dl>
		
	@example
		woosh.addTests('glow-170', {
			'Test Name': new woosh.Test(1000, function(test) {
				// do stuff
				
				// return a value (this will be checked against the results of other tests)
				return returnVal;
			})
		});
	
	@example
		woosh.addTests('jq-140', {
			'Appending elms': new woosh.Test(1000, function(test) {
				$('<strong/>').appendTo(document.body);
				
				// restrict the element counting to the last loop
				if (test.lastLoop) {
					return $('strong').length;
				}
			})
		});
	*/
	function Test(loopCount, testFunc) {
		if ( !(this instanceof Test) ) {
			return new Test(loopCount, testFunc);
		}
		this._result = new woosh.Result();
		this._result.loopCount = this._loopCount = loopCount;
		this._result.type = woosh._utils.constructorName(this);
		this._testFunc  = testFunc;
	}
	
	var undefined;
	
	woosh._utils.extend(Test, Object, {
		/**
			@name woosh.Test#_loopCount
			@type number
			@description Number of times to call _testFunc
		*/
		_loopCount: 0,
		/**
			@name woosh.Test#_testFunc
			@type Function
			@description The function containing the test actions
		*/
		_testFunc: null,
		/**
			@name woosh.Test#_result
			@type woosh.Result
			@description Results for this test
				Won't be populated until after the test has _run
		*/
		_result: null,
		/**
			@name woosh.Test#_run
			@function
			@description Runs the test
			
			@param {function} [onComplete] Called then the test is complete.
				An instance of {@link woosh.Result} is passed as the
				first parameter.
		*/
		_run: function(onComplete) {
			try {
				var i = this._loopCount,
					returnVal,
					duration,
					start = new Date();
			
				while (i--) {
					this.lastLoop = !i;
					returnVal = this._testFunc(this);
				}
				
				this._result.duration = duration = new Date() - start;
				if (this._result.result === undefined) {
					this._result.result = (duration / this._loopCount);
				}
			} catch (e) {
				this._result.error = e;
			}
			this._result.returnVal = returnVal;
			onComplete && onComplete(this._result);
		},
		/**
			@name woosh.Test#lastLoop
			@type number
			@writingTests
			@description True if the test is running its last loop
				You can use this to restrict calculating the return
				value to the last loop.
		*/
		lastLoop: false,
		/**
		@name woosh.Test#setResult
		@function
		@writingTests
		@description Manually set the result of the test.
			By default the result is the time the test took to run in milliseconds.
			However, you may want your test to measure something else like
			frames-per-second. You can achieve that using this method.
		
		@param {number} result The result value as a number
		@param {string} [unit='ms'] The unit for the result
		@param {boolean} [highestIsBest=false] Treat high numbers as better than low numbers?

		@returns {woosh.Test}
		
		@example
			// using an AsyncTest to measure framerate
			woosh.addTests('glow-170', {
				'Test Name': new woosh.AsyncTest(1, function(test) {
					var framesRendered = 0;
				
					var anim = new glow.anim.Animation(3, {
						onFrame: function() {
							framesRendered++;
						},
						onComplete: function() {
							// set the frames per second as the result
							test.setResult(framesRendered/3, 'fps', true);
							test.endTest();
						}
					});
					
					anim.start();
				})
			});
		*/
		setResult: function(result, unit, highestIsBest) {
			this._result.result = result - 0;
			this._result.unit = unit || this._result.unit;
			this._result.highestIsBest = !!highestIsBest;
			return this;
		}
	});
	
	window.woosh.Test = Test;
})();
// woosh.AsyncTest
(function() {
	/**
	@name woosh.AsyncTest
	@constructor
	@writingTests
	@augments woosh.Test
	@description Like {@link woosh.Test}, but allows async tests.
		Test instances are created within a call to {@link woosh.addTests}.
		
		This test waits for {@link woosh.AsyncTest#endTest} to be
		called before the test is complete.
	
	@param {number} loopCount Number of times to run the test.
		Tests that run longer have less margin of error.
	
	@param {Function} test The test to run.
		The following params will be passed into the test function:
		
		<dl>
			<dt>test</dt>
			<dd>
				The instance of {@link woosh.AsyncTest}, provided so you can easily
				call instance methods on it.
			</dd>
		</dl>
		
	@example
		woosh.addTests('glow-170', {
			'Test Name': new woosh.AsyncTest(1000, function(test) {
				// do stuff
				
				// return a value (this will be checked against the results of other tests)
				test.endTest(returnVal);
			})
		});
	*/
	function AsyncTest(loopCount, testFunc) {
		if ( !(this instanceof AsyncTest) ) {
			return new AsyncTest(loopCount, testFunc);
		}
		
		woosh.Test.apply(this, arguments);
	}
	
	woosh._utils.extend(AsyncTest, woosh.Test);
	var asyncTestProto = AsyncTest.prototype;

	/**
	@name woosh.AsyncTest#endTest
	@function
	@writingTests
	@description Must be called within an async test to end the test
	
	@param {Object} returnVal The value to return.
		In sync tests you can simply return a value, but in async tests you must provide
		the return value via this method.
	*/
	asyncTestProto.endTest = function(returnVal) {
		this._result.returnVal = returnVal;
		this._runNextItteration();
	};
	
	(function(){
		var oldErrorListener;
		
		function complete(test, onComplete) {
			window.onerror = test._oldErrorListener;
			test._runNextItteration = function() {};
			onComplete(test._result);
		};
		
		// run the test in an async way. onComplete is called when test is complete
		asyncTestProto._run = function(onComplete) {
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
					test._result.error = new Error(msg);
					complete(test, onComplete);
				}
				
				this._runNextItteration = function() {
					if (i--) {
						test.lastLoop = !i;
						test._testFunc(test);
					} else {
						test._result.duration = ( new Date() - start );
						if (test._result.result === undefined) {
							test._result.result = (test._result.duration / test._result.loopCount);
						}
						complete(test, onComplete);
					}
				}
				
				start = new Date();
				this._runNextItteration();
			} catch (e) {
				this._result.error = e;
				complete(test, onComplete);
			}
		};
	})();
	
	// overidden by woosh.AsyncTest#_run
	asyncTestProto._runNextItteration = function() {};
	
	// export
	window.woosh.AsyncTest = AsyncTest;
})();
// woosh.VisualTest
(function() {
	/**
	@name woosh.VisualTest
	@constructor
	@writingTests
	@augments woosh.AsyncTest
	@description Like {@link woosh.AsyncTest}, but displays as it runs.
		Test instances are created within a call to {@link woosh.addTests}.
		
		This test allows you to test animations, you can see them as they run.
	
	@param {number} loopCount Number of times to run the test.
		Tests that run longer have less margin of error.
	
	@param {Function} test The test to run.
		The following params will be passed into the test function:
		
		<dl>
			<dt>test</dt>
			<dd>
				The instance of {@link woosh.VisualTest}, provided so you can easily
				call instance methods on it.
			</dd>
		</dl>
		
	@example
		woosh.addTests('glow-170', {
			'Test Name': new woosh.VisualTest(1000, function(test) {
				// do stuff
				
				// return a value (this will be checked against the results of other tests)
				test.endTest(returnVal);
			})
		});
	*/
	function VisualTest(loopCount, testFunc) {
		if ( !(this instanceof VisualTest) ) {
			return new VisualTest(loopCount, testFunc);
		}
		
		woosh.AsyncTest.apply(this, arguments);
	}
	
	woosh._utils.extend(VisualTest, woosh.AsyncTest);
	
	// export
	woosh.VisualTest = VisualTest;
})();
// woosh.TimeTest
(function() {
	/**
	@name woosh.TimeTest
	@constructor
	@writingTests
	@augments woosh.Test
	@description Like {@link woosh.Test}, but runs for a fixed amount of time and counts the itterations.
		Test instances are created within a call to {@link woosh.addTests}.
	
	@param {number} duration Seconds to run the test for
		Values larger than 0.5 are recommended.
		
		Your test will complete when a loop is completed and the duration
		has exceeded. The test will not stop half way through a loop.
	
	@param {Function} test The test to run.
		The following params will be passed into the test function:
		
		<dl>
			<dt>test</dt>
			<dd>
				The instance of {@link woosh.TimeTest}, provided so you can easily
				call instance methods on it.
			</dd>
		</dl>
		
	@example
		woosh.addTests('glow-170', {
			'Test Name': new woosh.TimeTest(2, function(test) {
				// do stuff
				
				// return a value (this will be checked against the results of other tests)
				return returnVal;
			})
		});
	*/
	function TimeTest(duration, testFunc) {
		if ( !(this instanceof TimeTest) ) {
			return new TimeTest(duration, testFunc);
		}
		woosh.Test.call(this, 0, testFunc);
		
		this._result.duration = duration * 1000;
	}
	
	woosh._utils.extend(TimeTest, woosh.Test);
	var timeTestProto = TimeTest.prototype;
	
	/**
		@name woosh.TimeTest#_run
		@function
		@description Runs the test
		
		@param {function} [onComplete] Called then the test is complete.
			An instance of {@link woosh.Result} is passed as the
			first parameter.
	*/
	timeTestProto._run = function(onComplete) {
		try {
			var loopCount = -1,
				returnVal,
				duration = this._result.duration,
				start = new Date();
		
			while ( (new Date - start) < duration ) {
				loopCount++;
				this._testFunc(this);
			}
			
			// call again to get the return value
			this.lastLoop = true;
			returnVal = this._testFunc(this);
			
			this._result.loopCount = loopCount;
			if (this._result.result === undefined) {
				this.setResult(loopCount, 'calls', true);
			}
		} catch (e) {
			this._result.error = e;
		}
		this._result.returnVal = returnVal;
		onComplete && onComplete(this._result);
	}
	
	// export
	woosh.TimeTest = TimeTest;
})();
// woosh.DummyTest
(function() {
	/**
	@name woosh.DummyTest
	@constructor
	@writingTests
	@augments woosh.Test
	@description A test with a static result
		
	@param {number} testType The type of test to pretend to be
	@param {number} loopCount The loopCount to pretend to have
	@param {number} duration The duration (in ms) to pretend to take
	@param {number} returnVal The return value to pretend to have
	@param {number|string} [result] The result value to give
		By default this will be the same as duration. If result is a string is will
		be treated as an error message.
	@param {string} [unit='ms'] The unit for the result
	@param {boolean} [highestIsBest=false] Treat high numbers as better than low numbers?
	
	@example
		woosh.addTests('glow-170', {
			'Test Name': new woosh.DummyTest('hello', 123, 'apples', true)
		});
	*/
	function DummyTest(type, loopCount, duration, returnVal, result, unit, highestIsBest) {
		if ( !(this instanceof DummyTest) ) {
			return new DummyTest(type, loopCount, duration, returnVal, result, unit, highestIsBest);
		}
		
		var dummyTest = this;
		
		this._dummyData = {
			type: type,
			loopCount: loopCount,
			duration: duration,
			returnVal: returnVal,
			result: result || duration,
			unit: unit || 'ms',
			highestIsBest: !!highestIsBest,
			error: (typeof result == 'string') && new Error(result)
		};
		
		woosh.Test.call(this, 1, function() {});
	}
	
	woosh._utils.extend(DummyTest, woosh.Test);
	var dummyTestProto = DummyTest.prototype;
	
	/**
		@name woosh.DummyTest#_dummyData
		@description Data set when the object was constructed
	*/
	dummyTestProto._dummyData = undefined;
	
	/**
		@name woosh.DummyTest#_run
		@function
		@description Runs the test
		
		@param {function} [onComplete] Called then the test is complete.
			An instance of {@link woosh.Result} is passed as the
			first parameter.
	*/
	dummyTestProto._run = function(onComplete) {
		this.setResult(this._dummyData.result, this._dummyData.unit, this._dummyData.highestIsBest);
		this._result.loopCount = this._dummyData.loopCount;
		this._result.duration = this._dummyData.duration;
		this._result.returnVal = this._dummyData.returnVal;
		this._result.type = this._dummyData.type;
		if (this._dummyData.error) {
			this._result.error = this._dummyData.error;
		}
		onComplete && onComplete(this._result);
	}
	
	// export
	woosh.DummyTest = DummyTest;
})();
// woosh.Result
(function() {
	var undefined;
	/**
	@name woosh.Result
	@constructor
	@description Results from a test
	*/
	function Result() {}
	
	woosh._utils.extend(Result, Object, {
		/**
		@name woosh.Result#result
		@type number
		@description The result of the test, this will be time in milliseconds by default.
			For {@link woosh.TimeTest}, this will be the number of times the test called
			within the given time.
		*/
		result: undefined,
		/**
		@name woosh.Result#unit
		@type string
		@description The unit of the result, 'ms' by default
		*/
		unit: 'ms',
		/**
		@name woosh.Result#highestIsBest
		@type boolean
		@description Is the highest result best? False by default.
		*/
		highestIsBest: false,
		/**
		@name woosh.Result#type
		@type string
		@description The type of test used, 'Test', 'AsyncTest' or 'TimeTest'
		*/
		type: undefined,
		/**
		@name woosh.Result#error
		@type Error
		@description Error object thrown by the test, if any.
		*/
		error: null,
		/**
		@name woosh.Result#returnVal
		@type object
		@description Value returned by the test
		*/
		returnVal: undefined,
		/**
		@name woosh.Result#loopCount
		@type number
		@description Number of times the test looped
		*/
		loopCount: undefined,
		/**
		@name woosh.Result#duration
		@type number
		@description Amount of time in ms the test took.
			This is the amount of time taken to run all loops together.
		*/
		duration: undefined,
		/**
		@name woosh.Result#serialize
		@function
		@description Convert the results object into a urlencoded string that can be later unserialized
			Errors are serialized into a string containing their message.

		@returns {string}
		*/
		serialize: function() {
			return woosh._utils.urlEncode({
				result: this.result,
				unit: this.unit,
				type: this.type,
				error: (this.error || '') && this.error.message,
				loopCount: this.loopCount,
				duration: this.duration,
				returnVal: this.returnVal,
				returnValType: woosh._utils.constructorName(this.returnVal),
				highestIsBest: this.highestIsBest
			});
		},
		/**
		@name woosh.Result#unserialize
		@function
		@description Populate object using a string generated by {@link woosh.Result#serialize}
		
		@param {string} serial Serialized string
		
		@returns this
		*/
		unserialize: function(serial) {
			// I'm super serial!
			var obj = woosh._utils.urlDecode(serial),
				returnValFunc = obj.returnValType ? window[ obj.returnValType[0] ] : undefined;
				
			this.result = Number(obj.result && obj.result[0]);
			this.unit   = (obj.unit && obj.unit[0]) || undefined;
			this.type   = (obj.type && obj.type[0]) || undefined;
			this.error  = ( obj.error && obj.error[0] && new Error(obj.error[0]) ) || null;
			this.loopCount = ( obj.loopCount && Number(obj.loopCount[0]) ) || undefined;
			this.duration = ( obj.duration && Number(obj.duration[0]) ) || undefined;
			// attempt to cast the return val back to its original type
			this.returnVal = returnValFunc && obj.returnVal ? returnValFunc(obj.returnVal[0]) : undefined;
			this.highestIsBest = (obj.highestIsBest && obj.highestIsBest[0]) == 'true' ? true : false;
			
			return this;
		}
	});
	
	// export
	woosh.Result = Result;
})();
// woosh.LibraryResult
(function() {
	var undefined;
	/**
		@name woosh.LibraryResult
		@constructor
		@description A collection of Result objects of tests performed on a library
		
		@param {string} [name] A name for this set
	*/
	function LibraryResult(name) {
		this.name = name;
		this.results = {};
	}
	
	/**
		@name woosh.LibraryResult.load
		@function
		@description Returns the previously saved result.
			
		@returns {woosh.LibraryResult}
			Will return null if no saved result exists.
	*/
	LibraryResult.load = function() {
		var saved = null,
			win = window.parent || window;
		
		if (!win.name) { return saved; }
		
		try {
			saved = new woosh.LibraryResult().unserialize(win.name);
			saved.name += ' (saved)';
		} catch(e){}
		return saved;
	};
	
	/**
		@name woosh.LibraryResult.del
		@function
		@description Removes previously saved result
	*/
	LibraryResult.del = function() {
		var win = window.parent || window;
		win.name = '';
	};
	
	woosh._utils.extend(LibraryResult, Object, {
		/**
		@name woosh.LibraryResult#results
		@type object
		@description An object of test results keyed by test name
		*/
		results: {},
		/**
		@name woosh.LibraryResult#name
		@type string
		@description Name of the library
		*/
		name: undefined,
		/**
		@name woosh.LibraryResult#serialize
		@function
		@description Convert the result set into a string that can be later unserialized

		@returns {string}
		*/
		serialize: function() {
			// format is this.name followed by #, then for each result:
			// 		resultKey then ? then the Result serial, then :
			var resultSerials = '';
			
			for (var resultKey in this.results) {
				resultSerials += resultKey + '?' + this.results[resultKey].serialize() + ':';
			}
			return this.name + '#' + resultSerials;
		},
		unserialize: function(serial) {
			var pos = 0,
				resultSerials,
				resultSerial;
				
			pos = serial.indexOf('#');
			if (i == -1) {
				throw new Errow('woosh.LibraryResult#unserialize: Invalid serial');
			}
			// set name
			this.name = serial.slice(0, pos);
			pos++;
			
			resultSerials = serial.slice(pos).split(':').slice(0, -1);
			
			for (var i = 0, len = resultSerials.length; i < len; i++) {
				resultSerial = resultSerials[i];
				pos = resultSerial.indexOf('?');
				this.results[ resultSerial.slice( 0, pos ) ] = new woosh.Result().unserialize( resultSerial.slice(pos+1) );
			}
			
			return this;
		},
		/**
		@name woosh.LibraryResult#save
		@function
		@description Saves the result to window.name.
			The result can be loaded later using {@link woosh.LibraryResult#load}.
			
			Only one result can be saved. This will overwrite any other
			saved results.
		
		@returns this
		*/
		save: function() {
			var win = window.parent || window;
			win.name = this.serialize();
			return this;
		}		
	});
	
	woosh.LibraryResult = LibraryResult;
})();
// woosh.ResultComparison
(function() {
	/**
	@name woosh.ResultComparison
	@constructor
	@description Information about a single test ran against multiple libraries
	
	@param {object} results A object of woosh.Result, keyed by library name
	*/
	function ResultComparison(results) {
		this.results = results;
		this._analyseResults();
	}
	
	woosh._utils.extend(ResultComparison, Object, {
		/**
		@name woosh.ResultComparison#loopsEqual
		@type boolean
		@description Were the loop counts of all tests equal?
			Only available after all tests have ran.
			
			TimeTests probably won't have equal loops, this is expected.
		*/
		loopsEqual: null,
		/**
		@name woosh.ResultComparison#durationsEqual
		@type boolean
		@description Were the durations of all tests equal?
			Only available after all tests have ran.
			
			Other than TimeTests, this is expected to be false.
		*/
		durationsEqual: null,
		/**
		@name woosh.ResultComparison#returnValsEqual
		@type boolean
		@description Were the return values of all tests equal?
			Only available after all tests have ran
		*/
		returnValsEqual: null,
		/**
		@name woosh.ResultComparison#unitsEqual
		@type boolean
		@description Were the units of all tests equal?
			Only available after all tests have ran
		*/
		unitsEqual: null,
		/**
		@name woosh.ResultComparison#typesEqual
		@type boolean
		@description Were the types of all tests equal?
			Only available after all tests have ran
		*/
		typesEqual: null,
		/**
		@name woosh.ResultComparison#maxResult
		@type number
		@description The maximum result from the tests
			Only available after all tests have ran
		*/
		maxResult: null,
		/**
		@name woosh.ResultComparison#minResult
		@type number
		@description The minimum result from the tests
			Only available after all tests have ran
		*/
		minResult: null,
		/**
		@name woosh.ResultComparison#highestIsBest
		@type boolean
		@description Is the highest result best?
			Only available after all tests have ran
		*/
		highestIsBest: null,
		/**
		@name woosh.ResultComparison#results
		@type object
		@description The results being compared, keyed by library name (value may be undefined if there was no test for that library)
		*/
		results: {},
		/**
		@name woosh._TestRunner#_analyseResults
		@function
		@private
		@description Looks at the results and populate values
		*/
		_analyseResults: function() {
			var firstLoopCount, loopsEqual = true,
				firstReturnVal, returnValsEqual = true,
				firstUnit, unitsEqual = true,
				firstType, typesEqual = true,
				firstDuration, durationsEqual = true,
				resultVals = [],
				resultValsLen = 0,
				maxResult,
				minResult,
				highestIsBest,
				result,
				firstResult = true;
			
			for (var libraryName in this.results) {
				result = this.results[libraryName];
				if (!result) {
					continue;
				}
				if (firstResult) {
					highestIsBest = result.highestIsBest;
					firstLoopCount = result.loopCount;
					firstDuration = result.duration;
					firstReturnVal = result.returnVal;
					firstUnit = result.unit;
					firstType = result.type;
					firstResult = false;
				}
				if (result.result !== undefined && !result.error) {
					// remember the result
					resultVals[resultValsLen++] = result.result;
					// check the values are the same as first
					if ( !firstResult ) {
						loopsEqual = loopsEqual && (firstLoopCount == result.loopCount);
						durationsEqual = durationsEqual && (firstDuration == result.duration);
						returnValsEqual = returnValsEqual && (firstReturnVal == result.returnVal);
						unitsEqual = unitsEqual && (firstUnit == result.unit);
						typesEqual = typesEqual && ( firstType == result.type );
					}
				}
			}
			maxResult = Math.max.apply(Math, resultVals);
			minResult = Math.min.apply(Math, resultVals);
			
			// set properties
			this.loopsEqual = loopsEqual;
			this.durationsEqual = durationsEqual;
			this.unitsEqual = unitsEqual;
			this.typesEqual = typesEqual;
			this.maxResult  = maxResult;
			this.minResult  = minResult;
			this.type       = typesEqual ? firstType : '';
			this.highestIsBest   = highestIsBest;
			this.returnValsEqual = returnValsEqual;
		}
	});
	
	// export
	woosh.ResultComparison = ResultComparison;
})();
// woosh._LibraryTest & woosh.addTests
(function() {
	/**
	@name woosh._LibraryTest
	@constructor
	@private
	@description A set of tests to run against a library
	
	@param {string} libraryName Name of the library
	
	@param {Object} tests Obj of functions / woosh.Test instances
		Keys beginning $ have special meaning.
		
	*/
	function LibraryTest(libraryName, tests) {
		this.tests = {};
		this.testNames = [];
		this.libraryResult = new woosh.LibraryResult(libraryName);
		
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
	
	LibraryTest.prototype = {
		/**
		@name woosh._LibraryTest#iframe
		@type Element
		@description Iframe for this library test
			This is populated by {@link woosh._TestFrame}, so is only present
			for LibraryTests in an iframe.
		*/
		iframe: undefined,
		/**
		@name woosh._LibraryTest#tests
		@type Object
		@description Tests keyed by name
		*/
		tests: {},
		/**
		@name woosh._LibraryTest#testNames
		@type string[]
		@description Array of test names
		*/
		testNames: [],
		/**
		@name woosh._LibraryTest#libraryResult
		@type woosh.LibraryResult
		@description Resultset for these tests
		*/
		libraryResult: null,
		/**
		@name woosh._LibraryTest#_prevTestName
		@private
		@type string
		@description Name of the previously run test
		*/
		_prevTestName: undefined,
		/**
		@name woosh._LibraryTest#preTest
		@function
		@description Called before each test.
			Overridden by constructor 'tests' param, used to
			teardown / prepare of next test.
			
		@param {string} lastTestName Name of last test.
			Will be undefined for first test.
			
		@param {string} nextTestName Name of next test.
		*/
		preTest: function(lastTestName, nextTestName) {},
		/**
		@name woosh._LibraryTest#run
		@function
		@description Run a particular test.
			{@link woosh._LibraryTest#preTest} will be called before the test.
			
		@param {string} testName Name of test to run.
		@param {Function} onTestComplete Function to run when test complete
			Test name is passed as the 1st param.
			Result is passed in as the 2nd param.
			
		*/
		run: function(testName, onTestComplete) {
			var test = this.tests[testName],
				libraryTest = this;
			
			if (!test) {
				onTestComplete(testName);
				return;
			}
			
			this.preTest(this._prevTestName, testName);
			test._run(function(result) {
				libraryTest._prevTestName = testName;
				// add to resultset
				libraryTest.libraryResult.results[testName] = result;
				// signal the test is complete
				onTestComplete(testName, result);
			});
		}
	};
	
	/**
	@name woosh.addTests
	@function
	@writingTests
	@description Add a set of tests for a particular framework
		It's recommended to store each call to addTests in a separate
		file.
		
		The list of tests will be determined by the first call to addTests.
		If new test names appear in additional calls to addTests, they'll be
		ignored.
	
	@param {string} libraryName Library to test.
		Must be a property name within {@link woosh.libs}.
	
	@param {Object} tests Object of tests to add for this framework.
		Tests can either be functions, or instances of {@link woosh.Test} /
		{@link woosh.AsyncTest}. The instance of the test will be passed
		in as the first param of the function.
		
		Keys beginning "$" are considered special:
		
		<dl>
			<dt>$preTest</dt>
			<dd>
				This will be called before each test,
				2 params will be passed in, the name of
				the previous test and the name of the next. This will only
				call once per test, no matter what the loopCount is.
			</dd>
		</dl>
		
	@example
		woosh.addTests("glow-170", {
			'$preTest': function(prevTest, nextTest) {
				resetTestHtml();
			},
			'mySimpleTest': function() {
				// do some stuff
				
				// return a value (this will be checked against the results of other tests)
				return returnVal;
			},
			'myComplexTest': woosh.Test(5000, function(test) {				
				// do some stuff
				
				// return a value (this will be checked against the results of other tests)
				return returnVal;
			}),
			'myAsyncTest': woosh.AsyncTest(5000, function(test) {				
				// do some async stuff
				
				// return a value (this will be checked against the results of other tests)
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
				if (woosh._libraryTest) {
					throw new Error('Library tests already been defined for this page');
				}
				/**
				@name woosh._libraryTest
				@type woosh._LibraryTest
				@description The library tests for this frame to test
				*/
				woosh._libraryTest = new LibraryTest(libraryName, tests);
			}
		}
		return woosh;
	}
	/**
	@name woosh._libsToConduct
	@type string[]
	@description Library names that should be conducted when {@link woosh._pageMode} is 'conducting'
	*/
	var libsToConduct = [],
		libsAdded = {};
	
	
	window.woosh.addTests = addTests;
	window.woosh._LibraryTest = LibraryTest;
	window.woosh._libsToConduct = libsToConduct;
})();
// woosh._TestRunner
(function() {
	var undefined;
	
	/**
	@name woosh._TestRunner
	@constructor
	@private
	@description Helper to run and analyse a set of tests of the same name (but against different libraries)
	
	@param {Object} libraryTest Obj of woosh._LibraryTest instances keyed by library name
	
	@param {woosh.LibraryResult[]} libraryResults Array of LibraryResults to include in result building
		They will fire the same events as other tests.
	*/
	function TestRunner(libraryTest, libraryResults) {
		this.libraryTest = libraryTest;
		this.libraryNames = [];
		this.libraryResults = libraryResults || [];
		var i = 0;
		
		// gather library names
		for (var key in libraryTest) {
			this.libraryNames[i++] = key;
		}
	}
	
	woosh._utils.extend(TestRunner, Object, {
		/**
		@name woosh._TestRunner#libraryTest
		@type Object
		@description Obj of woosh._LibraryTest instances keyed by library name
		*/
		libraryTest: {},
		/**
		@name woosh._TestRunner#libraryNames
		@type string[]
		@description Array of library names to test
		*/
		libraryNames: [],
		/**
		@name woosh._TestRunner#libraryResults
		@type woosh.LibraryResult[]
		@description Array of result sets for previously ran tests
		*/
		libraryResults: [],
		/**
		@name woosh._TestRunner#run
		@function
		@description Run the test of tests
		
		@param {string} testName Name of test to run
		
		@param {Function} onTestComplete Callback for when a test completes
			Passed 2 params, the name of the library the test ran for & the Test instance
			
		@param {Function} onComplete Callback for when all tests in the set complete
			A woosh.ResultComparison is passed in as the first param
		*/
		run: function(testName, onTestComplete, onComplete) {
			var libIndex = -1,
				libraryResult,
				libraryResultsIndex = 0,
				libraryResultsLen = this.libraryResults.length,
				currentLibName,
				currentLibraryTest,
				results = {},
				testRunner = this,
				isVisualTest;
			
			function testComplete(testName, result) {
				// hide iframe if it was shown
				if (isVisualTest) {
					currentLibraryTest.iframe.className = currentLibraryTest.iframe.className.replace(' show', '');
				}
				results[currentLibName] = result;
				onTestComplete(currentLibName, result);
				setTimeout(function() {
					runNextTest();
				}, 300);
			}
			
			function runNextTest() {				
				if (libraryResultsIndex < libraryResultsLen) {
					libraryResult = testRunner.libraryResults[libraryResultsIndex];
					currentLibName = libraryResult.name;
					testComplete( testName, libraryResult.results[testName] );
					libraryResultsIndex++;
				} else {
					// get the frame for the next library
					currentLibName = testRunner.libraryNames[ ++libIndex ];
					currentLibraryTest = testRunner.libraryTest[currentLibName];
					
					
					// if there's none, then we're done!
					if (currentLibraryTest) {
						// do we need to show the iframe while the test happens?
						isVisualTest = woosh._utils.constructorName( currentLibraryTest.tests[testName] ) == 'VisualTest';
						if (isVisualTest) {
							currentLibraryTest.iframe.className += ' show';
						}
						currentLibraryTest.run(testName, testComplete);
					} else {
						onComplete( new woosh.ResultComparison(results) );
					}
				}
			}
			
			runNextTest();
		}
	});
	woosh._TestRunner = TestRunner;
})();
// woosh._TestFrame
(function() {	
	/**
	@name woosh._TestFrame
	@constructor
	@private
	@description An iframe for testing a particular library
	
	@param {string} libraryName Library to include for these tests.
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
			// NetFront on the PS3 fires onload twice, thanks.
			if (iframeonload._hasCalled) {
				return;
			}
			iframeonload._hasCalled = true;
			/**
			@name woosh._TestFrame#window
			@type Window
			@description The window object of the frame
			*/
			testFrame.window = iframe.contentWindow;
			/**
			@name woosh._TestFrame#libraryTest
			@type woosh._LibraryTest
			@description The library tests created in this frame
			*/
			testFrame.libraryTest = testFrame.window.woosh._libraryTest;
			// set the iframe on the LibraryTest
			testFrame.libraryTest.iframe = iframe;
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
// woosh.Conductor
(function() {
	/**
	@name woosh.Conductor
	@constructor
	@description Conducts the testing and provides feedback via events.
		When writing plugins you don't need to construct one of these,
		you'll be provided an instance via {@link woosh.ready}.
		
	@param {string[]} libraryNames Names of libraries to be tested.
	
	@param {Function} onReady A function to call when the Conductor is ready to use.
	*/
	function Conductor(libraryNames, onReady) {
		var numOfFramesWaiting = libraryNames.length,
			conductor = this,
			testFrame,
			savedResults = [woosh.LibraryResult.load()];
		
		if ( !savedResults[0] ) {
			savedResults = [];
		}
			
		this._listeners = [];
		this._currentTestIndex = -1;
		this._testFrames = {};
		this._libraryResults = {};
		this.libraryNames = libraryNames;
		this.testsToRun = [];
		
		// do we have saved results?
		if (savedResults[0]) {
			this.libraryNames = [savedResults[0].name].concat(libraryNames);
			this.savedResultName = savedResults[0].name;
		}
		
		// call onReady when all frames have loaded
		function testFrameReady() {
			if ( !--numOfFramesWaiting ) {
				// get test names from first library's tests
				conductor.testNames = conductor._testFrames[ libraryNames[0] ].libraryTest.testNames;
				
				var libraryTests = {};
				// create the testset
				for (var i = 0, len = libraryNames.length; i<len; i++) {
					testFrame = conductor._testFrames[ libraryNames[i] ];
					libraryTests[ libraryNames[i] ] = testFrame.libraryTest;
					conductor._libraryResults[ libraryNames[i] ] = testFrame.libraryTest.libraryResult;
				}
				
				conductor._testRunner = new woosh._TestRunner(libraryTests, savedResults);
				conductor._fire('ready');
				onReady.call(conductor);
			}
		}
		
		for (var i = 0, len = libraryNames.length; i < len; i++) {
			this._testFrames[ libraryNames[i] ] = new woosh._TestFrame(libraryNames[i], testFrameReady);
		}
	}
	
	Conductor.prototype = {
		/**
		@name woosh.Conductor#testNames
		@type string[]
		@description The names of all tests provided
		*/
		testNames: [],
		/**
		@name woosh.Conductor#libraryNames
		@type string[]
		@description Library names being tested
		*/
		libraryNames: [],
		/**
		@name woosh.Conductor#savedResultName
		@type string
		@description What's the name of the saved result, if any
		*/
		savedResultName: '',
		/**
		@name woosh.Conductor#testsToRun
		@type string[]
		@description Subset of tests to run
			The user may not choose to run all tests. This value will
			be final once the 'start' event fires.
		
			If empty, all tests will run
		*/
		testsToRun: [],
		/**
		@name woosh.Conductor#_testRunner
		@type woosh._TestRunner
		@description Runner for the test sets
		*/
		_testRunner: undefined,
		/**
		@name woosh.Conductor#_libraryResults
		@type Object
		@description woosh.LibraryResult objects keyed by library name
		*/
		_libraryResults: undefined,
		/**
		@name woosh.Conductor#_listeners
		@type Array[]
		@description Array of arrays:
			[
				[listenerObj, thisVal],
				[listenerObj, thisVal]...
			]
		*/
		_listeners: [],
		/**
		@name woosh.Conductor#_currentTestIndex
		@private
		@type number
		@description Index number for the current test.
			Is -1 before tests have started.
		*/
		_currentTestIndex: -1,
		/**
		@name woosh.Conductor#_testFrames
		@private
		@type Object
		@description Object of {@link woosh._TestFrame}s
			The key is the name of the library being tested in the frame.
		*/
		_testFrames: {},
		/**
		@name woosh.Conductor#start
		@function
		@description Start running tests
		*/
		start: function() {
			this._fire('start');
			
			var testIndex = -1,
				currentTestName,
				resultComparisons = {},
				conductor = this,
				// create a string to make it easier to check if we should be running a particular test
				testsToRunStr = conductor.testsToRun.length ? '##' + conductor.testsToRun.join('##') + '##' : '';
			
			// called when all tests of a given name are complete
			function testSetComplete(resultComparison) {
				resultComparisons[currentTestName] = resultComparison;
				conductor._fire( 'testSetComplete', [currentTestName, resultComparison] );
				runNextTestPerFrame();
			}
			
			// called when a test completes (once per library)
			function testComplete(libraryName, results) {
				conductor._fire( 'testComplete', [libraryName, currentTestName, results] );
			}
			
			function runNextTestPerFrame() {
				if (testsToRunStr) {
					// find the next test we want to run
					while (currentTestName = conductor.testNames[ ++testIndex ]) {
						if ( testsToRunStr.indexOf('##' + currentTestName + '##') != -1) {
							break;
						}
					}
				} else {
					currentTestName = conductor.testNames[ ++testIndex ];
				}
				
				if (currentTestName) {
					conductor._testRunner.run(currentTestName, testComplete, testSetComplete);
				} else {
					// we're done!
					conductor._fire( 'allTestsComplete', [conductor._libraryResults, resultComparisons] );
				}
			}
			
			runNextTestPerFrame();
		},
		/**
		@name woosh.Conductor#addListener
		@function
		@description Add an object to listen for conductor events. Conductor fires the following:
			listener.ready()
				- When the conductor is able to start
			
			listener.start()
				- When the conductor starts
			
			listener.testSetComplete(testName, resultComparison)
				- Called when the same test name is completed in each {@link woosh._TestFrame}
				- testName is the name of the test
				- resultComparison is the {@link woosh.ResultComparison} used to run the tests
				
			listener.testComplete(libraryName, testName, results)
				- Called when a test completes for a particular library
				- libraryName is the name of the library the test was completed for
				- testName is the name of the test
				- results is an instance of woosh.Results. Will be udefined if the test was missing.
				
			listener.allTestsComplete(libraryResults, resultComparisons)
				- Called when all queued tests have completed
				- libraryResults is an object of woosh.LibraryResult keyed by library name
				- resultComparisons is an object of woosh.ResultComparisons keyed by test name
		
		@param {object} listener Object to fire events on
		@param {object} thisVal What 'this' should equal in the callbacks
		*/
		addListener: function(listener, thisVal) {
			thisVal = thisVal || this;
			this._listeners.push( [listener, thisVal] );
		},
		/**
		@name woosh.Conductor#_fire
		@function
		@private
		@description Fires an event
		
		@param {string} name Event name
		@param {object[]} args Arguments to pass into the callback
		*/
		_fire: function(name, args) {
			args = args || [];
			var func;
			for (var i = 0, len = this._listeners.length; i<len; i++) {
				func = this._listeners[i][0][name];
				func && func.apply(this._listeners[i][1], args);
			}
		}
	};
	
	window.woosh.Conductor = Conductor;
})();
// woosh.views
(function() {
	/**
	@name woosh.views
	@namespace
	@description Constructors for visual output of test results
	*/
	woosh.views = {};
})();
// woosh.views.Table
(function() {
	var tableHeading = '<th></th>',
		tableCell = '<td></td>',
		ratingCellColours = [
			[238, 87, 87],
			[255, 254, 129],
			[198, 231, 70]
		],
		ratingTextColours = [
			[63, 0, 0],
			[111, 102, 0],
			[94, 116, 11]
		];
	
	// builds the skeleton of a results table
	function createResultsTable(libsLen, testsLen) {
		var tmpDiv = document.createElement('div'),
			tableStr = '<table class="wooshTable"><thead>',
			resultRowStr;
		
		// add headers for library names to go in	
		tableStr += '<tr><th><input type="checkbox" id="selectAll" class="checkbox" checked>Tests</th>' + ( new Array(libsLen+1).join(tableHeading) ) + '</tr>';
		tableStr += '</thead><tbody>';
		// add result rows
		resultRowStr = '<tr>' + tableHeading + new Array(libsLen+1).join(tableCell) + '</tr>';
		tableStr += new Array(testsLen+1).join(resultRowStr);
		tableStr += '</tbody></table>';
		
		tmpDiv.innerHTML = tableStr;
		
		return tmpDiv.firstChild;
	}
	
	/**
	@name woosh.views.Table
	@constructor
	@private
	@description Create a dynamically updating table to display results
	
	@param {woosh.Conductor} conductor Test conductor to get results from
	@param {HTMLElement} outputElement Element to output to
	*/
	function Table(conductor, outputElement) {
		this.conductor = conductor;
		this._element = createResultsTable(conductor.libraryNames.length, conductor.testNames.length);
		this._testRows = {};
		this._libColIndex = {};
		this._checkboxes = [];
		
		outputElement.appendChild(this._element);
		this._initAndIndex();
		conductor.addListener(this._listener, this);
	}
	
	Table.prototype = {
		/**
		@name woosh.views.Table#conductor
		@type woosh.Conductor
		@description The instance conducting the test
		*/
		conductor: undefined,
		/**
		@name woosh.views.Table#_element
		@private
		@type HTMLElement
		@description Table element that can be appended to the document
		*/
		_element: undefined,
		/**
		@name woosh.views.Table#_testRows
		@type Object
		@description Object of table rows keyed on test name
		*/
		_testRows: {},
		/**
		@name woosh.views.Table#_libColIndex
		@type Object
		@description Column index for a library, keyed on library name
		*/
		_libColIndex: {},
		/**
		@name woosh.views.Table#_nextResultCell
		@type HTMLElement
		@description The next cell to write to
		*/
		_nextResultCell: undefined,
		/**
		@name woosh.views.Table#_libraryResults
		@type Object
		@description woosh.LibraryResult objects keyed on library name
		*/
		_libraryResults: {},
		/**
		@name woosh.views.Table#_selectAllCheckbox
		@type HTMLElement
		@description The checkbox for selecting all / no tests
		*/
		_selectAllCheckbox: undefined,
		/**
		@name woosh.views.Table#_checkboxes
		@type HTMLElement[]
		@description The checkboxs for selecting which tests to run
		*/
		_checkboxes: undefined,
		/**
		@name woosh.views.Table#_checkboxesChecked
		@type number
		@description The number of checkboxes checked
		*/
		_checkboxesChecked: 0,
		/**
		@name woosh.views.Table#initAndIndex
		@function
		@private
		@description Populate the headings and index row element on {@link woosh.views.Table#_testRows}
		*/
		_initAndIndex: function() {
			var libRowCells = this._element.firstChild.firstChild.childNodes,
				testRows = this._element.childNodes[1].childNodes,
				testNames = this.conductor.testNames,
				libraryNames = this.conductor.libraryNames,
				table = this,
				a;
			
			// add listener to the select all checkbox
			this._selectAllCheckbox = libRowCells[0].getElementsByTagName('input')[0];
			this._selectAllCheckbox.onclick = function() {
				table._selectAllClick();
			}
			
			// headings
			for (var i = 0, len = libraryNames.length; i < len; i++) {
				this._libColIndex[ libraryNames[i] ] = i+1;
				a = document.createElement('a');
				a.href = '#';
				a._libName = libraryNames[i];
				
				if ( libraryNames[i] == this.conductor.savedResultName ) {
					a.className = 'delete';
					a.appendChild( document.createTextNode('Delete') );
					a.title = 'Delete';
					a.onclick = function() {
						woosh.LibraryResult.del();
						woosh.views.alert.ok('Results for ' + this._libName.replace(' (saved)', '') + ' deleted. Refresh to see changes.');
						return false;
					}
				}
				else {
					a.className = 'save';
					a.appendChild( document.createTextNode('Save') );
					a.title = 'Save';
					a.onclick = function() {
						woosh.views.alert.ok('Results for ' + this._libName + ' saved. Refresh to see changes.');
						table._libraryResults[this._libName].save();
						return false;
					}
				}
				libRowCells[i+1].appendChild(a);
				libRowCells[i+1].appendChild( document.createTextNode( libraryNames[i] ) );
			}
			// rows
			for (var i = 0, len = testNames.length; i < len; i++) {
				this._testRows[ testNames[i] ] = testRows[i];
				testRows[i].firstChild.innerHTML = '<input type="checkbox" class="checkbox" checked>';
				this._checkboxes.push( testRows[i].firstChild.firstChild );
				testRows[i].firstChild.firstChild.value = testNames[i];
				testRows[i].firstChild.appendChild( document.createTextNode( testNames[i] ) );
				
				// TODO: delegate this event
				// Click the table heading to make the info toggle / catch the checkbox click
				testRows[i].firstChild.onclick = function(event) {
					event = event || window.event;
					
					var tableRow = this.parentNode,
						src = (event.target || event.srcElement);
						
					if (src.className == 'checkbox') {
						table._checkboxClick(src);
					} else {
						if (tableRow.className == 'fullInfo') {
							tableRow.className = '';
						}
						else {
							tableRow.className = 'fullInfo';
						}
					}
				}
			}
			// get first cell to write to
			this._nextResultCell = testRows[0].childNodes[1];
		},
		/**
		@name woosh.views.Table#_listener
		@type Object
		@private
		@description Listener to the conductor
		*/
		_listener: {
			start: function() {
				this._setTestsToRun();
			},
			testComplete: function(libraryName, testName, result) {
				this._addResult(libraryName, testName, result);
			},
			testSetComplete: function(testName, resultComparison) {
				this._checkResults(testName, resultComparison);
			},
			allTestsComplete: function(libraryResults) {
				this._libraryResults = libraryResults;
			}
		},
		/**
		@name woosh.views.Table#_addResult
		@function
		@private
		@description Add a result to the table in the position of the cursor
		
		@param {string} libraryName 
		@param {string} testName 
		@param {woosh.Result} result 
		*/
		_addResult: function(libraryName, testName, result) {
			var resultText,
				infoNode,
				infoDefs = {},
				dt, dd,
				resultRow = this._testRows[testName],
				resultCell = resultRow.childNodes[ this._libColIndex[libraryName] ];
			
			if (result && result.error) {
				resultText = 'Error';
				resultCell.className += ' error';
				infoNode = document.createElement('div');
				infoNode.appendChild( document.createTextNode(result.error.message) )
			}
			else if (result) {
				// round the result value
				if (result.unit == 'ms') {
					resultText = Math.round(result.result * 10000) / 10000 + result.unit;
				} else {
					resultText = result.result + result.unit;
				}
				infoDefs = {
					'Loop Count': result.loopCount,
					'Duration': result.duration + 'ms',
					'Return Value': result.returnVal,
					'Test Type': result.type
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
		@name woosh.views.Table#_checkResults
		@function
		@private
		@description Checks a set of results for a particular test, updates the table with warnings etc
		 
		@param {string} testName 
		@param {woosh.ResultComparison} resultComparison Data about the tests that ran
		*/
		_checkResults: function(testName, resultComparison) {
			var resultRow = this._testRows[testName],
				testNameCell = resultRow.firstChild,
				infoNode,
				warningMsg = '',
				results = resultComparison.results,
				result,
				testCell,
				resultPercent,
				cellBg,
				cellText,
				placeInGradient,
				resultDifference;

			for (var libraryName in results) {
				result = results[libraryName];
				if (!result || result.error) {
					continue;
				}
				testCell = resultRow.childNodes[ this._libColIndex[libraryName] ];
				resultDifference = resultComparison.maxResult - resultComparison.minResult;
				
				// the result difference is 0 if all results are the same or there's only one result
				if (resultDifference === 0) {
					resultPercent = Number(resultComparison.highestIsBest);
				}
				else {
					resultPercent = ( (result.result - resultComparison.minResult) / (resultComparison.maxResult - resultComparison.minResult) );
				}
				
				// flip the result if low results are good
				if (!resultComparison.highestIsBest) {
					resultPercent = 1 - resultPercent;
				}
				
				cellBg = {};
				cellText = {};
				
				if (resultPercent > 0.5) {
					placeInGradient = (resultPercent - 0.5) * 2;
					cellBg = {
						r: Math.round( ((ratingCellColours[2][0] - ratingCellColours[1][0]) * placeInGradient) + ratingCellColours[1][0] ),
						g: Math.round( ((ratingCellColours[2][1] - ratingCellColours[1][1]) * placeInGradient) + ratingCellColours[1][1] ),
						b: Math.round( ((ratingCellColours[2][2] - ratingCellColours[1][2]) * placeInGradient) + ratingCellColours[1][2] )
					}
					cellText = {
						r: Math.round( ((ratingTextColours[2][0] - ratingTextColours[1][0]) * placeInGradient) + ratingTextColours[1][0] ),
						g: Math.round( ((ratingTextColours[2][1] - ratingTextColours[1][1]) * placeInGradient) + ratingTextColours[1][1] ),
						b: Math.round( ((ratingTextColours[2][2] - ratingTextColours[1][2]) * placeInGradient) + ratingTextColours[1][2] )
					}
				} else {
					placeInGradient = resultPercent * 2;
					
					cellBg = {
						r: Math.round( ((ratingCellColours[1][0] - ratingCellColours[0][0]) * placeInGradient) + ratingCellColours[0][0] ),
						g: Math.round( ((ratingCellColours[1][1] - ratingCellColours[0][1]) * placeInGradient) + ratingCellColours[0][1] ),
						b: Math.round( ((ratingCellColours[1][2] - ratingCellColours[0][2]) * placeInGradient) + ratingCellColours[0][2] )
					}
					cellText = {
						r: Math.round( ((ratingTextColours[1][0] - ratingTextColours[0][0]) * placeInGradient) + ratingTextColours[0][0] ),
						g: Math.round( ((ratingTextColours[1][1] - ratingTextColours[0][1]) * placeInGradient) + ratingTextColours[0][1] ),
						b: Math.round( ((ratingTextColours[1][2] - ratingTextColours[0][2]) * placeInGradient) + ratingTextColours[0][2] )
					}
				}
				
				testCell.style.backgroundColor = 'rgb(' + cellBg.r + ',' + cellBg.g + ',' + cellBg.b + ')';
				testCell.style.color = 'rgb(' + cellText.r + ',' + cellText.g + ',' + cellText.b + ')';
				
				if (result.result === resultComparison.maxResult || result.result === resultComparison.minResult) {
					testCell.style.fontWeight = 'bold';
				}
			}
			if (
				!(
					(resultComparison.type == 'TimeTest' || resultComparison.loopsEqual) &&
					(resultComparison.type != 'TimeTest' || resultComparison.durationsEqual) &&
					resultComparison.returnValsEqual &&
					resultComparison.unitsEqual &&
					resultComparison.typesEqual
				)
			) {	
				!resultComparison.loopsEqual && resultComparison.type != 'TimeTest' && (warningMsg += ' Tests have differing loop counts.');
				!resultComparison.durationsEqual && resultComparison.type == 'TimeTest' && (warningMsg += ' Tests have differing durations.');
				!resultComparison.returnValsEqual &&	(warningMsg += ' Tests have differing return values.');
				!resultComparison.unitsEqual && 		(warningMsg += ' Test results are of differing units.');
				!resultComparison.typesEqual &&			(warningMsg += ' Tests are of differing types.');
				infoNode = document.createElement('div');
				infoNode.className = 'info';
				infoNode.appendChild( document.createTextNode(warningMsg) );
				testNameCell.appendChild(infoNode);
				testNameCell.className += ' mismatch';
			}
		},
		/**
		@name woosh.views.Table#_selectAllClick
		@function
		@private
		@description Handles the user clicking the 'select all' checkbox
		*/
		_selectAllClick: function() {
			var checkboxes = this._element.getElementsByTagName('input'),
				checkbox;
			
			this._checkboxesChecked = this._selectAllCheckbox.checked ? checkboxes.length - 1 : 0;
			
			for (var i = 0, len = checkboxes.length; i<len; i++) {
				checkbox = checkboxes[i];
				if (checkbox.type == 'checkbox') {
					checkbox.checked = this._selectAllCheckbox.checked;
					checkbox.style.visibility = 'visible';
				}
			}
		},
		/**
		@name woosh.views.Table#_checkboxClick
		@function
		@private
		@description Handles the user clicking a checkbox other than 'select all'
		
		@param {HTMLElement} checkbox The checkbox clicked
		*/
		_checkboxClick: function(checkbox) {
			checkbox.checked ? this._checkboxesChecked++ : this._checkboxesChecked--;
			
			if (this._checkboxesChecked == 0) {
				this._selectAllCheckbox.checked = false;
			}
			else if (this._checkboxesChecked == this._checkboxes.length) {
				this._selectAllCheckbox.checked = true;
			}
			else {
				this._selectAllCheckbox.checked = false;
				this._selectAllCheckbox.indeterminate = true;
			}
		},
		/**
		@name woosh.views.Table#_setTestsToRun
		@function
		@private
		@description Looks at the checkboxes and tells the conductor which tests to run
		*/
		_setTestsToRun: function() {
			var checkbox,
				testsToRun = this.conductor.testsToRun = [];
				
			for (var i = 0, len = this._checkboxes.length; i<len; i++) {
				checkbox = this._checkboxes[i];
				if (checkbox.checked) {
					testsToRun.push(checkbox.value);
				}
			}
		}
	}
	
	woosh.views.Table = Table;
})();
// woosh.views.alert
(function() {
	/**
	@name woosh.views.alert
	@namespace
	@description A set of functions for providing information to the user
	*/
	var alert = {},
		container = document.createElement('div'),
		closeBtn = document.createElement('a'),
		msgTimeout = 5000;
	
	container.className = 'wooshAlerts';
	closeBtn.href = '#';
	closeBtn.className = 'close';
	closeBtn.innerHTML = 'X';
	
	// creates an alert
	function addAlert(className, msg) {
		var elm = document.createElement('div'),
			msgElm = document.createElement('div'),
			close = closeBtn.cloneNode(true),
			timeout;
		
		elm.className = 'wooshAlert ' + className;
		elm.appendChild(close);
		
		msgElm.className = 'msg';
		msgElm.appendChild( document.createTextNode(msg) );
		elm.appendChild(msgElm);
		
		container.appendChild(elm);
		
		function remove() {
			clearTimeout(timeout);
			// would just set these to undefined but IE gets in the way
			close.onclick = new Function;
			elm.onclick = new Function;
			elm.parentNode.removeChild(elm);
			return false;
		}
		
		// if the message is clicked, don't auto-hide it
		elm.onclick = function() {
			clearTimeout(timeout);
		}
		
		close.onclick = remove;
		timeout = setTimeout(remove, msgTimeout);
	}
	
	/**
	@name woosh.views.alert._container
	@type HTMLElement
	@description Element containing the alerts
	*/
	alert._container = container;
	
	/**
	@name woosh.views.alert.ok
	@function
	@description Informs the user that something worked
	
	@param {string} msg Message to display
	*/
	alert.ok = function(msg) {
		addAlert('ok', msg);
	}
	
	// export
	woosh.views.alert = alert;
})();
// woosh.views._outputInterface
(function() {
	/**
		@name woosh.views._outputInterface
		@function
		@private
		@description Builds the output interface to display to the user
		@param {woosh.Conductor} conductor Conductor running the test
	*/
	function outputInterface(conductor) {
		var wooshOutput = document.getElementById('wooshOutput');
		
		if (!wooshOutput) {
			return;
		}
		
		var output = document.createElement('div');
		
		output.innerHTML = '<div id="wooshBanner"><h1>' + document.title + '</h1></div><div id="wooshUa">' + navigator.userAgent + '</div><div id="wooshCommands"></div><div id="wooshViewOutput"><div>';
		output.appendChild( woosh.views.alert._container );
		wooshOutput.appendChild(output);
		
		conductor.addListener({
			allTestsComplete: function() {
				document.documentElement.className += ' allTestsComplete';
			}
		});
		
		var a = document.createElement('a');
		a.href = '#';
		a.id = 'startLink';
		a.className = 'wooshButton';
		a.innerHTML = 'Start';
		a.onclick = function() {
			conductor.start();
			this.style.visibility = 'hidden';
			return false;
		}
		
		conductor.addListener({
			ready: function() {
				document.getElementById('wooshCommands').appendChild(a);
			}
		})
	}
	
	woosh.views._outputInterface = outputInterface;
})();
// woosh.ready and woosh._fireReady
(function() {
	/**
		@name woosh.ready
		@function
		@description Add a callback to run when woosh is ready
			
		@param {Function} callback Function to call
			The callback is given 2 params, the {@link woosh.Conductor} in
			use and an element to output view elements to.
			
		@example
			woosh.ready(function(conductor, outputElement) {
				new BarChart(conductor, outputElement);
			});
	*/
	var callbacks = [];
		
	function ready(callback) {
		callbacks.push(callback);
	}
	
	/**
		@name woosh._fireReady
		@function
		@private
		@description Fires all the queued ready callbacks
		
		@param {woosh.Conductor} conductor The conductor running the test
		@param {HTMLElement} outputElement An element to output to
	*/
	function fireReady(conductor, outputElement) {
		for (var i = 0, len = callbacks.length; i<len; i++) {
			callbacks[i](conductor, outputElement);
		}
		callbacks = [];
	}
	
	// export
	woosh.ready = ready;
	woosh._fireReady = fireReady;
})();
// page setup
(function() {
	/**
	@name woosh._pageMode
	@type string
	@private
	@description The mode the page is running in.
		<dl>
			<dt>'conducting'</dt>
			<dd>Will create frames for libraries to be tested</dd>
			<dt>'testing'</dt>
			<dd>Will load a library onto the page and create a LibraryTest object</dd>
		</dl>
	*/
	woosh._pageMode = 'conducting';

	// set this frame / window up
	var query = woosh._utils.urlDecode( window.location.search.slice(1) );
	
	if (query.lib) {
		// Ok, we're running tests against a library
		// we need to load a particular library
		woosh._pageMode = 'testing';
		woosh._utils.loadAssets.apply( this, woosh.libs[ query.lib[0] ] );
		document.documentElement.className = 'testing';
		/**
		@name woosh._libraryToTest
		@private
		@type string
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
			
			var viewOutput;
			
			/**
			@name woosh._conductor
			@type woosh.Conductor
			@private
			@description The conductor for this page
			*/
			woosh._conductor = new woosh.Conductor(woosh._libsToConduct, function() {
				woosh._fireReady(woosh._conductor, viewOutput);
			});
			
			// build the main interface
			woosh.views._outputInterface(woosh._conductor);
			
			// set up views
			viewOutput = document.getElementById('wooshViewOutput');
			viewOutput.appendChild( woosh.views.alert._container );
			
			woosh.ready(function(conductor, outputElement) {
				new woosh.views.Table(conductor, outputElement);
			});
		};
	}
})();