function DialogView(x,y,z,w,h,windowSkin)
{
    var self = this;
    var cc = document.createElement('canvas');
    var ctx = cc.getContext("2d");
    cc.width = w;
    cc.height = h;
    cc.style.width = cc.width+"px";
    cc.style.height = cc.height+"px";
    cc.style.position = "absolute";
    cc.style.left = x+"px";
    cc.style.top = y+"px";
    cc.style.zIndex = z;
    
    var visible = true;
    
    //console.log(cc)
    
    var tx=4,ty=480-100,tw=632,th=96;
    
    var isLoaded = false;
    var image = new Image();
    image.src = windowSkin;
    image.onload = function()
    {
        isLoaded = true;
        self.update();
    }
    
    this.getDiv = function()
    {
        return cc;
    }
    
    this.setDialogRect = function(winx,winy,winw,winh)
    {
        tx = winx;
        ty = winy;
        tw = winw;
        th = winh;
    }
    
    this.update = function()
    {
        if (!isLoaded || !visible) {
            return;
        }
        
	ctx.drawImage(image, 0, 0, 64, 64, tx+2, ty+2, tw-4, th-4);
	
	ctx.drawImage(image, 64, 0, 16, 16, tx, ty, 16, 16);
	ctx.drawImage(image, 128-16, 0, 16, 16, tx+tw-16, ty, 16, 16);
	ctx.drawImage(image, 64, 64-16, 16, 16, tx, ty+th-16, 16, 16);
	ctx.drawImage(image, 128-16, 64-16, 16, 16, tx+tw-16, ty+th-16, 16, 16);
	
	for (var xx = 16; xx < tw-16; xx+=32) {
		ctx.drawImage(image, 64+16, 0, 32, 16, tx+xx, ty, 32, 16);
	}
	
	for (var xx = 16; xx < tw-16; xx+=32) {
		ctx.drawImage(image, 64+16, 64-16, 32, 16, tx+xx, ty+th-16, 32, 16);
	}
	
	for (var yy = 16; yy < th-16; yy+=32) {
		ctx.drawImage(image, 64, 16, 16, 32, tx, ty+yy, 16, 32);
	}
	
	for (var yy = 16; yy < th-16; yy+=32) {
		ctx.drawImage(image, 128-16, 16, 16, 32, tx+tw-16, ty+yy, 16, 32);
	}
    }
    
    this.hide = function()
    {
        cc.style.visibility = "hidden";
        visible = false;
    }
    
    this.show = function()
    {
        cc.style.visibility = "visible";
        visible = true;
    }
    
    return this;
}