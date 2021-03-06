/*
 * Date : 02/16/2018 
 * This plugin reads data from the MSTR grid and exhibits a LineChart. 
 * Created by Rashmit Chudasama (Third I Technologies).
 */
(function () {
    if (!mstrmojo.plugins.ChartJSLineChart) {
        mstrmojo.plugins.ChartJSLineChart = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.CustomVisBase",
        "mstrmojo.models.template.DataInterface"
    );

    mstrmojo.plugins.ChartJSLineChart.ChartJSLineChart = mstrmojo.declare(
        mstrmojo.CustomVisBase,
        null,
        {
            scriptClass: "mstrmojo.plugins.ChartJSLineChart.ChartJSLineChart",
            cssClass: "ChartJSLineChart",
            errorMessage: "Either there is not enough data to display the visualization or the visualization configuration is incomplete.",
            errorDetails: "This visualization requires one or more attributes and one metric.",
            externalLibraries: [{
				url : "../plugins/ChartJSLineChart/javascript/jquery.min.js"
			},
			{
				url : "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js"
			}],
            useRichTooltip: false,
            reuseDOMNode: false,
            supportNEE: true, // indicate the widget supports PDF exporting by New Export Engine
            setScaleValue: function setScaleValue(isScale) {
                var value = +this.getProperty("value");
                value = isScale ? ++value : --value;
                var properties = this.getProperties();
                properties["value"] = value;
                properties["scales"] = {inc: 'false', dec: 'false'};
            },
            plot: function () {
            	debugger;
            	var html = '<div id="presentationDiv"> <canvas id="myChart"></canvas></div>';
				var errorDiv = '<div id="lineChartError" style="color:red;font-size: 10pt;"></div>';
				
				var gridID = this.domNode.id;
				gridID = gridID.replace(/\*/g, '\\*');
				var height = this.height, width = this.width, top = this.top, left = this.left;
				$('#presentationDiv').css({
					"width" : width + "px",
					"height" : height + "px",
				});
				$('#lineChartError').css({
					"width" : width + "px",
					"height" : height + "px",
				});
				$('#' + gridID).css({"top":top,"left":left});
				$('#' + gridID).append(html);
				$('#' + gridID).append(errorDiv);
		
				try{
					
					var gridData = this.model.data.data.rows;
					var totalCols = this.model.data.data.totalCols;
					var totalRows = this.model.data.data.totalRows;
					var validationFlag = isValidate(totalRows,totalCols);
					var dataJson = [];
					if(validationFlag){
						for(var i=0; i < gridData.length; i++){
							var jsonData = this.model.data.data.rows[i].row;
							dataJson.push({
								xData : this.model.data.data.rows[i].row[Object.keys(jsonData)[0]],
								yData : this.model.data.data.rows[i].row[Object.keys(jsonData)[2]],
								formattedData : this.model.data.data.rows[i].row[Object.keys(jsonData)[1]]
							});	
						}
						var xDataList = getXDataListFromJson(dataJson);
						var yDataList = getYDataListFromJson(dataJson);
						var formattedValueList = getFormattedDataListFromJson(dataJson); 
						var firstRow = this.model.data.data.rows[0].row;
						var graphTitle = Object.keys(firstRow)[1];
						var xAxisLabel = Object.keys(firstRow)[0];
						if(xDataList != undefined && !jQuery.isEmptyObject(xDataList) && yDataList != undefined && !jQuery.isEmptyObject(yDataList)){
							renderHtml(xDataList,yDataList,xAxisLabel,graphTitle,formattedValueList,dataJson.length); 	
						}else{
							$("#lineChartError").append("Insuffiecient data.");	 
						}
					}else{
						$("#lineChartError").append("Grid Structure is not appropriate. Please refer README file.");
					}		
				}catch(err){
					console.log("Error : plot function");
					$("#lineChartError").append("Something went wrong.");
				}
				
				function renderHtml(xDataList, yDataList, xAxisLabel, graphTitle, formattedValueList, sizeOfData) {
							debugger;
							var fillColorArray = getColorArrayForGraph(sizeOfData);
							var ctx = document.getElementById("myChart");
							var myChart = new Chart(ctx,
									{
										type : 'line',
										data : {
											labels : xDataList,
											datasets : [ {
												label : '',
												data : yDataList,
												fill : false,
												lineTension : 0,
												backgroundColor : fillColorArray[0],
												borderColor : fillColorArray[0],
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
														color : getGridColorArrayForY(sizeOfData),
														zeroLineColor : 'rgba(0, 0, 0, 0.3)'
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
														color : getGridColorArrayForX(sizeOfData),
														zeroLineColor : 'rgba(0, 0, 0, 0.5)'
														
													},
													scaleLabel : {
														display : true,
														labelString : xAxisLabel
													}
												} ]
											},
											tooltips : {
												mode : 'index',
												callbacks : {
													label : function(t,json) {
														var tipLabel = formattedValueList[t.index];
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
							    formattedDataList.push(item.formattedData);
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
					return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',0.8)';
				}

				/*
				 * It's a validator function, which validates number
				 * of input params which are required to render the
				 * graph.
				 */
				function isValidate( totalRows, totalCols) {
					var flag = false;
					if (totalCols > 0) {
						if(totalRows == 1){
							flag = true;
						}
					} else {
						flag = false;
					}
					return flag;
				}
				
				function getGridColorArrayForX(size){
					var gridColorArray = [];
					//gridColorArray.push("rgba(0, 0, 0, 1)");
					for(var i=0; i < size ; i++){
						gridColorArray.push("rgb(255, 255, 255)");
					}
					return gridColorArray;
				}
				
				function getGridColorArrayForY(size){
					var gridColorArray = [];
					//gridColorArray.push("rgba(0, 0, 0, 0.1)");
					for(var i=0; i < size ; i++){
						gridColorArray.push("rgb(255, 255, 255)");
					}
					return gridColorArray;
				}
				
                            	
            }//end of plot function
        
        })
}());
//@ sourceURL=ChartJSLineChart.js