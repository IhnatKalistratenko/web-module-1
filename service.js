import { deleteOrderFromStorage, getOrderContextById, getOrdersFromStorage as getOrdersContextFromStorage, persistOrderWithContext } from "./store.js";
import { randomUUID } from "node:crypto";

const DEFAULT_ORDER_STATUS = "created";

export class ValidationError extends Error {
    constructor(message, errors)
    {
        super(message);

        this.name = "ValidationError";
        this.errors = errors;
    }
}

function normalizeItems(items) {
  return items.map((item) => ({
    name: item.name.trim(),
    quantity: item.quantity,
    price: item.price,
  }));
}

function validateCreateOrder(body) {
  const problems = [];
  if (
    typeof body.customerName !== "string" ||
    body.customerName.trim().length === 0
  ) {
    problems.push("customerName is required");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    problems.push("At least one item is required");
    return problems;
  }

  body.items.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      problems.push(`items[${index}] must be an object`);
      return;
    }

    if (typeof item.name !== "string" || item.name.trim().length === 0) {
      problems.push(`items[${index}].name is required`);
    }

    if (
      typeof item.quantity !== "number" ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    ) {
      problems.push(`items[${index}].quantity must be greater than zero`);
    }

    if (
      typeof item.price !== "number" ||
      !Number.isFinite(item.price) ||
      item.price <= 0
    ) {
      problems.push(`items[${index}].price must be greater than zero`);
    }
  });

  return problems;
}

function makeOrderId() {
  return `ord-${randomUUID().slice(0, 8)}`;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateTotal(items) {
  return roundMoney(
    items.reduce((sum, item) => sum + item.quantity * item.price, 0),
  );
}

export async function createOrder(body)
{
    const validationErrors = validateCreateOrder(body);
    if(validationErrors.length > 0)
    {
        throw new ValidationError("Invalid order", validationErrors);
    }

    const normalizedCustomerName = body.customerName.trim();
    const items = normalizeItems(body.items);
    const serverCalculatedTotal = calculateTotal(items);
    const status = DEFAULT_ORDER_STATUS;

    const newOrder = {
      id: makeOrderId(),
      customerName: normalizedCustomerName,
      items,
      total: serverCalculatedTotal,
      status,
      createdAt: new Date().toISOString(),
    };

    return await persistOrderWithContext(newOrder);
}

export async function getOrderById(requestedId)
{
    return await getOrderContextById(requestedId);
}

export async function deleteOrderById(orderId)
{
  return deleteOrderFromStorage(orderId);
}

export async function getOrders()
{
  return getOrdersContextFromStorage();
}
