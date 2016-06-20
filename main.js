// vars
var areRequiredInputs = true,
	maxTime = 4; // in minutes

var timer;
var newTry = true;
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



function Timer(options) {
	this.interval = false;
	this.time = {
		get ms() {
			return new Date().getTime() - localStorage['startTime'];
		},
		get seconds() {
			return this.ms/1000;
		},
		get minutes() {
			return Math.floor(this.seconds/60)
		},
		get secondsInTheMinute() {
			return Math.floor(this.seconds - this.minutes*60);
		}
	}

}

Timer.prototype.leftPad = function(num) {
	return (num < 10) ? '0' + num : num
}

Timer.prototype.reset = function() {
	localStorage['startTime'] = new Date().getTime();
	return this
}
Timer.prototype.tick = function() {
	newTry = false;
	var self = this;
	this.interval = setInterval(function() {
		self.print();
		if (self.time.ms > maxTime*60*1000) {
			self.end();
		}
	}, 1000);
}

Timer.prototype.stop = function() {
	newTry = true;
	clearInterval(this.interval)
}
Timer.prototype.print = function() {
	if (this.time.ms % 13 == 0) {
		// just joke
		console.log('now:', this.time.ms,'ms; max:',maxTime*60*1000,'ms');
	}
	$('input[name="minutes"]').val(this.leftPad(this.time.minutes));
	$('input[name="seconds"]').val(this.leftPad(this.time.secondsInTheMinute));
}

Timer.prototype.end = function() {
	this.stop();
	$('.timer').css('color', 'red');
	answer(document.forms.puzzle);
	$('.puzzle').slideUp(function(){
		$('#timeIsUp').slideDown();
	});
}

Timer.prototype.success = function() {
	this.stop();
	$('.timer').css('color', 'green');
	$('.puzzle').slideUp(function(){
		$('#success').slideDown();
	});
}
Timer.prototype.failure = function(text) {
	$('#failure .response').text(text)
	$('#failure').slideDown();
	setTimeout(function (argument) {
		$('#failure').slideUp();
	}, 2000)
}


$(document).ready(function() {
	$puzzle = $('.puzzle');
	timer = new Timer();
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
				if (areRequiredInputs) {
					input += ' required '
				}
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
		if (newTry) {
			timer.reset();
		}
		timer.tick();

	}).fail(function(data, a){
		alert(a + ', see console')
		console.error(data);
	})

		$puzzle.on('input', 'input', function(){
			setSymbolSize($(this));
		})

		$puzzle.on('mouseover', '.cell', function(){
			$('.cell').removeClass('hover')
			if (!isNaN(Number(this.dataset.row)) && !isNaN(Number(this.dataset.col))) {
				// console.log(this.dataset.row, this.dataset.col)
				// console.log(_.isNumber(Number(this.dataset.row)), _.isNumber(Number(this.dataset.col)))
				$('.cell[data-row="'+this.dataset.row+'"').addClass('hover')
				$('.cell[data-col="'+this.dataset.col+'"').addClass('hover')
			}
		})

		$(document).on('click', 'button', function(e){
			switch (this.name) {
				case 'start' :

				break;
				case 'skip' :
					clearInterval(timeInterval)
					timeIsUp();
				break;
				case 'pause' :
					pauseTimeStart = new Date().getTime();
					clearInterval(timeInterval);
					$puzzle.fadeOut();
				break;
				case 'play' :
					setStartTime();
					pauseTimeEnd = new Date().getTime();
					pauseTime = pauseTimeStart ? pauseTimeEnd - pauseTimeStart : 0;
					timeInterval = setInterval(function() {
						showTime(pauseTime);
					}, 1000);
					$puzzle.fadeIn();
				break;
				case 'clear' :
					localStorage['startTime'] = new Date().getTime();
					setStartTime();
				break;
				case 'stop' :
					clearInterval(timeInterval);
					$('input[name="minutes"]').val('00');
					$('input[name="seconds"]').val('00');
					localStorage['startTime'] = new Date().getTime();
				break;
			}
		});
		$(document).on('submit', 'form', function(e){
			e.preventDefault();
			switch (this.name) {
				case 'start' :

				break;
				case 'puzzle' :
					answer(this);
				break;
				default:
					alert('Unnoticed form')
				break;
			}
			return false;
		})
})

function answer(form) {
	$.ajax({
		type: 'POST',
		url: 'checker.php',
		data: new FormData(form),
		dataType: 'json',
		contentType: false,
		processData: false,
	}).done(function(data){
		console.log(data);
		if (data.result === true) {
			timer.success();
		} else {
			console.error('result should be true and boolean!');
			console.error('Type of result is '+ typeof data.result + '. Value of result is '+ data.result);
			timer.failure(data.result);
		}
	}).fail(function(data,text){
		alert('Something went wrong: "' + text + '" - see console for debug');
		console.error(data);
	})
}