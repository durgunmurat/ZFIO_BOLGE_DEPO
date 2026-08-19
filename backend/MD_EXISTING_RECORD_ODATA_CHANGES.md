# MD mevcut kayıt devam akışı – gözden geçirilmiş OData değişiklikleri

Bu doküman `ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT` sınıfındaki mevcut akış yeniden incelenerek hazırlanmıştır.

## Kesinleşen statü davranışı

OData tarafında parametrik `Status` filtresi eklenmeyecektir. Mevcut sorgu korunacaktır:

```abap
AND status IN ( 'N', 'S', 'C' )
```

Mevcut servis `C` durumunu da `S` olarak Fiori'ye döndürmektedir. Fiori genel OP/MD ekranında bekleyenleri `N`, tamamlananları `S` üzerinden zaten ayırmaktadır.

Plasiyer seçiminden sonra yapılacak MD okumasında Fiori şu dört filtreyi gönderir:

```text
ShipmentType = MD
Plasiyer      = seçilen plasiyer
Lgort         = seçilen depo
IrsTar        = seçilen tarih
```

`LOAD_RETURN_DATA` bu dört filtreyi zaten desteklemektedir. Dönen header'lar arasından Fiori yalnızca `Status = N` olanı seçer. Dolayısıyla `lr_status`, `WHEN 'STATUS'` ve `AND status IN @lr_status` eklenmeyecektir.

MD statü yaşam döngüsü:

```text
Non-SAP ilk kayıt       → M
ZBDY07 iade girişi      → N
Fiori mevcut MD onayı   → S
Fiori boş Mono onayı    → doğrudan S
```

`LOAD_RETURN_DATA` yalnızca `N`, `S`, `C` durumlarını okuduğu için `M` kayıtlar ReturnCount ekranına gelmez. Plasiyer seçiminde `N` kayıt bulunmazsa Fiori mevcut davranışla boş Mono oluşturur.

## 1. Deep response yapısına `Status` ekleyin

Mevcut `ty_s_deep_return` tipinde `Status` alanı bulunmuyor. Bu nedenle genel Fiori yüklemesi `$expand=ToItems` çağrısından sonra ayrıca `$select=LogUid,Status` çağrısı yapıp statüleri birleştiriyor. Plasiyer seçimindeki yeni deep okumada statünün doğrudan gelmesi için tipe şu alanı ekleyin:

```abap
status TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-status,
```

Alanı header alanları arasında, örneğin `returntype` sonrasında konumlandırın:

```abap
shipmenttype  TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-shipmenttype,
returntype    TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-returntype,
status        TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-status,
plasiyername  TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-plasiyername,
```

`GET_EXPANDED_ENTITYSET` içindeki mevcut satır alanı otomatik doldurur:

```abap
<deep_return> = CORRESPONDING #( <header> ).
```

Bu alan eklenmezse yeni Fiori okuması da mevcut genel yükleme gibi ikinci bir `ReturnHeaderSet?$select=LogUid,Status` çağrısı yapmak zorundadır.

## 2. MD okumasında harici depozito eklenmesini engelleyin

Yeni MD senaryosunda plasiyer seçildikten sonra yalnızca `ZMM_T_BDY_IRS_H/I` içeriği dönmelidir. Mevcut `LOAD_RETURN_DATA`, metodun sonunda bütün header'lar için `APPEND_LATEST_DEPOSIT_ITEMS` çağırmaktadır.

En az müdahaleli çözüm olarak `APPEND_LATEST_DEPOSIT_ITEMS` metodundaki iki header döngüsüne de `shipmenttype <> 'MD'` koşulu ekleyin.

İlk döngünün yeni hali:

```abap
LOOP AT it_headers ASSIGNING FIELD-SYMBOL(<header>)
  WHERE shipmenttype <> 'MD'
    AND ( status = 'N' OR status = 'S' ).
  INSERT CONV kunnr( |{ <header>-plasiyer ALPHA = IN }| )
    INTO TABLE lt_plasiyer.
  DATA(lv_guid) = <header>-loguid.
ENDLOOP.
```

