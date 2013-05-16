function MapModel()
{
	var self = this;
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
		var step = 1/8;
		var dir = getDirection(direction);
		if(dir.dy)
		{
			char.dy = dir.dy * step;
		}
		if(dir.dx)
		{
			char.dx = dir.dx * step;
		}
	}
	
	function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
	
	var canMoveTo = function (c,x,y) { return true; }
	var moveTo = function (c,x,y) { return true; }
	
	this.setCanMoveToFunc = function(func)
	{
		canMoveTo = func;
	}
	
	this.setMoveToFunc = function(func)
	{
		moveTo = func;
	}
	
	this.getCharacters = function()
	{
		animOffset++;
		animOffset %= 32;
		for (var idx in characters)
		{
			var char = characters[idx];
			if (char && !(char.dx || char.dy))
			{
				char.offsetx = char.baseoffsetx;
			}
			if (char && (char.dx || char.dy))
			{
				char.offsetx = char.baseoffsetx + Math.floor(animOffset / 8) * 32;
				
				char.x += char.dx;
				if (char.x === Math.floor(char.x))
				{
					char.dx = 0;
				}
				
				char.y += char.dy;
				if (char.y === Math.floor(char.y))
				{
					char.dy = 0;
				}
			}
		}
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
				direction: 0
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
		if (char)
		{
			if (!char.dx && dir.dx && char.tilex == char.x)
			{
				//console.log("moveright")
				if (canMoveTo(number, char.tilex+dir.dx, char.tiley))
				{
					moveTo(number, char.tilex+dir.dx, char.tiley);
					char.tilex += dir.dx;
					setCharMovement(char, direction);
				}
				else
				{
					return;
				}
			}
			
			if (!char.dy && dir.dy && char.tiley == char.y)
			{
				//console.log("movedown")
				if (canMoveTo(number, char.tilex, char.tiley+dir.dy))
				{
					moveTo(number, char.tilex, char.tiley+dir.dy);
					char.tiley += dir.dy;
					setCharMovement(char, direction);
				}
				else
				{
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
	
	this.getFrontTile = function (number)
	{
		var char = characters[number];
		var dir = getDirection(char.direction);
		return {x: dir.dx + char.tilex,
			y: dir.dy + char.tiley}
	}
	
	this.getCharacter = function(number)
	{
		return characters[number];
	}
	
	return this;
}
