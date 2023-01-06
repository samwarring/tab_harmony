// Default options
let options = {
    enableSort: true,
    enableGroups: true,
    groupThreshold: 4,
    groupColors: new Map([
        ["google", "blue"],
        ["stackoverflow", "orange"],
        ["duckduckgo", "red"],
    ])
};

const defaultGroupColors = new Map([
    ["google", "blue"],
    ["stackoverflow", "orange"],
    ["duckduckgo", "red"],
]);

const controller = {
    enableSort: async function(isEnabled) {
        options.enableSort = isEnabled;
        this.storeOptions();
    },

    enableGroups: async function(isEnabled) {
        options.enableGroups = isEnabled;
        this.storeOptions();
    },

    decreaseGroupThreshold: async function() {
        if (options.groupThreshold > 2) {
            options.groupThreshold--;
            this.storeOptions();
        }
    },

    increaseGroupThreshold: async function() {
        if (options.groupThreshold < 99) {
            options.groupThreshold++;
            this.storeOptions();
        }
    },

    addGroupColor: async function(groupName, color) {
        if (groupName) {
            options.groupColors.set(groupName, color);
            // TODO: Persist options
        }
    },

    removeGroupColor: async function(groupName) {
        if (groupName) {
            options.groupColors.delete(groupName);
            // TODO: Persist options
        }
    },

    loadOptions: async function() {
        //await chrome.storage.sync.clear();
        const data = await chrome.storage.sync.get("options");
        Object.assign(options, data.options);
        if (!(options.groupColors instanceof Map)) {
            options.groupColors = new Map();
        }
        console.log("LOAD OPTIONS:", options);
    },

    storeOptions: async function() {
        if (!(options.groupColors instanceof Map)) {
            options.groupColors = new Map();
        }
        console.log("STORE OPTIONS:", options);
        chrome.storage.sync.set({ options });
    },
};

const ui = {
    collator: new Intl.Collator(),
    enableSort: document.getElementById("enableSort"),
    enableGroups: document.getElementById("enableGroups"),
    groupThreshold: document.getElementById("groupThreshold"),
    decreaseGroupThreshold: document.getElementById("decreaseGroupThreshold"),
    increaseGroupThreshold: document.getElementById("increaseGroupThreshold"),
    newGroupColorAdd: document.getElementById("newGroupColorAdd"),
    newGroupColorColor: document.getElementById("newGroupColorColor"),
    newGroupColorName: document.getElementById("newGroupColorName"),
    groupColorList: document.getElementById("groupColorList"),
    groupColorTemplate: document.getElementById("groupColorTemplate"),

    updateAll: function() {
        this.enableSort.checked = options.enableSort;
        this.enableGroups.checked = options.enableGroups;
        this.groupThreshold.textContent = String(options.groupThreshold);
        this.updateGroupColorSelect();
        this.updateGroupColors();
    },

    updateGroupColorSelect: function() {
        const value = this.newGroupColorColor.value;
        const color = "var(--color-tab-" + value + ")";
        this.newGroupColorColor.style.backgroundColor = color;
    },

    updateGroupColors: function() {
        this.groupColorList.textContent = '';
        const entries = Array.from(options.groupColors.entries());
        entries.sort((e1, e2) => this.collator.compare(e1[0], e2[0]));
        for (const groupColor of entries) {
            const groupName = groupColor[0];
            const color = groupColor[1];
            this.addGroupColor(groupName, color);
        }
    },

    addGroupColor: function(groupName, color) {
        const listItem = this.groupColorTemplate.content.firstElementChild.cloneNode(true);
        const button = listItem.querySelector("input[type='button']");
        const label = listItem.querySelector("label");
        label.textContent = groupName;
        label.classList.add(color);
        this.groupColorList.append(listItem);

        button.addEventListener("click", () => {
            controller.removeGroupColor(groupName);
            this.groupColorList.removeChild(listItem);
        });
    },

    addEventListeners: function() {
        this.enableSort.addEventListener("change", async (event) => {
            await controller.enableSort(event.target.checked);
        });
        this.enableGroups.addEventListener("change", async (event) => {
            await controller.enableGroups(event.target.checked);
        });
        this.decreaseGroupThreshold.addEventListener("click", async () => {
            await controller.decreaseGroupThreshold();
            this.groupThreshold.textContent = String(options.groupThreshold);
        });
        this.increaseGroupThreshold.addEventListener("click", async () => {
            await controller.increaseGroupThreshold();
            this.groupThreshold.textContent = String(options.groupThreshold);
        });
        this.newGroupColorColor.addEventListener("change", (event) => {
            this.updateGroupColorSelect();
        });
        this.newGroupColorAdd.addEventListener("click", async () => {
            const groupName = this.newGroupColorName.value;
            const color = this.newGroupColorColor.value;
            await controller.addGroupColor(groupName, color);
            this.updateGroupColors();
        });
    }
};

await controller.loadOptions();
ui.updateAll();
ui.addEventListeners();