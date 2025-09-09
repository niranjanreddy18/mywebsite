// Mock data loader and query APIs
    export async function fetchHotels() {
      const res = await fetch('data/hotels.json');
      return await res.json();
    }

    export async function fetchTransports() {
      const res = await fetch('data/transports.json');
      return await res.json();
    }

    export function filterHotels(hotels, { query = '', petFriendly = false, minRating = 0, maxPrice = Infinity }) {
      const q = query.trim().toLowerCase();
      return hotels.filter(h => {
        if (q) {
          const found = h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q);
          if (!found) return false;
        }
        if (petFriendly && !h.amenities.includes('pet_friendly')) return false;
        if (h.rating < minRating) return false;
        if (h.price > maxPrice) return false;
        return true;
      });
    }

    export function filterTransports(transports, { query = '', type = null, petFriendly = false, maxPrice = Infinity }) {
      const q = query.trim().toLowerCase();
      return transports.filter(t => {
        if (q) {
          const found = t.route.toLowerCase().includes(q) || t.carrier.toLowerCase().includes(q);
          if (!found) return false;
        }
        if (type && type !== 'all' && t.type !== type) return false;
        if (petFriendly && !t.amenities.includes('pet_friendly')) return false;
        if (t.price > maxPrice) return false;
        return true;
      });
    }

    export function sortResults(list, method) {
      const copy = [...list];
      switch (method) {
        case 'price-asc': return copy.sort((a,b) => a.price - b.price);
        case 'price-desc': return copy.sort((a,b) => b.price - a.price);
        case 'rating-desc': return copy.sort((a,b) => (b.rating || 0) - (a.rating || 0));
        default: return copy;
      }
    }
