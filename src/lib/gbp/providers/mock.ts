import type { GbpProvider } from "../provider";
import type { GbpPost, GbpReview, GbpSummary } from "../types";

const summary: GbpSummary = {
  averageRating: 4.8,
  totalReviews: 86,
};

const reviews: GbpReview[] = [
  {
    id: "sample-1",
    authorName: "Mariana S.",
    rating: 5,
    relativeDate: "há 2 semanas",
    text: "Fui muito bem recebida, a profissional explicou tudo com calma e o atendimento foi muito cuidadoso.",
    ownerReply: "Obrigada pelo carinho, Mariana! Foi um prazer receber você.",
  },
  {
    id: "sample-2",
    authorName: "Rita C.",
    rating: 5,
    relativeDate: "há 1 mês",
    text: "Atendimento atencioso e profissional. Saí com orientações claras para cuidar melhor dos minha pele.",
  },
  {
    id: "sample-3",
    authorName: "Paulo R.",
    rating: 5,
    relativeDate: "há 1 mês",
    text: "A profissional teve muita paciência para explicar cada etapa. Gostei bastante da atenção e do cuidado.",
    ownerReply: "Fico feliz que tenha se sentido bem cuidado, Paulo. Obrigada pela confiança!",
  },
  {
    id: "sample-4",
    authorName: "Denise M.",
    rating: 4,
    relativeDate: "há 2 meses",
    text: "Consegui agendar pelo WhatsApp sem dificuldade. Atendimento tranquilo e atencioso.",
  },
  {
    id: "sample-5",
    authorName: "Luciana F.",
    rating: 5,
    relativeDate: "há 2 meses",
    text: "Profissional cuidadosa e muito acolhedora. Me senti confortável durante toda a consulta.",
    ownerReply: "Obrigada pela avaliação, Luciana! Conte comigo.",
  },
  {
    id: "sample-6",
    authorName: "Sandra P.",
    rating: 5,
    relativeDate: "há 3 meses",
    text: "Gostei do atendimento individualizado e de receber explicações sobre os cuidados em casa.",
  },
];

const posts: GbpPost[] = [
  {
    id: "sample-post-1",
    image: "/images/neutral-placeholder.svg",
    imageAlt: "Ilustração sobre cuidado e saúde da pele",
    text: "Cuido da sua pele com atenção. Me conte sobre as mudanças que você percebeu para eu avaliar seu caso.",
    relativeDate: "publicado recentemente",
    ctaLabel: "Fale comigo",
    ctaUrl: "whatsapp",
  },
  {
    id: "sample-post-2",
    image: "/images/neutral-placeholder.svg",
    imageAlt: "Ilustração de cuidado preventivo com a pele",
    text: "Eu avalio sua pele e converso sobre suas necessidades antes do atendimento.",
    relativeDate: "publicado recentemente",
    ctaLabel: "Tire suas dúvidas",
    ctaUrl: "whatsapp",
  },
  {
    id: "sample-post-3",
    image: "/images/neutral-placeholder.svg",
    imageAlt: "Ilustração de um consultório de estética",
    text: "Cada pessoa merece um atendimento atento às suas necessidades. Estou à disposição para conversar sobre estética.",
    relativeDate: "publicado recentemente",
    ctaLabel: "Agendar conversa",
    ctaUrl: "whatsapp",
  },
];

export const mockGbpProvider: GbpProvider = {
  async getSummary() {
    return summary;
  },
  async getReviews() {
    return reviews;
  },
  async getPosts() {
    return posts;
  },
};
