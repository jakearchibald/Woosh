/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {
	publish.conf = {  // trailing slash expected for dirs
		ext: '.html',
		outDir: JSDOC.opt.d,
		symbolsDir:  "api/",
		templatesDir: JSDOC.opt.t
	};
		
	// used to allow Link to check the details of things being linked to
	Link.symbolSet = symbolSet;

	// create the required templates
	try {
		var symbolTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"symbol.tmpl");
		var indexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"index.tmpl");
	}
	catch(e) {
		print("Couldn't create the required templates: "+e);
		quit();
	}
	
	// get an array version of the symbolset, useful for filtering
	var symbols = symbolSet.toArray();
	
	symbols.forEach(function(symbol) {
		if ( members[symbol.memberOf] ) {
			members[symbol.memberOf].push(symbol);
		} else {
			members[symbol.memberOf] = [symbol];
		}
	});
	
	// sort the members
	for (var symbolName in members) {
		members[symbolName] = members[symbolName].sort( makeSortby("alias") );
	}
 	
 	// get a list of all the classes in the symbolset
 	var symbolsForPages = symbols.filter(hasOwnPage).sort( makeSortby("alias") );
	
	// create a filemap in which outfiles must be to be named uniquely, ignoring case
	if (JSDOC.opt.u) {
		var filemapCounts = {};
		Link.filemap = {};
		for (var i = 0, l = symbolsForPages.length; i < l; i++) {
			var lcAlias = symbolsForPages[i].alias.toLowerCase();
			
			if (!filemapCounts[lcAlias]) filemapCounts[lcAlias] = 1;
			else filemapCounts[lcAlias]++;
			
			Link.filemap[symbolsForPages[i].alias] = 
				(filemapCounts[lcAlias] > 1)?
				lcAlias+"_"+filemapCounts[lcAlias] : lcAlias;
		}
	}
	
	// The grand plan:
	//   Output 3 copies for one template
	//   One for how to write tests, with the relevent API
	//   One for how to write views, with the relevent API
	//   One with the full API, for hacking / contributing
	//   They all share an index template and a class template
	//   Each has a left-hand nav which indicates the current page
	//   LHN covers namespaces and classes that hang off woosh
	//   LHN expands to show inner namespaces & classes for that item
	//   Each page provides a switch to the view API & full API (link disabled if page doesn't exist)
	//   This switch is a tab like woosh's start button
	//   Pages are styled like the rest of woosh 
	//
	
	// create the folders and subfolders to hold the output
	IO.mkPath( (publish.conf.outDir+'writingTests/api').split('/') );
	IO.mkPath( (publish.conf.outDir+'writingViews/api').split('/') );
	IO.mkPath( (publish.conf.outDir+'fullApi/api').split('/') );
	
	var mode,
		data = {},
		output,
		symbol;
	
	// build nav
	data.nav = new Nav( symbolSet.getSymbol('woosh') )
	//data.nav.active = symbolSet.getSymbol('woosh.Test');
	data.modeSwitch = new ModeSwitch();
	
	for (var i = 0, len = modes.length; i<len; i++) {
		publish.conf.symbolsDir = 'api/';
		mode = modes[i];
		data.nav.mode = mode;
		data.nav.active = undefined;
		data.modeSwitch.mode = mode;
		data.modeSwitch.symbol = undefined;
		
		// build index
		output = indexTemplate.process(data);
		IO.saveFile(publish.conf.outDir + mode, 'index' + publish.conf.ext, output);
		
		publish.conf.symbolsDir = '';
		
		// create each of the class pages
		for (var j = 0, jlen = symbolsForPages.length; j < jlen; j++) {
			symbol = symbolsForPages[j];
			data.nav.active = symbol;
			data.modeSwitch.symbol = symbol;
			data.symbol = symbol;
			data.members = organiseMembers(symbol, function(symbol) {
				return shouldOutput(symbol, mode);
			});
			
			symbol.events = symbol.getEvents();   // 1 order matters
			symbol.methods = symbol.getMethods(); // 2
			
			output = symbolTemplate.process(data);
			
			IO.saveFile(publish.conf.outDir + mode + '/api', ((JSDOC.opt.u)? Link.filemap[symbol.alias] : symbol.alias) + publish.conf.ext, output);
		}
	}
}

// does a symbol get its own page?
function hasOwnPage($) {
	return ($.is("CONSTRUCTOR") || $.isNamespace) && $.alias != '_global_';	
}

// a quick way to get the members of an item
var members = {};
var modes = [],
	modeNames = {
		writingTests: 'Writing Tests',
		writingViews: 'Writing Views',
		fullApi: 'Full API'
	};
	
(function(){
	for (var mode in modeNames) {
		modes.push(mode);
	}
})();

