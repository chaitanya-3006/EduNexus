import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { ArrowLeft, Upload, Plus, Trash2, Play, FileText, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CoursePage() {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isInstructor, setIsInstructor] = useState(false);
  
  // Modals
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showSubmitAssignment, setShowSubmitAssignment] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  // Forms
  const [lectureForm, setLectureForm] = useState({ title: '', video_url: '', order: 1 });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', due_date: '' });
  const [uploading, setUploading] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');

  useEffect(() => {
    fetchCourse();
    fetchLectures();
    fetchAssignments();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseId}`);
      setCourse(response.data);
      setIsInstructor(user.role === 'instructor' && response.data.instructor_id === user.id || user.role === 'admin');
    } catch (error) {
      toast.error('Failed to load course');
    }
  };

  const fetchLectures = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseId}/lectures`);
      setLectures(response.data);
      if (response.data.length > 0 && !currentVideo) {
        setCurrentVideo(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load lectures');
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseId}/assignments`);
      setAssignments(response.data);
    } catch (error) {
      toast.error('Failed to load assignments');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseId}/messages`);
      setMessages(response.data);
    } catch (error) {
      // Silent fail for polling
    }
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resource_type', 'video');

    try {
      const response = await axios.post(`${API}/upload`, formData);
      setLectureForm({ ...lectureForm, video_url: response.data.url });
      toast.success('Video uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resource_type', 'auto');

    try {
      const response = await axios.post(`${API}/upload`, formData);
      setSubmissionUrl(response.data.url);
      toast.success('File uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/courses/${courseId}/lectures`, lectureForm);
      toast.success('Lecture added!');
      setShowAddLecture(false);
      setLectureForm({ title: '', video_url: '', order: 1 });
      fetchLectures();
    } catch (error) {
      toast.error('Failed to add lecture');
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/courses/${courseId}/assignments`, assignmentForm);
      toast.success('Assignment added!');
      setShowAddAssignment(false);
      setAssignmentForm({ title: '', description: '', due_date: '' });
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to add assignment');
    }
  };

const handleSubmitAssignment = async () => {
  if (!submissionUrl) {
    toast.error('Please upload a file first');
    return;
  }

  try {
    const method = selectedAssignment.submitted ? 'put' : 'post';
    await axios[method](
      `${API}/assignments/${selectedAssignment.id}/submit`,
      { file_url: submissionUrl }
    );

    toast.success(
      selectedAssignment.submitted ? 'Submission updated!' : 'Assignment submitted!'
    );
    setShowSubmitAssignment(false);
    setSubmissionUrl('');
    setSelectedAssignment(null);
    fetchAssignments(); // refresh to mark submitted=true
  } catch (error) {
    toast.error('Submission failed');
  }
};


  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm('Delete this lecture?')) return;
    try {
      await axios.delete(`${API}/lectures/${lectureId}`);
      toast.success('Lecture deleted');
      fetchLectures();
    } catch (error) {
      toast.error('Failed to delete lecture');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
  if (!window.confirm("Delete this assignment?")) return;

  try {
    await axios.delete(`${API}/assignments/${assignmentId}`);
    toast.success("Assignment deleted");
    fetchAssignments(); // Refresh the list
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete assignment");
  }
};

const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!messageText.trim()) return;

  try {
    await axios.post(`${API}/courses/${courseId}/messages`, {
      sender_id: user.id,
      sender_name: user.name,
      sender_role: user.role,
      message: messageText
    });

    setMessageText('');
    fetchMessages(); // reload chat
  } catch (error) {
    toast.error('Failed to send message');
  }
};

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="glass-effect shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            data-testid="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-1">By {course.instructor_name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="lectures" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="lectures" data-testid="tab-lectures">Lectures</TabsTrigger>
                <TabsTrigger value="assignments" data-testid="tab-assignments">Assignments</TabsTrigger>
                <TabsTrigger value="chat" data-testid="tab-chat">Chat</TabsTrigger>
              </TabsList>

              {/* Lectures Tab */}
              <TabsContent value="lectures">
                <div className="glass-effect rounded-xl overflow-hidden mb-6">
                  {currentVideo ? (
                    <div>
                      <video
    key={currentVideo.video_url}  
    width="100%"
    height="400"
    controls
    className='react-player'
  >
  <source src={currentVideo.video_url} type="video/mp4" />
  Your browser does not support the video tag.
</video>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-gray-900">{currentVideo.title}</h3>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No video selected
                    </div>
                  )}
                </div>

                {isInstructor && (
                  <button
                    data-testid="add-lecture-btn"
                    onClick={() => setShowAddLecture(true)}
                    className="mb-4 flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Lecture</span>
                  </button>
                )}

                <div className="space-y-2" data-testid="lectures-list">
                  {lectures.map((lecture) => (
                    <div
                      key={lecture.id}
                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer ${
                        currentVideo?.id === lecture.id ? 'bg-sky-100 border-2 border-sky-500' : 'bg-white border border-gray-200'
                      }`}
                      onClick={() => setCurrentVideo(lecture)}
                      data-testid={`lecture-item-${lecture.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Play className="w-5 h-5 text-sky-600" />
                        <span className="font-medium text-gray-800">{lecture.title}</span>
                      </div>
                      {isInstructor && (
                        <button
                          data-testid={`delete-lecture-btn-${lecture.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLecture(lecture.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Assignments Tab */}
              <TabsContent value="assignments">
  {/*  Add Assignment Button (for instructors only) */}
  {isInstructor && (
    <button
      data-testid="add-assignment-btn"
      onClick={() => setShowAddAssignment(true)}
      className="mb-4 flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
    >
      <Plus className="w-4 h-4" />
      <span>Add Assignment</span>
    </button>
  )}

  {/*  Assignments List */}
  <div className="space-y-4" data-testid="assignments-list">
    {assignments.map((assignment) => (
      <div
        key={assignment.id}
        className="glass-effect rounded-xl p-5 flex justify-between items-start"
        data-testid={`assignment-item-${assignment.id}`}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
          <p className="text-gray-600 mb-2">{assignment.description}</p>
          <p className="text-sm text-gray-500 mb-3">Due: {assignment.due_date}</p>

          {/*  Student Submit Button */}
{user.role === 'student' && (
  <button
    onClick={() => {
      setSelectedAssignment(assignment);
      setShowSubmitAssignment(true);
    }}
    className={`px-4 py-2 rounded-lg text-white ${
      assignment.isSubmitted
        ? 'bg-green-600 hover:bg-green-700'
        : 'bg-sky-600 hover:bg-sky-700'
    }`}
  >
    {assignment.isSubmitted ? 'Update Submission' : 'Submit Assignment'}
  </button>
)}


        </div>

        {/*  Instructor Delete Button */}
        {isInstructor && (
          <button
            data-testid={`delete-assignment-btn-${assignment.id}`}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAssignment(assignment.id);
            }}
            className="p-2 text-red-500 hover:bg-red-50 rounded"
            title="Delete Assignment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    ))}
  </div>
</TabsContent>


              {/* Chat Tab */}
              <TabsContent value="chat">
                <div className="glass-effect rounded-xl p-5">
                  <div className="h-96 overflow-y-auto mb-4 space-y-3" data-testid="chat-messages">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.sender_id === user.id ? 'bg-sky-100 ml-auto' : 'bg-white'
                        } max-w-xs`}
                        data-testid={`message-${msg.id}`}
                      >
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          {msg.sender_name} <span className="text-gray-500">({msg.sender_role})</span>
                        </p>
                        <p className="text-sm text-gray-800">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      data-testid="chat-input"
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                    <button
                      data-testid="send-message-btn"
                      type="submit"
                      className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Overview</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Lectures:</strong> {lectures.length}</p>
                <p><strong>Assignments:</strong> {assignments.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Lecture Modal */}
      <Dialog open={showAddLecture} onOpenChange={setShowAddLecture}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lecture</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLecture} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                data-testid="lecture-title-input"
                type="text"
                value={lectureForm.title}
                onChange={(e) => setLectureForm({...lectureForm, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Video</label>
              <input
                data-testid="lecture-video-upload"
                type="file"
                accept="video/*"
                onChange={handleUploadVideo}
                className="w-full"
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              {lectureForm.video_url && <p className="text-sm text-green-600 mt-1">Video uploaded!</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                data-testid="lecture-order-input"
                type="number"
                value={lectureForm.order}
                onChange={(e) => setLectureForm({...lectureForm, order: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>
            <button
              data-testid="lecture-submit-btn"
              type="submit"
              className="w-full py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              Add Lecture
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Assignment Modal */}
      <Dialog open={showAddAssignment} onOpenChange={setShowAddAssignment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAssignment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                data-testid="assignment-title-input"
                type="text"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                data-testid="assignment-description-input"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                data-testid="assignment-due-date-input"
                type="date"
                value={assignmentForm.due_date}
                onChange={(e) => setAssignmentForm({...assignmentForm, due_date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>
            <button
              data-testid="assignment-submit-btn"
              type="submit"
              className="w-full py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              Add Assignment
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Assignment Modal */}
      <Dialog open={showSubmitAssignment} onOpenChange={setShowSubmitAssignment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <input
                data-testid="submission-file-upload"
                type="file"
                onChange={handleUploadFile}
                className="w-full"
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              {submissionUrl && <p className="text-sm text-green-600 mt-1">File uploaded!</p>}
            </div>
            <button
              data-testid="submission-submit-btn"
              onClick={handleSubmitAssignment}
              className="w-full py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              Submit
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CoursePage;
