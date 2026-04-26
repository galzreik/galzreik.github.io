// Interaction 1: Page load event (runs when the page loads)
window.addEventListener("load", function() {

  // Get greeting element
  let greeting = document.getElementById("greeting");

  // Get current hour
  let currentHour = new Date().getHours();

  // Change greeting based on time
  if (currentHour < 12) {
    greeting.textContent = "Good morning! Ready to plan your study day?";
  } 
  else if (currentHour < 18) {
    greeting.textContent = "Good afternoon! Keep going, you are doing great.";
  } 
  else {
    greeting.textContent = "Good evening! Time for a cozy study session.";
  }
});


// Interaction 2: Click event for dark mode
document.getElementById("darkBtn").addEventListener("click", function() {

  // Add dark mode class to body
  document.body.classList.add("dark-mode");
});


// Interaction 3: Click event for light mode
document.getElementById("lightBtn").addEventListener("click", function() {

  // Remove dark mode class
  document.body.classList.remove("dark-mode");
});


// Interaction 4: Input event when user types in text box
document.getElementById("taskInput").addEventListener("input", function() {

  // Show typing message
  document.getElementById("typingMessage").textContent = "Typing a new study task...";
});


// Interaction 5: Click event to add a task
document.getElementById("addTaskBtn").addEventListener("click", function() {

  let taskInput = document.getElementById("taskInput");
  let taskList = document.getElementById("taskList");

  // Check if input is not empty
  if (taskInput.value !== "") {

    // Create new list item
    let newTask = document.createElement("li");

    // Set task text
    newTask.textContent = taskInput.value;

    // Add to list
    taskList.appendChild(newTask);

    // Clear input box
    taskInput.value = "";

    // Show success message
    document.getElementById("typingMessage").textContent = "Task added successfully!";
  } 
  else {
    document.getElementById("typingMessage").textContent = "Please type a task first.";
  }
});


// Interaction 6: Hover event (mouseover)
document.getElementById("hoverCard").addEventListener("mouseover", function() {

  // Add hover style
  document.getElementById("hoverCard").classList.add("hover-active");

  // Change text
  document.getElementById("hoverText").textContent = "Reminder: Take breaks while studying!";
});


// Interaction 7: Mouseout event (when mouse leaves)
document.getElementById("hoverCard").addEventListener("mouseout", function() {

  // Remove hover style
  document.getElementById("hoverCard").classList.remove("hover-active");

  // Reset text
  document.getElementById("hoverText").textContent = "Move your mouse over this card to see a study reminder.";
});


// Interaction 8: Click event to change motivational quote
document.getElementById("quoteBtn").addEventListener("click", function() {

  let quotes = [
    "Small progress is still progress.",
    "You do not have to finish everything at once.",
    "Focus on one task at a time.",
    "You are closer than you think."
  ];

  // Pick random quote
  let randomIndex = Math.floor(Math.random() * quotes.length);

  // Update text
  document.getElementById("quoteText").textContent = quotes[randomIndex];
});