// Nav object for generating LHN html
var Nav = (function(undefined) {
	function Nav(rootSymbol) {
		this.rootSymbol = rootSymbol;
	}
	var NavProto = Nav.prototype;
	
	// the page mode
	NavProto.mode = undefined;
	
	// the symbol to treat as the root, ie 'woosh'
	NavProto.rootSymbol = undefined;
	
	// the current item for this page
	NavProto.active = undefined;
	
	// make list item
	NavProto._listItem = function(symbol, inner) {
		var link;
		
		if (this.active == symbol) {
			return '<li><span class="active">' + symbol.alias + (inner || '') + '</span></li>\n';
		} else {
			link = new Link().toSymbol(symbol.alias);
			return '<li>' + link + '\n' + (inner || '') + '</li>\n';
		}
	};
	
	// should a symbol be displayed in the nav?
	NavProto._shouldDisplay = function(symbol) {
		return ( symbol.is('CONSTRUCTOR') || symbol.isNamespace )
			&& shouldOutput(symbol, this.mode);
	}
	
	// make a list of items, will fiter out symbols we don't want to show
	NavProto._list = function(symbols) {
		var nav = this,
			html = '<ol>\n',
			memberSymbols,
			listInner;
		
		symbols.forEach(function(symbol) {
			memberSymbols = members[symbol.alias].filter(function(symbol) {
				return nav._shouldDisplay(symbol);
			});
			// don't treat 'woosh' as a parent item
			listInner = (
				memberSymbols.length &&
				symbol != nav.rootSymbol &&
				nav.active &&
				nav.active.alias.indexOf(symbol.alias) === 0 
			) ? nav._list(memberSymbols) : '';
			html += nav._listItem( symbol, listInner );
		});
		html += '</ol>\n';
		return html;
	}
	
	// output to html string
	// first level items will be woosh.whatever, 2nd level will just be name
	NavProto.toString = function() {
		var html = '<ol>\n',
			link,
			nav = this,
			symbols;
		
		// the index is active if there's no active symbol
		if (this.active) {
			html += '<li><a href="../index.html">Index</a></li>\n';
		} else {
			html += '<li><span class="active">Index</span></li>\n';
		}
		
		html += '<li>Api\n';
		symbols = [this.rootSymbol].concat( members[this.rootSymbol.alias] ).filter(function(symbol) {
			return nav._shouldDisplay(symbol);
		});
		html += nav._list(symbols);
		
		html += '</li>\n</ol>\n';
		return html;
	};
	
	
	return Nav;
})();

// switch between the different doc modes
var ModeSwitch = (function(undefined){
	function ModeSwitch() {}
	
	var ModeSwitchProto = ModeSwitch.prototype;
	
	// the symbol being documented, undef for index
	ModeSwitchProto.symbol = undefined;
	
	// the mode of the current page
	ModeSwitchProto.mode = undefined;
	
	ModeSwitchProto._listItem = function(mode) {
		var link,
			html,
			modeName = modeNames[mode],
			oldSymbolsDir = publish.conf.symbolsDir;
			
		if (this.mode == mode) {
			return '<li><span class="active">' + h(modeName) + '</span></li>';
		}
		else if (this.symbol) {
			if ( shouldOutput(this.symbol, mode) ) {
				publish.conf.symbolsDir = '../../' + mode + '/api/';
				link = new Link().toSymbol(this.symbol.alias);
				link.text = modeName;
				html = '<li>' + link + '</li>\n';
				publish.conf.symbolsDir = oldSymbolsDir;
			}
			else {
				html = '<li><span class="notInMode">' + h(modeName) + '</span></li>';
			}
			return html;
		} else {
			return '<li><a href="../' + h(mode) + '/index.html">' + h(modeName) + '</a></li>\n';
		}
	};
	
	ModeSwitchProto.toString = function() {
		var html = '<ul>',
			modeSwitch = this;
		
		modes.forEach(function(mode) {
			html += modeSwitch._listItem(mode);
		});
		
		html += '</ul>';
		return html;
	}
	
	return ModeSwitch;
})();

// get an array of members (including inherited instance members) of a symbol 
function resolveInstanceMembers(symbol) {
	var r = {
			methods: [],
			properties: []
		},
		member,
		symbolMembers,
		namesTaken = {},
		i, len;
	
	do {
		symbolMembers = members[symbol.alias];
		
		// loop through members
		for (i = 0, len = symbolMembers.length; i<len; i++) {
			member = symbolMembers[i];
			// skip if static or we've already got a thing of that name
			if ( member.isStatic || namesTaken[member.name] ) { continue; }
			// make sure we don't get two of these
			namesTaken[member.name] = true;
			// add it to our list
			if ( member.is('FUNCTION') ) {
				r.methods.push(member);
			} else {
				r.properties.push(member);
			}
		}
		
		// get inherited symbol if there is one
		if ( symbol.augments[0] ) {
			symbol = Link.symbolSet.getSymbol( symbol.augments[0] );
		} else {
			symbol = null;
		}
	} while (symbol);
	
	// sort the members
	r.methods = r.methods.sort( makeSortby('alias') );
	r.properties = r.properties.sort( makeSortby('alias') );
	
	return r;
}

