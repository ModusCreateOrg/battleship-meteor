

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
        this.addChild(this.body);
    },

    tick       : function(){
        this.x += this.vX;
        this.y += this.vY;
    },

    accelerate : function(){
        this.thrust += this.thrust + 0.6;

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