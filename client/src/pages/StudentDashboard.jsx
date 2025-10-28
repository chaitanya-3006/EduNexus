import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import axios from 'axios';
import { BookOpen, LogOut, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllCourses();
    fetchMyCourses();
  }, []);

  const fetchAllCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses`);
      setAllCourses(response.data);
    } catch (error) {
      toast.error('Failed to load courses');
    }
  };

  const fetchMyCourses = async () => {
    try {
      const response = await axios.get(`${API}/my-courses`);
      setMyCourses(response.data);
    } catch (error) {
      toast.error('Failed to load your courses');
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`${API}/courses/${courseId}/enroll`);
      toast.success('Enrolled successfully!');
      fetchMyCourses();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Enrollment failed');
    }
  };

  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enrolledCourseIds = myCourses.map(c => c.id);

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
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
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
            data-testid="tab-browse"
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Browse Courses
          </button>
          <button
            data-testid="tab-my-courses"
            onClick={() => setActiveTab('my-courses')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'my-courses'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Courses ({myCourses.length})
          </button>
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  data-testid="search-courses-input"
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="courses-grid">
              {filteredCourses.map((course) => (
                <div key={course.id} className="glass-effect rounded-xl overflow-hidden card-hover" data-testid={`course-card-${course.id}`}>
                  <div className="h-40 bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white opacity-80" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">By {course.instructor_name}</p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                    {enrolledCourseIds.includes(course.id) ? (
                      <button
                        data-testid={`view-course-btn-${course.id}`}
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="w-full py-2 bg-green-500 text-white rounded-lg font-medium"
                      >
                        View Course
                      </button>
                    ) : (
                      <button
                        data-testid={`enroll-btn-${course.id}`}
                        onClick={() => handleEnroll(course.id)}
                        className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Courses Tab */}
        {activeTab === 'my-courses' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="my-courses-grid">
            {myCourses.map((course) => (
              <div
                key={course.id}
                className="glass-effect rounded-xl overflow-hidden card-hover cursor-pointer"
                onClick={() => navigate(`/course/${course.id}`)}
                data-testid={`my-course-card-${course.id}`}
              >
                <div className="h-40 bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white opacity-80" />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">By {course.instructor_name}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;