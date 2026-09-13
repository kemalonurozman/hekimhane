// ─────────────────────────────────────────────────────────────────
//  Hekimhane MCP araç kataloğu — TEK KAYNAK. Hem /api/mcp (tools/list)
//  hem /mcp açıklama sayfası ve panel sekmesi bu listeyi okur; araç
//  eklerken/değiştirirken dokümantasyon kendiliğinden güncel kalır.
//  Bu dosya sunucuya özgü import içermez (sayfalarda da kullanılır).
// ─────────────────────────────────────────────────────────────────

export type AracGrubu = 'Genel' | 'Randevu' | 'Takvim' | 'Yorumlar' | 'İletişim';

export interface AracTanimi {
  name: string;
  title: string;
  grup: AracGrubu;
  /** true → veri değiştirir veya dışarı mail gönderir (istemci onay istemeli) */
  yazma: boolean;
  /** Modelin okuduğu açıklama */
  description: string;
  /** Sayfada gösterilen örnek kullanıcı cümlesi */
  ornek: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean };
}

const TARIH = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'YYYY-MM-DD (Türkiye saati)' };
const SAAT = { type: 'string', pattern: '^\\d{2}:\\d{2}$', description: 'HH:MM (24 saat, Türkiye saati)' };
const ISLETME = { type: 'string', description: 'İşletme kimliği (isletmelerim aracından). Hesapta tek işletme varsa boş bırakılabilir.' };

const oku = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

