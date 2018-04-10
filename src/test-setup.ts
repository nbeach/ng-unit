import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Component, Type} from "@angular/core";
import {concat, defaultTo} from 'lodash';
import {selectComponent, selectComponents} from "./dom";
import {mockComponent, MockSetup} from "./mock-component";
import {selectorOf} from "./selector-of";
const createElement = require("dom-create-element-query-selector")

export class ComponentTestContext<T> {
    private _subject: T;

    constructor(private type: Type<T>, private _fixture: ComponentFixture<any>) {
        this._subject = selectComponent(type, _fixture) as any;
    }

    public element = (selector: string): Element | null => this.subjectElement.querySelector(selector);
    public elements = (selector: string): NodeListOf<Element> => this.subjectElement.querySelectorAll(selector);
    public child = <T>(selectorOrType: string | Type<T>): T => selectComponent(selectorOrType, this._fixture);
    public children = <T>(selectorOrType: string | Type<T>): T[] => selectComponents(selectorOrType, this._fixture);
    public detectChanges = () : void => this._fixture.detectChanges();

    get subject(): T {
        return this.child(this.type);
    }

    get subjectElement(): Element {
        return this._fixture.nativeElement.querySelector(selectorOf(this.type));
    }

    get fixture(): ComponentFixture<T> {
        return this._fixture;
    }

}

export interface TestConfig<T> {
    subject: Type<T>
    mock?: Type<any>[];
    use?: Type<any>[];
    providers?: any[];
    methodMockFactory?: () => any;
}

interface MockTypeAndSetup {
    type: Type<any>,
    setup: MockSetup
}

export class TestBuilder<T> {
    private mockSetups: MockTypeAndSetup[] = [];
    private inputInitializations = new Map<string, any>();

    public static configure<T>(config: TestConfig<T>) {
        return new TestBuilder(config);
    }

    private constructor(private config: TestConfig<T>) { }

    public setupMock(type: Type<any>, setup: (mock: any) => void): TestBuilder<T> {
        this.mockSetups.push({type: type, setup: setup});
        return this;
    }

    public input(inputName: string, value: any): TestBuilder<T> {
        this.inputInitializations.set(inputName, value);
        return this;
    }

    public create(): ComponentTestContext<T> {
        const providers = defaultTo(this.config.providers, []);
        const realComponents = defaultTo(this.config.use, []);
        const mockComponents = defaultTo(this.config.mock, [])
            .map(type => TestBuilder.createComponentMock(type, this.mockSetups));

        const subject = this.config.subject;
        const TestHostComponent = TestBuilder.createTestHostComponent(subject, this.inputInitializations);
        TestBed.configureTestingModule({
            declarations: concat(TestHostComponent, subject, mockComponents, realComponents),
            providers: providers
        });

        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        return new ComponentTestContext<T>(subject, fixture);
    }

    private static createTestHostComponent<T>(subject: Type<T>, inputInitializations: Map<string, any>) {
        const inputsNames = Array.from(inputInitializations.keys());
        const template =  this.createSubjectComponentTag(subject, inputsNames);

        @Component({ template: template })
        class TestHostComponent {
            constructor() {
                const inputs = Array.from(inputInitializations.entries());
                inputs.forEach(input => this[input[0]] = input[1]);
            }
        }

        return TestHostComponent;
    }

    private static createSubjectComponentTag<T>(subject: Type<T>, inputs: string[]): string {
        const subjectTagName = selectorOf(subject);
        const elementHtml = createElement(subjectTagName).outerHTML;

        return this.addInputsToTag(elementHtml, inputs);
    }

    private static addInputsToTag(tag: string, inputs: string[]) {
        const inputAttributes = inputs.map(input => ` [${input}]="${input}"`).join("");
        return tag.replace(/></, `${inputAttributes}><`);
    }

    private static createComponentMock<T>(type: Type<T>, setup: MockTypeAndSetup[]): Type<T> {
        const relevantMockSetups = setup
            .filter(set => set.type === type)
            .map(set => set.setup);

        return mockComponent(type,  mock => this.applyMockSetups(mock, relevantMockSetups));
    }

    private static applyMockSetups(mock: any, mockSetups: MockSetup[]): void {
        mockSetups.forEach(setup => setup(mock));
    }

}