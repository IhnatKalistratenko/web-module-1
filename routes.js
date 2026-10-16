import { ValidationError, createOrder, getOrderById, deleteOrderById, getOrders } from "./service.js";
import { NotFoundError } from "./store.js";
import express from "express";

const API_VERSION = "1.0";

const router = express.Router();

function orderResponse(order) {
  return {
    id: order.id,
    customerName: order.customerName,
    items: order.items,
    total: order.total,
    status: order.status,
  };
}

function validationProblem(message, details) {
  return {
    error: {
      code: "VALIDATION_ERROR",
      message,
      details,
    },
  };
}

function notFoundProblem() {
  return {
    error: {
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    },
  };
}

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: API_VERSION,
  });
});

function validateRequestBody(body)
{
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new SyntaxError();
  }
}

router.post("/orders", async (req, res, next) => {
  try {
    validateRequestBody(req.body);
    const orderItem = await createOrder(req.body);
    const responseBody = orderResponse(orderItem);

    return res
      .status(201)
      .location(`/orders/${responseBody.id}`)
      .json(responseBody);
  } 
  catch (error) {
    return next(error);
  }
});

router.get("/orders", async (req, res) => {
  const ordersContext = await getOrders();
  const result = ordersContext.map(context => orderResponse(context.record));

  const responseBody = {
    orders: result,
    count: result.length,
  };

  res.status(200).json(responseBody);
});

router.get("/orders/:id", async (req, res, next) => {
  try {
    const requestedId = req.params.id;
    
    const context = await getOrderById(requestedId); 

    const responseBody = orderResponse(context.record);
    return res.status(200).json(responseBody);
  } catch (error) {
    return next(error);
  }
});

router.delete("/orders/:id", async (req, res, next) => {
  try {
    const orderId = req.params.id;

    await deleteOrderById(orderId);
    
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.use((req, res) => {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Route not found",
    },
  });
});

router.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json(
      validationProblem("Invalid JSON body", [
        "Request body must contain valid JSON",
      ]),
    );
  }

  if (error instanceof ValidationError)
  {
    return res
        .status(400)
        .json(validationProblem(error.message, error.errors));
  }
  if(error instanceof NotFoundError)
  {
    return res.status(404).json(notFoundProblem());
  }

  console.error(error);
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
    },
  });
});

export default router;