import { TaxonomyNode } from '../types';

export const FIELDS: Record<string, string> = {
  "11": "Ziraat ve Biyoloji",
  "12": "Sanat ve Beşeri Bilimler",
  "13": "Biyokimya ve Genetik",
  "14": "İşletme ve Yönetim",
  "15": "Kimya Mühendisliği",
  "16": "Kimya",
  "17": "Bilgisayar Bilimleri",
  "18": "Karar Bilimleri",
  "19": "Yer ve Gezegen Bilimleri",
  "20": "Ekonomi",
  "21": "Enerji",
  "22": "Mühendislik",
  "23": "Çevre Bilimleri",
  "24": "İmmünoloji",
  "25": "Malzeme Bilimi",
  "26": "Matematik",
  "27": "Tıp",
  "28": "Nörobilim",
  "29": "Hemşirelik",
  "30": "Farmakoloji",
  "31": "Fizik ve Astronomi",
  "32": "Psikoloji",
  "33": "Sosyal Bilimler ve Hukuk",
  "34": "Veterinerlik",
  "35": "Diş Hekimliği",
  "36": "Sağlık Meslekleri"
};

export const OA_STATUS: Record<string, string> = {
  gold: "Altın",
  green: "Yeşil",
  hybrid: "Hibrit",
  bronze: "Bronz",
  diamond: "Elmas",
  closed: "Kapalı"
};

const N = (label: string, o: { s?: { u?: number; f?: number }; q?: string } = {}, ch?: TaxonomyNode[]): TaxonomyNode => ({
  id: '',
  label,
  ...o,
  children: ch || []
});

const C = (a: [string, string][]): TaxonomyNode[] => a.map(([l, x]) => N(l, { q: x }));

