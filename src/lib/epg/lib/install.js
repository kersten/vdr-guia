var setup = function (db) {
    db.serialize(function() {
        db.run("CREATE TABLE channel ("
            +"id INTEGER PRIMARY KEY,"
            +"name TEXT,"
            +"number INTEGER,"
            +"channel_id TEXT,"
            +"image INTEGER,"
            +"channel_group TEXT,"
            +"transponder TEXT,"
            +"stream TEXT,"
            +"is_atsc INTEGER,"
            +"is_cable INTEGER,"
            +"is_terr INTEGER,"
            +"is_sat INTEGER,"
            +"is_radio INTEGER"
        +")");
    });
    
    db.serialize(function() {
        /*
         * "id":63569192,
         * "title":
         * "X:enius",
         * "short_text": "Gehörlos - Ist behindert, wer nichts hören kann?",
         * "description":"Ihre Gehörlosigkeit gilt als schwere körperliche Behinderung. Doch die Gehörlosen fassen nicht alle ihre Behinderung als solche auf. Vielmehr sehen sie sich als Mitglieder einer eigenen Kultur - der Gehörlosenkultur. Ihre Gebärdensprache gilt längst als vollwertige und eigenständige Sprache. Durch den medizinischen Fortschritt sehen Gehörlose nun ihre Kultur bedroht. Viele entscheiden sich daher bewusst gegen Cochlea-Implantate, die ihnen das Hören ermöglichen könnten. Andere wiederum sind dankbar, durch die Implantate an der Welt der Hörenden teilhaben zu können. In einer ersten Lektion in Gebärdensprache erfahren Dörthe und Pierre, wie ausdrucksstark diese Sprache ist und warum sie für die Gehörlosen so identitätsstiftend wirkt. Wie kann man außerdem als Hörender mit Gehörlosen kommunizieren? Und was spricht für und was gegen die sogenannten Cochlea-Implantate? Zum Tag der Gehörlosen macht \"X:enius\" auf Menschen aufmerksam, die wir im Alltag selten wahrnehmen.\nKategorie: Information\nGenre: Wissen\nD/F 2011. 30 Min.\nTechnische Details: Zweikanalton Stereo 16:9 \nModerator: Dörthe Eickelberg\nPierre Girard\nCarolin Matzko\nGunnar Mergner\nShow-Id: 45135592",
         * "start_time":1317019500,
         * "channel":"S19.2E-1-1011-11120",
         * "duration":1800,
         * "images":0,
         * "timer_exists":false,
         * "timer_active":false,
         * "timer_id":"",
         * "components":[],
         * "start":"08:45",
         * "stop":"09:15",
         * "day":"26.09"}
         */
        
        db.run("CREATE TABLE event ("
            +"id INTEGER PRIMARY KEY,"
            +"eventId INTEGER,"
            +"title TEXT,"
            +"short_description TEXT,"
            +"description TEXT,"
            +"start_time INTEGER,"
            +"duaration INTEGER,"
            +"images INTEGER,"
            +"rating INTEGER,"
            +"year INTEGER"
        +")");
    });
    
    db.serialize(function() {
        db.run("CREATE TABLE event2channel (eventId INTEGER, channelId INTEGER)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE actor (id INTEGER PRIMARY KEY, name TEXT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE actor2event (eventId INTEGER, actorId INT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE character (id INTEGER PRIMARY KEY, name TEXT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE character2event (eventId INTEGER, characterId INT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE country (id INTEGER PRIMARY KEY, name TEXT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE country2event (eventId INTEGER, countryId INT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE genre (id INTEGER PRIMARY KEY, name TEXT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE genre2event (eventId, genreId INT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE category (id INTEGER PRIMARY KEY, name TEXT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE category2event (eventId, categoryId INT)");
    });
    
    db.serialize(function() {
        db.run("CREATE TABLE audio ("
            +"id INTEGER PRIMARY KEY,"
            +"stream INTEGER,"
            +"type INTEGER,"
            +"language TEXT,"
            +"description"
        +")");
    });
    
    db.serialize(function() {
        db.run("CREATE TABLE audio2event (eventId, audioId INT)");
    });
};

exports.setup = setup;