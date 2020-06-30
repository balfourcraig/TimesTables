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
		selectedTimes.push(i);
		btn.setAttribute('class','timeBtn');
		btn.setAttribute('active', 'true');
		btn.innerText = i.toString();
		btn.setAttribute('active', 'true');
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
	
	setUpOperator('mul', 'x');
	setUpOperator('div', '/');
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
		const btn = get(name);
		selectedOps.push(symbol);
		btn.setAttribute('active', 'true');
		btn.addEventListener('click', (e) =>{
			if(!inTest){
				if(btn.getAttribute('active') == 'true'){
					btn.setAttribute('active', 'false');
					removeFromArray(selectedOps, symbol);
				}
				else{
					btn.setAttribute('active', 'true');
					selectedOps.push(symbol);
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
			const userAnswer = parseInt(answer.value);
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
		cor.innerHTML = question.lhs + ' ' + question.symbol + ' ' + question.rhs + ' = ' + question.answer;
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

			get('question').innerText = q.lhs + ' ' + q.symbol + ' ' + q.rhs + ' = ';
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
		if(question.symbol === '/'){
			question.answer = question.lhs;
			if(question.rhs === 0)
				question.rhs = 1;
			question.lhs = question.rhs * question.lhs;
		}
		else if (question.symbol === 'x'){
			question.answer = question.rhs * question.lhs;
		}
		else if (question.symbol === '+'){
			question.answer = question.rhs + question.lhs;
		}
		else if (question.symbol === '-'){
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
				li.innerText = incorrect[i].lhs + ' ' + incorrect[i].symbol + ' ' + incorrect[i].rhs + ' = ' + incorrect[i].answer;
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

