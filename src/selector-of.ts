import {getAnnotation} from "./reflection.js"
import {Component, Type} from "@angular/core"
import {throwIfNil} from "./exception.js"

export function selectorOf(component: Type<any>) {
    const annotation = getAnnotation(component, Component)
    throwIfNil(annotation, "Provided value is not a Component")

    const selector = annotation.selector
    throwIfNil(selector, "Component does not have a selector set")

    return selector
}


