// Show subcategories for the selected main category
function showCategory(category) {
  // Hide main category section
  document.getElementById('main-categories').classList.add('hidden');

  // Show the selected subcategory section
  const subcategoryId = category + '-subcategories';
  document.getElementById(subcategoryId).classList.remove('hidden');
}

// Go back to main categories from any subcategory
function goBack() {
  // Show main categories
  document.getElementById('main-categories').classList.remove('hidden');

  // Hide all subcategory sections (in case of future additions)
  const allSubcategories = document.querySelectorAll('.test-section');
  allSubcategories.forEach(section => {
    if (section.id !== 'main-categories') {
      section.classList.add('hidden');
    }
  });
}

function startQuiz(category, level) {
  // Save selection to localStorage
  localStorage.setItem('quizCategory', category);
  localStorage.setItem('quizLevel', level);
  // Redirect to the quiz page
  window.location.href = 'quiz.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.subcategory-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.getAttribute('data-category');
      localStorage.setItem('quizCategory', selectedCategory);
      window.location.href = 'quiz.html';
    });
  });
});