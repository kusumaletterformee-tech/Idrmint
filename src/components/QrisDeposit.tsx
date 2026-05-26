import React, { useState, useEffect } from 'react';
import { QrCode, CreditCard, RefreshCw, CheckCircle2, AlertTriangle, ArrowDownRight, Printer, ShieldAlert, History } from 'lucide-react';
import { MiningConfig, DepositTransaction } from '../types';
import { formatRupiah, generateCryptoHash, generateRandomCode } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface QrisDepositProps {
  config: MiningConfig;
  setConfig: React.Dispatch<React.SetStateAction<MiningConfig>>;
  onAddLog: (log: string) => void;
}

export default function QrisDeposit({ config, setConfig, onAddLog }: QrisDepositProps) {
  const [amountInput, setAmountInput] = useState<string>('20000');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeInvoice, setActiveInvoice] = useState<DepositTransaction | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 minutes validity
  const [isPayingSimulated, setIsPayingSimulated] = useState<boolean>(false);
  const [depositSuccessMessage, setDepositSuccessMessage] = useState<string>('');

  // Countdown timer for pending QRIS invoice
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeInvoice && activeInvoice.status === 'Pending') {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Expire invoice
            setActiveInvoice((curr) => curr ? { ...curr, status: 'Expired' } : null);
            onAddLog(`[DEPOSIT] Invoice QRIS #${activeInvoice.id} senilai ${formatRupiah(activeInvoice.amount)} telah kedaluwarsa.`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeInvoice]);

  const changePresetAmount = (val: string) => {
    setAmountInput(val);
  };

  const generateQrisInvoice = () => {
    const rawAmt = parseInt(amountInput);
    if (isNaN(rawAmt) || rawAmt < 5000) {
      alert('Minimal deposit melalui QRIS adalah Rp 5.000');
      return;
    }
    if (rawAmt > 2000000) {
      alert('Maksimal deposit per transaksi QRIS adalah Rp 2.000.000');
      return;
    }

    setIsGenerating(true);
    // Simulate API delay
    setTimeout(() => {
      const qrisId = 'QRS-' + Math.floor(Math.random() * 89999 + 10000);
      const newInvoice: DepositTransaction = {
        id: qrisId,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        amount: rawAmt,
        paymentMethod: 'QRIS',
        status: 'Pending',
        referenceNumber: 'REF-' + generateRandomCode(12),
      };

      setActiveInvoice(newInvoice);
      setSecondsRemaining(300); // Reset timer to 5 minutes
      setIsGenerating(false);
      onAddLog(`[DEPOSIT] Invoice QRIS berhasil digenasi untuk nominal ${formatRupiah(rawAmt)} dengan ID Tag ${qrisId}. Silakan selesaikan pembayaran.`);
    }, 1200);
  };

  const handleSimulatePayment = () => {
    if (!activeInvoice || activeInvoice.status !== 'Pending') return;

    setIsPayingSimulated(true);
    onAddLog(`[DEPOSIT] Memproses simulasi pembayaran QRIS senilai ${formatRupiah(activeInvoice.amount)}... Menghubungi Gateway Bank.`);

    setTimeout(() => {
      const updatedInvoice: DepositTransaction = {
        ...activeInvoice,
        status: 'Completed',
      };

      setActiveInvoice(updatedInvoice);

      // Add to Sisa Saldo Ter-settle (DANA) and depositHistory
      setConfig((prev) => ({
        ...prev,
        balanceEWallet: prev.balanceEWallet + activeInvoice.amount,
        depositHistory: [updatedInvoice, ...prev.depositHistory],
      }));

      setIsPayingSimulated(false);
      setDepositSuccessMessage(`Selesai! Dana ${formatRupiah(activeInvoice.amount)} berhasil masuk ke Sisa Saldo Ter-settle (DANA)`);
      onAddLog(`[DEPOSIT] Pembayaran QRIS #${activeInvoice.id} BERHASIL diverifikasi! ${formatRupiah(activeInvoice.amount)} langsung dikonfirmasi ke Sisa Saldo Ter-settle (DANA).`);
      
      // Clear success banner after some time
      setTimeout(() => setDepositSuccessMessage(''), 6000);
    }, 2000);
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner introducing deposit with QRIS */}
      <div className="rounded-2xl border border-indigo-900 bg-indigo-950/10 p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -m-8 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 text-[11px] text-indigo-400 font-mono border border-indigo-900/40 mb-2">
              <QrCode className="h-3 w-3" />
              Sistem Deposit Instant QRIS Nasional
            </span>
            <h2 className="text-xl font-bold font-sans tracking-tight text-white">
              Isi Ulang Sisa Saldo Ter-settle (DANA)
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl mt-1 leading-relaxed">
              Butuh memperkuat Sisa Saldo Ter-settle (DANA) Anda untuk membeli atau menyewa hashrate pertambangan? Lakukan deposit instan menggunakan kode QRIS standar Bank Indonesia. Dapat dipindai menggunakan dompet lokal seperti DANA, GoPay, OVO, ShopeePay atau M-Banking Anda.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 flex flex-col font-mono text-right">
            <span className="text-[10px] text-zinc-500 uppercase">Sisa Saldo Ter-settle (DANA) Saat Ini</span>
            <span className="text-lg font-bold text-pink-400">{formatRupiah(config.balanceEWallet)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Setup Deposit Amount Form */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-md flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="font-sans font-semibold text-white flex items-center gap-2 border-b border-zinc-900 pb-2">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              Inisiasi Nominal Deposit
            </h3>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-zinc-500 uppercase">Preset Nominal Populer</label>
              <div className="grid grid-cols-3 gap-2">
                {['10000', '20000', '50000', '100000', '250000', '500000'].map((val) => (
                  <button
                    key={val}
                    id={`btn-preset-deposit-${val}`}
                    onClick={() => changePresetAmount(val)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-semibold font-mono border transition-all ${
                      amountInput === val
                        ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/60'
                        : 'bg-zinc-90 w-full hover:bg-zinc-900 border-zinc-900 text-zinc-400'
                    }`}
                  >
                    {formatRupiah(parseInt(val))}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Manual Amount field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-500 uppercase">Ketik Nominal Manual (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-sm">Rp</span>
                <input
                  type="number"
                  placeholder="Contoh: 30000"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                Min. deposit Rp 5.000 — Maks. Rp 2.000.000 per transaksi
              </p>
            </div>
          </div>

          <button
            id="btn-generate-qris"
            onClick={generateQrisInvoice}
            disabled={isGenerating || !amountInput || parseInt(amountInput) < 5000}
            className="w-full mt-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-650 font-semibold text-xs text-white flex items-center justify-center gap-2 shadow-md transition-all uppercase tracking-wider"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Membangun QR Code QRIS...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                Dapatkan Kode QRIS Sekarang
              </>
            )}
          </button>
        </div>

        {/* Dynamic Interactive QRIS Certificate Invoice Visualizer */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col items-center justify-between shadow-lg relative min-h-[460px]">
          {depositSuccessMessage && (
            <div className="absolute top-4 left-4 right-4 z-20 p-3.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded-xl text-xs flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{depositSuccessMessage}</span>
            </div>
          )}

          {!activeInvoice ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                <QrCode className="h-12 w-12 animate-pulse" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="text-sm font-semibold text-zinc-300">Siap Menerima Pembayaran</h4>
                <p className="text-xs text-zinc-500">
                  Tentukan jumlah deposit Anda di panel kiri dan klik "Dapatkan Kode QRIS" untuk melahirkan sertifikat pembayaran berlabel keamanan end-to-end.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-6">
              
              {/* Header metadata of generated QRIS */}
              <div className="w-full flex justify-between items-center pb-2 border-b border-zinc-900">
                <div>
                  <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Invoice: <span className="text-indigo-400">{activeInvoice.id}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Ref: {activeInvoice.referenceNumber}
                  </div>
                </div>

                <div className="text-right">
                  {activeInvoice.status === 'Pending' ? (
                    <div className="text-xs font-semibold text-yellow-500 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                      EXP: {formatTime(secondsRemaining)}
                    </div>
                  ) : (
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-black ${
                      activeInvoice.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-500'
                    }`}>
                      {activeInvoice.status}
                    </span>
                  )}
                </div>
              </div>

              {/* QRIS Layout Certificate Wrapper */}
              <div className="relative py-4 px-6 rounded-xl bg-white border border-zinc-300 shadow-xl max-w-sm w-full flex flex-col items-center select-none text-zinc-950">
                
                {/* QRIS Brand Indicator */}
                <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-zinc-300">
                  <div className="flex flex-col">
                    <span className="text-sm font-black italic tracking-tighter text-indigo-900">QRIS</span>
                    <span className="text-[6px] tracking-widest text-zinc-500 font-sans uppercase">QR Code Indonesian Standard</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold text-green-700">GPN</span>
                    <span className="text-[5px] text-zinc-500 font-mono">NMI-IDR-A99</span>
                  </div>
                </div>

                <div className="text-center space-y-0.5">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider leading-none">MERCHANT: IDR COIN MINER NETWORK</h4>
                  <p className="text-[8px] text-zinc-500 font-mono">MEMBER OF SECURE VAULT ASIA</p>
                </div>

                {/* Simulated High-Fi QR Code */}
                <div className="my-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center relative">
                  
                  {activeInvoice.status === 'Pending' ? (
                    /* Elegant pattern generation to make QR looked absolutely real with blocks */
                    <div className="grid grid-cols-11 gap-0.5 w-40 h-40 bg-white p-1">
                      {Array.from({ length: 121 }).map((_, i) => {
                        // Create realistic corners (squares for QR anchor nodes)
                        const row = Math.floor(i / 11);
                        const col = i % 11;
                        const isAnchor =
                          (row < 3 && col < 3) ||
                          (row < 3 && col > 7) ||
                          (row > 7 && col < 3);
                        
                        // Fake randomized QR pixels representation
                        const isActive = isAnchor || (i % 3 === 0 && i % 4 !== 0) || (i % 7 === 2 && col > 3);

                        return (
                          <div
                            key={i}
                            className={`rounded-sm transition-all duration-300 ${isAnchor ? 'bg-indigo-950' : isActive ? 'bg-zinc-900' : 'bg-transparent'}`}
                          />
                        );
                      })}
                    </div>
                  ) : activeInvoice.status === 'Completed' ? (
                    <div className="w-40 h-40 bg-zinc-100 flex flex-col items-center justify-center space-y-2">
                      <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-scale-in" />
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">LUNAS</span>
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-zinc-100 flex flex-col items-center justify-center space-y-2">
                      <AlertTriangle className="h-12 w-12 text-red-500" />
                      <span className="text-[11px] font-bold text-red-500 uppercase">EXPIRED</span>
                    </div>
                  )}

                  {/* Tiny QR Logo center sticker */}
                  {activeInvoice.status === 'Pending' && (
                    <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-indigo-950 rounded-lg border border-white flex items-center justify-center shadow-lg">
                      <span className="text-[8px] font-black text-white italic">IDR</span>
                    </div>
                  )}
                </div>

                <div className="text-center font-mono w-full pt-1.5 border-t border-dashed border-zinc-300">
                  <div className="text-[8px] text-zinc-500 uppercase">Tarif Nominal Tagihan:</div>
                  <div className="text-sm font-black text-zinc-900 tracking-tight">
                    {formatRupiah(activeInvoice.amount)}
                  </div>
                </div>

                <div className="text-[7px] text-zinc-400 mt-2 text-center uppercase tracking-wider font-mono">
                  TERVALIDASI • SSL 256 END-TO-END CRYPTO VAULT
                </div>
              </div>

              {/* Simulation panel where user can self-pay the QRIS instantly */}
              {activeInvoice.status === 'Pending' && (
                <div className="w-full bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <ShieldAlert className="h-4 w-4 text-indigo-400 shrink-0 animate-bounce" />
                    <span><strong>Simulator Pembayaran:</strong> Klik tombol di kanan untuk mensimulasikan transfer sukses dari e-wallet Anda ke QRIS merchant ini.</span>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      id="btn-cancel-invoice"
                      onClick={() => {
                        setActiveInvoice(null);
                        onAddLog('[DEPOSIT] Membatalkan pembuatan tagihan deposit.');
                      }}
                      className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-xs font-medium text-zinc-400 transition-colors"
                    >
                      Batal
                    </button>

                    <button
                      id="btn-simulate-qris-payment"
                      disabled={isPayingSimulated}
                      onClick={handleSimulatePayment}
                      className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-850 font-semibold text-xs text-zinc-950 flex items-center justify-center gap-1.5 shadow-md transition-all uppercase tracking-wide"
                    >
                      {isPayingSimulated ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Memverifikasi Mutasi...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Bayar QRIS (Simulasi)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="w-full text-center text-[10px] text-zinc-500 mt-4 pt-3 border-t border-zinc-900">
            Sertifikat QRIS didukung oleh Jaringan <strong>IDR-Secure Settlement Engine</strong>
          </div>
        </div>
      </div>

      {/* History log of QRIS Deposits */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
          <h3 className="font-sans font-medium text-white flex items-center gap-2">
            <History className="h-5 w-5 text-zinc-400" />
            Riwayat Deposit QRIS (Pertambangan 24-Jam)
          </h3>
          <span className="text-xs text-zinc-500 font-mono">ID Tag Deposit</span>
        </div>

        {config.depositHistory.length === 0 ? (
          <div className="text-center py-8 bg-zinc-950 rounded-xl border border-dashed border-zinc-850">
            <ArrowDownRight className="h-8 w-8 text-zinc-650 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">Belum ada riwayat isi ulang saldo.</p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Gunakan QRIS diatas untuk menyuntikkan dana langsung ke Sisa Saldo Ter-settle (DANA) Anda jika Anda ingin mempercepat atau menyewa hashrate mesin pertambangan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-mono font-normal">
                  <th className="py-2 pb-3">No</th>
                  <th className="py-2 pb-3">ID Tag QRIS</th>
                  <th className="py-2 pb-3">Waktu Deposit</th>
                  <th className="py-2 pb-3">Nominal Deposit</th>
                  <th className="py-2 pb-3">Jenis Pembayaran</th>
                  <th className="py-2 pb-3">Nomor Referensi Mutasi</th>
                  <th className="py-2 pb-3 text-right">Status Deposit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {config.depositHistory.map((dp, i) => (
                  <tr key={dp.id} className="text-zinc-300 hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 font-mono text-zinc-500">{i + 1}</td>
                    <td className="py-3 font-mono text-indigo-400 font-bold">{dp.id}</td>
                    <td className="py-3 text-zinc-500">{dp.timestamp}</td>
                    <td className="py-3 font-mono font-extrabold text-emerald-400">{formatRupiah(dp.amount)}</td>
                    <td className="py-3 text-zinc-400 font-semibold">{dp.paymentMethod}</td>
                    <td className="py-3 font-mono text-zinc-500 uppercase">{dp.referenceNumber}</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 text-[10px] font-sans font-medium border border-emerald-900/30">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {dp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
