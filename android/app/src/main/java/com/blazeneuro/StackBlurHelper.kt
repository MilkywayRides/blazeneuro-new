package com.blazeneuro

import android.graphics.Bitmap

object StackBlurHelper {
    fun blur(bitmap: Bitmap, radius: Int): Bitmap {
        val w = bitmap.width
        val h = bitmap.height
        val pix = IntArray(w * h)
        bitmap.getPixels(pix, 0, w, 0, 0, w, h)

        val wm = w - 1
        val hm = h - 1
        val wh = w * h
        val div = radius + radius + 1

        val r = IntArray(wh); val g = IntArray(wh); val b = IntArray(wh)
        var rsum: Int; var gsum: Int; var bsum: Int
        var x: Int; var y: Int; var i: Int; var p: Int
        var yp: Int; var yi: Int; var yw: Int

        val vmin = IntArray(maxOf(w, h))
        var divsum = (div + 1) shr 1; divsum *= divsum
        val dv = IntArray(256 * divsum)
        for (idx in dv.indices) dv[idx] = idx / divsum

        var stackpointer: Int
        var stackstart: Int
        val stack = IntArray(div)
        var sir: Int
        var rbs: Int
        val r1 = radius + 1
        var routsum: Int; var goutsum: Int; var boutsum: Int
        var rinsum: Int; var ginsum: Int; var binsum: Int

        yw = 0; yi = 0
        for (yIdx in 0 until h) {
            rinsum = 0; ginsum = 0; binsum = 0
            routsum = 0; goutsum = 0; boutsum = 0
            rsum = 0; gsum = 0; bsum = 0
            for (idx in -radius..radius) {
                p = pix[yi + minOf(wm, maxOf(idx, 0))]
                sir = idx + radius
                stack[sir] = p
                rbs = r1 - Math.abs(idx)
                rsum += ((p and 0xff0000) shr 16) * rbs
                gsum += ((p and 0x00ff00) shr 8) * rbs
                bsum += (p and 0x0000ff) * rbs
                if (idx > 0) {
                    rinsum += (p and 0xff0000) shr 16
                    ginsum += (p and 0x00ff00) shr 8
                    binsum += p and 0x0000ff
                } else {
                    routsum += (p and 0xff0000) shr 16
                    goutsum += (p and 0x00ff00) shr 8
                    boutsum += p and 0x0000ff
                }
            }
            stackpointer = radius
            for (xIdx in 0 until w) {
                r[yi] = dv[rsum]; g[yi] = dv[gsum]; b[yi] = dv[bsum]
                rsum -= routsum; gsum -= goutsum; bsum -= boutsum
                stackstart = stackpointer - radius + div
                sir = stack[stackstart % div]
                routsum -= (sir and 0xff0000) shr 16
                goutsum -= (sir and 0x00ff00) shr 8
                boutsum -= sir and 0x0000ff
                if (yIdx == 0) vmin[xIdx] = minOf(xIdx + radius + 1, wm)
                p = pix[yw + vmin[xIdx]]
                stack[stackstart % div] = p
                rinsum += (p and 0xff0000) shr 16
                ginsum += (p and 0x00ff00) shr 8
                binsum += p and 0x0000ff
                rsum += rinsum; gsum += ginsum; bsum += binsum
                stackpointer = (stackpointer + 1) % div
                sir = stack[stackpointer]
                routsum += (sir and 0xff0000) shr 16
                goutsum += (sir and 0x00ff00) shr 8
                boutsum += sir and 0x0000ff
                rinsum -= (sir and 0xff0000) shr 16
                ginsum -= (sir and 0x00ff00) shr 8
                binsum -= sir and 0x0000ff
                yi++
            }
            yw += w
        }

        for (xIdx in 0 until w) {
            rinsum = 0; ginsum = 0; binsum = 0
            routsum = 0; goutsum = 0; boutsum = 0
            rsum = 0; gsum = 0; bsum = 0
            yp = -radius * w
            for (idx in -radius..radius) {
                yi = maxOf(0, yp) + xIdx
                sir = idx + radius
                stack[sir] = pix[yi]
                rbs = r1 - Math.abs(idx)
                rsum += ((pix[yi] and 0xff0000) shr 16) * rbs
                gsum += ((pix[yi] and 0x00ff00) shr 8) * rbs
                bsum += (pix[yi] and 0x0000ff) * rbs
                if (idx > 0) {
                    rinsum += (pix[yi] and 0xff0000) shr 16
                    ginsum += (pix[yi] and 0x00ff00) shr 8
                    binsum += pix[yi] and 0x0000ff
                } else {
                    routsum += (pix[yi] and 0xff0000) shr 16
                    goutsum += (pix[yi] and 0x00ff00) shr 8
                    boutsum += pix[yi] and 0x0000ff
                }
                if (idx < hm) yp += w
            }
            yi = xIdx; stackpointer = radius
            for (yIdx in 0 until h) {
                pix[yi] = (0xff000000.toInt() and pix[yi]) or
                        (dv[rsum] shl 16) or (dv[gsum] shl 8) or dv[bsum]
                rsum -= routsum; gsum -= goutsum; bsum -= boutsum
                stackstart = stackpointer - radius + div
                sir = stack[stackstart % div]
                routsum -= (sir and 0xff0000) shr 16
                goutsum -= (sir and 0x00ff00) shr 8
                boutsum -= sir and 0x0000ff
                if (xIdx == 0) vmin[yIdx] = minOf(yIdx + r1, hm) * w
                p = pix[vmin[yIdx] + xIdx]
                stack[stackstart % div] = p
                rinsum += (p and 0xff0000) shr 16
                ginsum += (p and 0x00ff00) shr 8
                binsum += p and 0x0000ff
                rsum += rinsum; gsum += ginsum; bsum += binsum
                stackpointer = (stackpointer + 1) % div
                sir = stack[stackpointer]
                routsum += (sir and 0xff0000) shr 16
                goutsum += (sir and 0x00ff00) shr 8
                boutsum += sir and 0x0000ff
                rinsum -= (sir and 0xff0000) shr 16
                ginsum -= (sir and 0x00ff00) shr 8
                binsum -= sir and 0x0000ff
                yi += w
            }
        }

        bitmap.setPixels(pix, 0, w, 0, 0, w, h)
        return bitmap
    }
}
