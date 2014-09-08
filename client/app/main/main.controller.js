'use strict';

angular.module('whoisApp')
  .controller('MainCtrl', function ($scope, $http) {

    $scope.columns = [
		      { title: 'FQDN', field: 'name', visible: true},
		      { title: 'IP', field: 'rdata', visible: true },
		      { title: 'IP NW', field: 'ipnw', visible: true },
		      { title: 'IP Org', field: 'iporg', visible: true },
		      { title: 'Domain Org(Jp)', field: 'dnsorgjp', visible: true },
		      { title: 'Domain Org(En)', field: 'dnsorgen', visible: true },
		      ];

    $scope.doSearch = function(){
            var dns =   'http://api.statdns.com/' + encodeURIComponent($scope.query) + '/a';
            var jprs =  'http://www.corsproxy.com/whois.jprs.jp/?key=' + encodeURIComponent($scope.query);


            $http.get(dns).success(function(data) {
		    var records = data.answer;
		    angular.forEach(records, function(record, i) {
			    var jpnic = 'http://www.corsproxy.com/whois.nic.ad.jp/cgi-bin/whois_gw?key=' + encodeURIComponent(record.rdata);
			    var ipnw;
			    var iporg;
			    var dnsorgjp;
			    var dnsorgen;
			    $http.get(jpnic).success(function(data) {
				    var myRe = /\[IPネットワークアドレス\].+\>(\d+\.\d+\.\d+\.\d+\/\d+)/;
				    var myRe2 = /\[組織名\]\s*(\S+)/;

				    ipnw = myRe.exec(data)[1];
				    //console.log(ipnw);
				    record.ipnw = ipnw;

				    iporg = myRe2.exec(data)[1];
				    //console.log(iporg);
				    record.iporg = iporg;
				});

			    $http.get(jprs).success(function(data) {
				    var myRe = /(\[登録者名\]|\[組織名\])\s*(.+)\s*\w?\.?\s*(\[Registrant\]|\[Organization\])\s*(.+)\s*\w?\.?\s*\[/m;

				    dnsorgjp = myRe.exec(data)[2];
				    record.dnsorgjp = dnsorgjp;
				    //console.log(dnsorgjp);

				    dnsorgen = myRe.exec(data)[4];
				    record.dnsorgen = dnsorgen;
				    //console.log(dnsorgen);
				});

			});
		    $scope.ips = records;
	    });
	    
    };
  });
