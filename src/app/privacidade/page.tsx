import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
export const metadata: Metadata = { title: `Privacidade | ${site.name}`, robots: { index: false, follow: true } };
export default function PrivacyPage() {
 return <main className="min-h-screen bg-bg px-5 py-16"><article className="mx-auto max-w-2xl rounded-3xl bg-bg p-7 shadow-card">
 <Link href="/" className="inline-flex min-h-12 items-center text-accent">← Voltar para o início</Link>
 <h1 className="mt-8 font-display text-4xl">Privacidade — {site.name}</h1>
 <p className="mt-5 leading-7">Eu uso as informações fornecidas ao entrar em contato para responder às suas dúvidas e organizar o agendamento.</p>
 <p className="mt-4 leading-7">Eu uso Google Ads e Google Analytics 4 somente quando seus identificadores estão configurados no site. Esses serviços podem processar dados de navegação conforme suas políticas.</p>
 <p className="mt-4 leading-7">Para dúvidas sobre privacidade ou solicitações relacionadas aos seus dados, me chame no WhatsApp {site.phoneDisplay}.</p>
 {site.email.confirmed && site.email.value && <p>{site.email.value}</p>}
 </article></main>;
}
