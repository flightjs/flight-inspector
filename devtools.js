chrome.devtools.panels.elements.createSidebarPane('Flight Components', function(sidebar) {
    chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
        setExpression(sidebar, getSelectedComponent);
    });

    inject(registry)
        .then(function () {
            setExpression(sidebar, getSelectedComponent);
        });
});
