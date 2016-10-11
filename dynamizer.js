/*
dynamize([ interval [, setter ]]) : return
	- interval: A number denoting the time between updates
	- setter: A function called when setting a cell's value
		> setter([ field [, value [, content [, $unit [, $element ]]]]]) : Accepts or rejects 'value'
			- field: A string denoting the label of a $unit.
				> These are assignable labels which are used to target specific $units of an $element.
			- value: The default value to be assigned if the function (setter) returns true.
			- content: Updated JSON data for the $element passed, retrived from the server.
			- $unit: jQuery object representing a specific part of the element being modified.
				> These are identified by assigning the data-field tag, which can be anything.
				> The value should match the key from a key-value pair of content (JSON from server).
			- $element: jQuery object parent of the $unit elements which are updated.

			
dynamize([ stop ])
	- stop: A value of 'false' to stop updating, does not accept 'true'.
*/
jQuery.fn.dynamize = function() {
	var interval  = typeof arguments[0] == "number"? 	arguments[0] : 1000 * 60;
	var processor = typeof arguments[0] == "function"? 	arguments[0] : arguments[1];
					
	var $root = $(this);
	var $container = $($root.find("[data-body]")[0] || $root.find("tbody")[0] || this);
	var $elementTemplate = $container.find("template");
	
	if ($root.data("updaterID")) clearInterval($root.data("updaterID"));
	if (arguments[0] == false || !$root.attr("data-url") || !$elementTemplate) return;
	
	function configure($element) {
		if ($root.is("table")) $root.find("thead>tr>th").each(function(i, field) {			
			var $cell = $($element.children()[i] || "<td>"); // Get template cell or make one
			$cell.attr("data-field", $(field).text());
			if (!$element.children()[i]) $element.append($cell);
		});
		
		return $element;
	}
	
	function update() {
		$.getJSON($root.attr("data-url"), function(contents) {
			$container.children().remove(); // Clear children

			$.each(contents, function(i, content) {
				var $element = configure($($elementTemplate.html()));
				
				$element.find("[data-field]").each(function(i, unit) {
					var field = $(unit).attr("data-field");
					var value = content[field] || "[N/A]";
					if (!processor || processor(field, value, content, $(unit), $element)) {
						$(unit).text(value);
					}
				});
				
				$container.prepend($element);
			});			
		}).fail(function(event) {
			if (!url) clearInterval($root.data("upaterID"));
			console.log("Failed to fetch!")
		});
	}
	
	update(); // Launch it once, and schedule it.
	$root.data("updaterID", setInterval(update, interval));
	
	return $(this);
}

$(function() {
	$("table.dynamic-schedule").dynamize(1000, function(field, value, content, $unit, $element) {
		if (field == "Date") {
			$unit.text(content["Time"]);
			return false;
		}
		return true;
	});
})