const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const printButton = document.getElementById('print-btn');
const emailResultsButton = document.getElementById('email-results-btn');

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const certificateScreen = document.getElementById('certificate-screen');
const errorMessageElement = document.getElementById('error-message');

const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const scoreElement = document.getElementById('score');
const resultMessageElement = document.getElementById('result-message');
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');
const timerElement = document.getElementById('timer');

let shuffledQuestions, currentQuestionIndex;
let score = 0;
const PASSING_SCORE = 80;
let timer;
let timeRemaining = 15 * 60; // 15 minutes in seconds

// Event Listeners
startButton.addEventListener('click', startQuiz);
emailResultsButton.addEventListener('click', emailResults);
restartButton.addEventListener('click', () => {
    // Hide all result/certificate screens and show the start screen
    resultScreen.classList.add('hide');
    certificateScreen.classList.add('hide');
    emailResultsButton.classList.add('hide');
    startScreen.classList.remove('hide');
    errorMessageElement.classList.add('hide');
});
printButton.addEventListener('click', () => window.print());

function startQuiz() {
    const userName = userNameInput.value.trim();
    const userEmail = userEmailInput.value.trim();

    // Basic validation
    if (userName === "" || userEmail === "") {
        errorMessageElement.innerText = "Please enter both your name and email to begin.";
        errorMessageElement.classList.remove('hide');
        return;
    }
    errorMessageElement.classList.add('hide');
    
    score = 0;
    startScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    
    // Start Timer
    timeRemaining = 15 * 60;
    updateTimerDisplay();
    clearInterval(timer);
    timer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            clearInterval(timer);
            showResult();
        }
    }, 1000);

    setNextQuestion();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerElement.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function setNextQuestion() {
    resetState();
    if (shuffledQuestions.length > currentQuestionIndex) {
        showQuestion(shuffledQuestions[currentQuestionIndex]);
    } else {
        clearInterval(timer);
        showResult();
    }
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === "true";
    if (correct) {
        score++;
    }
    currentQuestionIndex++;
    setNextQuestion();
}

function showResult() {
    quizScreen.classList.add('hide');
    resultScreen.classList.remove('hide');
    const finalScore = Math.round((score / questions.length) * 100);
    scoreElement.innerText = finalScore;

    // Show the email button now that the test is done
    emailResultsButton.classList.remove('hide');

    if (finalScore >= PASSING_SCORE) {
        resultMessageElement.innerText = "Congratulations! You passed.";
        generateCertificate(finalScore);
        certificateScreen.classList.remove('hide');
    } else {
        resultMessageElement.innerText = `You did not pass. A score of ${PASSING_SCORE}% is required. Please try again.`;
    }
}

function generateCertificate(finalScore) {
    document.getElementById('cert-name').innerText = userNameInput.value.trim();
    document.getElementById('cert-score').innerText = finalScore;
    document.getElementById('cert-date').innerText = new Date().toLocaleDateString();
}

