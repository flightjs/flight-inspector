/**
 * This code is evaluated in the context of the inspected page!
 */

function init() {
    if (window.flightSetup || !window.require) return;
    window.flightSetup = true;

    function template(str, o) {
        return str.replace(/{{([a-z_$]+)}}/gi, function (m, k) {
            return o[k] || '';
        });
    }

    function templateEventElem() {/*
        <a href="#"
           class="flight-inspector-notifier__event"
           data-action="{{action}}"
           data-description="{{description}}">
            {{action}} {{description}}
        </a>
    */}

    function templateCss() {/*
        .show-flight-inspector-notifier .flight-inspector-notifier {
            display: block;
        }
        .flight-inspector-notifier {
            display: none;
            z-index: 100000;
            position: absolute;
            background: rgba(0,0,0,.5);
            font: 12px/1.2 monospace;
            color: white;
            text-shadow: 0 0 1px black;
            max-height: 100vh;
            width: 20em;
            overflow-y: scroll;
            overflow-x: hidden;
            border-bottom-right-radius: 4px;
            border-top: none;
            opacity: 0.5;
            transition: opacity 100ms linear;
        }
        .flight-inspector-notifier:hover {
            opacity: 1;
        }
        .flight-inspector-notifier__event {
            display: block;
            color: white;
            text-decoration: none;
            padding: 0.1em 0.2em;
            border-top: 1px solid rgba(0,0,0,.5);
            overflow: hidden;
            white-space: nowrap;
            word-wrap: normal;
            text-overflow: ellipsis;
            transition: background-color 100ms linear;
        }
        .flight-inspector-notifier__event:hover {
            background-color: rgba(0,0,0,.8);
            color: white;
            text-decoration: none;
        }
        .flight-inspector-notifier__event:active {
            background-color: rgba(0,200,0,1);
            color: white;
            text-decoration: none;
        }
        .flight-inspector-notifier__event:before {
            display: inline;
            content: attr(data-count);
            margin-right: 0.444em;
        }
    */}

    function funstr(fn) {
        return fn.toString().split('\n').slice(1, -1).join('\n')
    }


    $('body').append($('<style/>', {
        text: funstr(templateCss)
    }))

    /**
     * Notifier
     */

    var notifierMap = window.notifierMap = (window.notifierMap || {});
    function Notifier(position) {
        this.position = position;
        this.eventData = new WeakMap();

        this.$elem = $('<div/>', {
            'class': 'flight-inspector-notifier',
            text: ''
        }).css(position).appendTo(document.body);

        this.eventQueue = new TickQueue(Notifier.EVENT_TIMEOUT, {
            wait: Notifier.EVENT_WAIT
        });

        this.$elem
            .on('mouseenter', function () {
                this.eventQueue.pause();
            }.bind(this))
            .on('mouseleave', function () {
                this.eventQueue.unpause();
            }.bind(this))
            .on('click', '.flight-inspector-notifier__event', function (e) {
                if (this.eventData.has(e.currentTarget)) {
                    var event = this.eventData.get(e.currentTarget);
                    console.info(
                        '%i %s %s %O',
                        event.events.length,
                        event.action,
                        event.description,
                        event.events.map(function (event) {
                            return event.data;
                        })
                    );
                }
            }.bind(this));
    }

    Notifier.prototype.add = function (event) {
        var $eventElem = this.$elem.find('a').last();
        var mostRecent
        var mostRecentAction = $eventElem.attr('data-action');
        var mostRecentDesc = $eventElem.attr('data-description');
        var mostRecentCount = ~~$eventElem.attr('data-count');

        if (!$eventElem.length ||
            event.action !== mostRecentAction ||
            event.description !== mostRecentDesc) {
            $eventElem = $(template(funstr(templateEventElem), event)).appendTo(this.$elem);
            mostRecentCount = 0;
        }

        $eventElem.attr('data-count', mostRecentCount + 1);

        var eventElem = $eventElem[0];

        // Save the events data
        var matchedEventsData = (this.eventData.get(eventElem) || {
            action: event.action,
            description: event.description,
            events: []
        });
        matchedEventsData.events.push(event);
        this.eventData.set(eventElem, matchedEventsData);

        // TODO This will clear the element even if it's updating
        this.eventQueue.push(function () {
            $eventElem.remove();
        });
    };

    Notifier.EVENT_TIMEOUT = 250;
    Notifier.EVENT_WAIT = 3000;
    Notifier.getOrCreateForPosition = function (rawPosition) {
        var position = Notifier.positionFromRaw(rawPosition);
        return notifierMap[position] || (notifierMap[position] = new Notifier(rawPosition));
    };
    Notifier.positionFromRaw = function (rawPosition) {
        return rawPosition.top + ',' + rawPosition.left;
    };

    /**
     * TickQueue
     */

    function TickQueue(tickSpeed, opts) {
        opts = opts || {};
        this.queue = [];
        this.tickSpeed = tickSpeed;
        this.paused = !!opts.paused;
        this.ticking = false;
        this.wait = opts.wait || 0;
    }
    TickQueue.prototype.tick = function (last, loop) {
        if (!loop && this.ticking) return;
        if (!this.queue.length || this.paused) return (this.ticking = false);
        this.ticking = true;
        if (!loop) {
            last = last + this.wait;
        }
        if (Date.now() - last > this.tickSpeed) {
            try {
                this.queue.shift()();
            } catch (e) {}
            last = Date.now();
        }
        requestAnimationFrame(this.tick.bind(this, last, true));
    }
    TickQueue.prototype.push = function () {
        this.queue.push.apply(this.queue, arguments);
        this.go();
    };
    TickQueue.prototype.pause = function () {
        this.paused = true;
    };
    TickQueue.prototype.unpause = function () {
        this.paused = false;
        this.go(Date.now());
    };
    TickQueue.prototype.go = function (from) {
        requestAnimationFrame(this.tick.bind(this, from || Date.now(), false));
    };

    /**
     * Hook Flight
     */

    function getFlight(cb) {
        if (window.flight) {
            return setTimeout(cb.bind(this, window.flight.registry, window.flight.advice, window.flight.compose), 0);
        }
        require(['flight/lib/registry', 'flight/lib/advice', 'flight/lib/compose'], cb)
    }

    getFlight(function (registry, advice, compose) {
        window.flight = window.flight || {};
        window.flight.registry = registry;
        compose.mixin(registry, [advice.withAdvice]);

        registry.before('trigger', function (node, event, data) {
            /**
             * event
             * event, data
             * node, event
             * node, event, data
             */
            if (typeof node === 'string') {
                data = event;
                event = node;
                node = this.node;
            }
            var position = {top: 0, left: 0}
            // Hack around weird jQuery issue
            if (node !== document) {
                position = $(node).offset();
            }
            position.top = Math.max(0, ~~position.top);
            position.left = Math.max(0, ~~position.left);
            try {
                var notifier = Notifier.getOrCreateForPosition(position);
                notifier.add({
                    action: 'trigger',
                    description: event,
                    data: {
                        component: this,
                        event: event,
                        node: node,
                        data: data
                    }
                });
            } catch (e) {
                console.error(e.stack);
            }
        });
    });
}

