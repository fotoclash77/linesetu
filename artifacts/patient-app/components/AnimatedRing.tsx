import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { C } from "../constants/design";

interface AnimatedRingProps {
  size?: number;
  color?: string;
  pulses?: number;
}

export function AnimatedRing({
  size = 80,
  color = C.PRIMARY,
  pulses = 2,
}: AnimatedRingProps) {
  const animations = useRef(
    Array.from({ length: pulses }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.stagger(
        600,
        animations.map((anim) =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 1400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );
    loop.start();
    return () => loop.stop();
  }, [animations]);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {animations.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              opacity: anim.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [0.7, 0.3, 0],
              }),
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.8],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
  },
});
