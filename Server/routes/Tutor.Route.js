const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const nodemailer = require("nodemailer");

//model import
const { TutorModel } = require("../models/tutor.model");

//middleware import
const { isTutorAuthenticated } = require("../middlewares/authenticate");

//get all tutor data
router.get("/all", async (req, res) => {
    const { filter } = req.query;

    try {
        let tutors;
        if (filter) {
            tutors = await TutorModel.find({ subject: filter });
        } else {
            tutors = await TutorModel.find();
        }
        res.send({ message: "All tutor data", tutors });
    } catch (error) {
        res.status(400).send({ message: "Something went wrong" });
    }
});

//register new tutor
router.post("/register", isTutorAuthenticated, async (req, res) => {
    const { name, email, password, subject } = req.body.data;
    try {
        let user = await TutorModel.find({ email });
        if (user.length > 0) {
            return res.send({ msg: "User already registered" });
        }
        bcrypt.hash(
            password,
            +process.env.Salt_rounds,
            async (err, secure_password) => {
                if (err) {
                    console.log(err);
                } else {
                    const tutor = new TutorModel({
                        name,
                        email,
                        subject,
                        password: secure_password,
                    });
                    await tutor.save();
                    let newTutor = await TutorModel.find({ email });

                    // connect with SMTP server
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 587,
                        secure: false,
                        auth: {
                            user: process.env.ADMIN_GMAIL, // generated ethereal user
                            pass: process.env.ADMIN_PASSWORD, // generated ethereal password
                        },
                    });

                    const mailOptions = {
                        from: `👻 ${process.env.ADMIN_GMAIL}`, // sender address
                        to: email, // list of receivers
                        subject: "Account ID and Password",
                        html: `<p>Welcome to LMS, Congratulations,Your account has been created successfully.This is your User type : Tutor and Password :</p> <h1>${password}</h1>`
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return res.send({ msg: "error" });
                        }
                        res.send({ msg: "Password sent" });
                    });

                    res.send({
                        msg: "Tutor Registered Successfully",
                        tutor: newTutor[0],
                    });
                }
            }
        );
    } catch (err) {
        res.status(404).send({ msg: "Tutor Registration failed" });
    }
});

//tutor login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const tutor = await TutorModel.find({ email });
        if (tutor.length > 0) {
            if (tutor[0].access == "false") {
                return res.send({ message: "Access Denied" });
            }
            bcrypt.compare(password, tutor[0].password, (err, results) => {
                if (results) {
                    let token = jwt.sign(
                        { email, name: tutor[0].name },
                        process.env.secret_key,
                        { expiresIn: "7d" }
                    );
                    res.send({
                        message: "Login Successful",
                        user: tutor[0],
                        token,
                    });
                } else {
                    res.status(201).send({ message: "Wrong credentials" });
                }
            });
        } else {
            res.send({ message: "Wrong credentials" });
        }
    } catch (error) {
        res.status(404).send({ message: "Error" });
    }
});

//edit tutor
router.patch("/:tutorId", isTutorAuthenticated, async (req, res) => {
    const { tutorId } = req.params;
    const payload = req.body.data;
    try {
        const tutor = await TutorModel.findByIdAndUpdate({ _id: tutorId }, payload);
        const updatedTutor = await TutorModel.find({ _id: tutorId });
        res.status(200).send({ msg: "Updated Tutor", tutor: updatedTutor[0] });
    } catch (error) {
        res.status(404).send({ msg: "Error" });
    }
});

//delete tutor
router.delete("/:tutorId", async (req, res) => {
    const { tutorId } = req.params;
    try {
        const tutor = await TutorModel.findByIdAndDelete({ _id: tutorId });
        res.status(200).send({ msg: "Deleted Tutor" });
    } catch (error) {
        res.status(404).send({ msg: "Error" });
    }
});

module.exports = router;