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
		var symbolTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"class.tmpl");
		var indexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"index.tmpl");
	}
	catch(e) {
		print("Couldn't create the required templates: "+e);
		quit();
	}
	
	function hasOwnPage($) {
		return ($.is("CONSTRUCTOR") || $.isNamespace) && $.memberOf != '';	
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
 	var symbolsForPages = symbols.filter(hasOwnPage).sort(makeSortby("alias"));
	
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
	
	var modes = ['fullApi', 'writingViews', 'writingTests'],
		mode,
		data = {},
		output;
	
	// build nav
	data.nav = new Nav( symbolSet, symbolSet.getSymbol('woosh') )
	
	for (var i = 0, len = modes.length; i<len; i++) {
		mode = modes[i];
		data.nav.mode = mode;
		
		// build index
		output = indexTemplate.process(data);
		IO.saveFile(publish.conf.outDir + mode, 'index' + publish.conf.ext, output);
		
		// create each of the class pages
		/*for (var i = 0, l = classes.length; i < l; i++) {
			var symbol = classes[i];
			
			symbol.events = symbol.getEvents();   // 1 order matters
			symbol.methods = symbol.getMethods(); // 2
			
			var output = "";
			output = classTemplate.process(symbol);
			
			IO.saveFile(publish.conf.outDir, ((JSDOC.opt.u)? Link.filemap[symbol.alias] : symbol.alias) + publish.conf.ext, output);
		}*/
	}
	
}

// a quick way to get the members of an item
var members = {};

// Nav object for generating LHN html
var Nav = (function(undefined) {
	function Nav(symbolset, rootSymbol) {
		this.symbolset  = symbolset;
		this.rootSymbol = rootSymbol;
	}
	var NavProto = Nav.prototype;
	
	// the page mode
	NavProto.mode = undefined;
	
	// the symbolset we're dealing with
	NavProto.symbolset = undefined;
	
	// the symbol to treat as the root, ie 'woosh'
	NavProto.rootSymbol = undefined;
	
	// the current item for this page
	NavProto.active = undefined;
	
	// make list item
	NavProto._listItem = function(symbol, inner) {
		var link;
		
		if (this.active == symbol) {
			return '<li><span class="active">' + symbol.alias + '</span></li>';
		} else {
			link = new Link().toSymbol(symbol.alias);
			return '<li>' + link + (inner || '') + '</li>';
		}
	};
	
	// should a symbol be displayed in the nav?
	NavProto._shouldDisplay = function(symbol) {
		return ( symbol.is('CONSTRUCTOR') || symbol.isNamespace )
			&& showSymbol(symbol, this.mode);
	}
	
	// make a list of items, will fiter out symbols we don't want to show
	NavProto._list = function(symbols) {
		var nav = this,
			html = '<ol>',
			memberSymbols,
			listInner;
		
		symbols.forEach(function(symbol) {
			memberSymbols = members[symbol.alias].filter(function(symbol) {
				return nav._shouldDisplay(symbol);
			});
			// don't treat 'woosh' as a parent item
			listInner = (memberSymbols.length && symbol.alias != 'woosh') ? nav._list(memberSymbols) : '';
			html += nav._listItem( symbol, listInner );
		});
		html += '</ol>';
		return html;
	}
	
	// output to html string
	// first level items will be woosh.whatever, 2nd level will just be name
	NavProto.toString = function() {
		var html = '<ol>',
			link,
			nav = this,
			symbols;
		
		// the index is active if there's no active symbol
		if (this.active) {
			html += '<li><a href="../index.html">Index</a></li>';
		} else {
			html += '<li><span class="active">Index</span></li>';
		}
		
		html += '<li>Api';
		symbols = [this.rootSymbol].concat( members[this.rootSymbol.alias] ).filter(function(symbol) {
			return nav._shouldDisplay(symbol);
		});;
		html += nav._list(symbols);
		
		html += '</li></ol>';
		return html;
	};
	
	
	return Nav;
})();

// should the symbol be displayed in this page mode?
function showSymbol(symbol, mode) {
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

/** Just the first sentence (up to a full stop). Should not break on dotted variable names. */
function summarize(desc) {
	if (typeof desc != "undefined")
		return desc.match(/([\w\W]+?\.)[^a-z0-9_$]/i)? RegExp.$1 : desc;
}

/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] != undefined && b[attribute] != undefined) {
			a = a[attribute].toLowerCase();
			b = b[attribute].toLowerCase();
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
function makeSignature(params) {
	if (!params) return "()";
	var signature = "("
	+
	params.filter(
		function($) {
			return $.name.indexOf(".") == -1; // don't show config params in signature
		}
	).map(
		function($) {
			return $.name;
		}
	).join(", ")
	+
	")";
	return signature;
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str, from) {
	str = str.replace(/\{@link ([^} ]+)\s*([^}]*)\}/gi,
		function(match, symbolName, text) {
			var link = new Link().toSymbol(symbolName);
			link.text = text;
			return link;
		}
	);	
	return str;
}

// escape html
function h(str) {
	return h
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&#34;')
		.replace(/'/g, '&#39;')
}