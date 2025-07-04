// ========== 1. Image Carousel Logic ==========
const carousel = document.getElementById("carousel");
let currentIndex = 0;
const totalImages = carousel?.children.length || 0;

if (carousel && totalImages > 0) {
  setInterval(() => {
    currentIndex = (currentIndex + 1) % totalImages;
    carousel.scrollTo({
      left: carousel.clientWidth * currentIndex,
      behavior: "smooth"
    });
  }, 4000);
}

// ========== 2. Button Redirect ==========
document.addEventListener('DOMContentLoaded', () => {
  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const competency = button.dataset.competency;
      const category = button.dataset.category;
      if (competency && category) {
        window.location.href = `quiz.html?competency=${competency}&category=${category}`;
      }
    });
  });
});

// ========== 3. Quiz Title from URL ==========
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    competency: params.get('competency'),
    category: params.get('category')
  };
}

function formatTitle(category) {
  const titleMap = {
    "grammar": "Grammar",
    "reading-comprehension": "Reading Comprehension",
    "organizing-ideas": "Organizing Ideas",
    "word-analogy": "Word Analogy",
    "assumption-conclusion": "Assumption & Conclusion",
    "fallacies": "Fallacies",
    "sequences": "Sequences",
    "math-basics": "Math Basics",
    "word-problem": "Word Problem",
    "probabilities": "Probabilities",
    "data-interpretation": "Data Interpretation",
    "clerical": "Clerical",
    "philippine-constitution": "The Philippine Constitution",
    "civil-service-commission": "The Civil Service Commission",
    "ra-7613-code": "RA 7613 Code of Conduct"
  };
  return titleMap[category] || category.replace(/-/g, ' ');
}

