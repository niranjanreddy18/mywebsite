// Lightweight client-side "API" using localStorage for persistence
    const STORAGE_KEY = 'wanderly:v1';

    const defaultData = {
      destinations: [
        {
          id: 'bali',
          name: 'Bali, Indonesia',
          region: 'Asia',
          rating: 4.8,
          img: 'https://images.unsplash.com/photo-1505691723518-36a0b3c3c2b8?w=1200&q=80&auto=format&fit=crop',
          pano: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2400&q=80&auto=format&fit=crop',
          tags: ['beach', 'culture', 'surf']
        },
        {
          id: 'iceland',
          name: 'Iceland Highlands',
          region: 'Europe',
          rating: 4.9,
          img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop',
          pano: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2400&q=80&auto=format&fit=crop',
          tags: ['nature', 'northern-lights', 'adventure']
        },
        {
          id: 'kyoto',
          name: 'Kyoto, Japan',
          region: 'Asia',
          rating: 4.7,
          img: 'https://images.unsplash.com/photo-1549693578-d683be217e58?w=1200&q=80&auto=format&fit=crop',
          pano: 'https://images.unsplash.com/photo-1505765052748-63b6c0d98b8f?w=2400&q=80&auto=format&fit=crop',
          tags: ['culture', 'temples', 'food']
        }
      ],
      wishlist: [],
      reviews: {
        // example: 'bali': [{id,name,rating,text,date}]
      }
    };

    function load(){
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return structuredClone(defaultData);
      }
      try{
        return JSON.parse(raw);
      }catch(e){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return structuredClone(defaultData);
      }
    }

    function save(state){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function getDestinations(){
      const s = load();
      return s.destinations;
    }

    function getDestinationById(id){
      const s = load();
      return s.destinations.find(d=>d.id===id);
    }

    function getReviews(destId){
      const s = load();
      return s.reviews[destId] ? [...s.reviews[destId]].reverse() : [];
    }

    function addReview(destId, name, rating, text){
      const s = load();
      if(!s.reviews[destId]) s.reviews[destId]=[];
      const item = { id: cryptoRandomId(), name, rating: Number(rating), text, date: new Date().toISOString() };
      s.reviews[destId].push(item);
      save(s);
      return item;
    }

    function toggleWishlist(destId){
      const s = load();
      const idx = s.wishlist.indexOf(destId);
      if(idx === -1) s.wishlist.push(destId);
      else s.wishlist.splice(idx,1);
      save(s);
      return s.wishlist;
    }

    function getWishlist(){
      const s = load();
      return [...s.wishlist];
    }

    function cryptoRandomId(){
      return Math.random().toString(36).slice(2,9);
    }

    export {
      getDestinations,
      getDestinationById,
      getReviews,
      addReview,
      toggleWishlist,
      getWishlist
    };
