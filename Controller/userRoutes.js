const usersRouter = require("express").Router();
const User = require("../Model/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { EMAIL_ADDRESS, EMAIL_PASSWORD } = require("../utils/config");



usersRouter.get("/users", (req, res) => {
  User.find({}, {}).then((users) => {
    res.status(200).json(users);
  });
});

// sign up new user

usersRouter.post("/users/signup", async (req, res) => {
  
  try {
    const { username, email, password } = new User(req.body);
    if (!username || !email || !password) {
      res.status(400).json({ Err: "all fields are mandotary" });
      return;
    }
    const matchedUser = await User.findOne({ email });
    if (matchedUser) {
      res.status(400).json({ Err: "user already exists" });
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({ message: `${user.username} Data saved` });
    } else {
      res.status(404).json({ Err: "user data already exist" });
    }
  } catch (error) {
    console.error(error);
  }
});



usersRouter.put("/users/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ Err: "please enter valid email" });
      return;
    }
    const matchedUser = await User.findOne({ email });
    if (!matchedUser) {
      res.status(400).json({ Err: "user not found exists" });
      return;
    }

    const randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const link = `https://incandescent-taffy-3542eb.netlify.app/users/reset/${randomString}`;

    matchedUser.resetToken = randomString;
    await User.findByIdAndUpdate(matchedUser.id, matchedUser);

    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_ADDRESS,
        pass: EMAIL_PASSWORD,
      },
    });

    const sendMail = async () => {
      const info = await transporter.sendMail({
        from: `"Renugadevi" <${EMAIL_ADDRESS}>`,
        to: matchedUser.email,
        subject: "Reset Password",
        text: link,
      });
    };

    sendMail()
      .then(() => {
        return res
          .status(201)
          .json({ message: `Mail has been send to ${matchedUser.email}` });
      })
      .catch((err) => res.status(500).json(err));
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Reseting password

usersRouter.patch("/users/reset/:id", async (req, res) => {
  try {
    const resetToken = req.params.id;
    const { password } = req.body;
    const matchedUser = await User.findOne({ resetToken });
    console.log(matchedUser.password);
    if (!matchedUser) {
      res.status(400).json({ Err: "user not found exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    matchedUser.password = hashedPassword;

    await User.findByIdAndUpdate(matchedUser.id, matchedUser);
    console.log(matchedUser.password);
    res.status(201).json({
      message: `${matchedUser.username} password has beed changed sucessfully`,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = usersRouter;