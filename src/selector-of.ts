import {Component} from "@angular/core";
import 'reflect-metadata';

export function selectorOf(component: any) {
    const [componentDecorator] = Reflect
        .getMetadata('annotations', component)
        .filter((annotation: any) => annotation instanceof Component);

    return componentDecorator.selector;
}
