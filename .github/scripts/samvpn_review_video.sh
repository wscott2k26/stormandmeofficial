#!/usr/bin/env bash
set -Eeuo pipefail

OUT="$GITHUB_WORKSPACE/review-output"
PUB="$GITHUB_WORKSPACE/frontend/public/review"
mkdir -p "$OUT" "$PUB"
LOG="$OUT/run.log"
exec > >(tee -a "$LOG") 2>&1

log(){ printf '\n[%s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }

cat > /tmp/ui_find.py <<'PY'
import argparse,re,xml.etree.ElementTree as ET
p=argparse.ArgumentParser(); p.add_argument('file'); p.add_argument('pattern'); a=p.parse_args()
try: root=ET.parse(a.file).getroot()
except Exception: raise SystemExit(2)
rx=re.compile(a.pattern,re.I)
for n in root.iter('node'):
    s=((n.attrib.get('text') or '')+' '+(n.attrib.get('content-desc') or '')).strip()
    if not rx.search(s): continue
    m=re.match(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]',n.attrib.get('bounds',''))
    if m:
        x1,y1,x2,y2=map(int,m.groups()); print(f'{(x1+x2)//2} {(y1+y2)//2}::{s}'); raise SystemExit(0)
raise SystemExit(1)
PY

dump_ui(){
  local label="$1"
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  adb pull /sdcard/window.xml "$OUT/${label}.xml" >/dev/null 2>&1 || true
  adb exec-out screencap -p > "$OUT/${label}.png" || true
}

tap_pattern(){
  local pattern="$1" label="$2" tries="${3:-12}"
  for ((i=1;i<=tries;i++)); do
    adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
    adb pull /sdcard/window.xml /tmp/window.xml >/dev/null 2>&1 || true
    if hit=$(python3 /tmp/ui_find.py /tmp/window.xml "$pattern" 2>/dev/null); then
      coords="${hit%%::*}"; text="${hit#*::}"; x="${coords% *}"; y="${coords#* }"
      log "Tap $label at $x,$y [$text]"
      adb shell input tap "$x" "$y"; return 0
    fi
    sleep 1
  done
  log "FAILED to find $label /$pattern/"
  dump_ui "missing-${label// /-}"
  return 1
}

has_pattern(){
  local file="$1" pattern="$2"
  python3 /tmp/ui_find.py "$file" "$pattern" >/dev/null 2>&1
}

stop_recording(){
  adb shell pkill -2 screenrecord >/dev/null 2>&1 || true
  sleep 2
}
trap 'stop_recording || true' EXIT

log "Install exact vc6-derived universal APK"
adb install -r "$GITHUB_WORKSPACE/samvpn.apk"
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
adb shell pm clear com.stormandme.samvpn >/dev/null
adb shell am force-stop com.stormandme.samvpn

log "Start clean 75-second review recording"
adb shell rm -f /sdcard/samvpn-review.mp4
adb shell screenrecord --bit-rate 2000000 --time-limit 75 /sdcard/samvpn-review.mp4 >/dev/null 2>&1 &
sleep 2

log "Open Storm And Me VPN"
adb shell monkey -p com.stormandme.samvpn -c android.intent.category.LAUNCHER 1 >/dev/null
sleep 5
dump_ui "01-opened"
# Dismiss an unrelated notification-permission prompt if Android shows one.
tap_pattern "^don't allow$|^don.t allow$" "notification-deny" 2 || true
sleep 1

log "Trigger VPN prominent disclosure"
tap_pattern '^protect me$|^connect$' "Protect-Me" 15
sleep 5
dump_ui "02-disclosure-first"
if ! has_pattern "$OUT/02-disclosure-first.xml" 'vpn connection disclosure|vpnservice|continue'; then
  log "FAIL: prominent VPN disclosure not detected"; exit 21
fi

log "Demonstrate non-consent and disclosure persistence"
tap_pattern '^not now$|^cancel$' "Not-now" 8
sleep 2
tap_pattern '^protect me$|^connect$' "Protect-Me-again" 12
sleep 4
dump_ui "03-disclosure-second"
if ! has_pattern "$OUT/03-disclosure-second.xml" 'vpn connection disclosure|vpnservice|continue'; then
  log "FAIL: disclosure did not reappear after non-consent"; exit 22
fi

log "Consent and invoke Android VpnService permission"
tap_pattern '^continue$' "Continue" 10
sleep 4
dump_ui "04-system-vpn-permission"
if ! has_pattern "$OUT/04-system-vpn-permission.xml" 'connection request|vpn|ok|allow'; then
  log "WARN: system VPN dialog text not detected; trying permission buttons anyway"
fi
tap_pattern '^ok$|^allow$' "Android-VPN-Allow" 12
sleep 15
dump_ui "05-post-connect"

log "Verify app reaches an active-looking connected state"
if ! has_pattern "$OUT/05-post-connect.xml" 'disconnect|vpn on|connected'; then
  log "Connected label not yet visible; wait once more"
  sleep 12
  dump_ui "06-post-connect-retry"
  if ! has_pattern "$OUT/06-post-connect-retry.xml" 'disconnect|vpn on|connected'; then
    log "FAIL: no connected/disconnect state detected in app UI"
    adb shell dumpsys connectivity > "$OUT/connectivity.txt" || true
    adb logcat -d -t 1200 > "$OUT/logcat.txt" || true
    exit 23
  fi
fi

adb shell dumpsys connectivity > "$OUT/connectivity.txt" || true
adb logcat -d -t 1200 > "$OUT/logcat.txt" || true
sleep 5
stop_recording
trap - EXIT

log "Pull and validate the actual emulator screen recording"
adb pull /sdcard/samvpn-review.mp4 "$PUB/samvpn-vpnservice-review.mp4"
cp "$PUB/samvpn-vpnservice-review.mp4" "$OUT/samvpn-vpnservice-review.mp4"
[ -s "$OUT/samvpn-vpnservice-review.mp4" ]
if command -v ffprobe >/dev/null 2>&1; then
  ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT/samvpn-vpnservice-review.mp4" | tee "$OUT/video-info.txt"
fi
sha256sum "$OUT/samvpn-vpnservice-review.mp4" | tee "$OUT/video-sha256.txt"
log "PASS: review video captured from the exact vc6-derived app flow"
