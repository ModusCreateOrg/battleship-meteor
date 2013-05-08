
Template.user_loggedout.events({
    'click #login' : loginFn
});

Template.main.events({
    'click #login_btn' : loginFn,
    'click #play_btn' : startGame
});

Template.user_loggedin.events({
    'click #logout' : function(){
        var username = Meteor.user().profile.login;
        Meteor.logout(function(err){
            if(err){

            }else{
                var user = Players.findOne({login:username});
                Players.remove(user._id);
            }
        });  
    }
});

Template.players.available_players = function(){
    return Players.find({playing:false},{sort:{name:1}});
}

Template.players.unavailable_players = function(){
    return Players.find({playing:true},{sort:{name:1}});
}

Template.players.displayName = function(){
    return this.name || this.login;
}

function loginFn(){
    Meteor.loginWithGithub({
        requestPermissions : ['user','public_repo']
    },function(err){
        if(err){
            //error handling
        }else{
            var profile = Meteor.user().profile,
                user = Players.findOne({login:profile.login});
            
            if(!user){ //insert the player only once
                profile.playing = false;
                Players.insert(profile);
            }
        }
    });
}

function startGame(){
    Ext.create('Battleship.Game');
}