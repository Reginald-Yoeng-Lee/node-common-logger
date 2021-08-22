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

### MessageDecoration

Besides the business content being logged, sometimes we may want to _decorate_ the content with some extra information, such as timestamp or log level and so on,
We introduce interface `MessageDecoration` to solve this problem. The `Logger` could contain 0 or N `MessageDecoration`, and the decorations will be applied to every messages being logged.
Each decoration has a `priority` property, indicates the order of the decorations being called. The smaller value means the higher priority, and higher priority means the earlier being called.


Consider four `MessageDecoration` A, B, C and D, which contains the priority -1, 0, 0 and 1 individually. Let's add these decorations to the logger as the following order:
```javascript
logger.addMessageDecoration(D); // D.priority === 1
logger.addMessageDecoration(C); // C.priority === 0
logger.addMessageDecoration(B); // B.priority === 0
logger.addMessageDecoration(A); // A.priority === -1
```
The order of the decorations being called would be:
```javascript
A.decorate(logger, logLeve, msg);
C.decorate(logger, logLeve, msg);
B.decorate(logger, logLeve, msg);
D.decorate(logger, logLeve, msg);
```

##### Private MessageDecoration

Each _derived_ logger manages its own `MessageDecoration` list. That is, adding a new decoration to the logger returned from `logger.tag()` will NOT affect the origin logger.
When a new logger derived from the origin logger, all the private decorations of the origin logger will be copied to the derived one. The decorations of different derived loggers are managed separately.
In the other word, changing the private decorations of one logger (even the main logger) will NOT affect the other existed logger, and vice versa.
By default, a `MessageDecoration` for decorating the message with the `tag` and `tagSeparator` will be added as the first decoration with priority 0. We strongly recommend that DON'T call `logger.clearMessageDecorations()` at the main (origin) logger.
Instead, always build a derived logger (by calling `logger.tag('', '')`, for example) and then do whatever you like.  

Several methods in `logger` are related to the management of the private `MessageDecoration`s:  

`logger.addMessageDecoration(messageDecoration: MessageDecoration): Logger`  
Add decoration to logger.  

`logger.getMessageDecorations(): MessageDecoration[]`  
Get a shallow copy of the decoration list of the logger. Remember that modify the returned array will NOT affect the logger's decoration list.  

`logger.clearMessageDecorations(): Logger`  
Clear the decorations of the logger.

##### Global MessageDecoration

All _derived_ loggers share a _global_ `MessageDecoration` list. Changing any global decoration on any `logger` will affect all the other `logger`s' behaviour. 
When logging messages, private decorations and global decorations will be merged and ordered by their priorities. When a private decoration and a global decoration share the same priority number, the private one has the higher priority.

Several methods in `logger` are related to the management of the global `MessageDecoration`s:

`logger.addGlobalMessageDecoration(messageDecoration: MessageDecoration): Logger`  
Add global decoration to all loggers.

`logger.getGlobalMessageDecorations(): MessageDecoration[]`  
Get a shallow copy of the decoration list of the logger. Remember that modify the returned array will NOT affect the global decoration list.

`logger.clearGlobalMessageDecorations(): Logger`  
Clear the global decorations of the logger.

##### MessageDecoration available outbox
Some `MessageDecoration`s are predefined and available outbox:  

`LogLevelMessageDecoration`  
Prepend log level (DEBUG, INFO, ERROR, etc.) to the beginning of the message.  

By default, an anonymous decoration with priority 0 is added to the logger as the first decoration to handle the tag and tag separator set on the logger.

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

### Methods deriving new logger
Here's the methods which will derive a new logger from the current logger when being called.  
`logger.category(name: string, useCache: boolean = true): Logger`  
`logger.tag(tag: string, separator: string = ' - '): Logger`  
`logger.addArgument(val: string, placeholder: string = '{}'): Logger`

### Change logs

##### 0.3.1
Introduce _global MessageDecoration_ to `logger`, which will be applied to all derived `logger`s.

##### 0.3.0
`Logger` can contain more than one `MessageDecoration`, and all the decorations will be applied according to their priorities.  
The tag and tag separator of the logger is handled by a `MessageDecoration` added to the logger at the very first beginning now.  

BREAKING CHANGES:  
Method `MessageDecoration#beforeDecorate(logger: Logger, msg: string)` is removed.  
Method `MessageDecoration#decorate(logger: Logger, msg: string): string` is changed to `MessageDecoration#decorate(logger: Logger, logLevel: LogLevel, msg: string): string` and no longer being optional.

##### 0.2.1
Add log level to the start of the message when using `DefaultLogStrategy`.

##### 0.2.x and above
`Logger`s returned from all methods of `Logger` are the derived ones which could be kept for further usage. 
These loggers share the same main logger as the prototype object. Change the `LogStrategy` of the main logger could also apply to all the other `Logger`s if it hasn't set its own `LogStrategy`.
At the previous version, the `Logger`s returned should be considered as _short term_ object and shouldn't be kept.

##### 0.1.x
The first version.