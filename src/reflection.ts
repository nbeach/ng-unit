import {Type} from "@angular/core"
import "reflect-metadata"

function postV5Annotations(object: any): any | null {
    return Reflect.getMetadata("annotations", object)
}

function preV5Annotations(object: any): any | null {
    return object.__annotations__
}

export function getAnnotation(object: Type<any>, annotation: any): any {
    const annotations = preV5Annotations(object) || postV5Annotations(object)
    return annotations.filter((attachedAnnotation: any) => attachedAnnotation instanceof annotation)[0]
}
