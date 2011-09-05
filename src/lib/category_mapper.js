var categories = {
    'movie': {
        equals: [
            'Abenteuerfilm', 'Heimatfilm', 'Literaturverfilmung', 'Western',
            'Italo-Western', 'Science-Fiction', 'Fantasyfilm', 'Katastrophenfilm',
            'Romanze', 'Kurzfilm', 'Kurzspielfilm', 'Kriegsabenteuer',
            'Historienfilm', 'Antikriegsfilm', 'Piratenfilm', 'Kriegsfilm',
            'Vampirfilm', 'Psychokrimi', 'Fantasyabenteuer', 'Comicverfilmung',
            'Road Movie', 'Liebesfilm', 'Krimi', 'Monumentalfilm',
            'Kurzfilm-Kompilation'
        ],
        regex: [],
        color: {
            'background-color': '#8B0600',
            'background-image': '-moz-linear-gradient(center top , #D70900, #8B0600)',
            'font-color': '#FFFFFF'
        }
    },
    'movie_comedy': {
        equals: [
            'Komödie', 'Actionkomödie', 'Slapstickkomödie', 'Comedy',
            'Beziehungskomödie', 'Romantikkomödie', 'Abenteuerkomödie',
            'Gaunerkomödie', 'Westernkomödie', 'Sportlerkomödie', 'Musikkomödie',
            'Fantasyactionkomödie', 'Fantasykomödie', 'Krimikomödie',
            'Familienkomödie', 'Liebeskomödie', 'Vampirkomödie', 'Militärkomödie',
            'Westernparodie', 'Verwechslungskomödie', 'Agentenfilmparodie',
            'Tragikomödie', 'Gangsterkomödie', 'Schwarze Komödie',
            'Gesellschaftskomödie', 'Heimatkomödie', 'Satire'
        ],
        regex: [],
        color: {
            'background-color': '#3D0D26',
            'background-image': '-moz-linear-gradient(center top , #660A3E, #3D0D26)',
            'font-color': '#FFFFFF'
        }
    },
    'movie_horror': {
        equals: [
            'Horrorfilm', 'Horror-Actionfilm', 'Horrorthriller',
            'Science-Fiction-Horrorfilm', 'Gruselfilm', 'Gruselthriller',
            'Science-Fiction-Horror', 'Horrorkomödie', 'Gruselkrimi'
        ],
        regex: [],
        color: {
            'background-color': '#8B0015',
            'background-image': '-moz-linear-gradient(center top , #D70020, #8B0015)',
            'font-color': '#FFFFFF'
        }
    },
    'movie_drama': {
        equals: [
            'Boxerdrama', 'Katastrophendrama', 'Drama', 'Politdrama',
            'Sportlerdrama', 'Familiendrama', 'Melodram', 'Gesellschaftsdrama',
            'Fantasydrama', 'Liebesdrama', 'Historiendrama', 'Kriegsdrama',
            'Krimidrama', 'Gangsterdrama', 'Gerichtsdrama'
        ],
        regex: [],
        color: {
            'background-color': '#8B1F00',
            'background-image': '-moz-linear-gradient(center top , #D73000, #8B1F00)',
            'font-color': '#FFFFFF'
        }
    },
    'movie_thriller': {
        equals: [
            'Actionthriller', 'Thriller', 'Psychothriller', 'Justizthriller',
            'Science-Fiction-Thriller', 'Katastrophenthriller', 'Mysterythriller',
            'Historienthriller'
        ],
        regex: [],
        color: {
            'background-color': '#837B8B',
            'background-image': '-moz-linear-gradient(center top , #CBBED7, #837B8B)',
            'font-color': '#FFFFFF'
        }
    },
    'movie_action': {
        equals: [
            'Actionfilm', 'Actiondrama', 'Science-Fiction-Actionfilm',
            'Science-Fiction-Action', 'Actionabenteuer', 'Fantasyaction',
            'Actionkrimi'
        ],
        regex: [],
        color: {
            'background-color': '#56038B',
            'background-image': '-moz-linear-gradient(center top , #8505D7, #56038B)',
            'font-color': '#FFFFFF'
        }
    },
    'movie_xxx': {
        equals: [
            'Erotikfilm', 'Erotikthriller'
        ],
        regex: [],
        color: {
            'background-color': '#e989f6',
            'background-image': '-moz-linear-gradient(center top , #f689cd, #e989f6)',
            'font-color': '#FFFFFF'
        }
    },
    'series': {
        equals: [
            'Telenovela', 'Krimiserie', 'Dramedyserie',
            'Actionserie', 'Comedyserie', 'Sitcom', 'Arztserie', 'Polizeiserie',
            'Familienserie', 'Krimireihe', 'Mysteryserie', 'Abenteuerserie',
            'Dramaserie', 'Animeserie', 'Science-Fiction-Serie', 'Slapstick-Serie',
            'Anwaltsserie', 'Heimatserie', 'Tierarztserie', 'Westernserie',
            'Tierserie', 'Arztreihe', 'Fantasyserie', 'Animationsserie',
            'Krankenhausserie', 'Detektivserie', 'Unterhaltungsreihe',
            'Abenteuerreihe', 'Episodenfilm'
        ],
        regex: [],
        color: {
            'background-color': '#D73E00',
            'background-image': '-moz-linear-gradient(center top , #D75520, #D73E00)',
            'font-color': '#FFFFFF'
        }
    },
    'news': {
        equals: [
            'Magazin', 'Nachrichten', 'Frühmagazin', 'Kinomagazin', 'Kulturmagazin',
            'Analyse', 'Mittagsmagazin', 'Boulevardmagazin', 'Wetter',
            'Nachrichtenmagazin', 'Politmagazin',
            'Wirtschaftsmagazin', 'Auslandsmagazin', 'Wochenmagazin', 'Lotterie',
            'Preisverleihung', 'Wahlwerbung', 'Informationen',
            'Aktuelle Berichte'
        ],
        regex: [
            'Vorbericht[0-9]{0,4}', 'Politmagazin[0-9]{0,4}'
        ],
        color: {
            'background-color': '#9ACDD7',
            'background-image': '-moz-linear-gradient(center top , #BAD2D7, #9ACDD7)',
            'font-color': '#000000'
        }
    },
    'docusoap': {
        equals: [
            'Doku-Soap', 'Daily Soap'
        ],
        regex: [],
        color: {
            'background-color': '#008B82',
            'background-image': '-moz-linear-gradient(center top , #00D7C9, #008B82)',
            'font-color': '#000000'
        }
    },
    'documentary': {
        equals: [
            'Reportage', 'Dokudrama', 'Dokumentation', 'Wissenschaftsmagazin',
            'Naturdokumentation', 'Tierdokumentation', 'Auslandsreportage',
            'Tiermagazin', 'Doku-Serie', 'Reisereportage',
            'Umweltmagazin', 'Gesundheitsmagazin', 'Freizeitmagazin',
            'Literaturmagazin', 'Rückblick', 'Dokumentarfilm',
            'Reisedokumentation', 'Biografie', 'Medienmagazin',
            'Reisemagazin', 'Wissensmagazin',
            'Büchermagazin', 'Lifestylemagazin',
            'Kriminalmagazin', 'Frauenmagazin', 'Verkehrsmagazin',
            'Antiquitätenratgeber', 'Porträt', 'Impressionen', 'Ratgeber'
        ],
        regex: [
            'Reportage[0-9]{0,4}', 'Dokumentation[0-9]{0,4}',
            'Auslandsreportage[0-9]{0,4}', 'Reisemagazin[0-9]{0,4}'
        ],
        color: {
            'background-color': '#0F3D0D',
            'background-image': '-moz-linear-gradient(center top , #158910, #0F3D0D)',
            'font-color': '#FFFFFF'
        }
    },
    'realtyshow': {
        equals: [
            'Gerichtsshow', 'Real-Life-Krimiserie'
        ],
        regex: [],
        color: {
            'background-color': '#8B8A00',
            'background-image': '-moz-linear-gradient(center top , #D7D500, #8B8A00)',
            'font-color': '#000000'
        }
    },
    'talkshow': {
        equals: [
            'Talkshow', 'Gespräch', 'Diskussion'
        ],
        regex: [],
        color: {
            'background-color': '#B4B4D7',
            'background-image': '-moz-linear-gradient(center top , #D4D4D7, #B4B4D7)',
            'font-color': '#FFFFFF'
        }
    },
    'show': {
        equals: [
            'Quizshow', 'Quiz', 'Spielshow', 'Show', 'Kochshow', 'Clipshow',
            'Verkaufsshow', 'Clips', 'Comedyshow', 'Kabarett', 'Sketch',
            'Satiremagazin', 'Ranking-Show', 'Denkspiel', 'Politsatire'
        ],
        regex: [],
        color: {
            'background-color': '#3B008B',
            'background-image': '-moz-linear-gradient(center top , #5B00D7, #3B008B)',
            'font-color': '#FFFFFF'
        }
    },
    'sport': {
        equals: [
            'Fußball', 'Motorsportmagazin',
            'Sportmagazin', 'Automagazin',
            'Formel 1', 'Poker', 'Rugby', 'Volleyball', 'Handball',
            'American Gladiator', 'Golf', 'Segeln', 'Basketball',
            'Darts', 'Wrestling', 'Kampfsport', 'Fun- u. Extremsport', 'Radsport',
            'Motorsport', 'Motorrad', 'Tennis', 'Billiard', 'Triathlon',
            'Sportsendung', 'Rudern', 'Fußballmagazin', 'Leichtathletik',
            'Reitsport', 'Sportnachrichten'
        ],
        regex: [
            'Formel.1[0-9]{0,4}', 'Motorsport[0-9]{0,4}', 'Reitsport[0-9]{0,4}',
            'Boxen[0-9]{0,4}', 'Fußball[0-9]{0,4}'
        ],
        color: {
            'background-color': '#001B8B',
            'background-image': '-moz-linear-gradient(center top , #002AD7, #001B8B)',
            'font-color': '#FFFFFF'
        }
    },
    'music': {
        equals: [
            'Castingshow', 'Musikalische Reise', 'Musikshow', 'Volksfest',
            'Konzert', 'Musikmagazin', 'Konzert2008', 'Musical',
            'Operettenverfilmung', 'Musikfilm'
        ],
        regex: [
            'Konzert[0-9]{0,4}'
        ],
        color: {
            'background-color': '#8B0044',
            'background-image': '-moz-linear-gradient(center top , #D70069, #8B0044)',
            'font-color': '#FFFFFF'
        }
    },
    'teens': {
        equals: [
            'Zeichentrickserie', 'Jugendmagazin', 'Kindermagazin', 'Jugendfilm',
            'Kindernachrichten', 'Kinderserie', 'Kinderfilm', 'Teenagerfilm',
            'Jugendserie', 'Trickfilmkomödie', 'Teenagerkomödie', 'Kinderabenteuer',
            'Puppenspielserie', 'Zeichentrickfilm', 'Trickfilm', 'Märchenfilm',
            'Kinderabenteuer', 'Animationsfilm', 'Zeichentrickkomödie'
        ],
        regex: [],
        color: {
            'background-color': '#D7793D',
            'background-image': '-moz-linear-gradient(center top , #D78C5D, #D7793D)',
            'font-color': '#FFFFFF'
        }
    }
};

module.exports = categories;