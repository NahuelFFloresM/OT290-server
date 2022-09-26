const { User } = require("../models");
// Nano: Import express validator to check types of input variables
const { validationResult } = require("express-validator");
const { createUser } = require("./users");
const bcrypt = require("bcrypt");
const { signToken } = require("../helpers/auth");

const userRegister = async (req, res) => {
  try {
    //Nano: Validate errors in request to stop if there's any
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    // Nano: Continue with user registry
    const user = await createUser(req, res);

    if (user) {
      delete user.password;
      const token = signToken(user);
      return res.status(201).json(token);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const user = await User.findOne({ where: { email } });
    const pass = user.password;

    if (!user) {
      res.status(401.1).send("usuario no existe");
    } else if ((await bcrypt.compare(password, pass)) == true) {
      const token = signToken(user);
      res.status(200).send({ ...user.dataValues, password: undefined, token });
    } else {
      res.status(401.1).send("ok:false");
    }
  } catch (error) {
    res.status(401.1).send("ok:false");
  }
};

const userData = async (req, res) => {
  try {
    const tokenHeader = req.headers["Authorization"];
    const token = tokenHeader.substring("Bearer ".length);
    var decoded = jwt.verify(token, JWT_SECRET);
    let id = decoded.id;
    const user = await User.findById(id);
    if (!user) {
      return res.sendStatus(404);
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  userRegister,
  userLogin,
  userData,
};
