
function MapModel()
{
	var self = this;
	this.getTileSize = function()
	{
		return 32;
	}
	
	this.getImage = function()
	{
		return "res/tileset.png"
	}
	
	this.getTileOffset = function(x,y)
	{
		return {x: 0 * this.getTileSize(), y: 0};
	}
	
	this.getCharacterImage = function()
	{
		return "res/blackmage.png";
	}
	
	var animOffset = 0;
	var characters = [];
	
	function setCharMovement(char, direction)
	{
		var step = 1/8;
		if(direction == 0)
		{
			char.dy = step;
		}
		if(direction == 1)
		{
			char.dx = -step;
		}
		if(direction == 2)
		{
			char.dx = step;
		}
		if(direction == 3)
		{
			char.dy = -step;
		}
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
				char.offsetx = 0;
			}
			if (char && (char.dx || char.dy))
			{
				char.offsetx = 0 + Math.floor(animOffset / 8) * 32;
				char.tilex += char.dx;
				if (char.tilex === Math.floor(char.tilex))
				{
					char.dx = 0;
				}
				char.tiley += char.dy;
				if (char.tiley === Math.floor(char.tiley))
				{
					char.dy = 0;
				}
			}
		}
		return characters;
	}
	
	this.createCharacter = function()
	{
		characters.push(
			{
				id: characters.length,
				width: 32,
				height: 48,
				tilex: 2,
				tiley: 3,
				offsetx: 0,
				offsety: 0,
				dx: 0,
				dy: 0
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
		if (char)
		{
			setCharMovement(char, direction);
		}
	}
	
	this.getCharacter = function(number)
	{
		return characters[number];
	}
	
	return this;
}