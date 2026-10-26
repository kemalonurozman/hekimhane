// ─────────────────────────────────────────────────────────────────
//  Blog konu havuzu — sıradaki hastalık yazılarının başlık listesi.
//
//  Sitede gösterilmez; yazı planlamak için tutulur. Yazılan konu blog
//  dizisine (lib/blog-saglik/<slug>.ts) eklenince `yazildi()` onu otomatik
//  "yazıldı" sayar (slug eşleşmesi). Yeni konu eklerken:
//    [başlık, kategori, branş (önerilen; yazarken doktorlar.spec'te birebir var mı bak), öncelik, not?]
//  Öncelik: 1 = sık aranan/yaygın, 2 = orta, 3 = nadir ya da çok uzmanlık gerektiren.
//  Tekrar eden ya da aynı yazıda anlatılacak başlıklar `not` alanında birleştirildi.
//  Başka sitelerin adı veya adresi bu dosyada ve blogda KULLANILMAZ.
// ─────────────────────────────────────────────────────────────────
import { makaleSlug } from './makale-icerik';

export type KonuOncelik = 1 | 2 | 3;
export interface HavuzKonu {
  baslik: string;
  slug: string;
  kategori: string;
  brans: string;
  oncelik: KonuOncelik;
  not?: string;
}

type Satir = [string, string, string, KonuOncelik, string?];

const KBB = 'Kulak Burun Boğaz Hastalıkları';
const DAH = 'İç Hastalıkları';
const GAS = 'Gastroenteroloji';
const GC = 'Genel Cerrahi';
const KAD = 'Kadın Hastalıkları ve Doğum';
const URO = 'Üroloji';
const NEF = 'Nefroloji';
const NOR = 'Nöroloji';
const PSI = 'Psikiyatri';
const DER = 'Dermatoloji';
const ORT = 'Ortopedi ve Travmatoloji';
const COC = 'Çocuk Sağlığı ve Hastalıkları';
const END = 'Endokrinoloji ve Metabolizma Hastalıkları';
const ENF = 'Enfeksiyon Hastalıkları ve Klinik Mikrobiyoloji';
const KAR = 'Kardiyoloji';
const KDC = 'Kalp ve Damar Cerrahisi';
const GOG = 'Göğüs Hastalıkları';
const HEM = 'Hematoloji';
const ONK = 'Tıbbi Onkoloji';
const BSC = 'Beyin ve Sinir Cerrahisi';
const PLS = 'Plastik Rekonstrüktif ve Estetik Cerrahi';
const GOZ = 'Göz Hastalıkları';
const ROM = 'Romatoloji';
const FTR = 'Fiziksel Tıp ve Rehabilitasyon';

