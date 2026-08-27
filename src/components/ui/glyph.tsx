import React from 'react';
import { Image } from 'expo-image';
import { Text, View, type ColorValue, type ViewStyle } from 'react-native';

import { COLORS } from '@/constants/theme';

export type GlyphName =
  | 'today'
  | 'calendar'
  | 'repeat'
  | 'user'
  | 'settings'
  | 'inbox'
  | 'search'
  | 'play'
  | 'pause'
  | 'download'
  | 'trash'
  | 'edit'
  | 'bell'
  | 'heart'
  | 'briefcase'
  | 'sun'
  | 'moon'
  | 'cloud'
  | 'link'
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

const IOS_SYMBOLS: Partial<Record<GlyphName, string>> = {
  today: 'sun.max',
  calendar: 'calendar',
  repeat: 'arrow.clockwise',
  user: 'person',
  settings: 'gearshape',
  inbox: 'tray',
  search: 'magnifyingglass',
  play: 'play.fill',
  pause: 'pause.fill',
  download: 'square.and.arrow.down',
  trash: 'trash',
  edit: 'pencil',
  bell: 'bell',
  heart: 'heart',
  briefcase: 'briefcase',
  sun: 'sun.max',
  moon: 'moon',
  cloud: 'icloud',
  link: 'link',
  projects: 'folder',
  insights: 'chart.bar',
  plus: 'plus',
  check: 'checkmark',
  arrow: 'arrow.up.right',
  spark: 'sparkles',
  clock: 'clock',
  chevron: 'chevron.right',
  dots: 'ellipsis',
  close: 'xmark',
  trend: 'chart.bar.fill',
  target: 'target',
};

function Line({ color, width = 2, height = 2, style }: { color: ColorValue; width?: number; height?: number; style?: ViewStyle }) {
  return <View style={[{ width, height, borderRadius: 2, backgroundColor: color }, style]} />;
}

function Circle({ color, size, fill = 'transparent', borderWidth = 2, style }: { color: ColorValue; size: number; fill?: ColorValue; borderWidth?: number; style?: ViewStyle }) {
  return <View style={[{ width: size, height: size, borderRadius: size / 2, borderWidth, borderColor: color, backgroundColor: fill }, style]} />;
}

