const jwt = require("jsonwebtoken");

// auth guard to protect routes that need authentication
const checkLogin = (req, res, next) => {
  let cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (cookies) {
    try {
      token = cookies[process.env.COOKIE_NAME];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // pass user info to response locals
      if (res.locals.html) {
        res.locals.loggedInUser = decoded;
      }
      next();
    } catch (err) {
      if (res.locals.html) {
        res.redirect("/");
      } else {
        res.status(500).json({
          errors: {
            common: {
              msg: "Authentication failure!",
            },
          },
        });
      }
    }
  } else {
    if (res.locals.html) {
      res.redirect("/");
    } else {
      res.status(401).json({
        error: "Authetication failure!",
      });
    }
  }
};

// redirect already logged in user to inbox pabe
const redirectLoggedIn = function (req, res, next) {
  let cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (!cookies) {
    next();
  } else {
    res.redirect("/inbox");
  }
};

function requireRole(role) {
  return function (req, res, next) {
    if (req.user.role && role.includes(req.user.role)) {
      next();
    } else {
      // Set flash message before redirect
      res.locals.error = {
        common: {
          msg: "You are not authorized to access this page!",
        },
      };
      
      // Pass the error through query parameter
      res.redirect('/inbox?error=unauthorized');
    }
  };
}

module.exports = {
  checkLogin,
  redirectLoggedIn,
  requireRole,
};
