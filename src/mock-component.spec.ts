import {Component, EventEmitter, Input, Output} from "@angular/core";
import {TestBed} from "@angular/core/testing";
import {expect, use} from 'chai';
import * as chaiDom from 'chai-dom';
import * as sinonChai from 'sinon-chai';
import {where} from "mocha-where";
import {mockComponent} from "./mock-component";
import {range} from "lodash";
import {testComponent} from "./test-setup";
use(chaiDom);
use(sinonChai);

describe("mockComponent", () => {
    afterEach(TestBed.resetTestingModule);

    describe("can communicate with it's parent by", () => {
        let subject: CommunicatingParent, detectChanges: () => void, child: any, element: any;

        beforeEach(() => {
            ({subject, element, detectChanges, child} = testComponent({
                subject: CommunicatingParent,
                mock: [CommunicatingChildComponent]
            }));
        });

        where([
            ['name',                 'bindingMethod',    'childProperty'],
            ["input bindings",       "bindToInput",      "input"        ],
            ["named input bindings", "bindToNamedInput", "namedInput"   ],
        ])
        .it("receiving #name", (scenario: any) => {
            subject[scenario.bindingMethod]("foo");
            detectChanges();

            expect(child(CommunicatingChildComponent)[scenario.childProperty]).to.equal("foo");
        });

        where([
            ['name',                'childOutput', 'parentTagSelector'    ],
            ["output events",       "output",      "#outputFromChild"     ],
            ["named output events", "namedOutput", "#namedOutputFromChild"],
        ])
        .it("emitting #name", (scenario: any) => {
            child(CommunicatingChildComponent)[scenario.childOutput].emit("bar");
            detectChanges();
            expect(element(scenario.parentTagSelector)).to.have.text("bar");
        });

    });

    it("allows multiple instantiations of the mock", () => {
        const {children, detectChanges} = testComponent({
            subject: MultiChildParentComponent,
            mock: [CommunicatingChildComponent],
        });

        detectChanges();
        expect(children(CommunicatingChildComponent)).to.have.length(3);
        expect(children(CommunicatingChildComponent)[0].input).to.equal(0);
        expect(children(CommunicatingChildComponent)[1].input).to.equal(1);
        expect(children(CommunicatingChildComponent)[2].input).to.equal(2);
    });

    describe("mocks", () => {
        let child: any, children: any;

         beforeEach(() => {
             ({child, children} = testComponent({
                 subject: NonCommunicatingParent,
                 mock: [NonCommunicatingChildComponent],
             }));
         });

        it("components with no inputs or outputs", () => {
            expect(children(NonCommunicatingChildComponent)).to.have.length(1);
        });

        it("component methods", () => {
            const instance = child(NonCommunicatingChildComponent);
            instance.someMethod();
            expect(instance.someMethod).to.have.been.called;
        });

    });

    it("allows use of a custom mock factory", () => {
        let called = false;
        const mockFactory = function() { return () => called = true; };

        const {child} = testComponent({
            subject: NonCommunicatingParent,
            mock: [NonCommunicatingChildComponent],
            methodMockFactory: mockFactory
        });

        child(NonCommunicatingChildComponent).someMethod();
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