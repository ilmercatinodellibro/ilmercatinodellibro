import type { Prisma } from "@prisma/client";

const RE_WHO_ARE_WE = `Il Mercatino del Libro è un progetto nato nel 2013 e portato avanti negli anni da diverse associazioni di Reggio Emilia. A partire dal 2019 il progetto è promosso dal Comune di Reggio Emilia che ne ha permesso lo svolgimento all’interno dello spazio giovani di Via Cassoli 1. Attualmente il progetto è portato avanti dall’associazione The Spots, capofila della rete di associazioni giovanili che abitano lo spazio comunale.\n
Il Mercatino del Libro si occupa di compravendita di testi scolastici destinati a istituti superiori di primo e secondo grado. I libri sono ritirati in conto vendita, e venduti al 55% del prezzo di copertina. Alla fine di ogni edizione vengono restituiti agli utenti i libri invenduti e parte dei profitti derivati dalla vendita, pari al 30% del prezzo di copertina.\n
Il margine di guadagno del mercatino del libro viene utilizzato per garantire la continuità del progetto negli anni successivi, investendo il surplus in progetti legati all’istruzione e alle politiche giovanili. Negli anni, il progetto è stato realizzato da studenti o giovani lavoratori tra i 16 e i 25 che in forma volontaria hanno condiviso i valori di mutuo soccorso tra studenti e libero accesso all’istruzione.\n
A partire dall’edizione 2022, il Mercatino del Libro ha aperto una seconda sede a Modena all'interno dello Spazio Happen in via Strada Nazionale Canaletto sud, 43L gestito dalla Cooperativa Sociale Aliante. La cooperativa ha lo scopo di perseguire l'interesse generale della comunità alla promozione umana e all'integrazione sociale dei cittadini attraverso la gestione di servizi di supporto, assistenziali, socio-sanitari ed educativi.`;

const RE_JOIN_US = `Ogni anno nuovi ragazzi e ragazze si avvicinano al mercatino per dare il loro contributo. Il progetto offre un importante aiuto alle famiglie in difficoltà abbassando il più possibile i costi legati all’istruzione. Questa missione è di fatto il comune denominatore tra tutti i ragazzi/e che, negli anni, hanno contribuito alla realizzazione di ogni edizione.\n
Il Mercatino per molti è un luogo di aggregazione, un crocevia di studenti e studentesse che si sono incontrati nella volontà comune di dare un servizio alla comunità. Questo ci rende un gruppo di amici oltre che associazione. Cerchiamo di includere ogni nuovo volontario nella speranza di vedere il progetto crescere, stando bene insieme.\n
Durante tutto l'anno ci impegniamo ad ampliare e migliorare il servizio con progetti satellite che condividono gli obiettivi con quello principale. Inoltre, molti altri progetti abitano lo spazio giovani di Via Cassoli 1. Numerosi sono stati i volontari e le volontarie che hanno conosciuto lo spazio per mezzo del Mercatino e sono rimasti per altri progetti e viceversa.\n
Qualora tu sia interessato a svolgere una attività costruttiva, formativa e divertente per il riconoscimento di crediti formativi, come alternanza scuola lavoro o semplicemente per dare il tuo contributo ti invitiamo a scriverci a mercatino@thespots-re.it.`;

export const RE_RETAIL_POINT: Prisma.RetailLocationCreateInput = {
  name: "Il Mercatino del Libro",
  email: "info@ilmercatinodellibro.com",
  facebookLink: "https://www.facebook.com/IlMercatinoDelLibroRE/",
  instagramLink: "https://www.instagram.com/ilmercatinodellibrore/",
  fullAddress: "Via Francesco Cassoli, 1, 42123 Reggio Emilia RE",
  humanReadableId: "re01",
  whoAreWeContent: RE_WHO_ARE_WE,
  joinUsContent: RE_JOIN_US,
};

export const MO_RETAIL_POINT: Prisma.RetailLocationCreateInput = {
  name: "Il Mercatino del Libro - MO",
  email: "info.mo@ilmercatinodellibro.com",
  facebookLink: "https://www.facebook.com/IlMercatinoDelLibroRE/",
  instagramLink: "https://www.instagram.com/ilmercatinodellibrore/",
  fullAddress: "Boh che ne so - Modena MO",
  humanReadableId: "mo01",
  whoAreWeContent: RE_WHO_ARE_WE,
  joinUsContent: RE_JOIN_US,
};

export default [MO_RETAIL_POINT, RE_RETAIL_POINT];
