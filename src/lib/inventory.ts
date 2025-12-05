import { prisma } from "@/lib/prisma";

/**
 * Deducts stock from products when an order is paid
 * Creates inventory log entries for audit trail
 */
export async function deductStockFromOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // Process each item in the order
  for (const item of order.items) {
    const currentStock = item.product.stock;
    const requestedQuantity = item.quantity;

    // Check if sufficient stock is available
    if (currentStock < requestedQuantity) {
      throw new Error(
        `Insufficient stock for product ${item.product.name}. Available: ${currentStock}, Requested: ${requestedQuantity}`
      );
    }

    // Deduct stock atomically
    const updatedProduct = await prisma.product.update({
      where: { id: item.product.id },
      data: {
        stock: {
          decrement: requestedQuantity,
        },
      },
    });

    // Create inventory log entry
    await prisma.productInventoryEvent.create({
      data: {
        productId: item.product.id,
        delta: -requestedQuantity,
        reason: `Order ${orderId} - Stock deducted on payment`,
        createdBy: order.userId || undefined,
        metadata: {
          orderId: order.id,
          orderItemId: item.id,
          previousStock: currentStock,
          newStock: updatedProduct.stock,
        },
      },
    });
  }
}

/**
 * Restores stock when an order is cancelled
 */
export async function restoreStockFromOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // Restore stock for each item
  for (const item of order.items) {
    const currentStock = item.product.stock;
    const quantityToRestore = item.quantity;

    // Restore stock
    const updatedProduct = await prisma.product.update({
      where: { id: item.product.id },
      data: {
        stock: {
          increment: quantityToRestore,
        },
      },
    });

    // Create inventory log entry
    await prisma.productInventoryEvent.create({
      data: {
        productId: item.product.id,
        delta: quantityToRestore,
        reason: `Order ${orderId} - Stock restored on cancellation`,
        createdBy: order.userId || undefined,
        metadata: {
          orderId: order.id,
          orderItemId: item.id,
          previousStock: currentStock,
          newStock: updatedProduct.stock,
        },
      },
    });
  }
}

/**
 * Validates that all items in an order have sufficient stock
 */
export async function validateOrderStock(
  items: Array<{ productId: string; quantity: number }>
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  const productIds = items.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      errors.push(`Product ${item.productId} not found`);
      continue;
    }

    if (!product.published) {
      errors.push(`${product.name} is no longer available`);
      continue;
    }

    if (product.stock < item.quantity) {
      errors.push(
        `${product.name}: Only ${product.stock} available, but ${item.quantity} requested`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

