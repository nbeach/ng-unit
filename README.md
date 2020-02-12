# ng-unit &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nbeach/ng-unit/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/ng-unit.svg?style=flat)](https://www.npmjs.com/package/ng-unit) [![Build Status](https://travis-ci.org/nbeach/ng-unit.svg?branch=master)](https://travis-ci.org/nbeach/ng-unit) [![Build Status](https://saucelabs.com/buildstatus/ngunit)](https://saucelabs.com/open_sauce/user/ngunit) [![Coverage Status](https://coveralls.io/repos/github/nbeach/ng-unit/badge.svg?branch=master)](https://coveralls.io/github/nbeach/ng-unit?branch=master)


The boilerplate reducing test utility for Angular. Supports Angular 6 and greater, and running tests in in Chrome, Firefox, Edge, IE11, and Node (via JSDOM).

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
    
## Setup
 
If you are using jasmine for mocking then no setup is needed. ng-unit will automatically use spys when it needs to 
mock methods. If you don't use jasmine for mocking, then you will need to register a provider for mocks before you begin
your tests.

For example to use sinon stubs you would need to do the following before your tests
```typescript
import {mockProvider} from "ng-unit"

mockProvider(() => sinon.stub())
```

In an Angular CLI app you would put this in test.ts

ng-units documentation uses sinon stubs and chai assertions in all of it's examples
    
