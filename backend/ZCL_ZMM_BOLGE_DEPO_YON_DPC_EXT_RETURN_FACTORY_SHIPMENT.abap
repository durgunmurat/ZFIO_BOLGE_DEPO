" Iade'den Fabrikaya Gonderim OData patch'i.
" Bu dosyadaki tanimlari ve metotlari ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT
" sinifina ekleyin. SEGW tarafinda asagidaki entity set/nav yapisi gerekir.
"
" Entity: ReturnFactoryVehicle
"   PlakaNo      Edm.String   Key,  MaxLength 20
"
"   Not: Lgort ve IrsTar bu liste icin donus property olmak zorunda degil;
"   Gateway filtrelerinden okunuyor. SEGW filter icin property isterse:
"   Lgort        Edm.String         MaxLength 4
"   IrsTar       Edm.DateTime       Precision 0
"
" Entity: ReturnFactoryStock
"   Werks        Edm.String   Key,  MaxLength 4
"   SourceLgort  Edm.String   Key,  MaxLength 4
"   Matnr        Edm.String   Key,  MaxLength 18
"   Lgort        Edm.String         MaxLength 4
"   Maktx        Edm.String         MaxLength 40
"   Meins        Edm.String         MaxLength 3
"   SapStock     Edm.Decimal        Precision 13, Scale 3
"
"   Not: IrsTar stok entity'sinde kullanilmiyor; frontend bu set icin yalniz
"   Lgort filtresi gonderir ve backend Lgort'tan 18xx SourceLgort turetir.
"
" Entity: ReturnFactoryShipment
"   Lgort        Edm.String   Key,  MaxLength 4
"   IrsTar       Edm.DateTime Key,  Precision 0
"   PlakaNo      Edm.String   Key,  MaxLength 20
"   SourceLgort  Edm.String         MaxLength 4
"   Werks        Edm.String         MaxLength 4
"   LogUid       Edm.String         MaxLength 32
"   Navigation: ToItems -> ReturnFactoryShipmentItem
"
" Entity: ReturnFactoryShipmentItem
"   Lgort        Edm.String   Key,  MaxLength 4
"   IrsTar       Edm.DateTime Key,  Precision 0
"   PlakaNo      Edm.String   Key,  MaxLength 20
"   Posnr        Edm.String   Key,  MaxLength 6
"   Matnr        Edm.String         MaxLength 18
"   Maktx        Edm.String         MaxLength 40
"   Meins        Edm.String         MaxLength 3
"   SapStock     Edm.Decimal        Precision 13, Scale 3
"   MengeSayim   Edm.Decimal        Precision 13, Scale 3
"   MengeUretimHatali     Edm.Decimal Precision 13, Scale 3
"   UretimAltNeden        Edm.String  (ABAP type EKPO-ZZALTNDN)
"   UretimSkt             Edm.DateTime (ABAP type EKPO-ZZSKTAR, Nullable)
"   MengeFabrikaLojistik  Edm.Decimal Precision 13, Scale 3
"   MengeSatisFireKati    Edm.Decimal Precision 13, Scale 3
"   MengeSatisFireSivi    Edm.Decimal Precision 13, Scale 3
"   MengeSatisFireUht     Edm.Decimal Precision 13, Scale 3
"   MengeSatisFireCam     Edm.Decimal Precision 13, Scale 3
"   Navigation key:
"     ReturnFactoryShipment(Lgort, IrsTar, PlakaNo)
"       -> ToItems(Lgort, IrsTar, PlakaNo)
"   Item Posnr frontend tarafinda 000010, 000020... olarak gonderilir.
"
" Entity sets:
"   ReturnFactoryVehicleSet, ReturnFactoryStockSet, ReturnFactoryShipmentSet
"   ReturnFactorySubReasonSet (read-only value help; Grund='0002')

" ----------------------------------------------------------------------
" PRIVATE SECTION - yeni tipler ve metot tanimlari
" ----------------------------------------------------------------------

CONSTANTS:
  gc_default_return_werks TYPE werks_d VALUE '1900',
  gc_stock_transfer_bwart TYPE bwart   VALUE '311',
  gc_inv_diff_bwart       TYPE bwart   VALUE '702',
  gc_factory_target_lgort  TYPE lgort_d VALUE '2300'.

TYPES:
  ty_s_return_factory_item TYPE
    zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnfactoryshipmentitem,
  ty_t_return_factory_item TYPE STANDARD TABLE OF
    zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnfactoryshipmentitem
    WITH DEFAULT KEY,

  BEGIN OF ty_s_return_factory_deep,
    loguid      TYPE sysuuid_c32,
    lgort       TYPE lgort_d,
    sourcelgort TYPE lgort_d,
    werks       TYPE werks_d,
    irstar      TYPE timestampl,
    plakano     TYPE zflo_m_sefer-plaka_no,
    toitems     TYPE ty_t_return_factory_item,
  END OF ty_s_return_factory_deep.

METHODS derive_return_lgort
  IMPORTING
    iv_lgort TYPE lgort_d
  RETURNING
    VALUE(rv_lgort) TYPE lgort_d.

METHODS validate_return_factory_items
  IMPORTING
    iv_werks       TYPE werks_d
    iv_source_lgort TYPE lgort_d
  CHANGING
    ct_items       TYPE ty_t_return_factory_item
  RAISING
    /iwbep/cx_mgw_busi_exception.

METHODS create_return_factory_log
  IMPORTING
    is_deep TYPE ty_s_return_factory_deep
  RETURNING
    VALUE(rv_log_uid) TYPE sysuuid_c32
  RAISING
    /iwbep/cx_mgw_busi_exception.

