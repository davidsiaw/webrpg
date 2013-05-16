function CanvasMapView(x,y,z,w,h,mapModel)
{
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
    
    function update()
    {
        var cameraPos = camera.getLocation();
        
        for (var y = 0; y < tilesPerHeight; y++)
        {
            for (var x = 0; x < tilesPerWidth; x++)
            {
                var texcoord = mapModel.getTileOffset(cameraPos.x+x,cameraPos.y+y);
                
                var top = ((y - 1 - (cameraPos.y%1)) * tileSize);
                var left = ((x - 1 - (cameraPos.x%1)) * tileSize);
                
                context.drawImage(tileSetImg,texcoord.x,texcoord.y,tileSize,tileSize,left,top,tileSize,tileSize);
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
    }
    
    tileSetImg.src = mapModel.getImage();
    tileSetImg.onload = function()
    {
        charSetImg.src = mapModel.getCharacterImage();
        charSetImg.onload = function()
        {
            var animFrame = window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame    ||
                            window.oRequestAnimationFrame      ||
                            window.msRequestAnimationFrame     ||
            null;
        
            if ( animFrame !== null ) {
        
                var recursiveAnim = function() {
                    update();
                    animFrame( recursiveAnim, canvas );
                };
    
                // start the mainloop
                animFrame( recursiveAnim, canvas );
                
            } else {
                var ONE_FRAME_TIME = 1000.0 / 60.0 ;
                setInterval( update, ONE_FRAME_TIME );
            }
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
