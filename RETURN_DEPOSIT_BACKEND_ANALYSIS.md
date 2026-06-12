# İade Sayım Depozito Backend Değişiklikleri

Bu doküman gönderilen `ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT` ve MPC koduna göre
hazırlanmıştır.

Hazırlanan uygulanabilir kod ve işlem dosyaları `backend/` klasöründedir.

## Güncel Karar: Taslak ve Nihai Onay Ayrımı

Depozito siparişi kullanıcı depozito eklediğinde veya miktar değiştirdiğinde
yaratılmamalıdır.

- Depozito ekleme, miktar, `Tamam` ve silme işlemleri
  `SaveReturnDepositDraft` ile Z tablolara yazılır.
- Header/taslak durumu `ZMM_T_BDY_IRS_DH` tablosunda tutulur.
- Kalemler `ZMM_T_BDY_IRS_DI` tablosunda tutulur.
- Yeni eklenen depozito otomatik tamamlanmış sayılmaz.
- Ürün ve depozito kalemlerinin tamamı onaylanmadan `Sayımı Onayla`
  aktif olmamalıdır.
- ZDAI yalnız `ReturnHeaderSet` deep create sırasında, aktif ve onaylı taslak
  kalemler Z tablodan okunarak yaratılır.
- Nihai işlem frontend depozito payloadına güvenmemeli; Z tabloyu doğruluk
  kaynağı olarak kullanmalıdır.

## Mevcut Durumdaki Temel Problem

Frontend, sayım onayında ürünleri ve depozitoları aynı `ReturnHeaderSet`
deep-create isteğinde gönderiyor.

Mevcut `CREATE_DEEP_ENTITY` kodu ise:

- Bütün kalemler depozito ise `lv_deposit_only = abap_true` kabul ediyor.
- Son aktif ZDAI siparişini `find_latest_deposit_order` ile buluyor.
- `ensure_deposit_items` ile bulunan eski ZDAI siparişine yeni kalem ekliyor.
- Payload içinde en az bir ürün varsa ZBIS akışına giriyor ve depozito kalemleri
  için ZDAI işlemi yapmıyor.

Yeni ihtiyaçta eski ZDAI değiştirilmemeli. Sayımı girilen depozitolar
toplanarak **yeni bir ZDAI siparişi** yaratılmalıdır.

## 1. MPC Değişiklikleri

### `TS_DEPOSITGI`

Mevcut yapı yalnızca `MATNR` ve `MAKTX` içeriyor:

```abap
begin of TS_DEPOSITGI,
  MATNR type string,
  MAKTX type string,
end of TS_DEPOSITGI.
```

En azından ölçü birimi eklenmelidir:

```abap
MEINS type string,
```

SEGW modelinde de `DepositGI` entity'sine `Meins` property eklenmelidir.
Frontend şu anda alan gelmediği için `ADT` varsayıyor. Bu her malzeme için
doğru olmayabilir.

İhtiyaca göre aşağıdaki alanlar da eklenebilir:

- `Active`: katalogda kullanılabilirlik.
- `PaletSepet`: depozito sınıfı.

### `TS_RETURNITEM`

Mevcut `ISDEPOZITO TYPE FLAG` tanımı OData metadata'da `Edm.Boolean`
üretmektedir ve korunmalıdır.

İzlenebilirlik için önerilen ilave alanlar:

```abap
SOURCEVBELN type string, "Kalemin geldiği son ZDAI
ISEXTERNAL  type FLAG,   "Kullanıcı tarafından ayrıca seçildi
```

Bu alanlar zorunlu değildir; ancak son ZDAI kalemi ile kullanıcı tarafından
eklenen depozitoyu ayırmayı kolaylaştırır.

### Deep response yapısı

`ty_s_deep_return` içinde header alanları fiziksel üst seviye component olarak
tanımlanmış. Bu yaklaşım doğru. Ancak yapıda `status` alanı eksik.

Şu alan eklenmelidir:

```abap
status TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-status,
```

`<deep_return> = CORRESPONDING #( <header> )` çalıştığında `Status` böylece
expand cevabına da yazılır. Şu anda `$expand=ToItems` cevabında status boş
geldiği için frontend ikinci bir istek yapmak zorunda kalıyor.

## 2. `DEPOSITGISET_GET_ENTITYSET`

Mevcut sorgu:

```abap
SELECT matnr, maktx
  FROM zmm_t_bdy_0003
  INTO TABLE @DATA(lt_deposit).
```

