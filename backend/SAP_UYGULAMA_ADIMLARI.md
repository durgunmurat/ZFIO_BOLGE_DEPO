# SAP Tarafında Kalan Uygulama Adımları

Mevcut nesneler:

- Başlık tablosu: `ZMM_T_BDY_IRS_DH`
- Kalem tablosu: `ZMM_T_BDY_IRS_DI`
- Lock object: `EZMM_T_BDY_IRS_D`

## 1. SE11 Nesnelerini Kontrol Et

### ZMM_T_BDY_IRS_DH

Alanlar:

| Key | Alan | Tip |
|---|---|---|
| X | MANDT | MANDT |
| X | LOG_UID | SYSUUID_C32 |
|  | PLASIYER | KUNNR |
|  | LGORT | LGORT_D |
|  | SOURCE_VBELN | VBELN_VA |
|  | ZDAI_VBELN | VBELN_VA |
|  | STATUS | CHAR1 |
|  | ERNAM | ERNAM |
|  | ERDAT | ERDAT |
|  | ERZET | ERZET |
|  | AENAM | AENAM |
|  | AEDAT | AEDAT |
|  | AEZET | UZEIT |

`STATUS` değerleri:

- `D`: Taslak
- `P`: ZDAI yaratılıyor
- `S`: Başarılı
- `E`: Hata

### ZMM_T_BDY_IRS_DI

| Key | Alan | Tip |
|---|---|---|
| X | MANDT | MANDT |
| X | LOG_UID | SYSUUID_C32 |
| X | MATNR | MATNR |
|  | POSNR | POSNR_VA |
|  | MEINS | MEINS |
|  | MENGE_SIPARIS | KWMENG |
|  | MENGE_SAYIM | KWMENG |
|  | IS_EXTERNAL | XFELD |
|  | IS_CONFIRMED | XFELD |
|  | IS_DELETED | XFELD |
|  | ERNAM | ERNAM |
|  | ERDAT | ERDAT |
|  | ERZET | ERZET |
|  | AENAM | AENAM |
|  | AEDAT | AEDAT |
|  | AEZET | UZEIT |

Kontroller:

1. İki tabloyu aktive et.
2. Teknik ayarlarda buffering `Not allowed` olsun.
3. Delivery class `A`, data class `APPL1` olsun.
4. Kalem tablosunda `LOG_UID` foreign key kontrolünü
   `ZMM_T_BDY_IRS_DH-LOG_UID` alanına bağla.
5. `EZMM_T_BDY_IRS_D` primary table olarak `ZMM_T_BDY_IRS_DH` kullansın.
6. Lock argument alanları `MANDT` ve `LOG_UID`, lock mode `E` olsun.
7. SE37'de aşağıdaki generated fonksiyonların oluştuğunu doğrula:
   - `ENQUEUE_EZMM_T_BDY_IRS_D`
   - `DEQUEUE_EZMM_T_BDY_IRS_D`

## 2. SEGW: DepositGI Alanını Kontrol Et

Proje: `ZMM_BOLGE_DEPO_YONETIM_SRV`

`Data Model > Entity Types > DepositGI > Properties`:

- Property: `Meins`
- ABAP Field Name: `MEINS`
- Type: `Edm.String`
- Max Length: `3`

Zaten varsa tekrar ekleme.

## 3. SEGW: Return Entity Alanlarını Kontrol Et

`ReturnItem`:

- `IsDepozito`
- ABAP Field Name: `ISDEPOZITO`
- Type: `Edm.Boolean`
- Nullable: kapalı

`ReturnHeader`:

- `Status`
- ABAP Field Name: `STATUS`
- Type: `Edm.String`
- Max Length: `1`

Navigation:

- `ReturnHeader` -> `ReturnItem`
- Navigation Property: `ToItems`
- Cardinality: `1:N`
- Bağlantı alanı: `LogUid`

## 4. SEGW: SaveReturnDepositDraft Function Import

`Data Model > Function Imports` altında oluştur:

- Name: `SaveReturnDepositDraft`
- HTTP Method: `POST`
- Return Type: boş bırakılabilir

Parametreler:

| Name | EDM Type | Length/Precision |
|---|---|---|
| LogUid | Edm.String | 32 |
| Plasiyer | Edm.String | 10 |
| Lgort | Edm.String | 4 |
| Matnr | Edm.String | DDIC `MATNR` uzunluğu |
| Meins | Edm.String | 3 |
| MengeSiparis | Edm.Decimal | Precision 15, Scale 3 |
| MengeSayim | Edm.Decimal | Precision 15, Scale 3 |
| IsExternal | Edm.Boolean | - |
| IsConfirmed | Edm.Boolean | - |
| IsDeleted | Edm.Boolean | - |

