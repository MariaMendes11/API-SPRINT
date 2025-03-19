const express = require('express');
const router = express.Router();
const UserController = require("../controllers/UserController");
const SalaController = require("../controllers/SalaController");
const reservaController = require("../controllers/reservaController"); 

// Rotas da UserController
router.post('/user', UserController.createUser); // http://localhost:5000/api/v1/user
router.post('/userLogin', UserController.loginUser); // http://localhost:5000/api/v1/userLogin
router.put('/user', UserController.updateUser); // http://localhost:5000/api/v1/user
router.delete('/user/:id', UserController.deleteUser); // http://localhost:5000/api/v1/user/:id
router.get('/user', UserController.getAllUsers); // http://localhost:5000/api/v1/user

// Rotas da SalaController
router.get("/sala", SalaController.getAllSalas); // http://localhost:5000/api/v1/sala
router.get("/blocoA", SalaController.getAllSalasA);// http://localhost:5000/api/v1/blocoA
router.get("/blocoB", SalaController.getAllSalasB);// http://localhost:5000/api/v1/blocoB
router.get("/blocoC", SalaController.getAllSalasC);// http://localhost:5000/api/v1/blocoC
router.get("/blocoD", SalaController.getAllSalasD);// http://localhost:5000/api/v1/blocoD
router.post("/sala", SalaController.createSalas); // http://localhost:5000/api/v1/sala
router.put("/sala/:id_sala", SalaController.updateSala); // http://localhost:5000/api/v1/sala/:id
router.delete("/sala/:id_sala", SalaController.deleteSala); // http://localhost:5000/api/v1/sala/:id

// Rotas do reservaController
router.post('/reserva', reservaController.createReserva); // http://localhost:5000/api/v1/reserva
router.put("/reserva/:id", reservaController.updateReserva); // http://localhost:5000/api/v1/reserva/:id
router.delete('/reserva/:id', reservaController.deleteReserva); // http://localhost:5000/api/v1/reserva/:id
router.get('/reserva', reservaController.getAllReserva); // http://localhost:5000/api/v1/reserva
router.get('/reserva/:id', reservaController.getReservaByUsuario); // http://localhost:5000/api/v1/reserva/:id

module.exports = router;
