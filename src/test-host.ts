import {Component, Type} from "@angular/core";
import {MockSetup} from "./mock-component";
import {selectorOf} from "./selector-of";
import {first} from "function-composition/src/function-composition";
import {uniq, chain} from "lodash";

const createElement: (html: string) => Element = require("dom-create-element-query-selector");

export interface OutputWatch {
    name: string,
    action: (event: any) => void
}

export interface MockTypeAndSetup {
    type: Type<any>,
    setup: MockSetup
}

interface Consumer<T> {
    (val: T): void
}

export default function createTestHostComponent<T>(subject: Type<T>, inputInitializations: Map<string, any>, outputWatches: OutputWatch[]): Type<any> {
    const inputsNames = Array.from(inputInitializations.keys());
    const outputNames = uniq(outputWatches.map(watch => watch.name));

    @Component({ template: createComponentTag(subject, inputsNames, outputNames) })
    class TestHostComponent {
        constructor() {
            addInputProperties(inputInitializations, this);
            addOutputWatches(outputWatches, this);
        }
    }

    return TestHostComponent;
}

function addInputProperties(inputInitializations: Map<string, any>, object: any) {
    const inputs = Array.from(inputInitializations.entries());
    inputs.forEach(input => object[input[0]] = input[1]);
}

function addOutputWatches(outputWatches: OutputWatch[], object: any) {
    chain(outputWatches)
        .groupBy(watch => watch.name)
        .toPairs().value()
        .forEach(([name, watches]) => object[name] = invokeAll(extractActions(watches)));
}

function invokeAll<T>(methods: Consumer<T>[]) {
    return (argument: T) => {
        methods.forEach(method => method(argument));
    }
}

function extractActions(watches: OutputWatch[]) {
    return watches.map(watch => watch.action);
}

function createComponentTag<T>(component: Type<T>, inputs: string[], outputs: string[]): string {
    return first(selectorOf)
        .then(createElement)
        .then(element => element.outerHTML)
        .then(addAttributes(inputs, input => `[${input}]="${input}"`))
        .then(addAttributes(outputs, output => `(${output})="${output}($event)"`))
        .apply(component);
}

function addAttributes(attributeNames: string[], pattern: (attribute: string) => string) {
    return (tag: string) => {
        const attributes = attributeNames.map(pattern).join(" ");
        return tag.replace(/></, ` ${attributes}><`);
    }
}


