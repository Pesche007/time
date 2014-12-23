'use strict';

angular.module('time')
.directive('arbaloChart', function($compile) {
	var shadeColor = function (color, percent) {  
		var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
		return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
		}
	var pieRot = function(deg){
		return '-moz-transform: rotate('+deg+'deg);-ms-transform: rotate('+deg+'deg);-o-transform: rotate('+deg+'deg);-webkit-transform: rotate('+deg+'deg);';
		}
	var drawLineElement = function(el, h, dir, css){
		return '<div class="'+css+'" popover-title="'+el[0]+'" popover-trigger="mouseenter" popover-placement="top" popover="'+el[1]+'" style="'+dir+':'+h+'%;background:'+el[2]+'">'+el[0]+'</div>';	
		}
	var drawPieElement = function (d, ds, v, l, z, bg, cut){
		if(d>90) {
			var c='sliceB';
			}
		else {
			var c='slice';
			}			
		if(ds<90) var p="top";
		else if(ds<180) var p="right";
		else if(ds<270) var p="bottom";
		else var p="left";
		
		var popover='popover-title="'+v+'" popover-trigger="mouseenter" popover-placement="'+p+'" popover="'+l+'" popover-append-to-body="true"';		
		var ngClass=cut ? 'ng-style="PieColor" ng-mouseenter="changePieColor(true, 0)" ng-mouseleave="changePieColor(false, \''+bg+'\')"':'';
		if(d>180) {
			var html='<div class="hoversame">';			
			html+='<div '+ngClass+' '+popover+' class="'+c+'" style="background:'+bg+';z-Index:'+z+';'+pieRot(ds)+'"><p style="'+pieRot(-ds)+'">'+v+'</p></div>';
			var c = d>270 ? 'sliceB':'slice';
			html+='<div '+ngClass+' '+popover+' class="'+c+'" style="background:'+bg+';z-Index:999;'+pieRot(ds+170)+'"></div>';
			html+='</div>';
			return html;
			}	
		else return '<div '+ngClass+' '+popover+' class="'+c+'" style="background:'+bg+';z-Index:'+z+';'+pieRot(ds)+'"><p style="'+pieRot(-ds)+'">'+v+'</p></div>';
		}
	var getTemplate=function(data, type, orientation, option){	
		var html='<div class="arbalochart">';		
		var MaxNr=0;var valTmp=0;var newData=[];		
		var num = data.series[0].values.length;
		var seriesnum=data.series.length;
		for(var i=0;i<data.series[0].values.length;i++){
			var newArr=[];
			for(var j=0;j<seriesnum;j++){
				var tmp = data.series[j].values[i];
				var label = data.series[j].label[i];
				var col = data.series[j].color;
				valTmp+=tmp
				newArr.push([tmp, label, col]);
				}
			if(option=="stacked") if(valTmp>MaxNr) MaxNr=valTmp;
			valTmp=0;
			newData.push(newArr)
			}						
		
		angular.forEach(data.series, function(value, key) {
			var tmpMax=Math.max.apply(null,value.values);
			if(tmpMax > MaxNr) MaxNr = tmpMax;
			});		
		if(type=="pie"){
			var html1st='<div class="pie1half"><div class="pie1">';									
			var html2nd='<div class="pie2half"><div class="pie2">';			
			angular.forEach(data.series, function(value, key) {
				if(key==1) {
					var count=0, degree=0, degreesum=0, zIndex=1000;
					for (var i=num; i--;) {
						count+=value.values[i];
						}
					for(var i=0; i<num; i++) { 
						degree = Math.round(((value.values[i]/count)*360)*10)/10;
						var bg = i>0 ? shadeColor(value.color, i*10) : value.color;
						if(degreesum+degree>180) {
							if(degreesum>180) html1st+=drawPieElement(degree, degreesum, value.values[i], value.label[i], zIndex, bg, 0);							
							else {
								var tmp = drawPieElement(degree, degreesum, value.values[i], value.label[i], zIndex, bg, 1);
								html1st+=tmp					
								html2nd+=tmp;
								}
							}
						else html2nd+=drawPieElement(degree, degreesum, value.values[i], value.label[i], zIndex, bg, 0);							
						zIndex+=5;					
						degreesum+=degree;
					   }						
					}
				else{
					
					}
				});				
			if(option=="dougnut") html1st+='<div class="piedougnut1"></div>';										
			html1st+='</div></div>';
			if(option=="dougnut") html2nd+='<div class="piedougnut2"></div>';
			html2nd+="</div></div>";						
			html+=html1st+html2nd;
			html+='</div>';
			}	
		if(type=="bar") {
			if(orientation=="horizontal") html+='<div class="floatBars">';
			if(option=="stacked") {				
				if(orientation=="horizontal") eWidth=(100/num);
				else eWidth=100;
				angular.forEach(newData, function(value, key) {
					html+='<div class="pull-left" style="width:'+eWidth+'%;height:100%">';
					var htmlTMP='';
					var weightTMP=0;
					for(var i=0;i<value.length;i++){
						var thisHeight=Math.floor(value[i][0]/MaxNr*100);	
						weightTMP+=thisHeight;
						if(orientation=="horizontal") htmlTMP+=drawLineElement(value[i], thisHeight, "height", "bars");
						else htmlTMP+=drawLineElement(value[i], thisHeight, "width", "linesstacked");
						}
					var whiteHeight=100-weightTMP;				
					html+='<div style="height:'+whiteHeight+'%;background:#FFF"></div>';
					html+=htmlTMP;
					html+='</div>';				
					});				
				}
			else {
				var eWidth=(100/num)/seriesnum;
				angular.forEach(newData, function(value, key) {
					for(var i=0;i<value.length;i++){
						var thisHeight=Math.floor(value[i][0]/MaxNr*100);
						if(orientation=="horizontal") {
							var whiteHeight=100-thisHeight;
							html+='<div class="pull-left" style="width:'+eWidth+'%;height:100%">';
							html+='<div style="height:'+whiteHeight+'%;background:#FFF"></div>';
							html+=drawLineElement(value[i], thisHeight, "height", "bars");
							html+='</div>';
							}
						else html+=drawLineElement(value[i], thisHeight, "width", "lines");
						}
					});		
		
				}			
			if(orientation=="horizontal") {
				html+='</div>';
				var lWidth=100/num;
				angular.forEach(data.x, function(value, key) {
					html+='<div class="chartlegend" style="width:'+lWidth+'%;"><div class="chartlegend_border"></div>'+value+'</div>';
					});
				}
			}
		html+='</div>';	
		return html;
		}
  return {
    restrict: 'A',
	replace:true,
    scope: {
      type: '@', orientation: '@', option: '@', data: '='
    },	
	controller:function($scope){
		$scope.changePieColor=function(test, bg){
			if(test) $scope.PieColor = {background: '#069'};
			else $scope.PieColor = {background: bg};
			}
		},
	link: function(scope, element, iAttrs) {
		var htmlText = getTemplate(scope.data, scope.type, scope.orientation, scope.option);
		var template = angular.element($compile(htmlText)(scope));
		element.replaceWith(template);		
		// scope.$watch('arbaloChartData', function(newValue){
		//	iElement.html(getTemplate(newValue, scope.arbaloChartType));
		//   });		
    }
  }
})
  .controller('TimeReportCtrl', function ($scope, $sce, $compile, AppConfig) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
	//Bar chart
	$scope.barchart={
		"type":"bar",
		"x":["Test1", "Test2", "Test3", "Test4"],
		"series":[{
			"name":"Serie 1",
			"label":["a", "b", "c", "d"],
			"values":[18,20,2,4],	
			"color":"#0099FF"
			},
			{
			"name":"Serie 2",
			"label":["a1", "b1", "c1", "d1"],
			"values":[2,2,24,2],	
			"color":"#0066FF"
			},
			{
			"name":"Serie 3",
			"label":["a2", "b2", "c2", "d2"],
			"values":[4,6,10,10],	
			"color":"#0033FF"
			}],
		"MaxNr":0,
		"MaxStackNr":0
		}
	//Regular Bar		
	$scope.myStyleChart = function(data, index, parent){
		if(data.MaxNr==0) {
			angular.forEach(data.series, function(value, key) {
				var tmpMax=Math.max.apply(null,value.values);
				if(tmpMax > data.MaxNr) data.MaxNr = tmpMax;
				});			
			}	
		var num = data.series[0].values.length;
		var eWidth=(100/num)/data.series.length;
		var thisHeight=Math.floor(data.series[parent].values[index]/data.MaxNr*100);				
		var posL = (data.series.length*index*eWidth)+(parent*eWidth)
		return {
			"width" : eWidth+"%",
			"max-height":thisHeight+"%",
			"height":thisHeight+"%",
			"left": posL+"%",
			"background":data.series[parent].color
			}
		}
	//Regular Bar Lines	
	$scope.myStyleChartLine = function(data, index, parent){
		if(data.MaxNr==0) {
			angular.forEach(data.series, function(value, key) {
				var tmpMax=Math.max.apply(null,value.values);
				if(tmpMax > data.MaxNr) data.MaxNr = tmpMax;
				});			
			}	
		var num = data.series[0].values.length;
		var eWidth=(100/num)/data.series.length;
		var thisHeight=Math.floor(data.series[parent].values[index]/data.MaxNr*100);				
		var posL = (data.series.length*index*eWidth)+(parent*eWidth)
		return {
			"width" : thisHeight+"%",
			"background":data.series[parent].color	
			}
		}		
	//Bar stacked
	$scope.myStyleChartStack = function(data, index, parent){
		if(data.MaxStackNr==0) {
			var maxTmp=0;
			var valTmp=0;
			for(var i=0;i<data.series[0].values.length;i++){
				for(var j=0;j<data.series.length;j++){
					valTmp+=data.series[j].values[i];
					}
				if(valTmp>maxTmp) maxTmp=valTmp;
				valTmp=0;
				}
			data.MaxStackNr=maxTmp;	
			}	
		var num = data.series[0].values.length;
		var eWidth=(100/num);
		var thisHeight=Math.floor(data.series[parent].values[index]/data.MaxStackNr*100);				
		var posL = (index*eWidth)
		var posB = 0;
		if(parent>0) {
			for(var i=parent-1;i>=0;i--){
				posB+=Math.floor(data.series[i].values[index]/data.MaxStackNr*100);
				}			
			}
		return {
			"width" : eWidth+"%",
			"height":thisHeight+"%",
			"left": posL+"%",
			"bottom" : posB+"%",
			"background":data.series[parent].color	
			}
		}				
	$scope.myStyleChartBottom = function(data){
		var num = data.length;
		var thisWidth = Math.floor(100/num);
		return {
			"width" : thisWidth+"%",
			}
		}
	$scope.test = function(){
		$scope.barchart={
			"x":["Dies", "Das", "Dort", "Da"],
			"series":[{
				"label":["a", "b", "c", "d"],
				"values":[5,21,23,14],	
				"color":"#90C"
				},
				{"label":["a1", "b1", "c1", "d1"],
				"values":[16,12,13,24],	
				"color":"#60C"
				}],
			"MaxNr":0,
			"MaxStackNr":0
			}		
		}
	$scope.drawchart = function(){
		var html='<div class="arbalochart">';
		var regular=true;
		var bar=true;
		var MaxNr=0;		
		var num = $scope.barchart.series[0].values.length;
		var seriesnum=$scope.barchart.series.length;
		var newData=[];
		var valTmp=0;
		for(var i=0;i<$scope.barchart.series[0].values.length;i++){
			var newArr=[];
			for(var j=0;j<seriesnum;j++){
				var tmp = $scope.barchart.series[j].values[i];
				var label = $scope.barchart.series[j].label[i];
				var col = $scope.barchart.series[j].color;
				valTmp+=tmp
				newArr.push([tmp, label, col]);
				}
			if(!regular) if(valTmp>MaxNr) MaxNr=valTmp;
			valTmp=0;
			newData.push(newArr)
			}						
		if(regular) {
			var eWidth=(100/num)/seriesnum;
			angular.forEach($scope.barchart.series, function(value, key) {
				var tmpMax=Math.max.apply(null,value.values);
				if(tmpMax > MaxNr) MaxNr = tmpMax;
				});			
			}
		else var eWidth=25;
		html+='<div class="floatBars">';
		angular.forEach(newData, function(value, key) {
			for(var i=0;i<value.length;i++){
				var thisHeight=Math.floor(value[i][0]/MaxNr*100);
				html+='<div class="bars" popover="'+value[i][1]+'" popover-placement="top" popover-trigger="mouseenter" style="height:'+thisHeight+'%;width:'+eWidth+'%;background:'+value[i][2]+'">'+value[i][0]+'</div>';
				}
			});		
		html+='</div>';
		//return false;
		//if(bar) var eWidth=(100/num)/$scope.barchart.series.length;
		//else eWidth=25;			
		//var posL = (data.series.length*index*eWidth)+(parent*eWidth)
		html+='</div>';	
		return html;
		//$scope.testen = $compile($sce.trustAsHtml(html))($scope);
		//console.log($scope.testen)
		}
	//$scope.drawchart();
  })