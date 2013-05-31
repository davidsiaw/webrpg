function GameState(input, world, map)
{
    var self = this;
    
    this.world = world;
    this.input = input;
    this.map = map;
    this.currChar = undefined;
    
    this.repeat = false;
    
    this.runScript = function(script)
    {
        var cur = 0;
        function invoke() {
            if (self.repeat) {
                cur = 0;
                self.repeat = false;
            }
            if (cur >= script.length) {
                return;
            }
            setTimeout(function() { script[cur++](self, invoke) },0);
        }
        
        invoke();
    }
    
    this.characterScript = function(character, script)
    {
        var cur = 0;
        function invoke() {
            if (self.repeat) {
                cur = 0;
                self.repeat = false;
            }
            if (cur >= script.length) {
                return;
            }
            
            setTimeout(function()
            {
                self.currChar = character;
                script[cur++](self, invoke)
            },0);
        }
        
        invoke();
    }
}

var Character =
{
    walkLeft: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 1, true, function()
        {
            next();
        });
    },
    
    walkRight: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 2, true, function()
        {
            next();
        });
    },
    
    walkUp: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 3, true, function()
        {
            next();
        });
    },
    
    walkDown: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 0, true, function()
        {
            next();
        });
    },
    
    setSlow: function(slowness)
    {
        return function(gameState, next)
        {
            //console.log(slowness)
            gameState.world.setCharacterSlowness(gameState.currChar, slowness);
            next();
        }
    },
    
    
}

var Script =
{
    log: function(text)
    {
        return function(gameState, next)
        {
            console.log(text);
            next();
        }
    },
    
    repeat: function(gameState, next)
    {
        gameState.repeat = true;
        next();
    },
    
    hideDialog: function(dialog)
    {
        return function(gameState, next)
        {
            dialog.hide();
            next();
        }
    },
    
    showDialog: function(dialog)
    {
        return function(gameState, next)
        {
            dialog.show();
            next();
        }
    },
    
    speechDialog: function(dialog, text)
    {
        return function(gameState, next)
        {
            var dialogActions =
            {
                zActionOnce: function()
                {
                    dialog.hideNextArrow();
                    gameState.input.setActions({});
                    next();
                },
            }
            
            dialog.startWritingText(text, function()
	    {
		dialog.showNextArrow();
		gameState.input.setActions(dialogActions);
	    });
        }
    },
    
    addCharacter: function(charNum, x, y, script)
    {
        return function(gameState, next)
        {
            var char = gameState.world.addCharacter(charNum, x, y);
            gameState.characterScript(char, script);
            next();
        }
    },
    
    removeCharacter: function(charNum)
    {
        return function(gameState, next)
        {
            var char = gameState.world.removeCharacter(charNum);
            next();
        }
    },
}
