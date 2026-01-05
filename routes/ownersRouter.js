const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owner-model');

if (process.env.NODE_ENV === "development") {
    router.post("/create", async (req, res) => {
        let owners = await ownerModel.find();
        if (owners.length > 0) {
            return res.status(500).send("You don't have permission to create a new owner");
        }

        let { fullname, email, password } = req.body;

        let owner = await ownerModel({
            fullname,
            email,
            password
        });
       
        // Save the new owner to the database
        try {
            await owner.save();
            res.status(201).send("Owner created successfully");
        } catch (error) {
            res.status(500).send("Error creating owner");
        }
    });
}

router.get('/admin', (req, res) => {
    let success = req.flash('success');
    res.render('createproducts', { success });
});



module.exports = router;
