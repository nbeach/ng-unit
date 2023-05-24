import {Component, Injectable, Input, Output} from "@angular/core"
import {getAnnotation, propertyMetadata} from "./reflection.js"
import {expect} from "chai"

describe("getAnnotation()", () => {

    it("returns the annotation object for the class", () => {
        @Component({ selector: "foo", template: "<span></span>" })
        class SomeComponent {}

        expect(getAnnotation(SomeComponent, Component).selector).to.equal("foo")
    })


    it("returns undefined if the class is annotated but not with the provided decorator", () => {
        @Injectable()
        class SomeComponent {}

        expect(getAnnotation(SomeComponent, Component)).to.to.be.undefined
    })

    it("returns undefined if the class has no decorators", () => {
        class SomeComponent {}

        expect(getAnnotation(SomeComponent, Component)).to.to.be.undefined
    })
})


describe("propertyMetadata()", () => {

    it("returns metadata for decorated properties", () => {

        class SomeComponent {
            @Input("foo") public one: string = ""
            @Output("bar") public two: string = ""
        }

        const actual = propertyMetadata(SomeComponent)

        expect(actual.one[0].bindingPropertyName).to.equal("foo")
        expect(actual.two[0].bindingPropertyName).to.equal("bar")
    })

    it("returns an empty object when no properties are decorated", () => {
        class SomeComponent {
            public one: string = ""
            public two: string = ""
        }

        const actual = propertyMetadata(SomeComponent)

        expect(actual).to.deep.equal({})
    })

})
