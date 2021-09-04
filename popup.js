$(function(){
    /*
        This function will retrieve from the storage the domain and will add it in the html tag with id="new_domain"
        It will also retrieve all the compartments and add them in the select with id="selected_compartment_to_add_domain"
    */
   
    chrome.storage.sync.get('newdomain', function(newdomains){
        if(newdomains.newdomain)
        {
            $("#new_domain").val(newdomains.newdomain.toString());

            chrome.storage.sync.get('Compartments', function(compartment){
                var compartment_array=[];
                compartment_array = compartment.Compartments;
                
                var select = document.getElementById("selected_compartment_to_add_domain");
                var options = select.options;

            /*  for (var i=0; i<select.length; i++) {
                    select.options.remove(i);
                }*/ // i omitted it
            
                options.length = 0; // i added it
                
                for(index in compartment_array) {
                    options.add( new Option(compartment_array[index].value, index));
                }
            });
        }
    });

    //Insert New Compartment
    //It does not check whether the inserted compartment exists
    $('#insert_comparment').click(function(){ // when clicking the button "Add Compartment" (2)
    
    chrome.storage.sync.get('Compartments', function(compartment){
        var compartment_array=[];
        var new_compartment_exists = false;
        //The condition check if there is an empty input
        //The for loop will check whether there is an existing compartment
        if($('#new_compartment').val().length != 0){
            for(elements in compartment.Compartments){
                if($('#new_compartment').val() == compartment.Compartments[elements].value)
                    new_compartment_exists = true;
            }
            if(!new_compartment_exists){    
                compartment_array.push({"value":$('#new_compartment').val()}); // the value of "Add Compartment" input (1)
            }
        }
        for(elements in compartment.Compartments) 
        {
            compartment_array.push({"value":compartment.Compartments[elements].value});
        }
        chrome.storage.sync.set({'Compartments': compartment_array});
        $('#new_compartment').val("");
    });

 });

     //When writing a new profile, this functions populates the drop down list with the list of existing compartments
     $('#new_profile').keyup(function(){ // when writing text in the input of "Add Profile" (3)
        chrome.storage.sync.get('Compartments', function(compartment){
            var compartment_array=[];
            compartment_array = compartment.Compartments;
            
            var select = document.getElementById("selected_compartment_to_add_profile"); // the dropbox of "Add Profile" (4)
            var options = select.options;
        /*for (var i=0; i<=select.length; i++) {
                select.options.remove(i);
            }*/ // I omitted

            options.length = 0; // i added it

            for(index in compartment_array) {
                options.add( new Option(compartment_array[index].value, index)); // the dropbox of "Add Profile" is populated here
            }
        });
    });
    
    //Create a new profile associated with the selected compartment.
    //It does not check whether the inserted profile exists
    $('#insert_profile').click(function(){ // when clicking the button "Add Profile" (5)
        chrome.storage.sync.get('profiles', function(profile){
            var profile_array=[];
            var compartment_array=[];  
            var new_profile_exists = false;
            if($('#new_profile').val().length != 0){
                for(elements in profile.profiles){
                    if(profile.profiles[elements].prof == $('#new_profile').val() && profile.profiles[elements].compartment == $('#selected_compartment_to_add_profile').find(":selected").text())
                        new_profile_exists = true;
                }
                if(!new_profile_exists){
                    profile_array.push({'prof':$('#new_profile').val(), // the value of "Add Profile" input (3)
                    'compartment': $('#selected_compartment_to_add_profile').find(":selected").text() 
                    // the value of the selected item in the dropbox of "Add Profile" (4)
                    });
                }
            }
    
            for(elements in profile.profiles) 
            {
                profile_array.push({'prof':profile.profiles[elements].prof, 
                'compartment':profile.profiles[elements].compartment});
            }
        chrome.storage.sync.set({'profiles': profile_array});
        $('#new_profile').val("");
        });

    });

    //When writing a new domain, this functions populates the drop down list with the list of existing compartments
    $('#new_domain').keyup(function(){
       
        chrome.storage.sync.get('Compartments', function(compartment){
            var compartment_array=[];
            compartment_array = compartment.Compartments;
            
            var select = document.getElementById("selected_compartment_to_add_domain");
            var options = select.options;

          /*  for (var i=0; i<select.length; i++) {
                select.options.remove(i);
            }*/ // i omitted it
           
            options.length = 0; // i added it
            
            for(index in compartment_array) {
                options.add( new Option(compartment_array[index].value, index));
            }
        });
    });    

    //When creating a new domain and selecting a compartment, this functions populates the drop down list with the list of existing profiles
    $('#selected_compartment_to_add_domain').click(function(){
        chrome.storage.sync.get('profiles', function(profile){
            var profile_array=[];
            profile_array = profile.profiles;
            
            var select = document.getElementById("selected_profile_to_add_domain");
            for (i = select.options.length-1; i >= 0; i--) {
                select.options[i] = null;
              }
            
            for(index in profile_array) {
                if(profile_array[index].compartment == $('#selected_compartment_to_add_domain').find(":selected").text())
                {
                    select.options.add( new Option(profile_array[index].prof, index));
                }
                
            }
        });
    });   

    //Create a new domain associated with the selected profile.
    $('#insert_domain').click(function(){
        chrome.storage.sync.get('domains', function(domain){
            var domain_array=[];
            var isFound = false;     

            var new_domain = $('#new_domain').val();
            new_domain = new_domain.replace('https://','');
            new_domain = new_domain.replace('http://','');
            new_domain = new_domain.replace('www.','');
            for(elements in domain.domains) 
            {
                //domain_array.push({'domain':domain.domains[elements].prof, 'prof':domain.domains[elements].compartment}); // i omitted it
                domain_array.push({'domain':domain.domains[elements].domain, 'prof':domain.domains[elements].prof});
                if(domain.domains[elements].domain == new_domain)
                    isFound = true;
            }

            if(!isFound)
            {
                domain_array.push({
                    'domain':$('#new_domain').val(), 
                    'prof': $('#selected_profile_to_add_domain').find(":selected").text()});    
            }


        chrome.storage.sync.set({'domains': domain_array});
        chrome.storage.sync.set({'newdomain': null});
        $('#new_domain').val("");
        });

    });

    /*
    //Populate the Compartments Selection
    chrome.storage.sync.get('Compartments', function(compartment){
        var compartment_array=[];
        compartment_array = compartment.Compartments;
        
        var select = document.getElementById("selected_compartment");
        for(index in compartment_array) {
            select.options.add( new Option(compartment_array[index].value, index));
        }

        
    });

    //Populate the Profiles Selection
    chrome.storage.sync.get('profiles', function(profile){
        var profile_array=[];
        profile_array = profile.profiles;
        
        var select = document.getElementById("selected_profile");
        for(index in profile_array) {
            select.options.add( new Option(profile_array[index].prof +' profile in '+ profile_array[index].compartment , index));
            //select.options.add( new Option(profile_array[index].compartment , index));
        }
    });
    **/



    function createMenuItem(name) {
        let li = document.createElement('li');
        li.textContent = name;
        return li;
    }

    function createMenuItem2(name) {
        let ul = document.createElement('ul');
        ul.textContent = name;
        return ul;
    }

    
    $('#filter_domain').click(function(){
        chrome.storage.sync.get('domains', function(domain){
            var domain_array1=[];
            domain_array1 = domain.domains;
            
            var select = document.getElementById("selected_domain");
            
            /*
                The next for is added to avoid duplicating data in the select because every time we click 
                on the filter button the select will be filled with the domains again
                So, this for will clear all domain in the select before re-filling it
            */
            select.options.length = 0;
            
            for(index in domain_array1) {
                select.options.add( new Option(domain_array1[index].domain, index));
            } 
        });

        document.getElementById("renderList").innerHTML = "";
        i=0; l = 10000; j = 1000; q = 20000; s = 30000;
        
        var domain_array=[];
        var profile_array2=[];
        var compartment_array1=[];
        chrome.storage.sync.get('domains', function(domain){
            domain_array = domain.domains;
            chrome.storage.sync.get('profiles', function(profile){
                profile_array2 = profile.profiles;
                chrome.storage.sync.get('Compartments', function(compartment){
                    compartment_array1 = compartment.Compartments;
                    for(index1 in compartment_array1) {
                        var n = '' + l;
                        var ul1 = document.createElement('ul');
                        ul1.setAttribute('id', n);
                        ul1.setAttribute('class','nested');
                        document.getElementById('renderList').appendChild(ul1);
            
                        var k = '' + i;
                        var li1 = document.createElement('li');
                        li1.setAttribute('class','item');
                        li1.setAttribute('id', k);
                        ul1.appendChild(li1);

                        li1.innerHTML=li1.innerHTML + compartment_array1[index1].value;
                    //  li1.innerHTML=li1.innerHTML + index1;

                        for(index in profile_array2) {
                            if(compartment_array1[index1].value === profile_array2[index].compartment)
                            {
                                var ul2 = document.createElement('ul');
                                var m = '' + j;
                                ul2.setAttribute('id', m);
                                ul2.setAttribute('class','nested');
                                document.getElementById(k).appendChild(ul2);
                                var r = '' + s;
                                var li2 = document.createElement('li');
                                li2.setAttribute('class','item');
                                li2.setAttribute('id', r);
        
                                ul2.appendChild(li2);
                                li2.innerHTML=li2.innerHTML + profile_array2[index].prof;
                              // li2.innerHTML=li2.innerHTML + index;

                                // 3rd loop
                                for(index3 in domain_array) {
                                    if(domain_array[index3].prof === profile_array2[index].prof)
                                    {
                                        var ul3 = document.createElement('ul');
                                        var p = '' + q;
                                        ul3.setAttribute('id', p);
                                        ul3.setAttribute('class','nested');
                                        document.getElementById(r).appendChild(ul3);
                                        var li3 = document.createElement('li');
                                        li3.setAttribute('class','item');
                
                                        ul3.appendChild(li3);
                                        li3.innerHTML=li3.innerHTML + domain_array[index3].domain;
                                        q++;
                                    }
                                } 
                                j++;
                                s++;
                            }

                        }
                        l++;
                        i++;
                    }
                    /*
                    var allFolders = $("#renderList");
                    allFolders.each(function() {
                
                    // add the folder class to the parent <li>
                    var folderAndName = $(this).parent();
                    folderAndName.addClass("folder");
                
                    // backup this inner <ul>
                    var backupOfThisFolder = $(this);
                    // then delete it
                    $(this).remove();
                    // add an <a> tag to whats left ie. the folder name
                    folderAndName.wrapInner("<a href='#' />");
                    // then put the inner <ul> back
                    folderAndName.append(backupOfThisFolder);
                
                    // now add a slideToggle to the <a> we just added
                    folderAndName.find("a").click(function(e) {
                        $(this).siblings("ul").slideToggle("slow");
                        e.preventDefault();
                    });
                
                    });
                    **/
                });

            });

        });
           

    });
 
})

