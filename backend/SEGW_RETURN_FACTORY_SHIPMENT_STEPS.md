# ReturNFactoryShipment SAP uygulama adımları

Bu akış, `fabrika gönderim.xlsx` içindeki yeni kategori modelini uygular. Eski
`Fire / Kalite / Lansman` alanları bu entity için artık kullanılmaz.

## 1. SEGW alanları

`ReturnFactoryShipment` entity'sine ekleyin:

| Property | ABAP alanı | EDM tipi | Uzunluk |
|---|---|---|---|
| `Werks` | `WERKS` | `Edm.String` | 4 |
| `LogUid` | `LOGUID` | `Edm.String` | 32 |

`ReturnFactoryShipmentItem` entity'sine ekleyin:

| Property | ABAP alanı | EDM tipi | Precision / Scale |
|---|---|---|---|
| `MengeUretimHatali` | `MENGEURETIMHATALI` | `Edm.Decimal` | 13 / 3 |
| `MengeFabrikaLojistik` | `MENGEFABRIKALOJISTIK` | `Edm.Decimal` | 13 / 3 |
| `MengeSatisFireKati` | `MENGESATISFIREKATI` | `Edm.Decimal` | 13 / 3 |
| `MengeSatisFireSivi` | `MENGESATISFIRESIVI` | `Edm.Decimal` | 13 / 3 |
| `MengeSatisFireUht` | `MENGESATISFIREUHT` | `Edm.Decimal` | 13 / 3 |
| `MengeSatisFireCam` | `MENGESATISFIRECAM` | `Edm.Decimal` | 13 / 3 |

`ReturnFactoryStock` entity'sinde gönderilmiş sayım snapshot'ını geri açmak
için aşağıdaki property bulunmalıdır:

| Property | ABAP alanı | EDM tipi | Precision / Scale |
|---|---|---|---|
| `MengeSayim` | `MENGESAYIM` | `Edm.Decimal` | 13 / 3 |

Navigation ve anahtar yapısı değişmez:

- `ReturnFactoryShipment(Lgort, IrsTar, PlakaNo)`
- `ToItems -> ReturnFactoryShipmentItem`
Komisyon seçim listesi `KomisyonListSet` üzerinden `Bolge` filtresiyle okunur.
Seçilen 0-4 üyenin sicil numaraları `ReturnFactoryShipmentSet` deep-create
başlığındaki `Komisyon1`, `Komisyon2`, `Komisyon3`, `Komisyon4` alanlarıyla
gönderilir. Navigation property kullanılmaz; seçilmeyen alanlar boş gönderilir.

Alanları ekledikten sonra runtime artifact'ları yeniden üretin. Özel kodu
generated `MPC` / `DPC` sınıflarına değil, yalnız `MPC_EXT` / `DPC_EXT`
sınıflarına koyun.

## 2. Satın alma siparişi kuralı

Bir UB siparişinde farklı `ZZGRUND` değerlerine izin verilmediğinden backend
en fazla iki UB siparişi oluşturur:

| UB grubu | İçerik | `ZZGRUND` | `ZZALTNDN` | `ZZSKTAR` |
|---|---|---:|---|---|
| Üretim hatalı | Üretim Hatalı | `2` | `01` | `SY-DATUM` |
| Diğer | Fabrika Lojistik | `4` | boş | boş |
| Diğer | Satış Firesi Katı/Sıvı/UHT/Cam | `4` | `09` | boş |

Satış Firesi alt kırılımları ayrı PO kalemleridir. `TRACKINGNO` alanında
`SF-KATI`, `SF-SIVI`, `SF-UHT`, `SF-CAM` kodları yer alır. Böylece aynı
malzemenin alt kırılımları belgede ve logda ayırt edilebilir.

`BAPI_TE_MEPOITEM` ve `BAPI_TE_MEPOITEMX` append yapılarında aşağıdaki müşteri
alanlarının bulunduğunu kontrol edin:

