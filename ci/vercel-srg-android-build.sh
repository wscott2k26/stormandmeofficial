#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
OUT="$ROOT/android-artifacts"
CACHE="$ROOT/.srg-build-cache"
mkdir -p "$OUT" "$CACHE"

echo "SRG_ANDROID_BUILDER_START"
echo "node=$(node --version 2>/dev/null || true)"
echo "npm=$(npm --version 2>/dev/null || true)"
echo "kernel=$(uname -a)"

cat ci/srg-source.part-* > "$CACHE/srg-source.b64"
base64 --decode "$CACHE/srg-source.b64" > "$CACHE/srg-source.zip"
echo 'a9e5c58d8a7aa2fe6c60110a47ff5de73164e1b89c89e8db7384226a16a12e00  '"$CACHE"'/srg-source.zip' | sha256sum -c -
rm -rf "$ROOT/srg-mobile"
unzip -q "$CACHE/srg-source.zip" -d "$ROOT"
test -f "$ROOT/srg-mobile/package.json"

if command -v java >/dev/null 2>&1; then
  JAVA_MAJOR="$(java -version 2>&1 | awk -F[\".] '/version/ {print $2; exit}')"
else
  JAVA_MAJOR=0
fi
if [ "${JAVA_MAJOR:-0}" -lt 17 ]; then
  JDK_DIR="$CACHE/jdk21"
  if [ ! -x "$JDK_DIR/bin/java" ]; then
    rm -rf "$JDK_DIR"
    mkdir -p "$JDK_DIR"
    curl -fL --retry 4 --retry-all-errors --connect-timeout 20 \
      'https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse' \
      -o "$CACHE/jdk21.tar.gz"
    tar -xzf "$CACHE/jdk21.tar.gz" -C "$JDK_DIR" --strip-components=1
  fi
  export JAVA_HOME="$JDK_DIR"
  export PATH="$JAVA_HOME/bin:$PATH"
fi
java -version

export ANDROID_HOME="$CACHE/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/36.0.0:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
if [ ! -x "$SDKMANAGER" ]; then
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  if ! curl -fL --retry 3 --retry-all-errors --connect-timeout 20 \
      'https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip' \
      -o "$CACHE/android-cmdline.zip"; then
    curl -fL --retry 3 --retry-all-errors --connect-timeout 20 \
      'https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip' \
      -o "$CACHE/android-cmdline.zip"
  fi
  rm -rf "$CACHE/cmdline-unpack"
  mkdir -p "$CACHE/cmdline-unpack"
  unzip -q "$CACHE/android-cmdline.zip" -d "$CACHE/cmdline-unpack"
  mkdir -p "$ANDROID_HOME/cmdline-tools/latest"
  cp -R "$CACHE/cmdline-unpack/cmdline-tools/." "$ANDROID_HOME/cmdline-tools/latest/"
fi

yes | "$SDKMANAGER" --licenses >/dev/null 2>&1 || true
"$SDKMANAGER" 'platform-tools' 'platforms;android-36' 'build-tools;36.0.0'

cd "$ROOT/srg-mobile"
npm install --no-audit --no-fund
npm run check
npm run build:web
npx cap add android
npx cap sync android
node scripts/prepare-android.mjs

grep -F 'applicationId "com.base6a064c6681c3f6996519ab50.app"' android/app/build.gradle
grep -F 'versionCode 200' android/app/build.gradle
grep -F 'versionName "2.0.0"' android/app/build.gradle
grep -F 'targetSdkVersion = 36' android/variables.gradle
if grep -RinE 'base44|@base44/sdk|base44\.app' android/app/src/main; then
  echo "LEGACY_BASE44_RUNTIME_REFERENCE_FOUND"
  exit 1
fi

export GRADLE_OPTS='-Dorg.gradle.daemon=false -Dorg.gradle.jvmargs=-Xmx2048m -Dkotlin.daemon.jvm.options=-Xmx1024m'
cd android
chmod +x gradlew
./gradlew --no-daemon clean assembleDebug bundleRelease lintRelease

cd "$ROOT/srg-mobile"
DEBUG_APK='android/app/build/outputs/apk/debug/app-debug.apk'
RELEASE_AAB='android/app/build/outputs/bundle/release/app-release.aab'
test -s "$DEBUG_APK"
test -s "$RELEASE_AAB"
unzip -t "$RELEASE_AAB" > "$OUT/aab-zip-test.txt"
sha256sum "$DEBUG_APK" "$RELEASE_AAB" | tee "$OUT/android-artifact-sha256.txt"
"$ANDROID_HOME/build-tools/36.0.0/aapt" dump badging "$DEBUG_APK" > "$OUT/apk-badging.txt"
grep "package: name='com.base6a064c6681c3f6996519ab50.app'" "$OUT/apk-badging.txt"
grep "versionCode='200'" "$OUT/apk-badging.txt"
grep "targetSdkVersion:'36'" "$OUT/apk-badging.txt"

cp "$DEBUG_APK" "$OUT/SRG-2.0.0-vc200-debug-QA.apk"
cp "$RELEASE_AAB" "$OUT/SRG-2.0.0-vc200-UNSIGNED.aab"
cp android/app/build/reports/lint-results-release.html "$OUT/lint-results-release.html" || true

cat > "$OUT/release-metadata.txt" <<EOF
app=Survive Recover Grow
package=com.base6a064c6681c3f6996519ab50.app
versionName=2.0.0
versionCode=200
targetSdk=36
source_zip_sha256=a9e5c58d8a7aa2fe6c60110a47ff5de73164e1b89c89e8db7384226a16a12e00
base44_runtime_refs=0
status=COMPILE_CANDIDATE_READY
signing=UNSIGNED_RELEASE_AAB
EOF

cat > "$OUT/index.html" <<'EOF'
<!doctype html>
<meta charset="utf-8">
<title>SRG 2 Android Compile Candidate</title>
<h1>SRG 2 Android Compile Candidate</h1>
<p>Package: com.base6a064c6681c3f6996519ab50.app</p>
<p>Version: 2.0.0 (200) · target API 36</p>
<ul>
<li><a href="/SRG-2.0.0-vc200-UNSIGNED.aab">Unsigned release AAB</a></li>
<li><a href="/SRG-2.0.0-vc200-debug-QA.apk">Debug QA APK</a></li>
<li><a href="/release-metadata.txt">Release metadata</a></li>
<li><a href="/android-artifact-sha256.txt">SHA-256 checksums</a></li>
<li><a href="/apk-badging.txt">APK package metadata</a></li>
<li><a href="/aab-zip-test.txt">AAB ZIP integrity</a></li>
<li><a href="/lint-results-release.html">Android lint</a></li>
</ul>
EOF

echo "SRG_ANDROID_BUILDER_SUCCESS"
