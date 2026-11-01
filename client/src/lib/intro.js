// 入场序列的就绪信号。
// Preloader 完成（或主动跳过）后通知首屏开始自己的入场动画，
// 避免用 setTimeout 猜时间，也让 reduced-motion / 二次访问的路径保持同步。
let done = false
const waiting = new Set()

export function markIntroDone() {
  if (done) return
  done = true
  waiting.forEach(callback => callback())
  waiting.clear()
}

export function whenIntroDone(callback) {
  if (done) {
    callback()
    return () => {}
  }
  waiting.add(callback)
  return () => waiting.delete(callback)
}

export function introIsDone() {
  return done
}
