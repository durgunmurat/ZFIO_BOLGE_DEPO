" ReturnCount depozito geliştirmesi için DPC_EXT patch'i.
" Bu dosyadaki tanımları ve metotları ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT
" sınıfına ekleyin. Entegrasyon noktaları dosyanın sonunda verilmiştir.

" ----------------------------------------------------------------------
" PRIVATE SECTION - yeni tipler ve metot tanımları
" ----------------------------------------------------------------------

CONSTANTS:
  gc_abrvw_deposit TYPE abrvw VALUE '6',
  gc_vkorg         TYPE vkorg VALUE '1000',
  gc_vtweg         TYPE vtweg VALUE '10',
  gc_spart         TYPE spart VALUE '00'.

TYPES:
  BEGIN OF ty_s_deposit_qty,
    matnr TYPE matnr,
    meins TYPE meins,
    menge TYPE kwmeng,
  END OF ty_s_deposit_qty,
  ty_t_deposit_qty TYPE HASHED TABLE OF ty_s_deposit_qty
    WITH UNIQUE KEY matnr,

  BEGIN OF ty_s_deposit_source,
    plasiyer     TYPE kunnr,
    source_vbeln TYPE vbeln_va,
  END OF ty_s_deposit_source,
  ty_t_deposit_source TYPE HASHED TABLE OF ty_s_deposit_source
    WITH UNIQUE KEY plasiyer.

METHODS append_latest_deposit_items
  IMPORTING
    it_headers TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>tt_returnheader
  CHANGING
    ct_items   TYPE ty_t_return_item
  RAISING
    /iwbep/cx_mgw_busi_exception.

METHODS create_deposit_order
  IMPORTING
    iv_log_uid  TYPE sysuuid_c32
    iv_plasiyer TYPE kunnr
    iv_lgort    TYPE lgort_d
    iv_irs_no   TYPE bstkd OPTIONAL
    iv_irs_tar  TYPE dats OPTIONAL
    it_items    TYPE ty_t_return_item
  RETURNING
    VALUE(rv_vbeln) TYPE vbeln_va
  RAISING
    /iwbep/cx_mgw_busi_exception.

METHODS save_return_deposit_draft
  IMPORTING
    iv_log_uid       TYPE sysuuid_c32
    iv_plasiyer      TYPE kunnr
    iv_lgort         TYPE lgort_d
    iv_matnr         TYPE matnr
    iv_meins         TYPE meins
    iv_menge_siparis TYPE kwmeng
    iv_menge_sayim   TYPE kwmeng
    iv_is_external   TYPE abap_bool
    iv_is_confirmed  TYPE abap_bool
    iv_is_deleted    TYPE abap_bool
  RAISING
    /iwbep/cx_mgw_busi_exception.

METHODS load_deposit_draft
  IMPORTING
    iv_log_uid       TYPE sysuuid_c32
    it_expected_items TYPE ty_t_return_item
  RETURNING
    VALUE(rt_items) TYPE ty_t_return_item
  RAISING
    /iwbep/cx_mgw_busi_exception.

" ----------------------------------------------------------------------
" FIND_LATEST_DEPOSIT_ORDER - mevcut metodun yerine
" ----------------------------------------------------------------------

METHOD find_latest_deposit_order.
  DATA(lv_plasiyer) = |{ iv_plasiyer ALPHA = IN }|.

  "Son ZDAI siparişi ekran kaynağı ve yeni sipariş şablonu olarak kullanılır.
  "Tamamlanmış siparişler de son sipariş olabilir; bu yüzden VBUK-GBSTK
  "filtresi burada kullanılmaz.
  SELECT vbeln
    FROM vbak
    WHERE auart = @gc_auart_deposit
      AND kunnr = @lv_plasiyer
    ORDER BY erdat DESCENDING,
             erzet DESCENDING,
             vbeln DESCENDING
    INTO @rv_vbeln
    UP TO 1 ROWS.
  ENDSELECT.

  "İlk defa depozito siparişi yaratılacak plasiyerlerde kaynak sipariş
  "olmayabilir. Okuma akışı bu durumda boş depozito listesi dönebilir.
ENDMETHOD.

" ----------------------------------------------------------------------
" DEPOSITGISET_GET_ENTITYSET - mevcut metodun yerine
" ----------------------------------------------------------------------

METHOD depositgiset_get_entityset.
  SELECT d~matnr,
         d~maktx,
         m~meins
    FROM zmm_t_bdy_0003 AS d
    INNER JOIN mara AS m
      ON m~matnr = d~matnr
    INTO TABLE @DATA(lt_deposit).

  LOOP AT lt_deposit ASSIGNING FIELD-SYMBOL(<deposit>).
    DATA(lv_meins_out) = <deposit>-meins.
    CALL FUNCTION 'CONVERSION_EXIT_CUNIT_OUTPUT'
      EXPORTING
        input          = lv_meins_out
        language       = sy-langu
      IMPORTING
        output         = lv_meins_out
      EXCEPTIONS
        unit_not_found = 1
        OTHERS         = 2.

    APPEND VALUE #(
      matnr = <deposit>-matnr
      maktx = <deposit>-maktx
      meins = lv_meins_out )
      TO et_entityset.
  ENDLOOP.
