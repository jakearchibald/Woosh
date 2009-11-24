woosh.addTests('jQuery132', {
	"make": function(){
		var str = "";
		for(var i = 0; i<250; i++){
			str += "<ul id='setid" + i + "' class='fromcode'><li>one</li><li>two</li><li>three</li></ul>";
		}
		$("body").append(str);
		return $("ul.fromcode").length;
	},
	
	"indexof" : function(){
		var n, id;
		for(var i = 0; i < 20; i++){
			n = $("ul").index( $("#setid150")[0] )
		}
		return n;
	},
	
	"bind" : function(){
		return $("ul > li").bind("click", function(){ }).length;
	},
	
	"attr" : function(){
		return $("ul").map(function(){ return this.id; }).length;
	},
	
	"bindattr" : function(){
		function someFn(){}
		return $("ul > li")
			.bind("mouseover", someFn)
			.attr("rel", "touched")
			.unbind("mouseover")
			.length;
	},

	"table": function(){
		var str = "";
		for(var i = 0; i < 40; i++){
			str += "<table class='madetable'><tr><td>first</td></tr></table>";
		}

		$("body").append(str);
		$(".madetable tr").prepend("<td>before</td>");
		return $("td").length;
	},
	
	"addanchor" : function(){
		return $(".fromcode > li").append("<a href='http://example.com'>link</a>").length;
	},
	
	"append": function(){
		var str = "";
		for(var i = 0; i<500; i++){
			str += "<div rel='foo'>test</div>";
		}
		$("body").append(str);
		return $("[rel^='foo']").length;
	},
	
	"addclass-odd" : function(){
		return $("div").addClass("added").filter(":odd").addClass("odd").length;
	},
	
	"style" : function(){
		return $(".added").css({ backgroundColor:"#ededed", color:"#fff" }).length;
	},

	"removeclass" : function(){
		return $(".added").removeClass("added").length;
	},
	
	"sethtml": function(){
		return $("div").html("<p>new content</p>").length;
	},
	
	"insertbefore" : function(){
		return $(".fromcode a").before("<p>A Link</p>").length;
	},
	
	"insertafter" : function(){
		return $(".fromcode a").after("<p>After Link</p>").length;
	},
	
	"destroy": function(){
		return $(".fromcode").remove().length;
	},
	
	"finale": function(){
		$("body").empty();
		return $("body *").length;
	}
	
});
