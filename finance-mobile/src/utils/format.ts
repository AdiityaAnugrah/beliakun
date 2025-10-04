export const money = (n:number) => new Intl.NumberFormat("id-ID",{ style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(n);
export const date = (s:string) => new Intl.DateTimeFormat("id-ID",{ year:"numeric", month:"short", day:"2-digit" }).format(new Date(s));
export const ym = (s:string) => new Intl.DateTimeFormat("id-ID",{ year:"numeric", month:"long" }).format(new Date(s));
export const dmy = (s:string) => new Intl.DateTimeFormat("id-ID",{ year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date(s));