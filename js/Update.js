function BeginUpdating(func, canvas) {
    var animFrame = window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame    ||
                    window.oRequestAnimationFrame      ||
                    window.msRequestAnimationFrame     ||
    null;

    if ( animFrame !== null ) {

        var recursiveAnim = function() {
            func();
            animFrame( recursiveAnim, canvas );
        };

        // start the mainloop
        animFrame( recursiveAnim, canvas );
        
    } else {
        var ONE_FRAME_TIME = 1000.0 / 60.0 ;
        setInterval( func, ONE_FRAME_TIME );
    }
}