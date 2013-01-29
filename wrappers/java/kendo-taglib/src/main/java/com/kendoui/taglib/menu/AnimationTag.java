
package com.kendoui.taglib.menu;

import com.kendoui.taglib.BaseTag;

import com.kendoui.taglib.MenuTag;




import javax.servlet.jsp.JspException;

@SuppressWarnings("serial")
public class AnimationTag extends BaseTag /* interfaces *//* interfaces */ {
    
    @Override
    public int doEndTag() throws JspException {
//>> doEndTag


        MenuTag parent = (MenuTag)findParentWithClass(MenuTag.class);


        parent.setAnimation(this);

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
        return "menu-animation";
    }

    public void setClose(com.kendoui.taglib.menu.AnimationCloseTag value) {
        setProperty("close", value);
    }

    public void setOpen(com.kendoui.taglib.menu.AnimationOpenTag value) {
        setProperty("open", value);
    }

//<< Attributes

}
