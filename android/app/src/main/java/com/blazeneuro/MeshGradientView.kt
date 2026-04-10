package com.blazeneuro

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View

class MeshGradientView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)

    private val colors = intArrayOf(
        0xFF6366F1.toInt(),
        0xFF8B5CF6.toInt(),
        0xFFEC4899.toInt(),
        0xFF3B82F6.toInt()
    )

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        val w = width.toFloat()
        val h = height.toFloat()

        val gradient = RadialGradient(
            w * 0.5f, h * 0.5f, w * 0.8f,
            colors,
            floatArrayOf(0f, 0.3f, 0.6f, 1f),
            Shader.TileMode.CLAMP
        )

        paint.shader = gradient
        paint.alpha = 30
        canvas.drawRect(0f, 0f, w, h, paint)
    }
}
