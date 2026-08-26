# Fabrika Gönderim / Onay Değişiklikleri

> Bu analiz artık uygulanmıştır. Sisteme aktarılacak tam kaynak
> `ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT_SYSTEM_READY.abap`, aktarım sırası ise
> `BACKEND_SYSTEM_TRANSFER_README.md` dosyasındadır.

Bu doküman, `ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT.txt` içindeki mevcut implementasyon esas alınarak hazırlanmıştır.

## Ekran maddeleri ve backend etkisi

| Madde | Frontend | Backend |
|---|---|---|
| 1 | Kategori `ALL` değilken kart açma ve toplu genişletme kapatıldı. | Yok. |
| 2 | Sıra `Satış Firesi, Üretim Hatalı, Fabrika Lojistik, Hepsi`; başlangıç seçimi `SATIS_FIRESI`. | Yok. |
| 3 | `ReturnFactoryStockSet.MengeSayim` varsa kategori toplamıyla ezilmeden kullanılıyor. | Bekleyen kaydın miktarlarını `RETURNFACTORYSTO_GET_ENTITYSET` sonucuna bindirmek gerekir. |
| 4-9 | Onay ekranı başlık, filtre, kart ve navigasyon düzenlemeleridir. | Başlık toplamları mevcut kalem alanlarından hesaplanabilir; yeni OData alanı zorunlu değildir. |
| 10 | UI, `Diğer = max(MevcutStok - SF - Üretim Hatalı - Fabrika Lojistik, 0)` formülünü uygular. | Aynı formül servis tarafında da uygulanmalı; `Fark` fiziksel sayımdan bağımsız saklanmalıdır. |

## 1. Gönderilmiş kaydı gönderim ekranına geri yükleme

Değiştirilecek metod: `RETURNFACTORYSTO_GET_ENTITYSET`.

Mevcut metod `zmm_t_bdy_fsh_h` tablosundan engelleyen başlığı buluyor, fakat `zmm_t_bdy_fsh_i` miktarlarını stok entity'sine taşımıyor. `ls_blocking` bulunduğunda ilgili log kalemleri okunup `MATNR` bazında gruplanmalıdır.

Önerilen akış:

1. `ls_blocking-log_uid` için `zmm_t_bdy_fsh_i` satırlarını okuyun.
2. `MATNR` bazında aşağıdaki eşlemeyi yapın:
   - `URETIM` → `MengeUretimHatali`
   - `FABLOJ` → `MengeFabrikaLojistik`
   - `SF-KATI` → `MengeSatisFireKati`
   - `SF-SIVI` → `MengeSatisFireSivi`
   - `SF-UHT` → `MengeSatisFireUht`
   - `SF-CAM` → `MengeSatisFireCam`
   - `TOPLATILAN` → `MengeLansman`
   - `FARK` → fiziksel eksik miktar
3. Stok entity döngüsünde CDS miktarlarının üzerine, bekleyen log kaydından gelen snapshot değerlerini yazın.
4. `MengeSayim` değerini `SapStock - FARK` olarak döndürün. `FARK` satırı yoksa geriye uyumluluk için kategori toplamını kullanın.
5. `CreateAllowed = abap_false` ve mevcut blocking alanlarını aynen koruyun. Böylece ekran salt okunur açılır fakat gönderilmiş miktarları gösterir.

Özet ABAP iskeleti:

```abap
SELECT *
  FROM zmm_t_bdy_fsh_i
  INTO TABLE @DATA(lt_pending_items)
  WHERE log_uid = @ls_blocking-log_uid.

" MATNR bazında kategori miktarları ve FARK gruplanır.
" et_entityset döngüsünde ilgili malzeme bulunur:
<fs_set>-mengeuretimhatali    = ls_pending-menge_uretim.
<fs_set>-mengefabrikalojistik = ls_pending-menge_fabloj.
<fs_set>-mengesatisfirekati   = ls_pending-menge_sf_kati.
<fs_set>-mengesatisfiresivi   = ls_pending-menge_sf_sivi.
<fs_set>-mengesatisfireuht    = ls_pending-menge_sf_uht.
<fs_set>-mengesatisfirecam    = ls_pending-menge_sf_cam.
<fs_set>-mengelansman         = ls_pending-menge_toplatilan.
<fs_set>-mengesayim           = <fs_set>-sapstock - ls_pending-menge_fark.
```

Not: Bekleyen kayıt seçimi yalnız `sy-datum` ile sınırlandırılmıştır. İş kuralı “depo için tamamlanmamış kayıt” ise tarih filtresi kaldırılmalı veya frontend tarih filtresiyle aynı tarih açıkça kullanılmalıdır. Aksi halde önceki güne ait onay bekleyen kayıt miktarları açılmaz.

## 2. Fiziksel sayım farkını logda saklama

Değiştirilecek metod: `EXECUTE_FACTORY_SHIPMENT`, `lt_category` hazırlanırken
(`POST_RETURN_FACTORY_SHIPMENT` bu metodu log-only kipinde çağırır).

Paylaşılan sınıfta daha önce yazılmış fakat yorum satırına alınmış `FARK` bloğu bulunuyor. Bu blok aktif hale getirilmelidir:

