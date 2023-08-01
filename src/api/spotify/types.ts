/* eslint-disable @typescript-eslint/no-unused-vars */

export type Callback<T> = (error: Error, response: ApiResponse<T>) => void;

export interface ApiResponse<T> {
  body: T;
  headers: Record<string, string>;
  statusCode: number;
}

export interface Credentials {
  accessToken?: string | undefined;
  clientId?: string | undefined;
  clientSecret?: string | undefined;
  redirectUri?: string | undefined;
  refreshToken?: string | undefined;
}

export interface Track {
  positions?: ReadonlyArray<number> | undefined;
  uri: string;
}

export interface LimitOptions {
  limit?: number | undefined;
}

export interface PaginationOptions extends LimitOptions {
  offset?: number | undefined;
}

export interface DeviceOptions {
  device_id?: string | undefined;
}

export interface MarketOptions {
  market?: string | undefined;
}

export interface FieldsOptions {
  fields?: string | undefined;
}

export interface PublicOptions {
  public?: boolean | undefined;
}

export interface SnapshotOptions {
  snapshot_id?: string | undefined;
}

export interface CountryOptions {
  country?: string | undefined;
}

export interface BeforeOptions extends LimitOptions {
  before?: number | undefined;
}

export interface AfterOptions<T extends number | string> extends LimitOptions {
  after?: T | undefined;
}

export interface LocaleOptions extends CountryOptions {
  locale?: string | undefined;
}

export interface PaginationMarketOptions
  extends PaginationOptions,
    MarketOptions {}

export interface PaginationCountryOptions
  extends PaginationOptions,
    CountryOptions {}

export interface PaginationLocaleOptions
  extends PaginationOptions,
    LocaleOptions {}

export interface GetPlaylistOptions extends MarketOptions, FieldsOptions {}

export interface PlaylistDetailsOptions extends PublicOptions {
  collaborative?: boolean | undefined;
  description?: string | undefined;
}

export interface ChangePlaylistOptions extends PlaylistDetailsOptions {
  name?: string | undefined;
}

export interface PositionOptions {
  position?: number | undefined;
}

export interface GetArtistAlbumsOptions extends PaginationCountryOptions {
  include_groups?: string | undefined;
}

export interface GetPlaylistTracksOptions
  extends PaginationMarketOptions,
    FieldsOptions {}

type SearchType =
  | 'album'
  | 'artist'
  | 'playlist'
  | 'track'
  | 'show'
  | 'episode';

export interface SearchOptions extends PaginationMarketOptions {
  include_external?: 'audio' | undefined;
}

export interface ReorderPlaylistTracksOptions extends SnapshotOptions {
  range_length?: number | undefined;
}

export interface GetRecommendationsOptions extends LimitOptions, MarketOptions {
  max_acousticness?: number | undefined;
  max_danceability?: number | undefined;
  max_duration_ms?: number | undefined;
  max_energy?: number | undefined;
  max_instrumentalness?: number | undefined;
  max_key?: number | undefined;
  max_liveness?: number | undefined;
  max_loudness?: number | undefined;
  max_mode?: number | undefined;
  max_popularity?: number | undefined;
  max_speechiness?: number | undefined;
  max_tempo?: number | undefined;
  max_time_signature?: number | undefined;
  max_valence?: number | undefined;
  min_acousticness?: number | undefined;
  min_danceability?: number | undefined;
  min_duration_ms?: number | undefined;
  min_energy?: number | undefined;
  min_instrumentalness?: number | undefined;
  min_key?: number | undefined;
  min_liveness?: number | undefined;
  min_loudness?: number | undefined;
  min_mode?: number | undefined;
  min_popularity?: number | undefined;
  min_speechiness?: number | undefined;
  min_tempo?: number | undefined;
  min_time_signature?: number | undefined;
  min_valence?: number | undefined;
  seed_artists?: ReadonlyArray<string> | string | undefined;
  seed_genres?: ReadonlyArray<string> | string | undefined;
  seed_tracks?: ReadonlyArray<string> | string | undefined;
  target_acousticness?: number | undefined;
  target_danceability?: number | undefined;
  target_duration_ms?: number | undefined;
  target_energy?: number | undefined;
  target_instrumentalness?: number | undefined;
  target_key?: number | undefined;
  target_liveness?: number | undefined;
  target_loudness?: number | undefined;
  target_mode?: number | undefined;
  target_popularity?: number | undefined;
  target_speechiness?: number | undefined;
  target_tempo?: number | undefined;
  target_time_signature?: number | undefined;
  target_valence?: number | undefined;
}

export interface GetTopOptions extends PaginationOptions {
  time_range?: 'long_term' | 'medium_term' | 'short_term' | undefined;
}

export interface TransferPlaybackOptions {
  play?: boolean | undefined;
}

export interface PlayOptions extends DeviceOptions {
  context_uri?: string | undefined;
  uris?: ReadonlyArray<string> | undefined;
  offset?: { position: number } | { uri: string } | undefined;
  position_ms?: number | undefined;
}

type RepeatState = 'track' | 'context' | 'off';

export interface GetFeaturedPlaylistsOptions extends PaginationLocaleOptions {
  timestamp?: string | undefined;
}

/**
 * Response returned when using Client Credentials authentication flow
 * https://developer.spotify.com/documentation/general/guides/authorization-guide/#example-4
 */
export interface ClientCredentialsGrantResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Response returned when requesting for access token
 * https://developer.spotify.com/documentation/general/guides/authorization-guide/#2-have-your-application-request-refresh-and-access-tokens-spotify-returns-access-and-refresh-tokens
 */
export interface AuthorizationCodeGrantResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

/**
 * Response returned when requesting new access token (via refresh token)
 * https://developer.spotify.com/documentation/general/guides/authorization-guide/#4-requesting-a-refreshed-access-token-spotify-returns-a-new-access-token-to-your-app
 * https://developer.spotify.com/documentation/general/guides/authorization-guide/#6-requesting-a-refreshed-access-token
 */
export interface RefreshAccessTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string | undefined;
  scope: string;
  token_type: string;
}

// Type definitions for The Spotify Web API (including changes March 29th 2016)
// Project: https://developer.spotify.com/web-api/
// Definitions by: Niels Kristian Hansen Skovmand <https://github.com/skovmand>
//                 Magnar Ovedal Myrtveit <https://github.com/Stadly>
//                 Nils Måsén <https://github.com/piksel>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.2

// Release comments:
// -----------------

// The audio analysis object is not yet in the Object Model at Spotify, therefore it is typed as any in this file.

// TrackObjects and AlbumObjects is specified in the docs as always having the available_markets property,
// but when it is sent in https://developer.spotify.com/web-api/console/get-current-user-saved-tracks
// the available_markets are missing. Therefore it is marked as optional in this source code.