ENDMETHOD.

" ----------------------------------------------------------------------
" APPEND_LATEST_DEPOSIT_ITEMS - yeni metot
" ----------------------------------------------------------------------

METHOD append_latest_deposit_items.
  DATA:
    lt_plasiyer TYPE SORTED TABLE OF kunnr WITH UNIQUE KEY table_line,
    lt_source   TYPE ty_t_deposit_source,
    lv_posnr    TYPE posnr_va.

  LOOP AT it_headers ASSIGNING FIELD-SYMBOL(<header>)
    WHERE status = 'N'.
    INSERT CONV kunnr( |{ <header>-plasiyer ALPHA = IN }| )
      INTO TABLE lt_plasiyer.
  ENDLOOP.

  IF lt_plasiyer IS INITIAL.
    RETURN.
  ENDIF.

  "Her plasiyer için son ZDAI siparişini bul.
  LOOP AT lt_plasiyer INTO DATA(lv_plasiyer).
    DATA(lv_source_vbeln) = find_latest_deposit_order( lv_plasiyer ).
    IF lv_source_vbeln IS NOT INITIAL.
      INSERT VALUE #(
        plasiyer     = lv_plasiyer
        source_vbeln = lv_source_vbeln )
        INTO TABLE lt_source.
    ENDIF.
  ENDLOOP.

  IF lt_source IS INITIAL.
    RETURN.
  ENDIF.

  SELECT p~vbeln,
         p~posnr,
         p~matnr,
         p~kwmeng,
         p~vrkme,
         t~maktx,
         m~mtart
    FROM vbap AS p
    INNER JOIN mara AS m
      ON m~matnr = p~matnr
    LEFT OUTER JOIN makt AS t
      ON t~matnr = p~matnr
     AND t~spras = @sy-langu
    FOR ALL ENTRIES IN @lt_source
    WHERE p~vbeln = @lt_source-source_vbeln
      AND p~abgru = @space
      AND m~mtart = 'ZSTK'
    INTO TABLE @DATA(lt_zdai_items).

  SORT lt_zdai_items BY vbeln matnr posnr.

  LOOP AT it_headers ASSIGNING <header>
    WHERE status = 'N'.
    DATA(lv_header_plasiyer) =
      CONV kunnr( |{ <header>-plasiyer ALPHA = IN }| ).

    READ TABLE lt_source
      WITH TABLE KEY plasiyer = lv_header_plasiyer
      INTO DATA(ls_source).
    IF sy-subrc <> 0.
      CONTINUE.
    ENDIF.

    DATA lt_qty TYPE ty_t_deposit_qty.
    CLEAR lt_qty.
    LOOP AT lt_zdai_items ASSIGNING FIELD-SYMBOL(<zdai>)
      WHERE vbeln = ls_source-source_vbeln.
      ASSIGN lt_qty[ matnr = <zdai>-matnr ]
        TO FIELD-SYMBOL(<qty>).
      IF sy-subrc <> 0.
        INSERT VALUE #(
          matnr = <zdai>-matnr
          meins = <zdai>-vrkme
          menge = <zdai>-kwmeng )
          INTO TABLE lt_qty.
      ELSE.
        <qty>-menge = <qty>-menge + <zdai>-kwmeng.
      ENDIF.
    ENDLOOP.

    lv_posnr = '900000'.
    LOOP AT lt_qty ASSIGNING <qty>.
      lv_posnr = lv_posnr + 10.

      READ TABLE lt_zdai_items
        WITH KEY vbeln = ls_source-source_vbeln
                 matnr = <qty>-matnr
        BINARY SEARCH
        INTO DATA(ls_text).
      DATA(lv_maktx) = COND maktx(
        WHEN sy-subrc = 0 THEN ls_text-maktx
        ELSE space ).

      DATA(lv_meins_out) = <qty>-meins.
      CALL FUNCTION 'CONVERSION_EXIT_CUNIT_OUTPUT'
        EXPORTING
          input          = lv_meins_out
          language       = sy-langu
        IMPORTING
          output         = lv_meins_out
        EXCEPTIONS
          unit_not_found = 1
          OTHERS         = 2.

      APPEND VALUE #(
        loguid       = <header>-loguid
        posnr        = lv_posnr
        matnr        = <qty>-matnr
        maktx        = lv_maktx
        meins        = lv_meins_out
        mengesiparis = <qty>-menge
        mengesayim   = 0
        mengefire    = 0
        mengekalite  = 0
        mengesatilab = 0
        isdepozito   = abap_true )
        TO ct_items.
    ENDLOOP.
  ENDLOOP.
ENDMETHOD.

" ----------------------------------------------------------------------
" SAVE_RETURN_DEPOSIT_DRAFT - yalnız taslak kaydeder, sipariş yaratmaz
" ----------------------------------------------------------------------

