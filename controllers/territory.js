import express from "express";
import Preacher from "../models/preacher.js";
import Territory from "../models/territory.js";
import Checkout from "../models/checkout.js";
import flash from "connect-flash";
import methodOverride from "method-override";
import mongoose from "mongoose";
import { countDaysFromNow, escapeRegex } from "../helpers.js";

const app = express();

app.use(flash());
app.use(methodOverride("_method"));

export const renderListOfAllTerritories = (req, res, next) => {
    Territory
        .find({congregation: req.user._id})
        .sort({number: 1})
        .populate("preacher")
        .exec()
        .then((territories) => {
            Preacher
                .find({congregation: req.user._id})
                .sort({name: 1})
                .exec()
                .then((preachers) => {
                    res.render("./territories/index", {
                        currentUser: req.user, 
                        territories: territories, 
                        preachers: preachers,
                        countDaysFromNow: countDaysFromNow, 
                        header: "Wszystkie tereny | Territory Manager", 
                        all: "" 
                    });
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const renderListOfAvailableTerritories = (req, res, next) => {
    Territory
        .find({ $and: [{congregation: req.user._id}, {type: 'free'}]})
        .populate("preacher")
        .sort({lastWorked: 1})
        .exec()
        .then((territories) => {
            res.render("index", {
                currentUser: req.user, 
                territories: territories,
                countDaysFromNow: countDaysFromNow, 
                header: "Home | Territory Manager", 
                home: ""
            });
        })
        .catch((err) => console.log(err))
}

export const renderNewTerritoryForm = (req, res, next) => {
    Preacher
        .find({congregation: req.user._id})
        .sort({name: 1})
        .exec()
        .then((preachers) => {
            res.render("./territories/new", { 
                currentUser: req.user, 
                preachers: preachers, 
                header: "Dodaj teren | Territory Manager", 
                newT: "" 
            });
        })
        .catch((err) => console.log(err))
}

export const searchAllTerritories = (req, res, next) => {
    if(typeof req.query.city !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.city), 'gi');
        Territory
            .find({
                $and: [
                    {city: regex}, 
                    {congregation: req.user._id}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then((territories) => {
                Preacher
                    .find({congregation: req.user._id})
                    .sort({name: 1})
                    .exec()
                    .then((preachers) => {
                        res.render("./territories/search", {
                            param: req.query.city, 
                            territories: territories, 
                            currentUser: req.user, 
                            preachers: preachers,
                            countDaysFromNow: countDaysFromNow,
                            header: "Wyszukiwanie teren??w po miejscowo??ci | Territory Manager"
                        });
                    })
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log(err))
    } else if(typeof req.query.street !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.street), 'gi');
        Territory
            .find({
                $and: [
                    {street: regex}, 
                    {congregation: req.user._id}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then((territories) => {
                Preacher
                    .find({congregation: req.user._id})
                    .sort({name: 1})
                    .exec()
                    .then((preachers) => {
                        res.render("./territories/search", {
                            param: req.query.street, 
                            territories: territories, 
                            currentUser: req.user, 
                            preachers: preachers,
                            countDaysFromNow: countDaysFromNow,
                            header: "Wyszukiwanie teren??w po ulicy | Territory Manager"
                        });
                    })
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log(err))
            
    } else if(typeof req.query.number !== 'undefined'){
        
        Territory
            .find({
                $and: [
                    {number: req.query.number}, 
                    {congregation: req.user._id}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then((territories) => {
                Preacher
                    .find({congregation: req.user._id})
                    .sort({name: 1})
                    .exec()
                    .then((preachers) => {
                        res.render("./territories/search", {
                            param: req.query.number, 
                            territories: territories, 
                            currentUser: req.user, 
                            preachers: preachers,
                            countDaysFromNow: countDaysFromNow,
                            header: "Wyszukiwanie teren??w po nr terenu | Territory Manager"
                        });
                    })
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log(err))
    } else if(typeof req.query.preacher !== 'undefined'){
        Preacher
            .findOne({ 
                $and: [
                    { congregation: req.user._id }, 
                    {_id: req.query.preacher}
                ] 
            })
            .exec()
            .then((preacher) => {
                Territory
                    .find({
                        $and: [
                            {preacher: preacher._id}, 
                            {congregation: req.user._id}
                        ]
                    })
                    .sort({number: 1})
                    .populate("preacher")
                    .exec()
                    .then((territories) => {
                        Preacher
                            .find({congregation: req.user._id})
                            .sort({name: 1})
                            .exec()
                            .then((preachers) => {
                                res.render("./territories/search", {
                                    param: preacher.name, 
                                    territories: territories,
                                    currentUser: req.user, 
                                    preachers: preachers,
                                    countDaysFromNow: countDaysFromNow,
                                    header: "Wyszukiwanie teren??w po g??osicielu | Territory Manager"
                                });
                            })
                            .catch((err) => console.log(err))
                    })
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log.err)
    } else if(typeof req.query.kind !== 'undefined'){
        
        Territory
            .find({
                $and: [
                    {kind: req.query.kind}, 
                    {congregation: req.user._id}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then((territories) => {
                Preacher
                    .find({congregation: req.user._id})
                    .sort({name: 1})
                    .exec()
                    .then((preachers) => {
                        res.render("./territories/search", {
                            param: req.query.kind, 
                            territories: territories,
                            currentUser: req.user, 
                            preachers: preachers,
                            countDaysFromNow: countDaysFromNow,
                            header: "Wyszukiwanie teren??w po rodzaju terenu | Territory Manager"
                        })
                    })
                    .catch((err) => console.log(err))
            })
            .catch((err) => console.log(err))
    } else {
        Territory
        .find({
            $and: [
                {type: { $not: /free/ }}, 
                {congregation: req.user._id}
            ]
        })
        .sort({number: 1})
        .populate("preacher")
        .exec()
        .then((territories) => {
            Preacher
                .find({congregation: req.user._id})
                .sort({name: 1})
                .exec()
                .then((preachers) => {
                    res.render("./territories/search", {
                        param: 'Zaj??te tereny', 
                        territories: territories, 
                        currentUser: req.user, 
                        preachers: preachers,
                        countDaysFromNow: countDaysFromNow,
                        header: "Wyszukiwanie teren??w | Territory Manager"
                    });
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
    }
}

export const createTerritory = (req, res, next) => {
    let newTerritory = new Territory({
        city: req.body.city, 
        street: req.body.street, 
        lastWorked: req.body.lastP,
        beginNumber: req.body.beginNumber,
        endNumber: req.body.endNumber,
        taken: req.body.taken,
        description: req.body.description,
        number: req.body.number,
        kind: req.body.kind,
        congregation: req.user._id,
    });
    Territory
        .create(newTerritory)
        .then((createdTerritory) => {
            if(req.body.preacher === ""){
                createdTerritory.type="free";
            } else {
                createdTerritory.preacher = req.body.preacher;
            }
            createdTerritory.isPhysicalCard = req.body.isPhysicalCard === 'true';
            createdTerritory.save();
            res.redirect("/territories/available");
        })
        .catch((err) => console.log(err))
}

export const renderTerritoryHistory = (req, res, next) => {
    Territory
        .findById(req.params.territory_id)
        .populate(["preacher", "history"])
        .exec()
        .then((territory) => {
            Territory
                .find({congregation: req.user._id})
                .exec()
                .then((territories) => {
                    const currentIndex = territories.findIndex(t => t._id.toString() === territory._id.toString());
                    res.render("./territories/show", {
                        header: `Teren nr ${territory.number} | Territory Manager`,
                        territory: territory,
                        countDaysFromNow: countDaysFromNow,
                        currentUser: req.user,
                        currentIndex: currentIndex,
                        territories: territories
                    })
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const renderTerritoryEditForm = (req, res, next) => {
    Territory
        .findById(req.params.territory_id)
        .sort({number: 1})
        .populate("preacher")
        .exec()
        .then((territory) => {
            Preacher
                .find({congregation: req.user._id})
                .exec()
                .then((preachers) => {
                    res.render("./territories/edit", { 
                        currentUser: req.user, 
                        territory: territory, 
                        preachers: preachers, 
                        header: `Edytuj teren nr ${territory.number} zboru ${req.user.username} | Territory Manager`
                    });
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const editTerritory = (req, res, next) => {
  
    Territory
        .findById(req.params.territory_id)
        .populate("preacher")
        .exec()
        .then((territory) => {
            Checkout
                .create({ record: territory})
                .then((createdCheckout) => {
                    territory.history.push(createdCheckout);
                    territory.city = req.body.territory.city;
                    territory.street = req.body.territory.street;
                    territory.number = req.body.territory.number;
                    territory.description = req.body.territory.description;
                    territory.taken = req.body.territory.taken;
                    territory.beginNumber = req.body.territory.beginNumber;
                    territory.endNumber = req.body.territory.endNumber;
                    territory.lastWorked = req.body.territory.lastWorked;
                    territory.kind = req.body.territory.kind;
                    
                    territory.isPhysicalCard = req.body.territory.isPhysicalCard === 'true';
                    if(req.body.territory.preacher === ""){
                        territory.preacher = undefined;
                        territory.type = "free";
                    } else {
                        territory.preacher = req.body.territory.preacher;
                        territory.type = undefined;
                    }
                    territory.save();
                    res.redirect(`/territories/${territory._id}`);
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

export const deleteTerritory = (req, res, next) => {
    Territory
        .findByIdAndDelete(req.params.territory_id)
        .exec()
        .then((territory) =>  res.redirect("/territories"))
        .catch((err) => console.log(err))
}

export const confirmDeletingTerritory = (req, res, next) => {
    Territory
        .findById(req.params.territory_id)
        .exec()
        .then((territory) =>{
            res.render("./territories/deleteConfirm", {
                territory: territory,
                currentUser: req.user,
                header: `Potwierdzenie usuni??cia terenu | Territory Manager`
            });
        })
        .catch((err) => console.log(err))
}

export const searchAvailableTerritories = (req, res, next) => {
    if(typeof req.query.city !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.city), 'gi');
        Territory
            .find({
                $and: [
                    {city: regex}, 
                    {congregation: req.user._id}, 
                    {type: 'free'}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then((territories) => {
                res.render("./territories/availableSearch", {
                    param: req.query.city, 
                    territories: territories, 
                    currentUser: req.user,
                    countDaysFromNow: countDaysFromNow, 
                    header: "Wyszukiwanie wolnych teren??w po miejscowo??ci | Territory Manager"
                });
            })
            .catch((err) => console.log(err))
    } else if(typeof req.query.street !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.street), 'gi');
        Territory
            .find({
                $and: [
                    {street: regex}, 
                    {congregation: req.user._id}, 
                    {type: 'free'}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then((territories) => {
                res.render("./territories/availableSearch", {
                    param: req.query.street, 
                    territories: territories, 
                    currentUser: req.user, 
                    countDaysFromNow: countDaysFromNow,
                    header: "Wyszukiwanie wolnych teren??w po ulicy | Territory Manager"
                });
            })
            .catch((err) => console.log(err))
    } else if(typeof req.query.number !== 'undefined'){
        
        Territory
            .find({
                $and: [
                    {number: req.query.number}, 
                    {congregation: req.user._id}, 
                    {type: 'free'}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then((territories) => {
                res.render("./territories/availableSearch", {
                    param: req.query.number, 
                    territories: territories, 
                    currentUser: req.user, 
                    countDaysFromNow: countDaysFromNow,
                    header: "Wyszukiwanie wolnych teren??w po nr terenu | Territory Manager"
                });
            })
            .catch((err) => console.log(err))
    } else if(req.query.kind !== 'undefined'){
        Territory
            .find({
                $and: [
                    {kind: req.query.kind}, 
                    {congregation: req.user._id}, 
                    {type: 'free'}
                ]
            })
            .sort({number: 1})
            .populate("preacher")
            .exec()
            .then((territories) => {
                res.render("./territories/availableSearch", {
                    param: req.query.kind, 
                    territories: territories, 
                    currentUser: req.user, 
                    countDaysFromNow: countDaysFromNow,
                    header: "Wyszukiwanie wolnych teren??w po nr terenu | Territory Manager"
                });
            })
            .catch((err) => console.log(err))
    }
}