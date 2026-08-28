import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionErrorCode,
} from 'expo-speech-recognition';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, RADIUS } from '@/constants/theme';

type VoiceCaptureSheetProps = {
  visible: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
};

type CaptureState = 'idle' | 'requesting' | 'listening' | 'processing' | 'error';

function describeError(code: ExpoSpeechRecognitionErrorCode) {
  switch (code) {
    case 'not-allowed': return 'Microphone access is off. You can allow it in Android Settings, or keep typing below.';
    case 'no-speech':
    case 'speech-timeout': return 'I didn’t catch anything. Try one short sentence.';
    case 'service-not-allowed':
    case 'language-not-supported': return 'Offline speech is not installed for English on this phone yet. Download the English voice model in your system speech settings.';
    case 'network': return 'The phone speech service asked for a network. Nothing was saved by FocusFlow; you can type instead.';
    default: return 'Voice capture stopped. You can try again or type the task instead.';
  }
}

export function VoiceCaptureSheet({ visible, onClose, onTranscript }: VoiceCaptureSheetProps) {
  const insets = useSafeAreaInsets();
  const [state, setState] = React.useState<CaptureState>('idle');
  const [transcript, setTranscript] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  useSpeechRecognitionEvent('start', () => {
    setState('listening');
    setError(null);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const next = event.results[0]?.transcript?.trim() ?? '';
    if (next) setTranscript(next);
    if (event.isFinal) setState('processing');
  });

  useSpeechRecognitionEvent('end', () => {
    setState((current) => current === 'listening' ? (transcript.trim() ? 'processing' : 'idle') : current);
  });

  useSpeechRecognitionEvent('error', (event) => {
    setError(describeError(event.error));
    setState('error');
  });

  const startListening = React.useCallback(async () => {
    setState('requesting');
    setError(null);
    setTranscript('');
    try {
      if (process.env.EXPO_OS === 'web' || !ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setError('Voice capture needs the Android app build. You can still type the next thing here.');
        setState('error');
        return;
      }
      if (!ExpoSpeechRecognitionModule.supportsOnDeviceRecognition()) {
        setError('This phone does not have an offline English speech model ready. You can type now, or install one in system speech settings.');
        setState('error');
        return;
      }
      let language = 'en-US';
      try {
        const locales = await ExpoSpeechRecognitionModule.getSupportedLocales({});
        const installedEnglish = locales.installedLocales.find((locale) => /^en[-_]/i.test(locale));
        if (installedEnglish) language = installedEnglish;
        else if (process.env.EXPO_OS === 'android' && locales.installedLocales.length > 0) {
          setError('Install an English offline speech model in your system speech settings, then try again.');
          setState('error');
          return;
        }
      } catch {
        // The default en-US recognizer remains the best cross-platform fallback.
      }
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission is needed for voice capture. Nothing is recorded until you choose Allow.');
        setState('error');
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: true,
        continuous: false,
        requiresOnDeviceRecognition: true,
        addsPunctuation: true,
        contextualStrings: ['task', 'today', 'tomorrow', 'next Monday', 'focus', 'inbox'],
      });
    } catch {
      setError('Voice capture is unavailable right now. Your task is still safe to type locally.');
      setState('error');
    }
  }, []);

  React.useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => { void startListening(); }, 0);
    return () => {
      clearTimeout(timer);
      try { ExpoSpeechRecognitionModule.abort(); } catch { /* module can be unavailable on web */ }
    };
  }, [startListening, visible]);

  function close() {
    try { ExpoSpeechRecognitionModule.abort(); } catch { /* module can be unavailable on web */ }
    onClose();
  }

  function useTask() {
    const value = transcript.trim();
    if (!value) {
      setError('Say a short task first, like “send the draft tomorrow at 3pm”.');
      setState('error');
      return;
    }
    close();
    onTranscript(value);
  }

  const isListening = state === 'listening' || state === 'requesting';
  const status = state === 'requesting' ? 'Getting ready…' : state === 'listening' ? 'Listening…' : state === 'processing' ? 'Ready to edit' : state === 'error' ? 'Voice paused' : 'Say one clear next thing';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20, 19, 26, 0.42)' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close voice capture" onPress={close} style={{ flex: 1 }} />
        <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: Math.max(insets.bottom, 12) + 12, gap: 18, backgroundColor: COLORS.canvas, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.line }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 }}>
              <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: isListening ? COLORS.coralSoft : COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                {state === 'requesting' ? <ActivityIndicator color={COLORS.primary} /> : <Glyph name="mic" size={21} color={isListening ? COLORS.coral : COLORS.primary} />}
              </View>
              <View style={{ gap: 3, flex: 1 }}>
                <Text selectable style={{ color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>Voice to task</Text>
                <Text selectable style={{ color: COLORS.muted, fontSize: 12, fontWeight: '700' }}>{status}</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close voice capture" onPress={close} hitSlop={8} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' }}><Glyph name="close" size={18} color={COLORS.muted} /></Pressable>
          </View>

          <View style={{ minHeight: 110, padding: 16, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: isListening ? COLORS.coral : COLORS.line, justifyContent: 'center' }}>
            <Text selectable style={{ color: transcript ? COLORS.ink : COLORS.softMuted, fontSize: 17, lineHeight: 24, fontWeight: '700' }}>{transcript || (isListening ? 'Speak naturally. Dates like “tomorrow at 3pm” become editable chips.' : 'Your words will appear here before anything is saved.')}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, gap: 4 }}><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '800' }}>PRIVATE BY DEFAULT</Text><Text style={{ color: COLORS.softMuted, fontSize: 11, lineHeight: 16, fontWeight: '600' }}>On-device recognition · no audio stored</Text></View>
            {isListening ? <Pressable accessibilityRole="button" accessibilityLabel="Stop listening" onPress={() => { try { ExpoSpeechRecognitionModule.stop(); } catch { /* module can be unavailable on web */ } }} style={{ minHeight: 48, paddingHorizontal: 16, borderRadius: RADIUS.pill, backgroundColor: COLORS.coralSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.coral, fontSize: 13, fontWeight: '900' }}>Stop</Text></Pressable> : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Use voice transcript" onPress={useTask} style={{ minHeight: 48, paddingHorizontal: 17, borderRadius: RADIUS.pill, backgroundColor: transcript ? COLORS.primary : COLORS.line, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: transcript ? COLORS.white : COLORS.muted, fontSize: 13, fontWeight: '900' }}>Use task</Text></Pressable>
          </View>
          {error ? <Text selectable accessibilityLiveRegion="polite" style={{ color: COLORS.coral, fontSize: 12, lineHeight: 17, fontWeight: '700' }}>{error}</Text> : null}
          {state === 'error' ? <Pressable accessibilityRole="button" accessibilityLabel="Try voice capture again" onPress={() => void startListening()} style={{ minHeight: 48, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>Try again</Text></Pressable> : null}
        </View>
      </View>
    </Modal>
  );
}
