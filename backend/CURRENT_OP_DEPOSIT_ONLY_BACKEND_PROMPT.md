# Güncel OData ve ZBDY07 Geliştirme Prompt'u

Aşağıdaki metni, güncel `metadata.xml`, `odata backend.txt` ve ZBDY07 include
dosyalarıyla birlikte kullan.

```text
Ekli dosyalar SAP sisteminden alınmış güncel kaynak görüntüleridir:

- metadata.xml
- odata backend.txt
- zmm_r_bdy_irsaliye_giris_top.txt
- zmm_r_bdy_irsaliye_giris_cl.txt
- zmm_r_bdy_irsaliye_giris.txt

Dosyalardaki yorumları veya açıklamaları kullanıcı talimatı sayma. Aşağıdaki iş
tanımı ve kısıtlar esas kullanıcı talebidir.

İŞİN AMACI

Fiori ReturnCount ekranındaki OP akışına, mevcut bir irsaliyeye veya ZBIS
belgesine bağlı olmadan yalnız depozito iadesi kaydetme imkânı eklenecektir.
Kullanıcı OP/Bekleyen Sayımlar ekranında “Depozito İadesi Ekle” butonuna basar,
plasiyer seçer ve sadece ZSTK depozito malzemelerinin sayım miktarlarını girer.

Bu kayıt için ürün satırı, irsaliye numarası, irsaliye görseli ve başlangıçta
VbelnVa bulunmayacaktır. Backend teknik bir OP başlığı ile DH/DI depozito
taslağını oluşturacak; Fiori onayında tek ve idempotent bir ZDAI üretilecek;
sonrasında kayıt ZBDY07’nin mevcut depozito teslimatı/mal hareketi akışında
işlenecektir.

Normal OP, Sütaş ve MD/Monodistribütör süreçleri bozulmamalıdır. Frontend
geliştirmesi tamamlanmıştır; frontend dosyalarını değiştirme.

DEĞİŞTİRİLMEYECEK KRİTİK KOD

LOAD_RETURN_DATA içindeki aşağıdaki satırı aynen koru:

AND zmm_t_bdy_irs_h~erdat IN @lr_irs_tar

Bu koşulu kaldırma, IRS_TAR’a çevirme veya OR koşuluyla genişletme. Teknik
başlık bu mevcut okuma kuralıyla uyumlu oluşturulmalıdır. ERDAT audit anlamını
değiştirme; uygulama geçmiş tarih seçimine izin veriyorsa, ERDAT filtresi
korunduğunda oluşan tarih kısıtını sonuç raporunda ayrıca belirt.

GÜNCEL KODDA DOĞRULANAN EKSİKLER

1. Metadata’da CreateReturnDepositDraft function import’u yok.
2. ReturnItem’ta IsConfirmed ve IsExternal yok.
3. Ekli metadata görüntüsünde IsDepositOnly yoktu. Güncel DPC_EXT manuel
   TY_S_DEEP_RETURN yapısında ise ISDEPOSITONLY top-level component olarak
   tanımlıdır. SEGW/MPC modeli, generated runtime tipi, backend cache’i ve hub
   cache’i aynı model sürümünde olmalıdır.
4. EXECUTE_ACTION yalnız SaveReturnDepositDraft’ı yönlendiriyor.
5. APPEND_LATEST_DEPOSIT_ITEMS tek lv_guid/lv_exists kullanıyor ve GET sırasında
   ZMM_T_BDY_IRS_DH ile ZMM_T_BDY_IRS_DI kayıtlarını fiziksel olarak siliyor.
6. SAVE_RETURN_DEPOSIT_DRAFT miktar sıfır olduğunda DI kaydını fiziksel siliyor
   ve ana H kaydının sahiplik/akış kurallarını yeterince doğrulamıyor.
7. CREATE_DEEP_ENTITY’de Sütaş tespiti boş IRS_NO ile başka bir H kaydına
   eşleşebilir.
8. ZBDY07’nin güncel GET_SAYIM_DATA kodu H+DH+DI depozitolarını zaten okuyor ve
   genel depozito onayı mevcut. Bu kısımları yeniden tasarlama; manuel OP için
   gerekli küçük korumaları ekleyip regresyon testi yap.

FRONTEND–BACKEND SÖZLEŞMESİ

Frontend ilk pozitif depozito kaydında şu çağrıyı yapıyor:

POST CreateReturnDepositDraft

Parametreler, adları ve tipleri:

- Plasiyer: Edm.String
- Lgort: Edm.String
- IrsTar: Edm.DateTime
- ShipmentType: Edm.String; yalnız OP gönderilir ve kabul edilmelidir

Dönüş:

- Return type: ZMM_BOLGE_DEPO_YONETIM_SRV.ReturnHeader
- Entity set: ReturnHeaderSet
- Başarılı cevapta LogUid zorunlu ve dolu olmalıdır

Taslak oluştuktan sonra frontend mevcut SaveReturnDepositDraft function
import’unu her depozito kalemi için çağırır. Nihai onay mevcut ReturnHeaderSet
deep insert’idir ve IsDepositOnly=true gönderilir. Backend yine de bu bayrağa
tek başına güvenmemeli, manuel OP akışını LogUid ile okunan H/DH kayıtlarından
doğrulamalıdır.

A. SEGW / METADATA DEĞİŞİKLİKLERİ

ReturnHeader entity’sinde IsDepositOnly, Edm.Boolean, Nullable=false olarak
bulunmalıdır. Frontend bu alanı request ve response içinde kullanır. SEGW/MPC
property’si, generated TS_RETURNHEADER alanı ve manuel TY_S_DEEP_RETURN içindeki
ISDEPOSITONLY aynı ABAP/OData tipinde olmalı; hub/backend metadata cache’leri
birlikte yenilenmelidir.

ReturnItem entity’sine ekle:

- IsConfirmed, Edm.Boolean, Nullable=false
- IsExternal, Edm.Boolean, Nullable=false

Ürün I satırlarında iki alan false olabilir. DI satırlarında doğrudan
IS_CONFIRMED ve IS_EXTERNAL alanlarından doldurulmalıdır.

CreateReturnDepositDraft function import’unu yukarıdaki sözleşmeyle ekle.
Runtime object’leri yeniden üret. Custom uygulamayı DPC_EXT/MPC_EXT tarafında
koru. Üretim sonrası method type ve deep entity type içine yeni alanların
geldiğini doğrula.

B. CREATE_RETURN_DEPOSIT_DRAFT

DPC_EXT’e private CREATE_RETURN_DEPOSIT_DRAFT metodu ekle ve EXECUTE_ACTION’da
CreateReturnDepositDraft case’ini oluştur.

Action parametrelerini IT_PARAMETER’dan oku. OData Edm.DateTime değerini mevcut
Gateway tarih yaklaşımıyla güvenli biçimde DATS’a çevir. Hataları
/IWBEP/CX_MGW_BUSI_EXCEPTION olarak anlamlı mesajlarla döndür.

Validasyonlar:

- ShipmentType yalnız OP olmalı.
- Plasiyer, Lgort ve IrsTar zorunlu olmalı.
- Plasiyeri ALPHA input formatına dönüştür.
- Plasiyerin ReturnMDPlasiyerSet’in kullandığı mevcut aktiflik, satış alanı ve
  kullanıcı yetki kurallarıyla seçilebilir olduğunu backend’de tekrar doğrula.
- Lgort’un kullanıcının yetkili depo/depo yeri olduğunu mevcut yetki
  mekanizmasıyla doğrula.
- İstemciden gelen plasiyer ve depoya tek başına güvenme.

Aynı açık taslağı tekrar kullanma iş anahtarı:

PLASIYER + LGORT + IRS_TAR + SHIPMENT_TYPE='OP' + DEPOZITO_IADE='X'
+ VBELN_VA boş + IRS_NO boş + STATUS='N'

Bu anahtarda kayıt varsa yeni UUID üretmeden mevcut LogUid’yi dön. Paralel iki
isteğin iki H kaydı üretmesini engelle. Mevcut LogUid lock’u bu yaratma yarışı
için yeterli değilse iş anahtarı bazlı enqueue/DDIC lock ihtiyacını uygula ve
teslim notunda belirt.

Yeni ZMM_T_BDY_IRS_H teknik kaydı:

- LOG_UID: UUID C32
- VBELN_VA: boş
- IRS_NO: boş
- IRS_TAR: IrsTar parametresi
- LGORT: doğrulanmış depo
- PLASIYER: ALPHA formatlı plasiyer
- KUNNR: aynı plasiyer
- SHIPMENT_TYPE: OP
- RETURN_TYPE: P
- DEPOZITO_IADE: X
- STATUS: N
- IMAGE_B64: boş
- Audit alanları: mevcut tablo standardına göre sy-uname/sy-datum/sy-uzeit

Aynı LUW içinde ZMM_T_BDY_IRS_DH oluştur:

- LOG_UID: aynı LogUid
- PLASIYER: aynı plasiyer
- LGORT: aynı depo
- SOURCE_VBELN: boş
- ZDAI_VBELN: boş
- STATUS: D
- Audit alanları dolu

H veya DH yazılamazsa rollback yap. Başarılı cevapta en az LogUid, IrsTar,
Lgort, Plasiyer, Kunnr, ShipmentType='OP', ReturnType='P', Status='N' ve
IsDepositOnly=true alanlarını doldur.

C. SAVE_RETURN_DEPOSIT_DRAFT GÜVENLİĞİ

Mevcut normal OP davranışını koruyarak şu kontrolleri ekle:

- LogUid ile önce ZMM_T_BDY_IRS_H kaydını oku; H yoksa DH/DI yaratma.
- H’nin plasiyer ve Lgort değerleri istekle aynı olmalı.
- H status N dışında ise taslak değiştirilememeli.
- H teknik/irsaliyesiz ise ayrıca SHIPMENT_TYPE='OP', DEPOZITO_IADE='X',
  VBELN_VA boş ve IRS_NO boş koşullarını zorunlu tut.
- DH durumu D veya kontrollü tekrar-deneme durumu E iken değişiklik kabul et;
  P/S/C tamamlanma durumlarını değiştirme.
- Materyal MARA’da bulunmalı, MTART='ZSTK' olmalı ve mevcut DepositGISet(All='X')
  kataloğunun izin verdiği depozito kaynağında yer almalı.
- Ölçü birimini MARA temel ölçü biriminden doğrula; frontend değerine körü
  körüne güvenme.
- Negatif miktarı reddet.

Soft-delete uygula:

- IsDeleted=true veya MengeSayim=0 ise mevcut DI’ı DELETE etme;
  IS_DELETED='X' yap.
- Kayıt yoksa sıfır miktar için gereksiz tombstone yaratma.
- Pozitif miktarda IS_DELETED=space yap.
- Miktar değiştiğinde IS_CONFIRMED=space yap; açıkça aynı miktar için gönderilen
  IsConfirmed değerini mevcut ekran davranışıyla kaydet.
- Tüm MODIFY/UPDATE sonuçlarını kontrol et; hata halinde rollback ve dequeue
  garanti et.

D. LOAD_RETURN_DATA VE RESPONSE EŞLEMESİ

ERDAT filtresini aynen koru.

Teknik H kaydını ReturnHeader’a dahil et. IsDepositOnly’yi DB’ye yeni kolon
eklemeden şu backend koşulundan hesapla:

SHIPMENT_TYPE='OP' AND DEPOZITO_IADE='X'
AND VBELN_VA boş AND IRS_NO boş

Teknik header için ReturnType='P' dön.

DI aktif satırlarını ReturnItem’a ekle:

- IsDepozito=true
- MengeSiparis=DI-MENGE_SIPARIS; manuel OP’de normalde 0
- MengeSayim=DI-MENGE_SAYIM
- MengeSatilab=DI-MENGE_SAYIM
- IsConfirmed=DI-IS_CONFIRMED
- IsExternal=DI-IS_EXTERNAL
- IS_DELETED='X' satırları response’a gelmemeli

Posnr entity key olduğu için DI kalemlerine her LogUid içinde çakışmayan,
deterministik posnr ver. Aynı plasiyerin normal OP kartıyla manuel depozito
kartı frontend’de IsDepositOnly üzerinden ayrı tutulacaktır.

E. APPEND_LATEST_DEPOSIT_ITEMS ZORUNLU DÜZELTMESİ

Metodu header bazlı ve tamamen salt-okunur olacak şekilde yeniden yaz.
Mevcut DELETE FROM ZMM_T_BDY_IRS_DH ve DELETE FROM ZMM_T_BDY_IRS_DI satırlarını
kaldır. Bir GET isteğinde INSERT/UPDATE/DELETE/COMMIT bulunmamalıdır.

Her OP header için kendi LogUid’siyle işlem yap:

1. Header’ın aktif DH/DI taslağı varsa yalnız o header’ın DI kalemlerini ekle.
2. Header IsDepositOnly ise son ZDAI kaynak kalemlerini hiçbir koşulda ekleme.
3. Normal OP header’da DH/DI taslağı yoksa mevcut davranıştaki gibi plasiyerin
   son ZDAI ZSTK kalemlerini yalnız görüntüleme kaynağı olarak ekle.
4. Başka header’ın taslak varlığı bu header’ın kararını etkilemesin.
5. Aynı kalemi iki kez ekleme.
6. DI dönüşünde IsConfirmed ve IsExternal alanlarını da doldur.

F. CREATE_DEEP_ENTITY / FIORI ONAYI

Frontend deep request içinde IsDepositOnly=true gönderir. LogUid ile H ve DH
oku; SHIPMENT_TYPE='OP', DEPOZITO_IADE='X', VBELN_VA boş ve IRS_NO boş
koşullarından manuel OP akışını backend’de ayrıca doğrula.

Manuel OP için:

- LogUid zorunlu.
- H bulunmalı ve status N olmalı.
- Payload plasiyer/Lgort/tarih değerleri H ile uyuşmalı.
- VbelnVa ve IrsNo’nun boş olması geçerlidir.
- Ürün kalemi bulunmaması geçerlidir.
- En az bir pozitif, aktif ve DI’da onaylanmış ZSTK depozito kalemi bulunmalı.
- Payload kalemleri ile DI taslağını backend’de karşılaştır.
- Normal OP ürün iadesindeki ZBIS/VbelnVa zorunluluğunu değiştirme.

Mevcut Sütaş tespitini düzelt. `WHERE irs_no = ls_deep-irsno` ile boş IRS_NO
araması yapma. Sütaş durumunu yalnız gönderilen LogUid üzerinden oku:

SELECT SINGLE sutas
  FROM zmm_t_bdy_irs_h
  WHERE log_uid = @lv_log_uid
  INTO @lv_sutas.

Depozito onayının ürün satırı bulunmadığında da LOAD_DEPOSIT_DRAFT ve
CREATE_DEPOSIT_ORDER aşamalarına ulaştığını doğrula.

G. CREATE_DEPOSIT_ORDER / ZDAI IDEMPOTENCY

Mevcut CREATE_DEPOSIT_ORDER metodunu yeniden kullan ve güçlendir:

- Yalnız pozitif, onaylanmış ZSTK kalemlerden ZDAI yarat.
- Ölçü birimini MARA’dan doğrula.
- IRS_NO’nun boş olmasını kabul et.
- Eski/kaynak ZDAI’yi değiştirme; yalnız satış alanı/tesis belirleme amacıyla
  kullan.
- Aynı LogUid için DH-ZDAI_VBELN dolu ve belge VBAK’ta geçerli ZDAI ise, DH
  status P veya S olsa bile ikinci belge yaratma; mevcut belgeyi dön.
- Belge yaratmadan önce LogUid lock’u al, lock altında tekrar kontrol yap.
- Başarı akışı DH: D/E -> P -> S olmalı.
- H onay sonunda N -> S olmalı.
- ZDAI oluşturma hatasında DH=E yap; hata/tekrar denemede aynı LogUid’yi kullan.
- Tüm exception yollarında dequeue garanti et.
- ZDAI oluştuğu halde sonraki DB update/timeout yaşanan senaryoda ikinci ZDAI
  oluşmasını engelle.

H. ZBDY07 İÇİN MİNİMUM GEREKLİ DEĞİŞİKLİKLER

Güncel ZBDY07’de GET_SAYIM_DATA zaten H+DH+DI ile depozito satırı okuyor,
APPROVE_DEPOZITO_SAYIM ve CREATE_DLV_AND_GM_DEPOZITO da mevcut. Bunları baştan
yazma.

1. START-OF-SELECTION / giriş ekranı

Teknik başlık IMAGE_B64 boş olduğu için bugün fiilen listeye girmiyor; yine de
iş kuralını açık korumaya al. Aşağıdaki kayıt 0100 irsaliye giriş akışına,
CREATE_SD_ORDER/CREATE_ZRFI_ORDER veya görsel eşleştirme sürecine girmemeli:

SHIPMENT_TYPE='OP' AND DEPOZITO_IADE='X'
AND VBELN_VA boş AND IRS_NO boş

2. GET_SAYIM_DATA

Mevcut H+DH+DI select’inin manuel OP’yi şu şekilde ürettiğini doğrula; gerekiyorsa
yalnız eksik eşlemeyi düzelt:

- SATIR_TIPI='Depozito'
- LOG_UID=H/DH LogUid
- KUNNR=PLASIYER
- MUHASEBE_MIK=0
- SAYIM_MIK=DI-MENGE_SAYIM
- FARK=SAYIM_MIK
- ZDAI_VBELN=DH-ZDAI_VBELN
- IS_DELETED satırlar alınmaz
- DH status S sayım bekleyen, C tamamlanan, E hatalı/tekrar durumuna gider

Ürün H+I inner join’inin teknik başlıkta ürün satırı üretmemesi beklenen
davranıştır. LT_DEP_EXPECTED içinde I depozitosu bulunmaması da manuel OP için
normaldir; muhasebe miktarı 0 kalmalıdır.

3. Onay akışı

- Yalnız depozito seçildiğinde vbeln_zbis boş ve ürün/ZBIS sayısı 0 olabilir;
  bunu hata sayma.
- Seçilen depozito grubunun aynı LogUid ve aynı ZDAI’ye ait olduğunu doğrula.
- ZDAI_VBELN’in VBAK’ta gerçekten ZDAI türü olduğunu işlem öncesinde doğrula.
- p_mono boş olan manuel OP için CREATE_MONO_ZDAI kesinlikle çağrılmamalı.
- APPROVE_DEPOZITO_SAYIM -> CREATE_DLV_AND_GM_DEPOZITO mevcut akışı kullanılsın.
- Başarıda DH=C; hatada DH=E; ZDEP, malzeme belgesi ve mali yıl loglansın.
- Yalnız depozito işlendikten sonra ürün tablosu boşken normal ürün döngüsü hata
  veya dump üretmemeli.
- Özet popup başlığında mümkünse “1 irsaliye” yerine “1 manuel depozito kaydı”
  göster; bu kozmetik değişiklik iş mantığını etkilememeli.

DURUM ANLAMLARI

- H=N: Fiori sayımı bekliyor.
- H=S: Fiori sayımı onaylandı.
- DH=D: Depozito taslağı.
- DH=P: ZDAI yaratma/bağlama aşaması.
- DH=S: ZDAI hazır, ZBDY07 lojistik işlemini bekliyor.
- DH=C: ZBDY07 depozito süreci tamamlandı.
- DH=E: Tekrar denenebilir hata.

TEST VE KABUL KRİTERLERİ

1. CreateReturnDepositDraft dolu LogUid döndürür.
2. Aynı plasiyer/Lgort/IrsTar için paralel veya tekrarlı çağrı ikinci açık H
   yaratmaz.
3. H ve DH atomik oluşur; H var/DH yok veya tersi kalmaz.
4. Bir depozito kaydedilip sayfa yenilendiğinde miktar, IsConfirmed ve IsExternal
   korunur; onay butonu doğru duruma gelir.
5. Sıfır/silinen kalem DB’de soft-delete olur ve GET’te görünmez.
6. GET çağrısı hiçbir DB kaydını değiştirmez veya silmez.
7. Aynı plasiyerin normal OP kartı ile manuel depozito kartı karışmaz.
8. Manuel OP deep onayı boş VbelnVa/IrsNo ve ürünsüz payload ile başarılı olur.
9. Onayda tek ZDAI oluşur; timeout/tekrar POST ikinci ZDAI yaratmaz.
10. ZBDY07 bekleyen sayımda yalnız depozito satırı görünür ve muhasebe miktarı
    0 olur.
11. ZBDY07 onayında mevcut ZDEP/mal hareketi akışı çalışır ve DH=C olur.
12. Hata halinde DH=E olur ve aynı ZDAI üzerinden tekrar denenebilir.
13. Normal OP, Sütaş ve MD senaryoları regresyon testinden geçer.
14. `AND zmm_t_bdy_irs_h~erdat IN @lr_irs_tar` satırı byte düzeyinde aynı kalır.

TESLİM ŞEKLİ

- Yalnız analiz yapma; uygulanabilir ABAP değişikliklerini üret.
- Önce değişiklik planını mevcut metot/FORM adlarıyla kısaca listele.
- Ardından değişen method declaration’larını ve tam method/FORM kodlarını ver;
  sadece belirsiz pseudo-code bırakma.
- SEGW’de elle yapılacak adımları sırayla belirt.
- Yeni DDIC lock object gerekiyorsa adını, key alanlarını ve nedenini belirt.
- Her DB yazımının transaction/rollback/dequeue davranışını açıkla.
- Mevcut kodda zaten doğru çalışan ZBDY07 bölümlerini gereksiz yere değiştirme.
- Kullanılan tablo alanı veya yetki nesnesi eklerden doğrulanamıyorsa isim
  uydurma; TODO olarak açıkça işaretle.
- Sonunda değişen noktaları, aktivasyon sırasını, test sonuçlarını ve kalan
  manuel SAP işlemlerini raporla.
- Frontend dosyalarına dokunma.
```
