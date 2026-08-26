class ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT definition
  public
  inheriting from ZCL_ZMM_BOLGE_DEPO_YON_DPC
  create public .

public section.

  types:
    BEGIN OF ty_s_deposit_qty,
        matnr TYPE matnr,
        meins TYPE meins,
        menge TYPE kwmeng,
      END OF ty_s_deposit_qty .
  types:
    ty_t_deposit_qty TYPE HASHED TABLE OF ty_s_deposit_qty
      WITH UNIQUE KEY matnr .
  types:
    BEGIN OF ty_s_deposit_source,
        plasiyer     TYPE kunnr,
        source_vbeln TYPE vbeln_va,
      END OF ty_s_deposit_source .
  types:
    ty_t_deposit_source TYPE HASHED TABLE OF ty_s_deposit_source
      WITH UNIQUE KEY plasiyer .
  types:
    BEGIN OF ty_s_deep_return,
        "Do not use INCLUDE TYPE here. Gateway's deep serializer resolves
        "entity properties from physical top-level components. An INCLUDE
        "group is seen as one nested component, causing IrsTar and the
        "other header properties to be serialized from initial values.
        loguid       TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-loguid,
        vbelnva      TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-vbelnva,
        irstar       TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-irstar,
        lgort        TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-lgort,
        plasiyer     TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-plasiyer,
        kunnr        TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-kunnr,
        shipmenttype TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-shipmenttype,
        returntype   TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-returntype,
        status       TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-status,
        plasiyername TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-plasiyername,
        kunnrname    TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-kunnrname,
        irsno        TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnheader-irsno,
        toitems      TYPE STANDARD TABLE OF
          zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnitem WITH DEFAULT KEY,
      END OF ty_s_deep_return .
  types:
    ty_t_deep_return TYPE STANDARD TABLE OF ty_s_deep_return
        WITH DEFAULT KEY .
  types:
    ty_t_return_item TYPE STANDARD TABLE OF
        zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnitem WITH DEFAULT KEY .
  types:
    BEGIN OF ts_deep_deliverynote,
      deliverynumber    TYPE string,
      lpid              TYPE string,
      totalmaterialno   TYPE string,
      total1            TYPE /iwbep/sb_odata_ty_int2,
      total2            TYPE /iwbep/sb_odata_ty_int2,
      total3            TYPE /iwbep/sb_odata_ty_int2,
      total4            TYPE /iwbep/sb_odata_ty_int2,
      total5            TYPE /iwbep/sb_odata_ty_int2,
      total6            TYPE /iwbep/sb_odata_ty_int2,
      total7            TYPE /iwbep/sb_odata_ty_int2,
      total8            TYPE /iwbep/sb_odata_ty_int2,
      total9            TYPE /iwbep/sb_odata_ty_int2,
      totaldepozito     TYPE /iwbep/sb_odata_ty_int2,
      totalporsiyon     TYPE /iwbep/sb_odata_ty_int2,
      total1text        TYPE string,
      total2text        TYPE string,
      total3text        TYPE string,
      total4text        TYPE string,
      total5text        TYPE string,
      total6text        TYPE string,
      total7text        TYPE string,
      total8text        TYPE string,
      total9text        TYPE string,
      totaldepozitotext TYPE string,
      totalporsiyontext TYPE string,
      toitems           TYPE TABLE OF zcl_zmm_bolge_depo_yon_mpc_ext=>ts_deliveryitem WITH DEFAULT KEY,
    END OF ts_deep_deliverynote .
  types:
    tt_deep_deliverynote TYPE STANDARD TABLE OF ts_deep_deliverynote .
  types:
    BEGIN OF ts_deep_licenseplate,
      lpid            TYPE string,
      warehousenum    TYPE string,
      warehouse       TYPE string,
      platenumber     TYPE string,
      arrivaldate     TYPE dats,
      photocount      TYPE string,
      werks           TYPE string,
      werkstext       TYPE string,
      status          TYPE c LENGTH 1,
      aracsicaklik    TYPE p LENGTH 4 DECIMALS 2,
      todeliverynotes TYPE TABLE OF ts_deep_deliverynote WITH DEFAULT KEY,
    END OF ts_deep_licenseplate .
  types:
    tt_deep_licenseplate TYPE STANDARD TABLE OF ts_deep_licenseplate .
  types:
  " Başlık Tipi + Navigation Property (Tablo Olarak)
    BEGIN OF ts_deep_gi_entity.
           INCLUDE TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_issuepackage. " SEGW'den gelen Header Tipi " SEGW'den gelen Header Tipi " SEGW'den gelen Header Tipi
           TYPES:   toitems TYPE TABLE OF zcl_zmm_bolge_depo_yon_mpc_ext=>ts_issueitem WITH DEFAULT KEY, " Navigation Name ile AYNI olmalı
         END OF ts_deep_gi_entity .
  types:
    tt_deep_gi_entity TYPE TABLE OF ts_deep_gi_entity .
  types:
    BEGIN OF ts_deep_returnfactoryshipment,
           lgort       TYPE string,
           irstar      TYPE timestamp,
           plakano     TYPE string,
           sourcelgort TYPE string,
           werks       TYPE string,
           loguid      TYPE string,
           toitems     TYPE STANDARD TABLE OF zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnfactoryshipmentitem WITH DEFAULT KEY,
         END OF ts_deep_returnfactoryshipment .
  types:
    tt_deep_returnfactoryshipment TYPE STANDARD TABLE OF ts_deep_returnfactoryshipment WITH DEFAULT KEY .
  types TY_S_RETURN_FACTORY_ITEM type ZCL_ZMM_BOLGE_DEPO_YON_MPC_EXT=>TS_RETURNFACTORYSHIPMENTITEM .
  types:
    ty_t_return_factory_item TYPE STANDARD TABLE OF
      zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnfactoryshipmentitem
      WITH DEFAULT KEY .
  types TY_S_RETURN_FACTORY_DEEP type TS_DEEP_RETURNFACTORYSHIPMENT .

  methods PROCESS_RETURN_FACTORY_LOG
    importing
      !IV_LOG_UID type SYSUUID_C32 .

  methods /IWBEP/IF_MGW_APPL_SRV_RUNTIME~CREATE_DEEP_ENTITY
    redefinition .
  methods /IWBEP/IF_MGW_APPL_SRV_RUNTIME~CREATE_STREAM
    redefinition .
  methods /IWBEP/IF_MGW_APPL_SRV_RUNTIME~EXECUTE_ACTION
    redefinition .
  methods /IWBEP/IF_MGW_APPL_SRV_RUNTIME~GET_EXPANDED_ENTITYSET
    redefinition .
  methods /IWBEP/IF_MGW_APPL_SRV_RUNTIME~GET_STREAM
    redefinition .
protected section.

  methods ASSIGNEDOFFICERS_GET_ENTITYSET
    redefinition .
  methods ASSIGNEDPERSONNE_GET_ENTITYSET
    redefinition .
  methods DEPOSITGISET_GET_ENTITYSET
    redefinition .
  methods EMPLOYEESET_GET_ENTITYSET
    redefinition .
  methods ISSUEITEMSET_GET_ENTITY
    redefinition .
  methods ISSUEITEMSET_UPDATE_ENTITY
    redefinition .
  methods NOTEGISET_GET_ENTITYSET
    redefinition .
  methods NOTEGRSET_GET_ENTITYSET
    redefinition .
  methods OFFICERSET_GET_ENTITYSET
    redefinition .
  methods PLATEPHOTOSET_DELETE_ENTITY
    redefinition .
  methods PLATEPHOTOSET_GET_ENTITYSET
    redefinition .
  methods RETURNFACTORYSTO_GET_ENTITYSET
    redefinition .
  methods RETURNFACTORYVEH_GET_ENTITYSET
    redefinition .
  methods RETURNHEADERSET_GET_ENTITYSET
    redefinition .
  methods RETURNITEMSET_GET_ENTITYSET
    redefinition .
  methods RETURNMDPLASIYER_GET_ENTITYSET
    redefinition .
  methods RETURNMDURUNSET_GET_ENTITYSET
    redefinition .
  methods SHIPMENTSET_GET_ENTITYSET
    redefinition .
  methods RETURNFACTORYAPP_GET_ENTITYSET
    redefinition .
private section.

  types:
    BEGIN OF ty_s_order_item,
      vbeln  TYPE vbap-vbeln,
      posnr  TYPE vbap-posnr,
      matnr  TYPE vbap-matnr,
      kwmeng TYPE vbap-kwmeng,
      vrkme  TYPE vbap-vrkme,
      werks  TYPE vbap-werks,
      lgort  TYPE vbap-lgort,
      abgru  TYPE vbap-abgru,
    END OF ty_s_order_item .
  types:
    ty_t_order_item TYPE STANDARD TABLE OF ty_s_order_item
      WITH EMPTY KEY .
  types:
    BEGIN OF ty_s_matnr,
      matnr TYPE mara-matnr,
    END OF ty_s_matnr .
  types:
    ty_t_matnr TYPE SORTED TABLE OF ty_s_matnr
      WITH UNIQUE KEY matnr .
  types:
    BEGIN OF ty_s_expected_qty,
      vbeln TYPE vbap-vbeln,
      matnr TYPE vbap-matnr,
      meins TYPE vbap-vrkme,
      menge TYPE vbap-kwmeng,
    END OF ty_s_expected_qty .
  types:
    ty_t_expected_qty TYPE HASHED TABLE OF ty_s_expected_qty
      WITH UNIQUE KEY vbeln matnr .
  types TY_S_FSH_ACTION_RESULT type ZCL_ZMM_BOLGE_DEPO_YON_MPC_EXT=>TS_RETURNFACTORYACTIONRESULT .

*  TYPES:
*
*    BEGIN OF ts_deep_deliverynote,
*      deliverynumber    TYPE string,
*      lpid              TYPE string,
*      totalmaterialno   TYPE string,
*      total1            TYPE /iwbep/sb_odata_ty_int2,
*      total2            TYPE /iwbep/sb_odata_ty_int2,
*      total3            TYPE /iwbep/sb_odata_ty_int2,
*      total4            TYPE /iwbep/sb_odata_ty_int2,
*      total5            TYPE /iwbep/sb_odata_ty_int2,
*      total6            TYPE /iwbep/sb_odata_ty_int2,
*      total7            TYPE /iwbep/sb_odata_ty_int2,
*      total8            TYPE /iwbep/sb_odata_ty_int2,
*      total9            TYPE /iwbep/sb_odata_ty_int2,
*      totaldepozito     TYPE /iwbep/sb_odata_ty_int2,
*      totalporsiyon     TYPE /iwbep/sb_odata_ty_int2,
*      total1text        TYPE string,
*      total2text        TYPE string,
*      total3text        TYPE string,
*      total4text        TYPE string,
*      total5text        TYPE string,
*      total6text        TYPE string,
*      total7text        TYPE string,
*      total8text        TYPE string,
*      total9text        TYPE string,
*      totaldepozitotext TYPE string,
*      totalporsiyontext TYPE string,
*      toitems           TYPE TABLE OF zcl_zmm_bolge_depo_yon_mpc_ext=>ts_deliveryitem WITH DEFAULT KEY,
*    END OF ts_deep_deliverynote .
*  TYPES:
*    tt_deep_deliverynote TYPE STANDARD TABLE OF ts_deep_deliverynote,
*
*    BEGIN OF ts_deep_licenseplate,
*      lpid            TYPE string,
*      warehousenum    TYPE string,
*      warehouse       TYPE string,
*      platenumber     TYPE string,
*      arrivaldate     TYPE dats,
*      photocount      TYPE string,
*      werks           TYPE string,
*      werkstext       TYPE string,
*      status          TYPE c LENGTH 1,
*      aracsicaklik    TYPE p LENGTH 4 DECIMALS 2,
*      todeliverynotes TYPE TABLE OF ts_deep_deliverynote WITH DEFAULT KEY,
*    END OF ts_deep_licenseplate .
*  TYPES:
*tt_deep_licenseplate TYPE STANDARD TABLE OF ts_deep_licenseplate.
*
*  " Başlık Tipi + Navigation Property (Tablo Olarak)
*  TYPES: BEGIN OF ts_deep_gi_entity.
*           INCLUDE TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_issuepackage. " SEGW'den gelen Header Tipi
*           TYPES:   toitems TYPE TABLE OF zcl_zmm_bolge_depo_yon_mpc_ext=>ts_issueitem WITH DEFAULT KEY, " Navigation Name ile AYNI olmalı
*         END OF ts_deep_gi_entity.
*
*  TYPES: tt_deep_gi_entity TYPE TABLE OF ts_deep_gi_entity,
*
*         BEGIN OF ts_deep_returnfactoryshipment,
*           lgort       TYPE string,
*           irstar      TYPE timestamp,
*           plakano     TYPE string,
*           sourcelgort TYPE string,
*           werks       TYPE string,
*           loguid      TYPE string,
*           toitems     TYPE STANDARD TABLE OF zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnfactoryshipmentitem WITH DEFAULT KEY,
*         END OF ts_deep_returnfactoryshipment.
*
*  TYPES:
*    tt_deep_returnfactoryshipment TYPE STANDARD TABLE OF ts_deep_returnfactoryshipment WITH DEFAULT KEY.
*
*  TYPES ty_s_return_factory_item TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnfactoryshipmentitem .
*  TYPES:
*    ty_t_return_factory_item TYPE STANDARD TABLE OF
*      zcl_zmm_bolge_depo_yon_mpc_ext=>ts_returnfactoryshipmentitem
*      WITH DEFAULT KEY .
*  TYPES ty_s_return_factory_deep TYPE ts_deep_returnfactoryshipment .
  constants GC_AUART_RETURN type AUART value 'ZBIS' ##NO_TEXT.
  constants GC_AUART_DEPOSIT type AUART value 'ZDAI' ##NO_TEXT.
  "Replace these values with the productive ZBIS item reason codes.
  constants GC_REASON_FIRE type ABGRU_VA value 'ZF' ##NO_TEXT.
  constants GC_REASON_QUALITY type ABGRU_VA value 'ZK' ##NO_TEXT.
  constants GC_REASON_SALEABLE type ABGRU_VA value 'ZS' ##NO_TEXT.
  constants GC_ABRVW_DEPOSIT type ABRVW value '6' ##NO_TEXT.
  constants GC_VKORG type VKORG value '1000' ##NO_TEXT.
  constants GC_VTWEG type VTWEG value '10' ##NO_TEXT.
  constants GC_SPART type SPART value '00' ##NO_TEXT.
  constants GC_DEFAULT_RETURN_WERKS type WERKS_D value '1900' ##NO_TEXT.
  constants GC_STOCK_TRANSFER_BWART type BWART value '311' ##NO_TEXT.
  constants GC_INV_DIFF_BWART type BWART value '702' ##NO_TEXT.
  constants GC_FACTORY_TARGET_LGORT type LGORT_D value '2300' ##NO_TEXT.
  data MV_FACTORY_LOG_ONLY type ABAP_BOOL .
  data MV_FACTORY_BACKGROUND type ABAP_BOOL .

  methods EXECUTE_FACTORY_SHIPMENT
    importing
      !IS_DEEP type TY_S_RETURN_FACTORY_DEEP
      !IV_WERKS type WERKS_D
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods DERIVE_RETURN_LGORT
    importing
      !IV_LGORT type LGORT_D
    returning
      value(RV_LGORT) type LGORT_D .
  methods VALIDATE_RETURN_FACTORY_ITEMS
    importing
      !IV_WERKS type WERKS_D
      !IV_SOURCE_LGORT type LGORT_D
    changing
      !CT_ITEMS type TY_T_RETURN_FACTORY_ITEM
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods CREATE_RETURN_FACTORY_LOG
    importing
      !IS_DEEP type TY_S_RETURN_FACTORY_DEEP
    returning
      value(RV_LOG_UID) type SYSUUID_C32
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods SAVE_RETURN_FACTORY_LOG
    importing
      !IV_LOG_UID type SYSUUID_C32
      !IV_STATUS type CHAR1
      !IV_LAST_MESSAGE type BAPI_MSG optional .
  methods POST_RETURN_FACTORY_SHIPMENT
    importing
      !IS_DEEP type TY_S_RETURN_FACTORY_DEEP
      !IV_WERKS type WERKS_D
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods LOAD_RETURN_DATA
    importing
      !IT_FILTER_SELECT_OPTIONS type /IWBEP/T_MGW_SELECT_OPTION
    exporting
      !ET_HEADERS type ZCL_ZMM_BOLGE_DEPO_YON_MPC_EXT=>TT_RETURNHEADER
      !ET_ITEMS type TY_T_RETURN_ITEM
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods UPDATE_RETURN_REASONS
    importing
      !IV_VBELN type VBELN_VA
      !IT_ITEMS type TY_T_RETURN_ITEM
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods FIND_LATEST_DEPOSIT_ORDER
    importing
      !IV_PLASIYER type KUNNR
    returning
      value(RV_VBELN) type VBELN_VA
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods RAISE_BAPI_MESSAGES
    importing
      !IT_RETURN type BAPIRET2_T
      !IV_DEFAULT_TEXT type STRING
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods APPEND_LATEST_DEPOSIT_ITEMS
    importing
      !IT_HEADERS type ZCL_ZMM_BOLGE_DEPO_YON_MPC_EXT=>TT_RETURNHEADER
    changing
      !CT_ITEMS type TY_T_RETURN_ITEM
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods CREATE_DEPOSIT_ORDER
    importing
      !IV_LOG_UID type SYSUUID_C32
      !IV_PLASIYER type KUNNR
      !IV_LGORT type LGORT_D
      !IV_IRS_NO type BSTKD optional
      !IV_IRS_TAR type DATS optional
      !IT_ITEMS type TY_T_RETURN_ITEM
    returning
      value(RV_VBELN) type VBELN_VA
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods SAVE_RETURN_DEPOSIT_DRAFT
    importing
      !IV_LOG_UID type SYSUUID_C32
      !IV_PLASIYER type KUNNR
      !IV_LGORT type LGORT_D
      !IV_MATNR type MATNR
      !IV_MEINS type MEINS
      !IV_MENGE_SIPARIS type KWMENG
      !IV_MENGE_SAYIM type KWMENG
      !IV_IS_EXTERNAL type ABAP_BOOL
      !IV_IS_CONFIRMED type ABAP_BOOL
      !IV_IS_DELETED type ABAP_BOOL
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods LOAD_DEPOSIT_DRAFT
    importing
      !IV_LOG_UID type SYSUUID_C32
      !IT_EXPECTED_ITEMS type TY_T_RETURN_ITEM
    returning
      value(RT_ITEMS) type TY_T_RETURN_ITEM
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods PRINT_DESPATCH
    importing
      value(P_TYPE) type CHAR1
      value(IS_DATA) type /DSL/ES10_S023 .
  methods CHECK_LANSMAN
    importing
      value(IV_MATNR) type MATNR
      value(IV_KUNNR) type KUNNR
    returning
      value(RV_ERROR) type CHAR1 .
  methods APPROVE_FACTORY_SHIPMENT
    importing
      !IV_LOG_UID type SYSUUID_C32
      !IV_SNAPSHOT_HASH type STRING
    exporting
      !ES_RESULT type TY_S_FSH_ACTION_RESULT
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
  methods SCHEDULE_RETURN_FACTORY_JOB
    importing
      !IV_LOG_UID type SYSUUID_C32
    raising
      /IWBEP/CX_MGW_BUSI_EXCEPTION .
ENDCLASS.



CLASS ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT IMPLEMENTATION.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Public Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->/IWBEP/IF_MGW_APPL_SRV_RUNTIME~CREATE_DEEP_ENTITY
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING(optional)
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING(optional)
* | [--->] IV_SOURCE_NAME                 TYPE        STRING(optional)
* | [--->] IO_DATA_PROVIDER               TYPE REF TO /IWBEP/IF_MGW_ENTRY_PROVIDER
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR(optional)
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH(optional)
* | [--->] IO_EXPAND                      TYPE REF TO /IWBEP/IF_MGW_ODATA_EXPAND
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITY_C(optional)
* | [<---] ER_DEEP_ENTITY                 TYPE REF TO DATA
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD /iwbep/if_mgw_appl_srv_runtime~create_deep_entity.

  DATA lr_entity_name TYPE RANGE OF string.

  APPEND VALUE #( sign = 'I' option = 'EQ' low = 'ReturnHeader' ) TO lr_entity_name.
  APPEND VALUE #( sign = 'I' option = 'EQ' low = 'ReturnFactoryShipment' ) TO lr_entity_name.

  TYPES:
    BEGIN OF ty_toitems,
      log_uid TYPE sysuuid_c32,
      posnr   TYPE posnr,
    END OF ty_toitems.
  TYPES:
    BEGIN OF ty_md_count,
      matnr         TYPE matnr,
      meins         TYPE meins,
      is_depozito   TYPE zmm_t_bdy_irs_i-is_depozito,
      menge_sayim   TYPE zmm_t_bdy_irs_i-menge_sayim,
      menge_fire    TYPE zmm_t_bdy_irs_i-menge_fire,
      menge_kalite  TYPE zmm_t_bdy_irs_i-menge_kalite,
      menge_lansman TYPE zmm_t_bdy_irs_i-menge_lansman,
      menge_satilab TYPE zmm_t_bdy_irs_i-menge_satilab,
    END OF ty_md_count,
    ty_t_md_count TYPE SORTED TABLE OF ty_md_count
                  WITH UNIQUE KEY matnr is_depozito,
    BEGIN OF ty_md_expected,
      matnr       TYPE matnr,
      is_depozito TYPE zmm_t_bdy_irs_i-is_depozito,
      menge       TYPE menge_d,
    END OF ty_md_expected,
    ty_t_md_expected TYPE SORTED TABLE OF ty_md_expected
                     WITH UNIQUE KEY matnr is_depozito.
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
    ls_md_header          TYPE zmm_t_bdy_irs_h,
    lv_log_uid            TYPE sysuuid_c32,
    lv_vbeln              TYPE vbeln_va,
    lv_irs_tar            TYPE dats,
    lv_irs_time           TYPE tims,
    lv_new_zdai           TYPE vbeln_va,
    lv_is_md              TYPE abap_bool,
    lv_md_posnr           TYPE posnr,
    lv_md_kunnr           TYPE kunnr,
    ls_existing_md_header TYPE zmm_t_bdy_irs_h,
    ls_panorama_md_header TYPE zmm_t_bdy_irs_h,
    lt_existing_md_items  TYPE STANDARD TABLE OF zmm_t_bdy_irs_i,
    lt_panorama_md_items  TYPE STANDARD TABLE OF zmm_t_bdy_irs_i,
    lt_md_deposit_items   TYPE STANDARD TABLE OF zmm_t_bdy_irs_di,
    ls_md_deposit_item    TYPE zmm_t_bdy_irs_di,
    ls_md_deposit_header  TYPE zmm_t_bdy_irs_dh,
    lt_md_counts          TYPE ty_t_md_count,
    lt_md_expected        TYPE ty_t_md_expected,
    lt_vbap_expected      TYPE ty_t_md_expected,
    ls_md_count           TYPE ty_md_count,
    ls_md_expected        TYPE ty_md_expected,
    lv_request_has_loguid TYPE abap_bool,
    lv_md_exists          TYPE abap_bool,
    lv_md_has_deposit     TYPE abap_bool,
    lv_md_plasiyer        TYPE kunnr,
    lv_panorama_log_uid   TYPE sysuuid_c32,
    lv_manual_posnr       TYPE posnr,
    lv_panorama_posnr     TYPE posnr,
    lv_manual_capacity    TYPE menge_d,
    lv_remaining_capacity TYPE menge_d,
    lv_manual_fire        TYPE menge_d,
    lv_manual_kalite      TYPE menge_d,
    lv_manual_lansman     TYPE menge_d,
    lv_manual_satilab     TYPE menge_d,
    lv_manual_total       TYPE menge_d,
    lv_count_total        TYPE menge_d.

  FIELD-SYMBOLS:
    <md_count>       TYPE ty_md_count,
    <md_expected>    TYPE ty_md_expected,
    <manual_md_item> TYPE zmm_t_bdy_irs_i.
  DATA: ls_return_factory TYPE ty_s_return_factory_deep,
        lv_werks          TYPE werks_d VALUE gc_default_return_werks.
  IF iv_entity_name NOT IN lr_entity_name.
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

  CASE iv_entity_name.
    WHEN 'ReturnHeader'.

      DATA lv_deposit_log_uid TYPE sysuuid_c32.

      io_data_provider->read_entry_data(
        IMPORTING
          es_data = ls_deep ).

      lv_is_md = xsdbool( to_upper( ls_deep-shipmenttype ) = 'MD' ).
      lv_request_has_loguid = xsdbool( ls_deep-loguid IS NOT INITIAL ).
      lv_log_uid = ls_deep-loguid.
      IF lv_log_uid IS INITIAL.
        IF lv_is_md = abap_true.
          TRY.
              lv_log_uid = cl_system_uuid=>create_uuid_c32_static( ).
            CATCH cx_uuid_error.
              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                EXPORTING
                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
                  message = 'MD sayımı için LogUid üretilemedi'.
          ENDTRY.
        ELSE.
          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
            EXPORTING
              textid  = /iwbep/cx_mgw_busi_exception=>business_error
              message = 'LogUid zorunludur'.
        ENDIF.
      ENDIF.

      IF ls_deep-irstar IS NOT INITIAL.
        CONVERT TIME STAMP ls_deep-irstar
          TIME ZONE sy-zonlo
          INTO DATE lv_irs_tar
               TIME lv_irs_time.
      ENDIF.

      IF lv_is_md = abap_true.
        IF ls_deep-plasiyer IS INITIAL.
          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
            EXPORTING
              textid  = /iwbep/cx_mgw_busi_exception=>business_error
              message = 'MD sayımı için plasiyer zorunludur'.
        ENDIF.

        IF ls_deep-lgort IS INITIAL.
          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
            EXPORTING
              textid  = /iwbep/cx_mgw_busi_exception=>business_error
              message = 'MD sayımı için depo yeri zorunludur'.
        ENDIF.

        IF lv_irs_tar IS INITIAL.
          lv_irs_tar = sy-datum.
        ENDIF.
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
           OR <item>-mengelansman < 0
           OR <item>-mengesatilab < 0.
          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
            EXPORTING
              textid  = /iwbep/cx_mgw_busi_exception=>business_error
              message = |Kalem { <item>-posnr }: negatif sayıya izin yok|.
        ENDIF.

        DATA(lv_component_total) =
            <item>-mengefire
          + <item>-mengekalite
          + <item>-mengelansman
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

      SELECT matnr, mtart, meins
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
        IF <item>-meins IS INITIAL.
          <item>-meins = ls_material-meins.
        ENDIF.
        IF <item>-isdepozito = abap_true.
          APPEND <item> TO lt_payload_deposits.
        ELSE.
          APPEND <item> TO lt_product_items.
        ENDIF.
      ENDLOOP.
      "MD sayımı Fiori'de sıfırdan oluşturulur. Ürünler H/I, depozitolar
      "DH/DI tablolarına yazılır; ZBIS/ZDAI ve devam belgeleri yaratılmaz.
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


**********************************************************************
**********************************************************************

        "ZBDY07 kaynaklı mevcut ZBIS ile Fiori/Panorama farkını aynı
        "başlık altında birleştirme. Mevcut sipariş kapasitesine kadar
        "olan sayım ZBDY07 kaydında, fazlası ve yeni malzemeler ise
        "VbelnVa alanı boş ayrı bir MD başlığında tutulur.
        IF lv_md_exists = abap_true
           AND ls_existing_md_header-vbeln_va IS NOT INITIAL.
          REFRESH: lt_existing_md_items, lt_panorama_md_items,
                   lt_md_counts, lt_md_expected, lt_vbap_expected.
          CLEAR: ls_md_count, ls_md_expected, ls_panorama_md_header,
                 lv_panorama_log_uid, lv_manual_posnr,
                 lv_panorama_posnr, lv_manual_capacity,
                 lv_remaining_capacity, lv_manual_fire,
                 lv_manual_kalite, lv_manual_lansman,
                 lv_manual_satilab, lv_manual_total, lv_count_total.

          SELECT *
            FROM zmm_t_bdy_irs_i
            WHERE log_uid = @lv_log_uid
            INTO TABLE @lt_existing_md_items.

          "Depozitolar H/I tablosunda tutulmaz; varsa eski hatalı
          "snapshot kayıtları DH/DI akışına taşınmak üzere ayıklanır.
          DELETE lt_existing_md_items WHERE is_depozito = abap_true.

          LOOP AT lt_existing_md_items INTO ls_log_item.
            IF ls_log_item-posnr > lv_manual_posnr.
              lv_manual_posnr = ls_log_item-posnr.
            ENDIF.

            READ TABLE lt_md_expected ASSIGNING <md_expected>
              WITH TABLE KEY matnr       = ls_log_item-matnr
                             is_depozito = ls_log_item-is_depozito.
            IF sy-subrc = 0.
              <md_expected>-menge = <md_expected>-menge
                                   + ls_log_item-menge.
            ELSE.
              INSERT VALUE #(
                matnr       = ls_log_item-matnr
                is_depozito = ls_log_item-is_depozito
                menge       = ls_log_item-menge )
                INTO TABLE lt_md_expected.
            ENDIF.
          ENDLOOP.

          "Ürünlerde mevcut ZBIS miktarı tek doğruluk kaynağıdır.
          SELECT matnr, SUM( kwmeng ) AS menge
            FROM vbap
            WHERE vbeln = @ls_existing_md_header-vbeln_va
            GROUP BY matnr
            INTO CORRESPONDING FIELDS OF TABLE @lt_vbap_expected.

          LOOP AT lt_vbap_expected INTO ls_md_expected.
            READ TABLE lt_md_expected ASSIGNING <md_expected>
              WITH TABLE KEY matnr       = ls_md_expected-matnr
                             is_depozito = abap_false.
            IF sy-subrc = 0.
              <md_expected>-menge = ls_md_expected-menge.
            ELSE.
              ls_md_expected-is_depozito = abap_false.
              INSERT ls_md_expected INTO TABLE lt_md_expected.
            ENDIF.
          ENDLOOP.

          "Payload aynı malzemeyi birden fazla ham satırda taşıyabilir.
          "Önce malzeme/depozito bazında tek sayım toplamına indirgenir.
*            LOOP AT ls_deep-toitems ASSIGNING <item>.
          LOOP AT lt_product_items ASSIGNING <item>.
            READ TABLE lt_md_counts ASSIGNING <md_count>
              WITH TABLE KEY matnr       = <item>-matnr
                             is_depozito = <item>-isdepozito.
            IF sy-subrc = 0.
              <md_count>-menge_sayim = <md_count>-menge_sayim
                                     + <item>-mengesayim.
              <md_count>-menge_fire = <md_count>-menge_fire
                                    + <item>-mengefire.
              <md_count>-menge_kalite = <md_count>-menge_kalite
                                      + <item>-mengekalite.
              <md_count>-menge_lansman = <md_count>-menge_lansman
                                       + <item>-mengelansman.
              <md_count>-menge_satilab = <md_count>-menge_satilab
                                       + <item>-mengesatilab.
            ELSE.
              CLEAR ls_md_count.
              ls_md_count-matnr         = <item>-matnr.
              ls_md_count-meins         = <item>-meins.
              ls_md_count-is_depozito   = <item>-isdepozito.
              ls_md_count-menge_sayim   = <item>-mengesayim.
              ls_md_count-menge_fire    = <item>-mengefire.
              ls_md_count-menge_kalite  = <item>-mengekalite.
              ls_md_count-menge_lansman = <item>-mengelansman.
              ls_md_count-menge_satilab = <item>-mengesatilab.

              CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
                EXPORTING
                  input          = ls_md_count-meins
                IMPORTING
                  output         = ls_md_count-meins
                EXCEPTIONS
                  unit_not_found = 1
                  OTHERS         = 2.
              IF sy-subrc <> 0.
                CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                  EXPORTING
                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
                    message = |Malzeme { <item>-matnr }: ölçü birimi geçersiz|.
              ENDIF.

              INSERT ls_md_count INTO TABLE lt_md_counts.
            ENDIF.
          ENDLOOP.

          "Önceki sayım snapshot'ını temizle; beklenen miktar ve neden
          "bilgileri korunur.
          LOOP AT lt_existing_md_items ASSIGNING <manual_md_item>.
            CLEAR: <manual_md_item>-menge_sayim,
                   <manual_md_item>-menge_fire,
                   <manual_md_item>-menge_kalite,
                   <manual_md_item>-menge_lansman,
                   <manual_md_item>-menge_satilab.
          ENDLOOP.

          LOOP AT lt_md_counts INTO ls_md_count.
            CLEAR: ls_md_expected, lv_manual_capacity,
                   lv_remaining_capacity, lv_manual_fire,
                   lv_manual_kalite, lv_manual_lansman,
                   lv_manual_satilab, lv_manual_total, lv_count_total,
                   ls_log_item.

            READ TABLE lt_md_expected INTO ls_md_expected
              WITH TABLE KEY matnr       = ls_md_count-matnr
                             is_depozito = ls_md_count-is_depozito.
            IF sy-subrc = 0.
              lv_manual_capacity = ls_md_expected-menge.
            ENDIF.

            lv_count_total = ls_md_count-menge_fire
                           + ls_md_count-menge_kalite
                           + ls_md_count-menge_lansman
                           + ls_md_count-menge_satilab.
            lv_remaining_capacity = lv_manual_capacity.

            lv_manual_fire = COND #(
              WHEN ls_md_count-menge_fire < lv_remaining_capacity
              THEN ls_md_count-menge_fire
              ELSE lv_remaining_capacity ).
            lv_remaining_capacity = lv_remaining_capacity
                                  - lv_manual_fire.
            lv_manual_kalite = COND #(
              WHEN ls_md_count-menge_kalite < lv_remaining_capacity
              THEN ls_md_count-menge_kalite
              ELSE lv_remaining_capacity ).
            lv_remaining_capacity = lv_remaining_capacity
                                  - lv_manual_kalite.
            lv_manual_lansman = COND #(
              WHEN ls_md_count-menge_lansman < lv_remaining_capacity
              THEN ls_md_count-menge_lansman
              ELSE lv_remaining_capacity ).
            lv_remaining_capacity = lv_remaining_capacity
                                  - lv_manual_lansman.
            lv_manual_satilab = COND #(
              WHEN ls_md_count-menge_satilab < lv_remaining_capacity
              THEN ls_md_count-menge_satilab
              ELSE lv_remaining_capacity ).
            lv_manual_total = lv_manual_fire + lv_manual_kalite
                            + lv_manual_lansman + lv_manual_satilab.

            IF lv_manual_capacity > 0.
              READ TABLE lt_existing_md_items
                ASSIGNING <manual_md_item>
                WITH KEY matnr       = ls_md_count-matnr
                         is_depozito = ls_md_count-is_depozito.
              IF sy-subrc <> 0.
                lv_manual_posnr = lv_manual_posnr + 10.
                APPEND INITIAL LINE TO lt_existing_md_items
                  ASSIGNING <manual_md_item>.
                <manual_md_item>-log_uid     = lv_log_uid.
                <manual_md_item>-posnr       = lv_manual_posnr.
                <manual_md_item>-matnr       = ls_md_count-matnr.
                <manual_md_item>-meins       = ls_md_count-meins.
                <manual_md_item>-menge       = lv_manual_capacity.
                <manual_md_item>-is_depozito = ls_md_count-is_depozito.
              ENDIF.

              <manual_md_item>-menge_sayim   = lv_manual_total.
              <manual_md_item>-menge_fire    = lv_manual_fire.
              <manual_md_item>-menge_kalite  = lv_manual_kalite.
              <manual_md_item>-menge_lansman = lv_manual_lansman.
              <manual_md_item>-menge_satilab = lv_manual_satilab.
            ENDIF.

            "Siparişte bulunmayan kalem sıfır sayılsa dahi Panorama
            "kaynağında izlenir. Mevcut kalemde yalnız kapasite fazlası
            "ayrı kayda aktarılır.
            IF lv_manual_capacity = 0
               OR lv_count_total > lv_manual_capacity.
              lv_panorama_posnr = lv_panorama_posnr + 10.
              CLEAR ls_log_item.
              ls_log_item-posnr         = lv_panorama_posnr.
              ls_log_item-matnr         = ls_md_count-matnr.
              ls_log_item-meins         = ls_md_count-meins.
              ls_log_item-menge         = 0.
              ls_log_item-menge_siparis = 0.
              ls_log_item-menge_fire = ls_md_count-menge_fire
                                     - lv_manual_fire.
              ls_log_item-menge_kalite = ls_md_count-menge_kalite
                                       - lv_manual_kalite.
              ls_log_item-menge_lansman = ls_md_count-menge_lansman
                                        - lv_manual_lansman.
              ls_log_item-menge_satilab = ls_md_count-menge_satilab
                                        - lv_manual_satilab.
              ls_log_item-menge_sayim = ls_log_item-menge_fire
                                      + ls_log_item-menge_kalite
                                      + ls_log_item-menge_lansman
                                      + ls_log_item-menge_satilab.
              ls_log_item-is_depozito = ls_md_count-is_depozito.
              APPEND ls_log_item TO lt_panorama_md_items.
            ENDIF.
          ENDLOOP.

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
                message = 'ZBDY07 kaynaklı MD sayım başlığı güncellenemedi'.
          ENDIF.

          MODIFY zmm_t_bdy_irs_i FROM TABLE @lt_existing_md_items.
          IF sy-subrc <> 0.
            CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
              EXPORTING
                textid  = /iwbep/cx_mgw_busi_exception=>business_error
                message = 'ZBDY07 kaynaklı MD sayım kalemleri güncellenemedi'.
          ENDIF.

          IF lt_panorama_md_items IS NOT INITIAL.
            TRY.
                lv_panorama_log_uid = cl_system_uuid=>create_uuid_c32_static( ).
              CATCH cx_uuid_error.
                CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                  EXPORTING
                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
                    message = 'Panorama fark kaydı için LogUid üretilemedi'.
            ENDTRY.

            CLEAR ls_panorama_md_header.
            ls_panorama_md_header-log_uid       = lv_panorama_log_uid.
            ls_panorama_md_header-vbeln_va      = space.
            ls_panorama_md_header-irs_no        = space.
            ls_panorama_md_header-irs_tar       = lv_irs_tar.
            ls_panorama_md_header-lgort         = ls_deep-lgort.
            ls_panorama_md_header-plasiyer      = lv_md_plasiyer.
            ls_panorama_md_header-kunnr         = lv_md_kunnr.
            ls_panorama_md_header-shipment_type = 'MD'.
            ls_panorama_md_header-return_type   = ls_deep-returntype.
            ls_panorama_md_header-depozito_iade = space.
            ls_panorama_md_header-status        = 'S'.
            ls_panorama_md_header-ernam         = sy-uname.

            INSERT zmm_t_bdy_irs_h FROM @ls_panorama_md_header.
            IF sy-subrc <> 0.
              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                EXPORTING
                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
                  message = 'Panorama fark sayım başlığı kaydedilemedi'.
            ENDIF.

            LOOP AT lt_panorama_md_items ASSIGNING <manual_md_item>.
              <manual_md_item>-log_uid = lv_panorama_log_uid.
            ENDLOOP.
            INSERT zmm_t_bdy_irs_i FROM TABLE @lt_panorama_md_items.
            IF sy-subrc <> 0.
              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                EXPORTING
                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
                  message = 'Panorama fark sayım kalemleri kaydedilemedi'.
            ENDIF.
          ENDIF.

          "Ürün ve depozito Panorama belgeleri farklı olduğundan depozito
          "kayıtları ürün başlığından bağımsız bir LogUid altında tutulur.
          IF lt_payload_deposits IS NOT INITIAL.
            TRY.
                lv_deposit_log_uid = cl_system_uuid=>create_uuid_c32_static( ).
              CATCH cx_uuid_error.
                CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                  EXPORTING
                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
                    message = 'Panorama depozito kaydı için LogUid üretilemedi'.
            ENDTRY.

            CLEAR ls_panorama_md_header.
            ls_panorama_md_header-log_uid       = lv_deposit_log_uid.
            ls_panorama_md_header-vbeln_va      = space.
            ls_panorama_md_header-irs_no        = space.
            ls_panorama_md_header-irs_tar       = lv_irs_tar.
            ls_panorama_md_header-lgort         = ls_deep-lgort.
            ls_panorama_md_header-plasiyer      = lv_md_plasiyer.
            ls_panorama_md_header-kunnr         = lv_md_kunnr.
            ls_panorama_md_header-shipment_type = 'MD'.
            ls_panorama_md_header-return_type   = ls_deep-returntype.
            ls_panorama_md_header-depozito_iade = abap_true.
            ls_panorama_md_header-status        = 'S'.
            ls_panorama_md_header-ernam         = sy-uname.

            INSERT zmm_t_bdy_irs_h FROM @ls_panorama_md_header.
            IF sy-subrc <> 0.
              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                EXPORTING
                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
                  message = 'Panorama depozito H başlığı kaydedilemedi'.
            ENDIF.

            CLEAR ls_md_deposit_header.
            ls_md_deposit_header-mandt     = sy-mandt.
            ls_md_deposit_header-log_uid   = lv_deposit_log_uid.
            ls_md_deposit_header-plasiyer  = lv_md_plasiyer.
            ls_md_deposit_header-lgort     = ls_deep-lgort.
            ls_md_deposit_header-status    = 'S'.
            ls_md_deposit_header-ernam     = sy-uname.
            ls_md_deposit_header-erdat     = sy-datum.
            ls_md_deposit_header-erzet     = sy-uzeit.
            ls_md_deposit_header-aenam     = sy-uname.
            ls_md_deposit_header-aedat     = sy-datum.
            ls_md_deposit_header-aezet     = sy-uzeit.
            INSERT zmm_t_bdy_irs_dh FROM @ls_md_deposit_header.
            IF sy-subrc <> 0.
              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                EXPORTING
                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
                  message = 'Panorama depozito başlığı kaydedilemedi'.
            ENDIF.

            REFRESH lt_md_deposit_items.
            LOOP AT lt_payload_deposits ASSIGNING <item>.
              CLEAR ls_md_deposit_item.
              ls_md_deposit_item-mandt          = sy-mandt.
              ls_md_deposit_item-log_uid        = lv_deposit_log_uid.
              ls_md_deposit_item-matnr          = <item>-matnr.
              ls_md_deposit_item-menge_siparis = 0.
              ls_md_deposit_item-menge_sayim   = <item>-mengesayim.
              ls_md_deposit_item-is_external   = abap_true.
              ls_md_deposit_item-is_confirmed  = abap_false.
              ls_md_deposit_item-is_deleted    = abap_false.
              ls_md_deposit_item-ernam          = sy-uname.
              ls_md_deposit_item-erdat          = sy-datum.
              ls_md_deposit_item-erzet          = sy-uzeit.
              ls_md_deposit_item-aenam          = sy-uname.
              ls_md_deposit_item-aedat          = sy-datum.
              ls_md_deposit_item-aezet          = sy-uzeit.
              CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
                EXPORTING
                  input          = <item>-meins
                IMPORTING
                  output         = ls_md_deposit_item-meins
                EXCEPTIONS
                  unit_not_found = 1
                  OTHERS         = 2.
              IF sy-subrc <> 0.
                CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                  EXPORTING
                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
                    message = |Depozito { <item>-matnr }: ölçü birimi geçersiz|.
              ENDIF.
              APPEND ls_md_deposit_item TO lt_md_deposit_items.
            ENDLOOP.
            INSERT zmm_t_bdy_irs_di FROM TABLE @lt_md_deposit_items.
            IF sy-subrc <> 0.
              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                EXPORTING
                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
                  message = 'Panorama depozito sayım kalemleri kaydedilemedi'.
            ENDIF.
          ENDIF.

          CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
            EXPORTING
              wait = abap_true.

          ls_deep-loguid  = lv_log_uid.
          ls_deep-vbelnva = ls_existing_md_header-vbeln_va.
          ls_deep-irsno   = ls_existing_md_header-irs_no.

          copy_data_to_ref(
            EXPORTING
              is_data = ls_deep
            CHANGING
              cr_data = er_deep_entity ).
          RETURN.
        ENDIF.


**********************************************************************
**********************************************************************




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
        "Karma payload'da ana LogUid yalnız ürün kaydını temsil eder.
        "Yalnız depozito varsa mevcut LogUid depozito başlığı olarak kullanılır.
        ls_md_header-depozito_iade = xsdbool(
          lt_product_items IS INITIAL
          AND lt_payload_deposits IS NOT INITIAL ).
        ls_md_header-status        = 'S'.
        ls_md_header-ernam         = sy-uname.

        IF lv_md_exists = abap_true.
          "Status koşulu ikinci/eşzamanlı onayı da engeller.
          UPDATE zmm_t_bdy_irs_h
            SET kunnr       = @lv_md_kunnr,
                return_type = @ls_deep-returntype,
                depozito_iade = @ls_md_header-depozito_iade,
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
*          LOOP AT ls_deep-toitems ASSIGNING <item>.
        LOOP AT lt_product_items ASSIGNING <item>.
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
        IF lt_log_items IS NOT INITIAL.
          INSERT zmm_t_bdy_irs_i FROM TABLE @lt_log_items.
          IF sy-subrc <> 0.
            CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
              EXPORTING
                textid  = /iwbep/cx_mgw_busi_exception=>business_error
                message = 'MD sayım kalemleri kaydedilemedi'.
          ENDIF.
        ENDIF.

        "Mono depozitoda OData yalnız sayım snapshot'ını tutar. Ürün ve
        "depozito birlikte geldiyse depozito ayrı H/DH/DI LogUid'si alır.
        REFRESH lt_md_deposit_items.
        CLEAR lv_deposit_log_uid.

        IF lt_payload_deposits IS NOT INITIAL.
          IF lt_product_items IS INITIAL.
            lv_deposit_log_uid = lv_log_uid.
          ELSE.
            TRY.
                lv_deposit_log_uid = cl_system_uuid=>create_uuid_c32_static( ).
              CATCH cx_uuid_error.
                CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                  EXPORTING
                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
                    message = 'Mono depozito kaydı için LogUid üretilemedi'.
            ENDTRY.

            CLEAR ls_panorama_md_header.
            ls_panorama_md_header-log_uid       = lv_deposit_log_uid.
            ls_panorama_md_header-vbeln_va      = space.
            ls_panorama_md_header-irs_no        = space.
            ls_panorama_md_header-irs_tar       = lv_irs_tar.
            ls_panorama_md_header-lgort         = ls_deep-lgort.
            ls_panorama_md_header-plasiyer      = lv_md_plasiyer.
            ls_panorama_md_header-kunnr         = lv_md_kunnr.
            ls_panorama_md_header-shipment_type = 'MD'.
            ls_panorama_md_header-return_type   = ls_deep-returntype.
            ls_panorama_md_header-depozito_iade = abap_true.
            ls_panorama_md_header-status        = 'S'.
            ls_panorama_md_header-ernam         = sy-uname.

            INSERT zmm_t_bdy_irs_h FROM @ls_panorama_md_header.
            IF sy-subrc <> 0.
              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                EXPORTING
                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
                  message = 'Mono depozito H başlığı kaydedilemedi'.
            ENDIF.
          ENDIF.

          "Önceki taslak sürüm aynı UID altında DH/DI bıraktıysa temizle.
          IF lv_md_exists = abap_true.
            DELETE FROM zmm_t_bdy_irs_di WHERE log_uid = @lv_log_uid.
            IF lv_deposit_log_uid <> lv_log_uid.
              DELETE FROM zmm_t_bdy_irs_dh WHERE log_uid = @lv_log_uid.
            ENDIF.
          ENDIF.

          CLEAR ls_md_deposit_header.
          ls_md_deposit_header-mandt    = sy-mandt.
          ls_md_deposit_header-log_uid  = lv_deposit_log_uid.
          ls_md_deposit_header-plasiyer = lv_md_plasiyer.
          ls_md_deposit_header-lgort    = ls_deep-lgort.
          ls_md_deposit_header-status   = 'S'.
          ls_md_deposit_header-ernam    = sy-uname.
          ls_md_deposit_header-erdat    = sy-datum.
          ls_md_deposit_header-erzet    = sy-uzeit.
          ls_md_deposit_header-aenam    = sy-uname.
          ls_md_deposit_header-aedat    = sy-datum.
          ls_md_deposit_header-aezet    = sy-uzeit.
          MODIFY zmm_t_bdy_irs_dh FROM @ls_md_deposit_header.
          IF sy-subrc <> 0.
            CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
              EXPORTING
                textid  = /iwbep/cx_mgw_busi_exception=>business_error
                message = 'Mono depozito başlığı kaydedilemedi'.
          ENDIF.

          LOOP AT lt_payload_deposits ASSIGNING <item>.
            CLEAR ls_md_deposit_item.
            ls_md_deposit_item-mandt          = sy-mandt.
            ls_md_deposit_item-log_uid        = lv_deposit_log_uid.
            ls_md_deposit_item-matnr          = <item>-matnr.
            ls_md_deposit_item-menge_siparis = 0.
            ls_md_deposit_item-menge_sayim   = <item>-mengesayim.
            ls_md_deposit_item-is_external   = abap_true.
            ls_md_deposit_item-is_confirmed  = abap_false.
            ls_md_deposit_item-is_deleted    = abap_false.
            ls_md_deposit_item-ernam          = sy-uname.
            ls_md_deposit_item-erdat          = sy-datum.
            ls_md_deposit_item-erzet          = sy-uzeit.
            ls_md_deposit_item-aenam          = sy-uname.
            ls_md_deposit_item-aedat          = sy-datum.
            ls_md_deposit_item-aezet          = sy-uzeit.

            CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
              EXPORTING
                input          = <item>-meins
              IMPORTING
                output         = ls_md_deposit_item-meins
              EXCEPTIONS
                unit_not_found = 1
                OTHERS         = 2.
            IF sy-subrc <> 0.
              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                EXPORTING
                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
                  message = |Depozito { <item>-matnr }: ölçü birimi geçersiz|.
            ENDIF.

            APPEND ls_md_deposit_item TO lt_md_deposit_items.
          ENDLOOP.

          INSERT zmm_t_bdy_irs_di FROM TABLE @lt_md_deposit_items.
          IF sy-subrc <> 0.
            CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
              EXPORTING
                textid  = /iwbep/cx_mgw_busi_exception=>business_error
                message = 'Mono depozito sayım kalemleri kaydedilemedi'.
          ENDIF.

        ELSEIF lv_md_exists = abap_true.
          DELETE FROM zmm_t_bdy_irs_di WHERE log_uid = @lv_log_uid.
          DELETE FROM zmm_t_bdy_irs_dh WHERE log_uid = @lv_log_uid.
        ENDIF.

        CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
          EXPORTING
            wait = abap_true.

        ls_deep-loguid  = lv_log_uid.
*          ls_deep-vbelnva = space.
*          ls_deep-irsno   = space.
        IF lv_md_exists = abap_true
                     AND ls_existing_md_header-vbeln_va IS NOT INITIAL.
          ls_deep-vbelnva = ls_existing_md_header-vbeln_va.
          ls_deep-irsno   = ls_existing_md_header-irs_no.
        ELSE.
          ls_deep-vbelnva = space.
          ls_deep-irsno   = space.
        ENDIF.

        copy_data_to_ref(
          EXPORTING
            is_data = ls_deep
          CHANGING
            cr_data = er_deep_entity ).
        RETURN.
      ENDIF.

      IF ls_deep-vbelnva IS INITIAL.
        SELECT SINGLE @abap_true
          FROM zmm_t_bdy_irs_h
          INTO @DATA(lv_sutas)
          WHERE irs_no EQ @ls_deep-irsno.
      ENDIF.

      IF lv_sutas EQ abap_false.

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
            SELECT SINGLE @abap_true
              FROM zmm_t_bdy_irs_h
              INTO @DATA(lv_sutas_iade)
              WHERE log_uid = @lv_log_uid
                AND sutas   = @abap_true.
            IF lv_sutas_iade EQ space.
              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
                EXPORTING
                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
                  message = |Referans sipariş { lv_vbeln } bir ZBIS iade siparişi değildir|.
            ENDIF.
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
          DELETE lt_payload_deposits WHERE mengesayim EQ 0.
          DELETE lt_confirmed_deposits WHERE mengesayim EQ 0.
          IF lt_confirmed_deposits IS NOT INITIAL.
**        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
**          EXPORTING
**            textid  = /iwbep/cx_mgw_busi_exception=>business_error
**            message = 'Depozito taslağı bulunamadı. Depozito sayımını yeniden kaydedin'.
*      ENDIF.

            lv_new_zdai = create_deposit_order(
              iv_log_uid  = lv_log_uid
              iv_plasiyer = CONV kunnr( ls_deep-plasiyer )
              iv_lgort    = CONV lgort_d( ls_deep-lgort )
              iv_irs_no   = CONV bstkd( ls_deep-irsno )
              iv_irs_tar  = lv_irs_tar
              it_items    = lt_confirmed_deposits ).
          ENDIF.
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
            ls_log_item-menge_lansman  = <product>-mengelansman.
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
      ENDIF.

      UPDATE zmm_t_bdy_irs_h
        SET status = 'S',
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
          SET status = 'S',
              aenam  = @sy-uname,
              aedat  = @sy-datum,
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


*        io_data_provider->read_entry_data(
*          IMPORTING
*            es_data = ls_deep ).
*
*        lv_is_md = xsdbool( to_upper( ls_deep-shipmenttype ) = 'MD' ).
*        lv_request_has_loguid = xsdbool( ls_deep-loguid IS NOT INITIAL ).
*        lv_log_uid = ls_deep-loguid.
*        IF lv_log_uid IS INITIAL.
*          IF lv_is_md = abap_true.
*            TRY.
*                lv_log_uid = cl_system_uuid=>create_uuid_c32_static( ).
*              CATCH cx_uuid_error.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = 'MD sayımı için LogUid üretilemedi'.
*            ENDTRY.
*          ELSE.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = 'LogUid zorunludur'.
*          ENDIF.
*        ENDIF.
*
*        IF ls_deep-irstar IS NOT INITIAL.
*          CONVERT TIME STAMP ls_deep-irstar
*            TIME ZONE sy-zonlo
*            INTO DATE lv_irs_tar
*                 TIME lv_irs_time.
*        ENDIF.
*
*        IF lv_is_md = abap_true.
*          IF ls_deep-plasiyer IS INITIAL.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = 'MD sayımı için plasiyer zorunludur'.
*          ENDIF.
*
*          IF ls_deep-lgort IS INITIAL.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = 'MD sayımı için depo yeri zorunludur'.
*          ENDIF.
*
*          IF lv_irs_tar IS INITIAL.
*            lv_irs_tar = sy-datum.
*          ENDIF.
*        ENDIF.
*
*        IF ls_deep-toitems IS INITIAL.
*          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*            EXPORTING
*              textid  = /iwbep/cx_mgw_busi_exception=>business_error
*              message = 'En az bir satır sayılmalıdır'.
*        ENDIF.
*
*        LOOP AT ls_deep-toitems ASSIGNING FIELD-SYMBOL(<item>).
*          IF <item>-matnr IS INITIAL.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = 'Malzeme numarası eksik'.
*          ENDIF.
*
*          <item>-matnr = |{ <item>-matnr ALPHA = IN }|.
*
*          IF <item>-mengesayim < 0
*             OR <item>-mengefire < 0
*             OR <item>-mengekalite < 0
*             OR <item>-mengelansman < 0
*             OR <item>-mengesatilab < 0.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = |Kalem { <item>-posnr }: negatif sayıya izin yok|.
*          ENDIF.
*
*          DATA(lv_component_total) =
*              <item>-mengefire
*            + <item>-mengekalite
*            + <item>-mengelansman
*            + <item>-mengesatilab.
*
*          IF <item>-mengesayim <> lv_component_total.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = |Kalem { <item>-posnr }: sayım toplamı Fire + Kalite + Satılabilir toplamına eşit olmalıdır|.
*          ENDIF.
*        ENDLOOP.
*
*        lr_matnr = VALUE #(
*          FOR ls_item IN ls_deep-toitems
*          ( sign   = 'I'
*            option = 'EQ'
*            low    = CONV matnr( ls_item-matnr ) ) ).
*
*        SELECT matnr, mtart, meins
*          FROM mara
*          WHERE matnr IN @lr_matnr
*          INTO TABLE @DATA(lt_submitted_materials).
*        SORT lt_submitted_materials BY matnr.
*
*        LOOP AT ls_deep-toitems ASSIGNING <item>.
*          READ TABLE lt_submitted_materials
*            WITH KEY matnr = <item>-matnr
*            BINARY SEARCH
*            INTO DATA(ls_material).
*          IF sy-subrc <> 0.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = |Malzeme { <item>-matnr } mevcut değil|.
*          ENDIF.
*
*          <item>-isdepozito = xsdbool( ls_material-mtart = 'ZSTK' ).
*          IF <item>-meins IS INITIAL.
*            <item>-meins = ls_material-meins.
*          ENDIF.
*          IF <item>-isdepozito = abap_true.
*            APPEND <item> TO lt_payload_deposits.
*          ELSE.
*            APPEND <item> TO lt_product_items.
*          ENDIF.
*        ENDLOOP.
*        lv_md_has_deposit = xsdbool( lt_payload_deposits IS NOT INITIAL ).
*
*        "MD sayımı Fiori'de sıfırdan oluşturulur. Ürünler H/I, depozitolar
*        "DH/DI tablolarına yazılır; ZBIS/ZDAI ve devam belgeleri yaratılmaz.
*        IF lv_is_md = abap_true.
*          lv_md_plasiyer = CONV kunnr( |{ ls_deep-plasiyer ALPHA = IN }| ).
*          lv_md_kunnr = COND #(
*            WHEN ls_deep-kunnr IS INITIAL
*              THEN lv_md_plasiyer
*            ELSE CONV kunnr( |{ ls_deep-kunnr ALPHA = IN }| ) ).
*
*          CLEAR: ls_existing_md_header, lv_md_exists.
*
*          "LogUid ilk GET cevabından geldiyse mevcut açık kaydı doğrula.
*          IF lv_request_has_loguid = abap_true.
*            SELECT SINGLE *
*              FROM zmm_t_bdy_irs_h
*              WHERE log_uid = @lv_log_uid
*              INTO @ls_existing_md_header.
*
*            IF sy-subrc <> 0.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Güncellenecek MD kaydı bulunamadı'.
*            ENDIF.
*
*            lv_md_exists = abap_true.
*
*            "İstemciden gelen LogUid başka bir kayda ait olamaz.
*            IF to_upper( ls_existing_md_header-shipment_type ) <> 'MD'
*               OR ls_existing_md_header-plasiyer <> lv_md_plasiyer
*               OR ls_existing_md_header-lgort <> ls_deep-lgort
*               OR ls_existing_md_header-irs_tar <> lv_irs_tar.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'MD kaydı gönderilen plasiyer, depo veya tarih ile uyuşmuyor'.
*            ENDIF.
*
*            IF ls_existing_md_header-status <> 'N'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Tamamlanmış MD kaydı yeniden güncellenemez'.
*            ENDIF.
*          ENDIF.
*
*
***********************************************************************
***********************************************************************
*
*          "ZBDY07 kaynaklı mevcut ZBIS ile Fiori/Panorama farkını aynı
*          "başlık altında birleştirme. Mevcut sipariş kapasitesine kadar
*          "olan sayım ZBDY07 kaydında, fazlası ve yeni malzemeler ise
*          "VbelnVa alanı boş ayrı bir MD başlığında tutulur.
*          IF lv_md_exists = abap_true
*             AND ls_existing_md_header-vbeln_va IS NOT INITIAL.
*            REFRESH: lt_existing_md_items, lt_panorama_md_items,
*                     lt_md_counts, lt_md_expected, lt_vbap_expected.
*            CLEAR: ls_md_count, ls_md_expected, ls_panorama_md_header,
*                   lv_panorama_log_uid, lv_manual_posnr,
*                   lv_panorama_posnr, lv_manual_capacity,
*                   lv_remaining_capacity, lv_manual_fire,
*                   lv_manual_kalite, lv_manual_lansman,
*                   lv_manual_satilab, lv_manual_total, lv_count_total.
*
*            SELECT *
*              FROM zmm_t_bdy_irs_i
*              WHERE log_uid = @lv_log_uid
*              INTO TABLE @lt_existing_md_items.
*
*            "Depozitolar H/I tablosunda tutulmaz; varsa eski hatalı
*            "snapshot kayıtları DH/DI akışına taşınmak üzere ayıklanır.
*            DELETE lt_existing_md_items WHERE is_depozito = abap_true.
*
*            LOOP AT lt_existing_md_items INTO ls_log_item.
*              IF ls_log_item-posnr > lv_manual_posnr.
*                lv_manual_posnr = ls_log_item-posnr.
*              ENDIF.
*
*              READ TABLE lt_md_expected ASSIGNING <md_expected>
*                WITH TABLE KEY matnr       = ls_log_item-matnr
*                               is_depozito = ls_log_item-is_depozito.
*              IF sy-subrc = 0.
*                <md_expected>-menge = <md_expected>-menge
*                                     + ls_log_item-menge.
*              ELSE.
*                INSERT VALUE #(
*                  matnr       = ls_log_item-matnr
*                  is_depozito = ls_log_item-is_depozito
*                  menge       = ls_log_item-menge )
*                  INTO TABLE lt_md_expected.
*              ENDIF.
*            ENDLOOP.
*
*            "Ürünlerde mevcut ZBIS miktarı tek doğruluk kaynağıdır.
*            SELECT matnr, SUM( kwmeng ) AS menge
*              FROM vbap
*              WHERE vbeln = @ls_existing_md_header-vbeln_va
*              GROUP BY matnr
*              INTO CORRESPONDING FIELDS OF TABLE @lt_vbap_expected.
*
*            LOOP AT lt_vbap_expected INTO ls_md_expected.
*              READ TABLE lt_md_expected ASSIGNING <md_expected>
*                WITH TABLE KEY matnr       = ls_md_expected-matnr
*                               is_depozito = abap_false.
*              IF sy-subrc = 0.
*                <md_expected>-menge = ls_md_expected-menge.
*              ELSE.
*                ls_md_expected-is_depozito = abap_false.
*                INSERT ls_md_expected INTO TABLE lt_md_expected.
*              ENDIF.
*            ENDLOOP.
*
*            "Payload aynı malzemeyi birden fazla ham satırda taşıyabilir.
*            "Önce malzeme/depozito bazında tek sayım toplamına indirgenir.
**            LOOP AT ls_deep-toitems ASSIGNING <item>.
*            LOOP AT lt_product_items ASSIGNING <item>.
*              READ TABLE lt_md_counts ASSIGNING <md_count>
*                WITH TABLE KEY matnr       = <item>-matnr
*                               is_depozito = <item>-isdepozito.
*              IF sy-subrc = 0.
*                <md_count>-menge_sayim = <md_count>-menge_sayim
*                                       + <item>-mengesayim.
*                <md_count>-menge_fire = <md_count>-menge_fire
*                                      + <item>-mengefire.
*                <md_count>-menge_kalite = <md_count>-menge_kalite
*                                        + <item>-mengekalite.
*                <md_count>-menge_lansman = <md_count>-menge_lansman
*                                         + <item>-mengelansman.
*                <md_count>-menge_satilab = <md_count>-menge_satilab
*                                         + <item>-mengesatilab.
*              ELSE.
*                CLEAR ls_md_count.
*                ls_md_count-matnr         = <item>-matnr.
*                ls_md_count-meins         = <item>-meins.
*                ls_md_count-is_depozito   = <item>-isdepozito.
*                ls_md_count-menge_sayim   = <item>-mengesayim.
*                ls_md_count-menge_fire    = <item>-mengefire.
*                ls_md_count-menge_kalite  = <item>-mengekalite.
*                ls_md_count-menge_lansman = <item>-mengelansman.
*                ls_md_count-menge_satilab = <item>-mengesatilab.
*
*                CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
*                  EXPORTING
*                    input          = ls_md_count-meins
*                  IMPORTING
*                    output         = ls_md_count-meins
*                  EXCEPTIONS
*                    unit_not_found = 1
*                    OTHERS         = 2.
*                IF sy-subrc <> 0.
*                  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                  RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                    EXPORTING
*                      textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                      message = |Malzeme { <item>-matnr }: ölçü birimi geçersiz|.
*                ENDIF.
*
*                INSERT ls_md_count INTO TABLE lt_md_counts.
*              ENDIF.
*            ENDLOOP.
*
*            "Önceki sayım snapshot'ını temizle; beklenen miktar ve neden
*            "bilgileri korunur.
*            LOOP AT lt_existing_md_items ASSIGNING <manual_md_item>.
*              CLEAR: <manual_md_item>-menge_sayim,
*                     <manual_md_item>-menge_fire,
*                     <manual_md_item>-menge_kalite,
*                     <manual_md_item>-menge_lansman,
*                     <manual_md_item>-menge_satilab.
*            ENDLOOP.
*
*            LOOP AT lt_md_counts INTO ls_md_count.
*              CLEAR: ls_md_expected, lv_manual_capacity,
*                     lv_remaining_capacity, lv_manual_fire,
*                     lv_manual_kalite, lv_manual_lansman,
*                     lv_manual_satilab, lv_manual_total, lv_count_total,
*                     ls_log_item.
*
*              READ TABLE lt_md_expected INTO ls_md_expected
*                WITH TABLE KEY matnr       = ls_md_count-matnr
*                               is_depozito = ls_md_count-is_depozito.
*              IF sy-subrc = 0.
*                lv_manual_capacity = ls_md_expected-menge.
*              ENDIF.
*
*              lv_count_total = ls_md_count-menge_fire
*                             + ls_md_count-menge_kalite
*                             + ls_md_count-menge_lansman
*                             + ls_md_count-menge_satilab.
*              lv_remaining_capacity = lv_manual_capacity.
*
*              lv_manual_fire = COND #(
*                WHEN ls_md_count-menge_fire < lv_remaining_capacity
*                THEN ls_md_count-menge_fire
*                ELSE lv_remaining_capacity ).
*              lv_remaining_capacity = lv_remaining_capacity
*                                    - lv_manual_fire.
*              lv_manual_kalite = COND #(
*                WHEN ls_md_count-menge_kalite < lv_remaining_capacity
*                THEN ls_md_count-menge_kalite
*                ELSE lv_remaining_capacity ).
*              lv_remaining_capacity = lv_remaining_capacity
*                                    - lv_manual_kalite.
*              lv_manual_lansman = COND #(
*                WHEN ls_md_count-menge_lansman < lv_remaining_capacity
*                THEN ls_md_count-menge_lansman
*                ELSE lv_remaining_capacity ).
*              lv_remaining_capacity = lv_remaining_capacity
*                                    - lv_manual_lansman.
*              lv_manual_satilab = COND #(
*                WHEN ls_md_count-menge_satilab < lv_remaining_capacity
*                THEN ls_md_count-menge_satilab
*                ELSE lv_remaining_capacity ).
*              lv_manual_total = lv_manual_fire + lv_manual_kalite
*                              + lv_manual_lansman + lv_manual_satilab.
*
*              IF lv_manual_capacity > 0.
*                READ TABLE lt_existing_md_items
*                  ASSIGNING <manual_md_item>
*                  WITH KEY matnr       = ls_md_count-matnr
*                           is_depozito = ls_md_count-is_depozito.
*                IF sy-subrc <> 0.
*                  lv_manual_posnr = lv_manual_posnr + 10.
*                  APPEND INITIAL LINE TO lt_existing_md_items
*                    ASSIGNING <manual_md_item>.
*                  <manual_md_item>-log_uid     = lv_log_uid.
*                  <manual_md_item>-posnr       = lv_manual_posnr.
*                  <manual_md_item>-matnr       = ls_md_count-matnr.
*                  <manual_md_item>-meins       = ls_md_count-meins.
*                  <manual_md_item>-menge       = lv_manual_capacity.
*                  <manual_md_item>-is_depozito = ls_md_count-is_depozito.
*                ENDIF.
*
*                <manual_md_item>-menge_sayim   = lv_manual_total.
*                <manual_md_item>-menge_fire    = lv_manual_fire.
*                <manual_md_item>-menge_kalite  = lv_manual_kalite.
*                <manual_md_item>-menge_lansman = lv_manual_lansman.
*                <manual_md_item>-menge_satilab = lv_manual_satilab.
*              ENDIF.
*
*              "Siparişte bulunmayan kalem sıfır sayılsa dahi Panorama
*              "kaynağında izlenir. Mevcut kalemde yalnız kapasite fazlası
*              "ayrı kayda aktarılır.
*              IF lv_manual_capacity = 0
*                 OR lv_count_total > lv_manual_capacity.
*                lv_panorama_posnr = lv_panorama_posnr + 10.
*                CLEAR ls_log_item.
*                ls_log_item-posnr         = lv_panorama_posnr.
*                ls_log_item-matnr         = ls_md_count-matnr.
*                ls_log_item-meins         = ls_md_count-meins.
*                ls_log_item-menge         = 0.
*                ls_log_item-menge_siparis = 0.
*                ls_log_item-menge_fire = ls_md_count-menge_fire
*                                       - lv_manual_fire.
*                ls_log_item-menge_kalite = ls_md_count-menge_kalite
*                                         - lv_manual_kalite.
*                ls_log_item-menge_lansman = ls_md_count-menge_lansman
*                                          - lv_manual_lansman.
*                ls_log_item-menge_satilab = ls_md_count-menge_satilab
*                                          - lv_manual_satilab.
*                ls_log_item-menge_sayim = ls_log_item-menge_fire
*                                        + ls_log_item-menge_kalite
*                                        + ls_log_item-menge_lansman
*                                        + ls_log_item-menge_satilab.
*                ls_log_item-is_depozito = ls_md_count-is_depozito.
*                APPEND ls_log_item TO lt_panorama_md_items.
*              ENDIF.
*            ENDLOOP.
*
*            UPDATE zmm_t_bdy_irs_h
*              SET kunnr       = @lv_md_kunnr,
*                  return_type = @ls_deep-returntype,
*                  status      = 'S',
*                  ernam       = @sy-uname
*              WHERE log_uid = @lv_log_uid
*                AND status  = 'N'.
*            IF sy-subrc <> 0 OR sy-dbcnt <> 1.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'ZBDY07 kaynaklı MD sayım başlığı güncellenemedi'.
*            ENDIF.
*
*            MODIFY zmm_t_bdy_irs_i FROM TABLE @lt_existing_md_items.
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'ZBDY07 kaynaklı MD sayım kalemleri güncellenemedi'.
*            ENDIF.
*
*            IF lt_panorama_md_items IS NOT INITIAL
*               OR lt_payload_deposits IS NOT INITIAL.
*              TRY.
*                  lv_panorama_log_uid = cl_system_uuid=>create_uuid_c32_static( ).
*                CATCH cx_uuid_error.
*                  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                  RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                    EXPORTING
*                      textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                      message = 'Panorama fark kaydı için LogUid üretilemedi'.
*              ENDTRY.
*
*              CLEAR ls_panorama_md_header.
*              ls_panorama_md_header-log_uid       = lv_panorama_log_uid.
*              ls_panorama_md_header-vbeln_va      = space.
*              ls_panorama_md_header-irs_no        = space.
*              ls_panorama_md_header-irs_tar       = lv_irs_tar.
*              ls_panorama_md_header-lgort         = ls_deep-lgort.
*              ls_panorama_md_header-plasiyer      = lv_md_plasiyer.
*              ls_panorama_md_header-kunnr         = lv_md_kunnr.
*              ls_panorama_md_header-shipment_type = 'MD'.
*              ls_panorama_md_header-return_type   = ls_deep-returntype.
*              ls_panorama_md_header-depozito_iade = lv_md_has_deposit.
*              ls_panorama_md_header-status        = 'S'.
*              ls_panorama_md_header-ernam         = sy-uname.
*
*              INSERT zmm_t_bdy_irs_h FROM @ls_panorama_md_header.
*              IF sy-subrc <> 0.
*                CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = 'Panorama fark sayım başlığı kaydedilemedi'.
*              ENDIF.
*
*              IF lt_panorama_md_items IS NOT INITIAL.
*                LOOP AT lt_panorama_md_items ASSIGNING <manual_md_item>.
*                  <manual_md_item>-log_uid = lv_panorama_log_uid.
*                ENDLOOP.
*                INSERT zmm_t_bdy_irs_i FROM TABLE @lt_panorama_md_items.
*                IF sy-subrc <> 0.
*                  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                  RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                    EXPORTING
*                      textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                      message = 'Panorama fark sayım kalemleri kaydedilemedi'.
*                ENDIF.
*              ENDIF.
*
*              "ZBDY07 kaynaklı ZBIS'e depozito eklenmez. Fiori depozitoları
*              "Panorama başlığının DH/DI kayıtlarında ayrı belge adayıdır.
*              IF lt_payload_deposits IS NOT INITIAL.
*                CLEAR ls_md_deposit_header.
*                ls_md_deposit_header-mandt     = sy-mandt.
*                ls_md_deposit_header-log_uid   = lv_panorama_log_uid.
*                ls_md_deposit_header-plasiyer  = lv_md_plasiyer.
*                ls_md_deposit_header-lgort     = ls_deep-lgort.
*                ls_md_deposit_header-status    = 'S'.
*                ls_md_deposit_header-ernam     = sy-uname.
*                ls_md_deposit_header-erdat     = sy-datum.
*                ls_md_deposit_header-erzet     = sy-uzeit.
*                ls_md_deposit_header-aenam     = sy-uname.
*                ls_md_deposit_header-aedat     = sy-datum.
*                ls_md_deposit_header-aezet     = sy-uzeit.
*                INSERT zmm_t_bdy_irs_dh FROM @ls_md_deposit_header.
*                IF sy-subrc <> 0.
*                  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                  RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                    EXPORTING
*                      textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                      message = 'Panorama depozito başlığı kaydedilemedi'.
*                ENDIF.
*
*                REFRESH lt_md_deposit_items.
*                LOOP AT lt_payload_deposits ASSIGNING <item>.
*                  CLEAR ls_md_deposit_item.
*                  ls_md_deposit_item-mandt          = sy-mandt.
*                  ls_md_deposit_item-log_uid        = lv_panorama_log_uid.
*                  ls_md_deposit_item-matnr          = <item>-matnr.
*                  ls_md_deposit_item-menge_siparis = 0.
*                  ls_md_deposit_item-menge_sayim   = <item>-mengesayim.
*                  ls_md_deposit_item-is_external   = abap_true.
*                  ls_md_deposit_item-is_confirmed  = abap_false.
*                  ls_md_deposit_item-is_deleted    = abap_false.
*                  ls_md_deposit_item-ernam          = sy-uname.
*                  ls_md_deposit_item-erdat          = sy-datum.
*                  ls_md_deposit_item-erzet          = sy-uzeit.
*                  ls_md_deposit_item-aenam          = sy-uname.
*                  ls_md_deposit_item-aedat          = sy-datum.
*                  ls_md_deposit_item-aezet          = sy-uzeit.
*                  CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
*                    EXPORTING input = <item>-meins
*                    IMPORTING output = ls_md_deposit_item-meins
*                    EXCEPTIONS unit_not_found = 1 OTHERS = 2.
*                  IF sy-subrc <> 0.
*                    CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                      EXPORTING
*                        textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                        message = |Depozito { <item>-matnr }: ölçü birimi geçersiz|.
*                  ENDIF.
*                  APPEND ls_md_deposit_item TO lt_md_deposit_items.
*                ENDLOOP.
*                INSERT zmm_t_bdy_irs_di FROM TABLE @lt_md_deposit_items.
*                IF sy-subrc <> 0.
*                  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                  RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                    EXPORTING
*                      textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                      message = 'Panorama depozito sayım kalemleri kaydedilemedi'.
*                ENDIF.
*              ENDIF.
*            ENDIF.
*
*            CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*              EXPORTING
*                wait = abap_true.
*
*            ls_deep-loguid  = lv_log_uid.
*            ls_deep-vbelnva = ls_existing_md_header-vbeln_va.
*            ls_deep-irsno   = ls_existing_md_header-irs_no.
*
*            copy_data_to_ref(
*              EXPORTING
*                is_data = ls_deep
*              CHANGING
*                cr_data = er_deep_entity ).
*            RETURN.
*          ENDIF.
*
*
***********************************************************************
***********************************************************************
*
*
*
*
*          CLEAR ls_md_header.
*          ls_md_header-log_uid       = lv_log_uid.
*          ls_md_header-vbeln_va      = space.
*          ls_md_header-irs_no        = space.
*          ls_md_header-irs_tar       = lv_irs_tar.
*          ls_md_header-lgort         = ls_deep-lgort.
*          ls_md_header-plasiyer      = lv_md_plasiyer.
*          ls_md_header-kunnr         = lv_md_kunnr.
*          ls_md_header-shipment_type = 'MD'.
*          ls_md_header-return_type   = ls_deep-returntype.
*          ls_md_header-depozito_iade = lv_md_has_deposit.
*          ls_md_header-status        = 'S'.
*          ls_md_header-ernam         = sy-uname.
*
*          IF lv_md_exists = abap_true.
*            "Status koşulu ikinci/eşzamanlı onayı da engeller.
*            UPDATE zmm_t_bdy_irs_h
*              SET kunnr       = @lv_md_kunnr,
*                  return_type = @ls_deep-returntype,
*                  depozito_iade = @lv_md_has_deposit,
*                  status      = 'S',
*                  ernam       = @sy-uname
*              WHERE log_uid = @lv_log_uid
*                AND status  = 'N'.
*
*            IF sy-subrc <> 0 OR sy-dbcnt <> 1.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'MD sayım başlığı güncellenemedi'.
*            ENDIF.
*          ELSE.
*
*            INSERT zmm_t_bdy_irs_h FROM @ls_md_header.
*
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'MD sayım başlığı kaydedilemedi'.
*            ENDIF.
*          ENDIF.
*
*          "Fiori payload'ı MD kalemlerinin tam ve son halidir.
*          "Bu nedenle kaldırılan kalemlerin tekrar görünmemesi için mevcut snapshot silinir.
*          IF lv_md_exists = abap_true.
*            DELETE FROM zmm_t_bdy_irs_i
*              WHERE log_uid = @lv_log_uid.
*          ENDIF.
*
*          CLEAR: lt_log_items, lv_md_posnr.
**          LOOP AT ls_deep-toitems ASSIGNING <item>.
*          LOOP AT lt_product_items ASSIGNING <item>.
*            lv_md_posnr = lv_md_posnr + 10.
*            <item>-loguid = lv_log_uid.
*            <item>-posnr  = lv_md_posnr.
*
*            CLEAR ls_log_item.
*            ls_log_item-log_uid = lv_log_uid.
*            ls_log_item-posnr   = <item>-posnr.
*            ls_log_item-matnr   = <item>-matnr.
*
*            CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
*              EXPORTING
*                input          = <item>-meins
*              IMPORTING
*                output         = ls_log_item-meins
*              EXCEPTIONS
*                unit_not_found = 1
*                OTHERS         = 2.
*
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = |Kalem { <item>-posnr }: ölçü birimi geçersiz|.
*            ENDIF.
*
*            ls_log_item-menge_siparis = 0.
*            ls_log_item-menge_sayim   = <item>-mengesayim.
*            ls_log_item-menge_fire    = <item>-mengefire.
*            ls_log_item-menge_kalite  = <item>-mengekalite.
*            ls_log_item-menge_lansman = <item>-mengelansman.
*            ls_log_item-menge_satilab = <item>-mengesatilab.
*            ls_log_item-is_depozito   = <item>-isdepozito.
*            APPEND ls_log_item TO lt_log_items.
*          ENDLOOP.
*          IF lt_log_items IS NOT INITIAL.
*            INSERT zmm_t_bdy_irs_i FROM TABLE @lt_log_items.
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'MD sayım kalemleri kaydedilemedi'.
*            ENDIF.
*          ENDIF.
*
*          "Mono depozitoda OData yalnız sayım snapshot'ını tutar. Panorama
*          "beklentisi ve ZDAI yaratma ZBDY07 sayım onayında tamamlanır.
*          REFRESH lt_md_deposit_items.
*          IF lv_md_exists = abap_true.
*            DELETE FROM zmm_t_bdy_irs_di WHERE log_uid = @lv_log_uid.
*          ENDIF.
*
*          IF lt_payload_deposits IS NOT INITIAL.
*            CLEAR ls_md_deposit_header.
*            ls_md_deposit_header-mandt    = sy-mandt.
*            ls_md_deposit_header-log_uid  = lv_log_uid.
*            ls_md_deposit_header-plasiyer = lv_md_plasiyer.
*            ls_md_deposit_header-lgort    = ls_deep-lgort.
*            ls_md_deposit_header-status   = 'S'.
*            ls_md_deposit_header-ernam    = sy-uname.
*            ls_md_deposit_header-erdat    = sy-datum.
*            ls_md_deposit_header-erzet    = sy-uzeit.
*            ls_md_deposit_header-aenam    = sy-uname.
*            ls_md_deposit_header-aedat    = sy-datum.
*            ls_md_deposit_header-aezet    = sy-uzeit.
*            MODIFY zmm_t_bdy_irs_dh FROM @ls_md_deposit_header.
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Mono depozito başlığı kaydedilemedi'.
*            ENDIF.
*
*            LOOP AT lt_payload_deposits ASSIGNING <item>.
*              CLEAR ls_md_deposit_item.
*              ls_md_deposit_item-mandt          = sy-mandt.
*              ls_md_deposit_item-log_uid        = lv_log_uid.
*              ls_md_deposit_item-matnr          = <item>-matnr.
*              ls_md_deposit_item-menge_siparis = 0.
*              ls_md_deposit_item-menge_sayim   = <item>-mengesayim.
*              ls_md_deposit_item-is_external   = abap_true.
*              ls_md_deposit_item-is_confirmed  = abap_false.
*              ls_md_deposit_item-is_deleted    = abap_false.
*              ls_md_deposit_item-ernam          = sy-uname.
*              ls_md_deposit_item-erdat          = sy-datum.
*              ls_md_deposit_item-erzet          = sy-uzeit.
*              ls_md_deposit_item-aenam          = sy-uname.
*              ls_md_deposit_item-aedat          = sy-datum.
*              ls_md_deposit_item-aezet          = sy-uzeit.
*
*              CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
*                EXPORTING
*                  input          = <item>-meins
*                IMPORTING
*                  output         = ls_md_deposit_item-meins
*                EXCEPTIONS
*                  unit_not_found = 1
*                  OTHERS         = 2.
*              IF sy-subrc <> 0.
*                CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = |Depozito { <item>-matnr }: ölçü birimi geçersiz|.
*              ENDIF.
*
*              APPEND ls_md_deposit_item TO lt_md_deposit_items.
*            ENDLOOP.
*
*            INSERT zmm_t_bdy_irs_di FROM TABLE @lt_md_deposit_items.
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Mono depozito sayım kalemleri kaydedilemedi'.
*            ENDIF.
*
*          ELSEIF lv_md_exists = abap_true.
*            DELETE FROM zmm_t_bdy_irs_dh WHERE log_uid = @lv_log_uid.
*          ENDIF.
*
*          CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*            EXPORTING
*              wait = abap_true.
*
*          ls_deep-loguid  = lv_log_uid.
**          ls_deep-vbelnva = space.
**          ls_deep-irsno   = space.
*          IF lv_md_exists = abap_true
*                       AND ls_existing_md_header-vbeln_va IS NOT INITIAL.
*            ls_deep-vbelnva = ls_existing_md_header-vbeln_va.
*            ls_deep-irsno   = ls_existing_md_header-irs_no.
*          ELSE.
*            ls_deep-vbelnva = space.
*            ls_deep-irsno   = space.
*          ENDIF.
*
*          copy_data_to_ref(
*            EXPORTING
*              is_data = ls_deep
*            CHANGING
*              cr_data = er_deep_entity ).
*          RETURN.
*        ENDIF.
*
*        IF ls_deep-vbelnva IS INITIAL.
*          SELECT SINGLE @abap_true
*            FROM zmm_t_bdy_irs_h
*            INTO @DATA(lv_sutas)
*            WHERE irs_no EQ @ls_deep-irsno.
*        ENDIF.
*
*        IF lv_sutas EQ abap_false.
*
*          lv_vbeln = |{ ls_deep-vbelnva ALPHA = IN }|.
*
*          IF lt_product_items IS NOT INITIAL.
*            IF lv_vbeln IS INITIAL.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Ürün iadeleri için ZBIS referans siparişi zorunludur'.
*            ENDIF.
*
*            SELECT SINGLE auart
*              FROM vbak
*              WHERE vbeln = @lv_vbeln
*              INTO @DATA(lv_auart).
*            IF sy-subrc <> 0 OR lv_auart <> gc_auart_return.
*              SELECT SINGLE @abap_true
*                FROM zmm_t_bdy_irs_h
*                INTO @DATA(lv_sutas_iade)
*                WHERE log_uid = @lv_log_uid
*                  AND sutas   = @abap_true.
*              IF lv_sutas_iade EQ space.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = |Referans sipariş { lv_vbeln } bir ZBIS iade siparişi değildir|.
*              ENDIF.
*            ENDIF.
*
*            SELECT matnr, kwmeng, vrkme
*              FROM vbap
*              WHERE vbeln = @lv_vbeln
*              INTO TABLE @DATA(lt_reference_qty).
*
*            LOOP AT lt_reference_qty ASSIGNING FIELD-SYMBOL(<reference_qty>).
*              ASSIGN lt_backend_expected[
*                vbeln = lv_vbeln
*                matnr = <reference_qty>-matnr ]
*                TO FIELD-SYMBOL(<backend_expected>).
*              IF sy-subrc <> 0.
*                INSERT VALUE #(
*                  vbeln = lv_vbeln
*                  matnr = <reference_qty>-matnr
*                  meins = <reference_qty>-vrkme
*                  menge = <reference_qty>-kwmeng )
*                  INTO TABLE lt_backend_expected.
*              ELSE.
*                <backend_expected>-menge =
*                  <backend_expected>-menge + <reference_qty>-kwmeng.
*              ENDIF.
*            ENDLOOP.
*
*            LOOP AT lt_product_items ASSIGNING FIELD-SYMBOL(<product>).
*              ASSIGN lt_backend_expected[
*                vbeln = lv_vbeln
*                matnr = CONV matnr( <product>-matnr ) ]
*                TO <backend_expected>.
*              IF sy-subrc <> 0.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = |Malzeme { <product>-matnr } sipariş { lv_vbeln } içinde bulunamadı|.
*              ENDIF.
*
*              <product>-mengesiparis = <backend_expected>-menge.
*              <product>-meins        = <backend_expected>-meins.
*
*              READ TABLE ls_deep-toitems ASSIGNING <item>
*                WITH KEY posnr = <product>-posnr
*                         matnr = <product>-matnr.
*              IF sy-subrc = 0.
*                <item>-mengesiparis = <product>-mengesiparis.
*                <item>-meins        = <product>-meins.
*              ENDIF.
*            ENDLOOP.
*
*            "İade nedenleri tekrar etkinleştirilecekse yalnız ürünler gönderilmelidir.
*            "update_return_reasons(
*            "  iv_vbeln = lv_vbeln
*            "  it_items = lt_product_items ).
*          ENDIF.
*
*          IF lt_payload_deposits IS NOT INITIAL.
*            lt_confirmed_deposits = load_deposit_draft(
*              iv_log_uid        = lv_log_uid
*              it_expected_items = lt_payload_deposits ).
*            DELETE lt_payload_deposits WHERE mengesayim EQ 0.
*            DELETE lt_confirmed_deposits WHERE mengesayim EQ 0.
*            IF lt_confirmed_deposits IS NOT INITIAL.
***        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***          EXPORTING
***            textid  = /iwbep/cx_mgw_busi_exception=>business_error
***            message = 'Depozito taslağı bulunamadı. Depozito sayımını yeniden kaydedin'.
**      ENDIF.
*
*              lv_new_zdai = create_deposit_order(
*                iv_log_uid  = lv_log_uid
*                iv_plasiyer = CONV kunnr( ls_deep-plasiyer )
*                iv_lgort    = CONV lgort_d( ls_deep-lgort )
*                iv_irs_no   = CONV bstkd( ls_deep-irsno )
*                iv_irs_tar  = lv_irs_tar
*                it_items    = lt_confirmed_deposits ).
*            ENDIF.
*          ENDIF.
*
*          IF lt_product_items IS NOT INITIAL.
*            lt_toitems = VALUE #(
*              FOR ls_product IN lt_product_items
*              ( log_uid = lv_log_uid
*                posnr   = ls_product-posnr ) ).
*
*            SELECT *
*              FROM zmm_t_bdy_irs_i
*              FOR ALL ENTRIES IN @lt_toitems
*              WHERE log_uid = @lt_toitems-log_uid
*                AND posnr   = @lt_toitems-posnr
*              INTO TABLE @DATA(lt_existing_log).
*
*            LOOP AT lt_product_items ASSIGNING <product>.
*              CLEAR ls_log_item.
*              READ TABLE lt_existing_log
*                WITH KEY log_uid = lv_log_uid
*                         posnr   = <product>-posnr
*                INTO DATA(ls_existing_log).
*              IF sy-subrc = 0.
*                MOVE-CORRESPONDING ls_existing_log TO ls_log_item.
*              ENDIF.
*
*              ls_log_item-log_uid       = lv_log_uid.
*              ls_log_item-posnr         = <product>-posnr.
*              ls_log_item-matnr         = <product>-matnr.
*              ls_log_item-meins         = <product>-meins.
*              ls_log_item-menge_sayim   = <product>-mengesayim.
*              ls_log_item-menge_fire    = <product>-mengefire.
*              ls_log_item-menge_kalite  = <product>-mengekalite.
*              ls_log_item-menge_lansman  = <product>-mengelansman.
*              ls_log_item-menge_satilab = <product>-mengesatilab.
*              ls_log_item-is_depozito   = abap_false.
*              APPEND ls_log_item TO lt_log_items.
*            ENDLOOP.
*
*            MODIFY zmm_t_bdy_irs_i FROM TABLE @lt_log_items.
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              IF lt_payload_deposits IS NOT INITIAL.
*                CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*                  EXPORTING
*                    mandt   = sy-mandt
*                    log_uid = lv_log_uid.
*              ENDIF.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Ürün sayım kalemleri kaydedilemedi'.
*            ENDIF.
*          ENDIF.
*        ENDIF.
*
*        UPDATE zmm_t_bdy_irs_h
*          SET status = 'S',
*              ernam  = @sy-uname
*          WHERE log_uid = @lv_log_uid.
*        IF sy-subrc <> 0 OR sy-dbcnt = 0.
*          CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*          IF lt_payload_deposits IS NOT INITIAL.
*            CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*              EXPORTING
*                mandt   = sy-mandt
*                log_uid = lv_log_uid.
*          ENDIF.
*          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*            EXPORTING
*              textid  = /iwbep/cx_mgw_busi_exception=>business_error
*              message = 'İade sayım başlığı tamamlanamadı'.
*        ENDIF.
*
*
*
*
*        IF lt_payload_deposits IS NOT INITIAL.
*          UPDATE zmm_t_bdy_irs_dh
*            SET status = 'S',
*                aenam  = @sy-uname,
*                aedat  = @sy-datum,
*                aezet  = @sy-uzeit
*            WHERE log_uid = @lv_log_uid
*              AND zdai_vbeln <> @space.
*          IF sy-subrc <> 0 OR sy-dbcnt = 0.
*            CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*            CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*              EXPORTING
*                mandt   = sy-mandt
*                log_uid = lv_log_uid.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = 'ZDAI işlemi tamamlandı olarak işaretlenemedi'.
*          ENDIF.
*        ENDIF.
*
*        CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*          EXPORTING
*            wait = abap_true.
*
*        IF lt_payload_deposits IS NOT INITIAL.
*          CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*            EXPORTING
*              mandt   = sy-mandt
*              log_uid = lv_log_uid.
*        ENDIF.
*
*        ls_deep-loguid  = lv_log_uid.
*        ls_deep-vbelnva = lv_vbeln.
*        LOOP AT ls_deep-toitems ASSIGNING <item>.
*          <item>-loguid = lv_log_uid.
*        ENDLOOP.
*
*        copy_data_to_ref(
*          EXPORTING
*            is_data = ls_deep
*          CHANGING
*            cr_data = er_deep_entity ).


    WHEN 'ReturnFactoryShipment'.

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
          derive_return_lgort( CONV lgort_d( ls_return_factory-lgort ) ).
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
          iv_source_lgort = CONV lgort_d( ls_return_factory-sourcelgort )
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

  ENDCASE.
ENDMETHOD.



*  METHOD /iwbep/if_mgw_appl_srv_runtime~create_deep_entity.
*
*    DATA lr_entity_name TYPE RANGE OF string.
*
*    APPEND VALUE #( sign = 'I' option = 'EQ' low = 'ReturnHeader' ) TO lr_entity_name.
*    APPEND VALUE #( sign = 'I' option = 'EQ' low = 'ReturnFactoryShipment' ) TO lr_entity_name.
*
*    TYPES:
*      BEGIN OF ty_toitems,
*        log_uid TYPE sysuuid_c32,
*        posnr   TYPE posnr,
*      END OF ty_toitems.
*    TYPES:
*      BEGIN OF ty_md_count,
*        matnr         TYPE matnr,
*        meins         TYPE meins,
*        is_depozito   TYPE zmm_t_bdy_irs_i-is_depozito,
*        menge_sayim   TYPE zmm_t_bdy_irs_i-menge_sayim,
*        menge_fire    TYPE zmm_t_bdy_irs_i-menge_fire,
*        menge_kalite  TYPE zmm_t_bdy_irs_i-menge_kalite,
*        menge_lansman TYPE zmm_t_bdy_irs_i-menge_lansman,
*        menge_satilab TYPE zmm_t_bdy_irs_i-menge_satilab,
*      END OF ty_md_count,
*      ty_t_md_count TYPE SORTED TABLE OF ty_md_count
*                    WITH UNIQUE KEY matnr is_depozito,
*      BEGIN OF ty_md_expected,
*        matnr       TYPE matnr,
*        is_depozito TYPE zmm_t_bdy_irs_i-is_depozito,
*        menge       TYPE menge_d,
*      END OF ty_md_expected,
*      ty_t_md_expected TYPE SORTED TABLE OF ty_md_expected
*                       WITH UNIQUE KEY matnr is_depozito.
*    DATA:
*      ls_deep               TYPE ty_s_deep_return,
*      lt_product_items      TYPE ty_t_return_item,
*      lt_payload_deposits   TYPE ty_t_return_item,
*      lt_confirmed_deposits TYPE ty_t_return_item,
*      lt_log_items          TYPE STANDARD TABLE OF zmm_t_bdy_irs_i,
*      ls_log_item           LIKE LINE OF lt_log_items,
*      lt_toitems            TYPE TABLE OF ty_toitems,
*      lt_backend_expected   TYPE ty_t_expected_qty,
*      lr_matnr              TYPE RANGE OF matnr,
*      ls_md_header          TYPE zmm_t_bdy_irs_h,
*      lv_log_uid            TYPE sysuuid_c32,
*      lv_vbeln              TYPE vbeln_va,
*      lv_irs_tar            TYPE dats,
*      lv_irs_time           TYPE tims,
*      lv_new_zdai           TYPE vbeln_va,
*      lv_is_md              TYPE abap_bool,
*      lv_md_posnr           TYPE posnr,
*      lv_md_kunnr           TYPE kunnr,
*      ls_existing_md_header TYPE zmm_t_bdy_irs_h,
*      ls_panorama_md_header TYPE zmm_t_bdy_irs_h,
*      lt_existing_md_items  TYPE STANDARD TABLE OF zmm_t_bdy_irs_i,
*      lt_panorama_md_items  TYPE STANDARD TABLE OF zmm_t_bdy_irs_i,
*      lt_md_deposit_items   TYPE STANDARD TABLE OF zmm_t_bdy_irs_di,
*      ls_md_deposit_item    TYPE zmm_t_bdy_irs_di,
*      lt_md_counts          TYPE ty_t_md_count,
*      lt_md_expected        TYPE ty_t_md_expected,
*      lt_vbap_expected      TYPE ty_t_md_expected,
*      ls_md_count           TYPE ty_md_count,
*      ls_md_expected        TYPE ty_md_expected,
*      lv_request_has_loguid TYPE abap_bool,
*      lv_md_exists          TYPE abap_bool,
*      lv_md_plasiyer        TYPE kunnr,
*      lv_panorama_log_uid   TYPE sysuuid_c32,
*      lv_manual_posnr       TYPE posnr,
*      lv_panorama_posnr     TYPE posnr,
*      lv_manual_capacity    TYPE menge_d,
*      lv_remaining_capacity TYPE menge_d,
*      lv_manual_fire        TYPE menge_d,
*      lv_manual_kalite      TYPE menge_d,
*      lv_manual_lansman     TYPE menge_d,
*      lv_manual_satilab     TYPE menge_d,
*      lv_manual_total       TYPE menge_d,
*      lv_count_total        TYPE menge_d.
*
*    FIELD-SYMBOLS:
*      <md_count>       TYPE ty_md_count,
*      <md_expected>    TYPE ty_md_expected,
*      <manual_md_item> TYPE zmm_t_bdy_irs_i.
*    DATA: ls_return_factory TYPE ty_s_return_factory_deep,
*          lv_werks          TYPE werks_d VALUE gc_default_return_werks.
*    IF iv_entity_name NOT IN lr_entity_name.
*      super->/iwbep/if_mgw_appl_srv_runtime~create_deep_entity(
*        EXPORTING
*          iv_entity_name          = iv_entity_name
*          iv_entity_set_name      = iv_entity_set_name
*          iv_source_name          = iv_source_name
*          io_data_provider        = io_data_provider
*          it_key_tab              = it_key_tab
*          it_navigation_path      = it_navigation_path
*          io_expand               = io_expand
*          io_tech_request_context = io_tech_request_context
*        IMPORTING
*          er_deep_entity          = er_deep_entity ).
*      RETURN.
*    ENDIF.
*
*    CASE iv_entity_name.
*      WHEN 'ReturnHeader'.
*
*        io_data_provider->read_entry_data(
*          IMPORTING
*            es_data = ls_deep ).
*
*        lv_is_md = xsdbool( to_upper( ls_deep-shipmenttype ) = 'MD' ).
*        lv_request_has_loguid = xsdbool( ls_deep-loguid IS NOT INITIAL ).
*        lv_log_uid = ls_deep-loguid.
*        IF lv_log_uid IS INITIAL.
*          IF lv_is_md = abap_true.
*            TRY.
*                lv_log_uid = cl_system_uuid=>create_uuid_c32_static( ).
*              CATCH cx_uuid_error.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = 'MD sayımı için LogUid üretilemedi'.
*            ENDTRY.
*          ELSE.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = 'LogUid zorunludur'.
*          ENDIF.
*        ENDIF.
*
*        IF ls_deep-irstar IS NOT INITIAL.
*          CONVERT TIME STAMP ls_deep-irstar
*            TIME ZONE sy-zonlo
*            INTO DATE lv_irs_tar
*                 TIME lv_irs_time.
*        ENDIF.
*
*        IF lv_is_md = abap_true.
*          IF ls_deep-plasiyer IS INITIAL.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = 'MD sayımı için plasiyer zorunludur'.
*          ENDIF.
*
*          IF ls_deep-lgort IS INITIAL.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = 'MD sayımı için depo yeri zorunludur'.
*          ENDIF.
*
*          IF lv_irs_tar IS INITIAL.
*            lv_irs_tar = sy-datum.
*          ENDIF.
*        ENDIF.
*
*        IF ls_deep-toitems IS INITIAL.
*          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*            EXPORTING
*              textid  = /iwbep/cx_mgw_busi_exception=>business_error
*              message = 'En az bir satır sayılmalıdır'.
*        ENDIF.
*
*        LOOP AT ls_deep-toitems ASSIGNING FIELD-SYMBOL(<item>).
*          IF <item>-matnr IS INITIAL.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = 'Malzeme numarası eksik'.
*          ENDIF.
*
*          <item>-matnr = |{ <item>-matnr ALPHA = IN }|.
*
*          IF <item>-mengesayim < 0
*             OR <item>-mengefire < 0
*             OR <item>-mengekalite < 0
*             OR <item>-mengelansman < 0
*             OR <item>-mengesatilab < 0.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = |Kalem { <item>-posnr }: negatif sayıya izin yok|.
*          ENDIF.
*
*          DATA(lv_component_total) =
*              <item>-mengefire
*            + <item>-mengekalite
*            + <item>-mengelansman
*            + <item>-mengesatilab.
*
*          IF <item>-mengesayim <> lv_component_total.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = |Kalem { <item>-posnr }: sayım toplamı Fire + Kalite + Satılabilir toplamına eşit olmalıdır|.
*          ENDIF.
*        ENDLOOP.
*
*        lr_matnr = VALUE #(
*          FOR ls_item IN ls_deep-toitems
*          ( sign   = 'I'
*            option = 'EQ'
*            low    = CONV matnr( ls_item-matnr ) ) ).
*
*        SELECT matnr, mtart, meins
*          FROM mara
*          WHERE matnr IN @lr_matnr
*          INTO TABLE @DATA(lt_submitted_materials).
*        SORT lt_submitted_materials BY matnr.
*
*        LOOP AT ls_deep-toitems ASSIGNING <item>.
*          READ TABLE lt_submitted_materials
*            WITH KEY matnr = <item>-matnr
*            BINARY SEARCH
*            INTO DATA(ls_material).
*          IF sy-subrc <> 0.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = |Malzeme { <item>-matnr } mevcut değil|.
*          ENDIF.
*
*          <item>-isdepozito = xsdbool( ls_material-mtart = 'ZSTK' ).
*          IF <item>-meins IS INITIAL.
*            <item>-meins = ls_material-meins.
*          ENDIF.
*          IF <item>-isdepozito = abap_true.
*            APPEND <item> TO lt_payload_deposits.
*          ELSE.
*            APPEND <item> TO lt_product_items.
*          ENDIF.
*        ENDLOOP.
*
*        "MD sayımı Fiori'de sıfırdan oluşturulur. Bu aşamada yalnız
*        "ZMM_T_BDY_IRS_H / ZMM_T_BDY_IRS_I logları yazılır; ZBIS, ZDAI,
*        "depozito taslağı, irsaliye ve sipariş kontrolleri çalıştırılmaz.
*        IF lv_is_md = abap_true.
*          lv_md_plasiyer = CONV kunnr( |{ ls_deep-plasiyer ALPHA = IN }| ).
*          lv_md_kunnr = COND #(
*            WHEN ls_deep-kunnr IS INITIAL
*              THEN lv_md_plasiyer
*            ELSE CONV kunnr( |{ ls_deep-kunnr ALPHA = IN }| ) ).
*
*          CLEAR: ls_existing_md_header, lv_md_exists.
*
*          "LogUid ilk GET cevabından geldiyse mevcut açık kaydı doğrula.
*          IF lv_request_has_loguid = abap_true.
*            SELECT SINGLE *
*              FROM zmm_t_bdy_irs_h
*              WHERE log_uid = @lv_log_uid
*              INTO @ls_existing_md_header.
*
*            IF sy-subrc <> 0.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Güncellenecek MD kaydı bulunamadı'.
*            ENDIF.
*
*            lv_md_exists = abap_true.
*
*            "İstemciden gelen LogUid başka bir kayda ait olamaz.
*            IF to_upper( ls_existing_md_header-shipment_type ) <> 'MD'
*               OR ls_existing_md_header-plasiyer <> lv_md_plasiyer
*               OR ls_existing_md_header-lgort <> ls_deep-lgort
*               OR ls_existing_md_header-irs_tar <> lv_irs_tar.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'MD kaydı gönderilen plasiyer, depo veya tarih ile uyuşmuyor'.
*            ENDIF.
*
*            IF ls_existing_md_header-status <> 'N'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Tamamlanmış MD kaydı yeniden güncellenemez'.
*            ENDIF.
*          ENDIF.
*
*
***********************************************************************
***********************************************************************
*
*          "ZBDY07 kaynaklı mevcut ZBIS ile Fiori/Panorama farkını aynı
*          "başlık altında birleştirme. Mevcut sipariş kapasitesine kadar
*          "olan sayım ZBDY07 kaydında, fazlası ve yeni malzemeler ise
*          "VbelnVa alanı boş ayrı bir MD başlığında tutulur.
*          IF lv_md_exists = abap_true
*             AND ls_existing_md_header-vbeln_va IS NOT INITIAL.
*            REFRESH: lt_existing_md_items, lt_panorama_md_items,
*                     lt_md_counts, lt_md_expected, lt_vbap_expected.
*            CLEAR: ls_md_count, ls_md_expected, ls_panorama_md_header,
*                   lv_panorama_log_uid, lv_manual_posnr,
*                   lv_panorama_posnr, lv_manual_capacity,
*                   lv_remaining_capacity, lv_manual_fire,
*                   lv_manual_kalite, lv_manual_lansman,
*                   lv_manual_satilab, lv_manual_total, lv_count_total.
*
*            SELECT *
*              FROM zmm_t_bdy_irs_i
*              WHERE log_uid = @lv_log_uid
*              INTO TABLE @lt_existing_md_items.
*
*            "Depozitolar H/I tablosunda tutulmaz; varsa eski hatalı
*            "snapshot kayıtları DH/DI akışına taşınmak üzere ayıklanır.
*            DELETE lt_existing_md_items WHERE is_depozito = abap_true.
*
*            LOOP AT lt_existing_md_items INTO ls_log_item.
*              IF ls_log_item-posnr > lv_manual_posnr.
*                lv_manual_posnr = ls_log_item-posnr.
*              ENDIF.
*
*              READ TABLE lt_md_expected ASSIGNING <md_expected>
*                WITH TABLE KEY matnr       = ls_log_item-matnr
*                               is_depozito = ls_log_item-is_depozito.
*              IF sy-subrc = 0.
*                <md_expected>-menge = <md_expected>-menge
*                                     + ls_log_item-menge.
*              ELSE.
*                INSERT VALUE #(
*                  matnr       = ls_log_item-matnr
*                  is_depozito = ls_log_item-is_depozito
*                  menge       = ls_log_item-menge )
*                  INTO TABLE lt_md_expected.
*              ENDIF.
*            ENDLOOP.
*
*            "Ürünlerde mevcut ZBIS miktarı tek doğruluk kaynağıdır.
*            SELECT matnr, SUM( kwmeng ) AS menge
*              FROM vbap
*              WHERE vbeln = @ls_existing_md_header-vbeln_va
*              GROUP BY matnr
*              INTO CORRESPONDING FIELDS OF TABLE @lt_vbap_expected.
*
*            LOOP AT lt_vbap_expected INTO ls_md_expected.
*              READ TABLE lt_md_expected ASSIGNING <md_expected>
*                WITH TABLE KEY matnr       = ls_md_expected-matnr
*                               is_depozito = abap_false.
*              IF sy-subrc = 0.
*                <md_expected>-menge = ls_md_expected-menge.
*              ELSE.
*                ls_md_expected-is_depozito = abap_false.
*                INSERT ls_md_expected INTO TABLE lt_md_expected.
*              ENDIF.
*            ENDLOOP.
*
*            "Payload aynı malzemeyi birden fazla ham satırda taşıyabilir.
*            "Önce malzeme/depozito bazında tek sayım toplamına indirgenir.
**            LOOP AT ls_deep-toitems ASSIGNING <item>.
*            LOOP AT lt_product_items ASSIGNING <item>.
*              READ TABLE lt_md_counts ASSIGNING <md_count>
*                WITH TABLE KEY matnr       = <item>-matnr
*                               is_depozito = <item>-isdepozito.
*              IF sy-subrc = 0.
*                <md_count>-menge_sayim = <md_count>-menge_sayim
*                                       + <item>-mengesayim.
*                <md_count>-menge_fire = <md_count>-menge_fire
*                                      + <item>-mengefire.
*                <md_count>-menge_kalite = <md_count>-menge_kalite
*                                        + <item>-mengekalite.
*                <md_count>-menge_lansman = <md_count>-menge_lansman
*                                         + <item>-mengelansman.
*                <md_count>-menge_satilab = <md_count>-menge_satilab
*                                         + <item>-mengesatilab.
*              ELSE.
*                CLEAR ls_md_count.
*                ls_md_count-matnr         = <item>-matnr.
*                ls_md_count-meins         = <item>-meins.
*                ls_md_count-is_depozito   = <item>-isdepozito.
*                ls_md_count-menge_sayim   = <item>-mengesayim.
*                ls_md_count-menge_fire    = <item>-mengefire.
*                ls_md_count-menge_kalite  = <item>-mengekalite.
*                ls_md_count-menge_lansman = <item>-mengelansman.
*                ls_md_count-menge_satilab = <item>-mengesatilab.
*
*                CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
*                  EXPORTING
*                    input          = ls_md_count-meins
*                  IMPORTING
*                    output         = ls_md_count-meins
*                  EXCEPTIONS
*                    unit_not_found = 1
*                    OTHERS         = 2.
*                IF sy-subrc <> 0.
*                  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                  RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                    EXPORTING
*                      textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                      message = |Malzeme { <item>-matnr }: ölçü birimi geçersiz|.
*                ENDIF.
*
*                INSERT ls_md_count INTO TABLE lt_md_counts.
*              ENDIF.
*            ENDLOOP.
*
*            "Önceki sayım snapshot'ını temizle; beklenen miktar ve neden
*            "bilgileri korunur.
*            LOOP AT lt_existing_md_items ASSIGNING <manual_md_item>.
*              CLEAR: <manual_md_item>-menge_sayim,
*                     <manual_md_item>-menge_fire,
*                     <manual_md_item>-menge_kalite,
*                     <manual_md_item>-menge_lansman,
*                     <manual_md_item>-menge_satilab.
*            ENDLOOP.
*
*            LOOP AT lt_md_counts INTO ls_md_count.
*              CLEAR: ls_md_expected, lv_manual_capacity,
*                     lv_remaining_capacity, lv_manual_fire,
*                     lv_manual_kalite, lv_manual_lansman,
*                     lv_manual_satilab, lv_manual_total, lv_count_total,
*                     ls_log_item.
*
*              READ TABLE lt_md_expected INTO ls_md_expected
*                WITH TABLE KEY matnr       = ls_md_count-matnr
*                               is_depozito = ls_md_count-is_depozito.
*              IF sy-subrc = 0.
*                lv_manual_capacity = ls_md_expected-menge.
*              ENDIF.
*
*              lv_count_total = ls_md_count-menge_fire
*                             + ls_md_count-menge_kalite
*                             + ls_md_count-menge_lansman
*                             + ls_md_count-menge_satilab.
*              lv_remaining_capacity = lv_manual_capacity.
*
*              lv_manual_fire = COND #(
*                WHEN ls_md_count-menge_fire < lv_remaining_capacity
*                THEN ls_md_count-menge_fire
*                ELSE lv_remaining_capacity ).
*              lv_remaining_capacity = lv_remaining_capacity
*                                    - lv_manual_fire.
*              lv_manual_kalite = COND #(
*                WHEN ls_md_count-menge_kalite < lv_remaining_capacity
*                THEN ls_md_count-menge_kalite
*                ELSE lv_remaining_capacity ).
*              lv_remaining_capacity = lv_remaining_capacity
*                                    - lv_manual_kalite.
*              lv_manual_lansman = COND #(
*                WHEN ls_md_count-menge_lansman < lv_remaining_capacity
*                THEN ls_md_count-menge_lansman
*                ELSE lv_remaining_capacity ).
*              lv_remaining_capacity = lv_remaining_capacity
*                                    - lv_manual_lansman.
*              lv_manual_satilab = COND #(
*                WHEN ls_md_count-menge_satilab < lv_remaining_capacity
*                THEN ls_md_count-menge_satilab
*                ELSE lv_remaining_capacity ).
*              lv_manual_total = lv_manual_fire + lv_manual_kalite
*                              + lv_manual_lansman + lv_manual_satilab.
*
*              IF lv_manual_capacity > 0.
*                READ TABLE lt_existing_md_items
*                  ASSIGNING <manual_md_item>
*                  WITH KEY matnr       = ls_md_count-matnr
*                           is_depozito = ls_md_count-is_depozito.
*                IF sy-subrc <> 0.
*                  lv_manual_posnr = lv_manual_posnr + 10.
*                  APPEND INITIAL LINE TO lt_existing_md_items
*                    ASSIGNING <manual_md_item>.
*                  <manual_md_item>-log_uid     = lv_log_uid.
*                  <manual_md_item>-posnr       = lv_manual_posnr.
*                  <manual_md_item>-matnr       = ls_md_count-matnr.
*                  <manual_md_item>-meins       = ls_md_count-meins.
*                  <manual_md_item>-menge       = lv_manual_capacity.
*                  <manual_md_item>-is_depozito = ls_md_count-is_depozito.
*                ENDIF.
*
*                <manual_md_item>-menge_sayim   = lv_manual_total.
*                <manual_md_item>-menge_fire    = lv_manual_fire.
*                <manual_md_item>-menge_kalite  = lv_manual_kalite.
*                <manual_md_item>-menge_lansman = lv_manual_lansman.
*                <manual_md_item>-menge_satilab = lv_manual_satilab.
*              ENDIF.
*
*              "Siparişte bulunmayan kalem sıfır sayılsa dahi Panorama
*              "kaynağında izlenir. Mevcut kalemde yalnız kapasite fazlası
*              "ayrı kayda aktarılır.
*              IF lv_manual_capacity = 0
*                 OR lv_count_total > lv_manual_capacity.
*                lv_panorama_posnr = lv_panorama_posnr + 10.
*                CLEAR ls_log_item.
*                ls_log_item-posnr         = lv_panorama_posnr.
*                ls_log_item-matnr         = ls_md_count-matnr.
*                ls_log_item-meins         = ls_md_count-meins.
*                ls_log_item-menge         = 0.
*                ls_log_item-menge_siparis = 0.
*                ls_log_item-menge_fire = ls_md_count-menge_fire
*                                       - lv_manual_fire.
*                ls_log_item-menge_kalite = ls_md_count-menge_kalite
*                                         - lv_manual_kalite.
*                ls_log_item-menge_lansman = ls_md_count-menge_lansman
*                                          - lv_manual_lansman.
*                ls_log_item-menge_satilab = ls_md_count-menge_satilab
*                                          - lv_manual_satilab.
*                ls_log_item-menge_sayim = ls_log_item-menge_fire
*                                        + ls_log_item-menge_kalite
*                                        + ls_log_item-menge_lansman
*                                        + ls_log_item-menge_satilab.
*                ls_log_item-is_depozito = ls_md_count-is_depozito.
*                APPEND ls_log_item TO lt_panorama_md_items.
*              ENDIF.
*            ENDLOOP.
*
*            UPDATE zmm_t_bdy_irs_h
*              SET kunnr       = @lv_md_kunnr,
*                  return_type = @ls_deep-returntype,
*                  status      = 'S',
*                  ernam       = @sy-uname
*              WHERE log_uid = @lv_log_uid
*                AND status  = 'N'.
*            IF sy-subrc <> 0 OR sy-dbcnt <> 1.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'ZBDY07 kaynaklı MD sayım başlığı güncellenemedi'.
*            ENDIF.
*
*            MODIFY zmm_t_bdy_irs_i FROM TABLE @lt_existing_md_items.
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'ZBDY07 kaynaklı MD sayım kalemleri güncellenemedi'.
*            ENDIF.
*
*            IF lt_panorama_md_items IS NOT INITIAL.
*              TRY.
*                  lv_panorama_log_uid = cl_system_uuid=>create_uuid_c32_static( ).
*                CATCH cx_uuid_error.
*                  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                  RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                    EXPORTING
*                      textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                      message = 'Panorama fark kaydı için LogUid üretilemedi'.
*              ENDTRY.
*
*              CLEAR ls_panorama_md_header.
*              ls_panorama_md_header-log_uid       = lv_panorama_log_uid.
*              ls_panorama_md_header-vbeln_va      = space.
*              ls_panorama_md_header-irs_no        = space.
*              ls_panorama_md_header-irs_tar       = lv_irs_tar.
*              ls_panorama_md_header-lgort         = ls_deep-lgort.
*              ls_panorama_md_header-plasiyer      = lv_md_plasiyer.
*              ls_panorama_md_header-kunnr         = lv_md_kunnr.
*              ls_panorama_md_header-shipment_type = 'MD'.
*              ls_panorama_md_header-return_type   = ls_deep-returntype.
*              ls_panorama_md_header-status        = 'S'.
*              ls_panorama_md_header-ernam         = sy-uname.
*
*              INSERT zmm_t_bdy_irs_h FROM @ls_panorama_md_header.
*              IF sy-subrc <> 0.
*                CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = 'Panorama fark sayım başlığı kaydedilemedi'.
*              ENDIF.
*
*              LOOP AT lt_panorama_md_items ASSIGNING <manual_md_item>.
*                <manual_md_item>-log_uid = lv_panorama_log_uid.
*              ENDLOOP.
*              INSERT zmm_t_bdy_irs_i FROM TABLE @lt_panorama_md_items.
*              IF sy-subrc <> 0.
*                CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = 'Panorama fark sayım kalemleri kaydedilemedi'.
*              ENDIF.
*            ENDIF.
*
*            CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*              EXPORTING
*                wait = abap_true.
*
*            ls_deep-loguid  = lv_log_uid.
*            ls_deep-vbelnva = ls_existing_md_header-vbeln_va.
*            ls_deep-irsno   = ls_existing_md_header-irs_no.
*
*            copy_data_to_ref(
*              EXPORTING
*                is_data = ls_deep
*              CHANGING
*                cr_data = er_deep_entity ).
*            RETURN.
*          ENDIF.
*
*
***********************************************************************
***********************************************************************
*
*
*
*
*          CLEAR ls_md_header.
*          ls_md_header-log_uid       = lv_log_uid.
*          ls_md_header-vbeln_va      = space.
*          ls_md_header-irs_no        = space.
*          ls_md_header-irs_tar       = lv_irs_tar.
*          ls_md_header-lgort         = ls_deep-lgort.
*          ls_md_header-plasiyer      = lv_md_plasiyer.
*          ls_md_header-kunnr         = lv_md_kunnr.
*          ls_md_header-shipment_type = 'MD'.
*          ls_md_header-return_type   = ls_deep-returntype.
*          ls_md_header-status        = 'S'.
*          ls_md_header-ernam         = sy-uname.
*
*          IF lv_md_exists = abap_true.
*            "Status koşulu ikinci/eşzamanlı onayı da engeller.
*            UPDATE zmm_t_bdy_irs_h
*              SET kunnr       = @lv_md_kunnr,
*                  return_type = @ls_deep-returntype,
*                  status      = 'S',
*                  ernam       = @sy-uname
*              WHERE log_uid = @lv_log_uid
*                AND status  = 'N'.
*
*            IF sy-subrc <> 0 OR sy-dbcnt <> 1.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'MD sayım başlığı güncellenemedi'.
*            ENDIF.
*          ELSE.
*
*            INSERT zmm_t_bdy_irs_h FROM @ls_md_header.
*
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'MD sayım başlığı kaydedilemedi'.
*            ENDIF.
*          ENDIF.
*
*          "Fiori payload'ı MD kalemlerinin tam ve son halidir.
*          "Bu nedenle kaldırılan kalemlerin tekrar görünmemesi için mevcut snapshot silinir.
*          IF lv_md_exists = abap_true.
*            DELETE FROM zmm_t_bdy_irs_i
*              WHERE log_uid = @lv_log_uid.
*          ENDIF.
*
*          CLEAR: lt_log_items, lv_md_posnr.
**          LOOP AT ls_deep-toitems ASSIGNING <item>.
*          LOOP AT lt_product_items ASSIGNING <item>.
*            lv_md_posnr = lv_md_posnr + 10.
*            <item>-loguid = lv_log_uid.
*            <item>-posnr  = lv_md_posnr.
*
*            CLEAR ls_log_item.
*            ls_log_item-log_uid = lv_log_uid.
*            ls_log_item-posnr   = <item>-posnr.
*            ls_log_item-matnr   = <item>-matnr.
*
*            CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
*              EXPORTING
*                input          = <item>-meins
*              IMPORTING
*                output         = ls_log_item-meins
*              EXCEPTIONS
*                unit_not_found = 1
*                OTHERS         = 2.
*
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = |Kalem { <item>-posnr }: ölçü birimi geçersiz|.
*            ENDIF.
*
*            ls_log_item-menge_siparis = 0.
*            ls_log_item-menge_sayim   = <item>-mengesayim.
*            ls_log_item-menge_fire    = <item>-mengefire.
*            ls_log_item-menge_kalite  = <item>-mengekalite.
*            ls_log_item-menge_lansman = <item>-mengelansman.
*            ls_log_item-menge_satilab = <item>-mengesatilab.
*            ls_log_item-is_depozito   = <item>-isdepozito.
*            APPEND ls_log_item TO lt_log_items.
*          ENDLOOP.
*          IF lt_log_items IS NOT INITIAL.
*            INSERT zmm_t_bdy_irs_i FROM TABLE @lt_log_items.
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'MD sayım kalemleri kaydedilemedi'.
*            ENDIF.
*          ENDIF.
*
*          "Mono depozitolar da OP ile aynı belge ve log zincirini kullanır.
*          "Payload onaylanmış son snapshot olduğundan DH/DI doğrudan bu
*          "veriden hazırlanır ve ardından ZDAI siparişi oluşturulur.
*          REFRESH: lt_confirmed_deposits, lt_md_deposit_items.
*          lt_confirmed_deposits = lt_payload_deposits.
*          DELETE lt_confirmed_deposits WHERE mengesayim = 0.
*
*          IF lt_confirmed_deposits IS NOT INITIAL.
*            lv_new_zdai = create_deposit_order(
*              iv_log_uid  = lv_log_uid
*              iv_plasiyer = lv_md_plasiyer
*              iv_lgort    = CONV lgort_d( ls_deep-lgort )
*              iv_irs_no   = CONV bstkd( ls_deep-irsno )
*              iv_irs_tar  = lv_irs_tar
*              it_items    = lt_confirmed_deposits ).
*
*            DELETE FROM zmm_t_bdy_irs_di
*              WHERE log_uid = @lv_log_uid.
*
*            LOOP AT lt_confirmed_deposits ASSIGNING <item>.
*              CLEAR ls_md_deposit_item.
*              ls_md_deposit_item-mandt          = sy-mandt.
*              ls_md_deposit_item-log_uid        = lv_log_uid.
*              ls_md_deposit_item-matnr          = <item>-matnr.
*              ls_md_deposit_item-menge_siparis = <item>-mengesiparis.
*              ls_md_deposit_item-menge_sayim   = <item>-mengesayim.
*              ls_md_deposit_item-is_external   = abap_true.
*              ls_md_deposit_item-is_confirmed  = abap_true.
*              ls_md_deposit_item-is_deleted    = abap_false.
*              ls_md_deposit_item-ernam          = sy-uname.
*              ls_md_deposit_item-erdat          = sy-datum.
*              ls_md_deposit_item-erzet          = sy-uzeit.
*              ls_md_deposit_item-aenam          = sy-uname.
*              ls_md_deposit_item-aedat          = sy-datum.
*              ls_md_deposit_item-aezet          = sy-uzeit.
*
*              CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
*                EXPORTING
*                  input          = <item>-meins
*                IMPORTING
*                  output         = ls_md_deposit_item-meins
*                EXCEPTIONS
*                  unit_not_found = 1
*                  OTHERS         = 2.
*              IF sy-subrc <> 0.
*                CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*                CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*                  EXPORTING
*                    mandt   = sy-mandt
*                    log_uid = lv_log_uid.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = |Depozito { <item>-matnr }: ölçü birimi geçersiz|.
*              ENDIF.
*
*              APPEND ls_md_deposit_item TO lt_md_deposit_items.
*            ENDLOOP.
*
*            INSERT zmm_t_bdy_irs_di FROM TABLE @lt_md_deposit_items.
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*                EXPORTING
*                  mandt   = sy-mandt
*                  log_uid = lv_log_uid.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Mono depozito sayım kalemleri kaydedilemedi'.
*            ENDIF.
*
*            UPDATE zmm_t_bdy_irs_dh
*              SET status = 'S',
*                  aenam  = @sy-uname,
*                  aedat  = @sy-datum,
*                  aezet  = @sy-uzeit
*              WHERE log_uid   = @lv_log_uid
*                AND zdai_vbeln = @lv_new_zdai.
*            IF sy-subrc <> 0 OR sy-dbcnt = 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*                EXPORTING
*                  mandt   = sy-mandt
*                  log_uid = lv_log_uid.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Mono ZDAI işlemi tamamlandı olarak işaretlenemedi'.
*            ENDIF.
*          ENDIF.
*
*          CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*            EXPORTING
*              wait = abap_true.
*
*          ls_deep-loguid  = lv_log_uid.
**          ls_deep-vbelnva = space.
**          ls_deep-irsno   = space.
*          IF lv_md_exists = abap_true
*                       AND ls_existing_md_header-vbeln_va IS NOT INITIAL.
*            ls_deep-vbelnva = ls_existing_md_header-vbeln_va.
*            ls_deep-irsno   = ls_existing_md_header-irs_no.
*          ELSE.
*            ls_deep-vbelnva = space.
*            ls_deep-irsno   = space.
*          ENDIF.
*
*          IF lt_confirmed_deposits IS NOT INITIAL.
*            CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*              EXPORTING
*                mandt   = sy-mandt
*                log_uid = lv_log_uid.
*          ENDIF.
*
*          copy_data_to_ref(
*            EXPORTING
*              is_data = ls_deep
*            CHANGING
*              cr_data = er_deep_entity ).
*          RETURN.
*        ENDIF.
**        IF lv_is_md = abap_true.
**          lv_md_kunnr = COND #(
**            WHEN ls_deep-kunnr IS INITIAL
**              THEN CONV kunnr( |{ ls_deep-plasiyer ALPHA = IN }| )
**            ELSE CONV kunnr( |{ ls_deep-kunnr ALPHA = IN }| ) ).
**
**          CLEAR ls_md_header.
**          ls_md_header-log_uid       = lv_log_uid.
**          ls_md_header-vbeln_va      = space.
**          ls_md_header-irs_no        = space.
**          ls_md_header-irs_tar       = lv_irs_tar.
**          ls_md_header-lgort         = ls_deep-lgort.
**          ls_md_header-plasiyer      = |{ ls_deep-plasiyer ALPHA = IN }|.
**          ls_md_header-kunnr         = lv_md_kunnr.
**          ls_md_header-shipment_type = 'MD'.
**          ls_md_header-return_type   = ls_deep-returntype.
**          ls_md_header-status        = 'S'.
**          ls_md_header-ernam         = sy-uname.
**
**          INSERT zmm_t_bdy_irs_h FROM @ls_md_header.
**          IF sy-subrc <> 0.
**            CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
**            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
**              EXPORTING
**                textid  = /iwbep/cx_mgw_busi_exception=>business_error
**                message = 'MD sayım başlığı kaydedilemedi'.
**          ENDIF.
**
**          CLEAR: lt_log_items, lv_md_posnr.
**          LOOP AT ls_deep-toitems ASSIGNING <item>.
**            lv_md_posnr = lv_md_posnr + 10.
**            <item>-loguid = lv_log_uid.
**            <item>-posnr  = lv_md_posnr.
**
**            CLEAR ls_log_item.
**            ls_log_item-log_uid        = lv_log_uid.
**            ls_log_item-posnr          = <item>-posnr.
**            ls_log_item-matnr          = <item>-matnr.
**            IF lv_is_md EQ abap_true.
**              CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
**                EXPORTING
**                  input          = <item>-meins
**                IMPORTING
**                  output         = ls_log_item-meins
**                EXCEPTIONS
**                  unit_not_found = 1.
**            ELSE.
**              ls_log_item-meins          = <item>-meins.
**            ENDIF.
**
**            ls_log_item-menge_siparis  = 0.
**            ls_log_item-menge_sayim    = <item>-mengesayim.
**            ls_log_item-menge_fire     = <item>-mengefire.
**            ls_log_item-menge_kalite   = <item>-mengekalite.
**            ls_log_item-menge_lansman  = <item>-mengelansman.
**            ls_log_item-menge_satilab  = <item>-mengesatilab.
**            ls_log_item-is_depozito    = <item>-isdepozito.
**            APPEND ls_log_item TO lt_log_items.
**          ENDLOOP.
**
**          INSERT zmm_t_bdy_irs_i FROM TABLE @lt_log_items.
**          IF sy-subrc <> 0.
**            CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
**            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
**              EXPORTING
**                textid  = /iwbep/cx_mgw_busi_exception=>business_error
**                message = 'MD sayım kalemleri kaydedilemedi'.
**          ENDIF.
**
**          CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
**            EXPORTING
**              wait = abap_true.
**
**          ls_deep-loguid  = lv_log_uid.
**          ls_deep-vbelnva = space.
**          ls_deep-irsno   = space.
**
**          copy_data_to_ref(
**            EXPORTING
**              is_data = ls_deep
**            CHANGING
**              cr_data = er_deep_entity ).
**          RETURN.
**        ENDIF.
*
*
*        IF ls_deep-vbelnva IS INITIAL.
*          SELECT SINGLE @abap_true
*            FROM zmm_t_bdy_irs_h
*            INTO @DATA(lv_sutas)
*            WHERE irs_no EQ @ls_deep-irsno.
*        ENDIF.
*
*        IF lv_sutas EQ abap_false.
*
*          lv_vbeln = |{ ls_deep-vbelnva ALPHA = IN }|.
*
*          IF lt_product_items IS NOT INITIAL.
*            IF lv_vbeln IS INITIAL.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Ürün iadeleri için ZBIS referans siparişi zorunludur'.
*            ENDIF.
*
*            SELECT SINGLE auart
*              FROM vbak
*              WHERE vbeln = @lv_vbeln
*              INTO @DATA(lv_auart).
*            IF sy-subrc <> 0 OR lv_auart <> gc_auart_return.
*              SELECT SINGLE @abap_true
*                FROM zmm_t_bdy_irs_h
*                INTO @DATA(lv_sutas_iade)
*                WHERE log_uid = @lv_log_uid
*                  AND sutas   = @abap_true.
*              IF lv_sutas_iade EQ space.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = |Referans sipariş { lv_vbeln } bir ZBIS iade siparişi değildir|.
*              ENDIF.
*            ENDIF.
*
*            SELECT matnr, kwmeng, vrkme
*              FROM vbap
*              WHERE vbeln = @lv_vbeln
*              INTO TABLE @DATA(lt_reference_qty).
*
*            LOOP AT lt_reference_qty ASSIGNING FIELD-SYMBOL(<reference_qty>).
*              ASSIGN lt_backend_expected[
*                vbeln = lv_vbeln
*                matnr = <reference_qty>-matnr ]
*                TO FIELD-SYMBOL(<backend_expected>).
*              IF sy-subrc <> 0.
*                INSERT VALUE #(
*                  vbeln = lv_vbeln
*                  matnr = <reference_qty>-matnr
*                  meins = <reference_qty>-vrkme
*                  menge = <reference_qty>-kwmeng )
*                  INTO TABLE lt_backend_expected.
*              ELSE.
*                <backend_expected>-menge =
*                  <backend_expected>-menge + <reference_qty>-kwmeng.
*              ENDIF.
*            ENDLOOP.
*
*            LOOP AT lt_product_items ASSIGNING FIELD-SYMBOL(<product>).
*              ASSIGN lt_backend_expected[
*                vbeln = lv_vbeln
*                matnr = CONV matnr( <product>-matnr ) ]
*                TO <backend_expected>.
*              IF sy-subrc <> 0.
*                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                  EXPORTING
*                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                    message = |Malzeme { <product>-matnr } sipariş { lv_vbeln } içinde bulunamadı|.
*              ENDIF.
*
*              <product>-mengesiparis = <backend_expected>-menge.
*              <product>-meins        = <backend_expected>-meins.
*
*              READ TABLE ls_deep-toitems ASSIGNING <item>
*                WITH KEY posnr = <product>-posnr
*                         matnr = <product>-matnr.
*              IF sy-subrc = 0.
*                <item>-mengesiparis = <product>-mengesiparis.
*                <item>-meins        = <product>-meins.
*              ENDIF.
*            ENDLOOP.
*
*            "İade nedenleri tekrar etkinleştirilecekse yalnız ürünler gönderilmelidir.
*            "update_return_reasons(
*            "  iv_vbeln = lv_vbeln
*            "  it_items = lt_product_items ).
*          ENDIF.
*
*          IF lt_payload_deposits IS NOT INITIAL.
*            lt_confirmed_deposits = load_deposit_draft(
*              iv_log_uid        = lv_log_uid
*              it_expected_items = lt_payload_deposits ).
*            DELETE lt_payload_deposits WHERE mengesayim EQ 0.
*            DELETE lt_confirmed_deposits WHERE mengesayim EQ 0.
*            IF lt_confirmed_deposits IS NOT INITIAL.
***        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***          EXPORTING
***            textid  = /iwbep/cx_mgw_busi_exception=>business_error
***            message = 'Depozito taslağı bulunamadı. Depozito sayımını yeniden kaydedin'.
**      ENDIF.
*
*              lv_new_zdai = create_deposit_order(
*                iv_log_uid  = lv_log_uid
*                iv_plasiyer = CONV kunnr( ls_deep-plasiyer )
*                iv_lgort    = CONV lgort_d( ls_deep-lgort )
*                iv_irs_no   = CONV bstkd( ls_deep-irsno )
*                iv_irs_tar  = lv_irs_tar
*                it_items    = lt_confirmed_deposits ).
*            ENDIF.
*          ENDIF.
*
*          IF lt_product_items IS NOT INITIAL.
*            lt_toitems = VALUE #(
*              FOR ls_product IN lt_product_items
*              ( log_uid = lv_log_uid
*                posnr   = ls_product-posnr ) ).
*
*            SELECT *
*              FROM zmm_t_bdy_irs_i
*              FOR ALL ENTRIES IN @lt_toitems
*              WHERE log_uid = @lt_toitems-log_uid
*                AND posnr   = @lt_toitems-posnr
*              INTO TABLE @DATA(lt_existing_log).
*
*            LOOP AT lt_product_items ASSIGNING <product>.
*              CLEAR ls_log_item.
*              READ TABLE lt_existing_log
*                WITH KEY log_uid = lv_log_uid
*                         posnr   = <product>-posnr
*                INTO DATA(ls_existing_log).
*              IF sy-subrc = 0.
*                MOVE-CORRESPONDING ls_existing_log TO ls_log_item.
*              ENDIF.
*
*              ls_log_item-log_uid       = lv_log_uid.
*              ls_log_item-posnr         = <product>-posnr.
*              ls_log_item-matnr         = <product>-matnr.
*              ls_log_item-meins         = <product>-meins.
*              ls_log_item-menge_sayim   = <product>-mengesayim.
*              ls_log_item-menge_fire    = <product>-mengefire.
*              ls_log_item-menge_kalite  = <product>-mengekalite.
*              ls_log_item-menge_lansman  = <product>-mengelansman.
*              ls_log_item-menge_satilab = <product>-mengesatilab.
*              ls_log_item-is_depozito   = abap_false.
*              APPEND ls_log_item TO lt_log_items.
*            ENDLOOP.
*
*            MODIFY zmm_t_bdy_irs_i FROM TABLE @lt_log_items.
*            IF sy-subrc <> 0.
*              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*              IF lt_payload_deposits IS NOT INITIAL.
*                CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*                  EXPORTING
*                    mandt   = sy-mandt
*                    log_uid = lv_log_uid.
*              ENDIF.
*              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*                EXPORTING
*                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                  message = 'Ürün sayım kalemleri kaydedilemedi'.
*            ENDIF.
*          ENDIF.
*        ENDIF.
*
*        UPDATE zmm_t_bdy_irs_h
*          SET status = 'S',
*              ernam  = @sy-uname
*          WHERE log_uid = @lv_log_uid.
*        IF sy-subrc <> 0 OR sy-dbcnt = 0.
*          CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*          IF lt_payload_deposits IS NOT INITIAL.
*            CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*              EXPORTING
*                mandt   = sy-mandt
*                log_uid = lv_log_uid.
*          ENDIF.
*          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*            EXPORTING
*              textid  = /iwbep/cx_mgw_busi_exception=>business_error
*              message = 'İade sayım başlığı tamamlanamadı'.
*        ENDIF.
*
*
*
*
*        IF lt_payload_deposits IS NOT INITIAL.
*          UPDATE zmm_t_bdy_irs_dh
*            SET status = 'S',
*                aenam  = @sy-uname,
*                aedat  = @sy-datum,
*                aezet  = @sy-uzeit
*            WHERE log_uid = @lv_log_uid
*              AND zdai_vbeln <> @space.
*          IF sy-subrc <> 0 OR sy-dbcnt = 0.
*            CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*            CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*              EXPORTING
*                mandt   = sy-mandt
*                log_uid = lv_log_uid.
*            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*              EXPORTING
*                textid  = /iwbep/cx_mgw_busi_exception=>business_error
*                message = 'ZDAI işlemi tamamlandı olarak işaretlenemedi'.
*          ENDIF.
*        ENDIF.
*
*        CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*          EXPORTING
*            wait = abap_true.
*
*        IF lt_payload_deposits IS NOT INITIAL.
*          CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*            EXPORTING
*              mandt   = sy-mandt
*              log_uid = lv_log_uid.
*        ENDIF.
*
*        ls_deep-loguid  = lv_log_uid.
*        ls_deep-vbelnva = lv_vbeln.
*        LOOP AT ls_deep-toitems ASSIGNING <item>.
*          <item>-loguid = lv_log_uid.
*        ENDLOOP.
*
*        copy_data_to_ref(
*          EXPORTING
*            is_data = ls_deep
*          CHANGING
*            cr_data = er_deep_entity ).
*
***        io_data_provider->read_entry_data(
***          IMPORTING
***            es_data = ls_deep ).
***
***        lv_log_uid = ls_deep-loguid.
***        IF lv_log_uid IS INITIAL.
***          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***            EXPORTING
***              textid  = /iwbep/cx_mgw_busi_exception=>business_error
***              message = 'LogUid zorunludur'.
***        ENDIF.
***
***        IF ls_deep-irstar IS NOT INITIAL.
***          CONVERT TIME STAMP ls_deep-irstar
***            TIME ZONE sy-zonlo
***            INTO DATE lv_irs_tar
***                 TIME lv_irs_time.
***        ENDIF.
***
***        IF ls_deep-toitems IS INITIAL.
***          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***            EXPORTING
***              textid  = /iwbep/cx_mgw_busi_exception=>business_error
***              message = 'En az bir satır sayılmalıdır'.
***        ENDIF.
***
***        LOOP AT ls_deep-toitems ASSIGNING FIELD-SYMBOL(<item>).
***          IF <item>-matnr IS INITIAL.
***            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***              EXPORTING
***                textid  = /iwbep/cx_mgw_busi_exception=>business_error
***                message = 'Malzeme numarası eksik'.
***          ENDIF.
***
***          <item>-matnr = |{ <item>-matnr ALPHA = IN }|.
***
***          IF <item>-mengesayim < 0
***             OR <item>-mengefire < 0
***             OR <item>-mengekalite < 0
***             OR <item>-mengelansman < 0
***             OR <item>-mengesatilab < 0.
***            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***              EXPORTING
***                textid  = /iwbep/cx_mgw_busi_exception=>business_error
***                message = |Kalem { <item>-posnr }: negatif sayıya izin yok|.
***          ENDIF.
***
***          DATA(lv_component_total) =
***              <item>-mengefire
***            + <item>-mengekalite
***            + <item>-mengelansman
***            + <item>-mengesatilab.
***
***          IF <item>-mengesayim <> lv_component_total.
***            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***              EXPORTING
***                textid  = /iwbep/cx_mgw_busi_exception=>business_error
***                message = |Kalem { <item>-posnr }: sayım toplamı Fire + Kalite + Satılabilir toplamına eşit olmalıdır|.
***          ENDIF.
***        ENDLOOP.
***
***        lr_matnr = VALUE #(
***          FOR ls_item IN ls_deep-toitems
***          ( sign   = 'I'
***            option = 'EQ'
***            low    = CONV matnr( ls_item-matnr ) ) ).
***
***        SELECT matnr, mtart
***          FROM mara
***          WHERE matnr IN @lr_matnr
***          INTO TABLE @DATA(lt_submitted_materials).
***        SORT lt_submitted_materials BY matnr.
***
***        LOOP AT ls_deep-toitems ASSIGNING <item>.
***          READ TABLE lt_submitted_materials
***            WITH KEY matnr = <item>-matnr
***            BINARY SEARCH
***            INTO DATA(ls_material).
***          IF sy-subrc <> 0.
***            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***              EXPORTING
***                textid  = /iwbep/cx_mgw_busi_exception=>business_error
***                message = |Malzeme { <item>-matnr } mevcut değil|.
***          ENDIF.
***
***          <item>-isdepozito = xsdbool( ls_material-mtart = 'ZSTK' ).
***          IF <item>-isdepozito = abap_true.
***            APPEND <item> TO lt_payload_deposits.
***          ELSE.
***            APPEND <item> TO lt_product_items.
***          ENDIF.
***        ENDLOOP.
***
***
***        IF ls_deep-vbelnva IS INITIAL.
***          SELECT SINGLE @abap_true
***            FROM zmm_t_bdy_irs_h
***            INTO @DATA(lv_sutas)
***            WHERE irs_no EQ @ls_deep-irsno.
***        ENDIF.
***
***        IF lv_sutas EQ abap_false.
***
***          lv_vbeln = |{ ls_deep-vbelnva ALPHA = IN }|.
***
***          IF lt_product_items IS NOT INITIAL.
***            IF lv_vbeln IS INITIAL.
***              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***                EXPORTING
***                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
***                  message = 'Ürün iadeleri için ZBIS referans siparişi zorunludur'.
***            ENDIF.
***
***            SELECT SINGLE auart
***              FROM vbak
***              WHERE vbeln = @lv_vbeln
***              INTO @DATA(lv_auart).
***            IF sy-subrc <> 0 OR lv_auart <> gc_auart_return.
***              SELECT SINGLE @abap_true
***                FROM zmm_t_bdy_irs_h
***                INTO @DATA(lv_sutas_iade)
***                WHERE log_uid = @lv_log_uid
***                  AND sutas   = @abap_true.
***              IF lv_sutas_iade EQ space.
***                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***                  EXPORTING
***                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
***                    message = |Referans sipariş { lv_vbeln } bir ZBIS iade siparişi değildir|.
***              ENDIF.
***            ENDIF.
***
***            SELECT matnr, kwmeng, vrkme
***              FROM vbap
***              WHERE vbeln = @lv_vbeln
***              INTO TABLE @DATA(lt_reference_qty).
***
***            LOOP AT lt_reference_qty ASSIGNING FIELD-SYMBOL(<reference_qty>).
***              ASSIGN lt_backend_expected[
***                vbeln = lv_vbeln
***                matnr = <reference_qty>-matnr ]
***                TO FIELD-SYMBOL(<backend_expected>).
***              IF sy-subrc <> 0.
***                INSERT VALUE #(
***                  vbeln = lv_vbeln
***                  matnr = <reference_qty>-matnr
***                  meins = <reference_qty>-vrkme
***                  menge = <reference_qty>-kwmeng )
***                  INTO TABLE lt_backend_expected.
***              ELSE.
***                <backend_expected>-menge =
***                  <backend_expected>-menge + <reference_qty>-kwmeng.
***              ENDIF.
***            ENDLOOP.
***
***            LOOP AT lt_product_items ASSIGNING FIELD-SYMBOL(<product>).
***              ASSIGN lt_backend_expected[
***                vbeln = lv_vbeln
***                matnr = CONV matnr( <product>-matnr ) ]
***                TO <backend_expected>.
***              IF sy-subrc <> 0.
***                RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***                  EXPORTING
***                    textid  = /iwbep/cx_mgw_busi_exception=>business_error
***                    message = |Malzeme { <product>-matnr } sipariş { lv_vbeln } içinde bulunamadı|.
***              ENDIF.
***
***              <product>-mengesiparis = <backend_expected>-menge.
***              <product>-meins        = <backend_expected>-meins.
***
***              READ TABLE ls_deep-toitems ASSIGNING <item>
***                WITH KEY posnr = <product>-posnr
***                         matnr = <product>-matnr.
***              IF sy-subrc = 0.
***                <item>-mengesiparis = <product>-mengesiparis.
***                <item>-meins        = <product>-meins.
***              ENDIF.
***            ENDLOOP.
***
***            "İade nedenleri tekrar etkinleştirilecekse yalnız ürünler gönderilmelidir.
***            "update_return_reasons(
***            "  iv_vbeln = lv_vbeln
***            "  it_items = lt_product_items ).
***          ENDIF.
***
***          IF lt_payload_deposits IS NOT INITIAL.
***            lt_confirmed_deposits = load_deposit_draft(
***              iv_log_uid        = lv_log_uid
***              it_expected_items = lt_payload_deposits ).
***            DELETE lt_payload_deposits WHERE mengesayim EQ 0.
***            DELETE lt_confirmed_deposits WHERE mengesayim EQ 0.
***            IF lt_confirmed_deposits IS NOT INITIAL.
*****        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*****          EXPORTING
*****            textid  = /iwbep/cx_mgw_busi_exception=>business_error
*****            message = 'Depozito taslağı bulunamadı. Depozito sayımını yeniden kaydedin'.
****      ENDIF.
***
***              lv_new_zdai = create_deposit_order(
***                iv_log_uid  = lv_log_uid
***                iv_plasiyer = CONV kunnr( ls_deep-plasiyer )
***                iv_lgort    = CONV lgort_d( ls_deep-lgort )
***                iv_irs_no   = CONV bstkd( ls_deep-irsno )
***                iv_irs_tar  = lv_irs_tar
***                it_items    = lt_confirmed_deposits ).
***            ENDIF.
***          ENDIF.
***
***          IF lt_product_items IS NOT INITIAL.
***            lt_toitems = VALUE #(
***              FOR ls_product IN lt_product_items
***              ( log_uid = lv_log_uid
***                posnr   = ls_product-posnr ) ).
***
***            SELECT *
***              FROM zmm_t_bdy_irs_i
***              FOR ALL ENTRIES IN @lt_toitems
***              WHERE log_uid = @lt_toitems-log_uid
***                AND posnr   = @lt_toitems-posnr
***              INTO TABLE @DATA(lt_existing_log).
***
***            LOOP AT lt_product_items ASSIGNING <product>.
***              CLEAR ls_log_item.
***              READ TABLE lt_existing_log
***                WITH KEY log_uid = lv_log_uid
***                         posnr   = <product>-posnr
***                INTO DATA(ls_existing_log).
***              IF sy-subrc = 0.
***                MOVE-CORRESPONDING ls_existing_log TO ls_log_item.
***              ENDIF.
***
***              ls_log_item-log_uid       = lv_log_uid.
***              ls_log_item-posnr         = <product>-posnr.
***              ls_log_item-matnr         = <product>-matnr.
***              ls_log_item-meins         = <product>-meins.
***              ls_log_item-menge_sayim   = <product>-mengesayim.
***              ls_log_item-menge_fire    = <product>-mengefire.
***              ls_log_item-menge_kalite  = <product>-mengekalite.
***              ls_log_item-menge_lansman  = <product>-mengelansman.
***              ls_log_item-menge_satilab = <product>-mengesatilab.
***              ls_log_item-is_depozito   = abap_false.
***              APPEND ls_log_item TO lt_log_items.
***            ENDLOOP.
***
***            MODIFY zmm_t_bdy_irs_i FROM TABLE @lt_log_items.
***            IF sy-subrc <> 0.
***              CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
***              IF lt_payload_deposits IS NOT INITIAL.
***                CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
***                  EXPORTING
***                    mandt   = sy-mandt
***                    log_uid = lv_log_uid.
***              ENDIF.
***              RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***                EXPORTING
***                  textid  = /iwbep/cx_mgw_busi_exception=>business_error
***                  message = 'Ürün sayım kalemleri kaydedilemedi'.
***            ENDIF.
***          ENDIF.
***        ENDIF.
***
***        UPDATE zmm_t_bdy_irs_h
***          SET status = 'S',
***              ernam  = @sy-uname
***          WHERE log_uid = @lv_log_uid.
***        IF sy-subrc <> 0 OR sy-dbcnt = 0.
***          CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
***          IF lt_payload_deposits IS NOT INITIAL.
***            CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
***              EXPORTING
***                mandt   = sy-mandt
***                log_uid = lv_log_uid.
***          ENDIF.
***          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***            EXPORTING
***              textid  = /iwbep/cx_mgw_busi_exception=>business_error
***              message = 'İade sayım başlığı tamamlanamadı'.
***        ENDIF.
***
***
***
***
***        IF lt_payload_deposits IS NOT INITIAL.
***          UPDATE zmm_t_bdy_irs_dh
***            SET status = 'S',
***                aenam  = @sy-uname,
***                aedat  = @sy-datum,
***                aezet  = @sy-uzeit
***            WHERE log_uid = @lv_log_uid
***              AND zdai_vbeln <> @space.
***          IF sy-subrc <> 0 OR sy-dbcnt = 0.
***            CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
***            CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
***              EXPORTING
***                mandt   = sy-mandt
***                log_uid = lv_log_uid.
***            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
***              EXPORTING
***                textid  = /iwbep/cx_mgw_busi_exception=>business_error
***                message = 'ZDAI işlemi tamamlandı olarak işaretlenemedi'.
***          ENDIF.
***        ENDIF.
***
***        CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
***          EXPORTING
***            wait = abap_true.
***
***        IF lt_payload_deposits IS NOT INITIAL.
***          CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
***            EXPORTING
***              mandt   = sy-mandt
***              log_uid = lv_log_uid.
***        ENDIF.
***
***        ls_deep-loguid  = lv_log_uid.
***        ls_deep-vbelnva = lv_vbeln.
***        LOOP AT ls_deep-toitems ASSIGNING <item>.
***          <item>-loguid = lv_log_uid.
***        ENDLOOP.
***
***        copy_data_to_ref(
***          EXPORTING
***            is_data = ls_deep
***          CHANGING
***            cr_data = er_deep_entity ).
*
*      WHEN 'ReturnFactoryShipment'.
*
*        io_data_provider->read_entry_data( IMPORTING es_data = ls_return_factory ).
*
*        IF ls_return_factory-werks IS NOT INITIAL.
*          lv_werks = ls_return_factory-werks.
*        ENDIF.
*
*        IF lv_werks IS INITIAL.
*          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*            EXPORTING
*              textid  = /iwbep/cx_mgw_busi_exception=>business_error
*              message = 'Fabrika üretim yeri seçimi zorunludur'.
*        ENDIF.
*
*        IF ls_return_factory-lgort IS INITIAL.
*          ls_return_factory-lgort = '1900'.
*        ENDIF.
*        IF ls_return_factory-sourcelgort IS INITIAL.
*          ls_return_factory-sourcelgort =
*            derive_return_lgort( CONV lgort_d( ls_return_factory-lgort ) ).
*        ENDIF.
*        IF ls_return_factory-plakano IS INITIAL.
*          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*            EXPORTING
*              textid  = /iwbep/cx_mgw_busi_exception=>business_error
*              message = 'Plaka seçimi zorunludur'.
*        ENDIF.
*        IF ls_return_factory-loguid IS INITIAL.
*          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*            EXPORTING
*              textid  = /iwbep/cx_mgw_busi_exception=>business_error
*              message = 'LogUid zorunludur'.
*        ENDIF.
*        IF ls_return_factory-toitems IS INITIAL.
*          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*            EXPORTING
*              textid  = /iwbep/cx_mgw_busi_exception=>business_error
*              message = 'En az bir ürün sayılmalıdır'.
*        ENDIF.
*
*        LOOP AT ls_return_factory-toitems ASSIGNING FIELD-SYMBOL(<deep_item>).
*          IF <deep_item>-lgort IS INITIAL.
*            <deep_item>-lgort = ls_return_factory-lgort.
*          ENDIF.
*          IF <deep_item>-irstar IS INITIAL.
*            <deep_item>-irstar = ls_return_factory-irstar.
*          ENDIF.
*          IF <deep_item>-plakano IS INITIAL.
*            <deep_item>-plakano = ls_return_factory-plakano.
*          ENDIF.
*        ENDLOOP.
*
*        validate_return_factory_items(
*          EXPORTING
*            iv_werks        = gc_default_return_werks
*            iv_source_lgort = CONV lgort_d( ls_return_factory-sourcelgort )
*          CHANGING
*            ct_items        = ls_return_factory-toitems ).
*
*        post_return_factory_shipment(
*          is_deep = ls_return_factory
*          iv_werks = lv_werks ).
*
*        copy_data_to_ref(
*          EXPORTING
*            is_data = ls_return_factory
*          CHANGING
*            cr_data = er_deep_entity ).
*
**        io_data_provider->read_entry_data(
**         IMPORTING
**        es_data = ls_return_factory ).
**
**        IF ls_return_factory-werks IS NOT INITIAL.
**          lv_werks = ls_return_factory-werks.
**        ENDIF.
***
**        IF ls_return_factory-lgort IS INITIAL.
**          ls_return_factory-lgort = '1900'.
**        ENDIF.
**        IF ls_return_factory-sourcelgort IS INITIAL.
**          ls_return_factory-sourcelgort =
**            derive_return_lgort( CONV lgort_d( ls_return_factory-lgort ) ).
**        ENDIF.
**        IF ls_return_factory-plakano IS INITIAL.
**          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
**            EXPORTING
**              textid  = /iwbep/cx_mgw_busi_exception=>business_error
**              message = 'Plaka seçimi zorunludur'.
**        ENDIF.
**        IF ls_return_factory-toitems IS INITIAL.
**          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
**            EXPORTING
**              textid  = /iwbep/cx_mgw_busi_exception=>business_error
**              message = 'Kalemler backend tarafına ulaşmadı.'.
**        ENDIF.
**
**        LOOP AT ls_return_factory-toitems ASSIGNING FIELD-SYMBOL(<deep_item>).
**          IF <deep_item>-lgort IS INITIAL.
**            <deep_item>-lgort = ls_return_factory-lgort.
**          ENDIF.
**          IF <deep_item>-irstar IS INITIAL.
**            <deep_item>-irstar = ls_return_factory-irstar.
**          ENDIF.
**          IF <deep_item>-plakano IS INITIAL.
**            <deep_item>-plakano = ls_return_factory-plakano.
**          ENDIF.
**        ENDLOOP.
**
**        validate_return_factory_items(
**          EXPORTING
**            iv_werks        = lv_werks
**            iv_source_lgort = CONV lgort_d( ls_return_factory-sourcelgort )
**          CHANGING
**            ct_items        = ls_return_factory-toitems ).
**
**        post_return_factory_shipment(
**          is_deep = ls_return_factory
**          iv_werks = lv_werks ).
**
**        copy_data_to_ref(
**          EXPORTING
**            is_data = ls_return_factory
**          CHANGING
**            cr_data = er_deep_entity ).
*
*    ENDCASE.
*  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Public Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->/IWBEP/IF_MGW_APPL_SRV_RUNTIME~CREATE_STREAM
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING(optional)
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING(optional)
* | [--->] IV_SOURCE_NAME                 TYPE        STRING(optional)
* | [--->] IS_MEDIA_RESOURCE              TYPE        TY_S_MEDIA_RESOURCE
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR(optional)
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH(optional)
* | [--->] IV_SLUG                        TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITY_C(optional)
* | [<---] ER_ENTITY                      TYPE REF TO DATA
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD /iwbep/if_mgw_appl_srv_runtime~create_stream.

  DATA: ls_photo       TYPE zmm_t_bdy_photo,
        lv_lpid        TYPE string,
        lv_filename    TYPE string,
        lv_slug        TYPE string,
        lv_photo_count TYPE i,
        lv_uuid_raw    TYPE sysuuid_x16, " DB için Raw ID
        lv_uuid_str    TYPE sysuuid_c32. " OData dönüşü için String ID
  DATA: ls_entity     TYPE zcl_zmm_bolge_depo_yon_mpc=>ts_platephoto.

  " 1. SLUG Header'ından Veriyi Oku (Frontend: LpId|FileName formatında göndermeli)
  lv_slug = iv_slug.

  " Slug boşsa hata
  IF lv_slug IS INITIAL.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Dosya bilgisi (Slug) okunamadı.'.
  ENDIF.

  " Slug'ı parçala: Örn "34TR123|resim.jpg" -> LpId ve Filename
  SPLIT lv_slug AT '|' INTO lv_lpid lv_filename.

  " 2. LİMİT KONTROLÜ (Max 5 Fotoğraf)
  SELECT COUNT(*) FROM zmm_t_bdy_photo
    INTO lv_photo_count
    WHERE lpid = lv_lpid.

  IF lv_photo_count >= 5.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = 'Bu plaka için maksimum 5 fotoğraf yükleyebilirsiniz.'.
  ENDIF.

  " 3. Yeni Kaydı Hazırla
  ls_photo-photo_id = cl_system_uuid=>create_uuid_x16_static( ). " Yeni GUID
  ls_photo-lpid     = lv_lpid.
  ls_photo-filename = lv_filename.
  ls_photo-mimetype = is_media_resource-mime_type. " Frontend'den gelen MimeType (image/jpeg vs)
  ls_photo-content  = is_media_resource-value.     " Binary Resim Datası
  ls_photo-erdat    = sy-datum.

  " 4. DB'ye Kaydet
  INSERT zmm_t_bdy_photo FROM ls_photo.
  IF sy-subrc <> 0.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        message = 'Fotoğraf veritabanına kaydedilemedi.'.
  ENDIF.

  " 5. Frontend'e Dönüş Yapısını Hazırla
*  ls_entity-photoid  = ls_photo-photo_id.
  TRY.
      cl_system_uuid=>convert_uuid_x16_static(
        EXPORTING
          uuid     = ls_photo-photo_id
        IMPORTING
          uuid_c32 = lv_uuid_str " String halini al
      ).

      " OData Entity yapısına String ID'yi ata
      ls_entity-photoid = lv_uuid_str.

    CATCH cx_uuid_error.
      " Çok nadir hata durumu
  ENDTRY.
  ls_entity-lpid     = ls_photo-lpid.
  ls_entity-filename = ls_photo-filename.
  ls_entity-mimetype = ls_photo-mimetype.

  copy_data_to_ref( EXPORTING is_data = ls_entity
                    CHANGING  cr_data = er_entity ).

ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Public Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->/IWBEP/IF_MGW_APPL_SRV_RUNTIME~EXECUTE_ACTION
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ACTION_NAME                 TYPE        STRING(optional)
* | [--->] IT_PARAMETER                   TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR(optional)
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_FUNC_IMPORT(optional)
* | [<---] ER_DATA                        TYPE REF TO DATA
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD /iwbep/if_mgw_appl_srv_runtime~execute_action.

  DATA: lo_general TYPE REF TO zmm_cl_bdy_general,
        ls_context TYPE zmm_cl_bdy_general=>ty_context.

  " Sınıf örneğini oluştur
  CREATE OBJECT lo_general.

  CASE iv_action_name.

      " -----------------------------------------------------------------
      " 1. Login
      " -----------------------------------------------------------------
    WHEN 'Login'.
      lo_general->login(
        EXPORTING
          it_parameter         = it_parameter
          io_message_container = mo_context->get_message_container( )
        IMPORTING
          es_data              = ls_context
      ).

      " Typed veriyi (ls_context) Gateway referansına (er_data) kopyala
      copy_data_to_ref(
        EXPORTING
          is_data = ls_context
        CHANGING
          cr_data = er_data
      ).

      " -----------------------------------------------------------------
      " 2. ForgotPassword
      " -----------------------------------------------------------------
    WHEN 'ForgotPassword'.
      lo_general->forgot_password(
        EXPORTING
          it_parameter         = it_parameter
          io_message_container = mo_context->get_message_container( )
        IMPORTING
          es_data              = ls_context
      ).

      copy_data_to_ref(
        EXPORTING
          is_data = ls_context
        CHANGING
          cr_data = er_data
      ).

      " -----------------------------------------------------------------
      " 3. VerifySMS
      " -----------------------------------------------------------------
    WHEN 'VerifySMS'.
      lo_general->verify_sms(
        EXPORTING
          it_parameter         = it_parameter
          io_message_container = mo_context->get_message_container( )
        IMPORTING
          es_data              = ls_context
      ).

      copy_data_to_ref(
        EXPORTING
          is_data = ls_context
        CHANGING
          cr_data = er_data
      ).

      " -----------------------------------------------------------------
      " 4. FinalizeGoodsReceipt (Veri dönüşü yok, işlem yapıyor)
      " -----------------------------------------------------------------
*      WHEN 'FinalizeGoodsReceipt'.
*        lo_general->finalize_goods_receipt(
*          EXPORTING
*            it_parameter = it_parameter
*        ).
*        " Bu metod geriye veri dönmüyor, HTTP 204 (No Content) veya success döner.

      " -----------------------------------------------------------------
      " 5. PostGoodsReceipt (Veri dönüşü yok, işlem yapıyor)
      " -----------------------------------------------------------------
    WHEN 'PostGoodsReceipt'.
      lo_general->post_goods_receipt(
        EXPORTING
          it_parameter = it_parameter
      ).

    WHEN 'UpdateShipmentAssignments'.

      lo_general->update_shipment_assignments(
        EXPORTING
          it_parameter = it_parameter
      ).

    WHEN 'SaveNoteGR'.

      lo_general->save_note_gr(
        EXPORTING
          it_parameter = it_parameter
      ).
    WHEN 'SaveNoteGI'.
      lo_general->save_note_gi(
        EXPORTING
          it_parameter = it_parameter
      ).
    WHEN 'UpdateIssueQuantity'.
      lo_general->update_issue_quantity(
        EXPORTING
          it_parameter = it_parameter
      ).

    WHEN 'PostGoodsIssue'.
      lo_general->post_goods_issue(
        EXPORTING
          it_parameter = it_parameter
      ).
    WHEN 'SaveReturnDepositDraft'.
      DATA(lv_log_uid_p) = VALUE #( it_parameter[
        name = 'LogUid' ]-value OPTIONAL ).
      DATA(lv_plasiyer_p) = VALUE #( it_parameter[
        name = 'Plasiyer' ]-value OPTIONAL ).
      DATA(lv_lgort_p) = VALUE #( it_parameter[
        name = 'Lgort' ]-value OPTIONAL ).
      DATA(lv_matnr_p) = VALUE #( it_parameter[
        name = 'Matnr' ]-value OPTIONAL ).
      DATA(lv_meins_p) = VALUE #( it_parameter[
        name = 'Meins' ]-value OPTIONAL ).
      DATA(lv_menge_siparis_p) = VALUE #( it_parameter[
        name = 'MengeSiparis' ]-value OPTIONAL ).
      DATA(lv_menge_sayim_p) = VALUE #( it_parameter[
        name = 'MengeSayim' ]-value OPTIONAL ).
      DATA(lv_is_external_p) = VALUE #( it_parameter[
        name = 'IsExternal' ]-value OPTIONAL ).
      DATA(lv_is_confirmed_p) = VALUE #( it_parameter[
        name = 'IsConfirmed' ]-value OPTIONAL ).
      DATA(lv_is_deleted_p) = VALUE #( it_parameter[
        name = 'IsDeleted' ]-value OPTIONAL ).

      TRANSLATE lv_is_external_p TO UPPER CASE.
      TRANSLATE lv_is_confirmed_p TO UPPER CASE.
      TRANSLATE lv_is_deleted_p TO UPPER CASE.

      save_return_deposit_draft(
        iv_log_uid       = CONV #( lv_log_uid_p )
        iv_plasiyer      = CONV #( lv_plasiyer_p )
        iv_lgort         = CONV #( lv_lgort_p )
        iv_matnr         = CONV #( lv_matnr_p )
        iv_meins         = CONV #( lv_meins_p )
        iv_menge_siparis = CONV #( lv_menge_siparis_p )
        iv_menge_sayim   = CONV #( lv_menge_sayim_p )
*        iv_is_external   = xsdbool( to_lower( lv_is_external_p ) = 'true' )
*        iv_is_confirmed  = xsdbool( to_lower( lv_is_confirmed_p ) = 'true' )
*        iv_is_deleted    = xsdbool( to_lower( lv_is_deleted_p ) = 'true' ) ).
      iv_is_external   = xsdbool(
        lv_is_external_p = 'TRUE'
        OR lv_is_external_p = 'X'
        OR lv_is_external_p = '1' )
      iv_is_confirmed  = xsdbool(
        lv_is_confirmed_p = 'TRUE'
        OR lv_is_confirmed_p = 'X'
        OR lv_is_confirmed_p = '1' )
      iv_is_deleted    = xsdbool(
        lv_is_deleted_p = 'TRUE'
        OR lv_is_deleted_p = 'X'
        OR lv_is_deleted_p = '1' ) ).
      RETURN.

    WHEN 'ApproveReturnFactoryShipment'.
      DATA(lv_factory_log_uid) = CONV sysuuid_c32( VALUE #(
        it_parameter[ name = 'LogUid' ]-value OPTIONAL ) ).
      DATA(lv_factory_snapshot_hash) = CONV string( VALUE #(
        it_parameter[ name = 'SnapshotHash' ]-value OPTIONAL ) ).

      DATA ls_factory_action_result TYPE ty_s_fsh_action_result.

      approve_factory_shipment(
        EXPORTING
          iv_log_uid       = lv_factory_log_uid
          iv_snapshot_hash = lv_factory_snapshot_hash
        IMPORTING
          es_result        = ls_factory_action_result ).
      copy_data_to_ref(
          EXPORTING
            is_data = ls_factory_action_result
          CHANGING
            cr_data = er_data ).
    WHEN 'RejectReturnFactoryShipment'.
      DATA ls_rej_result TYPE ty_s_fsh_action_result.
      DATA(lv_rejection_loguid) = CONV sysuuid_c32( VALUE #(
        it_parameter[ name = 'LogUid' ]-value OPTIONAL ) ).
      DATA(lv_rejection_reason) = CONV string( VALUE #(
        it_parameter[ name = 'RejectionReason' ]-value OPTIONAL ) ).

      UPDATE zmm_t_bdy_fsh_h
      SET status           = 'R',
          last_step        = 'REJECTED',
          last_message     = @lv_rejection_reason,
          rejected_by      = @sy-uname,
          rejected_date    = @sy-datum,
          rejected_time    = @sy-uzeit,
          rejection_reason = @lv_rejection_reason,
          aenam            = @sy-uname,
          aedat            = @sy-datum,
          aezet            = @sy-uzeit
      WHERE log_uid  = @lv_rejection_loguid
        AND status   = 'P'
        AND last_step = 'WAIT_APPROVAL'.

      ls_rej_result-loguid  = lv_rejection_loguid.
      ls_rej_result-message = 'Sayım reddedildi'.

      copy_data_to_ref(
          EXPORTING
            is_data = ls_rej_result
          CHANGING
            cr_data = er_data ).
    WHEN OTHERS.
      super->/iwbep/if_mgw_appl_srv_runtime~execute_action(
        EXPORTING
          iv_action_name          = iv_action_name
          it_parameter            = it_parameter
          io_tech_request_context = io_tech_request_context
        IMPORTING
          er_data                 = er_data
      ).

  ENDCASE.

ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Public Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->/IWBEP/IF_MGW_APPL_SRV_RUNTIME~GET_EXPANDED_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING(optional)
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING(optional)
* | [--->] IV_SOURCE_NAME                 TYPE        STRING(optional)
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION(optional)
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER(optional)
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING(optional)
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH(optional)
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR(optional)
* | [--->] IV_FILTER_STRING               TYPE        STRING(optional)
* | [--->] IV_SEARCH_STRING               TYPE        STRING(optional)
* | [--->] IO_EXPAND                      TYPE REF TO /IWBEP/IF_MGW_ODATA_EXPAND(optional)
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ER_ENTITYSET                   TYPE REF TO DATA
* | [<---] ET_EXPANDED_CLAUSES            TYPE        STRING_TABLE
* | [<---] ET_EXPANDED_TECH_CLAUSES       TYPE        STRING_TABLE
* | [<---] ES_RESPONSE_CONTEXT            TYPE        TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD /iwbep/if_mgw_appl_srv_runtime~get_expanded_entityset.

  DATA: lo_general           TYPE REF TO zmm_cl_bdy_general,
        lt_deep_licenseplate TYPE zcl_zmm_bolge_depo_yon_dpc_ext=>tt_deep_licenseplate.


  DATA: lt_deep_entity TYPE zcl_zmm_bolge_depo_yon_dpc_ext=>tt_deep_gi_entity,
        ls_deep_entity LIKE LINE OF lt_deep_entity,
        ls_item        TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_issueitem.

  CREATE OBJECT lo_general.
  " Expand edilen set ismine göre kontrol
  IF iv_entity_set_name EQ 'LicensePlateSet'.

    " İş mantığını çağır
    lo_general->get_license_plate_set(
      EXPORTING
        it_filter_select_options = it_filter_select_options
      IMPORTING
        et_deep_licenceplate     = lt_deep_licenseplate
    ).

    " Dönen tabloyu Gateway'in beklediği referansa kopyala
    copy_data_to_ref(
      EXPORTING
        is_data = lt_deep_licenseplate
      CHANGING
        cr_data = er_entityset
    ).


    " 1. Entity Set Kontrolü
  ELSEIF iv_entity_set_name = 'IssuePackageSet'.

    " İş mantığını çağır
    lo_general->get_goods_issue_set(
      EXPORTING
        it_filter_select_options = it_filter_select_options
      IMPORTING
        et_deep_goods_issue     = lt_deep_entity
    ).

    " Dönen tabloyu Gateway'in beklediği referansa kopyala
    copy_data_to_ref(
      EXPORTING
        is_data = lt_deep_entity
      CHANGING
        cr_data = er_entityset
    ).
  ELSEIF iv_entity_set_name = 'ReturnHeaderSet'.
    DATA:
      lt_headers     TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>tt_returnheader,
      lt_items       TYPE ty_t_return_item,
      lt_deep_return TYPE ty_t_deep_return.


    load_return_data(
      EXPORTING
        it_filter_select_options = it_filter_select_options
      IMPORTING
        et_headers               = lt_headers
        et_items                 = lt_items ).

    SORT lt_items BY loguid posnr.

    LOOP AT lt_headers ASSIGNING FIELD-SYMBOL(<header>).
      APPEND INITIAL LINE TO lt_deep_return
        ASSIGNING FIELD-SYMBOL(<deep_return>).

      "Header properties are physical top-level components, matching
      "the ReturnHeader entity metadata expected by Gateway.
      <deep_return> = CORRESPONDING #( <header> ).

      LOOP AT lt_items ASSIGNING FIELD-SYMBOL(<item>)
        WHERE loguid = <header>-loguid.
        APPEND CORRESPONDING #( <item> )
          TO <deep_return>-toitems.
      ENDLOOP.
    ENDLOOP.

    "The navigation data is already included in the deep response.
    "Use the navigation property's technical name from the metadata.
    APPEND 'TOITEMS' TO et_expanded_tech_clauses.

    copy_data_to_ref(
      EXPORTING
        is_data = lt_deep_return
      CHANGING
        cr_data = er_entityset ).

    RETURN.
  ELSE.
*
*    "Do not swallow expanded requests for other entity sets.
*    super->/iwbep/if_mgw_appl_srv_runtime~get_expanded_entityset(
*      EXPORTING
*        iv_entity_name           = iv_entity_name
*        iv_entity_set_name       = iv_entity_set_name
*        iv_source_name           = iv_source_name
*        it_filter_select_options = it_filter_select_options
*        it_order                 = it_order
*        is_paging                = is_paging
*        it_key_tab               = it_key_tab
*        it_navigation_path       = it_navigation_path
*        io_expand                = io_expand
*        io_tech_request_context  = io_tech_request_context
*      IMPORTING
*        er_entityset             = er_entityset
*        et_expanded_clauses      = et_expanded_clauses
*        et_expanded_tech_clauses = et_expanded_tech_clauses
*        es_response_context      = es_response_context ).

  ENDIF.

ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Public Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->/IWBEP/IF_MGW_APPL_SRV_RUNTIME~GET_STREAM
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING(optional)
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING(optional)
* | [--->] IV_SOURCE_NAME                 TYPE        STRING(optional)
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR(optional)
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH(optional)
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITY(optional)
* | [<---] ER_STREAM                      TYPE REF TO DATA
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_ENTITY_CNTXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD /iwbep/if_mgw_appl_srv_runtime~get_stream.

  DATA: ls_stream  TYPE ty_s_media_resource,
        lo_general TYPE REF TO zmm_cl_bdy_general,
        lv_lpid    TYPE string,
        lv_docid   TYPE string.

  " 1. URL'den Key'leri oku (LpId ve DocId)
  DATA(lt_keys) = io_tech_request_context->get_keys( ).

  TRY.
*      lv_lpid  = lt_keys[ name = 'LpId' ]-value.
      lv_docid = lt_keys[ name = 'PHOTOID' ]-value.
    CATCH cx_sy_itab_line_not_found.
      lv_docid = lt_keys[ name = 'PhotoId' ]-value.
      RETURN.
  ENDTRY.

  CREATE OBJECT lo_general.

  " 2. Binary veriyi çek
  lo_general->get_photo_binary(
    EXPORTING
*      iv_lpid     = lv_lpid
      iv_docid    = lv_docid
    IMPORTING
      ev_content  = ls_stream-value
      ev_mimetype = ls_stream-mime_type
  ).

  " 3. Stream'i return et
  copy_data_to_ref(
    EXPORTING is_data = ls_stream
    CHANGING  cr_data = er_stream
  ).
ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->APPEND_LATEST_DEPOSIT_ITEMS
* +-------------------------------------------------------------------------------------------------+
* | [--->] IT_HEADERS                     TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC_EXT=>TT_RETURNHEADER
* | [<-->] CT_ITEMS                       TYPE        TY_T_RETURN_ITEM
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD append_latest_deposit_items.
    DATA:
      lt_plasiyer TYPE SORTED TABLE OF kunnr WITH UNIQUE KEY table_line,
      lt_source   TYPE ty_t_deposit_source,
      lv_posnr    TYPE posnr_va.

    LOOP AT it_headers ASSIGNING FIELD-SYMBOL(<header>)
      WHERE ( status = 'N' OR status = 'S' )
        AND shipmenttype <> 'MD'.
      INSERT CONV kunnr( |{ <header>-plasiyer ALPHA = IN }| )
        INTO TABLE lt_plasiyer.
      DATA(lv_guid) = <header>-loguid.
    ENDLOOP.

    IF lt_plasiyer IS INITIAL.
      RETURN.
    ENDIF.

    SELECT SINGLE @abap_true
      FROM zmm_t_bdy_irs_dh
      INTO @DATA(lv_exists)
      WHERE log_uid = @lv_guid.
    IF lv_exists EQ abap_true.
      DELETE FROM zmm_t_bdy_irs_dh
      WHERE log_uid = lv_guid.

      DELETE FROM zmm_t_bdy_irs_di
      WHERE log_uid = lv_guid.

      CLEAR lv_exists.
    ENDIF.



    IF lv_exists EQ abap_false.

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
        WHERE ( status = 'N' OR status = 'S' )
          AND shipmenttype <> 'MD'.
        DATA(lv_header_plasiyer) =
          CONV kunnr( |{ <header>-plasiyer ALPHA = IN }| ).

        READ TABLE lt_source
          WITH TABLE KEY plasiyer = lv_header_plasiyer
          INTO DATA(ls_source).
        IF sy-subrc <> 0.
          CONTINUE.
        ENDIF.

        DATA lt_qty TYPE ty_t_deposit_qty.
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
    ELSE.
      SELECT *
        FROM zmm_t_bdy_irs_di
        INTO TABLE @DATA(lt_depozit_kalem)
        WHERE log_uid = @lv_guid.
      IF sy-subrc EQ 0.
        lv_posnr = '900000'.
        SELECT matnr, maktx
          FROM makt
          INTO TABLE @DATA(lt_makt)
          FOR ALL ENTRIES IN @lt_depozit_kalem
          WHERE matnr EQ @lt_depozit_kalem-matnr
            AND spras EQ @sy-langu.
        LOOP AT lt_depozit_kalem INTO DATA(ls_kalem).

          lv_posnr = lv_posnr + 10.
          READ TABLE lt_makt
          INTO DATA(ls_makt)
          WITH KEY matnr = ls_kalem-matnr.

          lv_meins_out = ls_kalem-meins.
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
            loguid       = ls_kalem-log_uid
            posnr        = lv_posnr
            matnr        = ls_kalem-matnr
            maktx        = ls_makt-maktx
            meins        = lv_meins_out
            mengesiparis = ls_kalem-menge_siparis
            mengesayim   = ls_kalem-menge_sayim
            mengefire    = 0
            mengekalite  = 0
            mengesatilab = 0
            isdepozito   = abap_true )
            TO ct_items.
        ENDLOOP.
      ENDIF.
    ENDIF.

  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->APPROVE_FACTORY_SHIPMENT
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_LOG_UID                     TYPE        SYSUUID_C32
* | [--->] IV_SNAPSHOT_HASH               TYPE        STRING
* | [<---] ES_RESULT                      TYPE        TY_S_FSH_ACTION_RESULT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD approve_factory_shipment.
    TYPES:
      BEGIN OF ty_material_total,
        matnr        TYPE matnr,
        total_qty    TYPE menge_d,
        stock_qty    TYPE labst,
        count_qty    TYPE menge_d,
        remaining    TYPE menge_d,
        has_snapshot TYPE abap_bool,
      END OF ty_material_total,
      BEGIN OF ty_allocation,
        matnr    TYPE matnr,
        posnr    TYPE posnr,
        category TYPE char10,
        menge    TYPE menge_d,
        priority TYPE i,
      END OF ty_allocation.

    DATA: ls_header          TYPE zmm_t_bdy_fsh_h,
          lt_items           TYPE TABLE OF zmm_t_bdy_fsh_i,
          lt_material_total  TYPE SORTED TABLE OF ty_material_total
                               WITH UNIQUE KEY matnr,
          lt_allocation      TYPE TABLE OF ty_allocation,
          lr_matnr           TYPE RANGE OF matnr,
          lv_snapshot_source TYPE string,
          lv_snapshot_hash   TYPE string,
          lv_issue_qty       TYPE menge_d,
          lv_message         TYPE bapi_msg.

    FIELD-SYMBOLS: <material_total> TYPE ty_material_total,
                   <allocation>     TYPE ty_allocation.

    CLEAR es_result.

    IF iv_log_uid IS INITIAL OR iv_snapshot_hash IS INITIAL.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'LogUid ve SnapshotHash zorunludur'.
    ENDIF.

    CALL FUNCTION 'ENQUEUE_EZMM_T_BDY_FSH'
      EXPORTING
        mandt          = sy-mandt
        log_uid        = iv_log_uid
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

    SELECT SINGLE *
      FROM zmm_t_bdy_fsh_h
      INTO @ls_header
      WHERE log_uid = @iv_log_uid.
    IF sy-subrc <> 0.
      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
        EXPORTING
          mandt   = sy-mandt
          log_uid = iv_log_uid
          _scope  = '1'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Onaylanacak fabrika gönderim kaydı bulunamadı'.
    ENDIF.

    IF ls_header-status <> 'P' OR ls_header-last_step <> 'WAIT_APPROVAL'.
      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
        EXPORTING
          mandt   = sy-mandt
          log_uid = iv_log_uid
          _scope  = '1'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |Kayıt onay bekleyen durumda değil ({ ls_header-status }/{ ls_header-last_step })|.
    ENDIF.

    SELECT *
      FROM zmm_t_bdy_fsh_i
      INTO TABLE @lt_items
      WHERE log_uid = @iv_log_uid.
    IF lt_items[] IS INITIAL.
      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
        EXPORTING
          mandt   = sy-mandt
          log_uid = iv_log_uid
          _scope  = '1'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Onaylanacak fabrika gönderim kalemi bulunamadı'.
    ENDIF.

    LOOP AT lt_items ASSIGNING FIELD-SYMBOL(<item>).
      READ TABLE lt_material_total ASSIGNING <material_total>
        WITH TABLE KEY matnr = <item>-matnr.
      IF sy-subrc <> 0.
        INSERT VALUE #( matnr = <item>-matnr )
          INTO TABLE lt_material_total ASSIGNING <material_total>.
        APPEND VALUE #( sign = 'I' option = 'EQ' low = <item>-matnr )
          TO lr_matnr.
      ENDIF.

      IF <item>-category = 'FARK'.
        <material_total>-has_snapshot = abap_true.
        <material_total>-count_qty = <item>-sap_stock - <item>-menge.
        IF <material_total>-count_qty < 0.
          CLEAR <material_total>-count_qty.
        ENDIF.
        CONTINUE.
      ENDIF.

      <material_total>-total_qty = <material_total>-total_qty + <item>-menge.

      APPEND VALUE #(
        matnr    = <item>-matnr
        posnr    = <item>-posnr
        category = <item>-category
        menge    = <item>-menge
        priority = COND i(
          WHEN <item>-category CP 'SF-*' THEN 1
          WHEN <item>-category = 'URETIM' THEN 2
          WHEN <item>-category = 'FABLOJ' THEN 3
          ELSE 4 ) ) TO lt_allocation.
    ENDLOOP.

    SELECT mard~matnr,
           SUM( mard~labst ) AS labst
      FROM mard
      INNER JOIN mara ON mara~matnr = mard~matnr
                     AND mara~mtart <> 'ZSTK'
      WHERE mard~werks = @gc_default_return_werks
        AND mard~lgort = @ls_header-source_lgort
        AND mard~matnr IN @lr_matnr
      GROUP BY mard~matnr
      INTO TABLE @DATA(lt_stock).
    SORT lt_stock BY matnr.

    LOOP AT lt_material_total ASSIGNING <material_total>.
      READ TABLE lt_stock INTO DATA(ls_stock)
        WITH KEY matnr = <material_total>-matnr BINARY SEARCH.
      <material_total>-stock_qty = COND #(
        WHEN sy-subrc = 0 THEN ls_stock-labst ELSE 0 ).
      IF <material_total>-has_snapshot = abap_false.
        " Eski loglar icin kategori toplami fiziksel sayim kabul edilir.
        <material_total>-count_qty = <material_total>-total_qty.
      ENDIF.

      <material_total>-remaining = <material_total>-count_qty.
      IF <material_total>-remaining > <material_total>-stock_qty.
        <material_total>-remaining = <material_total>-stock_qty.
      ENDIF.
      IF <material_total>-remaining > <material_total>-total_qty.
        <material_total>-remaining = <material_total>-total_qty.
      ENDIF.

      lv_snapshot_source = |{ lv_snapshot_source }#{ <material_total>-matnr }| &&
                           |:{ <material_total>-stock_qty }:{ <material_total>-count_qty }|.
    ENDLOOP.

    TRY.
        cl_abap_message_digest=>calculate_hash_for_char(
          EXPORTING
            if_algorithm  = 'SHA256'
            if_data       = lv_snapshot_source
          IMPORTING
            ef_hashstring = lv_snapshot_hash ).
      CATCH cx_abap_message_digest.
        CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
          EXPORTING
            mandt   = sy-mandt
            log_uid = iv_log_uid
            _scope  = '1'.
        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
          EXPORTING
            textid  = /iwbep/cx_mgw_busi_exception=>business_error
            message = 'Stok kontrol anahtarı üretilemedi'.
    ENDTRY.

    IF to_upper( lv_snapshot_hash ) <> to_upper( iv_snapshot_hash ).
      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
        EXPORTING
          mandt   = sy-mandt
          log_uid = iv_log_uid
          _scope  = '1'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Stok bilgileri değişti. Lütfen ekranı yenileyerek tekrar kontrol ediniz'.
    ENDIF.

    SORT lt_allocation BY matnr priority posnr category.
    LOOP AT lt_allocation ASSIGNING <allocation>.
      READ TABLE lt_material_total ASSIGNING <material_total>
        WITH TABLE KEY matnr = <allocation>-matnr.
      lv_issue_qty = COND #(
        WHEN <material_total>-remaining <= 0 THEN 0
        WHEN <allocation>-menge < <material_total>-remaining
        THEN <allocation>-menge
        ELSE <material_total>-remaining ).
      <material_total>-remaining = <material_total>-remaining - lv_issue_qty.

      UPDATE zmm_t_bdy_fsh_i
        SET approval_stock = @<material_total>-stock_qty,
            menge_cikis    = @lv_issue_qty,
            aenam          = @sy-uname,
            aedat          = @sy-datum,
            aezet          = @sy-uzeit
        WHERE log_uid  = @iv_log_uid
          AND posnr    = @<allocation>-posnr
          AND category = @<allocation>-category
          AND matnr    = @<allocation>-matnr.
      IF sy-subrc <> 0.
        ROLLBACK WORK.
        CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
          EXPORTING
            mandt   = sy-mandt
            log_uid = iv_log_uid
            _scope  = '1'.
        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
          EXPORTING
            textid  = /iwbep/cx_mgw_busi_exception=>business_error
            message = 'Onaylanan çıkış miktarları kaydedilemedi'.
      ENDIF.
    ENDLOOP.

    UPDATE zmm_t_bdy_fsh_h
      SET status        = 'P',
          last_step     = 'QUEUED',
          last_message  = 'İşlem arka planda yürütülmek üzere sıraya alındı',
          approved_by   = @sy-uname,
          approved_date = @sy-datum,
          approved_time = @sy-uzeit,
          aenam         = @sy-uname,
          aedat         = @sy-datum,
          aezet         = @sy-uzeit
      WHERE log_uid  = @iv_log_uid
        AND status   = 'P'
        AND last_step = 'WAIT_APPROVAL'.
    IF sy-subrc <> 0.
      ROLLBACK WORK.
      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
        EXPORTING
          mandt   = sy-mandt
          log_uid = iv_log_uid
          _scope  = '1'.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Fabrika gönderimi onay kuyruğuna alınamadı'.
    ENDIF.

    COMMIT WORK AND WAIT.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid
        _scope  = '1'.

    schedule_return_factory_job( iv_log_uid = iv_log_uid ).

    SELECT SINGLE status, last_step, last_message, jobname, jobcount
      FROM zmm_t_bdy_fsh_h
      INTO (@es_result-status,
            @es_result-laststep,
            @es_result-message,
            @es_result-jobname,
            @es_result-jobcount)
      WHERE log_uid = @iv_log_uid.
    es_result-loguid = iv_log_uid.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->ASSIGNEDOFFICERS_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_ASSIGNEDOFFICER
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD assignedofficers_get_entityset.

  DATA: lr_shipment TYPE RANGE OF zsd_packhdr-pckno,
        ls_shipment LIKE LINE OF lr_shipment,
        ls_entity   LIKE LINE OF et_entityset,
        lt_log      TYPE TABLE OF zmm_t_bdy_assign,
        ls_log      TYPE zmm_t_bdy_assign.

  DATA: lt_filter_select_options TYPE /iwbep/t_mgw_select_option,
        ls_filter_so             TYPE /iwbep/s_mgw_select_option,
        ls_so                    TYPE /iwbep/s_cod_select_option.

  " ---------------------------------------------------------
  " 1. Filtreleri Okuma (Mevcut Kodunuz)
  " ---------------------------------------------------------
  lt_filter_select_options = io_tech_request_context->get_filter( )->get_filter_select_options( ).

  " ShipmentId Filtresi
  READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'ShipmentId'.
  IF sy-subrc = 0.
    LOOP AT ls_filter_so-select_options INTO ls_so.
      ls_shipment-sign   = ls_so-sign.
      ls_shipment-option = ls_so-option.
      ls_shipment-low    = ls_so-low.
      ls_shipment-high   = ls_so-high.
      APPEND ls_shipment TO lr_shipment.
    ENDLOOP.
  ENDIF.

  DATA: lr_vstel TYPE RANGE OF vstel,
        ls_vstel LIKE LINE OF lr_vstel,
        lr_wadat TYPE RANGE OF wadat_ist,
        ls_wadat LIKE LINE OF lr_wadat.

  " WarehouseNum (VSTEL) Filtresi
  READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'WarehouseNum'.
  IF sy-subrc <> 0.
    READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'WAREHOUSENUM'.
  ENDIF.
  IF sy-subrc = 0.
    LOOP AT ls_filter_so-select_options INTO ls_so.
      ls_vstel-sign   = ls_so-sign.
      ls_vstel-option = ls_so-option.
      ls_vstel-low    = ls_so-low.
      ls_vstel-high   = ls_so-high.
      APPEND ls_vstel TO lr_vstel.
    ENDLOOP.
  ENDIF.

  " ShipmentDate (WADAT_IST) Filtresi
  READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'ShipmentDate'.
  IF sy-subrc <> 0.
    READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'SHIPMENTDATE'.
  ENDIF.
  IF sy-subrc = 0.
    LOOP AT ls_filter_so-select_options INTO ls_so.
      ls_wadat-sign   = ls_so-sign.
      ls_wadat-option = ls_so-option.
      ls_wadat-low    = ls_so-low.
      ls_wadat-high   = ls_so-high.
      APPEND ls_wadat TO lr_wadat.
    ENDLOOP.
  ENDIF.

  " ---------------------------------------------------------
  " 2. ALGORİTMA BAŞLANGICI
  " ---------------------------------------------------------

  " Adım A: Filtrelere uyan ZSD_PACKHDR tablosundaki TÜM sevkiyatları çek
  " Böylece hem ataması olanları hem olmayanları elimize almış oluyoruz.
  SELECT pckno AS shipment_id, kunnr, vstel, wadat_ist
    FROM zsd_packhdr
    INTO TABLE @DATA(lt_all_shipments)
    WHERE pckno     IN @lr_shipment
      AND vstel     IN @lr_vstel
      AND wadat_ist IN @lr_wadat.

  IF lt_all_shipments IS NOT INITIAL.

    " Adım B: Bu sevkiyatlar içinde ZMM_T_BDY_ASSIGN tablosunda kaydı olanları bul (Gerçek Atamalar)
    SELECT shipment_id, employee_id
      FROM zmm_t_bdy_assign
      FOR ALL ENTRIES IN @lt_all_shipments
      WHERE shipment_id = @lt_all_shipments-shipment_id
        AND type        = '1'
      INTO TABLE @DATA(lt_existing_assign).

    SORT lt_existing_assign BY shipment_id.

    " Adım C: Ataması olmayanlar için hangi Kunnr/Vstel ikililerine bakmamız gerektiğini belirle
    DATA: lt_history_req TYPE TABLE OF zsd_packhdr, "Unique key tutucu
          ls_history_req LIKE LINE OF lt_history_req.
    SELECT SINGLE @abap_true
      FROM zmm_t_bdy_0005
      INTO @DATA(lv_history)
      WHERE vstel IN @lr_vstel.
    IF lv_history EQ abap_true.
      LOOP AT lt_all_shipments INTO DATA(ls_ship).
        " Bu shipment ID için atama var mı?
        READ TABLE lt_existing_assign TRANSPORTING NO FIELDS
          WITH KEY shipment_id = ls_ship-shipment_id BINARY SEARCH.

        IF sy-subrc <> 0.
          " Atama YOK. Tarihçeden bulmak için bu Kunnr ve Vstel'i not al.
          IF ls_ship-kunnr IS NOT INITIAL AND ls_ship-vstel IS NOT INITIAL.
            ls_history_req-kunnr = ls_ship-kunnr.
            ls_history_req-vstel = ls_ship-vstel.
            COLLECT ls_history_req INTO lt_history_req. "Unique kayıt oluşturur
          ENDIF.
        ENDIF.
      ENDLOOP.
    ENDIF.


    " Tarihçe verilerini tutacak yapı
    DATA: BEGIN OF ls_hist_data,
            employee_id TYPE zmm_t_bdy_assign-employee_id,
            kunnr       TYPE zsd_packhdr-kunnr,
            vstel       TYPE zsd_packhdr-vstel,
            wadat_ist   TYPE zsd_packhdr-wadat_ist,
          END OF ls_hist_data.
    DATA lt_history_found LIKE TABLE OF ls_hist_data.

    " Adım D: İhtiyaç duyulan Kunnr/Vstel ikilileri için geçmiş (tarihsel) atamaları bul
    IF lt_history_req IS NOT INITIAL.
      DATA(lv_datum) = lr_wadat[ 1 ]-low.
      SELECT a~employee_id, h~kunnr, h~vstel, h~wadat_ist
        FROM zsd_packhdr AS h
        INNER JOIN zmm_t_bdy_assign AS a ON a~shipment_id = h~pckno
        FOR ALL ENTRIES IN @lt_history_req
        WHERE h~kunnr     = @lt_history_req-kunnr
          AND h~vstel     = @lt_history_req-vstel
          AND h~wadat_ist < @lv_datum " Bugünden geriye (veya eşit)
*          AND h~wadat_ist <= @sy-datum  " Bugünden geriye (veya eşit)
          AND a~type      = '1'
        INTO TABLE @lt_history_found.

      " Her Kunnr/Vstel grubu için EN GÜNCEL (tarihi en büyük) kaydı en başa al
      SORT lt_history_found BY kunnr ASCENDING vstel ASCENDING wadat_ist DESCENDING.

      " Tekrarlıları sil (İlk kayıt en günceli olduğu için o kalır)
      DELETE ADJACENT DUPLICATES FROM lt_history_found COMPARING kunnr vstel.
    ENDIF.

    " ---------------------------------------------------------
    " 3. ÇIKTI OLUŞTURMA (OData Dönüşümü)
    " ---------------------------------------------------------
    DATA lv_tstamp TYPE timestamp.

    LOOP AT lt_all_shipments INTO ls_ship.
      CLEAR ls_entity.
      ls_entity-shipmentid   = ls_ship-shipment_id.
      ls_entity-warehousenum = ls_ship-vstel.

      " Tarih dönüşümü
      CONVERT DATE ls_ship-wadat_ist TIME '000000'
        INTO TIME STAMP lv_tstamp
        TIME ZONE 'UTC'.
      ls_entity-shipmentdate = lv_tstamp.

      " 1. Önce Gerçek Atamaya Bak
      READ TABLE lt_existing_assign INTO DATA(ls_exist)
        WITH KEY shipment_id = ls_ship-shipment_id BINARY SEARCH.

      IF sy-subrc = 0.
        " Gerçek atama bulundu, onu kullan
        ls_entity-employeeid = ls_exist-employee_id.
        APPEND ls_entity TO et_entityset.

      ELSE.
        " 2. Gerçek atama yoksa, Tarihçeden Öneri Bak
        READ TABLE lt_history_found INTO DATA(ls_hist)
          WITH KEY kunnr = ls_ship-kunnr
                   vstel = ls_ship-vstel
                   BINARY SEARCH.

        IF sy-subrc = 0.
          " Tarihçede bulundu, sanki atama varmış gibi employee_id'yi bas
          ls_entity-employeeid = ls_hist-employee_id.
          APPEND ls_entity TO et_entityset.

          ls_log-shipment_id = ls_entity-shipmentid.
          ls_log-type        = '1'.
          ls_log-employee_id = ls_entity-employeeid.
          ls_log-assign_date = sy-datum.
          ls_log-assign_time = sy-uzeit.
          APPEND ls_log TO lt_log.
          CLEAR ls_log.
        ENDIF.
      ENDIF.
    ENDLOOP.
    IF lt_log[] IS NOT INITIAL.
      MODIFY zmm_t_bdy_assign FROM TABLE lt_log.
    ENDIF.
  ENDIF.

ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->ASSIGNEDPERSONNE_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_ASSIGNEDPERSONNEL
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD assignedpersonne_get_entityset.

  " ---------------------------------------------------------------------
  " 1. DEĞİŞKEN TANIMLARI
  " ---------------------------------------------------------------------
  DATA: lr_shipment TYPE RANGE OF zsd_packhdr-pckno,
        ls_shipment LIKE LINE OF lr_shipment,
        ls_entity   LIKE LINE OF et_entityset,
        lt_log      TYPE TABLE OF zmm_t_bdy_assign,
        ls_log      TYPE zmm_t_bdy_assign.

  DATA: lt_filter_select_options TYPE /iwbep/t_mgw_select_option,
        ls_filter_so             TYPE /iwbep/s_mgw_select_option,
        ls_so                    TYPE /iwbep/s_cod_select_option.

  DATA: lr_vstel TYPE RANGE OF vstel,
        lr_wadat TYPE RANGE OF wadat_ist.

  DATA: lv_tstamp TYPE timestamp.

  " ---------------------------------------------------------------------
  " 2. FİLTRELERİ OKUMA
  " ---------------------------------------------------------------------
  lt_filter_select_options = io_tech_request_context->get_filter( )->get_filter_select_options( ).

  " ShipmentId
  READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'ShipmentId'.
  IF sy-subrc = 0.
    LOOP AT ls_filter_so-select_options INTO ls_so.
      ls_shipment-sign = ls_so-sign. ls_shipment-option = ls_so-option. ls_shipment-low = ls_so-low. ls_shipment-high = ls_so-high.
      APPEND ls_shipment TO lr_shipment.
    ENDLOOP.
  ENDIF.

  " WarehouseNum (Vstel)
  READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'WarehouseNum'.
  IF sy-subrc <> 0. READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'WAREHOUSENUM'. ENDIF.
  IF sy-subrc = 0.
    LOOP AT ls_filter_so-select_options INTO ls_so.
      APPEND INITIAL LINE TO lr_vstel ASSIGNING FIELD-SYMBOL(<fs_v>).
      <fs_v>-sign = ls_so-sign. <fs_v>-option = ls_so-option. <fs_v>-low = ls_so-low. <fs_v>-high = ls_so-high.
    ENDLOOP.
  ENDIF.

  " ShipmentDate (Wadat)
  READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'ShipmentDate'.
  IF sy-subrc <> 0. READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'SHIPMENTDATE'. ENDIF.
  IF sy-subrc = 0.
    LOOP AT ls_filter_so-select_options INTO ls_so.
      APPEND INITIAL LINE TO lr_wadat ASSIGNING FIELD-SYMBOL(<fs_w>).
      <fs_w>-sign = ls_so-sign. <fs_w>-option = ls_so-option. <fs_w>-low = ls_so-low. <fs_w>-high = ls_so-high.
    ENDLOOP.
  ENDIF.

  " ---------------------------------------------------------------------
  " 3. VERİ ÇEKME (ADAY SEVKİYATLAR)
  " ---------------------------------------------------------------------
  " Filtrelere uyan tüm aday sevkiyatları (ZSD_PACKHDR) çek
  SELECT pckno, kunnr, vstel, wadat_ist
    FROM zsd_packhdr
    INTO TABLE @DATA(lt_pack)
    WHERE pckno     IN @lr_shipment
      AND vstel     IN @lr_vstel
      AND wadat_ist IN @lr_wadat.

  IF lt_pack IS INITIAL.
    RETURN.
  ENDIF.

  " ---------------------------------------------------------------------
  " 4. MEVCUT ATAMALARI KONTROL ET
  " ---------------------------------------------------------------------
  " Bu sevkiyatlar için halihazırda veritabanında (ZMM_T_BDY_ASSIGN) atama var mı?
  SELECT shipment_id, employee_id
    FROM zmm_t_bdy_assign
    FOR ALL ENTRIES IN @lt_pack
    WHERE shipment_id = @lt_pack-pckno
      AND type        = '2'
    INTO TABLE @DATA(lt_assigned).

  SORT lt_assigned BY shipment_id.

  " ---------------------------------------------------------------------
  " 5. EKSİKLERİ BELİRLE VE TARİHÇE İÇİN GEREKLİ ANAHTARLARI TOPLA
  " ---------------------------------------------------------------------
  DATA: lt_needed_history TYPE TABLE OF zsd_packhdr, " Kunnr/Vstel unique listesi
        ls_needed         LIKE LINE OF lt_needed_history.
  SELECT SINGLE @abap_true
    FROM zmm_t_bdy_0005
    INTO @DATA(lv_history)
    WHERE vstel IN @lr_vstel.
  IF lv_history EQ abap_true.
    LOOP AT lt_pack INTO DATA(ls_p).
      " Bu shipment için atama var mı kontrol et
      READ TABLE lt_assigned TRANSPORTING NO FIELDS WITH KEY shipment_id = ls_p-pckno BINARY SEARCH.
      IF sy-subrc <> 0.
        " Atama YOK -> Tarihçeden (Geçmişten) öneri getirmek için bu Kunnr/Vstel ikilisini not et.
        IF ls_p-kunnr IS NOT INITIAL AND ls_p-vstel IS NOT INITIAL.
          ls_needed-kunnr = ls_p-kunnr.
          ls_needed-vstel = ls_p-vstel.
          COLLECT ls_needed INTO lt_needed_history.
        ENDIF.
      ENDIF.
    ENDLOOP.
  ENDIF.


  " ---------------------------------------------------------------------
  " 6. TARİHÇE VERİSİNİ ÇEK (SADECE GEREKLİ KUNNR/VSTEL İÇİN)
  " ---------------------------------------------------------------------
  DATA: BEGIN OF ls_hist,
          kunnr       TYPE zsd_packhdr-kunnr,
          vstel       TYPE zsd_packhdr-vstel,
          wadat_ist   TYPE zsd_packhdr-wadat_ist,
          pckno       TYPE zsd_packhdr-pckno,
          employee_id TYPE zmm_t_bdy_assign-employee_id,
        END OF ls_hist.
  DATA: lt_history LIKE TABLE OF ls_hist.

  IF lt_needed_history IS NOT INITIAL.
    DATA(lv_datum) = lr_wadat[ 1 ]-low.

    " Geçmiş kayıtları çekiyoruz (Bugün veya daha eski kayıtlar)
    SELECT h~kunnr, h~vstel, h~wadat_ist, h~pckno, a~employee_id
      FROM zsd_packhdr AS h
      INNER JOIN zmm_t_bdy_assign AS a ON h~pckno = a~shipment_id
      FOR ALL ENTRIES IN @lt_needed_history
      WHERE h~kunnr     = @lt_needed_history-kunnr
        AND h~vstel     = @lt_needed_history-vstel
        AND h~wadat_ist < @lv_datum
*        AND h~wadat_ist <= @sy-datum
        AND a~type      = '2'
      INTO TABLE @lt_history.

    " Kritik Adım: En yeniden eskiye doğru sırala ki 'en yakın' kayıtları bulabilelim
    SORT lt_history BY kunnr vstel wadat_ist DESCENDING pckno DESCENDING.
  ENDIF.

  " ---------------------------------------------------------------------
  " 7. SONUÇ LİSTESİNİ OLUŞTUR (ET_ENTITYSET)
  " ---------------------------------------------------------------------
  DATA: lt_suggestion_check TYPE TABLE OF zmm_t_bdy_assign-employee_id,
        lv_count            TYPE i.

  LOOP AT lt_pack INTO ls_p.
    CLEAR ls_entity.
    ls_entity-shipmentid   = ls_p-pckno.
    ls_entity-warehousenum = ls_p-vstel.

    " Tarih formatı dönüşümü
    CONVERT DATE ls_p-wadat_ist TIME '000000' INTO TIME STAMP lv_tstamp TIME ZONE 'UTC'.
    ls_entity-shipmentdate = lv_tstamp.

    " A) Gerçek Atama Kontrolü
    READ TABLE lt_assigned TRANSPORTING NO FIELDS WITH KEY shipment_id = ls_p-pckno BINARY SEARCH.
    IF sy-subrc = 0.
      " --> Veritabanında atama VAR: Olduğu gibi ekle
      LOOP AT lt_assigned INTO DATA(ls_a) WHERE shipment_id = ls_p-pckno.
        ls_entity-employeeid = ls_a-employee_id.
        APPEND ls_entity TO et_entityset.
      ENDLOOP.

    ELSE.
      " --> Veritabanında atama YOK: Algoritmayı Çalıştır (Öneri Getir)
      " İlgili Kunnr ve Vstel için geçmişe bak, en yakın 5 benzersiz çalışanı bul.

      lv_count = 0.
      CLEAR lt_suggestion_check.

      LOOP AT lt_history INTO ls_hist WHERE kunnr = ls_p-kunnr
                                        AND vstel = ls_p-vstel.

        " Aynı kişiyi mükerrer eklememek için kontrol
        READ TABLE lt_suggestion_check TRANSPORTING NO FIELDS WITH KEY table_line = ls_hist-employee_id.
        IF sy-subrc <> 0.
          " Listede yoksa ekle
          APPEND ls_hist-employee_id TO lt_suggestion_check.

          ls_entity-employeeid = ls_hist-employee_id.
          " Sanki bu shipment_id'ye aitmiş gibi ekliyoruz (Öneri)
          APPEND ls_entity TO et_entityset.

          lv_count = lv_count + 1.


          ls_log-shipment_id = ls_entity-shipmentid.
          ls_log-type        = '2'.
          ls_log-employee_id = ls_entity-employeeid.
          ls_log-assign_date = sy-datum.
          ls_log-assign_time = sy-uzeit.
          APPEND ls_log TO lt_log.
          CLEAR ls_log.

        ENDIF.

        " Max 5 kayıt kuralı
        IF lv_count >= 5.
          EXIT.
        ENDIF.
      ENDLOOP.

    ENDIF.
  ENDLOOP.
  IF lt_log[] IS NOT INITIAL.
    MODIFY zmm_t_bdy_assign FROM TABLE lt_log.
  ENDIF.
ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->CHECK_LANSMAN
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_MATNR                       TYPE        MATNR
* | [--->] IV_KUNNR                       TYPE        KUNNR
* | [<-()] RV_ERROR                       TYPE        CHAR1
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD check_lansman.

    DATA: lv_kanal          TYPE kunnr,
          lv_altkanal       TYPE kunnr,
          lv_has_new_fields TYPE abap_bool,
          lv_found          TYPE abap_bool,
          lt_where          TYPE TABLE OF string,
          dref              TYPE REF TO data.

    FIELD-SYMBOLS: <fs_son_iade>    TYPE any,
                   <fs_iade_tarihi> TYPE any.

    rv_error = abap_false.

    " 1. YENİ ALAN KONTROLÜ: 'KANAL' alanı mevcut sistemde (Canlı/Test) var mı?
    SELECT SINGLE @abap_true FROM dd03l INTO @lv_has_new_fields
      WHERE tabname   = 'ZEBA_T_SON_IADE'
        AND fieldname = 'KANAL'
        AND as4local  = 'A'. " Aktif versiyonu kontrol et

    " 2. DİNAMİK ÇALIŞMA ALANI (Work Area) OLUŞTURMA
    TRY.
        CREATE DATA dref TYPE ('ZEBA_T_SON_IADE').
        ASSIGN dref->* TO <fs_son_iade>.
      CATCH cx_sy_create_data_error.
        RETURN. " Eğer tablo sistemde hiç yoksa dump almamak için çıkış yap
    ENDTRY.

    " 3. KANAL/ALT KANAL TESPİTİ (Sadece yeni yapı varsa çalışsın, boşuna DB'ye gitmesin)
    IF lv_has_new_fields = abap_true.
      SELECT SINGLE b~kunn2 AS altkanal
        FROM knvp AS a
        INNER JOIN knvp AS b ON a~kunn2 EQ b~kunnr
                            AND b~parvw EQ 'KA'
        INTO @lv_altkanal
        WHERE a~kunnr EQ @iv_kunnr
          AND a~parvw EQ 'KR'.

      IF sy-subrc EQ 0.
        SELECT SINGLE kunn2 AS kanal
          FROM knvp
          INTO @lv_kanal
          WHERE kunnr EQ @lv_altkanal
            AND parvw EQ 'KK'.
      ENDIF.
    ENDIF.

    " 4. DİNAMİK OPEN SQL İLE TABLODAN OKUMA
    IF lv_has_new_fields = abap_true.
      " --- YENİ YAPI: KANAL ve ALT KANAL ile hiyerarşik sorgu ---

      " Hiyerarşi 1: Matnr + Kanal + Alt Kanal
      APPEND |MATNR = '{ iv_matnr }' AND KANAL = '{ lv_kanal }' AND ALT_KANAL = '{ lv_altkanal }'| TO lt_where.
      SELECT SINGLE * FROM ('ZEBA_T_SON_IADE') INTO @<fs_son_iade> WHERE (lt_where).

      IF sy-subrc = 0.
        lv_found = abap_true.
      ELSE.
        CLEAR lt_where.
        " Hiyerarşi 2: Matnr + Kanal
        APPEND |MATNR = '{ iv_matnr }' AND KANAL = '{ lv_kanal }'| TO lt_where.
        SELECT SINGLE * FROM ('ZEBA_T_SON_IADE') INTO @<fs_son_iade> WHERE (lt_where).

        IF sy-subrc = 0.
          lv_found = abap_true.
        ELSE.
          CLEAR lt_where.
          " Hiyerarşi 3: Matnr + Alt Kanal
          APPEND |MATNR = '{ iv_matnr }' AND ALT_KANAL = '{ lv_altkanal }'| TO lt_where.
          SELECT SINGLE * FROM ('ZEBA_T_SON_IADE') INTO @<fs_son_iade> WHERE (lt_where).
          IF sy-subrc = 0.
            lv_found = abap_true.
          ENDIF.
        ENDIF.
      ENDIF.

    ELSE.
      " --- ESKİ YAPI (CANLI SİSTEM): Sadece Matnr ile sorgu ---
      APPEND |MATNR = '{ iv_matnr }'| TO lt_where.
      SELECT SINGLE * FROM ('ZEBA_T_SON_IADE') INTO @<fs_son_iade> WHERE (lt_where).
      IF sy-subrc = 0.
        lv_found = abap_true.
      ENDIF.
    ENDIF.

    " 5. SONUÇ VE TARİH KONTROLÜ
    IF lv_found = abap_true.
      " Tablo yapısını dinamik tanımladığımız için doğrudan ls_son_iade-iade_tarihi diyemeyiz.
      " Alanı (Component) okuyup Field Symbol'e aktarıyoruz.
      ASSIGN COMPONENT 'IADE_TARIHI' OF STRUCTURE <fs_son_iade> TO <fs_iade_tarihi>.

      IF sy-subrc = 0 AND sy-datum GT <fs_iade_tarihi>.
        rv_error = abap_true. " Tarih geçmiş
      ENDIF.
    ELSE.
      rv_error = abap_true. " Kayıt bulunamadı
    ENDIF.

  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->CREATE_DEPOSIT_ORDER
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_LOG_UID                     TYPE        SYSUUID_C32
* | [--->] IV_PLASIYER                    TYPE        KUNNR
* | [--->] IV_LGORT                       TYPE        LGORT_D
* | [--->] IV_IRS_NO                      TYPE        BSTKD(optional)
* | [--->] IV_IRS_TAR                     TYPE        DATS(optional)
* | [--->] IT_ITEMS                       TYPE        TY_T_RETURN_ITEM
* | [<-()] RV_VBELN                       TYPE        VBELN_VA
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD create_deposit_order.
    DATA:
      lt_deposit_qty     TYPE ty_t_deposit_qty,
      ls_header_in       TYPE bapisdhd1,
      ls_header_inx      TYPE bapisdhd1x,
      lt_items_in        TYPE STANDARD TABLE OF bapisditm
                           WITH EMPTY KEY,
      lt_items_inx       TYPE STANDARD TABLE OF bapisditmx
                           WITH EMPTY KEY,
      lt_schedules_in    TYPE STANDARD TABLE OF bapischdl
                           WITH EMPTY KEY,
      lt_schedules_inx   TYPE STANDARD TABLE OF bapischdlx
                           WITH EMPTY KEY,
      lt_partners        TYPE STANDARD TABLE OF bapiparnr
                           WITH EMPTY KEY,
      lt_return          TYPE bapiret2_t,
      lv_source_vbeln    TYPE vbeln_va,
      lv_salesdocument   TYPE bapivbeln-vbeln,
      lv_vbtyp           TYPE vbtyp,
      lv_business_object TYPE oj_name,
      lv_create_subrc    TYPE sysubrc,
      lv_werks           TYPE werks_d,
      lv_posnr           TYPE posnr_va.

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
*      ELSE.
*        CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
*          EXPORTING
*            input          = <qty>-meins
*            language       = sy-langu
*          IMPORTING
*            output         = <qty>-meins
*          EXCEPTIONS
*            unit_not_found = 1
*            OTHERS         = 2.
*        IF sy-subrc <> 0.
*          <qty>-meins = ls_material-meins.
*        ENDIF.
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
      ls_header_in-collect_no  = iv_irs_no.
      ls_header_inx-purch_no_c = abap_true.
      ls_header_inx-collect_no = abap_true.
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
      SET plasiyer     = @lv_plasiyer,
          lgort         = @iv_lgort,
          source_vbeln  = @lv_source_vbeln,
          status        = 'P',
          aenam         = @sy-uname,
          aedat         = @sy-datum,
          aezet         = @sy-uzeit
      WHERE log_uid = @iv_log_uid.
    IF sy-dbcnt = 0.
      DATA: ls_irs_dh TYPE zmm_t_bdy_irs_dh.

      ls_irs_dh-mandt        = sy-mandt.
      ls_irs_dh-log_uid      = iv_log_uid.
      ls_irs_dh-plasiyer     = lv_plasiyer.
      ls_irs_dh-lgort        = iv_lgort.
      ls_irs_dh-source_vbeln = lv_source_vbeln.
      ls_irs_dh-status       = 'P'.
      ls_irs_dh-ernam        = sy-uname.
      ls_irs_dh-erdat        = sy-datum.
      ls_irs_dh-erzet        = sy-uzeit.

      INSERT zmm_t_bdy_irs_dh FROM ls_irs_dh.
*    INSERT zmm_t_bdy_irs_dh FROM VALUE #(
*      mandt        = sy-mandt
*      log_uid      = iv_log_uid
*      plasiyer     = lv_plasiyer
*      lgort        = iv_lgort
*      source_vbeln = lv_source_vbeln
*      status       = 'P'
*      ernam        = sy-uname
*      erdat        = sy-datum
*      erzet        = sy-uzeit ).
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
        SET status = 'E',
            aenam  = @sy-uname,
            aedat  = @sy-datum,
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
      SET zdai_vbeln = @rv_vbeln,
          status      = 'P',
          aenam       = @sy-uname,
          aedat       = @sy-datum,
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

*    DATA:
*      lt_deposit_qty   TYPE ty_t_deposit_qty,
*      ls_header_in     TYPE bapisdhd1,
*      ls_header_inx    TYPE bapisdhd1x,
*      lt_items_in      TYPE STANDARD TABLE OF bapisditm
*                         WITH EMPTY KEY,
*      lt_items_inx     TYPE STANDARD TABLE OF bapisditmx
*                         WITH EMPTY KEY,
*      lt_schedules_in  TYPE STANDARD TABLE OF bapischdl
*                         WITH EMPTY KEY,
*      lt_schedules_inx TYPE STANDARD TABLE OF bapischdlx
*                         WITH EMPTY KEY,
*      lt_partners      TYPE STANDARD TABLE OF bapiparnr
*                         WITH EMPTY KEY,
*      lt_return        TYPE bapiret2_t,
*      lv_source_vbeln  TYPE vbeln_va,
*      lv_salesdocument TYPE bapivbeln-vbeln,
*      lv_werks         TYPE werks_d,
*      lv_posnr         TYPE posnr_va.
*
*    LOOP AT it_items ASSIGNING FIELD-SYMBOL(<item>)
*      WHERE isdepozito = abap_true
*        AND mengesayim > 0.
*      DATA(lv_matnr) = CONV matnr( |{ <item>-matnr ALPHA = IN }| ).
*
*      ASSIGN lt_deposit_qty[ matnr = lv_matnr ]
*        TO FIELD-SYMBOL(<qty>).
*      IF sy-subrc <> 0.
*        INSERT VALUE #(
*          matnr = lv_matnr
*          meins = CONV meins( <item>-meins )
*          menge = <item>-mengesayim )
*          INTO TABLE lt_deposit_qty.
*      ELSE.
*        <qty>-menge = <qty>-menge + <item>-mengesayim.
*      ENDIF.
*    ENDLOOP.
*
*    IF lt_deposit_qty IS INITIAL.
*      RETURN.
*    ENDIF.
*
*    SELECT matnr, mtart, meins
*      FROM mara
*      FOR ALL ENTRIES IN @lt_deposit_qty
*      WHERE matnr = @lt_deposit_qty-matnr
*      INTO TABLE @DATA(lt_materials).
*    SORT lt_materials BY matnr.
*
*    LOOP AT lt_deposit_qty ASSIGNING <qty>.
*      READ TABLE lt_materials
*        WITH KEY matnr = <qty>-matnr
*        BINARY SEARCH
*        INTO DATA(ls_material).
*      IF sy-subrc <> 0 OR ls_material-mtart <> 'ZSTK'.
*        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*          EXPORTING
*            textid  = /iwbep/cx_mgw_busi_exception=>business_error
*            message = |{ <qty>-matnr } geçerli bir ZSTK depozito malzemesi değildir|.
*      ENDIF.
*
*      "Frontend ölçü birimi boş veya hatalıysa temel ölçü birimini kullan.
*      IF <qty>-meins IS INITIAL.
*        <qty>-meins = ls_material-meins.
*      ELSE.
*        CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
*          EXPORTING
*            input          = <qty>-meins
*            language       = sy-langu
*          IMPORTING
*            output         = <qty>-meins
*          EXCEPTIONS
*            unit_not_found = 1
*            OTHERS         = 2.
*        IF sy-subrc <> 0.
*          <qty>-meins = ls_material-meins.
*        ENDIF.
*      ENDIF.
*    ENDLOOP.
*
*    CALL FUNCTION 'ENQUEUE_EZMM_T_BDY_IRS_D'
*      EXPORTING
*        mandt          = sy-mandt
*        log_uid        = iv_log_uid
*      EXCEPTIONS
*        foreign_lock   = 1
*        system_failure = 2
*        OTHERS         = 3.
*    IF sy-subrc <> 0.
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = 'Bu iade sayımı başka bir işlem tarafından işleniyor'.
*    ENDIF.
*
*    "Timeout veya tekrar POST halinde aynı LogUid için ikinci ZDAI yaratma.
*    SELECT SINGLE zdai_vbeln
*      FROM zmm_t_bdy_irs_dh
*      WHERE log_uid = @iv_log_uid
*        AND status  = 'S'
*      INTO @rv_vbeln.
*    IF sy-subrc = 0 AND rv_vbeln IS NOT INITIAL.
*      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*        EXPORTING
*          mandt   = sy-mandt
*          log_uid = iv_log_uid.
*      RETURN.
*    ENDIF.
*
*    DATA(lv_plasiyer) = CONV kunnr( |{ iv_plasiyer ALPHA = IN }| ).
*    lv_source_vbeln = find_latest_deposit_order( lv_plasiyer ).
*
*    IF lv_source_vbeln IS NOT INITIAL.
*      SELECT SINGLE vkorg, vtweg, spart
*        FROM vbak
*        WHERE vbeln = @lv_source_vbeln
*        INTO @DATA(ls_sales_area).
*
*      SELECT SINGLE werks
*        FROM vbap
*        WHERE vbeln = @lv_source_vbeln
*          AND werks <> @space
*        INTO @lv_werks.
*
*      SELECT parvw, kunnr
*        FROM vbpa
*        WHERE vbeln = @lv_source_vbeln
*          AND posnr = '000000'
*        INTO TABLE @DATA(lt_source_partners).
*    ELSE.
*      "İlk ZDAI için satış alanını müşteri satış verisinden belirle.
*      SELECT SINGLE vkorg, vtweg, spart
*        FROM knvv
*        WHERE kunnr = @lv_plasiyer
*        INTO @ls_sales_area.
*
*      "Kaynak sipariş yoksa depo yerinin yalnız bir tesiste tanımlı olması
*      "şartıyla tesisi T001L üzerinden belirle.
*      SELECT DISTINCT werks
*        FROM t001l
*        WHERE lgort = @iv_lgort
*        INTO TABLE @DATA(lt_werks).
*      IF lines( lt_werks ) = 1.
*        lv_werks = lt_werks[ 1 ]-werks.
*      ENDIF.
*    ENDIF.
*
*    IF ls_sales_area-vkorg IS INITIAL
*       OR ls_sales_area-vtweg IS INITIAL
*       OR ls_sales_area-spart IS INITIAL.
*      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*        EXPORTING
*          mandt   = sy-mandt
*          log_uid = iv_log_uid.
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = |{ iv_plasiyer } için ZDAI satış alanı belirlenemedi|.
*    ENDIF.
*
*    IF lv_werks IS INITIAL.
*      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*        EXPORTING
*          mandt   = sy-mandt
*          log_uid = iv_log_uid.
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = |{ iv_plasiyer } için ZDAI tesisi belirlenemedi|.
*    ENDIF.
*
*    ls_header_in-doc_type   = gc_auart_deposit.
*    ls_header_in-sales_org  = ls_sales_area-vkorg.
*    ls_header_in-distr_chan = ls_sales_area-vtweg.
*    ls_header_in-division   = ls_sales_area-spart.
*
*    ls_header_inx-updateflag = 'I'.
*    ls_header_inx-doc_type   = abap_true.
*    ls_header_inx-sales_org  = abap_true.
*    ls_header_inx-distr_chan = abap_true.
*    ls_header_inx-division   = abap_true.
*
*    IF lt_source_partners IS INITIAL.
*      APPEND VALUE #(
*        partn_role = 'AG'
*        partn_numb = lv_plasiyer )
*        TO lt_partners.
*      APPEND VALUE #(
*        partn_role = 'WE'
*        partn_numb = lv_plasiyer )
*        TO lt_partners.
*    ELSE.
*      LOOP AT lt_source_partners ASSIGNING FIELD-SYMBOL(<partner>).
*        APPEND VALUE #(
*          partn_role = <partner>-parvw
*          partn_numb = <partner>-kunnr )
*          TO lt_partners.
*      ENDLOOP.
*    ENDIF.
*
*    lv_posnr = '000000'.
*    LOOP AT lt_deposit_qty ASSIGNING <qty>.
*      lv_posnr = lv_posnr + 10.
*
*      APPEND VALUE #(
*        itm_number = lv_posnr
*        material   = <qty>-matnr
*        target_qty = <qty>-menge
*        target_qu  = <qty>-meins
*        plant      = lv_werks
*        store_loc  = iv_lgort )
*        TO lt_items_in.
*
*      APPEND VALUE #(
*        itm_number = lv_posnr
*        updateflag = 'I'
*        material   = abap_true
*        target_qty = abap_true
*        target_qu  = abap_true
*        plant      = abap_true
*        store_loc  = abap_true )
*        TO lt_items_inx.
*
*      APPEND VALUE #(
*        itm_number = lv_posnr
*        sched_line = '0001'
*        req_qty    = <qty>-menge )
*        TO lt_schedules_in.
*
*      APPEND VALUE #(
*        itm_number = lv_posnr
*        sched_line = '0001'
*        updateflag = 'I'
*        req_qty    = abap_true )
*        TO lt_schedules_inx.
*    ENDLOOP.
*
*    UPDATE zmm_t_bdy_irs_dh
*      SET plasiyer     = @lv_plasiyer,
*          lgort         = @iv_lgort,
*          source_vbeln  = @lv_source_vbeln,
*          status        = 'P',
*          aenam         = @sy-uname,
*          aedat         = @sy-datum,
*          aezet         = @sy-uzeit
*      WHERE log_uid = @iv_log_uid.
*    IF sy-dbcnt = 0.
*      DATA ls_irs_dh TYPE zmm_t_bdy_irs_dh.
*      ls_irs_dh-mandt        = sy-mandt.
*      ls_irs_dh-log_uid      = iv_log_uid.
*      ls_irs_dh-plasiyer     = lv_plasiyer.
*      ls_irs_dh-lgort        = iv_lgort.
*      ls_irs_dh-source_vbeln = lv_source_vbeln.
*      ls_irs_dh-status       = 'P'.
*      ls_irs_dh-ernam        = sy-uname.
*      ls_irs_dh-erdat        = sy-datum.
*      ls_irs_dh-erzet        = sy-uzeit.
*
*      INSERT zmm_t_bdy_irs_dh FROM ls_irs_dh.
*    ENDIF.
*    IF sy-subrc <> 0.
*      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*        EXPORTING
*          mandt   = sy-mandt
*          log_uid = iv_log_uid.
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = 'ZDAI işlem kilidi oluşturulamadı'.
*    ENDIF.
*
*    CALL FUNCTION 'BAPI_SALESORDER_CREATEFROMDAT2'
*      EXPORTING
*        order_header_in     = ls_header_in
*        order_header_inx    = ls_header_inx
*      IMPORTING
*        salesdocument       = lv_salesdocument
*      TABLES
*        return              = lt_return
*        order_items_in      = lt_items_in
*        order_items_inx     = lt_items_inx
*        order_partners      = lt_partners
*        order_schedules_in  = lt_schedules_in
*        order_schedules_inx = lt_schedules_inx.
*
*    IF line_exists( lt_return[ type = 'E' ] )
*       OR line_exists( lt_return[ type = 'A' ] )
*       OR lv_salesdocument IS INITIAL.
*      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*      UPDATE zmm_t_bdy_irs_dh
*        SET status = 'E',
*            aenam  = @sy-uname,
*            aedat  = @sy-datum,
*            aezet  = @sy-uzeit
*        WHERE log_uid = @iv_log_uid.
*      COMMIT WORK AND WAIT.
*      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*        EXPORTING
*          mandt   = sy-mandt
*          log_uid = iv_log_uid.
*      raise_bapi_messages(
*        it_return       = lt_return
*        iv_default_text = 'Yeni ZDAI siparişi oluşturulamadı' ).
*    ENDIF.
*
*    rv_vbeln = lv_salesdocument.
*    UPDATE zmm_t_bdy_irs_dh
*      SET zdai_vbeln = @rv_vbeln,
*          status      = 'P',
**          status      = 'S',
*          aenam       = @sy-uname,
*          aedat       = @sy-datum,
*          aezet       = @sy-uzeit
*      WHERE log_uid = @iv_log_uid.
*    IF sy-subrc <> 0.
*      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
*        EXPORTING
*          mandt   = sy-mandt
*          log_uid = iv_log_uid.
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = 'Yaratılan ZDAI taslak kaydına bağlanamadı'.
*    ENDIF.
**    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
**      EXPORTING
**        mandt   = sy-mandt
**        log_uid = iv_log_uid.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->CREATE_RETURN_FACTORY_LOG
* +-------------------------------------------------------------------------------------------------+
* | [--->] IS_DEEP                        TYPE        TY_S_RETURN_FACTORY_DEEP
* | [<-()] RV_LOG_UID                     TYPE        SYSUUID_C32
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
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
  IF mv_factory_background = abap_true.
    RETURN.
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


  SELECT SINGLE log_uid
    FROM zmm_t_bdy_fsh_h
    INTO @DATA(lv_blocking_uid)
    WHERE lgort  = @is_deep-lgort
      AND log_uid <> @rv_log_uid
      AND status <> 'S'
      AND status <> 'R'.

  IF sy-subrc = 0.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
      EXPORTING
        mandt   = sy-mandt
        log_uid = rv_log_uid
        _scope  = '1'.
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = |Bu depo yeri için tamamlanmamış fabrika gönderimi bulunuyor: { lv_blocking_uid }|.
  ENDIF.


  SELECT SINGLE status, last_step
    FROM zmm_t_bdy_fsh_h
    WHERE log_uid = @rv_log_uid
    INTO (@DATA(lv_status), @DATA(lv_last_step)).
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

    DATA(lv_pending_message) = COND bapi_msg(
      WHEN lv_last_step = 'WAIT_APPROVAL'
      THEN 'Bu fabrika gönderimi onay bekliyor'
      ELSE 'Bu fabrika gönderimi işleniyor' ).

    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = lv_pending_message. "'Bu fabrika gönderimi işleniyor'.
  ELSEIF sy-subrc = 0 AND lv_status = 'E'.
    SELECT SINGLE @abap_true
      FROM zmm_t_bdy_fsh_i
      WHERE log_uid = @rv_log_uid
        AND ( ebeln <> @space
           OR mblnr_351 <> @space )
*           OR mblnr_311 <> @space
*           OR mblnr_702 <> @space )
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

  DATA ls_zmm_t_bdy_fsh_h TYPE zmm_t_bdy_fsh_h.
  ls_zmm_t_bdy_fsh_h = VALUE #(
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

  " Sonra tabloyu güncelliyoruz
  MODIFY zmm_t_bdy_fsh_h FROM ls_zmm_t_bdy_fsh_h.
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


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->DEPOSITGISET_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_DEPOSITGI
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD depositgiset_get_entityset.
    DATA: lt_filter_select_options TYPE /iwbep/t_mgw_select_option,
          ls_filter_so             TYPE /iwbep/s_mgw_select_option,
          ls_so                    TYPE /iwbep/s_cod_select_option.

    " 1. Filtreleri Manuel Oku (WarehouseNum)
    " ---------------------------------------------------------
    lt_filter_select_options = io_tech_request_context->get_filter( )->get_filter_select_options( ).

    READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'All'.
    IF sy-subrc NE 0.
      READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'ALL'.
    ENDIF.
    IF sy-subrc = 0.
      LOOP AT ls_filter_so-select_options INTO ls_so.
        DATA(lv_all) = ls_so-low.
        EXIT.
      ENDLOOP.
      IF lv_all EQ space.
        SELECT d~matnr,
               d~maktx,
               m~meins
          FROM zmm_t_bdy_0003 AS d
          INNER JOIN mara AS m
            ON m~matnr = d~matnr
          INTO TABLE @DATA(lt_deposit).
      ELSE.

        SELECT d~matnr,
               d~maktx,
               m~meins
          FROM zmm_t_bdy_0009 AS d
          INNER JOIN mara AS m
            ON m~matnr = d~matnr
          INTO TABLE @lt_deposit.

*        SELECT d~matnr,
*         m~maktx,
*         d~meins
*        FROM mara AS d
*        INNER JOIN makt AS m
*          ON m~matnr = d~matnr
*         AND m~spras = 'T'
*        INTO TABLE @lt_deposit
*        WHERE d~mtart EQ 'ZSTK'
*          AND d~mstav EQ @space
*          AND d~matkl IN ( 'S02', 'S04', 'S07' ).
      ENDIF.


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
    ENDIF.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->DERIVE_RETURN_LGORT
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_LGORT                       TYPE        LGORT_D
* | [<-()] RV_LGORT                       TYPE        LGORT_D
* +--------------------------------------------------------------------------------------</SIGNATURE>
  method DERIVE_RETURN_LGORT.
    DATA(lv_lgort) = COND lgort_d(
    WHEN iv_lgort IS INITIAL THEN '1900'
    ELSE iv_lgort ).

  rv_lgort = lv_lgort.
  IF lv_lgort CP '19*'.
    rv_lgort = |18{ lv_lgort+2 }|.
  ENDIF.
ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->EMPLOYEESET_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_EMPLOYEE
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD employeeset_get_entityset.

  DATA: lr_vstel  TYPE RANGE OF vstel,
        ls_vstel  LIKE LINE OF lr_vstel,
        ls_entity LIKE LINE OF et_entityset.

  DATA: lt_filter_select_options TYPE /iwbep/t_mgw_select_option,
        ls_filter_so             TYPE /iwbep/s_mgw_select_option,
        ls_so                    TYPE /iwbep/s_cod_select_option.

  " 1. Filtreleri Manuel Oku (WarehouseNum)
  " ---------------------------------------------------------
  lt_filter_select_options = io_tech_request_context->get_filter( )->get_filter_select_options( ).

  READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'WarehouseNum'.
  IF sy-subrc = 0.
    LOOP AT ls_filter_so-select_options INTO ls_so.
      ls_vstel-sign   = ls_so-sign.
      ls_vstel-option = ls_so-option.
      ls_vstel-low    = ls_so-low.
      ls_vstel-high   = ls_so-high.
      APPEND ls_vstel TO lr_vstel.
    ENDLOOP.
  ELSE.
    READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'WAREHOUSENUM'.
    IF sy-subrc = 0.
      LOOP AT ls_filter_so-select_options INTO ls_so.
        ls_vstel-sign   = ls_so-sign.
        ls_vstel-option = ls_so-option.
        ls_vstel-low    = ls_so-low.
        ls_vstel-high   = ls_so-high.
        APPEND ls_vstel TO lr_vstel.
      ENDLOOP.
    ENDIF.
  ENDIF.

  " Eğer depo numarası gelmediyse, tüm personeli çekmek performans sorunu yaratabilir.
  " Bu yüzden boş dönüyoruz (veya isterseniz devam edebilirsiniz).
  IF lr_vstel IS INITIAL.
    RETURN.
  ENDIF.

  " 2. Personel Verisini Çek
  " ---------------------------------------------------------
  " NOT: 'ZWM_EMPLOYEES' tablosunu kendi oluşturacağınız tablo ile değiştirin.
  " Alanlar: PERNR (Sicil), ENAME (Ad Soyad), WERKS/VSTEL (Depo)
*  DATA lr_txt TYPE RANGE OF zsts_t999-orgunit_text.
*  APPEND VALUE #( sign = 'I' option = 'CP' low = '*DEPO*' ) TO lr_txt.
**  SELECT employee_id AS pernr, employee_name AS ename, personnel_subarea
**    FROM zsts_t999
**    INTO TABLE @DATA(lt_employees)
**    WHERE personnel_subarea IN @lr_vstel
**      AND job_id            EQ '00001015'.
*  SELECT a~employee_id AS pernr, a~employee_name AS ename, a~personnel_subarea
*    FROM zsts_t999 AS a
**      INNER JOIN zmm_t_bdy_0004 AS b ON a~upper_node_id EQ b~upper_node_id
**                                    AND a~personnel_subarea EQ b~lgort
*    INTO TABLE @DATA(lt_employees)
*    WHERE a~personnel_subarea IN @lr_vstel
*      AND a~job_id            EQ '00001015'
*      AND a~orgunit_text      IN @lr_txt.
  SELECT sicilno AS pernr,
  sicilname AS ename,
*PASSWORD
  bolge AS personnel_subarea
*PERSONEL_TURU
        FROM zmm_t_bdy_0001
  INTO TABLE @DATA(lt_employees)
        WHERE bolge IN @lr_vstel.
*          AND personel_turu EQ 'D'.
  " 3. OData Yapısına Dönüştür
  " ---------------------------------------------------------
  LOOP AT lt_employees INTO DATA(ls_emp).
    CLEAR ls_entity.
    ls_entity-employeeid   = ls_emp-pernr. " Sicil No
    ls_entity-employeename = ls_emp-ename. " Ad Soyad
    ls_entity-warehousenum = ls_emp-personnel_subarea. " Ad Soyad
    " ls_entity-warehousenum = ... (Gerekirse doldurulabilir)

    APPEND ls_entity TO et_entityset.
  ENDLOOP.
  SORT et_entityset BY employeename.
ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->EXECUTE_FACTORY_SHIPMENT
* +-------------------------------------------------------------------------------------------------+
* | [--->] IS_DEEP                        TYPE        TY_S_RETURN_FACTORY_DEEP
* | [--->] IV_WERKS                       TYPE        WERKS_D
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  method EXECUTE_FACTORY_SHIPMENT.
" ----------------------------------------------------------------------
" POST_RETURN_FACTORY_SHIPMENT
" 1) Sayilan fire/kalite/lansman miktarlari kadar UB siparisi olusturulur.
" 2) BAPI_GOODSMVT_CREATE ile 18xx iade depodan PO referansli 351 cikis
"    yapilir ve irsaliye/form akisi tetiklenir.
" ----------------------------------------------------------------------


  TYPES:
    BEGIN OF ty_category,
      po_group     TYPE char1,
      category     TYPE char10,
      source_posnr TYPE posnr,
      material     TYPE matnr,
      quantity     TYPE menge_d,
      sap_stock    TYPE labst,
      uom          TYPE meins,
      zzgrund      TYPE ekpo-zzgrund,
      zzaltndn     TYPE ekpo-zzaltndn,
      zzsktar      TYPE ekpo-zzsktar,
    END OF ty_category,
    BEGIN OF ty_po_gm_item,
      po_item  TYPE ebelp,
      material TYPE matnr,
      quantity TYPE menge_d,
      uom      TYPE meins,
    END OF ty_po_gm_item.

  DATA:
    lv_log_uid          TYPE sysuuid_c32,
    ls_head             TYPE bapi2017_gm_head_01,
    ls_code             TYPE bapi2017_gm_code,
    lt_item             TYPE TABLE OF bapi2017_gm_item_create,
    lt_return           TYPE bapiret2_t,
    lv_mblnr            TYPE mblnr,
    lv_mjahr            TYPE mjahr,
    lv_message          TYPE bapi_msg,
    lv_bapi_message     TYPE string,
    lv_ebeln            TYPE bapimepoheader-po_number,
    lv_po_item          TYPE ebelp,
    lv_log_po_item      TYPE ebelp,
    lv_log_write_failed TYPE abap_bool,
    lt_category         TYPE TABLE OF ty_category,
    lt_log_items        TYPE TABLE OF zmm_t_bdy_fsh_i,
    ls_log_item         TYPE zmm_t_bdy_fsh_i,
    lt_po_gm_item       TYPE TABLE OF ty_po_gm_item,
    ls_poheader         TYPE bapimepoheader,
    ls_poheaderx        TYPE bapimepoheaderx,
    ls_poitem           TYPE bapimepoitem,
    ls_poitemx          TYPE bapimepoitemx,
    ls_poschedule       TYPE bapimeposchedule,
    ls_poschedulex      TYPE bapimeposchedulx,
    ls_extensionin      TYPE bapiparex,
    ls_te_mepoitem      TYPE bapi_te_mepoitem,
    ls_te_mepoitemx     TYPE bapi_te_mepoitemx,
    lt_poitem           TYPE TABLE OF bapimepoitem,
    lt_poitemx          TYPE TABLE OF bapimepoitemx,
    lt_poschedule       TYPE TABLE OF bapimeposchedule,
    lt_poschedulex      TYPE TABLE OF bapimeposchedulx,
    lt_extensionin      TYPE TABLE OF bapiparex,
    lt_po_group         TYPE STANDARD TABLE OF char1 WITH EMPTY KEY,
    lv_awkey            TYPE awkey,
    lv_awtyp            TYPE awtyp VALUE 'MKPF',
    lo_op               TYPE REF TO /dsl/es10_cl_op,
    ls_data             TYPE /dsl/es10_s023,
    ls_despatch         TYPE /dsl/es10_t010.

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
      zzgrund = '2' zzaltndn = '01' zzsktar = sy-datum )
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
      zzgrund = '1'  )
      TO lt_category.
    APPEND VALUE #(
      po_group = '4' category = 'SF-SIVI'
      source_posnr = <source_item>-posnr
      material = <source_item>-matnr
      quantity = <source_item>-mengesatisfiresivi
      sap_stock = <source_item>-sapstock
      uom = <source_item>-meins
      zzgrund = '1'  )
      TO lt_category.
    APPEND VALUE #(
      po_group = '4' category = 'SF-UHT'
      source_posnr = <source_item>-posnr
      material = <source_item>-matnr
      quantity = <source_item>-mengesatisfireuht
      sap_stock = <source_item>-sapstock
      uom = <source_item>-meins
      zzgrund = '1'  )
      TO lt_category.
    APPEND VALUE #(
      po_group = '4' category = 'SF-CAM'
      source_posnr = <source_item>-posnr
      material = <source_item>-matnr
      quantity = <source_item>-mengesatisfirecam
      sap_stock = <source_item>-sapstock
      uom = <source_item>-meins
      zzgrund = '1' )
      TO lt_category.

*/ fiorideki ekstra girişlerde toplatılan için mengelansman alanını kullanıyoruz!
*/ daha fazla ekstra giriş olursa buralar düzenlenecek

    APPEND VALUE #(
          po_group = '6' category = 'TOPLATILAN'
          source_posnr = <source_item>-posnr
          material = <source_item>-matnr
          quantity = <source_item>-mengelansman
          sap_stock = <source_item>-sapstock
          uom = <source_item>-meins
          zzgrund = '92'  )
          TO lt_category.

    " Fiziksel sayim kategori dagilimindan bagimsiz saklanir.
    " FARK satiri sifir olsa da snapshot isareti olarak loglanmalidir.
    DATA(lv_log_difference) =
      <source_item>-sapstock - <source_item>-mengesayim.
    APPEND VALUE #(
      category     = 'FARK'
      source_posnr = <source_item>-posnr
      material     = <source_item>-matnr
      quantity     = lv_log_difference
      sap_stock    = <source_item>-sapstock
      uom          = <source_item>-meins )
      TO lt_category.

  ENDLOOP.
  DELETE lt_category WHERE quantity <= 0 AND category <> 'FARK'.


  LOOP AT lt_category ASSIGNING FIELD-SYMBOL(<log_category>).
    ls_log_item = VALUE #(
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
    APPEND ls_log_item TO lt_log_items.
  ENDLOOP.

  IF mv_factory_background = abap_false.
    MODIFY zmm_t_bdy_fsh_i FROM TABLE lt_log_items.
    IF sy-subrc <> 0.
      lv_log_write_failed = abap_true.
    ENDIF.
  ENDIF.

  IF lv_log_write_failed = abap_true.
    lv_message = 'Fabrika gönderim kalem kayıtları kaydedilemedi'.
    save_return_factory_log(
      iv_log_uid      = lv_log_uid
      iv_status       = 'E'
      iv_last_message = lv_message ).
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid  = /iwbep/cx_mgw_busi_exception=>business_error
        message = CONV bapi_msg( lv_message ).
  ENDIF.

  IF mv_factory_log_only = abap_true.
    UPDATE zmm_t_bdy_fsh_h
      SET status       = 'P',
          last_step    = 'WAIT_APPROVAL',
          last_message = 'Fabrika gönderimi onaya gönderildi',
          aenam        = @sy-uname,
          aedat        = @sy-datum,
          aezet        = @sy-uzeit
      WHERE log_uid = @lv_log_uid.
    COMMIT WORK AND WAIT.

    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
      EXPORTING
        mandt   = sy-mandt
        log_uid = lv_log_uid
        _scope  = '1'.

    RETURN.
  ENDIF.

  COMMIT WORK AND WAIT.

  ls_head-pstng_date = sy-datum.
  ls_head-doc_date   = sy-datum.
  ls_head-pr_uname   = sy-uname.
  ls_head-header_txt = is_deep-plakano.

  lt_po_group = VALUE #( ( '2' ) ( '4' ) ( '6' ) ).
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
          message = CONV bapi_msg( lv_message ). "lv_message.
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
          message = CONV bapi_msg( lv_message ). "lv_message.
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
      CLEAR: ls_data, ls_despatch.
      SELECT SINGLE *
        FROM /dsl/es10_t010
        INTO @ls_despatch
      WHERE awtyp = @lv_awtyp
        AND awkey = @lv_awkey.
    IF sy-subrc = 0.
      MOVE-CORRESPONDING ls_despatch TO ls_data.
      print_despatch(
        p_type  = '2'
        is_data = ls_data ).
    ENDIF.
  ENDLOOP.

  save_return_factory_log(
    iv_log_uid = lv_log_uid
    iv_status  = 'S' ).


*  TYPES:
*    BEGIN OF ty_po_gm_item,
*      po_item  TYPE ebelp,
*      material TYPE matnr,
*      quantity TYPE menge_d,
*      uom      TYPE meins,
*    END OF ty_po_gm_item,
*    BEGIN OF ty_category,
*      name     TYPE string,
*      quantity TYPE menge_d,
*      zzgrund  TYPE ekpo-zzgrund,
*      zzaltndn TYPE ekpo-zzaltndn,
*    END OF ty_category.
*
*  DATA:
*    ls_head         TYPE bapi2017_gm_head_01,
*    ls_code         TYPE bapi2017_gm_code,
*    lt_item         TYPE TABLE OF bapi2017_gm_item_create,
*    lt_return       TYPE bapiret2_t,
*    lv_mblnr        TYPE mblnr,
*    lv_mjahr        TYPE mjahr,
*    lv_message      TYPE bapi_msg,
*    lv_bapi_message TYPE string,
*    lv_ebeln        TYPE bapimepoheader-po_number,
*    lv_po_item      TYPE ebelp,
*    lt_po_gm_item   TYPE TABLE OF ty_po_gm_item,
*    lt_category     TYPE TABLE OF ty_category.
*
*  FIELD-SYMBOLS:
*    <return> TYPE bapiret2.
*
*  IF is_deep-sourcelgort IS INITIAL OR is_deep-lgort IS INITIAL.
*    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*      EXPORTING
*        textid  = /iwbep/cx_mgw_busi_exception=>business_error
*        message = 'Kaynak ve hedef depo yeri belirlenemedi'.
*  ENDIF.
*
*  ls_head-pstng_date = sy-datum.
*  ls_head-doc_date   = sy-datum.
*  ls_head-pr_uname   = sy-uname.
*  ls_head-header_txt = is_deep-plakano.
*
*  "UB siparisi: sabit SAS degerleri ve fire/kalite/lansman kategori kalemleri.
*  DATA:
*    ls_poheader     TYPE bapimepoheader,
*    ls_poheaderx    TYPE bapimepoheaderx,
*    ls_poitem       TYPE bapimepoitem,
*    ls_poitemx      TYPE bapimepoitemx,
*    ls_poschedule   TYPE bapimeposchedule,
*    ls_poschedulex  TYPE bapimeposchedulx,
*    ls_extensionin  TYPE bapiparex,
*    ls_te_mepoitem  TYPE bapi_te_mepoitem,
*    ls_te_mepoitemx TYPE bapi_te_mepoitemx,
*    lt_poitem       TYPE TABLE OF bapimepoitem,
*    lt_poitemx      TYPE TABLE OF bapimepoitemx,
*    lt_poschedule   TYPE TABLE OF bapimeposchedule,
*    lt_poschedulex  TYPE TABLE OF bapimeposchedulx,
*    lt_extensionin  TYPE TABLE OF bapiparex.
*
*  ls_poheader-doc_type   = 'UB'.
*  ls_poheader-comp_code  = '1000'.
*  ls_poheader-purch_org  = '3000'.
*  ls_poheader-pur_group  = '070'.
*  ls_poheader-suppl_plnt = '1900'.
*  ls_poheader-ref_1      = is_deep-plakano.
*  ls_poheader-our_ref    = '041' .
*
*  ls_poheaderx-doc_type   =
*  ls_poheaderx-comp_code  =
*  ls_poheaderx-purch_org  =
*  ls_poheaderx-pur_group  =
*  ls_poheaderx-suppl_plnt =
*  ls_poheaderx-our_ref    =
*  ls_poheaderx-ref_1      = abap_true.
*
*  LOOP AT is_deep-toitems ASSIGNING FIELD-SYMBOL(<item_for_po>).
*    lt_category = VALUE #(
*      ( name = 'FIRE'
*        quantity = <item_for_po>-mengefire
*        zzgrund = '1'
*        zzaltndn = '09' )
*      ( name = 'KALITE'
*        quantity = <item_for_po>-mengekalite
*        zzgrund = '94' )
*      ( name = 'LANSMAN'
*        quantity = <item_for_po>-mengelansman
*        zzgrund = '91' ) ).
*
*    LOOP AT lt_category ASSIGNING FIELD-SYMBOL(<category>).
*      IF <category>-quantity <= 0.
*        CONTINUE.
*      ENDIF.
*
*      ADD 10 TO lv_po_item.
*
*      CLEAR ls_poitem.
*      ls_poitem-po_item    = lv_po_item.
*      ls_poitem-material   = <item_for_po>-matnr.
*      ls_poitem-plant      = iv_werks.
*      ls_poitem-stge_loc   = '2300'.
*      ls_poitem-quantity   = <category>-quantity.
*      ls_poitem-po_unit    = <item_for_po>-meins.
*      ls_poitem-item_cat   = '7'.
*      ls_poitem-trackingno = is_deep-plakano.
*      APPEND ls_poitem TO lt_poitem.
*
*      CLEAR ls_poitemx.
*      ls_poitemx-po_item    = lv_po_item.
*      ls_poitemx-po_itemx   =
*      ls_poitemx-material   =
*      ls_poitemx-plant      =
*      ls_poitemx-stge_loc   =
*      ls_poitemx-quantity   =
*      ls_poitemx-po_unit    =
*      ls_poitemx-item_cat   =
*      ls_poitemx-trackingno = abap_true.
*      APPEND ls_poitemx TO lt_poitemx.
*
*      CLEAR ls_poschedule.
*      ls_poschedule-po_item       = lv_po_item.
*      ls_poschedule-sched_line    = '0001'.
*      ls_poschedule-delivery_date = sy-datum.
*      ls_poschedule-quantity      = <category>-quantity.
*      APPEND ls_poschedule TO lt_poschedule.
*
*      CLEAR ls_poschedulex.
*      ls_poschedulex-po_item       = lv_po_item.
*      ls_poschedulex-sched_line    = '0001'.
*      ls_poschedulex-po_itemx      =
*      ls_poschedulex-sched_linex   =
*      ls_poschedulex-delivery_date =
*      ls_poschedulex-quantity      = abap_true.
*      APPEND ls_poschedulex TO lt_poschedulex.
*
*      CLEAR: ls_extensionin, ls_te_mepoitem.
*      ls_te_mepoitem-po_item    = lv_po_item.
*      ls_te_mepoitem-zzgrund    = <category>-zzgrund.
*      ls_te_mepoitem-zzaltndn   = <category>-zzaltndn.
*      ls_extensionin-structure  = 'BAPI_TE_MEPOITEM'.
*      ls_extensionin-valuepart1 = ls_te_mepoitem.
*      APPEND ls_extensionin TO lt_extensionin.
*
*      CLEAR: ls_extensionin, ls_te_mepoitemx.
*      ls_te_mepoitemx-po_item   = lv_po_item.
*      ls_te_mepoitemx-po_item   = lv_po_item.
*      ls_te_mepoitemx-zzgrund   = abap_true.
*      ls_te_mepoitemx-zzaltndn  = abap_true.
*      ls_extensionin-structure  = 'BAPI_TE_MEPOITEMX'.
*      ls_extensionin-valuepart1 = ls_te_mepoitemx.
*      APPEND ls_extensionin TO lt_extensionin.
*
*      APPEND VALUE #(
*        po_item  = lv_po_item
*        material = <item_for_po>-matnr
*        quantity = <category>-quantity
*        uom      = <item_for_po>-meins )
*        TO lt_po_gm_item.
*    ENDLOOP.
*  ENDLOOP.
*
*  IF lt_poitem IS NOT INITIAL.
*    CLEAR lt_return.
*
*    CALL FUNCTION 'BAPI_PO_CREATE1'
*      EXPORTING
*        poheader         = ls_poheader
*        poheaderx        = ls_poheaderx
*      IMPORTING
*        exppurchaseorder = lv_ebeln
*      TABLES
*        return           = lt_return
*        poitem           = lt_poitem
*        poitemx          = lt_poitemx
*        poschedule       = lt_poschedule
*        poschedulex      = lt_poschedulex
*        extensionin      = lt_extensionin.
*
*    CLEAR lv_message.
*    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
*      MESSAGE ID <return>-id
*        TYPE <return>-type
*        NUMBER <return>-number
*        WITH <return>-message_v1 <return>-message_v2
*             <return>-message_v3 <return>-message_v4
*        INTO lv_bapi_message.
*      IF lv_message IS INITIAL.
*        lv_message = lv_bapi_message.
*      ELSE.
*        lv_message = |{ lv_message } { lv_bapi_message }|.
*      ENDIF.
*    ENDLOOP.
*
*    IF lv_message IS NOT INITIAL OR lv_ebeln IS INITIAL.
*      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*      IF lv_message IS INITIAL.
*        lv_message = 'UB siparisi olusturulamadi'.
*      ENDIF.
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = lv_message.
*    ENDIF.
*
*    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*      EXPORTING
*        wait = abap_true.
*
*    "PO referansli 351: 18xx iade depodan fabrikaya cikis.
*    CLEAR:
*      ls_code,
*      lt_item,
*      lt_return,
*      lv_mblnr,
*      lv_mjahr.
*
*    ls_code-gm_code = '04'.
*
*    LOOP AT lt_po_gm_item ASSIGNING FIELD-SYMBOL(<po_gm_item>).
*      APPEND VALUE #(
*        material  = <po_gm_item>-material
*        plant     = '1900'
*        stge_loc  = is_deep-sourcelgort
*        move_type = '351'
*        move_plant = iv_werks
*        move_stloc = '2300'
*        entry_qnt = <po_gm_item>-quantity
*        entry_uom = <po_gm_item>-uom
*        po_number = lv_ebeln
*        po_item   = <po_gm_item>-po_item
*        )
*        TO lt_item.
*    ENDLOOP.
*
*    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
*      EXPORTING
*        goodsmvt_header  = ls_head
*        goodsmvt_code    = ls_code
*      IMPORTING
*        materialdocument = lv_mblnr
*        matdocumentyear  = lv_mjahr
*      TABLES
*        goodsmvt_item    = lt_item
*        return           = lt_return.
*
*    CLEAR lv_message.
*    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
*      MESSAGE ID <return>-id
*        TYPE <return>-type
*        NUMBER <return>-number
*        WITH <return>-message_v1 <return>-message_v2
*             <return>-message_v3 <return>-message_v4
*        INTO lv_bapi_message.
*      IF lv_message IS INITIAL.
*        lv_message = lv_bapi_message.
*      ELSE.
*        lv_message = |{ lv_message } { lv_bapi_message }|.
*      ENDIF.
*    ENDLOOP.
*
*    IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
*      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*      IF lv_message IS INITIAL.
*        lv_message = |{ lv_ebeln }: 351 cikis hareketi olusturulamadi|.
*      ENDIF.
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = lv_message.
*    ENDIF.
*
*    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*      EXPORTING
*        wait = abap_true.
*
*    DATA:
*      lv_awkey TYPE awkey,
*      lv_awtyp TYPE awtyp VALUE 'MKPF',
*      lo_op    TYPE REF TO /dsl/es10_cl_op,
*      ls_data  TYPE /dsl/es10_s023.
*
*    CREATE OBJECT lo_op.
*    lv_awkey = lv_mblnr && lv_mjahr.
*
*    CALL METHOD lo_op->send_document
*      EXPORTING
*        iv_awtyp = lv_awtyp
*        iv_awkey = lv_awkey.
*
*    WAIT UP TO 2 SECONDS.
*
*    SELECT SINGLE *
*      FROM /dsl/es10_t010
*      INTO @DATA(ls_t200)
*      WHERE awtyp = @lv_awtyp
*        AND awkey = @lv_awkey.
*
*    IF ls_t200 IS NOT INITIAL.
*      MOVE-CORRESPONDING ls_t200 TO ls_data.
*      me->print_despatch(
*        EXPORTING
*          p_type  = '2'
*          is_data = ls_data    " Giden İrsaliye ALV
*      ).
*    ENDIF.
*  ENDIF.
*
*  LOOP AT is_deep-toitems ASSIGNING FIELD-SYMBOL(<item>).
*    IF <item>-sapstock <= <item>-mengesayim.
*      CONTINUE.
*    ENDIF.
*
*    DATA(lv_difference) = <item>-sapstock - <item>-mengesayim.
*
*    IF lv_difference <= 0.
*      CONTINUE.
*    ENDIF.
*
*    CLEAR:
*      ls_code,
*      lt_item,
*      lt_return,
*      lv_mblnr,
*      lv_mjahr.
*
*    ls_code-gm_code = '04'.
*
*    APPEND VALUE #(
*      material   = <item>-matnr
*      plant      = '1900'
*      stge_loc   = is_deep-sourcelgort
*      move_plant = '1900'
*      move_stloc = is_deep-lgort
*      move_type  = gc_stock_transfer_bwart
*      entry_qnt  = lv_difference
*      entry_uom  = <item>-meins )
*      TO lt_item.
*
*    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
*      EXPORTING
*        goodsmvt_header  = ls_head
*        goodsmvt_code    = ls_code
*      IMPORTING
*        materialdocument = lv_mblnr
*        matdocumentyear  = lv_mjahr
*      TABLES
*        goodsmvt_item    = lt_item
*        return           = lt_return.
*
*    CLEAR lv_message.
*    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
*      MESSAGE ID <return>-id
*        TYPE <return>-type
*        NUMBER <return>-number
*        WITH <return>-message_v1 <return>-message_v2
*             <return>-message_v3 <return>-message_v4
*        INTO lv_bapi_message.
*      IF lv_message IS INITIAL.
*        lv_message = lv_bapi_message.
*      ELSE.
*        lv_message = |{ lv_message } { lv_bapi_message }|.
*      ENDIF.
*    ENDLOOP.
*
*    IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
*      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*      IF lv_message IS INITIAL.
*        lv_message =
*          |{ <item>-matnr ALPHA = OUT }: 311 transfer hareketi olusturulamadi|.
*      ENDIF.
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = lv_message.
*    ENDIF.
*
*    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*      EXPORTING
*        wait = abap_true.
*
*    CLEAR:
*      ls_code,
*      lt_item,
*      lt_return,
*      lv_mblnr,
*      lv_mjahr.
*
*    ls_code-gm_code = '03'.
*
*    APPEND VALUE #(
*      material  = <item>-matnr
*      plant     = '1900'
*      stge_loc  = is_deep-lgort
*      move_type = gc_inv_diff_bwart
*      entry_qnt = lv_difference
*      entry_uom = <item>-meins )
*      TO lt_item.
*
*    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
*      EXPORTING
*        goodsmvt_header  = ls_head
*        goodsmvt_code    = ls_code
*      IMPORTING
*        materialdocument = lv_mblnr
*        matdocumentyear  = lv_mjahr
*      TABLES
*        goodsmvt_item    = lt_item
*        return           = lt_return.
*
*    CLEAR lv_message.
*    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
*      MESSAGE ID <return>-id
*        TYPE <return>-type
*        NUMBER <return>-number
*        WITH <return>-message_v1 <return>-message_v2
*             <return>-message_v3 <return>-message_v4
*        INTO lv_bapi_message.
*      IF lv_message IS INITIAL.
*        lv_message = lv_bapi_message.
*      ELSE.
*        lv_message = |{ lv_message } { lv_bapi_message }|.
*      ENDIF.
*    ENDLOOP.
*
*    IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
*      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*      IF lv_message IS INITIAL.
*        lv_message =
*          |{ <item>-matnr ALPHA = OUT }: 702 sayim farki hareketi olusturulamadi|.
*      ENDIF.
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = lv_message.
*    ENDIF.
*
*    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*      EXPORTING
*        wait = abap_true.
*  ENDLOOP.
ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->FIND_LATEST_DEPOSIT_ORDER
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_PLASIYER                    TYPE        KUNNR
* | [<-()] RV_VBELN                       TYPE        VBELN_VA
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
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
*    DATA(lv_plasiyer) = |{ iv_plasiyer ALPHA = IN }|.

*    "VBUK-GBSTK <> C is the default active-order rule. Replace it if the
*    "productive process uses a custom approval/status field.
*    SELECT a~vbeln
*      FROM vbak AS a
*      INNER JOIN vbuk AS s
*        ON s~vbeln = a~vbeln
*      WHERE a~auart = @gc_auart_deposit
*        AND a~kunnr = @lv_plasiyer
*        AND s~gbstk <> 'C'
*      ORDER BY a~erdat DESCENDING,
*               a~erzet DESCENDING
*      INTO @rv_vbeln
*      UP TO 1 ROWS.
*    ENDSELECT.
*
*    IF rv_vbeln IS INITIAL.
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = |{ iv_plasiyer } plasiyeri için aktif ZDAI siparişi bulunamadı|.
*    ENDIF.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->ISSUEITEMSET_GET_ENTITY
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IO_REQUEST_OBJECT              TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITY(optional)
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITY(optional)
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [<---] ER_ENTITY                      TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TS_ISSUEITEM
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_ENTITY_CNTXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD issueitemset_get_entity.
    DATA(lt_keys) = io_tech_request_context->get_keys( ).
    DATA lv_pckno TYPE zsd_packhdr-pckno.
    DATA lv_matnr TYPE matnr.

    TRY.
        lv_pckno = lt_keys[ name = 'PackingNumber' ]-value.
        lv_matnr = lt_keys[ name = 'Material' ]-value.
      CATCH cx_sy_itab_line_not_found.
        lv_pckno = lt_keys[ name = 'PACKINGNUMBER' ]-value.
        lv_matnr = lt_keys[ name = 'MATERIAL' ]-value.
    ENDTRY.
    IF lv_pckno IS NOT INITIAL.
      DATA: lo_general               TYPE REF TO zmm_cl_bdy_general,
            lt_deep_entity           TYPE zcl_zmm_bolge_depo_yon_dpc_ext=>tt_deep_gi_entity,
            ls_deep_entity           LIKE LINE OF lt_deep_entity,
            ls_item                  TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>ts_issueitem,
            lt_filter_select_options TYPE /iwbep/t_mgw_select_option,
            lr_so                    TYPE /iwbep/t_cod_select_options.

      CREATE OBJECT lo_general.

      APPEND VALUE #( sign = 'I' option = 'EQ' low = lv_pckno ) TO lr_so.
      APPEND VALUE #( property = 'PackingNumber' select_options = lr_so ) TO lt_filter_select_options.

      lo_general->get_goods_issue_set(
        EXPORTING
          it_filter_select_options = lt_filter_select_options
        IMPORTING
          et_deep_goods_issue     = lt_deep_entity
      ).

      LOOP AT lt_deep_entity INTO DATA(ls_deep).
        READ TABLE ls_deep-toitems INTO DATA(ls_items) WITH KEY packingnumber = lv_pckno
                                                                material      = lv_matnr.
        IF sy-subrc EQ 0.
          MOVE-CORRESPONDING ls_items TO er_entity.
          EXIT.
        ENDIF.
      ENDLOOP.
    ENDIF.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->ISSUEITEMSET_UPDATE_ENTITY
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITY_U(optional)
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IO_DATA_PROVIDER               TYPE REF TO /IWBEP/IF_MGW_ENTRY_PROVIDER(optional)
* | [<---] ER_ENTITY                      TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TS_ISSUEITEM
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD issueitemset_update_entity.
    DATA: ls_entity TYPE zcl_zmm_bolge_depo_yon_mpc=>ts_issueitem, "
          ls_key    TYPE /iwbep/s_mgw_name_value_pair,
          ls_ztable TYPE zmm_t_bdy_gi_i,                   " Senin Z tablon
          lv_pckno  TYPE zmm_t_bdy_gi_i-pckno,
          lv_matnr  TYPE zmm_t_bdy_gi_i-matnr.

    " -----------------------------------------------------------------
    " 1. URL'den KEY alanlarını al (PackingNumber ve Material)
    " -----------------------------------------------------------------

    " PackingNumber Okuma
    READ TABLE it_key_tab INTO ls_key WITH KEY name = 'PackingNumber'.
    IF sy-subrc = 0.
      lv_pckno = ls_key-value.
    ENDIF.

    " Material Okuma
    READ TABLE it_key_tab INTO ls_key WITH KEY name = 'Material'.
    IF sy-subrc = 0.
      lv_matnr = ls_key-value.

      " Malzeme numarası için dönüşüm (Örn: 123 -> 000000000000000123)
      CALL FUNCTION 'CONVERSION_EXIT_MATN1_INPUT'
        EXPORTING
          input  = lv_matnr
        IMPORTING
          output = lv_matnr.
    ENDIF.

    " -----------------------------------------------------------------
    " 2. Body kısmından gelen veriyi oku (CountedQuantity, Approved)
    " -----------------------------------------------------------------
    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_entity
    ).

    " -----------------------------------------------------------------
    " 3. Veritabanındaki mevcut satırı çek (Lock ve Validation için)
    " -----------------------------------------------------------------
    SELECT SINGLE * FROM zmm_t_bdy_gi_i
      INTO ls_ztable
      WHERE pckno = lv_pckno
        AND matnr = lv_matnr.

    IF sy-subrc <> 0.
      " Kayıt bulunamazsa 404 hatası fırlat
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid            = /iwbep/cx_mgw_busi_exception=>resource_not_found
          message_unlimited = 'Güncellenecek kayıt bulunamadı (PCKNO/MATNR hatalı).'.
    ENDIF.

    " -----------------------------------------------------------------
    " 4. Alan Eşleştirmeleri (Mapping)
    " -----------------------------------------------------------------

    " Onay Durumu (JS: Approved -> DB: APPROVED)
    ls_ztable-approved = ls_entity-approved.

    ls_ztable-editreason = ls_entity-editreason.

    " Sayılan Miktar (JS: CountedQuantity -> DB: COUNTED_QTY)
    " Not: Entity'deki alan adın 'CountedQuantity' varsayıldı.
    ls_ztable-counted_qty = ls_entity-countedquantity.

    " Not: Eğer JS'den gelen EditReason'ı bir yere kaydeceksen buraya eklemelisin.
    " Örn: ls_ztable-item_message = ls_entity-editreason. (Eğer bu amaçla kullanıyorsan)

    " -----------------------------------------------------------------
    " 5. Veritabanını Güncelle
    " -----------------------------------------------------------------
    UPDATE zmm_t_bdy_gi_i FROM ls_ztable.

    IF sy-subrc = 0.
      " Başarılıysa entity'yi geri döndür
      er_entity = ls_entity.
    ELSE.
      " Hata durumunda exception fırlat
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid            = /iwbep/cx_mgw_busi_exception=>business_error
          message_unlimited = 'Tablo güncellenirken hata oluştu.'.
    ENDIF.

  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->LOAD_DEPOSIT_DRAFT
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_LOG_UID                     TYPE        SYSUUID_C32
* | [--->] IT_EXPECTED_ITEMS              TYPE        TY_T_RETURN_ITEM
* | [<-()] RT_ITEMS                       TYPE        TY_T_RETURN_ITEM
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
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
          AND matnr     IN @lr_matnr
        INTO TABLE @DATA(lt_draft).

    IF line_exists( lt_draft[ is_confirmed = abap_false ] ).
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'Tüm depozito kalemlerinde sayımı yapıp Tamam alanını işaretleyin'.
    ENDIF.


    LOOP AT it_expected_items ASSIGNING FIELD-SYMBOL(<expected>)
      WHERE mengesayim GT 0.
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
      ( loguid      = ls_draft-log_uid
        posnr        = ls_draft-posnr
        matnr        = ls_draft-matnr
        meins        = ls_draft-meins
        mengesiparis = ls_draft-menge_siparis
        mengesayim   = ls_draft-menge_sayim
        mengesatilab = ls_draft-menge_sayim
        isdepozito   = abap_true ) ).
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->LOAD_RETURN_DATA
* +-------------------------------------------------------------------------------------------------+
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [<---] ET_HEADERS                     TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC_EXT=>TT_RETURNHEADER
* | [<---] ET_ITEMS                       TYPE        TY_T_RETURN_ITEM
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD load_return_data.
    DATA:
      lr_shipment_type    TYPE RANGE OF zmm_t_bdy_irs_h-shipment_type,
      lr_plasiyer         TYPE RANGE OF zmm_t_bdy_irs_h-plasiyer,
      lr_lgort            TYPE RANGE OF zmm_t_bdy_irs_h-lgort,
      lr_irs_no           TYPE RANGE OF zmm_t_bdy_irs_h-irs_no,
      lr_irs_tar          TYPE RANGE OF zmm_t_bdy_irs_h-irs_tar,
      lr_log_uid          TYPE RANGE OF zmm_t_bdy_irs_h-log_uid,
      lv_filter_date      TYPE d,
      lv_filter_timestamp TYPE timestamp,
      lv_irs_timestamp    TYPE timestamp.



    LOOP AT it_filter_select_options ASSIGNING FIELD-SYMBOL(<filter>).
      CASE to_upper( <filter>-property ).
        WHEN 'SHIPMENTTYPE'.
          lr_shipment_type = CORRESPONDING #( <filter>-select_options ).
        WHEN 'PLASIYER'.
          lr_plasiyer = CORRESPONDING #( <filter>-select_options ).
        WHEN 'LGORT'.
          lr_lgort = CORRESPONDING #( <filter>-select_options ).
        WHEN 'IRSNO'.
          lr_irs_no = CORRESPONDING #( <filter>-select_options ).
        WHEN 'IRSTAR'.
          lr_irs_tar = CORRESPONDING #( <filter>-select_options ).
          "IrsTar is Edm.DateTime/timestamp in OData, but IRS_TAR is
          "stored as DATS. Convert the Gateway timestamp filter to DATS.
          LOOP AT <filter>-select_options ASSIGNING FIELD-SYMBOL(<date_so>).
            CLEAR lv_filter_date.
            CLEAR lv_filter_timestamp.

            IF <date_so>-low IS NOT INITIAL.
              lv_filter_timestamp = <date_so>-low.
              CONVERT TIME STAMP lv_filter_timestamp
                TIME ZONE 'UTC'
                INTO DATE lv_filter_date.
            ENDIF.

            IF lv_filter_date IS NOT INITIAL.
              APPEND VALUE #(
                sign   = <date_so>-sign
                option = 'EQ'
                low    = lv_filter_date )
                TO lr_irs_tar.
            ENDIF.
          ENDLOOP.
        WHEN 'LOGUID'.
          lr_log_uid = CORRESPONDING #( <filter>-select_options ).
      ENDCASE.
    ENDLOOP.

    "An empty range rejects every row in Open SQL, so make omitted
    "character filters unrestricted.
    IF lr_shipment_type IS INITIAL.
      APPEND VALUE #( sign = 'I' option = 'CP' low = '*' )
        TO lr_shipment_type.
    ENDIF.
    IF lr_plasiyer IS INITIAL.
      APPEND VALUE #( sign = 'I' option = 'CP' low = '*' )
        TO lr_plasiyer.
    ENDIF.
    IF lr_lgort IS INITIAL.
      APPEND VALUE #( sign = 'I' option = 'CP' low = '*' )
        TO lr_lgort.
    ENDIF.
    IF lr_irs_no IS INITIAL.
      APPEND VALUE #( sign = 'I' option = 'CP' low = '*' )
        TO lr_irs_no.
    ENDIF.
    IF lr_irs_tar IS INITIAL.
      APPEND VALUE #( sign = 'I' option = 'BT'
                      low = '00010101' high = '99991231' )
        TO lr_irs_tar.
    ENDIF.
    IF lr_log_uid IS INITIAL.
      APPEND VALUE #( sign = 'I' option = 'CP' low = '*' )
        TO lr_log_uid.
    ENDIF.

*    SELECT SINGLE *
*      FROM zsd_t_refund_100 INTO ls_refund_100
*      WHERE document EQ ls_vbak-vbeln.

    SELECT log_uid,
           vbeln_va,
           irs_no,
           irs_tar,
           lgort,
           plasiyer,
           a~name1 AS plasiyer_name,
           zmm_t_bdy_irs_h~kunnr,
           shipment_type,
*           status,
      CASE status
      WHEN 'S' THEN 'S'
      WHEN 'C' THEN 'S'
      WHEN 'N' THEN 'N' END AS status
      FROM zmm_t_bdy_irs_h
*      INNER JOIN zsd_t_refund_100 AS b ON zmm_t_bdy_irs_h~vbeln_va EQ b~document
      INNER JOIN kna1 AS a ON zmm_t_bdy_irs_h~plasiyer EQ a~kunnr
      WHERE shipment_type IN @lr_shipment_type
        AND plasiyer IN @lr_plasiyer
        AND lgort    IN @lr_lgort
        AND irs_no   IN @lr_irs_no
        AND irs_tar  IN @lr_irs_tar
        AND log_uid  IN @lr_log_uid
        AND status   IN ( 'N', 'S', 'C' )
      INTO TABLE @DATA(lt_db_headers).

*/ canlıya kademeli geçiş -- sadece 1902'ler çalışacak
    DELETE lt_db_headers WHERE lgort NE '1902'.
*/ canlıya kademeli geçiş -- sadece 1902'ler çalışacak

    IF lt_db_headers IS INITIAL.
      RETURN.
    ENDIF.

    "Normalize customer/representative numbers before comparing them.
    LOOP AT lt_db_headers ASSIGNING FIELD-SYMBOL(<db_header>).
      DATA(lv_kunnr) = |{ <db_header>-kunnr ALPHA = IN }|.
      DATA(lv_plasiyer) = |{ <db_header>-plasiyer ALPHA = IN }|.

      CLEAR lv_irs_timestamp.
      IF <db_header>-irs_tar IS NOT INITIAL.
        CONVERT DATE <db_header>-irs_tar
          TIME '000000'
          INTO TIME STAMP lv_irs_timestamp
          TIME ZONE 'UTC'.
      ENDIF.

      APPEND VALUE #(
        loguid        = <db_header>-log_uid
        vbelnva       = <db_header>-vbeln_va
        irsno         = <db_header>-irs_no
        irstar        = lv_irs_timestamp
        lgort         = <db_header>-lgort
        plasiyer      = <db_header>-plasiyer
        plasiyername  = <db_header>-plasiyer_name
        kunnr         = <db_header>-kunnr
        shipmenttype  = <db_header>-shipment_type
        status        = <db_header>-status
        returntype    = COND #(
          WHEN lv_kunnr = lv_plasiyer THEN 'P'
          ELSE 'M' )
        )
        TO et_headers.
    ENDLOOP.

    "Read persisted count lines and material enrichment in one statement.
    SELECT i~log_uid,
           h~vbeln_va,
           i~posnr,
           i~matnr,
           i~meins,
           i~menge_sayim,
           i~menge_fire,
           i~menge_kalite,
           i~menge_lansman,
           i~menge_satilab,
           m~maktx,
           a~mtart
      FROM zmm_t_bdy_irs_i AS i
      INNER JOIN zmm_t_bdy_irs_h AS h
        ON h~log_uid = i~log_uid
      LEFT OUTER JOIN makt AS m
        ON m~matnr = i~matnr
       AND m~spras = @sy-langu
      LEFT OUTER JOIN mara AS a
        ON a~matnr = i~matnr
      FOR ALL ENTRIES IN @lt_db_headers
      WHERE i~log_uid = @lt_db_headers-log_uid
      INTO TABLE @DATA(lt_db_items).

    "A material may occur on several ZBIS lines because each return
    "reason is represented by a separate item. Aggregate those lines so
    "MengeSiparis is the true ERP total used by the UI discrepancy check.
    SELECT vbeln,
           matnr,
           kwmeng,
           vrkme
      FROM vbap
      FOR ALL ENTRIES IN @lt_db_headers
      WHERE vbeln = @lt_db_headers-vbeln_va
      INTO TABLE @DATA(lt_vbap_qty).

    DATA lt_expected_qty TYPE ty_t_expected_qty.

    LOOP AT lt_vbap_qty ASSIGNING FIELD-SYMBOL(<vbap_qty>).
      ASSIGN lt_expected_qty[
        vbeln = <vbap_qty>-vbeln
        matnr = <vbap_qty>-matnr ]
        TO FIELD-SYMBOL(<expected>).

      IF sy-subrc <> 0.
        INSERT VALUE #(
          vbeln = <vbap_qty>-vbeln
          matnr = <vbap_qty>-matnr
          meins = <vbap_qty>-vrkme
          menge = <vbap_qty>-kwmeng )
          INTO TABLE lt_expected_qty.
      ELSE.
        <expected>-menge = <expected>-menge + <vbap_qty>-kwmeng.
      ENDIF.
    ENDLOOP.

    LOOP AT lt_db_items ASSIGNING FIELD-SYMBOL(<db_item>).
      ASSIGN lt_expected_qty[
        vbeln = <db_item>-vbeln_va
        matnr = <db_item>-matnr ]
        TO <expected>.
      DATA(lv_expected_found) = xsdbool( sy-subrc = 0 ).

      IF lv_expected_found = abap_true.
        CALL FUNCTION 'CONVERSION_EXIT_CUNIT_OUTPUT'
          EXPORTING
            input          = <expected>-meins
            language       = sy-langu
          IMPORTING
            output         = <expected>-meins
          EXCEPTIONS
            unit_not_found = 1.

      ELSE.
        CALL FUNCTION 'CONVERSION_EXIT_CUNIT_OUTPUT'
          EXPORTING
            input          = <db_item>-meins
            language       = sy-langu
          IMPORTING
            output         = <db_item>-meins
          EXCEPTIONS
            unit_not_found = 1.
      ENDIF.

      APPEND VALUE #(
        loguid        = <db_item>-log_uid
        posnr         = <db_item>-posnr
        matnr         = <db_item>-matnr
        maktx         = <db_item>-maktx
        meins         = COND #(
          WHEN lv_expected_found = abap_true THEN <expected>-meins
          ELSE <db_item>-meins )
        mengesiparis  = COND #(
          WHEN lv_expected_found = abap_true THEN <expected>-menge
          ELSE 0 )
        mengesayim    = <db_item>-menge_sayim
        mengefire     = <db_item>-menge_fire
        mengekalite   = <db_item>-menge_kalite
        mengelansman   = <db_item>-menge_lansman
        mengesatilab  = <db_item>-menge_satilab
        isdepozito    = COND #( WHEN <db_item>-mtart = 'ZSTK' THEN abap_true ELSE abap_false )
        nolansman     = check_lansman(
                            iv_matnr = <db_item>-matnr
                            iv_kunnr = VALUE #( et_headers[ loguid = <db_item>-log_uid ]-kunnr OPTIONAL )
                        )
        )
        TO et_items.
    ENDLOOP.



    "Stable hierarchy order: MD/OP -> representative -> waybill.
    SORT et_headers BY shipmenttype plasiyer irsno.

    append_latest_deposit_items(
       EXPORTING
         it_headers = et_headers
       CHANGING
         ct_items   = et_items ).

    SORT et_items BY loguid posnr.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->NOTEGISET_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_NOTEGI
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD notegiset_get_entityset.
    DATA: lv_pckno     TYPE zsd_packhdr-pckno,
          ls_entityset LIKE LINE OF et_entityset.

    " 1. Filtrelerden LpId'yi al
    LOOP AT it_filter_select_options INTO DATA(ls_filter).
      IF ls_filter-property = 'PackingNumber'.
        READ TABLE ls_filter-select_options INTO DATA(ls_so) INDEX 1.
        lv_pckno = ls_so-low.
      ENDIF.
    ENDLOOP.

    IF lv_pckno IS NOT INITIAL.
      SELECT pckno, note
        FROM zmm_t_bdy_gi_not
        INTO TABLE @DATA(lt_notes)
        WHERE pckno = @lv_pckno.
      LOOP AT lt_notes INTO DATA(ls_notes).
        ls_entityset-packingnumber     = ls_notes-pckno.
        ls_entityset-note = ls_notes-note.
        APPEND ls_entityset TO et_entityset.
        CLEAR ls_entityset.
      ENDLOOP.

    ENDIF.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->NOTEGRSET_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_NOTEGR
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD notegrset_get_entityset.
    DATA: lv_lpid      TYPE string,
          ls_entityset LIKE LINE OF et_entityset,
          lv_ais_val   TYPE string,
          lv_pure_note TYPE string.

    " 1. Filtrelerden LpId'yi al
    LOOP AT it_filter_select_options INTO DATA(ls_filter).
      IF ls_filter-property = 'LpId'.
        READ TABLE ls_filter-select_options INTO DATA(ls_so) INDEX 1.
        lv_lpid = ls_so-low.
      ENDIF.
    ENDLOOP.

    IF lv_lpid IS NOT INITIAL.
      SELECT lpid, note
        FROM zmm_t_bdy_gr_not
        INTO TABLE @DATA(lt_notes)
        WHERE lpid = @lv_lpid.

      LOOP AT lt_notes INTO DATA(ls_db_notes).
        ls_entityset-lpid = ls_db_notes-lpid.

        " --- PARÇALAMA MANTIĞI BAŞLANGICI ---
        " Not içinde [AIS: varsa ayır, yoksa olduğu gibi bırak
        IF ls_db_notes-note CA '[' AND ls_db_notes-note CS ']'.

          " [AIS: ve ] arasındaki sıcaklık değerini al
          lv_ais_val = substring_before(
                         val = substring_after( val = ls_db_notes-note sub = '[AIS:' )
                         sub = ']' ).

          " ] karakterinden sonraki gerçek not metnini al
          lv_pure_note = substring_after( val = ls_db_notes-note sub = ']' ).
          lv_pure_note = condense( lv_pure_note ). " Başındaki boşluğu temizle

          " Ön yüze gidecek ana not alanına sadece temizlenmiş metni koyuyoruz
          " Ön yüz (Claude'un kurgusu gereği) AIS bilgisini bu alandan mı bekliyor,
          " yoksa entity içindeki başka bir alandan mı?
          " Eğer Note alanından bekliyorsa formatı bozmadan iletmelisin:
          ls_entityset-note = ls_db_notes-note.

          " Eğer OData Entity'nde 'AisValue' gibi bir alan açtıysan:
          " ls_entityset-aisvalue = lv_ais_val.

        ELSE.
          " [AIS:] prefix'i yoksa düz notu gönder
          ls_entityset-note = ls_db_notes-note.
        ENDIF.
        " --- PARÇALAMA MANTIĞI BİTİŞİ ---

        APPEND ls_entityset TO et_entityset.
        CLEAR: ls_entityset, lv_ais_val, lv_pure_note.
      ENDLOOP.
    ENDIF.
  ENDMETHOD.
*  METHOD notegrset_get_entityset.
*    DATA: lv_lpid      TYPE string,
*          ls_entityset LIKE LINE OF et_entityset.
*
*    " 1. Filtrelerden LpId'yi al
*    LOOP AT it_filter_select_options INTO DATA(ls_filter).
*      IF ls_filter-property = 'LpId'.
*        READ TABLE ls_filter-select_options INTO DATA(ls_so) INDEX 1.
*        lv_lpid = ls_so-low.
*      ENDIF.
*    ENDLOOP.
*
*    IF lv_lpid IS NOT INITIAL.
*      SELECT lpid, note
*        FROM zmm_t_bdy_gr_not
*        INTO TABLE @DATA(lt_notes)
*        WHERE lpid = @lv_lpid.
*      LOOP AT lt_notes INTO DATA(ls_notes).
*        ls_entityset-lpid     = ls_notes-lpid.
*        ls_entityset-note = ls_notes-note.
*        APPEND ls_entityset TO et_entityset.
*        CLEAR ls_entityset.
*      ENDLOOP.
*
*    ENDIF.
*  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->OFFICERSET_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_OFFICER
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD officerset_get_entityset.

    DATA: lr_vstel  TYPE RANGE OF vstel,
          ls_vstel  LIKE LINE OF lr_vstel,
          ls_entity LIKE LINE OF et_entityset.

    DATA: lt_filter_select_options TYPE /iwbep/t_mgw_select_option,
          ls_filter_so             TYPE /iwbep/s_mgw_select_option,
          ls_so                    TYPE /iwbep/s_cod_select_option.

    " 1. Filtreleri Manuel Oku (WarehouseNum)
    " ---------------------------------------------------------
    lt_filter_select_options = io_tech_request_context->get_filter( )->get_filter_select_options( ).

    READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'WarehouseNum'.
    IF sy-subrc = 0.
      LOOP AT ls_filter_so-select_options INTO ls_so.
        ls_vstel-sign   = ls_so-sign.
        ls_vstel-option = ls_so-option.
        ls_vstel-low    = ls_so-low.
        ls_vstel-high   = ls_so-high.
        APPEND ls_vstel TO lr_vstel.
      ENDLOOP.
    ELSE.
      READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'WAREHOUSENUM'.
      IF sy-subrc = 0.
        LOOP AT ls_filter_so-select_options INTO ls_so.
          ls_vstel-sign   = ls_so-sign.
          ls_vstel-option = ls_so-option.
          ls_vstel-low    = ls_so-low.
          ls_vstel-high   = ls_so-high.
          APPEND ls_vstel TO lr_vstel.
        ENDLOOP.
      ENDIF.
    ENDIF.

    " Eğer depo numarası gelmediyse, tüm personeli çekmek performans sorunu yaratabilir.
    " Bu yüzden boş dönüyoruz (veya isterseniz devam edebilirsiniz).
    IF lr_vstel IS INITIAL.
      RETURN.
    ENDIF.

    " 2. Personel Verisini Çek
    " ---------------------------------------------------------
    " NOT: 'ZWM_EMPLOYEES' tablosunu kendi oluşturacağınız tablo ile değiştirin.
    " Alanlar: PERNR (Sicil), ENAME (Ad Soyad), WERKS/VSTEL (Depo)

*    SELECT a~employee_id AS pernr, a~employee_name AS ename, a~personnel_subarea
*      FROM zsts_t999 AS a
*      INNER JOIN zmm_t_bdy_0004 AS b ON a~upper_node_id EQ b~upper_node_id
*                                    AND a~personnel_subarea EQ b~lgort
*      INTO TABLE @DATA(lt_employees)
*      WHERE a~personnel_subarea IN @lr_vstel
*        AND a~job_id            EQ '00001026'.
*    DATA lr_txt TYPE RANGE OF zsts_t999-orgunit_text.
*    APPEND VALUE #( sign = 'I' option = 'CP' low = '*DEPO*' ) TO lr_txt.
*    SELECT a~employee_id AS pernr, a~employee_name AS ename, a~personnel_subarea
*      FROM zsts_t999 AS a
*      INTO TABLE @DATA(lt_employees)
*      WHERE a~personnel_subarea IN @lr_vstel
*        AND ( a~job_id            EQ '00001026' OR
*              a~job_id            EQ '00001015' )
*        AND a~orgunit_text      IN @lr_txt.


    SELECT sicilno AS pernr,
    sicilname AS ename,
*PASSWORD
    bolge AS personnel_subarea
*PERSONEL_TURU
          FROM zmm_t_bdy_0001
    INTO TABLE @DATA(lt_employees)
          WHERE bolge IN @lr_vstel.
*            AND personel_turu EQ 'M'.


    " 3. OData Yapısına Dönüştür
    " ---------------------------------------------------------
    LOOP AT lt_employees INTO DATA(ls_emp).
      CLEAR ls_entity.
      ls_entity-officerid    = ls_emp-pernr. " Sicil No
      ls_entity-officername  = ls_emp-ename. " Ad Soyad
      ls_entity-warehousenum = ls_emp-personnel_subarea.
      APPEND ls_entity TO et_entityset.
    ENDLOOP.
    SORT et_entityset BY officername.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->PLATEPHOTOSET_DELETE_ENTITY
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITY_D(optional)
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  method PLATEPHOTOSET_DELETE_ENTITY.
    DATA: lv_photoid TYPE zmm_t_bdy_photo-photo_id.

    " 1. Silinecek Fotoğrafın ID'sini al
    READ TABLE it_key_tab INTO DATA(ls_key) WITH KEY name = 'PhotoId'.
    IF sy-subrc = 0.
      lv_photoid = ls_key-value.
    ENDIF.

    " 2. DB'den Sil
    DELETE FROM zmm_t_bdy_photo WHERE photo_id = lv_photoid.

    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          message = 'Silinecek fotoğraf bulunamadı.'.
    ENDIF.
  endmethod.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->PLATEPHOTOSET_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_PLATEPHOTO
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD platephotoset_get_entityset.
    DATA: lo_general   TYPE REF TO zmm_cl_bdy_general,
*          lt_photos    TYPE zmm_cl_bdy_general=>tt_photo,
          lv_lpid      TYPE string,
          ls_entityset LIKE LINE OF et_entityset,
          lv_uuid_c32  TYPE sysuuid_c32. " Yardımcı değişken

    " 1. Filtrelerden LpId'yi al
    LOOP AT it_filter_select_options INTO DATA(ls_filter).
      IF ls_filter-property = 'LpId'.
        READ TABLE ls_filter-select_options INTO DATA(ls_so) INDEX 1.
        lv_lpid = ls_so-low.
      ENDIF.
      IF ls_filter-property = 'Type'.
        READ TABLE ls_filter-select_options INTO DATA(ls_type) INDEX 1.
        DATA(lv_type) = ls_type-low.
      ENDIF.
    ENDLOOP.

    IF lv_lpid IS NOT INITIAL.
      CREATE OBJECT lo_general.

*      " 2. Listeyi çek
*      lo_general->get_photo_list(
*        EXPORTING iv_lpid   = lv_lpid
*        IMPORTING et_photos = lt_photos
*      ).
      SELECT photo_id AS photoid , lpid, filename, mimetype
        FROM zmm_t_bdy_photo
        INTO TABLE @DATA(lt_photos)
*      INTO CORRESPONDING FIELDS OF TABLE @et_photos
        WHERE lpid = @lv_lpid
        %_HINTS MSSQLNT 'TABLE ZMM_T_BDY_PHOTO INDEX([ZMM_T_BDY_PHOTO~1])'.
      LOOP AT lt_photos INTO DATA(ls_photos).
        CLEAR lv_uuid_c32.
        TRY.
            cl_system_uuid=>convert_uuid_x16_static(
              EXPORTING
                uuid     = ls_photos-photoid
              IMPORTING
                uuid_c32 = lv_uuid_c32  " Sonucu direkt buraya veya geçici bir değişkene al
            ).
          CATCH cx_uuid_error.
            CONTINUE.
        ENDTRY.
        ls_entityset-photoid  = lv_uuid_c32.
        ls_entityset-lpid     = ls_photos-lpid.
        ls_entityset-filename = ls_photos-filename.
        ls_entityset-mimetype = ls_photos-mimetype.
        ls_entityset-type     = lv_type.
        APPEND ls_entityset TO et_entityset.
        CLEAR ls_entityset.
      ENDLOOP.

    ENDIF.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->POST_RETURN_FACTORY_SHIPMENT
* +-------------------------------------------------------------------------------------------------+
* | [--->] IS_DEEP                        TYPE        TY_S_RETURN_FACTORY_DEEP
* | [--->] IV_WERKS                       TYPE        WERKS_D
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD post_return_factory_shipment.
" ----------------------------------------------------------------------
" POST_RETURN_FACTORY_SHIPMENT
" 1) Sayilan fire/kalite/lansman miktarlari kadar UB siparisi olusturulur.
" 2) BAPI_GOODSMVT_CREATE ile 18xx iade depodan PO referansli 351 cikis
"    yapilir ve irsaliye/form akisi tetiklenir.
" 3) SapStock > MengeSayim ise fark miktar once 311 ile 18xx -> 19xx
"    transfer edilir, ardindan 702 sayim farki olarak kapatilir.
" ----------------------------------------------------------------------

  DATA lo_error TYPE REF TO /iwbep/cx_mgw_busi_exception.

  mv_factory_log_only = abap_true.
  TRY.
      execute_factory_shipment(
        is_deep  = is_deep
        iv_werks = iv_werks ).
    CATCH /iwbep/cx_mgw_busi_exception INTO lo_error.
      CLEAR mv_factory_log_only.
      RAISE EXCEPTION lo_error.
  ENDTRY.
  CLEAR mv_factory_log_only.
*  TYPES:
*    BEGIN OF ty_category,
*      po_group     TYPE char1,
*      category     TYPE char10,
*      source_posnr TYPE posnr,
*      material     TYPE matnr,
*      quantity     TYPE menge_d,
*      sap_stock    TYPE labst,
*      uom          TYPE meins,
*      zzgrund      TYPE ekpo-zzgrund,
*      zzaltndn     TYPE ekpo-zzaltndn,
*      zzsktar      TYPE ekpo-zzsktar,
*    END OF ty_category,
*    BEGIN OF ty_po_gm_item,
*      po_item  TYPE ebelp,
*      material TYPE matnr,
*      quantity TYPE menge_d,
*      uom      TYPE meins,
*    END OF ty_po_gm_item.
*
*  DATA:
*    lv_log_uid          TYPE sysuuid_c32,
*    ls_head             TYPE bapi2017_gm_head_01,
*    ls_code             TYPE bapi2017_gm_code,
*    lt_item             TYPE TABLE OF bapi2017_gm_item_create,
*    lt_return           TYPE bapiret2_t,
*    lv_mblnr            TYPE mblnr,
*    lv_mjahr            TYPE mjahr,
*    lv_message          TYPE string,
*    lv_bapi_message     TYPE string,
*    lv_ebeln            TYPE bapimepoheader-po_number,
*    lv_po_item          TYPE ebelp,
*    lv_log_po_item      TYPE ebelp,
*    lv_log_write_failed TYPE abap_bool,
*    lt_category         TYPE TABLE OF ty_category,
*    lt_po_gm_item       TYPE TABLE OF ty_po_gm_item,
*    ls_poheader         TYPE bapimepoheader,
*    ls_poheaderx        TYPE bapimepoheaderx,
*    ls_poitem           TYPE bapimepoitem,
*    ls_poitemx          TYPE bapimepoitemx,
*    ls_poschedule       TYPE bapimeposchedule,
*    ls_poschedulex      TYPE bapimeposchedulx,
*    ls_extensionin      TYPE bapiparex,
*    ls_te_mepoitem      TYPE bapi_te_mepoitem,
*    ls_te_mepoitemx     TYPE bapi_te_mepoitemx,
*    lt_poitem           TYPE TABLE OF bapimepoitem,
*    lt_poitemx          TYPE TABLE OF bapimepoitemx,
*    lt_poschedule       TYPE TABLE OF bapimeposchedule,
*    lt_poschedulex      TYPE TABLE OF bapimeposchedulx,
*    lt_extensionin      TYPE TABLE OF bapiparex,
*    lt_po_group         TYPE STANDARD TABLE OF char1 WITH EMPTY KEY,
*    lv_awkey            TYPE awkey,
*    lv_awtyp            TYPE awtyp VALUE 'MKPF',
*    lo_op               TYPE REF TO /dsl/es10_cl_op,
*    ls_data             TYPE /dsl/es10_s023.
*
*  FIELD-SYMBOLS <return> TYPE bapiret2.
*
*  lv_log_uid = create_return_factory_log( is_deep = is_deep ).
*
*  IF is_deep-sourcelgort IS INITIAL OR is_deep-lgort IS INITIAL.
*    save_return_factory_log(
*      iv_log_uid      = lv_log_uid
*      iv_status       = 'E'
*      iv_last_message = 'Kaynak ve hedef depo yeri belirlenemedi' ).
*    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*      EXPORTING
*        textid  = /iwbep/cx_mgw_busi_exception=>business_error
*        message = 'Kaynak ve hedef depo yeri belirlenemedi'.
*  ENDIF.
*
*  LOOP AT is_deep-toitems ASSIGNING FIELD-SYMBOL(<source_item>).
*    APPEND VALUE #(
*      po_group = '2' category = 'URETIM'
*      source_posnr = <source_item>-posnr
*      material = <source_item>-matnr
*      quantity = <source_item>-mengeuretimhatali
*      sap_stock = <source_item>-sapstock
*      uom = <source_item>-meins
*      zzgrund = '2' zzaltndn = '01' zzsktar = sy-datum )
*      TO lt_category.
*    APPEND VALUE #(
*      po_group = '4' category = 'FABLOJ'
*      source_posnr = <source_item>-posnr
*      material = <source_item>-matnr
*      quantity = <source_item>-mengefabrikalojistik
*      sap_stock = <source_item>-sapstock
*      uom = <source_item>-meins
*      zzgrund = '4' )
*      TO lt_category.
*    APPEND VALUE #(
*      po_group = '4' category = 'SF-KATI'
*      source_posnr = <source_item>-posnr
*      material = <source_item>-matnr
*      quantity = <source_item>-mengesatisfirekati
*      sap_stock = <source_item>-sapstock
*      uom = <source_item>-meins
*      zzgrund = '1'  )
*      TO lt_category.
*    APPEND VALUE #(
*      po_group = '4' category = 'SF-SIVI'
*      source_posnr = <source_item>-posnr
*      material = <source_item>-matnr
*      quantity = <source_item>-mengesatisfiresivi
*      sap_stock = <source_item>-sapstock
*      uom = <source_item>-meins
*      zzgrund = '1'  )
*      TO lt_category.
*    APPEND VALUE #(
*      po_group = '4' category = 'SF-UHT'
*      source_posnr = <source_item>-posnr
*      material = <source_item>-matnr
*      quantity = <source_item>-mengesatisfireuht
*      sap_stock = <source_item>-sapstock
*      uom = <source_item>-meins
*      zzgrund = '1'  )
*      TO lt_category.
*    APPEND VALUE #(
*      po_group = '4' category = 'SF-CAM'
*      source_posnr = <source_item>-posnr
*      material = <source_item>-matnr
*      quantity = <source_item>-mengesatisfirecam
*      sap_stock = <source_item>-sapstock
*      uom = <source_item>-meins
*      zzgrund = '1' )
*      TO lt_category.
*
**/ fiorideki ekstra girişlerde toplatılan için mengelansman alanını kullanıyoruz!
**/ daha fazla ekstra giriş olursa buralar düzenlenecek
*
*    APPEND VALUE #(
*          po_group = '6' category = 'TOPLATILAN'
*          source_posnr = <source_item>-posnr
*          material = <source_item>-matnr
*          quantity = <source_item>-mengelansman
*          sap_stock = <source_item>-sapstock
*          uom = <source_item>-meins
*          zzgrund = '92'  )
*          TO lt_category.
*
*    DATA(lv_log_difference) = <source_item>-sapstock - <source_item>-mengesayim.
*    IF lv_log_difference > 0.
*      APPEND VALUE #(
*        category = 'FARK'
*        source_posnr = <source_item>-posnr
*        material = <source_item>-matnr
*        quantity = lv_log_difference
*        sap_stock = <source_item>-sapstock
*        uom = <source_item>-meins )
*        TO lt_category.
*    ENDIF.
*  ENDLOOP.
*  DELETE lt_category WHERE quantity <= 0.
*
*
**  data ls_log_i type zmm_t_bdy_fsh_i.
*  DATA ls_zmm_t_bdy_fsh_i TYPE zmm_t_bdy_fsh_i.
*
*  LOOP AT lt_category ASSIGNING FIELD-SYMBOL(<log_category>).
*
*    " Önce veriyi Work Area'ya dolduruyoruz
*    ls_zmm_t_bdy_fsh_i = VALUE #(
*      mandt        = sy-mandt
*      log_uid      = lv_log_uid
*      posnr        = <log_category>-source_posnr
*      category     = <log_category>-category
*      matnr        = <log_category>-material
*      meins        = <log_category>-uom
*      menge        = <log_category>-quantity
*      sap_stock    = <log_category>-sap_stock
*      zzgrund      = <log_category>-zzgrund
*      zzaltndn     = <log_category>-zzaltndn
*      zzsktar      = <log_category>-zzsktar
*      ernam        = sy-uname
*      erdat        = sy-datum
*      erzet        = sy-uzeit
*      aenam        = sy-uname
*      aedat        = sy-datum
*      aezet        = sy-uzeit ).
*
*    " Ardından DB tablosunu Work Area'dan güncelliyoruz
*    MODIFY zmm_t_bdy_fsh_i FROM ls_zmm_t_bdy_fsh_i.
*
*    IF sy-subrc <> 0.
*      lv_log_write_failed = abap_true.
*    ENDIF.
*
*  ENDLOOP.
*
*  IF lv_log_write_failed = abap_true.
*    lv_message = 'Fabrika gönderim kalem kayıtları kaydedilemedi'.
*    save_return_factory_log(
*      iv_log_uid      = lv_log_uid
*      iv_status       = 'E'
*      iv_last_message = lv_message ).
*    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*      EXPORTING
*        textid  = /iwbep/cx_mgw_busi_exception=>business_error
*        message = CONV bapi_msg( lv_message ).
*  ENDIF.
*  COMMIT WORK AND WAIT.
*
*  ls_head-pstng_date = sy-datum.
*  ls_head-doc_date   = sy-datum.
*  ls_head-pr_uname   = sy-uname.
*  ls_head-header_txt = is_deep-plakano.
*
*  lt_po_group = VALUE #( ( '2' ) ( '4' ) ( '6' ) ).
*  LOOP AT lt_po_group ASSIGNING FIELD-SYMBOL(<po_group>).
*    IF NOT line_exists( lt_category[ po_group = <po_group> ] ).
*      CONTINUE.
*    ENDIF.
*
*    CLEAR:
*      lv_ebeln,
*      lv_po_item,
*      ls_poheader,
*      ls_poheaderx,
*      lt_poitem,
*      lt_poitemx,
*      lt_poschedule,
*      lt_poschedulex,
*      lt_extensionin,
*      lt_po_gm_item,
*      lt_return.
*
*    ls_poheader-doc_type   = 'UB'.
*    ls_poheader-comp_code  = '1000'.
*    ls_poheader-purch_org  = '3000'.
*    ls_poheader-pur_group  = '070'.
*    ls_poheader-suppl_plnt = gc_default_return_werks.
*    ls_poheader-ref_1      = is_deep-plakano.
*    ls_poheader-our_ref    = '041'.
*
*    ls_poheaderx-doc_type   =
*    ls_poheaderx-comp_code  =
*    ls_poheaderx-purch_org  =
*    ls_poheaderx-pur_group  =
*    ls_poheaderx-suppl_plnt =
*    ls_poheaderx-ref_1      =
*    ls_poheaderx-our_ref    = abap_true.
*
*    LOOP AT lt_category ASSIGNING FIELD-SYMBOL(<category>)
*      WHERE po_group = <po_group>.
*      ADD 10 TO lv_po_item.
*
*      CLEAR ls_poitem.
*      ls_poitem-po_item    = lv_po_item.
*      ls_poitem-material   = <category>-material.
*      ls_poitem-plant      = iv_werks.
*      ls_poitem-stge_loc   = gc_factory_target_lgort.
*      ls_poitem-quantity   = <category>-quantity.
*      ls_poitem-po_unit    = <category>-uom.
*      ls_poitem-item_cat   = '7'.
*      ls_poitem-trackingno = <category>-category.
*      APPEND ls_poitem TO lt_poitem.
*
*      CLEAR ls_poitemx.
*      ls_poitemx-po_item    = lv_po_item.
*      ls_poitemx-po_itemx   =
*      ls_poitemx-material   =
*      ls_poitemx-plant      =
*      ls_poitemx-stge_loc   =
*      ls_poitemx-quantity   =
*      ls_poitemx-po_unit    =
*      ls_poitemx-item_cat   =
*      ls_poitemx-trackingno = abap_true.
*      APPEND ls_poitemx TO lt_poitemx.
*
*      APPEND VALUE #(
*        po_item       = lv_po_item
*        sched_line    = '0001'
*        delivery_date = sy-datum
*        quantity      = <category>-quantity )
*        TO lt_poschedule.
*      APPEND VALUE #(
*        po_item       = lv_po_item
*        sched_line    = '0001'
*        po_itemx      = abap_true
*        sched_linex   = abap_true
*        delivery_date = abap_true
*        quantity      = abap_true )
*        TO lt_poschedulex.
*
*      CLEAR: ls_extensionin, ls_te_mepoitem.
*      ls_te_mepoitem-po_item  = lv_po_item.
*      ls_te_mepoitem-zzgrund  = <category>-zzgrund.
*      ls_te_mepoitem-zzaltndn = <category>-zzaltndn.
*      ls_te_mepoitem-zzsktar  = <category>-zzsktar.
*      ls_extensionin-structure  = 'BAPI_TE_MEPOITEM'.
*      ls_extensionin-valuepart1 = ls_te_mepoitem.
*      APPEND ls_extensionin TO lt_extensionin.
*
*      CLEAR: ls_extensionin, ls_te_mepoitemx.
*      ls_te_mepoitemx-po_item  = lv_po_item.
*      ls_te_mepoitemx-zzgrund  = abap_true.
*      ls_te_mepoitemx-zzaltndn = abap_true.
*      IF <category>-zzsktar IS NOT INITIAL.
*        ls_te_mepoitemx-zzsktar = abap_true.
*      ENDIF.
*      ls_extensionin-structure  = 'BAPI_TE_MEPOITEMX'.
*      ls_extensionin-valuepart1 = ls_te_mepoitemx.
*      APPEND ls_extensionin TO lt_extensionin.
*
*      APPEND VALUE #(
*        po_item  = lv_po_item
*        material = <category>-material
*        quantity = <category>-quantity
*        uom      = <category>-uom )
*        TO lt_po_gm_item.
*    ENDLOOP.
*
*    CALL FUNCTION 'BAPI_PO_CREATE1'
*      EXPORTING
*        poheader         = ls_poheader
*        poheaderx        = ls_poheaderx
*      IMPORTING
*        exppurchaseorder = lv_ebeln
*      TABLES
*        return           = lt_return
*        poitem           = lt_poitem
*        poitemx          = lt_poitemx
*        poschedule       = lt_poschedule
*        poschedulex      = lt_poschedulex
*        extensionin      = lt_extensionin.
*
*    CLEAR lv_message.
*    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
*      MESSAGE ID <return>-id TYPE <return>-type NUMBER <return>-number
*        WITH <return>-message_v1 <return>-message_v2
*             <return>-message_v3 <return>-message_v4
*        INTO lv_bapi_message.
*      lv_message = COND #(
*        WHEN lv_message IS INITIAL THEN lv_bapi_message
*        ELSE |{ lv_message }; { lv_bapi_message }| ).
*    ENDLOOP.
*
*    IF lv_message IS NOT INITIAL OR lv_ebeln IS INITIAL.
*      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*      IF lv_message IS INITIAL.
*        lv_message = |ZZGRUND { <po_group> } icin UB siparisi olusturulamadi|.
*      ENDIF.
*      save_return_factory_log(
*      iv_log_uid      = lv_log_uid
*      iv_status       = 'E'
*      iv_last_message = lv_message ).
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = CONV bapi_msg( lv_message ). "lv_message.
*    ENDIF.
*
*    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*      EXPORTING
*        wait = abap_true.
*
*    CLEAR lv_log_po_item.
*    LOOP AT lt_category ASSIGNING <category>
*      WHERE po_group = <po_group>.
*      ADD 10 TO lv_log_po_item.
*      UPDATE zmm_t_bdy_fsh_i
*        SET ebeln = @lv_ebeln,
*            ebelp = @lv_log_po_item,
*            aenam = @sy-uname,
*            aedat = @sy-datum,
*            aezet = @sy-uzeit
*        WHERE log_uid  = @lv_log_uid
*          AND posnr    = @<category>-source_posnr
*          AND category = @<category>-category.
*    ENDLOOP.
*    UPDATE zmm_t_bdy_fsh_h
*      SET last_step = 'PO_CREATED',
*          aenam     = @sy-uname,
*          aedat     = @sy-datum,
*          aezet     = @sy-uzeit
*      WHERE log_uid = @lv_log_uid.
*    COMMIT WORK AND WAIT.
*
*    CLEAR:
*      ls_code,
*      lt_item,
*      lt_return,
*      lv_mblnr,
*      lv_mjahr.
*    ls_code-gm_code = '04'.
*
*    LOOP AT lt_po_gm_item ASSIGNING FIELD-SYMBOL(<po_gm_item>).
*      APPEND VALUE #(
*        material   = <po_gm_item>-material
*        plant      = gc_default_return_werks
*        stge_loc   = is_deep-sourcelgort
*        move_type  = '351'
*        move_plant = iv_werks
*        move_stloc = gc_factory_target_lgort
*        entry_qnt  = <po_gm_item>-quantity
*        entry_uom  = <po_gm_item>-uom
*        po_number  = lv_ebeln
*        po_item    = <po_gm_item>-po_item )
*        TO lt_item.
*    ENDLOOP.
*
*    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
*      EXPORTING
*        goodsmvt_header  = ls_head
*        goodsmvt_code    = ls_code
*      IMPORTING
*        materialdocument = lv_mblnr
*        matdocumentyear  = lv_mjahr
*      TABLES
*        goodsmvt_item    = lt_item
*        return           = lt_return.
*
*    CLEAR lv_message.
*    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
*      MESSAGE ID <return>-id TYPE <return>-type NUMBER <return>-number
*        WITH <return>-message_v1 <return>-message_v2
*             <return>-message_v3 <return>-message_v4
*        INTO lv_bapi_message.
*      lv_message = COND #(
*        WHEN lv_message IS INITIAL THEN lv_bapi_message
*        ELSE |{ lv_message }; { lv_bapi_message }| ).
*    ENDLOOP.
*
*    IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
*      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*      IF lv_message IS INITIAL.
*        lv_message = |{ lv_ebeln }: 351 cikis hareketi olusturulamadi|.
*      ENDIF.
*      save_return_factory_log(
*      iv_log_uid      = lv_log_uid
*      iv_status       = 'E'
*      iv_last_message = lv_message ).
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = CONV bapi_msg( lv_message ). "lv_message.
*    ENDIF.
*
*    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*      EXPORTING
*        wait = abap_true.
*
*    UPDATE zmm_t_bdy_fsh_i
*      SET mblnr_351 = @lv_mblnr,
*          mjahr_351 = @lv_mjahr,
*          aenam     = @sy-uname,
*          aedat     = @sy-datum,
*          aezet     = @sy-uzeit
*      WHERE log_uid = @lv_log_uid
*        AND zzgrund = @<po_group>.
*    UPDATE zmm_t_bdy_fsh_h
*      SET last_step = 'GI_351',
*          aenam     = @sy-uname,
*          aedat     = @sy-datum,
*          aezet     = @sy-uzeit
*      WHERE log_uid = @lv_log_uid.
*    COMMIT WORK AND WAIT.
*
*    IF 1 GT 0.
*      CREATE OBJECT lo_op.
*      lv_awkey = lv_mblnr && lv_mjahr.
*      lo_op->send_document(
*        iv_awtyp = lv_awtyp
*        iv_awkey = lv_awkey ).
*
*      WAIT UP TO 2 SECONDS.
*      CLEAR ls_data.
*      SELECT SINGLE *
*        FROM /dsl/es10_t010
*        INTO @DATA(ls_despatch)
*        WHERE awtyp = @lv_awtyp
*          AND awkey = @lv_awkey.
*      IF sy-subrc = 0.
*        MOVE-CORRESPONDING ls_despatch TO ls_data.
*        print_despatch(
*          p_type  = '2'
*          is_data = ls_data ).
*      ENDIF.
*    ENDIF.
*  ENDLOOP.
*
*  LOOP AT is_deep-toitems ASSIGNING FIELD-SYMBOL(<item>).
*    DATA(lv_difference) = <item>-sapstock - <item>-mengesayim.
*    IF lv_difference <= 0.
*      CONTINUE.
*    ENDIF.
*
*    CLEAR: ls_code, lt_item, lt_return, lv_mblnr, lv_mjahr.
*    ls_code-gm_code = '04'.
*    APPEND VALUE #(
*      material   = <item>-matnr
*      plant      = gc_default_return_werks
*      stge_loc   = is_deep-sourcelgort
*      move_plant = gc_default_return_werks
*      move_stloc = is_deep-lgort
*      move_type  = gc_stock_transfer_bwart
*      entry_qnt  = lv_difference
*      entry_uom  = <item>-meins )
*      TO lt_item.
*
*    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
*      EXPORTING
*        goodsmvt_header  = ls_head
*        goodsmvt_code    = ls_code
*      IMPORTING
*        materialdocument = lv_mblnr
*        matdocumentyear  = lv_mjahr
*      TABLES
*        goodsmvt_item    = lt_item
*        return           = lt_return.
*
*    CLEAR lv_message.
*    LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
*      MESSAGE ID <return>-id TYPE <return>-type NUMBER <return>-number
*        WITH <return>-message_v1 <return>-message_v2
*             <return>-message_v3 <return>-message_v4
*        INTO lv_bapi_message.
*      lv_message = COND #(
*        WHEN lv_message IS INITIAL THEN lv_bapi_message
*        ELSE |{ lv_message }; { lv_bapi_message }| ).
*    ENDLOOP.
*    IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
*      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*      IF lv_message IS INITIAL.
*        lv_message = |{ <item>-matnr ALPHA = OUT }: 311 transferi olusturulamadi|.
*      ENDIF.
*      save_return_factory_log(
*      iv_log_uid      = lv_log_uid
*      iv_status       = 'E'
*      iv_last_message = lv_message ).
*      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*        EXPORTING
*          textid  = /iwbep/cx_mgw_busi_exception=>business_error
*          message = CONV bapi_msg( lv_message ). "lv_message.
*    ENDIF.
*    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*      EXPORTING
*        wait = abap_true.
*    UPDATE zmm_t_bdy_fsh_i
*      SET mblnr_311 = @lv_mblnr,
*          mjahr_311 = @lv_mjahr,
*          aenam     = @sy-uname,
*          aedat     = @sy-datum,
*          aezet     = @sy-uzeit
*      WHERE log_uid  = @lv_log_uid
*        AND posnr    = @<item>-posnr
*        AND category = 'FARK'.
*    UPDATE zmm_t_bdy_fsh_h
*      SET last_step = 'DIFF_311',
*          aenam     = @sy-uname,
*          aedat     = @sy-datum,
*          aezet     = @sy-uzeit
*      WHERE log_uid = @lv_log_uid.
*    COMMIT WORK AND WAIT.
*
*    CLEAR: ls_code, lt_item, lt_return, lv_mblnr, lv_mjahr.
*    IF 1 GT 2 . "702 hareketini şimdilik kapadık 19.08.2026
*
*      ls_code-gm_code = '03'.
*      APPEND VALUE #(
*        material  = <item>-matnr
*        plant     = gc_default_return_werks
*        stge_loc  = is_deep-lgort
*        move_type = gc_inv_diff_bwart
*        entry_qnt = lv_difference
*        entry_uom = <item>-meins )
*        TO lt_item.
*
*      CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
*        EXPORTING
*          goodsmvt_header  = ls_head
*          goodsmvt_code    = ls_code
*        IMPORTING
*          materialdocument = lv_mblnr
*          matdocumentyear  = lv_mjahr
*        TABLES
*          goodsmvt_item    = lt_item
*          return           = lt_return.
*
*      CLEAR lv_message.
*      LOOP AT lt_return ASSIGNING <return> WHERE type CA 'EAX'.
*        MESSAGE ID <return>-id TYPE <return>-type NUMBER <return>-number
*          WITH <return>-message_v1 <return>-message_v2
*               <return>-message_v3 <return>-message_v4
*          INTO lv_bapi_message.
*        lv_message = COND #(
*          WHEN lv_message IS INITIAL THEN lv_bapi_message
*          ELSE |{ lv_message }; { lv_bapi_message }| ).
*      ENDLOOP.
*      IF lv_message IS NOT INITIAL OR lv_mblnr IS INITIAL.
*        CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
*        IF lv_message IS INITIAL.
*          lv_message = |{ <item>-matnr ALPHA = OUT }: 702 fark hareketi olusturulamadi|.
*        ENDIF.
*        save_return_factory_log(
*        iv_log_uid      = lv_log_uid
*        iv_status       = 'E'
*        iv_last_message = lv_message ).
*        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*          EXPORTING
*            textid  = /iwbep/cx_mgw_busi_exception=>business_error
*            message = CONV bapi_msg( lv_message ). "lv_message.
*      ENDIF.
*      CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
*        EXPORTING
*          wait = abap_true.
*      UPDATE zmm_t_bdy_fsh_i
*        SET mblnr_702 = @lv_mblnr,
*            mjahr_702 = @lv_mjahr,
*            aenam     = @sy-uname,
*            aedat     = @sy-datum,
*            aezet     = @sy-uzeit
*        WHERE log_uid  = @lv_log_uid
*          AND posnr    = @<item>-posnr
*          AND category = 'FARK'.
*      UPDATE zmm_t_bdy_fsh_h
*        SET last_step = 'DIFF_702',
*            aenam     = @sy-uname,
*            aedat     = @sy-datum,
*            aezet     = @sy-uzeit
*        WHERE log_uid = @lv_log_uid.
*      COMMIT WORK AND WAIT.
*    ENDIF.
*  ENDLOOP.
*
*  save_return_factory_log(
*    iv_log_uid = lv_log_uid
*    iv_status  = 'S' ).


ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->PRINT_DESPATCH
* +-------------------------------------------------------------------------------------------------+
* | [--->] P_TYPE                         TYPE        CHAR1
* | [--->] IS_DATA                        TYPE        /DSL/ES10_S023
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD print_despatch.

    DATA: lt_uuid     TYPE stringtab,
          ls_uuid     TYPE string,
          lv_bukrs    TYPE bukrs,
          lv_url      TYPE string,
          ls_return   TYPE bapiret2,
          lv_parvl    TYPE /dsl/es10_c030-parvl,
          lt_rows     TYPE lvc_t_row,
          ls_rows     LIKE LINE OF lt_rows,
*        is_data     LIKE LINE OF gt_data,
          lt_despatch TYPE /dsl/es10_tt020,
          ls_despatch LIKE LINE OF lt_despatch,
          lv_subrc    TYPE sy-subrc,
          lo_op       TYPE REF TO /dsl/es10_cl_op,
          lv_count    TYPE i,
          lv_pgbrk    TYPE flag,
          lv_msg      TYPE string,
          lv_error    TYPE flag.

    DATA: lv_is_pdf   TYPE flag.
    DATA: lv_is_htm   TYPE flag.
    DATA: lv_create   TYPE flag.
    DATA: lv_view     TYPE flag.
    DATA: lv_viewertype(1).

    DATA: lo_badi  TYPE REF TO /dsl/es10_badi.



    lv_viewertype = p_type.
    IF lv_viewertype EQ space.
      lv_viewertype = '2'.
    ENDIF.

    CREATE OBJECT lo_op.

    lo_badi ?= /dsl/es10_cl_util=>get_badi_instance( iv_bukrs = '*' ).

    CLEAR lv_count.

    lv_bukrs = is_data-bukrs.
    ls_uuid  = is_data-uuid.
    lv_view   = 'X'.
    APPEND ls_uuid TO lt_uuid.
    MOVE-CORRESPONDING is_data TO ls_despatch.
    APPEND ls_despatch TO lt_despatch.

    ADD 1 TO lv_count.
    IF lv_count > 1.
      lv_pgbrk = 'X'.
    ENDIF.


    CLEAR lv_count.
    CLEAR lv_url.

    MOVE-CORRESPONDING is_data TO lo_op->gs_data .

    lo_op->get_log_instance(
      EXPORTING
        iv_awtyp      = is_data-awtyp
        iv_awkey      = is_data-awkey
    ).

    IF is_data-id IS NOT INITIAL.
      lo_op->get_despatch_view(
        EXPORTING
          iv_despatch_type    = 'O'
          iv_taxno            = is_data-vktcn
          iv_uuid             = is_data-uuid
          iv_bukrs            = is_data-bukrs
          iv_awkey            = is_data-awkey
          iv_awtyp            = is_data-awtyp
          iv_html_viewer_type = lv_viewertype "gc_browser "p_type "gc_browser
          iv_action           = 'PRINT'
        IMPORTING
          ev_html_url         = lv_url
      ).

    ELSE.
      CALL METHOD lo_op->create_despatch_view
        EXPORTING
          iv_awtyp  = is_data-awtyp
          iv_awkey  = is_data-awkey
          iv_type   = lv_viewertype "gc_browser "p_type "gc_browser
          iv_action = 'PRINT'
        IMPORTING
          ev_url    = lv_url.
    ENDIF.
    IF lv_url IS NOT INITIAL.
      ADD 1 TO lv_count.
      IF lv_count > 1.
        lv_pgbrk = 'X'.
      ENDIF.

      IF lv_viewertype EQ '2' .
        lo_op->attach_despatch_html(
                  iv_despatch_type = 'O'
                  iv_bukrs    = is_data-bukrs
                  iv_html_url = lv_url
                  iv_add_pagebreak = lv_pgbrk
                ).
      ENDIF.

    ELSE.
      MESSAGE e016(c+) WITH is_data-awkey INTO lv_msg.
      lo_op->go_log->e( ).
      lv_error = 'X'.

      IF lo_badi IS BOUND.
        CALL BADI lo_badi->/dsl/es10_badi_prog_if~print_despatch
          EXPORTING
            iv_action = 'PRINT_ERROR'
          CHANGING
            cs_data   = is_data.
      ENDIF .
    ENDIF.

    IF lv_count >= 1 AND lv_error IS INITIAL AND lo_op->gv_error IS INITIAL.

      MESSAGE s017(c+) WITH is_data-awkey sy-uname INTO lv_msg.
      lo_op->go_log->s( ).

      IF lo_badi IS BOUND.
        CALL BADI lo_badi->/dsl/es10_badi_prog_if~print_despatch
          EXPORTING
            iv_action = 'PRINT_SUCCESS'
            iv_url    = lv_url
          CHANGING
            cs_data   = is_data.
      ENDIF .

      lo_op->view_despatch_url_multi(
        iv_viewer_type       = '2'
        iv_print_immediately = 'X'
      ).




    ENDIF.

*  IF lv_error IS NOT INITIAL OR lo_op->gv_error IS NOT INITIAL OR lo_op->go_log->count-all GT 0.
*    lo_op->go_log->popup2( ).
*  ENDIF.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Public Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->PROCESS_RETURN_FACTORY_LOG
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_LOG_UID                     TYPE        SYSUUID_C32
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD process_return_factory_log.
    DATA: ls_log_h      TYPE zmm_t_bdy_fsh_h,
          lt_log_i      TYPE TABLE OF zmm_t_bdy_fsh_i,
          ls_log_i      TYPE zmm_t_bdy_fsh_i,
          ls_deep       TYPE ty_s_return_factory_deep,
          lv_error_text TYPE bapi_msg,
          lo_busi_error TYPE REF TO /iwbep/cx_mgw_busi_exception,
          lo_root_error TYPE REF TO cx_root.

    FIELD-SYMBOLS <deep_item> TYPE ty_s_return_factory_item.

    CLEAR: ls_log_h, ls_log_i, ls_deep, lv_error_text,
           lo_busi_error, lo_root_error.
    REFRESH lt_log_i.

    IF iv_log_uid IS INITIAL.
      RETURN.
    ENDIF.

    CALL FUNCTION 'ENQUEUE_EZMM_T_BDY_FSH'
      EXPORTING
        mandt          = sy-mandt
        log_uid        = iv_log_uid
        _scope         = '1'
        _wait          = abap_false
      EXCEPTIONS
        foreign_lock   = 1
        system_failure = 2
        OTHERS         = 3.
    IF sy-subrc <> 0.
      RETURN.
    ENDIF.

    SELECT SINGLE *
      FROM zmm_t_bdy_fsh_h
      INTO @ls_log_h
      WHERE log_uid = @iv_log_uid.
    IF sy-subrc <> 0 OR
       ls_log_h-status <> 'P' OR
       ls_log_h-last_step <> 'QUEUED'.
      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
        EXPORTING
          mandt   = sy-mandt
          log_uid = iv_log_uid
          _scope  = '1'.
      RETURN.
    ENDIF.

    SELECT *
      FROM zmm_t_bdy_fsh_i
      INTO TABLE @lt_log_i
      WHERE log_uid = @iv_log_uid
        AND menge_cikis > 0.
    IF lt_log_i[] IS INITIAL.
      SELECT SINGLE @abap_true
        FROM zmm_t_bdy_fsh_i
        WHERE log_uid = @iv_log_uid
        INTO @DATA(lv_has_count_items).
      IF lv_has_count_items = abap_true.
        save_return_factory_log(
          iv_log_uid      = iv_log_uid
          iv_status       = 'S'
          iv_last_message = 'Onay anında çıkılabilir stok bulunmadığı için mal çıkışı yapılmadı' ).
      ELSE.
        save_return_factory_log(
          iv_log_uid      = iv_log_uid
          iv_status       = 'E'
          iv_last_message = 'Fabrika gönderim arka plan kalemleri bulunamadı' ).
      ENDIF.
      CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
        EXPORTING
          mandt   = sy-mandt
          log_uid = iv_log_uid
          _scope  = '1'.
      RETURN.
    ENDIF.

    UPDATE zmm_t_bdy_fsh_h
      SET last_step    = 'RUNNING',
          last_message = @space,
          aenam        = @sy-uname,
          aedat        = @sy-datum,
          aezet        = @sy-uzeit
      WHERE log_uid = @iv_log_uid.
    COMMIT WORK AND WAIT.

    ls_deep-loguid       = iv_log_uid.
    ls_deep-lgort        = ls_log_h-lgort.
    ls_deep-sourcelgort  = ls_log_h-source_lgort.
    ls_deep-werks        = ls_log_h-werks.
    ls_deep-plakano      = ls_log_h-plaka_no.

    LOOP AT lt_log_i INTO ls_log_i.
      READ TABLE ls_deep-toitems ASSIGNING <deep_item>
        WITH KEY posnr = ls_log_i-posnr
                 matnr = ls_log_i-matnr.
      IF sy-subrc <> 0.
        APPEND INITIAL LINE TO ls_deep-toitems ASSIGNING <deep_item>.
        <deep_item>-posnr   = ls_log_i-posnr.
        <deep_item>-matnr   = ls_log_i-matnr.
        <deep_item>-meins   = ls_log_i-meins.
        <deep_item>-sapstock = ls_log_i-approval_stock.
        CLEAR <deep_item>-mengesayim.
      ENDIF.

      CASE ls_log_i-category.
        WHEN 'URETIM'.
          ADD ls_log_i-menge_cikis TO <deep_item>-mengeuretimhatali.
        WHEN 'FABLOJ'.
          ADD ls_log_i-menge_cikis TO <deep_item>-mengefabrikalojistik.
        WHEN 'SF-KATI'.
          ADD ls_log_i-menge_cikis TO <deep_item>-mengesatisfirekati.
        WHEN 'SF-SIVI'.
          ADD ls_log_i-menge_cikis TO <deep_item>-mengesatisfiresivi.
        WHEN 'SF-UHT'.
          ADD ls_log_i-menge_cikis TO <deep_item>-mengesatisfireuht.
        WHEN 'SF-CAM'.
          ADD ls_log_i-menge_cikis TO <deep_item>-mengesatisfirecam.
        WHEN 'TOPLATILAN'.
          ADD ls_log_i-menge_cikis TO <deep_item>-mengelansman.
      ENDCASE.
      ADD ls_log_i-menge_cikis TO <deep_item>-mengesayim.
    ENDLOOP.

    mv_factory_background = abap_true.
    TRY.
        execute_factory_shipment(
          is_deep  = ls_deep
          iv_werks = ls_log_h-werks ).
      CATCH /iwbep/cx_mgw_busi_exception INTO lo_busi_error.
        lv_error_text = lo_busi_error->get_text( ).
        save_return_factory_log(
          iv_log_uid      = iv_log_uid
          iv_status       = 'E'
          iv_last_message = lv_error_text ).
      CATCH cx_root INTO lo_root_error.
        lv_error_text = lo_root_error->get_text( ).
        save_return_factory_log(
          iv_log_uid      = iv_log_uid
          iv_status       = 'E'
          iv_last_message = lv_error_text ).
    ENDTRY.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_FSH'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid
        _scope  = '1'.
    CLEAR mv_factory_background.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->RAISE_BAPI_MESSAGES
* +-------------------------------------------------------------------------------------------------+
* | [--->] IT_RETURN                      TYPE        BAPIRET2_T
* | [--->] IV_DEFAULT_TEXT                TYPE        STRING
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD raise_bapi_messages.
    DATA(lv_message) = REDUCE string(
          INIT text = ``
          FOR row IN it_return
          WHERE ( type = 'E' OR type = 'A' )
          NEXT text = COND #(
            WHEN text IS INITIAL THEN row-message
            ELSE |{ text }; { row-message }| ) ).

    IF lv_message IS INITIAL.
      lv_message = iv_default_text.
    ENDIF.

    DATA(lo_message_container) = mo_context->get_message_container( ).
    lo_message_container->add_messages_from_bapi(
      it_bapi_messages = it_return ).

    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid            = /iwbep/cx_mgw_busi_exception=>business_error
*        message           = lv_message
        message_container = lo_message_container.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->RETURNFACTORYAPP_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_RETURNFACTORYAPPROVAL
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD returnfactoryapp_get_entityset.
    TYPES:
      BEGIN OF ty_stock,
        lgort TYPE lgort_d,
        matnr TYPE matnr,
        labst TYPE labst,
      END OF ty_stock,
      BEGIN OF ty_hash_material,
        log_uid   TYPE sysuuid_c32,
        matnr     TYPE matnr,
        stock_qty TYPE labst,
        total_qty TYPE menge_d,
      END OF ty_hash_material,
      BEGIN OF ty_hash_result,
        log_uid TYPE sysuuid_c32,
        hash    TYPE string,
      END OF ty_hash_result,
      BEGIN OF ty_count_snapshot,
        log_uid   TYPE sysuuid_c32,
        posnr     TYPE posnr,
        matnr     TYPE matnr,
        count_qty TYPE menge_d,
      END OF ty_count_snapshot.

    DATA: lr_log_uid       TYPE RANGE OF sysuuid_c32,
          lr_status        TYPE RANGE OF char1,
          lr_last_step     TYPE RANGE OF zmm_de_bdy_step,
          lr_lgort         TYPE RANGE OF lgort_d,
          lr_source_lgort  TYPE RANGE OF lgort_d,
          lr_matnr         TYPE RANGE OF matnr,
          lt_headers       TYPE TABLE OF zmm_t_bdy_fsh_h,
          lt_items         TYPE TABLE OF zmm_t_bdy_fsh_i,
          lt_stock         TYPE SORTED TABLE OF ty_stock
                             WITH UNIQUE KEY lgort matnr,
          lt_hash_material TYPE SORTED TABLE OF ty_hash_material
                             WITH UNIQUE KEY log_uid matnr,
          lt_hash_result   TYPE HASHED TABLE OF ty_hash_result
                             WITH UNIQUE KEY log_uid,
          lt_count_snapshot TYPE HASHED TABLE OF ty_count_snapshot
                              WITH UNIQUE KEY log_uid posnr matnr,
          lv_snapshot_text TYPE string,
          lv_snapshot_hash TYPE string.

    LOOP AT it_filter_select_options ASSIGNING FIELD-SYMBOL(<filter>).
      DATA(lv_property) = to_upper( <filter>-property ).
      CASE lv_property.
        WHEN 'LOGUID'.
          LOOP AT <filter>-select_options ASSIGNING FIELD-SYMBOL(<option>).
            APPEND CORRESPONDING #( <option> ) TO lr_log_uid.
          ENDLOOP.
        WHEN 'STATUS'.
          LOOP AT <filter>-select_options ASSIGNING <option>.
            APPEND CORRESPONDING #( <option> ) TO lr_status.
          ENDLOOP.
        WHEN 'LASTSTEP'.
          LOOP AT <filter>-select_options ASSIGNING <option>.
            APPEND CORRESPONDING #( <option> ) TO lr_last_step.
          ENDLOOP.
        WHEN 'LGORT'.
          LOOP AT <filter>-select_options ASSIGNING <option>.
            APPEND CORRESPONDING #( <option> ) TO lr_lgort.
          ENDLOOP.
      ENDCASE.
    ENDLOOP.

    "LogUid verilmeden açılan liste varsayılan olarak onay bekleyenleri gösterir.
    IF lr_log_uid[] IS INITIAL
       AND lr_status[] IS INITIAL
       AND lr_last_step[] IS INITIAL.
      APPEND VALUE #( sign = 'I' option = 'EQ' low = 'P' ) TO lr_status.
      APPEND VALUE #( sign = 'I' option = 'EQ' low = 'WAIT_APPROVAL' )
        TO lr_last_step.
    ELSE.
      IF lr_status[] IS INITIAL.
        APPEND VALUE #( sign = 'I' option = 'CP' low = '*' ) TO lr_status.
      ENDIF.
      IF lr_last_step[] IS INITIAL.
        APPEND VALUE #( sign = 'I' option = 'CP' low = '*' ) TO lr_last_step.
      ENDIF.
    ENDIF.

    IF lr_log_uid[] IS INITIAL AND lr_lgort[] IS INITIAL.
      SELECT *
        FROM zmm_t_bdy_fsh_h
        INTO TABLE @lt_headers
        WHERE status    IN @lr_status
          AND last_step IN @lr_last_step.
    ELSEIF lr_log_uid[] IS NOT INITIAL AND lr_lgort[] IS INITIAL.
      SELECT *
        FROM zmm_t_bdy_fsh_h
        INTO TABLE @lt_headers
        WHERE log_uid  IN @lr_log_uid
          AND status    IN @lr_status
          AND last_step IN @lr_last_step.
    ELSEIF lr_log_uid[] IS INITIAL AND lr_lgort[] IS NOT INITIAL.
      SELECT *
        FROM zmm_t_bdy_fsh_h
        INTO TABLE @lt_headers
        WHERE lgort     IN @lr_lgort
          AND status    IN @lr_status
          AND last_step IN @lr_last_step.
    ELSE.
      SELECT *
        FROM zmm_t_bdy_fsh_h
        INTO TABLE @lt_headers
        WHERE log_uid  IN @lr_log_uid
          AND lgort     IN @lr_lgort
          AND status    IN @lr_status
          AND last_step IN @lr_last_step.
    ENDIF.
    IF lt_headers[] IS INITIAL.
      RETURN.
    ENDIF.
    SORT lt_headers BY log_uid.

    SELECT *
      FROM zmm_t_bdy_fsh_i
      INTO TABLE @lt_items
      FOR ALL ENTRIES IN @lt_headers
      WHERE log_uid = @lt_headers-log_uid.
    IF lt_items[] IS INITIAL.
      RETURN.
    ENDIF.

    LOOP AT lt_headers ASSIGNING FIELD-SYMBOL(<header>).
      APPEND VALUE #( sign = 'I' option = 'EQ' low = <header>-source_lgort )
        TO lr_source_lgort.
    ENDLOOP.
    SORT lr_source_lgort BY low.
    DELETE ADJACENT DUPLICATES FROM lr_source_lgort COMPARING low.

    LOOP AT lt_items ASSIGNING FIELD-SYMBOL(<item>).
      APPEND VALUE #( sign = 'I' option = 'EQ' low = <item>-matnr ) TO lr_matnr.
    ENDLOOP.
    SORT lr_matnr BY low.
    DELETE ADJACENT DUPLICATES FROM lr_matnr COMPARING low.

    SELECT mard~lgort,
           mard~matnr,
           SUM( mard~labst ) AS labst
      FROM mard
      INNER JOIN mara ON mara~matnr = mard~matnr
                     AND mara~mtart <> 'ZSTK'
      WHERE mard~werks = @gc_default_return_werks
        AND mard~lgort IN @lr_source_lgort
        AND mard~matnr IN @lr_matnr
      GROUP BY mard~lgort, mard~matnr
      INTO TABLE @DATA(lt_stock_raw).
    lt_stock = CORRESPONDING #( lt_stock_raw ).

    SELECT matnr, maktx
      FROM makt
      INTO TABLE @DATA(lt_makt)
      WHERE matnr IN @lr_matnr
        AND spras = @sy-langu.
    SORT lt_makt BY matnr.

    LOOP AT lt_items ASSIGNING <item>.
      READ TABLE lt_headers ASSIGNING <header>
        WITH KEY log_uid = <item>-log_uid BINARY SEARCH.
      IF sy-subrc <> 0.
        CONTINUE.
      ENDIF.

      READ TABLE et_entityset ASSIGNING FIELD-SYMBOL(<approval>)
        WITH KEY loguid = <item>-log_uid
                 posnr = <item>-posnr
                 matnr = <item>-matnr.
      IF sy-subrc <> 0.
        APPEND INITIAL LINE TO et_entityset ASSIGNING <approval>.
        <approval>-loguid      = <item>-log_uid.
        <approval>-posnr       = <item>-posnr.
        <approval>-matnr       = <item>-matnr.
        <approval>-meins       = <item>-meins.

        CALL FUNCTION 'CONVERSION_EXIT_CUNIT_OUTPUT'
          EXPORTING
            input          = <item>-meins
            language       = sy-langu
          IMPORTING
            output         = <approval>-meins
          EXCEPTIONS
            unit_not_found = 1
            OTHERS         = 2.


        <approval>-werks       = <header>-werks.
        <approval>-lgort       = <header>-lgort.
        <approval>-sourcelgort = <header>-source_lgort.
        <approval>-plakano     = <header>-plaka_no.
        <approval>-status      = <header>-status.
        <approval>-laststep    = <header>-last_step.
        <approval>-lastmessage = <header>-last_message.
        CONVERT DATE <header>-irs_tar TIME '000000'
          INTO TIME STAMP <approval>-irstar TIME ZONE sy-zonlo.

        READ TABLE lt_makt INTO DATA(ls_makt)
          WITH KEY matnr = <item>-matnr BINARY SEARCH.
        IF sy-subrc = 0.
          <approval>-maktx = ls_makt-maktx.
        ENDIF.

        READ TABLE lt_stock ASSIGNING FIELD-SYMBOL(<stock>)
          WITH TABLE KEY lgort = <header>-source_lgort
                         matnr = <item>-matnr.
        IF sy-subrc = 0.
          <approval>-mevcutstok = <stock>-labst.
        ENDIF.
      ENDIF.

      IF <item>-category = 'FARK'.
        READ TABLE lt_count_snapshot
          ASSIGNING FIELD-SYMBOL(<count_snapshot>)
          WITH TABLE KEY log_uid = <item>-log_uid
                         posnr   = <item>-posnr
                         matnr   = <item>-matnr.
        IF sy-subrc <> 0.
          INSERT VALUE #(
            log_uid   = <item>-log_uid
            posnr     = <item>-posnr
            matnr     = <item>-matnr
            count_qty = <item>-sap_stock - <item>-menge )
            INTO TABLE lt_count_snapshot.
        ENDIF.
        CONTINUE.
      ENDIF.

      CASE <item>-category.
        WHEN 'SF-KATI' OR 'SF-SIVI' OR 'SF-UHT' OR 'SF-CAM'.
          <approval>-satisfiresi = <approval>-satisfiresi + <item>-menge.
        WHEN 'URETIM'.
          <approval>-uretimhatali = <approval>-uretimhatali + <item>-menge.
        WHEN 'FABLOJ'.
          <approval>-fabrikalojistik =
            <approval>-fabrikalojistik + <item>-menge.
      ENDCASE.
      <approval>-toplamsayim = <approval>-toplamsayim + <item>-menge.

      IF <approval>-ebeln IS INITIAL AND <item>-ebeln IS NOT INITIAL.
        <approval>-ebeln = <item>-ebeln.
      ENDIF.
      IF <approval>-mblnr351 IS INITIAL AND <item>-mblnr_351 IS NOT INITIAL.
        <approval>-mblnr351 = <item>-mblnr_351.
        <approval>-mjahr351 = <item>-mjahr_351.
      ENDIF.
    ENDLOOP.

    "Action ile aynı algoritmayı kullanarak LOG_UID bazında stok snapshot'ı üret.
    " Diger, SF / Uretim Hatali / Fabrika Lojistik dagilimi disinda
    " MARD stokta kalan miktardir. Fiziksel sayim FARK snapshot'indan okunur.
    LOOP AT et_entityset ASSIGNING <approval>.
      DATA(lv_distribution_qty) =
          <approval>-satisfiresi
        + <approval>-uretimhatali
        + <approval>-fabrikalojistik.

      <approval>-diger = <approval>-mevcutstok - lv_distribution_qty.
      IF <approval>-diger < 0.
        CLEAR <approval>-diger.
      ENDIF.

      READ TABLE lt_count_snapshot ASSIGNING <count_snapshot>
        WITH TABLE KEY log_uid = <approval>-loguid
                       posnr   = <approval>-posnr
                       matnr   = <approval>-matnr.
      IF sy-subrc = 0.
        <approval>-toplamsayim = <count_snapshot>-count_qty.
        IF <approval>-toplamsayim < 0.
          CLEAR <approval>-toplamsayim.
        ENDIF.
      ENDIF.

      <approval>-fark =
        <approval>-mevcutstok - <approval>-toplamsayim.
    ENDLOOP.

    LOOP AT et_entityset ASSIGNING <approval>.
      READ TABLE lt_hash_material ASSIGNING FIELD-SYMBOL(<hash_material>)
        WITH TABLE KEY log_uid = <approval>-loguid
                       matnr   = <approval>-matnr.
      IF sy-subrc <> 0.
        INSERT VALUE #(
          log_uid   = <approval>-loguid
          matnr     = <approval>-matnr
          stock_qty = <approval>-mevcutstok )
          INTO TABLE lt_hash_material ASSIGNING <hash_material>.
      ENDIF.
      <hash_material>-total_qty =
        <hash_material>-total_qty + <approval>-toplamsayim.
    ENDLOOP.

    LOOP AT lt_hash_material ASSIGNING <hash_material>.
      AT NEW log_uid.
        CLEAR lv_snapshot_text.
      ENDAT.
      lv_snapshot_text = |{ lv_snapshot_text }#{ <hash_material>-matnr }| &&
                         |:{ <hash_material>-stock_qty }:{ <hash_material>-total_qty }|.
      AT END OF log_uid.
        CLEAR lv_snapshot_hash.
        TRY.
            cl_abap_message_digest=>calculate_hash_for_char(
              EXPORTING
                if_algorithm  = 'SHA256'
                if_data       = lv_snapshot_text
              IMPORTING
                ef_hashstring = lv_snapshot_hash ).
          CATCH cx_abap_message_digest.
            CLEAR lv_snapshot_hash.
        ENDTRY.
        INSERT VALUE #( log_uid = <hash_material>-log_uid
                        hash    = lv_snapshot_hash )
          INTO TABLE lt_hash_result.
      ENDAT.
    ENDLOOP.

    LOOP AT et_entityset ASSIGNING <approval>.
      READ TABLE lt_hash_result ASSIGNING FIELD-SYMBOL(<hash_result>)
        WITH TABLE KEY log_uid = <approval>-loguid.
      IF sy-subrc = 0.
        <approval>-snapshothash = <hash_result>-hash.
      ENDIF.
    ENDLOOP.

    SORT et_entityset BY loguid posnr matnr.



  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->RETURNFACTORYSTO_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_RETURNFACTORYSTOCK
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD returnfactorysto_get_entityset.
  TYPES:
    BEGIN OF ty_pending_quantity,
      matnr                   TYPE matnr,
      menge_uretim            TYPE menge_d,
      menge_fabloj            TYPE menge_d,
      menge_sf_kati           TYPE menge_d,
      menge_sf_sivi           TYPE menge_d,
      menge_sf_uht            TYPE menge_d,
      menge_sf_cam            TYPE menge_d,
      menge_toplatilan        TYPE menge_d,
      legacy_total            TYPE menge_d,
      count_qty               TYPE menge_d,
      has_snapshot            TYPE abap_bool,
    END OF ty_pending_quantity.

  DATA:
    lv_lgort        TYPE lgort_d,
    lv_source_lgort TYPE lgort_d,
    lv_werks        TYPE werks_d VALUE gc_default_return_werks,
    lv_mjahr        TYPE mseg-mjahr,
    lv_budat        TYPE mkpf-budat,
    lt_pending_quantity TYPE SORTED TABLE OF ty_pending_quantity
                          WITH UNIQUE KEY matnr.


  LOOP AT it_filter_select_options ASSIGNING FIELD-SYMBOL(<filter>).
    IF <filter>-property = 'Lgort'.
      lv_lgort = VALUE #( <filter>-select_options[ 1 ]-low OPTIONAL ).
      EXIT.
    ENDIF.
  ENDLOOP.

  IF lv_lgort NE '1902'.
    RETURN.
  ENDIF.


  IF lv_lgort IS INITIAL.
    lv_lgort = '1900'.
  ENDIF.
  lv_source_lgort = derive_return_lgort( lv_lgort ).

  " CDS Parametreleri için Tarih/Yıl Ataması (Mevcut yılın 1. ayının 1. günü)
  lv_mjahr = sy-datum(4).
  lv_budat = sy-datum.
*    lv_budat = sy-datum(4) && '0101'.

  " 1. Standart MARD Stoğunu Çekme
  SELECT mard~werks,
         @lv_lgort AS lgort,
         @lv_source_lgort AS source_lgort,
         mard~matnr,
         makt~maktx,
         mara~meins,
         SUM( mard~labst ) AS sapstock
    FROM mard
    INNER JOIN mara ON mara~matnr = mard~matnr
                   AND mara~mtart NE 'ZSTK'
    LEFT OUTER JOIN makt ON makt~matnr = mard~matnr
                        AND makt~spras = @sy-langu
    WHERE mard~werks = @lv_werks
      AND mard~lgort = @lv_source_lgort
      AND mard~labst > 0
    GROUP BY mard~werks, mard~matnr, makt~maktx, mara~meins
    INTO CORRESPONDING FIELDS OF TABLE @et_entityset.

  IF et_entityset IS NOT INITIAL.
    SORT et_entityset BY matnr.

    " 2. CDS View'dan Kırılımlı İade Miktarlarını Toplu Çekme
    SELECT *
      FROM zi_bdy_return_stock_param( p_werks = @lv_werks,
                                      p_lgort = @lv_source_lgort,
                                      p_mjahr = @lv_mjahr,
                                      p_budat = @lv_budat )
      INTO TABLE @DATA(lt_cds_stock).

    IF sy-subrc = 0.
      " Binary Search için tabloyu hazırlıyoruz
      SORT lt_cds_stock BY malzeme.
    ENDIF.
  ENDIF.

  DATA:
    lv_create_allowed TYPE abap_bool VALUE abap_true,
    ls_blocking       TYPE zmm_t_bdy_fsh_h.

  SELECT *
    FROM zmm_t_bdy_fsh_h
    WHERE lgort  = @lv_lgort
      AND status <> 'S'
      AND status <> 'R'
    ORDER BY erdat DESCENDING,
             erzet DESCENDING
    INTO @ls_blocking
    UP TO 1 ROWS.
  ENDSELECT.

  IF sy-subrc = 0.
    lv_create_allowed = abap_false.

    SELECT *
      FROM zmm_t_bdy_fsh_i
      INTO TABLE @DATA(lt_pending_items)
      WHERE log_uid = @ls_blocking-log_uid.

    LOOP AT lt_pending_items ASSIGNING FIELD-SYMBOL(<pending_item>).
      READ TABLE lt_pending_quantity
        ASSIGNING FIELD-SYMBOL(<pending_quantity>)
        WITH TABLE KEY matnr = <pending_item>-matnr.
      IF sy-subrc <> 0.
        INSERT VALUE #( matnr = <pending_item>-matnr )
          INTO TABLE lt_pending_quantity ASSIGNING <pending_quantity>.
      ENDIF.

      CASE <pending_item>-category.
        WHEN 'URETIM'.
          ADD <pending_item>-menge TO <pending_quantity>-menge_uretim.
        WHEN 'FABLOJ'.
          ADD <pending_item>-menge TO <pending_quantity>-menge_fabloj.
        WHEN 'SF-KATI'.
          ADD <pending_item>-menge TO <pending_quantity>-menge_sf_kati.
        WHEN 'SF-SIVI'.
          ADD <pending_item>-menge TO <pending_quantity>-menge_sf_sivi.
        WHEN 'SF-UHT'.
          ADD <pending_item>-menge TO <pending_quantity>-menge_sf_uht.
        WHEN 'SF-CAM'.
          ADD <pending_item>-menge TO <pending_quantity>-menge_sf_cam.
        WHEN 'TOPLATILAN'.
          ADD <pending_item>-menge TO <pending_quantity>-menge_toplatilan.
        WHEN 'FARK'.
          <pending_quantity>-has_snapshot = abap_true.
          <pending_quantity>-count_qty =
            <pending_item>-sap_stock - <pending_item>-menge.
          IF <pending_quantity>-count_qty < 0.
            CLEAR <pending_quantity>-count_qty.
          ENDIF.
      ENDCASE.

      IF <pending_item>-category <> 'FARK'.
        ADD <pending_item>-menge TO <pending_quantity>-legacy_total.
      ENDIF.
    ENDLOOP.
  ENDIF.


  " 3. OData Entity Set Dönüşü ve Veri Eşleştirme
  LOOP AT et_entityset ASSIGNING FIELD-SYMBOL(<fs_set>).

    <fs_set>-createallowed = lv_create_allowed.

    IF lv_create_allowed = abap_false.
      <fs_set>-blockingloguid   = ls_blocking-log_uid.
      <fs_set>-blockingstatus   = ls_blocking-status.
      <fs_set>-blockinglaststep = ls_blocking-last_step.
      <fs_set>-blockingmessage  = ls_blocking-last_message.
    ENDIF.

    CALL FUNCTION 'CONVERSION_EXIT_CUNIT_OUTPUT'
      EXPORTING
        input          = <fs_set>-meins
        language       = sy-langu
      IMPORTING
        output         = <fs_set>-meins
      EXCEPTIONS
        unit_not_found = 1.

    " İade miktarlarını CDS sonucundan bul ve Entity alanlarına set et
    IF lt_cds_stock IS NOT INITIAL.
      READ TABLE lt_cds_stock ASSIGNING FIELD-SYMBOL(<fs_cds>)
           WITH KEY malzeme = <fs_set>-matnr BINARY SEARCH.

      IF sy-subrc = 0.
        <fs_set>-mengeuretimhatali    = <fs_cds>-mengeuretimhatali.
        <fs_set>-mengefabrikalojistik = <fs_cds>-mengefabrikalojistik.
        <fs_set>-mengesatisfirekati   = <fs_cds>-mengesatisfirekati.
        <fs_set>-mengesatisfiresivi   = <fs_cds>-mengesatisfiresivi.
        <fs_set>-mengesatisfireuht    = <fs_cds>-mengesatisfireuht.
        <fs_set>-mengesatisfirecam    = <fs_cds>-mengesatisfirecam.
      ENDIF.
    ENDIF.

    " Onaya gonderilmis kayit varsa CDS yerine log snapshot miktarlari acilir.
    IF lv_create_allowed = abap_false.
      READ TABLE lt_pending_quantity ASSIGNING <pending_quantity>
        WITH TABLE KEY matnr = <fs_set>-matnr.
      IF sy-subrc = 0.
        <fs_set>-mengeuretimhatali    = <pending_quantity>-menge_uretim.
        <fs_set>-mengefabrikalojistik = <pending_quantity>-menge_fabloj.
        <fs_set>-mengesatisfirekati   = <pending_quantity>-menge_sf_kati.
        <fs_set>-mengesatisfiresivi   = <pending_quantity>-menge_sf_sivi.
        <fs_set>-mengesatisfireuht    = <pending_quantity>-menge_sf_uht.
        <fs_set>-mengesatisfirecam    = <pending_quantity>-menge_sf_cam.
        <fs_set>-mengelansman         = <pending_quantity>-menge_toplatilan.
        <fs_set>-mengesayim = COND #(
          WHEN <pending_quantity>-has_snapshot = abap_true
          THEN <pending_quantity>-count_qty
          ELSE <pending_quantity>-legacy_total ).
      ENDIF.
    ENDIF.

  ENDLOOP.

ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->RETURNFACTORYVEH_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_RETURNFACTORYVEHICLE
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD returnfactoryveh_get_entityset.
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
           sefer~plaka_no AS plakano
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

    SORT et_entityset BY plakano.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->RETURNHEADERSET_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_RETURNHEADER
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD returnheaderset_get_entityset.
    DATA:
      lt_headers TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>tt_returnheader,
      lt_items   TYPE ty_t_return_item.

    load_return_data(
      EXPORTING
        it_filter_select_options = it_filter_select_options
      IMPORTING
        et_headers               = lt_headers
        et_items                 = lt_items ).

    "GET_ENTITYSET returns headers. The framework resolves ToItems through
    "RETURNITEM_GET_ENTITYSET when the request uses $expand=ToItems.
    et_entityset = CORRESPONDING #( lt_headers ).
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->RETURNITEMSET_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_RETURNITEM
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD returnitemset_get_entityset.
    DATA:
      lt_headers TYPE zcl_zmm_bolge_depo_yon_mpc_ext=>tt_returnheader,
      lt_items   TYPE ty_t_return_item,
      lv_log_uid TYPE sysuuid_c32.

    "Navigation request:
    "ReturnHeaderSet(LogUid='...')/ToItems
    IF iv_source_name = 'ReturnHeader'.
      READ TABLE it_key_tab
        WITH KEY name = 'LogUid'
        INTO DATA(ls_key).
      IF sy-subrc = 0.
        lv_log_uid = ls_key-value.
      ENDIF.
    ENDIF.

    load_return_data(
      EXPORTING
        it_filter_select_options = it_filter_select_options
      IMPORTING
        et_headers               = lt_headers
        et_items                 = lt_items ).

    IF lv_log_uid IS INITIAL.
      et_entityset = CORRESPONDING #( lt_items ).
    ELSE.
      LOOP AT lt_items ASSIGNING FIELD-SYMBOL(<nav_item>)
        WHERE loguid = lv_log_uid.
        APPEND CORRESPONDING #( <nav_item> ) TO et_entityset.
      ENDLOOP.
    ENDIF.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->RETURNMDPLASIYER_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_RETURNMDPLASIYER
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD returnmdplasiyer_get_entityset.
*    DATA: BEGIN OF lt_kna1 OCCURS 1,
*            kunnr LIKE kna1-kunnr,
*            name1 LIKE kna1-name1,
*          END OF lt_kna1.

    DATA: lt_tvbur TYPE TABLE OF tvbur,
          lr_vkbur TYPE RANGE OF tvbur-vkbur,
          ls_vkbur LIKE LINE OF lr_vkbur.

    " 1. Satış Bürolarını Getir
    SELECT * FROM tvbur INTO TABLE lt_tvbur.

    " 2. Satış Büroları İçin Yetki Kontrolü Yap (Z_VBRP_VKB)
    LOOP AT lt_tvbur INTO DATA(ls_tvbur).
      AUTHORITY-CHECK OBJECT 'Z_VBRP_VKB'
               ID 'VKBUR' FIELD ls_tvbur-vkbur
               ID 'ACTVT' FIELD '03'.
      IF sy-subrc = 0.
        CLEAR: ls_vkbur.
        ls_vkbur-sign   = 'I'.
        ls_vkbur-option = 'EQ'.
        ls_vkbur-low    = ls_tvbur-vkbur.
        APPEND ls_vkbur TO lr_vkbur.
      ENDIF.
    ENDLOOP.

    SELECT kna1~kunnr, kna1~name1
    INTO TABLE @DATA(lt_kna1)
    FROM kna1
    INNER JOIN knvv ON kna1~kunnr = knvv~kunnr
    WHERE kna1~ktokd = 'Z01'
      AND kna1~aufsd = @space " Sipariş blokesi olmayan aktif müşteriler
      AND knvv~vkorg = '1000'
      AND knvv~vtweg = '10'
      AND knvv~spart = '00'
      AND knvv~vkbur IN @lr_vkbur.


    et_entityset[] = VALUE #( FOR ls_kna1 IN lt_kna1 ( plasiyerno = ls_kna1-kunnr plasiyername = ls_kna1-name1 ) ).

  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->RETURNMDURUNSET_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_RETURNMDURUN
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD returnmdurunset_get_entityset.
    DATA : lv_kunnr TYPE kunnr.
    LOOP AT it_filter_select_options ASSIGNING FIELD-SYMBOL(<filter>).
      IF <filter>-property = 'Plasiyer' OR <filter>-property EQ 'PLASIYER'.
        lv_kunnr = VALUE #( <filter>-select_options[ 1 ]-low OPTIONAL ).
        lv_kunnr = |{ lv_kunnr ALPHA = IN }|.
        EXIT.
      ENDIF.
    ENDLOOP.

    SELECT DISTINCT a~matnr, b~meins, c~maktx
      FROM kotg507 AS a
      INNER JOIN mara AS b ON a~matnr EQ b~matnr
      INNER JOIN makt AS c ON b~matnr EQ c~matnr
                          AND c~spras EQ @sy-langu
      INTO TABLE @DATA(lt_mara)
      WHERE a~kappl EQ 'V'
        AND a~kschl EQ 'A001'
        AND a~kunag EQ @lv_kunnr
        AND a~datab LE @sy-datum
        AND a~datbi GE @sy-datum.
    IF sy-subrc NE 0.
      SELECT mara~matnr, meins, maktx
        FROM mara
        INNER JOIN makt ON mara~matnr EQ makt~matnr
        INNER JOIN mvke ON mara~matnr EQ mvke~matnr
                       AND mvke~vkorg EQ '1000'
                       AND mvke~vtweg EQ '10'
        INTO TABLE @lt_mara
        WHERE mtart EQ 'ZURN'
          AND mstae EQ '00'
          AND mstav EQ @space
          AND spras EQ @sy-langu
          AND vmsta EQ @space.
    ENDIF.

    IF lt_mara[] IS NOT INITIAL.
      SELECT * FROM zeba_t_son_iade
        INTO TABLE @DATA(lt_lansman)
        FOR ALL ENTRIES IN @lt_mara
         WHERE matnr EQ @lt_mara-matnr
        ORDER BY PRIMARY KEY.
    ENDIF.

    DATA ls_entityset LIKE LINE OF et_entityset.

    LOOP AT lt_mara INTO DATA(ls_mara).
      ls_entityset-urunno  = ls_mara-matnr.
      ls_entityset-urunadi = ls_mara-maktx.

      CALL FUNCTION 'CONVERSION_EXIT_CUNIT_OUTPUT'
        EXPORTING
          input          = ls_mara-meins
          language       = sy-langu
        IMPORTING
          output         = ls_entityset-meins
        EXCEPTIONS
          unit_not_found = 1.

*      ls_entityset-meins   = ls_mara-meins.
      READ TABLE lt_lansman INTO DATA(ls_lansman) WITH KEY matnr = ls_mara-matnr BINARY SEARCH.
      IF sy-subrc = 0 AND ls_lansman-iade_tarihi IS NOT INITIAL  AND ls_lansman-iade_tarihi >= sy-datum.
        ls_entityset-lansman = abap_true.
      ENDIF.
      APPEND ls_entityset TO et_entityset.
      CLEAR ls_entityset.
    ENDLOOP.
*    et_entityset[] = VALUE #( FOR ls_mara IN lt_mara
*                              for ls_lansman in lt_lansman where ( matnr = ls_mara-matnr )
*     ( urunno = ls_mara-matnr urunadi = ls_mara-maktx meins = ls_mara-meins ) ).
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->SAVE_RETURN_DEPOSIT_DRAFT
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_LOG_UID                     TYPE        SYSUUID_C32
* | [--->] IV_PLASIYER                    TYPE        KUNNR
* | [--->] IV_LGORT                       TYPE        LGORT_D
* | [--->] IV_MATNR                       TYPE        MATNR
* | [--->] IV_MEINS                       TYPE        MEINS
* | [--->] IV_MENGE_SIPARIS               TYPE        KWMENG
* | [--->] IV_MENGE_SAYIM                 TYPE        KWMENG
* | [--->] IV_IS_EXTERNAL                 TYPE        ABAP_BOOL
* | [--->] IV_IS_CONFIRMED                TYPE        ABAP_BOOL
* | [--->] IV_IS_DELETED                  TYPE        ABAP_BOOL
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
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

    CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
      EXPORTING
        input  = iv_meins
*       LANGUAGE             = SY-LANGU
      IMPORTING
        output = ls_item-meins
* EXCEPTIONS
*       UNIT_NOT_FOUND       = 1
      .

    IF iv_menge_sayim GT 0.
*    ls_item-meins         = iv_meins.
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
    ELSE.
      DELETE FROM zmm_t_bdy_irs_di
      WHERE log_uid = iv_log_uid
        AND matnr   = lv_matnr.
    ENDIF.
    COMMIT WORK AND WAIT.
    CALL FUNCTION 'DEQUEUE_EZMM_T_BDY_IRS_D'
      EXPORTING
        mandt   = sy-mandt
        log_uid = iv_log_uid.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->SAVE_RETURN_FACTORY_LOG
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_LOG_UID                     TYPE        SYSUUID_C32
* | [--->] IV_STATUS                      TYPE        CHAR1
* | [--->] IV_LAST_MESSAGE                TYPE        BAPI_MSG(optional)
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD save_return_factory_log.
    IF iv_log_uid IS INITIAL.
      RETURN.
    ENDIF.

    DATA(lv_last_message) = CONV zmm_de_bdy_msg( iv_last_message ).
    DATA(lv_last_step) = COND zmm_de_bdy_step(
      WHEN iv_status = 'S' THEN 'COMPLETE'
      WHEN iv_status = 'E' THEN 'ERROR'
      WHEN iv_status = 'R' THEN 'REJECTED'
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


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->SCHEDULE_RETURN_FACTORY_JOB
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_LOG_UID                     TYPE        SYSUUID_C32
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD schedule_return_factory_job.
    DATA: lv_jobname  TYPE btcjob,
          lv_jobcount TYPE btcjobcnt,
          lv_message  TYPE bapi_msg.

    CLEAR: lv_jobname, lv_jobcount, lv_message.
    lv_jobname = |ZBDY_FSH_{ iv_log_uid(20) }|.

    CALL FUNCTION 'JOB_OPEN'
      EXPORTING
        jobname          = lv_jobname
      IMPORTING
        jobcount         = lv_jobcount
      EXCEPTIONS
        cant_create_job  = 1
        invalid_job_data = 2
        jobname_missing  = 3
        OTHERS           = 4.
    IF sy-subrc <> 0.
      lv_message = |Fabrika gönderim arka plan işi açılamadı ({ sy-subrc })|.
      save_return_factory_log(
        iv_log_uid      = iv_log_uid
        iv_status       = 'E'
        iv_last_message = lv_message ).
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = lv_message.
    ENDIF.

    SUBMIT zmm_r_bdy_factory_shipment_bg
      WITH p_uid = iv_log_uid
      VIA JOB lv_jobname NUMBER lv_jobcount
      AND RETURN.
    IF sy-subrc <> 0.
      lv_message = |Fabrika gönderim arka plan adımı job'a eklenemedi ({ sy-subrc })|.
      save_return_factory_log(
        iv_log_uid      = iv_log_uid
        iv_status       = 'E'
        iv_last_message = lv_message ).
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = lv_message.
    ENDIF.

    CALL FUNCTION 'JOB_CLOSE'
      EXPORTING
        jobcount             = lv_jobcount
        jobname              = lv_jobname
        strtimmed            = abap_true
      EXCEPTIONS
        cant_start_immediate = 1
        invalid_startdate    = 2
        jobname_missing      = 3
        job_close_failed     = 4
        job_nosteps          = 5
        job_notex            = 6
        lock_failed          = 7
        invalid_target       = 8
        OTHERS               = 9.
    IF sy-subrc <> 0.
      lv_message = |Fabrika gönderim arka plan işi başlatılamadı ({ sy-subrc })|.
      save_return_factory_log(
        iv_log_uid      = iv_log_uid
        iv_status       = 'E'
        iv_last_message = lv_message ).
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = lv_message.
    ENDIF.

    UPDATE zmm_t_bdy_fsh_h
      SET jobname  = @lv_jobname,
          jobcount = @lv_jobcount,
          aenam    = @sy-uname,
          aedat    = @sy-datum,
          aezet    = @sy-uzeit
      WHERE log_uid = @iv_log_uid.
    COMMIT WORK AND WAIT.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Protected Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->SHIPMENTSET_GET_ENTITYSET
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_ENTITY_NAME                 TYPE        STRING
* | [--->] IV_ENTITY_SET_NAME             TYPE        STRING
* | [--->] IV_SOURCE_NAME                 TYPE        STRING
* | [--->] IT_FILTER_SELECT_OPTIONS       TYPE        /IWBEP/T_MGW_SELECT_OPTION
* | [--->] IS_PAGING                      TYPE        /IWBEP/S_MGW_PAGING
* | [--->] IT_KEY_TAB                     TYPE        /IWBEP/T_MGW_NAME_VALUE_PAIR
* | [--->] IT_NAVIGATION_PATH             TYPE        /IWBEP/T_MGW_NAVIGATION_PATH
* | [--->] IT_ORDER                       TYPE        /IWBEP/T_MGW_SORTING_ORDER
* | [--->] IV_FILTER_STRING               TYPE        STRING
* | [--->] IV_SEARCH_STRING               TYPE        STRING
* | [--->] IO_TECH_REQUEST_CONTEXT        TYPE REF TO /IWBEP/IF_MGW_REQ_ENTITYSET(optional)
* | [<---] ET_ENTITYSET                   TYPE        ZCL_ZMM_BOLGE_DEPO_YON_MPC=>TT_SHIPMENT
* | [<---] ES_RESPONSE_CONTEXT            TYPE        /IWBEP/IF_MGW_APPL_SRV_RUNTIME=>TY_S_MGW_RESPONSE_CONTEXT
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* | [!CX!] /IWBEP/CX_MGW_TECH_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD shipmentset_get_entityset.

  DATA: lr_vstel   TYPE RANGE OF vstel,
        ls_vstel   LIKE LINE OF lr_vstel,
        lr_wadat   TYPE RANGE OF wadat_ist,
        ls_wadat   LIKE LINE OF lr_wadat,
        lt_packhdr TYPE TABLE OF zsd_packhdr,
        ls_entity  LIKE LINE OF et_entityset,
        lt_lines   TYPE TABLE OF tline,
        lv_tdname  TYPE  thead-tdname.

  DATA: lt_filter_select_options TYPE /iwbep/t_mgw_select_option,
        ls_filter_so             TYPE /iwbep/s_mgw_select_option,
        ls_so                    TYPE /iwbep/s_cod_select_option.

  DATA: lo_general           TYPE REF TO zmm_cl_bdy_general.
  CREATE OBJECT lo_general.

  AUTHORITY-CHECK OBJECT 'Z_BDY_SHIP'
        ID 'ACTVT' FIELD '03'.
  IF sy-subrc <> 0.
*    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
*      EXPORTING
*        message = 'Yetkiniz yok!'.
    " 1. Mesaj Container'ına erişim sağla
    DATA: lo_message_container TYPE REF TO /iwbep/if_message_container.
    lo_message_container = mo_context->get_message_container( ).

    " 2. Mesajı Container'a ekle (Leading Message olarak)
    " iv_is_leading_message = abap_true olması çok önemlidir,
    " bu sayede hata mesajı popup'ın başlığında/içeriğinde direkt görünür.
    lo_message_container->add_message_text_only(
      EXPORTING
        iv_msg_type               = 'E'             " Hata Tipi (Error)
        iv_msg_text               = 'Bu işlem için yetkiniz bulunmamaktadır!' " Görünecek Mesaj
        iv_is_leading_message     = abap_true       " Ana hata mesajı olarak işaretle
    ).

    " 3. Exception Fırlat (Container ile birlikte)
    RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
      EXPORTING
        textid            = /iwbep/cx_mgw_busi_exception=>business_error_unlimited
        message_container = lo_message_container.
    EXIT.
  ENDIF.

  " 1. Frontend'den Gelen Tüm Filtreleri Al
  " ---------------------------------------------------------
  lt_filter_select_options = io_tech_request_context->get_filter( )->get_filter_select_options( ).

  " A) WarehouseNum (VSTEL) Filtresini Oku
  READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'WarehouseNum'.
  IF sy-subrc = 0.
    LOOP AT ls_filter_so-select_options INTO ls_so.
      ls_vstel-sign   = ls_so-sign.
      ls_vstel-option = ls_so-option.
      ls_vstel-low    = ls_so-low.
      ls_vstel-high   = ls_so-high.
      APPEND ls_vstel TO lr_vstel.
    ENDLOOP.
  ELSE.
    READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'WAREHOUSENUM'.
    IF sy-subrc = 0.
      LOOP AT ls_filter_so-select_options INTO ls_so.
        ls_vstel-sign   = ls_so-sign.
        ls_vstel-option = ls_so-option.
        ls_vstel-low    = ls_so-low.
        ls_vstel-high   = ls_so-high.
        APPEND ls_vstel TO lr_vstel.
      ENDLOOP.
    ENDIF.
  ENDIF.

  " B) ShipmentDate (WADAT_IST) Filtresini Oku
  READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'ShipmentDate'.
  IF sy-subrc = 0.
    LOOP AT ls_filter_so-select_options INTO ls_so.
      ls_wadat-sign   = ls_so-sign.
      ls_wadat-option = ls_so-option.
      ls_wadat-low    = ls_so-low.
      ls_wadat-high   = ls_so-high.
      APPEND ls_wadat TO lr_wadat.
    ENDLOOP.
  ELSE.
    READ TABLE lt_filter_select_options INTO ls_filter_so WITH KEY property = 'SHIPMENTDATE'.
    IF sy-subrc = 0.
      LOOP AT ls_filter_so-select_options INTO ls_so.
        ls_wadat-sign   = ls_so-sign.
        ls_wadat-option = ls_so-option.
        ls_wadat-low    = ls_so-low.
        ls_wadat-high   = ls_so-high.
        APPEND ls_wadat TO lr_wadat.
      ENDLOOP.
    ENDIF.
  ENDIF.

  " 2. Zorunlu Alan Kontrolü
  " ---------------------------------------------------------
  IF lr_vstel IS INITIAL OR lr_wadat IS INITIAL.
    " Eğer filtreler gelmediyse boş dön
    RETURN.
  ENDIF.

  " 3. Ana Veriyi Çek (ZSD_PACKHDR)
  " ---------------------------------------------------------
  SELECT a~* FROM zsd_packhdr AS a
    INTO TABLE @lt_packhdr
    WHERE a~vstel     IN @lr_vstel
      AND a~wadat_ist IN @lr_wadat.
*                  AND NOT EXISTS (
*                  SELECT 1
*                  FROM zmm_t_bdy_gi_h AS gi_head
*                  WHERE gi_head~pckno EQ a~pckno
*                    AND gi_head~status IN ( '1', '2', '3' )
*                ).

  IF lt_packhdr IS INITIAL.
    RETURN.
  ENDIF.
  IF lt_packhdr IS NOT INITIAL.

    SELECT DISTINCT i~pckno
      INTO TABLE @DATA(lt_malcikis)
      FROM  zsd_packitm AS i
      INNER JOIN vbuk AS v ON v~vbeln = i~vbeln
       FOR ALL ENTRIES IN @lt_packhdr
      WHERE i~pckno = @lt_packhdr-pckno
        AND v~wbstk     = 'C'.

*    TYPES: BEGIN OF ty_ozk_raw,
*             pckno           TYPE zsd_packhdr-pckno,
*             vbeln           TYPE vbap-vbeln,
*             item_posnr      TYPE vbap-posnr,
*             inco1           TYPE vbkd-inco1,
*             inco_list       TYPE zsd_t_inco2_list-inco_list,
*             inco_secenek    TYPE zsd_t_inco2_list-inco_secenek,
*             additional_text TYPE zsd_t_inco2_list-additional_text,
*           END OF ty_ozk_raw.
*
*
*    TYPES: BEGIN OF ty_inco,
*             inco1           TYPE zsd_t_inco2_main-inco1,
*             inco_list       TYPE zsd_t_inco2_list-inco_list,
*             inco_secenek    TYPE zsd_t_inco2_list-inco_secenek,
*             additional_text TYPE zsd_t_inco2_list-additional_text,
*           END OF ty_inco.
*
*
*    DATA: lt_ozk_raw TYPE TABLE OF ty_ozk_raw,
*          lt_vbkd    TYPE TABLE OF vbkd,
*          lt_inco    TYPE TABLE OF ty_inco.
*
*    FIELD-SYMBOLS: <ls_raw>  LIKE LINE OF lt_ozk_raw,
*                   <ls_vbkd> LIKE LINE OF lt_vbkd.
*
*    SELECT h~pckno,
*           p~vbeln,
*           p~posnr AS item_posnr,
*           p~vbeln AS vbkd_vbeln " VBKD için anahtar
*      FROM zsd_packhdr AS h
*      INNER JOIN zsd_packitm AS i ON h~pckno = i~pckno
*      INNER JOIN lips        AS l ON l~vbeln = i~vbeln
*      INNER JOIN vbap        AS p ON l~vgbel = p~vbeln
*                                 AND l~vgpos = p~posnr
*      INTO CORRESPONDING FIELDS OF TABLE @lt_ozk_raw
*      FOR ALL ENTRIES IN @lt_packhdr
*      WHERE h~pckno = @lt_packhdr-pckno.
*
*    IF lt_ozk_raw IS NOT INITIAL.
*      SELECT * FROM vbkd
*        INTO TABLE lt_vbkd
*        FOR ALL ENTRIES IN lt_ozk_raw
*        WHERE vbeln = lt_ozk_raw-vbeln.
*
*      SORT lt_vbkd BY vbeln posnr DESCENDING.
*
*      SELECT co1~inco1,
*             co2~inco_list,
*             co2~inco_secenek,
*             co2~additional_text
*        FROM zsd_t_inco2_main AS co1
*        INNER JOIN zsd_t_inco2_list AS co2 ON co1~inco_list = co2~inco_list
*        INTO TABLE @lt_inco.
*
*      LOOP AT lt_ozk_raw ASSIGNING <ls_raw>.
*        READ TABLE lt_vbkd ASSIGNING <ls_vbkd>
*             WITH KEY vbeln = <ls_raw>-vbeln
*                      posnr = <ls_raw>-item_posnr.
*
*        IF sy-subrc NE 0.
*          READ TABLE lt_vbkd ASSIGNING <ls_vbkd>
*               WITH KEY vbeln = <ls_raw>-vbeln
*                        posnr = '000000'.
*        ENDIF.
*
*        IF <ls_vbkd> IS ASSIGNED.
*          <ls_raw>-inco1 = <ls_vbkd>-inco1.
*          READ TABLE lt_inco INTO DATA(ls_inco)
*               WITH KEY inco1 = <ls_raw>-inco1.
*          IF sy-subrc = 0.
*            MOVE-CORRESPONDING ls_inco TO <ls_raw>.
*          ENDIF.
*        ENDIF.
*
*        UNASSIGN <ls_vbkd>.
*      ENDLOOP.
*
*    ENDIF.
*
**    SELECT h~pckno,
**           p~vbeln,
**           p~posnr AS item_posnr,
**           k~posnr AS vbkd_posnr,
**           co2~inco_list,
**           co2~inco_secenek,
**           co2~additional_text
**      INTO TABLE @DATA(lt_ozk_raw)
**      FROM zsd_packhdr AS h
**      INNER JOIN zsd_packitm AS i ON h~pckno = i~pckno
**      INNER JOIN lips AS l ON l~vbeln = i~vbeln
**      INNER JOIN vbap AS p ON l~vgbel = p~vbeln
**                          AND l~vgpos = p~posnr
**      INNER JOIN vbkd AS k ON p~vbeln = k~vbeln
**                          AND ( k~posnr = p~posnr OR k~posnr = '000000' )
**      INNER JOIN zsd_t_inco2_main AS co1 ON k~inco1 = co1~inco1
**      INNER JOIN zsd_t_inco2_list AS co2 ON co1~inco_list = co2~inco_list
**      FOR ALL ENTRIES IN @lt_packhdr
**      WHERE h~pckno = @lt_packhdr-pckno.
**
**    IF sy-subrc = 0.
**      SORT lt_ozk_raw BY pckno ASCENDING
**                         vbeln ASCENDING
**                         item_posnr ASCENDING
**                         vbkd_posnr DESCENDING.
**
**      DELETE ADJACENT DUPLICATES FROM lt_ozk_raw COMPARING pckno vbeln item_posnr.
**    ENDIF.
    DATA(lt_headers) = VALUE zsd_tt_packhdr( FOR ls IN lt_packhdr ( CORRESPONDING #( ls ) ) ).
    lo_general->get_pack_inco_details(
      EXPORTING
        it_headers                   = lt_headers
  IMPORTING
    et_ozk_raw                   = DATA(lt_ozk_raw)
    ).
  ENDIF.

  " 4. Müşteri (Plasiyer) Bilgilerini Toplu Çek (Performance)
  IF lt_packhdr IS NOT INITIAL.
    SELECT kunnr, name1
      FROM kna1
      INTO TABLE @DATA(lt_kna1)
      FOR ALL ENTRIES IN @lt_packhdr
      WHERE kunnr = @lt_packhdr-kunnr.

    SORT lt_kna1 BY kunnr.
  ENDIF.

  DATA: lv_timestamp TYPE timestamp.

  IF lt_packhdr[] IS NOT INITIAL.
    SELECT a~kunnr , c~name1
      FROM knvp AS a
      INNER JOIN knvp AS b ON a~kunn2 EQ b~kunnr
      INNER JOIN kna1 AS c ON b~kunn2 EQ c~kunnr
      INTO TABLE @DATA(lt_type)
      FOR ALL ENTRIES IN @lt_packhdr
      WHERE a~kunnr EQ @lt_packhdr-kunnr
        AND a~parvw EQ 'PT'.
    SORT lt_type BY kunnr.
  ENDIF.

  " 5. Veriyi OData Yapısına Dönüştür
  LOOP AT lt_packhdr INTO DATA(ls_pack).
    CLEAR ls_entity.

    ls_entity-shipmentid   = ls_pack-pckno.

    CONVERT DATE ls_pack-wadat_ist TIME '000000'
            INTO TIME STAMP ls_entity-shipmentdate
            TIME ZONE 'UTC'. " Veya sy-zonlo

*    ls_entity-shipmentdate = ls_pack-wadat_ist.
    ls_entity-customerid   = ls_pack-kunnr.
    ls_entity-warehousenum = ls_pack-vstel.

    " Müşteri Adı
    READ TABLE lt_kna1 INTO DATA(ls_cust) WITH KEY kunnr = ls_pack-kunnr BINARY SEARCH.
    IF sy-subrc = 0.
      ls_entity-customername = ls_cust-name1.
    ENDIF.

    ls_entity-colorstatus  = 'Information'.

    READ TABLE lt_type INTO DATA(ls_type) WITH KEY kunnr = ls_pack-kunnr BINARY SEARCH.
    IF sy-subrc = 0.
      ls_entity-type = ls_type-name1.
    ENDIF.

***********************************************************************
    READ TABLE lt_malcikis
    INTO DATA(ls_malcikis) WITH KEY pckno = ls_pack-pckno.
    IF sy-subrc EQ 0.
      ls_entity-gidone = 'X'.
    ENDIF.
    READ TABLE lt_ozk_raw
    INTO DATA(ls_ozk) WITH KEY pckno = ls_pack-pckno.
    IF sy-subrc EQ 0 AND ls_ozk-additional_text EQ 'X'.
      REFRESH lt_lines.
      lv_tdname = ls_ozk-vbeln.
      CALL FUNCTION 'READ_TEXT'
        EXPORTING
          id                      = 'Z002'
          language                = sy-langu
          name                    = lv_tdname
          object                  = 'VBBK'
        TABLES
          lines                   = lt_lines
        EXCEPTIONS
          id                      = 1
          language                = 2
          name                    = 3
          not_found               = 4
          object                  = 5
          reference_check         = 6
          wrong_access_to_archive = 7
          OTHERS                  = 8.
      IF lt_lines[] IS NOT INITIAL.
        ls_entity-inco2         = ls_pack-inco2.
        LOOP AT  lt_lines INTO DATA(ls_lines).
          CONCATENATE ls_entity-inco2 ls_lines-tdline INTO ls_entity-inco2 SEPARATED BY ' - '.
        ENDLOOP.
      ELSE.
        ls_entity-inco2         = ls_pack-inco2.
      ENDIF.
    ELSE.
      ls_entity-inco2         = ls_pack-inco2.
    ENDIF.
    IF ls_entity-inco2 IS NOT INITIAL.
      ls_entity-inco2 = '|' && ls_entity-inco2 && '|'.
    ENDIF.
***********************************************************************


    " Search Bar Filtresi
    DATA(lv_search) = io_tech_request_context->get_search_string( ).
    IF lv_search IS NOT INITIAL.
      IF ls_entity-shipmentid CS lv_search OR ls_entity-customername CS lv_search.
        APPEND ls_entity TO et_entityset.
      ENDIF.
    ELSE.
      APPEND ls_entity TO et_entityset.
    ENDIF.

  ENDLOOP.


ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->UPDATE_RETURN_REASONS
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_VBELN                       TYPE        VBELN_VA
* | [--->] IT_ITEMS                       TYPE        TY_T_RETURN_ITEM
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
  METHOD update_return_reasons.
    DATA:
      ls_header_inx TYPE bapisdh1x,
      lt_item_in    TYPE STANDARD TABLE OF bapisditm
                      WITH EMPTY KEY,
      lt_item_inx   TYPE STANDARD TABLE OF bapisditmx
                      WITH EMPTY KEY,
      lt_return     TYPE bapiret2_t.

    SELECT vbeln,
           posnr,
           matnr,
           kwmeng,
           vrkme,
           werks,
           lgort,
           abgru
      FROM vbap
      WHERE vbeln = @iv_vbeln
      INTO TABLE @DATA(lt_order_items).

    IF lt_order_items IS INITIAL.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |{ iv_vbeln } numaralı siparişte düzenlenebilir kalem bulunamadı|.
    ENDIF.

    SELECT DISTINCT posnv
      FROM vbfa
      WHERE vbelv = @iv_vbeln
      INTO TABLE @DATA(lt_follow_on_items).
    SORT lt_follow_on_items BY posnv.

    SORT lt_order_items BY matnr posnr.
    ls_header_inx-updateflag = 'U'.

    LOOP AT it_items ASSIGNING FIELD-SYMBOL(<count>)
      WHERE isdepozito = abap_false.
*      WHERE isdepozito = 0.

      DATA(lv_count_matnr) = CONV matnr( <count>-matnr ).
      DATA lt_material_items TYPE ty_t_order_item.
      LOOP AT lt_order_items INTO DATA(ls_order_item)
        WHERE matnr = lv_count_matnr.
        APPEND ls_order_item TO lt_material_items.
      ENDLOOP.

      IF lt_material_items IS INITIAL.
        RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
          EXPORTING
            textid  = /iwbep/cx_mgw_busi_exception=>business_error
            message = |{ <count>-matnr } malzemesi { iv_vbeln } numaralı ZBIS siparişinde bulunmuyor|.
      ENDIF.

      DATA(lv_order_total) = REDUCE vbap-kwmeng(
        INIT total = CONV vbap-kwmeng( 0 )
        FOR order_item IN lt_material_items
        NEXT total = total + order_item-kwmeng ).

      DATA lt_allocations TYPE STANDARD TABLE OF bapisditm
        WITH EMPTY KEY.

      IF <count>-mengesayim <> lv_order_total.
        CONTINUE.
      ENDIF.

      IF <count>-mengefire > 0.
        APPEND VALUE #(
          material   = <count>-matnr
          target_qty = <count>-mengefire
          target_qu  = <count>-meins
          reason_rej = gc_reason_fire )
          TO lt_allocations.
      ENDIF.

      IF <count>-mengekalite > 0.
        APPEND VALUE #(
          material   = <count>-matnr
          target_qty = <count>-mengekalite
          target_qu  = <count>-meins
          reason_rej = gc_reason_quality )
          TO lt_allocations.
      ENDIF.

      IF <count>-mengesatilab > 0.
        APPEND VALUE #(
          material   = <count>-matnr
          target_qty = <count>-mengesatilab
          target_qu  = <count>-meins
          reason_rej = gc_reason_saleable )
          TO lt_allocations.
      ENDIF.

      "Use existing same-material lines first.
      LOOP AT lt_allocations ASSIGNING FIELD-SYMBOL(<allocation>).
        DATA(lv_index) = sy-tabix.

        READ TABLE lt_material_items INDEX lv_index
          INTO DATA(ls_existing).

        IF sy-subrc = 0.
          READ TABLE lt_follow_on_items
            WITH KEY posnv = ls_existing-posnr
            BINARY SEARCH
            TRANSPORTING NO FIELDS.
          IF sy-subrc = 0
             AND ( ls_existing-kwmeng <> <allocation>-target_qty
                   OR ls_existing-abgru <> <allocation>-reason_rej ).
            RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
              EXPORTING
                textid  = /iwbep/cx_mgw_busi_exception=>business_error
                message = |{ ls_existing-posnr } numaralı sipariş kaleminin teslimat belgesi var ve değiştirilemez|.
          ENDIF.

          <allocation>-itm_number = ls_existing-posnr.
          APPEND <allocation> TO lt_item_in.
          APPEND VALUE #(
            itm_number = ls_existing-posnr
            updateflag = 'U'
            target_qty = abap_true
            target_qu  = abap_true
            reason_rej = abap_true )
            TO lt_item_inx.
        ELSE.
          "A new reason bucket needs a new order line. Copy the commercial
          "defaults from the first existing line for this material.
          DATA(ls_template) = lt_material_items[ 1 ].
          DATA(lv_max_posnr) = REDUCE posnr_va(
            INIT result = CONV posnr_va( '000000' )
            FOR row IN lt_order_items
            NEXT result = COND #(
              WHEN row-posnr > result THEN row-posnr
              ELSE result ) ).
          lv_max_posnr = lv_max_posnr + 10.

          <allocation>-itm_number = lv_max_posnr.
          <allocation>-plant      = ls_template-werks.
          <allocation>-store_loc  = ls_template-lgort.
          APPEND <allocation> TO lt_item_in.
          APPEND VALUE #(
            itm_number = lv_max_posnr
            updateflag = 'I'
            material   = abap_true
            target_qty = abap_true
            target_qu  = abap_true
            plant      = abap_true
            store_loc  = abap_true
            reason_rej = abap_true )
            TO lt_item_inx.

          APPEND VALUE #(
            vbeln = iv_vbeln
            posnr = lv_max_posnr
            matnr = <count>-matnr
            vrkme = <count>-meins
            werks = ls_template-werks
            lgort = ls_template-lgort )
            TO lt_order_items.
        ENDIF.
      ENDLOOP.

      "Delete unused reason lines only before a follow-on document exists.
      DATA(lv_surplus_start) = lines( lt_allocations ) + 1.
      LOOP AT lt_material_items INTO DATA(ls_surplus)
        FROM lv_surplus_start.
        READ TABLE lt_follow_on_items
          WITH KEY posnv = ls_surplus-posnr
          BINARY SEARCH
          TRANSPORTING NO FIELDS.
        IF sy-subrc = 0.
          RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
            EXPORTING
              textid  = /iwbep/cx_mgw_busi_exception=>business_error
              message = |{ ls_surplus-posnr } numaralı sipariş kaleminin teslimat belgesi var ve silinemez|.
        ENDIF.

        APPEND VALUE #(
          itm_number = ls_surplus-posnr )
          TO lt_item_in.
        APPEND VALUE #(
          itm_number = ls_surplus-posnr
          updateflag = 'D' )
          TO lt_item_inx.
      ENDLOOP.
    ENDLOOP.

    IF lt_item_in IS INITIAL.
      RETURN.
    ENDIF.

    CALL FUNCTION 'BAPI_SALESORDER_CHANGE'
      EXPORTING
        salesdocument    = iv_vbeln
        order_header_inx = ls_header_inx
      TABLES
        return           = lt_return
        order_item_in    = lt_item_in
        order_item_inx   = lt_item_inx.

    IF line_exists( lt_return[ type = 'E' ] )
       OR line_exists( lt_return[ type = 'A' ] ).
      CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
      raise_bapi_messages(
        it_return       = lt_return
        iv_default_text = |{ iv_vbeln } belgesi için iade nedenleri güncellenemedi| ).
    ENDIF.
  ENDMETHOD.


* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Instance Private Method ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT->VALIDATE_RETURN_FACTORY_ITEMS
* +-------------------------------------------------------------------------------------------------+
* | [--->] IV_WERKS                       TYPE        WERKS_D
* | [--->] IV_SOURCE_LGORT                TYPE        LGORT_D
* | [<-->] CT_ITEMS                       TYPE        TY_T_RETURN_FACTORY_ITEM
* | [!CX!] /IWBEP/CX_MGW_BUSI_EXCEPTION
* +--------------------------------------------------------------------------------------</SIGNATURE>
METHOD validate_return_factory_items.
  DATA lr_matnr TYPE RANGE OF matnr.
  DATA lv_meins_in TYPE meins.
  LOOP AT ct_items ASSIGNING FIELD-SYMBOL(<item>).
    CLEAR lv_meins_in.

    <item>-matnr = |{ <item>-matnr ALPHA = IN }|.

    lv_meins_in = <item>-meins.
    CALL FUNCTION 'CONVERSION_EXIT_CUNIT_INPUT'
      EXPORTING
        input          = lv_meins_in
        language       = sy-langu
      IMPORTING
        output         = lv_meins_in
      EXCEPTIONS
        unit_not_found = 1
        OTHERS         = 2.
    IF sy-subrc EQ 0.
      <item>-meins = lv_meins_in.
    ENDIF.

    IF <item>-mengeuretimhatali < 0
       OR <item>-mengesayim < 0
       OR <item>-mengefabrikalojistik < 0
       OR <item>-mengesatisfirekati < 0
       OR <item>-mengesatisfiresivi < 0
       OR <item>-mengesatisfireuht < 0
       OR <item>-mengesatisfirecam < 0
       OR <item>-mengelansman  < 0. "toplatılan ürünler için mengelansman kullanıyoruz
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |{ <item>-matnr ALPHA = OUT }: negatif miktar girilemez|.
    ENDIF.

    DATA(lv_category_total) =
        <item>-mengeuretimhatali
      + <item>-mengefabrikalojistik
      + <item>-mengesatisfirekati
      + <item>-mengesatisfiresivi
      + <item>-mengesatisfireuht
      + <item>-mengesatisfirecam
      + <item>-mengelansman. "toplatılan ürünler için mengelansman kullanıyoruz

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

    DATA(lv_validated_category_total) =
        <item>-mengeuretimhatali
      + <item>-mengefabrikalojistik
      + <item>-mengesatisfirekati
      + <item>-mengesatisfiresivi
      + <item>-mengesatisfireuht
      + <item>-mengesatisfirecam
      + <item>-mengelansman.

    IF <item>-mengesayim > lv_stock.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |{ <item>-matnr ALPHA = OUT }: sayim miktari mevcut stogu asamaz|.
    ENDIF.

    IF lv_validated_category_total > lv_stock.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = |{ <item>-matnr ALPHA = OUT }: kategori dagilimi mevcut stogu asamaz|.
    ENDIF.
  ENDLOOP.
ENDMETHOD.
ENDCLASS.
