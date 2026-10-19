import { NotFoundError } from "./errorTypes.js";

const orders = [];

export function getOrderContextById(orderId) {
  const matchingOrder = orders.find((order) => order.id === orderId);
    
  if (!matchingOrder) {
    throw new NotFoundError;
  }

  return structuredClone(matchingOrder);
}

export async function persistOrderWithContext(order) {
  const orderCopy = structuredClone(order);
  orders.push(orderCopy);
  return structuredClone(orderCopy);
}

export async function deleteOrderFromStorage(orderId)
{
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  if(orderIndex === -1)
  {
    throw new NotFoundError;
  }

  orders.splice(orderIndex, 1);
}

export async function getOrdersFromStorage()
{
  return structuredClone(orders);
}