import {Component, DebugElement, EventEmitter, Input, Output} from "@angular/core"
import {ComponentFixture, TestBed} from "@angular/core/testing"
import {expect} from "chai"
import {mockComponent, mockProvider} from "./index"
import {range} from "lodash"
import {By} from "@angular/platform-browser"
import {stub} from "sinon"

declare let window: any
declare let jasmine: any

describe("mockComponent", () => {

    afterEach(() => {
        TestBed.resetTestingModule()
    })

    describe("can communicate with it's parent by", () => {

        it("receiving input bindings", () => {
            @Component({ selector: "child" })
            class ChildComponent {
                @Input() private input = ""
            }

            @Component({
                selector: "parent",
                template: `<child [input]="boundToInput"></child>`,
            })
            class ParentComponent {
                public boundToInput = ""
            }

            const mockChildComponent = mockComponent(ChildComponent)
            TestBed.configureTestingModule({
                declarations: [ParentComponent, mockChildComponent],
            })

            const fixture = TestBed.createComponent(ParentComponent)
            const subject = fixture.componentInstance
            fixture.detectChanges()

            subject.boundToInput = "foo"
            fixture.detectChanges()

            const component = fixture.debugElement.query(By.css("child")).componentInstance
            expect(component.input).to.equal("foo")
        })

        it("receiving named input bindings", () => {
            @Component({ selector: "child" })
            class ChildComponent {
                @Input("differentInput") private namedInput = ""
            }

            @Component({
                selector: "parent",
                template: `<child [namedInput]="boundToInput"></child>`,
            })
            class ParentComponent {
                public boundToInput = ""
            }


            const mockChildComponent = mockComponent(ChildComponent)
            TestBed.configureTestingModule({
                declarations: [ParentComponent, mockChildComponent],
            })

            const fixture = TestBed.createComponent(ParentComponent)
            const subject = fixture.componentInstance
            fixture.detectChanges()

            subject.boundToInput = "foo"
            fixture.detectChanges()

            const component = fixture.debugElement.query(By.css("child")).componentInstance
            expect(component.namedInput).to.equal("foo")
        })


        it("emitting output events", () => {
            @Component({ selector: "child" })
            class ChildComponent {
                @Output() private output = new EventEmitter<any>()
            }

            @Component({
                selector: "parent",
                template: `<child (output)="outputFromChild = $event"></child>`,
            })
            class ParentComponent {
                public outputFromChild = ""
            }

            const mockChildComponent = mockComponent(ChildComponent)
            TestBed.configureTestingModule({
                declarations: [ParentComponent, mockChildComponent],
            })

            const fixture = TestBed.createComponent(ParentComponent)
            const subject = fixture.componentInstance
            fixture.detectChanges()

            const component = fixture.debugElement.query(By.css("child")).componentInstance
            component.output.emit("bar")
            fixture.detectChanges()
            expect(subject.outputFromChild).to.equal("bar")
        })

        it("emitting named output events", () => {
            @Component({ selector: "child" })
            class ChildComponent {
                @Output("differentOutput") private namedOutput = new EventEmitter<any>()
            }

            @Component({
                selector: "parent",
                template: `<child (namedOutput)="namedOutputFromChild = $event"></child>`,
            })
            class ParentComponent {
                public namedOutputFromChild = ""
            }

            const mockChildComponent = mockComponent(ChildComponent)
            TestBed.configureTestingModule({
                declarations: [ParentComponent, mockChildComponent],
            })

            const fixture = TestBed.createComponent(ParentComponent)
            const subject = fixture.componentInstance
            fixture.detectChanges()


            const component = fixture.debugElement.query(By.css("child")).componentInstance
            component.namedOutput.emit("bar")
            fixture.detectChanges()
            expect(subject.namedOutputFromChild).to.equal("bar")
        })

    })

    it("allows multiple instantiations of the mock", () => {
        @Component({ selector: "child" })
        class ChildComponent {
            @Input() private input = ""
        }

        @Component({
            selector: "parent",
            template: `<child *ngFor="let input of childInputs" [input]="input"></child>`,
        })
        class ParentComponent {
            private childInputs = range(3)
        }

        const mockChildComponent = mockComponent(ChildComponent)
        TestBed.configureTestingModule({
            declarations: [ParentComponent, mockChildComponent],
        })

        const fixture = TestBed.createComponent(ParentComponent)
        fixture.detectChanges()

        const components = fixture.debugElement.queryAll(By.css("child")).map((element: DebugElement) => element.componentInstance)
        expect(components).to.have.length(3)
        expect(components[0].input).to.equal(0)
        expect(components[1].input).to.equal(1)
        expect(components[2].input).to.equal(2)
    })

    describe("mocks", () => {
        let fixture: ComponentFixture<any>

        beforeEach(() => {
            @Component({ selector: "parent", template: `<child></child>` })
            class NonCommunicatingParent {}

            @Component({ selector: "child" })
            class NonCommunicatingChildComponent {
                public someMethod() {}
            }

            const mockChildComponent = mockComponent(NonCommunicatingChildComponent)
            TestBed.configureTestingModule({
                 declarations: [NonCommunicatingParent, mockChildComponent],
             })

            fixture = TestBed.createComponent(NonCommunicatingParent)
            fixture.detectChanges()
         })

        it("components with no inputs or outputs", () => {
            const components = fixture.debugElement.queryAll(By.css("child")).map((element: DebugElement) => element.componentInstance)
            expect(components).to.have.length(1)
        })

        it("component methods", () => {
            const component = fixture.debugElement.query(By.css("child")).componentInstance
            component.someMethod()
            expect(component.someMethod).to.have.been.called
        })

    })

    it("mocks inherited component methods", () => {
        @Component({ selector: "parent", template: `<child></child>` })
        class TestedComponent {}

        class GrandParent {
            public foo() {}
        }

        class Parent extends GrandParent {
            public bar() {}
        }

        @Component({ selector: "child" })
        class InheritingComponent extends Parent {
        }

        const mockInheritingComponent = mockComponent(InheritingComponent)
        TestBed.configureTestingModule({
            declarations: [TestedComponent, mockInheritingComponent],
        })

        const fixture = TestBed.createComponent(TestedComponent)
        fixture.detectChanges()

        const component = fixture.debugElement.query(By.css("child")).componentInstance
        component.foo()
        component.bar()
        expect(component.foo).to.have.been.called
        expect(component.bar).to.have.been.called
    })

    it("allows use of a custom mock factory", () => {
        @Component({ selector: "parent", template: `<child></child>` })
        class NonCommunicatingParent {}

        @Component({ selector: "child" })
        class NonCommunicatingChildComponent {
            public someMethod() {}
        }

        let called = false
        const mockFactory = stub().returns(() => called = true)
        mockProvider(mockFactory)

        const mockChildComponent = mockComponent(NonCommunicatingChildComponent, () => {})
        TestBed.configureTestingModule({
            declarations: [NonCommunicatingParent, mockChildComponent],
        })

        const fixture = TestBed.createComponent(NonCommunicatingParent)

        const component = fixture.debugElement.query(By.css("child")).componentInstance
        component.someMethod()
        expect(called).to.be.true

        mockProvider(stub)
    })

    it("uses jasmine for mocks by default when present", () => {
        mockProvider(null!)
        window.jasmine = { createSpy: () => stub().returns("I'm a jasmine spy I swear!")}

        @Component({ selector: "parent", template: `<child></child>` })
        class ParentComponent {}

        @Component({ selector: "child" })
        class ChildComponent {
            public someMethod() {}
        }

        const mockChildComponent = mockComponent(ChildComponent, () => {})
        TestBed.configureTestingModule({
            declarations: [ParentComponent, mockChildComponent],
        })
        const fixture = TestBed.createComponent(ParentComponent)

        const component = fixture.debugElement.query(By.css("child")).componentInstance
        expect(component.someMethod()).to.equal("I'm a jasmine spy I swear!")

        delete window.jasmine
        mockProvider(stub)
    })

    it("throws an exception when no mock provider can be detected and none is provided", () => {

        @Component({ selector: "parent", template: `<child></child>` })
        class ParentComponent {}

        @Component({ selector: "child" })
        class ChildComponent {
            public someMethod() {}
        }

        mockProvider(null!)

        const mockChildComponent = mockComponent(ChildComponent, () => {})
        TestBed.configureTestingModule({
            declarations: [ParentComponent, mockChildComponent],
        })

        expect(() => TestBed.createComponent(ParentComponent)).to.throw("No mocking framework could be automatically detected. You must register a mock provider using mockProvider()")

        mockProvider(stub)
    })

    it("creates unique event emitters for each instance", () => {
        @Component({ selector: "component" })
        class SomeComponent {
            @Output() private output = new EventEmitter<any>()
        }

        const MockComponent = mockComponent(SomeComponent)
        const first = new MockComponent()
        const second = new MockComponent()

        expect((first as any).output).to.not.equal((second as any).output)
    })

    it("creates unique method mocks for each instance", () => {
        @Component({ selector: "component" })
        class SomeComponent {
            public foo() { }
        }

        const MockComponent = mockComponent(SomeComponent)
        const first = new MockComponent()
        const second = new MockComponent()

        expect((first as any).foo).to.not.equal((second as any).foo)
    })

    it("allows for mock setup to be passed", () => {
        @Component({ selector: "component" })
        class SomeComponent {
            public foo() { }
        }

        const MockComponent = mockComponent(SomeComponent, mock => {
            mock.foo.returns("sasquatch")
        })
        const mock = new MockComponent()

        expect(mock.foo()).to.equal("sasquatch")
    })

    it("supports rendering transcluded content", () => {
        @Component({ selector: "child" })
        class ChildComponent {}

        @Component({
            selector: "parent",
            template: `<child><span id="message">Sasquatch</span></child>`,
        })
        class ParentComponent {}

        const MockChildComponent = mockComponent(ChildComponent)
        TestBed.configureTestingModule({
            declarations: [ParentComponent, MockChildComponent],
        })

        const fixture = TestBed.createComponent(ParentComponent)
        fixture.detectChanges()
        expect(fixture.nativeElement.querySelector("#message")).to.have.text("Sasquatch")
    })
})