Ölçü birimi katalog tablosunda tutuluyorsa doğrudan seçilmelidir. Tutulmuyorsa
`MARA-MEINS` ile join yapılmalıdır:

```abap
SELECT d~matnr,
       d~maktx,
       m~meins
  FROM zmm_t_bdy_0003 AS d
  INNER JOIN mara AS m
    ON m~matnr = d~matnr
  INTO TABLE @DATA(lt_deposit).
```

OData çıktısına geçmeden önce gerekiyorsa
`CONVERSION_EXIT_CUNIT_OUTPUT` uygulanmalıdır.

## 3. `LOAD_RETURN_DATA`

### Mevcut ürün akışı

`zmm_t_bdy_irs_i` kalemleri okunuyor, ZBIS sipariş miktarları `VBAP` üzerinden
hesaplanıyor ve `MARA-MTART = 'ZSTK'` ise `IsDepozito = true` atanıyor.

Ancak log tablosunda henüz depozito kaydı yoksa son ZDAI kalemleri
`et_items` içine hiç eklenmiyor. Bu nedenle frontend depozito paneli boş
kalıyor.

### Yapılması gereken

Her ilgili plasiyer için son ZDAI siparişi bulunmalı ve kalemleri okunmalıdır.

Son ZDAI seçiminde yalnızca `AUART` ve `KUNNR` yeterli değildir. İş kuralına
göre mümkünse şunlar da dikkate alınmalıdır:

- `VBAK-AUART = 'ZDAI'`
- plasiyer / sold-to bilgisi
- satış organizasyonu, dağıtım kanalı ve bölüm
- depo veya tesisle ilişkili alan
- reddedilmemiş kalemler
- sipariş tarih ve saati

Son kayıt belirlenirken:

```abap
ORDER BY erdat DESCENDING, erzet DESCENDING, vbeln DESCENDING
```

kullanılabilir. Yalnızca en büyük `VBELN` son sipariş kabul edilmemelidir.

Bulunan siparişin `VBAP` kalemleri malzeme bazında toplanmalı ve
`et_items` içine eklenmelidir:

```abap
APPEND VALUE #(
  loguid       = <header>-loguid
  posnr        = <zdai_item>-posnr
  matnr        = <zdai_item>-matnr
  maktx        = ...
  meins        = <zdai_item>-vrkme
  mengesiparis = <zdai_item>-kwmeng
  mengesayim   = 0
  mengefire    = 0
  mengekalite  = 0
  mengesatilab = 0
  isdepozito   = abap_true )
  TO et_items.
```

Tamamlanmış sayımda daha önce `zmm_t_bdy_irs_i` tablosuna kaydedilmiş depozito
sayım değerleri varsa `MengeSayim` bu kayıttan doldurulmalıdır.

Aynı plasiyerin birden fazla irsaliyesi varsa depozito kalemleri teknik olarak
birden fazla header altında dönebilir. Frontend malzeme bazında tekilleştiriyor;
ancak daha temiz çözüm depozitoları grup seviyesinde ayrı navigation altında
döndürmektir.

## 4. `GET_EXPANDED_ENTITYSET`

`ReturnHeaderSet` bölümü genel olarak doğru:

```abap
load_return_data( ... ).
<deep_return> = CORRESPONDING #( <header> ).
```

Yapılması gerekenler:

1. `ty_s_deep_return` yapısına `status` eklenmeli.
2. `load_return_data` tarafından eklenen ZDAI depozito kalemleri de ilgili
   `LogUid` ile `ToItems` içine alınmalı.
3. `et_expanded_tech_clauses` içine `TOITEMS` eklenmeye devam edilmeli.

Bu düzeltmeden sonra expand'li ve expand'siz header cevaplarında aynı `Status`
değeri dönmelidir.

## 5. `CREATE_DEEP_ENTITY`

Bu metotta ana değişiklik yapılmalıdır.

### Kalemleri ikiye ayırma

Frontend'den gelen `IsDepozito` bilgisine doğrudan güvenilmemesi doğru.
Mevcut kodda `MARA-MTART = 'ZSTK'` kontrolüyle flag tekrar hesaplanıyor; bu
korunmalıdır.

Sonrasında kalemler iki tabloya ayrılmalıdır:

```abap
DATA(lt_product_items) = FILTER ty_t_return_item(
  ls_deep-toitems WHERE isdepozito = abap_false ).

DATA(lt_deposit_items) = FILTER ty_t_return_item(
  ls_deep-toitems WHERE isdepozito = abap_true ).
```

`lv_deposit_only` üzerinden bütün isteği tek tipe çevirmek yerine iki koleksiyon
ayrı işlenmelidir.

