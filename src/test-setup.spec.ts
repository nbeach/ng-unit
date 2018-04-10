import {ComponentTestContext, TestBuilder} from "./test-setup";
import {Component, Input} from "@angular/core";
import * as chai from 'chai';
import {expect} from 'chai';
import * as chaiDom from 'chai-dom';
import {TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";

chai.use(chaiDom);

describe("TestSetup", () => {
    afterEach(TestBed.resetTestingModule);

    describe("allows", () => {

        describe('selecting', () => {

            it("an element from the subject template", () => {
                @Component({
                    selector: "tested",
                    template: `<span id="greeting">Hello World</span>`
                })
                class SubjectComponent {}

                const context = TestBuilder.configure({ subject: SubjectComponent }).create();

                expect(context.element("#greeting")).to.have.text("Hello World")
            });

            it("elements from the subject template", () => {
                @Component({
                    selector: "tested",
                    template: `
                        <span>Hello World</span>
                        <span>Goodbye Cruel World</span>
                    `
                })
                class SubjectComponent {}

                const context = TestBuilder.configure({ subject: SubjectComponent }).create();

                const elements = context.elements("span");
                expect(elements[0]).to.have.text("Hello World");
                expect(elements[1]).to.have.text("Goodbye Cruel World");
            });

            it("a child component instance", () => {
                @Component({
                    selector: "tested",
                    template: `<child></child>`
                })
                class SubjectComponent {}

                @Component({
                    selector: "child",
                    template: ``
                })
                class ChildComponent {
                    public invokeMe = () => "Hey there!";
                }

                const context = TestBuilder.configure({
                    subject: SubjectComponent,
                    use: [ChildComponent]
                }).create();


                const child = context.child(ChildComponent);
                expect(child.invokeMe()).to.equal("Hey there!");
            });

            it("child component instances", () => {
                @Component({
                    selector: "tested",
                    template: `
                        <child></child>
                        <child></child>
                    `
                })
                class SubjectComponent {}

                @Component({
                    selector: "child",
                    template: ``
                })
                class ChildComponent {
                    public invokeMe = () => "Hey there!";
                }

                const context = TestBuilder.configure({
                    subject: SubjectComponent,
                    use: [ChildComponent]
                }).create();


                const children = context.children<ChildComponent>("child");
                expect(children[0].invokeMe()).to.equal("Hey there!");
                expect(children[1].invokeMe()).to.equal("Hey there!");
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
                context = TestBuilder.configure({ subject: SubjectComponent }).create();
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

        it("triggering change detection", () => {
            @Component({
                selector: "tested",
                template: `<p id="message">{{message}}</p>`
            })
            class SubjectComponent {
                public message = "foo";
            }

            const context = TestBuilder.configure({ subject: SubjectComponent }).create();

            context.subject.message = "Bam!";
            context.detectChanges();
            expect(context.element("#message")).to.have.text("Bam!");
        });

    });

    it("allows mocking child components", () => {
        @Component({
            selector: "tested",
            template: `<child id="child-one"></child>`
        })
        class SubjectComponent {}

        @Component({
            selector: "child",
            template: ``
        })
        class ChildComponent {

            public invokeMe() {
                return "Hey there!";
            }

        }

        const context =  TestBuilder.configure({
            subject: SubjectComponent,
            mock: [ChildComponent],
        })
        .setupMock(ChildComponent, (mock: any) => mock.invokeMe.returns("I'm mocked"))
        .create();

        expect(context.child(ChildComponent).invokeMe()).to.equal("I'm mocked");
    });

    it("allows configuring providers", () => {
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
            constructor(private someService: SomeService) {}
        }

        const context =  TestBuilder.configure({
            subject: SubjectComponent,
            providers: [{provide: SomeService, useValue: new SomeService()}]
        }).create();


        expect(context.element("#message")).to.have.text("Hello World");

    });

    it("allows setting initial components inputs", () => {
        @Component({
            selector: "tested",
            template: ``
        })
        class SubjectComponent {
            @Input() public someInput = "";
        }

        const context = TestBuilder.configure({ subject: SubjectComponent })
        .input("someInput", "Schwoosh!")
        .create();

        expect(context.subject.someInput).to.equal("Schwoosh!");
    });

    describe("allows testing components with selectors for", () => {

        it("tag names", () => {
            @Component({
                selector: 'parent',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            const context = TestBuilder.configure({ subject: SubjectComponent }).create();

            expect(context.element('#message')).to.have.text("Sasquatch");
        });

        it("attributes", () => {
            @Component({
                selector: '[parent]',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            const context = TestBuilder.configure({ subject: SubjectComponent }).create();

            expect(context.element('#message')).to.have.text("Sasquatch");
        });

        it("classes", () => {
            @Component({
                selector: '.parent',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            const context = TestBuilder.configure({ subject: SubjectComponent }).create();

            expect(context.element('#message')).to.have.text("Sasquatch");
        });

        it("tag names, classes, and attributes", () => {
            @Component({
                selector: 'parent.parent[parent]',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            const context = TestBuilder.configure({ subject: SubjectComponent }).create();

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

            const context = TestBuilder.configure({ subject: SubjectComponent })
                .input("parent", "Sasquatch")
                .create();

            expect(context.element('#message')).to.have.text("Sasquatch");
        });
    });

});