const SATIRLAR: Satir[] = [
  // ── Kalp ve damar ──
  ['Abdominal Aort Anevrizması', 'Kalp ve Damar', KDC, 2],
  ['Damar Sertliği (Ateroskleroz)', 'Kalp ve Damar', KAR, 1],
  ['Damar Anomalileri (Vasküler Malformasyonlar)', 'Kalp ve Damar', KDC, 3, 'Damarsal anormallikler'],
  ['Atriyal Fibrilasyon (Ritim Bozukluğu)', 'Kalp ve Damar', KAR, 1, 'Fibrilasyon'],
  ['Ekstrasistol (Kalpte Tekleme)', 'Kalp ve Damar', KAR, 1],
  ['Çarpıntı ve Taşikardi', 'Kalp ve Damar', KAR, 1, 'Kalbin hızlı atması, Taşikardi'],
  ['Sağ Kalp Yetmezliği', 'Kalp ve Damar', KAR, 2],
  ['Tansiyon Düşüklüğü (Hipotansiyon)', 'Kalp ve Damar', KAR, 1],
  ['Varis', 'Kalp ve Damar', KDC, 1],
  ['Venöz Ülser (Varis Yarası)', 'Kalp ve Damar', KDC, 2, 'Varis ülseri, Venöz ülser'],
  ['Raynaud Hastalığı', 'Kalp ve Damar', ROM, 2],
  ['Vaskülit', 'Kalp ve Damar', ROM, 2],
  ['Takayasu Arteriti', 'Kalp ve Damar', ROM, 3],
  ['Wegener Granülomatozu (Granülomatöz Polianjiit)', 'Kalp ve Damar', ROM, 3],
  ['Fallot Tetralojisi', 'Çocuk Sağlığı', 'Çocuk Kardiyolojisi', 3],
  ['Ventriküler Septal Defekt (VSD)', 'Çocuk Sağlığı', 'Çocuk Kardiyolojisi', 2],
  ['Lenfödem (Fil Hastalığı)', 'Kalp ve Damar', KDC, 2],
  ['Lenfanjit', 'Kalp ve Damar', ENF, 3],

  // ── Ağız, KBB ──
  ['Acı Ağız Sendromu (Yanan Ağız Sendromu)', 'Kulak Burun Boğaz', KBB, 3],
  ['Adenoid (Geniz Eti)', 'Kulak Burun Boğaz', KBB, 1],
  ['Bademcik Hastalıkları ve Bademcik Ameliyatı', 'Kulak Burun Boğaz', KBB, 1],
  ['Faranjit (Boğaz Enfeksiyonu)', 'Kulak Burun Boğaz', KBB, 1],
  ['Eksternal Otit (Dış Kulak Yolu İltihabı)', 'Kulak Burun Boğaz', KBB, 2],
  ['Nazal Polip (Burun Polipi)', 'Kulak Burun Boğaz', KBB, 1],
  ['Nazal Valv Yetmezliği', 'Kulak Burun Boğaz', KBB, 3],
  ['Nazofarenks Kanseri', 'Onkoloji', KBB, 3, 'Nazofarenks'],
  ['Nezle (Soğuk Algınlığı)', 'Kulak Burun Boğaz', DAH, 1],
  ['İşitme Kaybı ve Sağırlık', 'Kulak Burun Boğaz', KBB, 1, 'Sağırlık'],
  ['Ağız Kanseri', 'Onkoloji', KBB, 2, 'Ağız boşluğu kanseri'],
  ['Aft', 'Kulak Burun Boğaz', DER, 1],
  ['Pamukçuk', 'Kulak Burun Boğaz', COC, 1],
  ['Damak Yarığı ve Tavşan Dudak', 'Çocuk Sağlığı', PLS, 2, 'Damak felci, Tavşan dudağı'],
  ['Kabakulak', 'Çocuk Sağlığı', COC, 2],
  ['Deniz ve Taşıt Tutması', 'Kulak Burun Boğaz', KBB, 2, 'Deniz tutması, Taşıt tutması'],

  // ── Endokrin ──
  ['Addison Hastalığı (Böbrek Üstü Bezi Yetmezliği)', 'Endokrin ve Metabolizma', END, 2, 'Adrenal yetmezlik'],
  ['Böbrek Üstü Bezi (Adrenal) Hastalıkları ve Kitleleri', 'Endokrin ve Metabolizma', END, 2, 'Adrenal gland hastalıkları, Adrenal hastalıklar'],
  ['Cushing Sendromu', 'Endokrin ve Metabolizma', END, 2],
  ['Feokromositom', 'Endokrin ve Metabolizma', END, 3],
  ['Adrenal Karsinom', 'Onkoloji', END, 3],
  ['Haşimato (Hashimoto) Hastalığı', 'Endokrin ve Metabolizma', END, 1, 'Haşimato, Hashimoto hastalığı'],
  ['Paratiroid Hastalıkları (Kalsiyum ve D Vitamini Bozuklukları)', 'Endokrin ve Metabolizma', END, 2],
  ['Paratiroid Kanseri', 'Onkoloji', END, 3],
  ['Galaktore ve Jinekomasti (Memede Süt Gelmesi, Erkekte Meme Büyümesi)', 'Endokrin ve Metabolizma', END, 2],
  ['Gecikmiş Ergenlik', 'Çocuk Sağlığı', 'Çocuk Endokrinolojisi', 2],
  ['Cinsel Gelişim Bozuklukları', 'Çocuk Sağlığı', 'Çocuk Endokrinolojisi', 3],
  ['Adipsi (Susama Duyusunun Kaybı)', 'Endokrin ve Metabolizma', END, 3],
  ['Obezite', 'Endokrin ve Metabolizma', END, 1],
  ['Zayıflık ve İstemsiz Kilo Kaybı', 'Endokrin ve Metabolizma', DAH, 2],
  ['Aşırı Terleme (Hiperhidroz)', 'Cilt Sağlığı', DER, 1, 'Terleme'],

  // ── Sindirim sistemi ve genel cerrahi ──
  ['Bağırsak Tıkanması ve Düğümlenmesi (İleus, Volvulus)', 'Genel Cerrahi', GC, 2, 'Bağırsak tıkanması, Bağırsak düğümlenmesi'],
  ['Bağırsak Delinmesi (Perforasyon)', 'Genel Cerrahi', GC, 3],
  ['Bağırsak Gazı ve Şişkinlik', 'Sindirim Sistemi', GAS, 1, 'Gaz sancısı, Gazlar, Hava yutma'],
  ['Kolit (Kalın Bağırsak İltihabı)', 'Sindirim Sistemi', GAS, 2, 'Bağırsak iltihabı'],
  ['Crohn Hastalığı', 'Sindirim Sistemi', GAS, 1],
  ['Bağırsak Kurtları ve Parazitler (Kıl Kurdu, Giardia)', 'Sindirim Sistemi', ENF, 1, 'Bağırsak solucanları, Oksiyüroz, Lambliyaz, Balantidiyaz, Parazit hastalıkları'],
  ['Bağırsakların Damar Hastalıkları (Mezenter İskemi)', 'Sindirim Sistemi', GC, 3],
  ['Barrett Özofagusu', 'Sindirim Sistemi', GAS, 2],
  ['Gastrit', 'Sindirim Sistemi', GAS, 1],
  ['Gastroenterit (Mide-Bağırsak Enfeksiyonu)', 'Sindirim Sistemi', GAS, 1],
  ['Sindirim Sistemi Kanaması ve Melena (Siyah Dışkı)', 'Sindirim Sistemi', GAS, 2, 'Gastrointestinal kanama, Melena'],
  ['Reflü (Gastroözofageal Reflü Hastalığı)', 'Sindirim Sistemi', GAS, 1],
  ['Gastroparezi (Mide Felci)', 'Sindirim Sistemi', GAS, 3],
  ['Helikobakter Pilori', 'Sindirim Sistemi', GAS, 1],
  ['Hazımsızlık (Dispepsi)', 'Sindirim Sistemi', GAS, 1],
  ['Kabızlık', 'Sindirim Sistemi', GAS, 1],
  ['Gaita Kaçırma (Dışkı İnkontinansı)', 'Sindirim Sistemi', GC, 2, 'Kaka kaçırma'],
  ['Laktoz İntoleransı', 'Sindirim Sistemi', GAS, 1],
  ['Megakolon', 'Sindirim Sistemi', GC, 3],
  ['Pankreatit (Pankreas İltihabı)', 'Sindirim Sistemi', GAS, 2, 'Pankreas hastalıkları, Pankreas iltihabı'],
  ['Pankreas Kanseri ve Pankreas Tümörleri', 'Onkoloji', GC, 2, 'Pankreas tümörü, Pankreas endokrin tümörü'],
  ['Safra Kesesi İltihabı (Kolesistit)', 'Genel Cerrahi', GC, 1, 'Safra kesesi hastalıkları'],
  ['Safra Yolu Hastalıkları (Darlık, Kist, Taş)', 'Sindirim Sistemi', GAS, 2, 'Safra yolu darlığı, Safra yolu kistleri'],
  ['Safra Kesesi ve Safra Yolu Kanserleri', 'Onkoloji', GC, 3],
  ['Yemek Borusu Daralması', 'Sindirim Sistemi', GAS, 2],
  ['Özofajit (Yemek Borusu İltihabı)', 'Sindirim Sistemi', GAS, 2, 'Yemek borusu yangılanması, Yemek borusu hastalıkları'],
  ['Yemek Borusu (Özofagus) Kanseri', 'Onkoloji', GAS, 2],
  ['Dalak Hastalıkları', 'Sindirim Sistemi', DAH, 3],
  ['Mediasten Hastalıkları ve Mediastinit', 'Alerji ve Akciğer', 'Göğüs Cerrahisi', 3],
  ['Karın Fıtıkları (Göbek ve Ameliyat Yeri Fıtığı)', 'Genel Cerrahi', GC, 1, 'Fıtık'],
  ['Lipom (Yağ Bezesi)', 'Genel Cerrahi', GC, 1, 'Lipomlar, Yağ bezesi'],
  ['Gazlı Gangren', 'Genel Cerrahi', ENF, 3],
  ['Bası Yarası (Dekübit)', 'Cilt Sağlığı', PLS, 2],
  ['Nekroz (Doku Ölümü)', 'Genel Cerrahi', GC, 3],

  // ── Karaciğer, hematoloji ──
  ['CMV Hepatiti', 'Sindirim Sistemi', ENF, 3],
  ['Hemokromatoz (Demir Birikimi)', 'Sindirim Sistemi', HEM, 2],
  ['Wilson Hastalığı', 'Sindirim Sistemi', GAS, 3],
  ['Demir Eksikliği Anemisi', 'Kan Hastalıkları', HEM, 1],
  ['Talasemi (Akdeniz Anemisi)', 'Kan Hastalıkları', HEM, 2],
  ['Hemofili', 'Kan Hastalıkları', HEM, 2],
  ['Faktör 7 Eksikliği', 'Kan Hastalıkları', HEM, 3],
  ['Febril Nötropeni', 'Kan Hastalıkları', HEM, 3],
  ['Kan Hastalıkları: Hangi Belirtide Hematoloğa Gidilir?', 'Kan Hastalıkları', HEM, 2, 'Hematolojik hastalıklar, Hematopoetik sistem tümörleri'],
  ['Hemoglobinüri (İdrarda Hemoglobin)', 'Böbrek ve Üroloji', HEM, 3],
  ['Lenf Bezi Şişmesi (Lenfadenit)', 'Kan Hastalıkları', DAH, 1, 'Adenit, Lenf bezi hastalıkları, Lenfadenit'],
  ['Bağışıklık Sistemi Bozuklukları (İmmün Yetmezlik)', 'Alerji ve Akciğer', 'Alerji Hastalıkları', 2, 'Bağışıklık sistemi problemleri'],

  // ── Enfeksiyon ──
  ['Adenovirüs Enfeksiyonu', 'Enfeksiyon', ENF, 2],
  ['Dang Humması', 'Enfeksiyon', ENF, 3],
  ['Leptospiroz', 'Enfeksiyon', ENF, 3],
  ['Malta Humması (Bruselloz)', 'Enfeksiyon', ENF, 2],
  ['Paratifo ve Tifo', 'Enfeksiyon', ENF, 3, 'Paratifo'],
  ['Papağan Hastalığı (Psittakoz)', 'Enfeksiyon', ENF, 3],
  ['Fare Isırığı Humması', 'Enfeksiyon', ENF, 3],
  ['Veba', 'Enfeksiyon', ENF, 3],
  ['Lepra (Cüzzam)', 'Enfeksiyon', DER, 3, 'Cüzzam, Lepra, Leproma'],
  ['Verem (Tüberküloz)', 'Enfeksiyon', GOG, 1],
  ['Zona Hastalığı', 'Enfeksiyon', DER, 1],
  ['Uçuk (Herpes)', 'Cilt Sağlığı', DER, 1],
  ['Uyuz', 'Cilt Sağlığı', DER, 1],
  ['Yılancık (Erizipel)', 'Cilt Sağlığı', DER, 2],
  ['Cinsel Yolla Bulaşan Hastalıklar', 'Enfeksiyon', ENF, 1],
  ['Mantar Enfeksiyonları (Cilt ve Tırnak)', 'Cilt Sağlığı', DER, 1, 'Mantar'],
  ['Deri Enfeksiyonları', 'Cilt Sağlığı', DER, 2, 'Deri enfeksiyon hastalıkları, Deri iltihabı'],
  ['Yılan Sokması: İlk Yardım', 'Enfeksiyon', 'Acil Tıp', 2],
  ['Örümcek ve Tarantula Isırması', 'Enfeksiyon', 'Acil Tıp', 3],
  ['Mantar Zehirlenmesi', 'Sindirim Sistemi', 'Acil Tıp', 2],

  // ── Akciğer ──
  ['Ağır KOAH ile Yaşamak', 'Alerji ve Akciğer', GOG, 2],
  ['Balgam: Rengi Ne Anlatır?', 'Alerji ve Akciğer', GOG, 2],
  ['Nefes Darlığı', 'Alerji ve Akciğer', GOG, 1],
  ['Çocukta Tekrarlayan Hışıltı', 'Çocuk Sağlığı', 'Çocuk Göğüs Hastalıkları', 2],
  ['Zatürre (Pnömoni)', 'Alerji ve Akciğer', GOG, 1, 'Zatülcenp'],

  // ── Nöroloji ──
  ['Afazi (Konuşma Kaybı)', 'Nöroloji', NOR, 2],
  ['İnme (Felç)', 'Nöroloji', NOR, 1, 'Felç'],
  ['Geçici İskemik Atak (Mini İnme)', 'Nöroloji', NOR, 2],
  ['Demans', 'Nöroloji', NOR, 1],
  ['Unutkanlık: Ne Zaman Endişelenmeli?', 'Nöroloji', NOR, 1],
  ['Deliryum (Akut Bilinç Bulanıklığı)', 'Nöroloji', NOR, 2],
  ['Hareket Bozuklukları (Titreme, Distoni)', 'Nöroloji', NOR, 2],
  ['Baş Ağrısı Türleri', 'Nöroloji', NOR, 1, 'R51 baş ağrısı'],
  ['Sinir Ağrıları ve Trigeminal Nevralji', 'Nöroloji', NOR, 2, 'Nevralji, Nevraljiler'],
  ['Nevrom', 'Nöroloji', BSC, 3],
  ['Narkolepsi', 'Nöroloji', NOR, 3],
  ['Kafa Travması', 'Nöroloji', BSC, 2, 'Kafatası travmaları'],
  ['Çocukta Havale (Febril Konvülziyon)', 'Çocuk Sağlığı', COC, 1, 'Havale'],
  ['Vagotoni (Vazovagal Bayılma)', 'Nöroloji', KAR, 2],

  // ── Omurga ──
  ['Omurga Enfeksiyonları', 'Kas ve İskelet', BSC, 3],
  ['Omurga Kırığı', 'Kas ve İskelet', BSC, 2],
  ['Omurga Kireçlenmesi (Spondiloz)', 'Kas ve İskelet', FTR, 1],
  ['Omurga ve Omurilik Tümörleri', 'Kas ve İskelet', BSC, 3, 'Omurga tümörleri, Omurilik tümörleri'],
  ['Omurilik Yaralanması ve Parapleji', 'Kas ve İskelet', FTR, 2, 'Omurilik felci, Parapleji'],
  ['Omurilik Kanal Darlığı (Spinal Stenoz)', 'Kas ve İskelet', BSC, 1],

  // ── Ortopedi ──
  ['Ön Çapraz Bağ (ACL) Yırtığı', 'Kas ve İskelet', ORT, 1],
  ['Yan Bağ Yaralanmaları (Diz)', 'Kas ve İskelet', ORT, 2, 'Yan çapraz bağ kopması'],
  ['Bacak Kısalığı ve Uzuv Uzatma', 'Kas ve İskelet', ORT, 2, 'Ekstremite eşitsizliği, Ekstremite uzatma'],
  ['Omuz Çıkığı ve Omuz İnstabilitesi', 'Kas ve İskelet', ORT, 1, 'Bankart lezyonu, Omuz instabilitesi'],
  ['Omuz Ağrısı', 'Kas ve İskelet', FTR, 1, 'Omuz ağrıları'],
  ['De Quervain Tenosinoviti (Başparmak Tendon Sıkışması)', 'Kas ve İskelet', ORT, 2],
  ['Eklem Ağrısı: Nedenleri ve Ne Zaman Hekime?', 'Kas ve İskelet', FTR, 1, 'Eklem ağrısı'],
  ['Eklem Burkulması', 'Kas ve İskelet', ORT, 1, 'Eklem yaralanmaları'],
  ['Eklem Kireçlenmesi (Osteoartrit)', 'Kas ve İskelet', FTR, 1, 'Dejeneratif eklem hastalığı'],
  ['Kalça Kireçlenmesi (Koksartroz)', 'Kas ve İskelet', ORT, 1, 'Coxartroz'],
  ['Kalça Ağrısı', 'Kas ve İskelet', ORT, 1, 'Kalça ağrıları, Kalça kemiği problemleri'],
  ['Kalça Kırığı ve Femur Başı Kırığı', 'Kas ve İskelet', ORT, 2, 'Femur başı kırığı'],
  ['Femur (Uyluk Kemiği) Kırığı', 'Kas ve İskelet', ORT, 2],
  ['Femur Başı Epifiz Kayması', 'Çocuk Sağlığı', ORT, 3],
  ['Eklem Faresi', 'Kas ve İskelet', ORT, 3],
  ['Eklem Eğrilikleri ve Deformiteler', 'Kas ve İskelet', ORT, 3, 'Eklem eğriliği, Deformasyonlar'],
  ['El Bileği Kırıkları', 'Kas ve İskelet', ORT, 1],
  ['El Bileği Bağ Yaralanmaları', 'Kas ve İskelet', ORT, 2],
  ['El ve El Bileği Ağrıları', 'Kas ve İskelet', ORT, 1, 'El ve el bileği hastalıkları'],
  ['El Enfeksiyonları', 'Kas ve İskelet', 'El Cerrahisi', 3],
  ['El Tümörleri ve Ganglion Kisti', 'Kas ve İskelet', ORT, 2, 'Ganglion kisti'],
  ['Tenisçi Dirseği (Lateral Epikondilit)', 'Kas ve İskelet', FTR, 1, 'Lateral epikondilit'],
  ['Tendon Yaralanmaları ve Tendinit', 'Kas ve İskelet', ORT, 1, 'Tendon hastalıkları, Tendon zedelenmesi'],
  ['Kas Lifi Kopması (Kas Yırtığı)', 'Kas ve İskelet', ORT, 1, 'Lif kopması'],
  ['Halluks Valgus (Başparmak Çıkıntısı)', 'Kas ve İskelet', ORT, 1],
  ['Nasır', 'Cilt Sağlığı', DER, 1],
  ['Ezilme (Crush) Yaralanmaları', 'Kas ve İskelet', ORT, 3],
  ['Raşitizm', 'Çocuk Sağlığı', COC, 2],
  ['Juvenil İdiyopatik Artrit (Çocukluk Çağı Romatizması)', 'Çocuk Sağlığı', 'Çocuk Romatolojisi', 2],
  ['Fazla Parmak (Polidaktili)', 'Çocuk Sağlığı', ORT, 3],
  ['Hematom (Doku İçi Kan Toplanması)', 'Kas ve İskelet', GC, 3],

  // ── Kadın sağlığı ──
  ['Rahim Ağzı (Serviks) Kanseri', 'Onkoloji', KAD, 1, 'Rahim ağzı kanseri (4 kayıt), Kadın genital kanser taramaları'],
  ['Rahim (Endometrium) Kanseri', 'Onkoloji', KAD, 2, 'Rahim kanseri'],
  ['Jinekolojik Kanserler ve Tarama', 'Onkoloji', KAD, 1, 'Jinekolojik kanserler'],
  ['Vajina Kanseri', 'Onkoloji', KAD, 3, 'Vajen ca'],
  ['Miyom (Rahim Urları)', 'Kadın Sağlığı', KAD, 1, 'Rahim içi miyom, Rahim urları, Fibroit ur'],
  ['Rahim İçi Kalınlaşma (Endometrial Hiperplazi)', 'Kadın Sağlığı', KAD, 2, 'Rahim kalınlaşması'],
  ['Rahimde Polip', 'Kadın Sağlığı', KAD, 2],
  ['Anormal Rahim Kanaması', 'Kadın Sağlığı', KAD, 1, 'Rahim kanaması'],
  ['Rahim İltihabı ve Pelvik İnflamatuvar Hastalık', 'Kadın Sağlığı', KAD, 2, 'Rahim iltihabı'],
  ['Servikal Ektropiyon (Rahim Ağzı Yarası)', 'Kadın Sağlığı', KAD, 2, 'Rahim egzaması'],
  ['Rahim ve Mesane Sarkması', 'Kadın Sağlığı', KAD, 1, 'Rahim ve vajina sarkması, İdrar torbası sarkması, İdrar yolu sarkması'],
  ['Vajinal Akıntı ve Vajinit', 'Kadın Sağlığı', KAD, 1, 'Vajinal enfeksiyonlar, Vajinit'],
  ['Ferç Kaşıntısı (Vulvar Kaşıntı)', 'Kadın Sağlığı', KAD, 2],
  ['Cinsel İlişkide Ağrı (Disparoni)', 'Kadın Sağlığı', KAD, 1, 'Kadınlarda cinsel ağrı'],
  ['Kadınlarda Cinsel İsteksizlik', 'Kadın Sağlığı', KAD, 2, 'Cinsel soğukluk, Cinsel işlev bozukluğu, Cinsel problemler'],
  ['Kadınlarda Orgazm Sorunu', 'Kadın Sağlığı', KAD, 2],
  ['Gebelik Takibi: Hangi Haftada Hangi Kontrol?', 'Kadın Sağlığı', KAD, 1, 'Hamilelik'],
  ['Plasenta Previa ve Plasenta Yapışıklığı', 'Kadın Sağlığı', 'Perinatoloji', 2, 'Yapışık ve önde gelen plasenta'],
  ['Meme İltihabı (Mastit)', 'Kadın Sağlığı', GC, 1, 'Meme iltihapları'],
  ['İyi Huylu Meme Hastalıkları (Fibroadenom, Fibrokist)', 'Kadın Sağlığı', GC, 1, 'Meme hastalıkları, Fibroadenom, Fibrokist, Fibroma'],
  ['Kadınlarda İdrar Kaçırma ve İşeme Bozuklukları', 'Kadın Sağlığı', URO, 1, 'Kadında işeme bozukluğu'],

  // ── Böbrek ve üroloji ──
  ['İdrar Kaçırma (İnkontinans)', 'Böbrek ve Üroloji', URO, 1, 'İdrar kaçırma (2 kayıt), İdrar tutamamak, Urge sendromu'],
  ['Çocuklarda Gece İdrar Kaçırma', 'Çocuk Sağlığı', 'Çocuk Ürolojisi', 1],
  ['İdrar Yolu Enfeksiyonu (Sistit)', 'Böbrek ve Üroloji', URO, 1, 'İdrar yolları iltihabı, İdrar yollarında yanma, İdrar torbası iltihabı'],
  ['İdrar Tutukluğu (İdrar Retansiyonu)', 'Böbrek ve Üroloji', URO, 2, 'İdrar retansiyonu, İdrar zorluğu, İdrar yapma bozukluğu'],
  ['İdrarda Kan (Hematüri)', 'Böbrek ve Üroloji', URO, 1, 'İdrarda kan görülmesi'],
  ['Mesane (İdrar Kesesi) Hastalıkları', 'Böbrek ve Üroloji', URO, 2, 'İdrar kesesi hastalıkları, İdrar kesesinde daralma'],
  ['İdrar Yolu Tümörleri (Mesane Kanseri)', 'Onkoloji', URO, 2],
  ['Bakteriüri (İdrarda Bakteri)', 'Böbrek ve Üroloji', URO, 3],
  ['Vezikoüreteral Reflü', 'Çocuk Sağlığı', 'Çocuk Ürolojisi', 2, 'Vezikoüreteral reflü (4 kayıt)'],
  ['Üreter Darlıkları (UPJ ve UVJ Darlığı)', 'Böbrek ve Üroloji', URO, 3, 'UP darlık, UPJ darlığı, UVJ darlığı'],
  ['Ektopik Üreter', 'Çocuk Sağlığı', 'Çocuk Ürolojisi', 3],
  ['Mesane Ekstrofisi', 'Çocuk Sağlığı', 'Çocuk Ürolojisi', 3],
  ['Böbrek Taşı (Nefrolitiyazis)', 'Böbrek ve Üroloji', URO, 1, 'Nefrolitiyaz'],
  ['Nefrokalsinozis ve İdrarda Kalsiyum Fazlalığı', 'Böbrek ve Üroloji', NEF, 3, 'İdiopatik hiperkalsiüri'],
  ['Oksalüri (İdrarda Oksalat)', 'Böbrek ve Üroloji', NEF, 3],
  ['Proteinüri (İdrarda Protein)', 'Böbrek ve Üroloji', NEF, 2, 'Kalıcı proteinüri'],
  ['Glomerülonefrit', 'Böbrek ve Üroloji', NEF, 2, 'Membranöz, Membranoproliferatif glomerülonefrit'],
  ['Nefrotik Sendrom', 'Böbrek ve Üroloji', NEF, 2, 'Nefroz'],
  ['Nefroskleroz (Hipertansif Böbrek Hasarı)', 'Böbrek ve Üroloji', NEF, 3],
  ['Testis Ağrısı', 'Böbrek ve Üroloji', URO, 1],
  ['Wilms Tümörü', 'Onkoloji', 'Çocuk Onkolojisi', 3],

  // ── Cilt ve saç ──
  ['Cilt Kanseri', 'Onkoloji', DER, 1],
  ['Malign Melanom', 'Onkoloji', DER, 1],
  ['Cilt Kesisi: Ne Zaman Dikiş Gerekir?', 'Cilt Sağlığı', PLS, 2],
  ['Hassas Cilt', 'Cilt Sağlığı', DER, 2],
  ['Liken Planus', 'Cilt Sağlığı', DER, 2],
  ['Hemanjiyom (Çilek Lekesi)', 'Çocuk Sağlığı', DER, 2, 'Hemanjiyomlar'],
  ['Lenfanjiyom', 'Çocuk Sağlığı', 'Çocuk Cerrahisi', 3],
  ['Saçta Kepek ve Seboreik Dermatit', 'Cilt Sağlığı', DER, 1, 'Saç egzaması ve kepek, Saçta kepek'],
  ['Saçkıran (Alopesi Areata)', 'Cilt Sağlığı', DER, 1],
  ['Saç Mantarı', 'Cilt Sağlığı', DER, 2],
  ['Saç ve Sakal Beyazlaması', 'Cilt Sağlığı', DER, 2],
  ['Saç Hastalıkları', 'Cilt Sağlığı', DER, 2],
  ['Parry-Romberg Sendromu', 'Cilt Sağlığı', PLS, 3],

  // ── Göz ──
  ['Gece Körlüğü', 'Göz Sağlığı', GOZ, 2, 'Tavuk karası'],
  ['Makula Deliği', 'Göz Sağlığı', GOZ, 2],
  ['Göz Kayması ve Bakışımsızlık', 'Göz Sağlığı', GOZ, 3, 'Bakışımsızlık'],

  // ── Onkoloji (diğer) ──
  ['Yumuşak Doku Sarkomları', 'Onkoloji', ONK, 3, 'Liposarkom, Rabdomiyosarkom, Malign fibröz histiyositom'],
  ['Germ Hücreli Tümörler (Teratom, Yolk Sak Tümörü)', 'Onkoloji', ONK, 3, 'Teratom, Yolk sak tümörü'],
  ['Rabdomiyom', 'Onkoloji', 'Çocuk Kardiyolojisi', 3],
  ['Primeri Bilinmeyen Kanserler', 'Onkoloji', ONK, 3, 'Yeri bilinmeyen kanserler, Adenokarsinom'],
  ['Tümör (Ur) Nedir? İyi ve Kötü Huylu Tümör Farkı', 'Onkoloji', ONK, 2, 'Ur (tümör)'],
  ['Mide Kanseri (Linitis Plastika)', 'Onkoloji', GC, 2, 'Linit'],
  ['Sindirim Sistemi Kanserleri', 'Onkoloji', GAS, 2, 'Gastrointestinal sistem kanserleri'],
  ['Von Hippel-Lindau Hastalığı', 'Onkoloji', 'Tıbbi Genetik', 3, 'Lindau hastalığı'],

  // ── Ruh sağlığı ──
  ['Depresyon', 'Ruh Sağlığı', PSI, 1, 'Majör depresif bozukluk, Unipolar depresyon'],
  ['Agorafobi', 'Ruh Sağlığı', PSI, 2],
  ['Dikkat Eksikliği ve Hiperaktivite Bozukluğu (DEHB)', 'Ruh Sağlığı', 'Çocuk ve Ergen Ruh Sağlığı', 1],
  ['Çocuklarda Davranış Bozuklukları', 'Ruh Sağlığı', 'Çocuk ve Ergen Ruh Sağlığı', 2],
  ['Madde Kullanım Bozukluğu', 'Ruh Sağlığı', PSI, 2],
  ['Yeme Bozuklukları (Anoreksiya, Bulimiya, Tıkınırcasına Yeme)', 'Ruh Sağlığı', PSI, 1],
  ['Yas Süreci ve Uzamış Yas', 'Ruh Sağlığı', PSI, 2],
  ['Uyum Bozukluğu', 'Ruh Sağlığı', PSI, 2],
  ['Otizm Spektrum Bozukluğu', 'Ruh Sağlığı', 'Çocuk ve Ergen Ruh Sağlığı', 1, 'Yaygın gelişimsel bozukluklar'],
  ['Zihinsel Yetersizlik', 'Ruh Sağlığı', 'Çocuk ve Ergen Ruh Sağlığı', 2, 'Zeka geriliği, Zihin engeli, Zihinsel özür'],
  ['Okul Başarısızlığı ve Okula Uyum Sorunları', 'Çocuk Sağlığı', 'Çocuk ve Ergen Ruh Sağlığı', 2],
  ['Sürekli Yorgunluk ve Halsizlik', 'Ruh Sağlığı', DAH, 1, 'Halsizlik, Zihin yorgunluğu, Nevrasteni'],

  // ── Uyku ──
  ['Uykusuzluk (İnsomnia)', 'Ruh Sağlığı', PSI, 1],
  ['Uyku Bozuklukları', 'Nöroloji', NOR, 2],
  ['Uyurgezerlik ve Parasomniler', 'Nöroloji', NOR, 2, 'Uyurgezerlik (2 kayıt), Kabus bozukluğu'],
  ['Jet Lag', 'Nöroloji', NOR, 3],

  // ── Çocuk ve yenidoğan ──
  ['Yenidoğan Bakımı: İlk Haftalar', 'Çocuk Sağlığı', COC, 1, 'Yeni doğan'],
  ['Yenidoğan Sarılığı', 'Çocuk Sağlığı', COC, 1],
  ['Yenidoğan Topuk Kanı Taraması (Metabolik Hastalıklar)', 'Çocuk Sağlığı', COC, 2, 'Yeni doğan metabolik hastalık'],
  ['Sağlam Çocuk (Bebek) Takibi', 'Çocuk Sağlığı', COC, 1],
  ['Fenilketonüri', 'Çocuk Sağlığı', 'Çocuk Metabolizma Hastalıkları', 3],
  ['Lizozomal Depo Hastalıkları (Gaucher, Niemann-Pick, Tay-Sachs, MPS)', 'Çocuk Sağlığı', 'Çocuk Metabolizma Hastalıkları', 3, 'Gaucher, Niemann-Pick, Tay-Sachs, Gargoylizm'],
  ['CHARGE Sendromu', 'Çocuk Sağlığı', 'Tıbbi Genetik', 3],
  ['Göbek Enfeksiyonu (Omfalit) ve Az İdrar (Oligüri)', 'Çocuk Sağlığı', COC, 3, 'Oliguri-Onfalit'],
];

