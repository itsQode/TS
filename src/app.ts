interface Validatable {
  value: String | Number;
  required?: Boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}
// Drag and Drop Interfaces
interface IDraggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}
interface IDragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
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

//************************************************ Class Component *****************************************/
// Component Base Class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;
  constructor(
    templateID: string,
    hostElementID: string,
    insertAtStart: boolean,
    newElementID?: string
  ) {
    this.templateElement = document.getElementById(
      templateID
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementID)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementID) {
      this.element.id = newElementID;
    }

    this._attach(insertAtStart);
  }
  private _attach(insertAtBegging: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBegging ? "afterbegin" : "beforeend",
      this.element
    );
  }
  abstract configure(): void;
  abstract renderContent(): void;
}

//************************************************ Class ProjectInput *****************************************/
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  private _validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
      isValid =
        isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (
      validatableInput.minLength != null &&
      typeof validatableInput.value === "string"
    ) {
      isValid =
        isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (
      validatableInput.maxLength != null &&
      typeof validatableInput.value === "string"
    ) {
      isValid =
        isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (
      validatableInput.min != null &&
      typeof validatableInput.value === "number"
    ) {
      isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (
      validatableInput.max != null &&
      typeof validatableInput.value === "number"
    ) {
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
    if (
      !this._validate(validateTitle) ||
      !this._validate(validateDescription) ||
      !this._validate(validatePeople)
    ) {
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
      projectState.addProject(title, description, people);
      this._clearInputs();
    }
  }
  configure() {
    this.element.addEventListener("submit", this._submitHandler);
  }
  renderContent(): void {}
}
//************************************************ enum *****************************************/
enum ProjectStatus {
  Active,
  Finished,
}

//************************************************ Project *****************************************/
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (item: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(ListerenFN: Listener<T>) {
    this.listeners.push(ListerenFN);
  }
}

//************************************************ ProjectState *****************************************/
class ProjectState extends State<Project> {
  // baraye zakhire tamame proje ha
  private _projects: Project[] = [];
  // baraye sakhte singelton
  private static instance: ProjectState;
  // baraye listener haai ke be in class vabastean

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );
    this._projects.push(newProject);
    this._updateListeners();
  }

  moveProject(projectID: string, newStatus: ProjectStatus) {
    const project = this._projects.find((prj) => prj.id === projectID);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this._updateListeners();
    }
  }
  private _updateListeners() {
    for (const listenFn of this.listeners) {
      listenFn(this._projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

//************************************************ ProjectItem *****************************************/

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements IDraggable
{
  private project: Project;
  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }
  @AutoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }
  dragEndHandler(_: DragEvent): void {
    console.log("dragEnd");
  }

  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} person`;
    }
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }
  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned.";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

//************************************************ ProjectList *****************************************/
class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements IDragTarget
{
  assignedProjcets: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjcets = [];

    this.configure();
    this.renderContent();
  }
  @AutoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }
  @AutoBind
  dropHandler(event: DragEvent): void {
    const prjID = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjID,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }
  @AutoBind
  dragLeaveHandler(event: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

    projectState.addListener((projects: Project[]) => {
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

  private _renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-project-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProjcets) {
      new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
    }
  }

  renderContent() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
