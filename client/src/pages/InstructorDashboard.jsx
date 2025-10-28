import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import axios from 'axios';
import { BookOpen, LogOut, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function InstructorDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', thumbnail_url: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/my-courses`);
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to load courses');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/courses`, formData);
      toast.success('Course created successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', thumbnail_url: '' });
      fetchCourses();
    } catch (error) {
      toast.error('Failed to create course');
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
            <h1 className="text-2xl font-bold text-gray-800">EduNexus</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Instructor: {user?.name}</span>
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Courses</h2>
          <button
            data-testid="create-course-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create Course</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="instructor-courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="glass-effect rounded-xl overflow-hidden card-hover" data-testid={`instructor-course-card-${course.id}`}>
              <div className="h-40 bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex space-x-2">
                  <button
                    data-testid={`manage-course-btn-${course.id}`}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="flex-1 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
                  >
                    Manage
                  </button>
                  <button
                    data-testid={`delete-course-btn-${course.id}`}
                    onClick={() => handleDeleteCourse(course.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Course Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                data-testid="create-course-title-input"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                data-testid="create-course-description-input"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                rows="3"
                required
              />
            </div>
            <button
              data-testid="create-course-submit-btn"
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Create Course
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InstructorDashboard;