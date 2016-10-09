/*
dynamize([ interval [, setter ]]) : return
	- interval: A number denoting the time between updates
	- setter: A function called when setting a cell's value
		> setter([ identifier [, content ]]) : Returns a cell's content
			- identifier: A string with the column's label.
			- content: An object with the row's values.
			
dynamize([ stop ])
	- stop: A boolean denoting whether or not to stop updating.
*/
jQuery.fn.dynamize = function() {
	var interval  = typeof arguments[0] == "number"? 	arguments[0] : 1000 * 60;
	var processor = typeof arguments[0] == "function"? 	arguments[0] : arguments[1];
	var $this = $(this);
	
	if ($this.data("updaterID") != undefined) clearInterval($this.data("updaterID"));
	if (arguments[0] == false || !$this.attr("data-url")) return;
	
	function update() {
		var url = $this.attr("data-url");
		
		$.getJSON(url, function(contents) {
			var $head = $this.find("thead");
			var $body = $this.find("tbody");
			var identifiers = new Array();
			
			$head.find("tr>th").each(function(i, cell) {
				identifiers.push($(cell).text());
			});
			
			$body.find("tr").remove(); // Clear old rows
			
			$.each(contents, function(i, content) {			
				var $row = $($this.find("template").html());
				$.each(identifiers, function(i, identifier) {
					var $cell = $row.children().eq(i);
					var value = content[identifier] || "[N/A]"
					$cell.text(processor && processor(identifier, content) || value);
				});
				$body.prepend($row);
			});
			
			
		}).fail(function(event) {
			if (!url) clearInterval($this.data("upaterID"));
			console.log("Failed to fetch!")
		});
	}
	
	update(); // Launch it once, and schedule it.
	$this.data("updaterID", setInterval(update, interval));
	
	return $(this);
}

$(function() {
	$("table.dynamic-schedule").dynamize(function(identifier, content) {
		if (identifier == "Date") return content["Time"];
	});
})