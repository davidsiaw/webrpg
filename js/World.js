var Passable = {
	Ground: 0x1,
	Air: 0x2,
}

function World(tileset, charset, background, tileinfo, mapinfo)
{
	var w = mapinfo.width;
	var h = mapinfo.height;
	var tileSize = 48;
	var d = tileSize/2;
	var posAndMaskToTile =
	[
		[10, 0, 1, 2, 6, 7, 9, 8],
		[10, 2, 3, 4, 0, 1, 9, 8],
		[10, 4, 5, 6, 2, 3, 9, 8],
		[10, 6, 7, 0, 4, 5, 9, 8]
	];
	
	var corner =
	[
		{x:d, y:0},
		{x:d, y:d},
		{x:0, y:d},
		{x:0, y:0},
	];
	
	var prerenderedMap = {};
	
	function isTileSame(tileid, mapinfo, x, y)
    {
        if (x >= mapinfo.width || x < 0)
        {
            return 1;
        }
        if (y >= mapinfo.height || y < 0)
        {
            return 1;
        }
        return tileid == mapinfo.map(x,y) ? 1 : 0;
    }

    function surroundings(mapinfo, x, y)
    {
    	var tileid = mapinfo.map(x,y);
        return (
            (isTileSame(tileid, mapinfo, x+1, y-1) << 0) |
            (isTileSame(tileid, mapinfo, x+1, y+1) << 1) |
            (isTileSame(tileid, mapinfo, x-1, y+1) << 2) |
            (isTileSame(tileid, mapinfo, x-1, y-1) << 3) |
            (isTileSame(tileid, mapinfo, x, y-1) << 4) |
            (isTileSame(tileid, mapinfo, x+1, y) << 5) |
            (isTileSame(tileid, mapinfo, x, y+1) << 6) |
            (isTileSame(tileid, mapinfo, x-1, y) << 7)
            );
    }
	
	function getCornerMask(corner, surrounding)
    {
        switch (corner)
        {
            case 0:
                return (((surrounding >> 3) & 6) | (surrounding & 1));
            case 1:
                return (((surrounding >> 4) & 6) | ((surrounding >> 1) & 1));
            case 2:
                return (((surrounding >> 5) & 6) | ((surrounding >> 2) & 1));
            case 3:
                return (((surrounding >> 3) & 1) | ((surrounding >> 2) & 4) | ((surrounding >> 6) & 2));
        }
    	return 0;
    }
	
	function prerender()
	{
		prerenderedMap["background"] = background;
		for (var x = 0; x < w; x++)
		{
			for (var y = 0; y < h; y++)
			{

				var tileid = mapinfo.map(x,y);
				var tile = tileinfo[tileid];
				var surrounding = surroundings(mapinfo, x, y);
				if (tile.type === "simple")
				{
					/*context.drawImage(
							  tileset,
							  tile.coords[0].x,
							  tile.coords[0].y,
							  tileSize,
							  tileSize,
							  
							  x*tileSize,
							  y*tileSize,
							  tileSize,
							  tileSize);*/
					prerenderedMap[":" + x + "," + y] = {
						tileSet: tileset,
						parts: [ { coords: tile.coords, dx: 0, dy: 0, size: tileSize} ]
					};
				}
				else if (tile.type === "autotile12")
				{
					var parts = [];

					for (var i=0; i<4; i++)
					{
						var dx = corner[i].x;
						var dy = corner[i].y;
						var cornerMask = getCornerMask(i, surrounding);

						parts.push({
							coords: tileinfo[tile.indexes[posAndMaskToTile[i][cornerMask]]].coords,
							dx: dx,
							dy: dy,
							size: tileSize/2
						});

						/*context.drawImage(
								  tileset,
								  tileinfo[tile.indexes[posAndMaskToTile[i][cornerMask]]].coords[0].x+dx,
								  tileinfo[tile.indexes[posAndMaskToTile[i][cornerMask]]].coords[0].y+dy,
								  d, d,
								  x*tileSize+dx,
								  y*tileSize+dy,
								  d, d);*/
					}

					prerenderedMap[":" + x + "," + y] = {
						tileSet: tileset,
						parts: parts
					};

				}
				
			}
		}	
	}
	
	prerender();
	
    var positions = {};
    var tiles = {};
	var model = new MapModel(prerenderedMap, charset, tileSize, function(x,y)
	{
		x = Math.floor(x);
		y = Math.floor(y);
		if (x >= 0 && x < w && y >= 0 && y < h)
		{
			return {x:x*tileSize, y:y*tileSize};
		}
		return undefined;
	});

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
    if (x < 0 || x >= w || y < 0 || y >= h)
    {
    	return false;
    }
	
    //console.log(positions[2 + "," + 2])
    var theChar = model.getCharacter(c);
        
    var tileid = mapinfo.map(x,y);
    var tile = tileinfo[tileid];

    if ( (tile.passable & theChar.mobility) === 0 )
    {
	return false;
    }
    
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
    
    function moveTo(c, x, y)
	{
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

    this.addCharacter = function(type,x,y,shift)
    {
        var char = model.addCharacter(type,x,y,shift);
        var c = model.getCharacter(char);
    	c.mobility = Passable.Ground;
        setOccupant(char, c.tilex, c.tiley); 
        return char;
    }

	this.removeCharacter = function(char) {
		var c = model.getCharacter(char);
		if (!c)
		{
			console.log("World.removeCharacter: No such char " + char);
			return;
		}
		model.removeCharacter(char);
		setOccupant(undefined, c.tilex, c.tiley);
	}
	
	this.setMobility = function(char, mob)
	{
		var c = model.getCharacter(char);
		c.mobility = mob;
	}
	
	this.getMobility = function(char, mob)
	{
		var c = model.getCharacter(char);
		return c.mobility;
	}
    
    this.moveCharacter = model.moveCharacter;

    this.rotateCharacter = model.rotateCharacter;

	this.getCharacterRotation = model.getCharacterRotation;
    
    this.teleportCharacter = model.teleportCharacter;

	this.getCharacterPosition = function(number)
	{
		var char = model.getCharacter(number);
		return { x: char.tilex, y: char.tiley };
	}
	
	this.rerenderWorld = function()
	{
		prerender();
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
	
	this.getFrontOf = model.getFrontTile;
	this.getPositionOf = model.getPositionOf;
	
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
