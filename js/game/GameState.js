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
    
    this.runScripts = {};
    
    this.currChar = undefined;
    
    this.repeat = false;

    this.label = false;
    this.goto = false;

    this.collisionScript = {};

    this.collide = function(curr, other, onEnd)
    {
        if (self.collisionScript[curr] !== undefined)
        {
            self.runScript(self.collisionScript[curr], curr, other, onEnd);
        }

        if (self.collisionScript[other] !== undefined)
        {
            self.runScript(self.collisionScript[other], curr, other, onEnd);
        }
    }

    this.runScript = function(script, interactor, interactee, onEnd)
    {
        var labels = {};
        var cur = 0;

        var strippedScript = [];
        var i=0;
        for (i=0; i<script.length; i++)
        {
            if (typeof script[i] === "string")
            {
                labels[script[i]] = i;
                strippedScript.push(Script.nop);
            }
            else
            {
                strippedScript.push(script[i]);
            }
        }

        script = strippedScript;

        function invoke()
	    {
            if (self.label)
            {
                labels[self.label] = cur;
                self.label = false;
            }

            if (self.goto)
            {
                if (labels[self.goto])
                {
                    cur = labels[self.goto];
                }
                else
                {
                    console.log("Unknown label: " + self.goto);
                }
                self.goto = false;
            }

            if (self.repeat)
	        {
                cur = 0;
                self.repeat = false;
            }

            if (cur >= script.length)
	        {
                if (onEnd)
                {
                    onEnd();
                }

                return;
            }
	    
    	    self.currChar = interactor;
    	    self.interactee = interactee;

            function resume(args)
            {
                if (!interactor || (self.characters[interactor] && self.characters[interactor].charScriptRunning))
                {
                    setTimeout(function()
                    {
                        self.currChar = interactor;
                        self.interactee = interactee;
                        script[cur++](self, invoke)
                    }, 0);
                }
                else
                {
                    setTimeout(function()
                    {
                        resume();
                    }, 100);
                }
            }
            
            resume();
        }
        
        invoke();
    }
}

var Character =
{
    walkLeft: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 3, true, function()
        {
            next();
        },
	    function(other)
        {
            gameState.collide(gameState.currChar, other, next);
        });
    },
    
    walkRight: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 1, true, function()
        {
            next();
        },
	    function(other)
        {
            gameState.collide(gameState.currChar, other, next);
        });
    },
    
    walkUp: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 0, true, function()
        {
            next();
        },
	    function(other)
        {
            gameState.collide(gameState.currChar, other, next);
        });
    },
    
    walkDown: function(gameState, next)
    {
        gameState.world.moveCharacter(gameState.currChar, 2, true, function()
        {
            next();
        },
	    function(other)
        {
            gameState.collide(gameState.currChar, other, next);
        });
    },
    
    spawnCharacterAtFront: function(charNum, script)
    {
        return function(gameState, next)
    	{
    	    if (gameState.world.getCharacterInFrontOf(gameState.currChar) === undefined)
    	    {
        		var front = gameState.world.getFrontOf(gameState.currChar);
        	    
        		var char = gameState.world.addCharacter(charNum, front.x, front.y);
        		gameState.world.rotateCharacter(char, gameState.world.getCharacterRotation(gameState.currChar));
        		gameState.runScript(script, char);
        		
        		gameState.characters[char] = new GameCharacter(char);
    	    }
    	    
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
    		    gameState.world.moveCharacter(theChar, 3);
    		    gameState.world.rotateCharacter(theChar, 3);
    		};
    		this.rightArrowAction = function()
    		{
    		    gameState.world.moveCharacter(theChar, 1);
    		    gameState.world.rotateCharacter(theChar, 1);
    		};
    		this.upArrowAction = function()
    		{
    		    gameState.world.moveCharacter(theChar, 0);
    		    gameState.world.rotateCharacter(theChar, 0);
    		};
    		this.downArrowAction = function()
    		{
    		    gameState.world.moveCharacter(theChar, 2);
    		    gameState.world.rotateCharacter(theChar, 2);
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
    	    currActions.zActionOnce = function() { gameState.runScript(script, currChar); };
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
    	    currActions.xActionOnce = function() { gameState.runScript(script, currChar); };
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
    	    currActions.aActionOnce = function() { gameState.runScript(script, currChar); };
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
    	    currActions.sActionOnce = function() { gameState.runScript(script, currChar); };
    	    gameState.input.setActions(currActions);
    	    next();
    	}
    },
    
    assignInteract: function(script)
    {
        return function(gameState, next)
        {
    	    gameState.runScripts[gameState.currChar] = script;
    	    next();
        }
    },

    assignCollide: function(script)
    {
        return function(gameState, next)
        {
            gameState.collisionScript[gameState.currChar] = script;
            next();
        }
    },
    
    interact: function(gameState, next)
    {
    	var front = gameState.world.getCharacterInFrontOf(gameState.currChar, 1);
    	if (gameState.runScripts[front])
    	{
    	    gameState.runScript(gameState.runScripts[front], gameState.currChar, front);
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
    },

    getCharPos: function(receiverFunction)
    {
        return function(gameState, next)
        {
            var world = gameState.world;
            var interactorPos = world.getCharacterPosition(gameState.currChar);
            receiverFunction(interactorPos.x, interactorPos.y);
            next();
        }
    },

    getCharId: function(receiverFunction)
    {
        return function(gameState, next)
        {
            receiverFunction(gameState.currChar);
            next();
        }
    }
}

