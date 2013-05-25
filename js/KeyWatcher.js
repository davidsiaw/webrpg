LEFT_ARROW_KEY = 37
UP_ARROW_KEY = 38
RIGHT_ARROW_KEY = 39
DOWN_ARROW_KEY = 40

A_KEY = 65
S_KEY = 83
Z_KEY = 90
X_KEY = 88

function KeyWatcher()
{
	var keys = {};
	var oneHitCallbacks = {};
	var maticHitCallbacks = {};
	
	// todo support gamepad
	/*
	if (Gamepad.supported)
	{
		var pads = Gamepad.getStates();
		for (var i = 0; i < pads.length; ++i) {
			if (pads[i].leftStickX > 0)
			{
				//world.moveCharacter(hero, 2);
			}
			else if (pads[i].leftStickX < 0)
			{
				//world.moveCharacter(hero, 1);
			}
			if (pads[i].leftStickY > 0)
			{
				//world.moveCharacter(hero, 0);
			}
			else if (pads[i].leftStickY < 0)
			{
				//world.moveCharacter(hero, 3);
			}
		}
	}*/
	
	
	document.onkeydown = function(key)
	{
		if (oneHitCallbacks[key.keyCode]) {
			oneHitCallbacks[key.keyCode]();
		}
		if (maticHitCallbacks[key.keyCode]) {
			maticHitCallbacks[key.keyCode]();
		}
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
	
	this.setOnKeyDownOnce = function(key, func)
	{
		oneHitCallbacks[key] = function() {
			//console.log(keys[key])
			if (func && !keys[key]) {
				func();
			}
		};
	}
	
	this.setOnKeyDown = function(key, func)
	{
		maticHitCallbacks[key] = function() {
			//console.log(keys[key])
			if (func) {
				func();
			}
		};
	}
	
	return this;
}