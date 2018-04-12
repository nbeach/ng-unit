import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Component, Type} from "@angular/core";
import {concat, defaultTo} from 'lodash';
import {selectComponent, selectComponents} from "./dom";
import {mockComponent, MockSetup} from "./mock-component";
import {selectorOf} from "./selector-of";
const createElement = require("dom-create-element-query-selector")

let _subject: any = null;
let _subjectElement: any = null;
let _fixture: any = null;

export const element = (selector: string): Element | null => subjectElement().querySelector(selector);
export const elements = (selector: string): NodeListOf<Element> => subjectElement().querySelectorAll(selector);
export const child = <T>(selectorOrType: string | Type<T>): T => selectComponent(selectorOrType, _fixture);
export const children = <T>(selectorOrType: string | Type<T>): T[] => selectComponents(selectorOrType, _fixture);
export const detectChanges = () : void => _fixture.detectChanges();

export const subject = <T>(): T => _subject;
export const subjectElement = (): Element => _subjectElement;
export const fixture = <T>(): ComponentFixture<T> => _fixture;



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


export function setupTest<T>(config: TestConfig<T>) {
    return new TestBuilder(config);
}


export class TestBuilder<T> {
    private mockSetups: MockTypeAndSetup[] = [];
    private inputInitializations = new Map<string, any>();

    constructor(private config: TestConfig<T>) { }

    public setupMock(type: Type<any>, setup: (mock: any) => void): TestBuilder<T> {
        this.mockSetups.push({type: type, setup: setup});
        return this;
    }

    public input(inputName: string, value: any): TestBuilder<T> {
        this.inputInitializations.set(inputName, value);
        return this;
    }

    public begin(): void {
        const providers = defaultTo(this.config.providers, []);
        const realComponents = defaultTo(this.config.use, []);
        const mockComponents = defaultTo(this.config.mock, [] as Type<any>[])
            .map(type => TestBuilder.createComponentMock(type, this.mockSetups));

        const subject = this.config.subject;
        const TestHostComponent = TestBuilder.createTestHostComponent(subject, this.inputInitializations);
        TestBed.configureTestingModule({
            declarations: concat(TestHostComponent, subject, mockComponents, realComponents),
            providers: providers
        });

        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        _fixture = fixture;
        _subject = child(subject);
        _subjectElement = _fixture.nativeElement.querySelector(selectorOf(subject));
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