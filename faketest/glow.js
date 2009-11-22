woosh.addTests('glow170', {
	$init: function() {
		// load stuff
	},
	$reset: function(prevTestName, nextTestName) {
		// called before each test
	},
	createElements: function() {
		return glow.dom.create( new Array(101).join('<div></div>') ).length;
	},
	sortLinks: woosh.Test(100, function() {
		glow.dom.get('a').sort();
	})
});