METHOD save_return_deposit_draft.
  DATA(lv_matnr) = CONV matnr( |{ iv_matnr ALPHA = IN }| ).

  IF iv_log_uid IS INITIAL OR lv_matnr IS INITIAL.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Depozito taslağı için LogUid ve malzeme zorunludur'.
  ENDIF.

  CALL FUNCTION 'ENQUEUE_EZMM_T_BDY_IRS_D'
    EXPORTING
      mandt          = sy-mandt
      log_uid        = iv_log_uid
    EXCEPTIONS
      foreign_lock   = 1
      system_failure = 2
      OTHERS         = 3.
  IF sy-subrc <> 0.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Depozito taslağı başka bir işlem tarafından güncelleniyor'.
  ENDIF.

  SELECT SINGLE *
    FROM zmm_t_bdy_irs_dh
    WHERE log_uid = @iv_log_uid
    INTO @DATA(ls_header).

  IF sy-subrc <> 0.
    ls_header = VALUE #(
      mandt     = sy-mandt
      log_uid   = iv_log_uid
      plasiyer  = |{ iv_plasiyer ALPHA = IN }|
      lgort     = iv_lgort
      status    = 'D'
      ernam     = sy-uname
      erdat     = sy-datum
      erzet     = sy-uzeit ).
  ELSEIF ls_header-status = 'S'.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Tamamlanmış depozito sayımı değiştirilemez'.
  ENDIF.

  ls_header-plasiyer = |{ iv_plasiyer ALPHA = IN }|.
  ls_header-lgort    = iv_lgort.
  ls_header-status   = 'D'.
  ls_header-aenam    = sy-uname.
  ls_header-aedat    = sy-datum.
  ls_header-aezet    = sy-uzeit.
  MODIFY zmm_t_bdy_irs_dh FROM @ls_header.

  SELECT SINGLE *
    FROM zmm_t_bdy_irs_di
    WHERE log_uid = @iv_log_uid
      AND matnr   = @lv_matnr
    INTO @DATA(ls_item).

  IF sy-subrc <> 0.
    ls_item = VALUE #(
      mandt   = sy-mandt
      log_uid = iv_log_uid
      matnr   = lv_matnr
      ernam   = sy-uname
      erdat   = sy-datum
      erzet   = sy-uzeit ).
  ENDIF.

  ls_item-meins         = iv_meins.
  ls_item-menge_siparis = iv_menge_siparis.
  ls_item-menge_sayim   = iv_menge_sayim.
  ls_item-is_external   = xsdbool( iv_is_external = abap_true ).
  ls_item-is_confirmed  = xsdbool(
    iv_is_confirmed = abap_true AND iv_is_deleted = abap_false ).
  ls_item-is_deleted    = xsdbool( iv_is_deleted = abap_true ).
  ls_item-aenam         = sy-uname.
  ls_item-aedat         = sy-datum.
  ls_item-aezet         = sy-uzeit.
  MODIFY zmm_t_bdy_irs_di FROM @ls_item.

  IF sy-subrc <> 0.
    ROLLBACK WORK.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Depozito taslağı kaydedilemedi'.
  ENDIF.

  COMMIT WORK AND WAIT.
  CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
    EXPORTING
      mandt   = sy-mandt
      log_uid = iv_log_uid.
ENDMETHOD.

" ----------------------------------------------------------------------
" LOAD_DEPOSIT_DRAFT - nihai onay için aktif ve onaylı taslağı döndürür
" ----------------------------------------------------------------------

METHOD load_deposit_draft.
  DATA lr_matnr TYPE RANGE OF matnr.

  lr_matnr = VALUE #(
    FOR ls_expected IN it_expected_items
    ( sign   = 'I'
      option = 'EQ'
      low    = CONV matnr(
        |{ ls_expected-matnr ALPHA = IN }| ) ) ).

  IF lr_matnr IS INITIAL.
    RETURN.
  ENDIF.

  SELECT *
    FROM zmm_t_bdy_irs_di
    WHERE log_uid    = @iv_log_uid
      AND is_deleted = @abap_false
      AND matnr      IN @lr_matnr
    INTO TABLE @DATA(lt_draft).

  LOOP AT it_expected_items ASSIGNING FIELD-SYMBOL(<expected>).
    DATA(lv_expected_matnr) =
      CONV matnr( |{ <expected>-matnr ALPHA = IN }| ).

    READ TABLE lt_draft
      WITH KEY matnr = lv_expected_matnr
      INTO DATA(ls_draft_check).
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Depozito { lv_expected_matnr ALPHA = OUT } taslakta bulunamadı|.
    ENDIF.

    IF ls_draft_check-is_confirmed <> abap_true.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Depozito { lv_expected_matnr ALPHA = OUT } için Tamam alanı taslağa kaydedilmemiş|.
    ENDIF.
  ENDLOOP.

  rt_items = VALUE #(
    FOR ls_draft IN lt_draft
    ( log_uid      = ls_draft-log_uid
      posnr        = ls_draft-posnr
      matnr        = ls_draft-matnr
      meins        = ls_draft-meins
      mengesiparis = ls_draft-menge_siparis
      mengesayim   = ls_draft-menge_sayim
      mengesatilab = ls_draft-menge_sayim
      isdepozito   = abap_true ) ).
ENDMETHOD.

" ----------------------------------------------------------------------
" CREATE_DEPOSIT_ORDER - yalnız Sayımı Onayla akışından çağrılır
" ----------------------------------------------------------------------

