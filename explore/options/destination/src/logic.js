// Basic plan generation logic (kept minimal — UI handles main flow)
    export function initLogic({ geocode }) {
      function daysBetween(startIso, endIso) {
        const s = new Date(startIso);
        const e = new Date(endIso);
        const diff = Math.max(0, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
        return diff === 0 ? 1 : diff;
      }

      function estimateCost(budget, days, tripType) {
        const base = { low: 60, medium: 160, luxury: 520 };
        const multiplier = { solo: 1, friends: 1.2, family: 1.5, honeymoon: 1.8, adventure: 1.1 };
        const daily = base[budget] || 120;
        return Math.round(daily * days * (multiplier[tripType] || 1));
      }

      async function generatePlan(form) {
        const days = daysBetween(form.startDate, form.endDate);
        const estCost = estimateCost(form.budget, days, form.tripType);

        let fromPlace = { name: form.from, lat: 0, lon: 0 };
        let toPlace = { name: form.to, lat: 0, lon: 0 };

        try { fromPlace = await geocode.geocodePlace(form.from); } catch (e) { /* fallback */ }
        try { toPlace = await geocode.geocodePlace(form.to); } catch (e) { /* fallback */ }

        const activities = [];
        for (let i = 1; i <= days; i++) activities.push({ day: i, title: `Explore ${form.to}`, interest: (form.interests && form.interests[0]) || 'General', description: `Suggested activity for day ${i}.` });

        const markers = [fromPlace, toPlace];

        return {
          meta: { title: `${form.from} → ${form.to}`, dates: `${form.startDate} — ${form.endDate}`, days, budgetLabel: form.budget, estCost },
          activities,
          markers
        };
      }

      return { generatePlan };
    }
