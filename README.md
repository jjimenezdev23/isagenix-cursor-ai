# Local Cafe Manager

A dependency-light local web app for running cafe capital tracking, ingredient
inventory, recipe costing, POS sales, and sales/profit history from one browser.

## What it does

- Track capital in, setup costs, and operating expenses.
- Maintain ingredients and supplies with unit costs, stock levels, reorder
  thresholds, and inventory value.
- Build menu items from recipes, labor, overhead, and selling price.
- Calculate ingredient cost, total cost, profit, margin, and food cost percent.
- Use a simple POS cart to record sales and automatically deduct inventory.
- View sales history with revenue, cost of goods sold, and profit.
- Export and import JSON backups. Data is stored in browser `localStorage`.

## Run locally

This app has no npm dependencies. It uses native browser JavaScript modules and
Node's built-in test runner.

```bash
npm start
```

Then open:

```text
http://localhost:4173
```

You can also open `index.html` through any static file server.

## Run tests

```bash
npm test
```

## How to use it

1. Update or delete the sample capital records.
2. Enter your real ingredients and supplies. Use the same unit in recipes that
   you use for unit cost, such as grams, milliliters, ounces, or each.
3. Create menu items from those ingredients and set selling price, labor cost,
   and overhead cost.
4. Use the POS section to add menu items to a cart and complete a sale.
5. Check the dashboard for cash estimate, inventory value, sales revenue, gross
   profit, expenses, average sale, and low-stock alerts.
6. Export JSON regularly so your cafe records can be restored or moved to
   another browser.

## Notes

- This is a local-first app. It does not send data to a server.
- Clearing browser data can remove records, so use export/import for backups.
- Cost of goods sold includes ingredient, labor, and overhead cost from each
  recipe. Inventory deduction only subtracts ingredient quantities.
