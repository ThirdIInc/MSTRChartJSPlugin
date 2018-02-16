/**
* @author Sushil Muzumdar, Third I Inc.
* @version 1.0
* This class accesses the data grid on a dashboard and returns the data in JSON format.
* This JSON will then be used within the JavaScript file to render the visualization
* on the client side
*/
package com.customclasses.transforms;

import java.util.List;

import com.customclasses.utils.Log;
import com.microstrategy.utils.StringUtils;
import com.microstrategy.utils.log.Level;
import com.microstrategy.web.app.beans.AppContext;
import com.microstrategy.web.app.tasks.architect.json.JSONArray;
import com.microstrategy.web.app.tasks.architect.json.JSONException;
import com.microstrategy.web.app.tasks.architect.json.JSONObject;
import com.microstrategy.web.app.transforms.MojoVisualizationSimplifiedDataTransform;
import com.microstrategy.web.app.transforms.ReportTransformHelper;
import com.microstrategy.web.app.transforms.VisualizationsHelper;
import com.microstrategy.web.beans.BeanContext;
import com.microstrategy.web.beans.MarkupOutput;
import com.microstrategy.web.beans.ReportBean;
import com.microstrategy.web.beans.ViewBean;
import com.microstrategy.web.beans.WebBeanException;
import com.microstrategy.web.blocks.Block;
import com.microstrategy.web.blocks.BlockContext;
import com.microstrategy.web.blocks.BlockFactory;
import com.microstrategy.web.blocks.BlockProperty;
import com.microstrategy.web.blocks.EnumBlockPropertyTypes;
import com.microstrategy.web.blocks.renderers.JsonRenderer;
import com.microstrategy.web.objects.WebGridData;
import com.microstrategy.web.objects.WebGridRows;
import com.microstrategy.web.objects.WebHeaders;
import com.microstrategy.web.objects.WebIServerSession;
import com.microstrategy.web.objects.WebObjectsException;
import com.microstrategy.web.objects.WebReportGrid;
import com.microstrategy.web.objects.WebRow;
import com.microstrategy.web.objects.WebTitle;
import com.microstrategy.web.objects.WebTitleUnit;
import com.microstrategy.webapi.EnumDSSXMLAxisName;

public class DataGridJSONFormat extends MojoVisualizationSimplifiedDataTransform {
	
	public static String CLASS_NAME = "customclasses.transforms.MojoVisualizationSimplifiedDataTransform";
	
	/**
     * This method describes the class
     * @param none
     * @return String
     */
	public String getDescription() {
		return "This transform renders the report data as a JSON string.";
	}
	
	/**
     * This method prepares the HTML markup
     * @param MarkupOutput
     * @return void
     */
	private void prepareMarkupOutput(MarkupOutput out) {
		// Get the AppContext...
		AppContext appContext = getAppContext();
		// Create a new BlockContext object...
		BlockContext blockContext = new BlockContext(appContext);
		blockContext.setUnconditionalContentType("json");
		out.setBlockContext(blockContext);
	}
	
	/**
     * This method gets the AppContext
     * @param none
     * @return AppContext
     */
	protected AppContext getAppContext() {
		AppContext __result = null;
		if (_bean != null) {
			BeanContext bc = _bean.getBeanContext();
			if (bc != null && bc instanceof AppContext) {
				__result = (AppContext) bc;
			}
		}
		return __result;
	}
	
