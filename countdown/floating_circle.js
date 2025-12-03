// ===== フローティングサークルアニメーション =====
// 別ファイルで管理される浮遊する円のアニメーション

let circleX, circleY;
let targetX, targetY;
let circleSize;
let targetSize;
let circleTime = 0;
let baseCircleSize;

function initFloatingCircle() {
  baseCircleSize = Math.min(width, height) * 0.3;
  circleX = width / 2;
  circleY = height / 2;
  targetX = width / 2;
  targetY = height / 2;
  circleSize = baseCircleSize;
  targetSize = baseCircleSize;
}

function updateFloatingCircle() {
  circleTime += 0.01;

  // Pick new target occasionally
  if (frameCount % 120 === 0) {
    targetX = random(width * 0.2, width * 0.8);
    targetY = random(height * 0.2, height * 0.8);
    targetSize = random(baseCircleSize * 0.75, baseCircleSize * 1.75);
  }

  // Smooth movement toward target
  circleX += (targetX - circleX) * 0.05;
  circleY += (targetY - circleY) * 0.05;
  circleSize += (targetSize - circleSize) * 0.04;
}

function drawFloatingCircle() {
  // Add gentle sway
  let swayX = sin(circleTime * 0.5) * 30;
  let swayY = cos(circleTime * 0.4) * 20;

  // Draw faint circle
  fill(255, 255, 255, 25);
  noStroke();
  ellipse(circleX + swayX, circleY + swayY, circleSize);

  // Subtle blur/glow effect with multiple faint circles
  fill(255, 255, 255, 10);
  for (let i = 1; i <= 3; i++) {
    ellipse(
      circleX + swayX,
      circleY + swayY,
      circleSize + i * 20
    );
  }
}
