import type { Prisma } from "@prisma/client";
import type { Theme } from "src/modules/retail-location/theme.args";

const IT_WHO_ARE_WE = `Il Mercatino del Libro è un progetto nato nel 2013 e portato avanti negli anni da diverse associazioni di Reggio Emilia. A partire dal 2019 il progetto è promosso dal <b>Comune di Reggio Emilia</b> che ne ha permesso lo svolgimento all'interno dello spazio giovani di <b> <a href="https://maps.app.goo.gl/KhNMGXo12Xci1Pwn8">Via Cassoli 1</a></b>. Attualmente il progetto è portato avanti dall'associazione <b>The Spots</b>, capofila della rete di associazioni giovanili che abitano lo spazio comunale.<br /><br />
Il Mercatino del Libro si occupa di compravendita di testi scolastici destinati a istituti superiori di primo e secondo grado. <b>I libri sono ritirati in conto vendita, e venduti al 55% del prezzo di copertina. Alla fine di ogni edizione vengono restituiti agli utenti i libri invenduti e parte dei profitti derivati dalla vendita, pari al 30% del prezzo di copertina.</b> <br /><br />
Il margine di guadagno del mercatino del libro viene utilizzato per garantire la continuità del progetto negli anni successivi, investendo il surplus in progetti legati all'istruzione e alle politiche giovanili. Negli anni, il progetto è stato realizzato da studenti o giovani lavoratori tra i 16 e i 25 che in forma volontaria hanno condiviso i valori di mutuo soccorso tra studenti e libero accesso all'istruzione.<br /><br />
A partire dall'edizione 2022, il Mercatino del Libro ha aperto una <b>seconda sede a Modena all'interno dello  <a href="https://maps.app.goo.gl/VYRVDBk88QmskhDY6">Spazio Happen</a></b> in via Strada Nazionale Canaletto sud, 43L gestito dalla <b>Cooperativa Sociale Aliante</b>. La cooperativa ha lo scopo di perseguire l'interesse generale della comunità alla promozione umana e all'integrazione sociale dei cittadini attraverso la gestione di servizi di supporto, assistenziali, socio-sanitari ed educativi.`;

const IT_JOIN_US = `<b>Ogni anno nuovi ragazzi e ragazze si avvicinano al mercatino per dare il loro contributo.</b> Il progetto offre un importante aiuto alle famiglie in difficoltà abbassando il più possibile i costi legati all'istruzione. Questa missione è di fatto il comune denominatore tra tutti i ragazzi/e che, negli anni, hanno contribuito alla realizzazione di ogni edizione. <br /><br />
<b>Il Mercatino per molti è un luogo di aggregazione, un crocevia di studenti e studentesse</b> che si sono incontrati nella volontà comune di dare un servizio alla comunità. Questo ci rende un gruppo di amici oltre che associazione. Cerchiamo di includere ogni nuovo volontario nella speranza di vedere il progetto crescere, stando bene insieme. <br /><br />
Durante tutto l'anno <b>ci impegniamo ad ampliare e migliorare il servizio con progetti satellite</b> che condividono gli obiettivi con quello principale. Inoltre, molti altri progetti abitano lo spazio giovani di Via Cassoli 1. Numerosi sono stati i volontari e le volontarie che hanno conosciuto lo spazio per mezzo delMercatino e sono rimasti per altri progetti e viceversa. <br /><br />
<b>Qualora tu sia interessato a svolgere una attività costruttiva, formativa e divertente</b> per il riconoscimento di crediti formativi, come alternanza scuola lavoro o semplicemente per dare il tuo contributo <b>ti invitiamo a scriverci a  <a href='mailto:mercatino@thespots-re.it'>mercatino@thespots-re.it</a>.</b>`;

