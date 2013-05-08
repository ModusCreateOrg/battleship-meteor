

Ext.define('Battleship.Config',{
    singleton : true,

    DIFFICULTY      : 2,         //how fast the game gets mor difficult
    ROCK_TIME       : 110,        //aprox tick count until a new asteroid gets introduced
    SUB_ROCK_COUNT  : 4,     //how many small rocks to make on rock death
    BULLET_TIME     : 5,        //ticks between bullets
    BULLET_ENTROPY  : 100,   //how much energy a bullet has before it runs out.

    TURN_FACTOR     : 7,        //how far the ship turns per frame
    BULLET_SPEED    : 17,      //how fast the bullets move

    KEYCODE_ENTER : 13,     //usefull keycode
    KEYCODE_SPACE : 32,     //usefull keycode
    KEYCODE_UP : 38,        //usefull keycode
    KEYCODE_LEFT : 37,      //usefull keycode
    KEYCODE_RIGHT : 39,     //usefull keycode
    KEYCODE_W : 87,         //usefull keycode
    KEYCODE_A : 65,         //usefull keycode
    KEYCODE_D : 68         //usefull keycode
});