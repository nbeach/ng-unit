# ng-unit &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nbeach/ng-unit/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/ng-unit.svg?style=flat)](https://www.npmjs.com/package/ng-unit) [![Build Status](https://travis-ci.org/nbeach/ng-unit.svg?branch=master)](https://travis-ci.org/nbeach/ng-unit) [![Coverage Status](https://coveralls.io/repos/github/nbeach/ng-unit/badge.svg?branch=coverage)](https://coveralls.io/github/nbeach/ng-unit?branch=coverage)

The boilerplate reducing test utility for Angular.

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
it("sets the child components input", () => {
    @Component({ selector: "child" })
    class MockChildComponent {
        @Input() private input: string
    }
    
    TestBed.configureTestingModule({
        declarations: [ParentComponent, MockChildComponent],
    })
    
    const fixture = TestBed.createComponent(ParentComponent)
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
it("sets the child components input", () => {
    const subject = testComponent(ComponentUnderTest)
      .mock([ChildComponent])
      .begin();

    subject.boundToInput = "foo"
    detectChanges()
    
    expect(child(ChildComponent).input).to.equal("foo")
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

## Basic Testing

#### A simple test
ng-unit greatly simplifies setup and mocking for Angular TestBed tests. In the simplest scenario you simply need to pass the component to be tested to `testComponent()` and invoke `.begin()` to instantiate your component. You can then use `element()` to query the DOM for elements.

```typescript
import {testComponent, element} from 'ng-unit';

 @Component({
    selector: "tested",
    template: `<span id="greeting">Hello World</span>`
})
class SubjectComponent { }

it("has a greeting message", () => {
  testComponent(SubjectComponent).begin();
  expect(element("#greeting")).to.have.text("Hello World");
});
```

You can also select multiple elements with `elements('.selector')`.

#### Simulating DOM events
You can simulate DOM events by using `trigger()`.

```typescript
import {testComponent, element, trigger, detectChanges} from 'ng-unit';

@Component({
    selector: 'tested',
    template: `<button (click)="clicked = true">Click Me</button>`
})
class SubjectComponent {
    public clicked = false;
}

it("fires a click event handler", () => {
  const {subject} = testComponent(SubjectComponent).begin();

  trigger(element('input'), 'click');
  detectChanges();

  expect(subject.clicked).to.be.true;
});
```

#### Interacting with DOM inputs
Value setter convenience methods for DOM inputs are provided. They automatically fire the appropriate change/input events on the input being set.

```typescript
setInputValue(element("input[type=text]"), "Sasquatch"); //Text field now has value "Sasquatch"
setTextAreaValue(element("textarea"), "Sasquatch"); //Text area now has value "Sasquatch"
setCheckboxValue(element("input[type=check]"), true); //Checkbox is now checked
setRadioButton(element("input[type=radio]"), true); //Radio button is now selected
setSelectValue(element("select"), "Hancock"); //Dropdown list now has the value "Hancock" selected
```

These work with any DOM element reference, not just those returned by ng-units selection methods, so they can be used in traditional TestBed tests if desired.

#### Using real child components
If you want your test to utilize a real instances of child components configure them with `.use()`.

```typescript
testComponent(SubjectComponent)
  .use([FooComponent, BarComponent])
  .begin();
```

#### Providing providers
Providers can be registered with `.providers()`

  ```typescript
  testComponent(SubjectComponent)
    .providers([
      { provide: FooService, useValue: mockFooService },
      { provide: BarService, useValue: new BarService() },
    ])
    .begin();
  ```

## Mocking Components

#### Mocking child components
By default uses sinon for mocking. You provide a factory for your own mocks.

#### Mocked components and transclusion
Mocked components render any transcluded content

```typescript
import {testComponent, element, detectChanges} from 'ng-unit';

@Component({
    selector: 'tested',
    template: `
      <child-component>
        <span id="transcluded">This is transcluded!</span>
      </child-component>
    `
})
class SubjectComponent {
}

it("renders transcluded content", () => {
  testComponent(SubjectComponent).begin();

  expect(element('#transcluded')).to.have.text("This is transcluded!");
});
```

#### Automatic component mocking
Mock child components be can automatically created for you with `.mock()`.

  ```typescript
  testComponent(SubjectComponent)
    .mock([FooComponent, BarComponent])
    .begin();
  ```

## Configuring mock components

```typescript
testComponent(SubjectComponent)
  .mock([FooComponent])
  .setupMock(FooComponent, fooMock => fooMock.getValue.returns("cake"))
  .begin();
```

#### Interacting with real or mock child components



## Setting component inputs
Initial values for component inputs can be set prior to component instantiation (so they are properly present at OnInit time) with `.setInput()`.

  ```typescript
  testComponent(SubjectComponent)
    .setInput("label", "presents")
    .begin();
  ```

Once the component is instantiated you can directly mutate the inputs on the test subject.

## Watching component outputs
Component outputs can be watched prior to component instantiation (so values emitted at OnInit time are not missed) with `.onOutput()`.

  ```typescript
  testComponent(SubjectComponent)
    .onOutput("save", event => persist(event))
    .begin();
  ```
