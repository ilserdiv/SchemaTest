function showSubcategories(subject) {
  if (subject === "english") {
    document.getElementById("main-categories").style.display = "none";
    document.getElementById("english-subcategories").style.display = "flex";
  }
}

function goBackToMain() {
  document.getElementById("english-subcategories").style.display = "none";
  document.getElementById("main-categories").style.display = "flex";
}