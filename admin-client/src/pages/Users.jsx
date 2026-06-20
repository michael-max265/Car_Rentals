import React, { useEffect, useState } from 'react';
import api from '../shared/api';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError('Failed to load users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, form);
        setUsers(users.map(u => (u.id === editingUser.id ? { ...u, ...form } : u)));
      } else {
        const { data } = await api.post('/admin/users', form);
        setUsers([...users, data]);
      }
      setShowModal(false);
      setEditingUser(null);
      setForm({ name: '', email: '', role: '' });
    } catch (e) {
      console.error(e);
      alert('Save failed');
    }
  };

  if (loading) return <div className="users"><p>Loading users…</p></div>;
  if (error) return <div className="users"><p className="error">{error}</p></div>;

  return (
    <div className="users glass card">
      <h2 className="users-title">User Management</h2>
      <button className="btn-primary" onClick={() => { setEditingUser(null); setForm({ name: '', email: '', role: '' }); setShowModal(true); }}>+ Add User</button>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td className="action-cell">
                  <button className="edit-btn" onClick={() => openEdit(u)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr className="empty-row"><td colSpan="4">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group"><label>Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Email</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label>Role</label><input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
              <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
