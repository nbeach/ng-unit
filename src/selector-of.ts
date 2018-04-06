import {Component} from "@angular/core";

export function selectorOf(component: any) {
    const [componentDecorator] = component.__annotations__
        .filter((annotation: any) => annotation.ngMetadataName === "Component");

    return componentDecorator.selector;
}
