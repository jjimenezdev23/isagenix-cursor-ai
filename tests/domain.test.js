import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateRecipeCost,
  completeSale,
  getLowStockIngredients,
  summarizeCapital,
} from "../src/domain.js";

const ingredients = [
  {
    id: "coffee",
    name: "Coffee",
    unit: "g",
    unitCost: 0.02,
    stockQuantity: 1000,
    reorderLevel: 100,
  },
  {
    id: "milk",
    name: "Milk",
    unit: "ml",
    unitCost: 0.003,
    stockQuantity: 5000,
    reorderLevel: 500,
  },
  {
    id: "cup",
    name: "Cup",
    unit: "each",
    unitCost: 0.1,
    stockQuantity: 30,
    reorderLevel: 40,
  },
];

const recipes = [
  {
    id: "latte",
    name: "Latte",
    price: 5,
    laborCost: 0.4,
    overheadCost: 0.25,
    items: [
      { ingredientId: "coffee", quantity: 20 },
      { ingredientId: "milk", quantity: 250 },
      { ingredientId: "cup", quantity: 1 },
    ],
  },
];

describe("recipe costing", () => {
  it("calculates ingredient, labor, overhead, profit, and margin", () => {
    const costing = calculateRecipeCost(recipes[0], ingredients);

    assert.equal(costing.ingredientCost, 1.25);
    assert.equal(costing.totalCost, 1.9);
    assert.equal(costing.profit, 3.1);
    assert.equal(costing.marginPercent, 62);
    assert.equal(costing.foodCostPercent, 25);
  });
});

describe("capital summary", () => {
  it("combines capital, expenses, sales, COGS, and inventory value", () => {
    const summary = summarizeCapital({
      capitalEntries: [
        { type: "capital", amount: 1000 },
        { type: "capital", amount: 250 },
        { type: "expense", amount: 300 },
      ],
      ingredients,
      sales: [
        { total: 100, costOfGoods: 40 },
        { total: 50, costOfGoods: 15 },
      ],
    });

    assert.equal(summary.capitalIn, 1250);
    assert.equal(summary.expenses, 300);
    assert.equal(summary.salesRevenue, 150);
    assert.equal(summary.costOfGoodsSold, 55);
    assert.equal(summary.grossProfit, 95);
    assert.equal(summary.inventoryValue, 38);
    assert.equal(summary.cashOnHand, 1045);
  });
});

describe("low stock", () => {
  it("flags ingredients at or below reorder level", () => {
    const lowStock = getLowStockIngredients(ingredients);

    assert.deepEqual(
      lowStock.map((ingredient) => ingredient.id),
      ["cup"],
    );
  });
});

describe("POS sale completion", () => {
  it("builds a sale and deducts recipe ingredients from inventory", () => {
    const result = completeSale({
      cart: [{ recipeId: "latte", quantity: 2 }],
      recipes,
      ingredients,
      paymentMethod: "Card",
      soldAt: "2026-06-14T06:00:00.000Z",
    });

    assert.equal(result.ok, true);
    assert.equal(result.sale.total, 10);
    assert.equal(result.sale.costOfGoods, 3.8);
    assert.equal(result.sale.profit, 6.2);
    assert.equal(result.sale.paymentMethod, "Card");
    assert.equal(
      result.ingredients.find((ingredient) => ingredient.id === "coffee").stockQuantity,
      960,
    );
    assert.equal(
      result.ingredients.find((ingredient) => ingredient.id === "milk").stockQuantity,
      4500,
    );
    assert.equal(
      result.ingredients.find((ingredient) => ingredient.id === "cup").stockQuantity,
      28,
    );
  });

  it("rejects a sale that would oversell inventory", () => {
    const result = completeSale({
      cart: [{ recipeId: "latte", quantity: 31 }],
      recipes,
      ingredients,
    });

    assert.equal(result.ok, false);
    assert.match(result.errors.join(" "), /only 30 each is in stock/);
  });
});
