// ================================
// 設定
// ================================
let images = [];
// let imageUrls = [];

let currentIndex = 0;
let nextIndex = 1;

let slideDuration = 10000;   // 1枚の表示時間（フェード前）6秒
let fadeDuration = 2000;   // フェード時間 2秒

let slideStart = 0;      // 現在のスライドが始まった時間
let transitionStart = 0;    // フェードが始まった時間
let inTransition = false;

function preload() {
    console.log("imageUrls.length: " + imageUrls.length);
    for (let url of imageUrls) {
        images.push(loadImage(url));
    }
}

// ===== フェードアニメーション用の変数 =====
let thanksText = null;
let quoteAlpha = 0; // 名言の透明度
let fadingIn = true; // フェードイン中か
let lastQuoteTime = 0; // 最後に名言が表示された時刻
const quoteDisplayDuration = 30000; // 表示時間（ミリ秒）：30秒
const quoteFadeDuration = 2000; // フェードイン/アウト時間（ミリ秒）
let textBaseSize = 0; // 基本テキストサイズ

// const DEBUG = false;
const DEBUG = new URLSearchParams(window.location.search).has('debug');
console.log('[Quotes Sketch] Debug mode:', DEBUG);

function pickText() {
    // appreciatesDataは外部ファイル(thanks.js)から読み込まれる
    if (typeof appreciatesData === 'undefined') {
        console.error('appreciatesData is not loaded. Make sure appreciates.js is included before thanks.js');
        thanksText = { text: "引用句が読み込まれていません", author: "システムメッセージ" };
        return;
    }

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();

    // 日付ベースのシード値で、毎日同じ名言が表示される
    //   const seed = y * 10000 + m * 100 + d;
    // const seed = int(random(0, now.getMinutes() * 60 + now.getSeconds())); // テスト用に毎秒変わるシード 
    const seed = random(appreciatesData.length);
    // const index = seed % appreciatesData.length;

    const index = int(seed);
    console.log("appreciate index:", index, seed);

    thanksText = appreciatesData[index];

    if (DEBUG) {
        console.log('[Quote Debug]', {
            date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            seed: seed,
            quoteIndex: index,
            totalQuotes: appreciatesData.length,
            selectedQuote: thanksText
        });
    }
}

function setup() {
    // ★縦サイネージ想定：必要に応じて解像度変更
    // createCanvas(1080, 1920);
    console.log(windowWidth, windowHeight);
    textFont("Noto Sans JP");
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);
    textAlign(CENTER, CENTER);
    textWrap(CHAR); // テキスト折り返しを有効化
    textBaseSize = width * 0.04; // 基本テキストサイズ
    frameRate(30);

    // textSize(64);
    // fill(255);
    // stroke(0);
    // strokeWeight(6);

    slideStart = millis();
    // ================================
    if (DEBUG) {
        console.log('[Setup] Canvas size:', windowWidth, 'x', windowHeight);
    }

    // 今日の言葉を決める
    pickText();
    lastQuoteTime = millis();
    quoteAlpha = 0;
    slideAlpha = 0;
    fadingIn = true;
}

function updateQuoteAlpha() {
    const elapsedTime = millis() - lastQuoteTime;

    // フェードイン処理（最初のfadeDuration時間）
    if (elapsedTime < quoteFadeDuration && fadingIn) {
        quoteAlpha = map(elapsedTime, 0, quoteFadeDuration, 0, 255);
    }
    // 表示時間経過後、フェードアウト開始
    else if (elapsedTime > quoteDisplayDuration - quoteFadeDuration) {
        const fadeOutProgress = map(
            elapsedTime,
            quoteDisplayDuration - quoteFadeDuration,
            quoteDisplayDuration,
            255,
            0
        );
        quoteAlpha = fadeOutProgress;
    }
    // 完全表示期間
    else {
        quoteAlpha = 255;
    }

    // 表示時間を超えたら、新しい名言に切り替え
    if (elapsedTime > quoteDisplayDuration) {
        pickText(); // 同じ日なら同じ名言が選ばれる
        lastQuoteTime = millis();
        quoteAlpha = 0;
        fadingIn = true;
    }
}

function draw() {
    background(0);

    let now = millis();

    // スライド切替判定
    if (!inTransition && now - slideStart > slideDuration) {
        inTransition = true;
        transitionStart = now;
        nextIndex = (currentIndex + 1) % images.length;
    }

    if (!inTransition) {
        // フェード前：現在の画像だけ
        let progress = constrain((now - slideStart) / (slideDuration + fadeDuration), 0, 1);
        drawKenBurns(images[currentIndex], progress, 255);
    } else {
        // フェード中：2枚をクロスフェード
        let f = constrain((now - transitionStart) / fadeDuration, 0, 1);

        let currentProgress = constrain((now - slideStart) / (slideDuration + fadeDuration), 0, 1);
        let nextProgress = constrain((now - transitionStart) / (slideDuration + fadeDuration), 0, 1);

        // 既存スライド（フェードアウト）
        drawKenBurns(images[currentIndex], currentProgress, 255 * (1 - f));
        // 次スライド（フェードイン）
        drawKenBurns(images[nextIndex], nextProgress, 255 * f);

        // フェード終了処理
        if (f >= 1.0) {
            currentIndex = nextIndex;
            // slideStart = now;
            slideStart = now - fadeDuration; // ← フェード中に進んだ分を引いてあげる
            inTransition = false;
        }
    }

    // 上部テキスト（時間帯でメッセージ変更）
    drawTimeBasedMessage();
}

