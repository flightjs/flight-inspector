function inject(fn) {
    return new Promise(function (resolve, reject) {
        chrome.devtools.inspectedWindow.eval(
            '(' + fn.toString() + ')()',
            function (result, exception) {
                if (exception) {
                    return reject(new Error(exception.value));
                }
                return resolve(result);
            }
        );
    });
}

function setExpression(sidebar, fn) {
    sidebar.setExpression(
        '(' + fn.toString() + ')()'
    );
    return Promise.resolve();
}

function fail(why) {
    console.error(why.stack);
}
