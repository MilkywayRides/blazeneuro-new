#!/bin/bash

# Install Android command line tools if not present
if [ ! -d "$HOME/android-sdk" ]; then
    echo "Installing Android SDK..."
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O /tmp/cmdtools.zip
    mkdir -p $HOME/android-sdk/cmdline-tools
    unzip /tmp/cmdtools.zip -d $HOME/android-sdk/cmdline-tools
    mv $HOME/android-sdk/cmdline-tools/cmdline-tools $HOME/android-sdk/cmdline-tools/latest
fi

export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Accept licenses
yes | sdkmanager --licenses

# Install required packages
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Build and install
cd /home/ankit/Documents/Code/blazeneuro/flow/android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.sbstylehub/.MainActivity
