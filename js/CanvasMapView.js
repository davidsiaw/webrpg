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

    var charShift = 0;

    var tilesPerWidth = w / tileSize + 2;
    var tilesPerHeight = h / tileSize + 2;
    
    var prerenderedMap = {};
    var charSetImg = new Image();
    
    this.setCamera = function(cam)
    {
        camera = cam;
    }
    
    var lastUpdateTime = new Date();
    
    function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
    
    function update()
    {
        var now = new Date();
	    var timeBetween = now - lastUpdateTime;
        //console.log(timeBetween);
        mapModel.advanceTime(timeBetween);

        var millisecond = now.getTime();
        var tileAnimTick = Math.floor(millisecond / 100);
        
        var cameraPos = camera.getLocation();
	
        for (var y = 0; y < tilesPerHeight; y++)
        {
            for (var x = 0; x < tilesPerWidth; x++)
            {
        		var texcoord = mapModel.getTileOffset(cameraPos.x+x,cameraPos.y+y);
        	    
        		var biasedFracY = (cameraPos.y + tileSize * h) % 1;
        		var biasedFracX = (cameraPos.x + tileSize * w) % 1;
        		
        		var top = ((y - biasedFracY) * tileSize);
        		var left = ((x - biasedFracX) * tileSize);

                var srcLeft = (left + prerenderedMap["background"].width + cameraPos.x * (tileSize) ) % prerenderedMap["background"].width;
                var srcTop = (top + prerenderedMap["background"].height + cameraPos.y * (tileSize) ) % prerenderedMap["background"].height;

                if (prerenderedMap["background"] && srcLeft >= 0 && srcTop >= 0)
                {
                    context.drawImage(
                        prerenderedMap["background"],
                        srcLeft,
                        srcTop,
                        tileSize,
                        tileSize,
                        left,
                        top,
                        tileSize,
                        tileSize
                    )
                }
                else
                {
                    context.fillStyle = "#000";
                    context.fillRect(left, top, tileSize, tileSize);
                }

        		if (!texcoord)
        		{
        		}
        		else
        		{
                    var item = prerenderedMap[":" + Math.floor(cameraPos.x + x) + "," + Math.floor(cameraPos.y + y)];
                    if (item) 
                    {
                        for (var i=0; i<item.parts.length; i++)
                        {
                            var animLength = item.parts[i].coords.length;
                            context.drawImage(
                                      item.tileSet,
                                      item.parts[i].coords[tileAnimTick % animLength].x + item.parts[i].dx,
                                      item.parts[i].coords[tileAnimTick % animLength].y + item.parts[i].dy,
                                      item.parts[i].size,
                                      item.parts[i].size,
                                      left + item.parts[i].dx,
                                      top + item.parts[i].dy,
                                      item.parts[i].size,
                                      item.parts[i].size);
                        }
                    }

        		    /*context.drawImage(
        				      tileSetImg,
        				      texcoord.x,
        				      texcoord.y,
        				      tileSize,
        				      tileSize,
        				      left,
        				      top,
        				      tileSize,
        				      tileSize);*/
        		}
            }
        }
            
        var characters = mapModel.getCharacters().slice(0);
        
        characters.sort(function(a,b){ return a.y - b.y });
        
        for(var idx in characters)
        {
            var char = characters[idx];
	    
    	    if (char === undefined) {
    		  continue;
    	    }
            var left = ((char.x+1/2) * tileSize - char.width/2 - (cameraPos.x) * tileSize) ;
            var top = ((char.y+1) * tileSize - char.height - (cameraPos.y) * tileSize) ;
            
            context.drawImage(
                charSetImg,
                char.offsetx,char.offsety,char.width,char.height,
                left,top + char.charShift,char.width,char.height);
        }
        
        lastUpdateTime = new Date();
    }
    
    var loaded = false;
    
    prerenderedMap = mapModel.getPrerenderedMap();
    charSetImg = mapModel.getCharacterImage();
    
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
    
    loaded = true;
    self.update();
    
    return this;
}
