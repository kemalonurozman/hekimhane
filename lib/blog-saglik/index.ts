// OTOMATİK ÜRETİLİR — scripts/blog-dizi-uret.mjs. Elle düzenleme.
// Sağlık / hastalık yazı dizisi. Yayın anı lib/blog-takvim.ts'ten gelir; takvimde
// olmayan yazı yayınlanmaz.
import type { BlogYazi } from '../blog-data';
import { parseGovde, okumaSuresi } from '../makale-icerik';
import { TAKVIM } from '../blog-takvim';
import type { SaglikKaynak } from './tip';

import y_akciger_hastaliklari from './akciger-hastaliklari';
import y_alerji from './alerji';
import y_alerjik_astim from './alerjik-astim';
import y_alkol_bagimliligi from './alkol-bagimliligi';
import y_anal_fissur from './anal-fissur';
import y_anal_fistul from './anal-fistul';
import y_bagirsak_hastaliklari from './bagirsak-hastaliklari';
import y_bas_donmesi_vertigo from './bas-donmesi-vertigo';
import y_bel_fitigi from './bel-fitigi';
import y_ben_kontrolu_ve_cilt_kanseri from './ben-kontrolu-ve-cilt-kanseri';
import y_bipolar_bozukluk from './bipolar-bozukluk';
import y_bobrek_hastaliklari from './bobrek-hastaliklari';
import y_boyun_fitigi from './boyun-fitigi';
import y_burun_egriligi_septum_deviasyonu from './burun-egriligi-septum-deviasyonu';
import y_cilt_hastaliklari from './cilt-hastaliklari';
import y_cilt_lekeleri from './cilt-lekeleri';
import y_cocuk_ortopedisi from './cocuk-ortopedisi';
import y_damar_hastaliklari from './damar-hastaliklari';
import y_diyabet_seker_hastaligi from './diyabet-seker-hastaligi';
import y_diz_kapagi_problemleri from './diz-kapagi-problemleri';
import y_egzama_atopik_dermatit from './egzama-atopik-dermatit';
import y_epilepsi_sara from './epilepsi-sara';
import y_genital_sigil from './genital-sigil';
import y_gogus_estetigi_meme_estetigi from './gogus-estetigi-meme-estetigi';
import y_guatr from './guatr';
import y_hemoroid_basur from './hemoroid-basur';
import y_horlama from './horlama';
import y_hpv_enfeksiyonu_ve_asi from './hpv-enfeksiyonu-ve-asi';
import y_iltihapli_romatizma_romatoid_artrit from './iltihapli-romatizma-romatoid-artrit';
import y_kadin_hastaliklari_belirtiler from './kadin-hastaliklari-belirtiler';
import y_karaciger_hastaliklari from './karaciger-hastaliklari';
import y_kasik_fitigi from './kasik-fitigi';
import y_kekemelik from './kekemelik';
import y_kepce_kulak from './kepce-kulak';
import y_kil_donmesi_pilonidal_sinus from './kil-donmesi-pilonidal-sinus';
import y_kilcal_damar_catlamasi from './kilcal-damar-catlamasi';
import y_kisirlik_infertilite from './kisirlik-infertilite';
import y_kolon_kanseri from './kolon-kanseri';
import y_konusma_bozukluklari from './konusma-bozukluklari';
import y_koronavirus_covid_19 from './koronavirus-covid-19';
import y_lenfoma from './lenfoma';
import y_meme_kanseri_gogus_kanseri from './meme-kanseri-gogus-kanseri';
import y_mide_hastaliklari from './mide-hastaliklari';
import y_migren from './migren';
import y_norolojik_hastaliklar from './norolojik-hastaliklar';
import y_obsesif_kompulsif_bozukluk_okb from './obsesif-kompulsif-bozukluk-okb';
import y_panik_atak from './panik-atak';
import y_parkinson_hastaligi from './parkinson-hastaligi';
import y_polikistik_over_sendromu_pkos from './polikistik-over-sendromu-pkos';
import y_riskli_gebelik from './riskli-gebelik';
import y_sac_dokulmesi from './sac-dokulmesi';
import y_safra_kesesi_taslari from './safra-kesesi-taslari';
import y_sasilik from './sasilik';
import y_sedef_hastaligi_psoriazis from './sedef-hastaligi-psoriazis';
import y_sertlesme_sorunu_erektil_disfonksiyon from './sertlesme-sorunu-erektil-disfonksiyon';
import y_ses_kisikligi from './ses-kisikligi';
import y_sivilce_akne from './sivilce-akne';
import y_skolyoz from './skolyoz';
import y_tiroid_hastaliklari from './tiroid-hastaliklari';
import y_tiroid_nodulu from './tiroid-nodulu';
import y_topuk_dikeni_plantar_fasiit from './topuk-dikeni-plantar-fasiit';
import y_uyku_apnesi from './uyku-apnesi';
import y_vajinismus from './vajinismus';
import y_varikosel from './varikosel';
import y_vitiligo_ala_hastaligi from './vitiligo-ala-hastaligi';
import y_yaniklar from './yaniklar';
import y_yaygin_anksiyete_bozuklugu from './yaygin-anksiyete-bozuklugu';

