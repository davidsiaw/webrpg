function MapModel()
{
	// constants
	var self = this;
	
	var animSlowness = 16;

	// func
	this.getTileSize = function()
	{
		return 32;
	}
	
	this.getImage = function()
	{
		return "res/tilesetsml.png"
	}
	
	this.getTileOffset = function(char, x,y)
	{
		return {x: 0 * this.getTileSize(), y: 0};
	}
	
	this.getCharacterImage = function()
	{
		return "res/output.png";
	}
	
	var animOffset = 0;
	var characters = [];
	var collide = function(predator, victim) { }
	var canMoveTo = function (c,x,y) { return true; }
	var moveTo = function (c,x,y) { return true; }
	var getOccupant = function (x,y) { return undefined; }
	
	function getDirection(direction) {
		var dir = {dx:0, dy:0};
		if(direction == 0)
		{
			dir.dy = 1;
		}
		if(direction == 1)
		{
			dir.dx = -1;
		}
		if(direction == 2)
		{
			dir.dx = 1;
		}
		if(direction == 3)
		{
			dir.dy = -1;
		}
		return dir;
	}
	
	function setCharMovement(char, direction)
	{
		var movementStep = 1 / char.slowness;
		var dir = getDirection(direction);
		if(dir.dy)
		{
			char.dy = dir.dy * movementStep;
		}
		if(dir.dx)
		{
			char.dx = dir.dx * movementStep;
		}
	}
	
	function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
	
	this.setCanMoveToFunc = function(func)
	{
		canMoveTo = func;
	}
	
	this.setMoveToFunc = function(func)
	{
		moveTo = func;
	}
	
	this.setGetOccupant = function (func)
	{
		getOccupant = func;
	}
	
	this.setOnCollide = function(func)
	{
		collide = func;
	}
	
	this.advanceTime = function(milSecAdvanced)
	{
		var framesAdvanced = Math.round(milSecAdvanced / 8);
		animOffset += framesAdvanced;
		animOffset %= animSlowness * 4;
		
		for (var idx in characters)
		{
			var char = characters[idx];
			if (char && !(char.dx || char.dy))
			{
				char.offsetx = char.baseoffsetx;
			}
			if (char && (char.dx || char.dy))
			{
				char.offsetx = char.baseoffsetx + Math.floor(animOffset / animSlowness) * char.width;
				
				// move forward number of frames
				for (var i = 0; i < framesAdvanced; i++) {
					
					var resultingx = char.x + char.dx;
					var resultingy = char.y + char.dy;
					if (resultingx === Math.floor(resultingx))
					{
						char.x = resultingx;
						char.dx = 0;
					}
					else
					{
						char.x = resultingx;
					}
					if (Math.abs(char.x - char.tilex) >= 1)
					{
						char.x = char.tilex;
						char.dx = 0;
					}
						
					char.y = resultingy;
					if (resultingy === Math.floor(resultingy))
					{
						char.y = resultingy;
						char.dy = 0;
					}
					else
					{
						char.y = resultingy;
					}
					
					if (Math.abs(char.y - char.tiley) >= 1)
					{
						char.y = char.tiley;
						char.dy = 0;
					}
				}
			}
		}
	}

	this.getCharacters = function()
	{
		return characters;
	
	}
	
	this.addCharacter = function(typeid,x,y)
	{
		characters.push(
			{
				id: characters.length,
				width: 32,
				height: 48,
				tilex: x,
				tiley: y,
				x: x,
				y: y,
				offsetx: 0,
				offsety: 0,
				baseoffsetx: typeid * 128,
				dx: 0,
				dy: 0,
				direction: 0,
				slowness: 16
			}
		);
		return characters.length - 1;
	}
	
	this.rotateCharacter = function(number, direction)
	{
		characters[number].offsety = direction * 48;
		characters[number].direction = direction;
	}
	
	this.moveCharacter = function(number, direction)
	{
		var char = characters[number];
		self.rotateCharacter(number, direction);
		
		var dir = getDirection(direction);
		var dx = dir.dx;
		var dy = dir.dy;
		
		
		if (char)
		{
			if (!char.dx && dx && char.tilex == char.x)
			{
				//console.log("moveright")
				if (canMoveTo(number, char.tilex+dx, char.tiley))
				{
					moveTo(number, char.tilex+dx, char.tiley);
					char.tilex += dx;
					setCharMovement(char, direction);
				}
				else
				{
					collide(number, getOccupant(char.tilex+dx, char.tiley));
					//console.log("collide");
					return;
				}
			}
			
			if (!char.dy && dy && char.tiley == char.y)
			{
				//console.log("movedown")
				if (canMoveTo(number, char.tilex, char.tiley+dy))
				{
					moveTo(number, char.tilex, char.tiley+dy);
					char.tiley += dy;
					setCharMovement(char, direction);
				}
				else
				{
					collide(number, getOccupant(char.tilex, char.tiley+dy));
					//console.log("collide");
					return;
				}
			}
		}
	}
	
	this.teleportCharacter = function(number, tilex, tiley)
	{
		if (canMoveTo(number, tilex, tiley))
		{
			moveTo(number, tilex, tiley);
			characters[number].tilex = tilex;
			characters[number].tiley = tiley;
			characters[number].x = tilex;
			characters[number].y = tiley;
			return 0;
		}
		return 1;
	}
	
	this.getFrontTile = function (number, distance)
	{
		var dist = distance || 1;
		var char = characters[number];
		var dir = getDirection(char.direction);
		return {x: dir.dx * dist + char.tilex,
			y: dir.dy * dist + char.tiley}
	}
	
	this.getCharacter = function(number)
	{
		return characters[number];
	}
	
	return this;
}
