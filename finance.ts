'use client';

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Area, AreaChart, CartesianGrid, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Brain, CalendarDays, CreditCard, Globe2, LayoutDashboard, LogOut, Plus, ShieldCheck, WalletCards } from 'lucide-react';
import { auth, loginWithGoogle, logout, saveUserData, watchUserData } from '@/lib/firebase';
import { currency, itemAmount, monthKey, seedData, totalsForMonth } from '@/lib/finance';
import { t } from '@/lib/i18n';
import type { AppData, BudgetItem, Locale } from '@/lib/types';

const tabs = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'budget', icon: WalletCards },
  { id: 'calendar', icon: CalendarDays },
  { id: 'debts', icon: CreditCard },
  { id: 'ai', icon: Brain }
] as const;

type Tab = typeof tabs[number]['id'];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(monthKey());

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }), []);

  useEffect(() => {
    if (!user) return;
    const unsub = watchUserData(user.uid, async (remote) => {
      if (remote) setData(remote);
      else {
        const seeded = seedData(user.email || '', user.displayName || 'Utilisateur');
        await saveUserData(user.uid, seeded);
        setData(seeded);
      }
    });
    return () => unsub();
  }, [user]);

  const locale = data?.profile.language || 'fr';

  async function updateData(next: AppData) {
    setData(next);
    if (user) await saveUserData(user.uid, next);
  }

  if (loading) return <Splash />;
  if (!user) return <Login locale="fr" />;
  if (!data) return <Splash />;

  const nav = tabs.map((x) => ({ ...x, label: t(locale, x.id) }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-100 to-stone-100 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
        <aside className="hidden w-72 shrink-0 p-5 md:block">
          <div className="glass sticky top-5 rounded-[2rem] p-5 shadow-soft">
            <Brand locale={locale} />
            <div className="mt-8 space-y-2">
              {nav.map((item) => <NavButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)} icon={item.icon} label={item.label} />)}
            </div>
            <div className="mt-8 rounded-2xl bg-emerald-950 p-4 text-emerald-50">
              <div className="flex items-center gap-2 text-sm"><ShieldCheck size={16} /> {t(locale, 'protected')}</div>
              <div className="mt-3 text-xs opacity-80">{user.email}</div>
            </div>
          </div>
        </aside>

        <section className="flex-1 p-4 pb-28 md:p-8">
          <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">{t(locale, 'subtitle')}</p>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">{t(locale, tab)}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              <button onClick={() => updateData({ ...data, profile: { ...data.profile, language: locale === 'fr' ? 'en' : 'fr' } })} className="rounded-2xl bg-white px-4 py-3 font-bold shadow-sm"><Globe2 className="inline" size={16} /> {locale.toUpperCase()}</button>
              <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white"><LogOut className="inline" size={16} /> {t(locale, 'signOut')}</button>
            </div>
          </header>

          {tab === 'dashboard' && <Dashboard data={data} month={month} locale={locale} />}
          {tab === 'budget' && <Budget data={data} month={month} locale={locale} updateData={updateData} />}
          {tab === 'calendar' && <CalendarView data={data} month={month} locale={locale} />}
          {tab === 'debts' && <Debts data={data} locale={locale} updateData={updateData} />}
          {tab === 'ai' && <AI data={data} locale={locale} />}
        </section>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-30 rounded-[2rem] bg-slate-950 p-2 shadow-soft md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-2xl p-3 ${tab === item.id ? 'bg-emerald-300 text-slate-950' : 'text-white/70'}`}><Icon className="mx-auto" /></button>;
          })}
        </div>
      </nav>
    </main>
  );
}

function Splash() { return <div className="grid min-h-screen place-items-center bg-emerald-950 text-emerald-50"><div className="text-2xl font-black">mon-budget</div></div>; }
function Login({ locale }: { locale: Locale }) { return <main className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-950 to-slate-950 p-5 text-white"><div className="max-w-md rounded-[2rem] bg-white/10 p-8 shadow-soft backdrop-blur"><Brand locale={locale} light /><h1 className="mt-8 text-3xl font-black">{t(locale, 'loginTitle')}</h1><p className="mt-3 text-white/70">{t(locale, 'loginText')}</p><button onClick={loginWithGoogle} className="mt-8 w-full rounded-2xl bg-emerald-300 px-5 py-4 font-black text-slate-950">{t(locale, 'google')}</button></div></main>; }
function Brand({ locale, light = false }: { locale: Locale; light?: boolean }) { return <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300 font-black text-slate-950">MB</div><div><div className={`text-xl font-black ${light ? 'text-white' : ''}`}>{t(locale, 'app')}</div><div className={`text-xs ${light ? 'text-white/60' : 'text-slate-500'}`}>AI personal CFO</div></div></div>; }
function NavButton({ active, onClick, icon: Icon, label }: any) { return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold ${active ? 'bg-emerald-300 text-slate-950' : 'hover:bg-white'}`}><Icon size={18} /> {label}</button>; }

