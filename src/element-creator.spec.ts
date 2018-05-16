import createElement from "./element-creator"
import {expect} from "chai"

describe("createElement()", () => {

    describe("creates elements with", () => {

        it("tag names", () => {
            const element = createElement("some-element")
            expect(element.tagName).to.equal("SOME-ELEMENT")
        })

        it("ids", () => {
            const element = createElement("#foo-bar")
            expect(element).to.have.id("foo-bar")
        })

        it("classes", () => {
            const element = createElement(".foo-bar.cake-pie")
            expect(element).to.have.class("foo-bar")
            expect(element).to.have.class("cake-pie")
        })

        describe("attributes", () => {

            it("without values", () => {
                const element = createElement("[foo-bar]")
                expect(element).to.have.attribute("foo-bar", "")
            })


            it("with values", () => {
                const element = createElement("[foo-bar='cake']")
                expect(element).to.have.attribute("foo-bar", "cake")
            })

        })

        it("complex selectors", () => {
            const element = createElement("some-element#indentity.foo.bar[cake='pie'][fudge]")
            expect(element.tagName).to.equal("SOME-ELEMENT")
            expect(element).to.have.class("foo")
            expect(element).to.have.class("bar")
            expect(element).to.have.attribute("cake", "pie")
            expect(element).to.have.attribute("fudge", "")
        })

    })

})