METHODS save_return_factory_log
  IMPORTING
    iv_log_uid     TYPE sysuuid_c32
    iv_status      TYPE char1
    iv_last_message TYPE string OPTIONAL.

METHODS post_return_factory_shipment
  IMPORTING
    is_deep  TYPE ty_s_return_factory_deep
    iv_werks TYPE werks_d
  RAISING
    /iwbep/cx_mgw_busi_exception.

" ----------------------------------------------------------------------
" DERIVE_RETURN_LGORT - 19xx -> 18xx; bos gelirse UY default 1900 kabul edilir
" ----------------------------------------------------------------------

METHOD derive_return_lgort.
  DATA(lv_lgort) = COND lgort_d(
    WHEN iv_lgort IS INITIAL THEN '1900'
    ELSE iv_lgort ).

  rv_lgort = lv_lgort.
  IF lv_lgort CP '19*'.
    rv_lgort = |18{ lv_lgort+2 }|.
  ENDIF.
ENDMETHOD.

" ----------------------------------------------------------------------
" RETURNFACTORYVEHICLESET_GET_ENTITYSET
" Mal kabulde o gun gelen arac/plaka listesini dondurur.
" ----------------------------------------------------------------------

METHOD returnfactoryvehicleset_get_entityset.
  DATA:
    lv_lgort TYPE lgort_d,
    lv_eindt TYPE dats.

  LOOP AT it_filter_select_options ASSIGNING FIELD-SYMBOL(<filter>).
    CASE <filter>-property.
      WHEN 'Lgort'.
        lv_lgort = VALUE #( <filter>-select_options[ 1 ]-low OPTIONAL ).
      WHEN 'IrsTar'.
        DATA(lv_timestamp) = VALUE timestampl(
          <filter>-select_options[ 1 ]-low OPTIONAL ).
        IF lv_timestamp IS NOT INITIAL.
          CONVERT TIME STAMP lv_timestamp TIME ZONE sy-zonlo
            INTO DATE lv_eindt.
        ENDIF.
    ENDCASE.
  ENDLOOP.

  IF lv_lgort IS INITIAL.
    lv_lgort = '1900'.
  ENDIF.
  IF lv_eindt IS INITIAL.
    lv_eindt = sy-datum.
  ENDIF.

  SELECT DISTINCT
         sefer~plaka_no
    FROM ekko
    INNER JOIN ekpo ON ekpo~ebeln EQ ekko~ebeln
    INNER JOIN eket ON eket~ebeln EQ ekpo~ebeln
                   AND eket~ebelp EQ ekpo~ebelp
    INNER JOIN ekbe ON ekbe~ebeln EQ eket~ebeln
                   AND ekbe~ebelp EQ eket~ebelp
    INNER JOIN mkpf ON mkpf~mblnr EQ ekbe~belnr
                   AND mkpf~mjahr EQ ekbe~gjahr
    LEFT JOIN zflo_m_sefer AS sefer ON sefer~sefer_no EQ mkpf~bktxt
    INTO CORRESPONDING FIELDS OF TABLE @et_entityset
    WHERE ekko~reswk IN ('1100', '1200', '1300', '1400')
      AND ekko~ekorg IN ('1000', '2000', '3000')
      AND ekko~bstyp EQ 'F'
      AND ekpo~werks EQ @gc_default_return_werks
      AND ekpo~loekz EQ @space
      AND ekpo~lgort EQ @lv_lgort
      AND eket~eindt EQ @lv_eindt
      AND ekbe~bwart IN ('901', '351')
      AND ekbe~vgabe EQ '6'
      AND sefer~plaka_no <> @space
    %_HINTS MSSQLNT 'TABLE EKKO INDEX([EKKO~W])'.

  SORT et_entityset BY plaka_no.
ENDMETHOD.

" ----------------------------------------------------------------------
" RETURNFACTORYSTOCKSET_GET_ENTITYSET
" UI icin urun listesini dondurur; SapStock frontend'de gosterilmez, yalniz
" satir durumu ve gonderim validasyonu icin kullanilir.
" ----------------------------------------------------------------------

METHOD returnfactorystockset_get_entityset.
  DATA:
    lv_lgort        TYPE lgort_d,
    lv_source_lgort TYPE lgort_d,
    lv_werks        TYPE werks_d VALUE gc_default_return_werks.

  LOOP AT it_filter_select_options ASSIGNING FIELD-SYMBOL(<filter>).
    IF <filter>-property = 'Lgort'.
      lv_lgort = VALUE #( <filter>-select_options[ 1 ]-low OPTIONAL ).
      EXIT.
    ENDIF.
  ENDLOOP.

  IF lv_lgort IS INITIAL.
    lv_lgort = '1900'.
  ENDIF.
  lv_source_lgort = derive_return_lgort( lv_lgort ).

  SELECT mard~werks,
         @lv_lgort AS lgort,
         @lv_source_lgort AS source_lgort,
         mard~matnr,
         makt~maktx,
         mara~meins,
         SUM( mard~labst ) AS sap_stock
    FROM mard
    INNER JOIN mara ON mara~matnr = mard~matnr
    LEFT OUTER JOIN makt ON makt~matnr = mard~matnr
                        AND makt~spras = @sy-langu
    WHERE mard~werks = @lv_werks
      AND mard~lgort = @lv_source_lgort
      AND mard~labst > 0
    GROUP BY mard~werks, mard~matnr, makt~maktx, mara~meins
    INTO CORRESPONDING FIELDS OF TABLE @et_entityset.

  SORT et_entityset BY matnr.
ENDMETHOD.

" ----------------------------------------------------------------------
" VALIDATE_RETURN_FACTORY_ITEMS
" Stoktan fazla sayim transfer edilemez. Stoktan az sayim gonderime izinli,
" eksik kalan miktar sayim farki akisi icin isaretlenir.
" ----------------------------------------------------------------------

