# ng-unit &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nbeach/ng-unit/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/ng-unit.svg?style=flat)](https://www.npmjs.com/package/ng-unit) [![Build Status](https://travis-ci.org/nbeach/ng-unit.svg?branch=master)](https://travis-ci.org/nbeach/ng-unit) [![Build Status](https://saucelabs.com/buildstatus/ngunit)](https://saucelabs.com/beta/builds/6b93d9263e9b49338e56e1834170d25c) [![Coverage Status](https://coveralls.io/repos/github/nbeach/ng-unit/badge.svg?branch=coverage)](https://coveralls.io/github/nbeach/ng-unit?branch=coverage)<a href="https://saucelabs.com" target="_blank"><img src="saucelabs.svg" alt="SauceLabs" align="right" height="45"></a>


The boilerplate reducing test utility for Angular. Supports Angular version 2.4.10 and greater, and running tests in in Chrome, Firefox, Edge, IE11, and Node (via JSDOM).

## What is ng-unit?
ng-unit seeks to simplify unit testing of Angular components by providing automated mocking of child components,
streamlined test setup, and easier DOM interaction to drastically the amount of boilerplate code needed. 


#### An example
Suppose we want to mock out the child component used in the below component so we can assert that the component under 
test binds the correct value to its input.
```typescript
@Component({
    selector: "parent",
    template: `<child [input]="boundToInput"></child>`,
})
class ComponentUnderTest {
    public boundToInput: string
}
```

Normally you would have to do something like this:
```typescript
import {Component, Input, Output} from "@angular/core"
import {TestBed} from "@angular/core/testing"
import {By} from "@angular/platform-browser"

it("sets the child components input", () => {
    @Component({ selector: "child" })
    class MockChildComponent {
        @Input() private input: string
    }
    
    TestBed.configureTestingModule({
        declarations: [ComponentUnderTest, MockChildComponent],
    })
    
    const fixture = TestBed.createComponent(ComponentUnderTest)
    const subject = fixture.componentInstance
    fixture.detectChanges()
    
    subject.boundToInput = "foo"
    fixture.detectChanges()
    
    const component = fixture.debugElement.query(By.css("child")).componentInstance
    expect(component.input).to.equal("foo")
})
```

With ng-unit this simply becomes:

```typescript
import {testComponent, detectChanges, component} from "ng-unit"

it("sets the child components input", () => {
    const subject = testComponent(ComponentUnderTest)
        .mock([ChildComponent])
        .begin()
    
    subject.boundToInput = "foo"
    detectChanges()
    
    expect(component(ChildComponent).input).to.equal("foo")
})
```


## Installation
    npm install --save-dev ng-unit
    