/** Havuzdaki konular (slug başlıktan türetilir). */
export const KONU_HAVUZU: HavuzKonu[] = SATIRLAR.map(([baslik, kategori, brans, oncelik, not]) => ({
  baslik, slug: makaleSlug(baslik), kategori, brans, oncelik, ...(not ? { not } : {}),
}));

/** Havuzdan çıkarılan başlıklar: zaten yazılmış ya da yazılmakta olan dizi yazısıyla aynı konu. */
export const HAVUZ_DISI: Record<string, string> = {
  'Baş dönmesi, Vertigo, Denge hastalıkları': 'bas-donmesi-vertigo',
  'Bağırsak hastalıkları, Bağırsak kanserleri, Kolon kanseri': 'bagirsak-hastaliklari / kolon-kanseri',
  'Cilt hastalıkları': 'cilt-hastaliklari',
  'Cilt lekeleri': 'cilt-lekeleri',
  'Condyloma akuminata': 'genital-sigil',
  'Damar hastalıkları': 'damar-hastaliklari',
  'Egzama': 'egzama-atopik-dermatit',
  'Fibromiyalji': 'fibromiyalji-ve-kronik-agri-sendromlari',
  'Gebe kalamama, Hamile kalamama': 'kisirlik-infertilite',
  'Gecikmiş dil ve konuşma': 'konusma-bozukluklari',
  'Jinekolojik hastalıklar, Kadın hastalıkları': 'kadin-hastaliklari-belirtiler',
  'Kalça çıkığı': 'cocuk-ortopedisi',
  'Lenfoma, Lenfom': 'lenfoma',
  'Makromasti, Makromama, Mamoplasti': 'gogus-estetigi-meme-estetigi',
  'Nazal septum deviasyonu': 'burun-egriligi-septum-deviasyonu',
  'Obsesif-kompulsif bozukluk': 'obsesif-kompulsif-bozukluk-okb',
  'Panik atak, Panik bozukluğu': 'panik-atak',
  'Parkinson hastalığı': 'parkinson-hastaligi',
  'Saç dökülmesi': 'sac-dokulmesi',
  'Safra kesesi taşları': 'safra-kesesi-taslari',
  'Uyku apnesi, Uykuda solunum durması': 'uyku-apnesi',
  'Vajinismus': 'vajinismus',
  'Varikosel': 'varikosel',
  'Yanıklar': 'yaniklar',
  'Yaygın anksiyete bozukluğu': 'yaygin-anksiyete-bozuklugu',
};

/** Yazıldı mı? Verilen slug listesinde (statik + DB) varsa true. */
export function yazildi(k: HavuzKonu, yazilanSluglar: Set<string>): boolean {
  return yazilanSluglar.has(k.slug);
}
