# Backend sistem aktarım paketi

Aktarılacak tam sınıf kaynağı:

`ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT_SYSTEM_READY.abap`

SHA-256: `5D3877BE14CAE6B9562C873176238CA80D3B5CF68A3B923B36EE09FD22E1F260`

Kaynak, kullanıcının paylaştığı `ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT.txt` dosyasının tam kopyası üzerine uygulanmıştır. Orijinal dosya değiştirilmemiştir.

## Uygulanan değişiklikler

### `EXECUTE_FACTORY_SHIPMENT` (`POST_RETURN_FACTORY_SHIPMENT` tarafından çağrılır)

- Her malzeme için `FARK` snapshot satırı yazılır.
- `FARK = SapStock - MengeSayim` formülü kullanılır.
- Fark sıfır olsa bile snapshot satırı korunur.
- Kategori dağılımı ile fiziksel sayım birbirinden bağımsız saklanabilir.

### `VALIDATE_RETURN_FACTORY_ITEMS`

- `MengeSayim = kategori toplamı` zorunluluğu kaldırılmıştır.
- Negatif fiziksel sayım engellenmiştir.
- Fiziksel sayımın ve kategori dağılımının MARD stoğunu aşması backend tarafında engellenmiştir.

### `RETURNFACTORYSTO_GET_ENTITYSET`

- Depoya ait tamamlanmamış kayıt yalnız bugüne göre değil tüm tarihlerde aranır.
- Onaya gönderilmiş kaydın kategori miktarları `zmm_t_bdy_fsh_i` snapshot'ından geri yüklenir.
- `MengeSayim`, `FARK` satırından tekrar oluşturulur.
- Eski, `FARK` satırı olmayan kayıtlar için kategori toplamı fallback olarak kullanılır.

### `RETURNFACTORYAPP_GET_ENTITYSET`

- `FARK` satırları okunur fakat kategori dağılımına katılmaz.
- `ToplamSayim` bağımsız snapshot'tan döndürülür.
- `Fark = MevcutStok - ToplamSayim` olarak hesaplanır.
- `Diger = max(MevcutStok - SatışFiresi - ÜretimHatalı - FabrikaLojistik, 0)` olarak hesaplanır.
- Snapshot hash fiziksel sayımı kullanır.
- Eski tarihte kalan onay kayıtları da listelenebilir ve polling ile okunabilir.

### `APPROVE_FACTORY_SHIPMENT`

- Snapshot hash hesabında kategori toplamı yerine fiziksel sayım kullanılır.
- Çıkış dağıtımı şu üç değerin en küçüğüyle sınırlandırılır:
  - güncel MARD stoğu,
  - fiziksel sayım,
  - kategori dağılımı toplamı.
- Eski loglar için kategori toplamı fallback olarak korunur.

### Diğer güvenlik düzeltmeleri

- Ret aksiyonundaki `RejectionReason ` parametresinin sonundaki boşluk kaldırılmıştır.
- Yeni gönderim kontrolünde kayıt kendi `LogUid` değerini blocking kayıt olarak görmez.
- Blocking kayıt bulunduğunda enqueue kilidi bırakılır.

## SEGW ön koşulu

`ReturnFactoryStock` entity type içinde aşağıdaki property bulunmalıdır:

| Property | ABAP alanı | EDM tipi |
|---|---|---|
| `MengeSayim` | `MENGESAYIM` | `Edm.Decimal`, Precision 13, Scale 3 |

Mevcut metadata'da yoksa SEGW üzerinden eklenip runtime object'ler yeniden üretilmelidir. `MengeLansman` alanı da frontend'de kullanıldığı için mevcut değilse aynı entity'ye eklenmelidir.

Bu ekleme yapılmadan sınıf aktive edilirse `<fs_set>-mengesayim` alanı için syntax hatası alınır.

## SAP sistemine aktarım sırası

1. SEGW'de `ReturnFactoryStock/MengeSayim` property kontrolünü yapın.
2. Gerekliyse property'yi ekleyip runtime artifact'larını generate edin.
3. `ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT_SYSTEM_READY.abap` içeriğini DPC_EXT sınıfına aktarın.
4. Sınıfı syntax check ve activate edin.
5. SEGW projesini ve servis runtime object'lerini aktive edin.
6. `/IWFND/CACHE_CLEANUP` çalıştırın.
7. `/IWBEP/CACHE_CLEANUP` çalıştırın.
8. Servis metadata'sını yeniden açıp `MengeSayim` alanını doğrulayın.

## Zorunlu testler

| Senaryo | Beklenen |
|---|---|
| Stok 5, dağılım 3, sayım 3 | Diğer 2, Fark 2, maksimum çıkış 3 |
| Stok 5, dağılım 3, sayım 2 | Diğer 2, Fark 3, maksimum çıkış 2 |
| Stok 5, dağılım 5, sayım 5 | Diğer 0, Fark 0 |
| Onaya gönderilen kaydı tekrar açma | Miktarlar log snapshot'ıyla aynı gelir |
| Önceki tarihli onay bekleyen kayıt | Gönderim ekranını bloke eder ve onay listesinde görünür |
| Eski, `FARK` satırı olmayan log | Kategori toplamıyla geriye uyumlu açılır |
| Sayım veya kategori toplamı stoktan büyük | Backend business exception döndürür |

## Aktivasyon notu

Yerel ortamda SAP DDIC ve ABAP compiler bulunmadığı için nihai syntax/activation kontrolü SAP sisteminde yapılmalıdır. Kaynakta yeni tablo veya DDIC alanı zorunluluğu oluşturulmamıştır; mevcut `zmm_t_bdy_fsh_i` tablosunun `CATEGORY`, `MENGE` ve `SAP_STOCK` alanları kullanılmıştır.
