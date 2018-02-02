(function() {
	if (!mstrmojo.plugins.ChartJSBarChartPlugin) {
		mstrmojo.plugins.ChartJSBarChartPlugin = {};
	}

	mstrmojo.requiresCls("mstrmojo.CustomVisBase",
			"mstrmojo.models.template.DataInterface");

	mstrmojo.plugins.ChartJSBarChartPlugin.ChartJSBarChartPlugin = mstrmojo
			.declare(
					mstrmojo.CustomVisBase,
					null,
					{
						scriptClass : "mstrmojo.plugins.ChartJSBarChartPlugin.ChartJSBarChartPlugin",
						cssClass : "chartjsBarChartPlugin",
						errorMessage : "Either there is not enough data to display the visualization or the visualization configuration is incomplete.",
						errorDetails : "This visualization requires one or more attributes and one metric.",
						externalLibraries : [
								{
									url : "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.js"
								},
								{
									url : "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js"
								} ],
						useRichTooltip : false,
						reuseDOMNode : false,
						supportNEE : true, // indicate the widget supports PDF
											// exporting by New Export Engine
						setScaleValue : function setScaleValue(isScale) {
							var value = +this.getProperty("value");
							value = isScale ? ++value : --value;
							var properties = this.getProperties();
							properties["value"] = value;
							properties["scales"] = {
								inc : 'false',
								dec : 'false'
							};
						},
						plot : function() {
							debugger;
							var a = 1;
							var me = this;

							var html = '<div style="width:75%;margin-top:15%;"> <canvas id="myChart"></canvas></div>'
							var totalRows = this.dataInterface.getTotalRows();
							var totalCols = this.dataInterface.getTotalCols();
							var json = [];
							var validationFlag = isValidate(json,totalRows,totalCols);
							if(validationFlag){
								var rowData = this.dataInterface.getRawData();
								for (i = 0; i < totalRows; i++) {
									json.push({
										Month : rowData.children[i].name,
										Ravenue : rowData.children[i].value,
										formatted : rowData.children[i].formattedValue,
										title : this.dataInterface.getMetricValue(i, 1).getValue()
									});
								}
								var gridID = this.domNode.id;
								gridID = gridID.replace(/\*/g, '\\*');
								$('#' + gridID).append(html);
								var monthList = getMonthsFromJson(json);
								var revenueList = getRavenueListFromJson(json);
								var formattedRevenueList = getFormattedRavenueListFromJson(json);
								if(monthList != undefined && !jQuery.isEmptyObject(monthList) && revenueList != undefined && !jQuery.isEmptyObject(revenueList)){
									renderHTML(gridID,monthList,revenueList,formattedRevenueList);
								}else{
									alert("Insufficient Data.");
								}
							}
							
							function renderHTML(gridID,monthList,revenueList,formattedRevenueList) {
								debugger;
								var graphTitle = json[1].title;
								var fillColorArray = getColorArrayForGraph(json.length);
								var ctx = document.getElementById("myChart");
								var myChart = new Chart(ctx, {
									type : 'bar',
									data : {
										labels : monthList,
										datasets : [ {
											label : '',
											data : revenueList,
											backgroundColor : fillColorArray,
											borderColor : fillColorArray,
											borderWidth : 1
										} ]
									},
									options : {
										scales : {
											yAxes : [ {
												ticks : {
													beginAtZero : true
												},
												gridLines : {
													drawOnChartArea : false
												},
												scaleLabel : {
													//display : true,
													//labelString : 'Revenue'
												}
											} ],
											xAxes : [ {
												gridLines : {
													drawOnChartArea : false
												},
												scaleLabel : {
													display : true,
													labelString : 'Months'
												}
											} ]
										},
										tooltips : {
											mode : 'index',
											callbacks: {
												label: function(t,json) {
									                var tipLabel = formattedRevenueList[t.index];
									                return tipLabel;
									            }	
									        }
										},
										title : {
											display : true,
											text : graphTitle
										},
										legend : {
											labels : {
												boxWidth : 0,
											}
										}
									}
								});
							}

							function getMonthsFromJson(json) {
								var monthList = [];
								for (var i = 0; i < json.length; i++) {
									var item = json[i];
									if(item.Month != undefined && item.Month != null && item.Month != ""){
										monthList.push(item.Month);
									}else{
										monthList.push("");
									}
								}
								return monthList;
							}

							function getRavenueListFromJson(json) {
								var ravenueList = [];
								for (var i = 0; i < json.length; i++) {
									var item = json[i];
									if(item.Ravenue != undefined && item.Ravenue != null && item.Ravenue != ""){
										ravenueList.push(item.Ravenue);
									}else{
										ravenueList.push("0");
									}
								}
								return ravenueList;
							}
							
							function getFormattedRavenueListFromJson(json) {
								var formattedRevenueList = [];
								for (var i = 0; i < json.length; i++) {
									var item = json[i];
									if(item.formatted != undefined && item.formatted != null && item.formatted != ""){
										formattedRevenueList.push(item.formatted);
									}else{
										formattedRevenueList.push("0");
									}
								}
								return formattedRevenueList;
							}
							
							function getColorArrayForGraph(size) {
								var colorArray = [];
								for (var i = 0; i < size; i++) {
									colorArray.push(randomColorGenerator());
								}
								return colorArray;
							}

							function randomColorGenerator() {
								var o = Math.round, r = Math.random, s = 255;
								return 'rgba(' + o(r() * s) + ',' + o(r() * s)
										+ ',' + o(r() * s) + ',0.4)';
							}
							
							function isValidate(json, totalRows, totalCols){
								var flag = false;
								if(totalCols > 0){
									if(totalRows > 0){
										flag = true;
									}else{
										alert("No data found.");
									}
								}else{
									flag = false;
									alert("Insufficient Data");
								}
								return flag;
							}
						}//end of plot function
					})
}());
// @ sourceURL=ChartJSBarChartPlugin.js