	/**
     * This method populates the data grid object
     * @param Block
     * @return void
     */
	public void populateGridBlock(Block gridBlock) {
		String FUNCTION_NAME = "populateGridBlock(Block gridBlock)";
		try {
			String reportData="";
			reportData = getGridDataAsJsonString();
			//These properties will be accessible in javascript from model object:
			BlockProperty prop = gridBlock.setOrCreateProperty("data", EnumBlockPropertyTypes.PROPTYPE_STRING, reportData);
			if (reportData != null) {
				// below line will format string as JSON and not as String so JavaScript can use value as object immediately
				prop.getAnnotationGroups(true).getGroup(JsonRenderer.PROPERTY_ANNOTATION_GROUP, true).getAnnotation(JsonRenderer.PROPERTY_ANNOTATION_EXPRESSION, true).setValue("true");
			}
		} catch (Exception e) {
			Log.generateLogMsg(Level.SEVERE, CLASS_NAME, FUNCTION_NAME, "Exception: " + e.getMessage());
		}
	}
	
	/** This function gets the report data object and renders the data as a JSON string representation
	 * @param none
	 * @return String
	 */
	private String getGridDataAsJsonString() {
		String FUNCTION_NAME = "getGridDataAsJsonString()";
		/*
		 * The jsonData string will be in the following format...
		 * {"rows":[{"row":{"Category":"Books","Profit":"569278","Revenue":"2640094.45"}},
		 * {"row":{"Category":"Electronics","Profit":"4289603","Revenue":"24391302.85"}},
		 * {"row":{"Category":"Movies","Profit":"254698","Revenue":"4098943.45"}},
		 * {"row":{"Category":"Music","Profit":"180044","Revenue":"3893367.4"}}]}
		 */		
		String jsonData = "";
		try {
			WebReportGrid reportGridObj = getGridData().getWebReportGrid();
			WebGridRows gridRows = reportGridObj.getGridRows();
			JSONObject rows = new JSONObject();
			JSONArray rowArr = new JSONArray();
			int totalRows = 0, totalCols = 0;
			WebTitle webTitle = null;
			WebHeaders colHeaders = null;
			for (int i = 0; i < gridRows.size(); i++) {
				JSONObject row = new JSONObject();
				WebHeaders webHeaders = reportGridObj.getRowHeaders().get(i);
				totalRows = reportGridObj.getRowTitles().size();
				totalCols = reportGridObj.getColumnHeaders().size();
				if(reportGridObj.getRowTitles().size() > 0){
					webTitle = reportGridObj.getRowTitles().get(0);
				}
				if(reportGridObj.getColumnHeaders().size() > 0)
				{
					colHeaders = reportGridObj.getColumnHeaders().get(0);
				}
				WebRow webRow = gridRows.get(i);
				JSONObject cell = new JSONObject();
				
				for (int j = 0; j < webHeaders.size(); j++) {
					if(webTitle == null){
						cell.put("NA", webHeaders.get(j).getDisplayName());
					} else {
						cell.put(webTitle.getDisplayName(), webHeaders.get(j).getDisplayName());						
					}
				}
				for (int k = 0; k < webRow.size(); k++) {
					if(colHeaders == null){
						cell.put("NAFV", webRow.get(k).getValue());
						cell.put("NAUV", webRow.get(k).getRawValue());
					} else {
						cell.put(colHeaders.get(k).getDisplayName(), webRow.get(k).getValue());
						cell.put(colHeaders.get(k).getDisplayName() + " UV", webRow.get(k).getRawValue());
					}
				}
				row.put("row", cell);
				rowArr.put(row);
			}
			rows.put("totalCols", totalCols);
			rows.put("totalRows", totalRows);
			rows.put("rows", rowArr);
			jsonData = rows.toString();
		} catch (JSONException e) {
			Log.generateLogMsg(Level.SEVERE, CLASS_NAME, FUNCTION_NAME, "JSONException: " + e.getMessage());
		} catch (WebObjectsException woe) {
			Log.generateLogMsg(Level.SEVERE, CLASS_NAME, FUNCTION_NAME, "WebObjectsException: " + woe.getMessage());
		} catch (WebBeanException wbe) {
			Log.generateLogMsg(Level.SEVERE, CLASS_NAME, FUNCTION_NAME, "WebBeanException: " + wbe.getMessage());
		}
	    return jsonData;
	}
	
