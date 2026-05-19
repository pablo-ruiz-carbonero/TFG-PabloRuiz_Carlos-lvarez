// src/core/hooks/useKeyboardAwareScroll.ts
//
// Hook que combina:
//   1. KeyboardAvoidingView correcto en iOS y Android
//   2. Scroll automático para que el campo enfocado quede visible
//
// Uso:
//   const { scrollRef, scrollProps, onFocus } = useKeyboardAwareScroll();
//
//   <KeyboardAvoidingView {...scrollProps.kavProps}>
//     <ScrollView ref={scrollRef} {...scrollProps.scrollViewProps}>
//       <TextInput onFocus={() => onFocus(fieldRef)} ref={fieldRef} />
//     </ScrollView>
//   </KeyboardAvoidingView>

import { useRef } from "react";
import { Platform, ScrollView, View } from "react-native";

export function useKeyboardAwareScroll(extraOffset = 24) {
  const scrollRef = useRef<ScrollView>(null);

  /**
   * Llama a esto en el onFocus de cualquier TextInput pasando el ref
   * del View contenedor del campo (o del propio TextInput).
   */
  const onFocus = (fieldRef: React.RefObject<View | null>) => {
    const node = fieldRef.current;
    if (!node || !scrollRef.current) return;

    // Pequeño delay para que el teclado haya terminado de animarse
    setTimeout(() => {
      node.measureLayout(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scrollRef.current as any,
        (_x: number, y: number, _w: number, h: number) => {
          scrollRef.current?.scrollTo({ y: y - extraOffset, animated: true });
        },
        () => {},
      );
    }, 120);
  };

  const kavProps = {
    style: { flex: 1 } as const,
    behavior:
      Platform.OS === "ios" ? ("padding" as const) : ("height" as const),
    keyboardVerticalOffset: Platform.OS === "ios" ? 0 : 24,
  };

  const scrollViewProps = {
    keyboardShouldPersistTaps: "handled" as const,
    showsVerticalScrollIndicator: false,
  };

  return { scrollRef, onFocus, kavProps, scrollViewProps };
}
