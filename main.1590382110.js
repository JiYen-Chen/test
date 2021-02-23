'use strict';

// custom event names
var EVENT_TAB_SHOW = 'custom.event.tab.show';

/**
 * ######################################################
 *   Utility
 * ######################################################
 */
var Utility = (function ($, echoss) {

    /** ## Popup ########################################## */
    var Popup = (function () {

        function showStampError(errorCode, errorMessage) {
            if (errorCode !== echoss.Icon.HANDLE_ERROR_BY_ICON_CODE) {
                Utility.Popup.create('通知', errorMessage + ' (' + errorCode + ')');
            }
        }

        function create(title, message, button, callback) {
            button = button || "關閉視窗";
            var html = '';
            html += '<div class="popup">';
            html += '  <div class="popup-modal">';
            html += '    <div class="popup-title">' + title + '</div>';
            html += '    <div class="popup-message">' + message + '</div>';
            html += '    <div class="popup-close">' + button + '</div>';
            html += '  </div>';
            html += '</div>';
            $('body').append(html);
            $(".popup-close").click(function () {
                $(this).closest(".popup").remove();
                if (callback) {
                    callback();
                }
            });
        }

        function internalError() {
            create('系統無法完成請求', '系統發生了預期外的錯誤，請稍後再嘗試一次。');
        }

        return {
            create: create,
            internalError: internalError,
            showStampError: showStampError
        }
    })();

    /** ## Date ########################################## */
    var Date = (function () {

        function formatCoupon(date) {
            if (date === '29991231') {
                return '無使用期限';
            }
            if (date.length != 8) {
                return date;
            }
            var year = date.substr(0, 4);
            var month = date.substr(4, 2);
            var day = date.substr(6, 2);
            return year + '-' + month + '-' + day;
        }

        return {
            formatCoupon: formatCoupon
        }
    })();

    /** ## String ######################################## */
    var String = (function () {

        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };

        function isBlank(str) {
            return (str.length === 0 || !str.trim());
        }

        //
        // escape HTML string function steal from mustache.js
        //
        // https://github.com/janl/mustache.js/blob/master/mustache.js#L73
        //
        function escapeHtml(string) {
            return string.replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
                return entityMap[s];
            });
        }

        return {
            isBlank: isBlank,
            escapeHtml: escapeHtml
        }
    })();


    /** ## Device ######################################## */
    var Device = (function () {

        function initNotice() {
            if (isHTC()) {
                showHTCNotice();
            } else if (isOPPO()) {
                showOPPONotice();
            }
        }

        function isHTC() {
            return navigator.userAgent.indexOf('HTC') !== -1
        }

        function showHTCNotice() {
            var title = '您使用的是 HTC 裝置';
            var body = '您好：<br/><br/>';
            body += '為協助您順利參加活動，請您暫時關閉裝置內的媒體手勢功能以排除問題：【 設定 > 顯示與手勢 (或顯示、手勢與按鈕) > 關閉 】，或者請夥伴協助透由 OTP 號碼參與活動。<br/><br/>';
            body += '<div style="text-align: center">';
            body += '  <img style="max-width: 80%; border: 1px solid black;" src="/starbucks/img/htc.png" />';
            body += '</div>';
            Popup.create(title, body, '我知道了');
        }

        function isOPPO() {
            return navigator.userAgent.indexOf('OPPO') !== -1
                || navigator.userAgent.indexOf('CPH') !== -1
        }

        function showOPPONotice() {
            var title = '您使用的是 OPPO 裝置';
            var body = '您好：<br/><br/>';
            body += '為協助您順利參加活動，請您暫時關閉裝置內的三指截圖功能以排除問題：【 設定 > 手勢體感 > 快捷手勢 > 關閉 】，或者請夥伴協助透由 OTP 號碼參與活動。<br/><br/>';
            body += '<div style="text-align: center">';
            body += '  <img style="max-width: 80%; border: 1px solid black;" src="/starbucks/img/oppo.png" />';
            body += '</div>';
            Popup.create(title, body, '我知道了');
        }

        return {
            initNotice: initNotice
        }
    })();

    return {
        Popup: Popup,
        Date: Date,
        String: String,
        Device: Device
    };
})($, echoss);

