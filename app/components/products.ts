import { Product } from "./CartContext";

// Grazecart API Types
export interface GrazecartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  inventory_count: number;
  images: string[];
  category: string;
  sku: string;
  is_available: boolean;
}

export interface GrazecartCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  product_count: number;
}

// API Configuration
const GRAZECART_API_URL = process.env.NEXT_PUBLIC_GRAZECART_STORE_URL || "https://filipinoasianmarket.grazecart.com";
const API_TOKEN = process.env.NEXT_PUBLIC_GRAZECART_API_TOKEN || "";

// Grazecart API Client
export async function fetchGrazecartProducts(): Promise<GrazecartProduct[]> {
  try {
    const response = await fetch(`${GRAZECART_API_URL}/api/v1/products`, {
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn("Grazecart API unavailable, using local data");
    return [];
  }
}

export async function fetchGrazecartCategories(): Promise<GrazecartCategory[]> {
  try {
    const response = await fetch(`${GRAZECART_API_URL}/api/v1/categories`, {
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn("Grazecart API unavailable, using local data");
    return [];
  }
}

// Convert Grazecart product to local format
export function convertGrazecartProduct(gp: GrazecartProduct): Product {
  return {
    id: `gc-${gp.id}`,
    name: gp.name,
    description: gp.description,
    price: gp.price,
    wholesalePrice: gp.price * 0.8,
    unit: "each",
    image: gp.images[0] || "",
    emoji: "🛒",
    category: gp.category,
    inStock: gp.is_available && gp.inventory_count > 0,
    stockLevel: gp.inventory_count > 20 ? "high" : gp.inventory_count > 5 ? "medium" : "low",
    stockCount: gp.inventory_count,
    isPopular: false,
    rating: 4.5,
    reviewCount: 0,
    reviews: [],
    nutritionalInfo: { calories: 0, protein: "0g", carbs: "0g", fat: "0g", sodium: "0mg", servingSize: "1 serving" },
    recipes: [],
    tags: [gp.category],
    relatedProducts: [],
  };
}

// Local products data
export const localProducts: Product[] = [
  // Fresh Produce
  {
    id: "fp-1", name: "Fresh Manila Mangoes", description: "Sweet and juicy Manila mangoes, flown in fresh from the Philippines.",
    price: 4.99, wholesalePrice: 3.99, bulkPrice: 3.49, bulkThreshold: 10, unit: "per lb", image: "", emoji: "🥭", category: "fresh-produce",
    inStock: true, stockLevel: "medium", stockCount: 45, isPopular: true, rating: 4.8, reviewCount: 127,
    reviews: [{ id: "r1", userId: "u1", userName: "Maria Santos", rating: 5, comment: "So fresh! Reminds me of home.", date: "2024-02-15" }],
    nutritionalInfo: { calories: 99, protein: "1.4g", carbs: "25g", fat: "0.6g", sodium: "2mg", servingSize: "165g" },
    recipes: [{ id: "rec1", name: "Mango Float", description: "Classic no-bake dessert", ingredients: ["4 mangoes", "graham crackers", "cream"], instructions: ["Layer ingredients", "Chill"], prepTime: "20m", cookTime: "4h", servings: 8, difficulty: "Easy", image: "🥭" }],
    variants: [{ id: "v1", name: "Small", price: 4.99, unit: "lb", stock: 20 }, { id: "v2", name: "Bulk Box", price: 44.99, unit: "10lb", stock: 10 }],
    tags: ["fresh", "fruit", "dessert"], relatedProducts: ["fp-2", "frz-4"]
  },
  {
    id: "fp-2", name: "Young Coconut (Buko)", description: "Fresh young coconuts with sweet coconut water.",
    price: 3.49, wholesalePrice: 2.99, unit: "each", image: "", emoji: "🥥", category: "fresh-produce",
    inStock: true, stockLevel: "high", stockCount: 120, rating: 4.7, reviewCount: 89, reviews: [],
    nutritionalInfo: { calories: 140, protein: "3g", carbs: "6g", fat: "13g", sodium: "10mg", servingSize: "1 coconut" },
    recipes: [], tags: ["fresh", "coconut"], relatedProducts: ["fp-1", "pan-6"]
  },
  {
    id: "fp-3", name: "Filipino Eggplant (Talong)", description: "Long, slender purple eggplants.",
    price: 2.99, wholesalePrice: 2.49, bulkPrice: 1.99, bulkThreshold: 20, unit: "per lb", image: "", emoji: "🍆", category: "fresh-produce",
    inStock: true, stockLevel: "medium", stockCount: 60, rating: 4.5, reviewCount: 45, reviews: [],
    nutritionalInfo: { calories: 25, protein: "1g", carbs: "6g", fat: "0.2g", sodium: "2mg", servingSize: "100g" },
    recipes: [], tags: ["fresh", "vegetable"], relatedProducts: ["fp-4", "pan-12"]
  },
  {
    id: "fp-4", name: "Bitter Melon (Ampalaya)", description: "Fresh bitter melon.",
    price: 3.49, wholesalePrice: 2.99, unit: "per lb", image: "", emoji: "🥒", category: "fresh-produce",
    inStock: true, stockLevel: "low", stockCount: 15, rating: 4.3, reviewCount: 38, reviews: [],
    nutritionalInfo: { calories: 20, protein: "0.8g", carbs: "4g", fat: "0.1g", sodium: "5mg", servingSize: "100g" },
    recipes: [], tags: ["fresh", "vegetable", "healthy"], relatedProducts: ["fp-3", "ms-1"]
  },
  {
    id: "fp-5", name: "Long Beans (Sitaw)", description: "Crisp yard-long beans.",
    price: 2.49, wholesalePrice: 1.99, bulkPrice: 1.49, bulkThreshold: 10, unit: "per bunch", image: "", emoji: "🌱", category: "fresh-produce",
    inStock: true, stockLevel: "high", stockCount: 80, rating: 4.6, reviewCount: 52, reviews: [],
    nutritionalInfo: { calories: 47, protein: "2.8g", carbs: "9g", fat: "0.1g", sodium: "4mg", servingSize: "100g" },
    recipes: [], tags: ["fresh", "vegetable"], relatedProducts: ["fp-3", "pan-3"]
  },
  // Meat & Seafood
  {
    id: "ms-1", name: "Fresh Milkfish (Bangus)", description: "The national fish of the Philippines.",
    price: 8.99, wholesalePrice: 7.49, bulkPrice: 6.99, bulkThreshold: 10, unit: "per lb", image: "", emoji: "🐟", category: "meat-seafood",
    inStock: true, stockLevel: "medium", stockCount: 40, isPopular: true, rating: 4.9, reviewCount: 156, reviews: [],
    nutritionalInfo: { calories: 189, protein: "27g", carbs: "0g", fat: "8g", sodium: "72mg", servingSize: "100g" },
    variants: [{ id: "v1", name: "Whole", price: 8.99, unit: "lb", stock: 15 }, { id: "v2", name: "Deboned", price: 11.99, unit: "lb", stock: 20 }],
    recipes: [], tags: ["fresh", "fish"], relatedProducts: ["ms-2", "pan-5"]
  },
  {
    id: "ms-2", name: "Tilapia", description: "Fresh farm-raised tilapia.",
    price: 5.99, wholesalePrice: 4.99, unit: "per lb", image: "", emoji: "🐠", category: "meat-seafood",
    inStock: true, stockLevel: "high", stockCount: 100, rating: 4.6, reviewCount: 78, reviews: [],
    nutritionalInfo: { calories: 96, protein: "20g", carbs: "0g", fat: "1.7g", sodium: "52mg", servingSize: "100g" },
    recipes: [], tags: ["fresh", "fish"], relatedProducts: ["ms-1", "ms-5"]
  },
  {
    id: "ms-3", name: "Pork Belly (Liempo)", description: "Premium pork belly.",
    price: 6.49, wholesalePrice: 5.49, bulkPrice: 4.99, bulkThreshold: 20, unit: "per lb", image: "", emoji: "🥓", category: "meat-seafood",
    inStock: true, stockLevel: "medium", stockCount: 55, isPopular: true, rating: 4.8, reviewCount: 134, reviews: [],
    nutritionalInfo: { calories: 518, protein: "9g", carbs: "0g", fat: "53g", sodium: "18mg", servingSize: "100g" },
    recipes: [], tags: ["fresh", "pork"], relatedProducts: ["ms-4", "pan-3"]
  },
  {
    id: "ms-5", name: "Fresh Shrimp (Hipon)", description: "Large fresh shrimp.",
    price: 14.99, wholesalePrice: 12.99, bulkPrice: 11.99, bulkThreshold: 5, unit: "per lb", image: "", emoji: "🦐", category: "meat-seafood",
    inStock: true, stockLevel: "low", stockCount: 18, rating: 4.8, reviewCount: 92, reviews: [],
    nutritionalInfo: { calories: 99, protein: "24g", carbs: "0g", fat: "0.3g", sodium: "111mg", servingSize: "100g" },
    recipes: [], tags: ["fresh", "seafood"], relatedProducts: ["ms-6", "pan-9"]
  },
  // Pantry Staples
  {
    id: "pan-1", name: "Premium Jasmine Rice", description: "High-quality Thai jasmine rice.",
    price: 24.99, wholesalePrice: 21.99, bulkPrice: 19.99, bulkThreshold: 5, unit: "25 lb bag", image: "", emoji: "🍚", category: "pantry",
    inStock: true, stockLevel: "high", stockCount: 150, isPopular: true, rating: 4.9, reviewCount: 312, reviews: [],
    nutritionalInfo: { calories: 365, protein: "7g", carbs: "80g", fat: "0.7g", sodium: "5mg", servingSize: "1 cup" },
    variants: [{ id: "v1", name: "25 lb", price: 24.99, unit: "bag", stock: 80 }, { id: "v2", name: "50 lb", price: 46.99, unit: "bag", stock: 50 }, { id: "v3", name: "100 lb", price: 89.99, unit: "box", stock: 20 }],
    recipes: [], tags: ["staple", "rice"], relatedProducts: ["pan-2", "pan-3"]
  },
  {
    id: "pan-3", name: "Silver Swan Soy Sauce", description: "Filipino-style soy sauce.",
    price: 3.49, wholesalePrice: 2.99, bulkPrice: 2.49, bulkThreshold: 12, unit: "1 liter", image: "", emoji: "🍶", category: "pantry",
    inStock: true, stockLevel: "high", stockCount: 200, rating: 4.8, reviewCount: 245, reviews: [],
    nutritionalInfo: { calories: 60, protein: "6g", carbs: "5g", fat: "0g", sodium: "5700mg", servingSize: "1 tbsp" },
    recipes: [], tags: ["staple", "sauce", "adobo"], relatedProducts: ["pan-4", "pan-5"]
  },
  {
    id: "pan-4", name: "Datu Puti Vinegar", description: "Filipino cane vinegar.",
    price: 2.49, wholesalePrice: 1.99, bulkPrice: 1.79, bulkThreshold: 12, unit: "1 liter", image: "", emoji: "🫗", category: "pantry",
    inStock: true, stockLevel: "high", stockCount: 180, rating: 4.7, reviewCount: 189, reviews: [],
    nutritionalInfo: { calories: 0, protein: "0g", carbs: "0g", fat: "0g", sodium: "5mg", servingSize: "1 tbsp" },
    recipes: [], tags: ["staple", "vinegar"], relatedProducts: ["pan-3", "pan-5"]
  },
  {
    id: "pan-9", name: "Knorr Sinigang Mix", description: "Tamarind soup base.",
    price: 1.49, wholesalePrice: 1.19, bulkPrice: 0.99, bulkThreshold: 24, unit: "40g pack", image: "", emoji: "🍲", category: "pantry",
    inStock: true, stockLevel: "high", stockCount: 400, isPopular: true, rating: 4.8, reviewCount: 267, reviews: [],
    nutritionalInfo: { calories: 20, protein: "0g", carbs: "4g", fat: "0g", sodium: "1800mg", servingSize: "1 pack" },
    recipes: [], tags: ["mix", "soup"], relatedProducts: ["ms-5", "ms-2"]
  },
  // Frozen Foods
  {
    id: "frz-1", name: "Homemade Lumpia Shanghai", description: "Filipino spring rolls.",
    price: 12.99, wholesalePrice: 10.99, bulkPrice: 9.99, bulkThreshold: 10, unit: "20 pcs", image: "", emoji: "🫔", category: "frozen",
    inStock: true, stockLevel: "high", stockCount: 150, isPopular: true, rating: 4.9, reviewCount: 234, reviews: [],
    nutritionalInfo: { calories: 95, protein: "4g", carbs: "8g", fat: "5g", sodium: "180mg", servingSize: "2 pieces" },
    variants: [{ id: "v1", name: "20 pcs", price: 12.99, unit: "pack", stock: 100 }, { id: "v2", name: "50 pcs", price: 28.99, unit: "pack", stock: 40 }, { id: "v3", name: "100 pcs", price: 54.99, unit: "pack", stock: 10 }],
    recipes: [], tags: ["frozen", "appetizer"], relatedProducts: ["pan-7", "frz-2"]
  },
  {
    id: "frz-2", name: "Pork Longanisa", description: "Sweet Filipino breakfast sausage.",
    price: 6.49, wholesalePrice: 5.49, bulkPrice: 4.99, bulkThreshold: 10, unit: "12oz pack", image: "", emoji: "🌭", category: "frozen",
    inStock: true, stockLevel: "medium", stockCount: 75, isPopular: true, rating: 4.8, reviewCount: 198, reviews: [],
    nutritionalInfo: { calories: 180, protein: "8g", carbs: "12g", fat: "11g", sodium: "480mg", servingSize: "2 links" },
    recipes: [], tags: ["frozen", "breakfast"], relatedProducts: ["frz-3", "pan-1"]
  },
  {
    id: "frz-5", name: "Ube Ice Cream", description: "Creamy purple yam ice cream.",
    price: 8.99, wholesalePrice: 7.99, unit: "1.5qt", image: "", emoji: "🍦", category: "frozen",
    inStock: true, stockLevel: "medium", stockCount: 35, isPopular: true, rating: 4.9, reviewCount: 289, reviews: [],
    nutritionalInfo: { calories: 200, protein: "3g", carbs: "28g", fat: "9g", sodium: "60mg", servingSize: "1/2 cup" },
    recipes: [], tags: ["frozen", "dessert", "ube"], relatedProducts: ["frz-4", "snk-3"]
  },
  // Snacks & Candy
  {
    id: "snk-1", name: "Choc Nut", description: "Iconic peanut milk chocolate candy.",
    price: 4.99, wholesalePrice: 3.99, bulkPrice: 3.49, bulkThreshold: 12, unit: "24 pcs pack", image: "", emoji: "🍫", category: "snacks",
    inStock: true, stockLevel: "high", stockCount: 200, isPopular: true, rating: 4.9, reviewCount: 445, reviews: [],
    nutritionalInfo: { calories: 70, protein: "2g", carbs: "7g", fat: "4g", sodium: "20mg", servingSize: "1 piece" },
    recipes: [], tags: ["snack", "chocolate"], relatedProducts: ["snk-3", "snk-9"]
  },
  {
    id: "snk-4", name: "Dried Mangoes", description: "Premium dried mangoes from Cebu.",
    price: 5.49, wholesalePrice: 4.49, bulkPrice: 3.99, bulkThreshold: 12, unit: "7oz pack", image: "", emoji: "🥭", category: "snacks",
    inStock: true, stockLevel: "high", stockCount: 120, isPopular: true, rating: 4.8, reviewCount: 334, reviews: [],
    nutritionalInfo: { calories: 130, protein: "1g", carbs: "32g", fat: "0g", sodium: "15mg", servingSize: "40g" },
    recipes: [], tags: ["snack", "fruit"], relatedProducts: ["snk-1", "fp-1"]
  },
  {
    id: "snk-8", name: "Candied Pili Nuts", description: "Deluxe pili nuts from Bicol.",
    price: 12.99, wholesalePrice: 10.99, unit: "8oz jar", image: "", emoji: "🥜", category: "snacks",
    inStock: true, stockLevel: "low", stockCount: 15, rating: 4.7, reviewCount: 89, reviews: [],
    nutritionalInfo: { calories: 200, protein: "3g", carbs: "16g", fat: "15g", sodium: "25mg", servingSize: "30g" },
    recipes: [], tags: ["snack", "nuts", "bicol"], relatedProducts: ["snk-1", "snk-3"]
  },
];

// Combined products (local + Grazecart when available)
export let products: Product[] = [...localProducts];

// Initialize products with Grazecart data
export async function initializeProducts(): Promise<void> {
  try {
    const grazecartProducts = await fetchGrazecartProducts();
    if (grazecartProducts.length > 0) {
      const convertedProducts = grazecartProducts.map(convertGrazecartProduct);
      products = [...localProducts, ...convertedProducts];
    }
  } catch (error) {
    console.warn("Failed to load Grazecart products, using local data only");
  }
}

export const categories = [
  { id: "fresh-produce", name: "Fresh Produce", description: "Farm-fresh vegetables and tropical fruits", color: "bg-green-100", icon: "🥬", emoji: "🥬" },
  { id: "meat-seafood", name: "Meat & Seafood", description: "Premium cuts and fresh catch daily", color: "bg-red-100", icon: "🥩", emoji: "🥩" },
  { id: "pantry", name: "Pantry Staples", description: "Essential sauces, spices, and rice", color: "bg-yellow-100", icon: "🍚", emoji: "🍚" },
  { id: "frozen", name: "Frozen Foods", description: "Ready-to-cook favorites and desserts", color: "bg-blue-100", icon: "❄️", emoji: "❄️" },
  { id: "snacks", name: "Snacks & Candy", description: "Childhood favorites and sweet treats", color: "bg-orange-100", icon: "🍬", emoji: "🍬" },
];

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.category === categoryId);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getPopularProducts(): Product[] {
  return products.filter((p) => p.isPopular);
}

export function searchProducts(query: string): Product[] {
  const searchLower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
  );
}

export function getRelatedProducts(productId: string): Product[] {
  const product = getProductById(productId);
  if (!product || !product.relatedProducts) return [];
  return products.filter((p) => product.relatedProducts.includes(p.id));
}

export function getLowStockProducts(): Product[] {
  return products.filter((p) => p.stockLevel === "low" || p.stockLevel === "out");
}

export function filterProducts(
  category?: string,
  priceRange?: { min: number; max: number },
  inStock?: boolean,
  rating?: number,
  tags?: string[]
): Product[] {
  return products.filter((p) => {
    if (category && p.category !== category) return false;
    if (priceRange && (p.price < priceRange.min || p.price > priceRange.max)) return false;
    if (inStock && !p.inStock) return false;
    if (rating && p.rating < rating) return false;
    if (tags && !tags.some((tag) => p.tags.includes(tag))) return false;
    return true;
  });
}