const UYARI =
  'Bu içerik yalnızca genel bilgilendirme amaçlıdır; hekim muayenesinin, tanı ve tedavinin yerini tutmaz. Şikâyetleriniz için bir hekime başvurun; acil durumlarda 112\'yi arayın.';

const KAYNAKLAR: SaglikKaynak[] = [
  y_akciger_hastaliklari,
  y_alerji,
  y_alerjik_astim,
  y_alkol_bagimliligi,
  y_anal_fissur,
  y_anal_fistul,
  y_bagirsak_hastaliklari,
  y_bas_donmesi_vertigo,
  y_bel_fitigi,
  y_ben_kontrolu_ve_cilt_kanseri,
  y_bipolar_bozukluk,
  y_bobrek_hastaliklari,
  y_boyun_fitigi,
  y_burun_egriligi_septum_deviasyonu,
  y_cilt_hastaliklari,
  y_cilt_lekeleri,
  y_cocuk_ortopedisi,
  y_damar_hastaliklari,
  y_diyabet_seker_hastaligi,
  y_diz_kapagi_problemleri,
  y_egzama_atopik_dermatit,
  y_epilepsi_sara,
  y_genital_sigil,
  y_gogus_estetigi_meme_estetigi,
  y_guatr,
  y_hemoroid_basur,
  y_horlama,
  y_hpv_enfeksiyonu_ve_asi,
  y_iltihapli_romatizma_romatoid_artrit,
  y_kadin_hastaliklari_belirtiler,
  y_karaciger_hastaliklari,
  y_kasik_fitigi,
  y_kekemelik,
  y_kepce_kulak,
  y_kil_donmesi_pilonidal_sinus,
  y_kilcal_damar_catlamasi,
  y_kisirlik_infertilite,
  y_kolon_kanseri,
  y_konusma_bozukluklari,
  y_koronavirus_covid_19,
  y_lenfoma,
  y_meme_kanseri_gogus_kanseri,
  y_mide_hastaliklari,
  y_migren,
  y_norolojik_hastaliklar,
  y_obsesif_kompulsif_bozukluk_okb,
  y_panik_atak,
  y_parkinson_hastaligi,
  y_polikistik_over_sendromu_pkos,
  y_riskli_gebelik,
  y_sac_dokulmesi,
  y_safra_kesesi_taslari,
  y_sasilik,
  y_sedef_hastaligi_psoriazis,
  y_sertlesme_sorunu_erektil_disfonksiyon,
  y_ses_kisikligi,
  y_sivilce_akne,
  y_skolyoz,
  y_tiroid_hastaliklari,
  y_tiroid_nodulu,
  y_topuk_dikeni_plantar_fasiit,
  y_uyku_apnesi,
  y_vajinismus,
  y_varikosel,
  y_vitiligo_ala_hastaligi,
  y_yaniklar,
  y_yaygin_anksiyete_bozuklugu,
];

/** [metin](/hekim-bul) → yazının branşına göre hekim listesi */
const hekimBul = (metin: string, brans: string) =>
  metin.replace(/\]\(\/hekim-bul\)/g, `](/doktorlar?spec=${encodeURIComponent(brans).replace(/[()]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())})`);

export const SAGLIK_YAZILARI: BlogYazi[] = KAYNAKLAR
  .filter(k => TAKVIM[k.slug])
  .map(k => ({
    slug: k.slug,
    title: k.title,
    summary: k.summary,
    category: k.kategori,
    author: 'Hekimhane Editör',
    created_at: TAKVIM[k.slug],
    okumaDk: okumaSuresi(k.metin),
    cover_image: `/blog/${k.slug}.svg`,
    cover_alt: k.cover_alt,
    views: 0,
    govde: [...parseGovde(hekimBul(k.metin, k.brans)), { tip: 'p' as const, metin: UYARI }],
    brans: k.brans,
  }));
