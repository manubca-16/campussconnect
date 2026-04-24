import express from 'express';
import { getQRToken, markAttendance, getAttendanceByEvent, exportAttendanceExcel } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/attendance/qr/:eventId', protect, authorize('college_admin', 'super_admin'), getQRToken);
router.post('/attendance/mark', protect, authorize('student'), markAttendance);
router.get('/attendance/:eventId', protect, authorize('college_admin', 'super_admin'), getAttendanceByEvent);
router.get('/attendance/export/:eventId', protect, authorize('college_admin', 'super_admin'), exportAttendanceExcel);

export default router;
