// --- DOM ELEMENT REFERENCES ---
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const claimScreen = document.getElementById('claim-screen');
const finalScreen = document.getElementById('final-screen');

const startButton = document.getElementById('start-btn');
const postTestButton = document.getElementById('post-test-btn');
const generateButton = document.getElementById('generate-btn');
const printButton = document.getElementById('print-btn');
const restartButton = document.getElementById('restart-btn');

const userEmailInput = document.getElementById('userEmail');
const userNameInput = document.getElementById('userName');
const rulesAcknowledgedCheckbox = document.getElementById('rules-acknowledged');
const errorMessageElement = document.getElementById('error-message');

const timerElement = document.getElementById('timer');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const scoreElement = document.getElementById('score');
const resultMessageElement = document.getElementById('result-message');
const certificateWrapper = document.getElementById('certificate-wrapper');

// --- QUIZ STATE VARIABLES ---
let currentQuestionIndex, score, timer;
const PASSING_SCORE = 80;
const TIME_LIMIT_SECONDS = 15 * 60;

// --- EVENT LISTENERS ---
startButton.addEventListener('click', preTestChecks);
generateButton.addEventListener('click', generateCertificate);
printButton.addEventListener('click', () => window.print());
restartButton.addEventListener('click', () => location.reload());

// --- CORE LOGIC ---

function preTestChecks() {
    const email = userEmailInput.value.trim().toLowerCase();
    errorMessageElement.classList.add('hide');

    if (!email.includes('@')) {
        showError("Please enter a valid email address.");
        return;
    }
    if (!rulesAcknowledgedCheckbox.checked) {
        showError("You must acknowledge that you have closed the study guide.");
        return;
    }
    
    // NOTE: This is a simulation. A secure implementation requires a backend server.
    const attempts = JSON.parse(localStorage.getItem('sofaTestAttempts')) || {};
    const userAttempts = attempts[email] || [];
    const now = new Date().getTime();
    const recentAttempts = userAttempts.filter(attemptTime => (now - attemptTime) < 24 * 60 * 60 * 1000);

    if (recentAttempts.length >= 2) {
        showError("You have used this email twice in the last 24 hours. Please try again later.");
        return;
    }

    recentAttempts.push(now);
    attempts[email] = recentAttempts;
    localStorage.setItem('sofaTestAttempts', JSON.stringify(attempts));
    
    startQuiz();
}

function startQuiz() {
    startScreen.classList.add('hide');
    quizScreen.classList.remove('hide');

    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    score = 0;
    let timeRemaining = TIME_LIMIT_SECONDS;
    
    updateTimerDisplay(timeRemaining);
    timer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay(timeRemaining);
        if (timeRemaining <= 0) endQuiz(shuffledQuestions.length);
    }, 1000);

    function setNextQuestion() {
        if (currentQuestionIndex < shuffledQuestions.length) {
            showQuestion(shuffledQuestions[currentQuestionIndex]);
        } else {
            endQuiz(shuffledQuestions.length);
        }
    }

    function showQuestion(question) {
        answerButtonsElement.innerHTML = '';
        questionElement.innerText = question.question;
        
        // Randomize answer order
        const randomizedAnswers = question.answers.sort(() => Math.random() - 0.5);
        
        randomizedAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('btn');
            button.addEventListener('click', () => {
                if (answer.correct) score++;
                currentQuestionIndex++;
                setNextQuestion();
            });
            answerButtonsElement.appendChild(button);
        });
    }

    setNextQuestion();
}

function endQuiz(totalQuestions) {
    clearInterval(timer);
    quizScreen.classList.add('hide');
    resultScreen.classList.remove('hide');

    const finalScore = Math.round((score / totalQuestions) * 100);
    scoreElement.innerText = finalScore;

    if (finalScore >= PASSING_SCORE) {
        resultMessageElement.innerText = "Congratulations! You passed.";
        postTestButton.innerText = "Generate Your Certificate";
        postTestButton.onclick = () => {
            resultScreen.classList.add('hide');
            claimScreen.classList.remove('hide');
        };
    } else {
        resultMessageElement.innerText = "You did not pass. A score of 80% is required.";
        postTestButton.innerText = "Try Again";
        postTestButton.onclick = () => location.reload();
    }
}

