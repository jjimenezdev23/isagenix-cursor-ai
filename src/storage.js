const STORAGE_KEY = "local-cafe-manager-v1";

export const defaultData = {
  capitalEntries: [
    {
      id: "cap-start",
      type: "capital",
      label: "Opening cash fund",
      amount: 1500,
      date: new Date().toISOString().slice(0, 10),
      notes: "Seed starting capital. Edit or delete this sample entry.",
    },
    {
      id: "exp-start",
      type: "expense",
      label: "Opening supplies purchase",
      amount: 380,
      date: new Date().toISOString().slice(0, 10),
      notes: "Sample setup expense.",
    },
  ],
  ingredients: [
    {
      id: "ing-coffee-beans",
      name: "Coffee beans",
      category: "Beverage",
      unit: "g",
      unitCost: 0.025,
      stockQuantity: 5000,
      reorderLevel: 1000,
    },
    {
      id: "ing-milk",
      name: "Milk",
      category: "Dairy",
      unit: "ml",
      unitCost: 0.002,
      stockQuantity: 10000,
      reorderLevel: 2000,
    },
    {
      id: "ing-cup",
      name: "Takeaway cup",
      category: "Packaging",
      unit: "each",
      unitCost: 0.08,
      stockQuantity: 200,
      reorderLevel: 50,
    },
    {
      id: "ing-sugar",
      name: "Sugar",
      category: "Pantry",
      unit: "g",
      unitCost: 0.003,
      stockQuantity: 1000,
      reorderLevel: 200,
    },
  ],
  recipes: [
    {
      id: "recipe-latte",
      name: "Cafe Latte",
      price: 4.5,
      laborCost: 0.35,
      overheadCost: 0.2,
      items: [
        { ingredientId: "ing-coffee-beans", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 240 },
        { ingredientId: "ing-cup", quantity: 1 },
      ],
    },
    {
      id: "recipe-americano",
      name: "Americano",
      price: 3.25,
      laborCost: 0.25,
      overheadCost: 0.15,
      items: [
        { ingredientId: "ing-coffee-beans", quantity: 18 },
        { ingredientId: "ing-cup", quantity: 1 },
      ],
    },
    {
      id: "recipe-sweet-latte",
      name: "Sweet Latte",
      price: 4.95,
      laborCost: 0.35,
      overheadCost: 0.22,
      items: [
        { ingredientId: "ing-coffee-beans", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 240 },
        { ingredientId: "ing-sugar", quantity: 8 },
        { ingredientId: "ing-cup", quantity: 1 },
      ],
    },
  ],
  sales: [],
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const mergeWithDefaults = (data) => ({
  capitalEntries: Array.isArray(data?.capitalEntries)
    ? data.capitalEntries
    : clone(defaultData.capitalEntries),
  ingredients: Array.isArray(data?.ingredients)
    ? data.ingredients
    : clone(defaultData.ingredients),
  recipes: Array.isArray(data?.recipes) ? data.recipes : clone(defaultData.recipes),
  sales: Array.isArray(data?.sales) ? data.sales : [],
});

export const loadData = () => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return clone(defaultData);
  }

  try {
    return mergeWithDefaults(JSON.parse(stored));
  } catch (error) {
    console.warn("Could not read saved cafe data. Loading defaults.", error);
    return clone(defaultData);
  }
};

export const saveData = (data) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const resetData = () => {
  const fresh = clone(defaultData);
  saveData(fresh);
  return fresh;
};

export const exportData = (data) =>
  JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: "local-cafe-manager",
      data,
    },
    null,
    2,
  );

export const importData = (payload) => {
  const parsed = JSON.parse(payload);
  const data = parsed.data ? parsed.data : parsed;
  return mergeWithDefaults(data);
};
