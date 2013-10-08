function GameCharacter(id)
{
    var self = this;
    
    this.id = id;
    this.charScriptRunning = true;
    
    return self;
}


function GameState(input, world, map)
{
    var self = this;
    
    this.world = world;
    this.input = input;
    this.map = map;
    this.characters = {};
    
    this.interactionScripts = {};
    
    this.currChar = undefined;
    
    this.repeat = false;
    
    this.runScript = function(script)
    {
        var cur = 0;
        function invoke()
	{
            if (self.repeat)
	    {
                cur = 0;
                self.repeat = false;
            }
            if (cur >= script.length)
	    {
                return;
            }
            setTimeout(function() { script[cur++](self, invoke) },0);
        }
        
        invoke();
    }
    
    this.characterScript = function(character, script)
    {
        var cur = 0;
        function invoke()
	{
            if (self.repeat)
	    {
                cur = 0;
                self.repeat = false;
            }
            if (cur >= script.length)
	    {
                return;
            }
	    
	    self.currChar = character;
	    function resume(args)
	    {
		if (self.characters[character] && self.characters[character].charScriptRunning)
		{
		    setTimeout(function()
		    {
			self.currChar = character;
			script[cur++](self, invoke)
		    },0);
		}
		else
		{
		    setTimeout(function()
		    {
			resume();
		    },0);
		}
	    }
            
	    resume();
        }
        
        invoke();
    }
    
    this.interactionScript = function(interactor, interactee, script)
    {
        var cur = 0;
        function invoke()
	{
            if (self.repeat)
	    {
                cur = 0;
                self.repeat = false;
            }
            if (cur >= script.length)
	    {
                return;
            }
	    
	    self.interactor = interactor;
	    self.interactee = interactee;
	    
	    setTimeout(function()
	    {
		self.interactor = interactor;
		self.interactee = interactee;
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
        },
	function()
        {
            next();
        });
    },
    
    walkRight: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 2, true, function()
        {
            next();
        },
	function()
        {
            next();
        });
    },
    
    walkUp: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 3, true, function()
        {
            next();
        },
	function()
        {
            next();
        });
    },
    
    walkDown: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 0, true, function()
        {
            next();
        },
	function()
        {
            next();
        });
    },
    
    spawnCharacterAtFront: function(charNum, script)
    {
        return function(gameState, next)
	{
	    var front = gameState.world.getFrontOf(gameState.currChar);
	
	    var char = gameState.world.addCharacter(charNum, front.x, front.y);
	    gameState.world.rotateCharacter(char, gameState.world.getCharacterRotation(gameState.currChar));
	    gameState.characterScript(char, script);
	    
	    gameState.characters[char] = new GameCharacter(char);
	    
	    next();
	}
    },
    
    spawnProjectileAtFront: function(charNum, script)
    {
        return function(gameState, next)
	{
	    var front = gameState.world.getFrontOf(gameState.currChar);
	
	    var char = gameState.world.addCharacter(charNum, front.x, front.y, CharacterType.Projectile);
	    gameState.world.rotateCharacter(char, gameState.world.getCharacterRotation(gameState.currChar));
	    gameState.characterScript(char, script);
	    
	    gameState.characters[char] = new GameCharacter(char);
	    
	    next();
	}
    },
    
    setIsFlying: function(gameState, next)
    {
	gameState.world.setMobility(gameState.currChar, Passable.Air);
	next();
    },
    
    setIsNotFlying: function(gameState, next)
    {
	gameState.world.setMobility(gameState.currChar, Passable.Ground);
	next();
    },
    
    walkForward: function(gameState, next)
    {
	gameState.world.moveCharacter(gameState.currChar,
	    gameState.world.getCharacterRotation(gameState.currChar), true, function()
        {
            next();
        },
	function()
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
    
    setOnSomeone: function(script)
    {
        return function(gameState, next)
        {
            gameState.world.setCharacterGroundInteraction(gameState.currChar,
							  function(collidee) { });
            next();
        }
    },
    
    centerCamera: function(gameState, next)
    {
	//console.log(slowness)
	var camera = new MapHeroCamera(gameState.map, gameState.world.getModel(), gameState.currChar);
	gameState.map.setCamera(camera);
	next();
    },
    
    assignDirectionalControl: function(gameState, next)
    {
	function walkAroundActions(theChar)
	{
		this.leftArrowAction = function()
		{
		    gameState.world.moveCharacter(theChar, 1);
		    gameState.world.rotateCharacter(theChar, 1);
		};
		this.rightArrowAction = function()
		{
		    gameState.world.moveCharacter(theChar, 2);
		    gameState.world.rotateCharacter(theChar, 2);
		};
		this.upArrowAction = function()
		{
		    gameState.world.moveCharacter(theChar, 3);
		    gameState.world.rotateCharacter(theChar, 3);
		};
		this.downArrowAction = function()
		{
		    gameState.world.moveCharacter(theChar, 0);
		    gameState.world.rotateCharacter(theChar, 0);
		};
	}
	gameState.input.setActions(new walkAroundActions(gameState.currChar));
	next();
    },

    assignZ: function(script)
    {
	return function(gameState, next)
	{
	    var currActions = gameState.input.getActions();
	    var currChar = gameState.currChar;
	    currActions.zActionOnce = function() { gameState.characterScript(currChar, script); };
	    gameState.input.setActions(currActions);
	    next();
	}
    },
    
    assignX: function(script)
    {
	return function(gameState, next)
	{
	    var currActions = gameState.input.getActions();
	    var currChar = gameState.currChar;
	    currActions.xActionOnce = function() { gameState.characterScript(currChar, script); };
	    gameState.input.setActions(currActions);
	    next();
	}
    },
    
    assignA: function(script)
    {
	return function(gameState, next)
	{
	    var currActions = gameState.input.getActions();
	    var currChar = gameState.currChar;
	    currActions.aActionOnce = function() { gameState.characterScript(currChar, script); };
	    gameState.input.setActions(currActions);
	    next();
	}
    },
    
    assignS: function(script)
    {
	return function(gameState, next)
	{
	    var currActions = gameState.input.getActions();
	    var currChar = gameState.currChar;
	    currActions.sActionOnce = function() { gameState.characterScript(currChar, script); };
	    gameState.input.setActions(currActions);
	    next();
	}
    },
    
    assignInteract: function(script)
    {
        return function(gameState, next)
        {
	    gameState.interactionScripts[gameState.currChar] = script;
	    next();
        }
    },
    
    interact: function(gameState, next)
    {
	var front = gameState.world.getCharacterInFrontOf(gameState.currChar, 1);
	if (gameState.interactionScripts[front])
	{
	    gameState.interactionScript(gameState.currChar, front, gameState.interactionScripts[front]);
	}
	next();
    },
    
    customAction: function(func)
    {
        return function(gameState, next)
        {
	    func(gameState.currChar);
            next();
        }
    },
    
    die: function(gameState, next)
    {
	gameState.world.removeCharacter(gameState.currChar);
	gameState.characters[gameState.currChar] = undefined;
	next();
    }
}

var Interaction =
{
    faceInteractor: function(gameState, next)
    {
	var world = gameState.world;
	var interactorPos = world.getCharacterPosition(gameState.interactor);
	var interacteePos = world.getCharacterPosition(gameState.interactee);
	
	if (interactorPos.x < interacteePos.x) {
	    world.rotateCharacter(gameState.interactee, 1);
	}
	
	if (interactorPos.x > interacteePos.x) {
	    world.rotateCharacter(gameState.interactee, 2);
	}
	
	if (interactorPos.y < interacteePos.y) {
	    world.rotateCharacter(gameState.interactee, 3);
	}
	
	if (interactorPos.y > interacteePos.y) {
	    world.rotateCharacter(gameState.interactee, 0);
	}
	
	next();
    },
    
    pauseInteractee: function(gameState, next)
    {
	gameState.characters[gameState.interactee].charScriptRunning = false;
	next();
    },
    
    resumeInteractee: function(gameState, next)
    {
	gameState.characters[gameState.interactee].charScriptRunning = true;
	next();
    },
    
    die: function(gameState, next)
    {
	gameState.world.removeCharacter(gameState.currChar);
	gameState.characters[gameState.currChar] = undefined;
	next();
    }
};

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
	    var prevActions = gameState.input.getActions();
            var dialogActions =
            {
                aActionOnce: function()
                {
                    dialog.hideNextArrow();
                    gameState.input.setActions(prevActions);
                    next();
                },
            }
            
	    
	    gameState.input.setActions({});
	    
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
	    gameState.characters[char] = new GameCharacter(char);
            next();
        }
    },
    
    removeCharacter: function(charNum)
    {
        return function(gameState, next)
        {
            gameState.world.removeCharacter(charNum);
	    gameState.characters[charNum] = undefined;
            next();
        }
    },
    
    customAction: function(func)
    {
        return function(gameState, next)
        {
	    func();
            next();
        }
    }
}
