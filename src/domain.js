export const roundMoney = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return Math.round((number + Number.EPSILON) * 100) / 100;
};

export const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const formatMoney = (value, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(roundMoney(value));

export const indexById = (items = []) =>
  items.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});

export const calculateRecipeCost = (recipe, ingredients = []) => {
  const ingredientMap = indexById(ingredients);
  const ingredientLines = (recipe.items || []).map((item) => {
    const ingredient = ingredientMap[item.ingredientId];
    const quantity = toNumber(item.quantity);
    const unitCost = ingredient ? toNumber(ingredient.unitCost) : 0;
    const cost = roundMoney(quantity * unitCost);

    return {
      ingredientId: item.ingredientId,
      ingredientName: ingredient?.name || "Unknown ingredient",
      unit: ingredient?.unit || "",
      quantity,
      unitCost,
      cost,
      missing: !ingredient,
    };
  });

  const ingredientCost = roundMoney(
    ingredientLines.reduce((sum, line) => sum + line.cost, 0),
  );
  const overheadCost = roundMoney(recipe.overheadCost);
  const laborCost = roundMoney(recipe.laborCost);
  const totalCost = roundMoney(ingredientCost + overheadCost + laborCost);
  const price = roundMoney(recipe.price);
  const profit = roundMoney(price - totalCost);
  const marginPercent = price > 0 ? roundMoney((profit / price) * 100) : 0;
  const foodCostPercent = price > 0 ? roundMoney((ingredientCost / price) * 100) : 0;

  return {
    ingredientLines,
    ingredientCost,
    overheadCost,
    laborCost,
    totalCost,
    price,
    profit,
    marginPercent,
    foodCostPercent,
  };
};

export const calculateInventoryValue = (ingredients = []) =>
  roundMoney(
    ingredients.reduce(
      (sum, ingredient) =>
        sum + toNumber(ingredient.stockQuantity) * toNumber(ingredient.unitCost),
      0,
    ),
  );

export const getLowStockIngredients = (ingredients = []) =>
  ingredients.filter(
    (ingredient) =>
      toNumber(ingredient.reorderLevel) > 0 &&
      toNumber(ingredient.stockQuantity) <= toNumber(ingredient.reorderLevel),
  );

export const summarizeCapital = ({
  capitalEntries = [],
  ingredients = [],
  sales = [],
} = {}) => {
  const capitalIn = roundMoney(
    capitalEntries
      .filter((entry) => entry.type === "capital")
      .reduce((sum, entry) => sum + toNumber(entry.amount), 0),
  );
  const expenses = roundMoney(
    capitalEntries
      .filter((entry) => entry.type === "expense")
      .reduce((sum, entry) => sum + toNumber(entry.amount), 0),
  );
  const salesRevenue = roundMoney(
    sales.reduce((sum, sale) => sum + toNumber(sale.total), 0),
  );
  const costOfGoodsSold = roundMoney(
    sales.reduce((sum, sale) => sum + toNumber(sale.costOfGoods), 0),
  );
  const grossProfit = roundMoney(salesRevenue - costOfGoodsSold);
  const inventoryValue = calculateInventoryValue(ingredients);
  const cashOnHand = roundMoney(
    capitalIn + salesRevenue - expenses - costOfGoodsSold,
  );

  return {
    capitalIn,
    expenses,
    salesRevenue,
    costOfGoodsSold,
    grossProfit,
    inventoryValue,
    cashOnHand,
  };
};

export const checkRecipeAvailability = (
  recipe,
  ingredients = [],
  quantity = 1,
) => {
  const ingredientMap = indexById(ingredients);
  const missing = [];
  const shortages = [];

  for (const item of recipe.items || []) {
    const ingredient = ingredientMap[item.ingredientId];
    const required = toNumber(item.quantity) * toNumber(quantity);

    if (!ingredient) {
      missing.push({
        ingredientId: item.ingredientId,
        required,
      });
      continue;
    }

    const available = toNumber(ingredient.stockQuantity);
    if (available < required) {
      shortages.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        unit: ingredient.unit,
        required,
        available,
        shortage: roundMoney(required - available),
      });
    }
  }

  return {
    available: missing.length === 0 && shortages.length === 0,
    missing,
    shortages,
  };
};

