// Simplified gallery: open images and panoramas in a new tab instead of popups
    import { getDestinations } from './api.js';

    async function renderMediaGrid(container){
      const destinations = getDestinations();
      container.innerHTML = '';
      const media = [];

      // Gather main images + panoramas
      destinations.forEach(d=>{
        media.push({src: d.img, title: d.name, type:'image', id:d.id});
        media.push({src: d.pano, title: d.name+' (360)', type:'pano', id:d.id});
      });

      // Unique photos from Unsplash for variety
      const extras = [
        'https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1600&q=80&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop'
      ];
      extras.forEach((u,i)=>media.push({src:u,title:`Photo ${i+1}`,type:'image',id:'extra'+i}));

      media.slice(0,8).forEach(item=>{
        const el = document.createElement('div');
        el.className = 'media-item';
        el.style.backgroundImage = `url('${item.src}')`;
        el.setAttribute('data-src', item.src);
        el.setAttribute('data-type', item.type);
        el.setAttribute('data-id', item.id);
        el.title = item.title;
        el.addEventListener('click', onMediaClick);
        container.appendChild(el);
      });
    }

    function onMediaClick(e){
      const target = e.currentTarget;
      const src = target.dataset.src;
      // open in new tab to avoid popups on main page
      window.open(src, '_blank', 'noopener');
    }

    // No modal handlers required anymore; keep a noop to satisfy imports
    function attachModalHandlers(){
      // intentionally empty — popups removed
    }

    export {
      renderMediaGrid,
      attachModalHandlers
    };
