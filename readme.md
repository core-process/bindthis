# bindthis

Binds 'this' to methods of objects on-the-fly. Can be used as a decorator.

![npm downloads total](https://img.shields.io/npm/dt/bindthis.svg) ![npm version](https://img.shields.io/npm/v/bindthis.svg) ![npm license](https://img.shields.io/npm/l/bindthis.svg)

A class or method decorator which binds methods to the instance, so `this` is always correct, even when the method is detached. This behavior is particularly useful for passing event handlers without the need to apply `.bind(this)` manually.

```js
// without 'bindthis':
<div onClick={ this.onClick.bind(this) }>...</div>

// with 'bindthis':
<div onClick={ this.onClick }>...</div>
```

There are alternatives available, but from my point of view `bindthis` is better in handling all edge cases correctly. Furthermore, the code is much easier to read and to understand. But please, form your opinion!

* [jayphelps/core-decorators.js#autobind](https://github.com/jayphelps/core-decorators.js#autobind)
* [andreypopp/autobind-decorator](https://github.com/andreypopp/autobind-decorator)

## Installation

Install the `bindthis` module via

```sh
npm install bindthis --save
npm install babel-plugin-transform-decorators-legacy --save-dev
```

or

```sh
yarn add bindthis
yarn add babel-plugin-transform-decorators-legacy --dev
```

**Note:** The implementation of the decorator transformation is currently on hold as the syntax is not final. If you would like to use this project with Babel 6, you should use the Babel plugin [babel-plugin-transform-decorators-legacy](https://www.npmjs.com/package/babel-plugin-transform-decorators-legacy) which implement Babel 5 decorator transformation for Babel 6.

Add the previously installed Babel plugin `transform-decorators-legacy` to your `.babelrc`, e.g. like this:

``json
{
  "presets": [ "es2015", "stage-0", "react" ],
  "plugins": [ "transform-runtime", "transform-decorators-legacy" ]
}
``

## Usage

`bindthis` can be used as class and as method decorator.

### Method Decorator

Attach the decorator to the method you would like to bind to `this`. An example is worth a thousand words.

```js
import bindthis from 'bindthis';

class Component {
  constructor(value) {
    this.value = value;
  }

  @bindthis
  method() {
    return this.value;
  }
}

const component = new Component(42);
const method = component.method; // .bind(component) is not required!
method(); // returns 42
```

### Class Decorator

Easily bind `this` to all methods of a class by attaching the decorator to the class itself.

```js
import bindthis from 'bindthis';

@bindthis
class Component {
  constructor(value) {
    this.value = value;
  }

  method() {
    return this.value;
  }
}

const component = new Component(23);
const method = component.method; // .bind(component) is not required!
method(); // returns 23
```
