function get(id){
	return document.getElementById(id);
}

function rand(min, max){
	return Math.floor((Math.random() * max-min) + min);
}

function randomElement(arr){
	return arr[rand(0, arr.length)];
}

function shuffle(arr){
	let n = arr.length;
	while(n > 0){
		const r = Math.floor(Math.random() * n);
		const temp = arr[r];
		arr[r] = arr[n-1];
		arr[n-1] = temp;
		n--;
	}
}

function removeFromArray(arr, toRemove){
	const index = arr.indexOf(toRemove);
	if(index !== -1){
		arr = arr.splice(index, 1);
	}
}

const defaultOpNames = ['div', 'mul'];

const defaultTimes = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function setUpTimes(){
	const selectedTimes = [];
	const selectedOps = [];
	let inTest = false;
	let nextAction = null;
	const incorrect = [];
	let timerFunc = null;
	
	let showTime = get('timeInput').checked;
	get('timeArea').setAttribute('style', 'display:' + (showTime ? 'block' : 'none'));
	get('timeInput').addEventListener('change', () => {
		showTime = get('timeInput').checked;
		get('timeArea').setAttribute('style', 'display:' + (showTime ? 'block' : 'none'));
	});
	
	const holder = get('timesHolder');
	for(let i =0; i <= 12; i++){
		const btn = document.createElement('div');
		btn.setAttribute('class','timeBtn');
		btn.innerText = i.toString();
		
		if(defaultTimes.indexOf(i) === -1){
			btn.setAttribute('active', 'false');
		}
		else{
			btn.setAttribute('active', 'true');
			selectedTimes.push(i);
		}
		

		btn.addEventListener('click', (e) =>{
			if(!inTest){
				if(btn.getAttribute('active') == 'true'){
					btn.setAttribute('active', 'false');
					removeFromArray(selectedTimes, i);
				}
				else{
					btn.setAttribute('active', 'true');
					selectedTimes.push(i);
				}
			}
			else{
				alert('Finish the current test first');
			}
		});
		holder.appendChild(btn);
	}
	
	setUpOperator('mul', '&#215;');
	setUpOperator('div', '&#247;');
	setUpOperator('add', '+');
	setUpOperator('sub', '-');
	
	setUpStart();

	get('answer').addEventListener('keydown', (e) => {
		if(e.keyCode === 13){
			e.preventDefault();
			nextAction();
		}
	});
	
	function setUpOperator(name, symbol){
		const symObj = {symbol: symbol, name: name};
		const btn = get(name);
		
		if(defaultOpNames.indexOf(name) === -1){
			btn.setAttribute('active', 'false');
		}
		else{
			selectedOps.push(symObj);
			btn.setAttribute('active', 'true');
		}
		
		btn.addEventListener('click', (e) =>{
			if(!inTest){
				if(btn.getAttribute('active') == 'true'){
					btn.setAttribute('active', 'false');
					removeFromArray(selectedOps, symObj);
				}
				else{
					btn.setAttribute('active', 'true');
					selectedOps.push(symObj);
				}
			}
			else{
				alert('Finish the current test first');
			}
		});
	}
	
	function gradeAnswer(questionNumber, question, next){
		const answer = get('answer');
		answer.innerHTML = '';
		if(answer.value){
			const userAnswer = parseFloat(answer.value);
			const resultArea = get('result')
			if(userAnswer === question.answer){
				correctAnswer();
			}
			else{
				incorrectAnswer(question, userAnswer);
			}
			nextAction = next;
		}
		else{
			alert('You must answer the question');
		}
	}

	function correctAnswer(){
		const resultArea = get('result')
		const cor = document.createElement('div');
		cor.setAttribute('class','correct');
		cor.innerHTML = 'Correct!'
		resultArea.appendChild(cor);
		const press = document.createElement('p');
		press.innerText = 'Press enter to continue';
		resultArea.appendChild(press);
	}

	function incorrectAnswer(question, userAnswer){
		const resultArea = get('result');
		const incor = document.createElement('div');
		incor.setAttribute('class','incorrect');
		incor.innerHTML = 'Incorrect. You said ' + userAnswer + ', the answer was ' + question.answer;
		resultArea.appendChild(incor);
		resultArea.appendChild(document.createElement('br'));
		const cor = document.createElement('div');
		cor.setAttribute('class','correct');
		cor.innerHTML = question.lhs + ' ' + question.symbol.symbol + ' ' + question.rhs + ' = ' + question.answer;
		resultArea.appendChild(cor);
		const press = document.createElement('p');
		press.innerText = 'Press enter to continue';
		resultArea.appendChild(press);
		incorrect.push(question);
	}

	function buildQuestion(questionNumber, useIncorrect){
		if(questionNumber >= 0){
			get('remaining').innerText = questionNumber + 1;
			
			let q;
			if(useIncorrect){
				q = incorrect[questionNumber];
				removeFromArray(incorrect, q);
			}
			else{
				const lhs = randomElement(selectedTimes);
				const rhs = rand(0, 13);
				const symbol = randomElement(selectedOps);
				q = buildAnswer({
					lhs: lhs,
					rhs: rhs,
					symbol: symbol
					}
				);
			}

			get('question').innerHTML = q.lhs + ' ' + q.symbol.symbol + ' ' + q.rhs + ' = ';
			get('answer').value = '';
			get('result').innerHTML = '';
			nextAction = () => {
				gradeAnswer(questionNumber, q, () => {
					buildQuestion(questionNumber -1, useIncorrect);
				});
			};
		}
		else if(get('repeatIncorrect').checked && !useIncorrect){
			summaryRepeat();
		}
		else{
			summary();
		}
	}

	function buildAnswer(question){
		if(question.symbol.name === 'div'){
			question.rhs = Math.max(question.rhs, 1);
			question.lhs = Math.max(question.lhs, 1);
			
			const min = Math.min(question.lhs, question.rhs);
			const max = Math.max(question.lhs, question.rhs);
			
			question.answer = max;
			question.rhs = min;
			question.lhs = min * max;
		}
		else if (question.symbol.name === 'mul'){
			question.answer = question.rhs * question.lhs;
		}
		else if (question.symbol.name === 'add'){
			question.answer = question.rhs + question.lhs;
		}
		else if (question.symbol.name === 'sub'){
			if(question.rhs > question.lhs){
				const temp = question.lhs;
				question.lhs = question.rhs;
				question.rhs = temp;
			}
			question.answer = question.lhs - question.rhs;
		}
		return question;
	}

	function summaryRepeat(){
		if(incorrect.length === 0)
			summary();
		else{
			const resultArea = get('result');
			resultArea.innerText = 'You got ' + incorrect.length + ' incorrect. Press enter to retry these ones';
			shuffle(incorrect);
			nextAction = () => {
				buildQuestion(incorrect.length -1, true)
			};
		}
	}

	function summary(){
		clearInterval(timerFunc);
		get('remaining').innerText = '-';
		nextAction = null;
		inTest = false;
		get('start').innerText = 'Start';
		const resultArea = get('result');
		resultArea.innerHTML = '';
		get('question').innerHTML = '';
		get('answer').value = '';
		
		if(incorrect.length === 0){
			resultArea.innerText = 'Congratulations, you got them all right!';
		}
		else{
			resultArea.innerText = 'You got the following wrong:';
			const list = document.createElement('ul');
			for(let i = 0; i < incorrect.length; i++){
				const li = document.createElement('li');
				li.innerText = incorrect[i].lhs + ' ' + incorrect[i].symbol.symbol + ' ' + incorrect[i].rhs + ' = ' + incorrect[i].answer;
				list.appendChild(li);
			}
			resultArea.appendChild(list);
		}
	}

	function setUpStart(){
		start.addEventListener('click', (e) => {
			if(!inTest){
				inTest = true;
				get('start').innerText = 'Testing...';
				buildQuestion(parseInt(get('numQuestions').value) -1, false);
				
				if(showTime){
					let time = 0;
					timerFunc = setInterval(() => {
						time += 1;
						get('timeReadout').innerText = time + 's';
					}, 1000)
				}
				
				get('answer').focus();
			}
		});
	}
}







window.addEventListener('DOMContentLoaded', setUpTimes);

