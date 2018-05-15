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
})
