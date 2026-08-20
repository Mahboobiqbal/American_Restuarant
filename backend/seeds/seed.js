const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Settings = require('../models/Settings');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
      Settings.deleteMany({}),
      Inventory.deleteMany({}),
      Supplier.deleteMany({}),
    ]);

    // Create users
    const users = await User.create([
      { name: 'Admin', email: 'admin@restaurant.com', password: 'admin123', role: 'admin', phone: '+923001234567' },
      { name: 'Ahmed Manager', email: 'manager@restaurant.com', password: 'manager123', role: 'manager', phone: '+923007654321' },
      { name: 'Chef Ali', email: 'kitchen@restaurant.com', password: 'kitchen123', role: 'kitchen', phone: '+923009876543' },
      { name: 'Sara Staff', email: 'staff@restaurant.com', password: 'staff123', role: 'staff', phone: '+923001112233' },
    ]);
    console.log('Users seeded');

    // Create settings
    await Settings.create({
      restaurantName: 'Restaurant Atiq',
      tagline: 'Fine Dining Experience',
      phone: '+923001234567',
      email: 'info@restaurantatiq.com',
      address: '123 Main Boulevard, Lahore, Pakistan',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      taxRate: 8,
      serviceChargeRate: 5,
      openingTime: '09:00',
      closingTime: '23:00',
    });
    console.log('Settings seeded');

    // Create suppliers
    const suppliers = await Supplier.create([
      { name: 'Fresh Produce Co.', contactPerson: 'Hassan', phone: '+923012345678', email: 'hassan@freshproduce.com', categories: ['Vegetables', 'Fruits'], rating: 4 },
      { name: 'Meat Master', contactPerson: 'Usman', phone: '+923023456789', email: 'usman@meatmaster.com', categories: ['Meat', 'Poultry'], rating: 5 },
      { name: 'Spice World', contactPerson: 'Fatima', phone: '+923034567890', email: 'fatima@spiceworld.com', categories: ['Spices', 'Dry Goods'], rating: 4 },
    ]);
    console.log('Suppliers seeded');

    // Create inventory
    const inventory = await Inventory.create([
      { name: 'Basmati Rice', category: 'Grains', unit: 'kg', quantity: 50, minQuantity: 10, costPerUnit: 200, supplier: suppliers[2]._id },
      { name: 'Chicken Breast', category: 'Meat', unit: 'kg', quantity: 20, minQuantity: 5, costPerUnit: 600, supplier: suppliers[1]._id },
      { name: 'Mutton', category: 'Meat', unit: 'kg', quantity: 15, minQuantity: 5, costPerUnit: 1200, supplier: suppliers[1]._id },
      { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', quantity: 10, minQuantity: 5, costPerUnit: 80, supplier: suppliers[0]._id },
      { name: 'Onions', category: 'Vegetables', unit: 'kg', quantity: 8, minQuantity: 5, costPerUnit: 60, supplier: suppliers[0]._id },
      { name: 'Cooking Oil', category: 'Oils', unit: 'liters', quantity: 25, minQuantity: 5, costPerUnit: 300, supplier: suppliers[2]._id },
      { name: 'All-Purpose Flour', category: 'Grains', unit: 'kg', quantity: 30, minQuantity: 10, costPerUnit: 100, supplier: suppliers[2]._id },
      { name: 'Sugar', category: 'Dry Goods', unit: 'kg', quantity: 15, minQuantity: 5, costPerUnit: 120, supplier: suppliers[2]._id },
      { name: 'Salt', category: 'Spices', unit: 'kg', quantity: 10, minQuantity: 2, costPerUnit: 40, supplier: suppliers[2]._id },
      { name: 'Black Pepper', category: 'Spices', unit: 'kg', quantity: 3, minQuantity: 1, costPerUnit: 800, supplier: suppliers[2]._id },
      { name: 'Garam Masala', category: 'Spices', unit: 'kg', quantity: 2, minQuantity: 1, costPerUnit: 600, supplier: suppliers[2]._id },
      { name: 'Fresh Cream', category: 'Dairy', unit: 'liters', quantity: 8, minQuantity: 3, costPerUnit: 400, supplier: suppliers[0]._id },
      { name: 'Butter', category: 'Dairy', unit: 'kg', quantity: 5, minQuantity: 2, costPerUnit: 800, supplier: suppliers[0]._id },
      { name: 'Paneer', category: 'Dairy', unit: 'kg', quantity: 6, minQuantity: 2, costPerUnit: 500, supplier: suppliers[0]._id },
      { name: 'Lentils (Daal)', category: 'Grains', unit: 'kg', quantity: 12, minQuantity: 5, costPerUnit: 180, supplier: suppliers[2]._id },
    ]);
    console.log('Inventory seeded');

    // Create categories
    const categories = await Category.create([
      { name: 'Appetizers', description: 'Start your meal with our delicious appetizers', sortOrder: 1 },
      { name: 'BBQ & Grills', description: 'Charcoal-grilled to perfection', sortOrder: 2 },
      { name: 'Biryani & Rice', description: 'Aromatic rice dishes', sortOrder: 3 },
      { name: 'Curry & Gravies', description: 'Rich and flavorful curries', sortOrder: 4 },
      { name: 'Bread & Naan', description: 'Freshly baked breads', sortOrder: 5 },
      { name: 'Chinese', description: 'Indo-Chinese favorites', sortOrder: 6 },
      { name: 'Continental', description: 'Western cuisine', sortOrder: 7 },
      { name: 'Desserts', description: 'Sweet endings', sortOrder: 8 },
      { name: 'Beverages', description: 'Refreshing drinks', sortOrder: 9 },
      { name: 'Platters', description: 'Sharing platters for groups', sortOrder: 10 },
    ]);
    console.log('Categories seeded');

    // Create menu items
    const menuItems = await MenuItem.create([
      // Appetizers
      { name: 'Chicken Seekh Kebab', description: 'Minced chicken skewers with spices', price: 450, category: categories[0]._id, preparationTime: 15, costPrice: 180, inventoryItem: inventory[1]._id, inventoryDeduction: 0.2 },
      { name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled', price: 400, category: categories[0]._id, isVegetarian: true, preparationTime: 12, costPrice: 150, inventoryItem: inventory[13]._id, inventoryDeduction: 0.2 },
      { name: 'Fish Pakora', description: 'Crispy battered fish fillets', price: 550, category: categories[0]._id, preparationTime: 15, costPrice: 250 },
      { name: 'Prawn Koliwada', description: 'Spicy fried prawns', price: 650, category: categories[0]._id, preparationTime: 12, costPrice: 300 },
      { name: 'Samosa (2 pcs)', description: 'Crispy pastry with spiced potato filling', price: 150, category: categories[0]._id, isVegetarian: true, preparationTime: 10, costPrice: 50 },

      // BBQ & Grills
      { name: 'Chicken Tikka', description: 'Bone-in chicken marinated and grilled', price: 550, category: categories[1]._id, preparationTime: 20, costPrice: 220, inventoryItem: inventory[1]._id, inventoryDeduction: 0.35 },
      { name: 'Mutton Seekh Kebab', description: 'Juicy minced mutton kebabs', price: 700, category: categories[1]._id, preparationTime: 20, costPrice: 350, inventoryItem: inventory[2]._id, inventoryDeduction: 0.25 },
      { name: 'Reshmi Kebab', description: 'Creamy chicken kebabs', price: 500, category: categories[1]._id, preparationTime: 18, costPrice: 200 },
      { name: 'Tandoori Platter', description: 'Mixed grilled platter for 2', price: 1400, category: categories[1]._id, preparationTime: 25, costPrice: 600 },
      { name: 'Chapli Kebab', description: 'Peshawari-style flat kebab', price: 450, category: categories[1]._id, preparationTime: 15, costPrice: 200 },

      // Biryani & Rice
      { name: 'Chicken Biryani', description: 'Hyderabadi-style dum biryani', price: 500, category: categories[2]._id, preparationTime: 25, costPrice: 200, inventoryItem: inventory[0]._id, inventoryDeduction: 0.25 },
      { name: 'Mutton Biryani', description: 'Aromatic mutton biryani', price: 700, category: categories[2]._id, preparationTime: 30, costPrice: 350, inventoryItem: inventory[0]._id, inventoryDeduction: 0.25 },
      { name: 'Plain Rice', description: 'Steamed basmati rice', price: 150, category: categories[2]._id, isVegetarian: true, preparationTime: 15, costPrice: 40, inventoryItem: inventory[0]._id, inventoryDeduction: 0.2 },
      { name: 'Zeera Rice', description: 'Cumin-flavored rice', price: 200, category: categories[2]._id, isVegetarian: true, preparationTime: 15, costPrice: 50 },

      // Curry & Gravies
      { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 600, category: categories[3]._id, preparationTime: 20, costPrice: 250, inventoryItem: inventory[1]._id, inventoryDeduction: 0.3 },
      { name: 'Chicken Karahi', description: 'Traditional wok-cooked chicken', price: 550, category: categories[3]._id, preparationTime: 20, costPrice: 220, inventoryItem: inventory[1]._id, inventoryDeduction: 0.3 },
      { name: 'Mutton Korma', description: 'Rich creamy mutton curry', price: 750, category: categories[3]._id, preparationTime: 30, costPrice: 380, inventoryItem: inventory[2]._id, inventoryDeduction: 0.3 },
      { name: 'Daal Makhni', description: 'Creamy black lentil curry', price: 350, category: categories[3]._id, isVegetarian: true, preparationTime: 15, costPrice: 100, inventoryItem: inventory[14]._id, inventoryDeduction: 0.2 },
      { name: 'Palak Paneer', description: 'Cottage cheese in spinach gravy', price: 400, category: categories[3]._id, isVegetarian: true, preparationTime: 15, costPrice: 150, inventoryItem: inventory[13]._id, inventoryDeduction: 0.2 },
      { name: 'Chicken Handi', description: 'Clay-pot chicken curry', price: 550, category: categories[3]._id, preparationTime: 25, costPrice: 230 },

      // Bread & Naan
      { name: 'Naan', description: 'Classic tandoori bread', price: 60, category: categories[4]._id, isVegetarian: true, preparationTime: 5, costPrice: 15 },
      { name: 'Garlic Naan', description: 'Naan with garlic butter', price: 80, category: categories[4]._id, isVegetarian: true, preparationTime: 5, costPrice: 20 },
      { name: 'Roghni Naan', description: 'Sesame seed naan', price: 90, category: categories[4]._id, isVegetarian: true, preparationTime: 5, costPrice: 25 },
      { name: 'Paratha', description: 'Layered flatbread', price: 70, category: categories[4]._id, isVegetarian: true, preparationTime: 5, costPrice: 18 },
      { name: 'Khamiri Roti', description: 'Traditional leavened bread', price: 50, category: categories[4]._id, isVegetarian: true, preparationTime: 5, costPrice: 12 },

      // Chinese
      { name: 'Chicken Manchurian', description: 'Indo-Chinese chicken in tangy sauce', price: 500, category: categories[5]._id, preparationTime: 15, costPrice: 200 },
      { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 350, category: categories[5]._id, isVegetarian: true, preparationTime: 12, costPrice: 100 },
      { name: 'Sweet & Sour Chicken', description: 'Crispy chicken in sweet sauce', price: 500, category: categories[5]._id, preparationTime: 15, costPrice: 210 },

      // Continental
      { name: 'Grilled Chicken Steak', description: 'Herb-crusted chicken with vegetables', price: 800, category: categories[6]._id, preparationTime: 25, costPrice: 350 },
      { name: 'Fish & Chips', description: 'Battered fish with fries', price: 750, category: categories[6]._id, preparationTime: 20, costPrice: 300 },
      { name: 'Pasta Alfredo', description: 'Creamy white sauce pasta', price: 500, category: categories[6]._id, isVegetarian: true, preparationTime: 15, costPrice: 150 },

      // Desserts
      { name: 'Gulab Jamun (4 pcs)', description: 'Deep-fried milk dumplings in syrup', price: 200, category: categories[7]._id, isVegetarian: true, preparationTime: 10, costPrice: 60 },
      { name: 'Kheer', description: 'Rice pudding with cardamom', price: 180, category: categories[7]._id, isVegetarian: true, preparationTime: 8, costPrice: 50 },
      { name: 'Jalebi', description: 'Crispy syrup-soaked spirals', price: 150, category: categories[7]._id, isVegetarian: true, preparationTime: 10, costPrice: 40 },
      { name: 'Ice Cream Sundae', description: 'Three scoops with toppings', price: 250, category: categories[7]._id, isVegetarian: true, preparationTime: 5, costPrice: 80 },

      // Beverages
      { name: 'Mango Lassi', description: 'Creamy mango yogurt drink', price: 200, category: categories[8]._id, isVegetarian: true, preparationTime: 5, costPrice: 60 },
      { name: 'Fresh Lime Soda', description: 'Refreshing lime with soda', price: 120, category: categories[8]._id, isVegetarian: true, preparationTime: 3, costPrice: 20 },
      { name: 'Chai', description: 'Traditional Pakistani tea', price: 80, category: categories[8]._id, isVegetarian: true, preparationTime: 5, costPrice: 15 },
      { name: 'Cold Drink', description: 'Coca-Cola / Sprite / Fanta', price: 100, category: categories[8]._id, isVegetarian: true, preparationTime: 1, costPrice: 40 },
      { name: 'Mineral Water', description: 'Bottled water 1.5L', price: 80, category: categories[8]._id, isVegetarian: true, preparationTime: 1, costPrice: 30 },

      // Platters
      { name: 'BBQ Platter for 4', description: 'Mixed BBQ with sides', price: 3500, category: categories[9]._id, preparationTime: 30, costPrice: 1500 },
      { name: 'Family Platter', description: 'Complete family meal for 4-5', price: 4000, category: categories[9]._id, preparationTime: 35, costPrice: 1800 },
    ]);
    console.log('Menu items seeded');

    // Create tables
    const tables = [];
    const sections = ['indoor', 'indoor', 'indoor', 'indoor', 'outdoor', 'outdoor', 'private', 'bar'];
    for (let i = 1; i <= 20; i++) {
      let section;
      if (i <= 10) section = 'indoor';
      else if (i <= 14) section = 'outdoor';
      else if (i <= 17) section = 'private';
      else section = 'bar';

      tables.push({
        number: i,
        name: section === 'private' ? `Private ${i - 16}` : `Table ${i}`,
        capacity: section === 'private' ? 8 : section === 'bar' ? 2 : Math.floor(Math.random() * 4) + 2,
        section,
        status: 'available',
      });
    }
    await Table.create(tables);
    console.log('Tables seeded');

    console.log('\nSeed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin:    admin@restaurant.com / admin123');
    console.log('Manager:  manager@restaurant.com / manager123');
    console.log('Kitchen:  kitchen@restaurant.com / kitchen123');
    console.log('Staff:    staff@restaurant.com / staff123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
