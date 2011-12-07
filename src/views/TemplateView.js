var TemplateView = {
    url: '/templates/*',
    func: function (req, res) {
        if (req.session.loggedIn) {
            var template = req.url.substr(1);
            
            if (template == 'templates/welcome') {
                template = 'templates/welcome/highlights';
            }
            
            res.render(template, {
                layout: false
            });
        } else {
            if (installed) {
                if (req.url != '/templates/contact') {
                    req.url = '/templates/welcome';
                }
            }
            
            res.render(req.url.substr(1), {
                layout: false
            });
        }
    }
};

module.exports = TemplateView;