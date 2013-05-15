function World(w,h) {
	
        var positions = {};
        var tiles = {};
	var model = new MapModel();
        
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
            var theChar = model.getCharacter(c);
            
            if (!getOccupant(x, y))
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
            console.log(x + "," + y)
            var theChar = model.getCharacter(c);
            setOccupant(undefined,theChar.tilex,theChar.tiley)
            setOccupant(c, x, y);
        }
        
        model.setCanMoveToFunc(canMoveTo);
        model.setMoveToFunc(moveTo);
        
	this.getModel = function()
	{
	    return model;
	}
        
        this.addCharacter = function(type)
        {
            var char = model.addCharacter(type);
            var c = model.getCharacter(char);
            setOccupant(char, c.tilex, c.tiley); 
            return char;
        }
        
        this.moveCharacter = function(number, direction)
        {
            model.moveCharacter(number, direction);
        }
        
        this.teleportCharacter = function(number, x, y)
        {
            model.teleportCharacter(number, x, y);
        }
	
	return this;
}
