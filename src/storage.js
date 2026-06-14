const STORAGE_KEY = "local-cafe-manager-v2";

const today = () => new Date().toISOString().slice(0, 10);

const ingredient = ({
  id,
  name,
  unit,
  purchaseQuantity,
  purchaseCost,
  notes,
}) => {
  const unitCost = purchaseQuantity > 0 ? purchaseCost / purchaseQuantity : 0;
  return {
    id,
    name,
    unit,
    purchaseQuantity,
    purchaseCost,
    unitCost,
    stockQuantity: purchaseQuantity,
    reorderLevel: Math.round(purchaseQuantity * 0.2 * 100) / 100,
    notes,
  };
};

export const defaultData = {
  capitalEntries: [
    {
      id: "cap-start",
      type: "capital",
      label: "Opening ingredient capital",
      amount: 4367,
      date: today(),
      notes: "Matches the total purchase cost entered in the Unit Costs sheet.",
    },
    {
      id: "exp-start",
      type: "expense",
      label: "Unit Costs sheet purchases",
      amount: 4367,
      date: today(),
      notes: "Coffee, milk, cups, lids, ice, straws, water, condensed milk, ube powder, caramel syrup, and chocolate syrup.",
    },
  ],
  ingredients: [
    ingredient({
      id: "ing-coffee",
      name: "Coffee",
      unit: "g",
      purchaseQuantity: 3000,
      purchaseCost: 3200,
      notes: "Enter coffee bag total grams and purchase cost.",
    }),
    ingredient({
      id: "ing-milk",
      name: "Milk",
      unit: "ml",
      purchaseQuantity: 1000,
      purchaseCost: 87,
      notes: "Enter carton/bottle total ml and purchase cost.",
    }),
    ingredient({
      id: "ing-cup",
      name: "Cup",
      unit: "pc",
      purchaseQuantity: 50,
      purchaseCost: 180,
      notes: "Enter number of cups per pack and pack cost.",
    }),
    ingredient({
      id: "ing-lid",
      name: "Lid",
      unit: "pc",
      purchaseQuantity: 50,
      purchaseCost: 90,
      notes: "Enter number of lids per pack and pack cost.",
    }),
    ingredient({
      id: "ing-ice",
      name: "Ice",
      unit: "g",
      purchaseQuantity: 5000,
      purchaseCost: 90,
      notes: "Enter total grams bought/produced and cost.",
    }),
    ingredient({
      id: "ing-straw",
      name: "Straw",
      unit: "pc",
      purchaseQuantity: 50,
      purchaseCost: 70,
      notes: "Enter number of straws per pack and pack cost.",
    }),
    ingredient({
      id: "ing-water",
      name: "Water",
      unit: "ml",
      purchaseQuantity: 20000,
      purchaseCost: 30,
      notes: "Enter total ml and cost if you want to include water.",
    }),
    ingredient({
      id: "ing-condensed-milk",
      name: "Condensed milk",
      unit: "g",
      purchaseQuantity: 1000,
      purchaseCost: 150,
      notes: "Enter can/container total grams and cost.",
    }),
    ingredient({
      id: "ing-ube-powder",
      name: "Ube powder",
      unit: "g",
      purchaseQuantity: 50,
      purchaseCost: 60,
      notes: "Enter pouch/container total grams and cost.",
    }),
    ingredient({
      id: "ing-caramel-syrup",
      name: "Caramel Syrup",
      unit: "g",
      purchaseQuantity: 1000,
      purchaseCost: 130,
      notes: "Enter bottle total grams and cost.",
    }),
    ingredient({
      id: "ing-chocolate-syrup",
      name: "Chocolate Syrup",
      unit: "g",
      purchaseQuantity: 623,
      purchaseCost: 280,
      notes: "Enter bottle total grams and cost.",
    }),
  ],
  recipes: [
    {
      id: "recipe-iced-spanish-latte",
      type: "Iced",
      name: "Spanish latte",
      price: 105,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 150 },
        { ingredientId: "ing-ice", quantity: 100 },
        { ingredientId: "ing-condensed-milk", quantity: 30 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
        { ingredientId: "ing-straw", quantity: 1 },
      ],
    },
    {
      id: "recipe-iced-americano",
      type: "Iced",
      name: "Americano",
      price: 70,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-water", quantity: 150 },
        { ingredientId: "ing-ice", quantity: 100 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
        { ingredientId: "ing-straw", quantity: 1 },
      ],
    },
    {
      id: "recipe-iced-latte",
      type: "Iced",
      name: "Latte",
      price: 90,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 150 },
        { ingredientId: "ing-ice", quantity: 100 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
        { ingredientId: "ing-straw", quantity: 1 },
      ],
    },
    {
      id: "recipe-iced-ube-latte",
      type: "Iced",
      name: "Ube Latte",
      price: 110,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 150 },
        { ingredientId: "ing-ice", quantity: 100 },
        { ingredientId: "ing-condensed-milk", quantity: 30 },
        { ingredientId: "ing-ube-powder", quantity: 8 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
        { ingredientId: "ing-straw", quantity: 1 },
      ],
    },
    {
      id: "recipe-iced-mocha-latte",
      type: "Iced",
      name: "Mocha Latte",
      price: 110,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 150 },
        { ingredientId: "ing-ice", quantity: 100 },
        { ingredientId: "ing-condensed-milk", quantity: 30 },
        { ingredientId: "ing-chocolate-syrup", quantity: 35 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
        { ingredientId: "ing-straw", quantity: 1 },
      ],
    },
    {
      id: "recipe-iced-caramel-macchiato",
      type: "Iced",
      name: "Caramel Macchiato",
      price: 110,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 150 },
        { ingredientId: "ing-ice", quantity: 100 },
        { ingredientId: "ing-condensed-milk", quantity: 30 },
        { ingredientId: "ing-caramel-syrup", quantity: 35 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
        { ingredientId: "ing-straw", quantity: 1 },
      ],
    },
    {
      id: "recipe-iced-kape-sua-da",
      type: "Iced",
      name: "Kape Sua Da",
      price: 105,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-water", quantity: 150 },
        { ingredientId: "ing-ice", quantity: 100 },
        { ingredientId: "ing-condensed-milk", quantity: 30 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
        { ingredientId: "ing-straw", quantity: 1 },
      ],
    },
    {
      id: "recipe-hot-spanish-latte",
      type: "Hot",
      name: "Spanish latte",
      price: 105,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 200 },
        { ingredientId: "ing-condensed-milk", quantity: 30 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
      ],
    },
    {
      id: "recipe-hot-americano",
      type: "Hot",
      name: "Americano",
      price: 70,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-water", quantity: 200 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
      ],
    },
    {
      id: "recipe-hot-latte",
      type: "Hot",
      name: "Latte",
      price: 90,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 200 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
      ],
    },
    {
      id: "recipe-hot-ube-latte",
      type: "Hot",
      name: "Ube Latte",
      price: 110,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 200 },
        { ingredientId: "ing-condensed-milk", quantity: 30 },
        { ingredientId: "ing-ube-powder", quantity: 8 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
      ],
    },
    {
      id: "recipe-hot-mocha-latte",
      type: "Hot",
      name: "Mocha Latte",
      price: 110,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 200 },
        { ingredientId: "ing-condensed-milk", quantity: 30 },
        { ingredientId: "ing-chocolate-syrup", quantity: 35 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
      ],
    },
    {
      id: "recipe-hot-caramel-macchiato",
      type: "Hot",
      name: "Caramel Macchiato",
      price: 110,
      laborCost: 0,
      overheadCost: 0,
      items: [
        { ingredientId: "ing-coffee", quantity: 18 },
        { ingredientId: "ing-milk", quantity: 200 },
        { ingredientId: "ing-condensed-milk", quantity: 30 },
        { ingredientId: "ing-caramel-syrup", quantity: 35 },
        { ingredientId: "ing-cup", quantity: 1 },
        { ingredientId: "ing-lid", quantity: 1 },
      ],
    },
  ],
  sales: [],
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const calculateUnitCost = (item) => {
  const purchaseQuantity = Number(item.purchaseQuantity);
  const purchaseCost = Number(item.purchaseCost);
  if (Number.isFinite(purchaseQuantity) && purchaseQuantity > 0 && Number.isFinite(purchaseCost)) {
    return purchaseCost / purchaseQuantity;
  }

  const unitCost = Number(item.unitCost);
  return Number.isFinite(unitCost) ? unitCost : 0;
};

