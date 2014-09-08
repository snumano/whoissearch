'use strict';

angular.module('whoisApp')
  .controller('MainCtrl', function ($scope, $http) {

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

    $scope.doSearch = function(){
            var dns   = 'http://api.statdns.com/' + encodeURIComponent($scope.query) + '/a';

            $http.get(dns).success(function(data) {
		    var records = data.answer;
		    angular.forEach(records, function(record, i) {
			    var jpnic = 'http://www.corsproxy.com/whois.nic.ad.jp/cgi-bin/whois_gw?key=' + encodeURIComponent(record.rdata);
			    var ipnw;
			    var iporg;
			    var domain;
			    var domainorgjp;
			    var domainorgen;
			    var route;
			    var descr;
			    var origin;

			    $http.get(jpnic).success(function(data) {
				    var myRe = /\[IPネットワークアドレス\].+\>(\d+\.\d+\.\d+\.\d+\/\d+)/;
				    var myRe2 = /\[組織名\]\s*(\S+)/;
				    if (myRe.exec(data)) {
					ipnw = myRe.exec(data)[1];
					//console.log(ipnw);
					record.ipnw = ipnw;
				    }

				    if (myRe.exec(data)) {
					iporg = myRe2.exec(data)[1];
					//console.log(iporg);
					record.iporg = iporg;
				    }
				});

			    var jprs  = 'http://www.corsproxy.com/whois.jprs.jp/?key=' + encodeURIComponent(tldjs.getDomain($scope.query));
			    $http.get(jprs).success(function(data) {
				    var myRe = /(\[Domain Name\]|\[ドメイン名\])\s*(.+)\s*\w?\.?\s\[/m;
				    var myRe2 = /(\[登録者名\]|\[組織名\])\s*(.+)\s*\w?\.?\s*.*(\[Registrant\]|\[Organization\])\s*(.+)\s*\w?\.?\s*\[/m;

				    //console.log(data);
				    //console.dir(myRe.exec(data));

				    domain = myRe.exec(data)[2];
				    record.domain = domain;
				    console.log(domain);

				    //console.log(tldjs.getDomain(domain));

				    domainorgjp = myRe2.exec(data)[2];
				    record.domainorgjp = domainorgjp;
				    //console.log(domainorgjp);

				    domainorgen = myRe2.exec(data)[4];
				    record.domainorgen = domainorgen;
				    //console.log(domainorgen);
				});

			    var jpirr = 'http://www.corsproxy.com/jpirr.nic.ad.jp/cgi-bin/search-object.pl?param=' + encodeURIComponent(record.rdata);
			    $http.get(jpirr).success(function(data) {
				    var myRe = /route:\s*(.+)\s*/;
				    var myRe2 = /descr:\s*(.+)\s*/;
				    var myRe3 = /origin:\s*(.+)\s*/;

				    console.log(data);
				    //console.dir(myRe.exec(data));

				    route = myRe.exec(data)[1];
				    record.route = route;
				    //console.log(route);

				    descr = myRe2.exec(data)[1];
				    record.descr = descr;
				    //console.log(descr);

				    origin = myRe3.exec(data)[1];
				    record.origin = origin;
				    //console.log(origin);
				});

			});
		    $scope.ips = records;
	    });
	    
    };
  });
