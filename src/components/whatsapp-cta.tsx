import { site } from "@/config/site";
import { WhatsAppIcon } from "./icons";
import { WhatsAppLink } from "./tracked-links";
type Props = { label?: string; className?: string; showIcon?: boolean; message?: string; ariaLabel?: string };
export function WhatsAppCta({ label = "Chamar no WhatsApp", className = "", showIcon = true, message = site.whatsapp.message, ariaLabel }: Props) {
 if (!site.whatsapp.confirmed || !site.whatsapp.phone) return null;
 return <WhatsAppLink href={`https://wa.me/${site.whatsapp.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`} className={className} aria-label={ariaLabel || label}>{showIcon && <WhatsAppIcon className="h-5 w-5" />}<span>{label}</span></WhatsAppLink>;
}
