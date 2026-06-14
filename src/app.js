import {
  calculateInventoryValue,
  calculateRecipeCost,
  completeSale,
  formatMoney,
  getLowStockIngredients,
  indexById,
  roundMoney,
  summarizeCapital,
  toNumber,
  validateCart,
} from "./domain.js";
import {
  exportData,
  importData,
  loadData,
  resetData,
  saveData,
} from "./storage.js";

const state = {
  data: loadData(),
  cart: [],
  editingIngredientId: null,
  editingRecipeId: null,
  recipeItems: [],
  message: "",
};

const $ = (selector) => document.querySelector(selector);

const createId = (prefix) => {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getIngredient = (id) => state.data.ingredients.find((item) => item.id === id);

const setMessage = (message) => {
  state.message = message;
  renderMessage();
};

const persist = () => {
  saveData(state.data);
};

const renderMessage = () => {
  const message = $("#app-message");
  if (!state.message) {
    message.innerHTML = "";
    message.hidden = true;
    return;
  }

  message.hidden = false;
  message.innerHTML = escapeHtml(state.message);
};

const renderDashboard = () => {
  const summary = summarizeCapital(state.data);
  const lowStock = getLowStockIngredients(state.data.ingredients);
  const salesCount = state.data.sales.length;
  const averageSale =
    salesCount > 0
      ? roundMoney(summary.salesRevenue / salesCount)
      : 0;

  $("#dashboard-cards").innerHTML = [
    ["Cash on hand", summary.cashOnHand, "Estimated cash after capital, sales, and recorded expenses."],
    ["Inventory value", summary.inventoryValue, "Current stock quantity multiplied by unit cost."],
    ["Sales revenue", summary.salesRevenue, `${salesCount} recorded sale${salesCount === 1 ? "" : "s"}.`],
    ["Gross profit", summary.grossProfit, "Sales revenue minus cost of goods sold."],
    ["Expenses", summary.expenses, "Capital expenses entered below."],
    ["Average sale", averageSale, "Average customer ticket."],
  ]
    .map(
      ([label, value, hint]) => `
        <article class="metric-card">
          <span>${escapeHtml(label)}</span>
          <strong>${formatMoney(value)}</strong>
          <small>${escapeHtml(hint)}</small>
        </article>
      `,
    )
    .join("");

  $("#low-stock-list").innerHTML =
    lowStock.length === 0
      ? '<li class="empty">No ingredients are at or below reorder level.</li>'
      : lowStock
          .map(
            (ingredient) => `
              <li>
                <strong>${escapeHtml(ingredient.name)}</strong>
                <span>${toNumber(ingredient.stockQuantity)} ${escapeHtml(ingredient.unit)} left; reorder at ${toNumber(ingredient.reorderLevel)}.</span>
              </li>
            `,
          )
          .join("");
};

const renderCapital = () => {
  const entries = [...state.data.capitalEntries].sort((a, b) =>
    String(b.date).localeCompare(String(a.date)),
  );

  $("#capital-list").innerHTML =
    entries.length === 0
      ? '<tr><td colspan="5" class="empty">No capital or expense records yet.</td></tr>'
      : entries
          .map(
            (entry) => `
              <tr>
                <td>${escapeHtml(entry.date)}</td>
                <td><span class="tag ${entry.type === "capital" ? "positive" : "negative"}">${entry.type === "capital" ? "Capital" : "Expense"}</span></td>
                <td>
                  <strong>${escapeHtml(entry.label)}</strong>
                  ${entry.notes ? `<small>${escapeHtml(entry.notes)}</small>` : ""}
                </td>
                <td class="number">${formatMoney(entry.amount)}</td>
                <td><button class="ghost danger" data-action="delete-capital" data-id="${entry.id}">Delete</button></td>
              </tr>
            `,
          )
          .join("");
};

const renderIngredients = () => {
  $("#ingredient-list").innerHTML =
    state.data.ingredients.length === 0
      ? '<tr><td colspan="8" class="empty">Add your first ingredient or supply item.</td></tr>'
      : state.data.ingredients
          .map((ingredient) => {
            const isLow =
              toNumber(ingredient.reorderLevel) > 0 &&
              toNumber(ingredient.stockQuantity) <= toNumber(ingredient.reorderLevel);
            return `
              <tr class="${isLow ? "low-stock" : ""}">
                <td>
                  <strong>${escapeHtml(ingredient.name)}</strong>
                  <small>${escapeHtml(ingredient.category || "Uncategorized")}</small>
                </td>
                <td>${escapeHtml(ingredient.unit)}</td>
                <td class="number">${formatMoney(ingredient.unitCost)}</td>
                <td class="number">${toNumber(ingredient.stockQuantity)}</td>
                <td class="number">${toNumber(ingredient.reorderLevel)}</td>
                <td class="number">${formatMoney(toNumber(ingredient.stockQuantity) * toNumber(ingredient.unitCost))}</td>
                <td>${isLow ? '<span class="tag warning">Low stock</span>' : '<span class="tag positive">OK</span>'}</td>
                <td class="actions">
                  <button class="ghost" data-action="edit-ingredient" data-id="${ingredient.id}">Edit</button>
                  <button class="ghost danger" data-action="delete-ingredient" data-id="${ingredient.id}">Delete</button>
                </td>
              </tr>
            `;
          })
          .join("");
};

const renderIngredientOptions = () => {
  const options = state.data.ingredients
    .map(
      (ingredient) =>
        `<option value="${ingredient.id}">${escapeHtml(ingredient.name)} (${escapeHtml(ingredient.unit)})</option>`,
    )
    .join("");

  $("#recipe-ingredient").innerHTML = options;
};

const renderRecipeItems = () => {
  $("#recipe-items").innerHTML =
    state.recipeItems.length === 0
      ? '<li class="empty">No ingredients added to this recipe yet.</li>'
      : state.recipeItems
          .map((item, index) => {
            const ingredient = getIngredient(item.ingredientId);
            return `
              <li>
                <span>${toNumber(item.quantity)} ${escapeHtml(ingredient?.unit || "")} ${escapeHtml(ingredient?.name || "Deleted ingredient")}</span>
                <button class="ghost danger" data-action="remove-recipe-item" data-index="${index}">Remove</button>
              </li>
            `;
          })
          .join("");
};

const renderRecipes = () => {
  const recipeCards = state.data.recipes.map((recipe) => {
    const costing = calculateRecipeCost(recipe, state.data.ingredients);
    return `
      <article class="recipe-card">
        <div class="recipe-card__header">
          <div>
            <h3>${escapeHtml(recipe.name)}</h3>
            <span class="muted">${costing.foodCostPercent}% ingredient cost</span>
          </div>
          <strong>${formatMoney(recipe.price)}</strong>
        </div>
        <dl class="mini-grid">
          <div><dt>Total cost</dt><dd>${formatMoney(costing.totalCost)}</dd></div>
          <div><dt>Profit</dt><dd>${formatMoney(costing.profit)}</dd></div>
          <div><dt>Margin</dt><dd>${costing.marginPercent}%</dd></div>
        </dl>
        <ul class="line-list">
          ${costing.ingredientLines
            .map(
              (line) => `
                <li>
                  <span>${line.quantity} ${escapeHtml(line.unit)} ${escapeHtml(line.ingredientName)}</span>
                  <span>${formatMoney(line.cost)}</span>
                </li>
              `,
            )
            .join("")}
          <li><span>Labor</span><span>${formatMoney(costing.laborCost)}</span></li>
          <li><span>Overhead</span><span>${formatMoney(costing.overheadCost)}</span></li>
        </ul>
        <div class="actions">
          <button class="ghost" data-action="edit-recipe" data-id="${recipe.id}">Edit</button>
          <button class="ghost danger" data-action="delete-recipe" data-id="${recipe.id}">Delete</button>
        </div>
      </article>
    `;
  });

  $("#recipe-list").innerHTML =
    recipeCards.length === 0
      ? '<p class="empty">Create menu items to start calculating food cost and profit.</p>'
      : recipeCards.join("");
};

const renderPos = () => {
  $("#pos-menu").innerHTML =
    state.data.recipes.length === 0
      ? '<p class="empty">Add recipes before recording sales.</p>'
      : state.data.recipes
          .map((recipe) => {
            const costing = calculateRecipeCost(recipe, state.data.ingredients);
            const validation = validateCart(
              [{ recipeId: recipe.id, quantity: 1 }],
              state.data.recipes,
              state.data.ingredients,
            );
            return `
              <article class="pos-item ${validation.length ? "disabled" : ""}">
                <div>
                  <strong>${escapeHtml(recipe.name)}</strong>
                  <small>${formatMoney(recipe.price)} | cost ${formatMoney(costing.totalCost)}</small>
                </div>
                <label>
                  Qty
                  <input type="number" min="1" step="1" value="1" id="pos-qty-${recipe.id}" ${validation.length ? "disabled" : ""}>
                </label>
                <button data-action="add-to-cart" data-id="${recipe.id}" ${validation.length ? "disabled" : ""}>Add</button>
              </article>
            `;
          })
          .join("");

  const recipeMap = indexById(state.data.recipes);
  $("#cart-lines").innerHTML =
    state.cart.length === 0
      ? '<tr><td colspan="5" class="empty">Cart is empty.</td></tr>'
      : state.cart
          .map((item) => {
            const recipe = recipeMap[item.recipeId];
            const lineTotal = roundMoney(toNumber(recipe?.price) * toNumber(item.quantity));
            return `
              <tr>
                <td>${escapeHtml(recipe?.name || "Deleted item")}</td>
                <td class="number">${toNumber(item.quantity)}</td>
                <td class="number">${formatMoney(recipe?.price || 0)}</td>
                <td class="number">${formatMoney(lineTotal)}</td>
                <td><button class="ghost danger" data-action="remove-cart-line" data-id="${item.recipeId}">Remove</button></td>
              </tr>
            `;
          })
          .join("");

  const cartTotal = state.cart.reduce((sum, item) => {
    const recipe = recipeMap[item.recipeId];
    return sum + toNumber(recipe?.price) * toNumber(item.quantity);
  }, 0);

  $("#cart-total").textContent = formatMoney(cartTotal);
};

const renderSales = () => {
  $("#sales-list").innerHTML =
    state.data.sales.length === 0
      ? '<tr><td colspan="6" class="empty">No sales recorded yet.</td></tr>'
      : state.data.sales
          .map(
            (sale) => `
              <tr>
                <td>${new Date(sale.soldAt).toLocaleString()}</td>
                <td>${escapeHtml(sale.paymentMethod)}</td>
                <td>${sale.lines.map((line) => `${line.quantity}x ${escapeHtml(line.name)}`).join("<br>")}</td>
                <td class="number">${formatMoney(sale.total)}</td>
                <td class="number">${formatMoney(sale.costOfGoods)}</td>
                <td class="number">${formatMoney(sale.profit)}</td>
              </tr>
            `,
          )
          .join("");
};

const renderForms = () => {
  $("#ingredient-submit").textContent = state.editingIngredientId
    ? "Update ingredient"
    : "Add ingredient";
  $("#recipe-submit").textContent = state.editingRecipeId
    ? "Update menu item"
    : "Save menu item";
};

const render = () => {
  renderMessage();
  renderDashboard();
  renderCapital();
  renderIngredients();
  renderIngredientOptions();
  renderRecipeItems();
  renderRecipes();
  renderPos();
  renderSales();
  renderForms();
};

const clearIngredientForm = () => {
  $("#ingredient-form").reset();
  state.editingIngredientId = null;
  renderForms();
};

const clearRecipeForm = () => {
  $("#recipe-form").reset();
  state.editingRecipeId = null;
  state.recipeItems = [];
  renderRecipeItems();
  renderForms();
};

const handleCapitalSubmit = (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.data.capitalEntries.push({
    id: createId("capital"),
    type: form.get("type"),
    label: form.get("label").trim(),
    amount: roundMoney(form.get("amount")),
    date: form.get("date") || new Date().toISOString().slice(0, 10),
    notes: form.get("notes").trim(),
  });
  event.currentTarget.reset();
  persist();
  setMessage("Capital record saved.");
  render();
};

const handleIngredientSubmit = (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const ingredient = {
    id: state.editingIngredientId || createId("ingredient"),
    name: form.get("name").trim(),
    category: form.get("category").trim(),
    unit: form.get("unit").trim(),
    unitCost: toNumber(form.get("unitCost")),
    stockQuantity: toNumber(form.get("stockQuantity")),
    reorderLevel: toNumber(form.get("reorderLevel")),
  };

  if (state.editingIngredientId) {
    state.data.ingredients = state.data.ingredients.map((item) =>
      item.id === state.editingIngredientId ? ingredient : item,
    );
  } else {
    state.data.ingredients.push(ingredient);
  }

  clearIngredientForm();
  persist();
  setMessage("Ingredient saved.");
  render();
};

const handleRecipeIngredientSubmit = (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const ingredientId = form.get("ingredientId");
  const quantity = toNumber(form.get("quantity"));

  if (!ingredientId || quantity <= 0) {
    setMessage("Choose an ingredient and enter a quantity greater than zero.");
    return;
  }

  const existing = state.recipeItems.find((item) => item.ingredientId === ingredientId);
  if (existing) {
    existing.quantity = roundMoney(toNumber(existing.quantity) + quantity);
  } else {
    state.recipeItems.push({ ingredientId, quantity });
  }

  event.currentTarget.reset();
  renderRecipeItems();
  setMessage("Ingredient added to recipe.");
};

const handleRecipeSubmit = (event) => {
  event.preventDefault();

  if (state.recipeItems.length === 0) {
    setMessage("Add at least one ingredient to the menu item before saving.");
    return;
  }

  const form = new FormData(event.currentTarget);
  const recipe = {
    id: state.editingRecipeId || createId("recipe"),
    name: form.get("name").trim(),
    price: toNumber(form.get("price")),
    laborCost: toNumber(form.get("laborCost")),
    overheadCost: toNumber(form.get("overheadCost")),
    items: state.recipeItems.map((item) => ({ ...item })),
  };

  if (state.editingRecipeId) {
    state.data.recipes = state.data.recipes.map((item) =>
      item.id === state.editingRecipeId ? recipe : item,
    );
  } else {
    state.data.recipes.push(recipe);
  }

  clearRecipeForm();
  persist();
  setMessage("Menu item saved.");
  render();
};

const addToCart = (recipeId) => {
  const quantity = Math.max(1, Math.floor(toNumber($(`#pos-qty-${CSS.escape(recipeId)}`)?.value, 1)));
  const existing = state.cart.find((item) => item.recipeId === recipeId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({ recipeId, quantity });
  }
  setMessage("Item added to cart.");
  renderPos();
};

const completeCurrentSale = () => {
  if (state.cart.length === 0) {
    setMessage("Add at least one item before completing a sale.");
    return;
  }

  const paymentMethod = $("#payment-method").value;
  const result = completeSale({
    cart: state.cart,
    recipes: state.data.recipes,
    ingredients: state.data.ingredients,
    paymentMethod,
  });

  if (!result.ok) {
    setMessage(result.errors.join(" "));
    return;
  }

  state.data.ingredients = result.ingredients;
  state.data.sales.unshift(result.sale);
  state.cart = [];
  persist();
  setMessage(`Sale completed for ${formatMoney(result.sale.total)}.`);
  render();
};

const downloadExport = () => {
  const blob = new Blob([exportData(state.data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cafe-data-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const handleImport = () => {
  const payload = $("#import-payload").value.trim();
  if (!payload) {
    setMessage("Paste exported JSON before importing.");
    return;
  }

  try {
    state.data = importData(payload);
    state.cart = [];
    state.recipeItems = [];
    state.editingIngredientId = null;
    state.editingRecipeId = null;
    persist();
    $("#import-payload").value = "";
    setMessage("Cafe data imported.");
    render();
  } catch (error) {
    setMessage(`Import failed: ${error.message}`);
  }
};

const populateIngredientForm = (ingredient) => {
  state.editingIngredientId = ingredient.id;
  $("#ingredient-name").value = ingredient.name;
  $("#ingredient-category").value = ingredient.category || "";
  $("#ingredient-unit").value = ingredient.unit;
  $("#ingredient-unit-cost").value = ingredient.unitCost;
  $("#ingredient-stock").value = ingredient.stockQuantity;
  $("#ingredient-reorder").value = ingredient.reorderLevel;
  $("#ingredient-name").focus();
  renderForms();
};

const populateRecipeForm = (recipe) => {
  state.editingRecipeId = recipe.id;
  state.recipeItems = recipe.items.map((item) => ({ ...item }));
  $("#recipe-name").value = recipe.name;
  $("#recipe-price").value = recipe.price;
  $("#recipe-labor").value = recipe.laborCost;
  $("#recipe-overhead").value = recipe.overheadCost;
  $("#recipe-name").focus();
  renderRecipeItems();
  renderForms();
};

const handleClick = (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const { action, id, index } = button.dataset;

  if (action === "delete-capital") {
    state.data.capitalEntries = state.data.capitalEntries.filter((entry) => entry.id !== id);
    persist();
    setMessage("Capital record deleted.");
    render();
  }

  if (action === "edit-ingredient") {
    const ingredient = state.data.ingredients.find((item) => item.id === id);
    if (ingredient) {
      populateIngredientForm(ingredient);
    }
  }

  if (action === "delete-ingredient") {
    const used = state.data.recipes.some((recipe) =>
      recipe.items.some((item) => item.ingredientId === id),
    );
    if (used) {
      setMessage("This ingredient is used in a menu item. Edit or delete that menu item first.");
      return;
    }
    state.data.ingredients = state.data.ingredients.filter((item) => item.id !== id);
    persist();
    setMessage("Ingredient deleted.");
    render();
  }

  if (action === "remove-recipe-item") {
    state.recipeItems.splice(Number(index), 1);
    renderRecipeItems();
  }

  if (action === "edit-recipe") {
    const recipe = state.data.recipes.find((item) => item.id === id);
    if (recipe) {
      populateRecipeForm(recipe);
    }
  }

  if (action === "delete-recipe") {
    state.data.recipes = state.data.recipes.filter((item) => item.id !== id);
    state.cart = state.cart.filter((item) => item.recipeId !== id);
    persist();
    setMessage("Menu item deleted.");
    render();
  }

  if (action === "add-to-cart") {
    addToCart(id);
  }

  if (action === "remove-cart-line") {
    state.cart = state.cart.filter((item) => item.recipeId !== id);
    setMessage("Item removed from cart.");
    renderPos();
  }

  if (action === "complete-sale") {
    completeCurrentSale();
  }

  if (action === "clear-cart") {
    state.cart = [];
    setMessage("Cart cleared.");
    renderPos();
  }

  if (action === "export-data") {
    downloadExport();
  }

  if (action === "import-data") {
    handleImport();
  }

  if (action === "reset-data") {
    if (window.confirm("Reset all local cafe data to sample data? This cannot be undone.")) {
      state.data = resetData();
      state.cart = [];
      state.recipeItems = [];
      setMessage("Data reset to sample cafe data.");
      render();
    }
  }

  if (action === "clear-sales") {
    if (window.confirm("Clear sales history? Inventory will not be restored.")) {
      state.data.sales = [];
      persist();
      setMessage("Sales history cleared.");
      render();
    }
  }
};

document.addEventListener("click", handleClick);
$("#capital-form").addEventListener("submit", handleCapitalSubmit);
$("#ingredient-form").addEventListener("submit", handleIngredientSubmit);
$("#recipe-ingredient-form").addEventListener("submit", handleRecipeIngredientSubmit);
$("#recipe-form").addEventListener("submit", handleRecipeSubmit);
$("#cancel-ingredient-edit").addEventListener("click", clearIngredientForm);
$("#cancel-recipe-edit").addEventListener("click", clearRecipeForm);

$("#capital-date").value = new Date().toISOString().slice(0, 10);
$("#inventory-value-note").textContent = `Starting sample inventory is worth ${formatMoney(
  calculateInventoryValue(state.data.ingredients),
)}.`;

render();
