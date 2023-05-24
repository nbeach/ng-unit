import {Component, EventEmitter, Input, Output, Type} from "@angular/core"
import {selectorOf} from "./selector-of.js"
import {propertyMetadata} from "./reflection.js"
import {resolveGlobalObject} from "./global-object.js"
import lodash from "lodash"
const {isNil} = lodash

declare const window: any
declare const global: any

function propertiesDecoratedWith(decorator: any, propertyMetadata: any): string[] {
    return Object.keys(propertyMetadata).filter((key: any) => instanceExistsIn(decorator, propertyMetadata[key]))
}

function instanceExistsIn<T>(object: Type<T>, list: any[]): boolean {
    return list.some(dec => dec instanceof object)
}

export type MockSetup = (mock: any) => void


export function mockProvider(mockProvider: () => any) {
    resolveGlobalObject()._ngUnitMockProvider = mockProvider
}

export function getMockProvider() {
    const {_ngUnitMockProvider, jasmine} = resolveGlobalObject()

    if (!isNil(_ngUnitMockProvider)) { return _ngUnitMockProvider }
    if (!isNil(jasmine)) { return jasmine.createSpy }

    throw new Error("No mocking framework could be automatically detected. You must register a mock provider using mockProvider().")
}

export function mockComponent<T>(constructor: Type<T>, mockSetup: MockSetup = () => {}): any {
    const componentPropertyMetadata = propertyMetadata(constructor)

    const options = {
        selector: selectorOf(constructor),
        template: "<ng-content></ng-content>",
        inputs: propertiesDecoratedWith(Input, componentPropertyMetadata),
        outputs: propertiesDecoratedWith(Output, componentPropertyMetadata),
    }

    const MockComponent = function Mock() {
        const mockProvider = getMockProvider()

        const outputs = options.outputs.reduce((obj, property) => ({...obj, [property]: new EventEmitter() }), {})
        const mockedMethods = getOwnAndInheritedKeys(constructor.prototype).reduce((obj, property) => ({...obj, [property]: mockProvider()}), {})

        const mocked = {...outputs, ...mockedMethods}
        mockSetup(mocked)
        return mocked
    }

    return Component(options as Component)(MockComponent)
}

function getOwnAndInheritedKeys(object: any | null): string[] {
    if (object === null) {
        return []
    }

    return [
        ...Object.getOwnPropertyNames(object).filter(name => name !== "constructor"),
        ...getOwnAndInheritedKeys(Object.getPrototypeOf(object)),
    ]
}