// ================================
// Ken Burns風：ゆっくりズーム（パンなし）
// ================================
function drawKenBurns(img, progress, alpha) {
    if (!img) return;

    // 画像を縦サイネージいっぱいにフィットさせるための基準サイズ
    let aspectCanvas = height / width;
    let aspectImg = img.height / img.width;
    if (frameCount === 1 && DEBUG) {
        console.log('[Ken Burns] Canvas Aspect:', aspectCanvas, 'Image Aspect:', aspectImg);
    }

    let baseW, baseH;
    if (aspectImg < aspectCanvas) {
        // 画像が横長 → 高さ基準
        baseH = height;
        baseW = img.width * (height / img.height);
    } else {
        // 画像が縦長 → 幅基準
        baseW = width;
        baseH = img.height * (width / img.width);
    }

    // progress(0→1)に応じて最大7%くらいズームイン
    // let scale = 1.0 + 0.07 * progress;
    let scale = 1.0 + 0.07 * progress;

    push();
    tint(255, alpha); // フェード用アルファ
    image(
        img,
        width / 2,
        height / 2,
        baseW * scale,
        baseH * scale
    );
    pop();
}

// ================================
// 時間帯でメッセージを変える
// ================================
function drawTimeBasedMessage() {
    // ===== フェードアニメーションの更新 =====
    updateQuoteAlpha();

    // ==== 名言表示 ====
    if (thanksText) {
        // textBaseSizeに基づいた動的な配置
        const padding = textBaseSize * 2.0;
        const lineHeight = textBaseSize * 1.5; // 行間
        const authorSize = textBaseSize * 0.75;
        const authorSpacing = textBaseSize * 0.8; // 著者と名言の間隔

        // 最大ボックスの高さを計算（キャンバスの50%を上限）
        const maxBoxHeight = height * 0.45;
        const quoteBoxWidth = width - padding * 2;

        // テキストサイズ設定
        textSize(textBaseSize);
        textLeading(lineHeight);

        // 名言のテキスト高さを推定
        const estimatedQuoteHeight = textBaseSize * 3.5; // 見積もり高さ
        const estimatedAuthorHeight = authorSize * 1.5;
        const totalEstimatedHeight = estimatedQuoteHeight + authorSpacing + estimatedAuthorHeight;

        // ボックスの実際の高さを決定（最大値を超えない）
        const boxHeight = min(totalEstimatedHeight + textBaseSize, maxBoxHeight);

        // 垂直中央配置用のY位置計算
        const quoteBoxY = height * 0.25;
        const contentTopY = quoteBoxY - boxHeight * 0.35;

        if (DEBUG && frameCount === 1) {
            console.log('[Draw] Quote rendering info:', {
                textBaseSize: textBaseSize,
                padding: padding,
                lineHeight: lineHeight,
                boxHeight: boxHeight,
                maxBoxHeight: maxBoxHeight,
                contentTopY: contentTopY,
                textLength: thanksText.text.length,
                authorLength: thanksText.author.length
            });
        }

        // stroke(100, 255, 100, 200); // 常時表示
        fill(0, quoteAlpha * 0.5);
        // rect(padding, contentTopY, quoteBoxWidth+20, boxHeight+10);
        // dropShadowRect(100, 100, 200, 200, 10);

        // デバッグ表示：背景のボックスを描画（常に表示、フェードしない）
        if (DEBUG) {
            stroke(100, 255, 100, 200); // 常時表示
            noFill();
            rect(padding, contentTopY, quoteBoxWidth, boxHeight);

            // テキスト情報を表示（常に表示、フェードしない）
            fill(100, 255, 100, 255); // 常時表示
            textAlign(LEFT);
            textSize(textBaseSize * 0.5);
            textLeading(textBaseSize * 1.2);
            text(`Quote: "${thanksText.text.substring(0, 20)}..."`, textBaseSize * 0.5, textBaseSize);
            text(`Author: ${thanksText.author}`, textBaseSize * 0.5, textBaseSize * 1.8);
            text(`Alpha: ${Math.round(quoteAlpha)}`, textBaseSize * 0.5, textBaseSize * 2.6);
            text(`Elapsed: ${Math.round((millis() - lastQuoteTime) / 100) / 10}s`, textBaseSize * 0.5, textBaseSize * 3.4);
            textAlign(CENTER);
        }

        // フェードアルファを適用
        noStroke();
        fill(255, quoteAlpha);
        textSize(textBaseSize);
        textLeading(lineHeight);
        text(thanksText.text, padding, contentTopY, quoteBoxWidth, boxHeight * 0.7);

        // 著者
        textSize(authorSize);
        text("— " + thanksText.author, width / 2, contentTopY + boxHeight * 0.75);
    } else {
        // デバッグ：名言が読み込まれていない場合
        if (DEBUG) {
            fill(255, 100, 100);
            textAlign(CENTER);
            textSize(textBaseSize);
            text("Quote not loaded", width / 2, height / 2);
        }
    }
}

function windowResized() {
    console.log('Window resized:', windowWidth, windowHeight);
    resizeCanvas(windowWidth, windowHeight);
}
