# BrainFeck

A BrainFuck interpreter in JavaScript.

Built for show, not speed.

## Install

Install the node dependencies.

`yarn install`

or

`npm install`

## Test

`yarn test`

or

`npm run test`

## Build

The following minifies the codebase and runs it through babel, shimming the `UInt8Array` to allow for older browsers to use the functional methods.

`yarn build`

or

`npm run build`

If you don't wish to perform this transpilation, you can build in dev mode.

`yarn build-dev`

or

`npm run build-dev`

## Run

This runs a simple `http-server` on port 8080 (or the next available port).

`yarn start`

or

`npm run start`
