var express = require('express');
var router = express.Router();
var userSchema = require('../models/users.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenMiddleware = require('../middleware/token.middleware');
const crypto = require('crypto');


/* Register */
router.post("/register", async (req, res) => {
  try {
    const { username, password, firstName, lastName, age, gender } = req.body;

    if (!username || !password || !firstName || !lastName || !age || !gender) {
      return res.status(400).send({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const existingUser = await userSchema.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ message: "ชื่อผู้ใช้นี้มีอยู่แล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(16).toString('hex');

    // สร้าง userId ที่ไม่ซ้ำ (หากต้องการให้เป็นค่าที่ไม่ซ้ำกันอัตโนมัติ)
    const userId = crypto.randomBytes(8).toString('hex'); // สร้าง userId แบบสุ่ม

    const user = new userSchema({
      userId, // เพิ่ม userId
      username,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      gender,
      verificationToken,
    });

    await user.save();

    res.status(201).send({ 
      message: "สมัครสมาชิกสำเร็จ กรุณายืนยันบัญชีของคุณ", 
      verificationToken 
    });
  } catch (err) {
    console.error("เกิดข้อผิดพลาดระหว่างการสมัครสมาชิก:", err);
    res.status(500).send({ message: "เกิดข้อผิดพลาดระหว่างการสมัครสมาชิก", error: err.message });
  }
});

/* Login */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userSchema.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: 'ไม่พบผู้ใช้' });
    }

    // if (!user.isVerified) {
    //   return res.status(403).send({ message: 'บัญชียังไม่ได้รับการยืนยัน' });
    // }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, '1234', { expiresIn: '1h' });

    res.send({
      token,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: { id: user._id, username: user.username, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (err) {
    res.status(500).send({ message: 'เกิดข้อผิดพลาดระหว่างการเข้าสู่ระบบ', error: err });
  }
});

/* Verify */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).send({ message: 'กรุณาใส่ token เพื่อยืนยันบัญชี' });
    }

    const user = await userSchema.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }

    user.isVerified = true;
    user.verificationToken = null; // ลบ token หลังยืนยันสำเร็จ
    await user.save();

    res.send({ message: 'ยืนยันบัญชีสำเร็จ', user: { username: user.username, isVerified: user.isVerified } });
  } catch (err) {
    res.status(500).send({ message: 'เกิดข้อผิดพลาดระหว่างการยืนยันบัญชี', error: err });
  }
});

/* GET ALL */
router.get('/', async function (req, res, next) {
  try {
    let users = await userSchema.find({});
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้', error: err });
  }
});

/* GET ID */
router.get('/:id', async function (req, res, next) {
  let { id } = req.params;
  try {
    let user = await userSchema.findById(id);
    if (!user) {
      return res.status(404).send({ message: 'ไม่พบผู้ใช้' });
    }
    res.send(user);
  } catch (err) {
    res.status(500).send({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้', error: err });
  }
});

/* POST */
router.post('/', [tokenMiddleware], async function (req, res, next) {
  try {
    let { username, password, firstName, lastName, age, gender } = req.body;

    // ตรวจสอบว่า username ซ้ำหรือไม่
    let existingUser = await userSchema.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
    }

    let user = new userSchema({
      username: username,
      password: await bcrypt.hash(password, 10),
      firstName: firstName,
      lastName: lastName,
      age: age,
      gender: gender,
    });

    await user.save();

    let token = jwt.sign({ userId: user._id, username: user.username }, '1234', { expiresIn: '1h' });

    res.send({ token, message: 'สร้างผู้ใช้สำเร็จ', user });
  } catch (err) {
    res.status(500).send({ message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้', error: err });
  }
});

/* PUT */
router.put('/:id', async function (req, res, next) {
  let { id } = req.params;
  let { username, firstName, lastName, age, gender } = req.body;

  try {
    let user = await userSchema.findByIdAndUpdate(id, { username, firstName, lastName, age, gender }, { new: true });

    if (!user) {
      return res.status(404).send({ message: 'ไม่พบผู้ใช้' });
    }

    res.send({ message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ', user });
  } catch (err) {
    res.status(500).send({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้', error: err });
  }
});

/* DELETE */
router.delete('/:id', async function (req, res, next) {
  let { id } = req.params;

  try {
    let user = await userSchema.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send({ message: 'ไม่พบผู้ใช้' });
    }

    res.send({ message: 'ลบผู้ใช้สำเร็จ', user });
  } catch (err) {
    res.status(500).send({ message: 'เกิดข้อผิดพลาดในการลบผู้ใช้', error: err });
  }
});

module.exports = router;