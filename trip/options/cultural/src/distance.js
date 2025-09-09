// distance.js - haversine distance + ETA estimate

    const EARTH_RADIUS_KM = 6371;

    export function calculateDistanceKm([lat1, lon1], [lat2, lon2]) {
      const toRad = (d) => d * Math.PI / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return EARTH_RADIUS_KM * c;
    }

    export function estimateTime(km, mode = 'drive') {
      const speeds = { walk: 5, bike: 15, drive: 50 };
      const v = speeds[mode] || speeds.drive;
      const hours = km / v;
      if (hours < 1/60) return 'Under 1 min';
      const minutes = Math.round(hours * 60);
      if (minutes < 60) return `${minutes} min`;
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hrs}h ${mins}m`;
    }

    export { calculateDistanceKm as calculateDistance };