export const ARACLAR: AracTanimi[] = [
  {
    name: 'isletmelerim', title: 'İşletmelerim', grup: 'Genel', yazma: false, annotations: oku,
    description: 'Hesaba bağlı onaylı işletmeleri listeler: kimlik, tür, ad, konum, Pro durumu, online randevu takviminin açık olup olmadığı, slot süresi ve herkese açık profil linki. Diğer araçlardaki isletme_id değerleri buradan alınır — önce bunu çağır.',
    ornek: 'Hangi işletmelerim bağlı, hangilerinde online randevu açık?',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'randevu_talepleri_listele', title: 'Randevu taleplerini listele', grup: 'Randevu', yazma: false, annotations: oku,
    description: 'Randevu taleplerini (web sitesi, Hekimhane profili ve panelden eklenenler) en yeniden eskiye listeler. İşletme, durum, randevu tarih aralığı ve ad/telefon aramasıyla filtrelenebilir. Durumlar: yeni (henüz dönülmedi), arandi (onaylandı/iletişime geçildi), tamamlandi, iptal.',
    ornek: 'Bu haftaki onaylı randevularımı saat sırasıyla listele.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      properties: {
        isletme_id: ISLETME,
        durum: { type: 'string', enum: ['yeni', 'arandi', 'tamamlandi', 'iptal'], description: 'Yalnız bu durumdakiler' },
        baslangic: { ...TARIH, description: 'Randevu tarihi bu günden itibaren (YYYY-MM-DD)' },
        bitis: { ...TARIH, description: 'Randevu tarihi bu güne kadar (YYYY-MM-DD, dahil)' },
        arama: { type: 'string', description: 'Ad soyad veya telefonda geçen metin' },
        limit: { type: 'integer', minimum: 1, maximum: 200, description: 'En fazla kaç kayıt (varsayılan 30)' },
      },
    },
  },
  {
    name: 'randevu_guncelle', title: 'Randevuyu güncelle / ertele / iptal et', grup: 'Randevu', yazma: true,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    description: 'Bir randevu talebinin durumunu değiştirir, sahip notu ekler veya randevuyu yeni tarih/saate taşır. Taşıma ve iptal, hasta e-posta bıraktıysa hastaya OTOMATİK bilgilendirme maili gönderir. Yeni saat doluysa işlem reddedilir. Çalıştırmadan önce kullanıcıdan onay al.',
    ornek: 'Cuma 14:00\'teki Ayşe Hanım\'ın randevusunu pazartesi 10:00\'a ertele.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['talep_id'],
      properties: {
        talep_id: { type: 'string', description: 'randevu_talepleri_listele sonucundaki id' },
        durum: { type: 'string', enum: ['yeni', 'arandi', 'tamamlandi', 'iptal'] },
        not: { type: 'string', maxLength: 2000, description: 'İşletmeye özel not (hastaya gösterilmez)' },
        yeni_tarih: { ...TARIH, description: 'Taşıma için yeni tarih (yeni_saat ile birlikte)' },
        yeni_saat: { ...SAAT, description: 'Taşıma için yeni saat (yeni_tarih ile birlikte)' },
      },
    },
  },
  {
    name: 'randevu_ekle', title: 'Randevu ekle (tek veya uzun işlem)', grup: 'Randevu', yazma: true,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    description: 'Telefonla/yüz yüze alınan randevuyu takvime işler. sure_slot ile uzun işlemler için ardışık birden çok slot tek seferde ayrılır (ör. 60 dk slotta sure_slot=3 → 3 saat). Saat çalışma saatleri dışındaysa, kapalıysa veya doluysa reddedilir ve uygun saatler bildirilir. Hastaya mail gönderilmez.',
    ornek: 'Yarın 10:00\'a Mehmet Demir için 2 saatlik implant randevusu ekle, telefonu 0532 111 22 33.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['ad_soyad', 'telefon', 'tarih', 'saat'],
      properties: {
        isletme_id: ISLETME,
        ad_soyad: { type: 'string', minLength: 2 },
        telefon: { type: 'string', description: 'En az 10 hane' },
        eposta: { type: 'string', description: 'İsteğe bağlı hasta e-postası' },
        tarih: TARIH,
        saat: SAAT,
        sure_slot: { type: 'integer', minimum: 1, maximum: 8, description: 'Kaç ardışık slot (varsayılan 1)' },
      },
    },
  },
  {
    name: 'takvim_durumu', title: 'Takvim doluluk durumu', grup: 'Takvim', yazma: false, annotations: oku,
    description: 'Seçilen günler için çalışma saatlerine göre slotları döker: dolu (hasta adıyla), kapatılmış ve boş saatler. Randevu önermeden veya eklemeden önce boş saatleri görmek için kullan.',
    ornek: 'Önümüzdeki 5 iş günündeki boş saatlerimi göster.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      properties: {
        isletme_id: ISLETME,
        baslangic: { ...TARIH, description: 'İlk gün (varsayılan: bugün)' },
        gun_sayisi: { type: 'integer', minimum: 1, maximum: 31, description: 'Kaç gün (varsayılan 7)' },
      },
    },
  },
  {
    name: 'takvim_kapat_ac', title: 'Gün veya saat kapat / aç', grup: 'Takvim', yazma: true,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    description: 'Online randevuya kapatılacak (veya yeniden açılacak) günü ya da saatleri ayarlar. saatler boşsa tüm gün. Kapalı saatler web sitesi ve profil takviminde seçilemez; mevcut randevular silinmez. Hekimhane-Pro gerektirir.',
    ornek: 'Gelecek çarşamba 13:00 ve 14:00\'ü kapat, cumartesiyi tamamen kapat.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['islem', 'tarih'],
      properties: {
        isletme_id: ISLETME,
        islem: { type: 'string', enum: ['kapat', 'ac'] },
        tarih: TARIH,
        saatler: { type: 'array', items: SAAT, description: 'Boş bırakılırsa tüm gün' },
      },
    },
  },
  {
    name: 'yorumlari_listele', title: 'Yorumları listele', grup: 'Yorumlar', yazma: false, annotations: oku,
    description: 'İşletmelere yapılan hasta yorumlarını puan, metin ve varsa mevcut yanıtla listeler. sadece_yanitsiz ile henüz yanıtlanmamışlar süzülür.',
    ornek: 'Yanıtlamadığım yorumları göster ve her birine kısa, nazik bir yanıt taslağı hazırla.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      properties: {
        isletme_id: ISLETME,
        sadece_yanitsiz: { type: 'boolean' },
        limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Varsayılan 20' },
      },
    },
  },
  {
    name: 'yoruma_yanit_ver', title: 'Yoruma yanıt ver', grup: 'Yorumlar', yazma: true,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    description: 'Bir yoruma işletme adına herkese açık yanıt yazar (varsa mevcut yanıtın yerine geçer) veya sil=true ile yanıtı kaldırır. Yanıt profil sayfasında hemen görünür — göndermeden önce metni kullanıcıya onaylat. Hasta sağlık bilgisi paylaşma.',
    ornek: 'Zehra Hanım\'ın yorumuna teşekkür eden kısa bir yanıt yaz, onaylarsam gönder.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['yorum_id'],
      properties: {
        yorum_id: { type: 'string' },
        yanit: { type: 'string', maxLength: 2000 },
        sil: { type: 'boolean', description: 'true → mevcut yanıtı kaldır' },
      },
    },
  },
  {
    name: 'hastaya_eposta_gonder', title: 'Hastaya e-posta gönder', grup: 'İletişim', yazma: true,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    description: 'Randevu talebi bırakmış bir hastaya işletme adına markalı e-posta gönderir (hasta e-posta bırakmış olmalı). Hasta yanıtlarsa doğrudan işletme hesabının e-postasına ulaşır. Göndermeden önce konu ve metni kullanıcıya onaylat.',
    ornek: 'Yarın randevusu olan hastalara saatlerini hatırlatan kısa bir e-posta gönder.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['talep_id', 'mesaj'],
      properties: {
        talep_id: { type: 'string' },
        konu: { type: 'string', maxLength: 160 },
        mesaj: { type: 'string', minLength: 5, maxLength: 5000 },
      },
    },
  },
];

