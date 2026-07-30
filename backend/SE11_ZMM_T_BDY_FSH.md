# Fabrikaya İade Gönderim Log Tabloları

Log nesneleri proje isim standardına uygun olarak `ZMM_T_BDY_` önekiyle
tasarlanmıştır. SLG0/Application Log kullanılmaz.

## 1. Başlık: ZMM_T_BDY_FSH_H

- Açıklama: `Fabrikaya İade Gönderim Başlığı`
- Delivery Class: `A`
- Data Class: `APPL1`
- Size Category: `1`
- Buffering: `Not allowed`

| Key | Alan | Tip | Açıklama |
|---|---|---|---|
| X | MANDT | MANDT | Client |
| X | LOG_UID | SYSUUID_C32 | İşlem ve idempotency anahtarı |
|  | LGORT | LGORT_D | 19xx bölge depo yeri |
|  | SOURCE_LGORT | LGORT_D | 18xx iade depo yeri |
|  | WERKS | WERKS_D | Hedef fabrika |
|  | IRS_TAR | DATS | Gönderim tarihi |
|  | PLAKA_NO | `ZFLO_M_SEFER-PLAKA_NO` ile aynı veri elemanı | Araç plakası |
|  | STATUS | CHAR1 | P: işleniyor, S: başarılı, E: hata |
|  | LAST_STEP | `ZMM_DE_BDY_STEP` | İşlemin ulaştığı son adım |
|  | LAST_MESSAGE | `ZMM_DE_BDY_MSG` | Son hata/bilgi metni |
|  | ERNAM | ERNAM | Yaratan |
|  | ERDAT | ERDAT | Yaratma tarihi |
|  | ERZET | ERZET | Yaratma saati |
|  | AENAM | AENAM | Değiştiren |
|  | AEDAT | AEDAT | Değişiklik tarihi |
|  | AEZET | UZEIT | Değişiklik saati |

`ZMM_DE_BDY_MSG` veri elemanı için CHAR 255, `ZMM_DE_BDY_STEP` için CHAR 20
uzunluklu domain kullanın. Adım değerleri: `START`, `PO_CREATED`, `GI_351`,
`DIFF_311`, `DIFF_702`, `COMPLETE`, `ERROR`.

İkincil indeksler:

- `Z01`: `MANDT`, `STATUS`, `ERDAT`, `ERZET`
- `Z02`: `MANDT`, `PLAKA_NO`, `IRS_TAR`

## 2. Kategori Kalemi: ZMM_T_BDY_FSH_I

- Açıklama: `Fabrikaya İade Gönderim Kalemi`
- Delivery Class: `A`
- Data Class: `APPL1`
- Size Category: `2`
- Buffering: `Not allowed`

| Key | Alan | Tip | Açıklama |
|---|---|---|---|
| X | MANDT | MANDT | Client |
| X | LOG_UID | SYSUUID_C32 | Başlık anahtarı |
| X | POSNR | POSNR | Ekran kalem numarası |
| X | CATEGORY | `ZMM_DE_BDY_CAT` | Kategori kodu |
|  | MATNR | MATNR | Malzeme |
|  | MEINS | MEINS | Ölçü birimi |
|  | MENGE | MENGE_D | Kategori miktarı |
|  | SAP_STOCK | LABST | İşlem anındaki 18xx stok önerisi |
|  | ZZGRUND | `EKPO-ZZGRUND` | Ana neden |
|  | ZZALTNDN | `EKPO-ZZALTNDN` | Alt neden |
|  | ZZSKTAR | `EKPO-ZZSKTAR` | SKT tarihi |
|  | EBELN | EBELN | Oluşan UB siparişi |
|  | EBELP | EBELP | UB kalemi |
|  | MBLNR_351 | MBLNR | 351 malzeme belgesi |
|  | MJAHR_351 | MJAHR | 351 belge yılı |
|  | MBLNR_311 | MBLNR | Fark için 311 malzeme belgesi |
|  | MJAHR_311 | MJAHR | 311 belge yılı |
|  | MBLNR_702 | MBLNR | Fark için 702 malzeme belgesi |
|  | MJAHR_702 | MJAHR | 702 belge yılı |
|  | ERNAM | ERNAM | Yaratan |
|  | ERDAT | ERDAT | Yaratma tarihi |
|  | ERZET | ERZET | Yaratma saati |
|  | AENAM | AENAM | Değiştiren |
|  | AEDAT | AEDAT | Değişiklik tarihi |
|  | AEZET | UZEIT | Değişiklik saati |

