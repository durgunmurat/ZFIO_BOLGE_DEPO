# İade Depozito Taslak Tabloları

Depozito işlemleri `Sayımı Onayla` çalışana kadar taslak olarak saklanır.
ZDAI siparişi yalnız nihai onay sırasında yaratılır.

## 1. Header: ZMM_T_BDY_IRS_DH

- Açıklama: `İade Depozito Taslak Başlığı`
- Delivery Class: `A`
- Data Class: `APPL1`
- Buffering: `Not allowed`

| Key | Alan | Tip | Açıklama |
|---|---|---|---|
| X | MANDT | MANDT | Client |
| X | LOG_UID | SYSUUID_C32 | Taslak ve idempotency anahtarı |
|  | PLASIYER | KUNNR | Plasiyer |
|  | LGORT | LGORT_D | Depo yeri |
|  | SOURCE_VBELN | VBELN_VA | Ekrana kaynak olan son ZDAI |
|  | ZDAI_VBELN | VBELN_VA | Nihai onayda yaratılan ZDAI |
|  | STATUS | CHAR1 | D: taslak, P: işleniyor, S: tamamlandı, E: hata |
|  | ERNAM | ERNAM | Yaratan |
|  | ERDAT | ERDAT | Yaratma tarihi |
|  | ERZET | ERZET | Yaratma saati |
|  | AENAM | AENAM | Değiştiren |
|  | AEDAT | AEDAT | Değişiklik tarihi |
|  | AEZET | UZEIT | Değişiklik saati |

İkincil indeks `Z01`: `MANDT`, `PLASIYER`, `STATUS`, `ERDAT`, `ERZET`.

## 2. Kalem: ZMM_T_BDY_IRS_DI

- Açıklama: `İade Depozito Taslak Kalemi`
- Delivery Class: `A`
- Data Class: `APPL1`
- Buffering: `Not allowed`

| Key | Alan | Tip | Açıklama |
|---|---|---|---|
| X | MANDT | MANDT | Client |
| X | LOG_UID | SYSUUID_C32 | Header anahtarı |
| X | MATNR | MATNR | Depozito malzemesi |
|  | POSNR | POSNR_VA | Kaynak/ekran kalem numarası |
|  | MEINS | MEINS | Ölçü birimi |
|  | MENGE_SIPARIS | KWMENG | Son ZDAI sipariş miktarı |
|  | MENGE_SAYIM | KWMENG | Kullanıcının saydığı miktar |
|  | IS_EXTERNAL | XFELD | Kullanıcının sonradan eklediği kalem |
|  | IS_CONFIRMED | XFELD | Satırda `Tamam` işaretlendi |
|  | IS_DELETED | XFELD | Taslaktan çıkarıldı |
|  | ERNAM | ERNAM | Yaratan |
|  | ERDAT | ERDAT | Yaratma tarihi |
|  | ERZET | ERZET | Yaratma saati |
|  | AENAM | AENAM | Değiştiren |
|  | AEDAT | AEDAT | Değişiklik tarihi |
|  | AEZET | UZEIT | Değişiklik saati |

Foreign key: `ZMM_T_BDY_IRS_DI-LOG_UID` -> `ZMM_T_BDY_IRS_DH-LOG_UID`.

## Kilit Nesnesi

`EZMM_T_BDY_IRS_D`:

- Primary table: `ZMM_T_BDY_IRS_DH`
- Lock argument: `MANDT`, `LOG_UID`
- Lock mode: `E`

Taslak kaydı ve nihai onay aynı kilidi kullanmalıdır. Nihai işlemde durum
`D -> P -> S` olmalıdır. BAPI hatasında rollback yapılıp durum `E` ve hata
mesajı uygulama loguna yazılmalıdır.

## Önemli Kurallar

1. `SaveReturnDepositDraft` hiçbir koşulda ZDAI yaratmaz.
2. Miktar değişince `IS_CONFIRMED` tekrar boşaltılır.
3. Silinen kalem fiziksel olarak silinmez; `IS_DELETED = X` yapılır.
4. Nihai onay yalnız `IS_DELETED = space`, `IS_CONFIRMED = X` kalemleri okur.
5. Aktif fakat onaysız depozito varsa `Sayımı Onayla` backend tarafından da
   reddedilir.
6. Aynı `LOG_UID` için `STATUS = S` ve `ZDAI_VBELN` doluysa ikinci sipariş
   yaratılmaz.
