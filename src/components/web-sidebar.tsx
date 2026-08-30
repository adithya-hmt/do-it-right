import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { BrandLockup } from '@/components/ui/brand-lockup';
import { Glyph, type GlyphName } from '@/components/ui/glyph';
import { COLORS, RADIUS } from '@/constants/theme';

type SidebarItem = {
  label: string;
  href: string;
  icon: GlyphName;
};

const PRIMARY_ITEMS: SidebarItem[] = [
  { label: 'Inbox', href: '/', icon: 'inbox' },
  { label: 'Today', href: '/today', icon: 'today' },
  { label: 'Upcoming', href: '/upcoming', icon: 'calendar' },
  { label: 'Spaces', href: '/spaces', icon: 'people' },
  { label: 'You', href: '/you', icon: 'user' },
];

const TOOL_ITEMS: SidebarItem[] = [
  { label: 'Plan', href: '/plan', icon: 'target' },
  { label: 'Projects', href: '/projects', icon: 'projects' },
  { label: 'Search', href: '/search', icon: 'search' },
  { label: 'Focus', href: '/focus', icon: 'play' },
  { label: 'Weekly review', href: '/review', icon: 'spark' },
];

function matchesPath(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '/index';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({ item, pathname }: { item: SidebarItem; pathname: string }) {
  const active = matchesPath(pathname, item.href);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      onPress={() => router.push(item.href as never)}
      style={({ pressed }) => [
        {
          minHeight: 44,
          paddingHorizontal: 12,
          borderRadius: RADIUS.small,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 11,
          backgroundColor: active ? COLORS.primarySoft : 'transparent',
        },
        pressed && { opacity: 0.68 },
      ]}>
      <Glyph name={item.icon} size={17} color={active ? COLORS.primary : COLORS.muted} />
      <Text style={{ flex: 1, color: active ? COLORS.ink : COLORS.muted, fontSize: 13, fontWeight: active ? '900' : '700' }}>{item.label}</Text>
      {active ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary }} /> : null}
    </Pressable>
  );
}

export function WebSidebar() {
  const pathname = usePathname();
  return (
    <View
      accessibilityLabel="Workspace navigation"
      style={{
        width: 236,
        flexShrink: 0,
        paddingHorizontal: 18,
        paddingTop: 28,
        paddingBottom: 24,
        backgroundColor: COLORS.canvas,
        borderRightWidth: 1,
        borderRightColor: COLORS.line,
        gap: 24,
      }}>
      <View style={{ paddingHorizontal: 8, gap: 5 }}>
        <BrandLockup size={23} />
        <Text style={{ color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 }}>THE NEXT RIGHT THING</Text>
      </View>

      <View style={{ gap: 4 }}>
        {PRIMARY_ITEMS.map((item) => <SidebarLink key={item.href} item={item} pathname={pathname} />)}
      </View>

      <View style={{ height: 1, backgroundColor: COLORS.line }} />

      <View style={{ gap: 4 }}>
        <Text style={{ paddingHorizontal: 12, paddingBottom: 4, color: COLORS.softMuted, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 }}>TOOLS</Text>
        {TOOL_ITEMS.map((item) => <SidebarLink key={item.href} item={item} pathname={pathname} />)}
      </View>

      <View style={{ flex: 1 }} />
      <SidebarLink item={{ label: 'Settings', href: '/settings', icon: 'settings' }} pathname={pathname} />
    </View>
  );
}
