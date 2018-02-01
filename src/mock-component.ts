import {Component, EventEmitter, Input, Output, Type} from "@angular/core";
import {selectorOf} from "./selector-of";
import "reflect-metadata";
import {defaultTo, extend, keys, keysIn, reduce, set, some} from "lodash";
import {stub} from "sinon";

function propertiesDecoratedWith(decorator: any, propertyMetadata: any): string[] {
    const metadata = defaultTo(propertyMetadata, {});
    return keys(metadata).filter((key: any) => instanceExistsIn(decorator, propertyMetadata[key]));
}

function instanceExistsIn<T>(object: Type<T>, list: any[]): boolean {
    return some(list, (dec: any) => dec instanceof object)
}

export function mockComponent<T>(constructor: Type<T>, mockSetup: (mock: any) => void = () => {}, mockProvider: () => any = stub): any {
    const propertyMetadata = Reflect.getMetadata('propMetadata', constructor);

    const options = {
        selector: selectorOf(constructor),
        template: '',
        inputs: propertiesDecoratedWith(Input, propertyMetadata),
        outputs: propertiesDecoratedWith(Output, propertyMetadata),
    };

    const MockComponent = function() {
        const outputs = reduce(options.outputs, (obj, property) => set(obj, property, new EventEmitter<any>()), {});
        const mockedMethods = keysIn(constructor.prototype).reduce((obj, property) => set(obj, property, mockProvider()), {});

        const mocked = extend({}, outputs, mockedMethods);
        mockSetup(mocked);
        return mocked;
    };

    return Component(options as Component)(MockComponent);
}
