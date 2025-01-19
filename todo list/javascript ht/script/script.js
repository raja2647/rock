function deleteItem(event){
    event.target.parentElement.remove(event);
    updateLocalStorage();
}

//to add task taskName,taskDescription,taskStatus
var container = document.querySelector(".container");
var addtask = document.getElementById("addTask");
var taskname = document.getElementById("taskName");
var taskstatus = document.getElementById("taskStatus");
var taskdescription = document.getElementById("taskDescription");
var taskDate = document.getElementById("taskDate");
let taskToEdit = null;

addtask.addEventListener("click", function(event) {
    event.preventDefault();
    if (!taskname.value.trim() || !taskdescription.value.trim() || !taskDate.value.trim()) {
        alert("Please fill out all fields!");
        return;
    }
    if (taskToEdit) {
        // Update the task card
        const statusClassMap = {
            "New": "bg-success",
            "In Progress": "bg-primary",
            "Completed": "bg-secondary",
            "Canceled": "bg-danger"
            
        };        
        const badge = taskToEdit.querySelector('.badge');
        taskToEdit.querySelector('h1').innerText = taskname.value;
        taskToEdit.querySelector('p').innerText = taskdescription.value;

        // Update task status and badge color
        const newStatus = taskstatus.value;
        badge.innerText = newStatus;

        // Update the date
        const dateElement = taskToEdit.querySelector('p:nth-of-type(2)');
        dateElement.innerHTML = `<strong>Date:</strong> ${taskDate.value}`;

        // Remove the old badge class and add the new one
        badge.className = `badge rounded-pill ${statusClassMap[newStatus]}`;
        // Clear the global variable
        taskToEdit = null;
    } else {
        createTaskElement(taskname.value, taskdescription.value, taskstatus.value, taskDate.value);
        // Update local storage
    }
    updateLocalStorage();
    taskname.value = '';
    taskdescription.value = '';
    taskstatus.value = 'New';
    taskDate.value = "";
});

// Call loadTasksFromLocalStorage on page load
window.onload = loadTasksFromLocalStorage;

function editTask(event) {
    // Find the task card
    taskToEdit = event.target.parentElement;

    // Populate modal fields with current values
    const taskName = taskToEdit.querySelector('h1').innerText;
    const taskDescription = taskToEdit.querySelector('p').innerText;
    const taskStatus = taskToEdit.querySelector('.badge').innerText;
    const taskDateValue = taskToEdit.querySelector('p:nth-of-type(2)').innerText.replace("Date: ", "");

    // Set values in the modal
    document.getElementById('taskName').value = taskName;
    document.getElementById('taskDescription').value = taskDescription;
    document.getElementById('taskStatus').value = taskStatus;
    document.getElementById('taskDate').value = taskDateValue;

    // Show the modal
    const editModal = new bootstrap.Modal(document.getElementById('addTaskModal'));
    editModal.show();
}

document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
});

function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    container.innerHTML = ''; 
    tasks.forEach(task => {
        createTaskElement(task.name, task.description, task.status, task.date);
    });
    return tasks;
}

function updateLocalStorage() {
    const taskElements = document.querySelectorAll('.task-container');
    const tasks = Array.from(taskElements).map(task => ({
        name: task.querySelector('h1').innerText,
        description: task.querySelector('p').innerText,
        status: task.querySelector('.badge').innerText,
        date: task.querySelector('p:nth-of-type(2)').innerText.replace("Date: ", "")
    }));
    saveTasksToLocalStorage(tasks);
}

function saveTasksToLocalStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function createTaskElement(name, description, status, date) {
    const div = document.createElement('div');
    div.setAttribute('class', 'task-container');
    const statusClassMap = {
        "New": "bg-success",
        "In Progress": "bg-primary",
        "Completed": "bg-secondary",
        "Canceled": "bg-danger"
    };
    const statusClass = statusClassMap[status] || "bg-success";
    div.innerHTML = `
        <div class="heading">
            <h1>${name}</h1>
            <span class="badge rounded-pill ${statusClass}">${status}</span>
        </div>
        <p>${description}</p>
        <p><strong>Date:</strong> ${date}</p>
        <button type="button" onclick="deleteItem(event)" class="btn btn-secondary">Delete</button>
        <button type="button" onclick="editTask(event)" class="btn btn-primary">Edit</button>
    `;
    container.append(div);
}
