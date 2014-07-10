inject(init).catch(fail);

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

$('.js-reload').addEventListener('click', function () {
    location.reload();
});

var $toggler = $('.js-toggle-event-notifier')
$toggler.addEventListener('click', function () {
    inject(toggleEventNotifier)
        .catch(fail);
});
inject(getEventNotifierToggleState)
    .then(function (isOn) {
        $toggler.checked = isOn;
    })
    .catch(fail)
