const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

// En local (localhost) on ne met pas de domaine → le cookie est partagé entre tous les ports
// En prod on cible tous les sous-domaines .cpupme.ci
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const DOMAIN_PART = isLocalhost ? "" : "; domain=.cpupme.ci";

export function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE}; SameSite=Lax${DOMAIN_PART}`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function removeCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0${DOMAIN_PART}`;
}