const normalizeIngredient = (item) => {
  const unitCost = calculateUnitCost(item);
  const purchaseQuantity =
    Number.isFinite(Number(item.purchaseQuantity)) && Number(item.purchaseQuantity) > 0
      ? Number(item.purchaseQuantity)
      : Number(item.stockQuantity) || 0;
  const purchaseCost =
    Number.isFinite(Number(item.purchaseCost)) && Number(item.purchaseCost) >= 0
      ? Number(item.purchaseCost)
      : purchaseQuantity * unitCost;

  return {
    ...item,
    unit: item.unit || item.measurementUnit || "",
    purchaseQuantity,
    purchaseCost,
    unitCost,
    stockQuantity:
      Number.isFinite(Number(item.stockQuantity)) && Number(item.stockQuantity) >= 0
        ? Number(item.stockQuantity)
        : purchaseQuantity,
    reorderLevel: Number.isFinite(Number(item.reorderLevel))
      ? Number(item.reorderLevel)
      : 0,
    notes: item.notes || item.category || "",
  };
};

const normalizeRecipe = (recipe) => ({
  ...recipe,
  type: recipe.type || "Custom",
  laborCost: Number(recipe.laborCost) || 0,
  overheadCost: Number(recipe.overheadCost) || 0,
  items: Array.isArray(recipe.items) ? recipe.items : [],
});

const mergeWithDefaults = (data) => ({
  capitalEntries: Array.isArray(data?.capitalEntries)
    ? data.capitalEntries
    : clone(defaultData.capitalEntries),
  ingredients: Array.isArray(data?.ingredients)
    ? data.ingredients.map(normalizeIngredient)
    : clone(defaultData.ingredients),
  recipes: Array.isArray(data?.recipes)
    ? data.recipes.map(normalizeRecipe)
    : clone(defaultData.recipes),
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
