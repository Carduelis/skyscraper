<?php
	// here you earn your global variable $_REQUEST
	// then you should check it for correctness (illegal data, correct data, is an array, NOT correct answer)
		// if it's broken return message with 4xx or 5xx code (see the W3C-reommendations about codes) 
	// then check answer
		// if it's ok - return ok-phrase and flag-true  
		// if it's fallen - return try-again-phrase and flag-false  
	echo json_encode($_REQUEST);
?>