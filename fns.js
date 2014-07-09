/**
 * This code is evaluated in the context of the inspected page!
 */

function init() {
    if (window.flightSetup || !window.require) return;
    window.flightSetup = true;


    function css() {/*
        .flight-inspector-notifier {
            z-index: 100000;
            position: absolute;
            background: rgba(0,0,0,.5);
            font: 12px/1.2 sans-serif;
            color: white;
            text-shadow: 0 0 1px black;
            max-height: 100vh;
            width: 12em;
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
    */}
    $('body').append($('<style/>', {
        text: css.toString().split('\n').slice(1, -1).join('\n')
    }))

    /**
     * Notifier
     */

    var notifierMap = window.notifierMap = (window.notifierMap || {});
    function Notifier(position) {
        this.position = position;

        this.$elem = $('<div/>', {
            'class': 'flight-inspector-notifier',
            text: ''
        }).css(position).appendTo(document.body);

        this.eventQueue = new TickQueue(Notifier.EVENT_TIMEOUT, {
            wait: Notifier.EVENT_WAIT
        });

        this.$elem.on('mouseenter', function () {
            this.eventQueue.pause();
        }.bind(this));

        this.$elem.on('mouseleave', function () {
            this.eventQueue.unpause();
        }.bind(this));
    }

    Notifier.prototype.add = function (text, data) {
        var $eventElem = $('<a/>', {
            'class': 'flight-inspector-notifier__event',
            text: text,
            href: '#'
        }).appendTo(this.$elem);

        $eventElem.on('click', function () {
            console.info(data);
        });

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

    require([
        'flight/lib/registry',
        'flight/lib/advice',
        'flight/lib/compose'
    ], function (registry, advice, compose) {
        window.flightRegistry = registry;
        compose.mixin(window.flightRegistry, [advice.withAdvice]);

        var hook = {};
        ['before', 'after'].forEach(function (advice) {
            hook[advice] = function (obj, method, cb) {
                obj.around(['hook', advice, method].join('-'), function (original) {
                    cb.apply(this, [].slice.call(arguments, 1));
                    original.apply(this, [].slice.call(arguments, 1));
                });
            };
        });

        hook.before(registry, 'trigger', function (node, event, data) {
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
                position = $(node).position();
            }
            position.top = Math.max(0, ~~position.top);
            position.left = Math.max(0, ~~position.left);
            try {
                var notifier = Notifier.getOrCreateForPosition(position);
                notifier.add(event, {
                    event: event,
                    node: node,
                    data: data
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
    var target = ($0 === document.lastChild ? document : $0);

    if (!window.flightRegistry) {
        return new Error('Cannot find registry.')
    }

    return (_F = window.flightRegistry.components.filter(function (componentInfo) {
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
