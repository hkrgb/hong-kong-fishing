# 魚圖核對與更正 — 2026-10-08

逐張檢視遊戲實際載入的 170 種魚圖，對照魚名、學名及可見外形。11 張重新生成；其餘 159 張未見明顯錯配，這是遊戲美術外觀核對，並非標本級分類鑑定。近似種及幼成魚顏色可能不同，不能單憑生成圖作現實辨識。魚庫數量、文字資料、難度、價格及存檔均保留。

使用內置 image_gen，逐種獨立生成透明寫實 PNG。生成後再檢視斑紋、尾鰭、完整身體與透明度。完整提示詞見 [JSON](fish-image-prompts-20261008.json)，資產存於 assets/fish/review-20261008/。沒有把參考網站的版權照片放入遊戲。

|魚名／學名|修正原因|參考|
|---|---|---|
|倒吊 / Prionurus scalprum|尾柄骨板及尾鰭顏色不配合|[來源](https://fishdb.sinica.edu.tw/chi/species.php?gen=Prionurus&spe=scalprum)|
|四間梳蘿 / Apogon fasciatus|把縱向橫紋錯畫成垂直暗帶|[來源](https://fishesofaustralia.net.au/home/species/3252)|
|鶴針 / Fistularia commersonii|尾鰭及尾絲形狀不清楚|[來源](https://fishesofaustralia.net.au/home/species/1507)|
|豬刀 / Mene maculata|體形及背臀鰭近似其他魚種|[來源](https://fishesofaustralia.net.au/home/species/580)|
|波紋裸胸鱔 / Gymnothorax undulatus|舊圖身體及尾部未清楚呈現|[來源](https://fishesofaustralia.net.au/home/species/3818)|
|澳洲雙犁海鱔 / Gymnothorax thyrsoideus|舊圖尾部及白眼特徵不足|[來源](https://fishesofaustralia.net.au/home/species/3820)|
|花鱔 / Gymnothorax reevesii|舊圖尾部及斑紋辨識度不足|[來源](https://zoolstud.sinica.edu.tw/Journals/33.1/44.pdf)|
|坑鰜 / Plotosus lineatus|舊圖尾部及口鬚未清楚呈現|[來源](https://fishesofaustralia.net.au/home/species/2766)|
|藍環荷包 / Pomacanthus annularis|尾鰭錯畫成全黃色|[來源](https://www.kahaku.go.jp/research/db/zoology/Fishes_of_Andaman_Sea/contents/pomacanthidae/05.html)|
|福氏刺尻魚 / Centropyge vrolikii|後半身黃色與物種不符|[來源](https://fishesofaustralia.net.au/home/species/644)|
|斗鯧 / Pampus chinensis|尾鰭及背臀鰭過度分叉尖長|[來源](https://www.fao.org/4/y0870e/y0870e42.pdf)|

## 全部配圖核對清單

「保留」只表示此次未發現明顯錯配，不代表每項鰭條或微小分類特徵經專家驗證。原有俗名及學名別名保留，未更改分類文字。

|序號|魚名|學名|結果|
|---|---|---|---|
|1|黃腳鱲|Acanthopagrus latus|保留|
|2|青斑|Epinephelus coioides|保留|
|3|烏頭|Mugil cephalus|保留|
|4|鱸魚|Lateolabrax japonicus|保留|
|5|額帶刺尾魚|Acanthurus dussumieri|保留|
|6|倒吊|Prionurus scalprum|重製|
|7|透明梳蘿|Ambassis gymnocephalus|保留|
|8|裸躄魚|Histrio histrio|保留|
|9|十線梳蘿|Apogon doederleini|保留|
|10|四間梳蘿|Apogon fasciatus|重製|
|11|印度梳蘿|Apogon niger|保留|
|12|大眼梳蘿|Apogon semilineatus|保留|
|13|大炮梳蘿|Apogon pseudotaeniatus|保留|
|14|縱帶巨牙天竺鯛|Cheilodipterus artus|保留|
|15|纓副鳚|Parablennius thysanius|保留|
|16|林哥|Entomacrodus stellifer|保留|
|17|咬手仔|Petroscirtes breviceps|保留|
|18|海利|Caesio cuning|保留|
|19|雙尾烏尾鮗|Pterocaesio diagramma|保留|
|20|烏尾鮗|Caesio caerulaurea|保留|
|21|離鰭青基|Atule mate|保留|
|22|蝦尾鰺|Alepes djedaba|保留|
|23|范氏副葉鰺|Alepes vari|保留|
|24|青基|Carangoides praeustus|保留|
|25|竹鰺|Decapterus russelli|保留|
|26|金邊鰺|Selaroides leptolepis|保留|
|27|章雄|Seriola dumerili|保留|
|28|池魚|Trachurus japonicus|保留|
|29|水珍|Carangoides malabaricus|保留|
|30|章白|Trachinotus baillonii|保留|
|31|浪人鰺|Caranx ignobilis|保留|
|32|六帶水珍|Caranx sexfasciatus|保留|
|33|盲鰽|Lates calcarifer|保留|
|34|荷包魚・東方蝶魚|Chaetodon auripes|保留|
|35|荷包魚・絲鰭蝶魚|Chaetodon auriga|保留|
|36|荷包魚・月斑蝶魚|Chaetodon lunula|保留|
|37|荷包魚・黑背蝶魚|Chaetodon melannotus|保留|
|38|荷包魚・褐帶蝶魚|Chaetodon modestus|保留|
|39|香港蝶魚|Chaetodon wiebeli|保留|
|40|月光蝶魚|Chaetodon ephippium|保留|
|41|馬夫魚|Heniochus acuminatus|保留|
|42|荷包魚・線紋蝶魚|Chaetodon lineolatus|保留|
|43|荷包魚・八帶蝶魚|Chaetodon octofasciatus|保留|
|44|荷包魚・鏡斑蝶魚|Chaetodon speculum|保留|
|45|荷包魚・三帶蝶魚|Chaetodon trifascialis|保留|
|46|荷包魚・紅鰭蝶魚|Chaetodon trifasciatus|保留|
|47|荷包魚・流浪蝶魚|Chaetodon vagabundus|保留|
|48|斬三刀|Goniistius zonatus|保留|
|49|哨牙婆|Cirrhitichthys aureus|保留|
|50|尖頭鷹魚|Cirrhitichthys oxycephalus|保留|
|51|雞籠鯧|Drepane punctata|保留|
|52|魚擸|Echeneis naucrates|保留|
|53|石鯧|Platax pinnatus|保留|
|54|燕鯧|Platax teira|保留|
|55|鶴針|Fistularia commersonii|重製|
|56|銀米|Gerres filamentosus|保留|
|57|星塘鱧|Asterropteryx semipunctata|保留|
|58|深鰕虎魚|Bathygobius fuscus|保留|
|59|咬手銀|Amblyeleotris gymnocephala|保留|
|60|林哥・蝶鰕虎魚|Amblygobius phalaena|保留|
|61|林哥・梅氏鰕虎魚|Bathygobius meggitti|保留|
|62|紋斑絲鰕虎魚|Cryptocentrus strigilliceps|保留|
|63|林哥・眼斑鰕虎魚|Istigobius diadema|保留|
|64|紋縞鰕虎魚|Tridentiger trigonocephalus|保留|
|65|華麗銜鰕虎魚|Istigobius decoratus|保留|
|66|雞魚|Parapristipoma trilineatum|保留|
|67|細鱗|Diagramma pictum|保留|
|68|包公|Plectorhinchus cinctus|保留|
|69|厚唇細鱗|Plectorhinchus gibbosus|保留|
|70|雞魚・四線石鱸|Pomadasys quadrilineatus|保留|
|71|將軍甲|Sargocentron rubrum|保留|
|72|花并|Microcanthus strigatus|保留|
|73|冧蚌・斑鱾|Girella punctata|保留|
|74|冧蚌・灰舵魚|Kyphosus cinerascens|保留|
|75|冧蚌・黃舵魚|Kyphosus vaigiensis|保留|
|76|牙衣|Choerodon azurio|保留|
|77|青衣|Choerodon schoenleinii|保留|
|78|黑點牙衣|Bodianus bilunulatus|保留|
|79|綠尾唇魚|Cheilinus chlorourus|保留|
|80|雜色尖嘴魚|Gomphosus varius|保留|
|81|蠔妹|Halichoeres dussumieri|保留|
|82|花鰭海豬魚|Halichoeres poecilopterus|保留|
|83|蠔魚・細棘|Halichoeres tenuispinis|保留|
|84|裂唇魚|Labroides dimidiatus|保留|
|85|龍船魚|Thalassoma lunare|保留|
|86|蠔魚・斷線|Stethojulis interrupta|保留|
|87|羊頭衣|Semicossyphus reticulatus|保留|
|88|細長蘇彝士隆頭魚|Suezichthys gracilis|保留|
|89|黑線衣|Halichoeres kneri|保留|
|90|鞍斑錦魚|Thalassoma hardwicke|保留|
|91|海鰱|Lactarius lactarius|保留|
|92|連尖・星斑|Lethrinus nebulosus|保留|
|93|連尖・紅鰭|Lethrinus haematopterus|保留|
|94|紅鮋|Lutjanus argentimaculatus|保留|
|95|牙點|Lutjanus johnii|保留|
|96|褶尾笛鯛|Lutjanus lemniscatus|保留|
|97|紅畫眉|Lutjanus lutjanus|保留|
|98|四間畫眉|Lutjanus kasmira|保留|
|99|紅魚・馬拉巴笛鯛|Lutjanus malabaricus|保留|
|100|火點|Lutjanus russellii|保留|
|101|畫眉・單帶笛鯛|Lutjanus vitta|保留|
|102|畫眉・斑帶笛鯛|Lutjanus ophuysenii|保留|
|103|紅魚・千年笛鯛|Lutjanus sebae|保留|
|104|石蚌|Lutjanus stellatus|保留|
|105|紅雞|Pinjalo pinjalo|保留|
|106|畫眉・黑尾笛鯛|Lutjanus fulvus|保留|
|107|大青鱗|Megalops cyprinoides|保留|
|108|豬刀|Mene maculata|重製|
|109|絲尾鰭塘鱧|Ptereleotris hanae|保留|
|110|尾斑舌塘鱧|Parioglossus dotui|保留|
|111|瑰麗塘鱧|Ptereleotris evides|保留|
|112|中華沙鯭|Monacanthus chinensis|保留|
|113|沙鯭仔|Stephanolepis cirrhifer|保留|
|114|長尾革單棘魨|Aluterus scriptus|保留|
|115|黃鰭鯧|Monodactylus argenteus|保留|
|116|印度三鬚|Parupeneus indicus|保留|
|117|多帶三鬚|Parupeneus multifasciatus|保留|
|118|白鞍三鬚|Parupeneus ciliatus|保留|
|119|日本三鬚|Upeneus japonicus|保留|
|120|斑點三鬚|Upeneus tragula|保留|
|121|雙色三鬚|Parupeneus barberinoides|保留|
|122|雙帶三鬚|Parupeneus bifasciatus|保留|
|123|波紋裸胸鱔|Gymnothorax undulatus|重製|
|124|澳洲雙犁海鱔|Gymnothorax thyrsoideus|重製|
|125|花鱔|Gymnothorax reevesii|重製|
|126|白頸老鴉|Scolopsis vosmeri|保留|
|127|石金鼓|Oplegnathus fasciatus|保留|
|128|花金鼓|Oplegnathus punctatus|保留|
|129|黃箱魨|Ostracion cubicus|保留|
|130|無斑箱魨|Ostracion immaculatus|保留|
|131|三旁雞|Lactoria cornuta|保留|
|132|胭脂刀|Pempheris oualensis|保留|
|133|紅腸|Parapercis snyderi|保留|
|134|坑鰜|Plotosus lineatus|重製|
|135|藍環荷包|Pomacanthus annularis|重製|
|136|白斑刺尻魚|Centropyge tibicen|保留|
|137|福氏刺尻魚|Centropyge vrolikii|重製|
|138|石剎婆・條紋|Abudefduf vaigiensis|保留|
|139|石剎婆・孟加拉|Abudefduf bengalensis|保留|
|140|小丑魚|Amphiprion clarkii|保留|
|141|紅斑|Epinephelus akaara|保留|
|142|齊尾芝麻斑|Epinephelus areolatus|保留|
|143|東星斑|Plectropomus leopardus|保留|
|144|紅鱲|Pagrus major|保留|
|145|黑鱲|Acanthopagrus schlegelii|保留|
|146|石狗公|Sebastiscus marmoratus|保留|
|147|白點泥鯭|Siganus canaliculatus|保留|
|148|金絲鱲|Rhabdosargus sarba|保留|
|149|竹鮫|Scomberomorus commerson|保留|
|150|花鮫|Scomber japonicus|保留|
|151|老鼠斑|Cromileptes altivelis|保留|
|152|龍躉|Epinephelus lanceolatus|保留|
|153|老虎斑|Epinephelus fuscoguttatus|保留|
|154|杉斑|Epinephelus polyphekadion|保留|
|155|泥斑|Epinephelus bruneus|保留|
|156|黃斑|Epinephelus awoara|保留|
|157|長尾芝麻斑|Epinephelus bleekeri|保留|
|158|玳瑁石斑|Epinephelus quoyanus|保留|
|159|西星斑|Plectropomus areolatus|保留|
|160|皇帝星斑|Plectropomus laevis|保留|
|161|泰星斑|Plectropomus maculatus|保留|
|162|燕尾星斑|Variola louti|保留|
|163|紅瓜子斑|Cephalopholis sonnerati|保留|
|164|蘇眉|Cheilinus undulatus|保留|
|165|馬友|Eleutheronema tetradactylum|保留|
|166|白鯧|Pampus argenteus|保留|
|167|斗鯧|Pampus chinensis|重製|
|168|大黃花|Larimichthys crocea|保留|
|169|黃立鯧|Trachinotus blochii|保留|
|170|花鬼斑|Epinephelus malabaricus|保留|
