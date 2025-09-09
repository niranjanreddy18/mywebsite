import { SOURCES, buildSearchUrl } from "./data.js";

    function el(tag, attrs = {}, children = []) {
      const node = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else node.setAttribute(k, v);
      });
      children.flat().forEach(c => {
        if (typeof c === "string") node.appendChild(document.createTextNode(c));
        else if (c) node.appendChild(c);
      });
      return node;
    }

    export function renderAll(data) {
      renderHealth(data);
      renderSafety(data);
      renderEnvironment(data);
      renderEmergency(data);
      renderTips(data);
      renderSources(data);
    }

    function renderHealth({ country, month }) {
      const list = document.getElementById("healthList");
      list.innerHTML = "";

      const items = [
        {
          heading: "Current outbreaks & disease risks",
          text: `Check WHO Disease Outbreak News and CDC Travel Health Notices for country-specific active outbreaks and travel health notices.`,
          url: SOURCES.WHO_OUTBREAKS.url
        },
        {
          heading: "Vaccinations",
          text: `Commonly recommended vaccines: routine childhood vaccines, hepatitis A, typhoid; yellow fever certificate may be required for entry/exit for some countries.`,
          url: SOURCES.WHO_YF.url
        },
        {
          heading: "Malaria & vector-borne diseases",
          text: `If destination has malaria risk, consult CDC malaria guidance and consider prophylaxis as prescribed by a travel clinic.`,
          url: SOURCES.CDC_MALARIA.url
        },
        {
          heading: "Pre-travel health visit",
          text: `See a travel health clinic or healthcare provider 4–8 weeks before travel to get required vaccines, prescriptions (e.g., antimalarials), and personalized advice.`,
          url: SOURCES.CDC.url
        },
        {
          heading: "COVID-19 & respiratory precautions",
          text: `Verify local COVID-19 entry rules and current recommendations (masking in healthcare settings may be advised).`,
          url: buildSearchUrl(`${country} COVID-19 travel restrictions ${month || ""}`)
        }
      ];

      items.forEach(i => {
        const li = el("li");
        const a = el("a", { href: i.url, target: "_blank", rel: "noopener" }, [i.heading]);
        li.appendChild(a);
        li.appendChild(el("div", {}, [i.text]));
        list.appendChild(li);
      });
    }

    function renderSafety({ country, city, month }) {
      const list = document.getElementById("safetyList");
      list.innerHTML = "";

      const items = [
        {
          heading: "Government travel advisories",
          text: `Check national advisories (US State, UK FCDO or your government) for political unrest, travel restrictions, or evacuation notices.`,
          url: SOURCES.US_STATE.url
        },
        {
          heading: "Political unrest & demonstrations",
          text: `Search recent local news for protests or civil demonstrations in ${country}${city ? `, ${city}` : ""} around ${month || "current dates"}; avoid demonstrations and large gatherings.`,
          url: buildSearchUrl(`${country} ${city} protests ${month || ""}`)
        },
        {
          heading: "Crime & petty theft",
          text: `Petty theft and scams are common in many tourist areas — use hotel safes, be cautious with phones in crowded places, and avoid poorly lit areas at night.`,
          url: buildSearchUrl(`${country} petty theft scams tourists ${city || ""}`)
        },
        {
          heading: "Terrorism & targeted risks",
          text: `Review terrorism threat updates from official advisories and avoid known high-risk areas; register with your embassy if available.`,
          url: buildSearchUrl(`${country} terrorism risk advisory`)
        },
        {
          heading: "Transport safety",
          text: `Use reputable transport services, confirm driver identity, prefer licensed taxis or official ride-hailing apps, and avoid unmarked private cars at night.`,
          url: buildSearchUrl(`${country} taxi safety ride share`)
        }
      ];

      items.forEach(i => {
        const li = el("li");
        const a = el("a", { href: i.url, target: "_blank", rel: "noopener" }, [i.heading]);
        li.appendChild(a);
        li.appendChild(el("div", {}, [i.text]));
        list.appendChild(li);
      });
    }

    function renderEnvironment({ country, month }) {
      const list = document.getElementById("environmentList");
      list.innerHTML = "";

      const items = [
        {
          heading: "Seasonal hazards",
          text: `Check local meteorological service for monsoon, cyclone, wildfire or extreme heat seasons that may affect travel during ${month || "your dates"}.`,
          url: buildSearchUrl(`${country} seasonal weather hazards ${month || ""}`)
        },
        {
          heading: "Air quality & pollution",
          text: `In some cities, air pollution can be significant. If you have respiratory conditions, check AQI forecasts and carry necessary inhalers or masks.`,
          url: buildSearchUrl(`${country} air quality index`)
        },
        {
          heading: "Water, reefs & biodiversity",
          text: `Follow local guidance to protect reefs and wildlife: avoid single-use plastics, use reef-safe sunscreen, and observe wildlife at distance.`,
          url: buildSearchUrl(`${country} reef conservation sustainable tourism`)
        },
        {
          heading: "Sustainable practices",
          text: `Support eco-certified accommodations and community tourism initiatives; follow local waste disposal and water-conservation rules.`,
          url: buildSearchUrl(`${country} sustainable tourism eco lodges`)
        }
      ];

      items.forEach(i => {
        const li = el("li");
        const a = el("a", { href: i.url, target: "_blank", rel: "noopener" }, [i.heading]);
        li.appendChild(a);
        li.appendChild(el("div", {}, [i.text]));
        list.appendChild(li);
      });
    }

    function renderEmergency({ country, city, nationality }) {
      const list = document.getElementById("emergencyList");
      list.innerHTML = "";

      const items = [
        {
          heading: "Local emergency numbers",
          text: `Search: "emergency number ${country}" and save local police, ambulance and fire numbers. Many countries use 112, 911 or local equivalents.`,
          url: buildSearchUrl(`${country} emergency number police ambulance`)
        },
        {
          heading: "Embassy & consular contacts",
          text: `Find your country's embassy/consulate contact (24/7 emergency line). Register with your embassy if available.`,
          url: buildSearchUrl(`${nationality || "your country"} embassy in ${country}`)
        },
        {
          heading: "Local hospitals & clinics",
          text: `Identify 1–2 reputable hospitals or international clinics in ${city || "your destination city"} and note addresses and phone numbers.`,
          url: buildSearchUrl(`international hospital ${city || ""} ${country || ""}`)
        },
        {
          heading: "Medical evacuation & travel insurance",
          text: `Ensure your travel insurance covers medical evacuation; contact International SOS or your insurer for details and emergency assistance.`,
          url: SOURCES.INTLSOS.url
        },
        {
          heading: "Poison, bites & urgent care",
          text: `If travelling to areas with venomous snakes/insects, know nearest tertiary-care hospitals and emergency contacts; save local poison control info if available.`,
          url: buildSearchUrl(`${country} poison control hotline`)
        }
      ];

      items.forEach(i => {
        const li = el("li");
        const a = el("a", { href: i.url, target: "_blank", rel: "noopener" }, [i.heading]);
        li.appendChild(a);
        li.appendChild(el("div", {}, [i.text]));
        list.appendChild(li);
      });
    }

    function renderTips({ country, city, nationality }) {
      const list = document.getElementById("tipsList");
      list.innerHTML = "";

      const items = [
        {
          heading: "Local customs & etiquette",
          text: `Research greetings, dress codes for religious or conservative areas, and photo permissions — showing respect reduces friction with locals.`,
          url: buildSearchUrl(`${country} customs etiquette ${city || ""}`)
        },
        {
          heading: "Money & documents",
          text: `Keep digital and paper copies of passport/visa, store valuables in a hotel safe, and notify card issuers before travel. Prefer contactless where secure.`,
          url: buildSearchUrl(`${country} travel money safety passport copy`)
        },
        {
          heading: "Food & water safety",
          text: `Use bottled or purified water if local supply is unsafe; eat at busy, well-reviewed food stalls to reduce risk of foodborne illness.`,
          url: buildSearchUrl(`${country} food safety travelers`)
        },
        {
          heading: "Transport behaviour",
          text: `Wear seat belts, avoid riding in overloaded or unregulated transport, and if self-driving, verify insurance and local traffic rules.`,
          url: buildSearchUrl(`${country} driving rules road safety`)
        },
        {
          heading: "Sustainable behaviour",
          text: `Minimize single-use plastics, use refill stations, support local conservation-friendly businesses, and respect protected-area rules.`,
          url: buildSearchUrl(`${country} sustainable travel tips`)
        }
      ];

      items.forEach(i => {
        const li = el("li");
        const a = el("a", { href: i.url, target: "_blank", rel: "noopener" }, [i.heading]);
        li.appendChild(a);
        li.appendChild(el("div", {}, [i.text]));
        list.appendChild(li);
      });
    }

    function renderSources({ country }) {
      const list = document.getElementById("sourceLinks");
      list.innerHTML = "";

      const sources = [
        SOURCES.WHO,
        SOURCES.WHO_OUTBREAKS,
        SOURCES.CDC,
        SOURCES.CDC_MALARIA,
        SOURCES.US_STATE,
        SOURCES.UK_FCDO,
        SOURCES.METEO,
        SOURCES.EMBASSY,
        SOURCES.INTLSOS,
        SOURCES.UNEP
      ];

      sources.forEach(s => {
        const li = el("li");
        const a = el("a", { href: s.url, target: "_blank", rel: "noopener" }, [s.name]);
        li.appendChild(a);
        list.appendChild(li);
      });

      const quick = [
        { text: `Official travel advisory for ${country || "destination"}`, url: buildSearchUrl(`${country} official travel advisory`) },
        { text: `Health & vaccine requirements for ${country || "destination"}`, url: buildSearchUrl(`${country} vaccination requirements yellow fever`) },
        { text: `Emergency numbers for ${country || "destination"}`, url: buildSearchUrl(`${country} emergency number`) }
      ];
      quick.forEach(q => {
        const li = el("li");
        const a = el("a", { href: q.url, target: "_blank", rel: "noopener" }, [q.text]);
        li.appendChild(a);
        list.appendChild(li);
      });
    }
