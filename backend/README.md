# Backend Uygulama Paketi

## Dosyalar

- `ZCL_ZMM_BOLGE_DEPO_YON_DPC_EXT_RETURN_DEPOSIT.abap`
  - DPC_EXT private section tanımları
  - `DepositGISet` ölçü birimi geliştirmesi
  - son ZDAI kalemlerini ReturnCount'a ekleme
  - yeni ZDAI siparişi yaratma
  - `CREATE_DEEP_ENTITY` ve `LOAD_RETURN_DATA` entegrasyon blokları
- `SEGW_RETURN_DEPOSIT_STEPS.md`
  - SEGW model değişiklikleri ve Gateway testleri
- `SAP_UYGULAMA_ADIMLARI.md`
  - gerçek SE11 nesne adlarıyla uçtan uca SAP uygulama sırası
- `SE11_ZMM_T_BDY_IRS_DH.md`
  - taslak header, idempotency ve ZDAI ilişki tablosu
- `SE11_ZMM_T_BDY_IRS_DI.md`
  - depozito taslak kalem tablosu

## Uygulama Sırası

1. SE11'de `ZMM_T_BDY_IRS_DH` tablosunu oluşturun.
2. SE11'de `ZMM_T_BDY_IRS_DI` kalem tablosunu oluşturun.
3. `EZMM_T_BDY_IRS_D` lock object'ini oluşturup aktive edin.
4. SEGW'de `DepositGI.Meins` propertysini ekleyin.
5. SEGW'de `SaveReturnDepositDraft` function importunu oluşturun.
6. Runtime artifact'ları yeniden üretin.
7. DPC_EXT sınıfının private section'ına yeni tip/metot tanımlarını ekleyin.
8. Patch dosyasındaki metot implementasyonlarını sınıfa ekleyin.
9. `EXECUTE_ACTION` içine taslak kaydetme dalını ekleyin.
10. `ty_s_deep_return` yapısına `status` component'ini ekleyin.
11. `LOAD_RETURN_DATA` sonuna `append_latest_deposit_items` çağrısını ekleyin.
12. `CREATE_DEEP_ENTITY` içindeki eski `ensure_deposit_items` akışını kaldırın.
13. Nihai onayda depozitoları `load_deposit_draft` ile Z tablodan okuyun.
14. Ürün/depozito ayrımı ve `create_deposit_order` çağrısını ekleyin.
15. Log loop'unu patch dosyasındaki güvenli sürümle değiştirin.
16. Sınıfı aktive edin ve Gateway cache'lerini temizleyin.
17. `/IWFND/GW_CLIENT` üzerinden taslak action ve deep-create testlerini çalıştırın.

## Önemli

`ZCL_ZMM_BOLGE_DEPO_YON_MPC` ve `ZCL_ZMM_BOLGE_DEPO_YON_DPC` generated base
sınıflarına kalıcı özel kod yazmayın. SEGW regenerate işlemi bu sınıfları
yeniden üretir. Özel kod `MPC_EXT` ve `DPC_EXT` içinde kalmalıdır.
