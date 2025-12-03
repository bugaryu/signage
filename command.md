# 画面回転
xrandr --output HDMI-1 --rotate right

# ソースコピー
scp -r ~/workspace/signage dietpi@192.168.10.197:~/workspace/
rsync -av --delete --exclude='.git' ~/workspace/signage/ dietpi@192.168.0.100:~/workspace/signage/

# サーバー立ち上げ
http-server -p 8000 -a localhost
## URL
http://localhost:8000/countdown/?debug=1

# カウントダウン表示
chromium --app="file://$HOME/workspace/signage/countdown/countdown.html"

# シャットダウン
shutdown -h 18:00