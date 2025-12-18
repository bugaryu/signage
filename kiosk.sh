#!/bin/bash

# 1. 基準ディレクトリに移動（URLのパスと合わせるため）
cd /home/dietpi/workspace/signage-p5

# 2. 画面回転
xrandr --output HDMI-1 --rotate right

sleep 1
lxterminal &

# 3. ターミナルを起動し、その中で Pythonサーバー を走らせる
# -e オプションでコマンドを指定
# --working-directory でサーバーのルートを指定（URLのパスと合わせるため）
# 末尾の & は「ターミナルを開いたまま、次のChromium起動へ進む」ため
lxterminal --working-directory="/home/dietpi/workspace/signage-p5" -e "python3 -m http.server 8000" &

# サーバー起動待ち
sleep 3

# デバッグ用：このスクリプト自体の進捗をファイルに残す（画面には出力しない）
echo 'Chromium launching...' > /tmp/kiosk_debug.log

# 4. Chromiumの起動
chromium \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --incognito \
  "http://localhost:8000/countdown/?debug"
  # "http://192.168.20.10:8000/countdown/?debug=1"
  # "file://$HOME/workspace/signage-p5/countdown/index.html?debug"
