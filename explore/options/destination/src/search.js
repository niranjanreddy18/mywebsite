// Nominatim search helper with debounce and suggestions
    export async function nominatimSearch(q, limit = 6) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      return data.map(item => ({
        display: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
        category: item.class,
        address: item.address || {}
      }));
    }

    // Suggest capitals via restcountries API when country string present
    export async function getCapitalForCountryName(countryName) {
      try {
        const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=false`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data || !data[0]) return null;
        const c = data[0];
        const capital = (c.capital && c.capital[0]) || null;
        return capital;
      } catch (e) {
        return null;
      }
    }
