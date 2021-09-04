var contextMenuItem = {
    "id": "AddDomain123",
    "title": "Add Domain",
    "contexts":["link"]
};

//In Chrome you should create the context menu just once after install/update.
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create(contextMenuItem);
});

//OR

//Alternatively, you can simply suppress the error by accessing lastError in the callback:
/*
chrome.contextMenus.create(contextMenuItem, 
            () => chrome.runtime.lastError);

*/

/*
When you right click on a link, it will add the link (after removing www.) 
in a storage with an id = "newdomain"
*/
chrome.contextMenus.onClicked.addListener(function(clickData){
    if(clickData.menuItemId =="AddDomain123" )
    {
        var url = clickData.linkUrl;
        Add_domain(url);
    }
});


/*
Listening if the storage that contains the domain name changes a notification will popup 
and the badge will be updated to the new domain name 
*/
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

/* 
Function that will add the domain in the storage with id = "newdomain"
*/
function Add_domain(url) {
    let domain = (new URL(url));
    domain = domain.hostname.replace('www.','');
    //domain = domain.hostname;
    chrome.storage.sync.set({'newdomain': domain});
};

/*
it listens for messages coming from content.js and add the domain in 
the storage but in our case content.js won't send messages
*/
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
    if(data.url != "about:blank" && !data.url.includes("google") && !data.url.includes("new-tab-page"))
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
                    if(profile == cookie){
                        for(i in cookies_list[cookie])
                        {
                            console.log(cookies_list[cookie][i].domain + " " + cookies_list[cookie][i].expirationDate);
                            var domain = cookies_list[cookie][i].domain;
                            var expirationDate = cookies_list[cookie][i].expirationDate;
                            var hostOnly = cookies_list[cookie][i].hostOnly;
                            var httpOnly = cookies_list[cookie][i].httpOnly;
                            var name = cookies_list[cookie][i].name;
                            var path = cookies_list[cookie][i].path;
                            var sameSite = cookies_list[cookie][i].sameSite;
                            var secure = cookies_list[cookie][i].secure;
                            var url = cookies_list[cookie][i].url;
                            var value = cookies_list[cookie][i].value;
                            var storeId = cookies_list[cookie][i].storeId;
                            var session = cookies_list[cookie][i].session;

                            var domain_url = '';
                            domain_url += secure ? 'https://' : 'http://';
                            domain_url += domain.charAt(0) == '.' ? 'www' : '';
                            domain_url += domain;
                            domain_url += path;

                            try
                            {
                            //chrome.cookies.remove()
                            var updated_cookie = {'domain':domain ,'expirationDate':expirationDate, 'url':domain_url, 'httpOnly': httpOnly, 'name': name, 'path':path, 'sameSite':sameSite, 'secure':secure,'storeId': storeId ,'value':value};
                            
                            chrome.cookies.set(updated_cookie);
                            console.log("Done");
                            }
                            catch(error)
                            {
                                console.log(error);
                            }
                        }
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
    if(data.url != "about:blank" && !data.url.includes("google") && !data.url.includes("new-tab-page"))
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
            var my_cookies=[];

            /*
            Remove the cookies from storage that are not related to the domain i'm opening (Ex: instagram)
            and put them inside an array, because after that i'm going to remove all the cookies from the 
            chrome.cookies.getAll and insert them inside the array and finally override the previous array 
            of cookies stored in the storage.
            */
                   
            chrome.cookies.getAll({'url':data.url}, function(cookies_list){
                for(cookie in cookies_list)
                {

                    console.log(cookies_list[cookie].domain+" "+ cookies_list[cookie].storeId);

                    var domain = cookies_list[cookie].domain;
                    var expirationDate = cookies_list[cookie].expirationDate;
                    var hostOnly = cookies_list[cookie].hostOnly;
                    var httpOnly =  cookies_list[cookie].httpOnly;
                    var name = cookies_list[cookie].name;
                    var path = cookies_list[cookie].path;
                    var sameSite = cookies_list[cookie].sameSite;
                    var secure = cookies_list[cookie].secure;
                    var url = cookies_list[cookie].url;
                    var value = cookies_list[cookie].value;
                    var storeId = cookies_list[cookie].storeId;

                    try 
                    {
                        //update this
                        //chrome.cookies.remove({'name':name,'url': url});
                        var domain_url = '';
                        // get prefix, like https://www.
                        domain_url += secure ? 'https://' : 'http://';
                        domain_url += domain.charAt(0) == '.' ? 'www' : '';
                        domain_url += domain;
                        domain_url += path;
                        chrome.cookies.remove({'name':name,'url': data.url});
                        
                        if(!secure)
                        {
                            domain = domain.charAt(0) == '.' ? domain.substr(1, domain.length) : domain;
                        }
                        
                        loaded_cookies.push( {'domain':domain ,'expirationDate':expirationDate, 'url':domain_url, 'httpOnly': httpOnly, 'name': name, 'path':path, 'sameSite':sameSite, 'secure':secure, 'storeId': storeId ,'value':value});

                        //chrome.cookies.set(updated_cookie);
                        console.log("Done");                  
                    } 
                    catch (error) {
                        console.log(error);    
                    }
                }
            });
            
            chrome.storage.sync.get(profile, function(cookies_list){
                for(cookie in cookies_list)
                {
                    if(profile == cookie)
                    {
                        for(i in cookies_list[cookie])
                        {
                            isFound = false;
                            console.log(cookies_list[cookie][i].domain + " " + cookies_list[cookie][i].expirationDate);
                            var domain = cookies_list[cookie][i].domain;
                            var expirationDate = cookies_list[cookie][i].expirationDate;
                            var hostOnly = cookies_list[cookie][i].hostOnly;
                            var httpOnly = cookies_list[cookie][i].httpOnly;
                            var name = cookies_list[cookie][i].name;
                            var path = cookies_list[cookie][i].path;
                            var sameSite = cookies_list[cookie][i].sameSite;
                            var secure = cookies_list[cookie][i].secure;
                            var url = cookies_list[cookie][i].url;
                            var value = cookies_list[cookie][i].value;
                            var storeId = cookies_list[cookie][i].storeId;
                            var session = cookies_list[cookie][i].session;


                            var domain_url = '';                            
                            domain_url += secure ? 'https://' : 'http://';
                            domain_url += domain.charAt(0) == '.' ? 'www' : '';
                            domain_url += domain;
                            domain_url += path;

                            try
                            {
                                for(j in loaded_cookies)
                                {
                                    if(name.includes(loaded_cookies[j].name.charAt(0) == '.' ? loaded_cookies[j].name.substr(1, loaded_cookies[j].name.length) : loaded_cookies[j].name) && domain.includes(loaded_cookies[j].domain.charAt(0) == '.' ? loaded_cookies[j].domain.substr(1, loaded_cookies[j].domain.length) : loaded_cookies[j].domain))
                                    {
                                        domain_url += loaded_cookies[j].secure ? 'https://' : 'http://';
                                        domain_url += loaded_cookies[j].domain.charAt(0) == '.' ? 'www' : '';
                                        domain_url += loaded_cookies[j].domain;
                                        domain_url += loaded_cookies[j].path;
                                        isFound = true;
                                        my_cookies.push( {'domain':loaded_cookies[j].domain ,'expirationDate':loaded_cookies[j].expirationDate, 'url':domain_url, 'httpOnly': loaded_cookies[j].httpOnly, 'name': loaded_cookies[j].name, 'path':loaded_cookies[j].path, 'sameSite':loaded_cookies[j].sameSite, 'secure':loaded_cookies[j].secure, 'storeId': loaded_cookies[j].storeId ,'value':loaded_cookies[j].value});
                                        break;
                                    }                                   
                                }

                                if(!isFound)
                                {
                                    my_cookies.push( {'domain':domain ,'expirationDate':expirationDate, 'url':domain_url, 'httpOnly': httpOnly, 'name': name, 'path':path, 'sameSite':sameSite, 'secure':secure, 'storeId': storeId ,'value':value});
                                }
                                
                                console.log("Done");
                            }
                            catch(error)
                            {
                                console.log(error);
                            }
                        }
                    }
                }
                if(my_cookies.length != 0)
                {
                    loaded_cookies = [];
                    loaded_cookies = my_cookies;
                }
            });           

            chrome.cookies.getAll({'url': data.url}, function(cookies_list){
                for(cookie in cookies_list)
                {
                    console.log(cookies_list[cookie].domain+" "+ cookies_list[cookie].storeId+" "+ cookies_list[cookie].path);
                }

                if(loaded_cookies.length != 0)
                    chrome.storage.sync.set({[profile]: []});
                    chrome.storage.sync.set({[profile]: loaded_cookies});

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