# ngx-unit
Testing utilities for Angular

### Usage
```typescript
//TODO

const context = testComponent(SomeComponent, { mock: [SomeComponent], use: [] });

context.subject.someMethod();

expect(context.element('.some')).toHaveText();
expect(context.elements('.some')[0]).toHaveText();
expect(context.child('.some-class').someMethod).to.have.been.called;
expect(context.child(SomeComponent).someMethod).to.have.been.called;
expect(context.children('.some-class').someMethod).to.have.been.called;



```