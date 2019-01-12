# StreamFP

[![pipeline](https://gitlab.com/ramiel/streamfp/badges/master/pipeline.svg)](https://gitlab.com/ramiel/streamfp/pipelines)
[![coverage](https://gitlab.com/ramiel/streamfp/badges/master/coverage.svg)](https://gitlab.com/ramiel/streamfp/-/jobs)



Use node streams as reactive entities.

The concept behind this module is explained in [this article](https://medium.com/hypersaid/the-hidden-power-of-node-js-stream-reactive-programming-4bc5c40ab601).

The main idea is to let you easily manipulate your streamed data.     

- The stream is not changed. No new stream class wraps your streams that remain always pure node streams.
- Every node stream functionality works. You can mix `compose` from this library with `pipe` from node's core library.
- Let you manage your stream flow in a functional programming style.
- Easy: you can do everything with three building blocks: map, filter, reduce.
- Powerful: Lot of more complex building blocks are available to let you better express your code.

**NOTE**: while the module is complete and fully functional, this documentation is not.

# Table of Content

- [Basics](#basics)
  - [map/mapAsync](#map-mapasync)
  - [filter](#filter)
  - [reduce](#reduce)
  - [compose](#compose)
- [Advanced](#advanced)
  - [flat](#flat)
  - [forEach](#forEach)
  - [group](#group)
  - [groupBy](#groupBy)
  - [inspect](#inspect)
  - [last](#last)
  - [objectValues](#objectValues)
- [Utilities](#Utilities)
  - [pipeline](#pipeline)
  - [fromValues](#fromValues)
  - [streamAsPromise](#streamAsPromise)
- [Customize](#Customize)
  - Write your own transformer

# Basics

All the power of this library is leveraged to you trough three basic transformers (`map`, `filter` and `reduce`... sounds familiar?) 
and a way to compose them (`compose`, yes, definetely familiar).

## map/mapAsync

Map is one of the three pillars of this library.
It lets you apply a map function to each data in the stream,
the same way Array.prototype.map works

```js
const { map } = require('streamfp');
// A stream of daily temperatures in °C.
// Each chunk is a number
const stream = getDailyTemperaturesStream(); // can be any node stream

// Each value in the stream is mapped and transformed into °F
stream.pipe(
  map(celsiusTemp => celsiusTemp * 1.8 + 32)
);

// Let's use a remote API to do the same
stream.pipe(
  mapAsync(async (celsiusTemp) => getOnlineConversionCtoF(celsiusTemp))
)
```

## filter

Filter let you discard some value depending on the result of a function, the same way Array.prototype.filter works

```js
const { filter } = require('streamfp');
// A stream of daily temperatures in °C.
// Each chunk is a number
const stream = getDailyTemperaturesStream(); // can be any node stream

// Each value in the stream is filter. Only temperature higher than 10°
// are kept
stream.pipe(
  filter(temp => temp > 10)
);
```

## reduce

Reduce your data the same way you do with arrays. Remember that, differently from map and filter, the resulting value is emitted only when the stream is closed.

```js
const { reduce } = require('streamfp');
// A stream of daily temperatures in °C.
// Each chunk is a number
const stream = getDailyTemperaturesStream(); // can be any node stream

// the function is called for each value and when 
// the stream will be closed a value will be emitted
stream.pipe(
  reduce((total, temp) => {
    return total + temp;
  }, 0)
);
```

## compose

Compose is a better `pipe`.    
`pipe` has the disvantage that you should listen to the `error` event of each intermediate stream.

```js
const res = stream
  .pipe(transform1)
  .pipe(transform2);

res.on('error', () => {
  // if an error happen on transform1 this won't catch it
});
```

`compose` lets you work the same way you do with function composition.    
The signature of compose is: `compose :: (...transformations) -> stream -> stream`


```js
// Let's find the average temperature among all the temperatures that
// have been more than 90°F
const { map, filter, reduce, compose } = require('streamfp');

const stream = getDailyTemperaturesStream(); // can be any node stream

let i = 0;
const res = compose(
  map(temp => temp * 1.8 + 32),
  filter(temp => temp > 90),
  reduce((total, temp) => {
    i += 1;
    return total + temp;
  }, 0),
)(stream);

// we could use some useful method that transform a stream in a promise
// but let use the standard node way for the moment
res.on('data', total => {
  const average = total / i;
  console.log(`Average value of temperature 
  higer than 90°F is ${average}`);
});

res.on('error', (e) => {
  console.error('An error happened at some stage of the workflow', e);
})
```

# Advanced

Here a collection of smarter transformers that implement useful behaviors. The same behaviors can be achieved with map, filter and reduce but it's easier to have ready building blocks

## flat

Given a chunk that is an array, it produce a chunk for each element of the array

```js
const { compose, fromValues, flat } = require('streamfp');

// Here we're using `fromValues` to produce a stream from an array.
// Check its documentation
const stream = fromValues([[1, 2, 3], [4, 5], null]);

const resStream = compose(
  flat(),
)(stream);

resStream.on('data', data => console.log(data));

/* 
The output will be:
1
2
3
4
5
*/

```

## forEach

For each let you execute an action without changing the stream

```js
const { compose, fromValues, forEach } = require('streamfp');

const stream = fromValues([1,2,3, null]);

const resStream = compose(
  forEach(chunk => console.log('forEach: ', chunk * 2)),
)(stream);

resStream.on('data', data => console.log('data: ', data));

/* 
The output will be:

forEach:  2
data:  1
forEach:  4
data:  2
forEach:  6
data:  3
*/

```

## group

It groups chunks in arrays of defined size. Last array can be smaller than the others because the stream is finished and there is no more data.

```js
const { compose, fromValues, group } = require('streamfp');
const stream = fromValues(['a', 'b', 'c', 'd', 'e', 'f', 'g', null]);

// The result will be groups of 3 letters
const resStream = compose(
  group(3),
)(stream);

resStream.on('data', data => console.log(data));

/* 
The output will be:
['a', 'b', 'c']
['d', 'e', 'f']
['g']   Since the stream is finished, the last group is smaller than the others
*/
```

## groupBy

Group several objects depending on the value of one of their properties.    
If two properties collide, the last passing through the stream wins.

```js
const { compose, fromValues, groupBy } = require('streamfp');

const stream = fromValues([
  { id: '2', lastname: 'Lannister' },
  { id: '1', name: 'John' },
  { id: '2', name: 'Tyrion' },
  { id: '1', lastname: 'Stark' },
  { id: '1', lastname: 'Snow' },
  null,
]);

const resStream = compose(
  groupBy('id'),
)(stream);

resStream.on('data', data => console.log(data));
/* 
The output will be:
{ id: '1', name: 'John', lastname: 'Snow' }
{ id: '2', name: 'Tyrion', lastname: 'Lannister' }
*/
```

## inspect

Inspect is a very useful function to debug what's passing in your composed stream

```js
const { compose, fromValues, map, inspect } = require('streamfp');

const stream = fromValues([ 1, 2, 3, null ]);

const resStream = compose(
  map(n => n * 2),
  inspect()
  map(n => n + 1),  
)(stream);

/* 
Inspect will log on the console the partial result after the first map
2
4
6
*/
```

By default `inspect` logs to the console but you can modify this behavior by passing a custom loggin function.

```js
const { compose, fromValues, map, inspect } = require('streamfp');
const logger = require('my-fancy-logger');

const stream = fromValues([ 1, 2, 3, null ]);
compose(
  map(n => n * 2),
  inspect((data) => logger.debug(data))
  map(n => n + 1),  
)(stream);
```

## last

Last returns only the last chunk of the stream. If the stream never ends, last never return

```js
const { compose, fromValues, inspect, last } = require('streamfp');

const stream = fromValues([1, 2, 3, null]);

compose(
  last(),
  inspect(),
)(stream);

/**
Output:
3
*/
```

## objectValues

Given an object, it create a stream chunk from every value in the object.

```js
const {
  compose, fromValues, inspect, objectValues,
} = require('streamfp');

const stream = fromValues([{ a: 'hello' }, { a: 'silence', b: 'my old friend' }, null]);

compose(
  objectValues(),
  inspect(),
)(stream);

/**
 Output:
hello
silence
my old friend
*/
```

# Utilities

These methods do not transform the stream but are useful to interact with it.

## pipeline

A pipeline is a series of transformer that can be passed, as a unique block, to compose. Let's say we have a series of operation to convert the temperature as we saw before. We can save the block in a pipeline and reuse it every time we need. We can consider a pipeline as a partially applied composition of transformers.

```js
const {
  map, filter, reduce, compose, inspect, fromValues,
  pipeline,
} = require('streamfp');

let i = 0;
const averageTempPipeline = pipeline(
  map(temp => temp * 1.8 + 32),
  filter(temp => temp > 90),
  reduce((total, temp) => {
    i += 1;
    return total + temp;
  }, 0),
);

const stream = fromValues([41, 45, null]);

compose(
  averageTempPipeline,
  map(res => res / i),
  inspect(),
)(stream);
```

Pipelines can be nested and reused. They're very useful to isolate a complex behavior that needs several transformer in one logic block.

```js
const pipelineA = pipeline(
  map(...),
  filter(...)
);

const pipelineB = pipeline(
  flat(),
  pipelineA,
  map(...)
);
```

## fromValues

This function takes an array and transform it in a stream. Remeber to pass `null` as last value if you want to create a finished stream.

## streamAsPromise

This function let you treat a stream as a promise.

```js
const promise = streamAsPromise(stream);

try {
  const streamResult = await promise; // called when the stream en ds normally
} catch(e) {
  console.error(e); // called when the stream ends because of an error
}
```

This function takes another argument where you can specify additional options: `streamAsPromise(stream, {getData: false, drain: true})`

- `getData`: if true the data are passed to the resolved promis. Default true
- `drain`: if true the stream is drained (consumed, read) even if there's no explicit stream read operation. Default to true. It's useful if you don't need the data but still you need the stream to be consumed. Remember: a stream is consumed only if the `data` event has an handler or if the `resume` method is called.


# Customize

TBD
