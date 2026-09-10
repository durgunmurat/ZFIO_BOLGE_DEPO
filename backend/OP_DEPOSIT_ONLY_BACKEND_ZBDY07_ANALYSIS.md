# OP İrsaliyesiz Yalnız Depozito Akışı

Bu doküman `ReturnCount` ekranından, mevcut bir OP irsaliyesine bağlı olmadan
plasiyer seçilip yalnız depozito sayımı girilmesi için gereken OData ve ZBDY07
değişikliklerini tarif eder.

> Karar: `LOAD_RETURN_DATA` içindeki
> `AND zmm_t_bdy_irs_h~erdat IN @lr_irs_tar` satırı aynen korunacaktır.

## Kaynak Kod Müdahale Haritası

Gönderilen metin dosyalarındaki mevcut satır numaralarına göre başlangıç
noktaları aşağıdadır. Kod değiştikçe satır numaraları kayabilir; metot/FORM
adları esas alınmalıdır.

| Katman | Müdahale noktası | Mevcut konum | Yapılacak iş |
|---|---|---:|---|
| OData | `CREATE_DEEP_ENTITY` | `odata backend.txt:466` | Ürünsüz OP depozito payloadını kabul et; Sütaş kontrolünü `LogUid` bazlı yap; depozito/ZDAI akışını ürün bloğından ayır. |
| OData | `EXECUTE_ACTION` | `odata backend.txt:4530` civarı | Yeni `CreateReturnDepositDraft` action'ını yönlendir. |
| OData | `APPEND_LATEST_DEPOSIT_ITEMS` | `odata backend.txt:4843` | GET sırasında silme yapan ve tek `lv_guid/lv_exists` kullanan yapıyı başlık bazlı, salt-okunur hale getir. |
| OData | `CREATE_DEPOSIT_ORDER` | `odata backend.txt:5940` | Manuel OP için boş irsaliye numarası, idempotency ve DH durum geçişlerini destekle. |
| OData | `LOAD_RETURN_DATA` | `odata backend.txt:7914` | Teknik başlığı ve DI kalemlerini yeni UI alanlarıyla döndür; `ERDAT` koşulunu koru. |
| OData | korunacak filtre | `odata backend.txt:8019` | `AND zmm_t_bdy_irs_h~erdat IN @lr_irs_tar` satırını değiştirme. |
| OData | `SAVE_RETURN_DEPOSIT_DRAFT` | `odata backend.txt:10542` | Teknik başlık sahiplik kontrolü, ZSTK kontrolü ve soft-delete uygula. |
| ZBDY07 | `START-OF-SELECTION` | `zmm_r_bdy_irsaliye_giris.txt:12` | Teknik başlığın irsaliye giriş akışına düşmesini açıkça engelle. |
| ZBDY07 | `GET_SAYIM_DATA` | `zmm_r_bdy_irsaliye_giris.txt:1128` | Yalnız depozito kaydını H+DH+DI üzerinden sayım ekranına taşı. |
| ZBDY07 | `CREATE_MONO_ZDAI` çağrısı | `zmm_r_bdy_irsaliye_giris.txt:4115` | Manuel OP kaydı için bu çağrıyı atla. |
| ZBDY07 | `APPROVE_DEPOZITO_SAYIM` | `zmm_r_bdy_irsaliye_giris.txt:4697` | Ürün satırı olmadan onay, durum ve tekrar deneme kurallarını uygula. |
| ZBDY07 | `CREATE_DLV_AND_GM_DEPOZITO` | `zmm_r_bdy_irsaliye_giris.txt:5581` | ZDAI bazlı lojistik belge yaratımını ürün satırından bağımsız doğrula. |

## 1. Ön Yüz–Backend Sözleşmesi

Ön yüz aşağıdaki yeni function import'u çağırır:

```text
POST CreateReturnDepositDraft
  Plasiyer    Edm.String
  Lgort       Edm.String
  IrsTar      Edm.DateTime
  ShipmentType Edm.String   // yalnız OP kabul edilmeli

Return type: ReturnHeader
Zorunlu dönüş alanı: LogUid
```

Ardından mevcut `SaveReturnDepositDraft` ile her depozito kalemini kaydeder.
Nihai onay mevcut `POST ReturnHeaderSet` deep insert'i üzerinden yapılır ve
`IsDepositOnly=true` gönderilir. Backend teknik akışı ayrıca LogUid ile okunan
H/DH kaydından doğrular.

