const congregation = require("../models/congregation");

const express = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    Congregation               = require("../models/congregation"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    methodOverride      = require("method-override");

app.use(flash());
app.use(methodOverride("_method"));

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


router.get("/new", function(req, res){
    if(req.query.code === process.env.REGISTER_CODE){
        res.render("./congregations/new", {
            header: "Rejestracja zboru | Territory Manager",
            congregation: ''
        });
    }
	
});

router.post("/:congregation_id/resend/verification", (req, res) => {
    Congregation.findById(req.params.congregation_id, (err, user) => {
        if(err){
            console.log(err)
        } else {
            let verificationCode = '';
            for (let i = 0; i <= 5; i++) {
                let number = Math.floor(Math.random() * 10);
                let numberString = number.toString();
                verificationCode += numberString;
            }
            user.verificationNumber = verificationCode;
            user.verificationExpires = Date.now() + 360000;
            user.save()
            const subject = 'Ponowne wysłanie kodu, by potwierdzić email';
            const emailText = ` <p class="description">
            Witaj <em>${user.username}</em>,
            <br>
            Właśnie dostałem prośbę o ponowne wysłanie kodu do
            weryfikacji emaila w Territory Manager.
            Jeśli to nie byłeś ty, zignoruj wiadomość. 
            <br>
            Kod potrzebny do weryfikacji to:
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
            res.redirect(`/congregations/${user._id}/verification`);
        }
    })
})



router.post("/", function(req, res){
    if(req.body.password !== req.body.confirm){
        req.flash("error", "Hasła nie są te same");
        res.render("./congregations/new", { error:  "Hasła nie są te same", congregation: req.body, header: "Rejestracja zboru | Territory Manager"});
    } else {
        let verificationCode = '';
        for (let i = 0; i <= 5; i++) {
            let number = Math.floor(Math.random() * 10);
            let numberString = number.toString();
            verificationCode += numberString;
        }
        let newUser = new Congregation({
            username: req.body.username,
            territoryServantEmail: req.body.territoryServantEmail,
            ministryOverseerEmail: req.body.ministryOverseerEmail,
            verificationNumber: verificationCode,
            verificationExpires: Date.now() + 360000
        });
        Congregation.register(newUser, req.body.password, function(err, user) {
            if(err) {
                
                return res.render("./congregations/new", { error: err.message});
            } 
            passport.authenticate("local")(req, res, function() {
                const subject = 'Weryfikacja maila w Territory Manager';
                const emailText = `<p class="description">
                Witaj <em>${user.username}</em>,
                <br>
                Jesteś na ostatniej prostej do możliwości zarządzania terenami w Territory Manager. Wystarczy, że 
                Ty lub nadzorca służby w zborze potwierdzicie email poniższym 
                kodem weryfikacyjnym:
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
            </p>`
                sendVerificationEmail(subject, user.territoryServantEmail, emailText)
                sendVerificationEmail(subject, user.ministryOverseerEmail, emailText)
                res.redirect(`/congregations/${user._id}/verification`);
            });
        });
    }
});

router.get("/:congregation_id", isLoggedIn, function(req, res){
    
    Congregation.findById(req.params.congregation_id).populate(["preacher", "territories"]).exec(function(err, congregation){
        if(err){
            console.log(err);
        } else {
            res.render("./congregations/show", {
                header: `Zbór ${congregation.username} | Territory Manager`,
                congregation: congregation,
                currentUser: req.user,
            })
        }
    });
	
});

router.get("/:congregation_id/edit", isLoggedIn, function(req, res){
    Congregation.findById(req.params.congregation_id, function(err, congregation){
        if(err){
            console.log(err);
        } else {
            res.render("./congregations/edit", { 
                currentUser: req.user, 
                congregation: congregation, 
                header: `Edytuj głosiciela w zborze ${req.user.username} | Territory Manager`
            });
        }
    });
});

router.put("/:congregation_id", isLoggedIn, function(req, res){
    Congregation.findByIdAndUpdate(req.params.congregation_id, req.body.congregation, function(err, congregation){
        if(err){
            console.log(err);
        } else {
            res.redirect(`/congregations/${req.user._id}`);
        }
    });
});


router.get('/:congregation_id/verification', (req, res) => {
    Congregation.findOne({
        $and: [
            {_id: req.params.congregation_id},
            {verificationExpires: { $gt: Date.now()}}
        ]
    }, (err, user) => {
        if(err){
            console.log(err)
        } else {
            if(user){
                let header = "Weryfikacja konta | Territory Manager"
                res.render("./congregations/verification", {
                    header: header,
                    user: user
                })
            } else {
                req.flash("error", "Kod weryfikacyjny wygasł lub nie ma takiego konta. Kliknij przycisk Wyślij kod ponownie poniżej ")
                let header = "Weryfikacja konta | Territory Manager"
                res.render("./congregations/verification", {
                    header: header,
                    user_id: req.params.congregation_id
                })
            }
        }
    })
})

router.post("/:congregation_id/verification", (req, res) => {
    Congregation.findOne({
        $and: [
            {_id: req.params.congregation_id},
            {verificationExpires: { $gt: Date.now()}}
        ]
    }, (err, user) => {
        if(err){
            console.log(err)
        } else {
            if(user){
                console.log(user.verificationNumber, +req.body.code)
                if(user.verificationNumber === +req.body.code){
                    user.verificated = true;
                    user.save();
                    req.flash("success", `Witaj ${user.username}. Bardzo nam miło, że do nas dołączyłeś`)
                    res.redirect("/login")
                } else {
                    req.flash("error", "Kod weryfikacyjny jest niepoprawny. Spróbuj ponownie")
                    res.redirect(`back`)
                }
            } else {
                req.flash("error", "Kod weryfikacyjny wygasł lub nie ma takiego konta. Kliknij przycisk Wyślij kod ponownie poniżej ")
                res.redirect("back")
            }
        }
    })
})

router.get('/:congregation_id/two-factor', (req, res) => {
    Congregation.findOne({
        $and: [
            {_id: req.params.congregation_id},
            {verificationExpires: { $gt: Date.now()}}
        ]
    }, (err, user) => {
        if(err){
            console.log(err)
        } else {
            if(user){
                let header = "Dwustopniowa weryfikacja | Territory Manager"
                res.render("./congregations/two-factor", {
                    header: header,
                    user: user
                })
            } else {
                req.flash("error", "Kod weryfikacyjny wygasł lub nie ma takiego konta. Kliknij przycisk Wyślij kod ponownie poniżej ")
                let header = "Dwustopniowa werfyikacja | Territory Manager"
                res.render("./congregations/two-factor", {
                    header: header,
                    user_id: req.params.congregation_id
                })
            }
        }
    })
})

router.post("/:congregation_id/two-factor", (req, res) => {
    Congregation.findOne({
        $and: [
            {_id: req.params.congregation_id},
            {verificationExpires: { $gt: Date.now()}}
        ]
    }, (err, user) => {
        if(err){
            console.log(err)
        } else {
            if(user){
                if(user.verificationNumber === +req.body.code){
                   
                    req.flash("success", `Pomyślnie zalogowałeś się do Territory Manager`)
                    res.redirect(`/territories/available`)
                } else {
                    req.flash("error", "Kod weryfikacyjny jest niepoprawny. Spróbuj ponownie")
                    res.redirect(`back`)
                }
            } else {
                req.flash("error", "Kod weryfikacyjny wygasł lub nie ma takiego konta. Kliknij przycisk Wyślij kod ponownie poniżej ")
                res.redirect("back")
            }
        }
    })
})

router.post("/:congregation_id/resend/two-factor", (req, res) => {
    Congregation.findById(req.params.congregation_id, (err, user) => {
        if(err){
            console.log(err)
        } else {
            let verificationCode = '';
            for (let i = 0; i <= 5; i++) {
                let number = Math.floor(Math.random() * 10);
                let numberString = number.toString();
                verificationCode += numberString;
            }
            user.verificationNumber = verificationCode;
            user.verificationExpires = Date.now() + 360000;
            user.save()
            const subject = 'Ponowne wysłanie kodu weryfikacyjnego';
            let emailText = `<p class="description">
            Witaj <em>${user.username}</em>,
            <br>
            Właśnie dostałem prośbę o ponowne wysłanie kodu do
            dwustopniowej weryfikacji logowania do Territory Manager.
            Jeśli to nie byłeś ty, zignoruj wiadomość. 
            <br>
            Kod potrzebny do weryfikacji to:
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
            res.redirect(`/congregations/${user._id}/two-factor`);
        }
    })
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Prosimy zaloguj się najpierw");
    res.redirect("/login");
}

module.exports = router;