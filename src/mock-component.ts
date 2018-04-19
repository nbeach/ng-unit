import {Component, EventEmitter, Input, Output, Type} from "@angular/core"
import {selectorOf} from "./selector-of"
import {extend, keys, keysIn, reduce, set, some} from "lodash"
import {stub} from "sinon"

function propertiesDecoratedWith(decoratorName: string, propertyMetadata: any): string[] {
    return keys(propertyMetadata)
        .filter(key => propertyMetadataIncludesDecorator(decoratorName, propertyMetadata[key]))
}

function propertyMetadataIncludesDecorator( decoratorName: string, propertyMetadata: any) {
    return some(propertyMetadata, decorator =>  decorator.ngMetadataName === decoratorName)
}

export type MockSetup = (mock: any) => void

export function mockComponent<T>(constructor: Type<T>, mockSetup: MockSetup = () => {}, mockProvider: () => any = stub): any {
    const propertyMetadata = (constructor as any).__prop__metadata__

    const options = {
        selector: selectorOf(constructor),
        template: "<ng-content></ng-content>",
        inputs: propertiesDecoratedWith("Input", propertyMetadata),
        outputs: propertiesDecoratedWith("Output", propertyMetadata),
    }

    const MockComponent = () => {
        const outputs = reduce(options.outputs, (obj, property) => set(obj, property, new EventEmitter<any>()), {})
        const mockedMethods = keysIn(constructor.prototype).reduce((obj, property) => set(obj, property, mockProvider()), {})

        const mocked = extend({}, outputs, mockedMethods)
        mockSetup(mocked)
        return mocked
    }

    return Component(options as Component)(MockComponent)
}
