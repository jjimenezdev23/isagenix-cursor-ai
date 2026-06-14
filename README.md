# Local Cafe Manager

A dependency-light local web app for running the Coffee Capital System from the
provided spreadsheet. It tracks ingredient purchase costs, hot and iced recipe
usage, capital per cup, POS sales, inventory, and sales/profit history from one
browser.

## What it does

- Track capital in, setup costs, and operating expenses.
- Starts with the spreadsheet's Unit Costs ingredients:
  Coffee, Milk, Cup, Lid, Ice, Straw, Water, Condensed milk, Ube powder,
  Caramel Syrup, and Chocolate Syrup.
- Calculate cost per unit from Purchase Qty and Purchase Cost.
- Starts with the spreadsheet's Recipe Usage recipes for iced and hot drinks.
- Calculate Capital Per Cup, Gross Profit Per Cup, Profit Margin, Capital % of
  Price, Missing Cost Inputs, and Status like the Recipe Summary sheet.
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

1. Review the starter capital records. They balance the spreadsheet's total
   ingredient purchase cost of 4,367.
2. Go to Ingredients and update Purchase Qty and Purchase Cost from your latest
   supplier receipts. Cost per unit is calculated automatically.
3. Keep recipe quantities in the same units as the Unit Costs sheet, such as
   grams, milliliters, or pieces (`pc`).
4. Go to Costing to review capital per cup, gross profit, profit margin,
   capital percentage of selling price, missing cost inputs, and status.
5. Use the POS section to add hot or iced menu items to a cart and complete a
   sale. Completing a sale deducts the recipe's ingredient quantities from
   inventory.
6. Check the dashboard for cash estimate, inventory value, sales revenue, gross
   profit, expenses, average sale, and low-stock alerts.
7. Export JSON regularly so your cafe records can be restored or moved to
   another browser.

## Notes

- This is a local-first app. It does not send data to a server.
- Clearing browser data can remove records, so use export/import for backups.
- Currency is displayed as Philippine pesos because the spreadsheet's selling
  prices and purchase costs appear to be peso-denominated.
- Cash on hand is estimated from capital in plus sales revenue minus recorded
  expenses.
- Cost of goods sold uses recipe ingredient capital per cup. Inventory deduction
  only subtracts ingredient quantities.