// ========== 4. Quiz Initialization ==========
document.addEventListener("DOMContentLoaded", () => {
  const { competency, category } = getQueryParams();
  const quizTitle = document.getElementById("quiz-title");
  const instruction = document.getElementById("category-instruction");

  if (quizTitle && category) {
    const formatted = formatTitle(category);
    quizTitle.textContent = formatted;
    if (instruction) {
      instruction.textContent = `💡 You are taking the ${formatted} quiz.`;
    }
  }

  const startBtn = document.querySelector(".generator-btn");
  const timer = document.getElementById("timer");
  const countdown = document.getElementById("countdown"); // ⏱️ New element
  const quizContainer = document.getElementById("quiz-container");
  const submitBtn = document.getElementById("submit-btn");
  const modal = document.getElementById("modal");
  const closeModalBtn = document.getElementById("modal-close-btn");
  const viewExplanationsBtn = document.querySelectorAll(".modal-btn")[1];
  const scoreText = document.getElementById("score-text");
  const timeText = document.getElementById("time-text");
  const feedbackText = document.getElementById("feedback");

  let moduleCache = null;
  let quizData = null;
  const answerTimes = Array(10).fill(0);
  const userAnswers = Array(10).fill(null);
  let questionStartTime = null;
  let countdownInterval = null;
  let timeLeft = 600;

  async function loadGeneratorScript() {
    if (!competency || !category) return;
    const path = `./data/${competency}/${category}/generator.js`;

    try {
      const module = await import(path + `?v=${Date.now()}`);
      moduleCache = module;
      quizData = await module.generateQuiz();
      renderQuiz(quizData);
    } catch (error) {
      quizContainer.innerHTML = `<p style="color:red">❌ Failed to load quiz generator.</p>`;
      console.error("Generator Load Error:", error);
    }
  }

  function renderQuiz(data) {
    quizContainer.innerHTML = "";
    data.forEach((item, index) => {
      const qEl = document.createElement("div");
      qEl.className = "quiz-question";
      qEl.innerHTML = `
        <p><strong>${index + 1}.</strong> ${item.question[0]} : ${item.question[1]} → ____ : ____</p>
        ${item.choices.map((choice, i) => `
          <label>
            <input type="radio" name="q${index}" value="${i}">
            ${choice.pair[0]} : ${choice.pair[1]}
          </label><br>
        `).join("")}
      `;
      quizContainer.appendChild(qEl);
    });
  }

  function startCountdown() {
    if (!countdown) return;
    countdown.hidden = false;
    timeLeft = 300;
    updateCountdownDisplay();

    countdownInterval = setInterval(() => {
      timeLeft--;
      updateCountdownDisplay();
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        countdown.textContent = "Time's up!";
        submitBtn.click();
      }
    }, 1000);
  }

  function updateCountdownDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    countdown.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  startBtn?.addEventListener("click", async () => {
    timer.hidden = false;
    quizContainer.hidden = false;
    submitBtn.hidden = false;
    startBtn.textContent = "↻ New Quiz";

    questionStartTime = Date.now();
    answerTimes.fill(0);
    userAnswers.fill(null);

    if (!moduleCache) {
      await loadGeneratorScript();
    } else {
      quizData = await moduleCache.generateQuiz();
      renderQuiz(quizData);
    }

    clearInterval(countdownInterval);
    startCountdown();
  });

  quizContainer?.addEventListener("change", (e) => {
    if (!e.target.name?.startsWith("q")) return;
    const index = parseInt(e.target.name.slice(1));
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    answerTimes[index] = timeTaken;
    userAnswers[index] = parseInt(e.target.value);
    questionStartTime = Date.now();
  });

  submitBtn?.addEventListener("click", () => {
    if (!quizData) return;

    clearInterval(countdownInterval);
    let score = 0;

    quizData.forEach((item, i) => {
      const selected = userAnswers[i];
      if (selected != null && item.choices[selected]?.correct) {
        score++;
      }
    });

    const missed = 10 - score;
    const totalTime = answerTimes.reduce((a, b) => a + b, 0);
    const avgTime = totalTime / 10;

    if (scoreText) {
      scoreText.textContent = `Score: ${score} / 10 (${missed} missed)`;
      scoreText.style.color =
        score >= 8 ? "green" :
        score >= 4 ? "goldenrod" :
        "red";
    }

    if (timeText) {
      timeText.textContent = `Avg Time: ${avgTime.toFixed(1)}s`;
      timeText.style.color =
        avgTime <= 20 ? "green" :
        avgTime <= 40 ? "goldenrod" :
        "red";
    }

    if (feedbackText) {
      let scoreTier, timeTier;

      if (score >= 8) scoreTier = "high";
      else if (score >= 4) scoreTier = "medium";
      else scoreTier = "low";

      if (avgTime <= 20) timeTier = "fast";
      else if (avgTime <= 40) timeTier = "moderate";
      else timeTier = "slow";

      let feedback = "";

      if (scoreTier === "high" && timeTier === "fast") {
        feedback = "🌟 Amazing! You're quick and super accurate — what a combo!";
      } else if (scoreTier === "high" && timeTier === "moderate") {
        feedback = "✨ Great job! You’ve got the right answers and solid pace.";
      } else if (scoreTier === "high" && timeTier === "slow") {
        feedback = "🌈 Wonderful accuracy! Take your time — what matters is you got it right.";
      } else if (scoreTier === "medium" && timeTier === "fast") {
        feedback = "💪 You’re fast and learning! A bit more practice and you'll shine.";
      } else if (scoreTier === "medium" && timeTier === "moderate") {
        feedback = "😊 You're doing well — just a little more practice and you'll get there.";
      } else if (scoreTier === "medium" && timeTier === "slow") {
        feedback = "🐢 You’re thoughtful and steady — keep practicing and you’ll soar.";
      } else if (scoreTier === "low" && timeTier === "fast") {
        feedback = "🤗 You're speedy — now let's slow down and think things through.";
      } else if (scoreTier === "low" && timeTier === "moderate") {
        feedback = "💛 It's okay! Every step is progress. Keep trying, you're growing.";
      } else if (scoreTier === "low" && timeTier === "slow") {
        feedback = "🫶 Don't be discouraged. You're learning, and we believe in you.";
      }

      feedbackText.textContent = feedback;
    }

    modal.style.display = "block";
  });

  closeModalBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  viewExplanationsBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });
});
