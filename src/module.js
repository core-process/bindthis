/**
 * @copyright 2015, Andrey Popp <8mayday@gmail.com>
 * @copyright 2017, Niklas Salmoukas <niklas@salmoukas.com>
 *
 * The decorator may be used on classes or methods
 * ```
 * @bindThis
 * class FullBound {}
 *
 * class PartBound {
 *   @bindThis
 *   method () {}
 * }
 * ```
 */
export default function bindThis(...args) {
  if(  args.length === 1
    && typeof args[0] === 'function'
  ) {
    return bindClass(...args);
  }
  else
  if(  args.length === 1
    && typeof args[0] === 'object'
  ) {
    return bindObject(...args);
  }
  else
  if(   args.length === 3
    &&  typeof args[0] === 'object'
    && (typeof args[1] === 'string' || args[1] instanceof Symbol)
    &&  typeof args[2] === 'object'
  ) {
    return bindMethod(...args);
  }
  else {
    throw new Error('invalid parameters');
  }
}

function bindClass(target) {
  if(typeof target !== 'function') {
    throw new Error('invalid parameters');
  }
  // bind methods on prototype object
  bindObject(target.prototype);
  return target;
}

function bindObject(target) {
  if(typeof target !== 'object') {
    throw new Error('invalid parameters');
  }
  // retrieve all keys
  let keys;
  if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
    keys = Reflect.ownKeys(target);
  } else {
    keys = Object.getOwnPropertyNames(target);
    // use symbols if support is provided
    if (typeof Object.getOwnPropertySymbols === 'function') {
      keys = keys.concat(Object.getOwnPropertySymbols(target));
    }
  }
  // apply function binding
  keys.forEach(key => {
    // Ignore constructor
    if (key === 'constructor') {
      return;
    }
    // bind function
    let descriptor = Object.getOwnPropertyDescriptor(target, key);
    if (typeof descriptor.value === 'function') {
      Object.defineProperty(
        target, key,
        bindMethod(target, key, descriptor)
      );
    }
  });
  return target;
}

function bindMethod(target, key, descriptor) {
  if(   typeof target !== 'object'
    || (typeof key !== 'string' && !(key instanceof Symbol))
    ||  typeof descriptor !== 'object'
  ) {
    throw new Error('invalid parameters');
  }
  // validate value
  let fn = descriptor.value;
  if (typeof fn !== 'function') {
    throw new Error(`@bindThis decorator can only be applied to methods not: ${typeof fn}`);
  }
  // in IE11 calling Object.defineProperty has a side-effect of evaluating the
  // getter for the property which is being replaced. This causes infinite
  // recursion and an "Out of stack space" error.
  let definingProperty = false;
  // generate new descriptor
  return {
    configurable: true,
    enumerable: true,
    get() {
      // bind function and return if memoization is not possible
      let boundFn = fn.bind(this);
      if (definingProperty || this === target || this.hasOwnProperty(key)) {
        return boundFn;
      }
      // memoize bound function and return
      definingProperty = true;
      Object.defineProperty(this, key, {
        value: boundFn,
        configurable: true,
        enumerable: true,
        writable: true
      });
      definingProperty = false;
      return boundFn;
    },
    set(value) {
      // override property
      definingProperty = true;
      Object.defineProperty(this, key, {
        value: value,
        configurable: true,
        enumerable: true,
        writable: true
      });
      definingProperty = false;
    }
  };
}