### Ürün kalemleri

Ürün varsa mevcut ZBIS kontrolleri devam etmelidir:

- `ls_deep-vbelnva` zorunlu olmalı.
- Sipariş tipi `ZBIS` olmalı.
- `MengeSiparis` frontend'den alınmamalı, `VBAP` üzerinden hesaplanmalı.
- Mevcut sayım ve log güncelleme işlemleri korunmalı.
- `update_return_reasons` tekrar açılacaksa yalnız ürün kalemleri gönderilmeli.

### Depozito kalemleri

Depozito varsa:

- Eski ZDAI siparişi değiştirilmemeli.
- `find_latest_deposit_order` yalnızca ekranda gösterilecek kaynak siparişi
  bulmak için kullanılmalı.
- `ensure_deposit_items` içindeki `BAPI_SALESORDER_CHANGE` akışı kaldırılmalı
  veya artık kullanılmamalı.
- Yeni bir `create_deposit_order` metodu yazılmalı.
- Yeni ZDAI siparişi `BAPI_SALESORDER_CREATEFROMDAT2` ile yaratılmalı.
- Sipariş miktarı olarak `MengeSayim` kullanılmalı.

## 6. Yeni `CREATE_DEPOSIT_ORDER` Metodu

Önerilen imza:

```abap
METHODS create_deposit_order
  IMPORTING
    iv_plasiyer TYPE kunnr
    iv_lgort    TYPE lgort_d
    it_items    TYPE ty_t_return_item
  RETURNING
    VALUE(rv_vbeln) TYPE vbeln_va
  RAISING
    /iwbep/cx_mgw_busi_exception.
```

### Kontroller

- Yalnız `IsDepozito = abap_true` kalemler alınmalı.
- `MengeSayim <= 0` olanlar siparişe eklenmemeli.
- Aynı malzeme birden fazla geldiyse miktarlar toplanmalı.
- Malzeme `MARA-MTART = 'ZSTK'` olmalı.
- Ölçü birimi frontend'den körü körüne alınmamalı; satış veya temel ölçü birimi
  backend'den doğrulanmalı.
- Plasiyer/customer ve satış alanı bilgileri backend'den belirlenmeli.

### BAPI başlığı

İşletmenin ZDAI sipariş yaratma kuralına göre doldurulmalıdır. Örnek:

```abap
ls_order_header_in-doc_type   = gc_auart_deposit.
ls_order_header_in-sold_to    = lv_plasiyer.
ls_order_header_in-sales_org  = ...
ls_order_header_in-distr_chan = ...
ls_order_header_in-division   = ...
```

Gerekli partner rolleri `ORDER_PARTNERS` tablosuna eklenmelidir. Bu bilgiler
mevcut son ZDAI siparişinin başlık/partner yapısından kopyalanacaksa
`find_latest_deposit_order` kaynak şablon siparişi bulmak için kullanılabilir.

### BAPI kalemleri

Her depozito için:

```abap
APPEND VALUE #(
  itm_number = lv_posnr
  material   = <deposit>-matnr
  target_qty = <deposit>-mengesayim
  target_qu  = <deposit>-meins
  plant      = lv_werks
  store_loc  = iv_lgort )
  TO lt_order_items_in.
```

Gerekirse schedule line tabloları da doldurulmalıdır.

### Hata ve commit

```abap
CALL FUNCTION 'BAPI_SALESORDER_CREATEFROMDAT2' ...
```

Sonrasında `E` veya `A` mesajı varsa:

- `BAPI_TRANSACTION_ROLLBACK`
- mevcut `raise_bapi_messages` ile OData business exception

Başarılıysa bu yardımcı metodun içinde commit yapılmamalıdır. Ana
`CREATE_DEEP_ENTITY` işlemi log kayıtlarıyla birlikte tek commit yapmalıdır.

## 7. Log Tabloları

### Header

Mevcut kod:

```abap
UPDATE zmm_t_bdy_irs_h SET status = 'S'
 WHERE log_uid = lv_log_uid.
```

Bu işlem BAPI ve item logları başarılı olduktan sonra yapılmalıdır. Şu an
header daha erken `S` yapılıyor; sonraki işlem hata verirse rollback uygulanması
zorunludur.

### Item

Depozito kalemleri `zmm_t_bdy_irs_i` tablosuna yazılmalıdır. Kullanıcı
tarafından yeni eklenen depozitonun mevcut DB satırı olmayabilir.

Bu nedenle `MOVE-CORRESPONDING ls_log` sonrasında mutlaka:

