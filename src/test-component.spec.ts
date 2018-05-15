import {
    component,
    components,
    detectChanges,
    element,
    elements,
    fixture,
    subject,
    subjectElement,
    teardown,
    testComponent,
} from "./index"
import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core"
import {expect} from "chai"
import {By} from "@angular/platform-browser"
import {FormsModule} from "@angular/forms"
import {setInputValue} from "./dom"

describe("TestSetup", () => {

    afterEach(teardown)

    describe("selects from the subject template", () => {

        it("a single element", () => {
            @Component({
                selector: "tested",
                template: `<span id="greeting">Hello World</span>`,
            })
            class SubjectComponent {}

            testComponent(SubjectComponent).begin()

            expect(element("#greeting")).to.have.text("Hello World")
        })

        it("multiple elements", () => {
            @Component({
                selector: "tested",
                template: `
                    <span>Hello World</span>
                    <span>Goodbye Cruel World</span>
                `,
            })
            class SubjectComponent {}

            testComponent(SubjectComponent).begin()

            const messages = elements("span")
            expect(messages[0]).to.have.text("Hello World")
            expect(messages[1]).to.have.text("Goodbye Cruel World")
        })

        it("a single child component instance", () => {
            @Component({
                selector: "tested",
                template: `
                    <child></child>`,
            })
            class SubjectComponent {}

            @Component({
                selector: "child",
                template: ``,
            })
            class ChildComponent {
                public invokeMe = () => "Hey there!"
            }

            testComponent(SubjectComponent)
                .use([ChildComponent])
                .begin()

            expect(component(ChildComponent).invokeMe()).to.equal("Hey there!")
        })

        it("multiple child component instances", () => {
            @Component({
                selector: "tested",
                template: `
                    <child></child>
                    <child></child>
                `,
            })
            class SubjectComponent {}

            @Component({
                selector: "child",
                template: ``,
            })
            class ChildComponent {
                public invokeMe = () => "Hey there!"
            }

            testComponent(SubjectComponent)
                .use([ChildComponent])
                .begin()

            const childComponents = components<ChildComponent>("child")
            expect(childComponents[0].invokeMe()).to.equal("Hey there!")
            expect(childComponents[1].invokeMe()).to.equal("Hey there!")
        })

    })

    describe("gives access to the subject", () => {
        @Component({
            selector: "tested",
            template: `<p id="message">{{message}}</p>`,
        })
        class SubjectComponent {
            public message = "foo"
        }

        let subject: SubjectComponent

        beforeEach(() => {
            subject = testComponent(SubjectComponent).begin()
        })

        it("instance", () => {
            expect(subject.message).to.equal("foo")
        })

        it("element", () => {
            expect(subjectElement().querySelector("#message")).to.not.be.null
        })

        it("test fixture", () => {
            const messageElement = fixture().debugElement.query(By.css("#message"))
            expect(messageElement).to.not.be.null
        })

    })

    it("triggers change detection", () => {
        @Component({
            selector: "tested",
            template: `<p id="message">{{message}}</p>`,
        })
        class SubjectComponent {
            public message = "foo"
        }

        const subject = testComponent(SubjectComponent).begin()

        subject.message = "Bam!"
        detectChanges()
        expect(element("#message")).to.have.text("Bam!")
    })

    it("accesses subject after setup", () => {
        @Component({
            selector: "tested",
            template: `<p id="message">{{message}}</p>`,
        })
        class SubjectComponent {
            public message = "foo"
        }

        testComponent(SubjectComponent).begin()

        subject<SubjectComponent>().message = "Bam!"
        detectChanges()
        expect(element("#message")).to.have.text("Bam!")
    })

    it("mocks child components", () => {
        @Component({
            selector: "tested",
            template: `<child id="child-one"></child>`,
        })
        class SubjectComponent {
        }

        @Component({
            selector: "child",
            template: ``,
        })
        class ChildComponent {

            public invokeMe() {
                return "Hey there!"
            }

        }

        testComponent(SubjectComponent)
            .mock([ChildComponent])
            .setupMock(ChildComponent, (mock: any) => mock.invokeMe.returns("I'm mocked"))
            .begin()

        expect(component(ChildComponent).invokeMe()).to.equal("I'm mocked")
    })

    it("specifies imports", () => {
        class SomeService {
            public invokeMe() {
                return "Hello World"
            }
        }

        @Component({
            selector: "tested",
            template: `<input type="text" [(ngModel)]="value">`,
        })
        class SubjectComponent {
           public value: string = ""
        }

        const subject = testComponent(SubjectComponent)
            .import([FormsModule])
            .begin()

        setInputValue(element("input"), "foo")

        expect(subject.value).to.equal("foo")
    })

    it("configures providers", () => {
        class SomeService {
            public invokeMe() {
                return "Hello World"
            }
        }

        @Component({
            selector: "tested",
            template: `<span id="message">{{someService.invokeMe()}}</span>`,
        })
        class SubjectComponent {
            constructor(private someService: SomeService) {}
        }

        testComponent(SubjectComponent)
            .providers([{provide: SomeService, useValue: new SomeService()}])
            .begin()

        expect(element("#message")).to.have.text("Hello World")
    })

    it("sets initial component input values", () => {
        @Component({
            selector: "tested",
            template: ``,
        })
        class SubjectComponent {
            @Input() public someInput = ""
        }

        const subject = testComponent(SubjectComponent)
            .setInput("someInput", "Schwoosh!")
            .begin()

        expect(subject.someInput).to.equal("Schwoosh!")
    })

    it("subscribes to component out values", () => {
        @Component({
            selector: "tested",
            template: ``,
        })
        class SubjectComponent implements OnInit {
            @Output() public outputOne = new EventEmitter<string>()
            @Output() public outputTwo = new EventEmitter<string>()

            public ngOnInit(): void {
                this.outputOne.emit("Hello World")
                this.outputTwo.emit("Goodbye Cruel World")
            }
        }

        let first = null, second = null
        testComponent(SubjectComponent)
            .onOutput("outputOne", event => first = event)
            .onOutput("outputTwo", event => second = event)
            .begin()

        expect(first).to.equal("Hello World")
        expect(second).to.equal("Goodbye Cruel World")
    })


    describe("works with components with selectors for", () => {

        it("tag names", () => {
            @Component({
                selector: "parent",
                template: `<span id="message">Sasquatch</span>`,
            })
            class SubjectComponent {}

            testComponent(SubjectComponent).begin()

            expect(element("#message")).to.have.text("Sasquatch")
        })

        it("attributes", () => {
            @Component({
                selector: "[parent]",
                template: `<span id="message">Sasquatch</span>`,
            })
            class SubjectComponent {
            }

            testComponent(SubjectComponent).begin()

            expect(element("#message")).to.have.text("Sasquatch")
        })

        it("classes", () => {
            @Component({
                selector: ".parent",
                template: `<span id="message">Sasquatch</span>`,
            })
            class SubjectComponent {}

            testComponent(SubjectComponent).begin()

            expect(element("#message")).to.have.text("Sasquatch")
        })

        it("tag names, classes, and attributes", () => {
            @Component({
                selector: "parent.parent[parent]",
                template: `<span id="message">Sasquatch</span>`,
            })
            class SubjectComponent {}

            testComponent(SubjectComponent).begin()

            expect(element("#message")).to.have.text("Sasquatch")
        })

        it("attributes that are also input names", () => {
            @Component({
                selector: "[parent]",
                template: `<span id="message">{{parent}}</span>`,
            })
            class SubjectComponent {
                @Input() private parent: string
            }

            testComponent(SubjectComponent)
                .setInput("parent", "Sasquatch")
                .begin()

            expect(element("#message")).to.have.text("Sasquatch")
        })
    })

})
