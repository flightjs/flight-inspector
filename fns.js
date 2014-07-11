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

    function templateNotifierElem() {/*
        <div class="flight-inspector-notifier flight-inspector-notifier--closed">
            <div class="flight-inspector-notifier__menu">
                <h1 class="flight-inspector-notifier__summary">{{summary}}</h1>
                <span class="flight-inspector-notifier__count"></span>
                <button class="flight-inspector-notifier__open">&rarr;</button>
                <button class="flight-inspector-notifier__close">&larr;</button>
                <button class="flight-inspector-notifier__clear">&times;</button>
            </div>
            <div class="flight-inspector-notifier__events"></div>
        </div>
    */}

    function templateEventElem() {/*
        <a href="#"
           class="flight-inspector-notifier__event"
           data-action="{{action}}"
           data-description="{{description}}">
            {{description}}
        </a>
    */}

    function templateCss() {/*
        .show-flight-inspector-notifier .flight-inspector-notifier {
            display: block;
        }
        .flight-inspector-notifier {
            display: none;
            font: 12px/1.2 Lucida Grande, sans-serif;
            width: 25em;
            background: rgba(255,255,255,.9);
            position: absolute;
            top: 0;
            left: 0;
            color: #292f33;
            box-shadow: 2px 2px 5px rgba(0,0,0,.3);
            z-index: 10000;
            transition: background-color 100ms linear,
                        top 100ms ease-in-out,
                        left 100ms ease-in-out;
        }

        .flight-inspector-notifier--closed {
            width: 5em;
        }
        .flight-inspector-notifier--open {
            background-color: white;
        }

        .flight-inspector-notifier__menu {
            position: relative;
            padding: 0 0 0 0.3em;
            display: flex;
        }
        .flight-inspector-notifier__menu button {
            font: 12px/1.2 monospace;
            border: none;
            padding: 0;
            cursor: pointer;
            transition: background-color 100ms linear;
            margin: 0;
        }

        .flight-inspector-notifier__menu:beforeXXXX {
            height: 0;
            width: 0;
            border: 0.3em solid #ccd6dd;
            border-right-color: transparent;
            border-bottom-color: transparent;
            display: block;
            position: absolute;
            content: '';
            z-index: -1;
            top: -0.3em;
            left: 0.5em;
            -webkit-transform: rotate(45deg);
        }

        .flight-inspector-notifier__open,
        .flight-inspector-notifier__close {
            background-color: #edf5e9;
        }
        .flight-inspector-notifier__open:hover,
        .flight-inspector-notifier__close:hover {
            background-color: #c6e5b3;
        }

        .flight-inspector-notifier__clear {
            background-color: #ffe8eb;
            display: none !important;
        }
        .flight-inspector-notifier__clear:hover {
            background-color: #f4abba;
        }

        .flight-inspector-notifier__open,
        .flight-inspector-notifier__close,
        .flight-inspector-notifier__clear {
            display: inline-block;
            flex: 1;
        }

        .flight-inspector-notifier__summary {
            margin: 0;
            font-size: 1em;
            display: inline-block;
            flex: 6;
            overflow: hidden;
            white-space: nowrap;
            word-wrap: normal;
            text-overflow: ellipsis;
            line-height: 1.5;
        }

        .flight-inspector-notifier__count {
            display: inline-block;
            width: 2.5em;
            flex: 2;
            line-height: 1.5;
        }

        .flight-inspector-notifier__clear {
        }
        .flight-inspector-notifier__clear:hover {
        }
        .flight-inspector-notifier__clear:active {
        }

        .flight-inspector-notifier--open .flight-inspector-notifier__open,
        .flight-inspector-notifier--open .flight-inspector-notifier__count {
            display: none;
        }

        .flight-inspector-notifier--closed .flight-inspector-notifier__summary,
        .flight-inspector-notifier--closed .flight-inspector-notifier__close,
        .flight-inspector-notifier--closed .flight-inspector-notifier__clear,
        .flight-inspector-notifier--closed .flight-inspector-notifier__events {
            display: none;
        }

        .flight-inspector-notifier__events {
            font: 12px/1.2 monospace;
            border-top: 1px solid #ccd6dd;
            max-height: 100vh;
            overflow-y: scroll;
        }

        .flight-inspector-notifier__event {
            display: block;
            overflow: hidden;
            white-space: nowrap;
            word-wrap: normal;
            text-overflow: ellipsis;
            text-decoration: none;
            color: #292f33;
            padding: 0.1em 0.3em;
            transition: background-color 100ms linear;
            border-top: 1px solid #ccd6dd;
        }
        .flight-inspector-notifier__event:first-child {
            border-top: none;
        }
        .flight-inspector-notifier__event:hover {
            color: black;
            background-color: #edf5e9;
        }
        .flight-inspector-notifier__event:active {
            background-color: #c6e5b3;
        }
        .flight-inspector-notifier__event:before {
            display: inline;
            content: attr(data-count);
            margin-right: 0.1em;
        }
        .flight-inspector-notifier__event--clicked,
        .flight-inspector-notifier__event--clicked:hover {
            color: #66757f;
        }
        .flight-inspector-notifier__event[data-action="sync-group"] {
            color: transparent;
            background: #fff8e8;
            height: 0.667em;
            transition: all 100ms linear;
        }
        .flight-inspector-notifier__event[data-action="sync-group"]:hover {
            background: #ffe8b6;
        }
        .yft {
            -webkit-animation: target-fade 1s 1;
        }
        @-webkit-keyframes target-fade {
            from { background-color: #ffcc4d; }
        }
    */}

    function funstr(fn) {
        return fn.toString().split('\n').slice(1, -1).join('\n')
    }


    $('body').append($('<style/>', {
        text: funstr(templateCss)
    }));

    $(document).on('flightInspectorClearNotifiers', function () {
        Notifier.notifiers.forEach(function (notifier) {
            notifier.teardown();
        });
        Notifier.notifiers = [];
    })

    /**
     * Notifier
     */

    function Notifier(targetNode) {
        this.targetNode = targetNode;
        this.$targetNode = $(targetNode);
        this.position = this.getPositionFromNode(this.targetNode);
        this.lastTargetNodePosition = this.position;
        this.eventData = new WeakMap();

        this.$elem =
            $(template(funstr(templateNotifierElem), {
                summary: [
                    targetNode.nodeName.toLowerCase(),
                    (targetNode.id ? '#' + targetNode.id : ''),
                    (targetNode.classList && targetNode.classList.length ? '.' + targetNode.classList.toString().split(' ').join('.') : '')
                ].join('')
            }))
            .css(this.position)
            .appendTo(document.body);

        this.$events = this.$elem.find('.flight-inspector-notifier__events');
        this.$count = this.$elem.find('.flight-inspector-notifier__count');

        this.eventQueue = new TickQueue(Notifier.EVENT_TIMEOUT, {
            wait: Notifier.EVENT_WAIT
        });

        Notifier.updateQueue.push(this.updateDimensions.bind(this));

        this.$elem
            .on('mouseenter', function (e) {
                // this.eventQueue.pause();
                this.$elem.css({
                    'z-index': '1000000'
                })
                e.stopPropagation();
            }.bind(this))
            .on('mouseleave', function (e) {
                // this.eventQueue.unpause();
                this.$elem.css({
                    'z-index': false
                })
                e.stopPropagation();
            }.bind(this))
            .on('click', '.flight-inspector-notifier__event', function (e) {
                if (this.eventData.has(e.currentTarget)) {
                    e.currentTarget.classList.add('flight-inspector-notifier__event--clicked');
                    var event = this.eventData.get(e.currentTarget);
                    console.info(
                        '%i %s %O',
                        event.events.length,
                        event.description,
                        event.events.map(function (event) {
                            return event.data;
                        })
                    );
                }
                e.preventDefault();
            }.bind(this))
            .on('click', '.flight-inspector-notifier__open, .flight-inspector-notifier__close', function (e) {
                this.$elem
                    .toggleClass('flight-inspector-notifier--open')
                    .toggleClass('flight-inspector-notifier--closed');
                e.preventDefault();
            }.bind(this))
            // .on('click', '.flight-inspector-notifier__clear', function (e) {
            //     this.eventQueue.blitz();
            //     e.preventDefault();
            // }.bind(this))

        this.updateDimensions();
    }

    Notifier.prototype.add = function (event) {
        var $eventElem = this.$events.find('a').last();
        var mostRecent
        var mostRecentAction = $eventElem.attr('data-action');
        var mostRecentDesc = $eventElem.attr('data-description');
        var mostRecentCount = ~~$eventElem.attr('data-count');

        if (!$eventElem.length ||
            event.action !== mostRecentAction ||
            event.description !== mostRecentDesc) {
            $eventElem = $(template(funstr(templateEventElem), event))
                .appendTo(this.$events);
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

        // Update our summary count
        var totalCount = ~~this.$count.text();
        this.$count.text(totalCount + 1);
        this.$elem.removeClass('yft');
        setTimeout(this.$elem.addClass.bind(this.$elem, 'yft'), 0);

        // TODO This will clear the element even if it's updating
        // this.eventQueue.push(function () {
        //     $eventElem.remove();
        // });
    };

    Notifier.prototype.getPositionFromNode = function (node) {
        var position = {top: 0, left: 0}
        // Hack around weird jQuery thing
        if (node !== document) {
            position = $(node).offset();
        }
        position.top = Math.min(Math.max(0, position.top), window.innerHeight);
        position.left = Math.min(Math.max(0, position.left), window.innerWidth);
        return position;
    };

    Notifier.prototype.updateDimensions = function () {
        // Find where we *should* be
        var currentPosition = this.$elem.offset();
        var targetNodePosition = this.getPositionFromNode(this.targetNode);

        var targetHasMoved = (targetNodePosition.top !== this.lastTargetNodePosition.top ||
                              targetNodePosition.left !== this.lastTargetNodePosition.left);

        // Don't take up the same space as someone else
        var newPosition = (targetHasMoved ? targetNodePosition : currentPosition);
        var notifierAtPosition = Notifier.positionMap.get(Notifier.positionFromRaw(newPosition));
        var conflicted = (notifierAtPosition && notifierAtPosition !== this);
        while (conflicted) {
            newPosition.left += this.$elem.width() + 1;
            notifierAtPosition = Notifier.positionMap.get(Notifier.positionFromRaw(newPosition));
            conflicted = (notifierAtPosition && notifierAtPosition !== this);
        }

        // Forget about our old position
        Notifier.positionMap.delete(Notifier.positionFromRaw(currentPosition));

        // Remember out new position
        Notifier.positionMap.set(Notifier.positionFromRaw(newPosition), this);

        // Move the element
        this.$elem.css(newPosition);
        this.lastTargetNodePosition = targetNodePosition;
    };

    Notifier.prototype.teardown = function () {
        console.log('clearing', this);
        Notifier.positionMap.delete(Notifier.positionFromRaw(this.$elem.offset()));
        Notifier.elementMap.delete(this.targetNode);
        this.$elem.remove();
    };

    Notifier.EVENT_TIMEOUT = 250;
    Notifier.EVENT_WAIT = 3000;
    Notifier.UPDATE_TIMEOUT = 50;
    Notifier.elementMap = new WeakMap();
    Notifier.positionMap = new Map();
    Notifier.notifiers = [];

    Notifier.getOrCreateForNode = function (node) {
        var notifier;
        if (Notifier.elementMap.has(node)) {
            notifier = Notifier.elementMap.get(node);
        } else {
            notifier = new Notifier(node);
            Notifier.notifiers.push(notifier);
            Notifier.elementMap.set(node, notifier)
        }
        return notifier;
    };

    Notifier.positionFromRaw = function (rawPosition) {
        return rawPosition.top + ',' + rawPosition.left;
    };

    Notifier.updateQueue = new TickQueue(Notifier.UPDATE_TIMEOUT, {
        loop: true
    });

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
        this.loop = !!opts.loop;
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
                var fn = this.queue.shift();
                fn();
                if (this.loop) {
                    this.queue.push(fn);
                }
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
    TickQueue.prototype.hasItems = function () {
        return !!this.queue.length;
    };
    TickQueue.prototype.blitz = function () {
        var length = this.queue.length;
        while (length--) {
            try {
                var fn = this.queue.shift();
                fn();
                if (this.loop) {
                    this.queue.push(fn);
                }
            } catch (e) {}
        }
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

        var currentGroup = [];

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
            if (node.jquery) {
                node = node.get(0);
            }
            try {
                var notifier = Notifier.getOrCreateForNode(node);
                var eventData = {
                    action: 'trigger',
                    description: 'trigger ' + event,
                    data: {
                        component: this,
                        event: event,
                        node: node,
                        data: data
                    }
                };
                notifier.add(eventData);

                if (!currentGroup.length) {
                    setTimeout(function () {
                        // only add a tick indicator if the group was bigger than one
                        if (currentGroup.length > 1) {
                            notifier.add({
                                action: 'sync-group',
                                description: 'Synchronous group of events',
                                data: currentGroup
                            });
                        }
                        currentGroup = [];
                    }, 0);
                }
                currentGroup.push(eventData);
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
function clearEventNotifiers() {
    $(document).trigger('flightInspectorClearNotifiers');
}
