// Daily Rashifal (Horoscope) Astrological Data Engine for SabaiChha.com

export interface RashiItem {
  id: string
  nameNe: string
  nameEn: string
  symbol: string
  letters: string
  elementNe: string
  elementEn: string
  planetNe: string
  planetEn: string
  luckyNumber: number
  luckyColorNe: string
  luckyColorEn: string
  luckyDirectionNe: string
  luckyDirectionEn: string
  predictionNe: string
  predictionEn: string
}

const RASHI_METADATA = [
  {
    id: 'aries',
    nameNe: 'मेष',
    nameEn: 'Aries',
    symbol: '♈',
    letters: 'चु, चे, चो, ला, लि, लु, ले, लो, अ',
    elementNe: 'अग्नि (Fire)',
    elementEn: 'Fire',
    planetNe: 'मंगल (Mars)',
    planetEn: 'Mars',
    luckyNumber: 9,
    luckyColorNe: 'रातो',
    luckyColorEn: 'Red',
    luckyDirectionNe: 'पूर्व',
    luckyDirectionEn: 'East',
    predictions: [
      'आज तपाईंको आत्मविश्वास र कार्यक्षमता उच्च रहनेछ। व्यापार व्यवसायमा नयाँ सम्भावना खुल्नेछ भने रोकिएका कामहरू क्रमशः बन्नेछन्। पारिवारिक सुख र साथीभाइको सहयोग प्राप्त हुनेछ।',
      'नयाँ कार्यको थालनी गर्नका लागि आजको दिन शुभ छ। आर्थिक पक्ष सबल बन्दै जानेछ र प्रतिस्पर्धीहरूलाई पछि पार्न सकिनेछ। बोलीमा मिठास राख्नुहोला।',
      'काममा केही चुनौती देखिए पनि मिहिनेतको फल मिल्नेछ। स्वास्थ्यमा सुधार आउनेछ भने अध्ययन-अध्यापनमा रुचि बढ्नेछ। धार्मिक कार्यमा संलग्न हुने योग छ।',
    ],
  },
  {
    id: 'taurus',
    nameNe: 'वृष',
    nameEn: 'Taurus',
    symbol: '♉',
    letters: 'इ, उ, ए, ओ, वा, वि, वु, वे, वो',
    elementNe: 'पृथ्वी (Earth)',
    elementEn: 'Earth',
    planetNe: 'शुक्र (Venus)',
    planetEn: 'Venus',
    luckyNumber: 6,
    luckyColorNe: 'सेतो / गुलाबी',
    luckyColorEn: 'White / Pink',
    luckyDirectionNe: 'दक्षिण-पूर्व',
    luckyDirectionEn: 'South-East',
    predictions: [
      'आर्थिक कारोबारमा फाइदा हुनेछ। रचनात्मक काममा मन जानेछ भने प्रियजनहरूसँग रमाइलो भेटघाटको अवसर मिल्नेछ। भौतिक सुख-सुविधाका वस्तुहरू जोड्न सकिनेछ।',
      'व्यावसायिक यात्रा लाभदायक रहनेछ। मिहिनेतको कदर हुनेछ र कार्यक्षेत्रमा उच्च अधिकारीहरूको प्रशंसा पाइनेछ। स्वास्थ्य सामान्यतया राम्रो रहनेछ।',
      'धन लाभको बलियो सम्भावना छ। रोकिएको धन फिर्ता आउन सक्छ। पारिवारिक वातावरण सुखद् रहनेछ भने प्रेम सम्बन्धमा प्रगाढता आउनेछ।',
    ],
  },
  {
    id: 'gemini',
    nameNe: 'मिथुन',
    nameEn: 'Gemini',
    symbol: '♊',
    letters: 'का, कि, कु, घ, ङ, छ, के, को, हा',
    elementNe: 'वायु (Air)',
    elementEn: 'Air',
    planetNe: 'बुध (Mercury)',
    planetEn: 'Mercury',
    luckyNumber: 5,
    luckyColorNe: 'हरियो',
    luckyColorEn: 'Green',
    luckyDirectionNe: 'उत्तर',
    luckyDirectionEn: 'North',
    predictions: [
      'बौद्धिक क्षेत्रमा सफलता मिल्नेछ। साथीभाइ र इष्टमित्रसँग नयाँ योजनाबारे छलफल हुनेछ। वित्तीय क्षेत्रमा गरिएको लगानीले दीर्घकालीन फाइदा दिनेछ।',
      'संचार र प्रविधिको प्रयोगबाट राम्रो लाभ लिन सकिनेछ। लामो समयदेखि रोकिएका कानुनी वा प्रशासनिक कामहरू सुल्झिनेछन्। मन प्रसन्न रहनेछ।',
      'अध्ययन तथा लेखन कार्यमा प्रगति हुनेछ। नयाँ जिम्मेवारी सम्हाल्ने अवसर आउन सक्छ। बोलीको प्रभावले अरूलाई आकर्षित गर्न सकिनेछ।',
    ],
  },
  {
    id: 'cancer',
    nameNe: 'कर्कट',
    nameEn: 'Cancer',
    symbol: '♋',
    letters: 'हि, हु, हे, हो, डा, डि, डु, डे, डो',
    elementNe: 'जल (Water)',
    elementEn: 'Water',
    planetNe: 'चन्द्रमा (Moon)',
    planetEn: 'Moon',
    luckyNumber: 2,
    luckyColorNe: 'दूधिया सेतो / सिल्भर',
    luckyColorEn: 'Silvery White',
    luckyDirectionNe: 'उत्तर-पश्चिम',
    luckyDirectionEn: 'North-West',
    predictions: [
      'पारिवारिक सम्बन्ध सुमधुर रहनेछ। आमा वा मातृपक्षबाट विशेष स्नेह तथा सहयोग प्राप्त हुनेछ। घरजग्गा वा वाहन सम्बन्धी काममा सफलता मिल्नेछ।',
      'आफ्नो भावनालाई सकारात्मक दिशामा लगाउनुहोला। मनमा शान्ति र आध्यात्मिक चिन्तन बढ्नेछ। कार्यक्षेत्रमा सहकर्मीहरूको राम्रो सहयोग प्राप्त हुनेछ।',
      'मनोबल उच्च रहनेछ। यात्राको योग बन्न सक्छ। पुरानो समस्या समाधान भएर मन हलुका हुनेछ। आर्थिक पक्ष सन्तुलित रहनेछ।',
    ],
  },
  {
    id: 'leo',
    nameNe: 'सिंह',
    nameEn: 'Leo',
    symbol: '♌',
    letters: 'मा, मि, मु, मे, मो, टा, टि, टु, टे',
    elementNe: 'अग्नि (Fire)',
    elementEn: 'Fire',
    planetNe: 'सूर्य (Sun)',
    planetEn: 'Sun',
    luckyNumber: 1,
    luckyColorNe: 'सुन्तला / सुनौलो',
    luckyColorEn: 'Gold / Orange',
    luckyDirectionNe: 'पूर्व',
    luckyDirectionEn: 'East',
    predictions: [
      'नेतृत्व क्षमता प्रदर्शन गर्ने अवसर प्राप्त हुनेछ। सरकारी वा सामाजिक काममा मान-प्रतिष्ठा बढ्नेछ। पिता वा गुरुजनको मार्गदर्शन फलदायी हुनेछ।',
      'व्यापारमा उल्लेखनीय सफलता हात लाग्नेछ। ठूला व्यक्तिहरूसँग सम्पर्क बढ्नेछ र नयाँ अवसरहरू ढोका ढकढकाउनेछन्। उत्साहपूर्ण दिन रहनेछ।',
      'दृढ संकल्पका साथ अघि बढ्दा सफलता चुम्न सकिनेछ। प्रतिस्पर्धीहरू कमजोर बन्नेछन्। स्वास्थ्यमा ऊर्जा र ताजगी महसुस हुनेछ।',
    ],
  },
  {
    id: 'virgo',
    nameNe: 'कन्या',
    nameEn: 'Virgo',
    symbol: '♍',
    letters: 'टो, पा, पि, पु, ष, ण, ठ, पे, पो',
    elementNe: 'पृथ्वी (Earth)',
    elementEn: 'Earth',
    planetNe: 'बुध (Mercury)',
    planetEn: 'Mercury',
    luckyNumber: 5,
    luckyColorNe: 'गाढा हरियो',
    luckyColorEn: 'Dark Green',
    luckyDirectionNe: 'उत्तर',
    luckyDirectionEn: 'North',
    predictions: [
      'हिसाब-किताब र व्यवस्थापकीय कार्यमा कुशलता देखिनेछ। रोकिएका कामहरू सम्पादन हुनेछन्। खानपानमा ध्यान दिनुहोला भने बोलीमा संयम राख्नु उचित हुनेछ।',
      'आर्थिक लाभका नयाँ स्रोतहरू पहिचान हुनेछन्। नोकरी वा व्यवसायमा पदोन्नति वा प्रशंसा मिल्न सक्छ। सहयोगी हातहरू अघि बढ्नेछन्।',
      'विवेकपूर्ण निर्णयले भविष्यमा राम्रो फाइदा पुर्याउनेछ। स्वास्थ्यमा सुधार आउनेछ र पुराना विवादहरू मेलमिलापमा टुंगिनेछन्।',
    ],
  },
  {
    id: 'libra',
    nameNe: 'तुला',
    nameEn: 'Libra',
    symbol: '♎',
    letters: 'रा, रि, रु, रे, रो, ता, ति, तु, ते',
    elementNe: 'वायु (Air)',
    elementEn: 'Air',
    planetNe: 'शुक्र (Venus)',
    planetEn: 'Venus',
    luckyNumber: 6,
    luckyColorNe: 'हल्का नीलो / सेतो',
    luckyColorEn: 'Light Blue',
    luckyDirectionNe: 'पश्चिम',
    luckyDirectionEn: 'West',
    predictions: [
      'साझेदारी र संयुक्त व्यवसायबाट राम्रो फाइदा मिल्नेछ। दाम्पत्य जीवन सुखमय रहनेछ। कला, साहित्य वा मनोरञ्जनको क्षेत्रमा रुचि बढ्नेछ।',
      'मनमा नयाँ उमंग छाउनेछ। सौन्दर्य र फेसन सम्बन्धी काममा आकर्षण बढ्नेछ। मित्रजनहरूसँगको सहकार्य फलदायी साबित हुनेछ।',
      'आर्थिक सन्तुलन कायम रहनेछ। सामाजिक प्रतिष्ठामा वृद्धि हुनेछ। न्यायिक वा विवादित विषयमा तपाईंको पक्ष सबल बन्नेछ।',
    ],
  },
  {
    id: 'scorpio',
    nameNe: 'वृश्चिक',
    nameEn: 'Scorpio',
    symbol: '♏',
    letters: 'तो, ना, नि, नु, ने, नो, या, यि, यु',
    elementNe: 'जल (Water)',
    elementEn: 'Water',
    planetNe: 'मंगल (Mars)',
    planetEn: 'Mars',
    luckyNumber: 9,
    luckyColorNe: 'गाढा रातो / मरुन',
    luckyColorEn: 'Maroon',
    luckyDirectionNe: 'उत्तर',
    luckyDirectionEn: 'North',
    predictions: [
      'चुनौतीपूर्ण कामहरू कुशलतापूर्वक सम्पन्न हुनेछन्। अनुसन्धान वा गूढ विषयको अध्ययनमा सफलता मिल्नेछ। स्वास्थ्यमा सकारात्मक परिवर्तन आउनेछ।',
      'आफ्नो योजना गोप्य राखी काम गर्दा बढी फाइदा हुनेछ। अचानक धन लाभ हुने सम्भावना छ। आत्मबल दरिलो रहनेछ।',
      'शत्रुहरू परास्त हुनेछन्। कार्यक्षेत्रमा तपाईंको निर्णयको प्रशंसा हुनेछ। इष्टमित्रबाट सहयोग र सद्भाव मिल्नेछ।',
    ],
  },
  {
    id: 'sagittarius',
    nameNe: 'धनु',
    nameEn: 'Sagittarius',
    symbol: '♐',
    letters: 'ये, यो, भा, भि, भु, धा, फा, ढा, भे',
    elementNe: 'अग्नि (Fire)',
    elementEn: 'Fire',
    planetNe: 'बृहस्पति (Jupiter)',
    planetEn: 'Jupiter',
    luckyNumber: 3,
    luckyColorNe: 'पहेंलो',
    luckyColorEn: 'Yellow',
    luckyDirectionNe: 'उत्तर-पूर्व',
    luckyDirectionEn: 'North-East',
    predictions: [
      'भाग्यले साथ दिनेछ। धार्मिक तथा परोपकारी कार्यमा मन आकर्षित हुनेछ। उच्च शिक्षा वा वैदेशिक यात्रा सम्बन्धी काममा प्रगति हुनेछ।',
      'गुरुजन र अग्रजहरूको आशिर्वादले काममा सहजता ल्याउनेछ। नयाँ ज्ञान सिक्ने अवसर मिल्नेछ। आर्थिक स्थिति सबल रहनेछ।',
      'दूरदराजबाट शुभ समाचार सुन्न पाइनेछ। रोकिएको कामले गति लिनेछ। पारिवारिक वातावरण आनन्दमय रहनेछ।',
    ],
  },
  {
    id: 'capricorn',
    nameNe: 'मकर',
    nameEn: 'Capricorn',
    symbol: '♑',
    letters: 'भो, जा, जि, खि, खु, खे, खो, गा, गि',
    elementNe: 'पृथ्वी (Earth)',
    elementEn: 'Earth',
    planetNe: 'शनि (Saturn)',
    planetEn: 'Saturn',
    luckyNumber: 8,
    luckyColorNe: 'नीलो / कालो',
    luckyColorEn: 'Dark Blue',
    luckyDirectionNe: 'दक्षिण',
    luckyDirectionEn: 'South',
    predictions: [
      'कडा मिहिनेतको उचित मूल्यांकन हुनेछ। कार्यक्षेत्रमा स्थायित्व र पदोन्नतिको अवसर आउन सक्छ। जिम्मेवारी कुशलतापूर्वक पूरा गर्न सकिनेछ।',
      'व्यावसायिक प्रतिष्ठामा वृद्धि हुनेछ। दीर्घकालीन लगानीका लागि उपयुक्त समय छ। धैर्य र संयमताले ठूलो उपलब्धि दिलाउनेछ।',
      'मातापिताको स्वास्थ्यमा सुधार आउनेछ। पुराना अधुरा कामहरू पूरा हुनेछन्। आर्थिक अनुशासन कायम राख्नुहोला।',
    ],
  },
  {
    id: 'aquarius',
    nameNe: 'कुम्भ',
    nameEn: 'Aquarius',
    symbol: '♒',
    letters: 'गु, गे, गो, सा, सि, सु, से, सो, दा',
    elementNe: 'वायु (Air)',
    elementEn: 'Air',
    planetNe: 'शनि (Saturn)',
    planetEn: 'Saturn',
    luckyNumber: 8,
    luckyColorNe: 'आसमानी नीलो',
    luckyColorEn: 'Cyan / Sky Blue',
    luckyDirectionNe: 'पश्चिम',
    luckyDirectionEn: 'West',
    predictions: [
      'नयाँ विचार र आविष्कारशील योजनाहरू सफल हुनेछन्। साथीभाइ र सामाजिक संजालबाट सहयोग प्राप्त हुनेछ। आर्थिक लाभका ढोकाहरू खुल्नेछन्।',
      'सामूहिक कार्यमा राम्रो नेतृत्व गर्न सकिनेछ। अप्रत्याशित स्रोतबाट धन आगमन हुन सक्छ। मन प्रफुल्लित रहनेछ।',
      'भविष्यका लागि फलदायी योजनाहरू बन्नेछन्। यात्रा र भ्रमण रमाइलो हुनेछ। समाजमा तपाईंको योगदानको कदर हुनेछ।',
    ],
  },
  {
    id: 'pisces',
    nameNe: 'मीन',
    nameEn: 'Pisces',
    symbol: '♓',
    letters: 'दि, दु, थ, झ, ञ, दे, दो, चा, चि',
    elementNe: 'जल (Water)',
    elementEn: 'Water',
    planetNe: 'बृहस्पति (Jupiter)',
    planetEn: 'Jupiter',
    luckyNumber: 3,
    luckyColorNe: 'पहेंलो / सुनौलो',
    luckyColorEn: 'Golden Yellow',
    luckyDirectionNe: 'उत्तर-पूर्व',
    luckyDirectionEn: 'North-East',
    predictions: [
      'अध्यात्म र ध्यानमा मन लाग्नेछ। परोपकार र सेवामूलक कार्यबाट आत्मसन्तुष्टि मिल्नेछ। वैदेशिक क्षेत्रको काममा शुभ फल मिल्नेछ।',
      'खर्चमा केही वृद्धि भए पनि आम्दानीको स्रोत निरन्तर रहनेछ। शुभचिन्तकहरूको सल्लाहले ठूलो संकट टर्नेछ। यात्रा सफल रहनेछ।',
      'अध्ययनमा प्रगति हुनेछ। पारिवारिक समस्याहरू सुल्झिँदै जानेछन्। मनमा शान्ति र सकारात्मक ऊर्जा संचार हुनेछ।',
    ],
  },
]

/**
 * Deterministically generates today's daily rashifal based on day of year
 */
export function getDailyRashifal(date: Date = new Date()): RashiItem[] {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  )

  return RASHI_METADATA.map((r, index) => {
    const predIndex = (dayOfYear + index) % r.predictions.length
    const pred = r.predictions[predIndex]

    return {
      id: r.id,
      nameNe: r.nameNe,
      nameEn: r.nameEn,
      symbol: r.symbol,
      letters: r.letters,
      elementNe: r.elementNe,
      elementEn: r.elementEn,
      planetNe: r.planetNe,
      planetEn: r.planetEn,
      luckyNumber: r.luckyNumber,
      luckyColorNe: r.luckyColorNe,
      luckyColorEn: r.luckyColorEn,
      luckyDirectionNe: r.luckyDirectionNe,
      luckyDirectionEn: r.luckyDirectionEn,
      predictionNe: pred,
      predictionEn: `Today brings favorable energy for ${r.nameEn}. Focus on your core goals, maintain steady communication, and stay open to positive collaborative opportunities.`,
    }
  })
}
