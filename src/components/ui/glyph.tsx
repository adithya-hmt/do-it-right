import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import React from 'react';
import { View, type ColorValue, type ViewStyle } from 'react-native';

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
  | 'mic'
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
  | 'target'
  | 'people'
  | 'activity'
  | 'logout'
  | 'palette'
  | 'comment'
  | 'send';

const IOS_SYMBOLS: Partial<Record<GlyphName, string>> = {
  today: 'sun.max', calendar: 'calendar', repeat: 'arrow.clockwise', user: 'person', settings: 'gearshape', inbox: 'tray', search: 'magnifyingglass', play: 'play.fill', pause: 'pause.fill', download: 'square.and.arrow.down', trash: 'trash', edit: 'pencil', bell: 'bell', mic: 'mic', heart: 'heart', briefcase: 'briefcase', sun: 'sun.max', moon: 'moon', cloud: 'icloud', link: 'link', projects: 'folder', insights: 'chart.bar', plus: 'plus', check: 'checkmark', arrow: 'arrow.up.right', spark: 'sparkles', clock: 'clock', chevron: 'chevron.right', dots: 'ellipsis', close: 'xmark', trend: 'chart.bar.fill', target: 'target', people: 'person.2', activity: 'waveform.path.ecg', logout: 'rectangle.portrait.and.arrow.right', palette: 'paintpalette', comment: 'bubble.left', send: 'paperplane',
};

type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// One familiar icon family keeps Android visual language legible. SF Symbols
// stay on iOS so the same semantic icon feels native on each platform.
const MATERIAL_ICONS: Record<GlyphName, MaterialIconName> = {
  today: 'calendar-today', calendar: 'calendar-month-outline', repeat: 'repeat', user: 'account-circle-outline', settings: 'cog-outline', inbox: 'inbox-outline', search: 'magnify', play: 'play-circle-outline', pause: 'pause-circle-outline', download: 'download-outline', trash: 'trash-can-outline', edit: 'pencil-outline', bell: 'bell-outline', mic: 'microphone-outline', heart: 'heart-outline', briefcase: 'briefcase-outline', sun: 'weather-sunny', moon: 'weather-night', cloud: 'cloud-outline', link: 'link-variant', projects: 'folder-multiple-outline', insights: 'chart-line', plus: 'plus', check: 'check', arrow: 'arrow-up-right', spark: 'star-four-points', clock: 'clock-outline', chevron: 'chevron-right', dots: 'dots-horizontal', close: 'close', trend: 'chart-line', target: 'target', people: 'account-group-outline', activity: 'pulse', logout: 'logout', palette: 'palette-outline', comment: 'comment-outline', send: 'send-outline',
};

export function Glyph({ name, size = 18, color = COLORS.ink, style }: { name: GlyphName; size?: number; color?: ColorValue; style?: ViewStyle }) {
  const iosSymbol = process.env.EXPO_OS === 'ios' ? IOS_SYMBOLS[name] : undefined;
  return (
    <View accessibilityLabel={name} style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {iosSymbol ? <Image accessibilityLabel={name} source={`sf:${iosSymbol}`} contentFit="contain" style={{ width: size, height: size, tintColor: color }} /> : <MaterialCommunityIcons name={MATERIAL_ICONS[name]} size={size} color={color} />}
    </View>
  );
}
