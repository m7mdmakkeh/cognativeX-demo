(function ($, template, JSON, Class, Cookie) {
    this.COGNATIVEX = this.COGNATIVEX || {};
    this.COGNATIVEX.sdk_version = '33';
    this.COGNATIVEX.allow_log = 0;
    this.COGNATIVEX.rendered = 0;
    var windowAlias = this.window;
    var documentAlias = windowAlias.document;
    var configTrackerUrl = '//pixel.cognativex.com/log', trackGoogleAnalyticsEvents = false;
    var defaultRequestContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
    var encodeWrapper = windowAlias.encodeURIComponent,
        visitorCookieName = 'cognativexvisitorinfo',
        cognativexUserIdCookieName = 'cognativexpixel',
        cognativexUserIdCookieTimeoutSecs = 63072e3; // 2592000;//63072e3,
    sessionCookieName = 'cognativexusersession',
        userLocationCookieName = 'cognativexuserlocation',
        userLocationCookieTimeoutSecs = 24 * 3600 ,
        userDeviceCookieName = 'cognativexuserdevice',
        userDeviceCookieTimeoutSecs = 30 * 24 * 3600 ,
        visitorCookieTimeoutSecs = 63072e3,
        visitorCookieSecure = false,
        sessionCookieSecure = false,
        sessionCookieTimeoutSecs = 1800;
    userstampCookieTimeoutSecs = 2 * 24 * 3600;
    this.COGNATIVEX.current_post = {url: windowAlias.location.href, postid: ''};
    var PARENT_ID = "ptd",
        SDK_VERSION = "svn",
        CLIENT_DATE = "cd",
        APP_KEY = "apk",
        SCREEN = "scr",
        CX_TOKEN = "cx_token",
        APP_DOMAIN = "apd",
        USER_ID = "uid",
        CX_NETWORK_UID_PARAM = "cxnid",
        REFFERAL = "rf",
        SESSION_ID = "sid",
        SESSION_URL = "su",
        SESSION_REF = "sref",
        SESSION_TS = "sts",
        SESSION_LAST_TS = "slts",
        CURRENT_URL = "cu",
        EVENT_ACTION = "kc",
        EXTRA_DATA = "ex",
        ENGAGMENT_SEC = "eg";

    COGNATIVEX.allow_logs = function (msg) {
        if (COGNATIVEX.allow_log == 1) {
            console.log(msg);
        }
    };

    function cognativexEncode(str) {
        if (str)
            return encodeWrapper(str); // encodeWrapper
        return '';
    }

    function getJson(s) {
        if (!s)
            return s;
        return JSON.parse(s);
    }

    function hashCodeCX(s) {
        var h = 0, l = s.length, i = 0;
        if (l > 0)
            while (i < l)
                h = (h << 5) - h + s.charCodeAt(i++) | 0;
        return h;
    }

    function getPostLiteId() {
        var metadata = metadataparsercx.getMetadata(window.document, window.location);
        return hashCodeCX(metadata.title + metadata.image);
    }

    function setUserId(data) {
        Cookie.set(cognativexUserIdCookieName, data,
            {
                expires: cognativexUserIdCookieTimeoutSecs,
                secure: visitorCookieSecure
            });
    }

    function setSharedDomainId() {
        // var xd_cookie = xDomainCookie('//' + COGNATIVEX.getStaticDomain());
        // // var xd_cookie = xDomainCookie( '//localhostscript:9999');
        // xd_cookie.get('cx_network_ir', function (cookie_val) {
        //     //cookie val will contain value of cookie as fetched from local val (if present) else from iframe (if set), else null
        //     var cv = cookie_val;
        //     if (!cv) {
        //         cv = cognativexCreateGuidSharedDomain();
        //         xd_cookie.set('cx_network_ir', cv);
        //     }
        //     COGNATIVEX.CX_NETWORK_ID = cv;
        // });
        return "";
    }

    function setVisitorInfo(data) {
        Cookie.setJSON(visitorCookieName, data,
            {
                expires: visitorCookieTimeoutSecs,
                secure: visitorCookieSecure
            });
    }

    function extendVisitorExpiry() {
        Cookie.extendExpiry(this.visitorCookieName,
            {
                expires: visitorCookieTimeoutSecs,
                secure: visitorCookieSecure
            });
    }

    function extendSessionExpiry() {
        Cookie.extendExpiry(this.sessionCookieName,
            {
                expires: sessionCookieTimeoutSecs,
                secure: sessionCookieSecure
            });
    }

    function setSessionCookie(session) {
        Cookie.setJSON(sessionCookieName,
            session,
            {
                expires: sessionCookieTimeoutSecs,
                secure: sessionCookieSecure
            });
    }

    COGNATIVEX.setUserLocationCookie = function (location) {
        if (location)
            Cookie.setJSON(userLocationCookieName,
                location,
                {
                    expires: userLocationCookieTimeoutSecs,
                    secure: false
                });
    }

    COGNATIVEX.setUserDeviceCookie = function (location) {
        Cookie.setJSON(userDeviceCookieName,
            location,
            {
                expires: userDeviceCookieTimeoutSecs,
                secure: false
            });
    }

    COGNATIVEX.getUserLocationCookie = function () {
        return getJson(Cookie.get(userLocationCookieName));
    }

    COGNATIVEX.getUserDeviceCookie = function () {
        return getJson(Cookie.get(userDeviceCookieName));
    }

    function getVisitorInfo() {
        var now = new Date(), nowTs = Math.round(now.getTime()), id = Cookie.get(visitorCookieName), tmpContainer;
        if (id) {
            tmpContainer = getJson(id);
        } else {
            tmpContainer = {
                userid: COGNATIVEX.userid,
                createdTs: nowTs,
                session_count: 0,
                last_session_ts: nowTs
            }
        }
        return tmpContainer;
    }

    function cognativexCreateGuidUserid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r
                    : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }

    function cognativexCreateGuidSharedDomain() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r
                    : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }

    function cognativexCreateGuidPageview() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r
                    : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }

    function getSession() {
        return getJson(Cookie.get(sessionCookieName));
    }


    window.COGNATIVEX.refreshTrackers = function (postId, url) {
        window.COGNATIVEX.current_post = {
            postid: postId,
            url: url
        }
    };

    /*
     * Inits trackers and renders new widgets after ajax
     * */
    window.COGNATIVEX.initAfterAjax = function (postId, url, widgetIdArr) {
        window.COGNATIVEX.refreshTrackers(postId, url);
        if (widgetIdArr && !widgetIdArr.length) return;
        // render widget gets an array of widget ids to be rendered
        window.COGNATIVEX.renderWidgets(widgetIdArr);
    };

    /*
     * Parse jsonld
     * */
    function parseOldJsonLd() {
        var jsonlds = document.querySelectorAll('script[type="application/ld+json"]');
        var pid = "";
        if (jsonlds) {
            for (var i = 0; i < jsonlds.length; i++) {
                var jl = jsonlds[i];
                //pid = jsonlds.forEach(function (jl) {
                try {
                    var json = JSON.parse(jl.innerText);
                    if (json && json.postid && json.classes) {
                        COGNATIVEX.current_post.postid = json.postid;
                        COGNATIVEX.postId = COGNATIVEX.current_post.postid;
                        console.log('parseOldJsonLd ' + json.postid);
                        pid = json.postid;
                        break;
                    }
                } catch (err) {
                    console.warn('CognativeX OLD JSON meta is invalid');
                }
            }
        }
        return pid;
    }

    /*
     * Parse jsonld
     * */
    function parseNewCXJson() {
        var jsonlds = document.querySelectorAll('script[type="text/cognativex"]');
        var pid = "";
        if (jsonlds) {
            for (var i = 0; i < jsonlds.length; i++) {
                var jl = jsonlds[i];
                //pid = jsonlds.forEach(function (jl) {
                try {
                    var json = JSON.parse(jl.innerText);
                    COGNATIVEX.current_post.posttype = json.type;
                    if (json && json.postid && json.type && (json.type.toLowerCase() === 'article' || json.type.toLowerCase() === 'post')) {
                        COGNATIVEX.current_post.postid = json.postid;
                        COGNATIVEX.postId = COGNATIVEX.current_post.postid;
                        //console.log('parseNewCXJson ' + json.postid);
                        pid = json.postid;
                        break;
                    }
                } catch (err) {
                    console.warn('CognativeX JSON meta is invalid');
                }
            }

        }
        return pid;
    }

    function getSharedData(eventAction, post) {
        var nowTs = Math.round(new Date().getTime()),
            screen = windowAlias.screen
            , b = screen.width + "x" + screen.height
            , c = screen.availWidth + "x" + screen.availHeight
            , d = screen.colorDepth;
        var userscreen = b + "|" + c + "|" + d;
        var referralUrl = documentAlias.referrer;
        var formData = [];
        formData.push(EVENT_ACTION + "=" + eventAction);// kaction

        formData.push("cxv=10");// dont change
        formData.push(APP_DOMAIN + "=" + COGNATIVEX.config.appdomain);// appdomain
        formData.push(USER_ID + "=" + COGNATIVEX.userid);// userid
        formData.push(CX_NETWORK_UID_PARAM + "=" + COGNATIVEX.CX_NETWORK_ID);// shared id
        formData.push(PARENT_ID + "=" + COGNATIVEX.pageviewid);// parentid
        formData.push(CLIENT_DATE + "=" + nowTs);// clientdate
        formData.push(SCREEN + "=" + userscreen);// screen
        var cx_token = findGetParameter(CX_TOKEN);
        if (cx_token) {
            formData.push(CX_TOKEN + "=" + cx_token);
        }
        formData.push(CURRENT_URL + "=" + encodeWrapper(COGNATIVEX.current_post.url));// currenturl
        //formData.push("rfl=" + encodeWrapper(referralUrl));// referralUrl

        if (COGNATIVEX.current_post.postid) {
            formData.push("pid=" + COGNATIVEX.current_post.postid);
            COGNATIVEX.postId = COGNATIVEX.current_post.postid;
            //set cookie // append
        } else {
            if (COGNATIVEX.config.settings["lite"]) {
                COGNATIVEX.current_post.postid = getPostLiteId();
                COGNATIVEX.postId = COGNATIVEX.current_post.postid;
                if (COGNATIVEX.postId)
                    formData.push("pid=" + COGNATIVEX.postId);
            } else {
                var parseNewPostId = parseNewCXJson();
                if (parseNewPostId)
                    formData.push("pid=" + parseNewPostId);
                else {
                    var parsePostId = parseOldJsonLd();
                    if (parsePostId)
                        formData.push("pid=" + parsePostId);
                }
            }
        }
        return formData;
    }

    /*
   * Send image request to server using GET. The infamous web bug (or
   * beacon) is a transparent, single pixel (1x1) image
   */
    function getImage(request, callback) {
        var image = new Image(1, 1);
        image.onload = function () {
            // iterator = 0; // To avoid JSLint warning of empty block
            if (typeof callback === 'function') {
                callback();
            }
        };
        image.src = '//' + COGNATIVEX.getTrackingDomain() + '/pixel.png?' + request;
    }

    function getCampaignImage(request, callback) {
        var image = new Image(1, 1);
        image.src = '//campaigns.cognativex.com/pixel.png?' + request;
    }

    function sendXmlHttpRequest(requestdata) {
        try {
            var method = "POST";
            var async = true;
            var request = new XMLHttpRequest();
            request.onload = function () {

            };
            request.open(method, configTrackerUrl, async);
            request.setRequestHeader("Content-Type", defaultRequestContentType);

            request.send(requestdata.replace(/%20/g, '+'));
        } catch (e) {
            // LOG error
            // getImage(postData);
        }
    }

    function sendRequest(formData, post) {
        var request = formData.join('&');

        // if (post || request.length > 2000) {
        //     //sendXmlHttpRequest(request);
        // } else {
        getImage(request);
        // }
    }

    function sendCampaignRequest(formData) {
        var request = formData.join('&');
        getCampaignImage(request);
    }

    COGNATIVEX.trackGaEvent = function (action, widgetkey) {
        if (COGNATIVEX.trackGoogleAnalyticsEvents) {
            try {
                if (ga && (typeof ga === 'function')) {
                    var eventdata = {
                        eventCategory: 'CognativeX Widget',
                        eventAction: action,
                        eventLabel: widgetkey
                    };
                    if (action === 'widget_click')
                        eventdata['transport'] = 'beacon';

                    ga('send', 'event', eventdata);
                }
            } catch (err) {
                //
            }
        }
    };
    COGNATIVEX.getTrackingDomain = function () {
        // if (COGNATIVEX.config.appdomain == 'striveme.com'
        //     || COGNATIVEX.config.appdomain == 'kooora.com') {
        //return "log.cognative.xyz"
        // }
        return "log.cognativex.com"
    }
    COGNATIVEX.getStaticDomain = function () {
        return "static.cognativex.com"
    }
    COGNATIVEX.trackCampaignEvent = function (extra, action, result, targetTypes, publisherId) {
        var formData = getSharedData(action);
        formData.unshift(EXTRA_DATA + "=" + (extra || ''));
        //if (targetTypes)
        //formData.push("ctt=" + (targetTypes || ''));
        formData.push("pbid=" + publisherId)

        if (result) {
            formData.push("wid=" + (result.id || ''));
            formData.push("wky=" + (result.key || ''));
            formData.push("wvn=" + (result.version || ''));
            formData.push("wsz=" + (result.slotNumber || ''));
        }
        sendCampaignRequest(formData, true);
    };

    COGNATIVEX.trackWidgetEvent = function (extra, action, result) {
        var formData = getSharedData(action);
        formData.push(EXTRA_DATA + "=" + (extra || ''));
        if (result) {
            formData.push("wid=" + (result.id || ''));
            formData.push("wky=" + (result.key || ''));
            formData.push("wvn=" + (result.version || ''));
            formData.push("wsz=" + (result.slotNumber || ''));
        }
        sendRequest(formData, true);
    };

    function init_session() {
        var nowTs = Math.round(new Date().getTime()), session = getSession(), visitorinfo = getVisitorInfo();
        COGNATIVEX.pageviewid = cognativexCreateGuidPageview();//+ '_' + nowTs;

        COGNATIVEX.userid = Cookie.get(cognativexUserIdCookieName);
        if (!COGNATIVEX.userid) {
            COGNATIVEX.userid = cognativexCreateGuidUserid();
            setUserId(COGNATIVEX.userid);
        }
        setSharedDomainId(COGNATIVEX.userid);
        // New session?
        if (!session) {
            visitorinfo.session_count++;
            var url = windowAlias.location.href, reff = documentAlias.referrer;

            session = {
                sid: visitorinfo.session_count,
                surl: url,
                sref: reff,
                sts: nowTs,
                slts: visitorinfo.last_session_ts
            };
            setSessionCookie(session);
            // Update the last visit timestamp
            visitorinfo.last_session_ts = session.sts; // nowTs
            setVisitorInfo(visitorinfo);
        } else {
            // session.sts = nowTs;
            extendVisitorExpiry(visitorinfo);
            extendSessionExpiry(session);
        }
        return session;
    }

    COGNATIVEX.trackPageView = function (loadtime) {
        var session = init_session();

        var formData = getSharedData("pv");
        formData.push("ldte=" + (loadtime || ''));// loadtime
        formData.push(SESSION_ID + "=" + (session.sid || ''));// sessionid
        //formData.push(REFFERAL + "=" + encodeWrapper(documentAlias.referrer));// referral

        if (COGNATIVEX.postId)
            sendRequest(formData);

        if (COGNATIVEX.postId) {
            var cx = new COGNATIVEX.cognativeXHelpers();
            var user_posts = cx.getCookie('cx_user_posts_history'); // array of objs having {postId:  12, timestamp: ...}
            if (!cx.checkIfExist(user_posts, 'postId', COGNATIVEX.postId)) {
                // if user post doesnt exist in the array then update it
                user_posts.push({timestamp: new Date().toUTCString(), postId: COGNATIVEX.postId});
            }
            cx.setCookie('cx_user_posts_history', user_posts);
        }
    };


    function submitHearBeat(engagedSecs) {
        var formData = getSharedData("hb");
        formData.push(ENGAGMENT_SEC + "=" + engagedSecs);
        if (COGNATIVEX.postId)
            sendRequest(formData);
    }

    COGNATIVEX.trackHeartBeat = function () {
        var root = {
            enableHeartbeats: true,
            secondsBetweenHeartbeats: 20.5,
            activeTimeout: 5
        };
        if (COGNATIVEX.config.appdomain === 'kooora.com')
            root.secondsBetweenHeartbeats = 30;
        // Allow publishers to disable engaged time pings all together
        if (typeof root.enableHeartbeats === "boolean"
            && !root.enableHeartbeats) {
            return;
        }

        var MAX_HEARTBEATS_REQUESTS = 10, MIN_TIME_BETWEEN_HEARTBEATS = 1, // 1 sec
            MAX_TIME_BETWEEN_HEARTBEATS = 40, // 15 secs
            MIN_ACTIVE_TIMEOUT = 1, // 1 sec
            MAX_ACTIVE_TIMEOUT = 60, // 60 secs
            SAMPLE_RATE_SECONDS = 0.1, // 100 milliseconds
            EVENT_NAMES = ["focus", "mousedown", "mouseup", "mousemove", "scroll",
                "touchstart", "touchenter", "keyup", "keydown"];

        var secondsBetweenHeartbeats = 5.5; // default, 5.5s
        // Allow integrators to configure secondsBetweenHeartbeats if, for
        // example, they
        // wish to send fewer pixels for mobile devices
        if (root.secondsBetweenHeartbeats >= MIN_TIME_BETWEEN_HEARTBEATS
            && root.secondsBetweenHeartbeats <= MAX_TIME_BETWEEN_HEARTBEATS) {
            secondsBetweenHeartbeats = root.secondsBetweenHeartbeats;
        }

        var activeTimeout = 5; // default, 5 seconds
        if (root.activeTimeout >= MIN_ACTIVE_TIMEOUT
            && root.activeTimeout <= MAX_ACTIVE_TIMEOUT) {
            activeTimeout = root.activeTimeout;
        }

        var now = new Date().getTime();

        // keep track of how recently we saw the last event
        root._lastEvent = now;
        // time of the last sample, used for time accumulation
        root._lastSample = now;
        // total number of engaged seconds to report next
        root._engagedMs = 0;
        // externally visible indicator of engaged status
        root.isEngaged = true;
        // externally visible indicator of interacting status
        root.isInteracting = true;
        // maintain a focused property that indicates whether the document has
        // focus
        root.focused = true;
        // externally visible indicator of whether a video is being tracked and
        // is playing
        COGNATIVEX.videoPlaying = false;
        root._heartbeat_requests = 0;
        // maintain a flag that indicates whether the window is currently
        // focused
        COGNATIVEX.$(document).on("show", function () {
            root.focused = true;
        });
        COGNATIVEX.$(document).on("hide", function () {
            root.focused = false;
        });

        var _buildListener = function (event_name, callback) {
            if (window.addEventListener) {
                window.addEventListener(event_name, callback, false);
            } else {
                document.attachEvent("on" + event_name, callback);
            }
        };

        // trigger the activity timeout with any of EVENT_NAMES
        var registerEvent = function () {
            root._lastEvent = new Date().getTime();
        };

        for (var i = 0; i < EVENT_NAMES.length; i++) {
            _buildListener(EVENT_NAMES[i], registerEvent);
        }

        /*
         * Track embedded YouTube videos
         * https://developers.google.com/youtube/js_api_reference#Events
         */

        var YT_PLAYING = 1, YT_UNSTARTED = -1, YT_ENDED = 0, YT_PAUSED = 2;
        COGNATIVEX.listenToYTVideoPlayer = function (player) {
            if (!$.isFunction(player["addEventListener"])) {
                return false;
            } else {
                player.addEventListener("onStateChange", function (event) {
                    if (event.data === YT_UNSTARTED || event.data === YT_ENDED ||
                        event.data === YT_PAUSED) {
                        COGNATIVEX.videoPlaying = false;
                    } else if (event.data === YT_PLAYING) {
                        COGNATIVEX.videoPlaying = true;
                        registerEvent();
                    }
                });
            }
        };
        /*
         * Every SAMPLE_RATE_SECONDS, increase the counter root._engagedMs by
         * the amount of time engaged measured since the last sample was taken.
         */
        var sample = function () {
            var currentTime = new Date().getTime();
            // define "interacting" as "it is currently less than activeTimeout
            // seconds
            // since the last engagement event was triggered
            root.isInteracting = currentTime - root._lastEvent < activeTimeout * 1000;
            root.isEngaged = (root.isInteracting && root.focused)
                || root.videoPlaying;
            // accumulate the amount of engaged time since last heartbeat
            root._engagedMs += root.isEngaged ? (currentTime - root._lastSample)
                : 0;
            root._lastSample = currentTime;
        };

        window.setInterval(sample, SAMPLE_RATE_SECONDS * 1000);

        /*
         * Every secondsBetweenHeartbeats seconds, send a heartbeat and reset
         * the accumulator
         */

        var sendHeartbeat = function () {
            if (root.enableHeartbeats) {
                var engagedSecs = Math.round(root._engagedMs / 1000);
                if (engagedSecs > 0
                    && engagedSecs <= Math.round(secondsBetweenHeartbeats)) {
                    if (root._heartbeat_requests < MAX_HEARTBEATS_REQUESTS) {
                        root._heartbeat_requests++;
                        submitHearBeat(engagedSecs);
                    }
                }
            }
            root._engagedMs = 0;
        };

        // every secondsBetweenHeartbeats, attempt to send a pixel
        window.setInterval(sendHeartbeat, secondsBetweenHeartbeats * 1000);
        _buildListener("beforeunload", sendHeartbeat);
    };

    function isExpired(timestamp, lifeTimeInDays) {
        var today = new Date(),
            createdDate = new Date(timestamp),
            timeDiff = Math.abs(createdDate.getTime() - today.getTime()),
            lifeSpentInDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (lifeSpentInDays > lifeTimeInDays) {
            return true;
        }
        return false;
    }


    function temporaryCodeToBeDeleted(cx, user_posts_history) {
        if (!user_posts_history) user_posts_history = [];
        user_posts_history = JSON.parse(JSON.stringify(user_posts_history));
        // temporary code to be removed after one week of 15th may 2019
        var oldCookieMigration2localstorage = Cookie.get('user_posts_history');
        if (oldCookieMigration2localstorage) {
            oldCookieMigration2localstorage = getJson(oldCookieMigration2localstorage);

            for (var old = 0; old < oldCookieMigration2localstorage.length; old++) {
                if (!cx.checkIfExist(user_posts_history, 'postId', oldCookieMigration2localstorage[old]['postId'])) {
                    // doesnt exist in localstorage so add it
                    user_posts_history.push(oldCookieMigration2localstorage[old]);
                }
            }
            // delete the cookie too and update the local storage
            Cookie.expire('user_posts_history');
        }
        return user_posts_history;
    }

    function init() {
        // inits the user post history each 3 days once
        var cx = new COGNATIVEX.cognativeXHelpers(),
            user_posts_history = cx.getCookie('cx_user_posts_history'),
            campaign_posts_history = cx.getCookie('cx_campaign_posts_history');

        user_posts_history = temporaryCodeToBeDeleted(cx, user_posts_history);

        if (!user_posts_history) {
            // if the history cookie expired then recreate the user history
            cx.setCookie('cx_user_posts_history', []);
        } else {
            // this is not empty delete all posts that are older than 3 days..
            var userH = [];
            for (var i = 0; i < user_posts_history.length; i++) {
                if (user_posts_history[i] && !(isExpired(user_posts_history[i]['timestamp'], 3))) {
                    userH.push(user_posts_history[i]);
                }
            }
            cx.setCookie('cx_user_posts_history', userH);
        }

        // create a campaign history cookie if not exist and set to empty array
        if (!campaign_posts_history) {
            cx.setCookie('cx_campaign_posts_history', []);
        }
    }

    window.COGNATIVEX.mergeObj = function (obj1, obj2) {
        var res = obj1;
        for (var key in obj2) {
            res[key] = obj2[key];
        }
        return res;
    };

    window.COGNATIVEX.cxCmp = function (ad, type, appdomain, widget_id, widget_key) {
        //var ad = JSON.parse(adObj);
        var adId = ad.adKeyHash;
        // for campaign clicks
        if (adId && type && type.toLowerCase() == 'campaign') {
            var cx = new COGNATIVEX.cognativeXHelpers();
            var campaign_posts = cx.getCookie('cx_campaign_posts_history'); // array of objs having {postId:  12, timestamp: ...}
            if (!cx.checkIfExist(campaign_posts, 'postId', adId)) {
                // if user post doesnt exist in the array then update it
                campaign_posts.push({timestamp: new Date().toUTCString(), postId: adId});
            }
            cx.setCookie('cx_campaign_posts_history', campaign_posts);

            //Send ad clicks to google tag manager
            // window.dataLayer = window.dataLayer || [];
            // window.dataLayer.push({
            //     'event': 'cx_ad_click',
            //     'ad_provider': ad.provider,
            //     'campaign_id': ad.campaignId,
            //     'adset_id': ad.adsetId,
            //     'ad_id': ad.adId,
            //     'cpc': ad.cpc,
            //     'title': ad.title,
            //     'advertiser_name': ad.advertiserName,
            //     'third_party_id': ad.provider + '_' + ad.third_party_id,
            //     'url': ad.url,
            //     'appdomain': appdomain,
            //     'widget_id': widget_id,
            //     'widget_key': widget_key,
            // });
            //
            return true;
        }
        return true;
    };

    /**
     *
     * @param {} widgetid
     * @param {} container
     * @param {} templateid
     * @returns {}
     * example
     * <script type="text/x-template" id="widget-template-123">
     <h3>{%=o.header%}</h3>
     <ul>
     {% for (var i=0; i<o.items.length; i++) { %}
            <li>{%=o.posts[i].title%}</li>
        {% } %}
     </ul>
     </script>

     var data = {
            "appdomain": "xxx.yyy",
            "header": "Recommendaed for you",
            "widgetid": "w123",
            "posts": [
                {"title":"post1",thumb:"",date:"","postid":"erw",rank:0.9,index:"1",logic:"als",version:"2"},
                {"title":"post2",thumb:"",date:"","postid":"erw",rank:0.9,index:"1",logic:"als",version:"2"}
            ]
        };

     document.getElementById("result").innerHTML = template("widget-template-123", data);
     */


    COGNATIVEX.setTrackurl = function (url) {
        configTrackerUrl = url;
    };

    function findGetParameter(parameterName) {
        var result = null,
            tmp = [];
        var items = location.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        }
        return result;
    }

    COGNATIVEX.getQueryStr = function (infoArr) {
        var adsToExclude = COGNATIVEX.getFcappedItems();

        var userLocation = COGNATIVEX.getUserLocationCookie();
        var userDevice = COGNATIVEX.getUserDeviceCookie();

        var cx = new COGNATIVEX.cognativeXHelpers();
        var history = cx.getHistoryArr('cx_user_posts_history', 'postId');
        var campaignHistory = cx.getHistoryArr('cx_campaign_posts_history', 'postId');
        var queryStr = [];
        var fullRequest = true;// COGNATIVEX.config.appdomain != 'kooora.com';

        for (var i = 0; i < infoArr.length; i++) {
            // if looping and not empty add an & to add the 2nd data parameter
            // if (queryStr) queryStr += '&';
            // get the info
            var info = infoArr[i];
            // if userid add it

            if (fullRequest && info == 'exc_ads') {
                queryStr.push('exc_ads=' + adsToExclude.join());
                continue;
            }

            if (info == 'userid') {
                queryStr.push('userid=' + (fullRequest ? COGNATIVEX.userid : 'cx_user'));
                continue;
            }

            if (info == 'appdomain') {
                queryStr.push('appdomain=' + COGNATIVEX.config.appdomain);
                continue;
            }

            if (fullRequest && info == 'history_postids' && history) {
                queryStr.push('history_postids=' + history.join(','));
                continue;
            }

            if (fullRequest && info == 'history_adids' && campaignHistory) {
                queryStr.push('history_adids=' + campaignHistory.join(','));
                continue;
            }

            if (info === 'country_code' && userLocation) {
                queryStr.push('country_code=' + userLocation.country_code);
                continue;
            }

            if (info === 'device_code' && userDevice) {
                queryStr.push('device_code=' + userDevice.device_code);
                continue;
            }
        }
        return queryStr.join('&');
    };

    function cxTriggerEvent(el, eventName, options) {
        var event;
        if (window.CustomEvent) {
            event = new CustomEvent(eventName, options);
        } else {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent(eventName, true, true, options);
        }
        console.log(eventName);
        el.dispatchEvent(event);
    }

    var isscriptloaded = false;

    function renderData() {
        cxTriggerEvent(document, "cognativeXScriptLoaded", {
            detail: 'Cx loaded'
        });
        if (COGNATIVEX.rendered == 0) {
            COGNATIVEX.rendered = 1;
            if (COGNATIVEX.widgets && COGNATIVEX.widgets.length > 0) {
                for (var i = 0; i < COGNATIVEX.widgets.length; i++) {
                    if (typeof COGNATIVEX.widgets[i] === "function") {
                        COGNATIVEX.widgets[i]();
                    }
                }
            }
        }

    }

    COGNATIVEX.isMobile = function() {
        //https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };

    COGNATIVEX.renderKoooraSpread = function () {

        // if(COGNATIVEX.isMobile())
        // {
        //     alert("Mobile");
        // } else {
        //     alert("Not a Mobile");
        // }

        // $('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-0"><script> window.native = window.native || []; window.native.push({apiKey: "6K2PK8BKJJ7JWPTCBG2P", code: "a56ce686-ef75-4a0c-9f80-147fc32b4886"}); window.publisherUrl = "https://www.kooora.com"; (function(d) { var script = d.createElement("script"); script.async = true; script.src = "https://s.yimg.com/dy/ads/native.js"; d.body.appendChild(script); })(document);</script></div></div>');
        // $('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886"; scriptIdParent.insertBefore(container, scriptId);  window.native = window.native || [];  window.native.push({    apiKey: "6K2PK8BKJJ7JWPTCBG2P",    code: "a56ce686-ef75-4a0c-9f80-147fc32b4886"  });  window.publisherUrl = "https://www.kooora.com";  (function(d) {    var script = d.createElement("script");    script.async = true;    script.src = "https://s.yimg.com/dy/ads/native.js";    d.body.appendChild(script);  })(document);</script></div></div>');

        // if(window.COGNATIVEX.showFlurry)
        // {
            // flurry scipt

        var userLocation = COGNATIVEX.getUserLocationCookie();
        //render flurry script
        if (userLocation && userLocation.country_code != 'BH' && userLocation.country_code != 'AE') {
            if(COGNATIVEX.isMobile())
            {
                //$('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29d"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "ec5b2936-b1a1-4bc6-b1fb-147e7134f29d",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29d");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');
                //$('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-21f83643-df29-45e9-bc41-185bea612b0f"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "21f83643-df29-45e9-bc41-185bea612b0f",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-21f83643-df29-45e9-bc41-185bea612b0f");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');

                //$('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29d"; scriptIdParent.insertBefore(container, scriptId); window.nativePreventDuplicates = true; window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "ec5b2936-b1a1-4bc6-b1fb-147e7134f29d",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29d");     var parent = container.parentElement;     parent.style.display = "none";   }, duplicateHandler: function(creativeId, section){     console.log("Duplicate Ad detected: ", creativeId);   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');
                $('.cx-topnews-div:last').after('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29d"; scriptIdParent.insertBefore(container, scriptId); window.nativePreventDuplicates = true; window.native = window.native || []; window.native.push({ apiKey: "6K2PK8BKJJ7JWPTCBG2P", code: "ec5b2936-b1a1-4bc6-b1fb-147e7134f29d", params: { locale: "ar", }, passbackHandler: function(section) { console.log(section.code, section.error); var container = document.querySelector(".native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29d"); var parent = container.parentElement; parent.style.display = "none"; }, duplicateHandler: function(creativeId, section){ console.log("Duplicate Ad detected: ", creativeId); }}); window.publisherUrl = "https://www.kooora.com"; (function(d) { var script = d.createElement("script"); script.async = true; script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');
                //$('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-21f83643-df29-45e9-bc41-185bea612b0f"; scriptIdParent.insertBefore(container, scriptId); window.nativePreventDuplicates = true; window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "21f83643-df29-45e9-bc41-185bea612b0f",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-21f83643-df29-45e9-bc41-185bea612b0f");     var parent = container.parentElement;     parent.style.display = "none";   }, duplicateHandler: function(creativeId, section){     console.log("Duplicate Ad detected: ", creativeId);   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');
                $('.cx-topnews-div:last').after('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-21f83643-df29-45e9-bc41-185bea612b0f"; scriptIdParent.insertBefore(container, scriptId); window.nativePreventDuplicates = true; window.native = window.native || []; window.native.push({ apiKey: "6K2PK8BKJJ7JWPTCBG2P", code: "21f83643-df29-45e9-bc41-185bea612b0f", params: { locale: "ar", }, passbackHandler: function(section) { console.log(section.code, section.error); var container = document.querySelector(".native-ad-21f83643-df29-45e9-bc41-185bea612b0f"); var parent = container.parentElement; parent.style.display = "none";}, duplicateHandler: function(creativeId, section){ console.log("Duplicate Ad detected: ", creativeId);} }); window.publisherUrl = "https://www.kooora.com"; (function(d) { var script = d.createElement("script"); script.async = true; script.src = "https://s.yimg.com/dy/ads/native.js"; d.body.appendChild(script); })(document); </script></div></div>');
            } else {
                //$('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "a56ce686-ef75-4a0c-9f80-147fc32b4886",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script> </div></div>');
                //$('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "a750001a-17de-4727-b5ea-5485ec6ab0c1",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script> </div></div>');
                //$('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886"; scriptIdParent.insertBefore(container, scriptId); window.nativePreventDuplicates = true; window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "a56ce686-ef75-4a0c-9f80-147fc32b4886",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886");     var parent = container.parentElement;     parent.style.display = "none";   }, duplicateHandler: function(creativeId, section){     console.log("Duplicate Ad detected: ", creativeId);   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');
                $('.cx-topnews-div:last').after('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886"; scriptIdParent.insertBefore(container, scriptId); window.nativePreventDuplicates = true; window.native = window.native || []; window.native.push({ apiKey: "6K2PK8BKJJ7JWPTCBG2P", code: "a56ce686-ef75-4a0c-9f80-147fc32b4886", params: { locale: "ar", }, passbackHandler: function(section) { console.log(section.code, section.error); var container = document.querySelector(".native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886"); var parent = container.parentElement; parent.style.display = "none"; }, duplicateHandler: function(creativeId, section){ console.log("Duplicate Ad detected: ", creativeId); } }); window.publisherUrl = "https://www.kooora.com"; (function(d) { var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js"; d.body.appendChild(script); })(document); </script></div></div>');
                //$('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1"; scriptIdParent.insertBefore(container, scriptId); window.nativePreventDuplicates = true; window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "a750001a-17de-4727-b5ea-5485ec6ab0c1",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1");     var parent = container.parentElement;     parent.style.display = "none";   }, duplicateHandler: function(creativeId, section){     console.log("Duplicate Ad detected: ", creativeId);   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');
                $('.cx-topnews-div:last').after('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1"; scriptIdParent.insertBefore(container, scriptId); window.nativePreventDuplicates = true; window.native = window.native || []; window.native.push({ apiKey: "6K2PK8BKJJ7JWPTCBG2P", code: "a750001a-17de-4727-b5ea-5485ec6ab0c1", params: { locale: "ar", }, passbackHandler: function(section) { console.log(section.code, section.error); var container = document.querySelector(".native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1"); var parent = container.parentElement; parent.style.display = "none"; }, duplicateHandler: function(creativeId, section){ console.log("Duplicate Ad detected: ", creativeId); } }); window.publisherUrl = "https://www.kooora.com"; (function(d) { var script = d.createElement("script"); script.async = true; script.src = "https://s.yimg.com/dy/ads/native.js"; d.body.appendChild(script); })(document); </script></div></div>');
            }
        }

//        }

        // if(window.COGNATIVEX.showSpread)
        // {
            //$('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-1"><script>    window.googletag = window.googletag || {cmd: []};  var permutiveseg=encodeURIComponent(JSON.parse(localStorage._pdfps || "[]"));      var player, team, countrys, keywords,comp;      if(typeof signal!="undefined"){         player=typeof signal.Content.Player!="undefined"?signal.Content.Player:"", team=typeof signal.Content.Team!="undefined"?signal.Content.Team:"", countrys=typeof signal.Content.Country!="undefined"?signal.Content.Country:"", keywrods = typeof signal.Content.Keywords!="undefined"?signal.Content.Keywords:"", comp=typeof signal.Content.Competition!="undefined"?signal.Content.Competition:"";      }  googletag.cmd.push(function() {     googletag.defineSlot("/7229,22367575525/Kooora", ["fluid"], "pdmr4").setTargeting("adType", ["grid"]).setTargeting("pos", ["mr4", "myrelated"]).setTargeting("permutive", permutiveseg).setTargeting("player", player).setTargeting("team", team).setTargeting("country", countrys).setTargeting("keywords", keywords).setTargeting("comp", comp).addService(googletag.pubads());    googletag.pubads().enableSingleRequest();    googletag.enableServices();  });</script><div id="pdmr4">    <script>        googletag.cmd.push(function() { googletag.display("pdmr4"); });    </script></div></div>');
            //$('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-0"><script>    window.googletag = window.googletag || {cmd: []};  var permutiveseg=encodeURIComponent(JSON.parse(localStorage._pdfps || "[]"));      var player, team, countrys, keywords,comp;      if(typeof signal!="undefined"){         player=typeof signal.Content.Player!="undefined"?signal.Content.Player:"", team=typeof signal.Content.Team!="undefined"?signal.Content.Team:"", countrys=typeof signal.Content.Country!="undefined"?signal.Content.Country:"", keywrods = typeof signal.Content.Keywords!="undefined"?signal.Content.Keywords:"", comp=typeof signal.Content.Competition!="undefined"?signal.Content.Competition:"";      }  googletag.cmd.push(function() {     googletag.defineSlot("/7229,22367575525/Kooora", ["fluid"], "pdmr3").setTargeting("adType", ["grid"]).setTargeting("pos", ["mr3", "myrelated"]).setTargeting("permutive", permutiveseg).setTargeting("player", player).setTargeting("team", team).setTargeting("country", countrys).setTargeting("keywords", keywords).setTargeting("comp", comp).addService(googletag.pubads());    googletag.pubads().enableSingleRequest();    googletag.enableServices();  });</script><div id="pdmr3">    <script>        googletag.cmd.push(function() { googletag.display("pdmr3"); });    </script></div></div>');
            $('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-1"><script>    window.googletag = window.googletag || {cmd: []};  var permutiveseg=encodeURIComponent(JSON.parse(localStorage._pdfps || "[]"));      var player, team, countrys, keywords,comp;      if(typeof signal!="undefined"){         player=typeof signal.Content.Player!="undefined"?signal.Content.Player:"", team=typeof signal.Content.Team!="undefined"?signal.Content.Team:"", countrys=typeof signal.Content.Country!="undefined"?signal.Content.Country:"", keywrods = typeof signal.Content.Keywords!="undefined"?signal.Content.Keywords:"", comp=typeof signal.Content.Competition!="undefined"?signal.Content.Competition:"";      }  googletag.cmd.push(function() {     googletag.defineSlot("/7229,22367575525/Kooora", ["fluid"], "pdmr2").setTargeting("adType", ["grid"]).setTargeting("pos", ["mr2", "myrelated"]).setTargeting("permutive", permutiveseg).setTargeting("player", player).setTargeting("team", team).setTargeting("country", countrys).setTargeting("keywords", keywords).setTargeting("comp", comp).addService(googletag.pubads());    googletag.pubads().enableSingleRequest();    googletag.enableServices();  });</script><div id="pdmr2">    <script>        googletag.cmd.push(function() { googletag.display("pdmr2"); });    </script></div></div>');
            $('.cx-topnews-div:eq(0)').before('<div class="cx-topnews-div cx-topnews-div-0"><script>    window.googletag = window.googletag || {cmd: []};  var permutiveseg=encodeURIComponent(JSON.parse(localStorage._pdfps || "[]"));      var player, team, countrys, keywords,comp;      if(typeof signal!="undefined"){         player=typeof signal.Content.Player!="undefined"?signal.Content.Player:"", team=typeof signal.Content.Team!="undefined"?signal.Content.Team:"", countrys=typeof signal.Content.Country!="undefined"?signal.Content.Country:"", keywrods = typeof signal.Content.Keywords!="undefined"?signal.Content.Keywords:"", comp=typeof signal.Content.Competition!="undefined"?signal.Content.Competition:"";      }  googletag.cmd.push(function() {     googletag.defineSlot("/7229,22367575525/Kooora", ["fluid"], "pdmr1").setTargeting("adType", ["grid"]).setTargeting("pos", ["mr1", "myrelated"]).setTargeting("permutive", permutiveseg).setTargeting("player", player).setTargeting("team", team).setTargeting("country", countrys).setTargeting("keywords", keywords).setTargeting("comp", comp).addService(googletag.pubads());    googletag.pubads().enableSingleRequest();    googletag.enableServices();  });</script><div id="pdmr1">    <script>        googletag.cmd.push(function() { googletag.display("pdmr1"); });    </script></div></div>');
//        }

        if(window.COGNATIVEX.showFlurry)
        {
            // flurry scipt
            if(COGNATIVEX.isMobile())
            {
                //$('.cognativex-template-5704070618677248 .cx-topnews-div:last').after('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29d"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "ec5b2936-b1a1-4bc6-b1fb-147e7134f29d",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29d");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');
                //$('.cognativex-template-5704070618677248 .cx-topnews-div:last').after('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-21f83643-df29-45e9-bc41-185bea612b0f"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "21f83643-df29-45e9-bc41-185bea612b0f",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-21f83643-df29-45e9-bc41-185bea612b0f");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');

                //$('.cx-topnews-div:eq(2)').before('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29d"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "ec5b2936-b1a1-4bc6-b1fb-147e7134f29d",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29d");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');

                /////// to test only the below line **************************************************
                //$('.cx-topnews-div:eq(3)').before('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29e"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "ec5b2936-b1a1-4bc6-b1fb-147e7134f29e",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-ec5b2936-b1a1-4bc6-b1fb-147e7134f29e");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');
                //$('.cx-topnews-div:eq(3)').before('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-21f83643-df29-45e9-bc41-185bea612b0f"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "21f83643-df29-45e9-bc41-185bea612b0f",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-21f83643-df29-45e9-bc41-185bea612b0f");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script></div></div>');
            } else {
                //$('.cognativex-template-5704070618677248 .cx-topnews-div:last').after('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "a56ce686-ef75-4a0c-9f80-147fc32b4886",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script> </div></div>');
                //$('.cognativex-template-5704070618677248 .cx-topnews-div:last').after('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "a750001a-17de-4727-b5ea-5485ec6ab0c1",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script> </div></div>');

                //$('.cx-topnews-div:eq(2)').before('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-1"> var scriptId = document.getElementById("native-1"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "a56ce686-ef75-4a0c-9f80-147fc32b4886",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4886");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script> </div></div>');

                /////// to test only the below line **************************************************
                //$('.cx-topnews-div:eq(3)').before('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4887"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "a56ce686-ef75-4a0c-9f80-147fc32b4887",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-a56ce686-ef75-4a0c-9f80-147fc32b4887");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script> </div></div>');

                //$('.cx-topnews-div:eq(3)').before('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "a750001a-17de-4727-b5ea-5485ec6ab0c1",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script> </div></div>');
            }
            //$('.cognativex-template-5704070618677248 .cx-topnews-div:last').after('<div class="cx-topnews-div cx-topnews-div-1"><script type="text/javascript" id="native-2"> var scriptId = document.getElementById("native-2"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "a750001a-17de-4727-b5ea-5485ec6ab0c1",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-a750001a-17de-4727-b5ea-5485ec6ab0c1");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script> </div></div>');
            //$('.cognativex-template-5704070618677248 .cx-topnews-div:last').after('<div class="cx-topnews-div cx-topnews-div-0"><script type="text/javascript" id="native-3"> var scriptId = document.getElementById("native-3"); var scriptIdParent = scriptId.parentNode; var container = document.createElement("div"); container.className = "native-ad-0781817c-016f-4797-9675-56d4e4f4293b"; scriptIdParent.insertBefore(container, scriptId); window.native = window.native || []; window.native.push({   apiKey: "6K2PK8BKJJ7JWPTCBG2P",   code: "0781817c-016f-4797-9675-56d4e4f4293b",   passbackHandler: function(section) {     console.log(section.code, section.error);     var container = document.querySelector(".native-ad-0781817c-016f-4797-9675-56d4e4f4293b");     var parent = container.parentElement;     parent.style.display = "none";   } }); window.publisherUrl = "https://www.kooora.com"; (function(d) {   var script = d.createElement("script");   script.async = true;   script.src = "https://s.yimg.com/dy/ads/native.js";   d.body.appendChild(script); })(document); </script> </div></div>');
        }
    }


    COGNATIVEX.onload = function (loadtime) {
        if (isscriptloaded)
            return;
        isscriptloaded = true;

        if (COGNATIVEX.config && COGNATIVEX.config.appdomain) {

            init();

            if (COGNATIVEX.config.settings["pageview"]) {
                COGNATIVEX.trackPageView(loadtime);
            }

            if (COGNATIVEX.config.settings["heartbeat"] && COGNATIVEX.config.appdomain != 'kooora.com') {
                COGNATIVEX.trackHeartBeat();
            }

            if (COGNATIVEX.config.settings["google_analytics_events"]) {
                COGNATIVEX.trackGoogleAnalyticsEvents = true;
            }
//what??????????
//             if (COGNATIVEX.config.appdomain === 'kooora.com' && COGNATIVEX.$('#cognativex-widget-5704070618677248').length > 0) {
//                 //window.COGNATIVEX.renderWidget('5704070618677248');
//                 window.COGNATIVEX.widgets = window.COGNATIVEX.widgets || [];
//                 window.COGNATIVEX.widgets.push(function () {
//                     window.COGNATIVEX.renderWidget('5704070618677248');
//                 });
//             }
            //else {
            // DOMContentLoaded load
            if (document.readyState == 'loading') {
                // loading yet, wait for the event
                document.addEventListener('DOMContentLoaded', renderData);
            } else {
                // DOM is ready!
                renderData();
            }
            //}
        }
    };

    COGNATIVEX.cognativeXHelpers = function () {
        this.setCookie = function (name, data) {
            // no expiry date
            window.localStorage[name] = JSON.stringify({data: data});
        };
        this.expire = function (key) {
            window.localStorage.removeItem(key);
        };
        this.getCookie = function (name) {
            if (!window.localStorage[name]) {
                return false;
            }
            return JSON.parse(window.localStorage[name])['data'];
        };
        this.getCurrentDate = function () {
            var date = new Date();
            return (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
        };
        this.getHistoryArr = function (vName, type) {
            var arr = this.getCookie(vName);
            var typeData = [];
            if (arr && arr.length === 0) return false;

            for (var i = 0; i < arr.length; i++) {
                typeData.push(arr[i][type]);
            }
            return typeData;
        };
        this.constructedFileSchema = '';
        this.constructFileName = function (widgetId, constructFile) {
            if (typeof constructFile === 'undefined') constructFile = true;
            var userId = Cookie.get(cognativexUserIdCookieName);
            if (userId && constructFile) {
                // if the user already exists
                this.constructedFileSchema = 'userId_widgetId_date';
                return userId + '_' + widgetId + '_' + this.getCurrentDate() + '.json';
            }
            this.constructedFileSchema = 'widgetId';
            // if it is a new user then return the widgetId
            return widgetId + '.json';
        };
        this.setExpiry = function (days) {
            var minute = 60,
                second = 60,
                day = 24,
                ms = days * day * minute * second,
                date = new Date();
            date.setTime(date.getTime() + (ms * 1000));
            return {ms: ms, date: date.toUTCString()};
        };
        this.checkIfExist = function (arr, type, value) {
            if (arr && arr.length === 0) return false;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i][type] == value) {
                    return (i).toString();
                }
            }
            return false;
        }
    }

})(COGNATIVEX.jQuery, COGNATIVEX.template, COGNATIVEX.JSON, COGNATIVEX.Class, COGNATIVEX.Cookies);
