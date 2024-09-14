export type State = {
  timestamp: number;
  lat: number;
  lon: number;
  alt: number;
  check: boolean;
};
export const current = (z: number, check: boolean) =>
  new Promise<State>((resolve) =>
    navigator.geolocation.getCurrentPosition((position) =>
      resolve({
        timestamp: position.timestamp / 1000 >>> 0,
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        alt: z,
        check,
      })
    )
  );
