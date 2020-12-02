    static title = new Image();
    static body1 = new Image();
    static body2 = new Image();
    static body3 = new Image();
    static food1 = new Image();
    static food2 = new Image();
    static food3 = new Image();
    static food4 = new Image();
    static bonusFood = new Image();
    static woodSign = new Image();
    static pattern1 = new Image();
    static pattern2a = new Image();
    static pattern2b = new Image();
    static pattern2c = new Image();
    static pattern3 = new Image();
    static patternIron = new Image();
    static patternBronze = new Image();

    static gameMusic = new Audio();
    static clickSound = new Audio();
    static highlightSound = new Audio();
    static defeatSound = new Audio();
    static winSound = new Audio();
    static eatSound = new Audio();

    static loadAssets() {
        function loadImage(asset, src) {
            return new Promise(
                (resolve, reject) => {
                    asset.addEventListener(
                        "load",
                        (e) => {
                            resolve();
                        },
                    );
                    asset.addEventListener(
                        "error",
                        (e) => {
                            reject(e.error);
                        },
                    );
                    asset.src = src;
                }
            )
        }
        function loadAudio(asset, src) {
            return new Promise(
                (resolve, reject) => {
                    asset.addEventListener(
                        "canplaythrough",
                        (e) => {
                            resolve();
                        },
                    );
                    asset.addEventListener(
                        "error",
                        (e) => {
                            reject(e.error);
                        },
                    );
                    asset.src = src;
                }
            );
        }
        return Promise.all([
            loadImage(
                Snake.title,
                "resources/Images/Snake/title.png",
            ),
            loadImage(
                Snake.body1,
                "resources/Images/Snake/body1.png",
            ),
            loadImage(
                Snake.body2,
                "resources/Images/Snake/body2.png",
            ),
            loadImage(
                Snake.body3,
                "resources/Images/Snake/body3.png",
            ),
            loadImage(
                Snake.food1,
                "resources/Images/Snake/food1.png",
            ),
            loadImage(
                Snake.food2,
                "resources/Images/Snake/food2.png",
            ),
            loadImage(
                Snake.food3,
                "resources/Images/Snake/food3.png",
            ),
            loadImage(
                Snake.food4,
                "resources/Images/Snake/food4.png",
            ),
            loadImage(
                Snake.bonusFood,
                "resources/Images/Snake/bonusFood.png",
            ),
            loadImage(
                Snake.woodSign,
                "resources/Images/Snake/woodSign.png",
            ),
            loadImage(
                Snake.pattern1,
                "resources/Images/Snake/pattern1.jpg",
            ),
            loadImage(
                Snake.pattern2a,
                "resources/Images/Snake/pattern2a.png",
            ),
            loadImage(
                Snake.pattern2b,
                "resources/Images/Snake/pattern2b.png",
            ),
            loadImage(
                Snake.pattern2c,
                "resources/Images/Snake/pattern2c.png",
            ),
            loadImage(
                Snake.pattern3,
                "resources/Images/Snake/pattern3.jpg",
            ),
            loadImage(
                Snake.patternIron,
                "resources/Images/Snake/ironTexture.jpg",
            ),
            loadImage(
                Snake.patternBronze,
                "resources/Images/Snake/bronzeTexture.jpg",
            ),
            loadAudio(
                Snake.gameMusic,
                "resources/Sound/gameMusic.mp3",
            ),
            loadAudio(
                Snake.clickSound,
                "resources/Sound/click.wav",
            ),
            loadAudio(
                Snake.highlightSound,
                "resources/Sound/highlight.mp3",
            ),
            loadAudio(
                Snake.defeatSound,
                "resources/Sound/defeat.mp3",
            ),
            loadAudio(
                Snake.winSound,
                "resources/Sound/win.mp3",
            ),
            loadAudio(
                Snake.eatSound,
                "resources/Sound/eat.mp3",
            ),
        ]);
    }

