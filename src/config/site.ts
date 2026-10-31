export type OpeningHour = { dayOfWeek: string; dayIndex: number; label: string; opens: string; closes: string; closed?: boolean; confirmed?: boolean };
export const WHATSAPP_NUMBER = "5521981962851";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studioangelicaester.com.br";
const full = "R. Augusto de Vasconcelos, 914 - Sala 302 - Campo Grande, Rio de Janeiro - RJ, CEP 23045-130";
const phoneDisplay = "(21) 98196-2851";
export const site = {
 photos: { hero: { src: "/images/hero-original.jpg", alt: "Angélica Ester realizando uma massagem facial em atendimento no estúdio", aspectRatio: "2 / 3", position: "50% 0%", arch: true }, about: { src: "/images/about-original.jpg", alt: "Angélica Ester realizando um procedimento estético em atendimento", aspectRatio: "3 / 4", position: "50% 50%", arch: false } },
 name: "Studio Angélica Ester", brand: "Studio Angélica Ester", professionalName: "Angélica Ester",
 confirmed: { name: true, phone: true, address: true, professionalName: true },
 title: "Estética Facial e Corporal em Campo Grande, RJ | Angélica Ester",
 description: "Estética facial e corporal em Campo Grande, RJ, com Angélica Ester. Atendimento individual e personalizado, com avaliação da pele antes de cada tratamento.", locale: "pt_BR",
 phone: "+5521981962851", phoneDisplay,
 whatsapp: { phone: WHATSAPP_NUMBER, confirmed: true, message: "Olá, vim do site e gostaria de agendar uma avaliação." },
 instagram: { handle: "@studioangelicaester", url: "https://www.instagram.com/studioangelicaester", confirmed: true }, email: { value: "", confirmed: false },
 // TODO: confirmar as coordenadas do pin; o centro do embed não é a localização confirmada.
 geo: { lat: null, lng: null, confirmed: false },
 map: { confirmed: true, embedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.0950201636247!2d-43.56579598818785!3d-22.90986583789632!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9be36e26831961%3A0x834eed3f70c27d0c!2sStudio%20Ang%C3%A9lica%20Ester!5e0!3m2!1spt-BR!2sbr!4v1793484885851!5m2!1spt-BR!2sbr" },
 google: { businessProfileUrl: "", reviewsUrl: "", writeReviewUrl: "", mapsShareUrl: "", placeId: "", confirmed: false, directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent("Studio Angélica Ester, R. Augusto de Vasconcelos, 914 - Sala 302, Campo Grande, Rio de Janeiro - RJ, 23045-130"), placeUrl: "https://maps.google.com/?cid=9461760723882507532" },
 address: { confirmed: true, streetAddress: "R. Augusto de Vasconcelos, 914 - Sala 302", addressLocality: "Rio de Janeiro", addressRegion: "RJ", postalCode: "23045-130", neighborhood: "Campo Grande", country: "BR", full, reference: { value: "", confirmed: false } },
 timeZone: "America/Sao_Paulo",
 openingHours: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayOfWeek, dayIndex): OpeningHour => ({ dayOfWeek, dayIndex, label: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][dayIndex], opens: dayIndex === 0 ? "00:00" : "09:00", closes: dayIndex === 0 ? "00:00" : dayIndex === 6 ? "13:00" : "19:00", closed: dayIndex === 0, confirmed: dayIndex !== 1 })),
 payment: { value: "", confirmed: false }, accessibility: { value: "", confirmed: false }, parking: { value: "", confirmed: false },
 credentials: { registration: { value: "", confirmed: false }, education: { value: "", confirmed: false }, experience: { value: "", confirmed: false } }, prices: { items: [], confirmed: false },
 region: { confirmed: true, description: "Eu atendo em Campo Grande e recebo pessoas de toda a Zona Oeste do Rio de Janeiro." },
 baseText: "Todo atendimento começa com uma avaliação da sua pele, para indicar o tratamento mais seguro e eficaz.",
 services: [
 { title: "Remoção de micropigmentação e tatuagem", icon: "eraser", description: "Eu avalio a área e explico as etapas do atendimento." },
 { title: "Clareamento de manchas", icon: "sun", description: "Eu avalio as características da pele para planejar o cuidado." },
 { title: "Tratamento para foliculite", icon: "follicle", description: "Eu avalio a pele e converso sobre os cuidados para a região." },
 { title: "Tratamento de estrias", icon: "waves", description: "Eu avalio a região e as possibilidades de tratamento." },
 { title: "Limpeza de pele", icon: "sparkles", description: "Eu planejo a limpeza conforme as necessidades da sua pele." },
 { title: "Rejuvenescimento facial", icon: "smile", description: "Eu converso sobre seus objetivos para planejar o cuidado facial." },
 { title: "Microagulhamento", icon: "pen", description: "Eu avalio a pele antes de indicar o procedimento." },
 { title: "Remoção de sinais e verrugas", icon: "scan", description: "Eu avalio cada área antes de definir o atendimento." },
 ].map(service => ({ ...service, confirmed: true })),
 about: { paragraphs: ["Olá, eu sou Angélica Ester, esteticista em Campo Grande, no Rio de Janeiro.", "Eu ofereço atendimento individual e personalizado em estética facial e corporal.", "Eu escuto suas necessidades, avalio sua pele e explico cada etapa do cuidado."] },
 process: [
 { title: "Entre em contato", description: "Você me enviará uma mensagem no WhatsApp." },
 { title: "Eu escuto você", description: "Nós conversamos sobre a sua necessidade." },
 { title: "Nós combinamos o horário", description: "Nós confirmamos a disponibilidade para a sua consulta." },
 { title: "Eu avalio sua pele", description: "Eu faço a avaliação e explico as possibilidades de tratamento." },
 ],
 faq: [
 { question: "Como funciona a avaliação?", answer: "Nós conversamos sobre suas necessidades, eu avalio sua pele e explico as possibilidades de tratamento e cada etapa do atendimento." },
 { question: "Quantas sessões são necessárias?", answer: "A quantidade de sessões depende da avaliação da pele e do tratamento indicado. Eu converso com você sobre o planejamento durante a avaliação." },
 { question: "Onde fica o studio?", answer: "Eu atendo na " + full + "." },
 { question: "Como faço para agendar?", answer: "Me chame no WhatsApp " + phoneDisplay + ". Eu esclareço suas dúvidas e confirmo a disponibilidade para o atendimento." },
 ], privacyPath: "/privacidade",
};
export const confirmedHours = site.openingHours.filter(hour => hour.confirmed).sort((a, b) => (a.dayIndex || 7) - (b.dayIndex || 7));
export const hoursLabel = confirmedHours.map(hour => hour.label + ": " + (hour.closed ? "fechado" : hour.opens + "–" + hour.closes)).join(" · ");
