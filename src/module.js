
function bindObject(object) {
  if(typeof object !== 'object') {
    throw new Error('invalid parameters');
  }

  // get property names
  const properties = Object.getOwnPropertyNames(object);
  if(Object.getOwnPropertySymbols) {
    properties.push(...Object.getOwnPropertySymbols(object));
  }

  // get property descriptors
  const descriptors = properties.reduce(
    (res, descr) =>
      (res[descr] = Object.getOwnPropertyDescriptor(object, descr)),
    { }
  );

  // apply bind mechanism to properties
  for (let i = 0, l = properties.length; i < l; i++) {
    const property = properties[i];
    const descriptor = descriptors[property];

    // apply to functions only (skip constructor)
    if (typeof descriptor.value !== 'function' || property === 'constructor') {
      continue;
    }

    // apply method binding
    Object.defineProperty(
      object,
      property,
      bindMethod(object, property, descriptor)
    );
  }

  // done
  return object;
}

function bindClass(class_) {
  if(typeof class_ !== 'function') {
    throw new Error('invalid parameters');
  }

  // apply outbinding
  bindObject(class_.prototype);
  return class_;
}

function bindMethod(object, property, descriptor) {
  if(   typeof object !== 'object'
    || (typeof property !== 'string' && !(property instanceof Symbol))
    ||  typeof descriptor !== 'object'
  ) {
    throw new Error('invalid parameters');
  }

  // storages
  let value = descriptor.value;
  let bound = new WeakMap();

  return {
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
    writable: descriptor.writable,
    get() {
      // do not bind non-function values
      if(typeof value !== 'function') {
        return value;
      }

      // Return unbound, if object is not prototype of this
      if(object.isPrototypeOf(this)) {
        return value;
      }

      // bind function
      if(!bound.has(this)) {
        const b = value.bind(this);
        b.unbound = value;
        bound.set(this, b);
      }

      // return bound function
      return bound.get(this);
    },
    set(newValue) {
      // set new value and clear bound map
      value = newValue;
      bound = new WeakMap();
      return newValue;
    }
  };
}

export default function autobind(...args) {
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
  throw new Error('invalid parameters');
}