//TODO: add correct link to the Terms & Service page inside the HTMLs
const IT_RE_FAQ = `<section>
  <p>
    <span style="font-size: 14pt"
      ><strong
        ><span style="text-decoration: underline">IMPORTANTE!</span> Per
        comprare/vendere libri, è consigliato prendere appuntamento. Sarà
        possibile farlo tramite mail, Facebook, Instagram e telefono.<br /></strong
    ></span>
  </p>
  <p>&nbsp;</p>
  <p>
    <strong> Dove vi trovate?&nbsp;</strong>In via Cassoli 1, vicino a dove
    viale Umberto I si immette sulla circonvallazione. Digita "il Mercatino del
    Libro RE" su Google Maps, ci trovi con tanto di giorni e orari di apertura.
    Clicca  <a href="https://goo.gl/maps/82bJmFoHRbnUuKWy9" rel="alternate">qui</a
    > per vedere la mappa!
  </p>
  <p>
    <strong> A che piano siete?&nbsp</strong>Piano terra, per la vostra comodità :)
  </p>
  <p>
    <strong> Giorni e orari di apertura?&nbsp;</strong>Martedì, mercoledì,
    venerdì e sabato dalle 10.00 alle 13.00 e dalle 15.30 alle 18.30
  </p>
  <p>
    <strong> Come posso contattarvi?&nbsp;</strong>Chiamando il numero 351
    547&nbsp;2756&nbsp;<span style="text-decoration: underline"
      >ESCLUSIVAMENTE</span
    > nei giorni e negli orari di apertura. Per tutto il resto del tempo puoi
    scriverci un messaggio whatsapp, un'email a <span
      id="cloak0993b6811ec28c721437850d4375ab4a"
      > <a href="mailto:info@ilmercatinodellibro.com"
        >info@ilmercatinodellibro.com</a
      ></span
    >&nbsp;o contattarci su <a
      href="https://www.facebook.com/IlMercatinoDelLibroRE/"
      rel="alternate"
      >Facebook</a
    >&nbsp;o&nbsp;<a
      href="https://www.instagram.com/ilmercatinodellibrore/"
      rel="alternate"
      >Instagram</a
    >.
  </p>
  <p>
    <strong> Cosa posso fare da voi?&nbsp;</strong>Comprare libri scolastici
    usati al 55% del prezzo di copertina e lasciarci in conto deposito i vostri
    libri. Nel caso vengano venduti guadagnerete il 30% del prezzo di copertina.
  </p>
  <p>
    <strong> Quali libri avete/accettate?&nbsp;</strong>Solo libri scolastici
    di medie e, prevalentemente, superiori. Per essere accettati i vostri libri
    devono essere in buone condizioni (copertina intatta, no pagine mancanti, no
    scarabocchi...), essere completi (ad es. contenere in allegato il rispettivo
    CD ROM o altro materiale previsto) ed essere in adozione per l'anno
    prossimo.
  </p>
  <p><strong> Avete anche libri di nuova adozione?&nbsp;</strong>NO</p>
  <p>
    <strong> Qual è la prima cosa che devo fare?&nbsp;</strong>Creare un utente
    registrandosi sul nostro sito  <a
      href="https://www.ilmercatinodellibro.com/"
      rel="alternate"
      >www.ilmercatinodellibro.com</a
    >, direttamente da casa o in sede.
  </p>
  <p>
    <strong> Mi conviene creare l'utente da casa?&nbsp;</strong>ASSOLUTAMENTE
    SI'. Si risparmia tempo in sede e già da casa si possono controllare i libri
    che abbiamo in magazzino, mandare le richieste di libri ancora non presenti,
    prenotare libri che abbiamo in magazzino, controllare quali libri accettiamo
    e quali no.&nbsp;<br />Durante la registrazione è fondamentale
    accettare<span
      > i  <a
        href="/tos-privacy/tos-re.pdf"
        rel="alternate"
        >Termini e condizioni di utilizzo</a
      > e i cookies&nbsp;</span
    > ("I agree").
  </p>
  <p>
    <strong
      >Ho fatto la registrazione ma non riesco ad accedere, cosa
      succede?&nbsp;</strong
    >Controllate di avere cliccato sul link di attivazione che vi abbiamo inviato via mail.
  </p>
  <p>
    <strong> Come so per certo che sono registrato?&nbsp;</strong> Deve arrivare
    una email di conferma con un link di attivazione.
  </p>
  <p>
    <strong
      >Mi sono registrato ma non ho ricevuto l'email di conferma, cosa
      faccio?&nbsp;</strong
    >Prova a&nbsp;controllare tra lo spam.
  </p>
  <p>
    <strong> Ora che mi sono registrato, cosa faccio?&nbsp;</strong> Accedi
    inserendo Nome Utente (che non sempre coincide con il tuo nome e cognome,
    dipende da cosa hai inserito durante la registrazione!) e password, clicca
    su PROCEDI e apparirà la schermata con tutte le sezioni e le attività da
    poter fare.
  </p>
  <p>
    <strong
      >Come so che i libri da me richiesti sono
      disponibili/arrivati?&nbsp;</strong
    >Dovrai entrare sul tuo profilo utente e
    controllare periodicamente la lista dei libri richiesti. Quando un libro è
    disponibile nel nostro magazzino lo stato del libro sarà&nbsp; "disponibile"
    con la scritta colorata di verde. Non possiamo prevedere quali libri ci arriveranno nel corso delle
    settimane. Ad inizio mercatino, è� possibile che quello che
    stai cercando ma che ancora non c'è arrivi fra poco!
  </p>
  <p>
    <strong
      >Cosa faccio se alcuni dei miei libri richiesti sono
      disponibili?&nbsp;</strong
    >Prenotali! O vieni a ritirarli il prima possibile. In quest'ultimo caso
    (ovvero senza prenotazione) non possiamo però assicurarti che rimarranno in
    magazzino fino al tuo arrivo, nel frattempo potrebbe essere arrivato un
    acquirente prima di te.
  </p>
  <p>
    <strong
      >I libri richiesti e i libri prenotati sono la stessa cosa?&nbsp;</strong
    >Assolutamente no! I libri richiesti corrispondono ai libri della tua lista
    che stai cercando da noi. Se sono disponibili (quindi con la barra verde)
    NON sono automaticamente tuoi: per fare ciò devi prenotarli e venirli a
    ritirare da noi entro la scadenza.
  </p>
  <p>
    <strong> Quali sono le scadenze per le prenotazioni?</strong> La
    prenotazione dura 3&nbsp;giorni (anche non lavorativi).
  </p>
</section>
<div class="gap-16 row no-wrap">
  <div class="col">
    <article>
      <header>
        <h3 itemprop="headline">
          Riapertura<meta
            itemprop="url"
            content="https://re.ilmercatinodellibro.com/2-uncategorised/1-riapertura"
          />
        </h3>
      </header>
      <section>
        <p>
          <span> Anche quest’anno riapre</span
          ><i
            ><span> Il Mercatino del Libro RE!<br /></span></i
          ><span
            >I giorni di apertura<strong> sono rimasti gli stessi</strong> dello
            scorso anno: martedì, mercoledì, venerdì e sabato, al mattino</span
          ><b> dalle 10.00 alle 13.00</b><span> e al pomeriggio</span
          ><b> dalle 15.30 alle 18.30</b><span>.<br /></span>
        </p>
        <p>&nbsp;</p>
        <p>
          <span> I termini non cambiano:</span><b> acquisto al 55%</b
          ><span> del prezzo di copertina e</span><b> vendita al 30%</b
          ><span>.</span>
        </p>
        <p>
          <span> Nella settimana<strong> dal 17 al 28</strong></span
          ><b> settembre</b
          ><span
            >&nbsp;saremo aperti&nbsp;con orario ridotto per le riconsegna dei
            libri invenduti e dell’eventuale guadagno.</span
          >
        </p>
        <p>&nbsp;</p>
        <p>
          <span
            >Quest'anno la location è la<strong> stessa</strong> dello scorso
            anno:</span
          ><span
            >&nbsp;ci troverete in <a
              href="https://goo.gl/maps/82bJmFoHRbnUuKWy9"
              rel="alternate"
              >Via Francesco Cassoli, 1, 42123 Reggio Emilia RE</a
            >.</span
          >
        </p>
        <p>
          <span> I periodi d’apertura sono</span
          ><b> dal 16 luglio al 3 agosto</b><span> &nbsp;e dal</span
          ><b> 20 agosto al 14 settembre</b> nelle giornate di <b>martedì, mercoledì, venerdì e sabato, dalle 10:00 alle 13:00 e dalle 15:30 alle 18:30</b><span>.
          Dal 17 al 28 settembre saremo aperti il martedì e venerdì  pomeriggio, e il mercoledì e il sabato mattina</span>
        </p>
      </section>
    </article>
  </div>
  <div class="col">
    <article>
      <header>
        <h3 itemprop="headline">
          Indicazioni per la registrazione<meta
            itemprop="url"
            content="https://re.ilmercatinodellibro.com/2-uncategorised/3-indicazioni-per-la-registrazione"
          />
        </h3>
      </header>
      <section>
        <p>
          Quest'anno la nostra sede continua a essere lo spazio giovanile di <a
            href="https://www.facebook.com/viacassoliuno/"
            rel="alternate"
            > #ViaCassoliUno</a
          >!&nbsp;<br />Ci trovate in<strong> Via Cassoli 1</strong>,<strong>
            sulla</strong
          ><b
            >&nbsp;circonvallazione&nbsp;vicino l'incrocio&nbsp;di&nbsp;viale
            Umberto I</b
          >.<br />Ancora più precisamente: <a
            href="https://goo.gl/maps/tTbjyUBBRYV2Nh5QA"
            rel="alternate"
            >qua</a
          >.
        </p>
        <p>
          Dal 2023 <strong
            >non viene più richiesta la quota di iscrizione iniziale</strong
          > di 2 euro.<br />Dovrete effettuare la<strong> registrazione</strong>
          ai nostri servizi direttamente <strong>online da casa vostra</strong>, ciò vi permetterà
          di risparmiare tempo ed energie: una volta registrati potrete infatti
          controllare comodamente da casa vostra quali libri abbiamo in
          magazzino e di conseguenza inviarci le vostre richieste, oltre a
          controllare quali libri accettiamo e quali no.
        </p>
        <p>
          Ricordatevi sempre di accettare i <a
            href="/tos-privacy/tos-re.pdf"
            rel="alternate"
            >Termini e condizioni di utilizzo</a
          > e i cookies!
        </p>
        <p>Vi aspettiamo,</p>
        <p><em> Lo staff de Il Mercatino del Libro RE</em></p>
      </section>
    </article>
  </div>
</div>
`;

