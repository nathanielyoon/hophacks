export type Position = [timestamp: number, latitude: number, longitude: number];
export const current = () =>
  new Promise<Position>((resolve) =>
    navigator.geolocation.getCurrentPosition((position) =>
      resolve([
        position.timestamp,
        position.coords.latitude,
        position.coords.longitude,
      ])
    )
  );
