# DynamizerJS
Dynamizer is a jQuery plugin, occupying the jQuery.dynamize namespace. The plugin simplifies making elements dynamic, that is, making elements fetch repetitive-structured content dynamically from a server by using minimal configuration.


NOTE: All other files in this directory are part of the demo.

NOTE: THE PLUGIN WAS OVERHAULED AND IT NOW WORKS WITH GENERIC ELEMENTS!
	  This means the dynamic table behavior still exists but if you
	  need another dynamic element, such as a div with repetitive
	  content, do the steps below but mark the fields with:
	  	data-field="TheFieldOfJoy"
	  Making sure data-field matches a field from the JSON retrieved
	  from the server. This simply means the plugin will rely on you
	  adding those attributes to the elements that need to change.
	  Updatable children may have a parent specified with
	  	data-body
	  Within a template's clone.
	  
NOTE: Setting the dynamizer on a table will trigger the default behavior,
	  that means the plugin will match agains table column headers,
	  and will IGNORE the data-field tags specified.


Making a dynamic table:

1. Make a table with a unique class or ID, and give it the fetch URL.
We'll use the unique class or ID to target the table and attach the updater
to it when the page loads the content. The URL will be sent get requests,
and will be used to retrieve information from the server.

	<table class="dynamic-schedule" data-url="dynamizer.php"> ...
	
	NOTE: If the table has no data-url attribute, updating will NOT start.
		> Updating will stop on failure if data-url becomes undefined.
	
	
	
	
2. Complete the body of the table and add header fields.

	<table class="dynamic-table" data-url="dynamizer.php">	
		<thead>
			<tr><th>FIELD_1</th><th>FIELD_2</th></tr>
		</thead>
		<tbody>
		</tbody>
	</table>
	
	NOTE: FIELDS MUST BE SPECIFIED IN table > thead > tr > th
	NOTE: Fields specified MUST MATCH the data's fields, otherwise the cells'
	values will not be autofilled. If it's the server can't be changed to
	accommodate that requirement.




3. [OPTIONAL] Make a row template. The template will be used by the script
to populate the available cells. If there's not enough cells in the template
the script will generate new cells and append them to the row.

	<table class="dynamic-table" data-url="dynamizer.php">	
		<thead>
			<tr><th>FIELD_1</th><th>FIELD_2</th></tr>
		</thead>
		<tbody>
			<template>
				<tr><th scope="row"></th><td></td></tr>
			</template>
		</tbody>
	</table>
	
	
	
	
4. The dynamic table needs to be selected with the class or ID given on step 1;
we need to attach the scripts to the element to start updating.

	$(function() {
		$("table.dynamic-table").dynamize();
	})
	
	
	
	
5. [OPTIONAL] We can intercept and change the values being set for particular
cells by passing a processor function (called setter) to the dynamizer.

	$(function() {
		$("table.dynamic-table").dynamize(function(field, value, content) {
			if (field == "FIELD_1") return content["Data 1"];
		});
	})
	NOTE: When setter is defined, if no value is returned by setter, the script
	will use whatever was originally going to be use.
		


SERVER SIDE: The server just needs to return a JSON array of key-value pairs,
where they keys match the column field names, or the data-field attribute values.
If it's not possible, the 'setter' function can be passed to do some preprocessing.
