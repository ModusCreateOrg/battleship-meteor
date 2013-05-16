

Ext.define('Battleship.Game',{
    requires    : [
        'Battleship.ContentManager'
    ],

    nextBullet  : 0,

    constructor : function(){
        var profile = Meteor.user().profile,
            user = Players.findOne({login:profile.login});

        this.currentPlayer = user;
        Players.update(user._id,{$set:{playing:true}});

        this.callParent();

        Ext.get('header').enableDisplayMode().hide();
        Ext.get('home').enableDisplayMode().hide();
        Ext.get('board').show();

        this.buildUI();

        document.onkeydown = Ext.Function.bind(this.handleKeyDown,this);
        document.onkeyup = Ext.Function.bind(this.handleKeyUp,this);
    },

    buildUI : function(){
        var me = this,
            size = Ext.getBody().getSize();

        me.canvas = Ext.DomHelper.append('board',{
            tag     : 'canvas',
            width   : size.width,
            height  : size.height
        });
        me.stage = new createjs.Stage(me.canvas);

        this.createMessageField();

        Battleship.ContentManager.on('load',this.layout,this);
        Battleship.ContentManager.loadImages([
            {name:'bg',src:'/images/assets/bg.gif'},
            {name:'ship1',src:'/images/assets/ship1.gif'},
            {name:'ship2',src:'/images/assets/ship2.gif'}
        ]);
    },

    layout  : function() {
        var bg = Battleship.ContentManager.get('bg'),
            s = new createjs.Shape();
        s.x=0;s.y=0;
        
        s.graphics.beginBitmapFill(bg,'repeat').drawRect(0,0,this.canvas.width,this.canvas.height);

        this.stage.removeChild(this.messageField);
        this.messageField.text = 'Are you ready? Click to play!';

        this.stage.addChild(s);
        this.stage.addChild(this.messageField);
        this.stage.update();

        this.canvas.onclick = Ext.Function.bind(this.startGame,this);
    },

    createMessageField : function(){
        var me = this;

        me.messageField = new createjs.Text("Loading...", "bold 24px Arial", "#FFFFFF");
        me.messageField.maxWidth = 1000;
        me.messageField.textAlign = "center";
        me.messageField.x = me.canvas.width / 2;
        me.messageField.y = me.canvas.height / 2;
        
        me.stage.addChild(me.messageField);
        me.stage.update();
    },

    startGame : function(){
        var me = this;

        me.stage.removeChild(me.messageField);

        me.player = Ext.create('Battleship.Ship',{
            image : Battleship.ContentManager.get('ship1'),
            avatar: this.currentPlayer.avatar_url,
            playerId : this.currentPlayer._id
        });
        me.player.x = me.canvas.width / 2;
        me.player.y = me.canvas.height / 2;

        me.stage.addChild(me.player);

        //sync the current players
        var playing = Players.find({playing:true});
        me.players = {};

        playing.observeChanges({
            added   : function(id,fields){
                if(id !== me.currentPlayer._id && me.players[id] == null){
                    var p = Players.findOne({_id:id}),
                        ship = Ext.create('Battleship.Ship',{
                        image    : Battleship.ContentManager.get('ship1'),
                        avatar   : p.avatar_url,
                        playerId : id
                    });
                    ship.x = me.canvas.width / 2;
                    ship.y = me.canvas.height / 2;

                    me.stage.addChild(ship);

                    me.players[id] = ship;
                }
            },
            changed : function(id,p){
                if(id !== me.currentPlayer._id){
                    var ship = me.players[id];

                    ship.x = p.x || ship.x;
                    ship.y = p.y || ship.y;
                    ship.rotation = p.rotation || ship.rotation;
                }
            },
            removed  : function(id){
                var ship = me.players[id];
                me.stage.removeChild(ship);
            }
        });

        //start game timer   
        if (!createjs.Ticker.hasEventListener("tick")) { 
            createjs.Ticker.addEventListener("tick", function(){
                me.tick();
            });
        } 

        this.canvas.onclick = null;
    },

    tick    : function() {
        var me = this;

        //handle firing
        if(me.nextBullet <= 0) {
            if(me.player.alive && me.player.shootHeld){
                me.nextBullet = Battleship.Config.BULLET_TIME;
                //fireBullet();
            }
        } else {
            me.nextBullet--;
        }

        //handle turning
        if(me.player.alive && me.player.lfHeld){
            me.player.rotation -= Battleship.Config.TURN_FACTOR;
        } else if(me.player.alive && me.player.rtHeld) {
            me.player.rotation += Battleship.Config.TURN_FACTOR;
        }

        //handle thrust
        if(me.player.alive && me.player.fwdHeld){
            me.player.accelerate();
        }

/*
        //handle new spaceRocks
        if(nextRock <= 0) {
            if(me.player1.alive){
                timeToRock -= DIFFICULTY;   //reduce spaceRock spacing slowly to increase difficulty with time
                var index = getSpaceRock(SpaceRock.LRG_ROCK);
                rockBelt[index].floatOnScreen(canvas.width, canvas.height);
                nextRock = timeToRock + timeToRock*Math.random();
            }
        } else {
            nextRock--;
        }

        //handle ship looping
        if(me.player1.alive && outOfBounds(ship, ship.bounds)) {
            placeInBounds(ship, ship.bounds);
        }

        //handle bullet movement and looping
        for(bullet in bulletStream) {
            var o = bulletStream[bullet];
            if(!o || !o.active) { continue; }
            if(outOfBounds(o, ship.bounds)) {
                placeInBounds(o, ship.bounds);
            }
            o.x += Math.sin(o.rotation*(Math.PI/-180))*BULLET_SPEED;
            o.y += Math.cos(o.rotation*(Math.PI/-180))*BULLET_SPEED;

            if(--o.entropy <= 0) {
                stage.removeChild(o);
                o.active = false;
            }
        }

        //handle spaceRocks (nested in one loop to prevent excess loops)
        for(spaceRock in rockBelt) {
            var o = rockBelt[spaceRock];
            if(!o || !o.active) { continue; }

            //handle spaceRock movement and looping
            if(outOfBounds(o, o.bounds)) {
                placeInBounds(o, o.bounds);
            }
            o.tick();


            //handle spaceRock ship collisions
            if(alive && o.hitRadius(ship.x, ship.y, ship.hit)) {
                alive = false;

                stage.removeChild(ship);
                messageField.text = "You're dead:  Click or hit enter to play again";
                stage.addChild(messageField);
                watchRestart();

                //play death sound
                createjs.Sound.play("death", createjs.Sound.INTERRUPT_ANY);
                continue;
            }

            //handle spaceRock bullet collisions
            for(bullet in bulletStream) {
                var p = bulletStream[bullet];
                if(!p || !p.active) { continue; }

                if(o.hitPoint(p.x, p.y)) {
                    var newSize;
                    switch(o.size) {
                        case SpaceRock.LRG_ROCK: newSize = SpaceRock.MED_ROCK;
                            break;
                        case SpaceRock.MED_ROCK: newSize = SpaceRock.SML_ROCK;
                            break;
                        case SpaceRock.SML_ROCK: newSize = 0;
                            break;
                    }

                    //score
                    if(alive) {
                        addScore(o.score);
                    }

                    //create more
                    if(newSize > 0) {
                        var i;
                        var index;
                        var offSet;

                        for(i=0; i < SUB_ROCK_COUNT; i++){
                            index = getSpaceRock(newSize);
                            offSet = (Math.random() * o.size*2) - o.size;
                            rockBelt[index].x = o.x + offSet;
                            rockBelt[index].y = o.y + offSet;
                        }
                    }

                    //remove
                    stage.removeChild(o);
                    rockBelt[spaceRock].active = false;

                    stage.removeChild(p);
                    bulletStream[bullet].active = false;

                    // play sound
                    createjs.Sound.play("break", createjs.Sound.INTERUPT_LATE, 0, 0.8);
                }
            }
        }
*/
        //call sub ticks
        me.player.tick();
        me.stage.update();
    },

    handleKeyDown : function(e) {
        //cross browser issues exist
        if(!e){ var e = window.event; }
        switch(e.keyCode) {
            case Battleship.Config.KEYCODE_SPACE: this.player.shootHeld = true; return false;
            case Battleship.Config.KEYCODE_A:
            case Battleship.Config.KEYCODE_LEFT:  this.player.lfHeld = true; return false;
            case Battleship.Config.KEYCODE_D:
            case Battleship.Config.KEYCODE_RIGHT: this.player.rtHeld = true; return false;
            case Battleship.Config.KEYCODE_W:
            case Battleship.Config.KEYCODE_UP:    this.player.fwdHeld = true; return false;
            //case KEYCODE_ENTER:  if(canvas.onclick == handleClick){ handleClick(); }return false;
        }
    },

    handleKeyUp : function (e) {
        //cross browser issues exist
        if(!e){ var e = window.event; }
        switch(e.keyCode) {
            case Battleship.Config.KEYCODE_SPACE: this.player.shootHeld = false; break;
            case Battleship.Config.KEYCODE_A:
            case Battleship.Config.KEYCODE_LEFT:  this.player.lfHeld = false; break;
            case Battleship.Config.KEYCODE_D:
            case Battleship.Config.KEYCODE_RIGHT: this.player.rtHeld = false; break;
            case Battleship.Config.KEYCODE_W:
            case Battleship.Config.KEYCODE_UP:    this.player.fwdHeld = false; break;
        }
    }
});