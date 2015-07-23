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
    this.dialogs = {};
    
    this.currChar = undefined;
    
    this.repeat = false;

    this.label = false;
    this.goto = false;

    var running = true;

    this.collisionScript = {};
    this.hitBySomethingScript = {};

    this.stop = function()
    {
        running = false;
    }

    this.collide = function(curr, other, onEnd)
    {
        var scriptRan = false;

        if (self.collisionScript[curr] !== undefined)
        {
            self.runScript(self.collisionScript[curr], curr, other, onEnd);
            scriptRan = true;
        }

        if (self.hitBySomethingScript[other] !== undefined)
        {
            self.runScript(self.hitBySomethingScript[other], other, curr, onEnd);
            scriptRan = true;
        }

        if (!scriptRan)
        {
            onEnd();
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
            if (!running)
            {
                return;
            }

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
                    }, 0);
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

    turnBackOnInteractor: function(gameState, next)
    {
        var world = gameState.world;
        var interactorPos = world.getCharacterPosition(gameState.currChar);
        var interacteePos = world.getCharacterPosition(gameState.interactee);
        
        if (interactorPos.x < interacteePos.x) {
            world.rotateCharacter(gameState.currChar, 3);
        }
        
        if (interactorPos.x > interacteePos.x) {
            world.rotateCharacter(gameState.currChar, 1);
        }
        
        if (interactorPos.y < interacteePos.y) {
            world.rotateCharacter(gameState.currChar, 0);
        }
        
        if (interactorPos.y > interacteePos.y) {
            world.rotateCharacter(gameState.currChar, 2);
        }
        
        next();
    },
    
    spawnCharacterAtFront: function(charNum, shift, script)
    {
        return function(gameState, next)
    	{
    	    if (gameState.world.getCharacterInFrontOf(gameState.currChar) === undefined)
    	    {
        		var front = gameState.world.getFrontOf(gameState.currChar);
        	    
        		var char = gameState.world.addCharacter(charNum, front.x, front.y, shift);
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
        if (gameState.world.getModel().getCharacter(gameState.currChar))
        {
            gameState.world.moveCharacter(gameState.currChar,
            gameState.world.getCharacterRotation(gameState.currChar), true, function()
            {
                next();
            },
            function(other)
            {
                gameState.collide(gameState.currChar, other, next);
            });
        }
        else
        {
            console.log("walkForward: No such char")
            next();
        }
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
                gameState.world.rotateCharacter(theChar, 3);
    		    gameState.world.moveCharacter(theChar, 3, true, function(){},
                function(other)
                {
                    gameState.collide(theChar, other, function(){});
                });
    		};
    		this.rightArrowAction = function()
    		{
                gameState.world.rotateCharacter(theChar, 1);
    		    gameState.world.moveCharacter(theChar, 1, true, function(){},
                function(other)
                {
                    gameState.collide(theChar, other, function(){});
                });
    		};
    		this.upArrowAction = function()
    		{
                gameState.world.rotateCharacter(theChar, 0);
    		    gameState.world.moveCharacter(theChar, 0, true, function(){},
                function(other)
                {
                    gameState.collide(theChar, other, function(){});
                });
    		};
    		this.downArrowAction = function()
    		{
                gameState.world.rotateCharacter(theChar, 2);
    		    gameState.world.moveCharacter(theChar, 2, true, function(){},
                function(other)
                {
                    gameState.collide(theChar, other, function(){});
                });
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

    assignHitBySomething: function(script)
    {
        return function(gameState, next)
        {
            gameState.hitBySomethingScript[gameState.currChar] = script;
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
    },

    addAnimation: function(name)
    {
        var thename = name;
        return function(gameState, next)
        {
            var charpos = gameState.world.getCharacterPosition(gameState.currChar);
            gameState.world.getModel().addAnimation(thename,charpos.x,charpos.y,charpos.shift);
            next();
        }
    },
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

    turnBackOnInteractor: function(gameState, next)
    {
        var world = gameState.world;
        var interactorPos = world.getCharacterPosition(gameState.currChar);
        var interacteePos = world.getCharacterPosition(gameState.interactee);
        
        if (interactorPos.x < interacteePos.x) {
            world.rotateCharacter(gameState.interactee, 1);
        }
        
        if (interactorPos.x > interacteePos.x) {
            world.rotateCharacter(gameState.interactee, 3);
        }
        
        if (interactorPos.y < interacteePos.y) {
            world.rotateCharacter(gameState.interactee, 2);
        }
        
        if (interactorPos.y > interacteePos.y) {
            world.rotateCharacter(gameState.interactee, 0);
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

    killInteractee: function(gameState, next)
    {
        gameState.world.removeCharacter(gameState.interactee);
        gameState.characters[gameState.interactee] = undefined;
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
    },

    addAnimationOnInteractee: function(name)
    {
        var thename = name;
        return function(gameState, next)
        {
            if (gameState.interactee)
            {
                var charpos = gameState.world.getCharacterPosition(gameState.interactee);
                gameState.world.getModel().addAnimation(thename,charpos.x,charpos.y,charpos.shift);
                next();
            }
            else
            {
                console.log("addAnimationOnInteractee: Warning, no such interactee");
                next();
            }
        }
    },
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

        var theScript = script;
        var numTimes = times;

        return function(gameState, next)
        {
            var count = 0;
            var currChar = gameState.currChar;
            var interactee = gameState.interactee;

            function runTheScript(func)
            {
                gameState.runScript(theScript, currChar, interactee, func);
            }

            function checkEnd()
            {
                count++;
                if (count >= numTimes)
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
        var dialogName = dialog;
        return function(gameState, next)
        {
            var theDialog = gameState.dialogs[dialogName];
            theDialog.hide();
            next();
        }
    },
    
    showDialog: function(dialog)
    {
        var dialogName = dialog;
        return function(gameState, next)
        {
            var theDialog = gameState.dialogs[dialogName];
            theDialog.show();
            next();
        }
    },

    setDialogText: function(dialog, text)
    {
        var dialogName = dialog;
        var theText = text;
        return function(gameState, next)
        {
            var theDialog = gameState.dialogs[dialogName];
            theDialog.setText(theText);
            next();
        }
    },
    
    speechDialog: function(dialog, text)
    {
        var dialogName = dialog;
        return function(gameState, next)
        {
            var theDialog = gameState.dialogs[dialogName];
            theDialog.hideHighlightBox();
	        var prevActions = gameState.input.getActions();

            var dialogActions =
            {
                aActionOnce: function()
                {
                    theDialog.hideNextArrow();
                    gameState.input.setActions(prevActions);
                    next();
                },
            }
	    
	        gameState.input.setActions({});
	    
            theDialog.startWritingText(text, function()
    	    {
        		theDialog.showNextArrow();
        		gameState.input.setActions(dialogActions);
    	    });
        }
    },

    simpleSelectDialog: function(dialog, selectionArray, selectedFunc, selectionChangeFunc, cancellable)
    {
        var dialogName = dialog;
        var isCancellable = cancellable;
        return function(gameState, next)
        {
            var theDialog = gameState.dialogs[dialogName];
            var prevActions = gameState.input.getActions();
            var selection = 0;

            var topDisplay = 0;

            function updateText()
            {
                if (selection - topDisplay < 0)
                {
                    topDisplay = selection;
                }
                if (selection - topDisplay > theDialog.getMaxRows()-1)
                {
                    topDisplay = selection - (theDialog.getMaxRows()-1);
                }

                theDialog.setText(selectionArray.slice(topDisplay, topDisplay + theDialog.getMaxRows() ));
                
                theDialog.setHighlightBox(theDialog.areaGetRow(selection - topDisplay));

                if (selectionArray.length - topDisplay > theDialog.getMaxRows())
                {
                    theDialog.showNextArrow();
                }
                else
                {
                    theDialog.hideNextArrow();
                }

                if (selectionChangeFunc)
                {
                    selectionChangeFunc(selection);
                }
            }

            updateText();


            var dialogActions =
            {
                aActionOnce: function()
                {
                    theDialog.hideNextArrow();
                    gameState.input.setActions(prevActions);
                    selectedFunc(selection);
                    next();
                },

                upActionMatic: function()
                {
                    selection = selection - 1;
                    if (selection < 0) { selection = selectionArray.length - 1; }
                    updateText();

                },

                downActionMatic: function()
                {
                    selection = (selection + 1) % selectionArray.length;
                    updateText();
                }
            }

            if (isCancellable)
            {
                dialogActions.zActionOnce = function()
                {
                    gameState.input.setActions(prevActions);
                    next();
                }
            }

            gameState.input.setActions(dialogActions);
        
        }
    },

    getRotation: function(id, receiveRotationFunc)
    {
        return function(gameState, next)
        {
            receiveRotationFunc(gameState.world.getCharacterRotation(id));
            next();
        }
    },
    
    addCharacter: function(charNum, x, y, shift, script)
    {
        return function(gameState, next)
        {
            var char = gameState.world.addCharacter(charNum, x, y, shift);
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

    addAnimation: function(name, x, y)
    {
        var thename = name;
        var thex = x, they = y;
        return function(gameState, next)
        {
            gameState.world.getModel().addAnimation(thename,thex,they);
            next();
        }
    },
    
    customAction: function(func)
    {
        return function(gameState, next)
        {
            func(gameState);
            next();
        }
    }
}
