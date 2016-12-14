/*
dynamize([ interval [, setter ]]) : return
	- interval: A number denoting the time (in seconds) between updates
	- setter: A function called when setting a cell's value
		> setter([ field [, value [, content [, $unit [, $containerItem ]]]]]) : Accepts or rejects 'value'
			- field: A string denoting the label of a $unit.
				> These are assignable labels which are used to target specific $units of an $containerItem.
			- value: The default value to be assigned if the function (setter) returns true.
			- content: Updated JSON data for the $containerItem passed, retrived from the server.
			- $unit: jQuery object representing a specific part of the element being modified.
				> These are identified by assigning the data-field tag, which can be anything.
				> The value should match the key from a key-value pair of content (JSON from server).
			- $containerItem: jQuery object parent of the $unit elements which are updated.

			
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
	
	function PostFormData(formData) {
		return $.post({
			url: $containerRoot.attr("data-url"),
			data: formData,
			// cache: false, // Cache response? For JSON default is false
			processData: false,
            contentType: false,
			complete: function(event) {RequestUpdatedData();}
		});
	}
	
	function RequestUpdatedData() {
		return $.getJSON($containerRoot.attr("data-url"), function(contents) {
			
			$.each(contents, function(i, content) {
				var $containerItem = $($containerBody.children()[i+1] || $MakeContainerItem());
				
				var $fieldEditButton = $containerItem.find("[data-field-edit]");
				var $fieldRemoveButton = $containerItem.find("[data-field-delete]");
				$fieldEditButton.data("container", $containerItem).data("content", content).removeClass("disabled");
				$fieldRemoveButton.data("container", $containerItem).data("content", content).removeClass("disabled");
				
				$containerItem.find("[data-field]").each(function(j, unit) {
					var field = $(unit).attr("data-field");
					var value = content[field] || content[field.toLowerCase()] || "[N/A]";
					if (!setter || setter(field, value, content, $(unit), $containerItem)) $(unit).text(value);
				});
				if (!$containerItem.parent().length) $containerBody.append($containerItem);
			});
			
			$containerBody.children(":gt(" + contents.length + ")").remove();
			
		}).fail(function(event) {
			if (!$containerRoot.attr("data-url")) clearInterval($containerRoot.data("upaterID"));
			console.log("Failed to fetch! Check your server or the URL!");
		});
	}
	
	function $ContainerItemAddControls($containerItem) {
		var $controlsTemplate = $containerItem.find("template");
		if (!$controlsTemplate.length) return;
		
		var $controls = $($controlsTemplate.html()).insertAfter($controlsTemplate);
		
		$controls.find("[data-field-edit]").click(function(event) {
			if (!(unitID = $(this).data("content")["id"]) || !$containerRoot.data("controller-body")) return;
			
			$containerRoot.data("controller-body").find("[data-field-value]").each(function(i, input) {
				$(input).val($(event.target).data("content")[$(input).attr("data-field-value")]);
			})
			
			$containerRoot.data("controller-body").data("unitID", unitID);
			
			$containerRoot.data("controller").find("[data-field-update]").removeClass("disabled");
		});
		
		$controls.find("[data-field-delete]").click(function(event) {
			if (!(unitID = $(this).data("content")["id"])) return;
			
			$(this).addClass("disabled");
			
			var formData = new FormData();
			formData.append("operation", "delete");
			formData.append("id", unitID);
			PostFormData(formData);
		});
	}

	function $ContainerItemConfigure($containerItem) {
		// Assure fields for tables
		if ($containerRoot.is("table")) $containerRoot.find("thead>tr>th").each(function(i, field) {
			var sibling = $($containerItem.children()[i-1]).is("th,td")? $containerItem.children()[i-1] : false;
			var child = $($containerItem.children()[i]).is("th,td")? $containerItem.children()[i] : false;
			var $cell = $(child || "<td>"); // Get template cell or make one
			if (!$cell.attr("data-field")) $cell.attr("data-field", $(field).text());
			if (!child) sibling? $cell.insertAfter(sibling) : $containerItem.prepend($cell);
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
		
		$controllerBody.data("fields", {});
		
		$MakeContainerItem().find("[data-field]").each(function(i, unit) {
			var $controllerField = $($controllerFieldTemplate.html()).appendTo($controllerBody);
			var fieldID = $(unit).attr("data-field");
			var $fieldLabel = $controllerField.find("[data-field-id]").text(fieldID);
			var $fieldInput = $controllerField.find("[data-field-value]").attr("data-field-value", fieldID);
		});
		
		$controller.find("[data-field-add],[data-field-update]").click(function() {
			var updating = $(this).attr("data-field-update") != null;
			if (updating && !$controllerBody.data("unitID")) return;
			
			var data = new Object();
			var formData = new FormData();

			formData.append("operation", updating? "update" : "create");
			if (updating) formData.append("id", $controllerBody.data("unitID"));
			
			$controllerBody.find("[data-field-value]").each(function(i, field) {
				var value = $(field).val();
				if (value) $(field).parent().removeClass("has-warning").addClass("has-success");
				else $(field).parent().removeClass("has-success").addClass("has-warning");
				if (!(data = value? data : null)) return;
				console.log("Set: " + $(field).attr("data-field-value") + " " + $(field).val());
				data[$(field).attr("data-field-value")] = $(field).val();
			});
			
			if (!data) return;
			
			$controllerBody.find("[data-field-value]").each(function(i, field) {
				$(field).val("").parent().removeClass("has-success");
			});
			
			if (updating) {$controllerBody.data("unitID", null); $(this).addClass("disabled");}
			
			formData.append("values", JSON.stringify(data));
			console.log("Sending values: " + formData);
			PostFormData(formData);
			
		});
		
		$controller.find("[data-field-update]").addClass("disabled");
		
		var $controllerCounter = $controller.find("[data-config-count-update]").click(function(event) {
			$controllerCounter.removeClass("btn-success").addClass("btn-default disabled");
			var formData = new FormData();
			formData.append("operation", "configuration");
			formData.append("visible", $(this).data("count"));
			console.log("Sending config: " + formData);
			PostFormData(formData);
		});
		
		$controllerCounter.data("count", 0).addClass("disabled");
		
		$controller.find("[data-config-count-less],[data-config-count-more]").click(function(event) {
			var change = $(this).attr("data-config-count-more") != null? 1 : -1;
			var count = $controllerCounter.data("count") + change;
			if (count < 0) count = 0;
			$controllerCounter.data("count", count);
			$controllerCounter.text("Show " + count);
			$controllerCounter.removeClass("disabled").addClass("btn-success");
		});
		
		$containerRoot.data("controller", $controller);
		$containerRoot.data("controller-body", $controllerBody);
	})();
	
	RequestUpdatedData(); // Launch it once, and schedule it.
	$containerRoot.data("updaterID", setInterval(RequestUpdatedData, interval));
	
	return $(this);
}

$(function() {
	$("table.dynamic-schedule").dynamize(1, function(field, value, content, $unit, $containerItem) {
		if (field != "Date") return true;
		
		$unit.text(content["Time"]);
		return false;
	});
	
	$("div.dynamic-gallery").dynamize(5, function(field, value, content, $unit, $containerItem) {
		if (field != "image") return true;
		
		$unit.attr("src", content["url"]);
		return false;
	});
})
