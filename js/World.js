function World(w, h, tileset, charset, mapfunc) {
	
        var positions = {};
        var tiles = {};
	var model = new MapModel(tileset, charset, mapfunc);
        
        function setOccupant(c, x, y)
        {
            positions[x + "," + y] = c;
        }
        
        function getOccupant(x, y)
        {
            return positions[x + "," + y]
        }
        
        function canMoveTo(c, x, y)
        {
	    //console.log(positions[2 + "," + 2])
            var theChar = model.getCharacter(c);
            
            if (getOccupant(x, y) === undefined)
            {
                return true;
            }
            
            if (getOccupant(x, y) !== c)
            {
                return false;
            }
            
            return true;
        }
        
        function moveTo(c, x, y) {
            //console.log(x + "," + y)
            var theChar = model.getCharacter(c);
            setOccupant(undefined,theChar.tilex,theChar.tiley)
            setOccupant(c, x, y);
        }
        
        model.setCanMoveToFunc(canMoveTo);
        model.setMoveToFunc(moveTo);
	model.setGetOccupant(getOccupant);
        
	this.getModel = function()
	{
	    return model;
	}
        
        this.addCharacter = function(type,x,y)
        {
            var char = model.addCharacter(type,x,y);
            var c = model.getCharacter(char);
            setOccupant(char, c.tilex, c.tiley); 
            return char;
        }
	
	this.removeCharacter = function(char) {
		model.removeCharacter(char);
		var c = model.getCharacter(char);
		setOccupant(undefined, c.tilex, c.tiley);
	}
        
        this.moveCharacter = model.moveCharacter;
	
        this.rotateCharacter = model.rotateCharacter;
        
        this.teleportCharacter = model.teleportCharacter;
	
	this.setOnCollide = function(func)
	{
		model.setOnCollide(func);
	}
	
	this.getCharacterPosition = function(number)
	{
		var char = model.getCharacter(number);
		return { x: char.tilex, y: char.tiley };
	}
	
	this.setCharacterSlowness = function(number, slowness)
	{
		var char = model.getCharacter(number);
		char.slowness = slowness;
	}
	
	this.getCharacterSlowness = function(number, slowness)
	{
		var char = model.getCharacter(number);
		return char.slowness;
	}
	
	this.getCharacterInFrontOf = function(number, distance)
	{
		var tile = model.getFrontTile(number, distance);
		return getOccupant(tile.x, tile.y);
	}
	
	this.getClosestCharacterInFrontOf = function(number, distance)
	{
		var tile
		while (!tile) {
			tile = model.getFrontTile(number, distance);
		}
		return getOccupant(tile.x, tile.y);
	}
	
	return this;
}