## Guide
* [Basic Testing](#basic-testing)
  * [A simple test](#a-simple-test)
  * [Simulating events](#simulating-events)
  * [Setting inputs element values](#setting-inputs-element-values)
  * [Setting component inputs](#setting-component-inputs)
  * [Watching component outputs](#watching-component-outputs)
  * [Providing providers](#providing-providers)
  * [Importing other modules](#importing-other-modules)
  * [Using schemas](#using-schemas)
* [Mocking child components](#mocking-child-components)
  * [Interacting with mocked components](#interacting-with-mocked-components)
  * [Mocked components and transclusion](#mocked-components-and-transclusion)
  * [Custom mock providers](#custom-mock-providers)
  * [Using real child components](#using-real-child-components)
* [Falling back to TestBed functionality](#falling-back-to-testbed-functionality)
* [Usage without test setup](#usage-without-test-setup)


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
  const subject = testComponent(SubjectComponent).begin()

  trigger(element('input'), 'click')
  detectChanges()

  expect(subject.clicked).to.be.true
})
```

Additionally you can optionally pass an object with properties to be added to the event object.

```typescript
trigger(element('input'), 'keydown', { charCode: 13 })
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

These work with any DOM element reference, not just those returned by ng-units selection methods. They can be used 
in traditional TestBed tests if desired.

#### Setting component inputs
Initial values for component inputs can be set prior to component instantiation (so they are properly present at 
OnInit time) with the test builder method`.setInput()`.

```typescript
testComponent(SubjectComponent)
    .setInput("label", "presents")
    .begin()
```

Once `.begin()` is called you can change the input value with the `setInput()` function.  

```typescript
import {testComponent, setInput} from "ng-unit"

testComponent(SubjectComponent)
    .setInput("label", "fizz")
    .begin()

setInput("label", "buzz")
```

Unlike directly setting input properties on the component under test directly, using `setInput` will properly trigger
lifecycle methods such as `ngOnChanges()`. Take note that, in order to change an input after after `.begin()` is called 
you must have given it an initial value while setting up the test.

#### Watching component outputs
Component outputs can be watched prior to component instantiation (so values emitted at OnInit time are not missed) 
with `.onOutput()`.

```typescript
testComponent(SubjectComponent)
    .onOutput("save", event => persist(event))
    .begin()
```

Once `.begin()` is called you can add new output watches with `onOutput()` 

```typescript
import {testComponent, onOutput} from "ng-unit"

testComponent(SubjectComponent)
    .onOutput("save", event => persist(event))
    .begin()

onOutput("save", event => console.log(event))
```

#### Providing providers
Providers for services and other things can be registered with `.providers()`

```typescript
testComponent(SubjectComponent)
    .providers([
      { provide: FooService, useValue: mockFooService },
      { provide: BarService, useValue: new BarService() },
    ])
    .begin()
```

#### Importing other modules
Other modules that your component under test depends upon can be imported using `.import()`

```typescript
testComponent(SubjectComponent)
  .import([FormsModule, ReactiveFormsModule])
  .begin()
```


#### Using schemas
[Schemas](https://angular.io/api/core/NgModule#schemas) can be registered with `.schemas()`

```typescript
testComponent(SubjectComponent)
    .schemas([CUSTOM_ELEMENTS_SCHEMA])
    .begin()
```
  
## Mocking child components
Child components can be mocked during test setup with `.mock()`. When mocked a component will have a blank template
and require none of it's normal imports, providers, or child components to be registered for the test. This isolates 
your tests from needing any knowledge of the children beyond what inputs you provide them, what outputs you subscribe 
to, and any methods you call on the children directly.

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

By default uses sinon for mocking functions. If you use Jasmine or another mocking library you can provide a factory 
for your own mocks using `mockProvider()`.


#### Interacting with mocked components
Child components can be selected with the  `component()` and `components()` functions. You can query for children 
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
      
  expect(component(ChildComponent).greeting).to.equal("Hello World!")
  expect(component(".greeting").greeting).to.equal("Hello World!")
})
```

Mock components have properties that correspond to their real versions to inputs, outputs, and methods. 

You can assert that an input was set to a value by selecting the mock and asserting on the input property value.
```typescript
expect(component(ChildComponent)).greeting.to.equal("Hello World")
```

You can cause the mock child to emit and output by selecting the component and using the output event emitter that is 
created on the mock.
```typescript
component(ChildComponent).someOutput.emit("foo")
```

You can cause the mock child to emit and output by selecting the component and asserting on the mocked method.
```typescript
expect(component(ChildComponent).someMethod).to.have.been.calledWith("bar")
```

Mocked methods can be setup before the component under test is instantiated, so you can set their initial return values.
```typescript
testComponent(SubjectComponent)
  .mock([FooComponent])
  .setupMock(FooComponent, fooMock => fooMock.getValue.returns("cake"))
  .begin()
```


#### Mocked components and transclusion
Mocked components automatically render and transcluded content so you can assert against it.

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

#### Custom mock providers
By default ng-unit uses sinon stubs for mocking functions. You can configure your own mock provider if you prefer to 
use Jasmine spys or another mocking framework.

```typescript
import {mockProvider} from "ng-unit"

mockProvider(() => jasmine.createSpy())
```

#### Using real child components
If you want your test to utilize a real instances of child components configure them with `.use()`. This can be useful 
for doing integration tests that test numerous components.  Take note that using a real child component also requires 
you to register any imports, providers, and child components the component uses just like you were setting up a 
traditional test bed test. 

```typescript
testComponent(SubjectComponent)
  .use([FooComponent, BarComponent])
  .begin()
```

## Falling back to TestBed functionality

In the event that ng-unit does not allow you to test something in the desired way you can always fall back to TestBed
functionality by accessing the component fixture using `fixture()`.

```typescript
import {testComponent, fixture} from "ng-unit"

it("allows accessing the component fixture", () => {
  testComponent(SubjectComponent).begin()
  
  fixture().autoDetectChanges(true);
})
```

## Usage without test setup

Even if you don't wish to use ng-units test setup, you can still take advantage of it's mocking, component selection, and 
assignment functionality.

Since `setTextInputValue()` and the other input setting functions use DOM elements, it allows you to use elements 
selected using test beds selection methods.
```typescript
import {setTextInputValue} from "ng-unit"

const input = fixture.debugElement.query(By.css("input")).nativeElement
setTextInputValue(input, "foo")
```

Real or mocked child components can be selected even when not using `testComponent()` by utilizing the `selectComponent()` and `selectComponents()`
functions and providing the test fixture.

```typescript
import {testComponent, testComponents} from "ng-unit"

const fixture = TestBed.createComponent(ComponentUnderTest)
const singleComponent: MessageComponent = selectComponent(MessageComponent, fixture)
const multipleComponents: Array<MessageComponent>  = selectComponents(MessageComponent, fixture)
```

Mocking components can be accomplished by using the `mockComponent()` function.
```typescript
import {mockComponent} from "ng-unit"

TestBed.configureTestingModule({
    declarations: [ComponentUnderTest, mockComponent(ChildCmponent)],
})
```

## Thanks to
 [SauceLabs](https://saucelabs.com/) for generously providing our platform for cross browser testing