function emailResults() {
    const userName = userNameInput.value.trim();
    const userEmail = userEmailInput.value.trim();
    const finalScore = scoreElement.innerText;
    const completionDate = new Date().toLocaleDateString();
    const passStatus = parseInt(finalScore) >= PASSING_SCORE ? "PASSED" : "FAILED";

    const subject = `SOFA Driver's Test Result for ${userName}`;
    
    let body = `
This email contains the test results for a SOFA Driver's License prerequisite exam.

--- TEST TAKER INFORMATION ---
Name: ${userName}
Email: ${userEmail}

--- TEST RESULT ---
Final Score: ${finalScore}%
Status: ${passStatus}
`;

    // ** NEW: If the user passed, add the certificate information to the email body. **
    if (passStatus === "PASSED") {
        const certificateText = `

--- CERTIFICATE OF COMPLETION ---
This certifies that
${userName}
has successfully completed the SOFA driver's license written examination.
Score: ${finalScore}%
Date of Completion: ${completionDate}
------------------------------------
`;
        body += certificateText;
    }

    body += "\nThis email was generated by the user from the SOFA testing website.";

    const mailtoLink = `mailto:18sfs.s5b.pass-registration@us.af.mil?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    
    window.location.href = mailtoLink;
}


const questions = [
    {
        question: "What is the standard blood alcohol content (BAC) limit for DUI under Japanese law? (Pg. 15)",
        answers: [
            { text: "0.03%", correct: true },
            { text: "0.05%", correct: false },
            { text: "0.08%", correct: false },
            { text: "0.10%", correct: false }
        ]
    },
    {
        question: "Which side of the road should vehicles normally drive on in Japan? (Pg. 5)",
        answers: [
            { text: "Left", correct: true },
            { text: "Right", correct: false },
            { text: "Center", correct: false },
            { text: "Any side", correct: false }
        ]
    },
    {
        question: "What is the maximum speed limit for trucks under 5 tons and passenger vehicles? (Pg. 8)",
        answers: [
            { text: "80 km/h", correct: true },
            { text: "60 km/h", correct: false },
            { text: "100 km/h", correct: false },
            { text: "50 km/h", correct: false }
        ]
    },
    {
        question: "What does 'No Pedestrian Crossing' mean? (Pg. 22)",
        answers: [
            { text: "Pedestrians must cross", correct: false },
            { text: "Cross anytime", correct: false },
            { text: "Pedestrians are prohibited from crossing", correct: true },
            { text: "Use sidewalk", correct: false }
        ]
    },
    {
        question: "How many meters before a turn must you signal? (Pg. 11)",
        answers: [
            { text: "10 meters", correct: false },
            { text: "20 meters", correct: false },
            { text: "30 meters", correct: true },
            { text: "50 meters", correct: false }
        ]
    },
    {
        question: "How close can you park to a fire hydrant? (Pg. 9)",
        answers: [
            { text: "2 meters", correct: false },
            { text: "3 meters", correct: false },
            { text: "5 meters", correct: true },
            { text: "10 meters", correct: false }
        ]
    },
    {
        question: "When are you allowed to use your horn in Japan? (Pg. 11)",
        answers: [
            { text: "To greet someone", correct: false },
            { text: "To express anger", correct: false },
            { text: "Only when required by law or to avoid danger", correct: true },
            { text: "In traffic jams", correct: false }
        ]
    },
    {
        question: "How far must you stay behind an emergency vehicle? (Pg. 16)",
        answers: [
            { text: "200 ft", correct: false },
            { text: "300 ft", correct: false },
            { text: "500 ft", correct: true },
            { text: "1000 ft", correct: false }
        ]
    },
    {
        question: "What is the penalty for refusing a chemical test when suspected of DUI? (Pg. 12)",
        answers: [
            { text: "Small fine", correct: false },
            { text: "Ticket only", correct: false },
            { text: "Automatic revocation of driving privileges", correct: true },
            { text: "Warning", correct: false }
        ]
    },
    {
        question: "How long do you have to report an accident to your insurance? (Pg. 14)",
        answers: [
            { text: "Immediately", correct: false },
            { text: "24 hours", correct: false },
            { text: "48 hours", correct: false },
            { text: "72 hours", correct: true }
        ]
    },
    {
        question: "Where must pedestrians be given the right-of-way? (Pg. 6)",
        answers: [
            { text: "Highways", correct: false },
            { text: "Intersections only", correct: false },
            { text: "Crosswalks and sidewalks", correct: true },
            { text: "Only on base", correct: false }
        ]
    },
    {
        question: "Can motorcycles use bus exclusive lanes? (Pg. 6)",
        answers: [
            { text: "Yes, anytime", correct: true },
            { text: "Only with passengers", correct: false },
            { text: "Yes, during allowed times", correct: false },
            { text: "No", correct: false }
        ]
    },
    {
        question: "What must be displayed if a vehicle stops on an expressway at night? (Pg. 7)",
        answers: [
            { text: "Hazard lights", correct: true },
            { text: "Road flares and hazard lights", correct: false },
            { text: "Flashlight", correct: false },
            { text: "Reflective vest", correct: false }
        ]
    },
    {
        question: "How should you respond to a stopped school bus on base? (Pg. 6)",
        answers: [
            { text: "Proceed cautiously", correct: false },
            { text: "Stop only if children present", correct: false },
            { text: "Do not proceed until bus moves or signals", correct: true },
            { text: "Pass on the left", correct: false }
        ]
    },
    {
        question: "What is required equipment for motorcycle riders? (Pg. 17)",
        answers: [
            { text: "Helmet only", correct: false },
            { text: "Helmet and gloves", correct: false },
            { text: "Helmet, gloves, boots, and protective clothing", correct: true },
            { text: "None on base", correct: false }
        ]
    },
    {
        question: "What sticker must a vehicle have after passing JCI? (Pg. 11)",
        answers: [
            { text: "Insurance sticker", correct: false },
            { text: "Permit sticker", correct: false },
            { text: "JCI sticker", correct: true },
            { text: "Registration sticker", correct: false }
        ]
    },
    {
        question: "Can drivers reverse on expressways? (Pg. 16)",
        answers: [
            { text: "Yes", correct: false },
            { text: "Only in emergencies", correct: false },
            { text: "No, never", correct: true },
            { text: "Only motorcycles", correct: false }
        ]
    },
    {
        question: "What is the penalty for lending your vehicle to an unlicensed person? (Pg. 13)",
        answers: [
            { text: "Ticket", correct: false },
            { text: "License suspension", correct: false },
            { text: "500,000 yen fine or up to 3 years in jail", correct: true },
            { text: "Community service", correct: false }
        ]
    },
    {
        question: "Who must wear seatbelts in a moving vehicle? (Pg. 19)",
        answers: [
            { text: "Driver only", correct: false },
            { text: "Front seat passengers", correct: false },
            { text: "All passengers", correct: true },
            { text: "Only children", correct: false }
        ]
    },
    {
        question: "What must you do when approached by an emergency vehicle? (Pg. 16)",
        answers: [
            { text: "Continue slowly", correct: false },
            { text: "Speed up", correct: false },
            { text: "Pull over and stop", correct: true },
            { text: "Ignore", correct: false }
        ]
    },
    {
        question: "What is the rule for overtaking on a two-lane road? (Pg. 8)",
        answers: [
            { text: "Pass on the left", correct: true },
            { text: "Pass on the right", correct: false },
            { text: "Only pass motorcycles", correct: false },
            { text: "Do not pass", correct: false }
        ]
    },
    {
        question: "Can you wear headphones while driving? (Pg. 18)",
        answers: [
            { text: "Yes", correct: false },
            { text: "Only one ear", correct: false },
            { text: "No", correct: true },
            { text: "Yes, if not loud", correct: false }
        ]
    },
    {
        question: "What does a solid yellow centerline indicate? (Pg. 5)",
        answers: [
            { text: "Passing allowed", correct: false },
            { text: "Passing prohibited", correct: true },
            { text: "Bus lane", correct: false },
            { text: "Pedestrian lane", correct: false }
        ]
    },
    {
        question: "What should you do if your vehicle breaks down on an expressway? (Pg. 7)",
        answers: [
            { text: "Signal and stop in the lane", correct: false },
            { text: "Call police", correct: false },
            { text: "Move completely off and set warning devices", correct: true },
            { text: "Drive in reverse", correct: false }
        ]
    },
    {
        question: "What should you do if you're a witness to an accident? (Pg. 14)",
        answers: [
            { text: "Leave immediately", correct: false },
            { text: "Call your insurance", correct: false },
            { text: "Remain and identify yourself", correct: true },
            { text: "Take photos only", correct: false }
        ]
    },
    {
        question: "How often must vehicles be inspected for JCI? (Pg. 11)",
        answers: [
            { text: "Every year", correct: false },
            { text: "Every 2 years", correct: true },
            { text: "Every 5 years", correct: false },
            { text: "Never", correct: false }
        ]
    },
    {
        question: "What is required before driving a rented vehicle? (Pg. 13)",
        answers: [
            { text: "Only permission", correct: false },
            { text: "JCI insurance", correct: false },
            { text: "SOFA license, insurance, and permission", correct: true },
            { text: "Just keys", correct: false }
        ]
    },
    {
        question: "Can you park on a one-way street's right side? (Pg. 10)",
        answers: [
            { text: "No", correct: false },
            { text: "Yes, if designated", correct: true },
            { text: "Only trucks", correct: false },
            { text: "Only motorcycles", correct: false }
        ]
    },
    {
        question: "What must you produce upon request by police? (Pg. 13)",
        answers: [
            { text: "ID only", correct: false },
            { text: "License and ID", correct: false },
            { text: "License, ID, registration, and insurance", correct: true },
            { text: "Nothing", correct: false }
        ]
    },
    {
        question: "Where should you not stop your vehicle? (Pg. 9)",
        answers: [
            { text: "Crosswalks", correct: false },
            { text: "Fire hydrant zones", correct: false },
            { text: "Sidewalks", correct: false },
            { text: "All of the above", correct: true }
        ]
    }
];