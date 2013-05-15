function MapCamera()
{
	var x = 0, y = 0;
	
	this.getLocation = function()
	{
		return {x: x, y: y};
	}
	
	return this;
}

function MapHeroCamera(mapView, mapModel, hero)
{
	var x = 0, y = 0;
	
	this.getLocation = function()
	{
		var rect = mapView.getRectangle();
		var tileSize = mapModel.getTileSize();
		var char = mapModel.getCharacter(hero);
		return {x: char.x - rect.w / tileSize / 2 + 0.5, y: char.y - rect.h / tileSize / 2 + 0.5};
	}
	
	return this;
}