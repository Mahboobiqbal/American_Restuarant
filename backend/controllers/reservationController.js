const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const Notification = require('../models/Notification');

exports.getReservations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, date, dateFrom, dateTo } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: d, $lt: nextDay };
    }
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const total = await Reservation.countDocuments(query);
    const reservations = await Reservation.find(query)
      .populate('table', 'number name section capacity')
      .populate('createdBy', 'name')
      .sort({ date: 1, time: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ reservations, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create({ ...req.body, createdBy: req.user._id });
    const table = await Table.findById(reservation.table);
    if (table) {
      await Table.findByIdAndUpdate(table._id, { status: 'reserved' });
    }

    const managers = await require('../models/User').find({ role: { $in: ['manager', 'staff'] }, isActive: true });
    const notifs = managers.map(u => ({
      user: u._id, type: 'reservation', title: 'New Reservation',
      message: `Reservation for ${reservation.customerName} on ${reservation.date.toLocaleDateString()} at ${reservation.time}`,
      relatedId: reservation._id, relatedModel: 'Reservation',
    }));
    if (notifs.length) await Notification.insertMany(notifs);

    const populated = await Reservation.findById(reservation._id).populate('table', 'number name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    if (reservation.status === 'seated') {
      await Table.findByIdAndUpdate(reservation.table, { status: 'occupied' });
    } else if (reservation.status === 'completed' || reservation.status === 'cancelled') {
      await Table.findByIdAndUpdate(reservation.table, { status: 'available' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (reservation.status !== 'cancelled') {
      await Table.findByIdAndUpdate(reservation.table, { status: 'available' });
    }
    res.json({ message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
