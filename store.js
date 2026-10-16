import { NotFoundError } from "./errorTypes.js";

const orders = [];

function orderContext(order)
{
  return {
    record: order,
    itemCount: order.items.length,
  };
}

async function prepareOrderContext(order) {

  return orderContext(order);
}

export async function getOrderContextById(orderId) {
  const matchingOrder = orders.find((order) => order.id === orderId);
    
  if (!matchingOrder) {
    throw new NotFoundError;
  }

  return await prepareOrderContext(matchingOrder);
}

export async function persistOrderWithContext(order) {
  orders.push(order);
  const context = await prepareOrderContext(order);
  return context.record;
}

export function verifyOrderStateForRemoval(context, order) {
  return context.itemCount === order.items.length;
}

export async function deleteOrderFromStorage(orderId)
{
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  const existingOrder = orders[orderIndex];
  if(!existingOrder)
  {
    throw new NotFoundError();
  }
  
  const context = await prepareOrderContext(existingOrder);

  if(!verifyOrderStateForRemoval(context, existingOrder))
  {
    throw new Error("Order can not be removed");
  }

  orders.splice(orderIndex, 1);
}

export async function getOrdersFromStorage()
{
  return orders.map((order) => orderContext(order));
}