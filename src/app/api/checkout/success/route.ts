import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request, response: Response) {
  const { sessionId } = await request.json();

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.client_reference_id) {
      return NextResponse.json(
        {
          error: "client_reference_id가 없습니다",
        },
        { status: 400 }
      );
    }

    if (!session.metadata?.bookId) {
      return NextResponse.json(
        {
          error: "bookId가 metadata에 없습니다",
        },
        { status: 400 }
      );
    }

    // User가 데이터베이스에 존재하는지 확인, 없으면 생성
    let user = await prisma.user.findUnique({
      where: { id: session.client_reference_id },
    });

    if (!user) {
      // User 생성 (email이 있으면 사용, 없으면 임시 email)
      user = await prisma.user.create({
        data: {
          id: session.client_reference_id,
          email:
            session.customer_details?.email ||
            `user_${session.client_reference_id}@temp.com`,
        },
      });
    }

    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.client_reference_id,
        bookId: session.metadata.bookId,
      },
    });

    if (!existingPurchase) {
      const purchase = await prisma.purchase.create({
        data: {
          userId: session.client_reference_id,
          bookId: session.metadata.bookId,
        },
      });

      return NextResponse.json({ success: true, purchase });
    } else {
      return NextResponse.json({
        success: true,
        message: "すでに購入済みです",
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
        details: err,
      },
      { status: 500 }
    );
  }
}
