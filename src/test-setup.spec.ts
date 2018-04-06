import {ComponentTestContext, TestBuilder} from "./test-setup";
import {Component, Input} from "@angular/core";
import * as chai from 'chai';
import {expect} from 'chai';
import * as chaiDom from 'chai-dom';
import {TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";

chai.use(chaiDom);

describe("TestSetup", () => {
    let context: ComponentTestContext<TestComponent>;

    @Component({
        selector: "tested",
        template: `
            <child id="child-one"></child>
            <child id="child-two"></child>
            <span id="greeting">Hello World</span>
            <span id="farewell">Goodbye Cruel World</span>
            <p id="message">{{message}}</p>
        `
    })
    class TestComponent {
        @Input() public someInput = "";
        public message = "foo";
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

    afterEach(TestBed.resetTestingModule);

    describe("allows", () => {

        beforeEach(() => {
            context = TestBuilder.configure({
                subject: TestComponent,
                use: [ChildComponent]
            }).create();
        });


        describe('selecting', () => {

            it("an element from the subject template", () => {
                expect(context.element("#greeting")).to.have.text("Hello World")
            });

            it("elements from the subject template", () => {
                const elements = context.elements("span");
                expect(elements[0]).to.have.text("Hello World");
                expect(elements[1]).to.have.text("Goodbye Cruel World");
            });

            it("a child component instance", () => {
                const child = context.child<ChildComponent>("#child-one");
                expect(child.invokeMe()).to.equal("Hey there!");
            });

            it("child component instances", () => {
                const children = context.children<ChildComponent>("child");
                expect(children[0].invokeMe()).to.equal("Hey there!");
                expect(children[1].invokeMe()).to.equal("Hey there!");
            });

        });

        it("triggering change detection", () => {
            context.subject.message = "Bam!";
            context.detectChanges();
            expect(context.element("#message")).to.have.text("Bam!");
        });

        describe("gives access to the subject", () => {

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

    });

    it("allows mocking child components", () => {
        context =  TestBuilder.configure({
            subject: TestComponent,
            mock: [ChildComponent],
        })
        .setupMock(ChildComponent, (mock: any) => mock.invokeMe.returns("I'm mocked"))
        .create();

        expect(context.child(ChildComponent).invokeMe()).to.equal("I'm mocked");
    });

    it("allows setting initial components inputs", () => {
        context =  TestBuilder.configure({
            subject: TestComponent,
            use: [ChildComponent]
        })
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

            const context =  TestBuilder.configure({ subject: SubjectComponent }).create();

            expect(context.element('#message')).to.have.text("Sasquatch");
        });

        it("attributes", () => {
            @Component({
                selector: '[parent]',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            const context =  TestBuilder.configure({ subject: SubjectComponent }).create();

            expect(context.element('#message')).to.have.text("Sasquatch");
        });

        it("classes", () => {
            @Component({
                selector: '.parent',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            const context =  TestBuilder.configure({ subject: SubjectComponent }).create();

            expect(context.element('#message')).to.have.text("Sasquatch");
        });

        it("tag names, classes, and attributes", () => {
            @Component({
                selector: 'parent.parent[parent]',
                template: `<span id="message">Sasquatch</span>`
            })
            class SubjectComponent {}

            const context =  TestBuilder.configure({ subject: SubjectComponent }).create();

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

            const context =  TestBuilder.configure({ subject: SubjectComponent })
                .input("parent", "Sasquatch")
                .create();

            expect(context.element('#message')).to.have.text("Sasquatch");
        });
    });


});