## Guide
* [Basic Testing](#basic-testing)
  * [A simple test](#a-simple-test)
  * [Simulating DOM events](#simulating-dom-events)
  * [Interacting with DOM inputs](#interacting-with-DOM-inputs)
  * [Using real child components](#using-real-child-components)
  * [Providing providers](#providing-providers)
* [Mocking Components](#mocking-components)
  * [Mocking child components](#mocking-child-components)
  * [Mocked components and transclusion](#mocked-components-and-transclusion)
  * [Automatic component mocking](#automatic-component-mocking)
  * [Configuring mock components](#configuring-mock-components)
* [Interacting with child components](#interacting-with-child-components)
* [Setting component inputs](#setting-component-inputs)
* [Watching component outputs](#watching-component-outputs)
* [Testing without test setup](#testing-without-test-setup)
* [Thanks to](#thanks-to)

## Basic Testing

#### A simple test
ng-unit greatly simplifies setup and mocking for Angular TestBed tests. In the simplest scenario you simply need to
pass the component to be tested to `testComponent()` and invoke `.begin()` to instantiate your component. You can then
use `element()` to query the DOM for elements.

```typescript
import {testComponent, element} from 'ng-unit'

 @Component({
    selector: "tested",
    template: `<span id="greeting">Hello World</span>`
})
class SubjectComponent { }

it("has a greeting message", () => {
  testComponent(SubjectComponent).begin()
  expect(element("#greeting")).to.have.text("Hello World")
});
```

You can also select multiple elements with `elements('.selector')`.

#### Simulating events
You can simulate DOM events by using `trigger()`.

```typescript
import {testComponent, element, trigger, detectChanges} from "ng-unit"

@Component({
    selector: "tested",
    template: `<button (click)="clicked = true">Click Me</button>`
})
class SubjectComponent {
    public clicked = false
}

it("fires a click event handler", () => {
  const {subject} = testComponent(SubjectComponent).begin()

  trigger(element('input'), 'click')
  detectChanges()

  expect(subject.clicked).to.be.true
})
```

#### Setting inputs element values
Value setter convenience methods for DOM inputs are provided. They automatically fire the appropriate change/input 
events on the input being set.

```typescript
setTextInputValue(element("input[type=text]"), "Sasquatch") //Text field now has value "Sasquatch"
setTextAreaValue(element("textarea"), "Sasquatch") //Text area now has value "Sasquatch"
setCheckboxValue(element("input[type=check]"), true) //Checkbox is now checked
setRadioButton(element("input[type=radio]"), true) //Radio button is now selected
setSelectValue(element("select"), "Hancock") //Dropdown list now has the value "Hancock" selected
```

These work with any DOM element reference, not just those returned by ng-units selection methods, so they can be used 
in traditional TestBed tests if desired.

## Setting component inputs
Initial values for component inputs can be set prior to component instantiation (so they are properly present at 
OnInit time) with `.setInput()`.

```typescript
testComponent(SubjectComponent)
    .setInput("label", "presents")
    .begin()
```

Once `.begin()` is called you can set the input with the `setInput()` method. Take note that, in order to change an 
input after after `.begin()` is called you must have given it an initial value while setting up the test.

```typescript
import {testComponent, setInput} from "ng-unit"

testComponent(SubjectComponent)
    .setInput("label", "fizz")
    .begin()

setInput("label", "buzz")
```

## Watching component outputs
Component outputs can be watched prior to component instantiation (so values emitted at OnInit time are not missed) 
with `.onOutput()`.

```typescript
testComponent(SubjectComponent)
    .onOutput("save", event => persist(event))
    .begin()
```

Once `.begin()` is called you can add new output watches with `onChanges()` 

```typescript
import {testComponent, onChanges} from "ng-unit"

testComponent(SubjectComponent)
    .onOutput("save", event => persist(event))
    .begin()

onChanges("save", event => console.log(event))
```

#### Providing providers
Providers can be registered with `.providers()`

```typescript
testComponent(SubjectComponent)
    .providers([
      { provide: FooService, useValue: mockFooService },
      { provide: BarService, useValue: new BarService() },
    ])
    .begin()
```
  
#### Importing other modules providers
Other modules can be imported using `.import()`

```typescript
testComponent(SubjectComponent)
  .import([FormsModule, ReactiveFormsModule])
  .begin()
```

## Mocking child components

Child components can be mocked dueing test setup with `.mock()`

```typescript
import {testComponent, element, detectChanges} from "ng-unit"

@Component({
    selector: "tested",
    template: `
      <child-component [someInput]=""></child-component>
    `
})
class SubjectComponent {
}

it("renders transcluded content", () => {
  testComponent(SubjectComponent)
    .mock([ChildComponent])
    .begin()

  expect(component("#transcluded").someInput).to.equal("")
})
```

By default uses sinon for mocking functions. You can provide a factory for your own mocks.


#### Interacting with mocked child components
Child components can be accessed with the  `component()` and `components()` functions. You can query for children 
using either CSS selector of the Component type.

```typescript
import {testComponent, element} from 'ng-unit'

@Component({
    selector: "child",
    template: `<span">{{message}}</span>`
})
class ChildComponent { 
    @Input() public message: string
}

@Component({
    selector: "tested",
    template: `<child class="greeting" [message]="greeting"></child>`
})
class SubjectComponent { 
    private greeting = "Hello World!"
}

it("has a greeting message", () => {
  testComponent(SubjectComponent)
      .mock([ChildComponent])
      .begin()
      
  expect(component(ChildComponent)).to.equal("Hello World")
  expect(component(".greeting")).to.equal("Hello World")
});
```

#### Mocked components and transclusion
Mocked components render any transcluded content

```typescript
import {testComponent, element, detectChanges} from "ng-unit"

@Component({
    selector: "tested",
    template: `
      <child-component>
        <span id="transcluded">This is transcluded!</span>
      </child-component>
    `
})
class SubjectComponent {
}

it("renders transcluded content", () => {
  testComponent(SubjectComponent).begin()

  expect(element("#transcluded")).to.have.text("This is transcluded!")
})
```

## Configuring mock components

```typescript
testComponent(SubjectComponent)
  .mock([FooComponent])
  .setupMock(FooComponent, fooMock => fooMock.getValue.returns("cake"))
  .begin()
```

## Custom mock provider
By default ng-unit uses sinon stubs for mocking functions. You can configure your own mock provider if you prefer to 
use Jasmine spys or another mocking framework.

```typescript
import {mockProvider} from "ng-unit"

mockProvider(() => jasmine.createSpy())
```

## Using real child components
If you want your test to utilize a real instances of child components configure them with `.use()`.

```typescript
testComponent(SubjectComponent)
  .use([FooComponent, BarComponent])
  .begin()
```

## Usage without test setup

Even if you don't wish to use ng-units test setup, you can still take advantage of it's mocking, selection, and 
assignment methods.

## Thanks to
Cross-browser Testing Platform and Open Source <3 Provided by [SauceLabs](https://saucelabs.com/)

