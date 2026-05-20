import type { Item } from './schema';

export const mockCatalog: readonly Item[] = [
  // === Vegetables (10) ===
  { slug: 'okra', name: 'Okra', tamil: 'Vendakkai', category: 'vegetables', stock: 'in-stock', price: 2.80, unit: 'kg', origin: 'India', featured: true },
  { slug: 'bitter-gourd', name: 'Bitter gourd', tamil: 'Pavakkai', category: 'vegetables', stock: 'in-stock', price: 3.20, unit: 'kg', origin: 'India', featured: true },
  { slug: 'drumstick', name: 'Drumstick', tamil: 'Murungakkai', category: 'vegetables', stock: 'low', price: 4.10, unit: 'bunch', origin: 'India' },
  { slug: 'ridge-gourd', name: 'Ridge gourd', tamil: 'Peerkangai', category: 'vegetables', stock: 'in-stock', price: 2.40, unit: 'kg', origin: 'India' },
  { slug: 'snake-gourd', name: 'Snake gourd', tamil: 'Pudalangai', category: 'vegetables', stock: 'in-stock', price: 3.00, unit: 'kg', origin: 'India' },
  { slug: 'curry-leaves', name: 'Curry leaves', tamil: 'Karuvepilai', category: 'vegetables', stock: 'in-stock', price: 1.40, unit: 'bunch', origin: 'Sri Lanka', featured: true },
  { slug: 'banana-flower', name: 'Banana flower', tamil: 'Vazhaipoo', category: 'vegetables', stock: 'low', price: 3.80, unit: 'piece', origin: 'India' },
  { slug: 'plantain', name: 'Plantain', tamil: 'Vazhaikkai', category: 'vegetables', stock: 'in-stock', price: 2.20, unit: 'kg', origin: 'India' },
  { slug: 'ash-gourd', name: 'Ash gourd', tamil: 'Pusinikkai', category: 'vegetables', stock: 'out-of-stock', price: 2.60, unit: 'kg', origin: 'India' },
  { slug: 'taro-root', name: 'Taro root', tamil: 'Cheppankizhangu', category: 'vegetables', stock: 'in-stock', price: 3.50, unit: 'kg', origin: 'India' },

  // === Fruits (6) ===
  { slug: 'alphonso-mango', name: 'Alphonso mango', category: 'fruits', stock: 'in-stock', price: 4.90, unit: 'kg', origin: 'India · Alphonso', featured: true },
  { slug: 'guava', name: 'Guava', tamil: 'Koyya', category: 'fruits', stock: 'in-stock', price: 3.40, unit: 'kg', origin: 'Thailand' },
  { slug: 'custard-apple', name: 'Custard apple', tamil: 'Seethaaphalam', category: 'fruits', stock: 'low', price: 5.20, unit: 'kg', origin: 'India' },
  { slug: 'papaya', name: 'Papaya', category: 'fruits', stock: 'in-stock', price: 2.10, unit: 'kg', origin: 'Brazil' },
  { slug: 'jackfruit', name: 'Jackfruit', tamil: 'Palapazham', category: 'fruits', stock: 'out-of-stock', price: 6.80, unit: 'kg', origin: 'Sri Lanka' },
  { slug: 'lime', name: 'Lime', tamil: 'Elumichai', category: 'fruits', stock: 'in-stock', price: 0.80, unit: 'piece', origin: 'India' },

  // === Fish (5) ===
  { slug: 'tilapia', name: 'Tilapia', category: 'fish', stock: 'in-stock', price: 8.20, unit: 'kg', origin: 'frozen', featured: true },
  { slug: 'king-fish', name: 'King fish', tamil: 'Vanjaram', category: 'fish', stock: 'in-stock', price: 14.50, unit: 'kg', origin: 'frozen' },
  { slug: 'seer', name: 'Seer fish', category: 'fish', stock: 'low', price: 12.90, unit: 'kg', origin: 'frozen' },
  { slug: 'sardine', name: 'Sardine', tamil: 'Mathi', category: 'fish', stock: 'in-stock', price: 5.40, unit: 'kg', origin: 'frozen' },
  { slug: 'prawn', name: 'Prawn', tamil: 'Eral', category: 'fish', stock: 'in-stock', price: 16.80, unit: 'kg', origin: 'frozen' },

  // === Meat (3) ===
  { slug: 'goat-curry-cut', name: 'Goat curry cut', category: 'meat', stock: 'in-stock', price: 18.90, unit: 'kg', origin: 'halal' },
  { slug: 'chicken-curry-cut', name: 'Chicken curry cut', category: 'meat', stock: 'in-stock', price: 9.80, unit: 'kg', origin: 'halal' },
  { slug: 'mutton-chops', name: 'Mutton chops', category: 'meat', stock: 'low', price: 22.40, unit: 'kg', origin: 'halal' },

  // === Dry goods (11) ===
  { slug: 'basmati-rice', name: 'Basmati rice', category: 'dry-goods', stock: 'in-stock', price: 4.20, unit: '1kg', origin: 'India', featured: true },
  { slug: 'idly-rice', name: 'Idly rice', category: 'dry-goods', stock: 'in-stock', price: 3.80, unit: '1kg', origin: 'India' },
  { slug: 'urad-dal', name: 'Urad dal', tamil: 'Ulundu', category: 'dry-goods', stock: 'in-stock', price: 3.20, unit: '500g', origin: 'India' },
  { slug: 'toor-dal', name: 'Toor dal', tamil: 'Thuvaram paruppu', category: 'dry-goods', stock: 'in-stock', price: 2.90, unit: '500g', origin: 'India' },
  { slug: 'mustard-seeds', name: 'Mustard seeds', tamil: 'Kadugu', category: 'dry-goods', stock: 'in-stock', price: 1.80, unit: '200g', origin: 'India' },
  { slug: 'fenugreek', name: 'Fenugreek seeds', tamil: 'Vendhayam', category: 'dry-goods', stock: 'in-stock', price: 1.60, unit: '200g', origin: 'India' },
  { slug: 'asafoetida', name: 'Asafoetida', tamil: 'Perungayam', category: 'dry-goods', stock: 'low', price: 4.50, unit: '50g', origin: 'India' },
  { slug: 'tamarind', name: 'Tamarind', tamil: 'Puli', category: 'dry-goods', stock: 'in-stock', price: 2.40, unit: '500g', origin: 'India' },
  { slug: 'jaggery-block', name: 'Jaggery block', tamil: 'Vellam', category: 'dry-goods', stock: 'in-stock', price: 3.10, unit: '500g', origin: 'India' },
  { slug: 'coconut', name: 'Coconut', tamil: 'Thengai', category: 'dry-goods', stock: 'in-stock', price: 2.20, unit: 'piece', origin: 'Sri Lanka' },
  { slug: 'mtr-rasam-powder', name: 'MTR rasam powder', category: 'dry-goods', stock: 'in-stock', price: 3.60, unit: '200g', origin: 'India' },
];
