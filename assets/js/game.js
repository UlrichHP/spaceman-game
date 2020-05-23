const LEVEL_COUNT = 3;

var Game = {

    preload: function () {
        for (i = 0; i < LEVEL_COUNT; i++) {
            this.game.load.json("level:" + i, "assets/data/level0" + i + ".json");
        }

        this.game.load.image("background", "assets/images/background.png");
        this.game.load.image("invisible-wall", "assets/images/invisible_wall.png");
        this.game.load.image("ground", "assets/images/ground.png");
        this.game.load.image("grass:8x1", "assets/images/grass_8x1.png");
        this.game.load.image("grass:6x1", "assets/images/grass_6x1.png");
        this.game.load.image("grass:4x1", "assets/images/grass_4x1.png");
        this.game.load.image("grass:2x1", "assets/images/grass_2x1.png");
        this.game.load.image("grass:1x1", "assets/images/grass_1x1.png");
        this.game.load.image("icon:coin", "assets/images/coin_icon.png");
        this.game.load.image("font:numbers", "assets/images/numbers.png");
        this.game.load.image("key", "assets/images/key.png");
        this.game.load.image("icon:hero", "assets/images/hero_stopped.png");

        this.game.load.audio("sfx:jump", "assets/audio/jump.wav");
        this.game.load.audio("sfx:coin", "assets/audio/coin.wav");
        this.game.load.audio("sfx:stomp", "assets/audio/stomp.wav");
        this.game.load.audio("sfx:key", "assets/audio/key.wav");
        this.game.load.audio("sfx:door", "assets/audio/door.wav");

        this.game.load.spritesheet("hero", "assets/images/hero.png", 36, 42);
        this.game.load.spritesheet("coin", "assets/images/coin_animated.png", 22, 22);
        this.game.load.spritesheet("spider", "assets/images/spider.png", 42, 32);
        this.game.load.spritesheet("door", "assets/images/door.png", 42, 66);
        this.game.load.spritesheet("icon:key", "assets/images/key_icon.png", 34, 30);
        this.game.load.spritesheet("decor", "assets/images/decor.png", 42, 42);
    },

    create: function () {

        this.game.camera.flash(0x000000, 2000); // Fade In Effect

        // create sound entities
        this.sfx = {
            key: this.game.add.audio("sfx:key"),
            door: this.game.add.audio("sfx:door"),
            jump: this.game.add.audio("sfx:jump"),
            coin: this.game.add.audio("sfx:coin"),
            stomp: this.game.add.audio("sfx:stomp")
        };

        this.game.add.image(0, 0, "background");
        this.game.state.add("Hero", Hero);
        this.game.state.add("Spider", Spider);
        this.game.state.add("Game_Over", Game_Over);
        this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
        this._createHud();

        this.playMusic();
        this.playSound();
        this.pause();

        if (soundPlayer != undefined) {
            this.sfx.key.volume = soundPlayer ? 1 : 0;
            this.sfx.door.volume = soundPlayer ? 1 : 0;
            this.sfx.jump.volume = soundPlayer ? 1 : 0;
            this.sfx.coin.volume = soundPlayer ? 1 : 0;
            this.sfx.stomp.volume = soundPlayer ? 1 : 0;
        }
    },

    _loadLevel: function (data) {
        // create all the groups/layers that we need
        this.bgDecoration = this.game.add.group();
        this.platforms = this.game.add.group();
        this.coins = this.game.add.group();
        this.spiders = this.game.add.group();
        this.enemyWalls = this.game.add.group();
        this.enemyWalls.visible = false;
    
        // spawn all platforms
        data.platforms.forEach(this._spawnPlatform, this);

        // spawn all decorations
        data.decoration.forEach(this._spawnDecorations, this);
    
        // spawn hero and enemies
        this._spawnCharacters({hero: data.hero, spiders: data.spiders});
        // spawn important objects
        data.coins.forEach(this._spawnCoin, this);
    
        this._spawnDoor(data.door.x, data.door.y);
        this._spawnKey(data.key.x, data.key.y);
    
        // enable gravity
        const GRAVITY = 1200;
        this.game.physics.arcade.gravity.y = GRAVITY;
    },
    
    _createHud: function () {
        const NUMBERS_STR = "0123456789X ";
        this.coinFont = this.game.add.retroFont("font:numbers", 20, 26, NUMBERS_STR, 6);
        
        this.keyIcon = this.game.make.image(0, 19, "icon:key");
        this.keyIcon.anchor.set(0, 0.5);
    
        let coinIcon = this.game.make.image(this.keyIcon.width + 20, 0, "icon:coin");
        let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width, coinIcon.height / 2, this.coinFont);
        coinScoreImg.anchor.set(0, 0.5);

        this.livesFont = this.game.add.retroFont("font:numbers", 20, 26, NUMBERS_STR, 6);
        let heroIcon = this.game.make.image(coinScoreImg.width + 150, 0, "icon:hero");
        let livesScore = this.game.make.image(heroIcon.x + heroIcon.width, heroIcon.height / 2, this.livesFont);
        livesScore.anchor.set(0, 0.5);

        this.hud = this.game.add.group();
        this.hud.position.set(10, 10);

        this.hud.add(coinIcon);
        this.hud.add(coinScoreImg);
        this.hud.add(this.keyIcon);
        this.hud.add(heroIcon);
        this.hud.add(livesScore);
    },
    
    _spawnDoor: function (x, y) {
        this.door = this.bgDecoration.create(x, y, "door");
        this.door.anchor.setTo(0.5, 1);
        this.game.physics.enable(this.door);
        this.door.body.allowGravity = false;
    },
    
    _spawnKey: function (x, y) {
        this.key = this.bgDecoration.create(x, y, "key");
        this.key.anchor.set(0.5, 0.5);
        this.game.physics.enable(this.key);
        this.key.body.allowGravity = false;
    
        // add a small "up & down" animation via a tween
        this.key.y -= 3;
        this.game.add.tween(this.key)
            .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .loop()
            .start();
    },
    
    _spawnPlatform: function (platform) {
        let sprite = this.platforms.create(platform.x, platform.y, platform.image);
        this.game.physics.enable(sprite);
        sprite.body.allowGravity = false;
        sprite.body.immovable = true;
    
        this._spawnEnemyWall(platform.x, platform.y, "left");
        this._spawnEnemyWall(platform.x + sprite.width, platform.y, "right");
    },

    _spawnDecorations: function (decoration) {
        this.decor = this.bgDecoration.create(decoration.x, decoration.y, "decor", decoration.frame);
        this.game.physics.enable(this.decor);
        this.decor.body.allowGravity = false;
        this.decor.body.immovable = true;
    },
    
    _spawnEnemyWall: function (x, y, side) {
        let sprite = this.enemyWalls.create(x, y, "invisible-wall");
        // anchor and y displacement
        sprite.anchor.set(side === "left" ? 1 : 0, 1);
    
        // physic properties
        this.game.physics.enable(sprite);
        sprite.body.immovable = true;
        sprite.body.allowGravity = false;
    },
    
    _spawnCharacters: function (data) {
        // spawn hero
        this.hero = new Hero(this.game, data.hero.x, data.hero.y);
        this.game.add.existing(this.hero);
    
        // spawn spiders
        data.spiders.forEach(function (spider) {
            let sprite = new Spider(this.game, spider.x, spider.y);
            this.spiders.add(sprite);
        }, this);
    },
    
    _spawnCoin: function (coin) {
        let sprite = this.coins.create(coin.x, coin.y, "coin");
        sprite.anchor.set(0.5, 0.5);
    
        sprite.animations.add("rotate", [0, 1, 2, 1], 6, true); // 6fps, looped
        sprite.animations.play("rotate");
    
        this.game.physics.enable(sprite);
        sprite.body.allowGravity = false;
    },
    
    init: function (data) {
        this.game.renderer.renderSession.roundPixels = true;
        this.keys = this.game.input.keyboard.addKeys({
            left: Phaser.KeyCode.LEFT,
            right: Phaser.KeyCode.RIGHT,
            up: Phaser.KeyCode.UP
        });
        this.keys.up.onDown.add(function () {
            let didJump = this.hero.jump();
            if (didJump) {
                this.sfx.jump.play();
            }
        }, this);
        this.lives = data.lives ? data.lives : 3;
        this.coinPickupCount = data.coinPickupCount ? data.coinPickupCount : 0;
        this.hasKey = false;
        this.level = (data.level || 0) % LEVEL_COUNT;
    },
    
    _handleCollisions: function () {
        this.game.physics.arcade.collide(this.hero, this.platforms);
        this.game.physics.arcade.collide(this.spiders, this.platforms);
        this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
        this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin, null, this);
        this.game.physics.arcade.overlap(this.hero, this.spiders, this._onHeroVsEnemy, null, this);
        this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey, null, this);
    
        this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
            // ignore if there is no key or the player is on air
            function (hero, door) {
                return this.hasKey && hero.body.touching.down;
            }, this);
    },
    
    _onHeroVsCoin: function (hero, coin) {
        this.sfx.coin.play();
        coin.kill();
        this.coinPickupCount++;
    },
    
    _onHeroVsEnemy: function (hero, enemy) {
        if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
            hero.bounce();
            enemy.die();
            this.sfx.stomp.play();
            
        } else { // game over || restart level
            this.sfx.stomp.play();
            this.lives--;
            this.coinPickupCount = Math.round(this.coinPickupCount/2); // arrondi au chiffre du dessus pour les nombres impairs

            if (this.lives == 0) {
                this.game.state.start("Game_Over");
            } else {
                this.game.state.restart(true, false, {level: this.level, lives: this.lives, coinPickupCount: this.coinPickupCount });
            }
        }
    },
    
    _onHeroVsKey: function (hero, key) {
        this.sfx.key.play();
        key.kill();
        this.hasKey = true;
    },
    
    _onHeroVsDoor: function (hero, door) {
        this.sfx.door.play();

        this.door.animations.add("open", [1]);
        this.door.animations.play("open");

        if (this.level == LEVEL_COUNT - 1) {
            this.game.state.start("End");
        } else {
            this.game.state.restart(true, false, { level: this.level + 1, lives: this.lives, coinPickupCount: this.coinPickupCount });
        }
    },
    
    update: function () {
        this._handleCollisions();
        this._handleInput();
        this.coinFont.text = `x${this.coinPickupCount}`;
        this.livesFont.text = `x${this.lives}`;
        this.keyIcon.frame = this.hasKey ? 1 : 0;

        if (this.coinPickupCount == 30) { // Add a Life when you collect 30 Coins
            this.lives += 1;
            this.coinPickupCount = 0;
        }
    },
    
    _handleInput: function () {
        if (this.keys.left.isDown) { // move hero left
            this.hero.move(-1);
        } else if (this.keys.right.isDown) { // move hero right
            this.hero.move(1);
        } else { // stop
            this.hero.move(0);
        }
    },

    pause: function () {
        pause_label = this.game.add.text(w - 100, 20, "Pause", { font: "24px TheMinion", fill: "#fff" });
        pause_label.stroke = "rgba(0,0,0,0)";
        pause_label.strokeThickness = 4;
        var onOver = function (target) {
            target.fill = "#FEFFD5";
            target.stroke = "rgba(200,200,200,0.5)";
            pause_label.useHandCursor = true;
        };
        var onOut = function (target) {
            target.fill = "white";
            target.stroke = "rgba(0,0,0,0)";
            pause_label.useHandCursor = false;
        };
        pause_label.events.onInputOver.add(onOver, this);
        pause_label.events.onInputOut.add(onOut, this);
        pause_label.inputEnabled = true;
        pause_label.events.onInputUp.add(function () {
            // When the pause button is pressed, we pause the game
            this.game.paused = true;

            choiceLabel = this.game.add.text(w/2, h/2, "Click to continue", { font: "30px Arial", fill: "#fff" });
            choiceLabel.anchor.setTo(0.5, 0.5);
        }, this);

        this.game.input.onDown.add(function () {
            if (this.game.paused) {
                choiceLabel.destroy();
                this.game.paused = false;
            }
        }, this);
    },

    playMusic: function () {
        music_label = this.game.add.text(w - 300, 20, "Music", { font: "24px TheMinion", fill: "#fff" });
        music_label.stroke = "rgba(0,0,0,0)";
        music_label.strokeThickness = 4;
        var onOver = function (target) {
            target.fill = "#FEFFD5";
            target.stroke = "rgba(200,200,200,0.5)";
            music_label.useHandCursor = true;
        };
        var onOut = function (target) {
            target.fill = "white";
            target.stroke = "rgba(0,0,0,0)";
            music_label.useHandCursor = false;
        };
        music_label.events.onInputOver.add(onOver, this);
        music_label.events.onInputOut.add(onOut, this);
        music_label.inputEnabled = true;
        music_label.events.onInputUp.add(function () {
            // When the music button is pressed, we stop/resume the music
            pMusic = !musicPlayer.volume;
            musicPlayer.volume = pMusic ? 1 : 0;
        }, this);
    },

    playSound: function () {
        sound_label = this.game.add.text(w - 200, 20, "Sound", { font: "24px TheMinion", fill: "#fff" });
        sound_label.stroke = "rgba(0,0,0,0)";
        sound_label.strokeThickness = 4;
        var onOver = function (target) {
            target.fill = "#FEFFD5";
            target.stroke = "rgba(200,200,200,0.5)";
            sound_label.useHandCursor = true;
        };
        var onOut = function (target) {
            target.fill = "white";
            target.stroke = "rgba(0,0,0,0)";
            sound_label.useHandCursor = false;
        };
        sound_label.events.onInputOver.add(onOver, this);
        sound_label.events.onInputOut.add(onOut, this);
        sound_label.inputEnabled = true;
        sound_label.events.onInputUp.add(function () {
            // When the sound button is pressed, we stop/resume the sounds
            pSound = !this.sfx.key.volume;
            soundPlayer = pSound;

            this.sfx.key.volume = pSound ? 1 : 0;
            this.sfx.door.volume = pSound ? 1 : 0;
            this.sfx.jump.volume = pSound ? 1 : 0;
            this.sfx.coin.volume = pSound ? 1 : 0;
            this.sfx.stomp.volume = pSound ? 1 : 0;
        }, this);
    }

};
