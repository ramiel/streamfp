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
  - forEach
  - group
  - groupBy
  - inspect
  - last
  - objectValues
- Utility
  - pipeline
  - fromValues
  - streamAsPromise
- Customize
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

Here a collection of smarter transformers that implement useful behavior. The same behavior can be achieved with map, filter and reduce but it's easier to have ready building blocks

## flat

Given a chunk that is an array, it produce a chunk for each element of the array

```js
const { compose, fromValues, flat } = require('streamfp');

/// Here we're using `fromValues` to produce a stream from an array.
// Check it its documentation
const stream = fromValues([[1, 2, 3], [4, 5], null]);

const resStream = compose(
  flat(),
)(stream);

resStream.on('data', data => console.log(`${data}`));

/* 
The output will be:
1
2
3
4
5
*/

```
