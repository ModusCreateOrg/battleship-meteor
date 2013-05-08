
Ext.define('Battleship.ContentManager',{
    extend    : 'Ext.util.Observable',
    singleton : true,

    constructor: function(){
        this.callParent();

        this.content = {};
        this.size = 0;
    },

    get        : function(name){
        return this.content[name];
    },

    loadImages : function(images){
        this.loaded = 0;
        this.toLoad = images.length;
        for(var i=0,len=images.length;i<len;i++){
            this.createImage(images[i]);
        }
    },

    createImage : function(config){
        var img = new Image();
        img.src = config.src;
        img.onload = Ext.Function.bind(this.onLoad,this);
        img.onerror = Ext.Function.bind(this.onError,this);

        this.content[config.name] = img;
        this.size++;
    },

    onLoad      : function(){
        this.loaded++;

        if(this.loaded === this.toLoad){
            this.fireEvent('load');
        }
    },

    onError      : function(e){
        this.fireEvent('loadexception',e,e.target.src);
    }
});