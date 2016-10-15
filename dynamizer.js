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
	- stop: A boolean value, 'false' to stop updating, 'true' to start/restart.
*/
jQuery.fn.dynamize = function() {
	var interval	=(typeof arguments[0] == "number"? 		arguments[0] : 60) * 1000;
	var setter 		= typeof arguments[1] == "function"? 	arguments[1] : 
					  typeof arguments[0] == "function"? 	arguments[0] : false;
					
	var $containerRoot = $(this);
	var $containerBody = $($containerRoot.find("[data-body]")[0] || $containerRoot.find("tbody")[0] || this);
	var $containerItemTemplate = $containerBody.find("template");
	var DataControl = $containerRoot.attr("data-control");
	
	if ($containerRoot.data("updaterID")) clearInterval($containerRoot.data("updaterID"));
	if (arguments[0] == false || !$containerRoot.attr("data-url") || !$containerItemTemplate) return;
	
	function RequestUpdatedData() {
		return $.getJSON($containerRoot.attr("data-url"), function(contents) {
			
			$.each(contents, function(i, content) {
				var $element = $($containerBody.children()[i+1] || $MakeContainerItem());				
				$element.find("[data-field]").each(function(j, unit) {
					var field = $(unit).attr("data-field");
					var value = content[field] || "[N/A]";
					if (!setter || setter(field, value, content, $(unit), $element)) $(unit).text(value);
				});
				if (!$element.parent().length) $containerBody.append($element);
			});
			
			$containerBody.children(":gt(" + contents.length + ")").remove();
			
		}).fail(function(event) {
			if (!$containerRoot.attr("data-url")) clearInterval($containerRoot.data("upaterID"));
			console.log("Failed to fetch! Check your server or the URL!");
		});
	}
	
	function $ContainerItemAddControls($containerItem) {
		var $controlsRoot = $("<div>").addClass("form-group");
		var $controlsBody = $("<div>").addClass("btn-group btn-group-justified").appendTo($controlsRoot);
		var $controlEdit = $("<button>").attr("type", "button").addClass("btn").click(function() {
			console.log("Edit!");
		});
		var $controlDelete = $controlEdit.clone(true);
		$controlEdit.addClass("btn-default").text("Edit").appendTo($("<div>").addClass("btn-group").appendTo($controlsBody));
		$controlDelete.addClass("btn-danger").text("Delete").appendTo($("<div>").addClass("btn-group").appendTo($controlsBody));
		$containerItem.append($containerItem.is("tr")? $("<td>").append($controlsRoot) : $controlsRoot);
	}

	function $ContainerItemConfigure($containerItem) {
		// Assure fields for tables
		if ($containerRoot.is("table")) $containerRoot.find("thead>tr>th").each(function(i, field) {
			var child = $containerItem.children()[i];
			var $cell = $(child || "<td>"); // Get template cell or make one
			if (!$cell.attr("data-field")) $cell.attr("data-field", $(field).text());
			if (!child) $containerItem.append($cell);
		});
		
		// Setup controls if required
		if (DataControl) $ContainerItemAddControls($containerItem);
		
		return $containerItem;
	}

	function $MakeContainerItem() {return $ContainerItemConfigure($($containerItemTemplate.html()));}
	
	// Populate the fields data array, if needed.
	if (DataControl) (function() {
		var $controller = $($("#" + DataControl).html()).insertAfter("#" + DataControl);
		var $controllerBody = $controller.find("[data-control-body]");
		var $controllerFieldTemplate = $controllerBody.find("template");
		
		$MakeContainerItem().find("[data-field]").each(function(i, unit) {
			$($controllerFieldTemplate.html()).appendTo($controllerBody).find("[data-field-id]").text($(unit).attr("data-field"));
		});
		
		$controller.find("[data-field-add]").click(function() {
			console.log("Add here!");
		});
		$controller.find("[data-field-update]").click(function() {
			console.log("Edit field here!");
		});
		$controller.find("[data-config-count-update]").click(function() {
			console.log("Update count here!");
		});
		
/*
		var $button = $("<button>").addClass("btn").attr("type", "button").click(function() {
		});
		var $controllerRoot = $("<div>").addClass("panel panel-warning").insertAfter($containerRoot);
		var $controllerHead = $("<div>").addClass("panel-heading").text("Configuration").appendTo($controllerRoot);
		var $controllerBody = $("<div>").addClass("panel-body").appendTo($controllerRoot);
		$MakeContainerItem().find("[data-field]").each(function(i, unit) {
			var fieldID = $(unit).attr("data-field");
			var $fieldGroupRoot = $("<div>").addClass("form-group").appendTo($controllerBody);
			var $fieldGroupBody = $("<div>").addClass("input-group").appendTo($fieldGroupRoot);
			var $fieldLabel = $("<span>").addClass("input-group-addon").text(fieldID).appendTo($fieldGroupBody);
			var $fieldInput = $("<input>").addClass("form-control").attr("type", "text").attr("data-field", fieldID).appendTo($fieldGroupBody);
		});
		var $modifyGroupRoot = $("<div>").addClass("form-group").appendTo($controllerBody);
		var $modifyGroupBody = $("<div>").addClass("btn-group btn-group-justified").appendTo($modifyGroupRoot);
		var $modifyGroupAdd = $button.clone(true).text("Add").addClass("btn-primary").appendTo($("<div>").addClass("btn-group").appendTo($modifyGroupBody));
		var $modifyGroupUpdate = $button.clone(true).text("Update").addClass("btn-info").appendTo($("<div>").addClass("btn-group").appendTo($modifyGroupBody));;
		$controllerBody.append("<hr>");
		var $configGroupRoot = $("<div>").addClass("form-group").appendTo($controllerBody);
		var $configGroupBody = $("<div>").addClass("input-group").appendTo($configGroupRoot);
		var $configVisible = $("<span>").addClass("input-group-addon").text("Items Visible").appendTo($configGroupBody);
		var $configVisibleInput = $("<input>").addClass("form-control").attr("type", "text").appendTo($configGroupBody);
		var $configVisibleUpdate =$button.clone(true).text("Set").addClass("btn-success").appendTo($("<div>").addClass("input-group-btn").appendTo($configGroupBody));
*/
	})();
	
	RequestUpdatedData(); // Launch it once, and schedule it.
	$containerRoot.data("updaterID", setInterval(RequestUpdatedData, interval));
	
	return $(this);
}

$(function() {
	$("table.dynamic-schedule").dynamize(1, function(field, value, content, $unit, $element) {
		if (field != "Date") return true;
		
		$unit.text(content["Time"]);
		return false;
	});
	
	$("div.dynamic-gallery").dynamize(5, function(field, value, content, $unit, $element) {
		if (field != "image") return true;
		
		$unit.attr("src", content["url"]);
		return false;
	});
})
