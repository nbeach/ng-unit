import {ComponentFixture, TestBed} from "@angular/core/testing"
import {Component, Type} from "@angular/core"
import {concat} from "lodash"
import {selectComponent, selectComponents} from "./dom"
import {mockComponent, MockSetup} from "./mock-component"
import {selectorOf} from "./selector-of"
import {default as createTestHostComponent, MockTypeAndSetup, OutputWatch} from "./test-host"
import {throwIfNil, throwIfNotIn} from "./exception"
import {getAnnotation} from "./reflection"

const testNotStartedMessage = "You must first start a test using .begin() before using this method"

let _subject: any = null
let _subjectElement: Element | null = null
let _fixture: ComponentFixture<any> | null = null
let _initializedInputs: string[] = []
let _testInProgress: boolean = false

export const element = (selector: string): Element | null => subjectElement().querySelector(selector)
export const elements = (selector: string): Element[] => Array.from(subjectElement().querySelectorAll(selector))
export const component = <T>(selectorOrType: string | Type<T>): T => selectComponent(selectorOrType, fixture())
export const components = <T>(selectorOrType: string | Type<T>): T[] => selectComponents(selectorOrType, fixture())
export const setInput = (inputName: string, value: any): void => {
    const testFixture = fixture()
    throwIfNotIn(inputName, _initializedInputs, "In order to set an input after begin() is called you must provide an initial value with .setInput() at test setup time.")
    testFixture.componentInstance[inputName] = value
}
export const onOutput = (outputName: string, action: (event: any) => void): void => subject()[outputName].subscribe(action)
export const detectChanges = (): void => fixture().detectChanges()
export const teardown = (): void => {
    TestBed.resetTestingModule()
    _subject = null
    _subjectElement = null
    _fixture = null
    _initializedInputs = []
    _testInProgress = false
}

export function subject<T>(): T {
    throwIfNil(_subject, testNotStartedMessage)
    return _subject
}
export function subjectElement(): Element {
    throwIfNil(_subjectElement, testNotStartedMessage)
    return _subjectElement!
}
export function fixture(): ComponentFixture<any> {
    throwIfNil(_fixture, testNotStartedMessage)
    return _fixture!
}

export const testComponent = <T>(subject: Type<T>) => new TestBuilder(subject)

export class TestBuilder<T> {
    private _providers: any[] = []
    private _imports: any[] = []
    private _use: Type<any>[] = []
    private _mock: Type<any>[] = []

    private mockSetups: {type: Type<any>, setup: MockSetup}[] = []
    private inputInitializations = new Map<string, any>()
    private outputWatches: OutputWatch[] = []

    constructor(private subject: Type<T>) {
        throwIfTestAlreadyInProgress()
    }

    public setupMock(type: Type<any>, setup: (mock: any) => void): TestBuilder<T> {
        throwIfTestAlreadyInProgress()

        this.mockSetups.push({type, setup})
        return this
    }

    public setInput(inputName: string, value: any): TestBuilder<T> {
        throwIfTestAlreadyInProgress()

        this.inputInitializations.set(inputName, value)
        return this
    }

    public onOutput(outputName: string, action: (event: any) => void): TestBuilder<T> {
        throwIfTestAlreadyInProgress()

        this.outputWatches.push({ name: outputName, action })
        return this
    }

    public mock(components: Type<any>[]) {
        throwIfTestAlreadyInProgress()
        components.forEach(throwIfNotComponent)

        this._mock = components
        return this
    }

    public use(components: Type<any>[]) {
        throwIfTestAlreadyInProgress()

        this._use = components
        return this
    }

    public providers(providers: any[]) {
        throwIfTestAlreadyInProgress()

        this._providers = providers
        return this
    }

    public import(imports: any[]) {
        throwIfTestAlreadyInProgress()

        this._imports = imports
        return this
    }

    public begin(): T {
        const mockComponents = this._mock.map(type => createComponentMock(type, this.mockSetups))
        const TestHostComponent = createTestHostComponent(this.subject, this.inputInitializations, this.outputWatches)

        TestBed.configureTestingModule({
            declarations: concat(TestHostComponent, this.subject, mockComponents, this._use),
            providers: this._providers,
            imports: this._imports,
        })

        _fixture = TestBed.createComponent(TestHostComponent)
        _fixture.detectChanges()
        _subject = component(this.subject)
        _initializedInputs = Array.from(this.inputInitializations.keys())

        _subjectElement = _fixture.nativeElement.querySelector(selectorOf(this.subject))

        _testInProgress = true
        return _subject as T
    }

}

function createComponentMock<T>(type: Type<T>, setup: MockTypeAndSetup[]): Type<T> {
    const relevantMockSetups = setup
        .filter(set => set.type === type)
        .map(set => set.setup)

    return mockComponent(type,  mock => applyMockSetups(mock, relevantMockSetups))
}

function applyMockSetups(mock: any, mockSetups: MockSetup[]): void {
    mockSetups.forEach(setup => setup(mock))
}

function throwIfNotComponent(constructor: Type<any>): void {
    const componentAnnotation = getAnnotation(constructor, Component)
    throwIfNil(componentAnnotation, `Cannot mock ${constructor.name}. Only mocking of Components is supported.`)
}

function throwIfTestAlreadyInProgress() {
    if (_testInProgress) {
        throw new Error("You cannot configure a test while a test already is in progress")
    }
}
