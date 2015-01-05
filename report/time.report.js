'use strict';

angular.module('time')
.factory('colorChange', function(){
	var service={};
	service.change = function(color, percent){//http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
		var R = parseInt(color.substring(1,3),16);
		var G = parseInt(color.substring(3,5),16);
		var B = parseInt(color.substring(5,7),16);	
		R = parseInt(R * (100 + percent) / 100);
		G = parseInt(G * (100 + percent) / 100);
		B = parseInt(B * (100 + percent) / 100);	
		R = (R<255)?R:255;  
		G = (G<255)?G:255;  
		B = (B<255)?B:255;  	
		var RR = ((R.toString(16).length===1)?'0'+R.toString(16):R.toString(16));
		var GG = ((G.toString(16).length===1)?'0'+G.toString(16):G.toString(16));
		var BB = ((B.toString(16).length===1)?'0'+B.toString(16):B.toString(16));	
		return '#'+RR+GG+BB;
		};
	return service;
 })
.directive('arbaloChart', ['$compile', 'colorChange', function($compile, colorChange) {
	var pieRot = function(deg){
		return '-moz-transform: rotate('+deg+'deg);-ms-transform: rotate('+deg+'deg);-o-transform: rotate('+deg+'deg);-webkit-transform: rotate('+deg+'deg);';
		};
	var drawPieElement = function (d, ds, v, l, p, z, bg, cut){
		var pos;
		var c = d>90 ? 'sliceB' : 'slice';	
		var pt=p!==0?'<br><i>'+p+'%</i>':'';	
		if(ds<90) {
			pos='top';
			}
		else if(ds<180) {
			pos='right';
			}
		else if(ds<270) {
			pos='bottom';
			}
		else {
			pos='left';		
			}
		var popover='popover-title="'+v+'" popover-trigger="mouseenter" popover-placement="'+pos+'" popover="'+l+'" popover-append-to-body="true"';		
		var ngClass=cut ? 'ng-style="PieColor" ng-mouseenter="changePieColor(true, 0)" ng-mouseleave="changePieColor(false, \''+bg+'\')"':'';
		if(d>180) {
			var html='<div class="hoversame">';			
			html+='<div '+ngClass+' '+popover+' class="'+c+'" style="background:'+bg+';z-Index:'+z+';'+pieRot(ds)+'"><p style="'+pieRot(-ds)+'">'+v+pt+'</p></div>';
			c = d>270 ? 'sliceB':'slice';
			html+='<div '+ngClass+' '+popover+' class="'+c+'" style="background:'+bg+';z-Index:999;'+pieRot(ds+170)+'"></div>';
			html+='</div>';
			return html;
			}	
		else {
			return '<div '+ngClass+' '+popover+' class="'+c+'" style="background:'+bg+';z-Index:'+z+';'+pieRot(ds)+'"><p style="'+pieRot(-ds)+'">'+v+pt+'</p></div>';
			}
		};
	var getTemplate=function(data, type, option, pieSel){
		option = option ? angular.fromJson(option) : {};
		var seriesnum=data.series.length,num=data.x.length, MaxNr=0, valTmp=0, perc=0, i=0, j=0, bg=0, tmp=0, SumArr=[], eWidth, fullH, heightArr, lWidth, val, thisHeight, left, bottom, popover;
		var html='<div class="arbalochart">';		
		if(type==='pie'){
			var html1st='<div class="pie1half"><div class="pie1">';									
			var html2nd='<div class="pie2half"><div class="pie2">';	
			var count=0, degree=0, degreesum=0, zIndex=1000;
			if(data.pie && data.pie==='x') {				
				for (i=seriesnum; i--;) {
					count+=data.series[i].values[pieSel];
					}
				for(i=0; i<seriesnum; i++) { 
					perc=Math.round((data.series[i].values[pieSel]/count)*1000)/10;
					degree = Math.round(((data.series[i].values[pieSel]/count)*360)*10)/10;
					perc=option.percentage ? perc : 0;
					bg = i>0 ? colorChange.change(data.series[i].color, i*5) : data.series[i].color;
					if(degreesum+degree>180) {
						if(degreesum>180) {
							html1st+=drawPieElement(degree, degreesum, data.series[i].values[pieSel], data.series[i].label[pieSel], perc, zIndex, bg, 0);							
							}
						else {
							tmp = drawPieElement(degree, degreesum, data.series[i].values[pieSel], data.series[i].label[pieSel], perc, zIndex, bg, 1);
							html1st+=tmp;					
							html2nd+=tmp;
							}
						}
					else {
						html2nd+=drawPieElement(degree, degreesum, data.series[i].values[pieSel], data.series[i].label[pieSel], perc, zIndex, bg, 0);							
						}
					zIndex+=5;					
					degreesum+=degree;
					}
				}
			else {	
				for (j=data.series[pieSel].values.length; j--;) {
					count+=data.series[pieSel].values[j];
					}
				for(j=0; j<num; j++) { 
					perc=Math.round((data.series[pieSel].values[j]/count)*1000)/10;
					degree = Math.round(((data.series[pieSel].values[j]/count)*360)*10)/10;
					perc=option.percentage ? perc : 0;
					bg = j>0 ? colorChange.change(data.series[pieSel].color, j*5) : data.series[pieSel].color;
					if(degreesum+degree>180) {
						if(degreesum>180) {
							html1st+=drawPieElement(degree, degreesum, data.series[pieSel].values[j], data.series[pieSel].label[j], perc, zIndex, bg, 0);							
							}
						else {
							tmp = drawPieElement(degree, degreesum, data.series[pieSel].values[j], data.series[pieSel].label[j], perc, zIndex, bg, 1);
							html1st+=tmp;				
							html2nd+=tmp;
							}
						}
					else {
						html2nd+=drawPieElement(degree, degreesum, data.series[pieSel].values[j], data.series[pieSel].label[j], perc, zIndex, bg, 0);							
						}
					zIndex+=5;					
					degreesum+=degree;
				   }						
				}
			if(option.dougnut) {
				html1st+='<div class="piedougnut1"></div>';										
				}
			html1st+='</div></div>';
			if(option.dougnut) {
				html2nd+='<div class="piedougnut2"></div>';
				}
			html2nd+='</div></div>';				
			html+=html1st+html2nd+'</div>';
			if(data.pie && data.pie==='x') {
				html+='<select ng-model="pieSel" ng-options="data.x.indexOf(selectedItem) as selectedItem for selectedItem in data.x"></select>';
				}
			else {
				html+='<select ng-model="pieSel" ng-options="data.series.indexOf(selectedItem) as selectedItem.name for selectedItem in data.series"></select>';
				}
			}	
		if(type==='bar') {
			html+='<div class="floatBars">';
			if(option.stacked) {	
				for(i=0;i<num;i++){
					valTmp=0;					
					for(j=0;j<seriesnum;j++){
						if(data.series[j].values[i]) {
							valTmp+=data.series[j].values[i];
							}
						}
					if(valTmp>MaxNr) {
						MaxNr=valTmp;
						}
					if(option.sum) {
						SumArr.push(valTmp);				
						}
					}	
				eWidth=100/num;
				fullH=option.sum ? 90 : 100;	
				heightArr=new Array(num+1).join('0').split('').map(parseFloat);					
				for(j=0;j<seriesnum;j++){
					for(i=0;i<num;i++){
						val = data.series[j].values[i];
						if(val) {
							thisHeight=Math.floor(val/MaxNr*fullH);						
							left=eWidth*i;
							bottom=heightArr[i];
							heightArr[i]+=thisHeight;
							popover='popover-title="'+val+'" popover-trigger="mouseenter" popover-placement="top" popover="'+data.series[j].label[i]+'" popover-append-to-body="true"';
							html+='<div '+popover+' class="chart-bar" style="background:'+data.series[j].color+';width:'+eWidth+'%;height:'+thisHeight+'%;left:'+left+'%;bottom:'+bottom+'%">'+val+'</div>';
							}
						}			
					}					
				if(option.sum){
					angular.forEach(SumArr, function(value, key) {
						html+='<div class="chart-sum" style="width:'+eWidth+'%;left:'+key*eWidth+'%;top:'+(90-heightArr[key])+'%">'+value+'</div>';
						});
					}	
				html+='</div>';				
				}
			else {
				eWidth=(100/num)/seriesnum;
				MaxNr=Math.max.apply(null, [].concat.apply([], data.series.map(function(obj) { return obj.values;})));
				for(j=0;j<seriesnum;j++){
					for(i=0;i<num;i++){
						val = data.series[j].values[i];
						if(val) {
							thisHeight=Math.floor(val/MaxNr*100);
							left=eWidth*i*seriesnum+eWidth*j;
							popover='popover-title="'+val+'" popover-trigger="mouseenter" popover-placement="top" popover="'+data.series[j].label[i]+'" popover-append-to-body="true"';
							html+='<div '+popover+' class="chart-bar" style="background:'+data.series[j].color+';width:'+eWidth+'%;height:'+thisHeight+'%;left:'+left+'%">'+val+'</div>';
							}
						}				
					}
				}			
			html+='</div>';
			lWidth=100/num;
			angular.forEach(data.x, function(value) {
				html+='<div class="chartlegend" style="width:'+lWidth+'%;"><div class="chartlegend_border"></div>'+value+'</div>';
				});
			}
		if(type!=='pie' && option.legend){
			html+='<ul class="legend"><li ng-repeat="serie in data.series"><p ng-style="{background: serie.color }"></p>{{serie.name}}</li></ul>';
			}
		html+='</div>';	
		return html;
		};
  return {
    restrict: 'A',
    scope: {type: '@', option: '@', data: '='},	
	controller:function($scope){
		$scope.changePieColor=function(test, bg){
			if(test) {
				$scope.PieColor = {background: '#069'};
				}
			else {
				$scope.PieColor = {background: bg};
				}
			};
		$scope.pieSel=0;
		},
	link: function(scope, element, iAttrs) {		
		scope.$watch('data', function(){	
			var htmlText = getTemplate(scope.data, scope.type, scope.option, scope.pieSel);
			var template = angular.element($compile(htmlText)(scope));
			element.html(template);	
		   });		
		if(iAttrs.type==='pie') {
			scope.$watch('pieSel', function(){
				var htmlText = getTemplate(scope.data, scope.type, scope.option, scope.pieSel);
				var template = angular.element($compile(htmlText)(scope));
				element.html(template);	
			   });
			}
		var htmlText = getTemplate(scope.data, scope.type, scope.option, scope.pieSel);
		var template = angular.element($compile(htmlText)(scope));
		element.html(template);			
   	 	}
  	};
}])
  .controller('TimeReportCtrl', function ($scope, $sce, $compile, AppConfig, colorChange) {
	AppConfig.setCurrentApp('Time', 'fa-tumblr', 'time', 'app/time/menu.html');
	$scope.API={};
	$scope.API.getTimeDate = function(){
		return {'id':'007', 'name':'Peter Windemann', 'items':[
			{'date':'20.12.2014', 'hours':[
				{'pid':'123', 'name':'Project A', 'time':2.5, 'comments':'This is a test 1'},
				{'pid':'124', 'name':'Project B', 'time':1.5, 'comments':'This is a test 2'},
				{'pid':'125', 'name':'Project A1', 'time':3.3, 'comments':'This is a test 3'}
				]
			},
			{'date':'21.12.2014', 'hours':[
				{'pid':'126', 'name':'Project C', 'time':1.5, 'comments':'This is a test 4'},
				{'pid':'124', 'name':'Project B', 'time':2.5, 'comments':'This is a test 5'},
				{'pid':'123', 'name':'Project A', 'time':1.7, 'comments':'This is a test 6'}
				]
			},
			{'date':'22.12.2014', 'hours':[
				{'pid':'126', 'name':'Project C', 'time':2.5, 'comments':'This is a test 4'},
				{'pid':'124', 'name':'Project B', 'time':5.5, 'comments':'This is a test 5'}
				]
			},
			{'date':'23.12.2014', 'hours':[
				{'pid':'123', 'name':'Project A', 'time':2.5, 'comments':'This is a test 4'},
				{'pid':'126', 'name':'Project C', 'time':2.5, 'comments':'This is a test 5'},
				{'pid':'125', 'name':'Project A1', 'time':2.5, 'comments':'This is a test 4'},
				{'pid':'124', 'name':'Project B', 'time':1.5, 'comments':'This is a test 5'},
				{'pid':'127', 'name':'Project K', 'time':1.2, 'comments':'This is a test 12'}				
				]
			}			
		]};
		};
	//Transform to use in chart
	var objdata={'x':[], 'pie':'x', 'series':[]},activecol='#0099FF';
	$scope.timetransform = function(obj){
		var MaxNr=Math.max.apply(null,obj.items.map(function(obj) { return obj.hours.length;}));
		for(var j=0;j<obj.items.length;j++){
			objdata.x.push(obj.items[j].date);
			for(var i=0;i<MaxNr;i++){
				if(!objdata.series[i]) {
					objdata.series[i]={name:'Serie '+i, values:[], label:[], color:colorChange.change(activecol, i*5)};
					}
				if(obj.items[j].hours[i]) {
					objdata.series[i].values.push(obj.items[j].hours[i].time);
					objdata.series[i].label.push(obj.items[j].hours[i].name+ ': ' + obj.items[j].hours[i].comments);
					}
				else {
					objdata.series[i].values.push(0);
					objdata.series[i].label.push('');
					}								
				}
			}
		return objdata;
		};
	//Personal Time chart
	$scope.personalTime=$scope.API.getTimeDate();
	$scope.data = $scope.timetransform($scope.personalTime);
		
	$scope.barchart={
		'x':['Test1', 'Test2', 'Test3', 'Test4'],
		'pie':'x',
		'series':[{
			'name':'Serie 1',
			'label':['a', 'b', 'c', 'd'],
			'values':[18,20,8,14],	
			'color':'#0099FF'
			},
			{
			'name':'Serie 2',
			'label':['a1', 'b1', 'c1', 'd1'],
			'values':[8,12,24,5],	
			'color':'#0066FF'
			},
			{
			'name':'Serie 3',
			'label':['a2', 'b2', 'c2', 'd2'],
			'values':[5,6,10,10],	
			'color':'#0033FF'
			}]
		};
	$scope.test = function(){
		$scope.barchart=angular.copy($scope.data);
		};
  });