## 2. SEGW Model Değişiklikleri

### 2.1 ReturnHeader

`ReturnHeader` entity'sine aşağıdaki property eklenmelidir:

```text
IsDepositOnly  Edm.Boolean  Nullable=false
```

Frontend bu alan yokken de teknik başlığı çıkarabilir. Alan kullanılırsa
veritabanında karşılığı olmak zorunda değildir. DPC_EXT içinde şu
kuralla hesaplanabilir:

```text
SHIPMENT_TYPE = 'OP'
DEPOZITO_IADE = 'X'
VBELN_VA      = initial
IRS_NO        = initial
```

Taslak onay durumunun sayfa yenilemesinde kaybolmaması için `ReturnItem`
entity'sine de şu alanlar eklenmelidir:

```text
IsConfirmed  Edm.Boolean  Nullable=false
IsExternal   Edm.Boolean  Nullable=false
```

DI'dan dönen satırlarda bunlar sırasıyla `IS_CONFIRMED` ve `IS_EXTERNAL`
alanlarından doldurulmalıdır. Ürün satırlarında ikisi de `false` olabilir.

### 2.2 Function import

`CreateReturnDepositDraft`:

- HTTP method: `POST`
- Return type: `ReturnHeader`
- Entity set: `ReturnHeaderSet`
- Parametre adları büyük/küçük harf dahil ön yüz sözleşmesiyle aynı olmalıdır.

Model değişikliğinden sonra runtime object'ler yeniden üretilmeli; değişiklikler
`DPC_EXT` ve `MPC_EXT` katmanında tutulmalıdır.

## 3. CREATE_RETURN_DEPOSIT_DRAFT Metodu

DPC_EXT private metoduna önerilen imza:

```abap
METHODS create_return_deposit_draft
  IMPORTING
    iv_plasiyer     TYPE kunnr
    iv_lgort        TYPE lgort_d
    iv_irs_tar      TYPE dats
    iv_shipment_type TYPE char2
  RETURNING
    VALUE(rs_header) TYPE zcl_zmm_bolge_depo_yon_mpc=>ts_returnheader
  RAISING
    /iwbep/cx_mgw_busi_exception.
```

### 3.1 Validasyon

1. `ShipmentType` yalnız `OP` olmalıdır.
2. Plasiyer, depo ve tarih boş olamaz.
3. Plasiyer ALPHA input formatına çevrilmelidir.
4. Plasiyer aktif olmalıdır:
   - `KNA1-KTOKD = 'Z01'`
   - `KNA1-AUFSD = space`
   - `KNVV-VKORG = '1000'`
   - `KNVV-VTWEG = '10'`
   - `KNVV-SPART = '00'`
5. Kullanıcının plasiyerin satış bürosu için `Z_VBRP_VKB/03` yetkisi backend'de
   tekrar doğrulanmalıdır.
6. `LGORT`, oturum kullanıcısının yetkili deposu olmalıdır. Sadece frontend'den
   gelen değere güvenilmemelidir.

### 3.2 Aynı taslağın tekrar kullanılma kuralı

Aynı iş anahtarı için birden fazla açık taslak yaratılmamalıdır:

```text
PLASIYER + LGORT + IRS_TAR + SHIPMENT_TYPE='OP' + DEPOZITO_IADE='X'
+ VBELN_VA boş + IRS_NO boş + STATUS='N'
```

Akış:

1. İş anahtarı bazında enqueue alınır.
2. Yukarıdaki koşullarda açık H kaydı aranır.
3. Varsa mevcut `LogUid` döndürülür.
4. Yoksa UUID C32 üretilir ve H + DH oluşturulur.
5. Commit sonrası enqueue bırakılır.

Mevcut `EZMM_T_BDY_IRS_D` yalnız `LogUid` ile kilitlediği için iki paralel
"oluştur" isteğini tek başına engelleyemez. İş anahtarı için ayrı lock object
veya eşdeğer atomik kontrol gerekir.

### 3.3 Oluşturulacak H kaydı

