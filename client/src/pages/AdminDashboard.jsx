import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/App';
import axios from 'axios';
import { BookOpen, LogOut, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses`);
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to load courses');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`${API}/courses/${courseId}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-effect shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-7 h-7 text-sky-600" />
            <h1 className="text-2xl font-bold text-gray-800">EduNexus Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Admin: {user?.name}</span>
            <button
              data-testid="logout-btn"
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            data-testid="tab-users"
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            data-testid="tab-courses"
            onClick={() => setActiveTab('courses')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'courses'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Courses ({courses.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h2>
            <div className="space-y-3" data-testid="users-list">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200" data-testid={`user-item-${u.id}`}>
                  <div>
                    <p className="font-semibold text-gray-800">{u.name}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-700">
                      {u.role}
                    </span>
                  </div>
                  <button
                    data-testid={`delete-user-btn-${u.id}`}
                    onClick={() => handleDeleteUser(u.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Courses</h2>
            <div className="space-y-3" data-testid="courses-list">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200" data-testid={`course-item-${course.id}`}>
                  <div>
                    <p className="font-semibold text-gray-800">{course.title}</p>
                    <p className="text-sm text-gray-600">By {course.instructor_name}</p>
                  </div>
                  <button
                    data-testid={`delete-course-btn-${course.id}`}
                    onClick={() => handleDeleteCourse(course.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;