METHOD create_deposit_order.
  DATA:
    lt_deposit_qty      TYPE ty_t_deposit_qty,
    ls_header_in        TYPE bapisdhd1,
    ls_header_inx       TYPE bapisdhd1x,
    lt_items_in         TYPE STANDARD TABLE OF bapisditm
                          WITH EMPTY KEY,
    lt_items_inx        TYPE STANDARD TABLE OF bapisditmx
                          WITH EMPTY KEY,
    lt_schedules_in     TYPE STANDARD TABLE OF bapischdl
                          WITH EMPTY KEY,
    lt_schedules_inx    TYPE STANDARD TABLE OF bapischdlx
                          WITH EMPTY KEY,
    lt_partners         TYPE STANDARD TABLE OF bapiparnr
                          WITH EMPTY KEY,
    lt_return           TYPE bapiret2_t,
    lv_source_vbeln     TYPE vbeln_va,
    lv_salesdocument    TYPE bapivbeln-vbeln,
    lv_vbtyp            TYPE vbtyp,
    lv_business_object  TYPE oj_name,
    lv_create_subrc     TYPE sysubrc,
    lv_werks            TYPE werks_d,
    lv_posnr            TYPE posnr_va.

  LOOP AT it_items ASSIGNING FIELD-SYMBOL(<item>)
    WHERE isdepozito = abap_true
      AND mengesayim > 0.
    DATA(lv_matnr) = CONV matnr( |{ <item>-matnr ALPHA = IN }| ).

    ASSIGN lt_deposit_qty[ matnr = lv_matnr ]
      TO FIELD-SYMBOL(<qty>).
    IF sy-subrc <> 0.
      INSERT VALUE #(
        matnr = lv_matnr
        meins = CONV meins( <item>-meins )
        menge = <item>-mengesayim )
        INTO TABLE lt_deposit_qty.
    ELSE.
      <qty>-menge = <qty>-menge + <item>-mengesayim.
    ENDIF.
  ENDLOOP.

  IF lt_deposit_qty IS INITIAL.
    RETURN.
  ENDIF.

  SELECT matnr, mtart, meins
    FROM mara
    FOR ALL ENTRIES IN @lt_deposit_qty
    WHERE matnr = @lt_deposit_qty-matnr
    INTO TABLE @DATA(lt_materials).
  SORT lt_materials BY matnr.

  LOOP AT lt_deposit_qty ASSIGNING <qty>.
    READ TABLE lt_materials
      WITH KEY matnr = <qty>-matnr
      BINARY SEARCH
      INTO DATA(ls_material).
    IF sy-subrc <> 0 OR ls_material-mtart <> 'ZSTK'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |{ <qty>-matnr } geçerli bir ZSTK depozito malzemesi değildir|.
    ENDIF.

    "Frontend ölçü birimi boş veya hatalıysa temel ölçü birimini kullan.
    IF <qty>-meins IS INITIAL.
      <qty>-meins = ls_material-meins.
    ELSE.
      CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
        EXPORTING
          input          = <qty>-meins
          language       = sy-langu
        IMPORTING
          output         = <qty>-meins
        EXCEPTIONS
          unit_not_found = 1
          OTHERS         = 2.
      IF sy-subrc <> 0.
        <qty>-meins = ls_material-meins.
      ENDIF.
    ENDIF.
  ENDLOOP.

  CALL FUNCTION 'ENQUEUE_EZMM_T_BDY_IRS_D'
    EXPORTING
      mandt          = sy-mandt
      log_uid        = iv_log_uid
    EXCEPTIONS
      foreign_lock   = 1
      system_failure = 2
      OTHERS         = 3.
  IF sy-subrc <> 0.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Bu iade sayımı başka bir işlem tarafından işleniyor'.
  ENDIF.

  "Timeout veya tekrar POST halinde aynı LogUid için ikinci ZDAI yaratma.
  SELECT SINGLE zdai_vbeln
    FROM zmm_t_bdy_irs_dh
    WHERE log_uid = @iv_log_uid
      AND status  = 'S'
    INTO @rv_vbeln.
  IF sy-subrc = 0 AND rv_vbeln IS NOT INITIAL.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid.
    RETURN.
  ENDIF.

  DATA(lv_plasiyer) = CONV kunnr( |{ iv_plasiyer ALPHA = IN }| ).
  lv_source_vbeln = find_latest_deposit_order( lv_plasiyer ).

  SELECT SINGLE vwerk
    FROM knvv
    WHERE kunnr = @lv_plasiyer
      AND vkorg = @gc_vkorg
      AND vtweg = @gc_vtweg
      AND spart = @gc_spart
    INTO @lv_werks.

  IF lv_werks IS INITIAL AND lv_source_vbeln IS NOT INITIAL.

    SELECT SINGLE werks
      FROM vbap
      WHERE vbeln = @lv_source_vbeln
        AND werks <> @space
      INTO @lv_werks.

  ENDIF.

  IF lv_werks IS INITIAL.
    "KNVV ve kaynak ZDAI tesis vermiyorsa, depo yerinin yalnız bir tesiste
    "tanımlı olması şartıyla T001L son çare olarak kullanılır.
    SELECT DISTINCT werks
      FROM t001l
      WHERE lgort = @iv_lgort
      INTO TABLE @DATA(lt_werks).
    IF lines( lt_werks ) = 1.
      lv_werks = lt_werks[ 1 ]-werks.
    ENDIF.
  ENDIF.

  IF lv_werks IS INITIAL.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = |{ iv_plasiyer } için ZDAI tesisi belirlenemedi|.
  ENDIF.

  ls_header_in-doc_type   = gc_auart_deposit.
  ls_header_in-sales_org  = gc_vkorg.
  ls_header_in-distr_chan = gc_vtweg.
  ls_header_in-division   = gc_spart.

  ls_header_inx-updateflag = 'I'.
  ls_header_inx-doc_type   = abap_true.
  ls_header_inx-sales_org  = abap_true.
  ls_header_inx-distr_chan = abap_true.
  ls_header_inx-division   = abap_true.

  IF iv_irs_tar IS NOT INITIAL.
    ls_header_in-req_date_h  = iv_irs_tar.
    ls_header_in-price_date  = iv_irs_tar.
    ls_header_in-purch_date  = iv_irs_tar.
    ls_header_inx-req_date_h = abap_true.
    ls_header_inx-price_date = abap_true.
    ls_header_inx-purch_date = abap_true.
  ENDIF.

  IF iv_irs_no IS NOT INITIAL.
    ls_header_in-purch_no_c  = iv_irs_no.
    ls_header_inx-purch_no_c = abap_true.
  ENDIF.

  APPEND VALUE #(
    partn_role = 'AG'
    partn_numb = lv_plasiyer )
    TO lt_partners.
  APPEND VALUE #(
    partn_role = 'WE'
    partn_numb = lv_plasiyer )
    TO lt_partners.

  lv_posnr = '000000'.
  LOOP AT lt_deposit_qty ASSIGNING <qty>.
    lv_posnr = lv_posnr + 10.

    APPEND VALUE #(
      itm_number = lv_posnr
      material   = <qty>-matnr
      target_qty = <qty>-menge
      target_qu  = <qty>-meins
      sales_unit = <qty>-meins
      plant      = lv_werks
      store_loc  = iv_lgort
      dlvschduse  = gc_abrvw_deposit )
      TO lt_items_in.

    APPEND VALUE #(
      itm_number = lv_posnr
      updateflag = 'I'
      material   = abap_true
      target_qty = abap_true
      target_qu  = abap_true
      sales_unit = abap_true
      plant      = abap_true
      store_loc  = abap_true
      dlvschduse  = abap_true )
      TO lt_items_inx.

    APPEND VALUE #(
      itm_number = lv_posnr
      sched_line = '0001'
      req_date   = iv_irs_tar
      req_qty    = <qty>-menge )
      TO lt_schedules_in.

    APPEND VALUE #(
      itm_number = lv_posnr
      sched_line = '0001'
      updateflag = 'I'
      req_date   = xsdbool( iv_irs_tar IS NOT INITIAL )
      req_qty    = abap_true )
      TO lt_schedules_inx.
  ENDLOOP.

  UPDATE zmm_t_bdy_irs_dh
    SET plasiyer     = @lv_plasiyer
        lgort         = @iv_lgort
        source_vbeln  = @lv_source_vbeln
        status        = 'P'
        aenam         = @sy-uname
        aedat         = @sy-datum
        aezet         = @sy-uzeit
    WHERE log_uid = @iv_log_uid.
  IF sy-dbcnt = 0.
    INSERT zmm_t_bdy_irs_dh FROM VALUE #(
      mandt        = sy-mandt
      log_uid      = iv_log_uid
      plasiyer     = lv_plasiyer
      lgort        = iv_lgort
      source_vbeln = lv_source_vbeln
      status       = 'P'
      ernam        = sy-uname
      erdat        = sy-datum
      erzet        = sy-uzeit ).
  ENDIF.
  IF sy-subrc <> 0.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'ZDAI işlem kilidi oluşturulamadı'.
  ENDIF.

  SELECT SINGLE vbtyp
    FROM tvak
    WHERE auart = @gc_auart_deposit
    INTO @lv_vbtyp.
  IF sy-subrc <> 0 OR lv_vbtyp IS INITIAL.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = |{ gc_auart_deposit } sipariş türü için belge kategorisi bulunamadı|.
  ENDIF.

  CALL FUNCTION 'SD_OBJECT_TYPE_DETERMINE'
    EXPORTING
      i_document_type   = lv_vbtyp
    IMPORTING
      e_business_object = lv_business_object.
  IF lv_business_object IS INITIAL.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = |{ gc_auart_deposit } sipariş türü için business object belirlenemedi|.
  ENDIF.

  CALL FUNCTION 'SD_SALESDOCUMENT_CREATE'
    EXPORTING
      sales_header_in     = ls_header_in
      sales_header_inx    = ls_header_inx
      business_object     = lv_business_object
    IMPORTING
      salesdocument_ex    = lv_salesdocument
    TABLES
      return              = lt_return
      sales_items_in      = lt_items_in
      sales_items_inx     = lt_items_inx
      sales_partners      = lt_partners
      sales_schedules_in  = lt_schedules_in
      sales_schedules_inx = lt_schedules_inx
    EXCEPTIONS
      error_message       = 99.
  lv_create_subrc = sy-subrc.

  IF line_exists( lt_return[ type = 'E' ] )
     OR line_exists( lt_return[ type = 'A' ] )
     OR line_exists( lt_return[ type = 'X' ] )
     OR lv_create_subrc = 99
     OR lv_salesdocument IS INITIAL.
    CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
    UPDATE zmm_t_bdy_irs_dh
      SET status = 'E'
          aenam  = @sy-uname
          aedat  = @sy-datum
          aezet  = @sy-uzeit
      WHERE log_uid = @iv_log_uid.
    COMMIT WORK AND WAIT.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid.
    raise_bapi_messages(
      it_return       = lt_return
      iv_default_text = 'Yeni ZDAI siparişi oluşturulamadı' ).
  ENDIF.

  rv_vbeln = lv_salesdocument.
  UPDATE zmm_t_bdy_irs_dh
    SET zdai_vbeln = @rv_vbeln
        status      = 'P'
        aenam       = @sy-uname
        aedat       = @sy-datum
        aezet       = @sy-uzeit
    WHERE log_uid = @iv_log_uid.
  IF sy-subrc <> 0.
    CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Yaratılan ZDAI taslak kaydına bağlanamadı'.
  ENDIF.
