Travel Safety & Sustainability — Detailed Guidance (No Trip Summary)

    Overview
    - Client-side web app that reads trip details via URL query parameters and displays:
      - Health Advisories
      - Safety Alerts
      - Environmental Considerations
      - Emergency Contacts & Healthcare
      - Practical Travel Tips (safety and sustainability)
    - The app intentionally hides the trip summary panel; it renders guidance directly.

    Provide trip details
    - Append query params to index.html or hosted page:
      ?country=Japan&city=Tokyo&month=2025-09&nationality=United%20States

    Files
    - index.html         Main page (no trip summary)
    - styles.css         Responsive styling
    - src/config.js      Defaults and example link builder
    - src/data.js        Source links and helper for targeted searches
    - src/ui.js          Rendering logic — builds concise bullets + sourced links
    - src/main.js        Bootstrap and UI actions
    - README.md

    Usage
    1. Open index.html in a modern browser with the query parameters described above.
    2. The page will render focused guidance and quick links to authoritative sources (WHO, CDC, US State, UK FCDO, UNEP, International SOS).
    3. Use the Print or Copy link buttons to save/share the report.

    Notes
    - This tool generates targeted search queries and links to authoritative sources; it does not replace official medical or government advisories.
    - Always confirm current requirements and emergency details with official government sites, your embassy, and local health authorities prior to departure.
