// Carousel Auto Scroll
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

// Save selected category and redirect to quiz
const categoryButtons = document.querySelectorAll('.category-btn');
categoryButtons.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.textContent.trim();
    localStorage.setItem('selectedCategory', category);
    document.title = `${category} | SchemaTest`;
    window.location.href = 'quiz.html';
  });
});

// On quiz.html, update heading and title
window.addEventListener('DOMContentLoaded', () => {
  const category = localStorage.getItem('selectedCategory');
  const titleElement = document.getElementById('quiz-category');

  if (category && titleElement) {
    titleElement.textContent = category;
    document.title = `${category} | SchemaTest`;
  }
});

// Show submit button when quiz is started
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');

startBtn?.addEventListener('click', () => {
  // Replace with quiz generation logic later
  startBtn.textContent = 'New Quiz';
  submitBtn.style.display = 'inline-block';
});

// Summary Modal Logic
const summaryModal = document.getElementById('summary-modal');
const closeSummaryBtn = document.getElementById('close-summary');

submitBtn?.addEventListener('click', () => {
  // Mock data — replace with real scoring and time logic
  document.getElementById('score').textContent = '8 / 10';
  document.getElementById('avg-time').textContent = '48s';
  document.getElementById('feedback').textContent = 'Great job! You’re almost there.';

  summaryModal.style.display = 'flex';
});

closeSummaryBtn?.addEventListener('click', () => {
  summaryModal.style.display = 'none';
});
