chrome.devtools.panels.elements.createSidebarPane('Flight', function(sidebar) {
    sidebar.setPage('panel.html');
});

chrome.devtools.panels.elements.createSidebarPane('Flight: Components', function(sidebar) {
    chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
        inject(init)
            .then(function () {
                setExpression(sidebar, getSelectedComponent);
            })
            .catch(fail)
    });

    inject(init)
        .then(function () {
            setExpression(sidebar, getSelectedComponent);
        })
        .catch(fail)
});

chrome.devtools.panels.elements.createSidebarPane('Flight: Detached Components', function(sidebar) {
    chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
        inject(init)
            .then(function () {
                setExpression(sidebar, getDetachedComponents);
            })
            .catch(fail)
    });

    inject(init)
        .then(function () {
            setExpression(sidebar, getDetachedComponents);
        })
        .catch(fail)
});

// chrome.devtools.panels.create('Flight', '', 'panel.html');
