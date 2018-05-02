import {getAnnotation} from "./reflection"
import {Component, Type} from "@angular/core"

export function selectorOf(component: Type<any>) {
    return getAnnotation(component, Component).selector
}


