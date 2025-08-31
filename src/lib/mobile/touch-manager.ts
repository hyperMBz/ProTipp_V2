/**
 * Touch eseménykezelő rendszer mobil optimalizált interakciókhoz
 */

export interface TouchConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  preventDefault?: boolean;
}

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

export interface TouchEvent {
  type: 'swipe' | 'tap' | 'longPress' | 'pinch' | 'rotate';
  direction?: SwipeDirection;
  position?: { x: number; y: number };
  duration?: number;
}

export class TouchManager {
  private config: Required<TouchConfig>;
  private touchStart: { x: number; y: number; time: number } | null = null;
  private touchEnd: { x: number; y: number; time: number } | null = null;
  private longPressTimer: NodeJS.Timeout | null = null;
  private isLongPress = false;

  constructor(config: TouchConfig = {}) {
    this.config = {
      minSwipeDistance: config.minSwipeDistance || 50,
      maxSwipeTime: config.maxSwipeTime || 300,
      preventDefault: config.preventDefault ?? true,
    };
  }

  /**
   * Touch start esemény kezelése
   */
  handleTouchStart = (e: TouchEvent | React.TouchEvent, onEvent?: (event: TouchEvent) => void) => {
    if (this.config.preventDefault) {
      e.preventDefault?.();
    }

    const touch = 'touches' in e ? e.touches[0] : e;
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Long press timer indítása
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      onEvent?.({
        type: 'longPress',
        position: { x: this.touchStart!.x, y: this.touchStart!.y },
        duration: Date.now() - this.touchStart!.time,
      });
    }, 500);
  };

  /**
   * Touch move esemény kezelése
   */
  handleTouchMove = (e: TouchEvent | React.TouchEvent, onEvent?: (event: TouchEvent) => void) => {
    if (!this.touchStart) return;

    const touch = 'touches' in e ? e.touches[0] : e;
    const currentX = touch.clientX;
    const currentY = touch.clientY;

    // Ha túl sok mozgás van, töröljük a long press timert
    const distance = Math.sqrt(
      Math.pow(currentX - this.touchStart.x, 2) + Math.pow(currentY - this.touchStart.y, 2)
    );

    if (distance > 10 && this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  };

  /**
   * Touch end esemény kezelése
   */
  handleTouchEnd = (e: TouchEvent | React.TouchEvent, onEvent?: (event: TouchEvent) => void) => {
    if (!this.touchStart) return;

    const touch = 'changedTouches' in e ? e.changedTouches[0] : e;
    this.touchEnd = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Long press timer törlése
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const duration = this.touchEnd.time - this.touchStart.time;
    const distance = Math.sqrt(
      Math.pow(this.touchEnd.x - this.touchStart.x, 2) + Math.pow(this.touchEnd.y - this.touchStart.y, 2)
    );

    // Swipe detektálás
    if (distance > this.config.minSwipeDistance && duration < this.config.maxSwipeTime) {
      const direction = this.getSwipeDirection();
      const velocity = distance / duration;

      onEvent?.({
        type: 'swipe',
        direction: {
          direction,
          distance,
          velocity,
        },
        position: { x: this.touchEnd.x, y: this.touchEnd.y },
        duration,
      });
    }
    // Tap detektálás
    else if (distance < 10 && duration < 300 && !this.isLongPress) {
      onEvent?.({
        type: 'tap',
        position: { x: this.touchEnd.x, y: this.touchEnd.y },
        duration,
      });
    }

    // Reset
    this.touchStart = null;
    this.touchEnd = null;
    this.isLongPress = false;
  };

  /**
   * Swipe irány meghatározása
   */
  private getSwipeDirection(): 'left' | 'right' | 'up' | 'down' {
    if (!this.touchStart || !this.touchEnd) return 'right';

    const deltaX = this.touchEnd.x - this.touchStart.x;
    const deltaY = this.touchEnd.y - this.touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  /**
   * Pinch zoom detektálás (két ujjal)
   */
  handlePinch = (e: TouchEvent, onEvent?: (event: TouchEvent) => void) => {
    if ('touches' in e && e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      onEvent?.({
        type: 'pinch',
        position: {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        },
      });
    }
  };

  /**
   * Touch események összefoglalása
   */
  getTouchHandlers = (onEvent?: (event: TouchEvent) => void) => ({
    onTouchStart: (e: React.TouchEvent) => this.handleTouchStart(e, onEvent),
    onTouchMove: (e: React.TouchEvent) => this.handleTouchMove(e, onEvent),
    onTouchEnd: (e: React.TouchEvent) => this.handleTouchEnd(e, onEvent),
  });

  /**
   * Cleanup
   */
  destroy = () => {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  };
}

/**
 * Hook a touch események kezeléséhez
 */
export function useTouchManager(config?: TouchConfig) {
  const [touchManager] = React.useState(() => new TouchManager(config));

  React.useEffect(() => {
    return () => touchManager.destroy();
  }, [touchManager]);

  return touchManager;
}

/**
 * Hook a swipe gesztusok kezeléséhez
 */
export function useSwipeGesture(
  onSwipe?: (direction: SwipeDirection) => void,
  config?: TouchConfig
) {
  const touchManager = useTouchManager(config);

  const handleTouchEvent = React.useCallback(
    (event: TouchEvent) => {
      if (event.type === 'swipe' && event.direction) {
        onSwipe?.(event.direction);
      }
    },
    [onSwipe]
  );

  return touchManager.getTouchHandlers(handleTouchEvent);
}

/**
 * Hook a tap események kezeléséhez
 */
export function useTapGesture(
  onTap?: (position: { x: number; y: number }) => void,
  config?: TouchConfig
) {
  const touchManager = useTouchManager(config);

  const handleTouchEvent = React.useCallback(
    (event: TouchEvent) => {
      if (event.type === 'tap' && event.position) {
        onTap?.(event.position);
      }
    },
    [onTap]
  );

  return touchManager.getTouchHandlers(handleTouchEvent);
}

/**
 * Hook a long press események kezeléséhez
 */
export function useLongPressGesture(
  onLongPress?: (position: { x: number; y: number }) => void,
  config?: TouchConfig
) {
  const touchManager = useTouchManager(config);

  const handleTouchEvent = React.useCallback(
    (event: TouchEvent) => {
      if (event.type === 'longPress' && event.position) {
        onLongPress?.(event.position);
      }
    },
    [onLongPress]
  );

  return touchManager.getTouchHandlers(handleTouchEvent);
}
