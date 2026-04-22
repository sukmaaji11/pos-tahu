'use client';

import { useEffect, useState } from 'react';

type Trx = { id: number; total: number; payment: string; createdAt: string };

export default function POSPage() {
  const PRICE_TAHU = 500;
  const PRICE_OTAK = 1000;
  const PRICE_SOSIS = 1000;

  const [sosis, setSosis] = useState<number>(0);
  const [tahu, setTahu] = useState<number>(0);
  const [otak, setOtak] = useState<number>(0);
  const [payment, setPayment] = useState<'CASH' | 'QRIS'>('CASH');
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<Trx[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const total = tahu * PRICE_TAHU + otak * PRICE_OTAK + sosis * PRICE_SOSIS;
  const totalTransaksi = history.length;
  const totalOmzet = history.reduce((sum, x) => sum + x.total, 0);

  async function fetchToday() {
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(`/api/transactions?date=${today}`);
    const json = await res.json();
    if (json?.success) setHistory(json.data || []);
  }

  useEffect(() => {
    fetchToday();
  }, []);

  async function handleSave() {
    if (total <= 0) {
      alert('❌ Pesanan masih kosong');
      return;
    }

    const items = [
      { name: 'Tahu Crispy', price: PRICE_TAHU, qty: tahu },
      { name: 'Otak-Otak Crispy', price: PRICE_OTAK, qty: otak },
      { name: 'Sosis Crispy', price: PRICE_SOSIS, qty: sosis },
    ].filter((i) => i.qty > 0); // kirim yang ada aja

    try {
      setLoading(true);
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment,
          items,
        }),
      });

      const data = await res.json();

      if (data?.success) {
        // reset qty
        setTahu(0);
        setOtak(0);
        setSosis(0);
        setShowSuccess(true); // 👈 tampilkan popup

        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
        // refresh riwayat hari ini (kalau kamu pakai riwayat)
        if (typeof fetchToday === 'function') {
          await fetchToday();
        }
      } else {
        alert(data?.message || '❌ Gagal simpan transaksi');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Terjadi error saat menyimpan transaksi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-8">
      <div className="mb-3 md:mb-6">
        <div className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold">
              TA
            </div>
            <h1 className="text-lg md:text-2xl font-bold">POS Tahu Andalan</h1>
          </div>
          <span className="text-xs text-gray-500">Kasir</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* KIRI: Menu */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-4">
          <h2 className="font-bold text-base md:text-lg">Menu</h2>

          {/* Tahu */}
          <div className="flex justify-between items-center">
            <span className="font-semibold">Tahu Crispy</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTahu(Math.max(0, tahu - 1))}
                className="w-12 h-12 rounded-xl bg-gray-200 active:scale-95"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-lg">{tahu}</span>
              <button
                onClick={() => setTahu(tahu + 1)}
                className="w-12 h-12 rounded-xl bg-gray-200 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Otak */}
          <div className="flex justify-between items-center">
            <span className="font-semibold">Otak-Otak Crispy</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOtak(Math.max(0, otak - 1))}
                className="w-12 h-12 rounded-xl bg-gray-200 active:scale-95"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-lg">{otak}</span>
              <button
                onClick={() => setOtak(otak + 1)}
                className="w-12 h-12 rounded-xl bg-gray-200 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Sosis */}
          <div className="flex justify-between items-center">
            <span className="font-semibold">Sosis Crispy</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSosis(Math.max(0, sosis - 1))}
                className="w-12 h-12 rounded-xl bg-gray-200 active:scale-95"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-lg">
                {sosis}
              </span>
              <button
                onClick={() => setSosis(sosis + 1)}
                className="w-12 h-12 rounded-xl bg-gray-200 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Preset */}
          <div>
            <h3 className="font-semibold mb-2">⚡ Preset Paket Cepat</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setTahu(10);
                  setOtak(0);
                }}
                className="btnPreset"
              >
                Paket Tahu 5rb
              </button>
              <button
                onClick={() => {
                  setTahu(20);
                  setOtak(0);
                }}
                className="btnPreset"
              >
                Paket Tahu 10rb
              </button>
              <button
                onClick={() => {
                  setTahu(40);
                  setOtak(0);
                }}
                className="btnPreset"
              >
                Paket Tahu 20rb
              </button>
              <button
                onClick={() => {
                  setTahu(10);
                  setOtak(5);
                }}
                className="btnPreset"
              >
                Paket Campur 10rb
              </button>
              <button
                onClick={() => {
                  setTahu(20);
                  setOtak(10);
                }}
                className="btnPreset"
              >
                Paket Campur 20rb
              </button>
            </div>
          </div>
        </div>

        {/* KANAN: Ringkasan */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="text-base md:text-lg font-bold">Ringkasan Pesanan</h2>

          <div className="space-y-2">
            {tahu > 0 && (
              <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm">Tahu Crispy</span>
                <span className="font-semibold">{tahu} pcs</span>
              </div>
            )}

            {otak > 0 && (
              <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm">Otak-Otak Crispy</span>
                <span className="font-semibold">{otak} pcs</span>
              </div>
            )}

            {sosis > 0 && (
              <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm">Sosis Crispy</span>
                <span className="font-semibold">{sosis} pcs</span>
              </div>
            )}

            {/* kalau kosong */}
            {tahu === 0 && otak === 0 && sosis === 0 && (
              <p className="text-sm text-gray-400">Belum ada pesanan</p>
            )}
          </div>

          <div className="text-xl md:text-2xl font-bold">
            Total: Rp {total.toLocaleString('id-ID')}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['CASH', 'QRIS'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPayment(p)}
                className={`py-3 rounded-xl border font-semibold ${
                  payment === p ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={loading || total <= 0}
            className="w-full py-4 rounded-xl bg-yellow-400 active:scale-95 font-bold text-lg disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'SIMPAN TRANSAKSI'}
          </button>
        </div>

        {/* Riwayat */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold">Riwayat Transaksi Hari Ini</h2>
            <span className="text-sm text-gray-600">
              Total: <b>{totalTransaksi}</b> trx • Rp{' '}
              {totalOmzet.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="max-h-56 overflow-auto divide-y">
            {history.length === 0 && (
              <p className="text-sm text-gray-500 p-2">
                Belum ada transaksi hari ini.
              </p>
            )}
            {history.map((trx) => (
              <div key={trx.id} className="flex justify-between py-2 text-sm">
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
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* modal */}
            <div className="relative bg-white rounded-2xl shadow-xl px-6 py-5 text-center animate-scale">
              <div className="text-3xl mb-2">✅</div>
              <h2 className="font-bold text-lg">Transaksi Berhasil</h2>
              <p className="text-sm text-gray-500 mt-1">Data sudah tersimpan</p>
            </div>
          </div>
        )}
      </div>

      {/* Utility styles */}
      <style jsx>{`
        .btnPreset {
          padding: 0.5rem 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          background: #fafafa;
          font-size: 0.875rem;
        }
        .btnPreset:active {
          transform: scale(0.98);
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
