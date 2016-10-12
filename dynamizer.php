<?php
	if ($_GET["r"] == "schedule") {
		echo "[{\"Program\" : \"Sample 1\", \"Time\" : \"" . microtime() . "\"}]";
		exit(0);
	}
	
	if ($_GET["r"] == "gallery") {
		echo "[{\"title\" : \"Sample 1 Image\", \"comment\" : \"Pretty boring!\", \"url\" : \"images/sample-1.png\"}, {\"title\" : \"Sample 2 Image\", \"comment\" : \"Pretty boring still!\", \"url\" : \"images/sample-2.png\"}, {\"title\" : \"Sample 3 Image\", \"comment\" : \"Gosh, get better shots!\", \"url\" : \"images/sample-3.png\"}, {\"title\" : \"Sample 4 Image\", \"comment\" : \"Aww sh!t, that looks better!\", \"url\" : \"images/sample-4.png\"}]";
		exit(0);
	}
?>