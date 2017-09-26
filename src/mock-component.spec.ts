import {Component, EventEmitter, Input, Output} from "@angular/core";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {expect} from 'chai';
import {where} from "mocha-where";
import {mockComponent} from "./mock-component";
import {range} from "lodash";
import {createComponent} from "./setup";
import {selectComponent, selectComponents} from "./dom";
import {TestModuleMetadata} from "@angular/core/testing";

describe("mockComponent", () => {
    afterEach(TestBed.resetTestingModule);

    describe("can communicate with it's parent by", () => {
        let subject: CommunicatingParent,
            subjectElement: any,
            detectChanges: () => void,
            fixture: ComponentFixture<any>;

        beforeEach(() => {
            const moduleConfig: TestModuleMetadata = {
                declarations: [mockComponent(CommunicatingChildComponent)],
                providers: []
            };

            ({subject, subjectElement, detectChanges, fixture} = createComponent(CommunicatingParent, moduleConfig));
        });

        where([
            ['name',                 'bindingMethod',    'childProperty'],
            ["input bindings",       "bindToInput",      "input"        ],
            ["named input bindings", "bindToNamedInput", "namedInput"   ],
        ])
        .it("receiving #name", (scenario: any) => {
            subject[scenario.bindingMethod]("foo");
            detectChanges();

            const childInstance = selectComponent('child', fixture);
            expect(childInstance[scenario.childProperty]).to.equal("foo");
        });

        where([
            ['name',                'childOutput', 'parentTagSelector'    ],
            ["output events",       "output",      "#outputFromChild"     ],
            ["named output events", "namedOutput", "#namedOutputFromChild"],
        ])
        .it("emitting #name", (scenario: any) => {
            const childInstance = selectComponent('child', fixture);
            childInstance[scenario.childOutput].emit("bar");
            detectChanges();
            expect(subjectElement.querySelector(scenario.parentTagSelector).textContent).to.equal("bar");
        });

    });

    it("allows multiple instantiations of the mock", () => {
        const {fixture, detectChanges} = createComponent(MultiChildParentComponent, {
            declarations: [mockComponent(CommunicatingChildComponent)],
            providers: []
        });
        detectChanges();

        const childInstances = selectComponents('child', fixture);
        expect(childInstances.length).to.equal(3);
        expect(childInstances[0].input).to.equal(0);
        expect(childInstances[1].input).to.equal(1);
        expect(childInstances[2].input).to.equal(2);
    });

    it("mocks components with no inputs or outputs", () => {
        const {fixture} = createComponent(NonCommunicatingParent, {
            declarations: [mockComponent(NonCommunicatingChildComponent)],
            providers: []
        });

        const childInstances = selectComponents('child', fixture);
        expect(childInstances.length).to.equal(1);
    });
    
    it("mocks component methods", () => {
        const {fixture} = createComponent(NonCommunicatingParent, {
            declarations: [mockComponent(NonCommunicatingChildComponent)],
            providers: []
        });

        const instance = selectComponent(NonCommunicatingChildComponent, fixture);
        instance.someMethod();

        expect(instance.someMethod.called).to.be.true;
    });

    it("allows passing custom mocks providers", () => {
        let called = false;
        const mockProvider = function() {
            return () => called = true;
        };

        const {fixture} = createComponent(NonCommunicatingParent, {
            declarations: [mockComponent(NonCommunicatingChildComponent, mockProvider)],
            providers: []
        });

        const instance = selectComponent(NonCommunicatingChildComponent, fixture);
        instance.someMethod();

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