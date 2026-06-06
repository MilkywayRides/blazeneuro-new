package com.blazeneuro

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View

class FrostedGlassView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {

    private var blurredBitmap: Bitmap? = null
    private val overlayPaint = Paint().apply {
        color = Color.argb(100, 0, 0, 0)
    }
    private val bitmapPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val cornerRadius = 16f * context.resources.displayMetrics.density

    fun setBlurredBackground(source: Bitmap, blurRadius: Int = 18) {
        val scaled = Bitmap.createScaledBitmap(source, source.width / 4, source.height / 4, true)
        blurredBitmap = StackBlurHelper.blur(scaled, blurRadius)
        invalidate()
    }

    private val clipPath = Path()

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        clipPath.reset()
        val rect = RectF(0f, 0f, w.toFloat(), h.toFloat())
        clipPath.addRoundRect(rect, cornerRadius, cornerRadius, Path.Direction.CW)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        blurredBitmap?.let {
            val rect = RectF(0f, 0f, width.toFloat(), height.toFloat())
            canvas.save()
            canvas.clipPath(clipPath)
            canvas.drawBitmap(it, null, rect, bitmapPaint)
            canvas.drawRoundRect(rect, cornerRadius, cornerRadius, overlayPaint)
            canvas.restore()
        }
    }
}
