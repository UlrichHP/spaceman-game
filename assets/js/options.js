var Options = function(game) {};

Options.prototype = {

    menuConfig: {
        className: "inverse",
        startY: 260,
        startX: "center"
    },

    init: function () {
        this.titleText = game.make.text(game.world.centerX, 100, "Space Man", {
            font: "bold 60pt TheMinion",
            fill: "#FDFFB5",
            align: "center"
        });
        this.titleText.setShadow(3, 3, "rgba(0,0,0,0.5)", 5);
        this.titleText.anchor.set(0.5);
        this.optionCount = 1;
    },

    addMenuOption: function (text, callback) {
        var optionStyle = { font: "30pt TheMinion", fill: "white", align: "left", stroke: "rgba(0,0,0,0)", srokeThickness: 4};
        var txt = game.add.text(game.world.centerX, (this.optionCount * 80) + 300, text, optionStyle);
        txt.anchor.setTo(0.5);
        txt.stroke = "rgba(0,0,0,0)";
        txt.strokeThickness = 4;
        var onOver = function (target) {
            target.fill = "#FEFFD5";
            target.stroke = "rgba(200,200,200,0.5)";
            txt.useHandCursor = true;
        };
        var onOut = function (target) {
            target.fill = "white";
            target.stroke = "rgba(0,0,0,0)";
            txt.useHandCursor = false;
        };
        txt.inputEnabled = true;
        txt.events.onInputUp.add(callback, this);
        txt.events.onInputOver.add(onOver, this);
        txt.events.onInputOut.add(onOut, this);
    
        this.optionCount ++;
    },
    
    create: function () {
        var playMusic = gameOptions.playMusic, playSound = gameOptions.playSound;

        game.add.sprite(0, 0, "background");
        game.add.existing(this.titleText);
        this.addMenuOption(playMusic ? "Mute Music" : "Play Music", function (target) {
            playMusic = !playMusic;
            target.text = playMusic ? "Mute Music" : "Play Music";
            musicPlayer.volume = playMusic ? 1 : 0;
        });
        /*this.addMenuOption(playSound ? "Mute Sound" : "Play Sound", function (target) {
            playSound = !playSound;
            target.text = playSound ? "Mute Sound" : "Play Sound";
        });*/
        this.addMenuOption("Back", function () {
            game.state.start("Game_Menu", true, false, {stateSound: playSound});
        });
    }
};

Phaser.Utils.mixinPrototype(Options.prototype, mixins);
