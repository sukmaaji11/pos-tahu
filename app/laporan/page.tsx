'use client';

import { useEffect, useState } from 'react';

type Trx = {
  id: number;
  total: number;
  payment: 'CASH' | 'QRIS';
  createdAt: string;
  items: any[];
};

type ItemSummary = {
  name: string;
  _sum: {
    qty: number;
    subtotal: number;
  };
};

export default function LaporanPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<Trx[]>([]);
  const [itemsSummary, setItemsSummary] = useState<ItemSummary[]>([]);

  const totalTransaksi = data.length;
  const totalOmzet = data.reduce((sum, x) => sum + x.total, 0);
  const totalCash = data
    .filter((x) => x.payment === 'CASH')
    .reduce((s, x) => s + x.total, 0);
  const totalQris = data
    .filter((x) => x.payment === 'QRIS')
    .reduce((s, x) => s + x.total, 0);

  async function fetchData() {
    const res = await fetch(`/api/transactions?date=${date}`);
    const json = await res.json();

    if (json.success) {
      setData(json.data || []);
      setItemsSummary(json.itemsSummary || []);
    }
  }

  useEffect(() => {
    fetchData();
  }, [date]);

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-6">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold">
            TA
          </div>
          <h1 className="text-lg md:text-2xl font-bold">
            Laporan Tahu Andalan
          </h1>
        </div>
        <span className="text-xs text-gray-500">Owner</span>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl shadow p-3 mb-4 flex items-center gap-3">
        <span className="text-sm font-semibold">Tanggal</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card title="Transaksi" value={totalTransaksi} />
        <Card
          title="Omzet"
          value={`Rp ${totalOmzet.toLocaleString('id-ID')}`}
        />
        <Card title="CASH" value={`Rp ${totalCash.toLocaleString('id-ID')}`} />
        <Card title="QRIS" value={`Rp ${totalQris.toLocaleString('id-ID')}`} />
      </div>

      {/* 🆕 PENJUALAN PER PRODUK */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="font-bold mb-3">🔥 Penjualan Produk</h2>

        {itemsSummary.length === 0 && (
          <p className="text-sm text-gray-500">Belum ada data</p>
        )}

        <div className="space-y-2">
          {itemsSummary
            .sort((a, b) => b._sum.qty - a._sum.qty)
            .map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b pb-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🍽️'}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>

                <div className="text-right">
                  <p className="font-semibold">{item._sum.qty} pcs</p>
                  <p className="text-xs text-gray-500">
                    Rp {item._sum.subtotal.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* DETAIL TRANSAKSI */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold mb-3">Detail Transaksi</h2>

        <div className="max-h-[60vh] overflow-auto">
          {data.length === 0 && (
            <p className="text-sm text-gray-500">Tidak ada transaksi</p>
          )}

          {data.map((trx) => (
            <div
              key={trx.id}
              className="border-b py-2 text-sm flex justify-between"
            >
              <span>
                {new Date(trx.createdAt).toLocaleTimeString('id-ID')} •{' '}
                {trx.payment}
              </span>
              <span className="font-semibold">
                Rp {trx.total.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* reusable card */
function Card({ title, value }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-3">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