ENDMETHOD.

" ----------------------------------------------------------------------
" CREATE_DEEP_ENTITY - son hali
" ----------------------------------------------------------------------

METHOD /iwbep/if_mgw_appl_srv_runtime~create_deep_entity.
  TYPES:
    BEGIN OF ty_toitems,
      log_uid TYPE sysuuid_c32,
      posnr   TYPE posnr,
    END OF ty_toitems.

  DATA:
    ls_deep               TYPE ty_s_deep_return,
    lt_product_items      TYPE ty_t_return_item,
    lt_payload_deposits   TYPE ty_t_return_item,
    lt_confirmed_deposits TYPE ty_t_return_item,
    lt_log_items          TYPE STANDARD TABLE OF zmm_t_bdy_irs_i,
    ls_log_item           LIKE LINE OF lt_log_items,
    lt_toitems            TYPE TABLE OF ty_toitems,
    lt_backend_expected   TYPE ty_t_expected_qty,
    lr_matnr              TYPE RANGE OF matnr,
    lv_log_uid            TYPE sysuuid_c32,
    lv_vbeln              TYPE vbeln_va,
    lv_irs_tar             TYPE dats,
    lv_irs_time            TYPE tims,
    lv_new_zdai           TYPE vbeln_va.

  IF iv_entity_name <> 'ReturnHeader'.
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

  io_data_provider->read_entry_data(
    IMPORTING
      es_data = ls_deep ).

  lv_log_uid = ls_deep-loguid.
  IF lv_log_uid IS INITIAL.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'LogUid zorunludur'.
  ENDIF.

  IF ls_deep-irstar IS NOT INITIAL.
    CONVERT TIME STAMP ls_deep-irstar
      TIME ZONE sy-zonlo
      INTO DATE lv_irs_tar
           TIME lv_irs_time.
  ENDIF.

  IF ls_deep-toitems IS INITIAL.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'En az bir satır sayılmalıdır'.
  ENDIF.

  LOOP AT ls_deep-toitems ASSIGNING FIELD-SYMBOL(<item>).
    IF <item>-matnr IS INITIAL.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Malzeme numarası eksik'.
    ENDIF.

    <item>-matnr = |{ <item>-matnr ALPHA = IN }|.

    IF <item>-mengesayim < 0
       OR <item>-mengefire < 0
       OR <item>-mengekalite < 0
       OR <item>-mengesatilab < 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Kalem { <item>-posnr }: negatif sayıya izin yok|.
    ENDIF.

    DATA(lv_component_total) =
        <item>-mengefire
      + <item>-mengekalite
      + <item>-mengesatilab.

    IF <item>-mengesayim <> lv_component_total.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Kalem { <item>-posnr }: sayım toplamı Fire + Kalite + Satılabilir toplamına eşit olmalıdır|.
    ENDIF.
  ENDLOOP.

  lr_matnr = VALUE #(
    FOR ls_item IN ls_deep-toitems
    ( sign   = 'I'
      option = 'EQ'
      low    = CONV matnr( ls_item-matnr ) ) ).

  SELECT matnr, mtart
    FROM mara
    WHERE matnr IN @lr_matnr
    INTO TABLE @DATA(lt_submitted_materials).
  SORT lt_submitted_materials BY matnr.

  LOOP AT ls_deep-toitems ASSIGNING <item>.
    READ TABLE lt_submitted_materials
      WITH KEY matnr = <item>-matnr
      BINARY SEARCH
      INTO DATA(ls_material).
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Malzeme { <item>-matnr } mevcut değil|.
    ENDIF.

    <item>-isdepozito = xsdbool( ls_material-mtart = 'ZSTK' ).
    IF <item>-isdepozito = abap_true.
      APPEND <item> TO lt_payload_deposits.
    ELSE.
      APPEND <item> TO lt_product_items.
    ENDIF.
  ENDLOOP.

  lv_vbeln = |{ ls_deep-vbelnva ALPHA = IN }|.

  IF lt_product_items IS NOT INITIAL.
    IF lv_vbeln IS INITIAL.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Ürün iadeleri için ZBIS referans siparişi zorunludur'.
    ENDIF.

    SELECT SINGLE auart
      FROM vbak
      WHERE vbeln = @lv_vbeln
      INTO @DATA(lv_auart).
    IF sy-subrc <> 0 OR lv_auart <> gc_auart_return.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Referans sipariş { lv_vbeln } bir ZBIS iade siparişi değildir|.
    ENDIF.

    SELECT matnr, kwmeng, vrkme
      FROM vbap
      WHERE vbeln = @lv_vbeln
      INTO TABLE @DATA(lt_reference_qty).

    LOOP AT lt_reference_qty ASSIGNING FIELD-SYMBOL(<reference_qty>).
      ASSIGN lt_backend_expected[
        vbeln = lv_vbeln
        matnr = <reference_qty>-matnr ]
        TO FIELD-SYMBOL(<backend_expected>).
      IF sy-subrc <> 0.
        INSERT VALUE #(
          vbeln = lv_vbeln
          matnr = <reference_qty>-matnr
          meins = <reference_qty>-vrkme
          menge = <reference_qty>-kwmeng )
          INTO TABLE lt_backend_expected.
      ELSE.
        <backend_expected>-menge =
          <backend_expected>-menge + <reference_qty>-kwmeng.
      ENDIF.
    ENDLOOP.

    LOOP AT lt_product_items ASSIGNING FIELD-SYMBOL(<product>).
      ASSIGN lt_backend_expected[
        vbeln = lv_vbeln
        matnr = CONV matnr( <product>-matnr ) ]
        TO <backend_expected>.
      IF sy-subrc <> 0.
        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
          EXPORTING
            textid  = /iwbep/cx_mgw_busi_exception=>business_error
            message = |Malzeme { <product>-matnr } sipariş { lv_vbeln } içinde bulunamadı|.
      ENDIF.

      <product>-mengesiparis = <backend_expected>-menge.
      <product>-meins        = <backend_expected>-meins.

      READ TABLE ls_deep-toitems ASSIGNING <item>
        WITH KEY posnr = <product>-posnr
                 matnr = <product>-matnr.
      IF sy-subrc = 0.
        <item>-mengesiparis = <product>-mengesiparis.
        <item>-meins        = <product>-meins.
      ENDIF.
    ENDLOOP.

    "İade nedenleri tekrar etkinleştirilecekse yalnız ürünler gönderilmelidir.
    "update_return_reasons(
    "  iv_vbeln = lv_vbeln
    "  it_items = lt_product_items ).
  ENDIF.

  IF lt_payload_deposits IS NOT INITIAL.
    lt_confirmed_deposits = load_deposit_draft(
      iv_log_uid        = lv_log_uid
      it_expected_items = lt_payload_deposits ).
    IF lt_confirmed_deposits IS INITIAL.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Depozito taslağı bulunamadı. Depozito sayımını yeniden kaydedin'.
    ENDIF.

    lv_new_zdai = create_deposit_order(
      iv_log_uid  = lv_log_uid
      iv_plasiyer = CONV kunnr( ls_deep-plasiyer )
      iv_lgort    = CONV lgort_d( ls_deep-lgort )
      iv_irs_no   = CONV bstkd( ls_deep-irsno )
      iv_irs_tar  = lv_irs_tar
      it_items    = lt_confirmed_deposits ).
  ENDIF.

  IF lt_product_items IS NOT INITIAL.
    lt_toitems = VALUE #(
      FOR ls_product IN lt_product_items
      ( log_uid = lv_log_uid
        posnr   = ls_product-posnr ) ).

    SELECT *
      FROM zmm_t_bdy_irs_i
      FOR ALL ENTRIES IN @lt_toitems
      WHERE log_uid = @lt_toitems-log_uid
        AND posnr   = @lt_toitems-posnr
      INTO TABLE @DATA(lt_existing_log).

    LOOP AT lt_product_items ASSIGNING <product>.
      CLEAR ls_log_item.
      READ TABLE lt_existing_log
        WITH KEY log_uid = lv_log_uid
                 posnr   = <product>-posnr
        INTO DATA(ls_existing_log).
      IF sy-subrc = 0.
        MOVE-CORRESPONDING ls_existing_log TO ls_log_item.
      ENDIF.

      ls_log_item-log_uid       = lv_log_uid.
      ls_log_item-posnr         = <product>-posnr.
      ls_log_item-matnr         = <product>-matnr.
      ls_log_item-meins         = <product>-meins.
      ls_log_item-menge_sayim   = <product>-mengesayim.
      ls_log_item-menge_fire    = <product>-mengefire.
      ls_log_item-menge_kalite  = <product>-mengekalite.
      ls_log_item-menge_satilab = <product>-mengesatilab.
      ls_log_item-is_depozito   = abap_false.
      APPEND ls_log_item TO lt_log_items.
    ENDLOOP.

    MODIFY zmm_t_bdy_irs_i FROM TABLE @lt_log_items.
    IF sy-subrc <> 0.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      IF lt_payload_deposits IS NOT INITIAL.
        CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
          EXPORTING
            mandt   = sy-mandt
            log_uid = lv_log_uid.
      ENDIF.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Ürün sayım kalemleri kaydedilemedi'.
    ENDIF.
  ENDIF.

  UPDATE zmm_t_bdy_irs_h
    SET status = 'S'
        ernam  = @sy-uname
    WHERE log_uid = @lv_log_uid.
  IF sy-subrc <> 0 OR sy-dbcnt = 0.
    CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
    IF lt_payload_deposits IS NOT INITIAL.
      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
        EXPORTING
          mandt   = sy-mandt
          log_uid = lv_log_uid.
    ENDIF.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'İade sayım başlığı tamamlanamadı'.
  ENDIF.

  IF lt_payload_deposits IS NOT INITIAL.
    UPDATE zmm_t_bdy_irs_dh
      SET status = 'S'
          aenam  = @sy-uname
          aedat  = @sy-datum
          aezet  = @sy-uzeit
      WHERE log_uid = @lv_log_uid
        AND zdai_vbeln <> @space.
    IF sy-subrc <> 0 OR sy-dbcnt = 0.
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
        EXPORTING
          mandt   = sy-mandt
          log_uid = lv_log_uid.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'ZDAI işlemi tamamlandı olarak işaretlenemedi'.
    ENDIF.
  ENDIF.

  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING
      wait = abap_true.

  IF lt_payload_deposits IS NOT INITIAL.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = lv_log_uid.
  ENDIF.

  ls_deep-loguid  = lv_log_uid.
  ls_deep-vbelnva = lv_vbeln.
  LOOP AT ls_deep-toitems ASSIGNING <item>.
    <item>-loguid = lv_log_uid.
  ENDLOOP.

  copy_data_to_ref(
    EXPORTING
      is_data = ls_deep
    CHANGING
      cr_data = er_deep_entity ).
