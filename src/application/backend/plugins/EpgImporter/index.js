var EpgImporter = {
    cronjobs: [{
        '* * * * * *': function () {
            console.log('Run every second');
        }
    }]
};

module.exports = EpgImporter;