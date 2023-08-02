import {
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  LayoutChangeEvent,
  Dimensions,
} from 'react-native';
import React from 'react';

import spotify from '@api/spotify';

import Loading from '@components/loading';

interface LyricsBase {
  error: boolean;
}
interface Line {
  startTimeMs: number;
  words: string;
  syllables: [];
  endTimeMs: number;
}
interface ApiLine {
  startTimeMs: string;
  endTimeMs: string;
  syllables: [];
  words: string;
}
interface ApiLyrics extends LyricsBase {
  error: false;
  syncType: 'LINE_SYNCED' | 'UNSYNCED';
  lines: ApiLine[];
}
interface LyricsError extends LyricsBase {
  error: true;
  message: string;
}

interface iSongData extends SpotifyApi.TrackObjectFull {
  is_playing: boolean;
}

let _ms = 0;
let msDelta = 40;

export default function Lyrics() {
  const [isReady, setReady] = React.useState(false);
  const [songData, setSongData] = React.useState<iSongData | null>(null);

  const [lyrics, setLyrics] = React.useState<Line[]>([]);

  const [interval, _setInterval] = React.useState(500);

  const [ms, setMs] = React.useState(0);

  const scrollView = React.useRef<ScrollView>(null);

  const refreshData = React.useCallback(async () => {
    const refreshLyrics = async (id: string, duration: number) => {
      try {
        console.log('Fetching lrics...');
        const data = await fetch(
          `https://spotify-lyric-api.herokuapp.com/?trackid=${id}`,
        );
        let json = (await data.json()) as ApiLyrics | LyricsError;
        if (json.error) {
          throw new Error(json.message);
        }
        json = json as ApiLyrics;
        if (json.syncType === 'UNSYNCED') {
          throw new Error('Unsynced lyrics');
        }
        const tempLyrics: Line[] = [];
        json.lines.forEach((apiLine: ApiLine, index) => {
          const line = apiLine as unknown as Line;
          line.startTimeMs = Number(line.startTimeMs);
          line.endTimeMs = Number(line.endTimeMs);

          const _json = json as ApiLyrics;
          if (line.endTimeMs === 0 && index !== _json.lines.length - 1) {
            line.endTimeMs = Number(_json.lines[index + 1]!.startTimeMs);
          } else if (index === _json.lines.length - 1) {
            line.endTimeMs = duration;
          }
          if (line.words === '') {
            line.words = '♪'; // This character will be parsed as a break in lyrics
          }
          tempLyrics.push(line);
        });
        if (tempLyrics.length !== 0 && tempLyrics[0].startTimeMs !== 0) {
          tempLyrics.unshift({
            startTimeMs: 0,
            endTimeMs: tempLyrics[0].startTimeMs,
            words: '♪',
            syllables: [],
          });
        }
        setLyrics(tempLyrics);
        _setInterval(500);
      } catch (error) {
        setLyrics([]);
        _setInterval(5000);
      }
      return;
    };

    try {
      const data = await spotify.getMyCurrentPlaybackState();
      if (!data.body.item) {
        throw new Error('No song playing');
      }
      console.log(
        `We are ${Math.abs(data.body.progress_ms! - _ms)}ms ${
          _ms < data.body.progress_ms! ? 'behind' : 'ahead'
        }`,
      );
      if (Math.abs(data.body.progress_ms! - _ms) > 20) {
        console.log(
          `Adjusting msDelta from ${msDelta} to ${
            msDelta + (_ms < data.body.progress_ms! ? 1 : -1)
          }`,
        );
        msDelta += _ms < data.body.progress_ms! ? 1 : -1;
      }
      _ms = data.body.progress_ms!;
      setMs(data.body.progress_ms!);
      if (!songData?.id || songData.id !== data.body.item.id) {
        setLyrics([]);
        setReady(false);
        await refreshLyrics(data.body.item.id, data.body.item.duration_ms);
        scrollView.current?.scrollTo({ y: 0 });
        setReady(true);
      }
      const item = data.body.item as iSongData;
      item.is_playing = data.body.is_playing;
      setSongData(item);
      setReady(true);
    } catch (error) {
      setReady(false);
    }
  }, [songData]);

  const skipSong = React.useCallback(async () => {
    try {
      await spotify.skipToNext();
      refreshData();
    } catch (error) {}
  }, [refreshData]);

  const previousSong = React.useCallback(async () => {
    try {
      await spotify.skipToPrevious();
      refreshData();
    } catch (error) {}
  }, [refreshData]);

  const pauseSong = React.useCallback(async () => {
    try {
      if (songData?.is_playing) {
        await spotify.pause();
      } else {
        await spotify.play();
      }
      refreshData();
    } catch (error) {}
  }, [refreshData, songData]);

  React.useEffect(() => {
    const _interval = setInterval(refreshData, interval);
    return () => clearInterval(_interval);
  }, [refreshData, interval]);

  React.useEffect(() => {
    const int = setInterval(() => {
      if (songData?.is_playing) {
        setMs(_ms + msDelta);
        _ms = _ms + msDelta;
      }
    }, 0);
    return () => clearInterval(int);
  }, [songData]);
  // console.log(lyrics);

  const scroll = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { y } = event.nativeEvent.layout;
      if (y > 0) {
        // center the current line
        const screenHeight = Dimensions.get('window').height;
        const scrollHeight = event.nativeEvent.layout.height;
        const scrollOffset = y;
        const scrollPosition = scrollOffset - (screenHeight - scrollHeight) / 2;
        scrollView.current?.scrollTo({
          y: scrollPosition,
          animated: true,
        });
      }
    },
    [scrollView],
  );

  async function tapLyric(toMs: number) {
    await spotify.seek(toMs);
    setMs(toMs);
  }

  return (
    <View style={styles.container}>
      {isReady && songData ? (
        <View style={styles.container}>
          <View style={styles.buttons}>
            <Button onPress={skipSong} title="Skip" />
            <Button onPress={pauseSong} title="Pause" />
            <Button onPress={previousSong} title="Back" />
          </View>
          <Text>{songData.name}</Text>
          <Text>{songData.artists[0].name}</Text>
          <Text>{songData.album.name}</Text>
          <Text>{ms}</Text>
          {lyrics.length === 0 ? (
            <Text>No lyrics found</Text>
          ) : (
            <ScrollView ref={scrollView}>
              <Text>{[...Array(20)].map((_, __) => '\n')}</Text>
              {lyrics
                .filter(line => line.startTimeMs < ms && line.endTimeMs < ms)
                .map(line => (
                  <Text
                    style={styles.lyric}
                    key={line.startTimeMs}
                    onPress={() => tapLyric(line.startTimeMs)}>
                    {line.words}
                  </Text>
                ))}
              {lyrics
                .filter(line => line.startTimeMs < ms && line.endTimeMs > ms)
                .map(line => (
                  <Text
                    style={[styles.lyric, styles.currentLyric]}
                    key={line?.startTimeMs}
                    onLayout={scroll}
                    nativeID={line?.startTimeMs.toString()}>
                    {line?.words}
                  </Text>
                ))}
              {lyrics
                .filter(line => line.endTimeMs > ms && line.startTimeMs > ms)
                .map(line => (
                  <Text
                    style={styles.lyric}
                    key={line.startTimeMs}
                    onPress={() => tapLyric(line.startTimeMs)}>
                    {line.words}
                  </Text>
                ))}
              <Text>{[...Array(20)].map((_, __) => '\n')}</Text>
            </ScrollView>
          )}
        </View>
      ) : (
        <Loading fadeOutDuration={500} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  buttons: {
    backgroundColor: '#333',
    opacity: 0.75,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '10%',
    display: 'flex',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 999,
  },

  lyric: {
    textAlign: 'center',
    fontSize: 20,
    padding: 10,
  },
  currentLyric: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});