/**
 * ######################################################
 *   SignIn
 * ######################################################
 */
var SignIn = (function ($) {

    function init() {
        $("#login-google").click(checkGoogleRestriction);
    }

    function checkGoogleRestriction(e) {
        // Google restrict certain WebView access google login
        // https://developers.googleblog.com/2016/08/modernizing-oauth-interactions-in-native-apps.html
        if (!/iPhone/.test(window.navigator.userAgent)) {
            return true;
        }
        if (/Safari|FBAV/.test(window.navigator.userAgent)) {
            return true;
        }
        Utility.Popup.create(
            '您可能無法利用 Google 登入',
            '<p>Google 近期在網頁登入增加了新的限制。依照我們的判斷，您現在開啟網頁的方式可能會讓您無法利用 Google 帳號參加活動。請改用下列方式之一來排除問題：</p><p>• 改用您慣用的瀏覽器開啟本網頁<br/>• 改用其他平台的帳號來參加活動</p>'
        );
        e.preventDefault();
    }

    return {
        init: init
    }
})($);

/**
 * ######################################################
 *   Header
 * ######################################################
 */
var Header = (function ($) {

    function init() {
        var menu = $("#menu");
        var btn = $("#menu-btn");

        // toggle menu when btn is clicked
        btn.click(function () {
            menu.slideToggle(150, function () {
                changeIcon(menu.is(":visible") ? "/starbucks/img/icon/close.png" : "/starbucks/img/icon/menu.png");
            });
        });

        // close menu when click outside of menu & btn
        var closeMenu = function (e) {
            var inMenu = $(e.target).closest(menu).length;
            var inBtn = $(e.target).closest(btn).length;
            if (!inMenu && !inBtn) {
                if (menu.is(":visible")) {
                    menu.slideUp(150);
                    changeIcon("/starbucks/img/icon/menu.png");
                }
            }
        };
        $('html').click(closeMenu).on('touchstart', closeMenu);

        $('.top-bar-left').click(function () {
            window.location.href = '/starbucks/';
        });
    }

    function changeIcon(src) {
        var btn = $("#menu-btn");
        btn.fadeOut(150, function () {
            btn.attr('src', src);
            btn.fadeIn(150);
        });
    }

    return {
        init: init
    }
})($);

/**
 * ######################################################
 *   Tabs
 * ######################################################
 */
var Tabs = (function ($) {

    var opts;

    function init(options) {
        opts = options;
        initTabs();
    }

    function initTabs() {
        var items = $(".tabs-menu-item").click(function (e) {
            e.preventDefault();
            $(this).addClass("tabs-menu-item-active");
            $(this).siblings().removeClass("tabs-menu-item-active");

            var clickedId = $(this).attr("href");
            $(".tab-content").not(clickedId).css("display", "none");
            $(clickedId).fadeIn().trigger(EVENT_TAB_SHOW);
        });

        var tab = getOpenTab();
        if (tab === 'coupons') {
            items.last().click();
        } else {
            items.first().click();
        }
    }

    function getOpenTab() {
        var hash = window.location.hash.substr(1);
        if (hash && hash === 'tab-my-coupons') {
            return 'coupons';
        }
        return opts['openTab'] ? opts['openTab'] : 'campaigns';
    }

    return {
        init: init
    }
})($);

/**
 * ######################################################
 *   CouponsTab
 * ######################################################
 */
