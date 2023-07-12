const quizContainer = document.getElementById('quiz');
const addQuestionButton = document.getElementById('addQuestion');
const saveButton = document.getElementById('save');
const loadButton = document.getElementById('load');
const fileInput = document.getElementById('fileInput');
const darkModeButton = document.getElementById('darkModeButton');
const gameModeButton = document.getElementById('gameModeButton');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const titleInput = document.getElementById('titleInput');
const changeTitleButton = document.getElementById('changeTitleButton');
const quizTitle = document.getElementById('quizTitle');
const addQuestionModal = document.getElementById('addQuestionModal');
const questionInput = document.getElementById('questionInput');
const answerInputs = document.getElementsByClassName('answer-input');
const correctAnswerSelect = document.getElementById('correctAnswerSelect');
const addQuestionModalButton = document.getElementById('addQuestionButton');
const closeButton = addQuestionModal.querySelector('.close');
const settingsCloseButton = settingsModal.querySelector('.close');

let quizQuestions = [];
let gameMode = false;
let currentQuestionIndex = 0;

function buildQuiz() {
  if (gameMode) {
    buildGameQuiz();
    return;
  }

  const output = [];

  quizQuestions.forEach((currentQuestion, questionNumber) => {
    const choices = [];
    for (let i = 0; i < currentQuestion.choices.length; i++) {
      choices.push(
        `<label>
          <input type="radio" name="question${questionNumber}" value="${currentQuestion.choices[i]}" ${currentQuestion.correctAnswer === currentQuestion.choices[i] ? 'checked' : ''}>
          ${currentQuestion.choices[i]}
        </label>`
      );
    }

    output.push(
      `<div class="question">${currentQuestion.question}</div>
      <div class="choices">${choices.join('')}</div>`
    );
  });

  quizContainer.innerHTML = output.join('');
}

function buildGameQuiz() {
  const currentQuestion = quizQuestions[currentQuestionIndex];

  const output = `
    <div class="game-question">${currentQuestion.question}</div>
    <div class="game-choices">
      ${currentQuestion.choices.map((choice, index) => `
        <div class="game-choice" data-index="${index}">${choice}</div>
      `).join('')}
    </div>
  `;

  quizContainer.innerHTML = output;

  const gameChoices = quizContainer.querySelectorAll('.game-choice');
  gameChoices.forEach((choice) => {
    choice.addEventListener('click', handleGameChoice);
  });

  const gameQuestion = quizContainer.querySelector('.game-question');
  gameQuestion.style.textAlign = 'center';
}

function handleGameChoice(event) {
  const selectedChoice = event.target;
  const selectedAnswer = selectedChoice.dataset.index;
  const currentQuestion = quizQuestions[currentQuestionIndex];

  if (selectedAnswer === currentQuestion.correctAnswer) {
    selectedChoice.classList.add('correct');
  } else {
    selectedChoice.classList.add('incorrect');
  }

  disableGameChoices();

  if (currentQuestionIndex < quizQuestions.length - 1) {
    currentQuestionIndex++;
    setTimeout(buildGameQuiz, 1000);
  }
}

function disableGameChoices() {
  const gameChoices = quizContainer.querySelectorAll('.game-choice');
  gameChoices.forEach((choice) => {
    choice.classList.add('disabled');
    choice.removeEventListener('click', handleGameChoice);
  });
}

function toggleGameMode() {
  gameMode = !gameMode;
  if (gameMode) {
    gameModeButton.textContent = 'Exit Game Mode';
    addQuestionButton.style.display = 'none';
    saveButton.style.display = 'none';
    loadButton.style.display = 'none';
    darkModeButton.style.display = 'none';
    settingsButton.style.display = 'none';
    settingsModal.style.display = 'none';
    quizTitle.style.textAlign = 'center';
    buildGameQuiz();
  } else {
    gameModeButton.textContent = 'Game Mode';
    addQuestionButton.style.display = 'inline-block';
    saveButton.style.display = 'inline-block';
    loadButton.style.display = 'inline-block';
    darkModeButton.style.display = 'inline-block';
    settingsButton.style.display = 'inline-block';
    quizTitle.style.textAlign = '';
    buildQuiz();
  }
}

function openAddQuestionModal() {
  addQuestionModal.style.display = 'block';
  questionInput.focus();
}

function closeAddQuestionModal() {
  addQuestionModal.style.display = 'none';
  questionInput.value = '';
  Array.from(answerInputs).forEach((input) => (input.value = ''));
  correctAnswerSelect.selectedIndex = 0;
}

function addQuestion() {
  const question = questionInput.value.trim();
  const choices = Array.from(answerInputs).map((input) => input.value.trim()).filter((choice) => choice !== '');
  const correctAnswerIndex = correctAnswerSelect.selectedIndex;

  if (question && choices.length >= 2 && correctAnswerIndex !== 0) {
    const correctAnswer = choices[correctAnswerIndex];
    quizQuestions.push({
      question: question,
      choices: choices,
      correctAnswer: correctAnswer
    });

    buildQuiz();
    closeAddQuestionModal();
  } else {
    alert('Please enter a valid question, at least two choices, and select the right answer.');
  }
}

function saveQuiz() {
  const quizData = JSON.stringify(quizQuestions);

  const quizName = prompt('Enter the quiz name:');
  if (!quizName) return;

  const fileName = `${quizName}.json`;
  const blob = new Blob([quizData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

function loadQuiz(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      const quizData = reader.result;
      quizQuestions = JSON.parse(quizData);
      buildQuiz();
      alert('Quiz loaded successfully!');
    };
    reader.readAsText(file);
  } else {
    alert('No file selected.');
  }
}

function toggleDarkMode() {
  if (document.body.classList.contains('light-mode')) {
    document.body.classList.remove('light-mode');
    document.body.style.backgroundColor = '';
    darkModeButton.textContent = 'Dark Mode';
  } else {
    document.body.classList.add('light-mode');
    document.body.style.backgroundColor = '#192841';
    darkModeButton.textContent = 'Light Mode';
  }
}

function changeTitle() {
  const newTitle = titleInput.value.trim();
  if (newTitle) {
    quizTitle.textContent = newTitle;
    titleInput.value = '';
  }
}

function openSettingsModal() {
  settingsModal.style.display = 'block';
  titleInput.focus();
}

function closeSettingsModal() {
  settingsModal.style.display = 'none';
}

addQuestionButton.addEventListener('click', openAddQuestionModal);
addQuestionModalButton.addEventListener('click', addQuestion);
saveButton.addEventListener('click', saveQuiz);
loadButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', loadQuiz);
darkModeButton.addEventListener('click', toggleDarkMode);
gameModeButton.addEventListener('click', toggleGameMode);
settingsButton.addEventListener('click', openSettingsModal);
changeTitleButton.addEventListener('click', changeTitle);
closeButton.addEventListener('click', closeAddQuestionModal);
settingsCloseButton.addEventListener('click', closeSettingsModal);

buildQuiz();
