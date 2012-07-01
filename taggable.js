

var Utils = {
	getCaretPosition : function(element) {
	    var caretOffset = 0;
	    if (typeof window.getSelection != "undefined") {
	        var range = window.getSelection().getRangeAt(0);
	        var preCaretRange = range.cloneRange();
	        preCaretRange.selectNodeContents(element);
	        preCaretRange.setEnd(range.endContainer, range.endOffset);
	        caretOffset = preCaretRange.toString().length;
	    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
	        var textRange = document.selection.createRange();
	        var preCaretTextRange = document.body.createTextRange();
	        preCaretTextRange.moveToElementText(element);
	        preCaretTextRange.setEndPoint("EndToEnd", textRange);
	        caretOffset = preCaretTextRange.text.length;
	    }
	    return caretOffset;
	}

};

var Autocomplete = function(element, callback){
	this.element = element;
	this.tags = $(this.element).find('li');

	$(this.tags).click(function(){
		callback($(this).html())
	});
};




var Taggable = function(element){
	var autocompleteCallbackProxy = function(word){
		this.complete(word);
	}
	this.REG_tag = /#\S+/g;

	this.element = $(element).find('.input').get(0);
	this.highlightElement = $(element).find('.highlight').get(0);
	this.tagsRef = [];
	this.currentTag = false;
	this.autocomplete = new Autocomplete($('#autocomplete'), autocompleteCallbackProxy.bind(this));

	$(this.element).keyup(this.keyUpHandler.bind(this));

};


Taggable.prototype = {

	complete : function(word){
		if(this.currentTag){
			var text = $(this.element).html(),
					textLen = text.length;
			text = text.slice(0,this.currentTag.s) + '#' + word + text.slice(this.currentTag.e - 1, textLen);
			$(this.element).html(text);
			this.refreshTags();
			this.highlight();
		}
	},

	keyUpHandler : function(e){
		var cursor, 
				currentTag;

		this.refreshTags();
		cursor = Utils.getCaretPosition(this.element);
		this.highlight();
		this.currentTag = this.isInTag(cursor);
		if(this.currentTag){
			//console.log('Current tag', this.currentTag.t);
		}
		
	},

	refreshTags : function(){
		var hit,
				hits = [];

		do {
			hit = this.REG_tag.exec($(this.element).text());
			if(hit != null){
				hits.push({
					s : hit.index,
					e : hit.index + hit[0].length + 1,
					t : hit[0]
				});	
			}
			
		}while(hit != null)
		

		this.tagsRef = hits;
		this.REG_tag.lastIndex = 0;
	},

	isInTag : function(cursor){
		var tags = this.tagsRef, 
				i, max = tags.length, 
				tag,
				result = false;

		for(i = 0; i < max; i++){
			tag = tags[i];
			if(cursor > tag.s && cursor < tag.e){
				result = tag;
				break;
			}
		}
		return result
	},

	highlight : function(){
		var html = $(this.element).html(),
				tags = this.tagsRef, 
				i, max = tags.length, 
				tag, 
				from = 0;

		for(i = max; i > 0; i--){
			var tag = tags[i-1],
					htmlLen = html.length;
			html = html.slice(0, tag.s) + '<span>' + tag.t + '</span>' + html.slice(tag.e-1, htmlLen);
		}		
		$(this.highlightElement).html(html);
	}

};


$(function(){
	$.each($('.taggable'), function(k,v){
		new Taggable($(v));
	});
	
});