METHOD validate_return_factory_items.
  DATA lr_matnr TYPE RANGE OF matnr.
  DATA lt_valid_altnd TYPE HASHED TABLE OF zsd_t_refund_008-altnd
    WITH UNIQUE KEY table_line.

  SELECT DISTINCT altnd
    FROM zsd_t_refund_008
    WHERE grund = '0002'
    INTO TABLE @lt_valid_altnd.

  LOOP AT ct_items ASSIGNING FIELD-SYMBOL(<item>).
    <item>-matnr = |{ <item>-matnr ALPHA = IN }|.

    IF <item>-mengeuretimhatali < 0
       OR <item>-mengefabrikalojistik < 0
       OR <item>-mengesatisfirekati < 0
       OR <item>-mengesatisfiresivi < 0
       OR <item>-mengesatisfireuht < 0
       OR <item>-mengesatisfirecam < 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |{ <item>-matnr ALPHA = OUT }: negatif miktar girilemez|.
    ENDIF.

    IF <item>-mengeuretimhatali > 0.
      IF <item>-uretimaltneden IS INITIAL OR <item>-uretimskt IS INITIAL.
        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
          EXPORTING
            textid  = /iwbep/cx_mgw_busi_exception=>business_error
            message = |{ <item>-matnr ALPHA = OUT }: uretim hatasi alt nedeni ve SKT zorunludur|.
      ENDIF.
      IF NOT line_exists( lt_valid_altnd[ table_line = <item>-uretimaltneden ] ).
        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
          EXPORTING
            textid  = /iwbep/cx_mgw_busi_exception=>business_error
            message = |{ <item>-matnr ALPHA = OUT }: uretim hatasi alt nedeni gecersizdir|.
      ENDIF.
    ENDIF.

    DATA(lv_category_total) =
        <item>-mengeuretimhatali
      + <item>-mengefabrikalojistik
      + <item>-mengesatisfirekati
      + <item>-mengesatisfiresivi
      + <item>-mengesatisfireuht
      + <item>-mengesatisfirecam.

    IF <item>-mengesayim <> lv_category_total.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |{ <item>-matnr ALPHA = OUT }: toplam kategori miktarlariyla ayni olmalidir|.
    ENDIF.

    APPEND VALUE #( sign = 'I' option = 'EQ' low = <item>-matnr )
      TO lr_matnr.
  ENDLOOP.

  SELECT mard~matnr,
         SUM( mard~labst ) AS labst
    FROM mard
    INNER JOIN mara ON mara~matnr = mard~matnr
                   AND mara~mtart <> 'ZSTK'
    WHERE mard~werks = @iv_werks
      AND mard~lgort = @iv_source_lgort
      AND mard~matnr IN @lr_matnr
    GROUP BY mard~matnr
    INTO TABLE @DATA(lt_mard).
  SORT lt_mard BY matnr.

  LOOP AT ct_items ASSIGNING <item>.
    READ TABLE lt_mard WITH KEY matnr = <item>-matnr
      BINARY SEARCH INTO DATA(ls_mard).
    DATA(lv_stock) = COND labst(
      WHEN sy-subrc = 0 THEN ls_mard-labst
      ELSE 0 ).
    <item>-sapstock = lv_stock.

    IF <item>-mengesayim > lv_stock.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |{ <item>-matnr ALPHA = OUT }: toplam iade depo stokundan fazla; gonderim yapilamaz|.
    ENDIF.
  ENDLOOP.
ENDMETHOD.

" ----------------------------------------------------------------------
" CREATE_DEEP_ENTITY entegrasyonu
" ----------------------------------------------------------------------

METHOD /iwbep/if_mgw_appl_srv_runtime~create_deep_entity.
  DATA:
    ls_return_factory TYPE ty_s_return_factory_deep,
    lv_werks          TYPE werks_d.

  IF iv_entity_name <> 'ReturnFactoryShipment'.
    super->/iwbep/if_mgw_appl_srv_runtime~create_deep_entity(
      EXPORTING
        iv_entity_name          = iv_entity_name
        iv_entity_set_name      = iv_entity_set_name
        iv_source_name          = iv_source_name
        io_data_provider        = io_data_provider
        it_key_tab              = it_key_tab
        it_navigation_path      = it_navigation_path
        io_expand               = io_expand
        io_tech_request_context = io_tech_request_context
      IMPORTING
        er_deep_entity          = er_deep_entity ).
    RETURN.
  ENDIF.

  io_data_provider->read_entry_data( IMPORTING es_data = ls_return_factory ).

  IF ls_return_factory-werks IS NOT INITIAL.
    lv_werks = ls_return_factory-werks.
  ENDIF.

  IF lv_werks IS INITIAL.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Fabrika üretim yeri seçimi zorunludur'.
  ENDIF.

  IF ls_return_factory-lgort IS INITIAL.
    ls_return_factory-lgort = '1900'.
  ENDIF.
  IF ls_return_factory-sourcelgort IS INITIAL.
    ls_return_factory-sourcelgort =
      derive_return_lgort( ls_return_factory-lgort ).
  ENDIF.
  IF ls_return_factory-plakano IS INITIAL.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Plaka seçimi zorunludur'.
  ENDIF.
  IF ls_return_factory-loguid IS INITIAL.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'LogUid zorunludur'.
  ENDIF.
  IF ls_return_factory-toitems IS INITIAL.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'En az bir ürün sayılmalıdır'.
  ENDIF.

  LOOP AT ls_return_factory-toitems ASSIGNING FIELD-SYMBOL(<deep_item>).
    IF <deep_item>-lgort IS INITIAL.
      <deep_item>-lgort = ls_return_factory-lgort.
    ENDIF.
    IF <deep_item>-irstar IS INITIAL.
      <deep_item>-irstar = ls_return_factory-irstar.
    ENDIF.
    IF <deep_item>-plakano IS INITIAL.
      <deep_item>-plakano = ls_return_factory-plakano.
    ENDIF.
  ENDLOOP.

  validate_return_factory_items(
    EXPORTING
      iv_werks        = gc_default_return_werks
      iv_source_lgort = ls_return_factory-sourcelgort
    CHANGING
      ct_items        = ls_return_factory-toitems ).

  post_return_factory_shipment(
    is_deep = ls_return_factory
    iv_werks = lv_werks ).

  copy_data_to_ref(
    EXPORTING
      is_data = ls_return_factory
    CHANGING
      cr_data = er_deep_entity ).