var CouponsTab = (function ($) {

    var historyLoaded = false;

    function init() {
        $("#tab-my-coupons").one(EVENT_TAB_SHOW, reloadCoupons);
        $("#coupons-reload").click(reloadCoupons);
        $("#coupons-footnote").click(showHistory);
    }

    function showHistory() {
        if (historyLoaded) {
            return;
        }

        $("#coupons-history").empty();
        $("#coupons-history-block").show();
        $.getJSON("/starbucks/coupons_history").done(function (data) {
            if (data.result == 'redirect') {
                window.location.href = data.url;
                return;
            }
            if (data.result != 'ok') {
                Utility.Popup.create('通知', '讀取優惠券歷史記錄失敗', '我知道了');
                return;
            }
            renderCouponsHistory(data);
            historyLoaded = true;
        }).fail(function () {
            $("#coupons-history").empty();
            Utility.Popup.create('通知', '讀取優惠券歷史記錄失敗', '我知道了');
        });
    }

    function reloadCoupons() {
        $("#coupons").hide();
        $("#coupons-loading").show();

        $("#coupons-history-block").hide();
        historyLoaded = false;

        $.getJSON("/starbucks/coupons").done(function (data) {
            $("#coupons-list").empty();
            $("#coupons-history").empty();

            if (data.result == 'redirect') {
                window.location.href = data.url;
                return;
            }
            if (data.result != 'ok') {
                renderMessage('<h4>無法讀取優惠券，請稍後再試一次</h4>');
                return;
            }
            renderCouponsList(data);
        }).fail(function () {
            $("#coupons-list").empty();
            renderMessage('<h4>無法讀取優惠券，請稍後再試一次</h4>');
        }).always(function () {
            $("#coupons").show();
            $("#coupons-loading").hide();
        });
    }

    function renderCouponsList(data) {
        if (data['coupons'].length == 0) {
            renderMessage('<h3>您未持有任何優惠券</h3><h4>參加活動就可以拿到優惠券喔！</h4>');
            return;
        }

        var i;
        var list = $("#coupons-list");
        for (i = 0; i < data['coupons'].length; i++) {
            list.append(createCouponNode(data['coupons'][i]));
        }
    }

    function createCouponNode(coupon) {
        var html = '';
        html += (coupon['status'] === '9') ? '<div class="coupon coupon-expired">' : '<div class="coupon">';
        html += '  <img class="coupon-img" src=""/>';
        html += '  <div class="coupon-content">';
        html += '    <div class="coupon-title"></div>';
        html += '    <div class="coupon-property"><span>發送日期: </span><span class="coupon-property-issue-date"></span></div>';
        html += '    <div class="coupon-property"><span>有效日期: </span><span class="coupon-property-exp-date"></span></div>';
        html += '  </div>';
        html += '</div>';

        var node = $(html);
        $("img", node).attr('src', coupon['imgUrl']);
        $(".coupon-title", node).text(coupon['name']);
        $(".coupon-property-issue-date", node).text(Utility.Date.formatCoupon(coupon['issueDate']));

        var expDate = coupon['__custom_exp_date_description'] ? coupon['__custom_exp_date_description'] : Utility.Date.formatCoupon(coupon['expDate']);
        $(".coupon-property-exp-date", node).text(expDate);

        node.click(function () {
            if (coupon['status'] === '9') {
                var msg = "優惠券「" + coupon['name'] + '」已經於 ' + Utility.Date.formatCoupon(coupon['expDate']) + ' 過期，無法再使用。';
                Utility.Popup.create('本優惠券已過期', msg, '我知道了');
                return;
            }

            if ('__not_available' in coupon) {
                Utility.Popup.create('目前無法兌換', coupon['__not_available_msg'], '我知道了');
                return;
            }

            Coupon.open(coupon);
        });
        return node;
    }

    function renderCouponsHistory(data) {
        var history = $("#coupons-history");
        if (data['coupons'].length == 0) {
            var html = '<tr><td colspan="3" style="text-align: center">無過去記錄</td></tr>';
            history.append(html);
            return;
        }

        var i;
        for (i = 0; i < data['coupons'].length; i++) {
            history.append(createHistoryTemplate(data['coupons'][i]));
        }
    }

    function createHistoryTemplate(data) {
        var html = '';
        html += '<tr>';
        html += '<td>' + data['name'] + '</td>';
        html += '<td style="text-align: center">' + getCouponStatusName(data) + '</td>';
        html += '<td style="text-align: center">' + data['useDate'] + '</td>';
        html += '</tr>';
        return html;
    }

    function getCouponStatusName(data) {
        if (data['status'] == '1') {
            return '未使用';
        } else if (data['status'] == '2') {
            return '已使用';
        } else if (data['status'] == '3') {
            return '已作廢';
        } else if (data['status'] == '9') {
            return '已過期';
        }
        return '';
    }

    function renderMessage(msg) {
        var note = $('<div class="coupons-note"></div>').html(msg);
        $("#coupons-list").append(note);
    }

    return {
        init: init,
        reloadCoupons: reloadCoupons
    }
})($);

