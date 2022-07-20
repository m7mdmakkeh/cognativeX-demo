// todo test fill localstorage history;  note: posts older than 3 days will  be removed
// localStorage.cx_user_posts_history = '{"data":[{"timestamp":"Mon, 1 Oct 2019 07:38:08 GMT","postId":"6601"},{"timestamp":"Mon, 30 Sep 2019 07:38:41 GMT","postId":"6602"},{"timestamp":"Mon, 23 Sep 2019 07:41:07 GMT","postId":"6603"}, {"timestamp":"Mon, 23 Sep 2019 07:50:07 GMT","postId":"6604"}]}';
// (function (w, d, s, l, i) {
//     w[l] = w[l] || [];
//     w[l].push({
//         'gtm.start':
//             new Date().getTime(), event: 'gtm.js'
//     });
//     var f = d.getElementsByTagName(s)[0],
//         j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
//     j.async = true;
//     j.src =
//         'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
//     f.parentNode.insertBefore(j, f);
// })(window, document, 'script', 'dataLayer', 'GTM-5FW5FX4');

(function ($, template, JSON, Class, Cookie) {

    // init the global var of cx if not exist yet
    this.COGNATIVEX = this.COGNATIVEX || {};

    /*
    * Helper class
    * - dependent on `WidgetRenderClass`
    * - To construct the widget template from cache or to fetch it
    * and if it was fetched to save it back to cache
    * and processes that data to append it to page
    * - Used After data fetch `afterAjax` in the render class `WidgetRenderClass`
    * */
    function constructWidgets(widgetRenderInstance, result) {
        // got the results from ajax now we need to construct widget
        
        // reset the impression flag
        widgetRenderInstance.isWidgetImpressionSent = false;


        this.setUserStamp = function (result) {
            if (!COGNATIVEX.getUserLocationCookie() && result.country_code)
                COGNATIVEX.setUserLocationCookie({'country_code': result.country_code});

            if (!COGNATIVEX.getUserDeviceCookie() && result.device_code)
                COGNATIVEX.setUserDeviceCookie({'device_code': result.device_code});
        }
        /*
        * Helper Function
        * To Render widget
        * */
        this.renderWidgetLogic = function (refThis, refResult, responseResult, wid) {
            // define main vars
            refThis.widgetposts = [];
            // populate the widgetdata of this object with the result
            refThis.widgetdata = {
                'id': refResult.id,
                'timestamp_server': refResult.timestamp,
                'timestamp_client': new Date().getTime(),
                'logic': refResult.logic,
                'sdk_version': window.COGNATIVEX.sdk_version,
                'version': refResult.version || "",
                'posts': refThis.widgetposts,
                'key': refResult.key
            };

            // save a reference of the class instance
            var objRef = refThis;

            var adsList = [];
            objRef.postIds = [];
            objRef.adIds = [];
            objRef.campaignTargeting = [];
            var cx = new COGNATIVEX.cognativeXHelpers();
  
            // loop on each widget: set events, set date published, alter data etc..
            refThis.processWidgetData = function () {
                // process data
                var nbOfItemsInWidget = 0;
                if (responseResult && typeof (responseResult.multiple_variations) != 'undefined' &&
                    responseResult.multiple_variations && responseResult.multiple_variations.length > 0) {  
                    var nbOfItems = responseResult.multiple_variations.length;     // CODE REFACTORED variable name totalItems changed to nbOfItems for sentiment
                    var choiceindex = Math.floor(Math.random() * nbOfItems);
                    if (choiceindex < nbOfItems) { // REFACTOR NEEDED ? why this check? isn't always true? (same check being made right below too inside this if)
                        var chosenResponse = responseResult.multiple_variations[choiceindex]
                        if (choiceindex < nbOfItems
                            && chosenResponse
                            && chosenResponse[wid]
                            && chosenResponse[wid].data && chosenResponse[wid].data.length > 0
                           ){
                                refResult.data = chosenResponse[wid].data;
                           }
                        // REFACTOR NEEDED ? here if the if statement failed we're doing nothing, shouldn't we choose another random item (do while)
                    }
                }

                // Loop over the data of the widget (val holds the actual individual data or so called window(one article of the recommended article in the widget))
                COGNATIVEX.$.each(refResult.data, function (index, val) {
                    // get a reference of the value
                    var value = val;
 
                    // gather the post data to add it to widgetposts array
                    var post = {
                        id: value.postid,
                        r: value.rank,
                        i: value.index,
                        l: value.logic
                    };

                    // usually, the impressions property will be on the widget object and not on each item of the widget, but-
                    // -in the case of getting an ad(widget items or window) from an outside vendor and put it in the widget, the item will an impression property
                    if (value.impression && value.impression.url) {
                        $.post(value.impression.url, value.impression.body, function (data) {
                        });
                    }

                    // add the post to the widgetpost array
                    objRef.widgetposts.push(post);
                    if (nbOfItemsInWidget < refResult.slotNumber) {  // slotNumber is the max nb of items this widget can hold
                        // if the item is of type campaign, special treatment(not a normal post)
                        if (value.itemType === 'campaign') {
                            objRef.adIds.push(value.extra);     //self.campaignId + "_" + self.adsetId + "_" + self.adId + "_" + self.provider + "_" + self.cpc
                            objRef.campaignTargeting.push(value.target_type);   // only present in campaign types
                            adsList.push(value);
                        } else {
                            objRef.postIds.push(value.postid);
                        }
                        nbOfItemsInWidget++;

                        // CODE REFACTORED replaced refResult.data[index] by value (in all code below)

                        // re-format the date to print in the widget in a representable way // REFACTOR NEEDED data formatting can be extracted to an outer functionality
                        if (value.publisheddate) {   
                            var date = new Date(value.publisheddate);
                            if ((date != 'Invalid Date')) {
                                var day = date.getDate(),
                                    month = (date.getMonth() + 1),
                                    year = date.getFullYear();
                                value.publisheddate = day + '-' + month + '-' + year;

                                var arabicMonthNames = ["كانون الثاني", "فبراير", "مارس", "أبريل", "أيار", "حزيران",
                                    "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الاول"
                                ];
                                value.arabicdate = day + " " + arabicMonthNames[date.getMonth()] + " " + year;
                            }
                        }
                        
                        var urlParser = document.createElement('a');
                        if (value.itemType !== 'campaign') {
                            urlParser.href = value.url;
                            value.url = location.origin + value.url.replace(urlParser.origin, '');
                           value.targetvalue = '_self';
                        } else {
                           value.targetvalue = '_blank';
                        }

                        if (value['resized_thumb']) {                   // NEEDS DEBUGGING when the item is an ad
                            urlParser.href = value['resized_thumb'];
                            value['resized_thumb'] = location.protocol + value['resized_thumb'].replace(urlParser.protocol, '');
                        }

                        // re-format the title to cut it after x number of chars in key of `display_title`
                        if (typeof value['title'] != 'undefined') {
                            value['display_title'] = value['title'];
                            if (value['title'].length > 50) {       
                                value['display_title'] = value['title'].substring(0, 46) + '..';    //50 and 46 are hard coded values, REFACTORING NEEDED
                            }
                        }

                        // attach the following event listeners.
                        var action_types = ['link', 'expand', 'popup', 'close'];
                        value.event_attach = {};
                        // campaign click event construction
                        value.cxClick = (value.logic == 'campaign')
                            ? 'return window.COGNATIVEX.cxCmp(' + JSON.stringify(value) + ',"' + value.logic + '", "' + COGNATIVEX.config.appdomain + '", "' + refResult.id + '", "' + refResult.key + '")'
                            : 'return true';

                        for (var i = 0; i < action_types.length; i++) {
                            // CODE REFACTORED removed variable unused "event"
                            var click_event = '';

                            switch (action_types[i]) {
                                case 'link': 
                                    var postWithType = post;
                                    postWithType['action_type'] = action_types[i]; // link
                                    var extra = encodeURIComponent(JSON.stringify(postWithType));
                                    var nowTs = Math.round(new Date().getTime());
                                    var rankStr = value.rank + "";
                                    rankStr = rankStr && rankStr.length > 10 ? rankStr.substring(0, 10) : rankStr;         // CODE REFACTORED String.protoype.substr is deprecated and is not part of core JS, replaced with subString supported by all browsers


                                    if (value.itemType == "campaign") {
                                        click_event =
                                            "this.href='https://campaigns.cognativex.com/campaignclicked.html?" +
                                            "apd=" + COGNATIVEX.config.appdomain +
                                            "&kc=cac" +
                                            "&cxv=10" +
                                            "&ex=" + value.extra +
                                            "&pbid=" + value.publisherId +
                                            "&uid=" + COGNATIVEX.userid +
                                            "&cxnid=" + COGNATIVEX.CX_NETWORK_ID +
                                            "&wid=" + refResult.id +
                                            "&wky=" + refResult.key +
                                            "&wvn=" + refResult.version +
                                            "&wsz=" + refResult.slotNumber +
                                            "&ptd=" + COGNATIVEX.pageviewid +
                                            "&cd=" + nowTs +
                                            "&wl=" + '' +
                                            "&rk=" + rankStr +
                                            "&ix=" + value.index +
                                            "&wix=" + nbOfItemsInWidget +
                                            "&cu=" + value.url_encoded +
                                            "&dcd=1" +
                                            "&cxtn=" + (value.request_id || '') +
                                            "'";
                                    }
                                    else {
                                        click_event = 
                                            "this.href='http://" + COGNATIVEX.getTrackingDomain() + "/widgetclicked.html?" +
                                            "apd=" + COGNATIVEX.config.appdomain +
                                            "&kc=wc" +
                                            "&uid=" + COGNATIVEX.userid +
                                            "&cxnid=" + COGNATIVEX.CX_NETWORK_ID +
                                            "&wid=" + refResult.id +
                                            "&wky=" + refResult.key +
                                            "&wvn=" + refResult.version +
                                            "&wsz=" + refResult.slotNumber +
                                            "&cu=" + encodeURIComponent(value.url) +
                                            "&pid=" + value.postid +
                                            "&ptd=" + COGNATIVEX.pageviewid +
                                            "&cd=" + nowTs +
                                            "&wl=" + value.logic +
                                            "&rk=" + rankStr +
                                            "&ix=" + value.index +
                                            "&wix=" + nbOfItemsInWidget +
                                            "'";
                                    }
                                    break;
                                default:
                                    var eventData = objRef.widgetdata;
                                    eventData['action_type'] = action_types[i]; // ex. expand, popup and even close (rn I can only see link) REMOVE COMMENT
                                    //ToDO like COGNATIVEX.trackWidgetEvent(objRef.postIds.join(','), "wi",refResult);
                                    break;
                            }

                            // add the click events
                            value.event_attach[action_types[i]] = click_event;
                        }
                    }

                });


                //set fcap
                COGNATIVEX.setFcappedItems(refResult.data);

                // send an impression event.
                COGNATIVEX.allow_logs('Impression: ___' + refResult.id + '___');
                // wi = widget_impressions
                if (objRef.postIds && objRef.postIds.length > 0)
                    COGNATIVEX.trackWidgetEvent(objRef.postIds.join(','), "wi", refResult);


                if (objRef.adIds && objRef.adIds.length > 0)
                    COGNATIVEX.trackCampaignEvent(objRef.adIds.join(','), "cai", refResult,
                        objRef.campaignTargeting.join(','), refResult.publisherId);

                /*** AD IMPRESSIONS ***/
                //Send ad impressions to google tag manager
                // window.dataLayer = window.dataLayer || [];
                //
                // for (var i = 0; i < adsList.length; i++) {
                //     var adItem = adsList[i];
                //     window.dataLayer.push({
                //         'event': 'cx_ad_impression',
                //         'appdomain': COGNATIVEX.config.appdomain,
                //         'ad_provider': adItem.provider,
                //         'widget_id': refResult.id,
                //         'widget_key': refResult.key,
                //         'cpc': adItem.cpc,
                //         'title': adItem.title,
                //         'advertiser_name': adItem.advertiserName,
                //         'third_party_id': adItem.provider + '_' + adItem.third_party_id,
                //     });
                // }
                //console.log(window.dataLayer);

                // }
                // widgetRenderInstance.isWidgetImpressionSent = true; // set flag that impression has been sent
            }

            // Set widgets prerequisites
            refThis.setWidgetsDefaults = function () {
                switch (refResult.widget_layout.type) {
                    default:
                        break;
                    case 'recommendation-infinite':
                        if (typeof COGNATIVEX.infinite_page == 'undefined') {
                            COGNATIVEX.infinite_page = -1;
                            COGNATIVEX.infinite_view_triggered = [];
                            COGNATIVEX.infinite_posts = refResult.data;//posts_url
                        }
                        refResult.page = COGNATIVEX.infinite_page;
                        break;
                }
            }


            // Sets the layout of the widget
            refThis.widgetLayout = function () {
                // get the main containers and templates ids
                var container = 'cognativex-widget-' + refResult.id;
                var templateid = 'cognativex-template-' + refResult.id;
                var widgetdiv = document.getElementById(container);
                if (!widgetdiv) return;
                if (objRef.widgetposts.length == 0) {
                    widgetdiv.style.display = "none";
                    return;
                }
                if (!refResult.widget_layout.template) {
                    widgetdiv.style.display = "none";
                    console.error("CX widget layout is empty");
                    return;
                }
                widgetdiv.style.display = "block";

                // set a container div for the widget
                var widgetDom = "<div class='" + templateid + "'>";
                // check if there is some css to inject
                if (typeof refResult.widget_layout.css !== 'undefined' && refResult.widget_layout.css !== '') {
                    if ((refResult.widget_layout.type == 'recommendation-infinite' && COGNATIVEX.infinite_page == -1) || refResult.widget_layout.type != 'recommendation-infinite') {
                        widgetDom += "<style class='style-" + templateid + "' type='text/css'>" + refResult.widget_layout.css + "</style>";
                    }
                }

                // get the dom of the tpl from the json
                widgetDom += template(template.decode(refResult.widget_layout.template), refResult);

                // end the template div
                widgetDom += "</div>";
                
                // Appending all of that to the dom
                widgetdiv.className += ' cognativex-widget-' + refResult.widget_layout.type;
                widgetdiv.innerHTML = widgetDom;
                //special code for one kooora widget, kooora spread
                if (COGNATIVEX.config.appdomain === 'kooora.com'
                    && COGNATIVEX.$('#cognativex-widget-5704070618677248').length > 0) {
                    COGNATIVEX.renderKoooraSpread();
                }
                // check if there is some js to inject
                if (typeof refResult.widget_layout.js != 'undefined' && refResult.widget_layout.js != '') {
                    widgetRenderInstance.runScript(refResult.widget_layout.js);
                }


                //track the view event of the widget seen
                widgetRenderInstance.findEltsVisible(container, refResult, function (post_id) {
                    switch (refResult.widget_layout.type) {
                        default:
                            if (typeof post_id !== "undefined" && refResult.widget_layout.type == 'recommendation-feed') {
                                objRef.widgetdata['posts'] = [post_id];
                            }
                            COGNATIVEX.allow_logs('View: ___' + container + '___and the widget data are');
                            break;
                        case 'recommendation-infinite':
                            // set the current post for the infinite scroll
                            COGNATIVEX.current_post = {
                                url: refResult.data[0].url,
                                postid: refResult.data[0].postid
                            };

                            COGNATIVEX.trackPageView();
                            break;
                    }
                });
            }

            // Do the necessary for each widget after the dom existence ///(right now only handling popus(hiding them then showing them after 15% of the page height has been scrolled))
            refThis.initWidgetScripts = function () {
                switch (refResult.widget_layout.type) {
                    default:
                        break;
                    case 'recommendation-infinite':
                        // attach the scroll event one time
                        // if (typeof COGNATIVEX.infinite_page != 'undefined') {
                        //     COGNATIVEX.$(window).scroll(function () {
                        //         // we have set the scroll to be max 3 loads
                        //         if ((COGNATIVEX.infinite_page < COGNATIVEX.infinite_posts.length) && ((Math.floor(COGNATIVEX.$(window).scrollTop() + COGNATIVEX.$(window).height()) + 5) >= Math.floor(COGNATIVEX.$(document).height()))) {
                        //             COGNATIVEX.$('.cognativex-load-more').last().show();
                        //             COGNATIVEX.infinite_page = COGNATIVEX.infinite_page + 1; // we have index 0 loaded so load 1
                        //             setTimeout(function () {
                        //                 // load content; that is 0 is the default loaded
                        //                 // note that we set some time out so that we can see the loader for few
                        //                 widgetRenderInstance.load_content(COGNATIVEX.infinite_page, widgetRenderInstance.container, widgetRenderInstance.templateid);
                        //             }, 100);
                        //         }
                        //     });
                        // }
                        break;
                    case 'recommendation-popup1':
                    case 'recommendation-popup2':
                        // hide popups by default.
                        COGNATIVEX.$('.cognativex-widget-' + refResult.widget_layout.type).hide();
                        // define some vars to use.
                        var available, percentage_of_page, half_screen, height;
                        // attach some events just one time per popup
                        if (!COGNATIVEX.$('.cognativex-widget-' + refResult.widget_layout.type).hasClass('cognativex-attached')) {
                            COGNATIVEX.$('.cognativex-widget-' + refResult.widget_layout.type).addClass('cognativex-attached');
                            // while scrolling if the user reached 30 percent of screen show the popups
                            COGNATIVEX.$(window).scroll(function (e) {
                                available = COGNATIVEX.$(document).height();
                                percentage_of_page = 0.15;
                                half_screen = available * percentage_of_page;
                                height = COGNATIVEX.$(window).scrollTop();
                                if (height > half_screen) {
                                    COGNATIVEX.$('.cognativex-widget-' + refResult.widget_layout.type).fadeIn();
                                }
                            });
                        }
                        break;
                }
                // refThis is general to all widgets once found a video then add the following style once.
                if (COGNATIVEX.$('.cognativex-type-main-image-container-video').length && !COGNATIVEX.$('.cognativex-vid-styling').length) {
                    COGNATIVEX.$('.cognativex-widget').first().before('<style class="cognativex-vid-styling">.cognativex-type-main-image-container-video{position: relative; z-index: 0;} .cognativex-type-main-image-container-video:before{    content: ""; width: 100%;height: 100%;background-image: url(https://storage.googleapis.com/cognativex/widget_static/play.png);position: absolute;left: 0;top: 0; z-index: 1;background-repeat: no-repeat;background-position: center;background-size: 85px;}</style>');
                }
            }

            /*
            * Run/Process all the logic
            * */
            refThis.processWidgetData();
            refThis.setWidgetsDefaults();
            refThis.widgetLayout();
            refThis.initWidgetScripts();
        }

        /*
        * Helper Function
        * Get widget Ids that are cached and ones that needs to be updated
        * */
        this.isCachedOrIsUpdated = function (widgetIds, refResult) {
            var updateIds = [];
            var stableIds = [];
            for (var wind = 0; wind < widgetIds.length; wind++) {
                var widget_id = widgetIds[wind];    //id of the widget
                var wResult = refResult[widget_id]; //object containing data of the widget
                if (
                    !(
                        localStorage["widget_hash_" + widget_id] &&
                        localStorage["widget_hash_" + widget_id] === wResult.widget_hash &&
                        localStorage["widget_layout_" + widget_id]
                    )
                ) {
                    // if there is no widget hash or it isnt identical or no layout exists
                    // then needs updating
                    updateIds.push(widget_id);
                }
                // else it is cached
                else {
                    stableIds.push(widget_id);
                }
            }
            return {updated: updateIds, cached: stableIds};
        }

        /*
        * Helper Function
        * Updates the cache with the new templates
        * */
        this.updateCacheWithNewTemplates = function (layouts) {
            for (var wid in layouts) {
                if (layouts.hasOwnProperty(wid)) {      // REFACTOR NEEDED ? why check if it has the property when looping on the properties? if the property does not exist, it won't loop over it
                    var layout = layouts[wid];
                    localStorage["widget_hash_" + wid] = layout.widget_hash;
                    localStorage["widget_layout_" + wid] = JSON.stringify(layout);
                }
            }
        }

        /*
        * Helper Function
        * Given an array of widget ids
        * Loops on each widget id sperately and calls renderWidgetLogic to render each one in array given
        * */
        this.loopWidgetsAndRender = function (widgetsArray) {   // CODE REFACTORED arr is renamed to widgetsArray for readability
            // loop to render each widget alone
            for (var wind = 0; wind < widgetsArray.length; wind++) {
                var wid = widgetsArray[wind];
                var wResult = result[wid];

                if (wResult) {
                    // get widget data
                    var wdata = wResult.data;
                    // get widget hash
                    var wHash = wResult.widget_hash;
                    if (!(wResult && wdata && wHash)) continue; // if the widget doesnt have data or hash then leave it and continue throught other widgets
                    // use the localstorage instead of the response
                    if (localStorage["widget_layout_" + wid]) {
                        var res = window.COGNATIVEX.mergeObj(wResult, JSON.parse(localStorage["widget_layout_" + wid]));    // REFACTOR NEEDED ? we might be merging highly similar objects(no need to loop through the while object and merge when only one property is different,  ofc IF thats always the case)
                        constructWidgetsInstance.renderWidgetLogic(constructWidgetsInstance, res, result, wid)  //result is like res but has 4 more properties in it, county_code, device_type, server_time and vcx(cx version) 
                    } else {
                        console.warn("No cx widget layout found")
                    }
                }
            }
        }


        
        /*
         * RUN LOGIC
         * */
        // get the ids that are cached and ones that need updating
        var layoutIds = this.isCachedOrIsUpdated(widgetRenderInstance.widget_ids, result);
        // keep a referance for the scope im in
        var constructWidgetsInstance = this;
        // if there are cached templates render them
        if (layoutIds.cached.length != 0) {     // CODE REFACTORED added != 0 for readability
            this.loopWidgetsAndRender(layoutIds.cached);
        }
        // fetch new templates needing update
        if (layoutIds.updated.length != 0) {    // CODE REFACTORED added != 0 for readability
            // request the template
            var httpTempate = new XMLHttpRequest();
            httpTempate.open(
                "GET",
                getWidgetServingDomain() + '/layout?' + COGNATIVEX.getQueryStr(['appdomain']) +
                '&widgetids=' + layoutIds.updated,
                true);
            
            // NOTE: TO SET STATIC DUMMY WIDGET TEMPLATE
            // httpTempate.open("GET",'./data/test/template.json');
            
            httpTempate.send();

            httpTempate.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        // update the cache with new templates (add the templates to the local storage)
                        constructWidgetsInstance.updateCacheWithNewTemplates(JSON.parse(this.responseText));
                        // and render the widget ids needing update
                        constructWidgetsInstance.loopWidgetsAndRender(layoutIds.updated);
                    } else {
                        console.warn('CX - requesting template data failed');
                    }
                }
            };
        }

        //set location and device cookie
        this.setUserStamp(result);
    }

    /*
     * Helper class
     * - That fetches the widgets data
     * - After that it inits constructWidgets class
     * - inits the widget view track event on scroll
     * */
    function WidgetRenderClass(widgetIds) {
        // set the key of the widget in use
        this.key = '';
        this.widget_ids = widgetIds;

        // initialize some default values.
        this.viewedWidgets = [];
        this.viewedFeedPosts = {};

        this.init = function (method, url, asyncF) {
            // Make an ajax to load widget info.
            var xhttp = new XMLHttpRequest();
            // on ready state call helper function
            var objRef = this;
            xhttp.onreadystatechange = function () {
                objRef.afterAjax(this);
            };
            // double check configs and widgets are set
            if (!COGNATIVEX.config || !COGNATIVEX.config.settings || !COGNATIVEX.config.settings["widget"]) {
                return;
            }
            if (!COGNATIVEX.config.appdomain || !COGNATIVEX.config.appkey) {
                console.error("appdomain or appkey are empty");
                return;
            }

            // request the new file

            // REFACTOR NEEDED ? what does this line do? (it may exist elsewhere as well)
            var cx = new COGNATIVEX.cognativeXHelpers();

            xhttp.open(method, url, asyncF);
            xhttp.send();
        }

        this.inViewPort = function (el) {
            // use el in Jquery ex . COGNATIVEX.$('selector')
            if (typeof el !== 'undefined') {
                if (typeof el[0] !== 'undefined') {
                    if (typeof el[0].getBoundingClientRect !== 'undefined') {
                        var rect = el[0].getBoundingClientRect();
                        return rect.bottom > 0 &&
                            rect.right > 0 &&
                            rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
                            rect.top < (window.innerHeight || document.documentElement.clientHeight);
                    }
                }
            }
            return false;
        }

        this.findEltsVisible = function (eltStr, result, callback) {
            var objRef = this;
            COGNATIVEX.$(window).scroll(function () {
                switch (result.widget_layout.type) {
                    case 'recommendation-feed':
                        // send post ids
                        if (COGNATIVEX.$('#' + eltStr).length) {
                            if (typeof objRef.viewedFeedPosts['#' + eltStr] == "undefined") objRef.viewedFeedPosts['#' + eltStr] = []; // prepare init for array of posts
                            // sure we have an array to push into it
                            COGNATIVEX.$('.cognativex-feeds1-link').each(function () {
                                if (objRef.inViewPort(COGNATIVEX.$(this)) && objRef.viewedFeedPosts['#' + eltStr].indexOf(COGNATIVEX.$(this).attr('post_id')) == -1) {
                                    // if in view port and post id in view port isnt in array then push it to array to not see it again and send it to callback.
                                    objRef.viewedFeedPosts['#' + eltStr].push(COGNATIVEX.$(this).attr('post_id'));
                                    if (typeof callback !== 'function') {
                                        console.error('Callback must be a function');
                                        return;
                                    }
                                    (callback(COGNATIVEX.$(this).attr('post_id')));
                                }
                            });
                        }
                        break;
                    default:
                        if (objRef.inViewPort(COGNATIVEX.$('#' + eltStr)) && objRef.viewedWidgets.indexOf(eltStr) == -1) {
                            objRef.viewedWidgets.push(eltStr);
                            if (typeof callback !== 'function') {
                                console.error('Callback must be a function');
                                return;
                            }
                            (callback());
                        }
                        break;
                }
            });
        }

        this.runScript = function (str) {
            /********
             // Helper function:
             // this function expects a string supposedly js syntax code and executes it.
             ********/
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.innerHTML = str;
            // re-insert the script tag so it executes.
            document.head.appendChild(s);
        }

        this.afterAjax = function (self) {
            /********
             // Helper function:
             // this function is only used to set what needs to be done after ajax is complete
             // consists of main data structuring and other widgets functionality
             ********/
            if (self.readyState === 4) {
                if (self.status === 200) {

                    new constructWidgets(this, JSON.parse(self.responseText));
                } else {
                    console.error('Ajax Request Failed');
                }
            }
        }

        // this.load_content = function (myPage, container, templateid) {
        //     /********
        //      // Helper function:
        //      // this function is only used for the infinite scroll case where we need to always do an ajax request to get other articles per page scroll
        //      ********/
        //     // cognativex-load-more
        //     var xhttp = new XMLHttpRequest();
        //     var objRef = this;
        //     xhttp.onreadystatechange = function () {
        //         var self = this;
        //         COGNATIVEX.$('.cognativex-load-more').last().hide();
        //         objRef.afterAjax(self, container, templateid);
        //     };
        //
        //     if (typeof COGNATIVEX.infinite_posts[myPage] == "undefined") {
        //         COGNATIVEX.$('.cognativex-load-more').last().hide();
        //         return;
        //     }
        //     xhttp.open("GET", COGNATIVEX.infinite_posts[myPage]['url'], true);
        //
        //     xhttp.send();
        // }
    }


    /*
     * - Main Global function used by clients
     * - That will be called after `COGNATIVEX.onload` that lies in the tracking script
     * - Uses the `WidgetRenderClass` to render the widget and load the data etc
    */

    this.COGNATIVEX.renderWidgets = function (widgetids) {

        //CODE REFACTORED to an outer utility function removeDups
        widgetids = COGNATIVEX.removeDups(widgetids)

        //CODE REFACTORED to an outer utility function filterExisting
        var wIdsExist = COGNATIVEX.filterExistingWidgets(widgetids)
        // now all widget ids that have divs are added to array wIdsExist
        // BUT...
        // Are there any widgets? Lets see:
        if (!wIdsExist || wIdsExist.length == 0) {
            console.warn('no cx widget ids');
            return;
        }

        //get the URL that serves the widgets
        var servingUrl = getWidgetServingDomain();

        // Initializing the class resposible for renedring the wedgit from the serving URL (and suplying it with parameters)
        new WidgetRenderClass(wIdsExist).init(
            "GET",
            servingUrl + '/recommend?mwv=true&widgetids=' + wIdsExist.join(',') + '&' + COGNATIVEX.getQueryStr(['userid', 'appdomain', 'history_postids', 'history_adids', 'country_code', 'device_code', 'exc_ads']),
            true
        );

        // test set dummy data response
        // new WidgetRenderClass(widgetid).init("GET", '../data/test/data.json', true);
    }

    this.COGNATIVEX.renderWidget = function (widgetid, container_id) {
        COGNATIVEX.widget_container_id = container_id;
        COGNATIVEX.renderWidgets([widgetid]);
        //console.warn('COGNATIVEX.renderWidget is depricated');
    }

    // utitlity functions:
    this.COGNATIVEX.removeDups = function(list){
        var updatedList = [];
        for (var i = 0; i < list.length; i++) {
            if (updatedList.indexOf(list[i]) === -1) {
                updatedList.push(list[i]);
            }
        }
        return updatedList;
    }

    this.COGNATIVEX.filterExistingWidgets = function(list){
        var wIdsExist = [];
        for (var i = 0; i < list.length; i++) {
            var widgetid = list[i];

            var widgetdiv = document.getElementById("cognativex-widget-" + widgetid);
            if (!widgetdiv) {
                console.warn('No cognativex widget div for widgetID ' + widgetid);
                //return;
            } else {
                wIdsExist.push(widgetid);
            }
        }
        return wIdsExist;
    }

    this.getWidgetServingDomain = function () {

        //CODE REFACTORED , the slash is removed from the end of the URL and is added when concatinating (actually using) the URL (better practices)
        if (COGNATIVEX.config.appdomain == 'kooora.com')
            return 'https://campaigns-serving.cognativex.com';

        return 'https://widgets.cognativex.com';
    }


})(COGNATIVEX.jQuery, COGNATIVEX.template, COGNATIVEX.JSON, COGNATIVEX.Class, COGNATIVEX.Cookies);
