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
    var highlightboxOpacity = 0.5;
    var highlightboxOpacityChange = 1/64;
    
    var arrowAnim = 0;
    var arrowAnimStep = 1/4;
    
    var text = [];
    
    var showNextArrow = false;
    
    //console.log(cc)
    
    var tx=4,ty=480-164,tw=632,th=160;
    var highlightbox = {
	    x: 0,
	    y: 0,
	    w: 0,
	    h: 0
	};
    
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
	
	if (!highlightbox.w == 0 && !highlightbox.h == 0) {
	    var origAlpha = ctx.globalAlpha;
	    highlightboxOpacity += highlightboxOpacityChange;
	    ctx.globalAlpha = highlightboxOpacity;
	    if (highlightboxOpacity >= 1 || highlightboxOpacity <= 0.5) {
		highlightboxOpacityChange = -highlightboxOpacityChange;
	    }
	    
	    ctx.drawImage(image, 64, 64, 16, 16, highlightbox.x, highlightbox.y, 16, 16);
	    ctx.drawImage(image, 64+16, 64, 16, 16, highlightbox.x+highlightbox.w-16, highlightbox.y, 16, 16);
	    ctx.drawImage(image, 64, 64+16, 16, 16, highlightbox.x, highlightbox.y+highlightbox.h-16, 16, 16);
	    ctx.drawImage(image, 64+16, 64+16, 16, 16, highlightbox.x+highlightbox.w-16, highlightbox.y+highlightbox.h-16, 16, 16);
	    
	    ctx.drawImage(image, 64, 64+8, 16, 16, highlightbox.x, highlightbox.y+16, 16, highlightbox.h-32);
	    ctx.drawImage(image, 64+8, 64, 16, 16, highlightbox.x+16, highlightbox.y, highlightbox.w-32, 16);
	    
	    ctx.drawImage(image, 64+16, 64+8, 16, 16, highlightbox.x+highlightbox.w-16, highlightbox.y+16, 16, highlightbox.h-32);
	    ctx.drawImage(image, 64+8, 64+16, 16, 16, highlightbox.x+16, highlightbox.y+highlightbox.h-16, highlightbox.w-32, 16);
	    
	    ctx.drawImage(image, 64+8, 64+8, 16, 16, highlightbox.x+16, highlightbox.y+16, highlightbox.w-32, highlightbox.h-32);
	    
	    ctx.globalAlpha = origAlpha
	}
	
	ctx.fillStyle = "#fff"
	ctx.textBaseline = "top"
	ctx.font = "24px courier"
	for (var row=0; row < text.length; row++) {
	    ctx.fillText(text[row], tx+18, ty+18+32*row);	
	}
	
	if (showNextArrow) {
	    arrowAnim+=arrowAnimStep;
	    arrowAnim %= 4;
	    var arrowAnimInt = Math.floor(arrowAnim);
	    ctx.drawImage(image, 96+(arrowAnimInt % 2)*16, 64+(arrowAnimInt >> 1)*16, 16, 16, tx+tw-32, ty+th-32, 16, 16);
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
    
    this.setHighlightBox = function(box)
    {
	highlightbox = box;
    }
    
    this.areaGetNothing = function()
    {
	return {
	    x: 0,
	    y: 0,
	    w: 0,
	    h: 0
	}
    }
    
    this.areaGetWhole = function()
    {
	return {
	    x: tx+16,
	    y: ty+16,
	    w: tw-32,
	    h: th-32
	};
    }
    
    this.areaGetRow = function(row)
    {
	var maxRows = Math.floor( (th-32) / 32 );
	row = row % maxRows;
	return {
	    x: tx+16,
	    y: ty+16+row*32,
	    w: tw-32,
	    h: 32
	};
    }
    
    this.areaGetSquare = function(col,row)
    {
	var maxRows = Math.floor( (th-32) / 32 );
	var maxCols = Math.floor( (tw-32) / 32 );
	row = row % maxRows;
	col = col % maxCols;
	return {
	    x: tx+16+col*32,
	    y: ty+16+row*32,
	    w: 32,
	    h: 32
	};
    }
    
    this.setText = function()
    {
	text = arguments;
    }
    
    this.startWritingText = function(textArray, onComplete)
    {
	text = [ ];
	var row = 0;
	
	function updateText()
	{
	    if (text.length === row) {
		text.push("");
	    }
	    
	    if (text[row].length === textArray[row].length) {
		row++;
		text.push("");
	    }
	    
	    if (row === textArray.length) {
		onComplete();
		return;
	    }
	    
	    do {
		if (!textArray[row][text[row].length]) {
		    break;
		}
		text[row] += textArray[row][text[row].length];
	    } while (textArray[row][text[row].length] == " " && text[row].length < textArray[row].length);
	    
	    setTimeout(updateText, 60);
	};
	
	updateText();
    }
    
    this.showNextArrow = function()
    {
	showNextArrow = true;
    }
    
    this.hideNextArrow = function()
    {
	showNextArrow = false;
    }
    
    return this;
}