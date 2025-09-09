// data.js - structured content: cuisine entries only
    export const ITEMS = [
      {
        id: 'sig-stew',
        type: 'cuisine',
        title: 'Signature Stew',
        desc: 'Hearty, slow-cooked stew with regional spices and fresh herbs. Order with steamed rice for the full experience.',
        tags: ['hearty', 'dinner', 'local'],
        img: 'https://images.unsplash.com/photo-1604908177522-4dcd6a2c8e11?q=80&w=1200&auto=format&fit=crop&ixlib=rb-1.2.1&s=3c2d6ff8e3d6a8a2f2e8f6a6f2a3f1bc',
        popularity: 92
      },
      {
        id: 'street-snack',
        type: 'cuisine',
        title: 'Street Snack',
        desc: 'Crisp and spicy handheld snack, perfect for mornings. Best from neighborhood stalls during early hours.',
        tags: ['street', 'snack', 'breakfast'],
        img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1200&auto=format&fit=crop&ixlib=rb-1.2.1&s=4d0c9d0f5a7fe3e5964be3a2f9a9a8f2',
        popularity: 85
      },
      {
        id: 'sweet-pastry',
        type: 'cuisine',
        title: 'Sweet Pastry',
        desc: 'Flaky, honey-glazed pastry often enjoyed with local tea. Bakeries near markets bake them fresh midday.',
        tags: ['dessert', 'bakery', 'sweet'],
        img: 'https://images.unsplash.com/photo-1547270786-5e9b273c0d2a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-1.2.1&s=6b1b9b4d8f4b4b9ef1e0a0e7a4c9b2a1',
        popularity: 78
      }
    ];

    // tags for chips
    export const TAGS = ['all', 'breakfast', 'dinner', 'dessert', 'street', 'local', 'bakery', 'dining'];
