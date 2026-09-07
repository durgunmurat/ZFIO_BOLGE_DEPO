# ReturnFactoryShipment - Üretim Hatası Alt Neden ve SKT

## Servis sözleşmesi

Bilgiler header'a değil, miktarın ait olduğu `ReturnFactoryShipmentItem`
entity'sine eklenmelidir. `ReturnFactoryShipmentSet` deep-create isteğinin
`ToItems` dizisinde her malzeme kendi alt nedenini ve SKT'sini taşır.

| Entity / Set | Property | Tip | Kaynak / hedef |
|---|---|---|---|
| `ReturnFactoryShipmentItem` | `UretimAltNeden` | `Edm.String` | `EKPO-ZZALTNDN` |
| `ReturnFactoryShipmentItem` | `UretimSkt` | `Edm.DateTime`, nullable | `EKPO-ZZSKTAR` |
| `ReturnFactorySubReason` | `Grund` | `Edm.String`, key | `ZSD_T_REFUND_008-GRUND` |
| `ReturnFactorySubReason` | `Altnd` | `Edm.String`, key | `ZSD_T_REFUND_008-ALTND` |
| `ReturnFactorySubReason` | `AltndText` | `Edm.String` | `DD07T-DDTEXT` |

Value-help isteği:

```http
GET ReturnFactorySubReasonSet?$filter=Grund eq '0002'&$orderby=AltndText
```

`GET_ENTITYSET` uygulamasında istemciden farklı bir `Grund` gelmesine izin
verilmemesi tercih edilir. Seçenekler `ZSD_T_REFUND_008` tablosundan `GRUND =
'0002'` ile alınır. Metinler, sabit değer domain'i `ZMM_IADE_NEDENI` için
`DD07T` tablosundan oturum dilinde okunur; oturum dilinde metin yoksa Türkçe
(`T`) fallback uygulanabilir.

Temel ABAP okuma mantığı:

```abap
SELECT DISTINCT r~grund, r~altnd, t~ddtext AS altnd_text
  FROM zsd_t_refund_008 AS r
  LEFT OUTER JOIN dd07t AS t
    ON  t~domname    = 'ZMM_IADE_NEDENI'
    AND t~ddlanguage = @sy-langu
    AND t~as4local   = 'A'
    AND t~domvalue_l = r~altnd
  WHERE r~grund = '0002'
  INTO CORRESPONDING FIELDS OF TABLE @et_entityset.
```

> Not: Alan uzunlukları elle tahmin edilmemeli; SEGW property'leri ilgili DDIC
> alanlarından referansla oluşturulmalıdır.

## Deep-create örneği

```json
{
  "Lgort": "1902",
  "SourceLgort": "1802",
  "Werks": "1900",
  "IrsTar": "/Date(1788728400000)/",
  "PlakaNo": "34 ABC 123",
  "LogUid": "...",
  "ToItems": [
    {
      "Posnr": "000010",
      "Matnr": "000000000000123456",
      "MengeUretimHatali": "4.000",
      "UretimAltNeden": "01",
      "UretimSkt": "/Date(1791310800000)/"
    }
  ]
}
```

## Backend validasyon ve belge aktarımı

- `MengeUretimHatali > 0` ise `UretimAltNeden` ve `UretimSkt` zorunludur.
- Alt neden, `ZSD_T_REFUND_008` içinde `GRUND = '0002'` ile tekrar
  doğrulanır. UI'dan gelen değere tek başına güvenilmez.
- Üretim hatalı kategori kaydında `ZZGRUND = '0002'`, `ZZALTNDN =
  UretimAltNeden`, `ZZSKTAR = UretimSkt` kullanılır.
- Bu üç alan `ZMM_T_BDY_FSH_I` loguna UB oluşturulmadan önce yazılır.
  Background işlem deep yapıyı logdan yeniden kurduğu için alt neden ve
  SKT de logdan geri yüklenmelidir; aksi halde onay sonrası bilgiler kaybolur.
- `BAPI_TE_MEPOITEM` alanları `ZZGRUND`, `ZZALTNDN`, `ZZSKTAR`; karşılık
  gelen `BAPI_TE_MEPOITEMX` işaretleri `X` olmalıdır.
- Zorunluluk ve customizing validasyonu herhangi bir log, UB veya malzeme
  belgesi yaratılmadan önce çalĿtırılmalıdır.

## Fiori akışı

`Onaya Gönder` basıldığında üretim hatalı miktarı pozitif satırlar varsa
ara popup açılır. Her satırda aranabilir alt neden seçimi ve standart
`DatePicker` ile SKT alınır. Tüm satırlar tamamlanmadan komisyon/onay adımına
geçilmez ve backend'e POST atılmaz.

Akış sırası:

1. Ekran ve stok validasyonları
2. Üretim hatası detay popup'ı (gerekiyorsa)
3. Komisyon seçimi
4. Son onay mesajı
5. `POST /ReturnFactoryShipmentSet` deep create

## Aktivasyon

SEGW runtime artifact'ları yeniden üretildikten sonra implementasyon yalnız
`MPC_EXT` / `DPC_EXT` içinde tutulmalı; ardından `/IWFND/CACHE_CLEANUP` ve
`/IWBEP/CACHE_CLEANUP` çalĿtırılmalıdır.
