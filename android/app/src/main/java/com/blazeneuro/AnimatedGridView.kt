package com.blazeneuro

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import android.view.animation.LinearInterpolator
import androidx.core.content.ContextCompat

class AnimatedGridView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val paint = Paint().apply {
        color = 0x20FFFFFF
        strokeWidth = 2f
        style = Paint.Style.STROKE
    }

    private var offset = 0f
    private val gridSize = 100f
    private var isAnimating = true

    init {
        startAnimation()
    }

    private fun startAnimation() {
        post(object : Runnable {
            override fun run() {
                if (isAnimating) {
                    offset = (offset + 1f) % gridSize
                    invalidate()
                    postDelayed(this, 16)
                }
            }
        })
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        val w = width.toFloat()
        val h = height.toFloat()

        // Vertical lines
        var x = -gridSize + (offset % gridSize)
        while (x < w) {
            canvas.drawLine(x, 0f, x, h, paint)
            x += gridSize
        }

        // Horizontal lines
        var y = -gridSize + (offset % gridSize)
        while (y < h) {
            canvas.drawLine(0f, y, w, y, paint)
            y += gridSize
        }
    }

    fun pauseAnimation() {
        isAnimating = false
    }

    fun resumeAnimation() {
        isAnimating = true
        startAnimation()
    }
}
