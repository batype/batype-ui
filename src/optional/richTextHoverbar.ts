/** Adapted from the manager's multiline-selection positioning fix; scoped to one editor. */
export function positionSelectionToolbar(root: HTMLElement): () => void {
  let frame = 0
  const position = () => {
    frame = 0
    const bar = root.querySelector<HTMLElement>('.w-e-hover-bar.w-e-bar-show')
    const selection = window.getSelection()
    if (!bar || !selection || selection.isCollapsed || !selection.rangeCount) return
    const range = selection.getRangeAt(0)
    if (!root.contains(range.commonAncestorContainer)) return
    const rects = Array.from(range.getClientRects()).filter((rect) => rect.width || rect.height)
    const first = rects[0],
      last = rects[rects.length - 1],
      parent = bar.offsetParent
    if (!first || !last || !(parent instanceof HTMLElement)) return
    const bounds = parent.getBoundingClientRect(),
      gap = 8
    const below = Math.round(last.bottom - bounds.top + parent.scrollTop + gap)
    const above = Math.round(first.top - bounds.top + parent.scrollTop - bar.offsetHeight - gap)
    const bottom = parent.scrollTop + parent.clientHeight
    const top = below + bar.offsetHeight <= bottom ? below : Math.max(parent.scrollTop, above)
    if (bar.style.bottom) bar.style.removeProperty('bottom')
    if (bar.style.top !== `${top}px`) bar.style.top = `${top}px`
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(position)
  }
  const observer = new MutationObserver(schedule)
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  })
  document.addEventListener('selectionchange', schedule)
  root.addEventListener('scroll', schedule, true)
  window.addEventListener('resize', schedule)
  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    document.removeEventListener('selectionchange', schedule)
    root.removeEventListener('scroll', schedule, true)
    window.removeEventListener('resize', schedule)
  }
}
