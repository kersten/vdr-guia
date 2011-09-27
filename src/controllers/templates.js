module.exports = {
    menu: function (req, res) {
        res.render('templates/menu', {
            layout: false
        });
    },
    program: function (req, res) {
        res.render('program', {
            layout: false
        });
    }
};