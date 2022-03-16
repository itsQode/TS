interface Validatable {
  value: String | Number;
  required?: Boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function AutoBind(_: any, _2: string | symbol, descriptor: PropertyDescriptor) {
  const orjMethod = descriptor.value;
  const adjMethod: PropertyDescriptor = {
    configurable: true,
    get() {
      const FN = orjMethod.bind(this);
      return FN;
    },
  };
  return adjMethod;
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = <HTMLTemplateElement>document.getElementById("project-input")!;
    this.hostElement = <HTMLDivElement>document.getElementById("app")!;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = <HTMLFormElement>importedNode.firstElementChild;
    this.element.id = "user-input";

    this.titleInputElement = <HTMLInputElement>this.element.querySelector("#title");
    this.descriptionInputElement = <HTMLInputElement>this.element.querySelector("#description");
    this.peopleInputElement = <HTMLInputElement>this.element.querySelector("#people");

    this._configure();
    this._attach();
  }
  private _attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

  private _validate(validatableInput: Validatable) {
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

  private _gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescripton = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const validateTitle: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const validateDescription: Validatable = {
      value: enteredDescripton,
      required: true,
      minLength: 5,
    };
    const validatePeople: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };
    if (!this._validate(validateTitle) || !this._validate(validateDescription) || !this._validate(validatePeople)) {
      alert("مقادیر خواسته شده را درست وارد کنید");
      return;
    } else {
      return [enteredTitle, enteredDescripton, +enteredPeople];
    }
  }

  private _clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @AutoBind
  private _submitHandler(event: Event) {
    event.preventDefault();
    console.log("hi");
    const userInput = this._gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      console.log(title, description, people);
      this._clearInputs();
    }
  }
  private _configure() {
    this.element.addEventListener("submit", this._submitHandler);
  }
}
const prjInput = new ProjectInput();
