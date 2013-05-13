function KeyWatcher()
{
	var keys = {};
	document.onkeydown = function(key)
	{
		keys[key.keyIdentifier] = true;
	}

	document.onkeyup = function(key)
	{
		delete keys[key.keyIdentifier];
	}
	
	
	
	this.getKeys = function()
	{
		return keys;
	}
	
	return this;
}