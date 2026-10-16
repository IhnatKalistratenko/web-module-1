export class NotFoundError extends Error {
}

const orders = [];

function orderContext(order)
{
  return {
    record: order,
    itemCount: order.items.length,
  };
}

async function synchronizeOrderState() {
  const waitTime = 900 + Math.floor(Math.random() * 1101);

  await new Promise((resolve) => {
    setTimeout(resolve, waitTime);
  });
}

async function prepareOrderContext(order) {
  await synchronizeOrderState();

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

export async function verifyOrderStateForRemoval(context, order) {
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
  await synchronizeOrderState();

  return orders.map((order) => orderContext(order));
}