const IT_MO_FAQ = `<section class="article-intro clearfix">
  <p>
    <b> Dove vi trovate?</b
    ><span>
      Presso Happen, in Strada Nazionale Canaletto Sud 43L a Modena. Digita
      “Happen Modena” su Google Maps o clicca</span
    > <a
      href="https://www.google.it/maps/place/HAPPEN/@44.6550707,10.9305737,17z/data=!4m12!1m6!3m5!1s0x477fef1884c0a2af:0xb15bfa095aa59aa6!2sHAPPEN!8m2!3d44.6546804!4d10.9326746!3m4!1s0x477fef1884c0a2af:0xb15bfa095aa59aa6!8m2!3d44.6546804!4d10.9326746"
      ><span> qui</span></a
    ><span> per vedere la mappa!</span>
  </p>
  <p>
    <b> Giorni e orari di apertura?</b
    ><span>
      Lunedì, mercoledì e venerdì dalle 10.00 alle 12.00 e dalle 15.00 alle 19.00
      dal 15 luglio al 2 agosto e dal 19 agosto al 13 settembre. Nelle settimane dal 16 al 27 settembre saremo
      aperti il lunedì e venerdì mattina, mentre il giovedì saremo aperti durante il pomeriggio.<br
    /></span>
  </p>
  <p>
    <b> Come posso contattarvi?</b><span> Chiamando il numero 351 621 5189</span
    ><span> ESCLUSIVAMENTE</span
    ><span>
      nei giorni e negli orari di apertura. Per tutto il resto del tempo puoi
      scriverci un messaggio whatsapp, una mail a</span
    ><span id="cloak4ce7dfb3d815b39ca7e0f71ef60863ec"
      > <a href="mailto:info-mo@ilmercatinodellibro.com"
        ><span> info-mo@ilmercatinodellibro.com</span></a
      ></span
    ><span> o contattarci su</span
    > <a href="https://www.facebook.com/IlMercatinoDelLibroMO/"
      ><span> Facebook</span></a
    ><span> o</span
    > <a href="https://www.instagram.com/ilmercatinodellibromo/"
      ><span> Instagram</span></a
    ><span>.</span>
  </p>
  <p>
    <b> Cosa posso fare da voi?</b
    ><span>
      Comprare libri scolastici usati al 55% del prezzo di copertina e lasciarci
      in conto deposito i vostri libri. Nel caso vengano venduti guadagnerete il
      30% del prezzo di copertina.</span
    >
  </p>
  <p>
    <b> Quali libri avete/accettate?</b
    ><span>
      Solo libri scolastici di medie e, prevalentemente, superiori. Per essere
      accettati i vostri libri devono essere in buone condizioni (copertina
      intatta, no pagine mancanti, no scarabocchi...), essere completi (ad es.
      contenere in allegato il rispettivo CD ROM o altro materiale previsto) ed
      essere in adozione per l'anno prossimo.</span
    >
  </p>
  <p><b> Avete anche libri di nuova adozione?</b><span> NO</span></p>
  <p>
    <b> Qual è la prima cosa che devo fare?</b
    ><span> Creare un utente registrandosi sul nostro sito</span
    > <a href="https://www.ilmercatinodellibro.com/"
      ><span> mo.ilmercatinodellibro.com</span></a
    ><span>, direttamente da casa o in sede.</span>
  </p>
  <p>
    <b> Mi conviene creare l'utente da casa?</b
    ><span>
      ASSOLUTAMENTE SI'. Si risparmia tempo in sede e già da casa si possono
      controllare i libri che abbiamo in magazzino, mandare le richieste di
      libri ancora non presenti, prenotare libri che abbiamo in magazzino,
      controllare quali libri accettiamo e quali no.&nbsp;</span
    >
  </p>
  <p>
    <span> Durante la registrazione è fondamentale accettare</span
    ><span>
      i <a
        href="/tos-privacy/tos-mo.pdf"
        rel="alternate"
      >
        Termini e condizioni di utilizzo</a
      >
      e i cookies</span
    ><span> ("I agree").</span>
  </p>
  <p>
    <b> Ho fatto la registrazione ma non riesco ad accedere, cosa succede?</b
    ><span> Controllate di avere accettato i cookie.</span>
  </p>
  <p>
    <b> Come so per certo che sono registrato?</b
    ><span>
      Deve arrivare una email di conferma con un link di attivazione.</span
    >
  </p>
  <p>
    <b>
      Mi sono registrato ma non ho ricevuto l'email di conferma, cosa faccio?</b
    ><span> Prova a controllare tra lo spam.</span>
  </p>
  <p>
    <b> Ora che mi sono registrato, cosa faccio?</b
    ><span>
      Accedi inserendo Nome Utente (che non sempre coincide con il tuo nome e
      cognome, dipende da cosa hai inserito durante la registrazione!) e
      password, clicca su PROCEDI e apparirà la schermata con tutte le sezioni e
      le attività da poter fare.</span
    >
  </p>
  <p>
    <b> Come so che i libri da me richiesti sono disponibili/arrivati?</b
    ><span>
      Non riceverai nessuna email, dovrai entrare sul tuo profilo utente e
      controllare periodicamente la lista dei libri richiesti. Quando un libro è
      disponibile nel nostro magazzino la barra del libro sarà completamente
      verde. Non possiamo prevedere quali libri ci arriveranno nel corso delle
      settimane e siamo solo a inizio mercatino quindi è possibile che quello
      che stai cercando ma che ancora non c'è arrivi fra poco!</span
    >
  </p>
  <p>
    <b> Cosa faccio se alcuni dei miei libri richiesti sono disponibili?</b
    ><span>
      Prenotali! O vieni a ritirarli il prima possibile. In quest'ultimo caso
      (ovvero senza prenotazione) non possiamo però assicurarti che rimarranno
      in magazzino fino al tuo arrivo, nel frattempo potrebbe essere arrivato un
      acquirente prima di te.</span
    >
  </p>
  <p>
    <b> I libri richiesti e i libri prenotati sono la stessa cosa?</b
    ><span>
      Assolutamente no! I libri richiesti corrispondono ai libri della tua lista
      che stai cercando da noi. Se sono disponibili (quindi con la barra verde)
      NON sono automaticamente tuoi: per fare ciò devi prenotarli e venirli a
      ritirare da noi entro la scadenza.</span
    >
  </p>
  <p>
    <b> Quali sono le scadenze per le prenotazioni?</b
    ><span> La prenotazione dura 3 giorni (anche non lavorativi).</span>
  </p>
</section>
`;

