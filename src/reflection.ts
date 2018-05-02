import {Type} from "@angular/core"
import "reflect-metadata"

export function getAnnotation(object: Type<any>, annotation: any): any {
    const annotations = (object as any).__annotations__ ||  Reflect.getMetadata("annotations", object)
    return annotations.filter((attachedAnnotation: any) => attachedAnnotation instanceof annotation)[0]
}

export function propertyMetadata(object: Type<any>): any {
    return (object as any).__prop__metadata__ ||  Reflect.getMetadata("propMetadata", object)
}
