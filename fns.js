/**
 * This code is evaluated in the context of the inspected page!
 */

function registry() {
    if (window.registry) return;
    require(['flight/lib/registry'], function (registry) {
        window.registry = registry;
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

    return (_F = window.registry.components.filter(function (componentInfo) {
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