// noinspection JSUnusedGlobalSymbols
/**
 * ######################################################
 *  Store Redeem Button
 * ######################################################
 */

var StoreRedeem = (function ($, echoss) {

    var coupon;
    var redeemCompletedCallback;
    var isRedeemed = false;

    function enable(c, callback) {
        if (coupon) {
            return;
        }

        coupon = c;
        redeemCompletedCallback = callback;
        createButton();
        createView();
    }

    function disable() {
        coupon = null;
        redeemCompletedCallback = null;
        removeView();
        removeButton();
    }

    function createButton() {
        var btn = $('<button class="btn btn-redeem-coupon" id="redeem-btn">使用門市店號核銷</button>');
        btn.click(function () {
            showView();
        });
        $("#store-redeem-block").append(btn);
    }

    function removeButton() {
        $("#redeem-btn").remove();
    }

    function createView() {
        var html = '';
        html += '<div id="redeem-view" class="redeem-view" style="display:none">';
        html += '<div class="redeem-view-header">';
        html += '<div class="redeem-view-header-empty"></div>';
        html += '<img id="redeem-view-close" class="redeem-view-close" src="/starbucks/img/store_redeem/close.png"/>';
        html += '<div class="redeem-view-title">門市店號核銷</div>';
        html += '</div>';
        html += '<div class="redeem-view-content">';
        html += '<div class="redeem-view-image"><img src="/starbucks/img/store_redeem/redeem_store.png"></div>';
        html += '<h3>無法使用印章驗證嘛？</h3>';
        html += '<div class="redeem-view-description">輸入門市店號驗證，即可完成核銷；當您遇到不支援或難以驗證的裝置時可以使用本功能來代替印章。</div>';

        html += '<div id="redeem-view-form" class="redeem-view-form">';
        html += '<h3 id="redeem-message" class="redeem-message" style="display: none"></h3>';
        html += '<h3>請輸入門市店號：</h3>';
        html += '<form novalidate>';
        html += '<input id="store-no" name="store" type="tel" maxlength="6" autocomplete="off">';
        html += '<input type="submit" class="btn btn-send-store-no" value="送出並核銷優惠券">';
        html += '</form>';
        html += '</div>';

        html += '<div id="redeem-view-loading" class="redeem-view-loading" style="display: none">';
        html += '<img src="/starbucks/img/store_redeem/loading.gif"><br/><br/><br/>驗證中...';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        var view = $(html);
        // listen click close button
        $("#redeem-view-close", view).click(function () {
            hideView();
        });

        // listen form submit
        $("#redeem-view-form form", view).submit(function (e) {
            e.preventDefault();
            var storeNo = $("#store-no").val();
            var issueNo = coupon['issueNo'];
            var funcKey = coupon['funcKey'];
            var couponNo = coupon['no'];
            redeemCoupon(storeNo, funcKey, issueNo, couponNo);
            return false;
        });

        $("body").append(view);
    }

    function removeView() {
        $("#redeem-view").remove();
    }

    function showView() {
        echoss.Icon.hideIcon();
        $("#redeem-view").show(0).animate({top: "-=100%"}, 200);
    }

    function hideView() {
        $("#redeem-view").animate({top: "+=100%"}, 200).hide(0);
        resetForm();

        if (isRedeemed) {
            disable();
        } else {
            echoss.Icon.showIcon();
        }
    }

    function redeemCoupon(storeNo, funcKey, issueNo, couponNo) {
        if (!storeNo) {
            showErrorMessage('請輸入門市店號');
            return;
        }

        var data = {
            store_no: storeNo,
            function_key: funcKey,
            issue_no: issueNo,
            coupon_no: couponNo
        };

        // don't let user closing during redemption
        hideCloseButton();

        showLoading();
        $.post('/starbucks/redeem_coupon', data).done(function (data) {
            hideLoading();

            if (data['result'] === 'redirect') {
                window.location.href = data['url'];
                return;
            }

            if (data['result'] === 'error') {
                $(window).trigger('event_12cm_custom', ['store_redeem', 'fail']);
                showCloseButton();
                showErrorMessage(data['message']);
                return;
            }

            $(window).trigger('event_12cm_custom', ['store_redeem', 'success']);
            isRedeemed = true;
            if (redeemCompletedCallback) {
                redeemCompletedCallback();
            }

            hideView();

        }).fail(function () {
            $(window).trigger('event_12cm_custom', ['store_redeem', 'fail']);
            hideLoading();
            showCloseButton();
            showErrorMessage('系統發生預期外的錯誤，請稍後再嘗試一次，或改用 OTP 核銷。');
        });
    }

    function showLoading() {
        $("#redeem-view-loading").show();
        $("#redeem-view-form").hide();
    }

    function hideLoading() {
        $("#redeem-view-loading").hide();
        $("#redeem-view-form").show();
    }

    function showErrorMessage(msg) {
        $("#redeem-message").text('核銷失敗：' + msg).show();
    }

    function resetForm() {
        $("#redeem-message").text('').hide();
        $("#store-no").val('');
    }

    function hideCloseButton() {
        $("#redeem-view-close").css('visibility', 'hidden');
    }

    function showCloseButton() {
        $("#redeem-view-close").css('visibility', 'visible');
    }

    return {
        enable: enable,
        disable: disable
    }
})($, echoss);


