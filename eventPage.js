var contextMenuItem = {
    "id": "AddDomain123",
    "title": "Add Domain",
    "contexts":["link"]
};
chrome.contextMenus.create(contextMenuItem);

chrome.contextMenus.onClicked.addListener(function(clickData){
    if(clickData.menuItemId =="AddDomain123" )
    {
        var url = clickData.linkUrl;
        Add_domain(url);

    }
});

chrome.storage.onChanged.addListener(function(changes, storagename){
    var newval ;
    var notifOptions ={
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'New domain to be added',
        message: 'Open the extension to add the selected domain'
    };

    if(changes.newdomain)
    {
        try {
            newval =  changes.newdomain.newValue.toString();
            chrome.notifications.create('Newdomainnotif', notifOptions);
        }
        catch (x) {
            newval="";
        }
        chrome.browserAction.setBadgeText({"text":newval});
    }

})

function Add_domain(url) {
    let domain = (new URL(url));
    domain = domain.hostname.replace('www.','');
    //domain = domain.hostname;
    chrome.storage.sync.set({'newdomain': domain});
};


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.todo == "addDomain")
    {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            let url = tabs[0].url;
            Add_domain(url);
        });
        
    }
});

chrome.webNavigation.onBeforeNavigate.addListener(function(data){
    var profile = null;
    if(data.url != "about:blank" && !data.url.includes("google"))
    {
    var URL_formatted = (new URL(data.url));
    let domain_triggered = (new URL(data.url));

    domain_triggered = domain_triggered.hostname.replace('www.','');
    chrome.storage.sync.get('domains', function(domain){
        var domain_array=[];
        for(elements in domain.domains) 
        {
            domain_array.push({'domain':domain.domains[elements].domain, 'prof':domain.domains[elements].prof});
            if(domain.domains[elements].domain == domain_triggered)
                {
                    profile = domain.domains[elements].prof;
                }
        }
        if(profile)
        {
            chrome.storage.sync.get(profile, function(cookies_list){
            
                for(cookie in cookies_list)
                {
                    
                    console.log(cookies_list[cookie].domain+" "+ cookies_list[cookie].storeId);

                    var domain = cookies_list[cookie].domain;
                    var expirationDate = cookies_list[cookie].expirationDate;
                    var hostOnly = cookies_list[cookie].hostOnly;
                    var httpOnly = cookies_list[cookie].httpOnly;
                    var name = cookies_list[cookie].name;
                    var path = cookies_list[cookie].path;
                    var sameSite = cookies_list[cookie].sameSite;
                    var secure = cookies_list[cookie].secure;
                    var url = cookies_list[cookie].url;
                    var value = cookies_list[cookie].value;

                    try
                    {
                    //chrome.cookies.remove()
                    var updated_cookie = {'domain':domain ,'url':'https://www'+domain, 'expirationDate':expirationDate, 'httpOnly': httpOnly, 'name':name, 'path':path+profile+"/", 'sameSite':sameSite, 'secure':secure, 'value':value, 'storeId': 1};
                    chrome.cookies.set(updated_cookie);
                    console.log("Done");
                    }
                    catch
                    {
                        console.log("error");
                    }
                    
                }
            });
            chrome.cookies.getAll({'url': data.url}, function(cookies_list){
                for(cookie in cookies_list)
                {
                    console.log(cookies_list[cookie].domain+" "+ cookies_list[cookie].storeId+" "+ cookies_list[cookie].path);
                }
            });

        }
        else
        {
            Add_domain(data.url);
            //Block traffic or fire notification
        }

    });
}
});

chrome.webNavigation.onCompleted.addListener(function(data){
    var profile = null;
    if(data.url != "about:blank" && !data.url.includes("google"))
    {
    var URL_formatted = (new URL(data.url));
    let domain_triggered = (new URL(data.url));

    domain_triggered = domain_triggered.hostname.replace('www.','');
    chrome.storage.sync.get('domains', function(domain){
        var domain_array=[];
        for(elements in domain.domains) 
        {
            domain_array.push({'domain':domain.domains[elements].domain, 'prof':domain.domains[elements].prof});
            if(domain.domains[elements].domain == domain_triggered)
                {
                    profile = domain.domains[elements].prof;
                }
        }
        if(profile)
        {

            chrome.cookies.getAllCookieStores(function(list){
                for(cookiestore in list)
                {
                    console.log(list[cookiestore]);
                }
            });
            var loaded_cookies=[];
            //update this
            //chrome.cookies.getAll({'path':'/'},function(cookies_list){
            chrome.cookies.getAll({'url': data.url}, function(cookies_list){
                for(cookie in cookies_list)
                {
                    
                    console.log(cookies_list[cookie].domain+" "+ cookies_list[cookie].storeId);

                    var domain = cookies_list[cookie].domain;
                    var expirationDate = cookies_list[cookie].expirationDate;
                    var hostOnly = cookies_list[cookie].hostOnly;
                    var httpOnly = cookies_list[cookie].httpOnly;
                    var name = cookies_list[cookie].name;
                    var path = cookies_list[cookie].path;
                    var sameSite = cookies_list[cookie].sameSite;
                    var secure = cookies_list[cookie].secure;
                    var url = cookies_list[cookie].url;
                    var value = cookies_list[cookie].value;

                    try
                    {
                        //update this
                    //chrome.cookies.remove({'name':name,'url': url});
                    chrome.cookies.remove({'name':name,'url': data.url});
                    loaded_cookies.push({'domain':domain ,'url':'https://www'+domain, 'expirationDate':expirationDate, 'httpOnly': httpOnly, 'name':name, 'path':path+profile+"/", 'sameSite':sameSite, 'secure':secure, 'value':value, 'storeId': 1});
                    
                    //chrome.cookies.set(updated_cookie);
                    console.log("Done");
                    }
                    catch
                    {
                        console.log("error");
                    }
                 
                    
                }
                chrome.storage.sync.set({profile:loaded_cookies})
            });
            chrome.cookies.getAll({'url': data.url}, function(cookies_list){
                for(cookie in cookies_list)
                {
                    console.log(cookies_list[cookie].domain+" "+ cookies_list[cookie].storeId+" "+ cookies_list[cookie].path);
                }
            });
            

        }
        else
        {
            //Add_domain(data.url);
            //Block traffic or fire notification
        }

    });
}

});