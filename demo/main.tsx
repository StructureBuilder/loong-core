import React from 'react';
import ReactDOM from 'react-dom';
import { Component, Injectable, bind, connect } from '@/index';
import { makeAutoObservable } from 'mobx';

@Injectable()
class Service {
  count = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increase = () => {
    this.count++;
  };

  decrease = () => {
    this.count--;
  };
}

@Component({
  providers: [Service],
})
class AppCompnent {
  constructor(public service: Service) {}
}

const Child = connect<AppCompnent>(({ $this }) => <div>Child {$this.service.count}</div>);

const App = bind(AppCompnent)<{ name: string }>(({ $this }) => (
  <div>
    <p>Count = {$this.service.count}</p>
    <Child />
    <button onClick={$this.service.increase}>Increase</button>
    <button onClick={$this.service.decrease}>Decrease</button>
  </div>
));

ReactDOM.render(
  <React.StrictMode>
    <App name="app" />
  </React.StrictMode>,
  document.getElementById('root')
);
