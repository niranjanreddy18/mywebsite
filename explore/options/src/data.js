// Data module: exports destinations, stays, transport, culture, community, safety
    export const destinations = [
      {
        id: 'kyoto',
        name: 'Kyoto, Japan',
        lat: 35.0116,
        lng: 135.7681,
        region: 'Asia',
        summary: 'Ancient temples, tea houses, traditional culture and seasonal beauty.',
        thumbnail: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=800&auto=format&fit=crop',
        stay: [
          { name: 'Machiya Guesthouse', type: 'Guesthouse', price: '¥6,500/night', booking: '#' },
          { name: 'Central Ryokan', type: 'Ryokan', price: '¥12,000/night', booking: '#' }
        ],
        transport: [
          { mode: 'Train', info: 'Extensive JR & private rail network. IC cards accepted.' },
          { mode: 'Bicycle', info: 'Popular for short distances and sightseeing.' }
        ],
        culture: [
          'Visit Fushimi Inari early morning to avoid crowds.',
          'Etiquette: bow slightly when receiving services; remove shoes where required.'
        ],
        community: [
          { title: 'Local Volunteers Meetup', date: 'Every Saturday', link: '#' },
          { title: 'Guided Night Walks', date: 'Fri Nights', link: '#' }
        ],
        safety: [
          { level: 'Low', notes: 'Generally very safe. Watch for typhoon season (Sep-Oct).' },
          { level: 'Health', notes: 'Bring cash; some smaller places are cash-only.' }
        ]
      },
      {
        id: 'lisbon',
        name: 'Lisbon, Portugal',
        lat: 38.7223,
        lng: -9.1393,
        region: 'Europe',
        summary: 'Hills, pastel buildings, tram lines, seafood and sunny viewpoints.',
        thumbnail: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=800&auto=format&fit=crop',
        stay: [
          { name: 'Alfama Studio', type: 'Apartment', price: '€75/night', booking: '#' },
          { name: 'Riverside Hotel', type: 'Hotel', price: '€120/night', booking: '#' }
        ],
        transport: [
          { mode: 'Tram', info: 'Historic trams A and 28 traverse the hills.' },
          { mode: 'Ferry', info: 'Short river ferries across the Tagus.' }
        ],
        culture: [
          'Catch a fado performance in Alfama or Bairro Alto.',
          'Try pastéis de nata from a local bakery (freshness matters).'
        ],
        community: [
          { title: 'Street Food Nights', date: 'Wednesdays', link: '#' }
        ],
        safety: [
          { level: 'Pickpocket', notes: 'Exercise caution on trams and tourist hotspots.' },
          { level: 'Health', notes: 'Sunscreen recommended in summer.' }
        ]
      },
      {
        id: 'newyork',
        name: 'New York, USA',
        lat: 40.7128,
        lng: -74.0060,
        region: 'North America',
        summary: 'Fast-paced metropolis: museums, diverse food, neighborhoods to explore.',
        thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop',
        stay: [
          { name: 'Midtown Hotel', type: 'Hotel', price: '$180/night', booking: '#' },
          { name: 'Brooklyn Loft', type: 'Apartment', price: '$150/night', booking: '#' }
        ],
        transport: [
          { mode: 'Subway', info: '24/7 subway; consider MetroCard or contactless payments.' },
          { mode: 'Bike', info: 'Citi Bike stations available.' }
        ],
        culture: [
          'Explore museums early; many have late nights with discounts.',
          'Neighborhood dining offers global cuisine; tip culturally expected ~15-20%.'
        ],
        community: [
          { title: 'Open Mic Nights', date: 'Various', link: '#' },
          { title: 'Volunteer Park Cleanups', date: 'Monthly', link: '#' }
        ],
        safety: [
          { level: 'General', notes: 'Stay aware in crowded transit hubs. Use official cabs or rideshare.' },
          { level: 'Health', notes: 'Seasonal allergies are common in spring.' }
        ]
      }
    ];

    export const destIndex = destinations.reduce((acc, d) => {
      acc[d.id] = d;
      return acc;
    }, {});
