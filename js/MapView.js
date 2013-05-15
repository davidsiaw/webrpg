function MapView(x,y,z,w,h,mapModel)
{
	var tileSize = mapModel.getTileSize();
	var camera = new MapCamera();
	
	var div = document.createElement('div');
	div.style.width = w+"px";
	div.style.height = h+"px";
	div.style.position = "absolute";
	div.style.left = x+"px";
	div.style.top = y+"px";
	div.style.zIndex = z;
	div.style.overflow = "hidden";
	
	var tilesPerWidth = w / tileSize + 2;
	var tilesPerHeight = h / tileSize + 2;
	
	var rows = [];
	for (var y = 0; y < tilesPerHeight; y++)
	{
		var row = [];
		for (var x = 0; x < tilesPerWidth; x++)
		{
			var tile = document.createElement('div');
			tile.style.width = tileSize+"px";
			tile.style.height = tileSize+"px";
			if (((x+y) % 2) == 1)
			{
				tile.style.background = "#0ff";
			}
			tile.style.position = "absolute";
			tile.style.top = (y * tileSize)+"px";
			tile.style.left = (x * tileSize)+"px";
			tile.style.zIndex = z - tilesPerHeight + y - 3;
			div.appendChild(tile);
			row.push(tile);
		}
		rows.push(row);
	}
	
	var currentCharacters = {};
	
	this.setCamera = function(cam)
	{
		camera = cam;
	}
	
	function update()
	{
		var cameraPos = camera.getLocation();
		
		for (var y = 0; y < tilesPerHeight; y++)
		{
			for (var x = 0; x < tilesPerWidth; x++)
			{
				var texcoord = mapModel.getTileOffset(cameraPos.x+x,cameraPos.y+y);
				var image = mapModel.getImage();
				rows[y][x].style.background = "url(" +image + ") -" + texcoord.x + "px -" + texcoord.y + "px no-repeat"
				rows[y][x].style.top = ((y - 1 - (cameraPos.y%1)) * tileSize )+"px";
				rows[y][x].style.left = ((x - 1 - (cameraPos.x%1)) * tileSize)+"px";
				rows[y][x].style.zIndex = z - tilesPerHeight + y - 3;
			}
		}
		
		var characters = mapModel.getCharacters();
		for(var idx in characters)
		{
			//console.log(characters[idx]);
			var char = characters[idx];
			var cElem = currentCharacters[char.id];
			if (!cElem)
			{
				cElem = document.createElement('div');
				cElem.style.position = "absolute";
				cElem.style.width = char.width;
				cElem.style.height = char.height;
				div.appendChild(cElem);
				currentCharacters[char.id] = cElem;
			}
			
			cElem.style.background = 
				"url(" + mapModel.getCharacterImage() + ") -" 
				+ char.offsetx + "px -" 
				+ char.offsety + "px no-repeat"
			cElem.style.left = ((char.x+1/2) * tileSize - char.width/2 - (cameraPos.x) * tileSize) + "px";
			cElem.style.top = ((char.y+1) * tileSize - char.height - (cameraPos.y) * tileSize) + "px";
			cElem.style.zIndex = z - tilesPerHeight + char.y - Math.floor(cameraPos.y) - 1;
		}
	}
	
	setInterval(update, 15);
	
	var img = new Image();
	img.src = mapModel.getImage();
	img.onload = function()
	{
		update();
	}
	
	this.getRectangle = function()
	{
		return {w:w, h:h, x:x, y:y};
	}
	
	this.getDiv = function()
	{
		return div;
	}
	
	this.setHasBorder = function(yes)
	{
		if (yes)
		{
			div.style.border = "1px solid #000"
		}
		else
		{
			div.style.border = "0px"
		}
	}
	
	return this;
}
