<?php
	if ($_GET["r"] == "schedule") {
		echo "[{\"id\" : \"0\", \"Program\" : \"Sample 1\", \"Time\" : \"" . microtime() . "\"}]";
		exit(0);
	}
	
	if ($_GET["r"] == "gallery") {
		echo "[{\"id\" : \"0\", \"title\" : \"Sample 1 Image\", \"comment\" : \"Pretty boring!\", \"url\" : \"images/sample-1.png\"}, {\"id\" : \"1\", \"title\" : \"Sample 2 Image\", \"comment\" : \"Pretty boring still!\", \"url\" : \"images/sample-2.png\"}, {\"id\" : \"2\",\"title\" : \"Sample 3 Image\", \"comment\" : \"Gosh, get better shots!\", \"url\" : \"images/sample-3.png\"}, {\"id\" : \"3\", \"title\" : \"Sample 4 Image\", \"comment\" : \"Aww sh!t, that looks better!\", \"url\" : \"images/sample-4.png\"}]";
		exit(0);
	}
?>
