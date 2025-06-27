// Copies the hidden prompt to clipboard
function copyPrompt() {
  const prompt = document.getElementById("hiddenPrompt");
  prompt.style.display = "block";
  prompt.select();
  prompt.setSelectionRange(0, 99999);
  document.execCommand("copy");
  prompt.style.display = "none";
  alert("✅ Prompt copied to clipboard! Paste it into ChatGPT.");
}

// Parses and formats the pasted quiz from editable container
function generateQuiz() {
  const rawInput = document.getElementById("quiz-container").innerText.trim();
  const regex = /Q\d+:\(([^()]+::[^()]+\?)\)A\d+\((A\.[^,]+,B\.[^,]+,C\.[^,]+,D\.[^)]+)\)/g;

  let match;
  const questions = [];
  let index = 1;

  while ((match = regex.exec(rawInput)) !== null) {
    const prompt = match[1]
      .replace(/::/, " :: ")
      .replace(/\\:/g, ":")
      .replace(/:/g, ": ");

    const choices = match[2].split(",").map(choice => choice.split(".")[1]);
    questions.push(new AnalogyQuestion(prompt, choices));
  }

  if (questions.length === 0) {
    alert("❌ Invalid input. Make sure you pasted the ChatGPT response using the correct prompt format.");
    return;
  }

  const output = questions.map((q, i) => q.render(i + 1)).join("");
  document.getElementById("quiz-container").innerHTML = output;
}

class AnalogyQuestion {
  constructor(prompt, choices) {
    this.prompt = prompt;
    this.choices = choices;
  }

  render(index) {
    const letters = ['A', 'B', 'C', 'D'];
    const choiceHtml = this.choices.map((text, i) => {
      const letter = letters[i];
      return `<label class="choice"><input type="radio" name="q${index}" value="${letter}">${letter}. ${text}</label>`;
    }).join("");
    return `<div class="question-block"><p><strong>${index}. ${this.prompt}</strong></p>${choiceHtml}</div>`;
  }
}
