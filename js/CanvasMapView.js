function CanvasMapView(x,y,z,w,h,mapModel)
{
    var self = this;
    var tileSize = mapModel.getTileSize();
    var camera = new MapCamera();
    
    var canvas = document.createElement('canvas');
    var context = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w+"px";
    canvas.style.height = h+"px";
    canvas.style.position = "absolute";
    canvas.style.left = x+"px";
    canvas.style.top = y+"px";
    canvas.style.zIndex = z;
    
    var tilesPerWidth = w / tileSize + 2;
    var tilesPerHeight = h / tileSize + 2;
    
    var tileSetImg = new Image();
    var charSetImg = new Image();
    
    this.setCamera = function(cam)
    {
        camera = cam;
    }
    
    var lastUpdateTime = new Date();
    
    function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
    
    var lastx = 0;
    function update()
    {
	var timeBetween = new Date() - lastUpdateTime;
        //console.log(timeBetween);
        mapModel.advanceTime(timeBetween);
        
        var cameraPos = camera.getLocation();
	
	
        for (var y = 0; y < tilesPerHeight; y++)
        {
            for (var x = 0; x < tilesPerWidth; x++)
            {
                var texcoord = mapModel.getTileOffset(cameraPos.x+x,cameraPos.y+y);
	    
		var biasedFracY = (cameraPos.y + tileSize * h) % 1;
		var biasedFracX = (cameraPos.x + tileSize * w) % 1;
		
		var top = ((y - 1 - biasedFracY) * tileSize);
		var left = ((x - 1 - biasedFracX) * tileSize);
		
		if (!texcoord)
		{
		    context.fillStyle = "#000";
		    context.fillRect(left, top, tileSize, tileSize);
		}
		else
		{
		    if (lastx !== cameraPos.y) {
			console.log(cameraPos.y + " " + y + " " + top)
			lastx = cameraPos.y;
		    }
		    
		    context.drawImage(tileSetImg,texcoord.x,texcoord.y,tileSize,tileSize,left,top,tileSize,tileSize);
		}
            }
        }
            
        var characters = mapModel.getCharacters().slice(0);
        
        characters.sort(function(a,b){ return a.y - b.y });
        
        for(var idx in characters)
        {
            var char = characters[idx];
                    
            var left = ((char.x+1/2) * tileSize - char.width/2 - (cameraPos.x) * tileSize) ;
            var top = ((char.y+1) * tileSize - char.height - (cameraPos.y) * tileSize) ;
            
            context.drawImage(charSetImg,char.offsetx,char.offsety,char.width,char.height,left,top,char.width,char.height);
        }
        
        lastUpdateTime = new Date();
    }
    
    var loaded = false;
    
    tileSetImg.src = mapModel.getImage();
    tileSetImg.onload = function()
    {
        charSetImg.src = mapModel.getCharacterImage();
        charSetImg.onload = function()
        {
	    loaded = true;
	    self.update();
        }
    }
    
    this.getRectangle = function()
    {
        return {w:w, h:h, x:x, y:y};
    }
    
    this.getDiv = function()
    {
        return canvas;
    }
    
    this.update = function()
    {
	if (!loaded) {
	    return;
	}
	update();
    }
    
    this.setHasBorder = function(yes)
    {
        if (yes)
        {
            canvas.style.border = "1px solid #000"
        }
        else
        {
            canvas.style.border = "0px"
        }
    }
    
    return this;
}
