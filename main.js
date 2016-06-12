function setSymbolSize($el) {
	console.log($el.val(),$el.val().length)
	switch ($el.val().length) {
		case 1: 
			$el.attr('data-state','answer');
			break;
		case 2: 
			$el.attr('data-state','guess');
			break;
		case 3: 
			$el.attr('data-state','guess-three');
			break;
		default: 
			$el.val($el.val().slice(0,3));
			break;
	}
}
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
				var inputValue = data.default[i][j] ? data.default[i][j] : '';
				$row = $puzzle.find('.row[data-row="'+i+'"]')
				var html = '<div class="cell">';
				html+=	'<input type="text" class="form-control" ';
				console.log(inputValue)
				if (inputValue) {
					html+=	' data-state="default" readonly ';
					html+= ' value="'+inputValue+'" ';
				}
				html+= 'name="cell['+i+']['+j+']"';
				html+= ' > ';
				html+= '</div>';

				$row.append(html);
			}

		}
		$puzzle.on('input', 'input', function(){
			setSymbolSize($(this));
		})


	}).fail(function(data, a){
		alert(a + ', see console')
		console.error(data);
	})

})