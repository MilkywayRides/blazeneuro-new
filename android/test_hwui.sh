#!/bin/bash
# HWUI Performance Testing Script

echo "🔍 BlazeNeuro HWUI Performance Test"
echo "===================================="
echo ""

# Check if device is connected
if ! adb devices | grep -q "device$"; then
    echo "❌ No device connected. Please connect your Samsung A35."
    exit 1
fi

echo "✅ Device connected"
echo ""

# Enable GPU profiling
echo "📊 Enabling GPU profiling..."
adb shell setprop debug.hwui.profile true
adb shell setprop debug.hwui.render_dirty_regions false
echo "✅ GPU profiling enabled"
echo ""

# Get app info
echo "📱 App Information:"
adb shell dumpsys package com.blazeneuro | grep -A 3 "versionName"
echo ""

# Get HWUI stats
echo "🎨 HWUI Rendering Stats:"
echo "========================"
adb shell dumpsys gfxinfo com.blazeneuro | head -50
echo ""

# Get memory info
echo "💾 Memory Usage:"
echo "================"
adb shell dumpsys meminfo com.blazeneuro | head -20
echo ""

# Frame stats
echo "🎬 Frame Statistics (last 120 frames):"
echo "======================================"
adb shell dumpsys gfxinfo com.blazeneuro framestats | tail -30
echo ""

echo "✅ Performance test complete!"
echo ""
echo "📋 Quick Tips:"
echo "  - Target: 16ms per frame (60fps)"
echo "  - Check 'Profile GPU Rendering' in Developer Options"
echo "  - Look for bars below the green line"
echo "  - Use 'Debug GPU Overdraw' to check rendering efficiency"
echo ""
echo "🔄 To reset GPU profiling:"
echo "  adb shell setprop debug.hwui.profile false"