function getSelectedComponent() {
    function transformInstanceInfo(instanceInfo) {
        return {
            events: instanceInfo.events,
            instance: instanceInfo.instance
        };
    }

    // Devtools doesn't let you select the document, so use the <html> node
    var target = ($0 === document.documentElement ? document : $0);

    if (!window.flight || !window.flight.registry) {
        return ['Cannot find registry. Please choose another element or refresh the page.'];
    }

    return (_F = window.flight.registry.components.filter(function (componentInfo) {
        return componentInfo.isAttachedTo(target);
    }).reduce(function (memo, componentInfo) {
        if (componentInfo.component.toString().length) {
            memo[componentInfo.component.toString()] =
                Object.keys(componentInfo.instances)
                    .map(function (id) {
                        return componentInfo.instances[id];
                    })
                    .filter(function (instanceInfo) {
                        return (instanceInfo.instance.node === target);
                    })
                    .map(transformInstanceInfo);
        }
        return memo;
    }, {}));
}

function getDetachedComponents() {
    function transformInstanceInfo(instanceInfo) {
        return {
            events: instanceInfo.events,
            instance: instanceInfo.instance
        };
    }

    if (!window.flight || !window.flight.registry) {
        return ['Cannot find registry. Please choose another element or refresh the page.'];
    }

    return (_F = window.flight.registry.components.filter(function (componentInfo) {
        return componentInfo.attachedTo.some(function (elem) {
            return (elem !== document && !elem.parentNode);
        });
    }).reduce(function (memo, componentInfo) {
        if (componentInfo.component.toString().length) {
            memo[componentInfo.component.toString()] =
                Object.keys(componentInfo.instances)
                    .map(function (id) {
                        return componentInfo.instances[id];
                    })
                    .filter(function (instanceInfo) {
                        return (instanceInfo.instance.node !== document &&
                                !instanceInfo.instance.node.parentNode);
                    })
                    .map(transformInstanceInfo);
        }
        return memo;
    }, {}));
}

function toggleEventNotifier() {
    document.documentElement.classList.toggle('show-flight-inspector-notifier');
}
function getEventNotifierToggleState() {
    return document.documentElement.classList.contains('show-flight-inspector-notifier');
}
