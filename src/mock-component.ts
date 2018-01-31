import {Component, EventEmitter, Input, Output, Type} from "@angular/core";
import {selectorOf} from "./selector-of";
import "reflect-metadata";
import {defaultTo, extend, keys, keysIn, reduce, set, some, values} from "lodash";
import {stub} from "sinon";

function propertiesDecoratedWith(decorator: any, propertyMetadata: any): string[] {
    const metadata = defaultTo(propertyMetadata, {});
    return keys(metadata).filter((key: any) => instanceExistsIn(decorator, propertyMetadata[key]));
}

function instanceExistsIn<T>(object: Type<T>, list: any[]): boolean {
    return some(list, (dec: any) => dec instanceof object)
}

export function mockComponent<T>(constructor: Type<T>, mockProvider: () => any = stub): any {
    const propertyMetadata = Reflect.getMetadata('propMetadata', constructor);

    const options = {
        selector: selectorOf(constructor),
        template: '',
        inputs: propertiesDecoratedWith(Input, propertyMetadata),
        outputs: propertiesDecoratedWith(Output, propertyMetadata),
    };

    const outputs = reduce(options.outputs, (obj, property) => set(obj, property, new EventEmitter<any>()), {});
    const mockedMethods = keysIn(constructor.prototype).reduce((obj, property) => set(obj, property, mockProvider()), {});
    const destructor = { ngOnDestroy: () => values(outputs).forEach((output: EventEmitter<any>) => output.complete()) } ;

    const MockComponent = function() {};
    MockComponent.prototype = extend({}, outputs, mockedMethods, destructor);

    return Component(options as Component)(MockComponent);
}