/**
 * ######################################################
 *   Coupon
 * ######################################################
 */
var Coupon = (function ($, echoss) {

    var stampable = true;

    var eid;
    var currentCoupon;

    function init(k, e) {
        eid = e;
        echoss.initializeSuccess = function () {
            echoss.setLanguageCode(echoss.Common.LANGUAGE_CODE_TYPE.TAIWAN);

            echoss.Stamp.onError = Utility.Popup.showStampError;
            echoss.Stamp.init(function () {
            }, Utility.Popup.showStampError);

            echoss.Icon.init();
            echoss.Icon.enableStampingErrorMsg(true);

            checkMember(eid);
        };
        echoss.initialize(k, echoss.REGION_CODE_TYPE.TAIWAN);
    }

    function open(data) {
        currentCoupon = data;

        renderCoupon(currentCoupon);
        if (currentCoupon['funcCd'] == 'FSC') {
            echoss.Stamp.onStamp = redeemStampCardCouponWithStamp;
            setStampCardCouponOtpOptions(currentCoupon);
        } else if (currentCoupon['funcCd'] == 'FCS') {
            echoss.Stamp.onStamp = redeemMarketingCouponWithStamp;
            setMarketingCouponOtpOptions(currentCoupon);
        }

        hideBackground();
        enableStamping();
        StoreRedeem.enable(data, function () {
            showCompleted();
            scrollToTop();
        });

        Utility.Device.initNotice();
    }

    function close() {
        disableStamping();
        StoreRedeem.disable();
        showBackground();

        if (isCompleted()) {
            CouponsTab.reloadCoupons();
        }

        $(".coupon-detail").remove();
    }

    function hideBackground() {
        // hide stuff in the background to prevent modal scrolling
        $(".container").hide();
    }

    function showBackground() {
        // show stuff in the background because we hide it previously
        $(".container").show();
    }

    function renderCoupon(data) {
        // template
        var html = '';
        html += '<div class="coupon-detail">';
        html += '  <div class="coupon-detail-wrapper">';
        html += '    <div class="coupon-detail-close">';
        html += '      <img src="/starbucks/img/icon/close.png"/>';
        html += '    </div>';
        html += '    <div class="coupon-detail-note">使用時，出示畫面給工作人員蓋章核銷</div>';
        html += '    <div class="coupon-detail-img"></div>';
        html += '    <img class="coupon-detail-complete" src="/assets/img/used_icon.png">';
        html += '    <div class="coupon-detail-content">';
        html += '      <div class="coupon-detail-title"></div>';
        html += '      <table class="coupon-detail-properties">';
        html += '        <tr><td class="coupon-detail-property-name">發送日期：</td><td class="coupon-detail-property-value"></td></tr>';
        html += '        <tr><td class="coupon-detail-property-name">有效日期：</td><td class="coupon-detail-property-value"></td></tr>';
        html += '      </table>';
        html += '    </div>';
        html += '    <div class="coupon-detail-description"></div>';
        html += '    <div id="store-redeem-block"></div>';
        html += '    <div id="cancel-block"></div>';
        html += '    <div class="coupon-detail-footer">星巴克優惠券</div>';
        html += '  </div>';
        html += '</div>';

        // setup node
        var coupon = $(html);
        $(".coupon-detail-img", coupon).css('background-image', 'url("' + data['imgDetailUrl'] + '")');
        $(".coupon-detail-title", coupon).text(data['name']);
        $(".coupon-detail-property-value", coupon).first().text(Utility.Date.formatCoupon(data['issueDate']));

        var expDate = data['__custom_exp_date_description'] ? data['__custom_exp_date_description'] : Utility.Date.formatCoupon(data['expDate']);
        $(".coupon-detail-property-value", coupon).last().text(expDate);

        if (!Utility.String.isBlank(data['description'])) {
            $(".coupon-detail-description", coupon).html(data['description']);
        }
        $(".coupon-detail-close img", coupon).click(Coupon.close);

        // handle cancellable coupon
        if (data['__cancellable']) {
            $("#cancel-block", coupon).append(createCancelCouponButton());
        }

        // attach to the page
        $("body").append(coupon);
    }

    function createCancelCouponButton() {
        var btn = $('<button class="btn btn-default btn-cancel-button">退還此優惠券</button>');
        btn.click(function () {
            cancelStampCardCouponManually();
        });
        return btn;
    }

    function cancelStampCardCouponManually() {
        if (!confirm('您是否確認要退還此優惠券？')) {
            return;
        }

        echoss.Stampcard.cancelCouponManually({
            id: getId(),
            funckey: currentCoupon['funcKey'],
            issueNo: currentCoupon['issueNo']
        }, function () {
            close();
            CouponsTab.reloadCoupons();
        }, function (errorCode, errorMessage) {
            Utility.Popup.showStampError(errorCode, errorMessage);
        });
    }

    function redeemStampCardCouponWithStamp(stampParams) {
        if (!stampable) {
            return;
        }

        disableStamping();
        StampAnimation.start();

        echoss.Stampcard.useCoupon({
            id: getId(),
            funckey: currentCoupon['funcKey'],
            issueNo: currentCoupon['issueNo'],
            stampParams: stampParams,
            brand: "V00A004B021"
        }, function () {
            $(window).trigger('event_12cm_stamp_success');
            StampAnimation.stop();
            showCompleted();
        }, function (errorCode, errorMessage) {
            Utility.Popup.showStampError(errorCode, errorMessage);
            StampAnimation.stop();
            enableStamping();
        });
    }

    function redeemMarketingCouponWithStamp(stampParams) {
        if (!stampable) {
            return;
        }

        disableStamping();
        StampAnimation.start();

        echoss.MarketingCoupon.useCoupon({
            userId: getId(),
            couponNo: currentCoupon['no'],
            stampParams: stampParams,
            brand: "V00A004B021"
        }, function () {
            $(window).trigger('event_12cm_stamp_success');
            StampAnimation.stop();
            showCompleted();
        }, function (errorCode, errorMessage) {
            Utility.Popup.showStampError(errorCode, errorMessage);
            StampAnimation.stop();
            enableStamping();
        });
    }

    function getId() {
        return eid;
    }

    function showCompleted() {
        $(".coupon-detail-complete").show();
    }

    function scrollToTop() {
        $(".coupon-detail").scrollTop(0);
    }

    function isCompleted() {
        return $(".coupon-detail-complete").is(':visible');
    }

    function enableStamping() {
        stampable = true;
        echoss.Icon.showIcon();
    }

    function disableStamping() {
        stampable = false;
        echoss.Icon.hideIcon();
    }

    function setStampCardCouponOtpOptions(data) {
        echoss.Icon.setOtpData(
            {
                aprvData: [3, getId(), data['funcKey'], data['issueNo']].join(","),
                funcCd: echoss.Icon.OTP_FUNC_CODE.STAMP_CARD,
                isuDivCd: echoss.Icon.OTP_ISSUE_TYPE.USE_COUPON,
                cntYn: "N"
            }, function () {
                $(window).trigger('event_12cm_otp_success');
                showCompleted();
                setTimeout(function () {
                    echoss.Icon.closeGuideView();
                    disableStamping();
                }, 2000);
            }, function (errorCode, errorMessage) {
                Utility.Popup.showStampError(errorCode, errorMessage);
            }
        );
    }

    function setMarketingCouponOtpOptions(data) {
        echoss.Icon.setOtpData(
            {
                aprvData: [3, getId(), data['no']].join(","),
                funcCd: "FCS",
                isuDivCd: echoss.Icon.OTP_ISSUE_TYPE.USE_COUPON,
                cntYn: "N"
            }, function () {
                $(window).trigger('event_12cm_otp_success');
                showCompleted();
                setTimeout(function () {
                    echoss.Icon.closeGuideView();
                    disableStamping();
                }, 2000);
            }, function (errorCode, errorMessage) {
                Utility.Popup.showStampError(errorCode, errorMessage);
            }
        );
    }

    function checkMember(id) {
        echoss.User.checkDuplication({
            id: id
        }, function (result) {
            if (result['dup'] == 'N') {
                echoss.User.signup({
                    id: id, os: 'M', equip: 'unknown', type: 1
                }, function () {
                }, function (errorCode, errorMessage) {
                    Utility.Popup.showStampError(errorCode, errorMessage);
                });
            }
        }, function (errorCode, errorMessage) {
            Utility.Popup.showStampError(errorCode, errorMessage);
        });
    }

    return {
        init: init,
        open: open,
        close: close
    }
})($, echoss);

