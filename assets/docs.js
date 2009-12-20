document.documentElement.className += ' js';

var $ = glow.dom.get;

glow.ready(function() {
	enhanceExpandableDt();
});

function enhanceExpandableDt() {
	$('dt.expandable span').wrap('<a href="#"></a>').prepend('<span class="arrow">►</span>');
	
	glow.events.addListener('dt.expandable a', 'click', function() {
		var dt = $(this.parentNode),
			arrow = dt.get('span.arrow').css('-webkit-animation-duration', '0.3s'),
			dd = dt.next(),
			itemDetail = dd.get(' > .apiItemDetail');
		
		if ( dt.hasClass('expanded') ) {
			arrow.text('►');
			dt.removeClass('expanded');
			dd.removeClass('expanded');
			glow.anim.slideUp(itemDetail, 0.3);
		} else {
			arrow.text('▼');
			dt.addClass('expanded');
			dd.addClass('expanded');
			glow.anim.slideDown(itemDetail, 0.3);
		}
		
		return false;
	});
}