woosh.addTests('proto1603', {
	"make" : function(){
	  var fromcode;
	  for (var i = 0; i < 250; i++) {
	    fromcode = new Element('ul', { 'class': 'fromcode', id: "setid" + i });
	    
	    document.body.appendChild(fromcode);
	    $w('one two three').each( function(word){
	      fromcode.appendChild(new Element('li').update(word));
	    });
	  }
	  
	  return $$('ul.fromcode').length;	  
		//	in a 250 iteration loop:
		//		create an unordered lists with the class "fromcode"
		//		append it to the body 
		//		add three li's with the words "one", "two", "three", respectively.
		//
		//	return the result of the selector ul.fromcode
	},
	
	"indexof" : function(){
	  var index, node, uls;
	  for (var i = 0; i < 20; i++) {
	    node = $('setid150');
	    uls = $$('ul');
	    index = uls.indexOf(node);
	  }
	  
	  return index;
		// in a 20-iteration for loop:
		//		find the node with id="setid150"
		//		find all the ul's in the DOM
		//		locate the index of the found node in the list of nodes
		//	return that index
	},
	
	"bind" : function(){
	  var LIs = $$('ul > li');
	  LIs.invoke('observe', 'click', Prototype.emptyFunction);
	  return LIs.length;
		//	connect onclick to every first child li of ever ul (suggested: "ul > li")
		//
		//	return the length of the connected nodes
	},
	
	"attr" : function(){
	  return $$('ul').pluck('id').length;
		// find all ul elements in the page. 
		// generate an array of their id's
		// return the length of that array
	},
	
	"bindattr" : function(){
	  var LIs = $$('ul > li');
	  
	  LIs.each( function(li) {
	    li.observe('mouseover', Prototype.emptyFunction);
	    li.writeAttribute('rel', 'touched');
	    li.stopObserving('mouseover', Prototype.emptyFunction);
	  });
	  
	  return LIs.length;	  
		//	connect a mouseover event to every first child li of every 
		//	ul (suggested: "ul > li")
		//	set the rel="" attribute of those nodes to 'touched'
		//	disconnect the mouseover event
		//	return the length of the connected nodes
	},

	"table": function(){
	  var table, tr;
	  for (var i = 0; i < 40; i++) {
	    table = new Element('table', { 'class': 'madetable' });
	    document.body.appendChild(table);
	    
	    tr = new Element('tr');
	    tr.appendChild(new Element('td'));
	    
	    table.appendChild(tr);
	    
	    tr.insert({ top: new Element('td') });	    
	  }
	  
	  return $$('tr td').length;
		// in a 40-iteration for loop:
		//		create a table with the class "madetable", and append it to the DOM
		//		add a row with one cell to the table. the cell content should be "first"
		//		add a new cell before the first cell in the row.
		//
		//	return the length of the query "tr td"
	},
	
	"addanchor" : function(){
	  var LIs = $$('.fromcode > li');
	  
	  LIs.each( function(li) {
	    li.appendChild(new Element('a', { href: 'http://example.com' }).update('link'));
	  });
	  
	  return LIs.length;	  
		//	find all the first children li's of all nodes with class="fromcode" (created
		//	by previous test)
		//	append an anchor node with the text 'link' pointing to example.com
		//
		//	return length of found nodes (that which had anchors appended)
		//	
	},

	"alt-add" : function(){
	  var LIs = $$(".fromcode > li");	  
	  LIs.invoke('insert', "<a href='http://example.com'>link2</a>");
	  return LIs.length;
		//	same as addanchor, but providing an alternate method. duplicate if need be.
		//	
		//	return length of found nodes (that which had anchors appended)
	},
	
	"create" : function(){
	  for (var i = 0; i < 500; i++) {
	    document.body.appendChild(new Element('div', { rel: 'foo' }).update('test'));
	  }
	  
	  return $$("[rel^='foo']").length;
	  
		//	in a 500 iteration loop:
		//		locate the <body> element and append a new <div>
		//			- the attribute rel="foo" must exist
		//			- the inner content must be 'test'
		//	
		//	return the length of the matches for the selectore "[rel^='foo']"		
	},
	
	"append" : function(){
	  for (var i = 0; i < 500; i++) {
	    document.body.appendChild(new Element('div', { rel: 'foo2' }));
	  }
	  
	  return $$("[rel^='foo2']").length;
		//	in a 500 iteration loop:
		//		create a new <div> with the same critera as 'create'
		//			- NOTE: rel needs to be == "foo2"
		//		then append to body element (no caching)
		//		
		//	return then length of the matches from the selector "div[rel^='foo2']" 
	},
	
	"addclass-odd" : function(){
	  var divs = $$('body div'), oddDivs = [];
	  
	  divs.each(function(div, index) {
	    div.addClassName('added');
	    if (index % 2 === 1) {
	      div.addClassName('odd');
	      oddDivs.push(div);
	    }
	  });
	  
	  return oddDivs.length;
		// locate all div elements on the page
		//	add the class "added" to those divs
		//	add the class "odd" to the odd divs in the selection
		//
		// return the lenght of the odd found divs
	},
	
	"style": function(){
	  var nodes = $$('.added');
	  
	  nodes.invoke('setStyle', {
	    backgroundColor: '#ededed',
	    color: '#fff'
	  });
	  
	  return nodes.length;
		//	find all nodes with the class "added"
		//	set those nodes' style properties:
		//		background-color: #ededed
		//		color: #fff
		//	
		//	return the length of the modified nodes.
	},
	
	"confirm-added" : function(){
	  return $$('div.added').length;
		// return the length of the query "div.added"
	},
	
	"removeclass": function(){
	  var nodes = $$('.added');
	  nodes.invoke('removeClassName', 'added');
	  
	  return nodes.length;
		// find all nodes with the class "added"
		// remove the class "added"
		//
		// return the length of modified nodes 
	},
	
	"sethtml": function(){
	  var divs = $$('body div');
	  divs.invoke('update', "<p>new content</p>");
	  return divs.length;
		// replace the content of all div elements with "<p>new content</p>"
		//
		// return the length of matched divs
	},
	
	"sethtml-alt" : function(){
	  var nodes = $$('.odd').select( function(node, i) { return i % 50 === 0; });
	  nodes.invoke("update", "<p>alt content</p>");
	  return nodes.length;	  
		// find all nodes with the class "odd"
		// reduce that list with a modulo of 50
		//		(eg: Array.filter(function(n,i){ return i % 50 === 0 })))
		// set the content of the matches to "<p>alt content</p>"
		//
		// retun the length of the reduced matches
	},
	
	"insertbefore" : function(){
	  var anchors = $$('.fromcode a');
	  
	  anchors.each( function(anchor) {
	    anchor.insert({ before: new Element('p').update("A Link") });
	  });
	  
	  return anchors.length;	  
		//	find all anchors in the class "fromcode" (.fromcode a)
		//		add a <p> element in the dom before the matched anchors
		//			- the content should equal "A Link"
		//		
		//	return the length of the found anchors.
	},
	
	"insertafter" : function(){
	  var anchors = $$(".fromcode a");
	  
	  anchors.each( function(anchor) {
	    anchor.insert({ after: new Element('p').update("After Link") });
	  });
	  
	  return $$(".fromcode a + p").length;
		//	find all anchors in the class "fromcode" (.fromcode a)
		//		add a <p> element in the dom after the matched anchors
		//			- the content should equial "After Link"
		//			
		//	return the results of a ".fromcode a + p" selector 
	},
	
	destroy: function(){ 
	  return $$(".fromcode").each(Element.remove).length;
		// destroy all the nodes with the class "fromcode"
		// return the length of the destroyed nodes
	},
	
	finale: function(){
	  $(document.body).descendants().each(Element.remove);
	  
	  return $$("body *").length;
		// empty the body element of all elements
		//
		// return the length of the query "body *"
	}
	
});
