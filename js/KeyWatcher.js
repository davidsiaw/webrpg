LEFT_ARROW_KEY = 37
UP_ARROW_KEY = 38
RIGHT_ARROW_KEY = 39
DOWN_ARROW_KEY = 40

function KeyWatcher()
{
	var keys = {};
	document.onkeydown = function(key)
	{
		keys[key.keyCode] = true;
	}

	document.onkeyup = function(key)
	{
		delete keys[key.keyCode];
	}
	
	this.getKey = function(key)
	{
		return keys[key];
	}
	
	this.setKeyDown = function(key)
	{
		keys[key] = true;
	}
	
	this.setKeyUp = function(key)
	{
		delete keys[key];
	}
	
	return this;
}