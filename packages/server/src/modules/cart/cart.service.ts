import { BadRequestException, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Cart } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CartService {
  /**
   * The time in minutes after which a cart is considered expired.
   * Don't forget to update the `@Cron` decorator when changing this value.
   */
  readonly #cartExpirationTime = 30;

  constructor(private readonly prisma: PrismaService) {}

  isCartExpired(cart: Cart) {
    return cart.createdAt < this.#getExpirationTimeAgo();
  }

  /**
   * The cron job will clean up expired carts every 30 minutes.
   * But, before performing any operation on a cart, call this method to ensure it's not expired.
   * This is to avoid any race conditions with the cron job.
   */
  async ensureCartNotExpired(cartId: string) {
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cartId },
    });
    if (!this.isCartExpired(cart)) {
      return;
    }

    await this.prisma.cart.delete({
      where: { id: cartId },
    });

    throw new BadRequestException("The cart has expired.");
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupExpiredCarts() {
    await this.prisma.cart.deleteMany({
      where: {
        createdAt: {
          lte: this.#getExpirationTimeAgo(),
        },
      },
    });
  }

  #getExpirationTimeAgo() {
    const minute = 60 * 1000;
    return new Date(Date.now() - this.#cartExpirationTime * minute);
  }
}
