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
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById("project-input");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = "user-input";
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this._configure();
        this._attach();
    }
    _attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
    _validate(validatableInput) {
        let isValid = true;
        if (validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        }
        if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
            isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
        }
        if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
            isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
        }
        if (validatableInput.min != null && typeof validatableInput.value === "number") {
            isValid = isValid && validatableInput.value >= validatableInput.min;
        }
        if (validatableInput.max != null && typeof validatableInput.value === "number") {
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
        if (!this._validate(validateTitle) || !this._validate(validateDescription) || !this._validate(validatePeople)) {
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
            console.log(title, description, people);
            this._clearInputs();
        }
    }
    _configure() {
        this.element.addEventListener("submit", this._submitHandler);
    }
}
__decorate([
    AutoBind
], ProjectInput.prototype, "_submitHandler", null);
const prjInput = new ProjectInput();
