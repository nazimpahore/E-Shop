/**
 * Production-Ready Product Catalog for E-Shop
 * Categories: Electronics, Fashion, Home & Living, Accessories, Beauty
 */

export const CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'High-performance audio, smart devices, and daily tech essentials.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    itemCount: 5
  },
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Timeless apparel tailored with sustainable, premium textiles.',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
    itemCount: 5
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Thoughtful decor, artisanal ceramics, and ergonomic furniture.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    itemCount: 5
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Full-grain leather goods, precision eyewear, and minimalist everyday carry.',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    itemCount: 4
  },
  {
    id: 'beauty',
    name: 'Beauty',
    slug: 'beauty',
    description: 'Clean skincare botanical formulations crafted for radiant everyday care.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    itemCount: 4
  }
];

export const PRODUCTS = [
  // ===================== 1. ELECTRONICS =====================
  {
    id: 'prod-elec-1',
    name: 'NovaCore ANC Spatial Audio Headphones',
    category: 'Electronics',
    categorySlug: 'electronics',
    price: 229.00,
    originalPrice: 279.00,
    discount: '18% OFF',
    rating: 4.9,
    reviewCount: 48,
    inStock: true,
    stockCount: 22,
    isFeatured: true,
    isTrending: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Studio-grade acoustic clarity with active adaptive noise cancellation and 45-hour battery life.',
    description: 'Engineered for audiophiles and creators, the NovaCore over-ear headphones combine custom 40mm titanium drivers with dynamic head-tracking spatial audio. Features memory foam earcups, multipoint Bluetooth 5.3, and ultra-fast USB-C quick charge.',
    variants: {
      type: 'color',
      label: 'Color',
      options: [
        { name: 'Matte Charcoal', hex: '#1e293b', inStock: true },
        { name: 'Pure Platinum', hex: '#e2e8f0', inStock: true },
        { name: 'Midnight Navy', hex: '#172554', inStock: true }
      ]
    },
    specifications: {
      'Driver Size': '40mm Custom Titanium Drivers',
      'Battery Life': '45 hours (ANC enabled), 65 hours (ANC off)',
      'Connectivity': 'Bluetooth 5.3 & 3.5mm Lossless Audio',
      'Charging': 'USB-C Fast Charge (10 min = 5 hours playback)',
      'Weight': '248g'
    }
  },
  {
    id: 'prod-elec-2',
    name: 'Vanguard Series 4 Minimalist Smart Watch',
    category: 'Electronics',
    categorySlug: 'electronics',
    price: 159.00,
    originalPrice: 189.00,
    discount: '15% OFF',
    rating: 4.8,
    reviewCount: 36,
    inStock: true,
    stockCount: 30,
    isFeatured: true,
    isTrending: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Sapphire AMOLED display with continuous biometric telemetry and 8-day battery.',
    description: 'The Vanguard Series 4 combines Scandinavian watch architecture with advanced wellness tracking. Features 24/7 heart rate monitoring, SpO2 blood oxygen sensing, GPS route mapping, and 5ATM water resistance.',
    variants: {
      type: 'color',
      label: 'Finish',
      options: [
        { name: 'Obsidian Black', hex: '#0f172a', inStock: true },
        { name: 'Silver Steel', hex: '#cbd5e1', inStock: true },
        { name: 'Rose Gold', hex: '#f43f5e', inStock: true }
      ]
    },
    specifications: {
      'Display': '1.43-inch Always-On AMOLED (466x466)',
      'Glass': 'Scratch-resistant Sapphire Crystal',
      'Water Resistance': '5ATM / 50 meters',
      'Battery Life': 'Up to 8 days standard usage',
      'Sensors': 'Optical Heart Rate, SpO2, Accelerometer, Barometer'
    }
  },
  {
    id: 'prod-elec-3',
    name: 'ApexPro Low-Profile Mechanical Keyboard',
    category: 'Electronics',
    categorySlug: 'electronics',
    price: 139.00,
    originalPrice: null,
    discount: null,
    rating: 4.9,
    reviewCount: 29,
    inStock: true,
    stockCount: 18,
    isFeatured: false,
    isTrending: true,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'CNC machined anodized aluminum wireless keyboard with hot-swappable tactile switches.',
    description: 'Precision engineered for effortless typing speed and ergonomic ergonomics. Triple connection mode allows instantaneous switching between 2.4G wireless, Bluetooth 5.0, and braided USB-C.',
    variants: {
      type: 'color',
      label: 'Switch Type',
      options: [
        { name: 'Gateron Brown (Tactile Quiet)', inStock: true },
        { name: 'Gateron Red (Linear Smooth)', inStock: true },
        { name: 'Gateron Blue (Clicky Crisp)', inStock: true }
      ]
    },
    specifications: {
      'Body Material': '6063 Anodized CNC Aluminum',
      'Keycaps': 'Double-shot PBT Cherry Profile',
      'Battery': '4,000mAh Lithium-ion (200 hours backlight off)',
      'Compatibility': 'macOS, Windows, iOS, Android'
    }
  },
  {
    id: 'prod-elec-4',
    name: 'Horizon 34" Curved WQHD Creator Monitor',
    category: 'Electronics',
    categorySlug: 'electronics',
    price: 499.00,
    originalPrice: 579.00,
    discount: '14% OFF',
    rating: 4.7,
    reviewCount: 21,
    inStock: true,
    stockCount: 10,
    isFeatured: true,
    isTrending: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: '1800R curved panoramic display with 99% sRGB color gamut and 90W USB-C power delivery.',
    description: 'Designed for design and productivity, the Horizon 34 delivers an immersive 3440x1440 resolution. A single USB-C cable transmits video, data, and 90W charging to your laptop.',
    variants: {
      type: 'color',
      label: 'Stand Color',
      options: [
        { name: 'Matte Space Gray', hex: '#334155', inStock: true },
        { name: 'Glacier Silver', hex: '#cbd5e1', inStock: true }
      ]
    },
    specifications: {
      'Resolution': '3440 x 1440 WQHD (21:9 Aspect Ratio)',
      'Curvature': '1800R Ergonomic Curve',
      'Refresh Rate': '144Hz with AMD FreeSync Premium',
      'Ports': '1x USB-C (90W PD), 2x HDMI 2.1, 1x DP 1.4, 3x USB 3.0'
    }
  },
  {
    id: 'prod-elec-5',
    name: 'AeroCharge 3-in-1 MagSafe Wireless Charging Stand',
    category: 'Electronics',
    categorySlug: 'electronics',
    price: 64.99,
    originalPrice: 79.99,
    discount: '19% OFF',
    rating: 4.8,
    reviewCount: 42,
    inStock: true,
    stockCount: 35,
    isFeatured: false,
    isTrending: true,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1622445268046-e578a55b6ef6?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Simultaneous fast wireless charging for your smartphone, smartwatch, and wireless earbuds.',
    description: 'Crafted from aircraft-grade aluminum and soft silicone, AeroCharge declutters your nightstand or workspace with seamless magnetic alignment and smart temperature regulation.',
    variants: {
      type: 'color',
      label: 'Finish',
      options: [
        { name: 'Midnight Black', hex: '#0f172a', inStock: true },
        { name: 'Arctic White', hex: '#f8fafc', inStock: true }
      ]
    },
    specifications: {
      'Phone Output': '15W MagSafe Fast Charge',
      'Watch Output': '5W Fast Charge',
      'Earbuds Output': '5W Qi Wireless',
      'Input Port': 'USB-C (30W Adapter included in box)'
    }
  },

  // ===================== 2. FASHION =====================
  {
    id: 'prod-fash-1',
    name: 'Merino Wool Minimalist Crewneck Sweater',
    category: 'Fashion',
    categorySlug: 'fashion',
    price: 128.00,
    originalPrice: 155.00,
    discount: '17% OFF',
    rating: 4.9,
    reviewCount: 54,
    inStock: true,
    stockCount: 20,
    isFeatured: true,
    isTrending: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: '100% extra-fine Australian Merino wool with natural thermoregulation and itch-free comfort.',
    description: 'Spun from sustainably harvested 19.5-micron merino fibers, this crewneck is lightweight, breathable, and naturally odor-resistant. Ribbed cuffs and hem ensure structure that holds its shape season after season.',
    variants: {
      type: 'color',
      label: 'Color',
      options: [
        { name: 'Heather Oatmeal', hex: '#e7e5e4', inStock: true },
        { name: 'Navy Blue', hex: '#1e3a8a', inStock: true },
        { name: 'Forest Green', hex: '#14532d', inStock: true }
      ]
    },
    specifications: {
      'Material': '100% Extra-Fine Australian Merino Wool',
      'Care': 'Hand wash cold or gentle dry clean, lay flat to dry',
      'Origin': 'Ethically spun and crafted in Portugal'
    }
  },
  {
    id: 'prod-fash-2',
    name: 'Heavyweight French Terry Relaxed Hoodie',
    category: 'Fashion',
    categorySlug: 'fashion',
    price: 88.00,
    originalPrice: null,
    discount: null,
    rating: 4.8,
    reviewCount: 38,
    inStock: true,
    stockCount: 25,
    isFeatured: false,
    isTrending: true,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Substantial 460 GSM organic combed cotton with double-needle reverse coverstitching.',
    description: 'Built to endure with a structured, boxy drape. Features a double-layered crossover hood without drawstrings for a clean, minimalist silhouette and deep kangaroo pocket.',
    variants: {
      type: 'color',
      label: 'Color',
      options: [
        { name: 'Charcoal Slate', hex: '#334155', inStock: true },
        { name: 'Vintage Sage', hex: '#64748b', inStock: true },
        { name: 'Bone White', hex: '#f1f5f9', inStock: true }
      ]
    },
    specifications: {
      'Fabric Weight': '460 GSM Heavyweight French Terry',
      'Composition': '100% GOTS Certified Organic Cotton',
      'Fit': 'Relaxed drop-shoulder silhouette'
    }
  },
  {
    id: 'prod-fash-3',
    name: 'Tailored Japanese Selvedge Straight Denim',
    category: 'Fashion',
    categorySlug: 'fashion',
    price: 145.00,
    originalPrice: 175.00,
    discount: '17% OFF',
    rating: 4.9,
    reviewCount: 27,
    inStock: true,
    stockCount: 16,
    isFeatured: true,
    isTrending: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: '13.5oz shuttle-loomed indigo denim woven with redline selvedge edge in Okayama, Japan.',
    description: 'A contemporary mid-rise straight-leg cut that breaks cleanly over boots and sneakers alike. Raw sanforized denim that develops personalized honeycombs and whiskers as you wear it.',
    variants: {
      type: 'size',
      label: 'Waist Size',
      options: [
        { name: '30 Waist x 32 Inseam', inStock: true },
        { name: '32 Waist x 32 Inseam', inStock: true },
        { name: '34 Waist x 32 Inseam', inStock: true }
      ]
    },
    specifications: {
      'Denim Mill': 'Kurabo Mills (Okayama, Japan)',
      'Weight': '13.5 oz Sanforized 100% Cotton',
      'Hardware': 'Custom matte nickel buttons and copper rivets'
    }
  },
  {
    id: 'prod-fash-4',
    name: 'Water-Repellent Commuter Mac Trench Coat',
    category: 'Fashion',
    categorySlug: 'fashion',
    price: 210.00,
    originalPrice: 260.00,
    discount: '19% OFF',
    rating: 4.7,
    reviewCount: 19,
    inStock: true,
    stockCount: 12,
    isFeatured: false,
    isTrending: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Windproof technical twill outerwear with concealed placket and taped waterproof seams.',
    description: 'An architectural single-breasted mac designed for inclement urban commutes. Breathable internal membrane prevents moisture accumulation while deflecting downpours.',
    variants: {
      type: 'color',
      label: 'Color',
      options: [
        { name: 'British Khaki', hex: '#d97706', inStock: true },
        { name: 'Deep Carbon', hex: '#1e293b', inStock: true }
      ]
    },
    specifications: {
      'Shell': 'Recycled Poly-Twill with PFC-Free DWR Coating',
      'Lining': 'Smooth 100% Cupro Bemberg',
      'Weatherproofing': '10,000mm Waterproof Hydrostatic Head'
    }
  },
  {
    id: 'prod-fash-5',
    name: 'Relaxed Pure Linen Camp Collar Shirt',
    category: 'Fashion',
    categorySlug: 'fashion',
    price: 68.00,
    originalPrice: null,
    discount: null,
    rating: 4.8,
    reviewCount: 31,
    inStock: true,
    stockCount: 28,
    isFeatured: false,
    isTrending: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Pre-washed French Normandy flax linen with naturally airy, breezy open weave texture.',
    description: 'The definitive warm-weather shirt. Garment-washed for exceptional initial softness and cut with a retro cuban collar and straight split hem.',
    variants: {
      type: 'color',
      label: 'Color',
      options: [
        { name: 'Crisp Optic White', hex: '#ffffff', inStock: true },
        { name: 'Terracotta Rust', hex: '#9a3412', inStock: true },
        { name: 'Sky Chambray', hex: '#93c5fd', inStock: true }
      ]
    },
    specifications: {
      'Material': '100% Normandy Certified Flax Linen',
      'Buttons': 'Natural Mother-of-Pearl',
      'Fit': 'Easy relaxed boxy cut'
    }
  },

  // ===================== 3. HOME & LIVING =====================
  {
    id: 'prod-home-1',
    name: 'Hand-Thrown Speckled Ceramic Dinnerware Set',
    category: 'Home & Living',
    categorySlug: 'home-living',
    price: 110.00,
    originalPrice: 135.00,
    discount: '18% OFF',
    rating: 4.9,
    reviewCount: 44,
    inStock: true,
    stockCount: 15,
    isFeatured: true,
    isTrending: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: '12-piece stoneware dinner service with reactive matte glaze and organic raw rim.',
    description: 'Kiln-fired at 1280°C for exceptional durability and chip-resistance. Includes 4 dinner plates, 4 salad plates, and 4 multi-purpose cereal/pasta bowls.',
    variants: {
      type: 'color',
      label: 'Glaze',
      options: [
        { name: 'Speckled Sandstone', hex: '#d6d3d1', inStock: true },
        { name: 'Matte Charcoal Clay', hex: '#44403c', inStock: true }
      ]
    },
    specifications: {
      'Includes': '4 Dinner Plates (10.5"), 4 Salad Plates (8.2"), 4 Bowls (6.5")',
      'Safety': 'Lead-free, cadmium-free, dishwasher and microwave safe',
      'Craft': 'Wheel-thrown artisanal stoneware'
    }
  },
  {
    id: 'prod-home-2',
    name: 'Mouth-Blown Fluted Glass Carafe & Tumbler Set',
    category: 'Home & Living',
    categorySlug: 'home-living',
    price: 48.00,
    originalPrice: null,
    discount: null,
    rating: 4.8,
    reviewCount: 26,
    inStock: true,
    stockCount: 30,
    isFeatured: false,
    isTrending: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Borosilicate rippled bedside night carafe with nesting drinking glass lid.',
    description: 'Elevates daily hydration. Hand-blown with vertical optic fluting that refracts light playfully on your table. Heat-resistant borosilicate glass accommodates boiling or iced beverages.',
    variants: {
      type: 'color',
      label: 'Glass Tint',
      options: [
        { name: 'Warm Amber', hex: '#d97706', inStock: true },
        { name: 'Smoked Quartz', hex: '#64748b', inStock: true },
        { name: 'Pure Crystal Clear', hex: '#f1f5f9', inStock: true }
      ]
    },
    specifications: {
      'Carafe Capacity': '900ml / 30 oz',
      'Tumbler Capacity': '250ml / 8.5 oz',
      'Material': 'Thermal Shock Resistant Borosilicate Glass'
    }
  },
  {
    id: 'prod-home-3',
    name: 'Solid Walnut Ergonomic Dual-Monitor Desk Shelf',
    category: 'Home & Living',
    categorySlug: 'home-living',
    price: 95.00,
    originalPrice: 120.00,
    discount: '20% OFF',
    rating: 4.9,
    reviewCount: 35,
    inStock: true,
    stockCount: 14,
    isFeatured: true,
    isTrending: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'CNC curved solid American black walnut riser with anodized aluminum legs and cork pads.',
    description: 'Elevates your monitors to ergonomic eye level while creating 42 inches of organized storage below for mechanical keyboards, laptops, and everyday desktop essentials.',
    variants: {
      type: 'color',
      label: 'Timber Type',
      options: [
        { name: 'American Walnut', hex: '#78350f', inStock: true },
        { name: 'Natural White Oak', hex: '#ca8a04', inStock: true }
      ]
    },
    specifications: {
      'Dimensions': '46" L x 9" W x 4.2" H',
      'Weight Capacity': 'Tested up to 100 lbs (45 kg)',
      'Finish': 'Hand-rubbed natural matte food-grade hardwax oil'
    }
  },
  {
    id: 'prod-home-4',
    name: 'Organic Washed French Linen Duvet Cover Set',
    category: 'Home & Living',
    categorySlug: 'home-living',
    price: 175.00,
    originalPrice: 215.00,
    discount: '18% OFF',
    rating: 4.8,
    reviewCount: 40,
    inStock: true,
    stockCount: 18,
    isFeatured: false,
    isTrending: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: '170 GSM enzyme-washed flax linen bed set. Naturally cool in summer and cozy in winter.',
    description: 'Crafted from premium long-staple French flax, pre-washed for irresistible cloud-like softness from day one. Includes 1 duvet cover with interior corner ties and 2 matching pillowcases.',
    variants: {
      type: 'size',
      label: 'Bed Size',
      options: [
        { name: 'Queen Set (Duvet + 2 Shams)', inStock: true },
        { name: 'King Set (Duvet + 2 Shams)', inStock: true }
      ]
    },
    specifications: {
      'Composition': '100% Certified French Flax Linen',
      'Closure': 'Concealed coconut shell button placket',
      'Certification': 'OEKO-TEX Standard 100 Non-toxic'
    }
  },
  {
    id: 'prod-home-5',
    name: 'AromaZen Minimalist Ultrasonic Ceramic Diffuser',
    category: 'Home & Living',
    categorySlug: 'home-living',
    price: 56.00,
    originalPrice: null,
    discount: null,
    rating: 4.7,
    reviewCount: 22,
    inStock: true,
    stockCount: 25,
    isFeatured: false,
    isTrending: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Matte porcelain stone ultrasonic cold mist diffuser with warm ambient LED glow.',
    description: 'Humidifies and scents up to 500 square feet quietly using 2.4MHz ultrasonic vibration without heating essential oils. Features automatic shut-off safety and continuous or interval misting.',
    variants: {
      type: 'color',
      label: 'Porcelain Shade',
      options: [
        { name: 'Clay Terracotta', hex: '#b45309', inStock: true },
        { name: 'Pure Chalk', hex: '#f8fafc', inStock: true },
        { name: 'Basalt Black', hex: '#1e293b', inStock: true }
      ]
    },
    specifications: {
      'Water Tank': '180ml (Runs 8 hours continuous, 16 hours interval)',
      'Noise Level': 'Ultra-quiet (< 20 dB)',
      'Dimensions': '3.5" Diameter x 7" Height'
    }
  },

  // ===================== 4. ACCESSORIES =====================
  {
    id: 'prod-acc-1',
    name: 'Full-Grain Italian Leather Weekender Duffel',
    category: 'Accessories',
    categorySlug: 'accessories',
    price: 240.00,
    originalPrice: 295.00,
    discount: '18% OFF',
    rating: 4.9,
    reviewCount: 52,
    inStock: true,
    stockCount: 12,
    isFeatured: true,
    isTrending: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Vegetable-tanned full-grain leather carry-on with dedicated separate shoe compartment.',
    description: 'Handcrafted by Tuscan artisans using centuries-old natural vegetable tanning. Includes a heavy-duty YKK Excella two-way brass zipper, padded shoulder strap, and internal waterproof dopp kit pocket.',
    variants: {
      type: 'color',
      label: 'Leather Hue',
      options: [
        { name: 'Cognac Chestnut', hex: '#78350f', inStock: true },
        { name: 'Espresso Dark Brown', hex: '#451a03', inStock: true },
        { name: 'Matte Onyx Black', hex: '#0f172a', inStock: true }
      ]
    },
    specifications: {
      'Dimensions': '20.5" L x 11.5" W x 10" H (TSA Carry-on Compliant)',
      'Capacity': '38 Liters',
      'Hardware': 'Solid antiqued brass with reinforced rivets'
    }
  },
  {
    id: 'prod-acc-2',
    name: 'Handcrafted Acetate Polarized Aviator Sunglasses',
    category: 'Accessories',
    categorySlug: 'accessories',
    price: 115.00,
    originalPrice: 140.00,
    discount: '18% OFF',
    rating: 4.8,
    reviewCount: 30,
    inStock: true,
    stockCount: 22,
    isFeatured: false,
    isTrending: true,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Mazzucchelli bio-acetate frame with polarized CR-39 lenses and 100% UV400 shield.',
    description: 'Sculpted with German 5-barrel hinges and stainless steel core wires for a custom contour fit. Anti-reflective backside coating eliminates glare during driving or waterside glare.',
    variants: {
      type: 'color',
      label: 'Frame / Lens',
      options: [
        { name: 'Havana Tortoise / Bronze Lens', hex: '#78350f', inStock: true },
        { name: 'Piano Black / Smoke Green Lens', hex: '#0f172a', inStock: true }
      ]
    },
    specifications: {
      'Lens': 'Category 3 Polarized CR-39 (100% UVA/UVB Protection)',
      'Frame Material': 'Italian Mazzucchelli Cotton-Based Bio-Acetate',
      'Includes': 'Full-grain leather hard case and microfiber cleaning cloth'
    }
  },
  {
    id: 'prod-acc-3',
    name: 'Slim Carbon Fiber RFID-Blocking Bifold Wallet',
    category: 'Accessories',
    categorySlug: 'accessories',
    price: 42.00,
    originalPrice: null,
    discount: null,
    rating: 4.8,
    reviewCount: 65,
    inStock: true,
    stockCount: 40,
    isFeatured: true,
    isTrending: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Ultra-thin 0.28" profile holding 10 cards and cash with dual quick-draw thumb slots.',
    description: 'Aerospace-grade 3K carbon fiber weaves combine with full-grain leather for featherweight durability. Built-in Faraday cage lining protects your credit cards from unauthorized contactless scans.',
    variants: {
      type: 'color',
      label: 'Accent Stitching',
      options: [
        { name: 'Matte Stealth Black', hex: '#0f172a', inStock: true },
        { name: 'Heritage Saddle Tan', hex: '#b45309', inStock: true }
      ]
    },
    specifications: {
      'Thickness': 'Only 7mm unloaded',
      'Weight': '42 grams',
      'Security': 'Certified RFID 13.56 MHz shielding'
    }
  },
  {
    id: 'prod-acc-4',
    name: 'Weatherproof Waxed Canvas Commuter Pack 24L',
    category: 'Accessories',
    categorySlug: 'accessories',
    price: 160.00,
    originalPrice: 195.00,
    discount: '18% OFF',
    rating: 4.9,
    reviewCount: 39,
    inStock: true,
    stockCount: 16,
    isFeatured: false,
    isTrending: true,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: '18oz Martexin waxed duck canvas roll-top with padded 16" laptop suspend compartment.',
    description: 'Built to brave sudden downpours and decades of daily urban transit. Features ergonomic ventilated air-mesh back panel, magnetic Fidlock buckle, and hidden passport security pocket.',
    variants: {
      type: 'color',
      label: 'Canvas Color',
      options: [
        { name: 'Olive Drab Green', hex: '#3f6212', inStock: true },
        { name: 'Charcoal Black', hex: '#18181b', inStock: true },
        { name: 'Field Tan', hex: '#d97706', inStock: true }
      ]
    },
    specifications: {
      'Volume': '24 Liters (Expandable to 28L with rolltop unclasped)',
      'Laptop Sleeve': 'Padded suspended pocket fits up to 16" MacBook Pro',
      'Material': '18oz Martexin Original Wax Cotton Canvas'
    }
  },

  // ===================== 5. BEAUTY =====================
  {
    id: 'prod-beau-1',
    name: 'Botanical Radiance Vitamin C + Ferulic Face Elixir',
    category: 'Beauty',
    categorySlug: 'beauty',
    price: 62.00,
    originalPrice: 75.00,
    discount: '17% OFF',
    rating: 4.9,
    reviewCount: 47,
    inStock: true,
    stockCount: 28,
    isFeatured: true,
    isTrending: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: '15% stabilized L-Ascorbic Acid, Ferulic Acid, and Hyaluronic Acid antioxidant serum.',
    description: 'Clinically proven to boost radiance, fade stubborn dark spots, and neutralize free radical pollution damage. Fragrance-free and formulated at an optimal pH 3.2 for rapid deep absorption.',
    variants: {
      type: 'volume',
      label: 'Bottle Volume',
      options: [
        { name: '30ml Dropper Bottle', inStock: true },
        { name: '50ml Value Size', inStock: true }
      ]
    },
    specifications: {
      'Key Ingredients': '15% L-Ascorbic Acid, 0.5% Ferulic Acid, 1% Vitamin E',
      'Skin Type': 'Normal, Combination, Dry, and Dull skin',
      'Formulation': '100% Vegan, Cruelty-Free, Paraben-Free'
    }
  },
  {
    id: 'prod-beau-2',
    name: 'Barrier Restoring Ceramide + Peptide Rich Cream',
    category: 'Beauty',
    categorySlug: 'beauty',
    price: 54.00,
    originalPrice: null,
    discount: null,
    rating: 4.8,
    reviewCount: 33,
    inStock: true,
    stockCount: 25,
    isFeatured: false,
    isTrending: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Multi-ceramide complex with bio-placenta copper peptides and organic shea butter.',
    description: 'Repairs weakened moisture barriers while smoothing fine lines. The velvety, non-greasy balm sinks in quickly to lock in deep 48-hour continuous hydration without clogging pores.',
    variants: {
      type: 'volume',
      label: 'Jar Size',
      options: [
        { name: '50ml Miron Violet Glass Jar', inStock: true }
      ]
    },
    specifications: {
      'Actives': 'Ceramides NP/AP/EOP, Copper Tripeptide-1, Squalane',
      'Texture': 'Rich velvet cushion cream',
      'Non-Comedogenic': 'Yes (Dermatologist tested)'
    }
  },
  {
    id: 'prod-beau-3',
    name: 'Gentle pH 5.5 Matcha Green Tea Gel Cleanser',
    category: 'Beauty',
    categorySlug: 'beauty',
    price: 28.00,
    originalPrice: 34.00,
    discount: '18% OFF',
    rating: 4.8,
    reviewCount: 51,
    inStock: true,
    stockCount: 35,
    isFeatured: false,
    isTrending: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Sulfate-free amino acid daily gel wash with antioxidant organic matcha and centella.',
    description: 'Melt away daily sunscreen, excess sebum, and pollutants without stripping your protective skin acid mantle. Leaves skin feeling clean, calm, and supple with zero tight sensation.',
    variants: {
      type: 'volume',
      label: 'Bottle Volume',
      options: [
        { name: '150ml Pump Bottle', inStock: true },
        { name: '300ml Eco Refill Pouch', inStock: true }
      ]
    },
    specifications: {
      'pH Balance': '5.5 physiological skin barrier level',
      'Key Botanicals': 'Uji Matcha Extract, Centella Asiatica, Allantoin',
      'Free From': 'Sulfates (SLS/SLES), Artificial Dyes, Essential Oils'
    }
  },
  {
    id: 'prod-beau-4',
    name: 'Nourishing Cold-Pressed Rosehip & Marula Botanical Body Oil',
    category: 'Beauty',
    categorySlug: 'beauty',
    price: 46.00,
    originalPrice: null,
    discount: null,
    rating: 4.9,
    reviewCount: 28,
    inStock: true,
    stockCount: 20,
    isFeatured: true,
    isTrending: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1608248597359-548c772cb315?auto=format&fit=crop&w=1000&q=85'
    ],
    shortDescription: 'Fast-absorbing dry body oil packed with Omega 3-6-9 fatty acids and vitamin E.',
    description: 'A luxurious dry oil mist that deeply conditions rough elbows, arms, and legs without leaving greasy residue on clothing. Infused with natural notes of bergamot, neroli, and sandalwood.',
    variants: {
      type: 'volume',
      label: 'Size',
      options: [
        { name: '100ml Glass Mist Bottle', inStock: true }
      ]
    },
    specifications: {
      'Oils': 'Organic Virgin Rosehip Seed, Wild Harvested Marula, Golden Jojoba',
      'Absorption': 'Ultra-fast dry finish within 60 seconds',
      'Origin': 'Cold-pressed sustainably in California'
    }
  }
];

export const PROMO_CODES = {
  'WELCOME10': { discountPercent: 10, description: '10% off your entire order' },
  'ESHOP20': { discountAmount: 20, minSubtotal: 100, description: '$20 off orders over $100' },
  'FREESHIP': { freeShipping: true, description: 'Free Express Shipping' }
};
