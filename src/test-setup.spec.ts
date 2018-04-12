import {
    child,
    children,
    detectChanges,
    element,
    elements,
    fixture,
    subject,
    subjectElement,
    setupTest
} from "./test-setup";
import {Component, Input} from "@angular/core";
import {expect} from 'chai';
import {TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";


describe("TestSetup", () => {
    afterEach(() => {
        TestBed.resetTestingModule()
    });

    describe('selects from the subject template', () => {

        it("a single element", () => {
            @Component({
                selector: "tested",
                template: `<span id="greeting">Hello World</span>`
            })
            class SubjectComponent {}

            setupTest({subject: SubjectComponent}).begin();

            expect(element("#greeting")).to.have.text("Hello World")
        });

        it("multiple elements", () => {
            @Component({
                selector: "tested",
                template: `
                    <span>Hello World</span>
                    <span>Goodbye Cruel World</span>
                `
            })
            class SubjectComponent {
            }

            setupTest({subject: SubjectComponent}).begin();

            const messages = elements("span");
            expect(messages[0]).to.have.text("Hello World");
            expect(messages[1]).to.have.text("Goodbye Cruel World");
        });

        it("a single child component instance", () => {
            @Component({
                selector: "tested",
                template: `
                    <child></child>`
            })
            class SubjectComponent {
            }

            @Component({
                selector: "child",
                template: ``
            })
            class ChildComponent {
                public invokeMe = () => "Hey there!";
            }

            setupTest({
                subject: SubjectComponent,
                use: [ChildComponent]
            }).begin();


            const childComponent = child(ChildComponent);
            expect(childComponent.invokeMe()).to.equal("Hey there!");
        });

        it("multiple child component instances", () => {
            @Component({
                selector: "tested",
                template: `
                    <child></child>
                    <child></child>
                `
            })
            class SubjectComponent {
            }

            @Component({
                selector: "child",
                template: ``
            })
            class ChildComponent {
                public invokeMe = () => "Hey there!";
            }

            setupTest({
                subject: SubjectComponent,
                use: [ChildComponent]
            }).begin();


            const childComponents = children<ChildComponent>("child");
            expect(childComponents[0].invokeMe()).to.equal("Hey there!");
            expect(childComponents[1].invokeMe()).to.equal("Hey there!");
        });

    });

    describe("gives access to the subject", () => {
        @Component({
            selector: "tested",
            template: `<p id="message">{{message}}</p>`
        })
        class SubjectComponent {
            public message = "foo";
        }

        beforeEach(() => {
            setupTest({subject: SubjectComponent}).begin();
        });

        it("instance", () => {
            expect(subject<SubjectComponent>().message).to.equal("foo");
        });

        it("element", () => {
            expect(subjectElement().querySelector("#message")).to.not.be.null;
        });

        it("test fixture", () => {
            const messageElement = fixture().debugElement.query(By.css("#message"));
            expect(messageElement).to.not.be.null;
        });

    });

    it("triggers change detection", () => {
        @Component({
            selector: "tested",
            template: `<p id="message">{{message}}</p>`
        })
        class SubjectComponent {
            public message = "foo";
        }

        setupTest({subject: SubjectComponent}).begin();

        subject<SubjectComponent>().message = "Bam!";
        detectChanges();
        expect(element("#message")).to.have.text("Bam!");
    });

    it("mocks child components", () => {
        @Component({
            selector: "tested",
            template: `
                <child id="child-one"></child>`
        })
        class SubjectComponent {
        }

        @Component({
            selector: "child",
            template: ``
        })
        class ChildComponent {

            public invokeMe() {
                return "Hey there!";
            }

        }

        setupTest({
            subject: SubjectComponent,
            mock: [ChildComponent],
        })
            .setupMock(ChildComponent, (mock: any) => mock.invokeMe.returns("I'm mocked"))
            .begin();

        expect(child(ChildComponent).invokeMe()).to.equal("I'm mocked");
    });

    it("configures providers", () => {
        class SomeService {
            public invokeMe() {
                return "Hello World";
            }
        }

        @Component({
            selector: "tested",
            template: `<span id="message">{{someService.invokeMe()}}</span>`
        })
        class SubjectComponent {
            constructor(private someService: SomeService) {
            }
        }

        setupTest({
            subject: SubjectComponent,
            providers: [{provide: SomeService, useValue: new SomeService()}]
        }).begin();


        expect(element("#message")).to.have.text("Hello World");
    });

    it("sets initial components input values", () => {
        @Component({
            selector: "tested",
            template: ``
        })
        class SubjectComponent {
            @Input() public someInput = "";
        }

        setupTest({subject: SubjectComponent})
            .input("someInput", "Schwoosh!")
            .begin();

        expect(subject<SubjectComponent>().someInput).to.equal("Schwoosh!");
    });

    describe("works with components with selectors for", () => {

        it("tag names", () => {
            @Component({
                selector: 'parent',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            setupTest({subject: SubjectComponent}).begin();

            expect(element('#message')).to.have.text("Sasquatch");
        });

        it("attributes", () => {
            @Component({
                selector: '[parent]',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {
            }

            setupTest({subject: SubjectComponent}).begin();

            expect(element('#message')).to.have.text("Sasquatch");
        });

        it("classes", () => {
            @Component({
                selector: '.parent',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            setupTest({subject: SubjectComponent}).begin();

            expect(element('#message')).to.have.text("Sasquatch");
        });

        it("tag names, classes, and attributes", () => {
            @Component({
                selector: 'parent.parent[parent]',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            setupTest({subject: SubjectComponent}).begin();

            expect(element('#message')).to.have.text("Sasquatch");
        });

        it("attributes that are also input names", () => {
            @Component({
                selector: '[parent]',
                template: `<span id="message">{{parent}}</span>`
            })
            class SubjectComponent {
                @Input() private parent: string;
            }

            setupTest({subject: SubjectComponent})
                .input("parent", "Sasquatch")
                .begin();

            expect(element('#message')).to.have.text("Sasquatch");
        });
    });

});