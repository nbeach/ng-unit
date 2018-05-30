import {Component, Type} from "@angular/core"
import {ComponentFixture, TestBed} from "@angular/core/testing"
import {
    selectComponent,
    selectComponents,
    setCheckboxValue,
    setRadioButton,
    setSelectValue,
    setTextAreaValue,
    setTextInputValue,
    trigger,
} from "./index"
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms"
import {expect} from "chai"
import {where} from "mocha-where"

describe("DOM", () => {

    function setupTestModule(parent: Type<any>, children: Type<any>[] = []): any {
        TestBed.configureTestingModule({
            declarations: [parent, ...children],
            imports: [FormsModule, ReactiveFormsModule],
        })

        const fixture = TestBed.createComponent(parent)
        fixture.detectChanges()

        return {
            fixture,
            subject: fixture.componentInstance,
            subjectElement: fixture.debugElement.nativeElement,
        }
    }

    afterEach(() => {
        TestBed.resetTestingModule()
    })

    it('setTextInputValue() sets the value of <input type="text"> elements', () => {
        @Component({
            selector: "parent",
            template: `
                <input type="text" [(ngModel)]="textValue">

            `,
        })
        class TestComponent {
            public textValue: string
        }
        const {subject, subjectElement, fixture} = setupTestModule(TestComponent)

        setTextInputValue(subjectElement.querySelector("input"), "hello world!")
        fixture.detectChanges()

        expect(subject.textValue).to.equal("hello world!")
    })

    it("setTextAreaValue() sets the value of <textarea> elements", () => {
        @Component({
            selector: "parent",
            template: `
                <textarea [(ngModel)]="textValue"></textarea>
            `,
        })
        class TestComponent {
            public textValue: string
        }
        const {subject, subjectElement, fixture} = setupTestModule(TestComponent)

        setTextAreaValue(subjectElement.querySelector("textarea"), "hello world!")
        fixture.detectChanges()

        expect(subject.textValue).to.equal("hello world!")
    })

    describe("setSelectValue() sets the value of select elements", () => {

        it("when options have no value attributes", () => {
            @Component({
                selector: "parent",
                template: `
                <select [(ngModel)]="selectValue">
                    <option></option>
                    <option selected>Hello</option>
                    <option>Goodbye</option>
                </select>
            `,
            })
            class TestComponent {
                public selectValue: string
            }
            const {subject, subjectElement, fixture} = setupTestModule(TestComponent)


            setSelectValue(subjectElement.querySelector("select"), "Goodbye")
            fixture.detectChanges()

            expect(subject.selectValue).to.equal("Goodbye")
            const selectedOptions = subjectElement.querySelectorAll("option[selected]")
            expect(selectedOptions).to.have.length(1)
            expect(selectedOptions[0]).to.have.text("Goodbye")
        })

        it("when options have value attributes", () => {
            @Component({
                selector: "parent",
                template: `
                <select [(ngModel)]="selectValue">
                    <option></option>
                    <option value="Hola" selected>Hello</option>
                    <option value="Adios">Goodbye</option>
                </select>
            `,
            })
            class TestComponent {
                public selectValue: string
            }
            const {subject, subjectElement, fixture} = setupTestModule(TestComponent)


            setSelectValue(subjectElement.querySelector("select"), "Adios")
            fixture.detectChanges()

            expect(subject.selectValue).to.equal("Adios")
            const selectedOptions = subjectElement.querySelectorAll("option[selected]")
            expect(selectedOptions).to.have.length(1)
            expect(selectedOptions[0]).to.have.text("Goodbye")
        })

    })

    it('setRadioButton() sets the value of <input type="radio"> elements', () => {
        @Component({
            selector: "parent",
            template: `
                <input id="radio1" name="radio" value="Yes" type="radio" [checked]="radioValue === 'Yes'" (change)="radioButtonChanged($event)">
                <input id="radio2" name="radio" value="No" type="radio" [checked]="radioValue === 'No'" (change)="radioButtonChanged($event)">
                <span id="radio-value-display">{{radioValue}}</span>
            `,
        })
        class TestComponent {
            public radioValue: string | null

            private radioButtonChanged(event: any) {
                if (event.target.checked) {
                    this.radioValue = event.target.value
                } else if (event.target.value === this.radioValue) {
                    this.radioValue = null
                }
            }
        }
        const {subject, subjectElement, fixture} = setupTestModule(TestComponent)


        setRadioButton(subjectElement.querySelector("#radio1"), true)
        fixture.detectChanges()
        expect(subject.radioValue).to.equal("Yes")

        setRadioButton(subjectElement.querySelector("#radio2"), true)
        fixture.detectChanges()
        expect(subject.radioValue).to.equal("No")

        setRadioButton(subjectElement.querySelector("#radio2"), false)
        fixture.detectChanges()
        expect(subject.radioValue).to.be.null
    })

    it('setCheckboxValue() sets the value of <input type="check"> elements', () => {
        @Component({
            selector: "parent",
            template: `
                <div [formGroup]="form">
                    <input type="checkbox" formControlName="checkbox">
                </div>
            `,
        })
        class TestComponent {
            public form = new FormGroup( {
                checkbox: new FormControl(false),
            })
        }
        const {subject, subjectElement, fixture} = setupTestModule(TestComponent)

        setCheckboxValue(subjectElement.querySelector("input[type=checkbox]"), true)
        fixture.detectChanges()
        expect(subject.form.value.checkbox).to.be.true

        setCheckboxValue(subjectElement.querySelector("input[type=checkbox]"), false)
        fixture.detectChanges()
        expect(subject.form.value.checkbox).to.be.false
    })

    describe("selectComponent()", () => {
        let fixture: ComponentFixture<any>

        @Component({
            selector: "child",
            template: "",
        })
        class ChildComponent {
            public message = "I'm the child!"
        }

        describe("selects a component by", () => {

            @Component({
                selector: "parent",
                template: `
                    <child id="first-born"></child>
                    <child id="second-born"></child>
                `,
            })
            class TestComponent {}

            beforeEach(() => {
                fixture = setupTestModule(TestComponent, [ChildComponent]).fixture
            })

            it("CSS selector", () => {
                expect(selectComponent("#second-born", fixture).message).to.equal("I'm the child!")
            })

            it("type", () => {
                expect(selectComponent(ChildComponent, fixture).message).to.equal("I'm the child!")
            })

        })

        it("when the component does not exist returns null", () => {
            @Component({
                selector: "parent",
                template: `<div></div>`,
            })
            class TestComponent {}

            fixture = setupTestModule(TestComponent, [ChildComponent]).fixture

            expect(selectComponent(ChildComponent, fixture)).to.be.null
        })

    })

    describe("selectComponents() selects components by", () => {
        let fixture: ComponentFixture<any>

        @Component({
            selector: "child",
            template: "",
        })
        class ChildComponent {
            public message = "I'm the child!"
        }

        describe("selects a components by", () => {
            @Component({
                selector: "parent",
                template: `
                <child id="first-born"></child>
                <child id="second-born"></child>
            `,
            })
            class TestComponent {}

            beforeEach(() => {
                fixture = setupTestModule(TestComponent, [ChildComponent]).fixture
            })

            it("CSS selector", () => {
                const children = selectComponents("child", fixture)
                expect(children[0].message).to.equal("I'm the child!")
                expect(children[1].message).to.equal("I'm the child!")
            })

            it("type", () => {
                const children = selectComponents(ChildComponent, fixture)
                expect(children[0].message).to.equal("I'm the child!")
                expect(children[1].message).to.equal("I'm the child!")
            })

        })

        it("when the component does not exist returns an empty array", () => {
            @Component({
                selector: "parent",
                template: `<div></div>`,
            })
            class TestComponent {}

            fixture = setupTestModule(TestComponent, [ChildComponent]).fixture

            expect(selectComponents(ChildComponent, fixture)).to.deep.equal([])
        })

    })

    describe("trigger()", () => {

        it("triggers the provided event on the element", () => {
            @Component({
                selector: "parent",
                template: `<input type="text"  (focus)="focused = true">`,
            })
            class TestComponent {
                public focused = false
            }
            const {subject, subjectElement, fixture} = setupTestModule(TestComponent)

            trigger(subjectElement.querySelector("input"), "focus")
            fixture.detectChanges()
            expect(subject.focused).to.be.true
        })

        it("trigger() bubbles events up the DOM tree", () => {
            @Component({
                selector: "parent",
                template: `
                    <div (click)="clicked = true">
                        <div>
                            <input type="text">
                        </div>
                    </div>
                `,
            })
            class TestComponent {
                public clicked = false
            }
            const {subject, subjectElement, fixture} = setupTestModule(TestComponent)

            trigger(subjectElement.querySelector("input"), "click")
            fixture.detectChanges()
            expect(subject.clicked).to.be.true
        })

        it("trigger() allows stopping propagation of event bubbling", () => {
            @Component({
                selector: "parent",
                template: `
                    <div (click)="parentClicked = true">
                        <div>
                            <input type="text" (click)="setTargetClicked($event)">
                        </div>
                    </div>
                `,
            })
            class TestComponent {
                public targetClicked = false
                public parentClicked = false

                private setTargetClicked(event: Event): void {
                    this.targetClicked = true
                    event.stopPropagation()
                }
            }
            const {subject, subjectElement, fixture} = setupTestModule(TestComponent)

            trigger(subjectElement.querySelector("input"), "click")
            fixture.detectChanges()
            expect(subject.targetClicked).to.be.true
            expect(subject.parentClicked).to.be.false
        })

    })

    where([
        ["name",                    "method"            ],
        [setTextInputValue.name,    setTextInputValue   ],
        [setSelectValue.name,       setSelectValue      ],
        [setTextAreaValue.name,     setTextAreaValue    ],
        [setCheckboxValue.name,     setCheckboxValue    ],
        [setRadioButton.name,       setRadioButton      ],
        [trigger.name,              trigger             ],
    ])
    .it("#name() throws an error when the element is null", (scenario) => {
        expect(() => scenario.method(null, "")).to.throw("Element is not present")
    })

})
