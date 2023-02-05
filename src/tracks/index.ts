export type TypedTrackMap = {
  y: 0;
  x: 0;
  z: 0;
  type: 0;
};
export type TrackMapCoords = {
  y: 0;
  x: 0;
  z: 0;
};
export type Coords = number[];
export type MappedTrackCoordsMap = Record<string, TrackMapCoords[]>;
export type MappedCoordsMap = Record<string, Coords[]>;

interface NavigationStateResponse {
  loadingStatus: {
    track: {
      categoryLocalizationRaw: Record<string, any>;
      track: string;
      sig: string;
      sceneDesc: string;
      length: string;
      trackmap: TypedTrackMap[];
      localizationRaw: Record<string, any>;
      type: string;
      venue: string;
    };
    percentage: number;
    isLoading: false;
  };
  state: {
    gameSession: string;
    appBuild: number;
    gamePhase: string;
    internalStateCode: string;
    navigationState: string;
    gameState: string;
    settingMode: string;
    user: {
      userState: string;
      isAdmin: false;
    };
    steamBetaBranchName: string;
  };
}

interface RaceTrackResponse {
  layout: string;
  sceneDesc: string;
  year: string;
  localizations: Record<string, any>;
  categoryLocalizations: Record<string, any>;
  name: string;
  length: string;
  description: string;
  id: string;
  shortName: string;
  type: string;
  image: string;
  thumbnail: string;
}

export const getTracks = async (): Promise<
  Record<string, RaceTrackResponse> | undefined
> => {
  //: Promise<NavigationStateResponse> => {
  try {
    const response = await fetch("http://localhost:8080/rest/race/track", {
      headers: { Acccept: "application/json" },
    });
    const data = (await response.json()) as unknown as RaceTrackResponse[];
    return data.reduce((acc, cv) => {
      return {
        ...acc,
        [cv.name]: cv,
      };
    }, {});
  } catch (err) {
    return undefined;
  }
};

export const getNavigationState = async () => {
  try {
    const response = await fetch("http://localhost:8080/navigation/state", {
      headers: { Acccept: "application/json" },
    });
    const data = (await response.json()) as unknown as NavigationStateResponse;
    return data;
  } catch (err) {
    return undefined;
  }
};

export const getTrackData = async (id: string) => {
  try {
    const response = await fetch(
      `http://localhost:8080/rest/race/track/${id}/trackmape`,
      {
        headers: { Acccept: "application/json" },
      }
    );
    const data = (await response.json()) as unknown as NavigationStateResponse;
    return data;
  } catch (err) {
    return undefined;
  }
};

const c = (n: number) => Math.floor(n);

export const mapTrackPathsByType = (trackmap: TypedTrackMap[]) =>
  trackmap.reduce<MappedCoordsMap>((acc, { z, y, x, type }) => {
    if (!acc[type]) {
      acc[type] = [];
    }
    // acc[type].push({ z, y, x });
    acc[type].push([c(x), c(y), c(z)]);
    return acc;
  }, {}) as MappedCoordsMap;

export const trackData = async () => {
  const tracks = await getTracks();
  const state = await getNavigationState();
  const currentTrackName = state?.loadingStatus.track.track as string;

  if (tracks && currentTrackName) {
    // const track = tracks[currentTrackName];
    // console.log(track);

    const paths = mapTrackPathsByType(
      state?.loadingStatus.track.trackmap || []
    );

    return {
      track: paths[0],
      pit: paths[1],
    };
  }

  return {};
};
