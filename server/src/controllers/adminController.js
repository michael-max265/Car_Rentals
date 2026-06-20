// server/src/controllers/adminController.js
// Simplified admin controller – returns placeholder data for analytics and user management.
// This avoids dependencies on missing Mongoose models and keeps the API functional for the frontend.

/** GET /admin/stats */
export const getStats = async (req, res) => {
  // Placeholder stats – replace with real DB queries when available.
  const stats = {
    carCount: 0,
    bookingCount: 0,
    totalRevenue: 0,
    revenueByCarData: [], // [{ label: 'Car123', value: 1000 }]
    statusData: [], // [{ label: 'pending', value: 0, color: '#f59e0b' }]
    insuranceData: [], // [{ label: 'basic', value: 0 }]
    timelineData: [], // [{ label: 'Jan 24', value: 0 }]
  };
  res.json(stats);
};

/** GET /admin/users */
export const listUsers = async (req, res) => {
  // Return empty list – replace with actual DB query.
  res.json([]);
};

/** PUT /admin/users/:id */
export const updateUser = async (req, res) => {
  // Echo back the provided data – placeholder.
  const { id } = req.params;
  res.json({ id, ...req.body });
};

/** DELETE /admin/users/:id */
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  // Pretend deletion succeeded.
  res.json({ message: `User ${id} deleted` });
};