function IconShape({ name, size, color }: { name: GlyphName; size: number; color: ColorValue }) {
  const stroke = Math.max(1.7, size / 9);
  const iconSize = size;

  if (name === 'today') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Circle color={color} size={iconSize - 3} borderWidth={stroke} /><Circle color={color} size={iconSize / 3} fill={color} borderWidth={0} style={{ position: 'absolute' }} /></View>;
  }
  if (name === 'calendar') {
    return <View style={{ width: iconSize - 2, height: iconSize - 2, borderRadius: 4, borderWidth: stroke, borderColor: color, marginTop: 2, overflow: 'hidden' }}><View style={{ position: 'absolute', left: iconSize * 0.2, top: -stroke, width: stroke, height: iconSize * 0.22, backgroundColor: color, borderRadius: 2 }} /><View style={{ position: 'absolute', right: iconSize * 0.2, top: -stroke, width: stroke, height: iconSize * 0.22, backgroundColor: color, borderRadius: 2 }} /><View style={{ height: stroke, backgroundColor: color, marginTop: iconSize * 0.27 }} /><View style={{ position: 'absolute', left: iconSize * 0.17, right: iconSize * 0.17, top: iconSize * 0.54, height: stroke, backgroundColor: color, opacity: 0.8 }} /><View style={{ position: 'absolute', left: iconSize * 0.2, top: iconSize * 0.63, width: iconSize * 0.45, height: stroke, backgroundColor: color, opacity: 0.8 }} /></View>;
  }
  if (name === 'repeat') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: iconSize * 0.7, height: iconSize * 0.42, borderTopWidth: stroke, borderRightWidth: stroke, borderColor: color, borderTopRightRadius: 5 }} /><View style={{ width: iconSize * 0.7, height: iconSize * 0.42, borderBottomWidth: stroke, borderLeftWidth: stroke, borderColor: color, borderBottomLeftRadius: 5, position: 'absolute' }} /><View style={{ position: 'absolute', right: iconSize * 0.05, top: iconSize * 0.22, width: 0, height: 0, borderTopWidth: 3, borderBottomWidth: 3, borderLeftWidth: 5, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color }} /><View style={{ position: 'absolute', left: iconSize * 0.05, bottom: iconSize * 0.22, width: 0, height: 0, borderTopWidth: 3, borderBottomWidth: 3, borderRightWidth: 5, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: color }} /></View>;
  }
  if (name === 'user') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Circle color={color} size={iconSize * 0.34} borderWidth={stroke} style={{ position: 'absolute', top: iconSize * 0.1 }} /><View style={{ width: iconSize * 0.72, height: iconSize * 0.36, borderWidth: stroke, borderColor: color, borderBottomWidth: 0, borderTopLeftRadius: iconSize, borderTopRightRadius: iconSize, position: 'absolute', bottom: iconSize * 0.08 }} /></View>;
  }
  if (name === 'settings') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Circle color={color} size={iconSize * 0.48} borderWidth={stroke} /><View style={{ width: iconSize * 0.84, height: stroke, backgroundColor: color, transform: [{ rotate: '0deg' }] }} /><View style={{ width: iconSize * 0.84, height: stroke, backgroundColor: color, transform: [{ rotate: '60deg' }], position: 'absolute' }} /><View style={{ width: iconSize * 0.84, height: stroke, backgroundColor: color, transform: [{ rotate: '-60deg' }], position: 'absolute' }} /></View>;
  }
  if (name === 'inbox') {
    return <View style={{ width: iconSize - 2, height: iconSize * 0.68, borderWidth: stroke, borderColor: color, borderRadius: 3, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 }}><View style={{ width: iconSize * 0.28, height: iconSize * 0.16, borderWidth: stroke, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} /></View>;
  }
  if (name === 'search') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Circle color={color} size={iconSize * 0.56} borderWidth={stroke} style={{ position: 'absolute', left: iconSize * 0.12, top: iconSize * 0.1 }} /><Line color={color} width={iconSize * 0.36} height={stroke} style={{ position: 'absolute', right: iconSize * 0.06, bottom: iconSize * 0.18, transform: [{ rotate: '45deg' }] }} /></View>;
  }
  if (name === 'play' || name === 'pause') {
    return name === 'play' ? <View style={{ width: 0, height: 0, borderTopWidth: iconSize * 0.34, borderBottomWidth: iconSize * 0.34, borderLeftWidth: iconSize * 0.52, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color, marginLeft: iconSize * 0.08 }} /> : <View style={{ flexDirection: 'row', gap: iconSize * 0.18 }}><Line color={color} width={stroke * 1.4} height={iconSize * 0.65} /><Line color={color} width={stroke * 1.4} height={iconSize * 0.65} /></View>;
  }
  if (name === 'download') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Line color={color} width={stroke} height={iconSize * 0.48} /><Line color={color} width={iconSize * 0.34} height={stroke} style={{ transform: [{ rotate: '45deg' }], position: 'absolute', bottom: iconSize * 0.25, left: iconSize * 0.27 }} /><Line color={color} width={iconSize * 0.34} height={stroke} style={{ transform: [{ rotate: '-45deg' }], position: 'absolute', bottom: iconSize * 0.25, right: iconSize * 0.27 }} /><View style={{ position: 'absolute', bottom: iconSize * 0.1, width: iconSize * 0.66, height: stroke, backgroundColor: color }} /></View>;
  }
  if (name === 'trash') {
    return <View style={{ width: iconSize * 0.62, height: iconSize * 0.67, borderWidth: stroke, borderColor: color, borderTopWidth: 0, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, marginTop: 3 }}><View style={{ position: 'absolute', top: -iconSize * 0.13, left: -iconSize * 0.12, width: iconSize * 0.85, height: stroke, backgroundColor: color }} /></View>;
  }
  if (name === 'edit') {
    return <View style={{ width: iconSize * 0.7, height: iconSize * 0.23, backgroundColor: color, borderRadius: 2, transform: [{ rotate: '-45deg' }] }} />;
  }
  if (name === 'bell') {
    return <View style={{ width: iconSize * 0.58, height: iconSize * 0.66, borderWidth: stroke, borderColor: color, borderTopLeftRadius: iconSize, borderTopRightRadius: iconSize, borderBottomWidth: stroke, marginTop: 2 }}><View style={{ position: 'absolute', bottom: -iconSize * 0.16, alignSelf: 'center', width: iconSize * 0.2, height: stroke, backgroundColor: color }} /></View>;
  }
  if (name === 'heart') {
    return <Text style={{ color, fontSize: iconSize, lineHeight: iconSize + 2, fontWeight: '800' }}>♡</Text>;
  }
  if (name === 'briefcase') {
    return <View style={{ width: iconSize * 0.74, height: iconSize * 0.52, borderWidth: stroke, borderColor: color, borderRadius: 3, marginTop: 3 }}><View style={{ position: 'absolute', top: -iconSize * 0.18, left: iconSize * 0.2, width: iconSize * 0.34, height: iconSize * 0.2, borderWidth: stroke, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} /></View>;
  }
  if (name === 'sun') {
    return <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}><Circle color={color} size={iconSize * 0.42} fill={color} borderWidth={0} /><View style={{ width: iconSize * 0.86, height: stroke, backgroundColor: color, position: 'absolute' }} /><View style={{ width: iconSize * 0.86, height: stroke, backgroundColor: color, position: 'absolute', transform: [{ rotate: '90deg' }] }} /></View>;
  }
  if (name === 'moon') {
    return <View style={{ width: iconSize * 0.65, height: iconSize * 0.65, borderRadius: iconSize, backgroundColor: color, marginLeft: -iconSize * 0.08 }}><View style={{ width: iconSize * 0.65, height: iconSize * 0.65, borderRadius: iconSize, backgroundColor: COLORS.surface, position: 'absolute', left: iconSize * 0.2, top: -iconSize * 0.12 }} /></View>;
  }
  if (name === 'cloud') {
    return <View style={{ width: iconSize * 0.8, height: iconSize * 0.4, borderWidth: stroke, borderColor: color, borderRadius: iconSize, marginTop: iconSize * 0.14 }}><Circle color={color} size={iconSize * 0.4} borderWidth={stroke} style={{ position: 'absolute', left: iconSize * 0.1, top: -iconSize * 0.29 }} /><Circle color={color} size={iconSize * 0.3} borderWidth={stroke} style={{ position: 'absolute', right: iconSize * 0.08, top: -iconSize * 0.2 }} /></View>;
  }
  if (name === 'link') {
    return <View style={{ width: iconSize * 0.78, height: iconSize * 0.35, borderWidth: stroke, borderColor: color, borderRadius: iconSize, transform: [{ rotate: '-45deg' }] }}><View style={{ width: iconSize * 0.78, height: iconSize * 0.35, borderWidth: stroke, borderColor: color, borderRadius: iconSize, position: 'absolute', left: iconSize * 0.3, top: iconSize * 0.25 }} /></View>;
  }
  if (name === 'projects') {
    return <View style={{ width: iconSize * 0.82, height: iconSize * 0.62, borderRadius: 3, borderWidth: stroke, borderColor: color, marginTop: iconSize * 0.1 }}><View style={{ position: 'absolute', left: -stroke, top: -iconSize * 0.18, width: iconSize * 0.4, height: iconSize * 0.22, borderWidth: stroke, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} /></View>;
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
  color?: ColorValue;
  style?: ViewStyle;
}) {
  const iosSymbol = process.env.EXPO_OS === 'ios' ? IOS_SYMBOLS[name] : undefined;
  return (
    <View
      accessibilityLabel={name}
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {iosSymbol ? <Image accessibilityLabel={name} source={`sf:${iosSymbol}`} contentFit="contain" style={{ width: size, height: size, tintColor: color }} /> : <IconShape name={name} size={size} color={color} />}
    </View>
  );
}
