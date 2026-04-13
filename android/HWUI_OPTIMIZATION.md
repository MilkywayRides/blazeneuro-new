# HWUI Optimization Guide

## Applied Optimizations

### 1. Gradle Build Optimizations
- Increased heap size to 4GB with ParallelGC
- Enabled build cache and incremental compilation
- Enabled R8 full mode for aggressive code shrinking
- Added ABI filters (armeabi-v7a, arm64-v8a only)

### 2. ProGuard/R8 Optimizations
- 7 optimization passes
- Aggressive code repackaging
- Access modifier optimization
- Removed debug logging in release builds

### 3. Manifest Optimizations
- Hardware acceleration enabled globally and per-activity
- Disabled RTL support (not needed)
- Native lib extraction disabled (faster install)
- Custom Application class for runtime optimizations

### 4. Build Features
- Disabled unused features: AIDL, RenderScript, ResValues, Shaders
- Optimized Kotlin compiler flags
- Disabled lint checks for faster builds

### 5. Theme Optimizations
- Disabled window transitions
- Disabled window animations
- Optimized for solid backgrounds

### 6. Kotlin Compiler Optimizations
- JVM default methods enabled
- Opt-in annotations configured

## Build Commands

### Debug Build (for testing)
```bash
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Release Build (optimized)
```bash
./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

### Profile GPU Rendering
```bash
# Enable GPU profiling on device
adb shell setprop debug.hwui.profile true
adb shell setprop debug.hwui.render_dirty_regions false

# View HWUI stats
adb shell dumpsys gfxinfo com.blazeneuro
```

### Check APK Size
```bash
./gradlew assembleRelease
ls -lh app/build/outputs/apk/release/app-release.apk
```

## HWUI Performance Tips

1. **Use hardware layers sparingly** - Only for animations
2. **Avoid overdraw** - Check with "Debug GPU Overdraw" in Developer Options
3. **Optimize layouts** - Flatten view hierarchies
4. **Use ConstraintLayout** - Better than nested LinearLayouts
5. **Cache complex views** - Use ViewHolder pattern in RecyclerView
6. **Optimize images** - Use WebP format, appropriate resolutions
7. **Avoid alpha blending** - Use opaque backgrounds when possible

## Measuring Performance

### GPU Rendering Profile
Settings → Developer Options → Profile GPU Rendering → On screen as bars

Target: Keep bars below the green line (16ms for 60fps)

### HWUI Rendering Stats
```bash
adb shell dumpsys gfxinfo com.blazeneuro framestats
```

### Layout Inspector
Android Studio → Tools → Layout Inspector

Check for:
- Deep view hierarchies (>10 levels)
- Overdraw issues
- Unnecessary views

## Expected Results

With these optimizations:
- Faster app startup
- Smoother scrolling (60fps)
- Reduced APK size (~30-40% smaller)
- Lower memory usage
- Better battery efficiency
