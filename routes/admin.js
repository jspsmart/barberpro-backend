const express = require('express');
const router = express.Router();
const { 
  verifyAdminToken, 
  getAllBarbers, 
  getBarberById, 
  createBarber, 
  updateBarber, 
  deleteBarber 
} = require('../controllers/barberController');
const { 
  verifyAdminToken: verifyServiceToken, 
  getAllServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService 
} = require('../controllers/serviceController');



// 理发师管理路由
router.get('/barbers', verifyAdminToken, getAllBarbers);
router.get('/barbers/:id', verifyAdminToken, getBarberById);
router.post('/barbers', verifyAdminToken, createBarber);
router.put('/barbers/:id', verifyAdminToken, updateBarber);
router.delete('/barbers/:id', verifyAdminToken, deleteBarber);

// 服务项目管理路由
router.get('/services', verifyServiceToken, getAllServices);
router.get('/services/:id', verifyServiceToken, getServiceById);
router.post('/services', verifyServiceToken, createService);
router.put('/services/:id', verifyServiceToken, updateService);
router.delete('/services/:id', verifyServiceToken, deleteService);

module.exports = router;