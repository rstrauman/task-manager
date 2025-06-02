
const taskList = document.getElementById("myTaskList");
const addButton = document.getElementById("Submit");
const taskInput = document.getElementById("insertTask");

// Load tasks from localStorage on page load
window.onload = function () {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    const tasks = JSON.parse(savedTasks);
    tasks.forEach((task) => createTaskElement(task));
  }
};

// Save all tasks to localStorage
function saveTasks() {
  const tasks = [];

  taskList.querySelectorAll("li").forEach((listItem) => {
    const text = listItem.querySelector(".task-text").textContent;
    const checkBtn = document.body.querySelector(
      `.checkmark[data-task-id='${listItem.dataset.id}']`
    );
    const checked = checkBtn ? checkBtn.textContent === "☑" : false;

    const descs = [];
    listItem.querySelectorAll(".description-text").forEach((descElem) => {
      descs.push(descElem.textContent);
    });

    tasks.push({
      text,
      checked,
      descriptions: descs,
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

let taskIdCounter = 0;

// Creates a single task element and appends to the list
function createTaskElement(task) {
  const listItem = document.createElement("li");
  listItem.className = "task-item";
  listItem.dataset.id = taskIdCounter++;

  const taskRow = document.createElement("div");
  taskRow.className = "task-wrapper";

  const taskText = document.createElement("span");
  taskText.textContent = task.text;
  taskText.className = "task-text";

  const checkBtn = document.createElement("span");
  checkBtn.className = "checkmark";
  checkBtn.dataset.taskId = listItem.dataset.id;
  checkBtn.textContent = task.checked ? "☑" : "☐";
  checkBtn.style.color = task.checked ? "green" : "white";

  taskRow.appendChild(taskText);
  taskRow.appendChild(moveTaskButton("up", listItem));
  taskRow.appendChild(moveTaskButton("down", listItem));
  taskRow.appendChild(removeTaskButton(listItem));

  listItem.appendChild(taskRow);
  taskList.appendChild(listItem);

  document.body.appendChild(checkBtn);
  positionCheckbox(checkBtn, taskRow);

  window.addEventListener("scroll", () => positionCheckbox(checkBtn, taskRow));
  window.addEventListener("resize", () => positionCheckbox(checkBtn, taskRow));

  checkBtn.onclick = () => {
    if (checkBtn.textContent === "☑") {
      checkBtn.textContent = "☐";
      checkBtn.style.color = "white";
    } else {
      checkBtn.textContent = "☑";
      checkBtn.style.color = "green";
    }
    saveTasks();
  };

  taskText.onclick = () => addDescription(listItem);

  // Add previously saved descriptions and make them editable
  if (task.descriptions) {
    task.descriptions.forEach((desc) => {
      const descText = createDescriptionElement(desc, listItem);
      listItem.appendChild(descText);
    });
  }
}

// Positions checkbox visually near the task
function positionCheckbox(checkBtn, taskRow) {
  const rect = taskRow.getBoundingClientRect();
  checkBtn.style.top = rect.top + rect.height / 2 - checkBtn.offsetHeight / 2 + "px";
  checkBtn.style.right = "1em";
}

// Handle new task submission
addButton.onclick = function () {
  const myText = taskInput.value.trim();
  if (myText === "") return;

  const taskObj = {
    text: myText,
    checked: false,
    descriptions: [],
  };

  createTaskElement(taskObj);
  taskInput.value = "";

  const lastTask = taskList.lastChild;
  addDescription(lastTask);

  saveTasks();
};

// === NEW ===
// Helper to create a description element with editing support
function createDescriptionElement(text, listItem) {
  const descText = document.createElement("div");
  descText.textContent = text;
  descText.className = "description-text";
  descText.style.marginLeft = "1.5em";

  // When clicked, swap to edit mode
  descText.onclick = () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = text;
    input.className = "description-edit-input";
    input.style.marginLeft = "1.5em";
    input.style.marginTop = "0.5em";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "description-save-btn";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "description-close-btn";

    const editContainer = document.createElement("div");
    editContainer.appendChild(input);
    editContainer.appendChild(saveBtn);
    editContainer.appendChild(cancelBtn);
    editContainer.style.marginLeft = "1.5em";

    listItem.replaceChild(editContainer, descText);

    saveBtn.onclick = () => {
      const newText = input.value.trim();
      if (newText.length > 0) {
        const newDescText = createDescriptionElement(newText, listItem);
        listItem.replaceChild(newDescText, editContainer);
        saveTasks();
      } else {
        listItem.replaceChild(descText, editContainer);
      }
    };

    cancelBtn.onclick = () => {
      listItem.replaceChild(descText, editContainer);
    };
  };

  return descText;
}

// Handles new description input UI
function addDescription(listItem) {
  const descContainer = document.createElement("div");
  descContainer.style.marginLeft = "1.5em";
  descContainer.style.marginTop = "0.5em";

  const descInput = document.createElement("input");
  descInput.type = "text";
  descInput.placeholder = "Add description";
  descInput.className = "description-input";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.className = "description-save-btn";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.className = "description-close-btn";

  descContainer.appendChild(descInput);
  descContainer.appendChild(saveBtn);
  descContainer.appendChild(closeBtn);

  listItem.appendChild(descContainer);
  descInput.focus();

  saveBtn.onclick = () => {
    const val = descInput.value.trim();
    if (val.length > 0) {
      const descText = createDescriptionElement(val, listItem);
      listItem.appendChild(descText);
      saveTasks();
    }
    descContainer.remove();
  };

  closeBtn.onclick = () => {
    descContainer.remove();
  };
}

// Deletes a task and its checkbox
function removeTaskButton(listItem) {
  const removeTaskBtn = document.createElement("button");
  removeTaskBtn.textContent = "🗑️";
  removeTaskBtn.className = "remove-task-btn";
  removeTaskBtn.style.marginLeft = "0.5em";

  removeTaskBtn.onclick = () => {
    const checkBtn = document.querySelector(`.checkmark[data-task-id='${listItem.dataset.id}']`);
    if (checkBtn) checkBtn.remove();

    if (listItem && listItem.remove) {
      listItem.remove();
    }

    saveTasks();
  };

  return removeTaskBtn;
}

// Moves a task up or down the list
function moveTaskButton(direction, listItem) {
  const btn = document.createElement("button");
  btn.textContent = direction === "up" ? "⬆️" : "⬇️";
  btn.className = `move-task-${direction}-btn`;
  btn.style.marginLeft = "0.5em";

  btn.onclick = () => {
    if (direction === "up" && listItem.previousElementSibling) {
      taskList.insertBefore(listItem, listItem.previousElementSibling);
    } else if (direction === "down") {
      const next = listItem.nextElementSibling;
      if (next) {
        taskList.insertBefore(next, listItem);
      }
    }

    const checkBtn = document.querySelector(`.checkmark[data-task-id='${listItem.dataset.id}']`);
    if (checkBtn) {
      const taskRow = listItem.querySelector(".task-wrapper");
      positionCheckbox(checkBtn, taskRow);
    }

    saveTasks();
  };

  return btn;
}