```abap
DATA(lv_log_difference) =
  <source_item>-sapstock - <source_item>-mengesayim.

IF lv_log_difference > 0.
  APPEND VALUE #(
    category     = 'FARK'
    source_posnr = <source_item>-posnr
    material     = <source_item>-matnr
    quantity     = lv_log_difference
    sap_stock    = <source_item>-sapstock
    uom          = <source_item>-meins )
    TO lt_category.
ENDIF.
```

Bu kayıt iki değeri birbirinden ayırır:

- Kategori dağılımı: `URETIM`, `FABLOJ`, `SF-*` satırları.
- Fiziksel sayım: `SapStock - FARK`.

Dolayısıyla MARD stoğu 5, kategori dağılımı 3 ve fiziksel sayım 2 ise `FARK = 3` saklanabilir; kategori dağılımı değişmeden kalır.

## 3. Onay servisindeki `Diğer`, `ToplamSayım` ve `Fark`

Değiştirilecek metod: `RETURNFACTORYAPP_GET_ENTITYSET`.

Mevcut kod `category <> 'FARK'` koşuluyla fark satırlarını okumuyor, `ToplamSayim` değerini kategori toplamından oluşturuyor ve `Fark = ToplamSayim - MevcutStok` hesaplıyor. İstenen örneği karşılamak için:

1. `FARK` satırlarını da okuyun.
2. `FARK` satırını kategori toplamlarına katmayın; ayrı bir yardımcı toplamda saklayın.
3. Malzeme satırı tamamlandıktan sonra şu değerleri üretin:

```abap
lv_dagitim = <approval>-satisfiresi
            + <approval>-uretimhatali
            + <approval>-fabrikalojistik.

<approval>-diger = <approval>-mevcutstok - lv_dagitim.
IF <approval>-diger < 0.
  CLEAR <approval>-diger.
ENDIF.

<approval>-fark = lv_logged_fark.
<approval>-toplamsayim =
  <approval>-mevcutstok - <approval>-fark.
```

Geriye uyumluluk için `FARK` satırı olmayan eski loglarda:

```abap
<approval>-toplamsayim = lv_eski_kategori_toplami.
<approval>-fark = <approval>-mevcutstok - <approval>-toplamsayim.
```

`SnapshotHash` üretiminde de `stock_qty` ile bağımsız `ToplamSayim` kullanılmalıdır. Onay aksiyonundaki hash hesabı aynı veri ve aynı sıralamayla üretilmezse ekran sürekli snapshot uyuşmazlığı verir.

## 4. Onay aksiyonunda tutarlılık

Değiştirilecek metod: `APPROVE_FACTORY_SHIPMENT`.

- `SELECT ... category <> 'FARK'` iş belgesi dağıtımları için korunabilir.
- Ancak snapshot toplamı kategori satırı toplamından değil, loglanan fiziksel sayımdan üretilmelidir.
- `MengeSayim` ile kategori dağılımının farklı olmasına izin verilecekse `VALIDATE_RETURN_FACTORY_ITEMS` içindeki `MengeSayim = kategori toplamı` kontrolü iş birimi kararıyla kaldırılmalı veya uyarıya çevrilmelidir.
- Çıkış miktarının fiziksel sayım mı yoksa kategori dağılımı mı olacağı netleştirilmelidir. Mevcut aksiyon kategori satırlarını öncelik sırasıyla dağıtır; bu toplam fiziksel sayımdan büyük olabiliyorsa iş belgesi miktarı için ayrıca üst sınır uygulanmalıdır.

Önerilen güvenli kural: kategori bazlı `menge_cikis` toplamı hiçbir zaman loglanan `MengeSayim` değerini aşmamalıdır.

## 5. SEGW / OData kontrol listesi

Mevcut modelde alanlar varsa yeni property gerekmez:

- `ReturnFactoryStock`: `MengeSayim` ve tüm kategori miktarları.
- `ReturnFactoryApproval`: `MevcutStok`, `ToplamSayim`, `Fark`, `SatisFiresi`, `UretimHatali`, `FabrikaLojistik`, `Diger`.

Değişikliklerden sonra:

1. MPC/DPC runtime artifact'larını yeniden üretin/aktive edin.
2. `/IWFND/CACHE_CLEANUP` ve `/IWBEP/CACHE_CLEANUP` çalıştırın.
3. Servis metadata'sında decimal precision/scale değerlerini kontrol edin.
4. Aşağıdaki senaryoları test edin:
   - Stok 5, dağılım 3, sayım 3 → Diğer 2, Fark 2.
   - Stok 5, dağılım 3, sayım 2 → Diğer 2, Fark 3.
   - Onaya gönderilen kayıt tekrar açılır → bütün miktarlar log snapshot'ıyla aynı.
   - Eski, `FARK` satırı olmayan kayıt → geriye uyumluluk hesabı çalışır.

## Ek tespit

`EXECUTE_ACTION` içindeki ret parametresi şu anda `name = 'RejectionReason '` biçiminde sonda boşlukla okunuyor. SEGW function import parametresi `RejectionReason` ise boşluk kaldırılmalıdır; aksi halde ret nedeni boş kaydedilebilir.
