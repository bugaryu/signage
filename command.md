# 画面回転
xrandr --output HDMI-1 --rotate right

# ソースコピー
scp -r ~/workspace/signage dietpi@192.168.10.197:~/workspace/

# カウントダウン表示
chromium --app="file://$HOME/workspace/signage/countdown/countdown.html"