- `ZZGRUND`
- `ZZALTNDN`
- `ZZSKTAR`

## 3. Stok ve validasyon

Fiziksel sayım ve kategori dağılımı bağımsız değerlerdir:

```text
Fark  = SapStock - MengeSayim
Diğer = max(SapStock - Üretim Hatalı - Fabrika Lojistik
           - Satış Firesi Katı - Sıvı - UHT - Cam, 0)
```

- Fiziksel sayım veya kategori dağılımı 18xx iade depo stokundan büyükse HTTP
  business error döner.
- `FARK` kategorisi fiziksel sayım snapshot'ını taşır ve UB/351 dağılımına
  katılmaz.
- Onaylanan çıkış miktarı güncel MARD stoğu, fiziksel sayım ve kategori
  dağılımı toplamının en küçüğüyle sınırlandırılır.
- Eşit ve eşit olmayan durumlar frontend'de ayrı gösterilir; eşit olmayan her
  satır kırmızı, yalnız fazla olan satır bloklayıcıdır.

## 4. Z tablo logları

Frontend her POST için 32 karakterlik `LogUid` üretir. Backend bu anahtarla
aşağıdaki tabloları doldurur:

- `ZMM_T_BDY_FSH_H`: işlem başlığı, durum ve idempotency
- `ZMM_T_BDY_FSH_I`: kategori/fark miktarı ile UB, 351, 311 ve 702 belge eşleşmesi

SE11 alanları, indeksler ve kilit nesnesi için
`SE11_ZMM_T_BDY_FSH.md` dosyasını uygulayın. SLG0/SLG1 bağımlılığı yoktur.

## 5. DPC_EXT entegrasyonu

`ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT_RETURN_FACTORY_SHIPMENT.abap` dosyasından:

1. Private section sabit, tip ve metot tanımlarını alın.
2. `CREATE_DEEP_ENTITY` içindeki `ReturnFactoryShipment` dalını mevcut ortak
   metoda ekleyin; bütün metodu ikinci kez tanımlamayın.
3. `VALIDATE_RETURN_FACTORY_ITEMS`, Z tablo kayıt yardımcıları ve
   `POST_RETURN_FACTORY_SHIPMENT` implementasyonlarını ekleyin.
4. Mevcut `RETURNFACTORYSTO_GET_ENTITYSET` içindeki geçici `ESP` / yalnız
   `1902` kısıtlarını canlıya geçerken kaldırın veya customizing'e taşıyın.
5. Sınıfı aktive edin ve `/IWFND/CACHE_CLEANUP` ile
   `/IWBEP/CACHE_CLEANUP` çalıştırın.

## 6. Gateway kabul testleri

En az şu senaryoları çalıştırın:

1. Yalnız Üretim Hatalı: bir `ZZGRUND=2` UB ve 351 belgesi.
2. Yalnız Fabrika Lojistik: bir `ZZGRUND=4`, boş `ZZALTNDN` kalemi.
3. Dört Satış Firesi alt türü: `ZZGRUND=4`, `ZZALTNDN=09`, dört ayrı kalem.
4. Üretim Hatalı + diğer kategoriler: iki ayrı UB; aynı UB içinde farklı
   `ZZGRUND` bulunmamalı.
5. Stok 5, dağılım 3, sayım 3: Diğer 2, Fark 2, çıkış en fazla 3.
6. Stok 5, dağılım 3, sayım 2: Diğer 2, Fark 3, çıkış en fazla 2.
7. Fiziksel sayım veya kategori dağılımı stoktan büyük: hiçbir UB veya malzeme
   belgesi oluşmamalı.
8. Aynı `LogUid` ile tekrar POST: `P` ve `S` durumlarında reddedilmeli; kısmi
   belge oluşmuş `E` kaydı otomatik tekrar edilmemelidir.

Tutanak formu dokümanı henüz paylaşılmadığı için form içeriği bu pakete dahil
değildir. Mevcut giden irsaliye tetiklemesi korunmuştur.