var Interaction =
{
    faceInteractor: function(gameState, next)
    {
    	var world = gameState.world;
    	var interactorPos = world.getCharacterPosition(gameState.currChar);
    	var interacteePos = world.getCharacterPosition(gameState.interactee);
    	
    	if (interactorPos.x < interacteePos.x) {
    	    world.rotateCharacter(gameState.interactee, 3);
    	}
    	
    	if (interactorPos.x > interacteePos.x) {
    	    world.rotateCharacter(gameState.interactee, 1);
    	}
    	
    	if (interactorPos.y < interacteePos.y) {
    	    world.rotateCharacter(gameState.interactee, 0);
    	}
    	
    	if (interactorPos.y > interacteePos.y) {
    	    world.rotateCharacter(gameState.interactee, 2);
    	}
    	
    	next();
    },
    
    getInteracteeId: function(receiverFunction)
    {
        return function(gameState, next)
        {
            receiverFunction(gameState.interactee);
            next();
        }
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
    nop: function(gameState, next)
    {
        next();
    },

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

    label: function(label)
    {
        return label;
    },

    goto: function(label)
    {
        return function(gameState, next)
        {
            gameState.goto = label;
            next();
        }
    },

    do: function(someFunction)
    {
        return function(gameState, next)
        {
            someFunction();
            next();
        }
    },

    doWait: function(someFunction)
    {
        return function(gameState, next)
        {
            someFunction(next);
        }
    },

    gotoif: function(label, predicateFunction)
    {
        return function(gameState, next)
        {
            if (predicateFunction())
            {
                gameState.goto = label;
            }
            next();
        }
    },

    run: function(times, script)
    {
        if (Array.isArray(times))
        {
            script = times;
            times = 1;
        }

        return function(gameState, next)
        {
            var count = 0;
            var currChar = gameState.currChar;
            var interactee = gameState.interactee;

            function runTheScript(func)
            {
                gameState.runScript(script, currChar, interactee, func);
            }

            function checkEnd()
            {
                count++;
                if (count >= times)
                {
                    next();
                }
                else
                {
                    setTimeout(function()
                    {
                        runTheScript(checkEnd);
                    }, 0);
                }
            }

            runTheScript(checkEnd);
        }
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

            console.log("dd " + text);
            console.log(prevActions);
            var dialogActions =
            {
                aActionOnce: function()
                {
                    console.log("bb " + text);
                    console.log(prevActions);
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
            gameState.runScript(script, char);
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
