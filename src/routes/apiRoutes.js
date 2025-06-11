const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const SalaController = require("../controllers/SalaController");
const reservaController = require("../controllers/reservaController");
const verifyJWT = require("../services/verifyJWT");

// Rotas da UserController
router.post("/user", UserController.createUser); // http://localhost:5000/api/v1/user
router.post("/userLogin", UserController.loginUser); // http://localhost:5000/api/v1/userLogin
router.put("/user/:id", verifyJWT, UserController.updateUser); // http://localhost:5000/api/v1/user/:id
router.delete("/user/:id", verifyJWT, UserController.deleteUser); // http://localhost:5000/api/v1/user/:id
router.get("/user", verifyJWT, UserController.getAllUsers); // http://localhost:5000/api/v1/user

// Rotas da SalaController
router.get("/sala", verifyJWT, SalaController.getAllSalas); // http://localhost:5000/api/v1/sala
router.get("/blocoA", verifyJWT, SalaController.getAllSalasA); // http://localhost:5000/api/v1/blocoA
router.get("/blocoB", verifyJWT, SalaController.getAllSalasB); // http://localhost:5000/api/v1/blocoB
router.get("/blocoC", verifyJWT, SalaController.getAllSalasC); // http://localhost:5000/api/v1/blocoC
router.get("/blocoD", verifyJWT, SalaController.getAllSalasD); // http://localhost:5000/api/v1/blocoD
router.post("/sala", verifyJWT, SalaController.createSalas); // http://localhost:5000/api/v1/sala
router.put("/sala/:id_sala", verifyJWT, SalaController.updateSala); // http://localhost:5000/api/v1/sala/:id
router.delete("/sala/:id_sala", verifyJWT, SalaController.deleteSala); // http://localhost:5000/api/v1/sala/:id

// Rotas do reservaController
router.post("/reserva", verifyJWT, reservaController.createReserva); // http://localhost:5000/api/v1/reserva
router.put("/reserva/:id", verifyJWT, reservaController.updateReserva); // http://localhost:5000/api/v1/reserva/:id
router.delete("/reserva/:id", verifyJWT, reservaController.deleteReserva); // http://localhost:5000/api/v1/reserva/:id
router.get("/reserva", verifyJWT, reservaController.getAllReserva); // http://localhost:5000/api/v1/reserva
router.get("/reserva/:id", verifyJWT, reservaController.getReservaByUsuario); // http://localhost:5000/api/v1/reserva/:id
router.post("/reservaIdData", verifyJWT, reservaController.getReservaIdData); // http://localhost:5000/api/v1/reservaIdData

module.exports = router;
