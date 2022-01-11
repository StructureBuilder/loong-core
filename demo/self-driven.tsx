class Count {
  constructor(public value = 0) {}
}

class List {
  count = new Count(0);

  items = [];
}

class Main {
  list = new List();

  get filterList() {
    return this.list.items.filter((_, index) => index % 2);
  }

  change() {}

  change1() {}

  change2 = () => {};
}

const main = new Main();

observable(main);

autorun(() => {
  console.log(main.list.count.value);
});

function observable(value: any) {
  console.log('observable >>>', value);
}

function autorun(callback: () => void) {
  callback();
}

/* mobx 类似 */

// 依赖收集器
class Derivation {
  beginCollect() {}
}

// 包装数据
class Observable {}

// 监控反应
class Reaction {}
