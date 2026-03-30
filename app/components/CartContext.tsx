"use client";

/**
 * Enhanced Cart Context - React Context for Shopping Cart, User Auth, and App State
 * Uses useReducer for predictable state updates and LocalStorage for persistence
 */
import React, { createContext, useContext, useReducer, useEffect } from "react";

// =====================
// TYPES
// =====================

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  sodium: string;
  servingSize: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  image: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice?: number;
  bulkPrice?: number;
  bulkThreshold?: number;
  unit: string;
  image: string;
  emoji: string;
  category: string;
  inStock: boolean;
  stockLevel: "high" | "medium" | "low" | "out";
  stockCount: number;
  isPopular?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  nutritionalInfo?: NutritionalInfo;
  recipes: Recipe[];
  variants?: ProductVariant[];
  tags: string[];
  relatedProducts: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
}

export interface SavedAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "picked-up" | "delivered" | "cancelled";
  pickupDate: string;
  pickupTime: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  specialInstructions?: string;
  trackingSteps?: TrackingStep[];
}

export interface TrackingStep {
  status: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  wishlist: string[];
  addresses: SavedAddress[];
  orderHistory: Order[];
  referralCode: string;
  referredBy?: string;
  emailSubscribed: boolean;
  createdAt: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  user: User | null;
  isLoggedIn: boolean;
  showLoginModal: boolean;
  showChatWidget: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  message: string;
  timestamp: string;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "ADD_ITEM_WITH_QUANTITY"; payload: { product: Product; quantity: number; variantId?: string } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "ADD_TO_WISHLIST"; payload: string }
  | { type: "REMOVE_FROM_WISHLIST"; payload: string }
  | { type: "ADD_LOYALTY_POINTS"; payload: number }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "TOGGLE_LOGIN_MODAL" }
  | { type: "TOGGLE_CHAT_WIDGET" }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: string };

// =====================
// CONSTANTS
// =====================

const CART_STORAGE_KEY = "manilamart_cart_v2";
const USER_STORAGE_KEY = "manilamart_user_v2";
const ORDERS_STORAGE_KEY = "manilamart_orders_v2";

// =====================
// INITIAL STATE
// =====================

const initialState: CartState = {
  items: [],
  isOpen: false,
  user: null,
  isLoggedIn: false,
  showLoginModal: false,
  showChatWidget: false,
  notifications: [],
};

