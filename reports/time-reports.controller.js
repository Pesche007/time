'use strict';

angular.module('time')
  .controller('TimeReportCtrl', function ($scope, WorkrecordService) {
  	$scope.reportsOPT={dataLoaded:0, chartAxis:[]};
  	$scope.chart = {data:[], xAxis:[], label:[]};
  	WorkrecordService.list().then(function(result) {
		var i, d, curr_date, curr_month, curr_year, datumArr, datumFilter, spliceIndex, index, duration, data = result.data.workRecordModel;		
		for(i=0;i<data.length;i++){
			d=new Date(data[i].startAt);
		    curr_date = d.getDate().toString();
		    curr_month = (d.getMonth() + 1).toString();
		    curr_year = d.getFullYear().toString();			
			datumArr = curr_year + '' + (curr_month.length===2 ? curr_month : '0'+curr_month) + '' + (curr_date.length===2 ? curr_date : '0'+curr_date);
			datumFilter = (curr_date.length===2 ? curr_date : '0'+curr_date) + '.' + (curr_month.length===2 ? curr_month : '0'+curr_month) + '.' + curr_year;
			spliceIndex=0;
			if($scope.reportsOPT.chartAxis.indexOf(datumArr)===-1){
				$scope.reportsOPT.chartAxis.map(function(e, i){if(e < datumArr){spliceIndex=i+1;}});
				$scope.reportsOPT.chartAxis.splice(spliceIndex, 0, datumArr);
				$scope.chart.xAxis.splice(spliceIndex, 0, datumFilter);
			}
			index = $scope.chart.xAxis.indexOf(datumFilter);
			if(!$scope.chart.data[index]){
				$scope.chart.data.splice(index, 0, []);
				$scope.chart.label.splice(index, 0, []);
			}
			duration = Math.round((data[i].durationHours + data[i].durationMinutes / 60) * 10) / 10;
			$scope.chart.data[index].push(duration);
			$scope.chart.label[index].push('<strong>'+duration+'</strong><br>'+data[i].companyTitle + '<br>' + data[i].projectTitle);
		}
	$scope.reportsOPT.dataLoaded=1;
	}, function(reason) {//error
		alertsManager.addAlert('Could not get companies. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	});

  });