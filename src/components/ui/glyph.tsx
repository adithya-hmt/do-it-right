import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';

import { COLORS } from '@/constants/theme';

export type GlyphName =
  | 'today'
  | 'projects'
  | 'insights'
  | 'plus'
  | 'check'
  | 'arrow'
  | 'spark'
  | 'clock'
  | 'chevron'
  | 'dots'
  | 'close'
  | 'trend'
  | 'target';

function Line({ color, width = 2, height = 2, style }: { color: string; width?: number; height?: number; style?: ViewStyle }) {
  return <View style={[{ width, height, borderRadius: 2, backgroundColor: color }, style]} />;
}

function Circle({ color, size, fill = 'transparent', borderWidth = 2, style }: { color: string; size: number; fill?: string; borderWidth?: number; style?: ViewStyle }) {
  return <View style={[{ width: size, height: size, borderRadius: size / 2, borderWidth, borderColor: color, backgroundColor: fill }, style]} />;
}

function IconShape({ name, size, color }: { name: GlyphName; size: number; color: string }) {
  const stroke = Math.max(1.7, size / 9);
  const iconSize = size;

  if (name === 'today') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Circle color={color} size={iconSize - 3} borderWidth={stroke} /><Circle color={color} size={iconSize / 3} fill={color} borderWidth={0} style={{ position: 'absolute' }} /></View>;
  }
  if (name === 'projects') {
    const tile = (key: string) => <View key={key} style={{ width: (iconSize - 4) / 2, height: (iconSize - 4) / 2, borderRadius: 2, borderWidth: stroke, borderColor: color }} />;
    return <View style={{ width: iconSize, height: iconSize, flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignContent: 'center', justifyContent: 'center' }}>{['a', 'b', 'c', 'd'].map(tile)}</View>;
  }
  if (name === 'insights' || name === 'arrow') {
    return <View style={{ width: iconSize, height: iconSize, justifyContent: 'center', alignItems: 'center' }}><Line color={color} width={iconSize * 0.63} style={{ transform: [{ rotate: '-45deg' }] }} /><Line color={color} width={iconSize * 0.32} style={{ position: 'absolute', top: iconSize * 0.22, right: iconSize * 0.1, transform: [{ rotate: '45deg' }] }} /><Line color={color} width={iconSize * 0.32} style={{ position: 'absolute', top: iconSize * 0.22, right: iconSize * 0.1, transform: [{ rotate: '135deg' }] }} /></View>;
  }
  if (name === 'plus') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Line color={color} width={iconSize * 0.72} height={stroke} /><Line color={color} width={stroke} height={iconSize * 0.72} style={{ position: 'absolute' }} /></View>;
  }
  if (name === 'check') {
    return <View style={{ width: iconSize, height: iconSize, justifyContent: 'center', alignItems: 'center' }}><Line color={color} width={iconSize * 0.42} height={stroke} style={{ transform: [{ rotate: '45deg' }], position: 'absolute', left: iconSize * 0.1, top: iconSize * 0.58 }} /><Line color={color} width={iconSize * 0.67} height={stroke} style={{ transform: [{ rotate: '-45deg' }], position: 'absolute', left: iconSize * 0.35, top: iconSize * 0.4 }} /></View>;
  }
  if (name === 'spark') {
    return <Text style={{ color, fontSize: iconSize, lineHeight: iconSize + 2, fontWeight: '900' }}>✦</Text>;
  }
  if (name === 'clock') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Circle color={color} size={iconSize - 3} borderWidth={stroke} /><Line color={color} width={stroke} height={iconSize * 0.32} style={{ position: 'absolute', top: iconSize * 0.27 }} /><Line color={color} width={iconSize * 0.28} height={stroke} style={{ position: 'absolute', top: iconSize * 0.57, left: iconSize * 0.49, transform: [{ rotate: '25deg' }] }} /></View>;
  }
  if (name === 'chevron') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Line color={color} width={iconSize * 0.45} height={stroke} style={{ transform: [{ rotate: '45deg' }], position: 'absolute', left: iconSize * 0.17, top: iconSize * 0.35 }} /><Line color={color} width={iconSize * 0.45} height={stroke} style={{ transform: [{ rotate: '-45deg' }], position: 'absolute', right: iconSize * 0.17, top: iconSize * 0.35 }} /></View>;
  }
  if (name === 'dots') {
    return <View style={{ width: iconSize, height: iconSize, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: iconSize * 0.15 }}>{[0, 1, 2].map((item) => <Circle key={item} color={color} size={Math.max(2.5, iconSize / 5)} fill={color} borderWidth={0} />)}</View>;
  }
  if (name === 'close') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Line color={color} width={iconSize * 0.72} height={stroke} style={{ transform: [{ rotate: '45deg' }], position: 'absolute' }} /><Line color={color} width={iconSize * 0.72} height={stroke} style={{ transform: [{ rotate: '-45deg' }], position: 'absolute' }} /></View>;
  }
  if (name === 'trend') {
    return <View style={{ width: iconSize, height: iconSize, justifyContent: 'flex-end', gap: 2, paddingHorizontal: 1 }}><View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}><View style={{ width: iconSize * 0.18, height: iconSize * 0.3, backgroundColor: color, borderRadius: 2 }} /><View style={{ width: iconSize * 0.18, height: iconSize * 0.52, backgroundColor: color, borderRadius: 2 }} /><View style={{ width: iconSize * 0.18, height: iconSize * 0.76, backgroundColor: color, borderRadius: 2 }} /><View style={{ width: iconSize * 0.18, height: iconSize * 0.97, backgroundColor: color, borderRadius: 2 }} /></View></View>;
  }
  return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Circle color={color} size={iconSize - 3} borderWidth={stroke} /><Circle color={color} size={iconSize * 0.5} borderWidth={stroke} style={{ position: 'absolute' }} /><Circle color={color} size={iconSize * 0.16} fill={color} borderWidth={0} style={{ position: 'absolute' }} /></View>;
}

export function Glyph({
  name,
  size = 18,
  color = COLORS.ink,
  style,
}: {
  name: GlyphName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}) {
  return (
    <View
      accessibilityLabel={name}
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <IconShape name={name} size={size} color={color} />
    </View>
  );
}
