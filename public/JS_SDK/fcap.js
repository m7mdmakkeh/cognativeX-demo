var COGNATIVEX = COGNATIVEX || {};
COGNATIVEX.setFcappedItems = function(items) {
    if(!items) return;
    var today = new Date().toISOString().split('T')[0];
    var ads_key = 'cx_fcap_ads_' + today;
    // Retrieve the object from storage
    var ad_history = localStorage.getItem(ads_key);
    var history_items = ad_history ? JSON.parse(ad_history) : {};
    // loop over the items and increment the impressions of the ads in local storage or set them to one if not existing
    for (var i = 0; i < items.length; i++) {
        var item_key = items[i].adKeyHash;
        if(!item_key) continue;     //the item is not an ad
        var item = history_items[item_key];
        if (item) {
            item.impressions++;
        } else {
            history_items[item_key] = {'fcap': items[i].fcap, 'impressions': 1};
        }
    }
    // now update local storage
    localStorage.setItem(ads_key, JSON.stringify(history_items));
    //and remove old history from local storages
    COGNATIVEX.removeOldAdHistory();
}
COGNATIVEX.getFcappedItems = function() {
    var today = new Date().toISOString().split('T')[0];
    var ads_key = 'cx_fcap_ads_' + today;
    var itemsToExclude = [];
    // Retrieve the object from storage
    var ad_history = localStorage.getItem(ads_key);
    var history_items = JSON.parse(ad_history || '{}');
    for (var key in history_items) {
        if (history_items.hasOwnProperty(key))
        {
            if(history_items[key].impressions >= history_items[key].fcap)
            {
                itemsToExclude.push(key);
            }
        }
    }
    return itemsToExclude;
}
COGNATIVEX.removeOldAdHistory = function() {
    var keys = Object.keys(localStorage),
        i = keys.length;
    while (i--) {
        // String.prototype.startsWith()    // CODE REFACTORED commented out this because it doesn't seem to have any purpose whatsoever

        // remove items that are fcapped ads and that are old (i.e before today's date)
        if (keys[i].slice(0, 'cx_fcap_ads_'.length) === 'cx_fcap_ads_' && COGNATIVEX.isDateBeforeToday(keys[i].slice('cx_fcap_ads_'.length))) {
            localStorage.removeItem(keys[i]);
        }
    }
}
COGNATIVEX.isDateBeforeToday = function (date){
    return new Date(date) < new Date(new Date().toISOString().split('T')[0]);
}
