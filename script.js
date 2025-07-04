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
    // Verbal
    "grammar": "Grammar",
    "reading-comprehension": "Reading Comprehension",
    "organizing-ideas": "Organizing Ideas",
    // Analytical
    "word-analogy": "Word Analogy",
    "assumption-conclusion": "Assumption & Conclusion",
    "fallacies": "Fallacies",
    "sequences": "Sequences",
    // Numerical
    "math-basics": "Math Basics",
    "word-problem": "Word Problem",
    "probabilities": "Probabilities",
    "data-interpretation": "Data Interpretation",
    // Clerical
    "clerical": "Clerical",
    // General Info
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
  const quizContainer = document.getElementById("quiz-container");
  const submitBtn = document.getElementById("submit-btn");
  const modal = document.getElementById("modal");
  const closeModalBtn = document.getElementById("modal-close-btn");
  const viewExplanationsBtn = document.querySelectorAll(".modal-btn")[1];

  let moduleCache = null;
  let quizData = null;

  async function loadGeneratorScript() {
    if (!competency || !category) return;
    const path = `./data/${competency}/${category}/generator.js`;

    try {
      const module = await import(path + `?v=${Date.now()}`); // bust cache
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

  startBtn?.addEventListener("click", async () => {
    timer.hidden = false;
    quizContainer.hidden = false;
    submitBtn.hidden = false;
    startBtn.textContent = "↻ New Quiz";

    if (!moduleCache) {
      await loadGeneratorScript();
    } else {
      quizData = await moduleCache.generateQuiz();
      renderQuiz(quizData);
    }
  });

  submitBtn?.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeModalBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  viewExplanationsBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });
});