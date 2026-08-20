const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Settings = require('../models/Settings');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected for seeding...');

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
      Settings.deleteMany({}),
      Inventory.deleteMany({}),
      Supplier.deleteMany({}),
    ]);

    const users = await User.create([
      { name: 'Admin', email: 'admin@restaurant.com', password: 'admin123', role: 'admin', phone: '+17185551234' },
      { name: 'Manager', email: 'manager@restaurant.com', password: 'manager123', role: 'manager', phone: '+17185555678' },
      { name: 'Chef', email: 'kitchen@restaurant.com', password: 'kitchen123', role: 'kitchen', phone: '+17185559012' },
      { name: 'Cashier', email: 'staff@restaurant.com', password: 'staff123', role: 'staff', phone: '+17185553456' },
    ]);
    console.log('Users seeded');

    await Settings.create({
      restaurantName: 'Kennedy Fried Chicken',
      tagline: 'The Bronx - Since 1990s',
      phone: '+17185551234',
      email: 'info@kennedyfriedchicken.com',
      address: '696 Allerton Ave, The Bronx, NY 10467',
      currency: 'USD',
      currencySymbol: '$',
      taxRate: 8.875,
      serviceChargeRate: 0,
      openingTime: '10:00',
      closingTime: '03:30',
      timezone: 'America/New_York',
      invoicePrefix: 'KFC',
      lowStockThreshold: 10,
    });
    console.log('Settings seeded');

    const suppliers = await Supplier.create([
      { name: 'Bronx Poultry Supply', contactPerson: 'Mike', phone: '+17185551111', email: 'mike@bronxpoultry.com', categories: ['Chicken', 'Meat'], rating: 5 },
      { name: 'NYC Fresh Produce', contactPerson: 'Carlos', phone: '+17185552222', email: 'carlos@nycproduce.com', categories: ['Vegetables', 'Greens'], rating: 4 },
      { name: 'Metro Food Services', contactPerson: 'Sarah', phone: '+17185553333', email: 'sarah@metrofood.com', categories: ['Buns', 'Bread', 'Dry Goods', 'Drinks'], rating: 4 },
      { name: 'Seafood Direct NYC', contactPerson: 'James', phone: '+17185554444', email: 'james@seafooddirect.com', categories: ['Seafood'], rating: 4 },
    ]);
    console.log('Suppliers seeded');

    const inventory = await Inventory.create([
      { name: 'Chicken Breast', category: 'Chicken', unit: 'lbs', quantity: 80, minQuantity: 20, costPerUnit: 3.50, supplier: suppliers[0]._id },
      { name: 'Chicken Thighs', category: 'Chicken', unit: 'lbs', quantity: 60, minQuantity: 15, costPerUnit: 2.80, supplier: suppliers[0]._id },
      { name: 'Chicken Wings', category: 'Chicken', unit: 'lbs', quantity: 50, minQuantity: 15, costPerUnit: 3.00, supplier: suppliers[0]._id },
      { name: 'Ground Beef', category: 'Meat', unit: 'lbs', quantity: 40, minQuantity: 10, costPerUnit: 5.50, supplier: suppliers[0]._id },
      { name: 'Lamb', category: 'Meat', unit: 'lbs', quantity: 20, minQuantity: 5, costPerUnit: 8.00, supplier: suppliers[0]._id },
      { name: 'Jumbo Shrimp', category: 'Seafood', unit: 'lbs', quantity: 15, minQuantity: 5, costPerUnit: 9.00, supplier: suppliers[3]._id },
      { name: 'Whiting Fish', category: 'Seafood', unit: 'lbs', quantity: 10, minQuantity: 5, costPerUnit: 6.00, supplier: suppliers[3]._id },
      { name: 'Burger Buns', category: 'Bread', unit: 'packs', quantity: 30, minQuantity: 10, costPerUnit: 4.50, supplier: suppliers[2]._id },
      { name: 'Lettuce', category: 'Vegetables', unit: 'heads', quantity: 25, minQuantity: 10, costPerUnit: 1.50, supplier: suppliers[1]._id },
      { name: 'Tomatoes', category: 'Vegetables', unit: 'lbs', quantity: 20, minQuantity: 8, costPerUnit: 2.00, supplier: suppliers[1]._id },
      { name: 'Onions', category: 'Vegetables', unit: 'lbs', quantity: 15, minQuantity: 5, costPerUnit: 1.50, supplier: suppliers[1]._id },
      { name: 'Cheese Slices', category: 'Dairy', unit: 'packs', quantity: 20, minQuantity: 8, costPerUnit: 5.00, supplier: suppliers[2]._id },
      { name: 'French Fries', category: 'Frozen', unit: 'lbs', quantity: 50, minQuantity: 15, costPerUnit: 2.00, supplier: suppliers[2]._id },
      { name: 'Can Soda (Coke)', category: 'Drinks', unit: 'cases', quantity: 24, minQuantity: 10, costPerUnit: 8.00, supplier: suppliers[2]._id },
      { name: 'Can Soda (Sprite)', category: 'Drinks', unit: 'cases', quantity: 12, minQuantity: 5, costPerUnit: 8.00, supplier: suppliers[2]._id },
      { name: 'Cooking Oil', category: 'Supplies', unit: 'gallons', quantity: 10, minQuantity: 3, costPerUnit: 12.00, supplier: suppliers[2]._id },
      { name: 'Seasoning Mix', category: 'Spices', unit: 'lbs', quantity: 8, minQuantity: 3, costPerUnit: 6.00, supplier: suppliers[2]._id },
      { name: 'Nuggets (6 pcs)', category: 'Chicken', unit: 'lbs', quantity: 25, minQuantity: 10, costPerUnit: 4.00, supplier: suppliers[0]._id },
      { name: 'Chicken Tenders', category: 'Chicken', unit: 'lbs', quantity: 20, minQuantity: 8, costPerUnit: 4.50, supplier: suppliers[0]._id },
      { name: 'Ice Cream Cups', category: 'Desserts', unit: 'cases', quantity: 10, minQuantity: 4, costPerUnit: 15.00, supplier: suppliers[2]._id },
    ]);
    console.log('Inventory seeded');

    const categories = await Category.create([
      { name: 'Fresh Salads', description: 'Fresh mix of greens and toppings', sortOrder: 1 },
      { name: 'Kennedy Burgers', description: 'Juicy beef patties and chicken sandwiches', sortOrder: 2 },
      { name: 'Combos', description: 'Meal combos with sides and drink', sortOrder: 3 },
      { name: 'Over Rice', description: 'Rice platters with your choice of protein', sortOrder: 4 },
      { name: 'Mains', description: 'Signature fried chicken and wings', sortOrder: 5 },
      { name: 'Side Orders', description: 'Sides to complement your meal', sortOrder: 6 },
      { name: 'Desserts', description: 'Sweet treats to finish your meal', sortOrder: 7 },
      { name: 'Drinks', description: 'Refreshing beverages', sortOrder: 8 },
    ]);
    console.log('Categories seeded');

    const menuItems = await MenuItem.create([
      // Fresh Salads
      { name: 'Garden Salad', description: 'Fresh mix of greens', price: 7.00, category: categories[0]._id, isVegetarian: true, preparationTime: 5, costPrice: 2.50, inventoryItem: inventory[8]._id, inventoryDeduction: 0.3 },
      { name: 'Grilled Chicken Salad', description: 'Served with bottled water', price: 11.50, category: categories[0]._id, preparationTime: 8, costPrice: 5.00, inventoryItem: inventory[0]._id, inventoryDeduction: 0.3 },
      { name: 'Chicken Nuggets Salad (6 pcs)', description: 'Served with bottled water', price: 11.50, category: categories[0]._id, preparationTime: 8, costPrice: 5.00, inventoryItem: inventory[17]._id, inventoryDeduction: 0.3 },
      { name: 'Spicy Chicken Salad', description: 'Served with bottled water', price: 11.50, category: categories[0]._id, preparationTime: 8, costPrice: 5.00 },
      { name: 'Chicken Tenders Salad (3 pcs)', description: 'Served with bottled water', price: 11.50, category: categories[0]._id, preparationTime: 8, costPrice: 5.00, inventoryItem: inventory[18]._id, inventoryDeduction: 0.3 },
      { name: 'Jumbo Shrimp Salad (6 pcs)', description: 'Served with bottled water', price: 11.50, category: categories[0]._id, preparationTime: 10, costPrice: 6.00, inventoryItem: inventory[5]._id, inventoryDeduction: 0.3 },
      { name: 'Shrimp Basket Salad', description: 'Served with bottled water', price: 11.50, category: categories[0]._id, preparationTime: 10, costPrice: 6.00, inventoryItem: inventory[5]._id, inventoryDeduction: 0.3 },
      { name: 'Lamb Salad', description: 'Served with bottled water', price: 11.50, category: categories[0]._id, preparationTime: 10, costPrice: 6.00, inventoryItem: inventory[4]._id, inventoryDeduction: 0.3 },
      { name: 'Whiting Fish Salad (2 pcs)', description: 'Served with bottled water', price: 11.50, category: categories[0]._id, preparationTime: 10, costPrice: 5.50, inventoryItem: inventory[6]._id, inventoryDeduction: 0.3 },

      // Kennedy Burgers
      { name: 'Cheeseburger', description: 'Juicy patty topped with melted cheese', price: 7.99, category: categories[1]._id, preparationTime: 8, costPrice: 3.50, inventoryItem: inventory[3]._id, inventoryDeduction: 0.25, inventoryItem: inventory[11]._id, inventoryDeduction: 0.02 },
      { name: 'Chicken Sandwich', description: 'Juicy chicken served on a bun', price: 7.99, category: categories[1]._id, preparationTime: 8, costPrice: 3.00, inventoryItem: inventory[0]._id, inventoryDeduction: 0.25 },
      { name: 'Spicy Chicken Sandwich', description: 'Spicy chicken breast served on a sandwich', price: 9.50, category: categories[1]._id, preparationTime: 8, costPrice: 3.50, inventoryItem: inventory[0]._id, inventoryDeduction: 0.25 },
      { name: 'Double Cheeseburger', description: 'Two beef patties topped with melted cheese', price: 9.50, category: categories[1]._id, preparationTime: 10, costPrice: 5.00, inventoryItem: inventory[3]._id, inventoryDeduction: 0.50, inventoryItem: inventory[11]._id, inventoryDeduction: 0.04 },
      { name: 'Double Chicken Sandwich', description: 'Two juicy chicken breasts served together', price: 9.50, category: categories[1]._id, preparationTime: 10, costPrice: 4.50, inventoryItem: inventory[0]._id, inventoryDeduction: 0.50 },
      { name: 'Grilled Chicken Sandwich', description: 'Juicy chicken breast served on a toasted bun', price: 9.50, category: categories[1]._id, preparationTime: 10, costPrice: 4.00, inventoryItem: inventory[0]._id, inventoryDeduction: 0.3 },

      // Combos
      { name: 'Chicken Combo', description: 'Fried chicken pieces with fries and drink', price: 10.99, category: categories[2]._id, preparationTime: 12, costPrice: 5.00, inventoryItem: inventory[0]._id, inventoryDeduction: 0.4, inventoryItem: inventory[12]._id, inventoryDeduction: 0.15 },
      { name: 'Hot Wings Combo', description: 'Spicy buffalo wings with fries and drink', price: 11.99, category: categories[2]._id, preparationTime: 15, costPrice: 5.50, inventoryItem: inventory[2]._id, inventoryDeduction: 0.5 },
      { name: 'Popcorn Chicken Combo', description: 'Popcorn chicken with fries and drink', price: 10.99, category: categories[2]._id, preparationTime: 10, costPrice: 4.50 },
      { name: 'Shrimp Basket Combo', description: 'Fried shrimp basket with fries and drink', price: 12.05, category: categories[2]._id, preparationTime: 12, costPrice: 6.00, inventoryItem: inventory[5]._id, inventoryDeduction: 0.4 },
      { name: 'Kennedy Burger Combo', description: 'Cheeseburger with fries and can soda', price: 11.99, category: categories[2]._id, preparationTime: 10, costPrice: 5.00, inventoryItem: inventory[3]._id, inventoryDeduction: 0.25 },
      { name: 'Double Burger Combo', description: 'Double cheeseburger with fries and can soda', price: 13.50, category: categories[2]._id, preparationTime: 12, costPrice: 6.50 },
      { name: 'Kennedy Sandwich Combo', description: 'Chicken sandwich with fries and can soda', price: 11.99, category: categories[2]._id, preparationTime: 10, costPrice: 5.00 },
      { name: 'Spicy Sandwich Combo', description: 'Spicy chicken sandwich with fries and can soda', price: 13.50, category: categories[2]._id, preparationTime: 10, costPrice: 5.50 },

      // Over Rice
      { name: 'Lamb Over Rice', description: 'Seasoned lamb over rice', price: 9.99, category: categories[3]._id, preparationTime: 8, costPrice: 4.50, inventoryItem: inventory[4]._id, inventoryDeduction: 0.4 },
      { name: 'Chicken Over Rice', description: 'Fried chicken over rice', price: 9.99, category: categories[3]._id, preparationTime: 8, costPrice: 4.00, inventoryItem: inventory[0]._id, inventoryDeduction: 0.4 },
      { name: 'Mixed Over Rice', description: 'Lamb and chicken over rice', price: 11.50, category: categories[3]._id, preparationTime: 10, costPrice: 5.50 },

      // Mains
      { name: 'Fried Chicken (2 pcs)', description: 'Crispy fried chicken pieces', price: 6.99, category: categories[4]._id, preparationTime: 12, costPrice: 3.00, inventoryItem: inventory[0]._id, inventoryDeduction: 0.3 },
      { name: 'Fried Chicken (3 pcs)', description: 'Crispy fried chicken pieces', price: 9.50, category: categories[4]._id, preparationTime: 12, costPrice: 4.00, inventoryItem: inventory[0]._id, inventoryDeduction: 0.45 },
      { name: 'Fried Chicken (4 pcs)', description: 'Crispy fried chicken pieces', price: 11.50, category: categories[4]._id, preparationTime: 12, costPrice: 5.00, inventoryItem: inventory[0]._id, inventoryDeduction: 0.6 },
      { name: 'Hot Wings (10 pcs)', description: 'Spicy buffalo wings', price: 12.99, category: categories[4]._id, preparationTime: 15, costPrice: 5.50, inventoryItem: inventory[2]._id, inventoryDeduction: 0.7 },
      { name: 'Popcorn Chicken', description: 'Bite-sized crispy chicken', price: 8.99, category: categories[4]._id, preparationTime: 10, costPrice: 4.00 },
      { name: 'Chicken Nuggets (6 pcs)', description: 'Crispy chicken nuggets', price: 7.50, category: categories[4]._id, preparationTime: 8, costPrice: 3.00, inventoryItem: inventory[17]._id, inventoryDeduction: 0.25 },
      { name: 'Chicken Tenders (3 pcs)', description: 'Crispy chicken tenders', price: 8.50, category: categories[4]._id, preparationTime: 8, costPrice: 3.50, inventoryItem: inventory[18]._id, inventoryDeduction: 0.3 },
      { name: 'Jumbo Shrimp (6 pcs)', description: 'Fried jumbo shrimp', price: 11.50, category: categories[4]._id, preparationTime: 10, costPrice: 5.50, inventoryItem: inventory[5]._id, inventoryDeduction: 0.4 },
      { name: 'Shrimp Basket', description: 'Fried shrimp basket', price: 11.50, category: categories[4]._id, preparationTime: 10, costPrice: 5.50, inventoryItem: inventory[5]._id, inventoryDeduction: 0.4 },
      { name: 'Whiting Fish (2 pcs)', description: 'Fried whiting fish fillets', price: 10.99, category: categories[4]._id, preparationTime: 10, costPrice: 4.50, inventoryItem: inventory[6]._id, inventoryDeduction: 0.3 },
      { name: 'Lamb Chops (3 pcs)', description: 'Seasoned grilled lamb chops', price: 14.99, category: categories[4]._id, preparationTime: 15, costPrice: 7.00, inventoryItem: inventory[4]._id, inventoryDeduction: 0.5 },

      // Side Orders
      { name: 'French Fries (Regular)', description: 'Crispy golden fries', price: 3.99, category: categories[5]._id, isVegetarian: true, preparationTime: 5, costPrice: 1.00, inventoryItem: inventory[12]._id, inventoryDeduction: 0.2 },
      { name: 'French Fries (Large)', description: 'Large portion of crispy fries', price: 5.99, category: categories[5]._id, isVegetarian: true, preparationTime: 5, costPrice: 1.50, inventoryItem: inventory[12]._id, inventoryDeduction: 0.35 },
      { name: 'Onion Rings', description: 'Crispy battered onion rings', price: 4.99, category: categories[5]._id, isVegetarian: true, preparationTime: 6, costPrice: 1.50 },
      { name: 'Coleslaw', description: 'Creamy coleslaw', price: 2.99, category: categories[5]._id, isVegetarian: true, preparationTime: 2, costPrice: 0.75 },
      { name: 'Mashed Potatoes', description: 'Creamy mashed potatoes with gravy', price: 3.49, category: categories[5]._id, isVegetarian: true, preparationTime: 2, costPrice: 0.80 },
      { name: 'Corn on the Cob', description: 'Sweet corn on the cob', price: 2.99, category: categories[5]._id, isVegetarian: true, preparationTime: 3, costPrice: 0.60 },

      // Desserts
      { name: 'Ice Cream (Vanilla)', description: 'Classic vanilla ice cream cup', price: 3.50, category: categories[6]._id, isVegetarian: true, preparationTime: 1, costPrice: 1.20, inventoryItem: inventory[19]._id, inventoryDeduction: 0.1 },
      { name: 'Ice Cream (Chocolate)', description: 'Rich chocolate ice cream cup', price: 3.50, category: categories[6]._id, isVegetarian: true, preparationTime: 1, costPrice: 1.20, inventoryItem: inventory[19]._id, inventoryDeduction: 0.1 },
      { name: 'Ice Cream (Strawberry)', description: 'Sweet strawberry ice cream cup', price: 3.50, category: categories[6]._id, isVegetarian: true, preparationTime: 1, costPrice: 1.20, inventoryItem: inventory[19]._id, inventoryDeduction: 0.1 },

      // Drinks
      { name: 'Coca-Cola (Can)', description: 'Classic Coca-Cola', price: 1.99, category: categories[7]._id, isVegetarian: true, preparationTime: 1, costPrice: 0.50, inventoryItem: inventory[13]._id, inventoryDeduction: 0.05 },
      { name: 'Sprite (Can)', description: 'Lemon-lime soda', price: 1.99, category: categories[7]._id, isVegetarian: true, preparationTime: 1, costPrice: 0.50, inventoryItem: inventory[14]._id, inventoryDeduction: 0.05 },
      { name: 'Pepsi (Can)', description: 'Pepsi cola', price: 1.99, category: categories[7]._id, isVegetarian: true, preparationTime: 1, costPrice: 0.50 },
      { name: 'Orange Juice', description: 'Fresh orange juice', price: 3.99, category: categories[7]._id, isVegetarian: true, preparationTime: 2, costPrice: 1.50 },
      { name: 'Bottled Water', description: 'Poland Spring water', price: 1.50, category: categories[7]._id, isVegetarian: true, preparationTime: 1, costPrice: 0.40 },
      { name: 'Iced Tea', description: 'Fresh brewed iced tea', price: 2.49, category: categories[7]._id, isVegetarian: true, preparationTime: 2, costPrice: 0.50 },
    ]);
    console.log('Menu items seeded: ' + menuItems.length);

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
