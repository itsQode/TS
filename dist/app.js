"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function AutoBind(_, _2, descriptor) {
    const orjMethod = descriptor.value;
    const adjMethod = {
        configurable: true,
        get() {
            const FN = orjMethod.bind(this);
            return FN;
        },
    };
    return adjMethod;
}
//************************************************ Class Component *****************************************/
// Component Base Class
class Component {
    constructor(templateID, hostElementID, insertAtStart, newElementID) {
        this.templateElement = document.getElementById(templateID);
        this.hostElement = document.getElementById(hostElementID);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementID) {
            this.element.id = newElementID;
        }
        this._attach(insertAtStart);
    }
    _attach(insertAtBegging) {
        this.hostElement.insertAdjacentElement(insertAtBegging ? "afterbegin" : "beforeend", this.element);
    }
}
//************************************************ Class ProjectInput *****************************************/
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
    }
    _validate(validatableInput) {
        let isValid = true;
        if (validatableInput.required) {
            isValid =
                isValid && validatableInput.value.toString().trim().length !== 0;
        }
        if (validatableInput.minLength != null &&
            typeof validatableInput.value === "string") {
            isValid =
                isValid && validatableInput.value.length >= validatableInput.minLength;
        }
        if (validatableInput.maxLength != null &&
            typeof validatableInput.value === "string") {
            isValid =
                isValid && validatableInput.value.length <= validatableInput.maxLength;
        }
        if (validatableInput.min != null &&
            typeof validatableInput.value === "number") {
            isValid = isValid && validatableInput.value >= validatableInput.min;
        }
        if (validatableInput.max != null &&
            typeof validatableInput.value === "number") {
            isValid = isValid && validatableInput.value <= validatableInput.max;
        }
        return isValid;
    }
    _gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescripton = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        const validateTitle = {
            value: enteredTitle,
            required: true,
        };
        const validateDescription = {
            value: enteredDescripton,
            required: true,
            minLength: 5,
        };
        const validatePeople = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5,
        };
        if (!this._validate(validateTitle) ||
            !this._validate(validateDescription) ||
            !this._validate(validatePeople)) {
            alert("مقادیر خواسته شده را درست وارد کنید");
            return;
        }
        else {
            return [enteredTitle, enteredDescripton, +enteredPeople];
        }
    }
    _clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
    _submitHandler(event) {
        event.preventDefault();
        console.log("hi");
        const userInput = this._gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this._clearInputs();
        }
    }
    configure() {
        this.element.addEventListener("submit", this._submitHandler);
    }
    renderContent() { }
}
__decorate([
    AutoBind
], ProjectInput.prototype, "_submitHandler", null);
//************************************************ enum *****************************************/
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
//************************************************ Project *****************************************/
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(ListerenFN) {
        this.listeners.push(ListerenFN);
    }
}
//************************************************ ProjectState *****************************************/
class ProjectState extends State {
    // baraye listener haai ke be in class vabastean
    constructor() {
        super();
        // baraye zakhire tamame proje ha
        this._projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, people) {
        const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.Active);
        this._projects.push(newProject);
        this._updateListeners();
    }
    moveProject(projectID, newStatus) {
        const project = this._projects.find((prj) => prj.id === projectID);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this._updateListeners();
        }
    }
    _updateListeners() {
        for (const listenFn of this.listeners) {
            listenFn(this._projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
//************************************************ ProjectItem *****************************************/
class ProjectItem extends Component {
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    dragStartHandler(event) {
        event.dataTransfer.setData("text/plain", this.project.id);
        event.dataTransfer.effectAllowed = "move";
    }
    dragEndHandler(_) {
        console.log("dragEnd");
    }
    get persons() {
        if (this.project.people === 1) {
            return "1 person";
        }
        else {
            return `${this.project.people} person`;
        }
    }
    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.persons + " assigned.";
        this.element.querySelector("p").textContent = this.project.description;
    }
}
__decorate([
    AutoBind
], ProjectItem.prototype, "dragStartHandler", null);
//************************************************ ProjectList *****************************************/
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjcets = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listEl = this.element.querySelector("ul");
            listEl.classList.add("droppable");
        }
    }
    dropHandler(event) {
        const prjID = event.dataTransfer.getData("text/plain");
        projectState.moveProject(prjID, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
    }
    dragLeaveHandler(event) {
        const listEl = this.element.querySelector("ul");
        listEl.classList.remove("droppable");
    }
    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);
        projectState.addListener((projects) => {
            const revlantProjects = projects.filter((prj) => {
                if (this.type === "active") {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            this.assignedProjcets = revlantProjects;
            this._renderProjects();
        });
    }
    _renderProjects() {
        const listEl = document.getElementById(`${this.type}-project-list`);
        listEl.innerHTML = "";
        for (const prjItem of this.assignedProjcets) {
            new ProjectItem(this.element.querySelector("ul").id, prjItem);
        }
    }
    renderContent() {
        const listId = `${this.type}-project-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent =
            this.type.toUpperCase() + " PROJECTS";
    }
}
__decorate([
    AutoBind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    AutoBind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    AutoBind
], ProjectList.prototype, "dragLeaveHandler", null);
const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
