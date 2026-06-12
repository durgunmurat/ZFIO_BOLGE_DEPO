# SEGW Projesinde Yapılacaklar

Proje: `ZMM_BOLGE_DEPO_YONETIM_SRV`

## 1. DepositGI Entity

1. SEGW projesini `Change` modunda açın.
2. `Data Model > Entity Types > DepositGI > Properties` bölümüne girin.
3. Yeni property ekleyin:
   - Name: `Meins`
   - ABAP Field Name: `MEINS`
   - EDM Core Type: `Edm.String`
   - Max Length: `3`
   - Nullable: ihtiyaca göre kapalı
4. `DepositGISet` entity setinde ek işlem gerekmez.
5. `TS_DEPOSITGI` ABAP yapısına `MEINS` alanının geldiğini kontrol edin.

## 2. ReturnItem Entity

Mevcut `IsDepozito` alanını kontrol edin:

- EDM Type: `Edm.Boolean`
- ABAP Field Name: `ISDEPOZITO`
- Nullable: `false`

İsteğe bağlı izleme alanları:

- `SourceVbeln`
  - ABAP: `SOURCEVBELN`
  - EDM: `Edm.String`
  - Max Length: `10`
- `IsExternal`
  - ABAP: `ISEXTERNAL`
  - EDM: `Edm.Boolean`

Frontend için bu iki alan zorunlu değildir.

## 3. ReturnHeader Entity

Mevcut `Status` alanı korunmalıdır:

- ABAP Field Name: `STATUS`
- EDM Type: `Edm.String`
- Max Length: `1`

Sorun metadata değil, DPC_EXT içindeki `ty_s_deep_return` yapısında `status`
component'inin eksik olmasıdır. SEGW dışında sınıf tanımına da eklenmelidir.

## 4. Navigation Kontrolü

Şunları doğrulayın:

- Association: `ReturnHeader` -> `ReturnItem`
- Navigation Property: `ToItems`
- Principal key: `ReturnHeader.LogUid`
- Dependent key: `ReturnItem.LogUid`
- Cardinality: `1 : N`

## 5. Runtime Artifacts

1. `Generate Runtime Objects` çalıştırın.
2. MPC ve DPC base sınıflarını regenerate edin.
3. `MPC_EXT` ve `DPC_EXT` içindeki özel kodların korunup korunmadığını kontrol edin.
4. Yeni property'nin `$metadata` içinde göründüğünü doğrulayın.
5. `/IWFND/CACHE_CLEANUP` çalıştırın.
6. `/IWBEP/CACHE_CLEANUP` çalıştırın.
7. Gerekirse `/IWFND/MAINT_SERVICE` üzerinden servisi yeniden yükleyin.

## 6. Gateway Testleri

### Metadata

```text
/sap/opu/odata/sap/ZMM_BOLGE_DEPO_YONETIM_SRV/$metadata
```

Kontroller:

- `DepositGI.Meins`
- `ReturnItem.IsDepozito` tipi `Edm.Boolean`
- `ReturnHeader.Status`

### Depozito kataloğu

```text
/DepositGISet?$format=json
```

Her satırda `Matnr`, `Maktx`, `Meins` dönmelidir.

### İade deep read

```text
/ReturnHeaderSet?$filter=Lgort eq '1901' and IrsTar eq datetime'2026-06-11T00:00:00'&$expand=ToItems&$format=json
```

Kontroller:

- Header `Status` boş olmamalı.
- Ürünlerde `IsDepozito=false`.
- Son ZDAI kalemlerinde `IsDepozito=true`.
- ZDAI miktarı `MengeSiparis` alanında olmalı.

### Deep create

Karışık payload ile test edin:

- En az bir ZBIS ürünü.
- En az bir mevcut ZDAI depozitosu.
- En az bir kullanıcı tarafından eklenen depozito.

Beklenen:

- Ürün sayımı tamamlanır.
- Eski ZDAI değişmez.
- Tek yeni ZDAI oluşur.
- `ZMM_T_BDY_IRS_DH-ZDAI_VBELN` dolar.
- Aynı payload tekrar gönderildiğinde ikinci ZDAI oluşmaz.

## 7. SaveReturnDepositDraft Function Import

Depozito ekleme, miktar değiştirme, `Tamam` işaretleme ve listeden çıkarma
işlemlerini Z tabloya yazmak için function import ekleyin:

- Name: `SaveReturnDepositDraft`
- HTTP Method: `POST`
- Return Type: mevcut basit durum entity tipi (`StatusReturn`) kullanılabilir
- Return Cardinality: `0..1`

Parametreler:

| Ad | EDM tipi | ABAP alan/tip |
|---|---|---|
| LogUid | Edm.String | SYSUUID_C32 |
| Plasiyer | Edm.String | KUNNR |
| Lgort | Edm.String | LGORT_D |
| Matnr | Edm.String | MATNR |
| Meins | Edm.String | MEINS |
| MengeSiparis | Edm.Decimal | KWMENG |
| MengeSayim | Edm.Decimal | KWMENG |
| IsExternal | Edm.Boolean | XFELD/ABAP_BOOL |
| IsConfirmed | Edm.Boolean | XFELD/ABAP_BOOL |
| IsDeleted | Edm.Boolean | XFELD/ABAP_BOOL |

`DPC_EXT->EXECUTE_ACTION` içinde `iv_action_name =
'SaveReturnDepositDraft'` dalı açılmalı ve parametreler
`it_parameter` tablosundan okunmalıdır.

Bu action yalnız:

1. `ZMM_T_BDY_IRS_DH` header kaydını `STATUS = D` olarak insert/update eder.
2. `ZMM_T_BDY_IRS_DI` kalemini `LOG_UID + MATNR` ile insert/update eder.
3. `IsDeleted=true` ise kalemi fiziksel silmek yerine `IS_DELETED = X` yapar.
4. ZDAI siparişi veya başka bir satış belgesi yaratmaz.

## 8. Nihai Onay Davranışı

`ReturnHeaderSet` deep create, `Sayımı Onayla` butonunun backend karşılığıdır.
Bu metotta:

1. Aynı `LOG_UID` için header kilitlenir.
2. Aktif taslak kalemler `ZMM_T_BDY_IRS_DI` tablosundan okunur.
3. Aktif kalemlerden biri onaysızsa işlem hata ile durdurulur.
4. ZDAI BAPI girdisi frontend payloadından değil bu taslak kalemlerden kurulur.
5. BAPI öncesi header `P`, başarıda `S` yapılır ve `ZDAI_VBELN` yazılır.
6. Aynı `LOG_UID` başarıyla işlenmişse mevcut `ZDAI_VBELN` döndürülür.
