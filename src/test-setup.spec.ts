import {ComponentTestContext, TestBuilder} from "./test-setup";
import {Component, Input} from "@angular/core";
import {expect} from 'chai';
import {TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";


describe("TestSetup", () => {
    afterEach(TestBed.resetTestingModule);

    describe('selects from the subject template', () => {

        it("a single element", () => {
            @Component({
                selector: "tested",
                template: `<span id="greeting">Hello World</span>`
            })
            class SubjectComponent {}

            const {element} = TestBuilder.configure({subject: SubjectComponent}).create();

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

            const {elements} = TestBuilder.configure({subject: SubjectComponent}).create();

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

            const {child} = TestBuilder.configure({
                subject: SubjectComponent,
                use: [ChildComponent]
            }).create();


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

            const {children} = TestBuilder.configure({
                subject: SubjectComponent,
                use: [ChildComponent]
            }).create();


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

        let context: ComponentTestContext<SubjectComponent>;

        beforeEach(() => {
            context = TestBuilder.configure({subject: SubjectComponent}).create();
        });

        it("instance", () => {
            expect(context.subject.message).to.equal("foo");
        });

        it("element", () => {
            expect(context.subjectElement.querySelector("#message")).to.not.be.null;
        });

        it("test fixture", () => {
            const messageElement = context.fixture.debugElement.query(By.css("#message"));
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

        const {subject, detectChanges, element} = TestBuilder.configure({subject: SubjectComponent}).create();

        subject.message = "Bam!";
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

        const {child} = TestBuilder.configure({
            subject: SubjectComponent,
            mock: [ChildComponent],
        })
            .setupMock(ChildComponent, (mock: any) => mock.invokeMe.returns("I'm mocked"))
            .create();

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

        const {element} = TestBuilder.configure({
            subject: SubjectComponent,
            providers: [{provide: SomeService, useValue: new SomeService()}]
        }).create();


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

        const {subject} = TestBuilder.configure({subject: SubjectComponent})
            .input("someInput", "Schwoosh!")
            .create();

        expect(subject.someInput).to.equal("Schwoosh!");
    });

    describe("works with components with selectors for", () => {

        it("tag names", () => {
            @Component({
                selector: 'parent',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            const {element} = TestBuilder.configure({subject: SubjectComponent}).create();

            expect(element('#message')).to.have.text("Sasquatch");
        });

        it("attributes", () => {
            @Component({
                selector: '[parent]',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {
            }

            const {element} = TestBuilder.configure({subject: SubjectComponent}).create();

            expect(element('#message')).to.have.text("Sasquatch");
        });

        it("classes", () => {
            @Component({
                selector: '.parent',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            const {element} = TestBuilder.configure({subject: SubjectComponent}).create();

            expect(element('#message')).to.have.text("Sasquatch");
        });

        it("tag names, classes, and attributes", () => {
            @Component({
                selector: 'parent.parent[parent]',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            const context = TestBuilder.configure({subject: SubjectComponent}).create();

            expect(context.element('#message')).to.have.text("Sasquatch");
        });

        it("attributes that are also input names", () => {
            @Component({
                selector: '[parent]',
                template: `<span id="message">{{parent}}</span>`
            })
            class SubjectComponent {
                @Input() private parent: string;
            }

            const {element} = TestBuilder.configure({subject: SubjectComponent})
                .input("parent", "Sasquatch")
                .create();

            expect(element('#message')).to.have.text("Sasquatch");
        });
    });

});