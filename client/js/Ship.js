

Ext.define('Battleship.Ship',{
    TOGGLE          : 60,
    MAX_THRUST      : 2,
    MAX_VELOCITY    : 5,

    image       : null,
    alive       : true,
    shootHeld   : false,
    rtHeld      : false,
    lfHeld      : false,
    fwdHeld     : false,
    rotation    : 0,
    vX          : 0,
    vY          : 0,
    thrust      : 0,

    constructor : function(options){
        var me = this;

        Ext.apply(this,options || {});
        me.initialize();

        this.body = new createjs.Bitmap(this.image);
        this.body.x = -39;

        this.avatar = new createjs.Bitmap(this.avatar);
        this.avatar.scaleX = 0.3;
        this.avatar.scaleY = 0.3;
        this.avatar.x = -10;
        this.avatar.y = -20;

        this.addChild(this.avatar);
        this.addChild(this.body);
        

        var profile = Meteor.user().profile,
            user = Players.findOne({login:profile.login});
        this.currentPlayerId = user._id;
    },

    tick       : function(){
        this.x += this.vX;
        this.y += this.vY;

        //only update for the current user
        if(this.currentPlayerId === this.playerId){
            Players.update(this.playerId,{$set:{
                x : this.x,
                y : this.y,
                rotation : this.rotation
            }});
        }
    },

    accelerate : function(){
        this.thrust += this.thrust + 0.5;

        if(this.thrust >= this.MAX_THRUST) {
            this.thrust = this.MAX_THRUST;
        }

        this.vX += Math.sin(this.rotation*(Math.PI/-180))*this.thrust;
        this.vY += Math.cos(this.rotation*(Math.PI/-180))*this.thrust;

        this.vX = Math.min(this.MAX_VELOCITY, Math.max(-this.MAX_VELOCITY, this.vX));
        this.vY = Math.min(this.MAX_VELOCITY, Math.max(-this.MAX_VELOCITY, this.vY));
    }

},function(){
    Ext.apply(Battleship.Ship.prototype, new createjs.Container());
});