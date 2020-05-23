var Splash = function () {};

Splash.prototype = {

    loadScripts: function () {
        game.load.script("style", "lib/style.js");
        game.load.script("mixins", "lib/mixins.js");
        game.load.script("WebFont", "vendor/webfontloader.js");
        game.load.script("Game_Menu","assets/js/game_menu.js");
        game.load.script("Game", "assets/js/game.js");
        game.load.script("Game_Over","assets/js/game_over.js");
        game.load.script("End","assets/js/end.js");
        game.load.script("options", "assets/js/Options.js");
        game.load.script("Hero","assets/js/Hero.js");
        game.load.script("Spider", "assets/js/Spider.js");
    },

    loadBgm: function () {
        game.load.audio("background-music", "assets/bgm/bgm.mp3");
    },

    loadImages: function () {
        game.load.image("background", "assets/images/background.png");
    },

    loadFonts: function () {
        WebFontConfig = {
            custom: {
                families: ["TheMinion"],
                urls: ["assets/css/theminion.css"]
            }
        }
    },

    init: function () {
        this.loadingBar = game.make.sprite(game.world.centerX-(387/2), 400, "loading");
        this.status     = game.make.text(game.world.centerX, 380, "Loading...", {fill: "white"});
        utils.centerGameObjects([this.status]);
    },

    preload: function () {
        game.add.existing(this.loadingBar);
        game.add.existing(this.status);
        this.load.setPreloadSprite(this.loadingBar);

        this.loadScripts();
        this.loadImages();
        this.loadFonts();
        this.loadBgm();

    },

    addGameStates: function () {
        game.state.add("Game_Menu", Game_Menu);
        game.state.add("Game", Game);
        game.state.add("Game_Over", Game_Over);
        game.state.add("End", End);
        game.state.add("Options", Options);
    },

    addGameMusic: function () {
        musicPlayer = game.add.audio("background-music");
        musicPlayer.loop = true;
        musicPlayer.play();
    },

    create: function() {
        this.status.setText("Ready!");
        this.addGameStates();
        this.addGameMusic();

        setTimeout(function () {
            document.body.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // Transition to dark background
            game.state.start("Game_Menu");
        }, 1000);
    }
};
