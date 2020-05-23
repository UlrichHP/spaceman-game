var w = 960, h = 600;

var game = new Phaser.Game(w, h, Phaser.AUTO, "game"),
    Main = function () {},
    gameOptions = {
        playSound: true,
        playMusic: true
    },
    soundPlayer,
    musicPlayer;

Main.prototype = {

    preload: function () {
        game.load.image("background", "assets/images/background.png");
        game.load.image("loading",  "assets/images/loading.png");
        game.load.script("polyfill",   "lib/polyfill.js");
        game.load.script("utils",   "lib/utils.js");
        game.load.script("splash",  "assets/js/Splash.js");
    },

    create: function () {
        game.state.add("Splash", Splash);
        game.state.start("Splash");
    }

};

game.state.add("Main", Main);
game.state.start("Main");