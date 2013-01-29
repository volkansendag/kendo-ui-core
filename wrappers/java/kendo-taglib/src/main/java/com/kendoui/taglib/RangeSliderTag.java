
package com.kendoui.taglib;


import com.kendoui.taglib.rangeslider.*;


import com.kendoui.taglib.html.Element;
import com.kendoui.taglib.html.Input;
import com.kendoui.taglib.json.Function;


import javax.servlet.jsp.JspException;

@SuppressWarnings("serial")
public class RangeSliderTag extends WidgetTag /* interfaces *//* interfaces */ {

    public RangeSliderTag() {
        super("RangeSlider");
    }

    @Override
    public Element<?> html() {
        Element<?> element = super.html();

        String id = getName();
        
        element.append(createInput(id.concat("[0]"), "selectionStart"));
        element.append(createInput(id.concat("[1]"), "selectionEnd"));
        
        return element;
    }
    
    private Input createInput(String name, String propertyName) {
        Input element = new Input();
        
        element.attr("name", name);
        element.attr("type", "range");
        
        if (this.isSet("min")) {
            element.attr("min", getProperty("min"));
        }
        
        if (this.isSet("max")) {
            element.attr("max", getProperty("max"));
        }
        
        if (this.isSet("step")) {
            element.attr("step", getProperty("step"));
        }
        
        if (this.isSet(propertyName)) {
            element.attr("value", getProperty(propertyName));            
        }
        
        return element;
    }    
    @Override
    public int doEndTag() throws JspException {
//>> doEndTag
//<< doEndTag

        return super.doEndTag();
    }

    @Override
    public void initialize() {
//>> initialize
//<< initialize

        super.initialize();
    }

    @Override
    public void destroy() {
//>> destroy
//<< destroy

        super.destroy();
    }

//>> Attributes

    public static String tagName() {
        return "rangeSlider";
    }

    public void setTooltip(com.kendoui.taglib.rangeslider.TooltipTag value) {
        setProperty("tooltip", value);
    }

    public void setChange(ChangeFunctionTag value) {
        setEvent("change", value.getBody());
    }

    public void setSlide(SlideFunctionTag value) {
        setEvent("slide", value.getBody());
    }

    public float getLargeStep() {
        return (float)getProperty("largeStep");
    }

    public void setLargeStep(float value) {
        setProperty("largeStep", value);
    }

    public float getMax() {
        return (float)getProperty("max");
    }

    public void setMax(float value) {
        setProperty("max", value);
    }

    public float getMin() {
        return (float)getProperty("min");
    }

    public void setMin(float value) {
        setProperty("min", value);
    }

    public String getOrientation() {
        return (String)getProperty("orientation");
    }

    public void setOrientation(String value) {
        setProperty("orientation", value);
    }

    public float getSelectionEnd() {
        return (float)getProperty("selectionEnd");
    }

    public void setSelectionEnd(float value) {
        setProperty("selectionEnd", value);
    }

    public float getSelectionStart() {
        return (float)getProperty("selectionStart");
    }

    public void setSelectionStart(float value) {
        setProperty("selectionStart", value);
    }

    public float getSmallStep() {
        return (float)getProperty("smallStep");
    }

    public void setSmallStep(float value) {
        setProperty("smallStep", value);
    }

    public String getTickPlacement() {
        return (String)getProperty("tickPlacement");
    }

    public void setTickPlacement(String value) {
        setProperty("tickPlacement", value);
    }

    public String getChange() {
        Function property = ((Function)getProperty("change"));
        if (property != null) {
            return property.getBody();
        }
        return null;
    }

    public void setChange(String value) {
        setProperty("change", new Function(value));
    }

    public String getSlide() {
        Function property = ((Function)getProperty("slide"));
        if (property != null) {
            return property.getBody();
        }
        return null;
    }

    public void setSlide(String value) {
        setProperty("slide", new Function(value));
    }

//<< Attributes

}
