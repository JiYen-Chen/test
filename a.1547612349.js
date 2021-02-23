(function ($) {

    $(function () {
        initialize();
    });

    function initialize() {
        var count = 0;
        var intervalId = setInterval(function () {
            if (typeof gtag === 'function' || typeof ga === 'function') {
                waitUntilEchossIconLoaded(monitorEchossIconErrors);
                prepareToDispatchEvents();
                clearInterval(intervalId);
                return;
            }

            if (++count >= 10) {
                clearInterval(intervalId);
            }
        }, 1000);
    }

    function prepareToDispatchEvents() {
        $(window).on({

            'event_12cm_stamp_fail_local': function () {
                displatchEvent('stamp', 'fail_local');
            },

            'event_12cm_stamp_fail_remote': function () {
                displatchEvent('stamp', 'fail_remote');
            },

            'event_12cm_stamp_success': function () {
                displatchEvent('stamp', 'success');
            },

            'event_12cm_otp_success': function () {
                displatchEvent('otp', 'success');
            },

            'event_12cm_otp_fail': function () {
                displatchEvent('otp', 'fail');
            },

            'event_12cm_custom': function (e, category, action) {
                displatchEvent(category, action);
            }
        });
    }

    function monitorEchossIconErrors() {
        var target = $("#echossIcon_popup_wrap").find(".error_msg_echossIcon");
        if (target.length == 0) {
            // just in case
            return;
        }

        if (!("MutationObserver" in window)) {
            // browser not supported
            return;
        }

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                dispatchEchossErrorEvent(mutation);
            });
        });
        var config = {
            childList: true,
            attributes: true,
            characterData: true
        };
        observer.observe(target[0], config);
    }

    function waitUntilEchossIconLoaded(callback) {

        var count = 0;
        var intervalId = setInterval(function () {
            var target = $("#echossIcon_popup_wrap").find(".error_msg_echossIcon");
            if (target.length >= 1) {
                callback();
                clearInterval(intervalId);
                return;
            }

            // try 10 time to find echoss icon, will not track echoss icon related errors if not available
            if (++count >= 10) {
                clearInterval(intervalId);
            }
        }, 1000)
    }

    function dispatchEchossErrorEvent(mutation) {
        if (mutation.type !== 'childList' || !mutation.target) {
            return;
        }

        var event = guessEventByErrorMsg($(mutation.target).text());
        if (event) {
            $(window).trigger(event);
        }
    }

    function guessEventByErrorMsg(msg) {
        if (msg.indexOf('蓋章時請維持一秒鐘') !== -1) {
            return 'event_12cm_stamp_fail_local';
        } else if (msg.indexOf('無法辨識店家') !== -1) {
            return 'event_12cm_stamp_fail_remote';
        }
        return null;
    }

    function displatchEvent(category, action) {
        if (typeof gtag === 'function') {
            gtag('event', action, {'event_category': category});
        } else if (typeof ga === 'function') {
            ga('send', 'event', category, action);
        }
    }

})($);