	/** This function is the main function that gets called when the class is invoked
	 * @param out MarkupOutput
	 * @param superBlock Block
	 * @return void
	 */
	protected void render(MarkupOutput out, Block superBlock) {
		String FUNCTION_NAME = "render(MarkupOutput out)";
		try {
			prepareMarkupOutput(out);
			//Block gridBlock = BlockFactory.getInstance().newBlock("GridModel");
			populateGridBlock(superBlock);
		} catch (Exception e) {
			Log.generateLogMsg(Level.SEVERE, CLASS_NAME, FUNCTION_NAME, "Exception: " + e.getMessage());
		}
	}
	
	/** This function creates the grid model block
	 * @param none
	 * @return Block
	 */
	protected Block createGridModelBlock() throws Exception {
		String FUNCTION_NAME = "createGridModelBlock()";
		Block grid = BlockFactory.getInstance().newBlock("GridModel");

		// This is to capture and handle No data situation - for example if
		// filtering excluded all data
		WebGridData reportData = getGridData();
		if (reportData == null
				|| (reportData.getGridTotalRows() == 0 && reportData.getGridTotalColumns() == 0)) {
			String customMsg = "No data";
			WebIServerSession session = getAppContext().getAppSessionManager().getActiveSession();
			if (ReportTransformHelper.checkDisplayEmptyReportMessageInRWD(session)) {
				customMsg = ReportTransformHelper.getNoDataCustomMessage(session);
				if (StringUtils.isEmpty(customMsg)) {
					customMsg = this.getDescriptor(2388);
				}
			}
			grid.getProperty("eg").setValue(customMsg);
			return grid;
		}
		// we have data on report so lets set those values in response
		configureSC(grid);
		ReportBean rb = getReportBean();
		if (rb != null) {
			try {
				grid.getProperty("mid").setValue(rb.getMessageID());
				String name = rb.getObjectName();
				if (StringUtils.isNotEmpty(name)) {
					grid.getProperty("n").setValue(name);
				}
			} catch (Exception e) {
				Log.generateLogMsg(Level.SEVERE, CLASS_NAME, FUNCTION_NAME, "Exception: " + e.getMessage());
			}
		}
		populateGridBlock(grid);
		setMojoVisProps(grid, getViewBean());
		return grid;
	}
	
	/** This function sets the visualization properties
	 * @param gridBlock Block
	 * @param vb ViewBean
	 * @return void
	 */
	private void setMojoVisProps(Block gridBlock, ViewBean vb)
			throws Exception, WebObjectsException, WebBeanException {
		//Add Vis Props
		gridBlock.getOrCreateProperty("vp",
				EnumBlockPropertyTypes.PROPTYPE_BLOCK).setValue(
				VisualizationsHelper.createVisPropsBlock(vb));
		if (vb.getParent() instanceof ReportBean) {
			gridBlock.getOrCreateProperty("visName",
					EnumBlockPropertyTypes.PROPTYPE_STRING).setValue(
					vb.getViewInstance().getVisualizationSettings()
							.getSelectedAndroidVisualization());
		}
	}
	
	/** This function sets some default grid properties...
	 * @param title Block
	 * @return void
	 */
	private void configureSC(Block title) throws Exception {
		// we will support only attribute in Rows 
		List<? extends WebTitleUnit> titlesSrc = getGridTitles(EnumDSSXMLAxisName.DssXmlAxisNameRows);
		//here we go thru all headers but if this is only for one document you can pick specific element
		for (int i = 0; i < titlesSrc.size(); ++i) {
			WebTitleUnit titleSrc = titlesSrc.get(i);
			//System.out.println(titleSrc.getDisplayName());
			BlockProperty p = title.getOrCreateProperty("sc",
					EnumBlockPropertyTypes.PROPTYPE_BLOCK);
			p.setValue(getSelectorBlock(titleSrc));
		}
	}

}
