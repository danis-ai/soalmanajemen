// script.js

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let answeredQuestions = []; // Array untuk melacak apakah soal sudah dijawab
let chosenAnswers = []; // Array untuk menyimpan jawaban yang dipilih
let correctAnswers = []; // Array untuk menyimpan apakah jawaban benar atau salah

// Elemen DOM
const quizContainer = document.getElementById('quiz');
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const nextBtn = document.getElementById('next-btn');
const scoreContainer = document.getElementById('score-container');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');
const viewQuestionsBtn = document.getElementById('view-questions-btn');
const overlay = document.getElementById('overlay');
const reviewContainer = document.getElementById('review-container');
const reviewList = document.getElementById('review-list');
const closeReviewBtn = document.getElementById('close-review-btn');

// Memuat soal dari file JSON
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = shuffleArray(data);
        initializeSidebar();
        chosenAnswers = new Array(questions.length).fill(null); // Inisialisasi array jawaban
        correctAnswers = new Array(questions.length).fill(false); // Inisialisasi array jawaban benar
        showQuestion();
    })
    .catch(error => {
        console.error('Error memuat soal:', error);
    });

// Fungsi untuk mengacak array menggunakan Fisher-Yates Shuffle
function shuffleArray(array) {
    let shuffled = array.slice();
    for (let i = shuffled.length -1; i > 0; i--){
        const j = Math.floor(Math.random() * (i +1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Inisialisasi daftar soal di sidebar
function initializeSidebar() {
    const questionList = document.getElementById('question-list');
    questions.forEach((question, index) => {
        const li = document.createElement('li');
        li.textContent = index + 1;
        li.setAttribute('data-index', index);
        li.addEventListener('click', () => navigateToQuestion(index));
        questionList.appendChild(li);
    });
}

// Update status sidebar berdasarkan jawaban yang sudah dipilih
function updateSidebar() {
    const questionList = document.getElementById('question-list');
    const items = questionList.querySelectorAll('li');

    items.forEach((item, index) => {
        item.classList.remove('completed', 'active', 'correct', 'wrong');
        if (answeredQuestions[index]) {
            item.classList.add('completed');
            if (correctAnswers[index]) {
                item.classList.add('correct');
            } else {
                item.classList.add('wrong');
            }
        }
        if (index === currentQuestionIndex) {
            item.classList.add('active');
        }
    });
}

// Menampilkan soal saat ini
function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    questionEl.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`; // Menambahkan penomoran

    // Update sidebar
    updateSidebar();

    // Mengacak urutan pilihan jawaban
    let shuffledChoices = shuffleArray(currentQuestion.choices);
    shuffledChoices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice');
        button.textContent = choice;
        button.addEventListener('click', selectChoice);
        choicesEl.appendChild(button);
    });

    // Jika pengguna sudah memilih jawaban sebelumnya, tampilkan pilihan tersebut
    if (chosenAnswers[currentQuestionIndex] !== null) {
        const allChoices = document.querySelectorAll('.choice');
        allChoices.forEach(button => {
            if (button.textContent === chosenAnswers[currentQuestionIndex]) {
                button.classList.add('selected');
            }
        });
        nextBtn.disabled = false;
    }

    // Tandai pilihan benar/salah dengan warna jika sudah dijawab
    if (answeredQuestions[currentQuestionIndex]) {
        const correctAnswer = questions[currentQuestionIndex].answer;
        const userAnswer = chosenAnswers[currentQuestionIndex];
        const allChoices = document.querySelectorAll('.choice');
    }
}

// Reset tampilan sebelum menampilkan soal baru
function resetState() {
    clearStatus();
    nextBtn.disabled = true;
    while (choicesEl.firstChild) {
        choicesEl.removeChild(choicesEl.firstChild);
    }
}

// Menghapus status pilihan
function clearStatus() {
    const selected = document.querySelector('.choice.selected');
    if (selected) {
        selected.classList.remove('selected');
    }

    // Reset gaya pilihan jawaban
    const allChoices = document.querySelectorAll('.choice');
    allChoices.forEach(button => {
        button.style.borderColor = '#ff6b6b'; // Warna border default
        button.style.backgroundColor = '#fff'; // Warna background default
    });
}

// Menangani pemilihan jawaban
function selectChoice(e) {
    const selectedButton = e.target;
    const allChoices = document.querySelectorAll('.choice');

    // Hapus kelas 'selected' dari semua pilihan
    allChoices.forEach(button => {
        button.classList.remove('selected');
    });

    // Tambahkan kelas 'selected' ke pilihan yang dipilih
    selectedButton.classList.add('selected');

    // Simpan jawaban yang dipilih
    chosenAnswers[currentQuestionIndex] = selectedButton.textContent;

    // Aktifkan tombol "Next"
    nextBtn.disabled = false;
}

// Menangani klik tombol "Next"
nextBtn.addEventListener('click', () => {
    const selectedAnswer = chosenAnswers[currentQuestionIndex];
    const correctAnswer = questions[currentQuestionIndex].answer;

    if (selectedAnswer === correctAnswer) {
        score++;
        correctAnswers[currentQuestionIndex] = true;
    } else {
        correctAnswers[currentQuestionIndex] = false;
    }

    // Tandai soal sebagai sudah dijawab
    answeredQuestions[currentQuestionIndex] = true;

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
});

// Menampilkan skor akhir
function showScore() {
    // Sembunyikan sidebar setelah semua soal selesai
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.add('hidden');
    }

    // Tampilkan overlay
    overlay.classList.remove('hidden');

    // Sembunyikan kontainer quiz
    quizContainer.classList.add('hidden');
    
    // Tampilkan kontainer skor
    scoreContainer.classList.remove('hidden');

    // Menghitung persentase skor
    const percentage = Math.round((score / questions.length) * 100);
    const totalCorrect = score;
    const totalWrong = questions.length - score;

    // Tampilkan skor dengan struktur yang lebih modern
    scoreEl.innerHTML = `
        <div class="score-wrapper">
            <div class="score-circle">
                <span class="score-percentage">${percentage}%</span>
            </div>
            <div class="score-details">
                <div class="detail benar">
                    <p>Benar</p>
                    <span>${totalCorrect}</span>
                </div>
                <div class="detail salah">
                    <p>Salah</p>
                    <span>${totalWrong}</span>
                </div>
            </div>
            <div class="score-message">${percentage >= 80 ? 'Hebat!' : percentage >= 50 ? 'Lumayan!' : 'Tetap Semangat!'}</div>
            <button id="view-questions-btn" class="view-questions-btn">Review Jawaban</button>
        </div>
    `;

    // Tambahkan event listener ke tombol "Lihat Soal"
    const newViewQuestionsBtn = document.getElementById('view-questions-btn');
    newViewQuestionsBtn.addEventListener('click', showReview);

    // Update the sidebar untuk menandai benar/salah
    updateSidebar();
}

// Menampilkan kontainer review soal
function showReview() {
    // Sembunyikan overlay dan papan skor
    overlay.classList.add('hidden');
    scoreContainer.classList.add('hidden');

    // Tampilkan kontainer review
    reviewContainer.classList.remove('hidden');

    // Membuat daftar review soal
    reviewList.innerHTML = ''; // Kosongkan sebelumnya

    questions.forEach((question, index) => {
        const userAnswer = chosenAnswers[index];
        const correctAnswer = question.answer;
        const isCorrect = correctAnswers[index];

        const questionDiv = document.createElement('div');
        questionDiv.classList.add('review-question');
        questionDiv.classList.add(isCorrect ? 'correct' : 'wrong');

        const questionTitle = document.createElement('h3');
        questionTitle.textContent = `Soal ${index + 1}: ${question.question}`;
        questionDiv.appendChild(questionTitle);

        const userAnswerP = document.createElement('p');
        userAnswerP.innerHTML = `Jawaban Anda: <span class="user-answer">${userAnswer || 'Tidak dijawab'}</span>`;
        questionDiv.appendChild(userAnswerP);

        const correctAnswerP = document.createElement('p');
        correctAnswerP.innerHTML = `Jawaban yang benar: <span class="user-benar">${correctAnswer}</span>`;
        questionDiv.appendChild(correctAnswerP);

        reviewList.appendChild(questionDiv);
    });
}

// Menutup kontainer review soal
closeReviewBtn.addEventListener('click', () => {
    reviewContainer.classList.add('hidden');
    scoreContainer.classList.remove('hidden');
});


// Fungsi untuk navigasi ke soal tertentu melalui sidebar
function navigateToQuestion(index) {
    currentQuestionIndex = index;
    showQuestion();
}