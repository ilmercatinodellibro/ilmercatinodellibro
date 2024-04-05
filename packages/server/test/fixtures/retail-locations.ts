import type { Prisma } from "@prisma/client";
import type { Theme } from "src/modules/retail-location/theme.args";

const RE_WHO_ARE_WE = `Il Mercatino del Libro è un progetto nato nel 2013 e portato avanti negli anni da diverse associazioni di Reggio Emilia. A partire dal 2019 il progetto è promosso dal <b>Comune di Reggio Emilia</b> che ne ha permesso lo svolgimento all'interno dello spazio giovani di <b><a href="">Via Cassoli 1</a></b>. Attualmente il progetto è portato avanti dall'associazione <b><a href="">The Spots</a></b>, capofila della rete di associazioni giovanili che abitano lo spazio comunale.<br /><br />
Il Mercatino del Libro si occupa di compravendita di testi scolastici destinati a istituti superiori di primo e secondo grado. <b>I libri sono ritirati in conto vendita, e venduti al 55% del prezzo di copertina. Alla fine di ogni edizione vengono restituiti agli utenti i libri invenduti e parte dei profitti derivati dalla vendita, pari al 30% del prezzo di copertina.</b> <br /><br />
Il margine di guadagno del mercatino del libro viene utilizzato per garantire la continuità del progetto negli anni successivi, investendo il surplus in progetti legati all'istruzione e alle politiche giovanili. Negli anni, il progetto è stato realizzato da studenti o giovani lavoratori tra i 16 e i 25 che in forma volontaria hanno condiviso i valori di mutuo soccorso tra studenti e libero accesso all'istruzione.<br /><br />
A partire dall'edizione 2022, il Mercatino del Libro ha aperto una <b>seconda sede a Modena all'interno dello <a href="">Spazio Happen</a></b> in via Strada Nazionale Canaletto sud, 43L gestito dalla <b>Cooperativa Sociale Aliante</b>. La cooperativa ha lo scopo di perseguire l'interesse generale della comunità alla promozione umana e all'integrazione sociale dei cittadini attraverso la gestione di servizi di supporto, assistenziali, socio-sanitari ed educativi.`;

const RE_JOIN_US = `<b>Ogni anno nuovi ragazzi e ragazze si avvicinano al mercatino per dare il loro contributo.</b> Il progetto offre un importante aiuto alle famiglie in difficoltà abbassando il più possibile i costi legati all'istruzione. Questa missione è di fatto il comune denominatore tra tutti i ragazzi/e che, negli anni, hanno contribuito alla realizzazione di ogni edizione. <br /><br />
<b>Il Mercatino per molti è un luogo di aggregazione, un crocevia di studenti e studentesse</b> che si sono incontrati nella volontà comune di dare un servizio alla comunità. Questo ci rende un gruppo di amici oltre che associazione.Cerchiamo di includere ogni nuovo volontario nella speranza di vedere il progetto crescere, stando bene insieme. <br /><br />
Durante tutto l'anno <b>ci impegniamo ad ampliare e migliorare il servizio con progetti satellite</b> che condividono gli obiettivi con quello principale. Inoltre, molti altri progetti abitano lo spazio giovani di Via Cassoli 1. Numerosi sono stati i volontari e le volontarie che hanno conosciuto lo spazio per mezzo delMercatino e sono rimasti per altri progetti e viceversa. <br /><br />
<b>Qualora tu sia interessato a svolgere una attività costruttiva, formativa e divertente</b> per il riconoscimento di crediti formativi, come alternanza scuola lavoro o semplicemente per dare il tuo contributo <b>ti invitiamo a scriverci a <a href='mailto:mercatino@thespots-re.it'>mercatino@thespots-re.it</a>.</b>`;

export const RE_RETAIL_POINT: Prisma.RetailLocationCreateInput = {
  id: "re",
  name: "Reggio Emilia",
  email: "info@ilmercatinodellibro.com",
  facebookLink: "https://www.facebook.com/IlMercatinoDelLibroRE/",
  instagramLink: "https://www.instagram.com/ilmercatinodellibrore/",
  fullAddress: "Via Francesco Cassoli, 1, 42123 Reggio Emilia RE",
  whoAreWeContent: RE_WHO_ARE_WE,
  joinUsContent: RE_JOIN_US,
  phoneNumber: "3516215189",
  theme: {
    primary: "#798aa8",
    secondary: "#76e1a7",
    accent: "#c2664d",
  } satisfies Theme,
};

export const MO_RETAIL_POINT: Prisma.RetailLocationCreateInput = {
  id: "mo",
  name: "Modena",
  email: " info-mo@ilmercatinodellibro.com",
  facebookLink: "https://www.facebook.com/IlMercatinoDelLibroMO/",
  instagramLink: "https://www.instagram.com/ilmercatinodellibromo/",
  fullAddress: "Strada Nazionale Canaletto Sud, 43L, 41121 - Modena MO",
  whoAreWeContent: RE_WHO_ARE_WE,
  joinUsContent: RE_JOIN_US,
  phoneNumber: "3515472756",
  theme: {
    primary: "#1f7472",
    secondary: "#76e1a7",
    accent: "#e2a615",
  } satisfies Theme,
};

export default [MO_RETAIL_POINT, RE_RETAIL_POINT];
