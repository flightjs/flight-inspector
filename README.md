# Flight Inspector

**Warning: WIP**

Devtools extension for developing with Twitter's Flight framework. Currently works with **standalone Flight** or **unbuilt AMD Flight** (where `require` is still exposed in the page), preferably in debug mode.

If you don't have debug mode on, you can use a [patched version](https://github.com/flightjs/flight/pull/287) of Flight.

## Installing from Source

1.  Clone the repository: `git clone git://github.com/flightjs/flight-inspector`
2.  Navigate to `chrome://chrome/extensions/` and enable Developer Mode.
3.  Choose "Load unpacked extension"
4.  Open the directory you just cloned (should open with Chrome, otherwise try dragging/dropping the file into Chrome) and follow the prompts to install.

## (Planned) Features

- [x] Show which components are attached to which elements via sidebar
- [x] Show when events are firing (visualisation)
- [x] Allow captured events to be inspected
- [x] Isolate detatched components to help debug memory leaks
- [x] Group synchronous events
- [ ] Dependency graphs and mixin use visualisation
- [ ] Performance inspection
- [ ] Highlight all instances of a component

## Authors

- [@phuu](https://github.com/phuu)

## License

Copyright 2013 Twitter, Inc and other contributors.

Licensed under the MIT License
