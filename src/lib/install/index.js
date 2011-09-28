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
            +"parental_rating INTEGER,"
            +"year INTEGER"
        +")", function () {
            db.run('CREATE UNIQUE INDEX idx_eventId on event(eventId ASC)');
        });
    });
    
    db.serialize(function() {
        db.run("CREATE TABLE event2channel (eventId INTEGER, channelId INTEGER)", function () {
            db.run('CREATE UNIQUE INDEX idx_event2channel on event2channel(eventId ASC, channelId ASC)');
        });
    });

    db.serialize(function() {
        db.run("CREATE TABLE actor (id INTEGER PRIMARY KEY, name TEXT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE actor2event (actorId INTEGER, eventId INTEGER)", function () {
            db.run('CREATE UNIQUE INDEX idx_actor2event on actor2event(actorId ASC, eventId ASC)');
        });
    });

    db.serialize(function() {
        db.run("CREATE TABLE character (id INTEGER PRIMARY KEY, name TEXT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE character2actor (characterId INTEGER, actorId INTEGER)", function () {
            db.run('CREATE UNIQUE INDEX idx_character2actor on character2actor(characterId ASC, actorId ASC)');
        });
    });
    
    db.serialize(function() {
        db.run("CREATE TABLE regisseur (id INTEGER PRIMARY KEY, name TEXT)");
    });
    
    db.serialize(function() {
        db.run("CREATE TABLE regisseur2event (regisseurId INTEGER, eventId INTEGER)", function () {
            db.run('CREATE UNIQUE INDEX idx_regisseur2event on regisseur2event(regisseurId ASC, eventId ASC)');
        });
    });

    db.serialize(function() {
        db.run("CREATE TABLE country (id INTEGER PRIMARY KEY, name TEXT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE country2event (countryId INTEGER, eventId INTEGER)", function () {
            db.run('CREATE UNIQUE INDEX idx_country2event on country2event(countryId ASC, eventId ASC)');
        });
    });

    db.serialize(function() {
        db.run("CREATE TABLE genre (id INTEGER PRIMARY KEY, name TEXT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE genre2event (genreId INTEGER, eventId INTEGER)", function () {
            db.run('CREATE UNIQUE INDEX idx_genre2event on genre2event(genreId ASC, eventId ASC)');
        });
    });

    db.serialize(function() {
        db.run("CREATE TABLE category (id INTEGER PRIMARY KEY, name TEXT)");
    });

    db.serialize(function() {
        db.run("CREATE TABLE category2event (categoryId INTEGER, eventId INTEGER)", function () {
            db.run('CREATE UNIQUE INDEX idx_category2event on category2event(categoryId ASC, eventId ASC)');
        });
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

module.exports = setup;