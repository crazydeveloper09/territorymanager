const express = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    Congregation               = require("../models/congregation"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    methodOverride      = require("method-override");

app.use(flash());
app.use(methodOverride("_method"));



router.get("/", function(req, res){
	res.redirect("/login");
});

router.get("/login", function(req, res){
	res.render("login", {
        header: "Logowanie | Territory Manager"
    });
});

async function sendVerificationEmail(subject, to, text) {
    const mailgun = require("mailgun-js");
    const DOMAIN = 'websiteswithpassion.pl';
    const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host: "api.eu.mailgun.net" });
    const data = {
        from: `Weryfikacja konta Territory Manager <admin@websiteswithpassion.pl>`,
        to: to,
        subject: subject,
        html: `<html>
                <head>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                    <link rel="stylesheet" type="text/css" href="./style.css">
                </head>
                <body>
                    ${text}
                </body>
            </html>`
    };
    mg.messages().send(data, function (error, body) {
        if (error) {
            console.log(error)
        }
    });
}



router.post("/login",function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            req.flash("error", "Zła nazwa użytkownika lub hasło");
            return res.redirect(`/login`);
        }
        if(user.verificated){
            req.logIn(user, function (err) {
                console.log(info)
                if (err) { return next(err); }
                let verificationCode = '';
                for (let i = 0; i <= 5; i++) {
                    let number = Math.floor(Math.random() * 10);
                    let numberString = number.toString();
                    verificationCode += numberString;
                }
                user.verificationNumber = verificationCode;
                user.verificationExpires = Date.now() + 360000;
                user.save()
                const subject = 'Potwierdź swoją tożsamość';
                const emailText = `<p class="description">
                Witaj <em>${user.username}</em>,
                <br>
                Zanim będziesz mógł zarządzać terenami
                chcę mieć pewność, że loguje się sługa terenu lub nadzorca służby. Proszę wpisz na stronie poniższy kod weryfikacyjny.
                <br>
                <br>
                <strong>${user.verificationNumber}</strong>
                <br>
                <br>
                Wasz brat,
                <br>
                Maciek
                <br>
                <em>Wiadomość wysłana automatycznie, nie odpowiadaj na nią</em>
            </p>`;
                sendVerificationEmail(subject, user.territoryServantEmail, emailText)
                sendVerificationEmail(subject, user.ministryOverseerEmail, emailText)
                return res.redirect(`/congregations/${user._id}/two-factor`);
            });
        } else {
            res.redirect(`/congregations/${user._id}/verification`)
        }
      
    })(req, res, next);
    
});
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
});



module.exports = router;