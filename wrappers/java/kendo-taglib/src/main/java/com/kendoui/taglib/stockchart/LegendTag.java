
package com.kendoui.taglib.stockchart;


import com.kendoui.taglib.BaseTag;



import com.kendoui.taglib.StockChartTag;




import javax.servlet.jsp.JspException;

@SuppressWarnings("serial")
public class LegendTag extends  BaseTag  /* interfaces *//* interfaces */ {
    
    @Override
    public int doEndTag() throws JspException {
//>> doEndTag


        StockChartTag parent = (StockChartTag)findParentWithClass(StockChartTag.class);


        parent.setLegend(this);

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
        return "stockChart-legend";
    }

    public void setBorder(com.kendoui.taglib.stockchart.LegendBorderTag value) {
        setProperty("border", value);
    }

    public void setLabels(com.kendoui.taglib.stockchart.LegendLabelsTag value) {
        setProperty("labels", value);
    }

    public String getBackground() {
        return (String)getProperty("background");
    }

    public void setBackground(String value) {
        setProperty("background", value);
    }

    public Object getMargin() {
        return (Object)getProperty("margin");
    }

    public void setMargin(Object value) {
        setProperty("margin", value);
    }

    public float getOffsetX() {
        return (float)getProperty("offsetX");
    }

    public void setOffsetX(float value) {
        setProperty("offsetX", value);
    }

    public float getOffsetY() {
        return (float)getProperty("offsetY");
    }

    public void setOffsetY(float value) {
        setProperty("offsetY", value);
    }

    public Object getPadding() {
        return (Object)getProperty("padding");
    }

    public void setPadding(Object value) {
        setProperty("padding", value);
    }

    public String getPosition() {
        return (String)getProperty("position");
    }

    public void setPosition(String value) {
        setProperty("position", value);
    }

    public boolean getVisible() {
        return (boolean)getProperty("visible");
    }

    public void setVisible(boolean value) {
        setProperty("visible", value);
    }

//<< Attributes

}