Parametre adları büyük/küçük harf dahil frontend ile aynı olmalıdır.

## 5. Runtime Artifacts Üret

1. `Generate Runtime Objects` çalıştır.
2. MPC ve DPC base sınıflarını yeniden üret.
3. Generated base sınıflara özel kod yazma.
4. Özel kodları yalnız `MPC_EXT` ve `DPC_EXT` sınıflarında tut.
5. `$metadata` içinde `SaveReturnDepositDraft` ve parametrelerini kontrol et.

## 6. DPC_EXT Private Section

`ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT` private section'a patch dosyasındaki
tanımları ekle:

- `ty_s_deposit_qty`
- `ty_t_deposit_qty`
- `ty_s_deposit_source`
- `ty_t_deposit_source`
- `append_latest_deposit_items`
- `create_deposit_order`
- `save_return_deposit_draft`
- `load_deposit_draft`

`load_deposit_draft` güncel imzası:

```abap
METHODS load_deposit_draft
  IMPORTING
    iv_log_uid        TYPE sysuuid_c32
    it_expected_items TYPE ty_t_return_item
  RETURNING
    VALUE(rt_items) TYPE ty_t_return_item
  RAISING
    /iwbep/cx_mgw_busi_exception.
```

Kaynak:

`ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT_RETURN_DEPOSIT.abap`

## 7. DPC_EXT Metotlarını Uygula

Aynı patch dosyasındaki implementasyonları sınıfa ekle:

1. `DEPOSITGISET_GET_ENTITYSET`
2. `FIND_LATEST_DEPOSIT_ORDER`
3. `APPEND_LATEST_DEPOSIT_ITEMS`
4. `SAVE_RETURN_DEPOSIT_DRAFT`
5. `LOAD_DEPOSIT_DRAFT`
6. `CREATE_DEPOSIT_ORDER`

Patch artık şu gerçek nesneleri kullanmaktadır:

- `ZMM_T_BDY_IRS_DH`
- `ZMM_T_BDY_IRS_DI`
- `ENQUEUE_EZMM_T_BDY_IRS_D`
- `DEQUEUE_EZMM_T_BDY_IRS_D`

## 8. EXECUTE_ACTION Entegrasyonu

Mevcut `EXECUTE_ACTION` metoduna
`iv_action_name = 'SaveReturnDepositDraft'` dalını ekle.

Bu dal:

1. `it_parameter` içinden function import parametrelerini okur.
2. Boolean metinlerini `abap_bool` değerine çevirir.
3. `save_return_deposit_draft` metodunu çağırır.
4. ZDAI BAPI çağırmaz.
5. İşlem tamamlanınca `RETURN` ile çıkar.

Patch dosyasının sonundaki `EXECUTE_ACTION entegrasyonu` bloğunu kullan.

Gateway sürümüne göre `Edm.Boolean` parametresi `true`, `TRUE`, `X` veya `1`
olarak gelebilir. Boolean dönüşümü bu değerlerin tamamını kabul etmelidir.

## 9. LOAD_RETURN_DATA Entegrasyonu

Mevcut iade header ve ürün kalemleri okunduktan sonra:

```abap
append_latest_deposit_items(
  EXPORTING
    it_headers = et_headers
  CHANGING
    ct_items   = et_items ).
```

Amaç, plasiyerin son ZDAI siparişindeki depozito malzemelerini ReturnCount
ekranına `IsDepozito = abap_true` olarak eklemektir.

## 10. CREATE_DEEP_ENTITY Entegrasyonu

`ReturnHeaderSet` deep create içinde:

1. Ürünleri ve depozitoları `IsDepozito` ile ayır.
2. Ürün kontrollerini yalnız ürün kalemleri için çalıştır.
3. Eski `ensure_deposit_items` / mevcut ZDAI değiştirme akışını kaldır.
4. Depozitoları frontend payloadından siparişleştirme.
5. Taslağı Z tablodan oku:

```abap
DATA(lt_confirmed_deposits) = load_deposit_draft(
  iv_log_uid        = lv_log_uid
  it_expected_items = lt_payload_deposits ).
```

6. Yeni ZDAI'yi yalnız burada yarat:

```abap
DATA(lv_new_zdai) = create_deposit_order(
  iv_log_uid  = lv_log_uid
  iv_plasiyer = CONV kunnr( ls_deep-plasiyer )
  iv_lgort    = CONV lgort_d( ls_deep-lgort )
  it_items    = lt_confirmed_deposits ).
```

