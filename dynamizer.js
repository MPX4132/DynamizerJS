/*
dynamize([ interval [, setter ]]) : return
	- interval: A number denoting the time (in seconds) between updates
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
	var interval	=(typeof arguments[0] == "number"? 		arguments[0] : 60) * 1000;
	var setter 		= typeof arguments[1] == "function"? 	arguments[1] : 
					  typeof arguments[0] == "function"? 	arguments[0] : false;
					
	var $root = $(this);
	var $container = $($root.find("[data-body]")[0] || $root.find("tbody")[0] || this);
	var $elementTemplate = $container.find("template");
	
	if ($root.data("updaterID")) clearInterval($root.data("updaterID"));
	if (arguments[0] == false || !$root.attr("data-url") || !$elementTemplate) return;
	
	
	function configureControl($unit) {
		return $unit.is("td, th, h1, h2, h3, h4, h5, h6")? (function() {
			var $controller = $("<input>").attr("type", "text").addClass("form-control");
			$unit.append($controller);
			return $controller;
		})() : $unit.is("p")? (function() {
			var $controller = $("<textarea>").attr("rows", "4").addClass("form-control");
			$unit.append($controller);
			return $controller;
		})() : $unit;
	}
	
	function configure($element) {
		// Assure fields for tables
		if ($root.is("table")) $root.find("thead>tr>th").each(function(i, field) {
			var child = $element.children()[i];			
			var $cell = $(child || "<td>"); // Get template cell or make one
			if (!$cell.attr("data-field")) $cell.attr("data-field", $(field).text());
			if (!child) $element.append($cell);
		});
		
		// Setup controls if required
		if ($root.attr("data-control") != null) $element.find("[data-field]").each(function(i, unit) {
			var $controller = configureControl($(unit));
			if ($controller[0] !== unit) {
				$controller.attr("data-field", $(unit).attr("data-field"));
				$(unit).removeAttr("data-field");
			}
		});
		
		return $element;
	}
	
	function update() {
		$.getJSON($root.attr("data-url"), function(contents) {
			
			$.each(contents, function(i, content) {
				var $element = $($container.children()[i+1] || configure($($elementTemplate.html())));				
				$element.find("[data-field]").each(function(j, unit) {
					var field = $(unit).attr("data-field");
					var value = content[field] || "[N/A]";
					if (!setter || setter(field, value, content, $(unit), $element)) {
						if ($(unit).is("input")) $(unit).attr("placeholder", value);
						else $(unit).text(value);
					}
				});
				if (!$element.parent().length) $container.append($element);
			});
			
			$container.children(":gt(" + contents.length + ")").remove();
			
		}).fail(function(event) {
			if (!$root.attr("data-url")) clearInterval($root.data("upaterID"));
			console.log("Failed to fetch! Check your server or the URL!");
		});
	}
	
	update(); // Launch it once, and schedule it.
	$root.data("updaterID", setInterval(update, interval));
	
	return $(this);
}

$(function() {
	$("table.dynamic-schedule").dynamize(1, function(field, value, content, $unit, $element) {
		if (field != "Date") return true;
		
		$unit.attr("placeholder", content["Time"]);
		return false;
	});
	
	$("div.dynamic-gallery").dynamize(5, function(field, value, content, $unit, $element) {
		if (field != "image") return true;
		
		$unit.attr("src", content["url"]);
		return false;
	});
})