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
"   MengeFire    Edm.Decimal        Precision 13, Scale 3
"   MengeKalite  Edm.Decimal        Precision 13, Scale 3
"   MengeLansman Edm.Decimal        Precision 13, Scale 3
"   Navigation key:
"     ReturnFactoryShipment(Lgort, IrsTar, PlakaNo)
"       -> ToItems(Lgort, IrsTar, PlakaNo)
"   Item Posnr frontend tarafinda 000010, 000020... olarak gonderilir.
"
" Entity sets:
"   ReturnFactoryVehicleSet, ReturnFactoryStockSet, ReturnFactoryShipmentSet

" ----------------------------------------------------------------------
" PRIVATE SECTION - yeni tipler ve metot tanimlari
" ----------------------------------------------------------------------

CONSTANTS:
  gc_default_return_werks TYPE werks_d VALUE '1900',
  gc_stock_transfer_bwart TYPE bwart   VALUE '311',
  gc_inv_diff_bwart       TYPE bwart   VALUE '702'.

TYPES:
  ty_s_return_factory_item TYPE
    zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnfactoryshipmentitem,
  ty_t_return_factory_item TYPE STANDARD TABLE OF
    zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnfactoryshipmentitem
    WITH DEFAULT KEY,

  BEGIN OF ty_s_return_factory_deep,
    lgort       TYPE lgort_d,
    sourcelgort TYPE lgort_d,
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

METHODS post_return_factory_shipment
  IMPORTING
    is_deep TYPE ty_s_return_factory_deep
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

  LOOP AT ct_items ASSIGNING FIELD-SYMBOL(<item>).
    <item>-matnr = |{ <item>-matnr ALPHA = IN }|.
    IF <item>-mengesayim <> <item>-mengefire + <item>-mengekalite + <item>-mengelansman.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |{ <item>-matnr ALPHA = OUT }: toplam Fire + Kalite + Lansman toplamına eşit olmalıdır|.
    ENDIF.
    APPEND VALUE #( sign = 'I' option = 'EQ' low = <item>-matnr ) TO lr_matnr.
  ENDLOOP.

  SELECT matnr, labst
    FROM mard
    WHERE werks = @iv_werks
      AND lgort = @iv_source_lgort
      AND matnr IN @lr_matnr
    INTO TABLE @DATA(lt_mard).
  SORT lt_mard BY matnr.

  LOOP AT ct_items ASSIGNING <item>.
    READ TABLE lt_mard WITH KEY matnr = <item>-matnr
      BINARY SEARCH INTO DATA(ls_mard).
    DATA(lv_stock) = COND labst( WHEN sy-subrc = 0 THEN ls_mard-labst ELSE 0 ).
    <item>-sapstock = lv_stock.

    IF <item>-mengesayim > lv_stock.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |{ <item>-matnr ALPHA = OUT }: sayılan miktar iade depo stoğundan fazla. Transfer yapılamaz|.
    ENDIF.
  ENDLOOP.
ENDMETHOD.

" ----------------------------------------------------------------------
" CREATE_DEEP_ENTITY entegrasyonu
" ----------------------------------------------------------------------

METHOD /iwbep/if_mgw_appl_srv_runtime~create_deep_entity.
  DATA:
    ls_return_factory TYPE ty_s_return_factory_deep,
    lv_werks          TYPE werks_d VALUE gc_default_return_werks.

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
      iv_werks        = lv_werks
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
" Uygulama noktalari:
" 1) Sayilan miktar kadar UB siparisi olusturulur.
" 2) MIGO/BAPI_GOODSMVT_CREATE ile 18xx iade depodan cikis yapilir.
" 3) SapStock > MengeSayim ise fark miktar once 311 ile 18xx -> 19xx
"    transfer edilir, ardindan 702 sayim farki olarak kapatilir.
" 4) UB siparisi ve mal hareketi dokumanlari form ciktilarina baglanir.
" 5) Iade imha tutanagi ve iade irsaliyeleri icin spool/form ciktisi alinir.
"
" Su an stok farki hareketleri olusturulur. UB siparisi, fabrikaya cikis ve
" form/spool taraflari belge tasarimi netlestiginde bu metodun basindaki
" kategori gruplama noktasina eklenebilir.
" ----------------------------------------------------------------------