ENDMETHOD.

" ----------------------------------------------------------------------
" EXECUTE_ACTION entegrasyonu
" ----------------------------------------------------------------------
"
" IF iv_action_name = 'SaveReturnDepositDraft'.
"   DATA(lv_log_uid_p) = VALUE #( it_parameter[
"     name = 'LogUid' ]-value OPTIONAL ).
"   DATA(lv_plasiyer_p) = VALUE #( it_parameter[
"     name = 'Plasiyer' ]-value OPTIONAL ).
"   DATA(lv_lgort_p) = VALUE #( it_parameter[
"     name = 'Lgort' ]-value OPTIONAL ).
"   DATA(lv_matnr_p) = VALUE #( it_parameter[
"     name = 'Matnr' ]-value OPTIONAL ).
"   DATA(lv_meins_p) = VALUE #( it_parameter[
"     name = 'Meins' ]-value OPTIONAL ).
"   DATA(lv_menge_siparis_p) = VALUE #( it_parameter[
"     name = 'MengeSiparis' ]-value OPTIONAL ).
"   DATA(lv_menge_sayim_p) = VALUE #( it_parameter[
"     name = 'MengeSayim' ]-value OPTIONAL ).
"   DATA(lv_is_external_p) = VALUE #( it_parameter[
"     name = 'IsExternal' ]-value OPTIONAL ).
"   DATA(lv_is_confirmed_p) = VALUE #( it_parameter[
"     name = 'IsConfirmed' ]-value OPTIONAL ).
"   DATA(lv_is_deleted_p) = VALUE #( it_parameter[
"     name = 'IsDeleted' ]-value OPTIONAL ).
"
"   TRANSLATE lv_is_external_p TO UPPER CASE.
"   TRANSLATE lv_is_confirmed_p TO UPPER CASE.
"   TRANSLATE lv_is_deleted_p TO UPPER CASE.
"
"   save_return_deposit_draft(
"     iv_log_uid       = CONV #( lv_log_uid_p )
"     iv_plasiyer      = CONV #( lv_plasiyer_p )
"     iv_lgort         = CONV #( lv_lgort_p )
"     iv_matnr         = CONV #( lv_matnr_p )
"     iv_meins         = CONV #( lv_meins_p )
"     iv_menge_siparis = CONV #( lv_menge_siparis_p )
"     iv_menge_sayim   = CONV #( lv_menge_sayim_p )
"     iv_is_external   = xsdbool(
"       lv_is_external_p = 'TRUE'
"       OR lv_is_external_p = 'X'
"       OR lv_is_external_p = '1' )
"     iv_is_confirmed  = xsdbool(
"       lv_is_confirmed_p = 'TRUE'
"       OR lv_is_confirmed_p = 'X'
"       OR lv_is_confirmed_p = '1' )
"     iv_is_deleted    = xsdbool(
"       lv_is_deleted_p = 'TRUE'
"       OR lv_is_deleted_p = 'X'
"       OR lv_is_deleted_p = '1' ) ).
"   RETURN.
" ENDIF.
"
" ----------------------------------------------------------------------
" LOAD_RETURN_DATA entegrasyonu
" ----------------------------------------------------------------------
"
" Mevcut persisted item loop'u tamamlandıktan sonra:
"
" append_latest_deposit_items(
"   EXPORTING
"     it_headers = et_headers
"   CHANGING
"     ct_items   = et_items ).
"
" SORT et_items BY loguid posnr.
"
" ----------------------------------------------------------------------
" TY_S_DEEP_RETURN düzeltmesi
" ----------------------------------------------------------------------
"
" Header component'lerine aşağıdaki alanı ekleyin:
"
" status TYPE
"   zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-status,