export const validateCart = (cart = [], recipes = [], ingredients = []) => {
  const recipeMap = indexById(recipes);
  const messages = [];

  for (const cartItem of cart) {
    const recipe = recipeMap[cartItem.recipeId];
    const quantity = toNumber(cartItem.quantity);

    if (!recipe) {
      messages.push(`Menu item ${cartItem.recipeId} no longer exists.`);
      continue;
    }

    if (quantity <= 0) {
      messages.push(`${recipe.name} must have a quantity greater than zero.`);
      continue;
    }

    const availability = checkRecipeAvailability(recipe, ingredients, quantity);
    for (const missing of availability.missing) {
      messages.push(`${recipe.name} uses a deleted ingredient (${missing.ingredientId}).`);
    }
    for (const shortage of availability.shortages) {
      messages.push(
        `${recipe.name} needs ${shortage.required} ${shortage.unit} of ${shortage.ingredientName}, but only ${shortage.available} ${shortage.unit} is in stock.`,
      );
    }
  }

  return messages;
};

export const buildSale = ({
  cart = [],
  recipes = [],
  ingredients = [],
  paymentMethod = "Cash",
  soldAt = new Date().toISOString(),
} = {}) => {
  const recipeMap = indexById(recipes);
  const validationMessages = validateCart(cart, recipes, ingredients);

  if (validationMessages.length > 0) {
    return {
      ok: false,
      errors: validationMessages,
    };
  }

  const lines = cart.map((cartItem) => {
    const recipe = recipeMap[cartItem.recipeId];
    const quantity = toNumber(cartItem.quantity);
    const costing = calculateRecipeCost(recipe, ingredients);
    const lineTotal = roundMoney(toNumber(recipe.price) * quantity);
    const lineCost = roundMoney(costing.totalCost * quantity);

    return {
      recipeId: recipe.id,
      name: recipe.name,
      quantity,
      unitPrice: roundMoney(recipe.price),
      unitCost: costing.totalCost,
      total: lineTotal,
      costOfGoods: lineCost,
      profit: roundMoney(lineTotal - lineCost),
    };
  });

  const total = roundMoney(lines.reduce((sum, line) => sum + line.total, 0));
  const costOfGoods = roundMoney(
    lines.reduce((sum, line) => sum + line.costOfGoods, 0),
  );

  return {
    ok: true,
    sale: {
      id: `sale-${Date.now()}`,
      soldAt,
      paymentMethod,
      lines,
      total,
      costOfGoods,
      profit: roundMoney(total - costOfGoods),
    },
  };
};

export const deductInventoryForSale = (ingredients = [], cart = [], recipes = []) => {
  const recipeMap = indexById(recipes);
  const usageByIngredient = {};

  for (const cartItem of cart) {
    const recipe = recipeMap[cartItem.recipeId];
    if (!recipe) {
      continue;
    }

    for (const recipeItem of recipe.items || []) {
      usageByIngredient[recipeItem.ingredientId] =
        toNumber(usageByIngredient[recipeItem.ingredientId]) +
        toNumber(recipeItem.quantity) * toNumber(cartItem.quantity);
    }
  }

  return ingredients.map((ingredient) => {
    const used = toNumber(usageByIngredient[ingredient.id]);
    if (used <= 0) {
      return ingredient;
    }

    return {
      ...ingredient,
      stockQuantity: roundMoney(toNumber(ingredient.stockQuantity) - used),
    };
  });
};

export const completeSale = ({
  cart = [],
  recipes = [],
  ingredients = [],
  paymentMethod = "Cash",
  soldAt,
} = {}) => {
  const saleResult = buildSale({
    cart,
    recipes,
    ingredients,
    paymentMethod,
    soldAt,
  });

  if (!saleResult.ok) {
    return saleResult;
  }

  return {
    ok: true,
    sale: saleResult.sale,
    ingredients: deductInventoryForSale(ingredients, cart, recipes),
  };
};