// =====================
// REDUCER
// =====================

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          isOpen: true,
        };
      }

      return {
        ...state,
        items: [...state.items, { product: action.payload, quantity: 1 }],
        isOpen: true,
      };
    }

    case "ADD_ITEM_WITH_QUANTITY": {
      const { product, quantity, variantId } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id && item.variantId === variantId
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === product.id && item.variantId === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
          isOpen: true,
        };
      }

      return {
        ...state,
        items: [...state.items, { product, quantity, variantId }],
        isOpen: true,
      };
    }

    case "REMOVE_ITEM": {
      // Handle both simple IDs and compound IDs with variant (format: "productId:variantId")
      const [productId, variantId] = action.payload.includes(':') 
        ? action.payload.split(':') 
        : [action.payload, null];
      
      return {
        ...state,
        items: state.items.filter((item) => {
          const matchesProduct = item.product.id !== productId;
          const matchesVariant = variantId ? item.variantId !== variantId : true;
          return matchesProduct || !matchesVariant;
        }),
      };
    }

    case "UPDATE_QUANTITY": {
      // Handle compound IDs with variant (format: "productId:variantId")
      const [productId, variantId] = action.payload.id.includes(':')
        ? action.payload.id.split(':')
        : [action.payload.id, null];

      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => {
            const matchesProduct = item.product.id === productId;
            const matchesVariant = variantId ? item.variantId === variantId : true;
            return !(matchesProduct && matchesVariant);
          }),
        };
      }

      return {
        ...state,
        items: state.items.map((item) => {
          const matchesProduct = item.product.id === productId;
          const matchesVariant = variantId ? item.variantId === variantId : !item.variantId;
          return matchesProduct && matchesVariant
            ? { ...item, quantity: action.payload.quantity }
            : item;
        }),
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
      };
    }

    case "TOGGLE_CART": {
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    }

    case "OPEN_CART": {
      return {
        ...state,
        isOpen: true,
      };
    }

    case "CLOSE_CART": {
      return {
        ...state,
        isOpen: false,
      };
    }

    case "LOAD_CART": {
      return {
        ...state,
        items: action.payload,
      };
    }

    case "LOGIN": {
      return {
        ...state,
        user: action.payload,
        isLoggedIn: true,
        showLoginModal: false,
      };
    }

    case "LOGOUT": {
      return {
        ...state,
        user: null,
        isLoggedIn: false,
        // Cart items are intentionally preserved on logout
        // Users can continue shopping as guest without losing their cart
      };
    }

    case "UPDATE_USER": {
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    }

    case "ADD_TO_WISHLIST": {
      if (!state.user) return state;
      if (state.user.wishlist.includes(action.payload)) return state;
      return {
        ...state,
        user: {
          ...state.user,
          wishlist: [...state.user.wishlist, action.payload],
        },
      };
    }

    case "REMOVE_FROM_WISHLIST": {
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          wishlist: state.user.wishlist.filter((id) => id !== action.payload),
        },
      };
    }

    case "ADD_LOYALTY_POINTS": {
      if (!state.user) return state;
      const newPoints = state.user.loyaltyPoints + action.payload;
      let newTier: "bronze" | "silver" | "gold" | "platinum" = "bronze";
      if (newPoints >= 5000) newTier = "platinum";
      else if (newPoints >= 2500) newTier = "gold";
      else if (newPoints >= 1000) newTier = "silver";
      
      return {
        ...state,
        user: {
          ...state.user,
          loyaltyPoints: newPoints,
          tier: newTier,
        },
      };
    }

    case "ADD_ORDER": {
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          orderHistory: [action.payload, ...state.user.orderHistory],
        },
        items: [],
      };
    }

    case "TOGGLE_LOGIN_MODAL": {
      return {
        ...state,
        showLoginModal: !state.showLoginModal,
      };
    }

    case "TOGGLE_CHAT_WIDGET": {
      return {
        ...state,
        showChatWidget: !state.showChatWidget,
      };
    }

    case "ADD_NOTIFICATION": {
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    }

    case "REMOVE_NOTIFICATION": {
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    }

    default:
      return state;
  }
}

// =====================
// CONTEXT
// =====================

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  // Derived values for convenience
  itemCount: number;
  subtotal: number;
  total: number;
  wholesaleSubtotal: number;
  isWholesaleEligible: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// =====================
// PROVIDER
// =====================

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart and user from LocalStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", payload: parsed });
      }
      
      if (savedUser) {
        const user = JSON.parse(savedUser);
        dispatch({ type: "LOGIN", payload: user });
      }
    } catch (error) {
      console.error("Failed to load from storage:", error);
    }
  }, []);

  // Save cart to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error("Failed to save cart to storage:", error);
    }
  }, [state.items]);

  // Save user to LocalStorage on changes
  useEffect(() => {
    try {
      if (state.user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save user to storage:", error);
    }
  }, [state.user]);

  // Calculate derived values
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const wholesaleSubtotal = state.items.reduce(
    (sum, item) => sum + (item.product.wholesalePrice || item.product.price) * item.quantity,
    0
  );
  const isWholesaleEligible = state.user?.tier === "gold" || state.user?.tier === "platinum";
  const total = isWholesaleEligible ? wholesaleSubtotal : subtotal;

  const value: CartContextType = {
    state,
    dispatch,
    itemCount,
    subtotal,
    total,
    wholesaleSubtotal,
    isWholesaleEligible,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// =====================
// HOOK
// =====================

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// =====================
// UTILITY FUNCTIONS
// =====================

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function calculateItemTotal(item: CartItem): number {
  return item.product.price * item.quantity;
}

export function generateReferralCode(): string {
  return "MM" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function calculateLoyaltyPoints(orderTotal: number): number {
  return Math.floor(orderTotal);
}

export function getTierBenefits(tier: string): { discount: number; freeDeliveryThreshold: number } {
  switch (tier) {
    case "platinum":
      return { discount: 0.15, freeDeliveryThreshold: 25 };
    case "gold":
      return { discount: 0.10, freeDeliveryThreshold: 35 };
    case "silver":
      return { discount: 0.05, freeDeliveryThreshold: 50 };
    default:
      return { discount: 0, freeDeliveryThreshold: 75 };
  }
}