export const MCP_SUNUCU_ADI = 'hekimhane';
export const MCP_URL = 'https://www.hekimhane.com.tr/api/mcp';

// ── Kurulum kodları (panel sekmesi + /mcp sayfası ortak) ──
export type Istemci = 'claude-code' | 'claude-desktop' | 'cursor' | 'url';

export const YER_TUTUCU = 'hkm_ANAHTARINIZ';

/** İstemciye göre kurulum metni — anahtar yeni üretildiyse içine yerleşik gelir. */
export function kurulumKodu(istemci: Istemci, anahtar: string): string {
  if (istemci === 'claude-code') {
    return 'claude mcp add --transport http hekimhane ' + MCP_URL + ' --header "Authorization: Bearer ' + anahtar + '"';
  }
  if (istemci === 'claude-desktop') {
    return JSON.stringify({
      mcpServers: {
        hekimhane: {
          command: 'npx',
          args: ['-y', 'mcp-remote', MCP_URL, '--header', 'Authorization:$' + '{HEKIMHANE_AUTH}'],
          env: { HEKIMHANE_AUTH: 'Bearer ' + anahtar },
        },
      },
    }, null, 2);
  }
  if (istemci === 'cursor') {
    return JSON.stringify({ mcpServers: { hekimhane: { url: MCP_URL, headers: { Authorization: 'Bearer ' + anahtar } } } }, null, 2);
  }
  return MCP_URL + '?key=' + anahtar;
}

export const ISTEMCI_BILGI: Record<Istemci, { ad: string; nereye: string }> = {
  'claude-code': { ad: 'Claude Code', nereye: 'Terminalde bir kez çalıştırın. Sonra "hekimhane" araçları her oturumda hazırdır.' },
  'claude-desktop': { ad: 'Claude Masaüstü', nereye: 'Ayarlar → Geliştirici → Yapılandırmayı düzenle ile açılan claude_desktop_config.json dosyasına ekleyin, uygulamayı yeniden başlatın. Bilgisayarda Node.js kurulu olmalı.' },
  'cursor': { ad: 'Cursor', nereye: 'Proje veya kullanıcı klasöründeki .cursor/mcp.json dosyasına ekleyin.' },
  'url': { ad: 'URL ile (web / otomasyon)', nereye: 'Yalnızca bağlantı adresi isteyen istemciler için: claude.ai özel bağlayıcı, otomasyon araçlarının MCP düğümleri vb. Anahtar adresin içindedir, bu adresi kimseyle paylaşmayın.' },
};

