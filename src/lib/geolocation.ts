import { State } from "./xata.ts";

export const locate = (z: number) =>
  new Promise<State>((resolve) =>
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          timestamp: position.timestamp / 1000 >>> 0,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          alt: z,
        }),
      null,
      { enableHighAccuracy: true },
    )
  );
