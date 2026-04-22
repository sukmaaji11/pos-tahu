import { prisma } from '@/lib/prisma';

// POST: simpan transaksi + item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payment, items } = body as {
      payment: 'CASH' | 'QRIS';
      items: { name: string; price: number; qty: number }[];
    };

    if (!payment || !items || !Array.isArray(items) || items.length === 0) {
      return Response.json(
        { success: false, message: 'Payload tidak valid' },
        { status: 400 },
      );
    }

    const cleanItems = items.filter((i) => i.qty > 0);
    if (cleanItems.length === 0) {
      return Response.json(
        { success: false, message: 'Item kosong' },
        { status: 400 },
      );
    }

    const total = cleanItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    const trx = await prisma.transaction.create({
      data: {
        total,
        payment,
        items: {
          create: cleanItems.map((i) => ({
            name: i.name,
            price: i.price,
            qty: i.qty,
            subtotal: i.price * i.qty,
          })),
        },
      },
      include: { items: true },
    });

    return Response.json({ success: true, data: trx });
  } catch (error) {
    console.error('POST /api/transactions ERROR:', error);
    return Response.json(
      { success: false, message: 'Gagal simpan transaksi' },
      { status: 500 },
    );
  }
}

// GET: ambil transaksi (bisa filter tanggal ?date=YYYY-MM-DD)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date'); // YYYY-MM-DD

    let where: any = {};
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      where = { createdAt: { gte: start, lte: end } };
    }

    const list = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const itemsSummary = await prisma.transactionItem.groupBy({
      by: ['name'],
      where: {
        transaction: where, // pakai filter tanggal yang sama
      },
      _sum: {
        qty: true,
        subtotal: true,
      },
    });

    return Response.json({
      success: true,
      data: list,
      itemsSummary,
    });
  } catch (error) {
    console.error('GET /api/transactions ERROR:', error);
    return Response.json(
      { success: false, message: 'Gagal ambil data' },
      { status: 500 },
    );
  }
}
