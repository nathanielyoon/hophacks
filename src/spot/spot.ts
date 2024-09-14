export type Spot = {
  spot_id: number;
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  stays: Stay[];
};
export type Stay = {
  start: number;
  end: number;
  occupancy: number;
  latitude: number;
  longitude: number;
  altitude: number;
};
export const id = () => {};