interface RetailLocationInfo {
  whoAreWeContent: string;
  joinUsContent: string;
  faqContent: string;
}

type Locales = "it" | "en-US";

type TranslatedRetailLocationCreateInput = Prisma.RetailLocationCreateInput & {
  infoPagesContent: Record<Locales, RetailLocationInfo>;
};

export const RE_RETAIL_POINT: TranslatedRetailLocationCreateInput = {
  id: "re",
  name: "Reggio Emilia",
  email: "info@ilmercatinodellibro.com",
  facebookLink: "https://www.facebook.com/IlMercatinoDelLibroRE/",
  instagramLink: "https://www.instagram.com/ilmercatinodellibrore/",
  fullAddress: "Via Francesco Cassoli, 1, 42123 Reggio Emilia RE",
  infoPagesContent: {
    it: {
      faqContent: IT_RE_FAQ,
      joinUsContent: IT_JOIN_US,
      whoAreWeContent: IT_WHO_ARE_WE,
    },
    "en-US": {
      faqContent: IT_RE_FAQ,
      joinUsContent: IT_JOIN_US,
      whoAreWeContent: IT_WHO_ARE_WE,
    },
  },
  phoneNumber: "3515472756",
  theme: {
    colors: {
      primary: "#798aa8",
      secondary: "#76e1a7",
      accent: "#c2664d",
    },
    // TODO: THis image is saved on client side since right now we do not support custom theme
    // in the future consider seeding the images in the DB too
    logo: "logo-reggio-emilia.svg",
  } satisfies Theme,
};

export const MO_RETAIL_POINT: TranslatedRetailLocationCreateInput = {
  id: "mo",
  name: "Modena",
  email: " info-mo@ilmercatinodellibro.com",
  facebookLink: "https://www.facebook.com/IlMercatinoDelLibroMO/",
  instagramLink: "https://www.instagram.com/ilmercatinodellibromo/",
  fullAddress: "Strada Nazionale Canaletto Sud, 43L, 41121 - Modena MO",
  infoPagesContent: {
    it: {
      faqContent: IT_MO_FAQ,
      joinUsContent: IT_JOIN_US,
      whoAreWeContent: IT_WHO_ARE_WE,
    },
    "en-US": {
      faqContent: IT_MO_FAQ,
      joinUsContent: IT_JOIN_US,
      whoAreWeContent: IT_WHO_ARE_WE,
    },
  },
  phoneNumber: "3516215189",
  theme: {
    colors: {
      primary: "#1f7472",
      secondary: "#76e1a7",
      accent: "#e2a615",
    },
    // TODO: THis image is saved on client side since right now we do not support custom theme
    // in the future consider seeding the images in the DB too
    logo: "logo-modena.svg",
  } satisfies Theme,
};

export default [MO_RETAIL_POINT, RE_RETAIL_POINT];
