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
				$row = $puzzle.find('.row[data-row="'+i+'"]')

			for (var j = 0; j < data.size; j++) {
				var inputValue = data.default[i][j] ? data.default[i][j] : '';
				var html = '<div class="cell" data-row="'+i+'" data-col="'+j+'" >';
				var input =	'<input type="text" class="form-control"  ';
				if (inputValue) {
					input+=	' data-state="default" readonly value="'+inputValue+'" ';
				}
					input+= 'name="cell['+i+']['+j+']" >';
				html+= input
				html+= '</div>';

				$row.append(html);
			}
			$row.prepend('<div class="cell hint left" data-row="'+i+'" data-col="left"><i class="glyphicon glyphicon-menu-right"></i><span>'+data.boundary.left[i]+'</span></div>')
			$row.append('<div class="cell hint right" data-row="'+i+'" data-col="right"><i class="glyphicon glyphicon-menu-left"></i><span>'+data.boundary.right[i]+'</span></div>')

		}
		$puzzle.prepend('<div class="row hint" data-row="top">');
		$rowHintTop = $puzzle.find('.hint[data-row="top"]');

		$puzzle.append('<div class="row hint" data-row="bottom">');
		$rowHintBottom = $puzzle.find('.hint[data-row="bottom"]');
			for (var i = 0; i < data.size; i++) {
				$rowHintTop.append('<div class="cell hint top" data-row="top" data-col="'+i+'"><i class="glyphicon glyphicon-menu-down"></i><span>'+data.boundary.top[i]+'</span></div>')
				$rowHintBottom.append('<div class="cell hint bottom" data-row="bottom" data-col="'+i+'"><i class="glyphicon glyphicon-menu-up"></i><span>'+data.boundary.bottom[i]+'</span></div>')
			}


		$puzzle.on('input', 'input', function(){
			setSymbolSize($(this));
		})

		$puzzle.on('mouseover', '.cell', function(){
			$('.cell').removeClass('hover')
			if (!isNaN(Number(this.dataset.row)) && !isNaN(Number(this.dataset.col))) {
				console.log(this.dataset.row, this.dataset.col)
				console.log(_.isNumber(Number(this.dataset.row)), _.isNumber(Number(this.dataset.col)))
				$('.cell[data-row="'+this.dataset.row+'"').addClass('hover')
				$('.cell[data-col="'+this.dataset.col+'"').addClass('hover')
			}
		})

		$(document).on('submit', 'form', function(e){
			e.preventDefault();
			switch (this.name) {
				case 'steps' :
					alert('coming soon')
				break;
				case 'puzzle' :
					var data = new FormData(this);
					$.ajax({
						type: 'POST',
						url: 'checker.php',
						data: data,
						dataType: 'json',
						contentType: false,
         				processData: false,
					}).done(function(data){
						console.log(data);
						$('.debug').html(JSON.stringify(data))
					}).fail(function(data,text){
						alert('Something went wrong: "', text, '" - see console for debug');
						console.error(data);
					})
				break;
				default:
					alert('Unnoticed form')
				break;
			}
			return false;
		})


	}).fail(function(data, a){
		alert(a + ', see console')
		console.error(data);



	})

})