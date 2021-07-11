# node-common-logger
A node library provides flexible logging ways and simple facade. User could use whatever implementations they like with the uniform api.

### Installation

`npm i node-common-logger`

### Basic usage

```typescript
import logger from 'node-common-logger';

// do anything.
logger.info('Log every thing you like.');
// finish the rest job.
```
or
```javascript
const {logger} = require('node-common-logger');

// do anything.
logger.info('Log every thing you like.');
// finish the rest job.
```

### LogStrategy

By default, logger only log content to the console, which may not be so useful. As a facade library, more general use case is implementing and setting up your own LogStrategy. This is actually an easy job.

First, implementing a specific LogStrategy. Let's take _winston_ as an example (in fact you can use whatever log util you like).
```typescript
// WinstonLogStrategy.ts

import {LogStrategy} from "node-common-logger";

export default class WinstonLogStrategy implements LogStrategy {
  // write the implementation here.
}
```

Then, new an object of `WinstonLogStrategy` and set it to logger at the very beginning of your app.
```typescript
// index.js

import WinstonLogStrategy from './WinstonLogStrategy';
import logger from 'node-common-logger';

// At the very beginning.
logger.logStrategy = new WinstonLogStrategy();

// Continue your job.
```

### Advance usage

`Logger` as the main component of this library, besides implements the `LogStrategy`, it also contains several additional methods. 
All these methods provide special features by logging with the returned `Logger`, which usually is a derived object. _derived object_ here means a new object which prototype is the wrapped `Logger`.
The logger returned from these methods could be keep for further usage. 
The changing of the `LogStrategy` of the main logger (the one deriving all the other loggers) will affect all the derived loggers unless the derived one has set its own `LogStrategy`.

Here is the brief introduction of the methods:

##### logger.tag(tagName, tagSeparator)
Prepends the given tag before every content logged, separate by the separator.
```javascript
logger.tag('My tag', ' - ').info('Log something here');
// Log 'My tag - Log something here.'
```

##### logger.addArgument(val, placeholder)
Replace the first placeholder in the logging content with the given value.
```javascript
logger.addArgument('apple', '{}').addArgument('banana', '{}').info('I want to eat {}, not {}.');
// Log 'I want to eat apple, not banana.'
```

### Change logs

##### 0.2.x and above
`Logger`s returned from all methods of `Logger` are the derived ones which could be kept for further usage. 
These loggers share the same main logger as the prototype object. Change the `LogStrategy` of the main logger could also apply to all the other `Logger`s if it hasn't set its own `LogStrategy`.
At the previous version, the `Logger`s returned should be considered as _short term_ object and shouldn't be kept.

##### 0.1.x
The first version.