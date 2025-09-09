import L from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';

    // UI glue for main page: generate + plan buttons
    export function initUI({ logic, geocode }) {
      const formEl = document.getElementById('planner-form');
      const generateBtn = document.getElementById('generate');
      const planBtn = document.getElementById('plan');
      const saveBtn = document.getElementById('save-trip');
      const clearBtn = document.getElementById('clear-trip');

      const itineraryInner = document.getElementById('itinerary-inner');
      const tripTitle = document.getElementById('trip-title');
      const tripDates = document.getElementById('trip-dates');

      function readForm() {
        const fd = new FormData(formEl);
        return {
          from: (fd.get('from') || '').trim(),
          to: (fd.get('to') || '').trim(),
          startDate: fd.get('startDate'),
          endDate: fd.get('endDate'),
          budget: fd.get('budget') || 'medium',
          tripType: fd.get('tripType') || 'solo',
          interests: fd.getAll('interests') || []
        };
      }

      async function handleGenerate(ev) {
        if (ev) ev.preventDefault();
        const form = readForm();
        if (!form.from || !form.to || !form.startDate || !form.endDate) {
          alert('Please fill From, To and dates.');
          return;
        }
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating…';
        try {
          const plan = await logic.generatePlan(form);
          renderPlan(plan);
          localStorage.setItem('last-plan', JSON.stringify({ form, plan }));
        } catch (err) {
          console.error(err);
          alert('Could not generate plan.');
        } finally {
          generateBtn.disabled = false;
          generateBtn.textContent = 'Generate';
        }
      }

      function renderPlan(plan) {
        tripTitle.textContent = plan.meta.title;
        tripDates.textContent = plan.meta.dates;
        itineraryInner.innerHTML = '';
        plan.activities.forEach(a => {
          const el = document.createElement('div');
          el.className = 'p-3 rounded-xl bg-slate-800/30';
          el.innerHTML = `<div class="font-semibold">Day ${a.day} — ${a.title}</div><div class="text-sm text-slate-400 mt-1">${a.description}</div>`;
          itineraryInner.appendChild(el);
        });
      }

      async function handlePlanRedirect() {
        const toInput = document.getElementById('to');
        const dest = (toInput.value || '').trim();
        if (!dest) { alert('Please enter a destination in the To field.'); return; }

        try {
          planBtn.disabled = true;
          planBtn.textContent = 'Preparing…';
          const place = await geocode.geocodePlace(dest);
          const params = new URLSearchParams({ dest: dest, lat: String(place.lat), lon: String(place.lon) });
          // redirect to hub with destination and coords
          window.location.href = `hub.html?${params.toString()}`;
        } catch (err) {
          console.error(err);
          alert('Could not find destination coordinates. Try a different name.');
        } finally {
          planBtn.disabled = false;
          planBtn.textContent = 'Plan → Hub';
        }
      }

      function handleSave() {
        const last = localStorage.getItem('last-plan');
        if (!last) { alert('No plan to save. Generate one first.'); return; }
        const key = `saved-plan-${Date.now()}`;
        localStorage.setItem(key, last);
        alert('Plan saved locally.');
      }

      function handleClear() {
        if (!confirm('Clear form and preview?')) return;
        formEl.reset();
        itineraryInner.innerHTML = '<p class="text-slate-400">Your generated itinerary will appear here after you generate a plan.</p>';
        tripTitle.textContent = '—';
        tripDates.textContent = '—';
        localStorage.removeItem('last-plan');
      }

      formEl.addEventListener('submit', handleGenerate);
      planBtn.addEventListener('click', handlePlanRedirect);
      saveBtn.addEventListener('click', handleSave);
      clearBtn.addEventListener('click', handleClear);

      // hydrate last saved plan
      (function loadLast() {
        try {
          const raw = localStorage.getItem('last-plan');
          if (!raw) return;
          const obj = JSON.parse(raw);
          if (!obj) return;
          document.getElementById('from').value = obj.form.from || '';
          document.getElementById('to').value = obj.form.to || '';
          document.getElementById('start-date').value = obj.form.startDate || '';
          document.getElementById('end-date').value = obj.form.endDate || '';
          if (obj.plan) renderPlan(obj.plan);
        } catch (e) { /* ignore */ }
      })();
    }