export const RAW_TAXONOMY: TaxonomyNode[] = [
  // ── SU ÜRÜNLERİ (Kapsamlı 3 Seviyeli Derinlik) ──
  N("Su Ürünleri", { s: { u: 1104 } }, [
    N("Balık Yetiştiriciliği ve Akuakültür", { q: 'aquaculture OR "fish farming" OR mariculture' }, C([
      ["Deniz Akuakültürü ve Marikültür", 'mariculture OR "marine aquaculture" OR "cage aquaculture"'],
      ["Tatlı Su Yetiştiriciliği", '"freshwater aquaculture" OR "trout farming" OR "carp culture"'],
      ["Kuluçkahane ve Larva Yetiştiriciliği", 'hatchery OR "larval rearing" OR "fingerling production"'],
      ["Balık Besleme ve Yem Teknolojisi", '"aquafeed" OR "fish nutrition" OR "feed conversion"'],
      ["Kapalı Devre Su Ürünleri (RAS)", '"recirculating aquaculture" OR "RAS system" OR biofilter'],
      ["Kabuklu ve Yumuşakça Yetiştiriciliği", 'bivalve OR mussel OR oyster OR shrimp OR crustacean']
    ])),
    N("Balıkçılık Yönetimi ve Dinamiği", { q: 'fisheries OR "fisheries management"' }, C([
      ["Balık Stok Değerlendirmesi", '"stock assessment" OR "fish stock" OR "maximum sustainable yield"'],
      ["Av Araçları ve Avlanma Teknolojisi", '"fishing gear" OR trawl OR bycatch OR "purse seine"'],
      ["Sürdürülebilir Balıkçılık ve Kotalar", '"sustainable fisheries" OR "fisheries governance" OR TAC'],
      ["Akustik Balık Tespiti ve İskandil", '"fisheries acoustics" OR echosounder OR "biomass estimation"']
    ])),
    N("Balık Sağlığı ve Hastalıkları", { q: '"fish disease" OR "fish pathology"' }, C([
      ["Bakteriyel ve Viral Patojenler", '"fish pathology" OR vibriosis OR aeromonas OR IPNV'],
      ["Balık Parazitolojisi", '"fish parasite" OR sea lice OR caligus OR myxozoa'],
      ["Balık İmmünolojisi ve Aşıları", '"fish immunology" OR "fish vaccine" OR immunostimulants']
    ])),
    N("Balık Biyolojisi, Genetiği ve Fizyolojisi", { q: '"fish biology" OR "fish physiology"' }, C([
      ["Üreme Biyolojisi ve Endokrinoloji", '"fish reproduction" OR "gonadal development" OR vitellogenin'],
      ["Balık Refahı ve Davranışı", '"fish welfare" OR "fish behavior" OR stress response'],
      ["Akuatik Genetik ve Islah", '"fish genetics" OR "selective breeding" OR "aquaculture genomics"']
    ])),
    N("Su Ürünleri İşleme ve Kalite", { q: '"seafood processing" OR "fish processing"' }, C([
      ["Tazelik, Kalite ve Raf Ömrü", '"seafood quality" OR "fish freshness" OR sensory evaluation'],
      ["Balık Yağı ve Unu Teknolojisi", '"fish oil" OR "fish meal" OR omega-3 OR EPA DHA'],
      ["Yan Ürün Değerlendirme ve Biyopolimerler", '"seafood by-products" OR collagen OR chitin OR chitosan']
    ])),
    N("Akuatik Ekoloji ve Limnoloji", { q: '"aquatic ecology" OR limnology' }, C([
      ["Göl ve Akarsu Ekolojisi", 'limnology OR "freshwater ecosystem" OR riverine'],
      ["Planktonoloji ve Alg Kültürü", 'phytoplankton OR zooplankton OR microalgae OR "harmful algal blooms"'],
      ["İstilacı Su Türleri ve Biyoçeşitlilik", '"invasive aquatic species" OR biofouling OR "aquatic biodiversity"']
    ]))
  ]),

  // ── DENİZ BİLİMLERİ (Kapsamlı Çok Seviyeli Derinlik) ──
  N("Deniz Bilimleri", { s: { u: 1910 } }, [
    N("Fiziksel Oşinografi", { q: '"physical oceanography"' }, C([
      ["Okyanus Sirkülasyonu ve Akıntıları", '"ocean circulation" OR "thermohaline circulation" OR "ocean currents"'],
      ["Dalga, Gelgit ve Kıyı Hidrodinamiği", '"ocean waves" OR "tidal dynamics" OR tsunami OR internal waves'],
      ["Deniz Seviyesi Değişimleri", '"sea level rise" OR "sea level variability" OR altimetry'],
      ["Okyanus-Atmosfer Etkileşimi", '"air-sea interaction" OR ENSO OR "El Niño" OR air-sea fluxes']
    ])),
    N("Kimyasal Oşinografi", { q: '"chemical oceanography"' }, C([
      ["Deniz Asitlenmesi ve Karbon Döngüsü", '"ocean acidification" OR "marine carbon cycle" OR alkalinity'],
      ["Biyojeokimyasal Döngüler ve Besin Tuzları", '"marine biogeochemistry" OR "nitrogen cycle" OR phosphate OR silicate'],
      ["Deniz Kirliliği ve Mikroplastikler", '"marine pollution" OR microplastics OR "heavy metal pollution" OR plastic debris'],
      ["Deniz Suyu Gaz Dengesi ve Hipoksi", '"dissolved oxygen" OR hypoxia OR "oxygen minimum zone"']
    ])),
    N("Deniz Biyolojisi ve Pelajik Ekoloji", { q: '"marine biology" OR "marine ecology"' }, C([
      ["Mercan Resifleri ve Tropikal Denizler", '"coral reef" OR "coral bleaching" OR scleractinian'],
      ["Derin Deniz ve Hidrotermal Bacalar", '"deep sea" OR "hydrothermal vent" OR benthic OR abyssal'],
      ["Kıyı ve Haliç Ekosistemleri", '"coastal ecosystem" OR estuary OR mangrove OR seagrass meadow'],
      ["Deniz Koruma Alanları ve Biyoçeşitlilik", '"marine biodiversity" OR "marine protected area" OR MPA']
    ])),
    N("Deniz Jeolojisi ve Jeofiziği", { q: '"marine geology" OR "marine geophysics"' }, C([
      ["Deniz Tabanı Morfolojisi ve Batimetri", 'bathymetry OR "seabed mapping" OR "mid-ocean ridge" OR trenches'],
      ["Kıyı Çökelme Dinamiği ve Erozyon", '"sediment transport" OR "coastal erosion" OR marine sediment'],
      ["Paleoceanografi ve Denizel Çökeller", 'paleoceanography OR foraminifera OR "sediment core"']
    ])),
    N("Kutup Okyanusları ve Kriyosfer", { q: '"polar ocean" OR cryosphere' }, C([
      ["Deniz Buzu Dinamiği", '"sea ice" OR "ice shelf" OR "ice thickness"'],
      ["Arktik ve Antarktik Ekosistemleri", '"Southern Ocean" OR "Arctic Ocean" OR polar ecology']
    ]))
  ]),

  // ── ZİRAAT (Tarım Ayrı Başlık) ──
  N("Ziraat", { s: { f: 11 } }, C([
    ["Tarla Bitkileri", '"field crops" OR cereals OR wheat OR maize OR legumes'],
    ["Bahçe Bitkileri ve Meyvecilik", 'horticulture OR pomology OR viticulture OR olericulture'],
    ["Bitki Koruma ve Fitopatoloji", '"plant pathology" OR phytopathology OR entomology OR "weed science"'],
    ["Toprak Bilimi ve Bitki Besleme", '"soil science" OR "plant nutrition" OR "soil fertility" OR fertilizer'],
    ["Tarımsal Sulama ve Drenaj", '"agricultural irrigation" OR "water management" OR drought'],
    ["Tarım Ekonomisi ve Politikaları", '"agricultural economics" OR agribusiness OR "food security"'],
    ["Tarım Makineleri ve Hassas Tarım", '"precision agriculture" OR "smart farming" OR agricultural machinery'],
    ["Tohumculuk ve Bitki Islahı", '"plant breeding" OR "crop improvement" OR seed technology']
  ])),

  // ── VETERİNERLİK (Ayrı Başlık) ──
  N("Veterinerlik", { s: { f: 34 } }, C([
    ["Veteriner İç Hastalıkları", '"veterinary internal medicine" OR "veterinary clinical"'],
    ["Veteriner Cerrahi ve Anesteziyoloji", '"veterinary surgery" OR "veterinary anesthesiology"'],
    ["Doğum, Jinekoloji ve Suni Tohumlama", '"veterinary theriogenology" OR "veterinary obstetrics"'],
    ["Veteriner Mikrobiyoloji ve Viroloji", '"veterinary microbiology" OR "veterinary virology"'],
    ["Veteriner Parazitolojisi", '"veterinary parasitology" OR helminthes OR ticks'],
    ["Veteriner Patoloji ve Teşhis", '"veterinary pathology" OR necropsy'],
    ["Zootekni ve Hayvan Islahı", '"animal breeding" OR zootechnics OR livestock genetics'],
    ["Hayvan Besleme ve Yem Hijyeni", '"animal nutrition" OR "feed science" OR ruminant'],
    ["Veteriner Halk Sağlığı ve Zoonozlar", 'zoonosis OR "veterinary public health" OR "meat hygiene"']
  ])),

  // ── BİYOLOJİ (Biyokimya, Genetik ve Moleküler Biyoloji dahil) ──
  N("Biyoloji", { s: { f: 13 } }, C([
    ["Moleküler Biyoloji ve Transkripsiyon", '"molecular biology" OR "gene expression" OR transcription OR "DNA repair"'],
    ["Genetik, Genomik ve Epigenetik", 'genetics OR genomics OR epigenetics OR CRISPR OR "population genetics"'],
    ["Biyokimya ve Enzimoloji", 'biochemistry OR enzymology OR "protein structure" OR metabolism OR enzyme'],
    ["Biyoteknoloji ve Biyomühendislik", 'biotechnology OR "recombinant DNA" OR bioprocess OR synthetic biology'],
    ["Zooloji ve Hayvan Biyolojisi", 'zoology OR "animal biology" OR "comparative anatomy" OR ethology'],
    ["Botanik ve Bitki Fizyolojisi", 'botany OR "plant biology" OR "plant physiology" OR mycology'],
    ["Mikrobiyoloji ve Viroloji", 'microbiology OR virology OR bacteriology OR microbiome'],
    ["Ekoloji ve Biyoçeşitlilik", 'ecology OR biodiversity OR "ecosystem functioning" OR conservation'],
    ["Evrimsel Biyoloji ve Filogenetik", '"evolutionary biology" OR phylogenetics OR speciation OR adaptation'],
    ["Hücre Biyolojisi ve İmmünoloji", '"cell biology" OR immunology OR "cellular signaling" OR apoptosis']
  ])),

  // ── HUKUK (Genişletilmiş Alt Dallar) ──
  N("Hukuk", { s: { u: 3308 } }, C([
    ["Anayasa Hukuku", '"constitutional law" OR "constitutional court" OR fundamental rights'],
    ["İdare Hukuku ve İdari Yargı", '"administrative law" OR "judicial review" OR public administration'],
    ["Ceza Hukuku ve Kriminoloji", '"criminal law" OR "criminal procedure" OR criminology OR penology'],
    ["Medeni Hukuk ve Aile Hukuku", '"civil law" OR "family law" OR "property law" OR inheritance'],
    ["Borçlar ve Sözleşmeler Hukuku", '"contract law" OR "tort law" OR obligations OR liability'],
    ["Ticaret ve Şirketler Hukuku", '"commercial law" OR "corporate law" OR bankruptcy OR securities'],
    ["Deniz Hukuku ve Uluslararası Deniz Hakları", '"maritime law" OR "law of the sea" OR UNCLOS OR "admiralty law"'],
    ["Bilişim, Siber ve Yapay Zekâ Hukuku", '"cyber law" OR "artificial intelligence law" OR "data protection" OR GDPR'],
    ["Fikri Mülkiyet, Telif ve Patent Hukuku", '"intellectual property" OR "patent law" OR copyright OR trademark'],
    ["Uluslararası Kamu Hukuku ve İnsan Hakları", '"public international law" OR "human rights law" OR ECHR'],
    ["İş, Sosyal Güvenlik ve Çalışma Hukuku", '"labour law" OR "employment law" OR "social security law"'],
    ["Çevre, İklim ve Enerji Hukuku", '"environmental law" OR "climate law" OR "energy law"'],
    ["Vergi ve Mali Hukuk", '"tax law" OR fiscal law OR taxation'],
    ["Rekabet ve Tüketici Hukuku", '"competition law" OR "antitrust law" OR "consumer protection"'],
    ["Hukuk Felsefesi ve Sosyolojisi", '"philosophy of law" OR "legal sociology" OR jurisprudence']
  ])),

  // ── KİMYA (Genişletilmiş Alt Dallar) ──
  N("Kimya", { s: { f: 16 } }, C([
    ["Organik Kimya ve Sentez", '"organic chemistry" OR "organic synthesis" OR asymmetric synthesis'],
    ["Anorganik ve Koordinasyon Kimyası", '"inorganic chemistry" OR "coordination complexes" OR organometallic'],
    ["Analitik Kimya ve Spektroskopi", '"analytical chemistry" OR chromatography OR "mass spectrometry" OR NMR'],
    ["Fizikokimya ve Kimyasal Kinetik", '"physical chemistry" OR "chemical kinetics" OR thermodynamics'],
    ["Kuantum ve Hesaplamalı Kimya", '"computational chemistry" OR "quantum chemistry" OR DFT OR molecular dynamics'],
    ["Polimer Kimyası ve Biyopolimerler", '"polymer chemistry" OR polymerization OR macromolecule OR hydrogels'],
    ["Tıbbi ve Farmasötik Kimya", '"medicinal chemistry" OR "drug discovery" OR pharmacophore'],
    ["Elektrokimya ve Pil Teknolojileri", 'electrochemistry OR batteries OR "lithium ion" OR "fuel cells" OR corrosion'],
    ["Su ve Çevre Kimyası", '"water chemistry" OR "environmental chemistry" OR "aquatic chemistry"'],
    ["Yeşil Kimya ve Kataliz", '"green chemistry" OR catalysis OR photocatalysis OR biocatalysis']
  ])),

  // ── YER VE GEZEGEN BİLİMLERİ (Çokça Alt Alan) ──
  N("Yer ve Gezegen Bilimleri", { s: { f: 19 } }, C([
    ["Yapısal Jeoloji ve Tektonik", '"structural geology" OR tectonics OR "plate tectonics" OR faulting'],
    ["Jeofizik ve Sismoloji", 'geophysics OR seismology OR "earthquake dynamics" OR seismic'],
    ["Mineraloji, Petroloji ve Volkanoloji", 'mineralogy OR petrology OR volcanology OR igneous OR metamorphic'],
    ["Hidroloji ve Yeraltı Suları", 'hydrology OR hydrogeology OR groundwater OR aquifers'],
    ["Atmosfer Bilimleri ve Meteoroloji", '"atmospheric science" OR meteorology OR precipitation OR atmospheric chemistry'],
    ["İklim Bilimi ve Paleoklimatoloji", '"climate science" OR paleoclimate OR "climate variability"'],
    ["Gezegen Bilimleri ve Astromalzemeler", '"planetary science" OR "planetary geology" OR meteorites OR Mars OR lunar'],
    ["Uzaktan Algılama ve Coğrafi Bilgi Sistemleri (CBS)", '"remote sensing" OR GIS OR satellite imagery OR LiDAR'],
    ["Sedimantoloji ve Stratigrafi", 'sedimentology OR stratigraphy OR "basin analysis"'],
    ["Jeomorfoloji ve Kıyı Süreçleri", 'geomorphology OR "landscape evolution" OR weathering OR karst']
  ])),

  // ── FİZİK (Astronomi Ayrıldı) ──
  N("Fizik", { s: { f: 31 } }, C([
    ["Kuantum Fiziği ve Kuantum Mekaniği", '"quantum physics" OR "quantum mechanics" OR entanglement OR quantum state'],
    ["Yoğun Madde Fiziği ve Süperiletkenlik", '"condensed matter physics" OR superconductivity OR semiconductors OR graphene'],
    ["Parçacık Fiziği ve Yüksek Enerji", '"particle physics" OR "high energy physics" OR Higgs OR CERN OR quarks'],
    ["Nükleer Fizik ve Reaksiyonlar", '"nuclear physics" OR "nuclear fusion" OR "nuclear fission"'],
    ["Optik, Lazer ve Fotonik", 'optics OR photonics OR lasers OR "quantum optics" OR spectroscopy'],
    ["Akışkanlar Fiziği ve Plazma Fiziği", '"fluid dynamics" OR "plasma physics" OR turbulence OR magnetohydrodynamics'],
    ["Termodinamik ve İstatistiksel Fizik", 'thermodynamics OR "statistical mechanics" OR entropy'],
    ["Elektromanyetizma ve Elektrodinamik", 'electromagnetism OR electrodynamics OR "electromagnetic waves"'],
    ["Biyofizik ve Medikal Fizik", 'biophysics OR "medical physics" OR biomechanics']
  ])),

  // ── ASTRONOMİ VE UZAY BİLİMLERİ (Ayrı Başlık) ──
  N("Astronomi ve Uzay Bilimleri", { s: { f: 31 }, q: 'astronomy OR astrophysics OR cosmology' }, C([
    ["Astrofizik ve Yıldız Dinamiği", 'astrophysics OR "stellar evolution" OR supernovae OR nucleosynthesis'],
    ["Kozmoloji ve Evrenbilim", 'cosmology OR "dark matter" OR "dark energy" OR "cosmic microwave background"'],
    ["Karadelikler ve Nötron Yıldızları", '"black hole" OR "neutron star" OR "gravitational waves" OR pulsar'],
    ["Gezegen Astronomisi ve Ötegezegenler", 'exoplanets OR "planetary systems" OR "extrasolar planets" OR astrobiology'],
    ["Galaktik Astronomi ve Yıldızlararası Ortam", 'galaxies OR "interstellar medium" OR "Milky Way" OR active galactic nuclei'],
    ["Radyo ve Yüksek Enerji Astronomisi", '"radio astronomy" OR "gamma-ray burst" OR "X-ray astronomy"'],
    ["Güneş Fiziği ve Uzay Havası", '"solar physics" OR "solar flare" OR "space weather" OR corona'],
    ["Gözlemsel Astronomi ve Teleskop Teknolojileri", '"observational astronomy" OR telescopes OR spectroscopy OR interferometry']
  ])),

  // ── MÜHENDİSLİK ──
  N("Mühendislik", { s: { f: 22 } }, [
    N("Bilgisayar Mühendisliği ve Yapay Zekâ", { s: { f: 17 } }, C([
      ["Yapay Zekâ ve Derin Öğrenme", '"artificial intelligence" OR "deep learning" OR neural networks'],
      ["Makine Öğrenmesi ve Veri Bilimi", '"machine learning" OR "data science" OR big data'],
      ["Yazılım Mühendisliği ve Mimarisi", '"software engineering" OR "software architecture"'],
      ["Siber Güvenlik ve Kriptografi", 'cybersecurity OR cryptography OR network security'],
      ["Robotik ve Otonom Sistemler", 'robotics OR "autonomous systems" OR computer vision']
    ])),
    N("Elektrik-Elektronik Mühendisliği", { s: { f: 22 }, q: '"electrical engineering" OR electronics' }, C([
      ["Mikroelektronik ve Yarı İletkenler", 'semiconductor OR microelectronics OR VLSI'],
      ["Güç Sistemleri ve Yenilenebilir Enerji", '"power systems" OR "smart grid" OR power electronics'],
      ["Haberleşme ve Sinyal İşleme", '"telecommunications" OR "signal processing" OR 5G 6G'],
      ["Kontrol ve Otomasyon", '"control systems" OR automation OR sensor']
    ])),
    N("Makine Mühendisliği", { s: { f: 22 }, q: '"mechanical engineering"' }, C([
      ["Termodinamik ve Isı Transferi", 'thermodynamics OR "heat transfer"'],
      ["Akışkanlar Mekaniği ve CFD", '"fluid mechanics" OR "computational fluid dynamics"'],
      ["Mekanik Tasarım ve İmalat", '"mechanical design" OR manufacturing OR additive manufacturing'],
      ["Titreşim ve Akustik", 'vibrations OR acoustics OR modal analysis']
    ])),
    N("İnşaat Mühendisliği", { s: { f: 22 }, q: '"civil engineering"' }, C([
      ["Yapı Mekaniği ve Deprem Mühendisliği", '"structural engineering" OR "earthquake engineering"'],
      ["Geoteknik ve Zemin Mekaniği", 'geotechnical OR "soil mechanics" OR foundation'],
      ["Hidrolik ve Su Kaynakları", '"hydraulic engineering" OR "water resources"'],
      ["Ulaştırma Mühendisliği", '"transportation engineering" OR traffic']
    ])),
    N("Kimya Mühendisliği", { s: { f: 15 } }, C([
      ["Proses Tasarımı ve Simülasyon", '"process design" OR "chemical process"'],
      ["Reaksiyon Mühendisliği ve Reaktörler", '"chemical reactor" OR "reaction engineering"'],
      ["Biyoproses Mühendisliği", '"biochemical engineering" OR bioreactor']
    ])),
    N("Malzeme ve Metalurji Mühendisliği", { s: { f: 25 } }, C([
      ["Nanomalzemeler ve Nanoteknoloji", 'nanomaterials OR nanoparticles OR nanocomposites'],
      ["Metalik Malzemeler ve Alaşımlar", 'alloys OR metallurgy OR steel'],
      ["Seramikler ve Kompozitler", 'ceramics OR composites OR biomaterials'],
      ["Korozyon ve Yüzey İşlemleri", 'corrosion OR "surface engineering"']
    ])),
    N("Çevre Mühendisliği", { s: { f: 23 } }, C([
      ["Atık Su Arıtımı ve İleri Oksidasyon", '"wastewater treatment" OR membrane bioreactor'],
      ["Hava Kirliliği Kontrolü", '"air pollution control" OR particulate matter'],
      ["Katı Atık Yönetimi ve Geri Dönüşüm", '"waste management" OR circular economy']
    ])),
    N("Biyomedikal Mühendisliği", { q: '"biomedical engineering" OR biomaterials' }, C([
      ["Biyomalzemeler ve Doku Mühendisliği", 'biomaterials OR "tissue engineering"'],
      ["Tıbbi Görüntüleme ve Cihazlar", '"medical imaging" OR "medical device"'],
      ["Biyomekanik", 'biomechanics OR prosthetics']
    ])),
    N("Enerji Sistemleri Mühendisliği", { s: { f: 21 } }, C([
      ["Güneş ve Rüzgâr Enerjisi", '"solar energy" OR photovoltaic OR "wind energy"'],
      ["Enerji Depolama ve Bataryalar", '"energy storage" OR "battery storage"'],
      ["Hidrojen Enerjisi ve Yakıt Pilleri", '"hydrogen energy" OR "fuel cell"']
    ]))
  ]),

  // ── SOSYAL VE BEŞERİ BİLİMLERDEN AYRILAN HER BİR BAĞIMSIZ BAŞLIK ──

  // 1. SOSYOLOJİ
  N("Sosyoloji", { s: { f: 33 }, q: 'sociology' }, C([
    ["Sosyoloji Teorisi ve Metodoloji", '"sociological theory" OR "sociology methodology"'],
    ["Kent ve Göç Sosyolojisi", '"urban sociology" OR "migration studies" OR immigration OR urbanization'],
    ["Aile ve Toplumsal Cinsiyet", '"sociology of gender" OR "family sociology" OR gender studies'],
    ["Kültür, Sanat ve Din Sosyolojisi", '"sociology of culture" OR "sociology of religion"'],
    ["Çalışma, Sanayi ve Örgüt Sosyolojisi", '"sociology of work" OR "industrial sociology" OR labor market'],
    ["Sosyal Tabakalaşma ve Eşitsizlik", '"social stratification" OR "social inequality" OR social class']
  ])),

  // 2. SİYASET BİLİMİ
  N("Siyaset Bilimi", { s: { f: 33 }, q: '"political science"' }, C([
    ["Siyaset Teorisi ve Felsefesi", '"political theory" OR "political philosophy"'],
    ["Karşılaştırmalı Siyaset", '"comparative politics" OR democratization OR authoritarianism'],
    ["Kamu Yönetimi ve Politikaları", '"public administration" OR "public policy" OR governance'],
    ["Seçim Sistemleri ve Siyasal Davranış", '"electoral systems" OR "voting behavior" OR political participation'],
    ["Siyasal İletişim ve Medya", '"political communication" OR "public opinion" OR propaganda']
  ])),

  // 3. ULUSLARARASI İLİŞKİLER
  N("Uluslararası İlişkiler", { s: { f: 33 }, q: '"international relations"' }, C([
    ["Dış Politika Analizi", '"foreign policy analysis" OR diplomacy OR bilateral relations'],
    ["Uluslararası Güvenlik ve Strateji", '"international security" OR deterrence OR geopolitics OR warfare'],
    ["Küresel Yönetişim ve Uluslararası Örgütler", '"global governance" OR "international organizations" OR UN'],
    ["Çatışma Çözümü ve Barış Çalışmaları", '"conflict resolution" OR "peace studies" OR mediation'],
    ["Bölgesel Çalışmalar ve Jeopolitik", '"regional studies" OR geopolitics OR regionalism']
  ])),

  // 4. EĞİTİM BİLİMLERİ
  N("Eğitim Bilimleri", { s: { f: 33 }, q: 'pedagogy OR education' }, C([
    ["Eğitim Programları ve Öğretim (Müfredat)", 'curriculum development OR pedagogy OR "instructional design"'],
    ["Eğitim Yönetimi ve Denetimi", '"educational leadership" OR "school administration"'],
    ["Ölçme ve Değerlendirme", '"educational assessment" OR psychometrics OR testing'],
    ["Eğitim Teknolojileri ve Uzaktan Eğitim", '"educational technology" OR "distance learning" OR e-learning'],
    ["Özel Eğitim ve Rehberlik", '"special education" OR "school counseling" OR gifted education'],
    ["Yükseköğretim ve Üniversite Çalışmaları", '"higher education" OR academic performance']
  ])),

  // 5. TARİH
  N("Tarih", { s: { f: 12 }, q: 'history OR historiography' }, C([
    ["Eskiçağ ve Antik Tarih", '"ancient history" OR antiquity OR archaeology OR Roman OR Greek'],
    ["Ortaçağ Tarihi", '"medieval history" OR Byzantine OR "Middle Ages" OR Ottoman'],
    ["Yeniçağ ve Yakınçağ Tarihi", '"early modern history" OR "modern history" OR colonialism'],
    ["Cumhuriyet ve Çağdaş Tarih", 'contemporary history OR "20th century history" OR Cold War'],
    ["Kültür, Sanat ve Medeniyet Tarihi", '"cultural history" OR "history of civilization"'],
    ["Tarihyazımı ve Metodoloji", 'historiography OR "historical methodology"']
  ])),

  // 6. FELSEFE
  N("Felsefe", { s: { f: 12 }, q: 'philosophy' }, C([
    ["Epistemoloji (Bilgi Felsefesi)", 'epistemology OR "theory of knowledge"'],
    ["Etik ve Ahlak Felsefesi", 'ethics OR "moral philosophy" OR bioethics'],
    ["Mantık ve Akıl Yürütme", '"philosophical logic" OR modal logic OR argumentation'],
    ["Ontoloji ve Metafizik", 'ontology OR metaphysics OR "philosophy of being"'],
    ["Zihin Felsefesi ve Bilinç", '"philosophy of mind" OR consciousness OR cognitive philosophy'],
    ["Bilim Felsefesi", '"philosophy of science" OR Kuhn OR Popper OR realism']
  ])),

  // 7. DİL VE EDEBİYAT
  N("Dil ve Edebiyat", { s: { f: 12 }, q: 'linguistics OR literature' }, C([
    ["Genel Dilbilim ve Sentaks", 'linguistics OR syntax OR phonology OR semantics OR morphology'],
    ["Karşılaştırmalı Edebiyat", '"comparative literature" OR "world literature"'],
    ["Dil Edinimi ve Dil Öğretimi", '"language acquisition" OR "applied linguistics" OR SLA'],
    ["Edebi Teori ve Eleştiri", '"literary theory" OR "literary criticism"'],
    ["Çeviribilim ve Kültürel Aktarım", '"translation studies" OR interpreting'],
    ["Söylem Analizi ve Göstergebilim", '"discourse analysis" OR semiotics']
  ])),

  // 8. PSİKOLOJİ
  N("Psikoloji", { s: { f: 32 } }, C([
    ["Bilişsel Psikoloji", '"cognitive psychology" OR memory OR attention OR perception'],
    ["Sosyal Psikoloji", '"social psychology" OR attitudes OR prejudice OR group dynamics'],
    ["Klinik Psikoloji ve Psikopatoloji", '"clinical psychology" OR depression OR anxiety OR psychotherapy'],
    ["Gelişim Psikolojisi", '"developmental psychology" OR "child development" OR adolescence'],
    ["Nöropsikoloji ve Davranışsal Nörobilim", 'neuropsychology OR "behavioral neuroscience"'],
    ["Örgütsel ve Endüstriyel Psikoloji", '"organizational psychology" OR "industrial psychology"']
  ])),

  // 9. EKONOMİ
  N("Ekonomi", { s: { f: 20 } }, C([
    ["Makroekonomi ve Para Politikası", 'macroeconomics OR "monetary policy" OR inflation OR central bank'],
    ["Mikroekonomi ve Piyasa Teorisi", 'microeconomics OR "game theory" OR pricing OR consumer choice'],
    ["Ekonometri ve İstatistiksel Yöntemler", 'econometrics OR "time series analysis" OR panel data'],
    ["Kalkınma ve Büyüme Ekonomisi", '"development economics" OR "economic growth" OR poverty'],
    ["Finansal Ekonomi ve Bankacılık", '"financial economics" OR banking OR "financial stability"'],
    ["Uluslararası Ticaret ve Ekonomi", '"international trade" OR tariffs OR globalization'],
    ["Davranışsal İktisat", '"behavioral economics" OR heuristics OR "decision making"']
  ])),

  // 10. İŞLETME VE YÖNETİM
  N("İşletme ve Yönetim", { s: { f: 14 } }, C([
    ["Stratejik Yönetim ve Liderlik", '"strategic management" OR leadership OR "corporate governance"'],
    ["Pazarlama ve Tüketici Davranışları", 'marketing OR "consumer behavior" OR "brand management"'],
    ["Finansal Yönetim ve Muhasebe", '"financial management" OR accounting OR auditing OR corporate finance'],
    ["İnsan Kaynakları Yönetimi", '"human resource management" OR "talent management"'],
    ["Tedarik Zinciri ve Lojistik", '"supply chain management" OR logistics OR operations'],
    ["Girişimcilik ve İnovasyon", 'entrepreneurship OR "innovation management" OR startups']
  ])),

  // ── TIP VE SAĞLIK BİLİMLERİ ──
  N("Tıp ve Sağlık Bilimleri", { s: { f: 27 } }, [
    ...C([
      ["Halk Sağlığı ve Epidemiyoloji", '"public health" OR epidemiology OR preventive medicine'],
      ["Klinik Tıp ve Dahiliye", '"clinical medicine" OR "clinical trial" OR oncology OR cardiology'],
      ["Cerrahi Tıp Bilimleri", 'surgery OR "surgical oncology" OR transplantation']
    ]),
    N("Farmakoloji ve İlaç Geliştirme", { s: { f: 30 } }),
    N("Hemşirelik ve Hasta Bakımı", { s: { f: 29 } }),
    N("İmmünoloji ve Alerji", { s: { f: 24 } }),
    N("Nörobilim ve Beyin Araştırmaları", { s: { f: 28 } }),
    N("Diş Hekimliği", { s: { f: 35 } })
  ]),

  // ── MATEMATİK VE İSTATİSTİK ──
  N("Matematik ve İstatistik", { s: { f: 26 } }, C([
    ["Uygulamalı Matematik ve Analiz", '"applied mathematics" OR "numerical analysis" OR differential equations'],
    ["İstatistik ve Olasılık", '"statistical modeling" OR probability OR "stochastic process" OR Bayesian'],
    ["Cebir ve Sayılar Teorisi", 'algebra OR "number theory" OR cryptography'],
    ["Geometri ve Topoloji", 'geometry OR topology OR manifolds'],
    ["Matematiksel Modelleme ve Optimizasyon", '"mathematical modeling" OR optimization OR dynamical systems']
  ])),

  // ── ÇEVRE BİLİMLERİ ──
  N("Çevre Bilimleri", { s: { f: 23 } }, C([
    ["İklim Değişikliği ve Küresel Isınma", '"climate change" OR "global warming" OR greenhouse gas'],
    ["Koruma Biyolojisi ve Habitat Kaybı", '"conservation biology" OR "endangered species" OR habitat fragmentation'],
    ["Çevre Kirliliği ve Ekotoksikoloji", 'pollution OR toxicology OR ecotoxicology OR "heavy metals"'],
    ["Çevre Politikaları ve Sürdürülebilirlik", '"environmental policy" OR "sustainability science" OR ESG']
  ]))
];

// Build linked tree
export const TAXONOMY_NODES: Record<string, TaxonomyNode> = {};

function walk(nodes: TaxonomyNode[], parent: TaxonomyNode | null, prefix: string) {
  nodes.forEach((node, i) => {
    node.id = prefix + i;
    node.parent = parent;
    node.root = parent ? parent.root : node;
    TAXONOMY_NODES[node.id] = node;
    walk(node.children, node, node.id + ".");
  });
}

walk(RAW_TAXONOMY, null, "r");
export const TAXONOMY = RAW_TAXONOMY;
