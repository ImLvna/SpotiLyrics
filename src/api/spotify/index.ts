import SpotifyApi from 'spotify-web-api-node';
import { applicationId } from 'expo-application';
import { makeRedirectUri } from 'expo-auth-session';
import { SPOTIFY_CLIENT_ID } from '@env';

export default new SpotifyApi({
  clientId: SPOTIFY_CLIENT_ID,
  redirectUri: makeRedirectUri({
    scheme: applicationId,
    path: 'oauth',
  }),
});
