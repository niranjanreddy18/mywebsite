import { getDestinations, addToTrip, getTrips, getDestinationById } from './api.js';

    let selected = new Set();

    function initPlanner(){
      document.getElementById('btn-planner').addEventListener('click', ()=>{
        document.getElementById('panel-planner').classList.toggle('hidden');
      });

      document.getElementById('planner-form').addEventListener('submit', (e)=>{
        e.preventDefault();
        const name = document.getElementById('trip-name').value.trim() || 'My Trip';
        const start = document.getElementById('trip-start').value || null;
        const end = document.getElementById('trip-end').value || null;
        const payload = {
          name, start, end,
          items: [...selected],
        };
        addToTrip(payload);
        selected.clear();
        renderSelectedList();
        renderSavedTrips();
        document.getElementById('planner-form').reset();
      });

      window.addEventListener('wishlist:add-to-planner', (e)=>{
        const id = e.detail.id;
        selected.add(id);
        renderSelectedList();
      });

      renderSavedTrips();
    }

    function toggleSelectDestination(id){
      if(selected.has(id)) selected.delete(id);
      else selected.add(id);
      renderSelectedList();
    }

    function renderSelectedList(){
      const list = document.getElementById('planner-selected-list');
      list.innerHTML = '';
      if(selected.size === 0){
        list.innerHTML = '<p class="muted">No destinations selected. Add from wishlist or destination cards.</p>';
        return;
      }
      [...selected].forEach(id=>{
        const d = getDestinationById(id);
        if(!d) return;
        const el = document.createElement('div');
        el.style.display='flex';
        el.style.gap='10px';
        el.style.marginBottom='8px';
        el.innerHTML = `
          <div style="width:56px;height:44px;background-image:url('${d.img}');background-size:cover;border-radius:8px"></div>
          <div style="flex:1">
            <strong>${d.name}</strong>
            <div style="font-size:13px;color:var(--muted)">${d.region}</div>
          </div>
          <div>
            <button class="btn subtle btn-remove" data-id="${d.id}">✕</button>
          </div>
        `;
        list.appendChild(el);
      });

      list.querySelectorAll('.btn-remove').forEach(b=>{
        b.addEventListener('click', ()=>{ toggleSelectDestination(b.dataset.id); });
      });
    }

    function renderSavedTrips(){
      const trips = getTrips();
      const container = document.getElementById('saved-trips-list');
      container.innerHTML = '';
      if(trips.length === 0){
        container.innerHTML = '<p class="muted">No saved trips yet. Plan one to get started.</p>';
        return;
      }
      trips.forEach(t=>{
        const el = document.createElement('div');
        el.className = 'card';
        el.style.padding = '10px';
        el.style.marginBottom = '8px';
        el.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong>${t.name}</strong>
              <div style="font-size:13px;color:var(--muted)">${t.start || '—'} → ${t.end || '—'}</div>
              <div style="font-size:13px;color:var(--muted);margin-top:6px">${t.items.length} destination(s)</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:12px;color:var(--muted)">${new Date(t.created).toLocaleDateString()}</div>
            </div>
          </div>
        `;
        container.appendChild(el);
      });
    }

    export {
      initPlanner,
      toggleSelectDestination,
      renderSelectedList
    };
