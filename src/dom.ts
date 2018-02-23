import {ComponentFixture} from "@angular/core/testing";
import {isString} from "lodash";
import {By} from "@angular/platform-browser";
import {selectorOf} from "./selector-of";
import {Type} from "@angular/core";

export function setInputValue<T>(element: any, value: string): void {
    element.value = value;
    element.dispatchEvent(new Event('input'));
    element.dispatchEvent(new Event('change'));
}

export function setSelectValue<T>(element: any, value: string): void {
    element.value = value;
    element.dispatchEvent(new Event('change'));
}

export const setTextAreaValue = setInputValue;

export function setCheckboxValue<T>(element: any, checked: boolean): void {
    if(checked) {
        element.setAttribute("checked", "");
    } else {
        element.removeAttribute("checked");
    }

    element.dispatchEvent(new Event("change"));
}

export function setRadioButton<T>(element: any, selected: boolean): void {
    element.checked = selected;
    element.dispatchEvent(new Event("change"));
}

export function blur<T>(element: any): void {
    element.dispatchEvent(new Event('blur'));
}

export function focus<T>(element: any): void {
    element.dispatchEvent(new Event('focus'));
}

export function selectComponent<T>(selectorOrConstructor: string | Type<any>, fixture: ComponentFixture<T>): any {
    const selector = isString(selectorOrConstructor) ? selectorOrConstructor : selectorOf(selectorOrConstructor);
    return fixture.debugElement.query(By.css(selector)).componentInstance;
}

export function selectComponents<T>(selectorOrConstructor: string | Type<any>, fixture: ComponentFixture<T>): any[] {
    const selector = isString(selectorOrConstructor) ? selectorOrConstructor : selectorOf(selectorOrConstructor);
    return fixture.debugElement.queryAll(By.css(selector)).map(element => element.componentInstance);
}