`ZMM_DE_BDY_CAT` CHAR 10 olmalıdır. Kullanılan değerler:

- `URETIM`
- `FABLOJ`
- `SF-KATI`
- `SF-SIVI`
- `SF-UHT`
- `SF-CAM`
- `FARK`

`FARK` satırı, `SAP_STOCK - MENGE_SAYIM > 0` olduğunda ilgili ekran kalemi
için oluşturulur. `MENGE` fark miktarını taşır; 311 ve 702 belge numaraları
aynı satıra yazılır.

Foreign key: `LOG_UID` -> `ZMM_T_BDY_FSH_H-LOG_UID`.

İkincil indeksler:

- `Z01`: `MANDT`, `EBELN`, `EBELP`
- `Z02`: `MANDT`, `MBLNR_351`, `MJAHR_351`
- `Z03`: `MANDT`, `MBLNR_311`, `MJAHR_311`
- `Z04`: `MANDT`, `MBLNR_702`, `MJAHR_702`
- `Z05`: `MANDT`, `MATNR`, `ERDAT`

## 3. Kilit Nesnesi

`EZMM_T_BDY_FSH`:

- Primary table: `ZMM_T_BDY_FSH_H`
- Lock arguments: `MANDT`, `LOG_UID`
- Lock mode: `E`

Backend `_SCOPE = 1` kullanır. Aynı `LOG_UID` ile paralel ikinci istek
işlenmez.

## 4. İşlem ve idempotency kuralları

1. POST başında header `STATUS = P` olarak yazılır ve hemen commit edilir.
2. Kullanıcı kategori dağılımı BAPI çağrısından önce kalem tablosuna kaydedilir.
3. UB ve 351 belgeleri oluşunca kalem tablosundaki belge alanları doldurulur.
4. Stok farkı varsa `FARK` satırı açılır; 311/702 belge numaraları bu satırın
   ilgili alanlarına yazılır.
5. Başarılı bitişte header `STATUS = S`, hatada `STATUS = E` olur.
6. Aynı `LOG_UID` için `S` veya `P` kayıt varsa yeni işlem başlatılmaz.
7. `E` durumunda daha önce UB/351/311/702 belgesi oluşmuşsa otomatik tekrar engellenir;
   böyle bir kayıt kontrollü olarak incelenmeden yeni belge yaratılmamalıdır.
8. `E` durumunda hiçbir iş belgesi oluşmamışsa aynı `LOG_UID` ile tekrar
   denenebilir.
9. Sistem kesintisi sonrası `P` durumda kalan kayıtlar, ilgili UB ve malzeme
   belgeleri kontrol edildikten sonra yetkili destek kullanıcısı tarafından
   `E` durumuna alınabilir; doğrudan silinmemelidir.

## 5. Oluşturma sırası

1. `ZMM_DE_BDY_MSG`, `ZMM_DE_BDY_CAT`, `ZMM_DE_BDY_STEP` veri elemanlarını
   oluşturun.
2. `ZMM_T_BDY_FSH_H` tablosunu oluşturup aktive edin.
3. `ZMM_T_BDY_FSH_I` tablosunu oluşturup aktive edin.
4. Foreign key ve ikincil indeksleri ekleyin.
5. `EZMM_T_BDY_FSH` lock object'ini oluşturup aktive edin.
6. Generated enqueue/dequeue fonksiyonlarını SE37'de doğrulayın.
7. DPC_EXT patch'ini ekleyip aktive edin.
