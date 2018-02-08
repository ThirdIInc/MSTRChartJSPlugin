/*
 * Created by Rashmit Chudasama.
 * Date : 02/05/2018 
 * BarChart plugin which reads data from the MSTR grid and exhibits a Bar chart. 
 */

(function() {
	if (!mstrmojo.plugins.ChartJSBarChart) {
		mstrmojo.plugins.ChartJSBarChart = {};
	}

	mstrmojo.requiresCls(
	        "mstrmojo.CustomVisBase",
	        "mstrmojo.models.template.DataInterface"
	    );

	mstrmojo.plugins.ChartJSBarChart.ChartJSBarChart = mstrmojo
			.declare(
					mstrmojo.CustomVisBase,
					null,
					{
						scriptClass : "mstrmojo.plugins.ChartJSBarChart.ChartJSBarChart",
						cssClass : "ChartJSBarChart",
						errorMessage : "Either there is not enough data to display the visualization or the visualization configuration is incomplete.",
						errorDetails : "This visualization requires one or more attributes and one metric.",
						externalLibraries : [
								{
									url : "../plugins/ChartJSBarChart/javascript/jquery-1.9.1.js"
								},
								{
									url : "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js"
								} 
						],
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
							var me = this;

							var html = '<div> <canvas id="myChart"></canvas></div>';
							var errorDiv = '<div id="barChartError" style="color:red;font-size: 10pt;"></div>';
							
							var gridID = this.domNode.id;
							gridID = gridID.replace(/\*/g, '\\*');
							var height = this.height, width = this.width, top = this.top, left = this.left;
							$('#presentationDiv').css({
								"width" : width + "px",
								"height" : height + "px",
							});
							$('#barChartError').css({
								"width" : width + "px",
								"height" : height + "px",
							});
							$('#' + gridID).css({"top":this.top,"left":this.left});
							var totalRows = this.dataInterface.getTotalRows();
							var totalCols = this.dataInterface.getTotalCols();
							var json = [];
							var validationFlag = isValidate(totalRows,totalCols,me);
							if (validationFlag) {
								var rowData = this.dataInterface.getRawData();
								for (i = 0; i < totalRows; i++) {
									json.push({
												xData : rowData.children[i].name,
												yData : rowData.children[i].value,
												formattedData : rowData.children[i].formattedValue,
											});
								}
								$('#' + gridID).append(html);
								var xDataList = getXDataListFromJson(json);
								var yDataList = getYDataListFromJson(json);
								var graphTitle = this.dataInterface.getColHeaders(0).getHeader(0).getName();
								var xAxisLable = this.dataInterface.getRowTitles(0).titles[0].n;
								var formattedDataList = getFormattedDataListFromJson(json);
								if (xDataList != undefined && !jQuery.isEmptyObject(xDataList) && yDataList != undefined && !jQuery.isEmptyObject(yDataList)) {
									renderHTML(gridID, xDataList, yDataList, formattedDataList, graphTitle);
								} else {
									$("#" + gridID).append(errorDiv);
									$("#barChartError").append("Insuffiecient Data");
								}
							}else{
								$("#" + gridID).append(errorDiv);
								$("#barChartError").append("Insuffiecient Data");
							}
							
							/*
							 * Following function contains required properties
							 * of chart.js bar-chart
							 */
							function renderHTML(gridID, xDataList, yDataList,formattedRevenueList, graphTitle) {
								debugger;
								var fillColorArray = getColorArrayForGraph(json.length);
								var gridColorArray = getGridColorArrayForGraph(json.length);
								var ctx = document.getElementById("myChart");
								var myChart = new Chart(
										ctx,
										{
											type : 'bar',
											data : {
												labels : xDataList,
												datasets : [ {
													label : '',
													data : yDataList,
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
															drawOnChartArea : true,
															color : gridColorArray
														},
														scaleLabel : {}
													} ],
													xAxes : [ {
														ticks : {
															display : true,
															beginAtZero : true
														},
														gridLines : {
															drawOnChartArea : true,
															color : gridColorArray
														},
														scaleLabel : {
															display : true,
															labelString : xAxisLable
														}
													} ]
												},
												tooltips : {
													mode : 'index',
													callbacks : {
														label : function(t,json) {
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

							/*
							 * following function returns a list of data which will plot on x axis. 
							 */
							function getXDataListFromJson(json) {
								var xDataList = [];
								for (var i = 0; i < json.length; i++) {
									var item = json[i];
									if (item.xData != undefined
											&& item.xData != null
											&& item.xData != "") {
										xDataList.push(item.xData);
									} else {
										xDataList.push("");
									}
								}
								return xDataList;
							}

							/*
							 * following function returns a list of data which will plot on y axis.
							 */
							function getYDataListFromJson(json) {
								var yDataList = [];
								for (var i = 0; i < json.length; i++) {
									var item = json[i];
									if (item.yData != undefined
											&& item.yData != null
											&& item.yData != "") {
										yDataList.push(item.yData);
									} else {
										yDataList.push("0");
									}
								}
								return yDataList;
							}

							/*
							 * following function returns list of data read from the grid in its actual format.(Ex. $2100, 2000 RS.)
							 */
							function getFormattedDataListFromJson(json) {
								var formattedDataList = [];
								for (var i = 0; i < json.length; i++) {
									var item = json[i];
									if (item.formattedData != undefined
											&& item.formattedData != null
											&& item.formattedData != "") {
										formattedDataList
												.push(item.formattedData);
									} else {
										formattedDataList.push("0");
									}
								}
								return formattedDataList;
							}

							/*
							 * following function generates an array of
							 * different colors which highlights in bars.
							 */
							function getColorArrayForGraph(size) {
								var colorArray = [];
								for (var i = 0; i < size; i++) {
									colorArray.push(randomColorGenerator());
								}
								return colorArray;
							}

							/* following function generates random colors. */
							function randomColorGenerator() {
								var o = Math.round, r = Math.random, s = 255;
								return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',0.4)';
							}

							/*
							 * It's a validator function, which validates number
							 * of input params which is required to render the
							 * graph.
							 */
							function isValidate( totalRows, totalCols,element) {
								var flag = false;
								if (totalCols > 0) 
								    var xAxisLable = element.dataInterface.getRowTitles(0).titles[0];
								    if(xAxisLable != undefined && xAxisLable != null && xAxisLable != ""){
										flag = true;
									}
								} else {
									flag = false;
								}
								return flag;
							}
							
							function getGridColorArrayForGraph(size){
								var gridColorArray = [];
								for(var i=0; i < size ; i++){
									gridColorArray.push("rgb(255, 255, 255)");
								}
								return gridColorArray;
							}
						}
					})
}());
// @ sourceURL=ChartJSBarChartPlugin.js
