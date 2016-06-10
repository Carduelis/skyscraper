$(document).ready(function() {
	$puzzle = $('.puzzle');
	$.ajax({
		method: 'GET',
		url: 'settings.json',
		dataType: 'json'
	}).done(function(data){
		
		for (var i = 0; i < data.size; i++) {
			$puzzle.append('<div class="row" data-row="'+i+'">')
			for (var j = 0; j < data.size; j++) {
				$row = $puzzle.find('.row[data-row="'+i+'"]')
				$row.append('<div class="cell"><input type="text" name="cell['+i+']['+j+']" class="form-control"></div>')
			}

		}
		
		$puzzle.on('input', 'input', function(){
			console.log($(this).val(),$(this).val().length)
			switch ($(this).val().length) {
				case 1: 
					$(this).attr('data-state','answer');
					break;
				case 2: 
					$(this).attr('data-state','guess');
					break;
				default: 
					$(this).val($(this).val().slice(0,2))
					break;
			}
		})


	}).fail(function(data, a){
		alert(a + ', see console')
		console.error(data);
	})

})