function get(id){
	return document.getElementById(id);
}

function rand(min, max){
	return Math.floor((Math.random() * max-min) + min);
}

function randomElement(arr){
	return arr[rand(0, arr.length)];
}

const selectedTimes = [];
const selectedOps = [];
let inTest = false;
let nextAction = null;
const incorrect = [];

function removeFromArray(arr, toRemove){
	const index = arr.indexOf(toRemove);
	if(index !== -1){
		arr = arr.splice(index, 1);
	}
}

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

function gradeAnswer(questionNumber, question){
	const answer = get('answer');
	
	if(answer.value){
		const userAnswer = parseInt(answer.value);
		const resultArea = get('result')
		if(userAnswer === question.answer){
			resultArea.innerText = 'Correct!';
		}
		else{
			incorrect.push(question);
			resultArea.innerText = 'Incorrect. The answer was ' + question.answer;
		}
		nextAction = () => buildQuestion(questionNumber -1);
	}
	else{
		alert('You must answer the question');
	}
}

function buildQuestion(questionNumber){
	if(questionNumber > 0){
		get('remaining').innerText = questionNumber;
		const lhs = randomElement(selectedTimes);
		const rhs = randomElement(selectedTimes);

		const symbol = randomElement(selectedOps);
		
		const q = buildAnswer({lhs: lhs, rhs: rhs, symbol: symbol});
		get('question').innerText = q.lhs + ' ' + q.symbol + ' ' + q.rhs + ' = ';
		get('answer').value = '';
		get('result').innerHTML = '';
		nextAction = () => {gradeAnswer(questionNumber, q);};
	}
	else
		summary();
}

function buildAnswer(question){
	if(question.symbol === '/'){
		question.answer = question.lhs;
		question.lhs = question.rhs * question.lhs;
	}
	else if (question.symbol === '*'){
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

function summary(){
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
			buildQuestion(parseInt(get('numQuestions').value));
			get('answer').focus();
		}
	});
}

function setUpTimes(){
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
	
	setUpOperator('mul', '*');
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
}

window.addEventListener('DOMContentLoaded', setUpTimes);