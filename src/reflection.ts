import {Type} from "@angular/core"
import "reflect-metadata"

export function getAnnotation(object: Type<any>, annotationType: any): any | undefined {
    const annotations = (object as any).__annotations__ || Reflect.getMetadata("annotations", object) || []
    const [annotation] = annotations
        .filter((attachedAnnotation: any) => attachedAnnotation instanceof annotationType)

    return annotation
}

export function propertyMetadata(object: Type<any>): any {
    return (object as any).propDecorators || (object as any).__prop__metadata__ ||  Reflect.getMetadata("propMetadata", object) || {}
}
