#!/bin/bash
chromium \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --incognito \
  "file://$HOME/workspace/signage/countdown/index.html?debug"