ENDMETHOD.

" ----------------------------------------------------------------------
" POST_RETURN_FACTORY_SHIPMENT
" 1) ZZGRUND 2 ve 4 icin ayri UB siparisleri olusturulur.
" 2) 18xx iade depodan PO referansli 351 cikis yapilir.
" 3) SapStock > MengeSayim ise fark miktar once 311 ile 18xx -> 19xx
"    transfer edilir, ardindan 702 sayim farki olarak kapatilir.
" 4) UB, kategori ve malzeme belgeleri ZMM_T_BDY_FSH_* tablolarina yazilir.
" 5) Mevcut giden irsaliye cikti akisi tetiklenir.
" ----------------------------------------------------------------------

METHOD create_return_factory_log.
  DATA:
    lv_irs_tar  TYPE dats,
    lv_irs_time TYPE tims.

  rv_log_uid = is_deep-loguid.
  IF rv_log_uid IS INITIAL.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'LogUid zorunludur'.
  ENDIF.

  CALL FUNCTION 'ENQUEUE_EZMM_T_BDY_FSH'
    EXPORTING
      mandt          = sy-mandt
      log_uid        = rv_log_uid
      _scope         = '1'
      _wait          = abap_false
    EXCEPTIONS
      foreign_lock   = 1
      system_failure = 2
      OTHERS         = 3.
  IF sy-subrc <> 0.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Bu fabrika gönderimi başka bir işlem tarafından işleniyor'.
  ENDIF.

  SELECT SINGLE status
    FROM zmm_t_bdy_fsh_h
    WHERE log_uid = @rv_log_uid
    INTO @DATA(lv_status).

  IF sy-subrc = 0 AND lv_status = 'S'.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
      EXPORTING
        mandt   = sy-mandt
        log_uid = rv_log_uid
        _scope  = '1'.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Bu fabrika gönderimi daha önce tamamlandı'.
  ELSEIF sy-subrc = 0 AND lv_status = 'P'.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
      EXPORTING
        mandt   = sy-mandt
        log_uid = rv_log_uid
        _scope  = '1'.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Bu fabrika gönderimi işleniyor'.
  ELSEIF sy-subrc = 0 AND lv_status = 'E'.
    SELECT SINGLE @abap_true
      FROM zmm_t_bdy_fsh_i
      WHERE log_uid = @rv_log_uid
        AND ( ebeln <> @space
           OR mblnr_351 <> @space
           OR mblnr_311 <> @space
           OR mblnr_702 <> @space )
      INTO @DATA(lv_has_business_document).
    IF lv_has_business_document = abap_true.
      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
        EXPORTING
          mandt   = sy-mandt
          log_uid = rv_log_uid
          _scope  = '1'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Önceki denemede belge oluştu. Mükerrer işlem riski nedeniyle işlem kaydı kontrol edilmelidir'.
    ENDIF.
  ENDIF.

  IF is_deep-irstar IS NOT INITIAL.
    CONVERT TIME STAMP is_deep-irstar TIME ZONE sy-zonlo
      INTO DATE lv_irs_tar TIME lv_irs_time.
  ELSE.
    lv_irs_tar  = sy-datum.
    lv_irs_time = sy-uzeit.
  ENDIF.

  MODIFY zmm_t_bdy_fsh_h FROM VALUE #(
    mandt        = sy-mandt
    log_uid      = rv_log_uid
    lgort        = is_deep-lgort
    source_lgort = is_deep-sourcelgort
    werks        = is_deep-werks
    irs_tar      = lv_irs_tar
    plaka_no     = is_deep-plakano
    status       = 'P'
    last_step    = 'START'
    ernam        = sy-uname
    erdat        = sy-datum
    erzet        = sy-uzeit
    aenam        = sy-uname
    aedat        = sy-datum
    aezet        = sy-uzeit ).
  IF sy-subrc <> 0.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
      EXPORTING
        mandt   = sy-mandt
        log_uid = rv_log_uid
        _scope  = '1'.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Fabrika gönderim log başlığı oluşturulamadı'.
  ENDIF.

  COMMIT WORK AND WAIT.
ENDMETHOD.

METHOD save_return_factory_log.
  IF iv_log_uid IS INITIAL.
    RETURN.
  ENDIF.

  DATA(lv_last_message) = CONV zmm_de_bdy_msg( iv_last_message ).
  DATA(lv_last_step) = COND zmm_de_bdy_step(
    WHEN iv_status = 'S' THEN 'COMPLETE'
    WHEN iv_status = 'E' THEN 'ERROR'
    ELSE 'START' ).

  UPDATE zmm_t_bdy_fsh_h
    SET status       = @iv_status,
        last_step    = @lv_last_step,
        last_message = @lv_last_message,
        aenam        = @sy-uname,
        aedat        = @sy-datum,
        aezet        = @sy-uzeit
    WHERE log_uid = @iv_log_uid.

  COMMIT WORK AND WAIT.

  CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
    EXPORTING
      mandt   = sy-mandt
      log_uid = iv_log_uid
      _scope  = '1'.