METHOD post_return_factory_shipment.
  DATA:
    ls_head       TYPE bapi2017_gm_head_01,
    ls_code       TYPE bapi2017_gm_code,
    lt_item       TYPE STANDARD TABLE OF bapi2017_gm_item_create
                    WITH EMPTY KEY,
    lt_return     TYPE STANDARD TABLE OF bapiret2
                  WITH EMPTY KEY,
    lv_mblnr      TYPE mblnr,
    lv_mjahr      TYPE mjahr,
    lv_message    TYPE string,
    lv_bapi_message TYPE string.

  FIELD-SYMBOLS:
    <return> TYPE bapiret2.

  IF is_deep-sourcelgort IS INITIAL OR is_deep-lgort IS INITIAL.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Kaynak ve hedef depo yeri belirlenemedi'.
  ENDIF.

  "UB siparisi/form tasarimi: ileride bu noktada MengeFire, MengeKalite ve
  "MengeLansman ayri kalem/kategori olarak gruplanip belge numaralari
  "response'a veya izleme tablosuna yazilabilir. Su an yalniz stok farki
  "hareketleri olusturulur.

  ls_head-pstng_date = sy-datum.
  ls_head-doc_date   = sy-datum.
  ls_head-pr_uname   = sy-uname.
  ls_head-ref_doc_no = is_deep-plakano.

  LOOP AT is_deep-toitems ASSIGNING FIELD-SYMBOL(<item>).
    IF <item>-sapstock <= <item>-mengesayim.
      CONTINUE.
    ENDIF.

    DATA(lv_difference) = <item>-sapstock - <item>-mengesayim.

    IF lv_difference <= 0.
      CONTINUE.
    ENDIF.

    CLEAR:
      ls_code,
      lt_item,
      lt_return,
      lv_mblnr,
      lv_mjahr.

    ls_code-gm_code = '04'.

    APPEND VALUE #(
      material   = <item>-matnr
      plant      = iv_werks
      stge_loc   = is_deep-sourcelgort
      move_plant = iv_werks
      move_stloc = is_deep-lgort
      move_type  = gc_stock_transfer_bwart
      entry_qnt  = lv_difference
      entry_uom  = <item>-meins )
      TO lt_item.

    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
      EXPORTING
        goodsmvt_header = ls_head
        goodsmvt_code   = ls_code
      IMPORTING
        materialdocument = lv_mblnr
        matdocumentyear  = lv_mjahr
      TABLES
        goodsmvt_item   = lt_item
        return          = lt_return.

    CLEAR lv_message.
    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
      MESSAGE ID <return>-id
        TYPE <return>-type
        NUMBER <return>-number
        WITH <return>-message_v1 <return>-message_v2
             <return>-message_v3 <return>-message_v4
        INTO lv_bapi_message.
      IF lv_message IS INITIAL.
        lv_message = lv_bapi_message.
      ELSE.
        lv_message = |{ lv_message } { lv_bapi_message }|.
      ENDIF.
    ENDLOOP.

    IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      IF lv_message IS INITIAL.
        lv_message =
          |{ <item>-matnr ALPHA = OUT }: 311 transfer hareketi olusturulamadi|.
      ENDIF.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = lv_message.
    ENDIF.

    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
      EXPORTING
        wait = abap_true.

    CLEAR:
      ls_code,
      lt_item,
      lt_return,
      lv_mblnr,
      lv_mjahr.

    ls_code-gm_code = '03'.

    APPEND VALUE #(
      material  = <item>-matnr
      plant     = iv_werks
      stge_loc  = is_deep-lgort
      move_type = gc_inv_diff_bwart
      entry_qnt = lv_difference
      entry_uom = <item>-meins )
      TO lt_item.

    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
      EXPORTING
        goodsmvt_header = ls_head
        goodsmvt_code   = ls_code
      IMPORTING
        materialdocument = lv_mblnr
        matdocumentyear  = lv_mjahr
      TABLES
        goodsmvt_item   = lt_item
        return          = lt_return.

    CLEAR lv_message.
    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
      MESSAGE ID <return>-id
        TYPE <return>-type
        NUMBER <return>-number
        WITH <return>-message_v1 <return>-message_v2
             <return>-message_v3 <return>-message_v4
        INTO lv_bapi_message.
      IF lv_message IS INITIAL.
        lv_message = lv_bapi_message.
      ELSE.
        lv_message = |{ lv_message } { lv_bapi_message }|.
      ENDIF.
    ENDLOOP.

    IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      IF lv_message IS INITIAL.
        lv_message =
          |{ <item>-matnr ALPHA = OUT }: 702 sayim farki hareketi olusturulamadi|.
      ENDIF.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = lv_message.
    ENDIF.

    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
      EXPORTING
        wait = abap_true.
  ENDLOOP.
ENDMETHOD.
