export const SOURCES = {
      WHO: {
        name: "World Health Organization (WHO) — Travel-related health guidance",
        url: "https://www.who.int/health-topics/travel"
      },
      WHO_OUTBREAKS: {
        name: "WHO — Disease Outbreak News",
        url: "https://www.who.int/emergencies/disease-outbreak-news"
      },
      CDC: {
        name: "US CDC — Travel Health Notices",
        url: "https://wwwnc.cdc.gov/travel/notices"
      },
      CDC_MALARIA: {
        name: "CDC — Malaria Information",
        url: "https://www.cdc.gov/malaria/travelers/index.html"
      },
      US_STATE: {
        name: "US Department of State — Travel Advisories",
        url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html"
      },
      UK_FCDO: {
        name: "UK FCDO — Travel Advice",
        url: "https://www.gov.uk/foreign-travel-advice"
      },
      EMBASSY: {
        name: "US Embassy Directory",
        url: "https://www.usembassy.gov/"
      },
      INTLSOS: {
        name: "International SOS — Emergency medical & evacuation",
        url: "https://www.internationalsos.com/"
      },
      METEO: {
        name: "Global meteorological services",
        url: "https://www.wmo.int/"
      },
      UNEP: {
        name: "UN Environment Programme (UNEP)",
        url: "https://www.unep.org/"
      },
      WHO_YF: {
        name: "WHO — Yellow Fever & Vaccination Info",
        url: "https://www.who.int/teams/control-of-neglected-tropical-diseases/yellow-fever"
      }
    };

    export function buildSearchUrl(query) {
      const base = "https://www.google.com/search?q=";
      return base + encodeURIComponent(query);
    }