ENDMETHOD.

METHOD post_return_factory_shipment.
  TYPES:
    BEGIN OF ty_category,
      po_group    TYPE char1,
      category    TYPE char10,
      source_posnr TYPE posnr,
      material    TYPE matnr,
      quantity  TYPE menge_d,
      sap_stock TYPE labst,
      uom       TYPE meins,
      zzgrund   TYPE ekpo-zzgrund,
      zzaltndn  TYPE ekpo-zzaltndn,
      zzsktar   TYPE ekpo-zzsktar,
    END OF ty_category,
    BEGIN OF ty_po_gm_item,
      po_item  TYPE ebelp,
      material TYPE matnr,
      quantity TYPE menge_d,
      uom      TYPE meins,
    END OF ty_po_gm_item.

  DATA:
    lv_log_uid   TYPE sysuuid_c32,
    ls_head         TYPE bapi2017_gm_head_01,
    ls_code         TYPE bapi2017_gm_code,
    lt_item         TYPE TABLE OF bapi2017_gm_item_create,
    lt_return       TYPE bapiret2_t,
    lv_mblnr        TYPE mblnr,
    lv_mjahr        TYPE mjahr,
    lv_message      TYPE string,
    lv_bapi_message TYPE string,
    lv_ebeln        TYPE bapimepoheader-po_number,
    lv_po_item      TYPE ebelp,
    lv_log_po_item  TYPE ebelp,
    lv_log_write_failed TYPE abap_bool,
    lt_category     TYPE TABLE OF ty_category,
    lt_po_gm_item   TYPE TABLE OF ty_po_gm_item,
    ls_poheader     TYPE bapimepoheader,
    ls_poheaderx    TYPE bapimepoheaderx,
    ls_poitem       TYPE bapimepoitem,
    ls_poitemx      TYPE bapimepoitemx,
    ls_poschedule   TYPE bapimeposchedule,
    ls_poschedulex  TYPE bapimeposchedulx,
    ls_extensionin  TYPE bapiparex,
    ls_te_mepoitem  TYPE bapi_te_mepoitem,
    ls_te_mepoitemx TYPE bapi_te_mepoitemx,
    lt_poitem       TYPE TABLE OF bapimepoitem,
    lt_poitemx      TYPE TABLE OF bapimepoitemx,
    lt_poschedule   TYPE TABLE OF bapimeposchedule,
    lt_poschedulex  TYPE TABLE OF bapimeposchedulx,
    lt_extensionin  TYPE TABLE OF bapiparex,
    lt_po_group     TYPE STANDARD TABLE OF char1 WITH EMPTY KEY,
    lv_awkey        TYPE awkey,
    lv_awtyp        TYPE awtyp VALUE 'MKPF',
    lo_op           TYPE REF TO /dsl/es10_cl_op,
    ls_data         TYPE /dsl/es10_s023.

  FIELD-SYMBOLS <return> TYPE bapiret2.

  lv_log_uid = create_return_factory_log( is_deep = is_deep ).

  IF is_deep-sourcelgort IS INITIAL OR is_deep-lgort IS INITIAL.
    save_return_factory_log(
      iv_log_uid      = lv_log_uid
      iv_status       = 'E'
      iv_last_message = 'Kaynak ve hedef depo yeri belirlenemedi' ).
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Kaynak ve hedef depo yeri belirlenemedi'.
  ENDIF.

  LOOP AT is_deep-toitems ASSIGNING FIELD-SYMBOL(<source_item>).
    APPEND VALUE #(
      po_group = '2' category = 'URETIM'
      source_posnr = <source_item>-posnr
      material = <source_item>-matnr
      quantity = <source_item>-mengeuretimhatali
      sap_stock = <source_item>-sapstock
      uom = <source_item>-meins
      zzgrund = '0002'
      zzaltndn = <source_item>-uretimaltneden
      zzsktar = <source_item>-uretimskt )
      TO lt_category.
    APPEND VALUE #(
      po_group = '4' category = 'FABLOJ'
      source_posnr = <source_item>-posnr
      material = <source_item>-matnr
      quantity = <source_item>-mengefabrikalojistik
      sap_stock = <source_item>-sapstock
      uom = <source_item>-meins
      zzgrund = '4' )
      TO lt_category.
    APPEND VALUE #(
      po_group = '4' category = 'SF-KATI'
      source_posnr = <source_item>-posnr
      material = <source_item>-matnr
      quantity = <source_item>-mengesatisfirekati
      sap_stock = <source_item>-sapstock
      uom = <source_item>-meins
      zzgrund = '4' zzaltndn = '09' )
      TO lt_category.
    APPEND VALUE #(
      po_group = '4' category = 'SF-SIVI'
      source_posnr = <source_item>-posnr
      material = <source_item>-matnr
      quantity = <source_item>-mengesatisfiresivi
      sap_stock = <source_item>-sapstock
      uom = <source_item>-meins
      zzgrund = '4' zzaltndn = '09' )
      TO lt_category.
    APPEND VALUE #(
      po_group = '4' category = 'SF-UHT'
      source_posnr = <source_item>-posnr
      material = <source_item>-matnr
      quantity = <source_item>-mengesatisfireuht
      sap_stock = <source_item>-sapstock
      uom = <source_item>-meins
      zzgrund = '4' zzaltndn = '09' )
      TO lt_category.
    APPEND VALUE #(
      po_group = '4' category = 'SF-CAM'
      source_posnr = <source_item>-posnr
      material = <source_item>-matnr
      quantity = <source_item>-mengesatisfirecam
      sap_stock = <source_item>-sapstock
      uom = <source_item>-meins
      zzgrund = '4' zzaltndn = '09' )
      TO lt_category.
    DATA(lv_log_difference) = <source_item>-sapstock - <source_item>-mengesayim.
    IF lv_log_difference > 0.
      APPEND VALUE #(
        category = 'FARK'
        source_posnr = <source_item>-posnr
        material = <source_item>-matnr
        quantity = lv_log_difference
        sap_stock = <source_item>-sapstock
        uom = <source_item>-meins )
        TO lt_category.
    ENDIF.
  ENDLOOP.
  DELETE lt_category WHERE quantity <= 0.

  LOOP AT lt_category ASSIGNING FIELD-SYMBOL(<log_category>).
    MODIFY zmm_t_bdy_fsh_i FROM VALUE #(
      mandt        = sy-mandt
      log_uid      = lv_log_uid
      posnr        = <log_category>-source_posnr
      category     = <log_category>-category
      matnr        = <log_category>-material
      meins        = <log_category>-uom
      menge        = <log_category>-quantity
      sap_stock    = <log_category>-sap_stock
      zzgrund      = <log_category>-zzgrund
      zzaltndn     = <log_category>-zzaltndn
      zzsktar      = <log_category>-zzsktar
      ernam        = sy-uname
      erdat        = sy-datum
      erzet        = sy-uzeit
      aenam        = sy-uname
      aedat        = sy-datum
      aezet        = sy-uzeit ).
    IF sy-subrc <> 0.
      lv_log_write_failed = abap_true.
    ENDIF.
  ENDLOOP.

  IF lv_log_write_failed = abap_true.
    lv_message = 'Fabrika gönderim kalem kayıtları kaydedilemedi'.
    save_return_factory_log(
      iv_log_uid      = lv_log_uid
      iv_status       = 'E'
      iv_last_message = lv_message ).
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = lv_message.
  ENDIF.
  COMMIT WORK AND WAIT.

  ls_head-pstng_date = sy-datum.
  ls_head-doc_date   = sy-datum.
  ls_head-pr_uname   = sy-uname.
  ls_head-header_txt = is_deep-plakano.

  lt_po_group = VALUE #( ( '2' ) ( '4' ) ).
  LOOP AT lt_po_group ASSIGNING FIELD-SYMBOL(<po_group>).
    IF NOT line_exists( lt_category[ po_group = <po_group> ] ).
      CONTINUE.
    ENDIF.

    CLEAR:
      lv_ebeln,
      lv_po_item,
      ls_poheader,
      ls_poheaderx,
      lt_poitem,
      lt_poitemx,
      lt_poschedule,
      lt_poschedulex,
      lt_extensionin,
      lt_po_gm_item,
      lt_return.

    ls_poheader-doc_type   = 'UB'.
    ls_poheader-comp_code  = '1000'.
    ls_poheader-purch_org  = '3000'.
    ls_poheader-pur_group  = '070'.
    ls_poheader-suppl_plnt = gc_default_return_werks.
    ls_poheader-ref_1      = is_deep-plakano.
    ls_poheader-our_ref    = '041'.

    ls_poheaderx-doc_type   =
    ls_poheaderx-comp_code  =
    ls_poheaderx-purch_org  =
    ls_poheaderx-pur_group  =
    ls_poheaderx-suppl_plnt =
    ls_poheaderx-ref_1      =
    ls_poheaderx-our_ref    = abap_true.

    LOOP AT lt_category ASSIGNING FIELD-SYMBOL(<category>)
      WHERE po_group = <po_group>.
      ADD 10 TO lv_po_item.

      CLEAR ls_poitem.
      ls_poitem-po_item    = lv_po_item.
      ls_poitem-material   = <category>-material.
      ls_poitem-plant      = iv_werks.
      ls_poitem-stge_loc   = gc_factory_target_lgort.
      ls_poitem-quantity   = <category>-quantity.
      ls_poitem-po_unit    = <category>-uom.
      ls_poitem-item_cat   = '7'.
      ls_poitem-trackingno = <category>-category.
      APPEND ls_poitem TO lt_poitem.

      CLEAR ls_poitemx.
      ls_poitemx-po_item    = lv_po_item.
      ls_poitemx-po_itemx   =
      ls_poitemx-material   =
      ls_poitemx-plant      =
      ls_poitemx-stge_loc   =
      ls_poitemx-quantity   =
      ls_poitemx-po_unit    =
      ls_poitemx-item_cat   =
      ls_poitemx-trackingno = abap_true.
      APPEND ls_poitemx TO lt_poitemx.

      APPEND VALUE #(
        po_item       = lv_po_item
        sched_line    = '0001'
        delivery_date = sy-datum
        quantity      = <category>-quantity )
        TO lt_poschedule.
      APPEND VALUE #(
        po_item       = lv_po_item
        sched_line    = '0001'
        po_itemx      = abap_true
        sched_linex   = abap_true
        delivery_date = abap_true
        quantity      = abap_true )
        TO lt_poschedulex.

      CLEAR: ls_extensionin, ls_te_mepoitem.
      ls_te_mepoitem-po_item  = lv_po_item.
      ls_te_mepoitem-zzgrund  = <category>-zzgrund.
      ls_te_mepoitem-zzaltndn = <category>-zzaltndn.
      ls_te_mepoitem-zzsktar  = <category>-zzsktar.
      ls_extensionin-structure  = 'BAPI_TE_MEPOITEM'.
      ls_extensionin-valuepart1 = ls_te_mepoitem.
      APPEND ls_extensionin TO lt_extensionin.

      CLEAR: ls_extensionin, ls_te_mepoitemx.
      ls_te_mepoitemx-po_item  = lv_po_item.
      ls_te_mepoitemx-zzgrund  = abap_true.
      ls_te_mepoitemx-zzaltndn = abap_true.
      IF <category>-zzsktar IS NOT INITIAL.
        ls_te_mepoitemx-zzsktar = abap_true.
      ENDIF.
      ls_extensionin-structure  = 'BAPI_TE_MEPOITEMX'.
      ls_extensionin-valuepart1 = ls_te_mepoitemx.
      APPEND ls_extensionin TO lt_extensionin.

      APPEND VALUE #(
        po_item  = lv_po_item
        material = <category>-material
        quantity = <category>-quantity
        uom      = <category>-uom )
        TO lt_po_gm_item.
    ENDLOOP.

    CALL FUNCTION 'BAPI_PO_CREATE1'
      EXPORTING
        poheader         = ls_poheader
        poheaderx        = ls_poheaderx
      IMPORTING
        exppurchaseorder = lv_ebeln
      TABLES
        return           = lt_return
        poitem           = lt_poitem
        poitemx          = lt_poitemx
        poschedule       = lt_poschedule
        poschedulex      = lt_poschedulex
        extensionin      = lt_extensionin.

    CLEAR lv_message.
    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
      MESSAGE ID <return>-id TYPE <return>-type NUMBER <return>-number
        WITH <return>-message_v1 <return>-message_v2
             <return>-message_v3 <return>-message_v4
        INTO lv_bapi_message.
      lv_message = COND #(
        WHEN lv_message IS INITIAL THEN lv_bapi_message
        ELSE |{ lv_message }; { lv_bapi_message }| ).
    ENDLOOP.

    IF lv_message IS NOT INITIAL OR lv_ebeln IS INITIAL.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      IF lv_message IS INITIAL.
        lv_message = |ZZGRUND { <po_group> } icin UB siparisi olusturulamadi|.
      ENDIF.
      save_return_factory_log(
      iv_log_uid      = lv_log_uid
      iv_status       = 'E'
      iv_last_message = lv_message ).
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = lv_message.
    ENDIF.

    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
      EXPORTING
        wait = abap_true.

    CLEAR lv_log_po_item.
    LOOP AT lt_category ASSIGNING <category>
      WHERE po_group = <po_group>.
      ADD 10 TO lv_log_po_item.
      UPDATE zmm_t_bdy_fsh_i
        SET ebeln = @lv_ebeln,
            ebelp = @lv_log_po_item,
            aenam = @sy-uname,
            aedat = @sy-datum,
            aezet = @sy-uzeit
        WHERE log_uid  = @lv_log_uid
          AND posnr    = @<category>-source_posnr
          AND category = @<category>-category.
    ENDLOOP.
    UPDATE zmm_t_bdy_fsh_h
      SET last_step = 'PO_CREATED',
          aenam     = @sy-uname,
          aedat     = @sy-datum,
          aezet     = @sy-uzeit
      WHERE log_uid = @lv_log_uid.
    COMMIT WORK AND WAIT.

    CLEAR:
      ls_code,
      lt_item,
      lt_return,
      lv_mblnr,
      lv_mjahr.
    ls_code-gm_code = '04'.

    LOOP AT lt_po_gm_item ASSIGNING FIELD-SYMBOL(<po_gm_item>).
      APPEND VALUE #(
        material   = <po_gm_item>-material
        plant      = gc_default_return_werks
        stge_loc   = is_deep-sourcelgort
        move_type  = '351'
        move_plant = iv_werks
        move_stloc = gc_factory_target_lgort
        entry_qnt  = <po_gm_item>-quantity
        entry_uom  = <po_gm_item>-uom
        po_number  = lv_ebeln
        po_item    = <po_gm_item>-po_item )
        TO lt_item.
    ENDLOOP.

    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
      EXPORTING
        goodsmvt_header  = ls_head
        goodsmvt_code    = ls_code
      IMPORTING
        materialdocument = lv_mblnr
        matdocumentyear  = lv_mjahr
      TABLES
        goodsmvt_item    = lt_item
        return           = lt_return.

    CLEAR lv_message.
    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
      MESSAGE ID <return>-id TYPE <return>-type NUMBER <return>-number
        WITH <return>-message_v1 <return>-message_v2
             <return>-message_v3 <return>-message_v4
        INTO lv_bapi_message.
      lv_message = COND #(
        WHEN lv_message IS INITIAL THEN lv_bapi_message
        ELSE |{ lv_message }; { lv_bapi_message }| ).
    ENDLOOP.

    IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      IF lv_message IS INITIAL.
        lv_message = |{ lv_ebeln }: 351 cikis hareketi olusturulamadi|.
      ENDIF.
      save_return_factory_log(
      iv_log_uid      = lv_log_uid
      iv_status       = 'E'
      iv_last_message = lv_message ).
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = lv_message.
    ENDIF.

    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
      EXPORTING
        wait = abap_true.

    UPDATE zmm_t_bdy_fsh_i
      SET mblnr_351 = @lv_mblnr,
          mjahr_351 = @lv_mjahr,
          aenam     = @sy-uname,
          aedat     = @sy-datum,
          aezet     = @sy-uzeit
      WHERE log_uid = @lv_log_uid
        AND zzgrund = @<po_group>.
    UPDATE zmm_t_bdy_fsh_h
      SET last_step = 'GI_351',
          aenam     = @sy-uname,
          aedat     = @sy-datum,
          aezet     = @sy-uzeit
      WHERE log_uid = @lv_log_uid.
    COMMIT WORK AND WAIT.

    CREATE OBJECT lo_op.
    lv_awkey = lv_mblnr && lv_mjahr.
    lo_op->send_document(
      iv_awtyp = lv_awtyp
      iv_awkey = lv_awkey ).

    WAIT UP TO 2 SECONDS.
    CLEAR ls_data.
    SELECT SINGLE *
      FROM /dsl/es10_t010
      INTO @DATA(ls_despatch)
      WHERE awtyp = @lv_awtyp
        AND awkey = @lv_awkey.
    IF sy-subrc = 0.
      MOVE-CORRESPONDING ls_despatch TO ls_data.
      print_despatch(
        p_type  = '2'
        is_data = ls_data ).
    ENDIF.
  ENDLOOP.

  LOOP AT is_deep-toitems ASSIGNING FIELD-SYMBOL(<item>).
    DATA(lv_difference) = <item>-sapstock - <item>-mengesayim.
    IF lv_difference <= 0.
      CONTINUE.
    ENDIF.

    CLEAR: ls_code, lt_item, lt_return, lv_mblnr, lv_mjahr.
    ls_code-gm_code = '04'.
    APPEND VALUE #(
      material   = <item>-matnr
      plant      = gc_default_return_werks
      stge_loc   = is_deep-sourcelgort
      move_plant = gc_default_return_werks
      move_stloc = is_deep-lgort
      move_type  = gc_stock_transfer_bwart
      entry_qnt  = lv_difference
      entry_uom  = <item>-meins )
      TO lt_item.

    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
      EXPORTING
        goodsmvt_header  = ls_head
        goodsmvt_code    = ls_code
      IMPORTING
        materialdocument = lv_mblnr
        matdocumentyear  = lv_mjahr
      TABLES
        goodsmvt_item    = lt_item
        return           = lt_return.

    CLEAR lv_message.
    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
      MESSAGE ID <return>-id TYPE <return>-type NUMBER <return>-number
        WITH <return>-message_v1 <return>-message_v2
             <return>-message_v3 <return>-message_v4
        INTO lv_bapi_message.
      lv_message = COND #(
        WHEN lv_message IS INITIAL THEN lv_bapi_message
        ELSE |{ lv_message }; { lv_bapi_message }| ).
    ENDLOOP.
    IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      IF lv_message IS INITIAL.
        lv_message = |{ <item>-matnr ALPHA = OUT }: 311 transferi olusturulamadi|.
      ENDIF.
      save_return_factory_log(
      iv_log_uid      = lv_log_uid
      iv_status       = 'E'
      iv_last_message = lv_message ).
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = lv_message.
    ENDIF.
    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
      EXPORTING
        wait = abap_true.
    UPDATE zmm_t_bdy_fsh_i
      SET mblnr_311 = @lv_mblnr,
          mjahr_311 = @lv_mjahr,
          aenam     = @sy-uname,
          aedat     = @sy-datum,
          aezet     = @sy-uzeit
      WHERE log_uid  = @lv_log_uid
        AND posnr    = @<item>-posnr
        AND category = 'FARK'.
    UPDATE zmm_t_bdy_fsh_h
      SET last_step = 'DIFF_311',
          aenam     = @sy-uname,
          aedat     = @sy-datum,
          aezet     = @sy-uzeit
      WHERE log_uid = @lv_log_uid.
    COMMIT WORK AND WAIT.

    CLEAR: ls_code, lt_item, lt_return, lv_mblnr, lv_mjahr.
    ls_code-gm_code = '03'.
    APPEND VALUE #(
      material  = <item>-matnr
      plant     = gc_default_return_werks
      stge_loc  = is_deep-lgort
      move_type = gc_inv_diff_bwart
      entry_qnt = lv_difference
      entry_uom = <item>-meins )
      TO lt_item.

    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
      EXPORTING
        goodsmvt_header  = ls_head
        goodsmvt_code    = ls_code
      IMPORTING
        materialdocument = lv_mblnr
        matdocumentyear  = lv_mjahr
      TABLES
        goodsmvt_item    = lt_item
        return           = lt_return.

    CLEAR lv_message.
    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
      MESSAGE ID <return>-id TYPE <return>-type NUMBER <return>-number
        WITH <return>-message_v1 <return>-message_v2
             <return>-message_v3 <return>-message_v4
        INTO lv_bapi_message.
      lv_message = COND #(
        WHEN lv_message IS INITIAL THEN lv_bapi_message
        ELSE |{ lv_message }; { lv_bapi_message }| ).
    ENDLOOP.
    IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      IF lv_message IS INITIAL.
        lv_message = |{ <item>-matnr ALPHA = OUT }: 702 fark hareketi olusturulamadi|.
      ENDIF.
      save_return_factory_log(
      iv_log_uid      = lv_log_uid
      iv_status       = 'E'
      iv_last_message = lv_message ).
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = lv_message.
    ENDIF.
    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
      EXPORTING
        wait = abap_true.
    UPDATE zmm_t_bdy_fsh_i
      SET mblnr_702 = @lv_mblnr,
          mjahr_702 = @lv_mjahr,
          aenam     = @sy-uname,
          aedat     = @sy-datum,
          aezet     = @sy-uzeit
      WHERE log_uid  = @lv_log_uid
        AND posnr    = @<item>-posnr
        AND category = 'FARK'.
    UPDATE zmm_t_bdy_fsh_h
      SET last_step = 'DIFF_702',
          aenam     = @sy-uname,
          aedat     = @sy-datum,
          aezet     = @sy-uzeit
      WHERE log_uid = @lv_log_uid.
    COMMIT WORK AND WAIT.
  ENDLOOP.

  save_return_factory_log(
    iv_log_uid = lv_log_uid
    iv_status  = 'S' ).
ENDMETHOD.
