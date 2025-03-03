const express = require("express");
const passport = require("passport"); // This works for the authentication
const connectionEnsureLogin = require("connect-ensure-login"); // This serves as authorisation middleware
const bodyParser = require("body-parser");
const flash = require("connect-flash");

const userModel = require("./models/users");

const session = require("express-session"); // session middlware
require("dotenv").config(); // This helps to have access to the enviroment variables through the mongoose database

const db = require("./db");

const PORT = 8080;
const app = express();

// Connect to the MONGO db

db.connectToMongoDB();

const booksRoute = require("./routes/books");

// Run the configure the appl to use Session
//Sessions is a way to store data on the server between requests from user
// so that we can access it on the subsequent requests
//in the case, we are storing the authenticated user id for the durattion of the session.

app.use(
  session({
    secret: process.env.SESSION_SECRET, // This secret key helps to encode the session ( that is the user session object)
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    cookie: { maxAge: 60 * 60 * 1000 }, // this is 1hour , the 60*60*1000 is calulated in seconds
  })
);

app.use(bodyParser.urlencoded({ extended: true })); // This ensures data from the application. 

app.use(passport.initialize()); // This is to initialize passport middleware.
app.use(passport.session()); // use passport session middleware.
app.use(flash()); // This enables the flash Middleware.

passport.use(userModel.createStrategy()); // This is to use the user model to create strategy

// This below is to Serialize and deserilise the user object to and from the session

passport.serializeUser(userModel.serializeUser()); // This is like getting back the object.
passport.deserializeUser(userModel.deserializeUser());

// The set up EJS , as the View Engine

app.set("views", "views");
app.set("view engine", "ejs");

// This below secures the /books route

app.use("/books", connectionEnsureLogin.ensureLoggedIn(), booksRoute); //  connectionEnsureLogin.ensureLoggedIn(), This helps user to access the books when logged in. as middleware

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

//Rendering the EJS files below

//Then this renders the home page

app.get("/", (req, res) => {
  res.render("index");
});

// This renders the login page

app.get("/login", (req, res) => {
  res.render("login");
});

// This renders the Signup Page

app.get("/signup", (req, res) => {
  res.render("signup");
});

// This renders the Reset passwort page

app.get("/reset", (req, res) => {
  res.render("reset", { error: null, success: null });
});

// Thhis below handles the signup registration  request for new users

app.post("/signup", (req, res) => {
  const user = req.body;

  // This is to Validate email and password
  if (!user.email || !user.username || !user.password) {
    return res.status(400).send("Email, username, and password are required.");
  }

  // You could add more email validation here, like regex pattern matching for valid email
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // if (!emailRegex.test(user.email)) {
  //   return res.status(400).send("Invalid email format.");
  // }

// This below takes you to register the user
  userModel.register(
    new userModel({ username: user.username, email: user.email }),
    user.password,
    (err, user) => {
      // this saves username and pass to mongo db database.
      if (err) {
        console.log(err);
        res.status(400).send("Error while registring: " + err.message);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/books");
        });
      }
    }
  );
});

// This below handles the existing users login request

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login", // This redirects you back to login page on failure.
    failureFlash: "Invalid username or password",
  }), // This displays message for invalid login.
  (req, res) => {
    // middleware while setting strategy as local
    res.redirect("/books");
  }
);

// This below handles the logout request

app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); // This is to pass error to error handler
    }
    res.redirect("/"); // This redirects the user after
  });
});

// This below handles the reset request

app.post("/reset", async (req, res) => {
  try {
    const { username, password, new_password } = req.body;

    // Finding the user by username
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.render("reset", { error: "User not found", success: null });
    }

        // Set new password
        await user.setPassword(new_password);
        await user.save();

    // This is to Change the password!
    user.changePassword(password, new_password, (err) => {
      if (err) {
        // console.log(err);

        // This helps to handle incorrect current passpword.

        if (err.name === "IncorrectPasswordError") {
          return res.render("reset", {
            error: "Current password is incorrect",
            success: null,
          });
        }

        // Handling other errors
        return res.render("reset", {
          error: "Incorrect current password",
          success: null,
        });
      }

      // When successful render this message below
      return res.render("reset", {
        error: null,
        success: "Password successfully changed",
      });
    });
  } catch (err) {
    console.error(err);
    res.render("reset", { error: "An error occurred", success: null });
  }
});

// This below catches the error thrown when loging in as error middleware

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server started successfully on PORT: http://localhost:${PORT}`);
});