var StampAnimation = (function () {

    function start() {
        if (document.getElementById('modal-stamp') === null) {
            var elemDiv = document.createElement('div');
            elemDiv.id = 'modal-stamp';
            elemDiv.className = 'stamp-modal';
            var htmlStr = '';
            htmlStr += '<div id="stampMotion_fr_box">';
            htmlStr += '	<div id="stamp_box_frame" style="position:relative;">';
            htmlStr += '		<img src="/assets/img/stamp_animation/stamp_motion_fr.png" id="stampMotion_fr" />';
            htmlStr += '		<img src="/assets/img/stamp_animation/stamping_ico.gif" id="stampMotion00" />';
            htmlStr += '	</div>';
            htmlStr += '</div>';
            htmlStr += '<img src="/assets/img/stamp_animation/stamp_motion05.png" id="stampMotion05" />';
            htmlStr += '<img src="/assets/img/stamp_animation/stamp_motion06.png" id="stampMotion06" />';
            htmlStr += '<img src="/assets/img/stamp_animation/stamp_motion07.png" id="stampMotion07" />';
            elemDiv.innerHTML = htmlStr;
            $('body').append(elemDiv);
        }

        $('#modal-stamp').addClass('effect-show');
        $('#stampMotion00').addClass("changeImgShow0");
        $('#stampMotion05').addClass("scaleUpImg");
        $('#stampMotion06').addClass("scaleUpImg2");
        $('#stampMotion07').addClass("scaleUpImg3");
    }

    function stop() {
        $('#modal-stamp').removeClass('effect-show');
        $('#stampMotion00').removeClass("changeImgShow0");
        $('#stampMotion05').removeClass("scaleUpImg");
        $('#stampMotion06').removeClass("scaleUpImg2");
        $('#stampMotion07').removeClass("scaleUpImg3");
    }

    return {
        start: start,
        stop: stop
    }
})();