Metodun ilerleyen kısmındaki ikinci döngünün yeni hali:

```abap
LOOP AT it_headers ASSIGNING <header>
  WHERE shipmenttype <> 'MD'
    AND ( status = 'N' OR status = 'S' ).
  "Mevcut kod aynı şekilde devam eder...
ENDLOOP.
```

Bu değişiklikten sonra istek yalnızca MD header döndürüyorsa `lt_plasiyer` boş kalır ve metot erken `RETURN` eder. Böylece MD kalemlerine son ZDAI siparişinden depozito eklenmez.

> Ayrı mevcut risk: Bu metot GET sırasında `ZMM_T_BDY_IRS_DH/DI` tablolarından DELETE yapıyor. Bu, yeni MD senaryosundan bağımsız mevcut bir OP problemidir. Yukarıdaki MD koşulu yeni akışı bu davranıştan korur; OP davranışı ayrıca analiz edilmeden bu çalışma kapsamında değiştirilmemelidir.

## 3. `CREATE_DEEP_ENTITY` DATA tanımını genişletin

Mevcut DATA bloğuna ekleyin:

```abap
ls_existing_md_header TYPE zmm_t_bdy_irs_h,
lv_request_has_loguid  TYPE abap_bool,
lv_md_exists           TYPE abap_bool,
lv_md_plasiyer         TYPE kunnr,
```

`read_entry_data` sonrasındaki başlangıcı aşağıdaki hale getirin:

```abap
lv_is_md = xsdbool( to_upper( ls_deep-shipmenttype ) = 'MD' ).
lv_request_has_loguid = xsdbool( ls_deep-loguid IS NOT INITIAL ).
lv_log_uid = ls_deep-loguid.
```

Mevcut UUID üretme bloğu korunur. `lv_request_has_loguid` şu ayrımı kaybetmemek içindir:

- İlk GET'te kayıt bulunmadı; Fiori onayda boş `LogUid` gönderdi: yeni UUID + INSERT.
- İlk GET'te `N` kayıt bulundu; Fiori aynı `LogUid`yi geri gönderdi: doğrulama + UPDATE.

## 4. Mevcut MD kayıt bloğunu değiştirin

Mevcut `IF lv_is_md = abap_true.` kayıt bloğunu (header INSERT, item INSERT, COMMIT ve RETURN dahil) aşağıdaki blokla değiştirin:

```abap
IF lv_is_md = abap_true.
  lv_md_plasiyer = CONV kunnr( |{ ls_deep-plasiyer ALPHA = IN }| ).
  lv_md_kunnr = COND #(
    WHEN ls_deep-kunnr IS INITIAL
      THEN lv_md_plasiyer
    ELSE CONV kunnr( |{ ls_deep-kunnr ALPHA = IN }| ) ).

  CLEAR: ls_existing_md_header, lv_md_exists.

  "LogUid ilk GET cevabından geldiyse mevcut açık kaydı doğrula.
  IF lv_request_has_loguid = abap_true.
    SELECT SINGLE *
      FROM zmm_t_bdy_irs_h
      WHERE log_uid = @lv_log_uid
      INTO @ls_existing_md_header.

    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Güncellenecek MD kaydı bulunamadı'.
    ENDIF.

    lv_md_exists = abap_true.

    "İstemciden gelen LogUid başka bir kayda ait olamaz.
    IF to_upper( ls_existing_md_header-shipment_type ) <> 'MD'
       OR ls_existing_md_header-plasiyer <> lv_md_plasiyer
       OR ls_existing_md_header-lgort <> ls_deep-lgort
       OR ls_existing_md_header-irs_tar <> lv_irs_tar.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'MD kaydı gönderilen plasiyer, depo veya tarih ile uyuşmuyor'.
    ENDIF.

    IF ls_existing_md_header-status <> 'N'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Tamamlanmış MD kaydı yeniden güncellenemez'.
    ENDIF.
  ENDIF.

  CLEAR ls_md_header.
  ls_md_header-log_uid       = lv_log_uid.
  ls_md_header-vbeln_va      = space.
  ls_md_header-irs_no        = space.
  ls_md_header-irs_tar       = lv_irs_tar.
  ls_md_header-lgort         = ls_deep-lgort.
  ls_md_header-plasiyer      = lv_md_plasiyer.
  ls_md_header-kunnr         = lv_md_kunnr.
  ls_md_header-shipment_type = 'MD'.
  ls_md_header-return_type   = ls_deep-returntype.
  ls_md_header-status        = 'S'.
  ls_md_header-ernam         = sy-uname.

  IF lv_md_exists = abap_true.
    "Status koşulu ikinci/eşzamanlı onayı da engeller.
    UPDATE zmm_t_bdy_irs_h
      SET kunnr       = @lv_md_kunnr,
          return_type = @ls_deep-returntype,
          status      = 'S',
          ernam       = @sy-uname
      WHERE log_uid = @lv_log_uid
        AND status  = 'N'.

    IF sy-subrc <> 0 OR sy-dbcnt <> 1.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'MD sayım başlığı güncellenemedi'.
    ENDIF.
  ELSE.
    INSERT zmm_t_bdy_irs_h FROM @ls_md_header.

    IF sy-subrc <> 0.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'MD sayım başlığı kaydedilemedi'.
    ENDIF.
  ENDIF.

  "Fiori payload'ı MD kalemlerinin tam ve son halidir.
  "Bu nedenle kaldırılan kalemlerin tekrar görünmemesi için mevcut snapshot silinir.
  IF lv_md_exists = abap_true.
    DELETE FROM zmm_t_bdy_irs_i
      WHERE log_uid = @lv_log_uid.
  ENDIF.

  CLEAR: lt_log_items, lv_md_posnr.
  LOOP AT ls_deep-toitems ASSIGNING <item>.
    lv_md_posnr = lv_md_posnr + 10.
    <item>-loguid = lv_log_uid.
    <item>-posnr  = lv_md_posnr.

    CLEAR ls_log_item.
    ls_log_item-log_uid = lv_log_uid.
    ls_log_item-posnr   = <item>-posnr.
    ls_log_item-matnr   = <item>-matnr.

    CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
      EXPORTING
        input          = <item>-meins
      IMPORTING
        output         = ls_log_item-meins
      EXCEPTIONS
        unit_not_found = 1
        OTHERS         = 2.

    IF sy-subrc <> 0.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Kalem { <item>-posnr }: ölçü birimi geçersiz|.
    ENDIF.

    ls_log_item-menge_siparis = 0.
    ls_log_item-menge_sayim   = <item>-mengesayim.
    ls_log_item-menge_fire    = <item>-mengefire.
    ls_log_item-menge_kalite  = <item>-mengekalite.
    ls_log_item-menge_lansman = <item>-mengelansman.
    ls_log_item-menge_satilab = <item>-mengesatilab.
    ls_log_item-is_depozito   = <item>-isdepozito.
    APPEND ls_log_item TO lt_log_items.
  ENDLOOP.

  INSERT zmm_t_bdy_irs_i FROM TABLE @lt_log_items.
  IF sy-subrc <> 0.
    CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'MD sayım kalemleri kaydedilemedi'.
  ENDIF.

  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING
      wait = abap_true.

  ls_deep-loguid  = lv_log_uid.
  ls_deep-vbelnva = space.
  ls_deep-irsno   = space.

  copy_data_to_ref(
    EXPORTING
      is_data = ls_deep
    CHANGING
      cr_data = er_deep_entity ).
  RETURN.
ENDIF.
```

## 5. Bu değişiklikte dokunulmayacak alanlar

- `LOAD_RETURN_DATA` içindeki mevcut `AND status IN ( 'N', 'S', 'C' )` korunur.
- OP deep-create akışına dokunulmaz.
- `RETURNHEADERSET_GET_ENTITYSET` ve `$expand=ToItems` implementasyonu korunur.
- `ReturnMDPlasiyerSet` ve `ReturnMDUrunSet` korunur.

## 6. Fiori ile zorunlu kontrat

OData güncellemesinin doğru çalışması için Fiori tarafı şunları yapmalıdır:

1. Plasiyer seçiminden sonra `ShipmentType`, `Plasiyer`, `Lgort`, `IrsTar` filtreleriyle `ReturnHeaderSet?$expand=ToItems` çağırır.
2. Sonuçtan `Status === 'N'` olan MD header'ı seçer.
3. Bir açık header varsa onun `LogUid` değerini `/mdEntryGroup/Waybills/0/LogUid` içinde korur.
4. Açık header yoksa mevcut boş MD grubunu `LogUid = ''` ile oluşturur.
5. Birden fazla `N` header varsa rastgele birini seçmez; hata gösterir. Mevcut ön yüz tek MD header varsayımıyla çalışmaktadır.
6. Onayda ürünler ve depozitolar dahil kalemlerin tam listesini gönderir.

Fiori uygulamasında ayrıca iki mevcut davranış yeni senaryo için düzeltilmelidir:

- `_returnMDProductListCache` tek global liste olarak tutuluyor. Plasiyer değiştiğinde temizlenmeli veya plasiyer numarasına göre cache'lenmelidir; aksi halde ikinci plasiyerde ilk plasiyerin ürün kataloğu açılabilir.
- Önceden Z tablosundan gelen bir ürün `ReturnMDUrunSet` kataloğunda yoksa ürün ekleme diyaloğu kaydedildiğinde mevcut kod bu ürünü listeden düşürebilir. Backend'den gelen mevcut ürünler kataloğa eklenmeli veya katalog dışı mevcut ürünler kaydetme sırasında ayrıca korunmalıdır.

## 7. Uygulama öncesi önemli kontroller

- Non-SAP servisinin ilk açtığı MD header `status = 'M'` olmalıdır. ZBDY07 iade girişi tamamlandığında aynı kayıt `status = 'N'` durumuna çevrilmeli; `shipment_type = 'MD'` ve geçerli `plasiyer/lgort/irs_tar` değerleri korunmalıdır.
- Aynı plasiyer + depo + tarih için birden fazla açık MD header üretilmemelidir.
- `DELETE + INSERT` yaklaşımı yalnızca `ZMM_T_BDY_IRS_I` kalemlerinin başka tablolardan `POSNR` bazlı referansı yoksa kullanılmalıdır. Böyle bir referans varsa mevcut `POSNR` değerlerini koruyan `MODIFY + kontrollü DELETE` uygulanmalıdır.
- Güncelleme için `LOG_UID` bazlı lock object varsa enqueue/dequeue kullanılmalıdır. Yoksa `UPDATE ... WHERE status = 'N'` en azından ikinci onayı engeller.
- `LOAD_RETURN_DATA` sonundaki yalnızca-1902 geçiş satırı diğer depolar devreye alınacaksa ayrıca kaldırılmalıdır:

```abap
DELETE lt_db_headers WHERE lgort NE '1902'.
```

## 8. Test matrisi

1. Yalnız `M` kayıt var: kayıt Fiori'ye gelmez; plasiyer seçiminde boş MD açılabilir.
2. ZBDY07 aynı kaydı `M → N` yapar: Fiori mevcut `LogUid` ve kalemleri yükler.
3. Açık kayıt yok: boş MD açılır, onayda yeni header/item oluşur ve status doğrudan `S` olur.
4. Bir açık `N` kayıt var: mevcut `LogUid` ve kalemler gelir; ekleme/değişiklik sonrası aynı header `S` olur.
5. Yalnız tamamlanmış `S/C` kayıt var: pending MD için boş akış açılır; tamamlananlar sekmesi mevcut kaydı göstermeye devam eder.
6. Birden fazla açık `N` kayıt var: Fiori işlemi durdurur ve veri tutarsızlığı mesajı gösterir.
7. Başka plasiyere/depo/tarihe ait `LogUid` gönderilir: backend reddeder.
8. Aynı payload ikinci kez gönderilir: status artık `S` olduğu için backend reddeder.
9. Mevcut MD ürün/depozito kalemleri okunur; `APPEND_LATEST_DEPOSIT_ITEMS` bunlara ek kalem eklemez.
10. OP bekleyen/tamamlanan ve depozito davranışı değişmeden çalışır.