```abap
ls_h-log_uid       = lv_log_uid.
ls_h-vbeln_va      = space.
ls_h-irs_no        = space.
ls_h-irs_tar       = iv_irs_tar.
ls_h-lgort         = iv_lgort.
ls_h-plasiyer      = lv_plasiyer.
ls_h-kunnr         = lv_plasiyer.
ls_h-shipment_type = 'OP'.
ls_h-return_type   = 'P'.
ls_h-depozito_iade = abap_true.
ls_h-status        = 'N'.
```

Audit alanları doldurulmalıdır. Bu kayıt teknik başlıktır; ürün kalemi ve
irsaliye görseli olmayacaktır.

### 3.4 Oluşturulacak DH kaydı

```abap
ls_dh-log_uid      = lv_log_uid.
ls_dh-plasiyer     = lv_plasiyer.
ls_dh-lgort        = iv_lgort.
ls_dh-source_vbeln = space.
ls_dh-zdai_vbeln   = space.
ls_dh-status       = 'D'.
```

H veya DH yazılamazsa ikisi de rollback edilmelidir.

## 4. EXECUTE_ACTION Değişikliği

`/IWBEP/IF_MGW_APPL_SRV_RUNTIME~EXECUTE_ACTION` içindeki
`SaveReturnDepositDraft` case'inin yanına `CreateReturnDepositDraft` eklenir.

Yapılacaklar:

1. Dört parametre `IT_PARAMETER` içinden okunur.
2. OData timestamp, `CONVERT TIME STAMP ... TIME ZONE sy-zonlo` ile DATS'a
   çevrilir.
3. `create_return_deposit_draft` çağrılır.
4. Dönen `ReturnHeader`, `copy_data_to_ref` ile `ER_DATA`'ya yazılır.

Başarılı cevabın `LogUid` alanı kesinlikle boş olmamalıdır; ön yüz bunu zorunlu
kontrol eder.

## 5. SAVE_RETURN_DEPOSIT_DRAFT Değişiklikleri

Mevcut metodun başına aşağıdaki sahiplik kontrolü eklenmelidir:

1. H, `LOG_UID` ile okunur.
2. Kayıt bulunamazsa hata verilir.
3. H kaydı şu koşulları sağlamalıdır:
   - `SHIPMENT_TYPE = 'OP'`
   - `DEPOZITO_IADE = 'X'`
   - `VBELN_VA` ve `IRS_NO` boş
   - `STATUS = 'N'`
4. Gönderilen plasiyer ve depo H kaydıyla aynı olmalıdır.
5. DH `STATUS` yalnız `D` veya yeniden denenebilir `E` olmalıdır; `P/S/C`
   durumları değiştirilemez.
6. Malzeme `MARA-MTART = 'ZSTK'` olmalıdır.
7. Malzeme ayrıca izin verilen depozito kataloğunda bulunmalıdır
   (`DepositGISet(All='X')` ile aynı kaynak tablo).
8. Ölçü birimi frontend'den değil MARA temel ölçü biriminden alınmalıdır.

Silme davranışı düzeltilmelidir:

- `IsDeleted=true` veya miktar `0` ise DI satırı fiziksel silinmemeli,
  `IS_DELETED='X'` yapılmalıdır.
- Miktar değiştiğinde `IS_CONFIRMED=space` yapılmalıdır.
- Pozitif miktarda `IS_DELETED=space` yapılmalıdır.
- Başarısız `MODIFY/UPDATE` sonrası rollback ve dequeue garanti edilmelidir.

## 6. LOAD_RETURN_DATA Değişiklikleri

`ERDAT` filtresi değiştirilmeden aşağıdakiler yapılmalıdır:

1. Teknik H kayıtları mevcut header SELECT'ine dahil kalmalıdır.
2. Header çıktısına `IsDepositOnly` hesaplanarak yazılmalıdır.
3. OP manuel kaydında `ReturnType='P'` dönmelidir.
4. DI satırları `ReturnItem` olarak şu şekilde dönmelidir:
   - `IsDepozito=true`
   - `MengeSiparis=0`
   - `MengeSayim=DI-MENGE_SAYIM`
   - `MengeSatilab=DI-MENGE_SAYIM`
   - `IsConfirmed=DI-IS_CONFIRMED`
   - `IsExternal=DI-IS_EXTERNAL`
5. Soft-delete edilmiş DI satırları dönmemelidir.
6. Taslak H=`N`, onaylanmış H=`S/C` durum eşlemesi korunmalıdır.

## 7. APPEND_LATEST_DEPOSIT_ITEMS Zorunlu Düzeltmesi