7. Aktif fakat `IS_CONFIRMED` boş kalem varsa işlemi reddet.
8. Başarıda `ZMM_T_BDY_IRS_DH-STATUS = 'S'` ve `ZDAI_VBELN` alanını doldur.
9. Aynı `LOG_UID` için başarılı kayıt varsa ikinci ZDAI yaratma.
10. Ürün logu, ZDAI BAPI ve header güncellemesi başarılı olduktan sonra
    transaction'ı tamamla.

## 11. Sınıf ve Servis Aktivasyonu

1. `ZCL_ZMM_BOLGE_DEPO_YON_MPC_EXT` sınıfını aktive et.
2. `ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT` sınıfını aktive et.
3. İlgili inactive DDIC ve Gateway nesnelerini aktive et.
4. `/IWFND/CACHE_CLEANUP` çalıştır.
5. `/IWBEP/CACHE_CLEANUP` çalıştır.
6. `/IWFND/MAINT_SERVICE` içinde servisin aktif olduğunu kontrol et.

## 12. Gateway Test Sırası

### Metadata

```text
/sap/opu/odata/sap/ZMM_BOLGE_DEPO_YONETIM_SRV/$metadata
```

Kontrol:

- `SaveReturnDepositDraft`
- Function import parametreleri
- `DepositGI.Meins`
- `ReturnItem.IsDepozito`
- `ReturnHeader.Status`

### Taslak ekleme

`POST`:

```text
/sap/opu/odata/sap/ZMM_BOLGE_DEPO_YONETIM_SRV/SaveReturnDepositDraft
 ?LogUid='...'
 &Plasiyer='...'
 &Lgort='...'
 &Matnr='...'
 &Meins='ADT'
 &MengeSiparis=1
 &MengeSayim=2
 &IsExternal=true
 &IsConfirmed=false
 &IsDeleted=false
```

Beklenen:

- `ZMM_T_BDY_IRS_DH` içinde `STATUS = D`
- `ZMM_T_BDY_IRS_DI` içinde kalem kaydı
- Satış siparişi oluşmaması

### Tamam işaretleme

Aynı action'ı `IsConfirmed=true` ile çağır.

Beklenen:

- Kalemde `IS_CONFIRMED = X`
- Henüz ZDAI oluşmaması

### Nihai onay

Frontend veya `/IWFND/GW_CLIENT` üzerinden `ReturnHeaderSet` deep create çağır.

Beklenen:

- Yeni ZDAI oluşması
- Header `STATUS = S`
- `ZDAI_VBELN` dolması
- İkinci aynı çağrıda yeni sipariş oluşmaması

## 13. Frontend Deploy Öncesi Son Kontrol

Frontend'i deploy etmeden önce:

1. Function import metadata içinde görünmeli.
2. Taslak POST çağrısı HTTP 2xx dönmeli.
3. Header ve kalem Z tabloları dolmalı.
4. Taslak kayıt sırasında ZDAI oluşmamalı.
5. ZDAI yalnız `Sayımı Onayla` çağrısında oluşmalı.

## 14. ZDAI Sipariş Kuralları

DPC_EXT private section'a aşağıdaki sabitleri ekle:

```abap
CONSTANTS:
  gc_abrvw_deposit TYPE abrvw VALUE '6',
  gc_vkorg         TYPE vkorg VALUE '1000',
  gc_vtweg         TYPE vtweg VALUE '10',
  gc_spart         TYPE spart VALUE '00'.
```

`CREATE_DEPOSIT_ORDER` içinde:

1. `SALES_ORG`, `DISTR_CHAN` ve `DIVISION` bu sabitlerden doldurulur.
2. Plasiyer hem `AG` hem `WE` partneri olarak gönderilir.
3. Tesis önce `KNVV-VWERK` alanından, `1000/10/00` satış alanına göre okunur.
4. Her ZDAI kaleminde `DLVSCHDUSE = '6'` ve `SALES_UNIT = MEINS` doldurulur.
5. İrsaliye tarihi başlık ve termin satırına; irsaliye numarası
   `PURCH_NO_C` alanına aktarılır.
6. `TVAK-VBTYP` okunur ve `SD_OBJECT_TYPE_DETERMINE` ile business object
   belirlenir.
7. Sipariş `SD_SALESDOCUMENT_CREATE` ile oluşturulur.
8. `RETURN` tablosundaki `A`, `E`, `X` mesajları, `ERROR_MESSAGE`
   exception'ı ve boş sipariş numarası hata kabul edilir.
9. Başarılı çağrıdan sonra metot içinde commit atılmaz. Sipariş ve Z tablo
   değişiklikleri `CREATE_DEEP_ENTITY` sonundaki tek commit ile tamamlanır.