```abap
CLEAR ls_log_items.
ls_log_items-log_uid = lv_log_uid.
ls_log_items-posnr   = <item>-posnr.
ls_log_items-matnr   = <item>-matnr.
ls_log_items-meins   = <item>-meins.
```

alanları açıkça doldurulmalıdır.

Mevcut loop içinde `ls_log_items` her iterasyonda temizlenmiyor. Önceki
kalemin alanlarının sonraki kaleme taşınma riski vardır. `CLEAR ls_log_items`
loop'un başına alınmalıdır.

Yeni yaratılan ZDAI numarasının izlenebilmesi için öneri:

- header tablosuna `ZDAI_VBELN` alanı eklemek veya
- ayrı bir sayım/ZDAI ilişki tablosu oluşturmak.

## 8. Mevcut Yardımcı Metotların Yeni Rolü

### `FIND_LATEST_DEPOSIT_ORDER`

Kalabilir; ancak artık sipariş değiştirmek için değil:

- ekranda gösterilecek son ZDAI kalemlerini bulmak,
- yeni sipariş için satış alanı/partner şablonu almak

amacıyla kullanılmalıdır.

Mevcut `VBUK-GBSTK <> 'C'` filtresi yalnız aktif siparişleri getiriyor.
"Son ZDAI siparişi" tamamlanmış siparişleri de kapsıyorsa bu filtre
kaldırılmalı veya iş kuralına göre değiştirilmelidir.

### `ENSURE_DEPOSIT_ITEMS`

Bu metot eski ZDAI üzerinde `BAPI_SALESORDER_CHANGE` yaptığı için yeni
ihtiyaca uygun değildir.

Seçenekler:

1. Metodu kaldırıp `create_deposit_order` yazmak.
2. Metodu tamamen yeniden yazarak yeni ZDAI yaratan metoda dönüştürmek.

İsim olarak `create_deposit_order` kullanılması daha anlaşılırdır.

## 9. Atomiklik Sorunu

Frontend seçilen her irsaliye için ayrı `ReturnHeaderSet` create isteği
gönderiyor. Depozitolar yalnız ilk istekte gönderiliyor.

Riskli senaryo:

1. İlk istek yeni ZDAI'yı yaratır.
2. İkinci irsaliye isteği hata verir.
3. ZDAI yaratılmış fakat grup onayı yarım kalmış olur.

Sağlam çözüm grup seviyesinde tek deep entity/action oluşturmaktır:

```text
ReturnCountApprovalSet
  ToReturnHeaders
  ToReturnItems
  ToDepositItems
```

Backend bütün irsaliyeleri ve depozitoları tek SAP LUW içinde işlemeli,
başarılıysa tek commit, hatada tek rollback yapmalıdır.

Kısa vadede mevcut endpoint kullanılacaksa:

- frontend bir `RequestId` göndermeli,
- backend aynı `RequestId` ile ikinci ZDAI yaratmamalı,
- yaratılan ZDAI ile `LogUid` ilişkisi saklanmalıdır.

## 10. Önerilen İşlem Sırası

`CREATE_DEEP_ENTITY` içinde önerilen sıralama:

1. Payload'u oku.
2. Malzemeleri ve negatif miktarları doğrula.
3. `MARA-MTART` üzerinden ürün/depozito ayrımını yap.
4. Ürünler için ZBIS referans ve miktar kontrollerini yap.
5. Depozitoları malzeme bazında topla.
6. Depozito varsa yeni ZDAI siparişi yarat.
7. Ürün ve depozito sayım loglarını hazırla.
8. Item loglarını yaz.
9. Header status'unu `S` yap.
10. Tüm BAPI ve DB işlemleri başarılıysa tek commit yap.
11. Hata halinde BAPI rollback ve OData business exception dön.

## Öncelik Sırası

### Zorunlu

1. `ty_s_deep_return` yapısına `status` eklenmesi.
2. `load_return_data` içinde son ZDAI kalemlerinin `IsDepozito=true` olarak
   dönülmesi.
3. Mixed payload desteği: ürün ve depozitoların ayrı işlenmesi.
4. Eski ZDAI'yı değiştirmek yerine yeni ZDAI yaratılması.
5. Yeni depozitoların log tablosuna doğru key ve alanlarla yazılması.

### Güçlü öneri

1. `DepositGI` entity'sine `Meins` eklenmesi.
2. Grup seviyesinde atomik onay endpoint'i.
3. Request ID/idempotency kontrolü.
4. Yaratılan ZDAI numarasının loglanması.
