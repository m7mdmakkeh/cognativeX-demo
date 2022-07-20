(function () {
    this.COGNATIVEX = this.COGNATIVEX || {};
    var a, b = this.COGNATIVEX, c = b.$;
    b.util = {},
        a = b.util,
        a.reduce = function (a, b, d) {
            return 2 === arguments.length && (d = a[0],
                a = a.splice(1, a.length - 1)),
                c.each(a, function (a, c) {
                    d = b.apply(c, [d, c])
                }),
                d
        }
        ,
        a.arrayContains = function (a, b) {
            var d = !1;
            return c.each(a, function (a, c) {
                if (c === b)
                    return d = !0,
                        !1
            }),
                d
        }
        ,
        a.objectValues = function (a) {
            var b = [];
            for (var c in a)
                b.push(a[c]);
            return b
        }
        ,
        a.getWindow = function () {
            try {
                window.top.location.href;
                return window.top
            } catch (a) {
                try {
                    window.parent.location.href;
                    return window.parent
                } catch (a) {
                    return window
                }
            }
        }
        ,
        a.windowSetFunction = function (b, c) {
            var d = a.getWindow()
                , e = d[b];
            d[b] = function () {
                c(),
                "function" == typeof e && e()
            }
        }
        ,
        a.windowAddEventListener = function (a, b) {
            var c = !1;
            try {
                addEventListener("test", null, Object.defineProperty({}, "passive", {
                    get: function () {
                        c = !0
                    }
                }))
            } catch (a) {
            }
            var d = !1;
            return c && (d = {
                passive: !0,
                capture: !1
            }),
                "undefined" != typeof window.addEventListener ? window.addEventListener(a, b, d) : "undefined" != typeof document.attachEvent && document.attachEvent("on" + a, b)
        }
        ,
        a.windowRemoveEventListener = function (a, b, c) {
            return c = "undefined" != typeof c && c,
                "undefined" != typeof window.removeEventListener ? window.removeEventListener(a, b, c) : "undefined" != typeof document.detachEvent && document.detachEvent("on" + a, b)
        }
        ,
        a.objAddEventListener = function (a, b, c, d) {
            return d = "undefined" != typeof d && d,
                "undefined" != typeof a.addEventListener ? a.addEventListener(b, c, d) : "undefined" != typeof a.attachEvent && a.attachEvent("on" + b, c)
        }
        ,
        a.objRemoveEventListener = function (a, b, c, d) {
            return d = "undefined" != typeof d && d,
                "undefined" != typeof a.removeEventListener ? a.removeEventListener(b, c, d) : "undefined" != typeof a.detachEvent && a.detachEvent("on" + b, c)
        }
}());