import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding premium floral data...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories
  const signatureBouquets = await prisma.category.create({
    data: {
      name: "Signature Bouquets",
      slug: "signature-bouquets",
      description: "Hand-tied masterpieces using the rarest seasonal blooms.",
    },
  });

  const luxuryBoxes = await prisma.category.create({
    data: {
      name: "Luxury Boxes",
      slug: "luxury-boxes",
      description: "Exquisite arrangements presented in our signature velvet-lined boxes.",
    },
  });

  const sympathy = await prisma.category.create({
    data: {
      name: "Sympathy",
      slug: "sympathy",
      description: "Elegant and respectful tributes to honor cherished memories.",
    },
  });

  // Create 10 Premium Products
  const products = [
    // Signature Bouquets
    {
      name: "The Nairobi Nightfall",
      slug: "nairobi-nightfall",
      description: "A dramatic arrangement of deep purple calla lilies, midnight roses, and silver eucalyptus accents.",
      priceKes: 12500,
      sku: "BQ-001",
      categoryId: signatureBouquets.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1487530811015-780780169c4a?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1550159930-40066082a4fc?w=600&h=800&fit=crop",
      ],
      thumbnailUrl: "https://images.unsplash.com/photo-1487530811015-780780169c4a?w=600&h=800&fit=crop",
    },
    {
      name: "Blush Majesty",
      slug: "blush-majesty",
      description: "A voluminous bouquet of premium King Proteas, blush peonies, and garden roses.",
      priceKes: 15000,
      sku: "BQ-002",
      categoryId: signatureBouquets.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop",
      ],
      thumbnailUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=800&fit=crop",
    },
    {
      name: "Kilimanjaro White",
      slug: "kilimanjaro-white",
      description: "A pure, serene collection of white hydrangeas, lisianthus, and ivory spray roses.",
      priceKes: 8500,
      sku: "BQ-003",
      categoryId: signatureBouquets.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=600&h=800&fit=crop",
      ],
      thumbnailUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=800&fit=crop",
    },
    // Luxury Boxes
    {
      name: "Golden Savanna Box",
      slug: "golden-savanna-box",
      description: "Sunshine-yellow roses and golden-hued orchids nestled in a luxury matte black box.",
      priceKes: 9500,
      sku: "LB-001",
      categoryId: luxuryBoxes.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1490750967868-88df5691cc45?w=600&h=800&fit=crop",
      ],
      thumbnailUrl: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=800&fit=crop",
    },
    {
      name: "Crimson Velvet Box",
      slug: "crimson-velvet-box",
      description: "50 hand-selected deep red roses arranged perfectly in our signature circular velvet box.",
      priceKes: 18000,
      sku: "LB-002",
      categoryId: luxuryBoxes.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1548094878-84ced0f6896b?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=800&fit=crop",
      ],
      thumbnailUrl: "https://images.unsplash.com/photo-1548094878-84ced0f6896b?w=600&h=800&fit=crop",
    },
    {
      name: "Safari Sunset Box",
      slug: "safari-sunset-box",
      description: "Vibrant orange lilies, birds of paradise, and tropical greenery in a sophisticated wooden box.",
      priceKes: 11000,
      sku: "LB-003",
      categoryId: luxuryBoxes.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1490750967868-88df5691cc45?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=800&fit=crop",
      ],
      thumbnailUrl: "https://images.unsplash.com/photo-1490750967868-88df5691cc45?w=600&h=800&fit=crop",
    },
    {
      name: "Midnight Orchid Trio",
      slug: "midnight-orchid-trio",
      description: "Three stems of rare blue phalaenopsis orchids in a sleek porcelain-lined box.",
      priceKes: 22000,
      sku: "LB-004",
      categoryId: luxuryBoxes.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1487530811015-780780169c4a?w=600&h=800&fit=crop",
      ],
      thumbnailUrl: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&h=800&fit=crop",
    },
    // Sympathy
    {
      name: "Serene Eternal Wreath",
      slug: "serene-eternal-wreath",
      description: "A respectful circle of white lilies, chrysanthemums, and soft greenery.",
      priceKes: 13500,
      sku: "SY-001",
      categoryId: sympathy.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=800&fit=crop",
      ],
      thumbnailUrl: "https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=600&h=800&fit=crop",
    },
    {
      name: "Graceful Departure",
      slug: "graceful-departure",
      description: "A tall, elegant spray of gladioli and white snapdragons for a dignified tribute.",
      priceKes: 7000,
      sku: "SY-002",
      categoryId: sympathy.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=600&h=800&fit=crop",
      ],
      thumbnailUrl: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=800&fit=crop",
    },
    {
      name: "Pure Remembrance",
      slug: "pure-remembrance",
      description: "A compact, soulful arrangement of white carnations and baby's breath in a ceramic bowl.",
      priceKes: 5500,
      sku: "SY-003",
      categoryId: sympathy.id,
      imageUrls: [
        "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=800&fit=crop",
      ],
      thumbnailUrl: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=800&fit=crop",
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
