import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

export type ArtBoardProps = {
  /** The size the art was composed at, in dp. Children are positioned absolutely inside it. */
  designWidth: number;
  designHeight: number;
  /**
   * `width`: height follows the available width (use when the art has a fixed place in the page).
   * `fit`: fills the parent and scales to fit both dimensions (use inside a flex: 1 area).
   */
  mode?: 'width' | 'fit';
  /** Never scale beyond this; avoids blurry upscaling on tablets and wide web windows. */
  maxScale?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Hand-placed artwork (headlines, arrows, doodles) that stays in proportion on any screen.
 * It composes children at a fixed design size, then scales the whole board to the space it is given,
 * so absolute offsets never collide on small phones or drift apart on large ones.
 */
export function ArtBoard({
  designWidth,
  designHeight,
  mode = 'width',
  maxScale = 1.15,
  style,
  children,
}: ArtBoardProps) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox((prev) => (prev?.w === width && prev.h === height ? prev : { w: width, h: height }));
  };

  const scale = box
    ? Math.min(maxScale, box.w / designWidth, mode === 'fit' ? box.h / designHeight : Infinity)
    : 1;
  const outerHeight = mode === 'width' ? designHeight * scale : undefined;

  return (
    <View
      onLayout={onLayout}
      style={[mode === 'fit' ? styles.fit : null, outerHeight !== undefined ? { height: outerHeight } : null, style]}>
      {box && (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            width: designWidth,
            height: designHeight,
            left: (box.w - designWidth) / 2,
            top: ((mode === 'fit' ? box.h : designHeight * scale) - designHeight) / 2,
            transform: [{ scale }],
          }}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ fit: { flex: 1 } });