// returns an object of symbol members keyed by their type
function organiseMembers(symbol, filter) {
	var symbols = members[symbol.alias].filter(filter),
		instanceMembers = resolveInstanceMembers(symbol),
		r = {
			properties: [],
			methods: [],
			instanceProperties: instanceMembers.properties.filter(filter),
			instanceMethods: instanceMembers.methods.filter(filter),
			constructors: [],
			namespaces: []
		};	
	
	symbols.forEach(function(symbol) {
		if ( symbol.is('CONSTRUCTOR') ) {
			r.constructors.push(symbol);
		}
		else if (symbol.isNamespace) {
			r.namespaces.push(symbol);
		}
		else if (symbol.is('FUNCTION') && symbol.isStatic) {
			r.methods.push(symbol);
		}
		else if (symbol.isStatic) {
			r.properties.push(symbol);
		}
	});
	
	return r;
}

// should the symbol be displayed in this page mode?
function shouldOutput(symbol, mode) {
	switch (mode) {
		case 'writingTests':
			// look out for our custom tag
			if ( !symbol.comment.getTag('writingTests')[0] ) { return false; }
		case 'writingViews':
			// we don't want to display our privates (teehee)
			if (symbol.isPrivate) { return false; }
	}
	return true;
}

// just get the first line of the text excluding a trailing full stop
function summary(str) {
	return h( /^(.*?)(?:\.?\s*?(?:\n|$))/.exec(str)[0] );
}

// get everything but the first line
// paragraphs starting in < aren't escaped
function further(str) {
	return autoHtml( str.replace(/^(.*?)(?:\.?\s*?(?:\n|$))/, '') );
}

// wrap lines in paragraphs unless they begin with a tag, resolve links
function autoHtml(str) {
	var paragraphs = str.split(/(\r\n\r\n|\n\n)/),
		html;
		
	html = paragraphs.map(function(paragraph) {
		return /^\s*</.test(paragraph) ? resolveLinks(paragraph) : '<p>' + h(paragraph) + '</p>';
	}).join('\n\n');
	
	return html;
}

/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] != undefined && b[attribute] != undefined) {
			a = a[attribute].toLowerCase().replace(/_/g, '');
			b = b[attribute].toLowerCase().replace(/_/g, '');
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}
	}
}

/** Pull in the contents of an external file at the given path. */
function include(path) {
	var path = publish.conf.templatesDir+path;
	return IO.readFile(path);
}

/** Build output for displaying function parameters. */
function makeSignature(symbol) {
	var params = '',
		name;
		
	if (!symbol.isStatic) {
		name = 'my' + symbol.memberOf.slice( symbol.memberOf.lastIndexOf('.') + 1 ) +
			'.' + symbol.name;
	}
	else if ( symbol.is('CONSTRUCTOR') ) {
		name = 'var my' + symbol.alias.slice( symbol.alias.lastIndexOf('.') + 1 ) + ' = new ' + symbol.alias;
	}
	else {
		name = symbol.alias;
	}
	if (symbol.params.length) {
		params = '(' +
			symbol.params.filter(function($) {
				return $.name.indexOf('.') == -1; // don't show config params in signature
			}).map(function($) {
				return $.name;
			}).join(', ') +
			')';
	}
	else if ( symbol.is('FUNCTION') ) {
		params = '()';
	}
	
	return h(name + params);
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str) {
	str = str.replace(/\{@link ([^} ]+)\s*([^}]*)\}/gi,
		function(match, symbolName, text) {
			var link = new Link().toSymbol(symbolName);
			link.text = text || symbolName;
			return link;
		}
	);	
	return str;
}

// cater for indenting in examples
function formatExample(str) {
	var initialIndent;
	// remove empty lines
	str = str.replace(/^(?:\s*(?:\n|\r\n))*/, '');
	// get initial indent
	initalIndent = /^\s*/.exec(str)[0];
	// remove indent from start of each line
	str = str.replace(new RegExp('^' + initalIndent, 'mg'), '')
		// convert tabs to 4 spaces
		.replace(/\t/g, '    ');
	
	return h(str);
}

// escape html & resolve links
function h(str) {
	str = str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&#34;')
		.replace(/'/g, '&#39;')
	
	return resolveLinks(str); 
}