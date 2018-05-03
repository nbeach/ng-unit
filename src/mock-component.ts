import {Component, EventEmitter, Input, Output, Type} from "@angular/core"
import {selectorOf} from "./selector-of"
import {extend, keys, keysIn, reduce, set, some, defaultTo} from "lodash"
import {stub} from "sinon"
import {propertyMetadata} from "./reflection"

let _mockProvider = stub

function propertiesDecoratedWith(decorator: any, propertyMetadata: any): string[] {
    const metadata = defaultTo(propertyMetadata, {})
    return keys(metadata).filter((key: any) => instanceExistsIn(decorator, propertyMetadata[key]))
}

function instanceExistsIn<T>(object: Type<T>, list: any[]): boolean {
    return some(list, (dec: any) => dec instanceof object)
}

export type MockSetup = (mock: any) => void


export function mockProvider(mockProvider: () => any) {
    _mockProvider = mockProvider
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
        const mockedMethods = keysIn(constructor.prototype).reduce((obj, property) => set(obj, property, _mockProvider()), {})

        const mocked = extend({}, outputs, mockedMethods)
        mockSetup(mocked)
        return mocked
    }

    return Component(options as Component)(MockComponent)
}
