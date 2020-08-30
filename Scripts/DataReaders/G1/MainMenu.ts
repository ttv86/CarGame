////// Start game engine
////async function startMenu() {
////    try {
////        const fontFiles = [
////            "F_MHEAD.FON",
////            "F_MTEXT.FON",
////            "F_MMISS.FON",

////            "F_KEY.FON",
////            "F_CITY1.FON",
////            "F_CITY2.FON",
////            "F_CITY3.FON",
////            "F_CITY4.FON",
////]
////        const imageFiles = [
////            {
////                "file": "F_LOGO0.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO1.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO2.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO3.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO4.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO5.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO6.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO7.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOWER0.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOWER1.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_PLAY1.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY2.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY3.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY4.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY5.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY6.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY7.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY8.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAYN.RAW",
////                "width": 180
////            },
////            //{
////            //    "file": "F_UPPER.RAW",
////            //    "width": 640
////            //}
////        ];

////        // Start loading processes
////        const imagePromise = Promise.all(imageFiles.map(f => loadFile(f.file).then(x => loadRawImage(x, f.width))));
////        const fontPromise = Promise.all(fontFiles.map(f => loadFile(f).then(x => new Font(x))));
////        const textsPromise = loadFile("ENGLISH.FXT").then(x => new TextContainer(x));

////        // Wait here until both loading processes are finished.
////        const images = await imagePromise;
////        const fonts = await fontPromise;
////        const texts = await textsPromise;

////        const canvas = document.createElement("canvas");
////        canvas.style.width = "100vw";
////        canvas.style.height = "100vh";
////        document.body.appendChild(canvas);
////        canvas.width = window.innerWidth;
////        canvas.height = window.innerHeight;

////        const menu = new MainMenu(canvas, {
////            titleAnimation: [images[0], images[1], images[2], images[3], images[4], images[5], images[6], images[7]],
////            backgroundWithoutMap: images[8],
////            backgroundWithMap: images[9],
////            playerImages: [images[10], images[11], images[12], images[13], images[14], images[15], images[16], images[17]],
////            playerNameBox: images[18],
////            bigFont: fonts[0],
////            midFont: fonts[1],
////            smallFont: fonts[2],
////            keyFont: fonts[3],
////            texts
////        });

////        window.addEventListener("keydown", (ev) => menu.keyDown(ev.keyCode));
////        window.addEventListener("keyup", (ev) => menu.keyUp(ev.keyCode));

////        window.addEventListener("resize", () => menu.resized());

////        let prev = 0;
////        function step(time: number) {
////            // Update menu
////            menu.update((time - prev) / 1000);

////            // Then render current state.
////            menu.render();

////            // Finally request next frame.
////            prev = time;
////            requestAnimationFrame(step);
////        }

////        step(prev);
////    } catch (error) {
////        console.error(error);
////        alert(`Error happened: ${error?.message ?? error.toString}`);
////    }
////}