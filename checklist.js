let baseData = {};
let savedData = {};

async function loadBaseJSON() {
    const res = await fetch("checklist.json");
    baseData = await res.json();
    savedData = JSON.parse(localStorage.getItem("checklistState") || "{}");
    mergeBaseIntoSaved();
    render();
}

function mergeBaseIntoSaved() {
    Object.keys(baseData).forEach(section => {
        if (!savedData[section]) savedData[section] = {};
        baseData[section].forEach(item => {
            if (!(item in savedData[section])) savedData[section][item] = false;
        });
    });
    localStorage.setItem("checklistState", JSON.stringify(savedData));
}

function saveState() {
    localStorage.setItem("checklistState", JSON.stringify(savedData));
}

function render() {
    const container = document.getElementById("checklist");
    container.innerHTML = "";

    Object.keys(savedData).forEach(section => {
        const div = document.createElement("div");
        div.className = "bg-white p-6 rounded-lg shadow space-y-4";

        const h2 = document.createElement("h2");
        h2.textContent = section;
        h2.className = "text-xl font-semibold border-l-4 border-blue-500 pl-3";
        div.appendChild(h2);

        Object.keys(savedData[section]).forEach(item => {
            const row = document.createElement("div");
            row.className = "flex justify-between items-center";

            const left = document.createElement("div");
            left.className = "flex items-center space-x-3";

            const box = document.createElement("input");
            box.type = "checkbox";
            box.checked = savedData[section][item];
            box.className = "h-5 w-5 text-blue-600 rounded";
            box.onchange = () => {
                savedData[section][item] = box.checked;
                saveState();
                span.className = box.checked ? "line-through text-gray-400" : "";
            };

            const span = document.createElement("span");
            span.textContent = item;
            span.className = savedData[section][item] ? "line-through text-gray-400" : "";

            left.appendChild(box);
            left.appendChild(span);

            const del = document.createElement("button");
            del.textContent = "✕";
            del.className = "text-white bg-red-500 hover:bg-red-600 rounded px-2 py-1";
            del.onclick = () => {
                delete savedData[section][item];
                saveState();
                render();
            };

            row.appendChild(left);
            row.appendChild(del);
            div.appendChild(row);
        });

        // Add new item box
        const addBox = document.createElement("div");
        addBox.className = "flex space-x-2";

        const input = document.createElement("input");
        input.placeholder = "Add new item…";
        input.className = "flex-1 p-2 border border-gray-300 rounded";

        const btn = document.createElement("button");
        btn.textContent = "+";
        btn.className = "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700";
        btn.onclick = () => {
            const val = input.value.trim();
            if (!val) return;
            savedData[section][val] = false;
            saveState();
            render();
        };

        addBox.appendChild(input);
        addBox.appendChild(btn);
        div.appendChild(addBox);

        container.appendChild(div);
    });
}

loadBaseJSON();
