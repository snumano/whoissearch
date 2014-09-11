'use strict';

angular.module('whoisApp')
    .controller('MainCtrl', function ($scope, $q, $http) {
	
	$scope.columns = [
	    { title: 'FQDN', field: 'name', visible: true },
	    { title: 'IP', field: 'rdata', visible: true },
	    { title: 'IP NW', field: 'ipnw', visible: true },
	    { title: 'IP Org', field: 'iporg', visible: true },
	    { title: 'Domain Name', field: 'domain', visible: true },
	    { title: 'Domain Org(Jp)', field: 'domainorgjp', visible: true },
	    { title: 'Domain Org(En)', field: 'domainorgen', visible: false },
	    { title: 'IRR route', field: 'route', visible: true },
	    { title: 'IRR descr', field: 'descr', visible: true },
	    { title: 'IRR origin', field: 'origin', visible: true },
	];
	
	$scope.deferredFunc = function(fqdns){
	    var deferred = $q.defer();
            var responses;
	    var responses2 = [];
	    angular.forEach(fqdns,function(fqdn, j) {
		var dns   = 'http://api.statdns.com/' + encodeURIComponent(fqdn) + '/a';
		$http.get(dns).success(function(data) {		   
		    responses = data.answer;
		    angular.forEach(responses, function(response, i) {
			//console.log(response);
			
			var ipnw;
			var iporg;
			var domain;
			var domainorgjp;
			var domainorgen;
			var route;
			var descr;
			var origin;
			
			var jpnic = 'http://www.corsproxy.com/whois.nic.ad.jp/cgi-bin/whois_gw?key=' + encodeURIComponent(response.rdata);
			$http.get(jpnic).success(function(data) {
			    var myRe = /\[IPネットワークアドレス\].+\>(\d+\.\d+\.\d+\.\d+\/\d+)/;
					var myRe2 = /\[組織名\]\s*(\S+)/;
			    if (myRe.exec(data)) {
				ipnw = myRe.exec(data)[1];
				//console.log(ipnw);
				response.ipnw = ipnw;
			    }
			    
			    if (myRe.exec(data)) {
				iporg = myRe2.exec(data)[1];
				//console.log(iporg);
				response.iporg = iporg;
			    }
			});
			
			var jprs  = 'http://www.corsproxy.com/whois.jprs.jp/?key=' + encodeURIComponent(tldjs.getDomain(fqdn));
			$http.get(jprs).success(function(data) {
			    var myRe = /(\[Domain Name\]|\[ドメイン名\])\s*(.+)\s*\w?\.?\s\[/m;
			    var myRe2 = /(\[登録者名\]|\[組織名\])\s*(.+)\s*\w?\.?\s*.*(\[Registrant\]|\[Organization\])\s*(.+)\s*\w?\.?\s*\[/m;
			    
			    //console.log(data);
			    //console.dir(myRe.exec(data));
			    if (myRe.exec(data)) {
				domain = myRe.exec(data)[2];
				//console.log(domain);
				response.domain = domain;
			    }
			    if (myRe2.exec(data)) {
				domainorgjp = myRe2.exec(data)[2];
				response.domainorgjp = domainorgjp;
				//console.log(domainorgjp);
				
				domainorgen = myRe2.exec(data)[4];
				response.domainorgen = domainorgen;
				//console.log(domainorgen);
			    }
			});
			
			var jpirr = 'http://www.corsproxy.com/jpirr.nic.ad.jp/cgi-bin/search-object.pl?param=' + encodeURIComponent(response.rdata);
			$http.get(jpirr).success(function(data) {
			    var myRe = /route:\s*(.+)\s*/;
			    var myRe2 = /descr:\s*(.+)\s*/;
			    var myRe3 = /origin:\s*(.+)\s*/;
			    
			    //console.log(data);
			    //console.dir(myRe.exec(data));
			    
			    if (myRe.exec(data)) {
				route = myRe.exec(data)[1];
				//console.log(route);
				response.route = route;
				
			    }
			    if (myRe2.exec(data)) {
				descr = myRe2.exec(data)[1];
				//console.log(descr);
				response.descr = descr;
			    }
			    if (myRe3.exec(data)) {
				origin = myRe3.exec(data)[1];
				//console.log(origin);
				response.origin = origin;
			    }
			});
/*
			console.log('j:' + j);
			console.log('i:' + i);
			console.dir(responses);
*/
			responses2 = responses2.concat(response);
			if(j == fqdns.length - 1 && i == responses.length - 1){
			    console.log('goto promise');
			    deferred.resolve(responses2);
			}
		    });
		});
	    });
	    return deferred.promise;
	};
	
	$scope.doSearch = function(){
	    var fqdns = $scope.query.split('\n');
	    var records = new Array();

	    var promise = $scope.deferredFunc(fqdns);
	    promise.then(function(responses) {
/*
		console.log('---1');
		console.dir(responses);
		console.log('---2');
*/
		$scope.ips = responses;
	    }, function(reason) {
		//alert('Failed: ' + reason);
	    }, function(update) {
		//alert('Got notification: ' + update);
	    });
	};
    });
