// Data module: place listings and helpers
    export const places = [
      {
        id: 'emerald-lake',
        title: 'Emerald Lake',
        season: 'Summer',
        nearby: true,
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3'
      },
      {
        id: 'ancient-temple',
        title: 'Ancient Temple',
        season: 'All',
        nearby: false,
        image: 'https://images.unsplash.com/photo-1505765051356-1c07a07c3ec2?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3'
      },
      {
        id: 'sunset-beach',
        title: 'Sunset Beach',
        season: 'Summer',
        nearby: true,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3'
      },
      {
        id: 'mossy-forest',
        title: 'Mossy Forest Trails',
        season: 'Spring',
        nearby: false,
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3'
      },
      {
        id: 'city-food-lanes',
        title: 'City Food Lanes',
        season: 'All',
        nearby: true,
        image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3'
      },
      {
        id: 'mountain-trek',
        title: 'Mountain Trek',
        season: 'Autumn',
        nearby: false,
        image: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3'
      }
    ];

    export function findPlaceById(id) {
      return places.find(p => p.id === id);
    }

    export function getNearbyPlaces(limit = 3) {
      return places.filter(p => p.nearby).slice(0, limit);
    }

    export function getSeasonalPlaces(season = 'Summer', limit = 3) {
      // return places that match season or are marked 'All'
      return places.filter(p => p.season === season || p.season === 'All').slice(0, limit);
    }
