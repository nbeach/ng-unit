import {Component} from "@angular/core";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {
    selectComponent, selectComponents, setCheckboxValue, setInputValue, setRadioButton, setSelectValue,
    setTextAreaValue
} from "./dom";
import {FormsModule} from "@angular/forms";
import * as chai from 'chai';
import {expect} from 'chai';
import * as chaiDom from 'chai-dom';

chai.use(chaiDom);

describe("DOM", () => {
    let subject: TestComponent,
        subjectElement: any,
        fixture: ComponentFixture<TestComponent>;

    @Component({
        selector: 'parent',
        template: `
            <input type="text" [(ngModel)]="textValue">
            <textarea [(ngModel)]="textValue"></textarea>
            <span id="text-value-display">{{textValue}}</span>
            
            <input type="checkbox" [checked]="checked" (change)="checked = !checked">
            <span id="check-value-display">{{checked ? "true" : "false" }}</span>
            
            <select [(ngModel)]="selectValue">
                <option></option>
                <option>Hello</option>
                <option>Goodbye</option>
            </select>
            <span id="select-value-display">{{selectValue}}</span>
            
            <input id="radio1" name="radio" value="Yes" type="radio" [checked]="radioValue === 'Yes'" (change)="radioButtonChanged($event)">
            <input id="radio2" name="radio" value="No" type="radio" [checked]="radioValue === 'No'" (change)="radioButtonChanged($event)">
            <span id="radio-value-display">{{radioValue}}</span>
            <child id="first-born"></child>
            <child id="second-born"></child>
        `
    })
    class TestComponent {
        private textValue: string;
        private checked: boolean;
        private selectValue: string;
        private radioValue: string;

        private radioButtonChanged(event: any) {
            if(event.target.checked) {
                this.radioValue = event.target.value;
            } else if(event.target.value === this.radioValue) {
                this.radioValue = null;
            }
        }
    }

    @Component({
        selector: "child",
        template: ""
    })
    class ChildComponent {
        public message = "I'm the child!";
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent, ChildComponent],
            imports: [FormsModule]
        });

        fixture = TestBed.createComponent(TestComponent);
        subject = fixture.componentInstance;
        subjectElement = fixture.debugElement.nativeElement;
        fixture.detectChanges();
    });

    afterEach(TestBed.resetTestingModule);

    it('setInputValue() sets the value of <input type="text"> elements', () => {
        setInputValue(subjectElement.querySelector('input'), "hello world!");
        fixture.detectChanges();

        expect(subjectElement.querySelector('#text-value-display')).to.have.text("hello world!");
    });

    it('setTextAreaValue() sets the value of <textarea> elements', () => {
        setTextAreaValue(subjectElement.querySelector('textarea'), "hello world!");
        fixture.detectChanges();

        expect(subjectElement.querySelector('#text-value-display')).to.have.text("hello world!");
    });

    it('setSelectValue() sets the value of <select> elements', () => {
        setSelectValue(subjectElement.querySelector('select'), "Goodbye");
        fixture.detectChanges();

        expect(subjectElement.querySelector('#select-value-display')).to.have.text("Goodbye");
    });

    it('setRadioButton() sets the value of <input type="radio"> elements', () => {
        setRadioButton(subjectElement.querySelector('#radio1'), true);
        fixture.detectChanges();
        expect(subjectElement.querySelector('#radio-value-display')).to.have.text("Yes");

        setRadioButton(subjectElement.querySelector('#radio2'), true);
        fixture.detectChanges();
        expect(subjectElement.querySelector('#radio-value-display')).to.have.text("No");

        setRadioButton(subjectElement.querySelector('#radio2'), false);
        fixture.detectChanges();
        expect(subjectElement.querySelector('#radio-value-display')).to.have.text("");
    });

    it('setCheckboxValue() sets the value of <input type="check"> elements', () => {
        setCheckboxValue(subjectElement.querySelector('input[type=checkbox]'), true);
        fixture.detectChanges();
        expect(subjectElement.querySelector('#check-value-display')).to.have.text("true");

        setCheckboxValue(subjectElement.querySelector('input[type=checkbox]'), false);
        fixture.detectChanges();
        expect(subjectElement.querySelector('#check-value-display')).to.have.text("false");
    });

    describe("selectComponent() selects a component by", () => {

        it("CSS selector", () => {
            expect(selectComponent('#first-born', fixture).message).to.equal("I'm the child!")
        });

        it("type", () => {
            expect(selectComponent(ChildComponent, fixture).message).to.equal("I'm the child!")
        });

    });

    describe("selectComponents() selects components by", () => {

        it("CSS selector", () => {
            const children = selectComponents('child', fixture);
            expect(children[0].message).to.equal("I'm the child!");
            expect(children[1].message).to.equal("I'm the child!");
        });

        it("type", () => {
            const children = selectComponents(ChildComponent, fixture);
            expect(children[0].message).to.equal("I'm the child!");
            expect(children[1].message).to.equal("I'm the child!");
        });

    });

});