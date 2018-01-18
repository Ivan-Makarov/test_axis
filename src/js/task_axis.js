function runTaskAxis() {
	const task = document.getElementById('task-axis');
	const canvas = task.querySelector('#task-canvas');
	const ctx = canvas.getContext('2d');

	const bottomOffset = 42;
	
	const taskWidth = Math.floor(canvas.getBoundingClientRect().width);
	const taskHeight = Math.floor(canvas.getBoundingClientRect().height);
	
	const axisX = 25;
	const axisY = taskHeight - bottomOffset;
	const axisStep = 26.65;

	const aItem = task.querySelector('#problem-a');
	const bItem = task.querySelector('#problem-b');
	const sumItem = task.querySelector('#problem-sum');
	
	const numInp = task.querySelector('#problem-num-inp');
	const sumInp = task.querySelector('#problem-sum-inp');
	console.log(sumInp);

	class Problem {
		constructor(aMin, aMax, sumMin, sumMax) {
			this.a = this.getRandomInt(aMin, aMax);
			this.sum = this.getRandomInt(sumMin, sumMax);
		}

		get b() {
			return this.sum - this.a
		}

		getRandomInt(from, to) {
			return Math.round(Math.random() * (to - from) + from) 
		}	
	}

	runProblem()

	function runProblem() {
		clearTask();

		const problem = new Problem(6, 9, 11, 14);
		showProblem();
		askForN(aItem, problem.a)
			.then(() => { return askForN(bItem, problem.sum, problem.a) })
			.then(() => { return askForSum(sumItem, problem.sum) })
			.then(() => { runProblem() })

		function showProblem() {
			aItem.textContent = problem.a;
			bItem.textContent = problem.b;
			sumItem.textContent = '?';
		}

		function checkAnswer(input, item, next) {
			input.addEventListener('input', expectAnswer)
			
			function expectAnswer() {
				const answer = input.value;
			
				if (answer == item.textContent) {
					input.removeEventListener('input', expectAnswer);
					input.classList.add('hidden');					
					input.value = '';
					next()
				} 
				else if (answer.toString().length >= item.textContent.length) {
					forbidChange(answer, 1);	
				}
			}

			function forbidChange(value, duration) {
				item.classList.add('error');
				input.classList.add('error');
				input.readOnly = true;				

				setTimeout(() => {
					input.value = '';
					input.readOnly = false;

					item.classList.remove('error');
					input.classList.remove('error');
				}, duration * 1000)
			}	
		}

		
		function askForN(item, number, prevNumber = 0) {
			return new Promise((done, fail) => {
				const fromX = axisX + axisStep * prevNumber;
				const toX = axisX + axisStep * number;
				const step = number - prevNumber
			
				const arrowHeight = axisY - 10 * step;
				let arrowNumPos = {
					x: 0,
					y: 0
				}

				askQuestion();
				
				function askQuestion() {
					showInput();
					drawArrow(fromX, toX, arrowHeight);
					checkAnswer(numInp, item, doNext);
				}

				function doNext() {
					showArrowNum();
					done()
				}		

				function showInput() {
					numInp.classList.remove('hidden');

					const numInpXOffset = numInp.getBoundingClientRect().width / 2;
					arrowNumPos.x = fromX + (toX - fromX) / 2 - numInpXOffset + 'px';
					arrowNumPos.y = taskHeight - arrowHeight - step + 'px';				

					numInp.style.left = arrowNumPos.x;
					numInp.style.bottom = arrowNumPos.y;

					numInp.focus()
				}

				function showArrowNum() {
					const arrowNum = document.createElement('span');
					arrowNum.classList.add('problem__num-above-arrow');	
					arrowNum.style.left = arrowNumPos.x;
					arrowNum.style.bottom = arrowNumPos.y;
					arrowNum.textContent = item.textContent;
					task.appendChild(arrowNum)
				}
			})	
		}

		function askForSum(item, number) {
			return new Promise((done, fail) => { 
				item.classList.add('hidden');
				item.textContent = number;
				sumInp.classList.remove('hidden');
				sumInp.focus();
				checkAnswer(sumInp, item, doNext);

				function doNext() {
					sumItem.classList.remove('hidden');
					sumInp.classList.add('hidden')
					setTimeout(() => {
						done()
					}, 1000)
				}
			})	
		}
	}	

	function drawArrow(fromX, toX, height) {
		const cp1x = fromX + (toX - fromX) / 5;
		const cp2x = fromX + 4 * (toX - fromX) / 5;
	
		ctx.beginPath();
		ctx.strokeStyle = 'orangered';

		drawArc();
		drawArrowhead();

		function drawArc() {
			ctx.moveTo(fromX, axisY);
			ctx.bezierCurveTo(cp1x, height, cp2x, height, toX, axisY);
			ctx.stroke();	
		}

		function drawArrowhead() {
			const arrowAngle = Math.atan2(cp2x - toX, height - axisY) + Math.PI;
			const arrowWidth = 5 + (toX - fromX) / 30;
	
			ctx.moveTo(toX - (arrowWidth * Math.sin(arrowAngle - Math.PI / 8)), 
				axisY - (arrowWidth * Math.cos(arrowAngle - Math.PI / 8)));
			ctx.lineTo(toX, axisY);
			ctx.lineTo(toX - (arrowWidth * Math.sin(arrowAngle + Math.PI / 8)),
				axisY - (arrowWidth * Math.cos(arrowAngle + Math.PI / 8)));
			ctx.stroke();
		}
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, taskWidth, taskHeight);
	}

	function clearTask() {
		clearCanvas();
		[...task.querySelectorAll('span.problem__num-above-arrow')].forEach(item => {
			task.removeChild(item)
		});
	}
}

document.addEventListener('DOMContentLoaded', runTaskAxis)
