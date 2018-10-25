import {Component, EventEmitter, Input, Output, Type} from "@angular/core"
import {selectorOf} from "./selector-of"
import {extend, keys, keysIn, reduce, set, some} from "lodash"
import {propertyMetadata} from "./reflection"
import isNil = require("lodash/fp/isNil")
import {resolveGlobalObject} from "./global-object"

declare const window: any
declare const global: any

function propertiesDecoratedWith(decorator: any, propertyMetadata: any): string[] {
    return keys(propertyMetadata).filter((key: any) => instanceExistsIn(decorator, propertyMetadata[key]))
}

function instanceExistsIn<T>(object: Type<T>, list: any[]): boolean {
    return some(list, (dec: any) => dec instanceof object)
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

    const MockComponent = () => {
        const outputs = reduce(options.outputs, (obj, property) => set(obj, property, new EventEmitter<any>()), {})
        const mockedMethods = keysIn(constructor.prototype).reduce((obj, property) => set(obj, property, getMockProvider()()), {})

        const mocked = extend({}, outputs, mockedMethods)
        mockSetup(mocked)
        return mocked
    }

    return Component(options as Component)(MockComponent)
}
