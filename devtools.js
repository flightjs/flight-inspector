chrome.devtools.panels.elements.createSidebarPane('Flight Components', function(sidebar) {
    chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
        inject(registry)
            .then(function () {
                setExpression(sidebar, getSelectedComponent);
            });
    });

    inject(registry)
        .then(function () {
            setExpression(sidebar, getSelectedComponent);
        });
});