Mevcut metot manuel akış için güvenli değildir ve yeniden yazılmalıdır:

- Loop içinde yalnız son header'ın `LogUid` değeri `lv_guid` değişkeninde
  kalıyor.
- Bu tek GUID için DH/DI bulunursa GET sırasında kayıtlar fiziksel olarak
  siliniyor.
- Bir header'da taslak bulunması bütün header'lar için tek bir `lv_exists`
  kararı üretiyor.
- GET isteği veri değiştirmemelidir.

Yeni algoritma:

```text
Her OP header için:
  IsDepositOnly ise
    DH/DI'daki aktif kalemleri oku ve ct_items'a ekle
    son ZDAI'yi kaynak olarak ekleme
  değilse DH/DI taslağı varsa
    taslak kalemlerini oku
  değilse
    plasiyerin son ZDAI kalemlerini yalnız görüntü amaçlı ekle
```

Bu metotta hiçbir `INSERT`, `UPDATE`, `DELETE` veya `COMMIT` bulunmamalıdır.

## 8. CREATE_DEEP_ENTITY / ReturnHeader Onayı

### 8.1 Tanıma

```abap
lv_deposit_only = xsdbool(
  ls_deep-isdepositonly = abap_true
  AND to_upper( ls_deep-shipmenttype ) = 'OP' ).
```

`IsDepositOnly` yalnız frontend beyanına göre kabul edilmemelidir. H kaydı ve
malzeme tipleriyle doğrulanmalıdır.

### 8.2 İzin verilen payload

Manuel OP depozito payloadında:

- `LogUid` zorunlu.
- `VbelnVa` ve `IrsNo` boş olabilir.
- Ürün kalemi bulunmaması geçerlidir.
- En az bir pozitif, silinmemiş ve onaylanmış depozito kalemi bulunmalıdır.
- Bütün kalemler backend MARA kontrolünden sonra ZSTK çıkmalıdır.

Normal OP ürün iadesinde `VbelnVa` zorunluluğu aynen korunmalıdır.

### 8.3 Sütaş tespiti

Mevcut `IRS_NO` boşken başka bir H kaydı bulabilen kontrol kullanılmamalıdır.
Sütaş bilgisi yalnız gönderilen `LogUid` ile okunmalıdır:

```abap
SELECT SINGLE sutas
  FROM zmm_t_bdy_irs_h
  WHERE log_uid = @lv_log_uid
  INTO @lv_sutas.
```

Depozito işlemesi, ürün/Sütaş kontrol bloğunun dışında çalışmalıdır. Böylece
ürünsüz payload da `load_deposit_draft` ve `create_deposit_order` aşamalarına
ulaşır.

### 8.4 ZDAI yaratma

Mevcut `create_deposit_order` kullanılabilir:

- Kaynak son ZDAI yalnız satış alanı/partner şablonu için kullanılabilir.
- Eski ZDAI değiştirilemez.
- Yeni ZDAI yalnız sayılan pozitif miktarlardan yaratılır.
- `iv_irs_no` boş olabileceğinden müşteri sipariş numarası gerekiyorsa
  `FIO-<tarih>-<LogUid son 8>` gibi deterministik teknik referans üretilmelidir.
- DH `ZDAI_VBELN` idempotency anahtarıdır.

Durum sırası:

```text
H : N -> S
DH: D -> P -> S
```

Tekrar POST'ta `DH-STATUS='S'` ve `ZDAI_VBELN` doluysa aynı belge dönmeli,
ikinci ZDAI yaratılmamalıdır.

## 9. ZBDY07 Değişiklikleri

### 9.1 İrsaliye giriş ekranı / START-OF-SELECTION

Teknik manuel depozito H kaydı 0100 irsaliye giriş ekranına alınmamalıdır.
`IMAGE_B64` boş olduğu için bugün fiilen eklenmese de açık koruma eklenmelidir:

```abap
CHECK NOT ( ls_db-shipment_type = 'OP'
        AND ls_db-depozito_iade = abap_true
        AND ls_db-vbeln_va IS INITIAL
        AND ls_db-irs_no   IS INITIAL ).
```

Bu kayıtta `CREATE_SD_ORDER`, `CREATE_ZRFI_ORDER` veya irsaliye eşleştirme
akışları çalışmamalıdır.

