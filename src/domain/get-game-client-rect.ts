export default function(GetWindowBoudingRect: Function) {
  const VERTICAL_OFFSET = 30;
  const BOTTOM_ADJUSTMENT = 100;
  const HORIZONTAL_OFFSET = 5;
  return (HWND: Number) => {
    const boundingRect = GetWindowBoudingRect(HWND);
    const width = boundingRect.right - boundingRect.left;
    const height = boundingRect.bottom - boundingRect.top;
    return { 
      left: boundingRect.left + HORIZONTAL_OFFSET, 
      top: boundingRect.top + VERTICAL_OFFSET, 
      width: Math.abs(width - HORIZONTAL_OFFSET), 
      height: Math.abs(height - VERTICAL_OFFSET - BOTTOM_ADJUSTMENT)
    };
  };
}