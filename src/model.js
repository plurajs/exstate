class Model {
  __queue = [];
  __listeners = [];

  setState(updater, callback) {
    const nextState = this.getNextState(updater);
    if(nextState != null) {
      this.state = Object.assign({}, this.state, nextState);
    }

    if(typeof callback === 'function') {
      this.__queue.push(callback);
    }

    // avoid callback 
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;

      const defers = this.__listeners.map(listener => listener(this.name));

      Promise.all(defers).then(() => {
        while(this.__queue.length) {
          const fn = this.__queue[0];
          fn(this.state);
          this.__queue.splice(0, 1);
        }
      });
    });
  }

  getNextState(updater) {
    let nextState;
    if(typeof updater === 'function') {
      nextState = updater(this.state);
    }else {
      nextState = updater;
    }

    return nextState;
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
}

export default Model;