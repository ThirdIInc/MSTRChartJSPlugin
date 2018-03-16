package com.customclasses.transforms;
import com.customclasses.utils.*;
import com.microstrategy.utils.log.Level;
import com.microstrategy.web.app.transforms.VisualizationPropertiesTransform;
import com.microstrategy.web.beans.MarkupOutput;
import com.microstrategy.web.beans.Transformable;
import com.microstrategy.web.transform.LayoutTransform;
import com.microstrategy.web.transform.WebTransformException;

public class ComboChartWidgetPropertiesTransform extends VisualizationPropertiesTransform
implements LayoutTransform{
	
public static String CLASS_NAME = "customclasses.transforms.MstrTreeGridWidgetPropertiesTransform";
	
	/** This function simply outputs the description of the class
	* @param none
	* @return String
	*/
	public String getDescription() {
		return "This transform renders the custom search page";
	}
	
	/** This is the main function that renders the interface for the search page
	* @param out MarkupOutput
	* @return void
	*/
	public void transformForRequestSuccessful(MarkupOutput out) {
		String FUNCTION_NAME = "transformForRequestSuccessful(MarkupOutput out)";
		Transformable data = (Transformable) getContext().getWebComponent();
		try {
			//Render the menu using a layout...
			super.transformUsingLayout(data, out, false);
		} catch (WebTransformException wte) {
			Log.generateLogMsg(Level.SEVERE, CLASS_NAME, FUNCTION_NAME, "WebTransformException: " + wte.getMessage());
		}
	}
	
	public void renderCheckbox(MarkupOutput out, String itd) {
		super.renderCheckbox(out, itd);
	}
	
	public void renderSelectBox(MarkupOutput out, String valueType, String valueList) {
		super.renderSelectBox(out, valueType, valueList);
	}
	
	public void renderRadio(MarkupOutput out, String valueType, String valueList) {
		super.renderRadio(out, valueType, valueType);
	}
	
	public void renderDescriptor(MarkupOutput out, String desc) {
		super.renderDescriptor(out, desc);
	}
	
	public void renderTextbox(MarkupOutput out, String itd) {
		super.renderTextbox(out, itd);
	}


}
