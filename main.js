// vars
var areRequiredInputs = false,
	maxTime = 1.5; // in minutes

var timer;
var actions = [];
if (typeof localStorage['newTry'] === 'undefined') {
	localStorage['newTry'] = 'yes';
}
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
	localStorage['newTry'] = 'no';
	var self = this;
	this.interval = setInterval(function() {
		self.print();
		if (self.time.ms > maxTime*60*1000) {
			self.end();
		}
	}, 1000);
}

Timer.prototype.stop = function() {
	localStorage['newTry'] = 'yes';
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

function renderPuzzle($el, model, id) {		
	for (var i = 0; i < model.size; i++) {
		$el.append('<div class="row" data-row="'+i+'">')
			$row = $el.find('.row[data-row="'+i+'"]')

		for (var j = 0; j < model.size; j++) {
			var inputValue = model.default[i][j] ? model.default[i][j] : '';
			var html = '<div class="cell" data-row="'+i+'" data-col="'+j+'" >';
			var input =	'<input type="text" class="form-control"  ';
			if (areRequiredInputs) {
				input += ' required '
			}
			if (inputValue) {
				input+=	' data-state="default" readonly value="'+inputValue+'" ';
			}
				input+= 'name="cell['+id+']['+i+']['+j+']" >';
			html+= input
			html+= '</div>';

			$row.append(html);
		}
		$row.prepend('<div class="cell hint left" data-row="'+i+'" data-col="left"><i class="glyphicon glyphicon-menu-right"></i><span>'+model.boundary.left[i]+'</span></div>')
		$row.append('<div class="cell hint right" data-row="'+i+'" data-col="right"><i class="glyphicon glyphicon-menu-left"></i><span>'+model.boundary.right[i]+'</span></div>')

	}
	$el.prepend('<div class="row hint" data-row="top">');
	$rowHintTop = $el.find('.hint[data-row="top"]');

	$el.append('<div class="row hint" data-row="bottom">');
	$rowHintBottom = $el.find('.hint[data-row="bottom"]');
	for (var i = 0; i < model.size; i++) {
		$rowHintTop.append('<div class="cell hint top" data-row="top" data-col="'+i+'"><i class="glyphicon glyphicon-menu-down"></i><span>'+model.boundary.top[i]+'</span></div>')
		$rowHintBottom.append('<div class="cell hint bottom" data-row="bottom" data-col="'+i+'"><i class="glyphicon glyphicon-menu-up"></i><span>'+model.boundary.bottom[i]+'</span></div>')
	}
}

$(document).ready(function() {
	$puzzle = $('.puzzle');
	$('#allowedTime').text(maxTime)
	timer = new Timer();
	$.ajax({
		method: 'GET',
		url: 'settings.php',
		data: {
			setting: window.location.hash.slice(1)
		},
		dataType: 'json'
	}).done(function(data){
		if (data.length) {
			$puzzle.append('<ul class="nav nav-tabs" role="tablist">');
			$puzzle.$tabs = $puzzle.children('ul.nav');
			$puzzle.append('<div class="tab-content">');
			$puzzle.$content = $puzzle.children('div.tab-content')
			for (var p in data) {
				$puzzle.$tabs.append('<li role="presentation"><a href="#puzzle'+p+'" aria-controls="home" role="tab" data-toggle="tab">Puzzle #'+(+p+1)+'</a></li>');
				$puzzle.$content.append('<div role="tabpanel" class="tab-pane fade" id="puzzle'+p+'"></div>');
				renderPuzzle($puzzle.$content.children('#puzzle'+p), data[p], p);
			}
			$puzzle.$content.children().eq(0).addClass('active').addClass('in');
			$puzzle.$tabs.children().eq(0).addClass('active');
		} else {
			renderPuzzle($puzzle, data, 0);
		}
		if (localStorage['newTry'] == 'yes') {
			timer.reset();
		}
		timer.tick();

	}).fail(function(data, a){
		alert(a + ', see console')
		console.error(data);
	})

		$puzzle.on('click', '[data-toggle="tab"]', function(e){
			actions.push({
				action: 'switching',
				time: timer.time.ms
			})
		});
		$puzzle.on('input', 'input', function(e){
			setSymbolSize($(this));
			actions.push({
				action: e.type,
				value: this.value,
				time: timer.time.ms,
				target: e.target.name
			})
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
	var puzzleData = new FormData(form);
	puzzleData.append('actions',JSON.stringify(actions));
	$.ajax({
		type: 'POST',
		url: 'checker.php',
		data: puzzleData,
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