import { PureComponent, createContext, forwardRef } from 'react';
import { shallowEqualObjects } from 'shallow-equal';
import createStore, { Store } from './store';

export const ExstateContext = createContext(null);

export function connect(inject, selector) {
  let store;
  if(typeof inject === 'function' && !selector) {
    selector = inject;
    inject = null;
  }

  if(inject) {
    if(inject instanceof Store) {
      store = inject;
    }else {
      store = createStore(inject);
    }
  }

  return function(Element) {
    class ConnectedElement extends PureComponent {
      static contextType = ExstateContext;

      componentDidCatch(error, errorInfo) {
        console.error('didCatch', error, errorInfo);
      }

      componentDidMount() {
        if(store) {
          store.subscribe(this.update);
        }
      }

      update = () => {
        const state = this.getState();

        if(!shallowEqualObjects(this.state, state)) {
          this.setState(state);
        }
      }

      getState() {
        let data;

        if(store) {
          data = store.toProps();
        }

        const state = {
          ...this.context,
          ...data,
        };

        return typeof selector === 'function' ? selector(state) : state;
      }

      render() {
        const { forwardedRef, ...props } = this.props;
        let state = this.getState();

        return <Element ref={forwardedRef} {...props} {...state} />;
      }
    }

    return forwardRef(function ExstateConnect(props, ref) {
      return <ConnectedElement {...props} forwardedRef={ref} />;
    });
  };
}

export class Provider extends PureComponent {
  static getDerivedStateFromProps(nextProps) {
    const store = nextProps.store;

    if(!store || typeof store.toProps !== 'function') {
      return null;
    }

    return store.toProps();
  }

  constructor(props) {
    super(props);

    const store = props.store;

    if(!store || !(store instanceof Store)) {
      throw new Error('must provide Store');
    }

    this.state = store.toProps();

    store.subscribe(this.update);
  }

  update = () => {
    const { store } = this.props;

    this.setState(store.toProps());
  }

  render() {
    return (
      <ExstateContext.Provider value={this.state}>
        {this.props.children}
      </ExstateContext.Provider>
    );
  }
}
