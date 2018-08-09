import {Component} from "@angular/core"
import {selectorOf} from "./index"
import {expect} from "chai"

describe("selectorOf", () => {

    it("returns the selector for the component", () => {
        @Component({
            selector: ".abc123",
        })
        class SomeComponent {}

        expect(selectorOf(SomeComponent)).to.equal(".abc123")
    })

    it("throws an error if no selector is set", () => {
        @Component({})
        class SomeComponent {}

        expect(() => selectorOf(SomeComponent)).to.throw("Component does not have a selector set")
    })

    it("throws an error if object is not a component", () => {
        class SomeClass {}

        expect(() => selectorOf(SomeClass)).to.throw("Provided value is not a Component")
    })
})
