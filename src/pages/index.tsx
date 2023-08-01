import React, {useCallback, useEffect} from 'react';
import spotify from '@api/spotify';
import Lyrics from '@pages/lyrics';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import Loading from '@components/loading';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import {SPOTIFY_CLIENT_ID, TOKENSWAP_DOMAIN} from '@env';

import * as WebBrowser from 'expo-web-browser';
import {makeRedirectUri, ResponseType, useAuthRequest} from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {applicationId} from 'expo-application';

WebBrowser.maybeCompleteAuthSession();

type unsetBoolean = true | false | 'unset';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const [authState, setAuthState] = React.useState<unsetBoolean>('unset');

  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Code,
      clientId: SPOTIFY_CLIENT_ID, // available on the app page
      redirectUri: makeRedirectUri({
        scheme: applicationId,
        path: 'oauth',
      }),
      usePKCE: false,
      scopes: [
        'user-read-currently-playing',
        'user-modify-playback-state',
        'user-read-playback-state',
      ], // the scopes you need to acces
    },
    {
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      tokenEndpoint: `https://${TOKENSWAP_DOMAIN}/api/token`,
    },
  );

  React.useEffect(() => {
    (async () => {
      const tokens = await AsyncStorage.multiGet([
        'spotify:accessToken',
        'spotify:refreshToken',
      ]);
      if (tokens[0][1] && tokens[1][1]) {
        spotify.setAccessToken(tokens[0][1]);
        spotify.setRefreshToken(tokens[1][1]);
        try {
          await spotify.getMe();
          return setAuthState(true);
        } catch (error) {
          AsyncStorage.multiRemove([
            'spotify:accessToken',
            'spotify:refreshToken',
          ]);
        }
      }
      setAuthState(false);
    })();
    return;
  }, []);

  React.useEffect(() => {
    (async () => {
      if (response?.type === 'success') {
        const codes = await fetch(`https://${TOKENSWAP_DOMAIN}/api/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `code=${response.params.code}`,
        }).then(res => res.json());
        spotify.setAccessToken(codes.access_token);
        spotify.setRefreshToken(codes.refresh_token);
        await AsyncStorage.multiSet([
          ['spotify:accessToken', codes.access_token],
          ['spotify:refreshToken', codes.refresh_token],
        ]);
        setAuthState(true);
      }
    })();
  }, [response]);

  return (
    <View style={[{width: '100%', height: '100%'}]}>
      <StatusBar
        style={isDarkMode ? 'light' : 'dark'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      {authState === true ? (
        <Lyrics />
      ) : authState === false ? (
        <View style={{paddingTop: 30}}>
          <Text>Please log in with spotify</Text>
          <View
            style={[
              {
                width: '70%',
                height: 50,
                borderRadius: 10,
              },
              styles.center,
            ]}>
            <Button onPress={() => promptAsync()} title="Log In" />
          </View>
        </View>
      ) : (
        <Loading fadeOutDuration={100} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
    width: '100%',
  },
});

export default App;
