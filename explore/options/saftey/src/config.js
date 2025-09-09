// Defaults intentionally empty to prefer explicit URL params.
    export const DEFAULTS = {
      country: "",
      city: "",
      month: "",
      nationality: ""
    };

    export function buildExampleLink(base = location.href) {
      const url = new URL(base);
      url.searchParams.set("country", "Japan");
      url.searchParams.set("city", "Tokyo");
      url.searchParams.set("month", new Date().toISOString().slice(0,7));
      url.searchParams.set("nationality", "United States");
      return url.toString();
    }