function Dashboard({ data, month, locale }: { data: AppData; month: string; locale: Locale }) {
  const totals = totalsForMonth(data, month);
  const cards = [
    [t(locale, 'availableToday'), totals.availableToday],
    [t(locale, 'reserved'), totals.reserved],
    [t(locale, 'trueSurplus'), totals.trueSurplus],
    [t(locale, 'debtTotal'), totals.debtTotal]
  ];
  const pieData = Object.entries(data.items.filter((i) => i.type === 'expense' && i.date.startsWith(month)).reduce<Record<string, number>>((acc, i) => { acc[i.category] = (acc[i.category] || 0) + itemAmount(i); return acc; }, {})).map(([name, value]) => ({ name, value }));
  const lineData = data.items.filter((i) => i.date.startsWith(month)).sort((a,b)=>a.date.localeCompare(b.date)).reduce<any[]>((rows, item, idx) => { const prev = rows[idx-1]?.balance || 0; rows.push({ date: item.date.slice(5), balance: prev + (item.type === 'income' ? itemAmount(item) : -itemAmount(item)) }); return rows; }, []);
  return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-4">{cards.map(([label, value]) => <div className="glass rounded-[2rem] p-5 shadow-soft" key={label as string}><div className="text-sm font-bold text-slate-500">{label as string}</div><div className="mt-3 text-3xl font-black">{currency(value as number, locale === 'fr' ? 'fr-CA' : 'en-CA')}</div></div>)}</div><div className="grid gap-6 lg:grid-cols-2"><Panel title="Dépenses par catégorie"><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" outerRadius={105} label>{pieData.map((_, i) => <Cell key={i} />)}</Pie><Tooltip formatter={(v:any)=>currency(Number(v))}/></PieChart></ResponsiveContainer></Panel><Panel title="Solde prévu"><ResponsiveContainer width="100%" height={300}><AreaChart data={lineData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Area type="monotone" dataKey="balance" fillOpacity={0.2}/></AreaChart></ResponsiveContainer></Panel></div><Panel title={t(locale, 'upcoming')}><div className="grid gap-3 md:grid-cols-3">{data.items.filter(i=>i.type==='expense'&&i.date>=new Date().toISOString().slice(0,10)).slice(0,6).map(i=><div key={i.id} className="rounded-2xl bg-white p-4"><div className="font-black">{i.date} — {i.label}</div><div className="text-slate-500">{currency(itemAmount(i))}</div></div>)}</div></Panel></div>;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="glass rounded-[2rem] p-5 shadow-soft"><h2 className="mb-4 text-xl font-black">{title}</h2>{children}</section>; }

function Budget({ data, month, locale, updateData }: { data: AppData; month: string; locale: Locale; updateData: (d:AppData)=>void }) {
  const rows = data.items.filter((i) => i.date.startsWith(month)).sort((a,b)=>a.date.localeCompare(b.date));
  function add(type: 'income'|'expense') { const next = { ...data, items: [...data.items, { id: crypto.randomUUID(), date: `${month}-15`, label: type==='income'?'Nouvelle entrée':'Nouvelle sortie', category: type==='income'?'Revenu':'Divers', type, planned: 0, paid:false, recurring:'none' as const }]}; updateData(next); }
  function patch(id:string, patch:Partial<BudgetItem>) { updateData({ ...data, items: data.items.map(i=>i.id===id?{...i,...patch}:i) }); }
  return <Panel title={t(locale, 'budget')}><div className="mb-4 flex gap-2"><button onClick={()=>add('income')} className="rounded-2xl bg-emerald-300 px-4 py-3 font-black"><Plus className="inline" size={16}/> {t(locale,'addIncome')}</button><button onClick={()=>add('expense')} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white"><Plus className="inline" size={16}/> {t(locale,'addExpense')}</button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-separate border-spacing-y-2"><thead><tr className="text-left text-sm text-slate-500"><th>Date</th><th>Nom</th><th>Catégorie</th><th>Type</th><th>Prévu</th><th>Payé</th></tr></thead><tbody>{rows.map(i=><tr key={i.id} className="bg-white"><td className="rounded-l-2xl p-3"><input className="w-32" type="date" value={i.date} onChange={e=>patch(i.id,{date:e.target.value})}/></td><td><input value={i.label} onChange={e=>patch(i.id,{label:e.target.value})}/></td><td><input value={i.category} onChange={e=>patch(i.id,{category:e.target.value})}/></td><td>{i.type}</td><td><input className="w-24" type="number" value={i.planned} onChange={e=>patch(i.id,{planned:Number(e.target.value)})}/></td><td className="rounded-r-2xl"><input type="checkbox" checked={!!i.paid} onChange={e=>patch(i.id,{paid:e.target.checked})}/></td></tr>)}</tbody></table></div></Panel>;
}
function CalendarView({ data, month }: { data: AppData; month: string; locale: Locale }) { const grouped = data.items.filter(i=>i.date.startsWith(month)).reduce<Record<string,BudgetItem[]>>((acc,i)=>{(acc[i.date] ||= []).push(i);return acc;},{}); return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Object.entries(grouped).sort().map(([date, items])=><div key={date} className="glass rounded-[2rem] p-5 shadow-soft"><div className="text-xl font-black">{date}</div><div className="mt-4 space-y-2">{items.map(i=><div key={i.id} className="flex justify-between rounded-2xl bg-white p-3"><span>{i.label}</span><b>{i.type==='income'?'+':'-'}{currency(itemAmount(i))}</b></div>)}</div></div>)}</div>; }
function Debts({ data, locale, updateData }: { data: AppData; locale: Locale; updateData:(d:AppData)=>void }) { return <Panel title={t(locale,'debts')}><div className="grid gap-4 md:grid-cols-3">{data.debts.map(d=><div key={d.id} className="rounded-[2rem] bg-white p-5"><div className="text-xl font-black">{d.name}</div><div className="mt-3 text-3xl font-black">{currency(d.balance)}</div><div className="mt-2 text-sm text-slate-500">{d.rate}% · min {currency(d.minimum)}</div></div>)}</div></Panel>; }
function AI({ data, locale }: { data: AppData; locale: Locale }) { const [q,setQ]=useState(''); const [answer,setAnswer]=useState(''); const [busy,setBusy]=useState(false); async function ask(){ setBusy(true); setAnswer(''); try{ const token=await auth.currentUser?.getIdToken(); const res=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({question:q,data})}); const json=await res.json(); setAnswer(json.answer||json.error||'Erreur'); } finally{ setBusy(false); } } return <Panel title="IA Coach"><textarea className="min-h-32 w-full rounded-2xl border border-slate-200 p-4" placeholder={t(locale,'questionPlaceholder')} value={q} onChange={e=>setQ(e.target.value)}/><button onClick={ask} disabled={busy} className="mt-3 rounded-2xl bg-emerald-300 px-5 py-3 font-black">{busy?'...':t(locale,'ask')}</button>{answer&&<div className="mt-5 whitespace-pre-wrap rounded-2xl bg-white p-5 leading-relaxed">{answer}</div>}</Panel>; }
