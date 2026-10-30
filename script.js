
// ===============================
// SELECT HTML ELEMENTS
// ===============================

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

const totalCount = document.getElementById("total-count");
const activeCount = document.getElementById("active-count");
const completedCount = document.getElementById("completed-count");

const emptyState = document.getElementById("empty-state");
const clearCompletedBtn = document.getElementById("clear-completed");

const filterButtons = document.querySelectorAll(".filter-btn");


// ===============================
// APPLICATION STATE
// ===============================

let tasks = [];

let currentFilter = "all";

const STORAGE_KEY = "my-todo-tasks";


// ===============================
// LOAD TASKS FROM LOCAL STORAGE
// ===============================

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);

            if (Array.isArray(parsedTasks)) {
                tasks = parsedTasks.filter(task =>
                    task &&
                    typeof task.id === "string" &&
                    typeof task.text === "string" &&
                    typeof task.completed === "boolean"
                );
            }
        }
    } catch (error) {
        console.error("Unable to load tasks:", error);
        tasks = [];
    }
}


// ===============================
// SAVE TASKS TO LOCAL STORAGE
// ===============================

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Unable to save tasks:", error);
        alert("Tasks could not be saved. Check your browser storage.");
    }
}


// ===============================
// ADD NEW TASK
// ===============================

function addTask(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        taskInput.focus();
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();

    taskInput.value = "";

    currentFilter = "all";

    updateFilterButtons();
    renderTasks();

    taskInput.focus();
}


// ===============================
// DISPLAY TASKS
// ===============================

function renderTasks() {

    taskList.innerHTML = "";

    // Filter tasks
    let filteredTasks = tasks.filter(task => {

        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });


    // Display each task
    filteredTasks.forEach(task => {

        const li = document.createElement("li");

        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }


        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;

        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as ${task.completed ? "active" : "completed"}`
        );


        // Task text
        const paragraph = document.createElement("p");

        paragraph.className = "task-text";
        paragraph.textContent = task.text;


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.setAttribute(
            "aria-label",
            `Delete task: ${task.text}`
        );


        // Add elements to task item
        li.appendChild(checkbox);
        li.appendChild(paragraph);
        li.appendChild(deleteButton);

        // Store task ID for event handling
        li.dataset.id = task.id;

        taskList.appendChild(li);

    });


    // Empty state
    emptyState.classList.toggle(
        "hidden",
        filteredTasks.length > 0
    );

    // Update statistics
    updateStats();
}


// ===============================
// UPDATE TASK STATISTICS
// ===============================

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const active = total - completed;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;

}


// ===============================
// COMPLETE / UNCOMPLETE TASK
// ===============================

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;

    });

    saveTasks();
    renderTasks();

}


// ===============================
// DELETE TASK
// ===============================

function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();

}


// ===============================
// FILTER TASKS
// ===============================

function filterTasks(filter) {

    currentFilter = filter;

    updateFilterButtons();

    renderTasks();

}


// ===============================
// UPDATE FILTER BUTTON STYLES
// ===============================

function updateFilterButtons() {

    filterButtons.forEach(button => {

        const isActive =
            button.dataset.filter === currentFilter;

        button.classList.toggle("active", isActive);

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );

    });

}


// ===============================
// CLEAR COMPLETED TASKS
// ===============================

function clearCompletedTasks() {

    tasks = tasks.filter(
        task => !task.completed
    );

    saveTasks();

    renderTasks();

}


// ===============================
// EVENT LISTENERS
// ===============================

// Add task
taskForm.addEventListener("submit", addTask);


// Filter buttons
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterTasks(button.dataset.filter);

    });

});


// Checkbox and delete button
taskList.addEventListener("click", event => {

    const taskItem = event.target.closest(".task-item");

    if (!taskItem) return;

    const id = taskItem.dataset.id;

    if (event.target.classList.contains("task-checkbox")) {
        toggleTask(id);
    }

    if (event.target.classList.contains("delete-btn")) {
        deleteTask(id);
    }

});


// Clear completed
clearCompletedBtn.addEventListener(
    "click",
    clearCompletedTasks
);


// ===============================
// INITIALIZE APPLICATION
// ===============================

loadTasks();

renderTasks();

updateFilterButtons();
