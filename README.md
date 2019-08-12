# exstate

external state management, inspire by unstated.

## usage

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect, Model, createStore } from 'exstate';

class Counter extends Model {
  state = {
    value: 1,
  };

  increase() {
    this.setState({
      value: this.state.value + 1,
    });
  }

  decrease() {
    this.setState({
      value: this.state.value - 1,
    })
  }
}

function UICounter(props) {
  const { value, increase, decrease } = props;
  return (
    <div>
      <div>{value}</div>
      <button onClick={increase}>+</button>
      <button onClick={decrease}>-</button>
    </div>
  );
}

const ConnectedCounter = connect(({counter}) => counter)(UICounter);

const store = createStore({
  counter: Counter,
});

ReactDOM.render(
  <Provider store={store}>
    <ConnectedCounter />
  </Provider>,
  document.getElementById('root')
);
```