function generateCertificate() {
    const userName = userNameInput.value.trim();
    if (!userName) {
        alert("Please enter your name.");
        return;
    }
    
    const finalScore = scoreElement.innerText;
    const completionDate = new Date().toLocaleDateString();

    certificateWrapper.innerHTML = `
        <div class="cert-header"><h1>Certificate of Completion</h1><h2>SOFA Driver's License Training</h2></div>
        <div class="cert-body">
            <p>This certifies that</p><h2 id="cert-name">${userName}</h2>
            <p>has successfully completed the SOFA driver's license written examination with a passing score of <strong>${finalScore}</strong>%.</p>
            <p>Date of Completion: <span>${completionDate}</span></p>
        </div>
        <div class="cert-footer"><p>This certificate is required for the next step of the licensing process.</p></div>
    `;

    emailResults(userName, finalScore, completionDate);
    
    claimScreen.classList.add('hide');
    finalScreen.classList.remove('hide');
}

// --- HELPER FUNCTIONS ---

function emailResults(userName, finalScore, completionDate) {
    const userEmail = userEmailInput.value.trim();
    const subject = `SOFA Driver's Test Result for ${userName}`;
    const body = `This email contains the test results for a SOFA Driver's License prerequisite exam.\n\n--- TEST TAKER INFORMATION ---\nName: ${userName}\nEmail: ${userEmail}\n\n--- TEST RESULT ---\nFinal Score: ${finalScore}%\nStatus: PASSED\n\n--- CERTIFICATE OF COMPLETION ---\nThis certifies that ${userName} has successfully completed the SOFA driver's license written examination.\nScore: ${finalScore}%\nDate of Completion: ${completionDate}\n------------------------------------\n\nThis email was generated by the user from the SOFA testing website.`;
    const mailtoLink = `mailto:18sfs.s5b.pass-registration@us.af.mil?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
}

function showError(message) {
    errorMessageElement.innerText = message;
    errorMessageElement.classList.remove('hide');
}

function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toString().padStart(2, '0');
    timerElement.innerText = `${minutes}:${seconds}`;
}

const questions = [
    { question: "What is the standard blood alcohol content (BAC) limit for DUI under Japanese law?", answers: [ { text: "0.03%", correct: true }, { text: "0.05%", correct: false }, { text: "0.08%", correct: false }, { text: "0.10%", correct: false } ] },
    { question: "Which side of the road should vehicles normally drive on in Japan?", answers: [ { text: "Left", correct: true }, { text: "Right", correct: false }, { text: "Center", correct: false } ] },
    { question: "What is the maximum speed limit for passenger vehicles on a national highway?", answers: [ { text: "80 km/h", correct: false }, { text: "60 km/h", correct: true }, { text: "100 km/h", correct: false } ] },
    { question: "How many meters before making a turn must you signal?", answers: [ { text: "10 meters", correct: false }, { text: "30 meters", correct: true }, { text: "50 meters", correct: false } ] },
    { question: "You may not park a vehicle within how many meters of a fire hydrant?", answers: [ { text: "3 meters", correct: false }, { text: "5 meters", correct: true }, { text: "10 meters", correct: false } ] },
    { question: "When is it permitted to use your horn?", answers: [ { text: "To signal to a friend", correct: false }, { text: "Only when required by law or to avoid danger", correct: true }, { text: "To show frustration in traffic", correct: false } ] },
    { question: "When approached by an emergency vehicle, what should you do?", answers: [ { text: "Speed up to clear the way", correct: false }, { text: "Pull to the left side of the road and stop", correct: true }, { text: "Continue at the same speed", correct: false } ] },
    { question: "What is the immediate penalty for refusing a chemical test if suspected of DUI?", answers: [ { text: "A small fine", correct: false }, { text: "Automatic revocation of driving privileges", correct: true }, { text: "A written warning", correct: false } ] },
    { question: "Within how many hours must you report an accident to your insurance company?", answers: [ { text: "24 hours", correct: false }, { text: "48 hours", correct: false }, { text: "72 hours", correct: true } ] },
    { question: "Where must you always give the right-of-way to pedestrians?", answers: [ { text: "On highways", correct: false }, { text: "At all crosswalks and sidewalks", correct: true }, { text: "Only on military installations", correct: false } ] },
    { question: "Can motorcycles use 'Bus Exclusive' lanes?", answers: [ { text: "Yes, at any time", correct: true }, { text: "No, never", correct: false }, { text: "Only during non-peak hours", correct: false } ] },
    { question: "When stopped on an expressway at night, what must be displayed?", answers: [ { text: "Hazard lights only", correct: false }, { text: "Hazard lights and a warning triangle/flare", correct: true }, { text: "Your vehicle's interior light", correct: false } ] },
    { question: "On base, what must you do when a school bus stops and has its warning lights flashing?", answers: [ { text: "Proceed with caution", correct: false }, { text: "Stop, regardless of your direction of travel", correct: true }, { text: "Stop only if you are behind the bus", correct: false } ] },
    { question: "What is the minimum required personal protective equipment for riding a motorcycle?", answers: [ { text: "A helmet", correct: false }, { text: "Helmet, gloves, long sleeves, long pants, and sturdy footwear", correct: true }, { text: "A reflective vest", correct: false } ] },
    { question: "What does the JCI sticker on a vehicle signify?", answers: [ { text: "Proof of ownership", correct: false }, { text: "The vehicle has passed a mandatory inspection", correct: true }, { text: "Proof of insurance", correct: false } ] },
    { question: "Is it legal to reverse (drive backwards) on an expressway?", answers: [ { text: "Only in an emergency", correct: false }, { text: "No, never", correct: true }, { text: "Yes, on the shoulder", correct: false } ] },
    { question: "What is a potential penalty for lending your vehicle to someone who is intoxicated?", answers: [ { text: "A warning", correct: false }, { text: "A fine up to 500,000 yen and/or up to 3 years confinement", correct: true }, { text: "A 30-day license suspension", correct: false } ] },
    { question: "Who is required to wear a seatbelt in a privately owned vehicle?", answers: [ { text: "Only the driver", correct: false }, { text: "Driver and front-seat passenger", correct: false }, { text: "All occupants of the vehicle", correct: true } ] },
    { question: "What does a solid yellow centerline on a road indicate?", answers: [ { text: "Passing is permitted", correct: false }, { text: "No passing from either side", correct: true }, { text: "A temporary lane marker", correct: false } ] },
    { question: "If your vehicle breaks down on an expressway, what is the first thing you should do?", answers: [ { text: "Attempt to repair it in the lane", correct: false }, { text: "Safely move the vehicle completely off the roadway", correct: true }, { text: "Call a friend for help", correct: false } ] },
    { question: "If you witness an accident, what is your primary responsibility?", answers: [ { text: "Leave the scene immediately", correct: false }, { text: "Render aid if safe and identify yourself to authorities", correct: true }, { text: "Take photos for social media", correct: false } ] },
    { question: "How often must most passenger vehicles undergo a Japanese Compulsory Insurance (JCI) inspection?", answers: [ { text: "Every year", correct: false }, { text: "Every two years", correct: true }, { text: "Every three years", correct: false } ] },
    { question: "Before driving a rental vehicle, you must possess what documents?", answers: [ { text: "A valid credit card", correct: false }, { text: "A valid SOFA license, rental agreement, and proper insurance", correct: true }, { text: "Your U.S. driver's license only", correct: false } ] },
    { question: "Is it permissible to park on the right side of a one-way street?", answers: [ { text: "No, under no circumstances", correct: false }, { text: "Yes, but only if specifically designated by signs", correct: true }, { text: "Yes, at any time", correct: false } ] },
    { question: "What documents must you produce upon request by a law enforcement officer?", answers: [ { text: "Military ID only", correct: false }, { text: "Driver's license, registration, and proof of insurance", correct: true }, { text: "Driver's license only", correct: false } ] },
    { question: "Stopping or parking is prohibited in which of the following areas?", answers: [ { text: "Within a designated 'no parking' zone", correct: false }, { text: "On a sidewalk or in a crosswalk", correct: true }, { text: "More than 1 meter from the curb", correct: false } ] },
    { question: "A 'No U-Turn' sign means:", answers: [ { text: "You must make a right turn", correct: false }, { text: "You are not permitted to reverse your direction of travel", correct: true }, { text: "U-turns are allowed for official vehicles only", correct: false } ] },
    { question: "What does a triangular sign with a red border typically indicate?", answers: [ { text: "A regulatory command", correct: false }, { text: "A warning of a hazard ahead", correct: true }, { text: "An informational message", correct: false } ] },
    { question: "An inverted red triangle sign with the characters '止まれ' means you must:", answers: [ { text: "Yield", correct: false }, { text: "Come to a complete stop", correct: true }, { text: "Proceed with caution", correct: false } ] },
    { question: "What does a circular sign with a red border and a white horizontal bar mean?", answers: [ { text: "One Way", correct: false }, { text: "Do Not Enter", correct: true }, { text: "Road Closed", correct: false } ] }
];