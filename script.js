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

// ========== 2. Button Redirect (on index.html) ==========
document.addEventListener('DOMContentLoaded', () => {
  const categoryButtons = document.querySelectorAll('.category-btn');

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const competency = button.dataset.competency;
      const category = button.dataset.category;

      if (competency && category) {
        const url = `quiz.html?competency=${competency}&category=${category}`;
        window.location.href = url;
      }
    });
  });
});

// ========== 3. Quiz Page: Set Quiz Title from URL (on quiz.html) ==========
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

document.addEventListener('DOMContentLoaded', () => {
  const { category } = getQueryParams();
  const quizTitle = document.getElementById('quiz-title');
  const instruction = document.getElementById('category-instruction');

  if (quizTitle && category) {
    const formattedTitle = formatTitle(category);
    quizTitle.textContent = formattedTitle;
    if (instruction) {
      instruction.textContent = `💡 You are taking the ${formattedTitle} quiz.`;
    }
  }
});

// === QUIZ PAGE LOGIC ===
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.querySelector(".quiz-generator-btn");
  const timer = document.getElementById("timer");
  const quizContainer = document.getElementById("quiz-container");
  const submitBtn = document.getElementById("submit-btn");
  const modal = document.getElementById("modal");
  const closeModalBtn = document.getElementById("modal-close-btn");
  const viewExplanationsBtn = document.querySelectorAll(".modal-btn")[1]; // second button

  // Start Quiz
  startBtn?.addEventListener("click", () => {
    timer.hidden = false;
    quizContainer.hidden = false;
    submitBtn.hidden = false;

    // Change button label to "↻ New Quiz"
    startBtn.textContent = "↻ New Quiz";

    // OPTIONAL: Add dummy content for now
    quizContainer.innerHTML = "<p>📚 Quiz questions will go here...</p>";
  });

  // Submit Quiz
  submitBtn?.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Close Modal
  closeModalBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // View Explanations (currently just closes modal)
  viewExplanationsBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });
});