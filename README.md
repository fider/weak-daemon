# WeakDaemon
Node.js object wrapper for unref'ed setInterval.

It will not prevent Node.js process to exit if event loop is empty.

It will help you remember about routine context.

No external dependencies.
# Installation
Requires [Node.js](https://nodejs.org/) v0.9.1+
```sh
$ npm install weak-daemon
```

# Usage
Ordinary function:
```node.js
const WeakDaemon = require('weak-daemon').WeakDaemon

function task() { /* do something */ }

var daemon = new WeakDaemon(
  101,  /* Interval milliseconds */
  task, /* function that will be called every 101ms */
  null  /* `task` context - mandatory parameter, to ensure you are aware of call context */
);

/* First `task` call is made after ~101ms */
daemon.start();
..
daemon.stop();
..
/* First `task` call is made immediately */
daemon.start(true);
..
/* Provide parameters to task */
var daemon = new WeakDaemon(
  101,
  task,
  null,
  [arg_1, arg_2]
);
```

Function that requires a caller context, because of `this` usage:
```node.js
const WeakDaemon = require('weak-daemon').WeakDaemon

const worker = {
  data: {},
  updateData: ()=>{
    this.data = ...
  } 
}

var daemon = new WeakDaemon(
  101,
  worker.updateData,
  worker /* So `this` will be handled properly on `updateData` call */
);

daemon.start();
```

Example error scenario:
```node.js
const WeakDaemon = require('weak-daemon').WeakDaemon

const worker = {
  data: {},
  source: {...},
  
  updateData: ()=>{
    this.data = this.source.data()
  }
}

var daemon = new WeakDaemon(
  101,
  worker.updateData,
  null               /* `this.source` will be undefined while daemon will call `updateData` */
);

daemon.start();
/* Error - `this.source` is undefined */
```