### 9.2 GET_SAYIM_DATA

Mevcut ürün SELECT'i H ile I arasında inner join kullandığı için manuel kayıtta
ürün satırı üretmemesi doğrudur.

Depozito SELECT'i H + DH + DI join'i kullandığı için teknik H sayesinde kayıt
gelecektir. Şu koşullar korunmalıdır:

- H `IRS_TAR` seçim tarihine uyar.
- H `SHIPMENT_TYPE <> 'MD'` ile OP seçimine girer.
- DH `STATUS='S'` ise sayım bekleyen ekranda görünür.
- `DI-IS_DELETED=space` koşulu bulunur.

Manuel kayıt için:

```text
SATIR_TIPI    = Depozito
MUHASEBE_MIK  = 0
SAYIM_MIK     = DI-MENGE_SAYIM
FARK          = SAYIM_MIK
ZDAI_VBELN    = DH-ZDAI_VBELN
KUNNR         = PLASIYER
```

`LT_DEP_EXPECTED`, ürün I tablosunda depozito satırı aradığı için manuel kayıt
için değer üretmeyecektir; bu durumda `MUHASEBE_MIK=0` bilinçli davranıştır.

### 9.3 Onay özeti

Yalnız depozito seçilmişse:

- `lv_zbis_count=0` geçerli kabul edilmelidir.
- Ürün toplamlarının sıfır olması hata üretmemelidir.
- Popup başlığında “0 irsaliye” yerine “1 manuel depozito kaydı” gösterilmesi
  önerilir.
- Ürün, fire, kalite ve lansman kontrolleri boş internal table üzerinde güvenli
  çalışmalıdır.

### 9.4 APPROVE_DEPOZITO_SAYIM

Mevcut genel depozito onayı kullanılabilir. Ön koşullar:

1. `ZDAI_VBELN` dolu ve gerçek belge türü `ZDAI` olmalıdır.
2. Seçilen satırların tamamı aynı `LogUid` ve ZDAI'ye ait olmalıdır.
3. `create_dlv_and_gm_depozito` ürün satırı beklememelidir.
4. Başarıda DH `C`, hatada `E` yapılmalıdır.
5. `ZDEP_VBELN`, malzeme belgesi ve yıl logda kalıcı tutulmalıdır.

OP manuel kayıt için `CREATE_MONO_ZDAI` çağrılmamalıdır; ZDAI OData sayım
onayında önceden yaratılmış olacaktır.

### 9.5 Durumların sorumluluğu

- H `STATUS='S'`: Fiori fiziksel sayımı onaylandı.
- DH `STATUS='S'`: ZDAI hazır, ZBDY07 depozito işlemini bekliyor.
- DH `STATUS='C'`: ZBDY07 depozito lojistik işlemi tamamlandı.
- DH `STATUS='E'`: ZBDY07 veya ZDAI aşaması hata verdi.

H'nin `S` kalması, Fiori “Tamamlanan Sayımlar” görünümü için uygundur. DH
durumu lojistik sürecin durumudur; iki alan aynı anlamda kullanılmamalıdır.

## 10. Test Matrisi

1. OP plasiyer seç, bir depozito ekle, taslağı kapat/aç.
2. Aynı plasiyer/depo/tarih için tekrar ekle; aynı LogUid dönmeli.
3. Aynı plasiyerin normal OP irsaliyesi varken manuel kart ayrı görünmeli.
4. Sıfır miktarla kayıt reddedilmeli.
5. ZSTK olmayan malzeme teknik payload ile gönderilince reddedilmeli.
6. Yetkisiz plasiyer ve depo reddedilmeli.
7. Kalem miktarı değişince `IS_CONFIRMED` sıfırlanmalı.
8. Silinen kalem GET cevabına gelmemeli, DB'de soft-delete kalmalı.
9. Onayda tek yeni ZDAI oluşmalı.
10. Aynı deep POST tekrarlanırsa ikinci ZDAI oluşmamalı.
11. ZBDY07 OP sayım bekleyen ekranında yalnız depozito satırı görünmeli.
12. ZBDY07 onayında ZDEP/malzeme belgesi oluşmalı ve DH `C` olmalı.
13. ZBDY07 hata/tekrar akışı aynı ZDAI üzerinden devam etmeli.
14. Normal OP ve MD akışları regresyon testinden geçmeli.
