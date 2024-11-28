const questiondisplay = document.getElementById('questiondisplay');
const loginPage = document.getElementById('login-page');
const quizPage = document.getElementById('quiz-page');

let currentQuestionIndex = 0;
let questions = [];
let selectedOption;
let username;
let allCorrectAnswers = [];
let scores = 0;

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();


  username = document.getElementById('username').value.trim();
  if (username) {
    localStorage.setItem('username', username); 
    loginPage.style.display = 'none';
    quizPage.style.display = 'block'; 
    showQuestion(currentQuestionIndex); 
  } else {
    alert('Please enter a username to continue.');
  }
});

getQuestions();

async function getQuestions() {
  const url = "https://opentdb.com/api.php?amount=15&category=18&difficulty=medium&type=multiple";
  const response = await fetch(url);
  const data = await response.json();

  questions = data.results;
  showQuestion(currentQuestionIndex);
}

function FisherYatesArrayShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  }
}

function showQuestion(index) {
  const testQuestion = questions[index];
  let questionOptions = [];

  questionOptions.push(testQuestion.correct_answer);
  allCorrectAnswers.push(testQuestion.correct_answer);

  testQuestion.incorrect_answers.map((option) => {
    questionOptions.push(option);
  });

  questionOptions.sort(() => Math.random() - 0.5);
  FisherYatesArrayShuffle(questionOptions);

  username = localStorage.getItem("username");

  const htmlSegment = `
    <div class="questiondisplay">
      <p>${username}</p> <!-- Display username -->
      <p>Question ${index + 1}/${questions.length}</p>
      <p id="question">${testQuestion.question}</p>
    </div>
    <div class="answerdisplaycontainer">
      <div class="answerdisplay answeredquestion" data-answer="${questionOptions[0]}">
        <p>A</p>
        <p class="answer">${questionOptions[0]}</p>
      </div>
      <div class="answerdisplay answeredquestion" data-answer="${questionOptions[1]}">
        <p>B</p>
        <p class="answer">${questionOptions[1]}</p>
      </div>
      <div class="answerdisplay answeredquestion" data-answer="${questionOptions[2]}">
        <p>C</p>
        <p class="answer">${questionOptions[2]}</p>
      </div>
      <div class="answerdisplay answeredquestion" data-answer="${questionOptions[3]}">
        <p>D</p>
        <p class="answer">${questionOptions[3]}</p>
      </div>
    </div>
    <div class="btn-container">
      <button class="btn" id="prev-btn" ${index === 0 ? "disabled" : ""}>Previous</button>
      <button class="btn" id="next-btn">${index < questions.length - 1 ? "Next" : "Finish"}</button>
    </div>
  `;

  questiondisplay.innerHTML = htmlSegment;



  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const answeredquestion = document.querySelectorAll('.answeredquestion');

  nextBtn.addEventListener('click', () => handleNextQuestion());
  prevBtn.addEventListener('click', () => handlePreviousQuestion());
  answeredquestion.forEach((questionDiv) =>
    questionDiv.addEventListener('click', () => handleAnsweredQuestion(questionDiv))
  );
}

function handleAnsweredQuestion(question) {
  
  const answeredquestion = document.querySelectorAll('.answeredquestion');

  const answer = question.querySelector('.answer');
  selectedOption = answer.innerHTML;

  answeredquestion.forEach((item) => item.classList.remove('selected'));

  question.classList.add('selected');



  saveAnswer(currentQuestionIndex, selectedOption); 
  saveData(selectedOption);

}

function handlePreviousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion(currentQuestionIndex);
  }
}

function handleNextQuestion() {

  const savedAnswer = getSelectedAnswer(currentQuestionIndex);
  console.log(savedAnswer,selectedOption,'savedAnswer')
  if (!selectedOption) {
    alert("Please select an answer before proceeding.");
    return;
  }

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    showQuestion(currentQuestionIndex);
  } else {
    questiondisplay.innerHTML = `
      <h2>Quiz Completed!</h2>
      <p>Thank you for participating, ${username}.</p>
      <p>Your total score is ${scores}/${questions.length}.</p>
      <button class="btn" id="restart-btn">Restart Quiz</button>
    `;

    document.getElementById('restart-btn').addEventListener('click', restartQuiz);
  }
    selectedOption=''
}

function saveData(selectedOption) {
  const isCorrect = allCorrectAnswers.includes(selectedOption);
  if (isCorrect) {
    scores++;
  }
  console.log("my scores", `${scores}/${questions.length}`);
  console.log("all correct answers:", allCorrectAnswers);
}

function saveAnswer(index, option) {
  const savedAnswers = JSON.parse(localStorage.getItem("selectedAnswers")) || {};
  savedAnswers[index] = option;
  localStorage.setItem("selectedAnswers", JSON.stringify(savedAnswers));

  console.log("Saved Answers:", savedAnswers);
}

function getSelectedAnswer(index) {
  const savedAnswers = JSON.parse(localStorage.getItem("selectedAnswers")) || {};
  return savedAnswers[index] || null;
}


function isOptionSelected(index, option) {
  return getSelectedAnswer(index) === option;
}


function restartQuiz() {
  localStorage.removeItem("selectedAnswers");
  currentQuestionIndex = 0;
  scores = 0;
  loginPage.style.display = 'block';
  quizPage.style.display = 'none';
}
