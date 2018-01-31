import {Component, EventEmitter, Input, Output} from "@angular/core";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {expect, use} from 'chai';
import * as chaiDom from 'chai-dom';
import * as sinonChai from 'sinon-chai';
import {where} from "mocha-where";
import {mockComponent} from "./mock-component";
import {range} from "lodash";
import {By} from "@angular/platform-browser";

use(chaiDom);
use(sinonChai);

describe("mockComponent", () => {

    afterEach(TestBed.resetTestingModule);

    describe("can communicate with it's parent by", () => {
        let subject: CommunicatingParent,
            subjectElement: any,
            fixture: ComponentFixture<CommunicatingParent>,
            mockChildComponent: any;

        beforeEach(() => {
            mockChildComponent = mockComponent(CommunicatingChildComponent);

            TestBed.configureTestingModule({
                declarations: [CommunicatingParent, mockChildComponent]
            });

            fixture = TestBed.createComponent(CommunicatingParent);
            subject = fixture.componentInstance;
            subjectElement = fixture.debugElement.nativeElement;
            fixture.detectChanges();
        });

        where([
            ['name',                 'bindingMethod',    'childProperty'],
            ["input bindings",       "bindToInput",      "input"        ],
            ["named input bindings", "bindToNamedInput", "namedInput"   ],
        ])
        .it("receiving #name", (scenario: any) => {
            subject[scenario.bindingMethod]("foo");
            fixture.detectChanges();

            const component = fixture.debugElement.query(By.css("child")).componentInstance;
            expect(component[scenario.childProperty]).to.equal("foo");
        });

        where([
            ['name',                'childOutput', 'parentTagSelector'    ],
            ["output events",       "output",      "#outputFromChild"     ],
            ["named output events", "namedOutput", "#namedOutputFromChild"],
        ])
        .it("emitting #name", (scenario: any) => {
            const component = fixture.debugElement.query(By.css("child")).componentInstance;
            component[scenario.childOutput].emit("bar");
            fixture.detectChanges();
            expect(subjectElement.querySelector(scenario.parentTagSelector)).to.have.text("bar");
        });

    });

    it("allows multiple instantiations of the mock", () => {
        const mockChildComponent = mockComponent(CommunicatingChildComponent);
        TestBed.configureTestingModule({
            declarations: [MultiChildParentComponent, mockChildComponent]
        });

        const fixture = TestBed.createComponent(MultiChildParentComponent);
        fixture.detectChanges();

        const components = fixture.debugElement.queryAll(By.css("child")).map(element => element.componentInstance);;
        expect(components).to.have.length(3);
        expect(components[0].input).to.equal(0);
        expect(components[1].input).to.equal(1);
        expect(components[2].input).to.equal(2);
    });

    describe("mocks", () => {
        let fixture: ComponentFixture<NonCommunicatingParent>;

         beforeEach(() => {
             const mockChildComponent = mockComponent(NonCommunicatingChildComponent);
             TestBed.configureTestingModule({
                 declarations: [NonCommunicatingParent, mockChildComponent]
             });

             fixture = TestBed.createComponent(NonCommunicatingParent);
             fixture.detectChanges();
         });

        it("components with no inputs or outputs", () => {
            const components = fixture.debugElement.queryAll(By.css("child")).map(element => element.componentInstance);
            expect(components).to.have.length(1);
        });

        it("component methods", () => {
            const component = fixture.debugElement.query(By.css("child")).componentInstance;
            component.someMethod();
            expect(component.someMethod).to.have.been.called;
        });

    });

    it("allows use of a custom mock factory", () => {
        let called = false;
        const mockFactory = function() { return () => called = true; };

        const mockChildComponent = mockComponent(NonCommunicatingChildComponent, mockFactory);
        TestBed.configureTestingModule({
            declarations: [NonCommunicatingParent, mockChildComponent]
        });

        const fixture = TestBed.createComponent(NonCommunicatingParent);

        const component = fixture.debugElement.query(By.css("child")).componentInstance;
        component.someMethod();
        expect(called).to.be.true;
    });

});

@Component({ selector: 'child' })
class CommunicatingChildComponent {
    @Input() private input: string;
    @Input('differentInput') private namedInput: string;
    @Output() private output = new EventEmitter<any>();
    @Output('differentOutput') private namedOutput = new EventEmitter<any>();
}

@Component({
    selector: 'parent',
    template: `
                <child [input]="boundToInput"
                       [namedInput]="boundToNamedInput"
                       (output)="outputFromChild = $event"
                       (namedOutput)="namedOutputFromChild = $event"></child>
                <div id="outputFromChild">{{outputFromChild}}</div>
                <div id="namedOutputFromChild">{{namedOutputFromChild}}</div>
            `
})
class CommunicatingParent {
    private boundToInput: string;
    private boundToNamedInput: string;
    private outputFromChild: string;
    private namedOutputFromChild: string;

    public bindToInput(value: string): void {
        this.boundToInput = value;
    }

    public bindToNamedInput(value: string): void {
        this.boundToNamedInput = value;
    }
}

@Component({
    selector: 'parent',
    template: `<child *ngFor="let input of childInputs" [input]="input"></child>`
})
class MultiChildParentComponent {
    private childInputs = range(3);
}

@Component({ selector: 'parent', template: `<child></child>` })
class NonCommunicatingParent {}

@Component({ selector: 'child' })
class NonCommunicatingChildComponent {
    public someMethod() {}
}