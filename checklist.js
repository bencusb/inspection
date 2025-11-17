let savedData = {};

async function loadChecklistJSON() {
    const res = await fetch("checklist.json");
    savedData = await res.json();
    // Load any localStorage overrides
    const localStorage_data = localStorage.getItem("checklistState");
    if (localStorage_data) {
        savedData = JSON.parse(localStorage_data);
    }
    render();
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
            del.className = "delete-btn text-white bg-red-500 hover:bg-red-600 rounded px-2 py-1";
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
        addBox.className = "add-item-form flex space-x-2";

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

// Export functionality
function exportState() {
    const dataToExport = {
        timestamp: new Date().toISOString(),
        state: savedData
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `checklist-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Import functionality
function importState() {
    document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            const importedState = imported.state || imported;
            savedData = importedState;
            saveState();
            render();
            alert("Checklist imported successfully!");
        } catch (err) {
            alert("Error importing file: " + err.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = "";
});

// Setup event listeners
document.getElementById("exportBtn").addEventListener("click", exportState);
document.getElementById("importBtn").addEventListener("click", importState);

loadChecklistJSON();
