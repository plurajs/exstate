import Model from './model';

const excludeMethods = ['constructor'];

export class Store {
  __listeners = [];
  models = {};
  instances = {};
  propInstances = new Map();

  add(key, model) {
    if(!model) {
      throw new Error('no valid model');
    }
    let instance;
    if(model instanceof Model) {
      instance = model;
      model = instance.constructor;
    }else {
      instance = new model();
    }
    instance.name = key;
    instance.subscribe(this.update);

    this.models[key] = model;
    this.instances[key] = instance;

    const methods = this.getAllMethods(instance);
    this.propInstances.set(instance, methods);
  }

  getAllMethods(instance) {
    const methods = {};
    let descriptors = [];

    let proto = instance;
    while(proto && proto instanceof Model) {
      descriptors = descriptors.concat(
        Object.keys(Object.getOwnPropertyDescriptors(proto))
      );
      proto = Object.getPrototypeOf(proto);
    }

    descriptors.forEach(propName => {
      const property = instance[propName];
      if(
        excludeMethods.indexOf(propName) === -1 &&
        typeof property === 'function'
      ) {
        methods[propName] = instance[propName].bind(instance);
      }
    });

    return methods;
  }

  update = (name) => {
    this.__listeners.forEach(fn => fn(name));
  }

  subscribe(fn) {
    this.__listeners.push(fn);
  }

  unsubscribe(fn) {
    if(!fn) {
      this.__listeners = [];
    }else {
      this.__listeners = this.__listeners.filter(it => it !== fn);
    }
  }

  destroy() {
    Object.keys(this.instances).forEach(key => {
      const instance = this.instances[key];
      instance.unsubscribe(this.update);
      delete this.instances[key];
    });
    this.unsubscribe();
  }

  toProps(instance) {
    let props = {};
    if(!instance) {
      Object.keys(this.instances).forEach(key => {
        props[key] = this.toProps(this.instances[key]);
      });
      return props;
    }

    const methods = this.propInstances.get(instance);

    return {
      ...methods,
      ...instance.state,
    };
  }
}

export default function createStore(map) {
  const store = new Store();
  Object.keys(map).forEach(key => {
    store.add(key, map[key]);
  });

  return store;
}