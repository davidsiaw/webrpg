function SimpleInput() {
    
    var keyb = new KeyWatcher();
    
    var leftArrowAction = function() {}
    var rightArrowAction = function() {}
    var upArrowAction = function() {}
    var downArrowAction = function() {}
    
    var aAction = function() {}
    var sAction = function() {}
    var zAction = function() {}
    var xAction = function() {}
    
    this.checkInputs = function()
    {
	if (keyb.getKey(LEFT_ARROW_KEY) && leftArrowAction)
	{
            leftArrowAction();
	}
        else if (keyb.getKey(RIGHT_ARROW_KEY) && rightArrowAction)
	{
            rightArrowAction();
	}
	if (keyb.getKey(UP_ARROW_KEY) && upArrowAction)
	{
            upArrowAction();
	}
	else if (keyb.getKey(DOWN_ARROW_KEY) && downArrowAction)
	{
            downArrowAction();
	}
	if (keyb.getKey(A_KEY) && aAction)
        {
            aAction();
	}
	if (keyb.getKey(S_KEY) && sAction)
        {
            sAction();
	}
	if (keyb.getKey(Z_KEY) && zAction)
        {
            zAction();
	}
	if (keyb.getKey(X_KEY) && xAction)
        {
            xAction();
	}
    }
    
    this.setActions = function(inputs)
    {
        leftArrowAction = inputs.leftArrowAction;
        rightArrowAction = inputs.rightArrowAction;
        upArrowAction = inputs.upArrowAction;
        downArrowAction = inputs.downArrowAction;
        
        aAction = inputs.aAction;
        sAction = inputs.sAction;
        zAction = inputs.zAction;
        xAction = inputs.xAction;
        
        keyb.setOnKeyDownOnce(A_KEY, inputs.aActionOnce);
        keyb.setOnKeyDownOnce(S_KEY, inputs.sActionOnce);
        keyb.setOnKeyDownOnce(Z_KEY, inputs.zActionOnce);
        keyb.setOnKeyDownOnce(X_KEY, inputs.xActionOnce);
    }
    
    return this;
}